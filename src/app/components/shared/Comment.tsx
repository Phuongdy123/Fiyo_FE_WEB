"use client";

import { useEffect, useState, useMemo } from "react";
import { CommentProps } from "@/app/untils/IComment";

interface CommentComponentProps {
  productId: string;
}

export default function CommentComponent({ productId }: CommentComponentProps) {
  const [comments, setComments] = useState<CommentProps[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    if (!productId) return;

    // Sử dụng AbortController để tránh lỗi update state khi component bị unmount
    const controller = new AbortController();

    const fetchComments = async () => {
      setLoading(true);
      try {
        const res = await fetch(
          `https://fiyo-be.onrender.com/api/review/product/${productId}`,
          { signal: controller.signal }
        );
        const data = await res.json();

        // Xử lý dữ liệu linh hoạt (Array hoặc Object)
        const reviewArray = Array.isArray(data) ? data : data.reviews || (data._id ? [data] : []);

        const formatted = reviewArray.map((review: any) => ({
          user: review.user_id?.name || "Khách hàng",
          avatar: review.user_id?.avatar || "https://i.pravatar.cc/40",
          rating: Number(review.rating) || 5,
          text: review.content || "",
          date: review.createdAt,
          images: Array.isArray(review.images) ? review.images : [],
        }));

        setComments(formatted);
      } catch (err: any) {
        if (err.name !== "AbortError") {
          console.error("Lỗi khi tải bình luận:", err);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchComments();
    return () => controller.abort();
  }, [productId]);

  return (
    <div className="product-info-detailed">
      <div className="item">
        <div className="item-content open">
          {loading ? (
            <div className="comment-loading">Đang tải bình luận...</div>
          ) : comments.length === 0 ? (
            <div className="comment-empty">Chưa có bình luận nào cho sản phẩm này.</div>
          ) : (
            <ul className="comment-list">
              {comments.map((cmt, index) => (
                <CommentItem key={`${cmt.date}-${index}`} cmt={cmt} />
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}

// --- Sub-component để tối ưu re-render và sạch mã nguồn ---

function CommentItem({ cmt }: { cmt: CommentProps }) {
  // Tránh lỗi Hydration bằng cách render ngày tháng an toàn
  const formattedDate = useMemo(() => {
    return new Date(cmt.date).toLocaleDateString("vi-VN");
  }, [cmt.date]);

  return (
    <li className="comment-item">
      <img className="comment-avatar" src={cmt.avatar} alt="avatar" loading="lazy" />
      <div className="comment-body">
        <div className="comment-header">
          <strong>{cmt.user}</strong>
          <span className="comment-date">{formattedDate}</span>
        </div>
        
        {/* Render Rating Stars */}
        <div className="comment-stars">
          {[1, 2, 3, 4, 5].map((star) => (
            <span
              key={star}
              className={`star ${star <= cmt.rating ? "filled" : ""}`}
            >
              ★
            </span>
          ))}
        </div>

        <p className="comment-text">{cmt.text}</p>

        {/* Render Images */}
        {cmt.images.length > 0 && (
          <div className="comment-images">
            {cmt.images.map((img, i) => (
              <img key={i} src={img} alt="review" loading="lazy" />
            ))}
          </div>
        )}
      </div>
    </li>
  );
}