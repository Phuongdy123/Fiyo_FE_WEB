'use client';

import { useEffect, useMemo, useState, useCallback } from "react";

import { IShop } from "@/app/untils/IShop";
import { IFilter, defaultFilters } from "@/app/untils/IFilter";
import ShopFilterSection from "../section/ShopProduct/ShopFilterSection";
import ListProductShop from "../section/ShopProduct/ListProductShop";

interface ICategory {
  _id: string;
  name: string;
  slug: string;
  images?: string[];
}

type Props = { userId: string };

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "https://fiyo-be.onrender.com";
const SHOPS_API = `${API_BASE}/api/shop`;

export default function ShopInfor({ userId }: Props) {
  // --- State ---
  const [shop, setShop] = useState<IShop | null>(null);
  const [categories, setCategories] = useState<ICategory[]>([]);
  const [error, setError] = useState("");
  const [cateError, setCateError] = useState("");
  const [loadingCate, setLoadingCate] = useState(false);
  const [filters, setFilters] = useState<IFilter>(defaultFilters);

  // --- Follow State ---
  const [followersCount, setFollowersCount] = useState<number>(0);
  const [following, setFollowing] = useState<boolean>(false);
  const [followBusy, setFollowBusy] = useState<boolean>(false);

  // --- Memos ---
  const safeCategories = useMemo(() => (Array.isArray(categories) ? categories : []), [categories]);

  // --- Logic Helpers ---
  const fetchShopData = useCallback(async (signal: AbortSignal) => {
    try {
      setError("");
      const res = await fetch(`${API_BASE}/api/shop/user/${userId}`, { cache: "no-store", signal });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Không tải được shop");

      const s = data.shop;
      setShop(s);

      // Tính toán followers
      const initCount = Array.isArray(s?.followers) ? s.followers.length : s?.followers_count ?? 0;
      setFollowersCount(Number(initCount) || 0);

      return s;
    } catch (err: any) {
      if (err.name !== "AbortError") setError(err.message || "Lỗi khi lấy shop");
      return null;
    }
  }, [userId]);

  const checkFollowing = useCallback(async (shopId: string, signal: AbortSignal) => {
    try {
      const chk = await fetch(`${SHOPS_API}/${shopId}/following/${userId}`, { cache: "no-store", signal });
      const chkData = await chk.json();
      if (chk.ok) setFollowing(!!chkData.following);
    } catch (e) { /* Im lặng */ }
  }, [userId]);

  const fetchCategories = useCallback(async (shopId: string, signal: AbortSignal) => {
    setLoadingCate(true);
    setCateError("");
    try {
      const res = await fetch(`${API_BASE}/api/category/shop/${shopId}`, { cache: "no-store", signal });
      const data = await res.json();
      if (res.ok) {
        setCategories(Array.isArray(data.categories) ? data.categories : []);
      } else {
        setCategories([]);
        setCateError(data.message || "Không tải được danh mục");
      }
    } catch (e) {
      setCategories([]);
    } finally {
      setLoadingCate(false);
    }
  }, []);

  // --- Effects ---
  useEffect(() => {
    if (!userId) return;
    const ac = new AbortController();

    const init = async () => {
      const currentShop = await fetchShopData(ac.signal);
      if (currentShop?._id) {
        // Chạy song song để tối ưu tốc độ tải trang
        Promise.all([
          checkFollowing(currentShop._id, ac.signal),
          fetchCategories(currentShop._id, ac.signal)
        ]);
      }
    };

    init();
    return () => ac.abort();
  }, [userId, fetchShopData, checkFollowing, fetchCategories]);

  // --- Handlers ---
  const onToggleFollow = useCallback(async () => {
    if (!shop?._id || !userId || followBusy) return;
    
    setFollowBusy(true);
    const prevFollowing = following;
    const prevCount = followersCount;

    // Optimistic UI update
    setFollowing(!prevFollowing);
    setFollowersCount(c => prevFollowing ? Math.max(0, c - 1) : c + 1);

    try {
      const res = await fetch(`${SHOPS_API}/${shop._id}/follow/toggle`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: userId }),
      });
      const data = await res.json();

      if (!res.ok) throw new Error();

      if (typeof data.followers_count === "number") setFollowersCount(data.followers_count);
      if (typeof data.following === "boolean") setFollowing(data.following);
    } catch (e) {
      // Rollback nếu lỗi
      setFollowing(prevFollowing);
      setFollowersCount(prevCount);
    } finally {
      setFollowBusy(false);
    }
  }, [shop?._id, userId, followBusy, following, followersCount]);

  // --- Rendering Helpers ---
  if (error) return <div className="error-box">{error}</div>;
  if (!shop) return <div className="loading-box">Đang tải thông tin shop...</div>;

  const rating = typeof shop.rating === 'object' 
    ? `${shop.rating.average} ★ (${shop.rating.count} đánh giá)` 
    : (shop.rating || 0);

  const joinedDate = shop.created_at ? new Date(shop.created_at).toLocaleDateString("vi-VN") : "Không rõ";

  return (
    <div className="main-content">
      <section className="shop-hero">
        <div className="shop-hero__cover">
          <img src={shop.banner || "https://placehold.co/1200x300?text=Shop+Banner"} alt="Cover" />
        </div>

        <div className="shop-hero__card">
          <div className="shop-hero__left">
            <div className="shop-hero__avatar">
              <img src={shop.avatar || "https://placehold.co/160x160"} alt={shop.name} />
            </div>
            <div className="shop-hero__title">
              <h2>{shop.name}</h2>
              <span className={`shop-hero__badge ${shop.status === "active" ? "active" : "inactive"}`}>
                {shop.status === "active" ? "Đã kích hoạt" : shop.status === "pending" ? "Chờ duyệt" : "Đã khóa"}
              </span>
            </div>
          </div>

          <div className="shop-hero__middle">
            <ul className="shop-hero__stats">
              <StatItem icon="fa-phone" label="Điện thoại" value={shop.phone} />
              <StatItem icon="fa-box" label="Đã bán" value={shop.sale_count || 0} />
              <StatItem icon="fa-star" label="Đánh giá" value={rating} />
              <StatItem 
                icon="fa-user-group" 
                label="Người theo dõi" 
                value={followersCount > 0 ? `${followersCount} người` : "Chưa có"} 
              />
              <StatItem icon="fa-calendar-alt" label="Tham gia" value={joinedDate} className="hide-sm" />
              <StatItem icon="fa-envelope" label="Email" value={shop.email} className="hide-sm truncate" />
            </ul>
          </div>

          <div className="shop-hero__actions">
            <button className="btn-outline" onClick={onToggleFollow} disabled={followBusy}>
              <i className={`${following ? "fas" : "far"} fa-user`} />
              {followBusy ? " Đang xử lý…" : following ? " Bỏ theo dõi" : " Theo dõi"}
            </button>
            <button className="btn-outline">
              <i className="far fa-comments" /> Chat
            </button>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <div className="cate-children">
        <h1 className="category-title-shop">Danh mục sản phẩm</h1>
        {loadingCate ? (
          <p>Đang tải danh mục…</p>
        ) : cateError ? (
          <p style={{ color: "orange" }}>{cateError}</p>
        ) : safeCategories.length > 0 ? (
          <div className="category-children">
             <div className="category-children__content">
                <div className="swiper-wrapper" style={{ display: 'flex', gap: '15px', overflowX: 'auto' }}>
                  {safeCategories.map((cate) => (
                    <div key={cate._id} className="category-children__item active">
                      <div className="category-children__image">
                        <img src={cate.images?.[0] || "https://placehold.co/160x214"} alt={cate.name} />
                      </div>
                      <span className="category-children__name">{cate.name}</span>
                    </div>
                  ))}
                </div>
             </div>
          </div>
        ) : <p>Shop chưa có danh mục nào.</p>}
      </div>

      <div className="columns">
        <ShopFilterSection filters={filters} onFilterChange={setFilters} categories={safeCategories} />
        <ListProductShop shopId={shop._id} filters={filters} onFilterChange={setFilters} />
      </div>
    </div>
  );
}

// Sub-component nhỏ để code nhìn gọn hơn
function StatItem({ icon, label, value, className = "" }: any) {
  return (
    <li className={className}>
      <i className={`fas ${icon}`} />
      <span className="label">{label}</span>
      <strong>{value}</strong>
    </li>
  );
}