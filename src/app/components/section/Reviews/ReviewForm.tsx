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
  onSubmit?: (data: {
    productId: string;
    rating: number;
    content: string;
    images: File[];
  }) => void; // tuỳ chọn: thông báo lên cha khi 1 item gửi xong
}

type PerProductForm = { rating: number; content: string; images: File[] };

export default function SectionReviewForm({
  show,
  onClose,
  products,
  onSubmit,
}: Props) {
  const [formData, setFormData] = useState<Record<string, PerProductForm>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [reviewedProducts, setReviewedProducts] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);

  // Lọc sản phẩm trùng theo _id
  const uniqueProducts: Product[] = Array.from(
    new Map(products.map((p) => [p._id, p])).values()
  );

  // Kiểm tra sản phẩm đã đánh giá hay chưa (theo user & product)
  useEffect(() => {
    const checkReviewed = async () => {
      const result: string[] = [];
      for (let i = 0; i < uniqueProducts.length; i++) {
        const product = uniqueProducts[i];
        try {
          const res = await fetch(
            `http://localhost:3000/api/review/check/${product._id}/${product.user_id}`
          );
          const data = await res.json();
          if (data?.reviewed) result.push(product._id);
        } catch {
          // bỏ qua lỗi lẻ
        }
      }
      setReviewedProducts(result);
    };
    if (show && uniqueProducts.length) checkReviewed();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [show, products]);

  // Khởi tạo form mặc định cho tất cả sản phẩm: 5 sao + nội dung "Tốt"
  useEffect(() => {
    if (show && uniqueProducts.length) {
      const init: Record<string, PerProductForm> = {};
      uniqueProducts.forEach((p) => {
        init[p._id] = { rating: 5, content: "Tốt", images: [] };
      });
      setFormData(init);
      setErrors({});
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [show, products]);

  // ESC để đóng popup
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (show) document.addEventListener("keydown", handleEsc);
    return () => document.removeEventListener("keydown", handleEsc);
  }, [show, onClose]);

  if (!show) return null;

  // === helper: POST 1 review lên BE (ảnh KHÔNG bắt buộc) ===
  async function postOneReview(
    p: Product,
    v: { rating: number; content: string; images: File[] }
  ) {
    const fd = new FormData();
    fd.append("product_id", p._id);
    fd.append("user_id", p.user_id);                 // nếu BE cần user_id
    fd.append("order_detail_id", p.order_detail_id); // nếu BE cần liên kết order detail
    fd.append("rating", String(v.rating ?? 5));
    fd.append("content", v.content || "Tốt");
    (v.images || []).forEach((file) => fd.append("images", file));

    const res = await fetch("http://localhost:3000/api/review", {
      method: "POST",
      body: fd,
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data?.message || "Gửi đánh giá thất bại");
    }
    return data;
  }

  // === GỬI CHUNG CHO TẤT CẢ SẢN PHẨM CHƯA ĐÁNH GIÁ ===
  const handleSubmitAll = async () => {
    if (submitting) return;

    // Lọc sản phẩm chưa đánh giá
    const toSend = uniqueProducts.filter(
      (p) => !reviewedProducts.includes(p._id)
    );
    if (!toSend.length) {
      // Không còn gì để gửi
      return;
    }

    // Reset lỗi
    const newErrors: Record<string, string> = {};

    // Validate ảnh (<= 5) — ảnh KHÔNG bắt buộc
    for (let i = 0; i < toSend.length; i++) {
      const p = toSend[i];
      const v = formData[p._id] || { rating: 5, content: "Tốt", images: [] };
      if ((v.images?.length || 0) > 5) {
        newErrors[p._id] = "Không được gửi quá 5 ảnh.";
      }
    }

    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    setSubmitting(true);
    try {
      // Gửi lần lượt — đảm bảo BE nhận đủ từng cái
      for (let i = 0; i < toSend.length; i++) {
        const p = toSend[i];
        const v = formData[p._id] || { rating: 5, content: "Tốt", images: [] };

        await postOneReview(p, v);

        // (tuỳ chọn) thông báo cho cha biết 1 item đã gửi xong
        try {
          onSubmit?.({
            productId: p._id,
            rating: v.rating ?? 5,
            content: v.content || "Tốt",
            images: v.images || [],
          });
        } catch {
          // ignore
        }

        // đánh dấu đã đánh giá để disable UI phần đó
        setReviewedProducts((prev) => {
          const merged = prev.concat(p._id);
          // tránh lỗi target ES5 (không dùng spread trên Set)
          return Array.from(new Set(merged));
        });
      }

      // (tuỳ chọn) đóng form sau khi gửi xong tất cả
      // onClose();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="overlay">
      <div className="review-form-popup multi">
        <span className="close-btn" onClick={onClose}>
          ×
        </span>
        <h2 className="popup-title">Đánh giá sản phẩm</h2>

        {uniqueProducts.map((product) => {
          const value =
            formData[product._id] || { rating: 5, content: "Tốt", images: [] };
          const already = reviewedProducts.includes(product._id);

          return (
            <div key={product._id} className="product-review-block">
              <div
                className="product-info"
                style={{ alignItems: "center", gap: 12 }}
              >
                <img
                  src={product.image}
                  width={80}
                  height={100}
                  alt={product.name}
                />
                <div style={{ display: "flex", flexDirection: "column" }}>
                  <div>{product.name}</div>
                  {already && (
                    <small style={{ color: "green", fontStyle: "italic" }}>
                      Đã đánh giá
                    </small>
                  )}
                </div>
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
                        opacity: already ? 0.6 : 1,
                        pointerEvents: already ? ("none" as const) : ("auto" as const),
                      }}
                      onClick={() =>
                        setFormData((prev) => ({
                          ...prev,
                          [product._id]: {
                            ...(prev[product._id] || {
                              rating: 5,
                              content: "Tốt",
                              images: [],
                            }),
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
                  value={value.content || "Tốt"}
                  placeholder="Tốt"
                  disabled={already}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      [product._id]: {
                        ...(prev[product._id] || {
                          rating: 5,
                          content: "Tốt",
                          images: [],
                        }),
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
                  disabled={already}
                  onChange={(e) => {
                    const files = Array.from(e.target.files || []);
                    if (files.length > 5) {
                      setErrors((prev) => ({
                        ...prev,
                        [product._id]: "Không được chọn quá 5 ảnh.",
                      }));
                    } else {
                      setErrors((prev) => ({ ...prev, [product._id]: "" }));
                      setFormData((prev) => ({
                        ...prev,
                        [product._id]: {
                          ...(prev[product._id] || {
                            rating: 5,
                            content: "Tốt",
                            images: [],
                          }),
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

              <hr />
            </div>
          );
        })}

        {/* Nút GỬI CHUNG cho tất cả sản phẩm chưa đánh giá */}
        <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
          <button className="btn-secondary" type="button" onClick={onClose}>
            Hủy
          </button>
          <button
            className="btn-primary"
            type="button"
            onClick={handleSubmitAll}
            disabled={
              submitting ||
              uniqueProducts.every((p) => reviewedProducts.includes(p._id))
            }
          >
            {submitting ? "Đang gửi..." : "Gửi đánh giá"}
          </button>
        </div>
      </div>
    </div>
  );
}
