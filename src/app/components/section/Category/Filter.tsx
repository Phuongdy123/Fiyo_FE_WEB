"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface ICategory {
  _id: string;
  name: string;
  slug: string;
}

interface FilterProps {
  parentSlug: string;
  category: ICategory[];
}

export default function FilterComponent({ parentSlug, category }: FilterProps) {
  const router = useRouter();
  const [activeSlug, setActiveSlug] = useState<string | null>(null);

  // toggle state
  const [showCategory, setShowCategory] = useState(false);
  const [showSize, setShowSize] = useState(false);
  const [showColor, setShowColor] = useState(false);

  const sizes = ["S", "M", "L", "XL"];
  const colors = ["Đỏ", "Xanh", "Đen", "Trắng"];

  useEffect(() => {
    if (category.length > 0) {
      setActiveSlug(category[0].slug);
    }
  }, [category]);

  return (
    <div className="filter">
      {/* Danh mục sản phẩm */}
      <div className="filter__item">
        <div className="filter__item-title">
          Danh mục sản phẩm
          <button
            className="btn-toggle"
            onClick={() => setShowCategory(!showCategory)}
          >
            {showCategory ? "–" : "+"}
          </button>
        </div>
        {showCategory && (
          <div className="filter__item-content">
            <div className="filter__options filter__options--link">
              {category.map((cate) => (
                <a
                  key={cate._id}
                  href={`/page/category/${parentSlug}/${cate.slug}`}
                  className={`filter__option-link ${
                    activeSlug === cate.slug ? "active" : ""
                  }`}
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
        )}
      </div>

      {/* Kích cỡ */}
      <div className="filter__item">
        <div className="filter__item-title">
          Kích cỡ
          <button
            className="btn-toggle"
            onClick={() => setShowSize(!showSize)}
          >
            {showSize ? "–" : "+"}
          </button>
        </div>
        {showSize && (
          <div className="filter__item-content">
            <div className="filter__options">
              {sizes.map((size) => (
                <label key={size} className="filter__option">
                  <input type="checkbox" />
                  <span>{size}</span>
                </label>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Màu sắc */}
      <div className="filter__item">
        <div className="filter__item-title">
          Màu sắc
          <button
            className="btn-toggle"
            onClick={() => setShowColor(!showColor)}
          >
            {showColor ? "–" : "+"}
          </button>
        </div>
        {showColor && (
          <div className="filter__item-content">
            <div className="filter__options">
              {colors.map((color) => (
                <label key={color} className="filter__option">
                  <input type="checkbox" />
                  <span>{color}</span>
                </label>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
