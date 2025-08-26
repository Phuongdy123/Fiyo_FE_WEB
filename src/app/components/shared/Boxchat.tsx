"use client";

import { useEffect, useRef } from "react";
import "@/app/assets/css/boxchat.css";
import { useCart } from "@/app/context/Ccart";
import type { ICart } from "@/app/untils/ICart";
import { useAuth } from "@/app/context/CAuth"; 
type CardAction =
  | { type: "add_to_cart"; label: string; productId: string; quantity?: number }
  | { type: "buy_now"; label: string; productId: string; url?: string };

type ProductCard = {
  id: string;
  _id?: string;
  name: string;
  price: number;
  price_text?: string;
  image: string;
  description_short?: string;
  url?: string;
  actions?: CardAction[];

  variants?: any[];
  shop_id?: string;
};

type BotResponse = {
  reply: string;
  type?: "message" | "product_cards" | "add_to_cart";
  cards?: ProductCard[];
  products?: any[]; // khi bot muốn add trực tiếp
};

const VNPrice = (n: number) =>
  new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(
    Number(n || 0)
  );

// map object từ bot → ICart của giỏ
const toICart = (p: any): ICart => ({
  id: p.id || p._id || "",
  name: p.name || "",
  price: Number(p.price || 0),
  image: p.image || "",
  shop_id: p.shop_id || p.shopId || "",

  variant_id: p.variant_id,
  variant: p.variant || p.color || "",

  size: p.size || "",
  size_id: p.size_id,

  quantity: Number(p.quantity || 1),
  quantity_Product: Number(p.quantity_Product ?? p.stock ?? 0),
});

const API_BASE =
  (typeof window !== "undefined" &&
    (window as any).env?.NEXT_PUBLIC_API_BASE_URL) ||
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  "https://fiyo.click";

const chatApi = {
  async welcome() {
    const res = await fetch(`${API_BASE.replace(/\/$/, "")}/api/chat/welcome`, {
      cache: "no-store",
    });
    if (!res.ok) throw new Error("Welcome API error");
    return (await res.json()) as { reply: string };
  },
  async ask(payload: { userId?: string; message: string }) {
    const res = await fetch(`${API_BASE.replace(/\/$/, "")}/api/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error("Chat API error");
    return (await res.json()) as BotResponse;
  },
};

const shopIdCache = new Map<string, string>();

async function fetchJsonSafe(url: string) {
  try {
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

/**
 * Cố gắng tìm shop_id từ nhiều cấu trúc payload phổ biến:
 * - { shop_id } hoặc { shopId }
 * - { shop: {_id} } hoặc { shop_id: {_id} }
 * - { product: {...} } bọc 1 lớp
 */
function extractShopId(anyData: any): string {
  if (!anyData) return "";
  const pick = (obj: any): string => {
    if (!obj || typeof obj !== "object") return "";
    return (
      obj.shop_id ||
      obj.shopId ||
      obj?.shop?._id ||
      obj?.shop_id?._id ||
      obj?.owner_id ||
      obj?.user_id || // dự án của bạn nhiều nơi gắn shop = user_id
      ""
    );
  };

  // trực tiếp
  let id = pick(anyData);
  if (id) return String(id);

  // phổ biến: { product: {...} }
  if (anyData.product) {
    id = pick(anyData.product);
    if (id) return String(id);
  }

  // phổ biến: { data: {...} }
  if (anyData.data) {
    id = pick(anyData.data);
    if (id) return String(id);
  }

  // một số API trả mảng
  if (Array.isArray(anyData)) {
    for (const x of anyData) {
      id = pick(x);
      if (id) return String(id);
    }
  }

  return "";
}

async function getShopIdByProductId(
  productId: string,
  domShopId?: string
): Promise<string> {
  if (domShopId) return domShopId;
  if (shopIdCache.has(productId)) return shopIdCache.get(productId)!;

  const base = (API_BASE || "").replace(/\/$/, "");

  // Thử nhiều endpoint phổ biến của bạn (tuỳ backend, chọn cái nào tồn tại)
  const candidates = [
    `${base}/api/products/${productId}`,
    `${base}/api/products/detail/${productId}`,
    `${base}/api/product/${productId}`,
    `${base}/api/product/detail/${productId}`,
  ];

  for (const url of candidates) {
    const data = await fetchJsonSafe(url);
    const sid = extractShopId(data);
    if (sid) {
      shopIdCache.set(productId, sid);
      return sid;
    }
  }

  // Không tìm được
  return "";
}

/** ========= CHUẨN HOÁ variants: đảm bảo có _id/color/size/quantity ========= */
function normalizeVariants(raw: any[]): any[] {
  return (Array.isArray(raw) ? raw : []).map((v: any) => ({
    _id: v?._id || v?.id || v?.variant_id || v?.variantId || "",
    color: v?.color || v?.variant || v?.name || v?.title || "",
    sizes: (Array.isArray(v?.sizes) ? v.sizes : []).map((s: any) => ({
      _id: s?._id || s?.id || s?.size_id || s?.sizeId || "",
      size: s?.size || s?.label || s?.name || "",
      sku: s?.sku || "",
      quantity: Number(s?.quantity || 0),
    })),
  }));
}

/** ========= Fallback: fetch variants by productId nếu data-variants thiếu _id ========= */
async function fetchVariantsByProduct(productId: string) {
  try {
    const url = `https://fiyo.click/api/variant/products/${productId}`; // chỉnh nếu API base khác
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) return [];
    const data = await res.json(); // IProductVariant[] dạng [{ product_id, variants: [...] }]
    const variants = Array.isArray(data) ? data[0]?.variants || [] : [];
    return normalizeVariants(variants);
  } catch {
    return [];
  }
}

