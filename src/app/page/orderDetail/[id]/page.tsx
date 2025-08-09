"use client";
import { useAuth } from "@/app/context/CAuth";
import "@/app/assets/css/account-detail.css";
import AccountEffects from "@/app/assets/js/account";
import { useEffect, use } from "react";
import { useState } from "react";
import LogoutComponent from "@/app/components/shared/Logout";
import AccountSiteBar from "@/app/components/shared/AccountSiteBar";
import { getOrderDetailByUserId } from "@/app/services/Order/SOrder";
import SectionReviewForm from "@/app/components/section/Reviews/ReviewForm";
import { getColorStyle } from "@/app/components/shared/ColorBox";

export default function AccountPage({ params }: { params: Promise<{ id: string }> }) {
  // Unwrap params using React.use
  const { id } = use(params);
  const [orderDetail, setOrderDetail] = useState<any>(null);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [rating, setRating] = useState(5);
  const [reviewContent, setReviewContent] = useState("");
  const [images, setImages] = useState<File[]>([]);

  useEffect(() => {
    async function fetchOrderDetail() {
      try {
        const res = await getOrderDetailByUserId(`http://localhost:3000/orderDetail/${id}`);
        setOrderDetail(res);
        console.log("objectsss", res);
      } catch (error) {
        console.error("Failed to fetch order detail:", error);
      }
    }

    if (id) {
      fetchOrderDetail();
    }
  }, [id]);

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

  // Consistent number formatting using toLocaleString
  const formatPrice = (price: number | undefined) => {
    if (price == null) return "0 ₫";
    return price.toLocaleString("vi-VN", { style: "currency", currency: "VND" });
  };

  const handleSubmitReview = async ({
    productId,
    rating,
    content,
    images,
    order_detail_id,
    user_id,
  }: {
    productId: string;
    rating: number;
    content: string;
    images: File[];
    order_detail_id: string;
    user_id: string;
  }) => {

    try {
      const formData = new FormData();
      formData.append("product_id", productId);
      formData.append("rating", rating.toString());
      formData.append("content", content);
      formData.append("user_id", user_id);
      formData.append("order_detail_id", order_detail_id);
      images.forEach((file) => formData.append("images", file));

      const res = await fetch("http://localhost:3000/review", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (res.status === 201) {
        alert("✅ Đánh giá thành công");
      } else if (res.status === 400 && data.message.includes("đã đánh giá")) {
        alert("❌ Bạn đã đánh giá sản phẩm này rồi.");
      } else {
        alert("❌ Thất bại: " + (data.message || "Lỗi không xác định"));
      }
    } catch (err) {
      console.error("Lỗi khi gửi đánh giá:", err);
      alert("Có lỗi xảy ra");
    }
  };

  const products =
    orderDetail?.products?.map((item: any) => ({
      _id: item.product_id || item._id,
      name: item.name,
      image: item.images?.[0],
      user_id: orderDetail?.user?._id,
      order_detail_id: item._id,
    })) || [];

  return (
    <>
      <LogoutComponent />
      <div>
        <div>
          <div className="account-page">
            <div className="account-container">
              <div className="account-main account-main-information">
                <div className="account-main account-main-order">
                  <div className="order-detail">
                    <div className="order-detail__content">
                      <div className="order-detail__header">
                        <div className="order-detail__back">
                          <span>Back</span>
                        </div>
                        <div className="order-detail__title order-detail__title--mb">
                          Chi tiết đơn hàng
                        </div>
                      </div>
                      <div className="order-detail__top">
                        <h2 className="order-detail__title">
                          Mã đơn hàng: <span>{orderDetail?.order_id}</span>
                        </h2>
                        <span className="order-detail__status order-detail__status--processing">
                          {orderDetail?.order?.status_history
                            ?.slice()
                            .sort((a: any, b: any) => {
                              const dateA = new Date(a.updatedAt);
                              const dateB = new Date(b.updatedAt);
                              return isNaN(dateB.getTime()) || isNaN(dateA.getTime())
                                ? 0
                                : dateB.getTime() - dateA.getTime();
                            })[0]?.status || orderDetail?.order?.status_order}
                        </span>
                        <div className="order-detail__date">
                          Ngày mua hàng:
                          <span className="date">{formatDate(orderDetail?.order?.createdAt)}</span>
                        </div>
                      </div>
                      <div className="order-detail__column">
                        <div className="order-detail__column--left">
                          <ul className="order-detail__information">
                            <li>
                              <label>Địa chỉ nhận hàng</label>
                              <div className="value">{orderDetail?.user.name}</div>
                              <div className="value">0865181657</div>
                              <div className="value">{orderDetail?.user.address.address}</div>
                            </li>
                            <li className="payment">
                              <label>Phương thức vận chuyển</label>
                              <div className="value">
                                <span>Tiêu chuẩn 3-5 ngày</span>
                              </div>
                            </li>
                            <li className="payment">
                              <label>Phương thức thanh toán</label>
                              <div className="value">
                                <span>Thanh toán ({orderDetail?.order.payment_method})</span>
                              </div>
                            </li>
                          </ul>
                        </div>
                        <div className="order-detail__tracking">
                          <div className="order__tracking">
                            <div className="order__tracking-heading">
                              <div className="order__tracking-back">
                                <span className="screen-reader-text">back</span>
                              </div>
                              <div className="order__tracking-title">Theo dõi đơn hàng</div>
                            </div>
                            <div className="order__tracking-content">
                              <div className="order__tracking-items">
                                {orderDetail?.order?.status_history?.length > 0 ? (
                                  <>
                                    {[...orderDetail.order.status_history]
                                      .sort((a: any, b: any) => {
                                        const dateA = new Date(a.updatedAt);
                                        const dateB = new Date(b.updatedAt);
                                        return isNaN(dateB.getTime()) || isNaN(dateA.getTime())
                                          ? 0
                                          : dateB.getTime() - dateA.getTime();
                                      })
                                      .map((item: any, index: number) => (
                                        <div
                                          className={`order__tracking-item ${index === 0 ? "active" : ""}`}
                                          key={item._id } 
                                        >
                                          <div className="order__tracking-date">
                                            <div className="date" />
                                            <span className="time">{formatDate(item.updatedAt)}</span>
                                          </div>
                                          <div className="order__tracking-icon" />
                                          <div className="order__tracking-detail">
                                            <strong className="order__tracking-status">{item.status}</strong>
                                            <div>{item.note}</div>
                                          </div>
                                        </div>
                                      ))}
                                  </>
                                ) : (
                                  <div className="order__tracking-item active">
                                    <div className="order__tracking-date">
                                      <div className="date" />
                                      <span className="time">{formatDate(orderDetail?.order?.createdAt)}</span>
                                    </div>
                                    <div className="order__tracking-icon" />
                                    <div className="order__tracking-detail">
                                      <strong className="order__tracking-status">
                                        {orderDetail?.order?.status_order || "Chờ xác nhận"}
                                      </strong>
                                      <div>Chờ xác nhận đơn hàng</div>
                                    </div>
                                  </div>
                                )}
                                <div className="order__tracking-item">
                                  <div className="order__tracking-date">
                                    <div className="date" />
                                    <span className="time">{formatDate(orderDetail?.order?.createdAt)}</span>
                                  </div>
                                  <div className="order__tracking-icon" />
                                  <div className="order__tracking-detail">
                                    <strong className="order__tracking-status">Đặt hàng</strong>
                                    <div>Đặt hàng thành công</div>
                                  </div>
                                </div>
                              </div>
                            </div>
                            <div className="order__tracking-bottom">
                              <a href="/customer/order-history/tel:18006061" className="btn btn-primary">
                                <svg
                                  width={17}
                                  height={17}
                                  viewBox="0 0 17 17"
                                  fill="none"
                                  xmlns="http://www.w3.org/2000/svg"
                                >
                                  <path
                                    d="M13.8327 7.83333C13.8327 4.88782 11.4449 2.5 8.49935 2.5C5.55383 2.5 3.16602 4.88781 3.16602 7.83333"
                                    stroke="white"
                                    strokeWidth="1.5"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                  />
                                  <path
                                    d="M13.834 12.5V12.5C13.834 13.6046 12.9386 14.5 11.834 14.5H7.83398"
                                    stroke="white"
                                    strokeWidth="1.5"
                                    strokeLinecap="round"
                                  />
                                  <path
                                    d="M1.83398 9.49992C1.83398 8.57944 2.58018 7.83325 3.50065 7.83325C4.42113 7.83325 5.16732 8.57944 5.16732 9.49992V10.8333C5.16732 11.7537 4.42113 12.4999 3.50065 12.4999C2.58018 12.4999 1.83398 11.7537 1.83398 10.8333V9.49992Z"
                                    stroke="white"
                                    strokeWidth="1.5"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                  />
                                  <path
                                    d="M11.834 9.49992C11.834 8.57944 12.5802 7.83325 13.5007 7.83325C14.4211 7.83325 15.1673 8.57944 15.1673 9.49992V10.8333C15.1673 11.7537 14.4211 12.4999 13.5007 12.4999C12.5802 12.4999 11.834 11.7537 11.834 10.8333V9.49992Z"
                                    stroke="white"
                                    strokeWidth="1.5"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                  />
                                  <rect
                                    x="7.83398"
                                    y="13.8333"
                                    width="3.33333"
                                    height="1.33333"
                                    rx="0.666667"
                                    stroke="white"
                                    strokeWidth="1.5"
                                  />
                                </svg>
                                <span>Hỗ trợ đơn hàng</span>
                              </a>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="order-details-shiping processing">
                        <div className="text">
                          <label>Đang xử lý</label>
                          <p className="des">Đơn hàng đang được xử lý</p>
                          <p className="date">16/07/2025 - 18:05</p>
                          <button className="btn btn-primary">Theo dõi đơn hàng</button>
                        </div>
                        <div className="icon">
                          <img src="/status-processing.webp" width={100} height={100} alt="Processing" />
                        </div>
                      </div>
                      <div className="order-details-info">
                        <div className="item-row item-row--order">
                          <div className="label">Mã đơn hàng: CNF1000104131</div>
                          <div className="action-copy">
                            <span>Copy</span>
                          </div>
                        </div>
                        <div className="item-row">
                          <div className="label">Ngày mua hàng:</div>
                          <div className="value">16/07/2025 - 18:05</div>
                        </div>
                      </div>
                      <div className="order-details-box order-details-bystore">
                        <div className="order-details-box-title">
                          <div className="icon" />
                          <h2 className="title">Địa chỉ nhận hàng</h2>
                        </div>
                        <div className="order-details-box-content">
                          <div className="title">Phương Nguyễn Duy</div>
                          <div className="phone">0865181657</div>
                          <div className="address">aapas 14, Xã Hương Mạc, Thị xã Từ Sơn, Bắc Ninh</div>
                        </div>
                      </div>
                      <div className="order-details-box order-details-shipping-methods">
                        <div className="order-details-box-title">
                          <div className="icon" />
                          <h2 className="title">Phương thức vận chuyển</h2>
                        </div>
                        <div className="order-details-box-content">
                          <span>Tiêu chuẩn 3-5 ngày</span>
                        </div>
                      </div>
                      <div className="order-details-box order-details-payment-methods">
                        <div className="order-details-box-title">
                          <div className="icon" />
                          <h2 className="title">Phương thức thanh toán</h2>
                        </div>
                        <div className="order-details-box-content">
                          <div className="icon">
                            <img src="/_nuxt/img/cod.1b96f88.svg" width={54} height={32} alt="COD" />
                          </div>
                          <div>Thanh toán khi nhận hàng (COD)</div>
                        </div>
                      </div>
                      <div className="order-details__products">
                        <h2 className="order-details__products-title">
                          Sản phẩm <span>({orderDetail?.products?.length})</span>
                        </h2>
                        <div className="order-details__products-items">
                          {orderDetail?.products?.map((item: any) => (
                            <div className="order-details__product"  key={`${item._id ?? item.name}`}>
                              <div className="order-details__product-photo">
                                <a href={'#'}>
                                  <img src={item.images?.[0]} width={80} height={100} alt={item.name} />
                                </a>
                              </div>
                              <div className="order-details__product-detail">
                                <div className="order-details__product-info">
                                  <div className="order-details__product-name">
                                    <a href="/quan-sooc-jeans-nu-6bs25s006">{item.name}</a>
                                  </div>
                                  <div className="order-details__product-sku">6BS25S006-SJ932-28</div>
                                  <div className="order-details__product-options">
                                    <div className="order-details__product-option">
                                      <span
                                        style={{
                                          ...getColorStyle(item.color),
                                          display: "inline-block",
                                          width: "16px",
                                          height: "16px",
                                          borderRadius: "50%",
                                          border: "1px solid #ccc",
                                          marginRight: "6px",
                                          verticalAlign: "middle",
                                        }}
                                      />
                                      <span style={{ verticalAlign: "middle" }}>
                                        {item.color || "Không rõ màu"}
                                      </span>
                                    </div>
                                    <div className="order-details__product-option">
                                      Size: {item.size || "L"}
                                    </div>
                                    <div className="order-details__product-qty order-details__product-qty--mb">
                                      {item.quantity}
                                    </div>
                                  </div>
                                </div>
                                <div className="order-details__product-qty">x {item.quantity}</div>
                                <div className="order-details__product-price">
                                  <span className="order-details__product-price--normal">
                                    {formatPrice(item.price)}
                                  </span>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                      <div className="order-details-totals">
                        <div className="order-details-totals-title">Chi tiết đơn hàng</div>
                        <div className="order-details-totals-content">
                          <table>
                            <tbody>
                              <tr className="total">
                                <th>
                                  <div className="label">Giá trị đơn hàng</div>
                                </th>
                                <td>
                                  <div className="price">{formatPrice(orderDetail?.order?.total_price)}</div>
                                </td>
                              </tr>
                              <tr className="ship">
                                <th>
                                  <div className="label">Phí vận chuyển</div>
                                </th>
                                <td>
                                  <div className="price">{formatPrice(0)}</div>
                                </td>
                              </tr>
                            </tbody>
                            <tfoot>
                              <tr className="grand-totals">
                                <th>
                                  <div className="label">Tổng tiền thanh toán</div>
                                  <div className="note">(Đã bao gồm thuế VAT)</div>
                                </th>
                                <td>
                                  <div className="price">{formatPrice(orderDetail?.order?.total_price)}</div>
                                  <div className="save">{/* Tiết kiệm 224.700&nbsp;₫ */}</div>
                                </td>
                              </tr>
                            </tfoot>
                          </table>
                          {(() => {
                            const latestStatus =
                              orderDetail?.order?.status_history
                                ?.slice()
                                .sort((a: any, b: any) => {
                                  const dateA = new Date(a.updatedAt);
                                  const dateB = new Date(b.updatedAt);
                                  return isNaN(dateB.getTime()) || isNaN(dateA.getTime())
                                    ? 0
                                    : dateB.getTime() - dateA.getTime();
                                })[0]?.status || orderDetail?.order?.status_order;

                            return latestStatus === "delivered" ? (
                              <div className="order-details-totals-bottom">
                                <button
                                  className="btn btn-primary"
                                  onClick={() => setShowReviewForm((prev) => !prev)}
                                >
                                  {showReviewForm ? "Đóng đánh giá" : "Viết đánh giá"}
                                </button>
                              </div>
                            ) : null;
                          })()}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <AccountSiteBar />
            </div>
          </div>
          <div className="back-to-top">
            <span className="screen-reader-text">TOP</span>
          </div>
        </div>
      </div>
      <SectionReviewForm
        show={showReviewForm}
        onClose={() => setShowReviewForm(false)}
        products={products}
        onSubmit={({ productId, rating, content, images }) => {
          const product = products.find((p: any) => p._id === productId);
          if (!product) return;
          handleSubmitReview({
            productId,
            rating,
            content,
            images,
            order_detail_id: product.order_detail_id,
            user_id: product.user_id,
          });
        }}
      />
    </>
  );
}