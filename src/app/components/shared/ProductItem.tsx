"use client";
import HomeEffectsJs from "@/app/assets/js/home";
import { useState, useEffect } from "react";
import Link from "next/link";
import { IProduct } from "@/app/untils/IProduct";

export default function ProductItem({ product }: { product: IProduct }) {
  // Chặn render nếu thiếu tên, ảnh hoặc bị ẩn
  if (!product?.name || !product?.images || product.images.length === 0 || product.isHidden)
    return null;

  // Kiểm tra nếu có giá sale hợp lệ
  const showSale =
    typeof product.sale === "number" &&
    product.sale > 0 &&
    product.sale < product.price;
  const salePrice = showSale ? product.sale : product.price;

  return (
    <>
      <div
        tabIndex={-1}
        className="product-item"
        style={{ userSelect: "none", caretColor: "transparent" }}
      >
        <div wrapper-tag="div" className="product-item__info">
          <div className="product-item__photo">
            <div>
              <Link
                href={`/page/detail/${product._id}`}
                className="product-item__image"
              >
                <img
                  src={`${product.images?.[0]}`}
                  width={415}
                  height={554}
                  alt={product.name}
                  loading="lazy"
                  className="product-image-photo"
                  style={{ userSelect: "none", caretColor: "transparent" }}
                />
              </Link>
            </div>
            <div className="product-item__label--image">
              <img
                src="https://2885371169.e.cdneverest.net/pub/media/attribute/swatch/f/r/freeship_taglisting_desktop-02oct.png"
                width={412}
                height={50}
                loading="lazy"
                style={{ userSelect: "none", caretColor: "transparent" }}
              />
            </div>
            <div className="product-item__button-tocart">
              <span
                tabIndex={-1}
                style={{ userSelect: "none", caretColor: "transparent" }}
              >
                Xem nhanh
              </span>
            </div>
          </div>
          <div className="product-item__details">
            <div className="product-item__color">
              <div
                className="product-item__color-option selected"
                style={{
                  backgroundImage: `url("${product.images?.[1]}")`,
                  userSelect: "none",
                  caretColor: "transparent",
                }}
              />
              <div
                className="product-item__color-option"
                style={{
                  backgroundImage: `url("${product.images?.[2]}")`,
                  userSelect: "none",
                  caretColor: "transparent",
                }}
              />
              <div
                className="product-item__color-option"
                style={{
                  backgroundImage: `url("${product.images?.[3]}")`,
                  userSelect: "none",
                  caretColor: "transparent",
                }}
              />
              <div
                className="product-item__color-option"
                style={{
                  backgroundImage: `url("${product.images?.[0]}")`,
                  userSelect: "none",
                  caretColor: "transparent",
                }}
              />
              <span
                className="product-item__color-viewall"
                tabIndex={-1}
                style={{ userSelect: "none", caretColor: "transparent" }}
              >
                <span></span>
              </span>
            </div>
            <h4
              aria-label="Áo phông unisex người lớn"
              className="product-item__name"
            >
              <div>
                <a
                  href="#"
                  aria-label="Áo phông unisex người lớn"
                  tabIndex={-1}
                  style={{ userSelect: "none", caretColor: "transparent" }}
                >
                  {product.name}
                </a>
              </div>
            </h4>
            <div className="product-item__price">
              {showSale ? (
                <>
                  <span className="product-item__price--normal">
                    {salePrice.toLocaleString("vi-VN")} ₫
                  </span>
                  <span className="product-item__price--percent">
                    -{Math.round(((product.price - salePrice) / product.price) * 100)}%
                  </span>
                  <span className="product-item__price--old">
                    {product.price.toLocaleString("vi-VN")} ₫
                  </span>
                </>
              ) : (
                <span className="product-item__price--normal">
                  {product.price.toLocaleString("vi-VN")} ₫
                </span>
              )}
            </div>
          </div>
        </div>
        <HomeEffectsJs />
      </div>
    </>
  );
}