export default function BoxChatComponent() {
  const { addToCart } = useCart();
  const { user } = useAuth(); // 👈 lấy user từ context

const getUserId = () => {
  if (user?._id) return user._id;
  try {
    const s = localStorage.getItem("user");
    if (!s) return null;
    const u = JSON.parse(s);
    return u?._id || null;
  } catch {
    return null;
  }
};
const goCheckout = () => {
  const dest = getUserId() ? "/page/checkout" : "/page/checkoutNoLogin";
  window.location.href = dest;
};
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const sendBtnRef = useRef<HTMLButtonElement>(null);
  const emojiBtnRef = useRef<HTMLButtonElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const wrapperState0Ref = useRef<HTMLDivElement>(null);
  const wrapperState1Ref = useRef<HTMLDivElement>(null);
  const btnStartChatRef = useRef<HTMLDivElement>(null);
  const btnCloseRef = useRef<HTMLButtonElement>(null);
  const chatListRef = useRef<HTMLUListElement>(null);

  const notifCloseBtnRef = useRef<HTMLButtonElement>(null);
  const headerHeight = 133;

  const addTextMessage = (
    sender: "user" | "bot",
    text: string,
    showTime = false
  ) => {
    const chatList = chatListRef.current;
    if (!chatList) return;

    const msg = document.createElement("li");
    msg.className = `chat-item ${sender === "user" ? "visitor" : "bot"}`;
    const avatarHTML =
      sender === "bot"
        ? `<div class="avatar-name-msg-item"><div><span class="ant-avatar messages-item-avatar ant-avatar-circle ant-avatar-image" style="width: 32px; height: 32px; line-height: 32px; font-size: 18px"><img src="https://cb-electronics.com/wp-content/uploads/2021/04/istockphoto-1221348467-612x612-1.jpeg" /></span></div><div class="agent-name">FIYO BOT</div></div>`
        : "";

    msg.innerHTML = `
      <div class="messages-item-inner">
        ${avatarHTML}
        <div class="message-content-wrapper">
          <div class="message-content has-photo-false">
            <span class="content-item">${text}</span>
          </div>
        </div>
        ${
          showTime
            ? `<div class="message-status"><div class="message-time">${new Date().toLocaleTimeString(
                [],
                { hour: "2-digit", minute: "2-digit" }
              )}</div></div>`
            : ""
        }
      </div>`;
    chatList.appendChild(msg);
    chatList.scrollTop = chatList.scrollHeight;
  };

  // Render product cards + picker Màu/Size
  const addProductCardsMessage = (text: string, cards: ProductCard[] = []) => {
    const chatList = chatListRef.current;
    if (!chatList) return;

    addTextMessage("bot", text || "Sản phẩm gợi ý cho bạn:", true);

    const wrap = document.createElement("li");
    wrap.className = "chat-item bot";
    const avatarHTML = `
    <div class="avatar-name-msg-item">
      <div><span class="ant-avatar messages-item-avatar ant-avatar-circle ant-avatar-image" style="width: 32px; height: 32px; line-height: 32px; font-size: 18px">
        <img src="https://api.oncustomer.canifa.com/user/file/10dbc370-8b4b-11ee-bcfa-1bc0639711b2.png" />
      </span></div>
      <div class="agent-name">FIYO BOT</div>
    </div>`;

    const cardsHTML = (cards || [])
      .map((c) => {
        const id = c.id || c._id || "";
        const priceText = c.price_text ?? VNPrice(Number(c.price || 0));
        const rawVariants = (c as any).variants || [];
        const normVariants = normalizeVariants(rawVariants);
        const hasVariants = Array.isArray(normVariants) && normVariants.length > 0;

        const actions = c.actions?.length
          ? c.actions
          : [
              { type: "add_to_cart", label: "Thêm vào giỏ", productId: id },
              { type: "buy_now", label: "Mua ngay", productId: id, url: c.url },
            ];

            
        const pickerHTML = hasVariants
          ? `
       <div class="variant-wrap"
     data-variants='${JSON.stringify(normVariants).replace(/'/g, "&apos;")}'
      data-selected-color="" data-selected-size="">
        <div class="variant-row">
          <div class="variant-block">
            <div class="variant-label">Màu</div>
            <div class="color-list">
             ${normVariants
               .map((v: any) => {
                 const label = v.color || "Màu";
                 const total = (v.sizes || []).reduce(
                   (t: number, s: any) => t + Number(s.quantity || 0),
                   0
                 );
                 return `<button type="button" class="pill color" data-color="${label}" ${
                   total <= 0 ? 'data-disabled="1"' : ""
                 }>${label}</button>`;
               })
               .join("")}

            </div>
          </div>
          <div class="variant-block">
            <div class="variant-label">Size</div>
            <div class="size-list"><span class="muted">Chọn màu trước</span></div>
          </div>
        </div>
      </div>`
          : "";

        return `
  <div class="fiyo-product-card"
       data-product-id="${id}"
      data-shop-id="${c.shop_id || ""}">
        <img class="fiyo-product-img" src="${c.image || ""}" alt="${
          c.name || ""
        }" onerror="this.src='https://via.placeholder.com/120?text=No+Image'"/>
        <div class="fiyo-product-info">
          <div class="fiyo-product-name">${c.name || ""}</div>
          <div class="fiyo-product-price">${priceText}</div>
          ${
            c.description_short
              ? `<div class="fiyo-product-desc">${c.description_short}</div>`
              : ``
          }
          ${pickerHTML}
          <div class="fiyo-product-actions">
            ${actions
              .map(
                (a: any) => `
              <button class="fiyo-product-btn ${
                a.type === "buy_now" ? "primary" : "secondary"
              }"
                      data-action="${a.type}" data-product-id="${id}"
                      ${a.url ? `data-url="${a.url}"` : ``}>${a.label}</button>`
              )
              .join("")}
          </div>
        </div>
      </div>`;
      })
      .join("");

    wrap.innerHTML = `
    <div class="messages-item-inner">
      ${avatarHTML}
      <div class="message-content-wrapper">
        <div class="message-content has-photo-false">
          <div class="fiyo-product-list">${cardsHTML}</div>
        </div>
      </div>
    </div>`;
    chatList.appendChild(wrap);
    chatList.scrollTop = chatList.scrollHeight;
  };

  useEffect(() => {
    const wrapper0 = wrapperState0Ref.current;
    const wrapper1 = wrapperState1Ref.current;
    const btnStart = btnStartChatRef.current;
    const btnClose = btnCloseRef.current;
    const notifCloseBtn = notifCloseBtnRef.current;

    if (wrapper0 && wrapper1 && btnStart && btnClose) {
      wrapper0.style.display = "block";
      wrapper1.style.display = "none";

      btnStart.onclick = async () => {
        wrapper0.style.display = "none";
        wrapper1.style.display = "block";

        try {
          const data = await chatApi.welcome();
          addTextMessage(
            "bot",
            data.reply || "Xin chào! Tôi có thể giúp gì cho bạn?",
            true
          );
        } catch {
          addTextMessage("bot", "Xin chào! Tôi có thể giúp gì cho bạn?", true);
        }
      };

      btnClose.onclick = () => {
        wrapper1.style.display = "none";
        wrapper0.style.display = "block";
      };
    }

    if (notifCloseBtn && wrapper0) {
      notifCloseBtn.onclick = () => {
        wrapper0.style.display = "none";
      };
    }

    // auto expand + toggle send button
    const input = inputRef.current;
    const sendBtn = sendBtnRef.current;
    if (input && sendBtn) {
      const handleInput = () => {
        input.style.height = "auto";
        input.style.height = input.scrollHeight + "px";
        sendBtn.classList.toggle("hidden", !input.value.trim());
      };
      input.addEventListener("input", handleInput);
      return () => input.removeEventListener("input", handleInput);
    }
  }, []);

  useEffect(() => {
    const input = inputRef.current!;
    const sendBtn = sendBtnRef.current!;
    const emojiBtn = emojiBtnRef.current!;
    const fileInput = fileInputRef.current!;
    const chatList = chatListRef.current!;

    // Event delegation: chọn màu/size + add to cart
    const onChatListClick = async (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target) return;

      // Chọn Màu
      const colorBtn = target.closest(
        ".pill.color"
      ) as HTMLButtonElement | null;
      if (colorBtn) {
        if (colorBtn.getAttribute("data-disabled") === "1") return;
        const card = colorBtn.closest(".fiyo-product-card")!;
        const wrap = card.querySelector(".variant-wrap") as HTMLElement | null;
        if (!wrap) return;

        card
          .querySelectorAll(".pill.color")
          .forEach((el) => el.classList.remove("is-active"));
        colorBtn.classList.add("is-active");

        const color = colorBtn.getAttribute("data-color") || "";
        wrap.dataset.selectedColor = color;

        // render size theo màu
        try {
          let variants: any[] = [];
          try {
            variants = JSON.parse(
              (wrap.getAttribute("data-variants") || "[]").replace(
                /&apos;/g,
                "'"
              )
            );
          } catch {
            variants = [];
          }

          // Nếu thiếu _id → gọi API lấy variants chuẩn
          const needRealIds =
            !variants.some((v) => v?._id) ||
            variants.some((v) => (v?.sizes || []).some((s: any) => !s?._id));
          if (needRealIds) {
            const productId = (card as HTMLElement).dataset.productId || "";
            variants = await fetchVariantsByProduct(productId);
          }

          const v = variants.find(
            (x: any) =>
              String(x.color || "").toLowerCase().trim() ===
              color.toLowerCase().trim()
          );
          const sizeBox = card.querySelector(".size-list") as HTMLElement;
          if (sizeBox) {
            sizeBox.innerHTML = v?.sizes?.length
              ? v.sizes
                  .map((s: any) => {
                    const sizeLabel = s.size || "";
                    return `<button type="button" class="pill size"
                  data-size="${sizeLabel}"
                  ${Number(s.quantity) <= 0 ? 'data-disabled="1"' : ""}>${sizeLabel}</button>`;
                  })
                  .join("")
              : `<span class="muted">Hết hàng</span>`;
          }

          wrap.dataset.selectedSize = "";
          // cập nhật lại data-variants đã chuẩn sau khi fetch
          wrap.setAttribute(
            "data-variants",
            JSON.stringify(variants).replace(/'/g, "&apos;")
          );
        } catch {}
        return;
      }

      // Chọn Size
      const sizeBtn = target.closest(".pill.size") as HTMLButtonElement | null;
      if (sizeBtn) {
        const card = sizeBtn.closest(".fiyo-product-card")!;
        const wrap = card.querySelector(".variant-wrap") as HTMLElement | null;
        if (!wrap) return;

        card
          .querySelectorAll(".pill.size")
          .forEach((el) => el.classList.remove("is-active"));
        sizeBtn.classList.add("is-active");

        wrap.dataset.selectedSize = sizeBtn.getAttribute("data-size") || "";
        return;
      }

      // Nút hành động
      const btn = target.closest(
        "button[data-action]"
      ) as HTMLButtonElement | null;
      if (!btn) return;

      const action = btn.getAttribute("data-action") as
        | "add_to_cart"
        | "buy_now";
      const productId = btn.getAttribute("data-product-id") || "";
      const url = btn.getAttribute("data-url") || "";

      const card = btn.closest(".fiyo-product-card")!;
      const name =
        (card.querySelector(".fiyo-product-name") as HTMLElement)?.innerText ||
        "";
      const image =
        (card.querySelector(".fiyo-product-img") as HTMLImageElement)?.src ||
        "";
      const priceText =
        (card.querySelector(".fiyo-product-price") as HTMLElement)?.innerText ||
        "";
      const price = Number((priceText || "").replace(/[^\d]/g, "")) || 0;

      // Nếu có picker -> bắt buộc chọn đủ & gửi đúng _id
      const wrap = card.querySelector(".variant-wrap") as HTMLElement | null;
      if (wrap) {
        const color = wrap.dataset.selectedColor || "";
        const sizeLabel = wrap.dataset.selectedSize || "";
        if (!color || !sizeLabel) {
          addTextMessage(
            "bot",
            "Vui lòng chọn <b>màu</b> và <b>size</b> trước khi thêm vào giỏ.",
            true
          );
          return;
        }

        let variantId = "";
        let sizeId = "";
        let qtyInStock = 0;

        try {
          let variants: any[] = [];
          try {
            variants = JSON.parse(
              (wrap.getAttribute("data-variants") || "[]").replace(
                /&apos;/g,
                "'"
              )
            );
          } catch {
            variants = [];
          }

          // Nếu thiếu _id → fallback fetch
          const needRealIds =
            !variants.some((v) => v?._id) ||
            variants.some((v) => (v?.sizes || []).some((s: any) => !s?._id));
          if (needRealIds) {
            variants = await fetchVariantsByProduct(productId);
            if (!variants.length) {
              addTextMessage(
                "bot",
                "Không tải được biến thể sản phẩm. Vui lòng thử lại.",
                true
              );
              return;
            }
            // ghi đè lại data-variants đã chuẩn
            wrap.setAttribute(
              "data-variants",
              JSON.stringify(variants).replace(/'/g, "&apos;")
            );
          }

          // 1) tìm variant theo color đã chuẩn hoá
          let v = variants.find(
            (x: any) =>
              String(x.color || "").toLowerCase().trim() ===
              color.toLowerCase().trim()
          );

          // 2) tìm size theo label
          let s = v?.sizes?.find(
            (x: any) =>
              String(x.size || "").toLowerCase().trim() ===
              sizeLabel.toLowerCase().trim()
          );

          // 3) fallback: quét toàn bộ variants theo size label (phòng mismatch)
          if (!s) {
            for (const vv of variants) {
              const ss = (vv.sizes || []).find(
                (x: any) =>
                  String(x.size || "").toLowerCase().trim() ===
                  sizeLabel.toLowerCase().trim()
              );
              if (ss) {
                v = vv;
                s = ss;
                break;
              }
            }
          }

          variantId = v?._id || "";
          sizeId = s?._id || "";
          qtyInStock = Number(s?.quantity || 0);
        } catch {}

        // BẮT BUỘC có _id thật
        if (!variantId || !sizeId) {
          addTextMessage(
            "bot",
            "Không tìm thấy <b>variant</b>/<b>size</b> hợp lệ (thiếu _id). Vui lòng chọn lại.",
            true
          );
          return;
        }

        // Resolve shop_id (DOM → cache/API)
        const domShopId = (card as HTMLElement).dataset.shopId || "";
        const resolvedShopId = await getShopIdByProductId(productId, domShopId);

        const itemForCart: ICart = {
          id: productId,
          name,
          image,
          price,
          quantity: 1,
          quantity_Product: qtyInStock,
          variant: color,
          variant_id: variantId,
          size: sizeLabel,
          size_id: sizeId,
          shop_id: resolvedShopId,
        };

        // LOG để debug
        console.log("[Chat:addToCart] item", itemForCart);

        addToCart(itemForCart);
        
        addTextMessage("bot", "🛒 Đã thêm vào giỏ!", true);

        if (action === "buy_now") {
          // KHÔNG gắn ?sku=... nữa
          goCheckout(); // 👈 chuyển trang theo trạng thái đăng nhập
        }
        return;
      }

      // Card không có variant -> thêm tối thiểu (variant/size rỗng)
      if (action === "add_to_cart") {
        const domShopId =
          (btn.closest(".fiyo-product-card") as HTMLElement)?.dataset.shopId ||
          "";
        const shopId = await getShopIdByProductId(productId, domShopId);
        const item: ICart = {
          id: productId,
          name,
          price,
          image,
          variant_id: "",
          variant: "",
          size: "",
          quantity: 1,
          quantity_Product: 0,
          shop_id: shopId,
        };
        console.log("[Chat:addToCart] item-no-variant", item);
        addToCart(item);
        addTextMessage("bot", "🛒 Đã thêm vào giỏ!", true);
      }
      if (action === "buy_now") {
        const domShopId =
          (btn.closest(".fiyo-product-card") as HTMLElement)?.dataset.shopId ||
          "";
        const shopId = await getShopIdByProductId(productId, domShopId);
        const item: ICart = {
          id: productId,
          name,
          price,
          image,
          variant_id: "",
          variant: "",
          size: "",
          quantity: 1,
          quantity_Product: 0,
          shop_id: shopId,
        };
        console.log("[Chat:addToCart] buy-now item-no-variant", item);
        addToCart(item);
     goCheckout(); // 👈 luôn điều hướng
      }
    }; // đóng onChatListClick

    chatList.addEventListener("click", onChatListClick);

    // Gửi chat
    sendBtn.onclick = async () => {
      const text = input.value.trim();
      const userId = localStorage.getItem("userId") || undefined;

      if (!text) return;
      input.value = "";
      input.style.height = "auto";
      sendBtn.classList.add("hidden");

      addTextMessage("user", text, true);

      // Ưu tiên endpoint mới
      try {
        const data = await chatApi.ask({ message: text, userId });

        if (!data.type || data.type === "message") {
          addTextMessage(
            "bot",
            data.reply || "Mình đã nhận được tin nhắn của bạn.",
            false
          );
        } else if (data.type === "product_cards") {
          const safeCards =
            (data.cards || []).map((c) => ({
              ...c,
              id: c.id || c._id || "",
              price_text: c.price_text ?? VNPrice(Number(c.price || 0)),
              shop_id: c.shop_id || "",
            })) || [];
          addProductCardsMessage(data.reply || "Gợi ý sản phẩm:", safeCards);
        } else if (data.type === "add_to_cart") {
          const itemsRaw = (data.products as any[]) ?? [];
          const items = itemsRaw.map(toICart);
          items.forEach((item) => addToCart(item));
          addTextMessage(
            "bot",
            data.reply || "Đã thêm sản phẩm vào giỏ.",
            false
          );
        }
        return; // thành công -> kết thúc
      } catch {}

      // Fallback endpoint cũ https://fiyo.click
      try {
        const response = await fetch("https://fiyo.click/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ message: text, userId }),
        });

        if (!response.ok) throw new Error("Lỗi server!");

        const data = (await response.json()) as BotResponse;

        if (!data.type || data.type === "message") {
          addTextMessage(
            "bot",
            data.reply || "Xin lỗi, hiện tại tôi không hiểu yêu cầu.",
            false
          );
        } else if (data.type === "product_cards") {
          const safeCards =
            (data.cards || []).map((c) => ({
              ...c,
              id: c.id || c._id || "",
              price_text: c.price_text ?? VNPrice(Number(c.price || 0)),
            })) || [];
          addProductCardsMessage(data.reply || "Gợi ý sản phẩm:", safeCards);
        } else if (data.type === "add_to_cart") {
          const itemsRaw = (data.products as any[]) ?? [];
          const items = itemsRaw.map(toICart);
          items.forEach((item) => addToCart(item));
          addTextMessage(
            "bot",
            data.reply || "Đã thêm sản phẩm vào giỏ.",
            false
          );
        }
      } catch (err) {
        console.error("Chat error:", err);
        addTextMessage(
          "bot",
          "Xin lỗi, có lỗi xảy ra khi gửi tin nhắn.",
          false
        );
      }
    };

    // Emoji
    emojiBtn.onclick = () => {
      input.value += "😊";
      input.dispatchEvent(new Event("input"));
    };

    // Gửi file
    fileInput.onchange = () => {
      const file = fileInput.files?.[0];
      if (!file) return;
      if (file.type.startsWith("image/")) {
        const reader = new FileReader();
        reader.onload = (e) => {
          const imgHTML = `<img src="${
            (e.target as FileReader).result
          }" style="max-width: 200px; border-radius: 8px;" alt="${
            file.name
          }" />`;
          addTextMessage("user", imgHTML, true);
        };
        reader.readAsDataURL(file);
      } else {
        addTextMessage("user", `📎 Đã gửi file: ${file.name}`, true);
      }
    };

    // cleanup
    return () => {
      chatList.removeEventListener("click", onChatListClick);
      sendBtn.onclick = null;
      emojiBtn.onclick = null;
      fileInput.onchange = null;
    };
  }, []);

  /* ========== JSX ========== */
  return (
    <div>
      {/* Box chat thu gọn */}
      <div className="chat-wrapper state-0" ref={wrapperState0Ref}>
        <div id="popup" className="popup">
          <span className="show-number">2</span>
          <div style={{ paddingBottom: 8 }}>
            <div className="close-notif"></div>
            <ul className="list-message" style={{ maxHeight: 995 }}></ul>
          </div>
        </div>
        <div
          id="btn-start-chat"
          className="btn-start-chat theme-color-bg-non-hover appear"
          ref={btnStartChatRef}
        >
          <div className="icon show-widget" />
        </div>
      </div>

      {/* Box chat mở rộng */}
      <div className="chat-wrapper state-1" ref={wrapperState1Ref}>
        <div className="btn-start-chat theme-color-bg-non-hover">
          <div className="icon show-widget" />
        </div>
        <div
          className="chat-wrapper-inner"
          style={{
            transition: "transform 0.3s ease-in-out, opacity 0.3s ease-in-out",
            opacity: 1,
            transform: "translateY(0px)",
          }}
        >
          <div className="chat-close-wrapper">
            <button className="chat-close-button" ref={btnCloseRef}>
              <img
                src="https://widget.oncustomer.canifa.com/images/icon-close.svg"
                width={9}
                alt="close"
              />
            </button>
          </div>
          <div className="conversation">
            <div className="chat-main-frame">
              <div
                className="chat-header livechat theme-color-bg-non-hover"
                style={{ height: 75 }}
              >
                <div className="widget-header">
                  <div className="main-content-inner minimized">
                    <div className="new-conversation-header">
                      <div className="description-group">
                        <h3 className="title margin-0 title-2">
                          CHAT BOT FIYO
                        </h3>
                        <p className="sub-title">
                          Hãy hỏi bất cứ điều gì hoặc chia sẻ phản hồi của bạn
                          liên quan đến SP &amp; DV của FIYO.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Nội dung tin nhắn */}
              <div
                className="chat-content list-conversation under-header-view"
                style={{ height: `calc(100% - ${headerHeight}px)` }}
              >
                <div className="chat-content-inner">
                  <ul className="message-list" ref={chatListRef}></ul>
                </div>
              </div>

              {/* Nhập tin nhắn */}
              <div className="input-box input-status-undefined">
                <div className="place-input">
                  <textarea
                    className="ant-input main-input"
                    placeholder="Nhập tin nhắn"
                    style={{
                      height: "auto",
                      minHeight: 57,
                      maxHeight: 300,
                      overflowY: "auto",
                      resize: "none",
                    }}
                    ref={inputRef}
                  />
                  <div
                    className="composer-button"
                    style={{ alignItems: "center" }}
                  >
                    <span>
                      <div className="ant-upload ant-upload-select ant-upload-select-text">
                        <span className="ant-upload" role="button">
                          <input
                            type="file"
                            accept=".png,.jpg,.jpeg,.doc,.docx,.pdf,.xls,.xlsx,.ppt,.pptx,.mp4,.mkv,.zip"
                            multiple
                            style={{ display: "none" }}
                            ref={fileInputRef}
                          />
                          <button
                            type="button"
                            className="ant-btn reply-tool-icon no-border"
                          >
                            <img
                              src="https://widget.oncustomer.canifa.com/images/icon-attachment.png"
                              alt="attach"
                            />
                          </button>
                        </span>
                      </div>
                    </span>
                    <button
                      type="button"
                      className="ant-btn reply-tool-icon no-border"
                      ref={emojiBtnRef}
                    >
                      <img
                        src="https://widget.oncustomer.canifa.com/images/icon-emoji.svg"
                        alt="emoji"
                      />
                    </button>
                    <button
                      type="button"
                      className="ant-btn reply-tool-icon no-border hidden"
                      style={{ marginLeft: 8 }}
                      ref={sendBtnRef}
                    >
                      <img
                        src="https://cdn-icons-png.flaticon.com/512/724/724954.png"
                        width={20}
                        alt="send"
                      />
                    </button>
                  </div>
                </div>
              </div>
              {/* end input */}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
