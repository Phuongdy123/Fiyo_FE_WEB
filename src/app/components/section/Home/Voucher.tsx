
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/context/CAuth";
import { IVoucher } from "@/app/untils/IVoucher";
import { getVoucherByUserId, getAllVoucher } from "@/app/services/Voucher/SVoucher";
import { useToast } from "@/app/context/CToast";

export default function VoucherSection() {
  const { user } = useAuth();
  const userId = user?._id;
  const { showToast } = useToast();
  const router = useRouter();
  const [voucherList, setVoucherList] = useState<IVoucher[]>([]);

  // Format date function for consistent date display
  const formatDate = (dateInput: Date | string | null | undefined) => {
    if (!dateInput) return "Không có";
    const date = typeof dateInput === "string" ? new Date(dateInput) : dateInput;
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  // Format price function for consistent price display
  const formatPrice = (price: number | null | undefined) =>
    (typeof price === "number" && !isNaN(price))
      ? price.toLocaleString("vi-VN") + " ₫"
      : "0 ₫";

  // Fetch vouchers: user-specific if logged in, public if not logged in
  useEffect(() => {
    const fetchVouchers = async () => {
      try {
        let vouchers: IVoucher[] = [];
        if (userId) {
          // Fetch user-specific vouchers if logged in
          const response = await getVoucherByUserId(userId);
          vouchers = response.vouchers || [];
        } else {
          // Fetch public vouchers if not logged in
          vouchers = await getAllVoucher("http://localhost:3000/voucher");
        }
        // Sort vouchers by expired_at (newest first) and take top 3
        const sortedVouchers = vouchers
          .sort((a: IVoucher, b: IVoucher) => {
            const dateA = a.expired_at ? new Date(a.expired_at).getTime() : 0;
            const dateB = b.expired_at ? new Date(b.expired_at).getTime() : 0;
            return dateB - dateA; // Descending order
          })
          .slice(0, 3); // Limit to 3 newest
        setVoucherList(sortedVouchers);
      } catch (error) {
        console.error("Lỗi khi lấy danh sách voucher:", error);
        showToast("Không thể tải danh sách voucher. Vui lòng thử lại!", "error");
      }
    };
    fetchVouchers();
  }, [userId, showToast]);

  // Handle saving voucher with conditional redirection
  const handleSaveVoucher = (voucher: IVoucher) => {
    if (!userId) {
      // Redirect to login page if not logged in
      router.push("/page/login");
      return;
    }
    try {
      // Save to localStorage and sessionStorage if logged in
      const voucherData = JSON.stringify(voucher);
      localStorage.setItem("selectedVoucher", voucherData);
      sessionStorage.setItem("selectedVoucher", voucherData);
      showToast(`Đã lưu mã ${voucher.voucher_code}!`, "success");
      // Redirect to voucher page
      router.push("/page/voucher");
    } catch (error) {
      console.error("Lỗi khi lưu voucher:", error);
      showToast("Không thể lưu mã voucher. Vui lòng thử lại!", "error");
    }
  };

  return (
    <>
      <div className="voucher-card">
        {voucherList.length === 0 ? (
          <div className="voucher-content">
            <div className="voucher-info">
              <div className="voucher-desc">Đang tải voucher...</div>
            </div>
          </div>
        ) : (
          voucherList.map((voucher) => (
            <div className="voucher-content" key={voucher._id}>
              <div className="voucher-info">
                <div className="voucher-title">
                  Voucher {voucher.value}
                  {voucher.type === "percent" ? "%" : "k"}
                </div>
                <div className="voucher-desc">
                  Giảm {voucher.type === "percent" ? `${voucher.value}%` : formatPrice(voucher.value)} cho đơn từ {formatPrice(voucher.min_total)}
                </div>
                <div className="voucher-bottom">
                  <span className="voucher-date">
                    HSD: {formatDate(voucher.expired_at)}
                  </span>
                </div>
              </div>
              <div className="voucher-divider" />
              <div
                className="voucher-action"
                onClick={() => handleSaveVoucher(voucher)}
                style={{ cursor: "pointer" }}
              >
                <span>Lưu Mã</span>
              </div>
            </div>
          ))
        )}
      </div>
    </>
  );
}
