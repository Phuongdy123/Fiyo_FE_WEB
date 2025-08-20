"use client";

import { useEffect, useRef } from "react";
import "@/app/assets/css/boxchat.css";

type Product = {
  id: string;
  name: string;
  image: string;
  price: number;
};

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
};

type BotResponse = {
  reply: string;
  type?: "message" | "product_cards" | "add_to_cart";
  cards?: ProductCard[];
  products?: Product[];
};

const API_BASE =
  (typeof window !== "undefined" &&
    (window as any).env?.NEXT_PUBLIC_API_BASE_URL) ||
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  "http://localhost:3000";

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

export default function BoxChatComponent() {
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

  const VNPrice = (n: number) =>
    new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(Number(n || 0));

  const normalizeProduct = (p: any): Product => ({
    id: p?.id || p?._id || "",
    name: p?.name || "",
    image: p?.image || "",
    price: Number(p?.price || 0),
  });

  const getCart = (): Product[] => {
    try {
      const raw = localStorage.getItem("cart");
      return raw ? (JSON.parse(raw) as Product[]) : [];
    } catch {
      return [];
    }
  };

  const setCart = (items: Product[]) => {
    localStorage.setItem("cart", JSON.stringify(items));
  };

  const addToCart = (products: Product[]) => {
    if (!products?.length) return;
    const current = getCart();
    const merged = [...current, ...products.map(normalizeProduct)];
    setCart(merged);
    addTextMessage("bot", "🛒 Đã thêm vào giỏ!", true);
  };

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
        ? `<div class="avatar-name-msg-item"><div><span class="ant-avatar messages-item-avatar ant-avatar-circle ant-avatar-image" style="width: 32px; height: 32px; line-height: 32px; font-size: 18px"><img src="https://api.oncustomer.canifa.com/user/file/10dbc370-8b4b-11ee-bcfa-1bc0639711b2.png" /></span></div><div class="agent-name">FIYO BOT</div></div>`
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

  // NEW: render product cards như FE cũ (UI DOM thuần)
  const addProductCardsMessage = (text: string, cards: ProductCard[] = []) => {
    const chatList = chatListRef.current;
    if (!chatList) return;

    // khối text mở đầu
    addTextMessage("bot", text || "Sản phẩm gợi ý cho bạn:", true);

    // khối cards
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
        const actions =
          c.actions && c.actions.length
            ? c.actions
            : [
                { type: "buy_now", label: "Mua ngay", productId: id, url: c.url } as CardAction,
                { type: "add_to_cart", label: "Thêm vào giỏ", productId: id } as CardAction,
              ];

        return `
          <div class="fiyo-product-card">
            <img class="fiyo-product-img" src="${c.image || ""}" alt="${c.name || ""}" onerror="this.src='https://via.placeholder.com/120?text=No+Image'"/>
            <div class="fiyo-product-info">
              <div class="fiyo-product-name">${c.name || ""}</div>
              <div class="fiyo-product-price">${priceText}</div>
              ${
                c.description_short
                  ? `<div class="fiyo-product-desc">${c.description_short}</div>`
                  : ``
              }
              <div class="fiyo-product-actions">
                ${actions
                  .map(
                    (a) => `
                    <button
                      class="fiyo-product-btn ${a.type === "buy_now" ? "primary" : "secondary"}"
                      data-action="${a.type}"
                      data-product-id="${id}"
                      ${"url" in a && (a as any).url ? `data-url="${(a as any).url}"` : ""}
                    >
                      ${a.label}
                    </button>`
                  )
                  .join("")}
              </div>
            </div>
          </div>
        `;
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
      </div>
    `;

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
          addTextMessage("bot", data.reply || "Xin chào! Tôi có thể giúp gì cho bạn?", true);
        } catch {
          try {
            const res = await fetch("http://localhost:3000/chat/welcome");
            const data = await res.json();
            addTextMessage("bot", data.reply || "Xin chào! Tôi có thể giúp gì cho bạn?", true);
          } catch {
            addTextMessage("bot", "Xin chào! Tôi có thể giúp gì cho bạn?", true);
          }
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

    // Event delegation cho nút product actions trong chat
    const onChatListClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target) return;

      const btn = target.closest("button[data-action]") as HTMLButtonElement | null;
      if (!btn) return;

      const action = btn.getAttribute("data-action") as "add_to_cart" | "buy_now";
      const productId = btn.getAttribute("data-product-id") || "";
      const url = btn.getAttribute("data-url") || "";

      if (!action || !productId) return;

      if (action === "add_to_cart") {
        // lấy thông tin tối thiểu từ DOM card (name / img / price)
        const card = btn.closest(".fiyo-product-card")!;
        const name = (card.querySelector(".fiyo-product-name") as HTMLElement)?.innerText || "";
        const image = (card.querySelector(".fiyo-product-img") as HTMLImageElement)?.src || "";
        const priceText = (card.querySelector(".fiyo-product-price") as HTMLElement)?.innerText || "";
        const price = Number((priceText || "").replace(/[^\d]/g, "")) || 0;

        addToCart([{ id: productId, name, image, price }]);
      }

      if (action === "buy_now") {
        // thêm vào giỏ rồi điều hướng nếu có url
        const card = btn.closest(".fiyo-product-card")!;
        const name = (card.querySelector(".fiyo-product-name") as HTMLElement)?.innerText || "";
        const image = (card.querySelector(".fiyo-product-img") as HTMLImageElement)?.src || "";
        const priceText = (card.querySelector(".fiyo-product-price") as HTMLElement)?.innerText || "";
        const price = Number((priceText || "").replace(/[^\d]/g, "")) || 0;

        addToCart([{ id: productId, name, image, price }]);
        if (url) window.location.href = url;
      }
    };

    chatList.addEventListener("click", onChatListClick);

    /** Gửi chat */
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
          addTextMessage("bot", data.reply || "Mình đã nhận được tin nhắn của bạn.", false);
        } else if (data.type === "product_cards") {
          const safeCards =
            (data.cards || []).map((c) => ({
              ...c,
              id: c.id || c._id || "",
              price_text: c.price_text ?? VNPrice(Number(c.price || 0)),
            })) || [];
          addProductCardsMessage(data.reply || "Gợi ý sản phẩm:", safeCards);
        } else if (data.type === "add_to_cart") {
          if (data.products?.length) addToCart(data.products as Product[]);
          addTextMessage("bot", data.reply || "Đã thêm sản phẩm vào giỏ.", false);
        }
        return; // thành công -> kết thúc
      } catch {
      }

      try {
        const response = await fetch("http://localhost:3000/api/chat", {
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
          if (data.products?.length) addToCart(data.products as Product[]);
          addTextMessage("bot", data.reply || "Đã thêm sản phẩm vào giỏ.", false);
        }
      } catch (err) {
        console.error("Chat error:", err);
        addTextMessage("bot", "Xin lỗi, có lỗi xảy ra khi gửi tin nhắn.", false);
      }
    };

    emojiBtn.onclick = () => {
      input.value += "😊";
      input.dispatchEvent(new Event("input"));
    };

    fileInput.onchange = () => {
      const file = fileInput.files?.[0];
      if (!file) return;
      if (file.type.startsWith("image/")) {
        const reader = new FileReader();
        reader.onload = (e) => {
          const imgHTML = `<img src="${e.target?.result}" style="max-width: 200px; border-radius: 8px;" alt="${file.name}" />`;
          addTextMessage("user", imgHTML, true);
        };
        reader.readAsDataURL(file);
      } else {
        addTextMessage("user", `📎 Đã gửi file: ${file.name}`, true);
      }
    };

    return () => {
      chatList.removeEventListener("click", onChatListClick);
    };
  }, []);

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
                        <h3 className="title margin-0 title-2">CHAT BOT FIYO</h3>
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
            </div>
          </div>
        </div>
      </div>

     
    </div>
  );
}
