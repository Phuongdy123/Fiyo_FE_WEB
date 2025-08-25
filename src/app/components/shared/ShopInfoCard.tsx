"use client";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { useUserChat } from '../section/chat/UserChatProvider';

/* ==== Types từ API ==== */
type ShopRating = { average?: number; count?: number };
type ShopAPI = {
  _id: string;
  name: string;
  avatar?: string;
  created_at?: string;
  updated_at?: string;
  rating?: ShopRating;
  followers_count?: number;
  total_products?: number;
  response_rate?: number;
  response_time_text?: string;
  followers?: any[];
  address?: string; // Added address field
};

/* ==== Helpers ==== */
function timeAgoVN(iso?: string) {
  if (!iso) return "";
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 60) return `${m} phút trước`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h} giờ trước`;
  const d = Math.floor(h / 24);
  if (d < 30) return `${d} ngày trước`;
  const mo = Math.floor(d / 30);
  if (mo < 12) return `${mo} tháng trước`;
  const y = Math.floor(mo / 12);
  return `${y} năm trước`;
}

/** Chỉ cho phép 1 trong 2: shopId hoặc productId */
type BaseHandlers = {
  onChat?: (shopId: string) => void;
  onViewShop?: (shopId: string) => void;
};
type Props =
  | ({ shopId: string; productId?: never } & BaseHandlers)
  | ({ productId: string; shopId?: never } & BaseHandlers);

export default function ShopInfoCard(props: Props) {
  const { openForShop } = useUserChat();
  const router = useRouter();
  const { onChat, onViewShop } = props;
  const [shop, setShop] = useState<ShopAPI | null>(null);
  const [loading, setLoading] = useState(false);

  const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "https://fiyo.click";

  const url = useMemo(() => {
    if ("shopId" in props && props.shopId) {
      return `${BASE_URL}/api/shop/${props.shopId}`;
    }
    if ("productId" in props && props.productId) {
      return `${BASE_URL}/api/shop/by-product/${props.productId}`;
    }
    return null;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [BASE_URL, "shopId" in props ? props.shopId : null, "productId" in props ? props.productId : null]);

  useEffect(() => {
    if (!url) return;
    const ctrl = new AbortController();

    (async () => {
      try {
        setLoading(true);
        const res = await fetch(url, { cache: "no-store", signal: ctrl.signal });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = await res.json();

        // hỗ trợ nhiều shape: {status, shop} | {status, result} | {data} | object
        const raw: ShopAPI = json?.shop ?? json?.result ?? json?.data ?? json;
        if (!raw || !raw._id) throw new Error(json?.message || "Không tìm thấy shop");

        // followers_count fallback
        if (raw.followers_count == null && Array.isArray(raw.followers)) {
          (raw as any).followers_count = raw.followers.length;
        }

        // --- Fallback total_products ---
        const totalFromOtherKeys = json?.totalProduct ?? json?.product_count ?? json?.products_count ?? null;
        if (totalFromOtherKeys != null && raw.total_products == null) {
          (raw as any).total_products = Number(totalFromOtherKeys);
        }

        // nếu vẫn chưa có total_products → gọi count API (nếu BE có)
        if (raw._id && (raw.total_products == null || isNaN(Number(raw.total_products)))) {
          try {
            const resCount = await fetch(`${BASE_URL}/api/products/count?shop_id=${raw._id}`, {
              cache: "no-store",
              signal: ctrl.signal,
            });
            if (resCount.ok) {
              const j = await resCount.json();
              (raw as any).total_products = Number(j?.count ?? 0);
            }
          } catch {
            // nuốt lỗi
          }
        }

        setShop(raw);
      } catch (e: any) {
        if (e?.name !== "AbortError") {
          console.error("ShopInfoCard fetch error:", e);
          setShop(null);
        }
      } finally {
        setLoading(false);
      }
    })();

    return () => ctrl.abort();
  }, [url, BASE_URL]);

  if (loading) {
    return (
      <div className="shopHero">
        <div className="shopLeft">
          <div className="shopAvatar" />
          <div className="shopMeta">
            <div className="shopName">Đang tải shop...</div>
            <div className="shopOnline">—</div>
            <div className="shopActions">
              <button className="shopChatBtn" disabled>Chat Ngay</button>
              <button className="shopViewBtn" disabled>Xem Shop</button>
            </div>
          </div>
        </div>
        <div className="shopRight" />
      </div>
    );
  }

  if (!shop) return null;

  const reviews = shop.rating?.count ?? 0;
  const responseRate = shop.response_rate ?? 96;
  const joinedText = timeAgoVN(shop.created_at) || "—";
  const products = Number.isFinite(Number(shop.total_products)) ? Number(shop.total_products) : 0;
  const responseTimeText = shop.response_time_text ?? "trong vài giờ";
  const followers = shop.followers_count ?? 0;
  const address = shop.address ?? "Không có thông tin địa chỉ"; // Fallback for address

  return (
    <div className="shopHero">
      {/* Left */}
      <div className="shopLeft">
        <img
          className="shopAvatar"
          src={shop.avatar || "https://placehold.co/96x96?text=Shop"}
          alt={shop.name}
        />
        <div className="shopMeta">
          <div className="shopName">{shop.name}</div>
          <div className="shopOnline">
            {`Online ${timeAgoVN(shop.updated_at || shop.created_at) || "1 giờ trước"} `}
          </div>
          <div className="shopActions">
            <button
              className="shopChatBtn"
              onClick={() => openForShop(shop._id)}
            >
              Chat Ngay
            </button>
            <button className="shopViewBtn" onClick={() => router.push(`/page/shop/${shop._id}`)}>
              Xem Shop
            </button>
          </div>
        </div>
      </div>

      {/* Right */}
      <div className="shopRight">
        <div className="shopCol">
          <div className="shopLabel">Địa chỉ</div>
          <div className="shopValue">{address}</div>
        </div>
        <div className="shopCol"><div className="shopLabel">Tỉ Lệ Phản Hồi</div><div className="shopValue">{responseRate}%</div></div>
        <div className="shopCol"><div className="shopLabel">Tham Gia</div><div className="shopValue">{joinedText}</div></div>
        <div className="shopCol"><div className="shopLabel">Sản Phẩm</div><div className="shopValue">{products.toLocaleString("vi-VN")}</div></div>
        <div className="shopCol"><div className="shopLabel">Phản Hồi</div><div className="shopValue">{responseTimeText}</div></div>
        <div className="shopCol"><div className="shopLabel">Người Theo Dõi</div><div className="shopValue">{followers.toLocaleString("vi-VN")}</div></div>
      </div>
    </div>
  );
}