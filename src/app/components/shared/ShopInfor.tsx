"use client";
import { useEffect, useMemo, useState, useCallback } from "react";
import "@/app/assets/css/shop.css";
import "@/app/assets/css/category.css";

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

type Rating = number | { average: number; count: number };
type Props = { userId: string };

// ====== CONFIG CƠ BẢN ======
const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "https://fiyo.click";
// Đổi thành `${API_BASE}/api/shop` nếu backend mount là /api/shop
const SHOPS_API = `${API_BASE}/api/shop`;

export default function ShopInfor({ userId }: Props) {
  // ─── State ────────────────────────────────
  const [shop, setShop] = useState<IShop | null>(null);
  const [categories, setCategories] = useState<ICategory[]>([]);
  const [error, setError] = useState("");
  const [cateError, setCateError] = useState("");
  const [loadingCate, setLoadingCate] = useState(false);
  const [filters, setFilters] = useState<IFilter>(defaultFilters);

  // ===== FOLLOW STATE (cơ bản) =====
  const [followersCount, setFollowersCount] = useState<number>(0);
  const [following, setFollowing] = useState<boolean>(false);
  const [followBusy, setFollowBusy] = useState<boolean>(false);

  // ─── Hooks cố định ─────────────
  const safeCategories = useMemo(
    () => (Array.isArray(categories) ? categories : []),
    [categories]
  );

  const handleFilterChange = useCallback((next: IFilter) => {
    setFilters(next);
  }, []);

  // ─── Fetch Shop & Categories ───────────────────────────
  useEffect(() => {
    if (!userId) return;
    const ac = new AbortController();

    (async () => {
      try {
        setError("");
        // Giữ nguyên call cũ của bạn:
        const res = await fetch(`${API_BASE}/api/shop/user/${userId}`, {
          cache: "no-store",
          signal: ac.signal,
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || "Không tải được shop");

        const s = data.shop;
        setShop(s);

        // ====== INIT FOLLOW COUNT (có thể từ followers_count virtual hoặc mảng followers) ======
        const initCount = Array.isArray(s?.followers)
          ? s.followers.length
          : (s as any).followers_count ?? 0;
        setFollowersCount(Number(initCount) || 0);

        // ====== CHECK ĐANG FOLLOW? ======
        if (s?._id) {
          try {
            const chk = await fetch(`${SHOPS_API}/${s._id}/following/${userId}`, {
              cache: "no-store",
              signal: ac.signal,
            });
            const chkData = await chk.json();
            if (chk.ok) setFollowing(!!chkData.following);
          } catch (e) {
            // im lặng: không fail UI
          }
        }

        // Fetch categories theo shopId
        if (s?._id) {
          setLoadingCate(true);
          setCateError("");
          try {
            const cateRes = await fetch(
              `${API_BASE}/api/category/shop/${s._id}`,
              { cache: "no-store", signal: ac.signal }
            );
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
        }
      } catch (err: any) {
        if (err.name !== "AbortError") setError(err.message || "Lỗi khi lấy shop");
      }
    })();

    return () => ac.abort();
  }, [userId]);

  // ====== HANDLER: TOGGLE FOLLOW (CƠ BẢN, OPTIMISTIC UI NHẸ) ======
  const onToggleFollow = useCallback(async () => {
    if (!shop?._id || !userId || followBusy) return;
    setFollowBusy(true);

    // Optimistic: đổi ngay
    setFollowing((prev) => !prev);
    setFollowersCount((c) => (following ? Math.max(0, c - 1) : c + 1));

    try {
      const res = await fetch(`${SHOPS_API}/${shop._id}/follow/toggle`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: userId }),
      });
      const data = await res.json();

      if (!res.ok) {
        // Rollback nếu lỗi
        setFollowing((prev) => !prev);
        setFollowersCount((c) => (following ? c + 1 : Math.max(0, c - 1)));
        throw new Error(data.message || "Lỗi follow");
      }

      // Nếu backend trả về followers_count mới thì sync
      if (typeof data.followers_count === "number") {
        setFollowersCount(data.followers_count);
      }
      // Nếu backend trả về following hiện tại thì sync
      if (typeof data.following === "boolean") {
        setFollowing(data.following);
      }
    } catch (e) {
      // có thể toast sau
    } finally {
      setFollowBusy(false);
    }
  }, [shop?._id, userId, followBusy, following]);

  // ─── Render ────────────
  if (error) return <p style={{ color: "red" }}>{error}</p>;
  if (!shop) return <p>Đang tải thông tin shop...</p>;

  const ratingRaw = (shop as any).rating as Rating | undefined;
  const rating =
    typeof ratingRaw === "object" && ratingRaw
      ? `${ratingRaw.average} ★ (${ratingRaw.count} đánh giá)`
      : ratingRaw ?? 0;

  const joinedText =
    (shop as any).created_at
      ? new Date((shop as any).created_at).toLocaleDateString("vi-VN")
      : "Không rõ";

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
                  ? "Đã kích hoạt"
                  : (shop as any).status === "pending"
                  ? "Chờ duyệt"
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
                <i className="fas fa-box" />
                <span className="label">Đã bán</span>
                <strong>{(shop as any).sale_count || 0}</strong>
              </li>
              <li>
                <i className="fas fa-star" />
                <span className="label">Đánh giá</span>
                <strong>{rating}</strong>
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
                <strong>{joinedText}</strong>
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
              disabled={followBusy || !shop?._id}
              title={following ? "Bỏ theo dõi" : "Theo dõi"}
            >
              <i className="far fa-user" />{" "}
              {followBusy ? "Đang xử lý…" : following ? "Bỏ theo dõi" : "Theo dõi"}
            </button>
            <button className="btn-outline">
              <i className="far fa-comments" /> Chat
            </button>
          </div>
        </div>
      </section>

      {/* ─── Categories ─── */}
      <div className="cate-children">
        <h1 className="category-title-shop">Danh mục sản phẩm</h1>
        {loadingCate && <p>Đang tải danh mục…</p>}
        {!loadingCate && cateError && <p style={{ color: "orange" }}>{cateError}</p>}
        {!loadingCate && !cateError && (safeCategories.length > 0 ? (
          <div className="category-children">
            <div className="category-children__content swiper">
              <div className="swiper-wrapper">
                {safeCategories.map((cate) => {
                  const image =
                    Array.isArray(cate.images) && cate.images.length > 0
                      ? cate.images[0]
                      : "https://placehold.co/160x214?text=No+Img";
                  return (
                    <div key={cate._id} className="category-children__item swiper-slide active">
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
        ))}
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
