"use client";

import { useMemo } from "react";
import Link from "next/link";
import { IProduct } from "@/app/untils/IProduct";
import HomeEffectsJs from "@/app/assets/js/home";

export default function ProductItem({ product }: { product: IProduct }) {
  // 1. Chặn render sớm
  if (!product?.name || !product?.images?.length || product.isHidden) return null;

  // 2. Tối ưu logic tính toán giá bằng useMemo
  const { showSale, salePrice, discountPercent } = useMemo(() => {
    const isSaleValid =
      typeof product.sale === "number" &&
      product.sale > 0 &&
      product.sale < product.price;
    
    return {
      showSale: isSaleValid,
      salePrice: isSaleValid ? product.sale! : product.price,
      discountPercent: isSaleValid 
        ? Math.round(((product.price - product.sale!) / product.price) * 100) 
        : 0,
    };
  }, [product.price, product.sale]);

  // Style dùng chung để code gọn hơn
  const commonStyle: React.CSSProperties = { userSelect: "none", caretColor: "transparent" };

  return (
    <div className="product-item" tabIndex={-1} style={commonStyle}>
      <div className="product-item__info">
        {/* PHOTO SECTION */}
        <div className="product-item__photo">
          <Link href={`/page/detail/${product._id}`} className="product-item__image">
            <img
              src={product.images[0]}
              width={415}
              height={554}
              alt={product.name}
              loading="lazy"
              className="product-image-photo"
              style={commonStyle}
            />
          </Link>
          
          <div className="product-item__label--image">
            <img
              src="https://2885371169.e.cdneverest.net/pub/media/attribute/swatch/f/r/freeship_taglisting_desktop-02oct.png"
              width={412}
              height={50}
              loading="lazy"
              alt="Freeship Tag"
              style={commonStyle}
            />
          </div>

          <div className="product-item__button-tocart">
            <span tabIndex={-1} style={commonStyle}>Xem nhanh</span>
          </div>
        </div>

        {/* DETAILS SECTION */}
        <div className="product-item__details">
          {/* Tối ưu danh sách màu sắc bằng vòng lặp */}
          <div className="product-item__color">
            {product.images.slice(0, 4).map((img, index) => (
              <div
                key={index}
                className={`product-item__color-option ${index === 0 ? "selected" : ""}`}
                style={{
                  backgroundImage: `url("${img}")`,
                  ...commonStyle,
                }}
              />
            ))}
            <span className="product-item__color-viewall" tabIndex={-1} style={commonStyle}>
              <span />
            </span>
          </div>

          <h4 className="product-item__name" aria-label={product.name}>
            <div>
              <Link href={`/page/detail/${product._id}`} tabIndex={-1} style={commonStyle}>
                {product.name}
              </Link>
            </div>
          </h4>

          <div className="product-item__price">
            <span className="product-item__price--normal">
              {salePrice.toLocaleString("vi-VN")} ₫
            </span>
            
            {showSale && (
              <>
                <span className="product-item__price--percent">-{discountPercent}%</span>
                <span className="product-item__price--old">
                  {product.price.toLocaleString("vi-VN")} ₫
                </span>
              </>
            )}
          </div>
        </div>
      </div>
      <HomeEffectsJs />
    </div>
  );
}