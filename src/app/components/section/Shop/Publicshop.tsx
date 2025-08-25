"use client";
import { useEffect, useMemo, useState, useCallback } from "react";
import "@/app/assets/css/shop.css";
import "@/app/assets/css/category.css";
import { useUserChat } from "../chat/UserChatProvider";

import type { IShop } from "@/app/untils/IShop";
import type { IFilter } from "@/app/untils/IFilter";
import { defaultFilters } from "@/app/untils/IFilter";

import ShopFilterSection from "../ShopProduct/ShopFilterSection";
import ListProductShop from "../ShopProduct/ListProductShop";
import { useAuth } from "@/app/context/CAuth";

interface ICategory {
  _id: string;
  name: string;
  slug: string;
  images?: string[];
}

type Props = { shopId: string };

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "https://fiyo.click";
const API_SHOP_DETAIL = (id: string) => `${API_BASE}/api/shop/${id}`;
const API_CATEGORY_BY_SHOP = (id: string) => `${API_BASE}/api/category/shop/${id}`;
const API_FOLLOW_BASE = `${API_BASE}/api/shop`;

/* ===== Helper hiển thị địa chỉ gọn gàng ===== */
function formatAddress(shop: any): string {
  // ưu tiên shop.address (string)
  const a = shop?.address;
  if (typeof a === "string" && a.trim()) return a.trim();

  // nếu location là object: { address, ward, district, city }
  const loc = shop?.location || {};
  const parts1 = [loc.address, loc.ward, loc.district, loc.city]
    .filter(Boolean)
    .map((s: string) => String(s).trim());
  if (parts1.length) return parts1.join(", ");

  // nếu addresses là mảng địa chỉ (lấy địa chỉ mặc định hoặc phần tử đầu)
  const arr = Array.isArray(shop?.addresses) ? shop.addresses : [];
  if (arr.length) {
    const def = arr.find((x: any) => x?.status === "default") || arr[0];
    const parts2 = [def?.detail, def?.address, def?.type, def?.name, def?.phone]
      .filter(Boolean)
      .map((s: string) => String(s).trim());
    if (parts2.length) return parts2.join(", ");
  }

  return "Chưa cập nhật";
}

