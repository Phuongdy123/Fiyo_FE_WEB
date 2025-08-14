"use client";
import { useState, useEffect } from "react";
import { getAllCategoryChilds } from "@/app/services/Category/SCategory";
import { ICategory } from "@/app/untils/ICategory";
import { useRouter } from "next/navigation";
import { IFilter } from "@/app/untils/IFilter";

export default function FilterSection({
  categorybyslug,
  parentSlug,
  filters,
  onFilterChange,
}: {
  categorybyslug: ICategory[];
  parentSlug: string;
  filters: IFilter;
  onFilterChange: (filters: IFilter) => void;
}) {
  const router = useRouter();
  const [category, SetCategory] = useState<ICategory[]>([]);
  const [activeSlug, setActiveSlug] = useState<string | null>(null);

  const updateFilter = (key: keyof IFilter, value: any) => {
    const prevValue = filters[key];
    const newValue =
      typeof value === "string" && typeof prevValue === "string"
        ? prevValue.toLowerCase() === value.toLowerCase()
          ? null
          : value
        : prevValue === value
        ? null
        : value;

    const newFilters = {
      ...filters,
      [key]: newValue,
    };

    onFilterChange(newFilters);
  };

  useEffect(() => {
    const FetchData = async () => {
      try {
        if (!categorybyslug || categorybyslug.length === 0) return;

        const currentCategory = categorybyslug[0];
        let targetParentId: string | null = null;

        if (currentCategory.parentId) {
          // Đang ở danh mục con → lấy các danh mục cùng cấp
          targetParentId = currentCategory.parentId;
        } else {
          // Đang ở danh mục cha → lấy danh mục con của nó
          targetParentId = currentCategory._id;
        }

        if (targetParentId) {
          const categoryList = await getAllCategoryChilds(targetParentId);
          SetCategory(categoryList);
        } else {
          SetCategory([]);
        }
      } catch (error) {
        console.log("Lỗi khi lấy thông tin danh mục", error);
        SetCategory([]);
      }
    };
    FetchData();
  }, [categorybyslug]);

  const handleMouseDown = (e: React.MouseEvent, isMin: boolean) => {
    const trackContainer = document.querySelector(".track-container");
    if (!trackContainer) return;

    const rect = trackContainer.getBoundingClientRect();
    const trackWidth = rect.width;

    let tempValue = isMin ? filters.minPrice ?? 99000 : filters.maxPrice ?? 399000;

    const onMouseMove = (event: MouseEvent) => {
      const rawValue = Math.round(
        ((event.clientX - rect.left) / trackWidth) * (399000 - 99000) + 99000
      );

      if (isMin) {
        tempValue = Math.max(
          99000,
          Math.min(rawValue, filters.maxPrice ?? 399000 - 10000)
        );
      } else {
        tempValue = Math.min(
          399000,
          Math.max(rawValue, filters.minPrice ?? 99000 + 10000)
        );
      }

      const dot = isMin
        ? document.querySelector(".vue-slider-dot.track1")
        : document.querySelector(".vue-slider-dot.track2");

      if (dot) {
        const percent = ((tempValue - 99000) / (399000 - 99000)) * 100;
        (dot as HTMLElement).style.left = `${percent}%`;

        const highlight = document.querySelector(".track-highlight");
        if (highlight) {
          const min = isMin ? tempValue : filters.minPrice ?? 99000;
          const max = isMin ? filters.maxPrice ?? 399000 : tempValue;
          const left = ((min - 99000) / (399000 - 99000)) * 100;
          const width = ((max - min) / (399000 - 99000)) * 100;
          (highlight as HTMLElement).style.left = `${left}%`;
          (highlight as HTMLElement).style.width = `${width}%`;
        }
      }
    };

    const onMouseUp = () => {
      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseup", onMouseUp);

      if (isMin) {
        updateFilter("minPrice", tempValue);
      } else {
        updateFilter("maxPrice", tempValue);
      }
    };

    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseup", onMouseUp);
  };

  const adultSizes = ["XS", "S", "M", "L", "XL", "XXL"];
  const kidSizes = ["98", "104", "110", "116", "122", "128", "134", "140"];
  const isAdult = parentSlug === "nam" || parentSlug === "nu";
  const isKid = parentSlug === "be-trai" || parentSlug === "be-gai";
  const currentSizes = isAdult ? adultSizes : isKid ? kidSizes : [];

  const colors = [
    { key: "trắng", image: "trang.png" },
    { key: "đen", image: "den.png" },
    { key: "đỏ", image: "do.png" },
    { key: "be", image: "be.png" },
    { key: "xám", image: "xam.png" },
    { key: "tím", image: "tim.png" },
    { key: "xanh da trời", image: "xanh_da_troi.png" },
    { key: "hồng", image: "hong.png" },
    { key: "xanh lá", image: "xanh_la_cay.png" },
    { key: "vàng", image: "vang.png" },
    { key: "kẻ", image: "ke.png" },
  ];

  return (
    <div className="columns__sidebar columns__sidebar--desktop">
      <div className="filter filter--category">
        <div className="filter__item">
          <div className="filter__item-title">Danh mục sản phẩm</div>
          <div className="filter__item-content">
            <div className="filter__options filter__options--link">
              {category.map((cate) => (
                <a
                  key={cate._id}
                  href={`/page/category/${parentSlug}/${cate.slug}`}
                  className={`filter__option-link ${activeSlug === cate.slug ? "active" : ""}`}
                  onClick={(e) => {
                    e.preventDefault();
                    setActiveSlug(cate.slug);
                    router.push(`/page/category/${parentSlug}/${cate.slug}`);
                  }}
                >
                  {cate.name}
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="filter filter--attribute">
        {/* Kích cỡ */}
        <div className="filter__item">
          <div className="filter__item-title">Kích cỡ</div>
          <div className="filter__item-content">
            <div className="filter__options filter__options--size">
              {currentSizes.map((size) => (
                <div
                  key={size}
                  className={`filter__option-size ${filters.size === size ? "selected" : ""}`}
                  onClick={() => updateFilter("size", size)}
                >
                  {size}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Màu sắc */}
        <div className="filter__item">
          <div className="filter__item-title">Màu sắc</div>
          <div className="filter__item-content">
            <div className="filter__options filter__options--color">
              {colors.map((color) => (
                <div
                  key={color.key}
                  className={`filter__option-color ${
                    filters.color?.toLowerCase() === color.key.toLowerCase() ? "selected" : ""
                  }`}
                  onClick={() => updateFilter("color", color.key)}
                >
                  <div
                    title={color.key}
                    className="filter__option-color--value"
                    style={{
                      backgroundImage: `url("https://2885371169.e.cdneverest.net/pub/media/attribute/swatch/images/${color.image}")`,
                    }}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Khoảng giá */}
        <div className="filter__item">
          <div className="filter__item-title">
            <span>Khoảng giá</span>
          </div>
          <div className="filter__item-content">
            <div className="filter__options filter__options--price price-range">
              <div className="price-range-slide">
                <span className="range-value min">
                  {(filters.minPrice ?? 99000).toLocaleString("vi-VN")}đ
                </span>
                <span className="range-value max">
                  {(filters.maxPrice ?? 399000).toLocaleString("vi-VN")}đ
                </span>

                <div className="track-container">
                  <div className="track" />
                  <div
                    className="track-highlight"
                    style={{
                      left: `${
                        ((filters.minPrice ?? 99000) - 99000) / (399000 - 99000) * 100
                      }%`,
                      width: `${
                        ((filters.maxPrice ?? 399000) - (filters.minPrice ?? 99000)) /
                        (399000 - 99000) *
                        100
                      }%`,
                    }}
                  />
                  <button
                    className="vue-slider-dot track1"
                    style={{
                      left: `${
                        ((filters.minPrice ?? 99000) - 99000) / (399000 - 99000) * 100
                      }%`,
                    }}
                    onMouseDown={(e) => handleMouseDown(e, true)}
                  />
                  <button
                    className="vue-slider-dot track2"
                    style={{
                      left: `${
                        ((filters.maxPrice ?? 399000) - 99000) / (399000 - 99000) * 100
                      }%`,
                    }}
                    onMouseDown={(e) => handleMouseDown(e, false)}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
