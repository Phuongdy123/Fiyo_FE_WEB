"use client";
import HomeEffectsJs from "@/app/assets/js/home";
import { useState, useEffect } from "react";
import { IProduct } from "@/app/untils/IProduct";
import { getAllProduct } from "@/app/services/SProduct";

export default function HotProductSection() {
  const [listProduct, setListProduct] = useState<IProduct[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        let products: IProduct[] = await getAllProduct("http://fiyo.click/api/products");

        // Lọc sản phẩm có ảnh
        const filtered = products.filter((p) => p.images && p.images.length > 0);

        // Cắt lấy 4 sản phẩm đầu tiên có ảnh
        setListProduct(filtered.slice(0, 4));
      } catch (error) {
        console.error("Error fetching products:", error);
      }
    };
    fetchData();
  }, []);

  return (
    <>
      <div className="title">
        <h2>SẢN PHẨM BÁN CHẠY</h2>
      </div>
      <div className="producthot">
        <div className="banner-producthot">
          <img src="https://media.canifa.com/mega_menu/item/Nam-1-menu-05Mar.webp" />
        </div>
        <div className="producthot-list">
          {listProduct.map((product, index) => (
            <div
              key={index}
              tabIndex={-1}
              className="product-item-box"
              style={{ width: 287 }}
            >
              <div wrapper-tag="div" className="product-item__info">
                <div className="product-item__photo">
                  <div>
                    <a
                      href="#"
                      className="product-item__image"
                      tabIndex={-1}
                      aria-label={product.name}
                    >
                      <img
                        src={product.images[0]}
                        width={415}
                        height={554}
                        alt={product.name}
                        loading="lazy"
                        className="product-image-photo"
                      />
                    </a>
                  </div>
                  <div className="product-item__label--image">
                    <img
                      src="https://2885371169.e.cdneverest.net/pub/media/attribute/swatch/f/r/freeship_taglisting_desktop-02oct.png"
                      width={412}
                      height={50}
                      loading="lazy"
                    />
                  </div>
                  <div className="product-item__button-tocart">
                    <span>Xem nhanh</span>
                  </div>
                </div>
                <div className="product-item__details">
                  <div className="product-item__color">
                    {product.images.slice(0, 4).map((img, i) => (
                      <div
                        key={i}
                        className={`product-item__color-option ${i === 0 ? "selected" : ""}`}
                        style={{ backgroundImage: `url('${img}')` }}
                      />
                    ))}
                  </div>
                  <h4 aria-label={product.name} className="product-item__name">
                    <div>
                      <a href="#" aria-label={product.name} tabIndex={-1}>
                        {product.name}
                      </a>
                    </div>
                  </h4>
                  <div className="product-item__price">
                    <span className="product-item__price--regular">
                      {product.price} ₫
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
