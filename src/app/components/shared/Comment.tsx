"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/app/context/CAuth";
import { CommentProps } from "@/app/untils/IComment";

interface CommentComponentProps {
  productId: string;
}

export default function CommentComponent({ productId }: CommentComponentProps) {
  const { user } = useAuth();
  const [comments, setComments] = useState<CommentProps[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchComments = async () => {
      try {
        const res = await fetch(`http://localhost:3000/review/product/${productId}`);
        const data = await res.json();

        const reviewArray = Array.isArray(data)
          ? data
          : data.reviews || [data];

        const formatted = reviewArray.map((review: any) => ({
          user: review.user_id?.name || "Ẩn danh",
          avatar: review.user_id?.avatar || "https://i.pravatar.cc/40",
          rating: review.rating,
          text: review.content,
          date: review.createdAt,
          images: review.images || [],
        }));

        setComments(formatted);
      } catch (err) {
        console.error("Lỗi khi tải bình luận:", err);
      } finally {
        setLoading(false);
      }
    };

    if (productId) {
      fetchComments();
    }
  }, [productId]);

  return (
    <div className="product-info-detailed">
      <div className="item">
        <div className="item-content open">
          {loading ? (
            <p>Đang tải bình luận...</p>
          ) : comments.length === 0 ? (
            <p>Chưa có bình luận nào cho sản phẩm này.</p>
          ) : (
            <ul className="comment-list">
              {comments.map((cmt, index) => (
                <li className="comment-item" key={index}>
                  <img className="comment-avatar" src={cmt.avatar} alt="avatar" />
                  <div className="comment-body">
                    <div className="comment-header">
                      <strong>{cmt.user}</strong>
                      <span className="comment-date">
                        {new Date(cmt.date).toLocaleDateString("vi-VN")}
                      </span>
                    </div>
                    <div className="comment-stars">
                      {[1, 2, 3, 4, 5].map((i) => (
                        <span
                          key={i}
                          className={`star ${i <= cmt.rating ? "filled" : ""}`}
                        >
                          ★
                        </span>
                      ))}
                    </div>
                    <p>{cmt.text}</p>
                    {cmt.images.length > 0 && (
                      <div className="comment-images">
                        {cmt.images.map((img, i) => (
                          <img key={i} src={img} alt="product-review" />
                        ))}
                      </div>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
