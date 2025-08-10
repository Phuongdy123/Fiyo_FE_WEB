"use client";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/context/CAuth";
import "@/app/assets/css/account.css";
import AccountEffects from "@/app/assets/js/account";
import { useEffect } from "react";
import { useState } from "react";
import LogoutComponent from "../../components/shared/Logout";
import AccountSiteBar from "@/app/components/shared/AccountSiteBar";
import { IOrder } from "@/app/untils/IOrder";
import { getOrderByUserId } from "@/app/services/Order/SOrder";
export default function AccountPage() {
  const router = useRouter();
  // lấy tt user
  const { user } = useAuth();
  // state don hang
  var userId = user?._id;
  const [orders, SetOrders] = useState<IOrder[]>([]);
  useEffect(() => {
    const FetchData = async () => {
      if (!userId) return; // Không gọi nếu user chưa load

      try {
        const orders: IOrder[] = await getOrderByUserId(
          `https://fiyo.click/api/orders/user/${userId}`
        );
        SetOrders(orders);
        console.log(orders);
      } catch (error) {
        console.log("Lỗi khi lấy thông tin đơn hàng", error);
      }
    };

    FetchData();
  }, [userId]);

  const formatPrice = (price: number) => price.toLocaleString("vi-VN") + " ₫";

  const formatDate = (dateInput: Date | string | null | undefined) => {
    if (!dateInput) return "Không xác định";

    const date = new Date(dateInput);
    if (isNaN(date.getTime())) return "Không xác định";

    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();

    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");

    return `${day}/${month}/${year} ${hours}:${minutes}`;
  };

  return (
    <>
      <LogoutComponent></LogoutComponent>
      <div>
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
                  <h1 className="account-information__title">Đơn hàng</h1>
                </div>
                <span className="account-information__content">
                  <h2 className="voucher__content-title">Đơn hàng của bạn</h2>
                  <h2>
                    {orders.map((order) => (
                      <div
                        className="box-order"
                        key={order._id}
                        onClick={() =>
                          router.push(`/page/orderDetail/${order._id}`)
                        }
                        style={{ cursor: "pointer" }}
                      >
                        <div className="order">
                          <h3>Online</h3>
                          <div className="order-content">
                            <div className="order-detail">
                              <div className="order-title">Mã đơn hàng</div>
                              <p>{order._id}</p>
                            </div>
                            <div className="order-status">
                              {order.status_order}
                            </div>
                            <div className="order-detail">
                              <div className="order-title">Thời gian:</div>
                              <p>{formatDate(order.createdAt)}</p>
                            </div>
                            <div className="order-detail">
                              <div className="order-title">Số lượng:</div>
                              <p>1</p>
                            </div>
                            <div className="order-detail">
                              <div className="order-title">Tổng tiền:</div>
                              <p className="total-amount">
                                {formatPrice(order.total_price)}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </h2>
                </span>
              </div>
            </div>
            <AccountSiteBar></AccountSiteBar>
          </div>
        </div>
        <div className="back-to-top">
          <span className="screen-reader-text">TOP</span>
        </div>
        <div className="footer">
          <div className="footer-content">
            <div className="footer-top">
              <h3>Đăng ký nhận bản tin</h3>
              <p style={{ fontSize: 14 }}>
                Cùng Canifa Blog cập nhật những thông tin mới nhất về thời trang
                và phong cách sống.
              </p>
              <form className="newsletter-form">
                <input
                  type="email"
                  style={{ textAlign: "center" }}
                  placeholder="Nhập email đăng ký của bạn"
                />
                <button type="submit">Đăng ký</button>
              </form>
              <div className="social-icons">
                <a href="#" aria-label="Facebook">
                  <i className="fab fa-facebook-f" />
                </a>
                <a href="#" aria-label="Instagram">
                  <i className="fab fa-instagram" />
                </a>
                <a href="#" aria-label="YouTube">
                  <i className="fab fa-youtube" />
                </a>
                <a href="#" aria-label="TikTok">
                  <i className="fab fa-tiktok" />
                </a>
              </div>
            </div>
            <div className="footer-bottom">
              <div className="footer-section">
                <h4>Công ty cổ phần Canifa</h4>
                <p>
                  Số ĐKKD: 0107574310, ngày cấp: 23/09/2016, nơi cấp: Sở KHĐT Hà
                  Nội
                </p>
                <p>
                  Địa chỉ: Số 688 Đường Quang Trung, Phường La Khê, Hà Đông, Hà
                  Nội
                </p>
                <p>Email: hello@canifa.com</p>
              </div>
              <div className="footer-section">
                <h4>Thương hiệu</h4>
                <ul>
                  <li>
                    <a href="#">Giới thiệu</a>
                  </li>
                  <li>
                    <a href="#">Tuyển dụng</a>
                  </li>
                  <li>
                    <a href="#">Hệ thống cửa hàng</a>
                  </li>
                </ul>
              </div>
              <div className="footer-section">
                <h4>Hỗ trợ</h4>
                <ul>
                  <li>
                    <a href="#">Hỏi đáp</a>
                  </li>
                  <li>
                    <a href="#">Chính sách KH</a>
                  </li>
                  <li>
                    <a href="#">Chính sách vận chuyển</a>
                  </li>
                </ul>
              </div>
              <div className="footer-section">
                <h4>Fanbage</h4>
                <img
                  src="https://photo.salekit.com/uploads/fchat_5b4872d13803896dd77125af/cach-tao-fanpage-facebook.jpg"
                  alt="QR Code"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <AccountEffects></AccountEffects>
    </>
  );
}
