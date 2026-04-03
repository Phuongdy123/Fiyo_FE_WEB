"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState, useCallback } from "react";
import { useUserChat } from '../section/chat/UserChatProvider';

/* ==== Types ==== */
interface ShopRating { average?: number; count?: number }

interface ShopAPI {
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
  address?: string;
}

type Props = 
  | { shopId: string; productId?: never } 
  | { productId: string; shopId?: never };

/* ==== Helpers ==== */
const timeAgoVN = (iso?: string) => {
  if (!iso) return "";
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 60) return `${m} phút trước`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h} giờ trước`;
  const d = Math.floor(h / 24);
  return `${d} ngày trước`;
};

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "https://fiyo-be.onrender.com";

export default function ShopInfoCard(props: Props) {
  const { openForShop } = useUserChat();
  const router = useRouter();
  const [shop, setShop] = useState<ShopAPI | null>(null);
  const [loading, setLoading] = useState(false);

  // 1. Memoize URL để tránh trigger useEffect sai mục đích
  const fetchUrl = useMemo(() => {
    if (props.shopId) return `${BASE_URL}/api/shop/${props.shopId}`;
    if (props.productId) return `${BASE_URL}/api/shop/by-product/${props.productId}`;
    return null;
  }, [props.shopId, props.productId]);

  // 2. Tách logic fetch count sản phẩm
  const fetchProductCount = useCallback(async (shopId: string, signal: AbortSignal) => {
    try {
      const res = await fetch(`${BASE_URL}/api/products/count?shop_id=${shopId}`, { signal });
      if (res.ok) {
        const data = await res.json();
        return Number(data?.count ?? 0);
      }
    } catch { return 0; }
    return 0;
  }, []);

  // 3. Effect chính xử lý dữ liệu
  useEffect(() => {
    if (!fetchUrl) return;
    const ctrl = new AbortController();

    const loadData = async () => {
      setLoading(true);
      try {
        const res = await fetch(fetchUrl, { cache: "no-store", signal: ctrl.signal });
        const json = await res.json();
        if (!res.ok) throw new Error("Fetch failed");

        const raw: ShopAPI = json?.shop ?? json?.result ?? json?.data ?? json;
        if (!raw?._id) return;

        // Xử lý fallback cho các trường dữ liệu thiếu
        const followersCount = raw.followers_count ?? raw.followers?.length ?? 0;
        const totalProductsRaw = raw.total_products ?? json?.totalProduct ?? json?.product_count ?? 0;
        
        let finalTotalProducts = Number(totalProductsRaw);

        // Nếu vẫn không có số lượng sản phẩm, gọi API count phụ
        if (!finalTotalProducts || isNaN(finalTotalProducts)) {
          finalTotalProducts = await fetchProductCount(raw._id, ctrl.signal);
        }

        setShop({
          ...raw,
          followers_count: followersCount,
          total_products: finalTotalProducts
        });
      } catch (e: any) {
        if (e.name !== "AbortError") setShop(null);
      } finally {
        setLoading(false);
      }
    };

    loadData();
    return () => ctrl.abort();
  }, [fetchUrl, fetchProductCount]);

  // 4. Render Skeleton
  if (loading) return <ShopSkeleton />;
  if (!shop) return null;

  return (
    <div className="shopHero">
      <div className="shopLeft">
        <img 
          className="shopAvatar" 
          src={shop.avatar || "https://placehold.co/96x96?text=Shop"} 
          alt={shop.name} 
        />
        <div className="shopMeta">
          <div className="shopName">{shop.name}</div>
          <div className="shopOnline">
            Online {timeAgoVN(shop.updated_at || shop.created_at) || "vừa xong"}
          </div>
          <div className="shopActions">
            <button className="shopChatBtn" onClick={() => openForShop(shop._id)}>
              Chat Ngay
            </button>
            <button className="shopViewBtn" onClick={() => router.push(`/page/shop/${shop._id}`)}>
              Xem Shop
            </button>
          </div>
        </div>
      </div>

      <div className="shopRight">
        <StatCol label="Địa chỉ" value={shop.address || "Không rõ"} fullWidth />
        <StatCol label="Tỉ Lệ Phản Hồi" value={`${shop.response_rate ?? 95}%`} />
        <StatCol label="Tham Gia" value={timeAgoVN(shop.created_at) || "Mới"} />
        <StatCol label="Sản Phẩm" value={(shop.total_products || 0).toLocaleString("vi-VN")} />
        <StatCol label="Phản Hồi" value={shop.response_time_text ?? "vài giờ"} />
        <StatCol label="Người Theo Dõi" value={(shop.followers_count || 0).toLocaleString("vi-VN")} />
      </div>
    </div>
  );
}

/* ==== Sub-components để sạch code ==== */
function StatCol({ label, value, fullWidth = false }: { label: string; value: string | number, fullWidth?: boolean }) {
  return (
    <div className="shopCol" style={fullWidth ? { gridColumn: "span 2" } : {}}>
      <div className="shopLabel">{label}</div>
      <div className="shopValue">{value}</div>
    </div>
  );
}

function ShopSkeleton() {
  return (
    <div className="shopHero skeleton">
      <div className="shopLeft">
        <div className="shopAvatar loading-shimmer" />
        <div className="shopMeta">
          <div className="shopName loading-shimmer" style={{ width: '120px', height: '20px' }} />
          <div className="shopOnline loading-shimmer" style={{ width: '80px', height: '14px', marginTop: '8px' }} />
        </div>
      </div>
    </div>
  );
}