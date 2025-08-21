"use client";
import { useEffect, useMemo, useState, useCallback } from "react";
import "@/app/assets/css/shop.css";
import "@/app/assets/css/category.css";

import type { IShop } from "@/app/untils/IShop";
import type { IFilter } from "@/app/untils/IFilter";
import { defaultFilters } from "@/app/untils/IFilter";

import ShopFilterSection from "../ShopProduct/ShopFilterSection";
import ListProductShop from "../ShopProduct/ListProductShop";

interface ICategory {
  _id: string;
  name: string;
  slug: string;
  images?: string[];
}

type Rating = number | { average: number; count: number };

type Props = { shopId: string };

export default function PublicShop({ shopId }: Props) {
  // ─── State ────────────────────────────────
  const [shop, setShop] = useState<IShop | null>(null);
  const [categories, setCategories] = useState<ICategory[]>([]);
  const [error, setError] = useState("");
  const [cateError, setCateError] = useState("");
  const [loadingCate, setLoadingCate] = useState(false);
  const [filters, setFilters] = useState<IFilter>(defaultFilters);

  // ─── Hooks cố định ───────────────────────
  const safeCategories = useMemo(
    () => (Array.isArray(categories) ? categories : []),
    [categories]
  );

  const handleFilterChange = useCallback((next: IFilter) => {
    setFilters(next);
  }, []);

  // ─── Fetch Shop & Categories theo shopId ─
  useEffect(() => {
    if (!shopId) return;
    const ac = new AbortController();

    (async () => {
      try {
        setError("");
        // lấy shop theo id (đúng với router: GET /api/shop/:id)
        const res = await fetch(`http://localhost:3000/api/shop/${shopId}`, {
          cache: "no-store",
          signal: ac.signal,
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || "Không tải được shop");

        // hỗ trợ nhiều shape trả về
        const shopData = data?.shop ?? data?.result ?? data;
        if (!shopData?._id) throw new Error("Shop không hợp lệ");
        setShop(shopData);

        // lấy categories theo shopId (đúng pattern cũ: /api/category/shop/:shopId)
        setLoadingCate(true);
        setCateError("");
        try {
          const cateRes = await fetch(
            `http://localhost:3000/api/category/shop/${shopData._id}`,
            { cache: "no-store", signal: ac.signal }
          );
          const cateData = await cateRes.json();
          if (cateRes.ok) {
            setCategories(
              Array.isArray(cateData.categories) ? cateData.categories : []
            );
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
  }, [shopId]);

  // ─── Render ───────────────────────────────
  if (error) return <p style={{ color: "red" }}>{error}</p>;
  if (!shop) return <p>Đang tải thông tin shop...</p>;

  const ratingRaw = (shop as any).rating as Rating | undefined;
  const rating =
    typeof ratingRaw === "object" && ratingRaw
      ? `${ratingRaw.average} ★ (${ratingRaw.count} đánh giá)`
      : ratingRaw ?? 0;

  const followersCount = Array.isArray((shop as any).followers)
    ? (shop as any).followers.length
    : (shop as any).followers_count ?? 0;

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
                  {followersCount > 0
                    ? `${followersCount} người`
                    : "Chưa có người theo dõi"}
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
            <button className="btn-outline">
              <i className="far fa-user" /> Theo Dõi
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
        {!loadingCate && cateError && (
          <p style={{ color: "orange" }}>{cateError}</p>
        )}
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
                    <div
                      key={cate._id}
                      className="category-children__item swiper-slide active"
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
