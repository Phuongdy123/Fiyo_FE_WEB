"use client";

import "@/app/assets/css/checkout.css";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/app/context/Ccart";
import { useAuth } from "@/app/context/CAuth";
import { getVoucherByUserId } from "@/app/services/Voucher/SVoucher";
import { IVoucher } from "@/app/untils/IVoucher";
import { getColorStyle } from '@/app/components/shared/ColorBox';
import { useMinicart } from "@/app/context/MinicartContext";

export default function MiniCartComponent() {
  const { isOpen, close } = useMinicart();
  const { cart, updateQuantity, removeFromCart } = useCart();
  const { user } = useAuth();
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [voucher, setVoucher] = useState<IVoucher | null>(null);
  const [showVoucherModal, setShowVoucherModal] = useState(false);
  const [voucherList, setVoucherList] = useState<IVoucher[]>([]);

  // Format date function from VoucherPage
  const formatDate = (dateInput: Date | string | null | undefined) => {
    if (!dateInput) return "";
    const date = typeof dateInput === "string" ? new Date(dateInput) : dateInput;
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  // Updated voucher fetching logic
  useEffect(() => {
    const fetchVouchers = async () => {
      try {
        if (!user?._id) return;
        const { vouchers } = await getVoucherByUserId(user._id);
        setVoucherList(vouchers);
      } catch (error) {
        console.log("Lỗi khi lấy danh sách voucher!", error);
      }
    };
    fetchVouchers();

    const stored = localStorage.getItem("selectedVoucher");
    if (stored) {
      try {
        setVoucher(JSON.parse(stored));
      } catch {}
    }

    const cartIcon = document.getElementById("cart-icon");
    const minicart = document.querySelector(".minicart");
    const backdrop = document.querySelector(".minicart__backdrop");
    const closeBtn = document.querySelector(".minicart__close");

    function toggleMinicart() {
      minicart?.classList.toggle("active");
    }

    function closeMinicart() {
      minicart?.classList.remove("active");
    }

    if (cartIcon) cartIcon.addEventListener("click", toggleMinicart);
    if (backdrop) backdrop.addEventListener("click", closeMinicart);
    if (closeBtn) closeBtn.addEventListener("click", closeMinicart);

    return () => {
      if (cartIcon) cartIcon.removeEventListener("click", toggleMinicart);
      if (backdrop) backdrop.removeEventListener("click", closeMinicart);
      if (closeBtn) closeBtn.removeEventListener("click", closeMinicart);
    };
  }, [user?._id]);

  const handleSelectVoucher = (v: IVoucher) => {
    setVoucher(v);
    localStorage.setItem("selectedVoucher", JSON.stringify(v));
    setShowVoucherModal(false);
  };

  const formatPrice = (price: number) => price.toLocaleString("vi-VN") + " ₫";

  const totalPrice = cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
  const discount =
    voucher?.type === "percent"
      ? (totalPrice * voucher.value) / 100
      : voucher?.value || 0;

  const finalTotal = totalPrice - discount;
  const outOfStockProduct = cart.some(item => item.quantity_Product < 1);

  const handleCheckout = () => {
    if (outOfStockProduct) {
      return;
    }
    localStorage.setItem("finalTotal", finalTotal.toString());
    window.location.href = user ? "/page/checkout" : "/page/checkoutNoLogin";
  };

  return (
    <div className={`minicart ${isOpen ? "active" : ""}`}>
      <div className="minicart__container">
        <div className="minicart__body active">
          <div className="minicart__backdrop" onClick={close}></div>
          <div className="minicart__heading">
            <h2 className="minicart__title">Giỏ hàng ({cart.length})</h2>
            <button className="minicart__close" onClick={close}></button>
          </div>
          <div className="minicart__content">
            {totalPrice >= 100000 ? (
              <div className="minicart__noti-list">
                <div className="minicart__noti--succes">
                  <div className="minicart__noti-text">
                    Bạn đã được miễn phí vận chuyển
                  </div>
                </div>
              </div>
            ) : (
              <div className="minicart__noti-list">
                <div className="minicart__noti">
                  <div className="minicart__noti-text">
                    Mua thêm {(100000 - totalPrice).toLocaleString("vi-VN")} ₫
                    để được miễn phí vận chuyển
                  </div>
                </div>
              </div>
            )}

            <ol className="minicart__items">
              {cart.map((item) => (
                <li
                  className="minicart__item"
                  key={`${item.id}-${item.variant_id}-${item.size}`}
                >
                  <div className="minicart__item-info">
                    <div className="minicart__item-photo" style={{ position: "relative" }}>
                      <a href={`/#/detail/${item.id}`}>
                        <img src={item.image} width={80} height={105} />
                      </a>
                      {item.quantity_Product < 1 && (
                        <div className="sold-out-badge">Hết hàng</div>
                      )}
                    </div>
                    <div className="minicart__item-details">
                      <h3 className="minicart__item-name">
                        <a href={`/#/detail/${item.id}`}>{item.name}</a>
                      </h3>
                      <div className="minicart__item-actions">
                        <button
                          onClick={() =>
                            removeFromCart(item.id, item.variant_id, item.size)
                          }
                          className="minicart__delete-btn"
                        >
                          <span className="screen-reader-text">Xóa</span>
                        </button>
                      </div>
                      <div className="minicart__item-options">
                        <div className="minicart__item-option">
                          <span
                            className="swatch-option"
                            style={{
                              ...getColorStyle(item.variant),
                              border: "1px solid #ccc",
                              width: "18px",
                              height: "18px",
                              display: "inline-block",
                              borderRadius: "50%",
                              marginRight: "4px"
                            }}
                          />
                          <span className="value">{item.variant}</span>
                        </div>
                        <div className="minicart__item-option">
                          <span className="value">{item.size}</span>
                        </div>
                      </div>
                      <div className="minicart__item-bottom">
                        <div className="minicart__item-price">
                          <span className="minicart__item-price-regular">
                            {formatPrice(item.price)}
                          </span>
                        </div>
                        <div className="minicart__item-qty">
                          <button
                            className="btn-qty btn-qty-min"
                            onClick={() => {
                              if (item.quantity <= 1) {
                                removeFromCart(
                                  item.id,
                                  item.variant_id,
                                  item.size
                                );
                              } else {
                                updateQuantity(
                                  item.id,
                                  item.variant_id,
                                  item.size,
                                  item.quantity - 1
                                );
                              }
                            }}
                          ></button>
                          <input
                            type="text"
                            readOnly
                            className="input-qty"
                            value={item.quantity}
                          />
                          <button
                            className="btn-qty btn-qty-plus"
                            onClick={() =>
                              updateQuantity(
                                item.id,
                                item.variant_id,
                                item.size,
                                item.quantity + 1
                              )
                            }
                          ></button>
                        </div>
                        {item.quantity < 1 && (
                          <div className="text-red-500 text-xs mt-1">Sản phẩm đã hết hàng</div>
                        )}
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ol>
            {outOfStockProduct && (
              <div className="minicart__noti-list">
                <div className="minicart__noti">
                  <div className="minicart__noti-text">
                    Một số sản phẩm trong giỏ đã hết hàng và không thể thanh toán.
                  </div>
                </div>
              </div>
            )}
          </div>
          <div className="minicart__bottom">
            <div className="minicart__coupon">
              <div className="minicart__coupon-title">Mã ưu đãi</div>
              {voucher ? (
                <span
                  className="minicart__coupon-lable"
                  onClick={() => setShowVoucherModal(true)}
                >
                  {voucher.voucher_code} - Giảm {voucher.value}
                  {voucher.type === "percent" ? "%" : "đ"}
                </span>
              ) : (
                <span
                  className="minicart__coupon-lable"
                  onClick={() => setShowVoucherModal(true)}
                  style={{ cursor: "pointer" }}
                >
                  Chọn hoặc nhập mã
                </span>
              )}
            </div>

            <div className="minicart__subtotal">
              <table>
                <tbody>
                  <tr>
                    <th>Giá trị đơn hàng</th>
                    <td>{formatPrice(totalPrice)}</td>
                  </tr>
                </tbody>
                <tfoot>
                  {voucher && (
                    <tr className="subtotal">
                      <th>Giảm giá</th>
                      <td>-{formatPrice(discount)}</td>
                    </tr>
                  )}
                  <tr className="subtotal">
                    <th>Tạm tính</th>
                    <td>
                      <span className="price">{formatPrice(finalTotal)}</span>
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
            <div className="minicart__actions">
              <button className="minicart__actions-button">
                <a style={{ color: "white" }} onClick={handleCheckout}>
                  Thanh toán
                </a>
              </button>
            </div>
          </div>
        </div>
      </div>
      {showVoucherModal && (
        <div className="modal-coupon__container">
          <div className="modal-coupon__content">
            <div className="modal-coupon__header">
              <div
                className="modal-coupon__close"
                onClick={() => setShowVoucherModal(false)}
                style={{ cursor: "pointer" }}
              >
                <span className="screen-reader-text">Close</span>
              </div>
              <h4 className="modal-coupon__title">Mã ưu đãi</h4>
            </div>
            <div className="modal-coupon__form">
              <div className="modal-coupon__form-group">
                <div className="modal-coupon__form-control">
                  <input
                    type="text"
                    name="promoCode"
                    id="promoCode"
                    placeholder="Nhập mã ưu đãi"
                    className="modal-coupon__form-input"
                  />
                </div>
                <button
                  disabled
                  id="applyButton"
                  className="modal-coupon__form-add"
                >
                  Áp dụng
                </button>
              </div>
            </div>
            <div className="modal-coupon__body">
              <div className="modal-coupon__items">
                {voucherList.map((item) => (
                  <div className="modal-coupon__item" key={item._id}>
                    <div className="modal-coupon__item-info">
                      <div className="modal-coupon__item-label">Mã ưu đãi</div>
                      <div className="modal-coupon__item-detail">
                        <div className="modal-coupon__item-title">
                          Voucher {item.value}
                          {item.type}
                        </div>
                        <div className="modal-coupon__item-des">
                          Áp dụng từ {item.min_total?.toLocaleString()}đ đến {item.max_total?.toLocaleString()}đ
                        </div>
                        <div className="modal-coupon__item-code">
                          <span>Mã</span> <strong>{item.voucher_code}</strong>
                        </div>
                        <div className="modal-coupon__item-bottom">
                          <span className="promotion__item-date">
                            HSD: {formatDate(item.expired_at) || "Không có"}
                          </span>
                        </div>
                      </div>
                      <div
                        className="modal-coupon__item-action"
                        onClick={() => handleSelectVoucher(item)}
                        style={{ cursor: "pointer" }}
                      >
                        <div className="modal-coupon__item-add">
                          <span>Sử dụng</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="modal-coupon__footer">
                <button className="btn btn-primary">Áp dụng</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}