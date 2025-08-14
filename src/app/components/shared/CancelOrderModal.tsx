"use client";
import { useState } from "react";
import "@/app/";

interface CancelOrderModalProps {
  orderId: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function CancelOrderModal({
  orderId,
  isOpen,
  onClose,
  onSuccess,
}: CancelOrderModalProps) {
  const [reason, setReason] = useState("");
  const [otherReason, setOtherReason] = useState("");

  const reasons = [
    "Tôi muốn thay đổi địa chỉ giao hàng",
    "Tôi tìm thấy giá rẻ hơn ở nơi khác",
    "Tôi không muốn mua nữa",
    "Người bán yêu cầu hủy",
    "Khác",
  ];

  const handleCancel = async () => {
    try {
      const res = await fetch(`/api/orders/${orderId}/cancel`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cancel_reason: reason === "Khác" ? otherReason : reason,
        }),
      });

      if (!res.ok) throw new Error("Hủy đơn thất bại");

      alert("Hủy đơn thành công");
      if (onSuccess) onSuccess();
      onClose();
    } catch (error) {
      alert("Hủy đơn thất bại");
    }
  };

  return (
    <>
      {isOpen && <div className="cancel-overlay" onClick={onClose} />}

      <div className={`cancel-modal ${isOpen ? "show" : ""}`}>
        <div className="cancel-header">
          <div className="cancel-handle"></div>
          <h2>Lý do hủy đơn</h2>
        </div>

        <div className="cancel-body">
          {reasons.map((r) => (
            <label key={r} className="cancel-option">
              <input
                type="radio"
                name="cancel_reason"
                value={r}
                checked={reason === r}
                onChange={() => setReason(r)}
              />
              {r}
            </label>
          ))}

          {reason === "Khác" && (
            <textarea
              className="cancel-textarea"
              placeholder="Nhập lý do khác..."
              value={otherReason}
              onChange={(e) => setOtherReason(e.target.value)}
            />
          )}
        </div>

        <div className="cancel-footer">
          <button onClick={onClose} className="btn btn-secondary">
            Đóng
          </button>
          <button onClick={handleCancel} className="btn btn-danger">
            Xác nhận hủy
          </button>
        </div>
      </div>
    </>
  );
}