export default function PublicShop({ shopId }: Props) {
  const { openForShop } = useUserChat();
  const { user } = useAuth();
  const viewerId = user?._id ? String(user._id) : "";

  // State
  const [shop, setShop] = useState<IShop | null>(null);
  const [categories, setCategories] = useState<ICategory[]>([]);
  const [error, setError] = useState("");
  const [cateError, setCateError] = useState("");
  const [loadingCate, setLoadingCate] = useState(false);
  const [filters, setFilters] = useState<IFilter & { categoryId?: string | null }>(
    { ...defaultFilters, categoryId: null }
  );

  // Follow state
  const [followersCount, setFollowersCount] = useState<number>(0);
  const [following, setFollowing] = useState<boolean>(false);
  const [followBusy, setFollowBusy] = useState<boolean>(false);

  const safeCategories = useMemo(
    () => (Array.isArray(categories) ? categories : []),
    [categories]
  );

  const handleFilterChange = useCallback((next: IFilter & { categoryId?: string | null }) => {
    setFilters(next);
  }, []);

  // Fetch shop & categories
  useEffect(() => {
    if (!shopId) return;
    const ac = new AbortController();

    (async () => {
      try {
        setError("");

        const res = await fetch(API_SHOP_DETAIL(shopId), { cache: "no-store", signal: ac.signal });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || "Không tải được shop");

        const shopData: any = data?.shop ?? data?.result ?? data;
        if (!shopData?._id) throw new Error("Shop không hợp lệ");
        setShop(shopData);

        // followers count
        const initCount = Number(
          shopData?.followers_count ??
            (Array.isArray(shopData?.followers) ? shopData.followers.length : 0)
        );
        setFollowersCount(isNaN(initCount) ? 0 : initCount);

        // check following
        if (viewerId) {
          try {
            const chk = await fetch(
              `${API_FOLLOW_BASE}/${shopData._id}/following/${viewerId}`,
              { cache: "no-store", signal: ac.signal }
            );
            const chkData = await chk.json();
            if (chk.ok) setFollowing(!!chkData?.following);
          } catch { /* ignore */ }
        } else {
          setFollowing(false);
        }

        // categories
        setLoadingCate(true);
        try {
          const cateRes = await fetch(API_CATEGORY_BY_SHOP(shopData._id), {
            cache: "no-store", signal: ac.signal,
          });
          const cateData = await cateRes.json();
          if (cateRes.ok) {
            setCategories(Array.isArray(cateData.categories) ? cateData.categories : []);
          } else {
            setCategories([]);
            setCateError(cateData.message || "Không tải được danh mục");
          }
        } finally {
          setLoadingCate(false);
        }
      } catch (err: any) {
        if (err.name !== "AbortError") setError(err.message || "Lỗi khi lấy shop");
      }
    })();

    return () => ac.abort();
  }, [shopId, viewerId]);

  // isOwner
  const isOwner = useMemo(() => {
    const raw: any =
      (shop as any)?.owner_id ??
      (shop as any)?.user_id ??
      (shop as any)?.owner ?? null;
    const ownerId = typeof raw === "object" && raw
      ? raw?._id ?? raw?.id ?? raw?.toString?.()
      : raw;
    return ownerId && viewerId && String(ownerId) === String(viewerId);
  }, [shop, viewerId]);

  // follow toggle
  const onToggleFollow = useCallback(async () => {
    if (!shop?._id) return;
    if (!viewerId) {
      alert("Bạn cần đăng nhập để theo dõi.");
      return;
    }
    if (isOwner) {
      alert("Bạn không thể theo dõi shop của chính mình.");
      return;
    }
    if (followBusy) return;

    setFollowBusy(true);
    setFollowing((prev) => !prev);
    setFollowersCount((c) => (following ? Math.max(0, c - 1) : c + 1));

    try {
      const url = `${API_FOLLOW_BASE}/${shop._id}/follow/toggle?user_id=${encodeURIComponent(viewerId)}`;
      const res = await fetch(url, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", "X-User-Id": viewerId },
        body: JSON.stringify({ user_id: viewerId }),
      });
      const data = await res.json();

      if (!res.ok) {
        setFollowing((prev) => !prev);
        setFollowersCount((c) => (following ? c + 1 : Math.max(0, c - 1)));
        throw new Error(data?.message || "Lỗi follow");
      }

      if (typeof data.followers_count === "number") setFollowersCount(data.followers_count);
      if (typeof data.following === "boolean") setFollowing(data.following);

      // Reset page sau khi follow/unfollow (nếu bạn muốn giữ nguyên, xóa dòng này)
      window.location.reload();
    } catch {
      setFollowing((prev) => !prev);
      setFollowersCount((c) => (following ? c + 1 : Math.max(0, c - 1)));
    } finally {
      setFollowBusy(false);
    }
  }, [shop?._id, viewerId, followBusy, following, isOwner]);

  if (error) return <p style={{ color: "red" }}>{error}</p>;
  if (!shop) return <p>Đang tải thông tin shop...</p>;

  const displayAddress = formatAddress(shop as any);

  return (
    <div className="main-content">
      {/* ─── Shop Info ─── */}
      <section className="shop-hero">
        <div className="shop-hero__cover">
          <img
            src={(shop as any).banner || "https://placehold.co/1200x300?text=Shop+Banner"}
            alt="Shop cover"
          />
        </div>

        <div className="shop-hero__card">
          <div className="shop-hero__left">
            <div className="shop-hero__avatar">
              <img
                src={(shop as any).avatar || "https://placehold.co/160x160"}
                alt={shop.name}
              />
            </div>
            <div className="shop-hero__title">
              <h2>{shop.name}</h2>
              <span
                className={`shop-hero__badge ${
                  (shop as any).status === "active" ? "active" : "inactive"
                }`}
              >
                {(shop as any).status === "active"
                  ? "Đang hoạt động"
                  : (shop as any).status === "pending"
                  ? "Chờ hoạt động"
                  : "Đã khóa"}
              </span>
            </div>
          </div>

          <div className="shop-hero__middle">
            <ul className="shop-hero__stats">
              <li>
                <i className="fas fa-phone" />
                <span className="label">Điện thoại</span>
                <strong>{(shop as any).phone}</strong>
              </li>

              <li>
                <i className="fas fa-box-open" />
                <span className="label">Sản phẩm</span>
                <strong>{(shop as any).total_products || 0}</strong>
              </li>

              {/* === THAY ĐÁNH GIÁ BẰNG ĐỊA CHỈ === */}
              <li className="truncate">
                <i className="fas fa-map-marker-alt" />
                <span className="label">Địa chỉ</span>
                <strong title={displayAddress}>{displayAddress}</strong>
              </li>

              <li>
                <i className="fas fa-user-group" />
                <span className="label">Người theo dõi</span>
                <strong>
                  {followersCount > 0 ? `${followersCount} người` : "Chưa có người theo dõi"}
                </strong>
              </li>

              <li className="hide-sm">
                <i className="fas fa-calendar-alt" />
                <span className="label">Tham gia</span>
                <strong>
                  {(shop as any).created_at
                    ? new Date((shop as any).created_at).toLocaleDateString("vi-VN")
                    : "Không rõ"}
                </strong>
              </li>

              <li className="truncate hide-sm">
                <i className="fas fa-envelope" />
                <span className="label">Email</span>
                <strong>{(shop as any).email}</strong>
              </li>
            </ul>
          </div>

          <div className="shop-hero__actions">
            <button
              className="btn-outline"
              onClick={onToggleFollow}
              disabled={followBusy}
              title={following ? "Bỏ theo dõi" : "Theo dõi"}
            >
              <i className="far fa-user" />{" "}
              {followBusy
                ? "Đang xử lý…"
                : following
                ? "Bỏ theo dõi"
                : viewerId
                ? "Theo Dõi"
                : "Đăng nhập để theo dõi"}
            </button>
            <button
              className="btn-outline"
              onClick={() => openForShop(shop._id)}
            >
              <i className="far fa-comments" /> Chat
            </button>
          </div>
        </div>
      </section>

      {/* ─── Categories ─── */}
      <div className="cate-children">
        <h1 className="category-title-shop">Danh mục sản phẩm</h1>
        {/* loading / error */}
        {/* ... */}
        {(() => {
          const loadingCate = false; // giữ nguyên như code của bạn, chỉ rút gọn hiển thị ở đây
          const cateError = "";
          const safeCategories = (categories || []) as ICategory[];
          if (loadingCate) return <p>Đang tải danh mục…</p>;
          if (cateError) return <p style={{ color: "orange" }}>{cateError}</p>;
          return safeCategories.length > 0 ? (
            <div className="category-children">
              <div className="category-children__content swiper">
                <div className="swiper-wrapper">
                  {safeCategories.map((cate) => {
                    const image =
                      Array.isArray(cate.images) && cate.images.length > 0
                        ? cate.images[0]
                        : "https://placehold.co/160x214?text=No+Img";
                    const isActive = filters.categoryId === cate._id;
                    return (
                      <div
                        key={cate._id}
                        className={`category-children__item swiper-slide ${isActive ? "active" : ""}`}
                        onClick={() => setFilters({ ...filters, categoryId: cate._id })}
                        style={{ cursor: "pointer" }}
                      >
                        <div className="category-children__image">
                          <img src={image} alt={cate.name} width={160} height={214} />
                        </div>
                        <span className="category-children__name">{cate.name}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          ) : (
            <p>Shop chưa có danh mục nào.</p>
          );
        })()}
      </div>

      {/* ─── Filter + Products ─── */}
      <div className="columns">
        <ShopFilterSection
          filters={filters}
          onFilterChange={setFilters}
          categories={safeCategories}
        />
        <ListProductShop
          shopId={(shop as any)._id}
          filters={filters}
          onFilterChange={handleFilterChange}
        />
      </div>
    </div>
  );
}
