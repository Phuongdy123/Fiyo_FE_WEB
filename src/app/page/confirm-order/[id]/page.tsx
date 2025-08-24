"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

export default function ConfirmOrderSuccess() {
  const { id } = useParams(); 
  const [confirmed, setConfirmed] = useState(false);

  useEffect(() => {
    async function confirmOrder() {
      try {
        const res = await fetch(`https://fiyo.click/api/orders/confirm-guess/${id}`, {
          method: "PUT",
        });
        const data = await res.json();
        if (data.status) {
          setConfirmed(true);
        }
      } catch (error) {
        console.error("Lỗi xác nhận:", error);
      }
    }

    if (id) confirmOrder();
  }, [id]);

  return (
    <div className="confirm-wrapper">
      <div className="confirm-box">
        <div className="icon">✅</div>
        <h2>
          {confirmed ? "Đơn hàng đã được xác nhận thành công!" : "Đang xử lý xác nhận..."}
        </h2>
        {confirmed && (
          <p>Cảm ơn bạn đã đặt hàng. Chúng tôi sẽ sớm xử lý và giao đến bạn.</p>
        )}
      </div>
    </div>
  );
}
