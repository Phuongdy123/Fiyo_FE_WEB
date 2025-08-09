"use client";
import "@/app/assets/css/account.css";
import AccountEffects from "@/app/assets/js/account";
import { useEffect, useState } from "react";
import LogoutComponent from "../../components/shared/Logout";
import AccountSiteBar from "@/app/components/shared/AccountSiteBar";
import { IVoucher } from "@/app/untils/IVoucher";
import { getVoucherByUserId } from "@/app/services/Voucher/SVoucher";
import { useAuth } from "@/app/context/CAuth";

export default function VoucherPage() {
  const [voucher, setVoucher] = useState<IVoucher[]>([]);
  const user = useAuth();
  const user_id =user.user?._id;


  useEffect(() => {
    const fetchData = async () => {
      try {
        if (!user_id) return;

        const { vouchers } = await getVoucherByUserId(user_id);
        setVoucher(vouchers);
        console.log(vouchers);
      } catch (error) {
        console.log("Lỗi khi lấy danh sách voucher!", error);
      }
    };
    fetchData();
  }, [user_id ]);

  const formatDate = (dateInput: Date | string | null | undefined) => {
    if (!dateInput) return "";
    const date = typeof dateInput === "string" ? new Date(dateInput) : dateInput;
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  return (
    <>
      <LogoutComponent />
      <div className="account-page">
        <div className="account-container">
          <div className="account-main account-main-information">
            <div className="account-information">
              <div className="account-mobile__header">
                <div className="account-mobile__back">
                  <span className="screen-reader-text">Back</span>
                </div>
                <h1 className="account-mobile__title">Thông tin tài khoản</h1>
              </div>
              <div className="account-information__header account__page-header account__page-header--desktop">
                <h1 className="account-information__title">Mã ưu đãi</h1>
              </div>

              <span className="account-information__content">
                <h2 className="voucher__content-title">Mã ưu đãi của bạn</h2>
                <h2>
                  <div className="box-voucher">
                    {voucher.map((vc) => (
                      <div className="voucher" key={vc._id}>
                        <h3>{vc.voucher_code}</h3>
                        <p>{vc.type || "Không có mô tả"}</p>
                        <div className="voucher-code">{vc.voucher_code}</div>
                        <div className="voucher-detail">
                          <p className="expiry">HSD: {formatDate(vc.expired_at)}</p>
                          <span className="condition">Đơn tối thiểu: {vc.min_total?.toLocaleString()}đ</span>
                          <div className="add-icon">+</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </h2>
              </span>
            </div>
          </div>
          <AccountSiteBar />
        </div>
      </div>

      <AccountEffects />
    </>
  );
}
