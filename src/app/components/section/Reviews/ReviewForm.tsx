"use client";

import { useEffect, useState } from "react";
import "@/app/assets/css/account-detail.css";

interface Product {
  _id: string;
  name: string;
  image: string;
  order_detail_id: string;
  user_id: string;
}

interface Props {
  show: boolean;
  onClose: () => void;
  products: Product[];
  onSubmit: (data: {
    productId: string;
    rating: number;
    content: string;
    images: File[];
  }) => void;
}

export default function SectionReviewForm({
  show,
  onClose,
  products,
  onSubmit,
}: Props) {
  const [formData, setFormData] = useState<
    Record<string, { rating: number; content: string; images: File[] }>
  >({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [reviewedProducts, setReviewedProducts] = useState<string[]>([]);

  // Lọc sản phẩm trùng (dựa theo _id)
  const uniqueProducts = Array.from(
    new Map(products.map((item) => [item._id, item])).values()
  );

  useEffect(() => {
    const checkReviewed = async () => {
      const result: string[] = [];
      for (const product of uniqueProducts) {
        const res = await fetch(
          `http://fiyo.click/api/review/check/${product._id}/${product.user_id}`
        );
        const data = await res.json();
        if (data.reviewed) result.push(product._id);
      }
      setReviewedProducts(result);
    };
    if (show && uniqueProducts.length) checkReviewed();
  }, [show, products]);

  useEffect(() => {
    if (show && uniqueProducts.length) {
      const init: any = {};
      uniqueProducts.forEach((p) => {
        init[p._id] = { rating: 5, content: "", images: [] };
      });
      setFormData(init);
      setErrors({});
    }
  }, [show, products]);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (show) document.addEventListener("keydown", handleEsc);
    return () => document.removeEventListener("keydown", handleEsc);
  }, [show]);

  if (!show) return null;

  return (
    <div className="overlay">
      <div className="review-form-popup multi">
        <span className="close-btn" onClick={onClose}>
          ×
        </span>
        <h2 className="popup-title">Đánh giá sản phẩm</h2>

        {uniqueProducts.map((product) => {
          const value = formData[product._id] || {};
          return (
            <div key={product._id} className="product-review-block">
              <div className="product-info">
                <img
                  src={product.image}
                  width={80}
                  height={100}
                  alt={product.name}
                />
                <div>{product.name}</div>
              </div>

              <div className="form-group">
                <label>Đánh giá sao</label>
                <div
                  className="rating-stars"
                  style={{ display: "flex", gap: 8 }}
                >
                  {[1, 2, 3, 4, 5].map((v) => (
                    <span
                      key={v}
                      className="star"
                      style={{
                        fontSize: 24,
                        cursor: "pointer",
                        color: v <= value.rating ? "#ffc107" : "#ccc",
                      }}
                      onClick={() =>
                        setFormData((prev) => ({
                          ...prev,
                          [product._id]: {
                            ...prev[product._id],
                            rating: v,
                          },
                        }))
                      }
                    >
                      ★
                    </span>
                  ))}
                </div>
              </div>

              <div className="form-group">
                <label>Nội dung đánh giá</label>
                <textarea
                  className="form-control"
                  rows={3}
                  value={value.content || ""}
                  placeholder="Sản phẩm tốt"
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      [product._id]: {
                        ...prev[product._id],
                        content: e.target.value,
                      },
                    }))
                  }
                />
              </div>

              <div className="form-group">
                <label>Hình ảnh (tối đa 5 ảnh)</label>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={(e) => {
                    const files = Array.from(e.target.files || []);
                    if (files.length > 5) {
                      setErrors((prev) => ({
                        ...prev,
                        [product._id]: "Không được chọn quá 5 ảnh.",
                      }));
                    } else {
                      setErrors((prev) => ({
                        ...prev,
                        [product._id]: "",
                      }));
                      setFormData((prev) => ({
                        ...prev,
                        [product._id]: {
                          ...prev[product._id],
                          images: files,
                        },
                      }));
                    }
                  }}
                />
                {errors[product._id] && (
                  <div style={{ color: "red", marginTop: 4 }}>
                    {errors[product._id]}
                  </div>
                )}
              </div>

              <div className="form-group">
                <button
                  className="btn-primary btn-save"
                  type="button"
                  disabled={reviewedProducts.includes(product._id)}
                  onClick={() => {
                    if (!reviewedProducts.includes(product._id)) {
                      if ((value.images?.length || 0) > 5) {
                        setErrors((prev) => ({
                          ...prev,
                          [product._id]: "Không được gửi quá 5 ảnh.",
                        }));
                        return;
                      }

                      onSubmit({
                        productId: product._id,
                        rating: value.rating,
                        content: value.content,
                        images: value.images,
                      });

                      setErrors((prev) => ({
                        ...prev,
                        [product._id]: "",
                      }));
                    }
                  }}
                >
                  {reviewedProducts.includes(product._id)
                    ? "Đã đánh giá"
                    : "Gửi đánh giá"}
                </button>
              </div>

              <hr />
            </div>
          );
        })}
      </div>
    </div>
  );
}
