'use client';
import { useState } from "react";
import "@/app/assets/css/cancel.css";
import { useToast } from "@/app/context/CToast";

interface CancelOrderModalProps {
  orderId: string;        // _id của OrderShop (đơn con)
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void; // callback để reload lại dữ liệu nếu cần
}

export default function CancelOrderModal({
  orderId,
  isOpen,
  onClose,
  onSuccess,
}: CancelOrderModalProps) {
  const [reason, setReason] = useState("");
  const [otherReason, setOtherReason] = useState("");
  const [loading, setLoading] = useState(false);
  const { showToast } = useToast();

  const reasons = [
    "Tôi muốn thay đổi địa chỉ giao hàng",
    "Tôi tìm thấy giá rẻ hơn ở nơi khác",
    "Tôi không muốn mua nữa",
    "Người bán yêu cầu hủy",
    "Khác",
  ];

  const handleCancel = async () => {
    const note = reason === "Khác" ? otherReason.trim() : reason;

    if (!note) {
      showToast("Vui lòng chọn hoặc nhập lý do hủy", "error");
      return;
    }
    if (!orderId) {
      showToast("Thiếu mã đơn để hủy", "error");
      return;
    }

    try {
      setLoading(true);

      // Gọi API hủy đơn con
      const res = await fetch(`https://fiyo.click/api/orderShop/${orderId}/cancel`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ note }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok || data?.status === false) {
        throw new Error(data?.message || "Hủy đơn thất bại");
      }

      // ✅ Toast thành công
      showToast("Đơn hàng đã được hủy thành công", "success");

      // Cho phép trang cha refresh lại dữ liệu
      onSuccess?.();
      onClose();
    } catch (error: any) {
      showToast(error?.message || "Hủy đơn thất bại", "error");
    } finally {
      setLoading(false);
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
                disabled={loading}
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
              disabled={loading}
            />
          )}
        </div>

        <div className="cancel-footer">
          <button onClick={onClose} className="btn btn-secondary" disabled={loading}>
            Đóng
          </button>
          <button onClick={handleCancel} className="btn btn-danger" disabled={loading}>
            {loading ? "Đang hủy..." : "Xác nhận hủy"}
          </button>
        </div>
      </div>
    </>
  );
}
