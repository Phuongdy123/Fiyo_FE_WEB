"use client";

import { useState, useEffect } from "react";
import { IVariant, IProductVariant, IProduct } from "@/app/untils/IProduct";
import { useCart } from "@/app/context/Ccart";
import { useWishlist } from "@/app/context/CWishlist";
import { useToast } from "@/app/context/CToast";
import AddToCartPopup from "@/app/components/shared/CartNoffication";
import HomeEffectsJs from "@/app/effects/home";
import DetailEffect from "@/app/effects/detail";
import CommentComponent from "../../shared/Comment";

export default function DetailSection({ product }: { product: IProduct }) {
  const { addToCart } = useCart();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  const { showToast } = useToast();

  const [showAddPopup, setShowAddPopup] = useState(false);
  const isFavorite = isInWishlist(product._id);
  const [productVariants, setProductVariants] = useState<IVariant[]>([]);
  const [selectedVariant, setSelectedVariant] = useState<IVariant | null>(null);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [isDescriptionOpen, setIsDescriptionOpen] = useState(false);
  const [isMaterialOpen, setIsMaterialOpen] = useState(false);
  const [isCommentOpen, setIsCommentOpen] = useState(false);

  const getColorStyle = (color: string) => {
    const lowerColor = color.toLowerCase();
    if (lowerColor.includes("đen")) return { backgroundColor: "#000000" };
    if (lowerColor.includes("hồng")) return { backgroundColor: "#f9c5d1" };
    if (lowerColor.includes("trắng")) return { backgroundColor: "#ffffff" };
    if (lowerColor.includes("xám")) return { backgroundColor: "#808080" };
    if (lowerColor.includes("xanh dương kẻ sọc")) return { backgroundColor: "#1e90ff" };
    if (lowerColor.includes("xanh họa tiết")) return { backgroundColor: "#87ceeb" };
    if (lowerColor.includes("trắng họa tiết")) return { backgroundColor: "#f5f5f5" };
    if (lowerColor.includes("vàng kẻ sọc")) return { backgroundColor: "#ffeb3b" };
    if (lowerColor.includes("xanh dương")) return { backgroundColor: "#1e90ff" };
    if (lowerColor.includes("be kẻ sọc")) return { backgroundColor: "#f5f5dc" };
    if (lowerColor.includes("tím")) return { backgroundColor: "#dda0dd" };
    if (lowerColor.includes("đỏ")) return { backgroundColor: "#ff0000" };
    if (lowerColor.includes("vàng")) return { backgroundColor: "#ffd700" };
    return { backgroundColor: "#cccccc" }; // màu mặc định
  };

  useEffect(() => {
    async function fetchVariants() {
      try {
        const response = await fetch(`https://fiyo.click/api/variant/products/${product._id}`);
        const data: IProductVariant[] = await response.json();
        const variants = data[0]?.variants || [];
        setProductVariants(variants);
        if (variants.length > 0) {
          setSelectedVariant(variants[0]);
        }
      } catch (error) {
        console.error("Lỗi khi lấy biến thể:", error);
        showToast("Lỗi khi tải biến thể sản phẩm!", "error");
      }
    }
    fetchVariants();
  }, [product._id, showToast]);

  const showSale = typeof product.sale === "number" && product.sale > 0;
  const salePrice = showSale ? product.price * (1 - product.sale / 100) : product.price;

  const handleAddToCart = () => {
    if (!selectedVariant) {
      showToast("Vui lòng chọn màu sắc!", "error");
      return;
    }
    if (!selectedSize) {
      showToast("Vui lòng chọn size!", "error");
      return;
    }

    const selectedSizeObject = selectedVariant.sizes.find((s) => s.size === selectedSize);
    if (!selectedSizeObject) {
      showToast("Không tìm thấy size đã chọn!", "error");
      return;
    }

    addToCart({
      id: product._id,
      name: product.name,
      price: showSale ? salePrice : product.price,
      image: product.images?.[0],
      variant: selectedVariant.color,
      size: selectedSize,
      size_id: selectedSizeObject._id,
      quantity: 1,
      variant_id: selectedVariant._id,
      quantity_Product: selectedSizeObject.quantity,
    });
    setShowAddPopup(true);
    showToast("Đã thêm vào giỏ hàng!", "success");
  };

  return (
    <>
      <div className="page-product-top">
        <div className="product-media">
          <div className="product-box--left">
            <div className="product-main-image">
              <img src={`${product.images?.[0]}`} alt="Product Image" />
            </div>
            <button id="back-btn" className="swiper-button-prev" />
            <button id="next-btn" className="swiper-button-next" />
            <div className="product-more-image">
              <div className="more-images">
                <img src={`${product.images?.[1]}`} alt="Product Image" />
              </div>
              <div className="more-images">
                <img src={`${product.images?.[2]}`} alt="Product Image" />
              </div>
              <div className="more-images">
                <img src={`${product.images?.[0]}`} alt="Product Image" />
              </div>
              <div className="more-images">
                <img src={`${product.images?.[0]}`} alt="Product Image" />
              </div>
            </div>
          </div>
          <div className="product-detail-detail">
            <div className="product-detail-name">{product.name}</div>
            <div className="product-code">
              SKU: {selectedVariant && selectedSize ? selectedVariant.sizes.find((s) => s.size === selectedSize)?.sku : "Vui lòng chọn size"}
            </div>
            <div className="product-price-box">
              <div className="price-box">
                <div className="normal-price">
                  <span className="price">
                    {(showSale ? salePrice : product.price).toLocaleString("vi-VN")} ₫
                  </span>
                </div>
                {showSale && product.sale > 0 && (
                  <span className="old-price">
                    <span className="price-original">
                      {product.price.toLocaleString("vi-VN")} ₫
                    </span>
                  </span>
                )}
              </div>
            </div>
            {showSale && (
              <div className="product-label" style={{ color: "rgb(209, 7, 7) !important" }}>
                Giá tốt
              </div>
            )}
            <div className="product-swatch-opt">
              <div className="swatch-attribute">
                <span className="swatch-attribute-label">Màu sắc:</span>
                {selectedVariant && (
                  <>
                    <span className="swatch-attribute-selected-option ml-1">
                      {selectedVariant.color}
                    </span>
                    <span />
                  </>
                )}
                <div className="swatch-attribute-options">
                  {productVariants.map((variant) => (
                    <div
                      key={variant._id}
                      className={`swatch-option color ${selectedVariant?._id === variant._id ? "selected" : ""}`}
                    >
                      <a
                        href="#"
                        className="swatch-option-link"
                        style={getColorStyle(variant.color)}
                        onClick={(e) => {
                          e.preventDefault();
                          setSelectedVariant(variant);
                          setSelectedSize(null); // Reset size khi đổi màu
                        }}
                      />
                    </div>
                  ))}
                </div>
              </div>
              {selectedVariant && (
                <div className="product-swatch-opt">
                  <div className="swatch-attribute">
                    <span className="swatch-attribute-label">Size:</span>
                    <div className="swatch-attribute-options">
                      {selectedVariant.sizes.map((size) => (
                        <div
                          key={size._id}
                          className={`swatch-option size ${selectedSize === size.size ? "selected" : ""}`}
                          onClick={() => setSelectedSize(size.size)}
                          style={{ cursor: "pointer" }}
                        >
                          <a href="#" className="swatch-option-link" onClick={(e) => e.preventDefault()}>
                            {size.size}
                          </a>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="product-options-actions">
                    <div className="addtocart-box">
                      <button type="submit" className="action action-tocart" onClick={handleAddToCart}>
                        <span>Thêm vào giỏ</span>
                      </button>
                      <button
                        type="button"
                        className="action action-store"
                        onClick={() => {
                          if (isFavorite) {
                            removeFromWishlist(product._id);
                            showToast("Đã xóa khỏi danh sách yêu thích!", "success");
                          } else {
                            addToWishlist({
                              _id: product._id,
                              name: product.name,
                              image: product.images?.[0] || "",
                              price: product.price,
                            });
                            showToast("Đã thêm vào danh sách yêu thích!", "success");
                          }
                        }}
                      >
                        <span>{isFavorite ? "Đã yêu thích" : "Thêm vào yêu thích"}</span>
                      </button>
                    </div>
                  </div>
                  <div className="product-info-detailed">
                    <div className="item">
                      <div
                        className={`item-title ${isDescriptionOpen ? "expanded" : ""}`}
                        onClick={() => setIsDescriptionOpen(!isDescriptionOpen)}
                      >
                        Mô tả
                      </div>
                      <div
                        className={`item-content ${isDescriptionOpen ? "open" : ""}`}
                      >
                        {product.description}
                      </div>
                    </div>
                  </div>
                  <div className="product-info-detailed">
                    <div className="item">
                      <div
                        className={`item-title ${isMaterialOpen ? "expanded" : ""}`}
                        onClick={() => setIsMaterialOpen(!isMaterialOpen)}
                      >
                        Chất liệu
                      </div>
                      <div
                        className={`item-content ${isMaterialOpen ? "open" : ""}`}
                      >
                        {product.material}
                      </div>
                    </div>
                  </div>
                  <div className="product-info-detailed">
                    <div className="item">
                      <div
                        className={`item-title ${isCommentOpen ? "expanded" : ""}`}
                        onClick={() => setIsCommentOpen((prev) => !prev)}
                      >
                        Bình luận
                      </div>
                      <div
                        className={`item-content ${isCommentOpen ? "open" : ""}`}
                      >
                        {isCommentOpen && <CommentComponent productId={product._id} />}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      {showAddPopup && (
        <AddToCartPopup
          image={product.images?.[0]}
          onClose={() => setShowAddPopup(false)}
        />
      )}
      <HomeEffectsJs />
      <DetailEffect />
    </>
  );
}