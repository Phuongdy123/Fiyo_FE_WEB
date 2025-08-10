"use client";

import { useState, useEffect } from "react";
import { useCart } from "@/app/context/Ccart";
import { useAuth } from "@/app/context/CAuth";
import { useToast } from "@/app/context/CToast";
import CheckoutJs from "@/app/assets/js/checkout";
import HomeEffectsJs from "@/app/effects/home";
import { IVoucher } from "@/app/untils/IVoucher";
import { getAllAddress, getDefaultAddress } from "@/app/services/Address/SAddress";
import { IAddress } from "../../../untils/IAddress";
import { getAllVoucher } from "@/app/services/Voucher/SVoucher";

interface Province {
  code: string;
  name: string;
  type: string;
}

interface Ward {
  code: string;
  name: string;
  type: string;
  province_code: string;
}

export default function CheckoutComponent() {
  const { user, logoutUser } = useAuth();
  const { showToast } = useToast();
  let userId = user?._id;
  const { cart, clearCart } = useCart();
  const total = cart.reduce((acc, item) => acc + (item.price || 0) * (item.quantity || 0), 0);

  // Hàm formatPrice từ component đầu tiên
  const formatPrice = (price: number | null | undefined) =>
    (typeof price === "number" && !isNaN(price))
      ? price.toLocaleString("vi-VN") + " ₫"
      : "0 ₫";

  const VALID_PROVINCE_CODES = [
    "01", "26", "04", "11", "12", "14", "20", "22", "38", "40", "42", "02",
    "10", "19", "25", "27", "33", "31", "37", "45", "48", "51", "52", "56",
    "66", "68", "72", "75", "79", "86", "87", "89", "92", "96"
  ];

  // State for address
  const [provinces, setProvinces] = useState<Province[]>([]);
  const [wards, setWards] = useState<Ward[]>([]);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setMail] = useState("");
  const [province, setProvince] = useState("");
  const [ward, setWard] = useState("");
  const [detailAddress, setDetailAddress] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("cod");
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [voucher, setVoucher] = useState<IVoucher | null>(null);
  const [voucherList, setVoucherList] = useState<IVoucher[]>([]);
  const [showVoucherModal, setShowVoucherModal] = useState(false);
  const [isLoadingWards, setIsLoadingWards] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize voucher from localStorage or sessionStorage
  useEffect(() => {
    const initializeVoucher = () => {
      let savedVoucher = sessionStorage.getItem("selectedVoucher");
      if (savedVoucher) {
        try {
          setVoucher(JSON.parse(savedVoucher));
          return;
        } catch (err) {
          console.error("Mã ưu đãi trong sessionStorage không hợp lệ:", err);
          sessionStorage.removeItem("selectedVoucher");
        }
      }
      savedVoucher = localStorage.getItem("selectedVoucher");
      if (savedVoucher) {
        try {
          const parsedVoucher = JSON.parse(savedVoucher);
          setVoucher(parsedVoucher);
          sessionStorage.setItem("selectedVoucher", JSON.stringify(parsedVoucher));
        } catch (err) {
          console.error("Mã ưu đãi trong localStorage không hợp lệ:", err);
          localStorage.removeItem("selectedVoucher");
        }
      }
    };
    initializeVoucher();
  }, []);

  // Fetch provinces
  useEffect(() => {
    const fetchProvinces = async () => {
      try {
        setError(null);
        const response = await fetch("https://tinhthanhpho.com/api/v1/new-provinces", {
          headers: { Accept: "application/json" }
        });
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const data = await response.json();
        if (data.success) {
          const filteredProvinces = data.data
            .filter((p: Province) => VALID_PROVINCE_CODES.includes(p.code.padStart(2, "0")))
            .map((p: Province) => ({
              ...p,
              code: p.code.padStart(2, "0")
            }));
          setProvinces(filteredProvinces);
        } else {
          throw new Error("API returned success: false");
        }
      } catch (error: any) {
        console.error("Lỗi khi lấy danh sách tỉnh/thành:", error);
        setError("Không thể lấy danh sách tỉnh/thành. Vui lòng thử lại sau.");
      }
    };
    fetchProvinces();
  }, []);

  // Fetch wards when province changes
  useEffect(() => {
    if (!province) {
      setWards([]);
      setWard("");
      setIsLoadingWards(false);
      return;
    }

    const fetchWards = async () => {
      try {
        setError(null);
        setIsLoadingWards(true);
        const paddedCode = province.padStart(2, "0");
        const response = await fetch(
          `https://tinhthanhpho.com/api/v1/new-provinces/${paddedCode}/wards`,
          { headers: { Accept: "application/json" } }
        );
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const data = await response.json();
        if (data.success) {
          setWards(data.data || []);
          setWard("");
        } else {
          throw new Error("API returned success: false");
        }
      } catch (error: any) {
        console.error("Lỗi khi lấy danh sách phường/xã:", error);
        setError("Không thể lấy danh sách phường/xã. Vui lòng thử lại sau.");
        setWards([]);
      } finally {
        setIsLoadingWards(false);
      }
    };
    fetchWards();
  }, [province]);

  // Fetch default address and vouchers
  useEffect(() => {
    const fetchData = async () => {
      try {
        if (!userId) return;
        // Load default address
        const defaultAddress = await getDefaultAddress(
          `https://fiyo.click/api/address/user/${userId}`
        );
        if (defaultAddress) {
          setProvince(defaultAddress.province || "");
          setWard(defaultAddress.ward || "");
          setDetailAddress(defaultAddress.detail || "");
          setName(defaultAddress.name || "");
          setPhone(defaultAddress.phone || "");
        }
        // Load vouchers
        const vouchers = await getAllVoucher("https://fiyo.click/api/voucher");
        setVoucherList(vouchers);
      } catch (error) {
        console.error("Lỗi khi load dữ liệu:", error);
        setError("Không thể tải dữ liệu. Vui lòng thử lại sau.");
      }
    };

    if (userId && provinces.length > 0) fetchData();
  }, [userId, provinces]);

  // Handle checkout
  const handleCheckout = async () => {
    // Kiểm tra giỏ hàng rỗng
    if (cart.length === 0) {
      showToast("Giỏ hàng trống. Vui lòng thêm sản phẩm để thanh toán!", "error");
      return;
    }

    // Kiểm tra thông tin bắt buộc
    if (!province || !ward || !detailAddress || !name || !phone) {
      showToast("Vui lòng nhập đầy đủ thông tin địa chỉ và liên lạc!", "error");
      return;
    }

    // Kiểm tra định dạng số điện thoại
    if (!/^\d{10}$/.test(phone.trim())) {
      showToast("Số điện thoại phải có 10 chữ số!", "error");
      return;
    }

    // Kiểm tra định dạng email (nếu có)
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      showToast("Địa chỉ email không hợp lệ!", "error");
      return;
    }

    // Kiểm tra điều kiện voucher
    if (voucher && (total < (voucher.min_total || 0) || total > (voucher.max_total || Infinity))) {
      showToast("Mã ưu đãi không áp dụng được cho đơn hàng này!", "error");
      return;
    }

    const provinceName = provinces.find((p) => p.code === province)?.name || "";
    const wardName = wards.find((w) => w.code === ward)?.name || "";
    const fullAddress = `${detailAddress}, ${wardName}, ${provinceName}`
      .replace(/, ,/g, ",")
      .replace(/,$/, "");

    const address_guess = {
      name,
      phone,
      email,
      address: fullAddress,
      type: "Nhà riêng",
      detail: detailAddress,
      province,
      ward
    };

    const data = {
      name,
      phone,
      address_guess,
      voucher_id: voucher?._id,
      total_price: finalTotal,
      payment_method: paymentMethod,
      status_order: "unpending",
      products: cart.map((item) => ({
        product_id: item.id,
        variant_id: item.variant_id,
        size_id: item.size_id,
        quantity: item.quantity,
        image: item.image,
      })),
    };

    try {
      const res = await fetch("https://fiyo.click/api/orders/guess", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await res.json();

      if (result.status) {
        const orderId = result.order._id;
        clearCart(); // Xóa giỏ hàng
        localStorage.removeItem("selectedVoucher"); // Xóa voucher khỏi storage
        sessionStorage.removeItem("selectedVoucher");
        showToast("Đặt hàng thành công!", "success");
        
        if (paymentMethod === "vnpay" || paymentMethod === "momo") {
          window.location.href = `/page/payment_guess/${paymentMethod}/${orderId}`;
        } else {
          setTimeout(() => {
            window.location.href = "/";
          }, 1500);
        }
      } else {
        showToast(result.message || "Đặt hàng thất bại!", "error");
      }
    } catch (error) {
      console.error("Lỗi khi đặt hàng:", error);
      showToast("Lỗi khi gửi đơn hàng!", "error");
    }
  };

  const handleSelectVoucher = (v: IVoucher) => {
    setVoucher(v);
    localStorage.setItem("selectedVoucher", JSON.stringify(v)); // Lưu voucher
    sessionStorage.setItem("selectedVoucher", JSON.stringify(v));
    setShowVoucherModal(false);
  };

  const discountAmount = voucher
    ? voucher.type === "%"
      ? Math.round((total * (voucher.value || 0)) / 100)
      : (voucher.value || 0)
    : 0;

  const finalTotal = total - discountAmount;

  return (
    <>
      <div className="checkout-container">
        <div className="checkout-container--left">
          <div className="checkout-step checkout-shipping">
            <div className="checkout-step__heading">
              <h2 className="checkout-step__title">
                Mua hàng không cần đăng nhập
              </h2>
            </div>
            <div className="checkout-step__content">
              {error && <div className="alert alert-danger">{error}</div>}
              <form className="checkout-shipping__form checkout-shipping__form--desktop">
                <div className="row">
                  <span className="form-group col-sm-6">
                    <div>
                      <label htmlFor="name">Họ tên</label>
                      <input
                        type="text"
                        id="name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="form-control"
                      />
                      <span className="valid-error" style={{ display: name.trim() ? "none" : "block", color: "red", fontSize: "12px" }}>
                        Trường này là bắt buộc
                      </span>
                    </div>
                  </span>
                  <span className="form-group col-sm-6">
                    <label htmlFor="phone">Số điện thoại</label>
                    <input
                      type="text"
                      id="phone"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="form-control"
                    />
                    <span className="valid-error" style={{ display: phone.trim() && /^\d{10}$/.test(phone.trim()) ? "none" : "block", color: "red", fontSize: "12px" }}>
                      {phone.trim() ? "Số điện thoại phải có 10 chữ số" : "Trường này là bắt buộc"}
                    </span>
                  </span>
                  <span className="form-group col-sm-6">
                    <label htmlFor="email">Địa chỉ Email</label>
                    <input
                      type="text"
                      id="email"
                      value={email}
                      onChange={(e) => setMail(e.target.value)}
                      className="form-control"
                    />
                    <span className="valid-error" style={{ display: !email || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()) ? "none" : "block", color: "red", fontSize: "12px" }}>
                      Địa chỉ email không hợp lệ
                    </span>
                  </span>
                </div>

                <div className="row">
                  <span className="form-group col-sm-6">
                    <div>
                      <label htmlFor="province">Tỉnh / Thành phố</label>
                      <select
                        id="province"
                        className="form-control"
                        value={province}
                        onChange={(e) => setProvince(e.target.value)}
                      >
                        <option value="" disabled>
                          Chọn Tỉnh/Thành phố
                        </option>
                        {provinces.map((p) => (
                          <option key={p.code} value={p.code}>
                            {p.name}
                          </option>
                        ))}
                      </select>
                      <span className="valid-error" style={{ display: province ? "none" : "block", color: "red", fontSize: "12px" }}>
                        Trường này là bắt buộc
                      </span>
                    </div>
                  </span>
                  <span className="form-group col-sm-6">
                    <div>
                      <label htmlFor="ward">Phường / Xã</label>
                      <select
                        id="ward"
                        className="form-control"
                        value={ward}
                        onChange={(e) => setWard(e.target.value)}
                        disabled={!province || isLoadingWards}
                      >
                        <option value="" disabled>
                          {isLoadingWards ? "Đang tải..." : "Chọn Phường/Xã"}
                        </option>
                        {wards.map((w) => (
                          <option key={w.code} value={w.code}>
                            {w.name}
                          </option>
                        ))}
                      </select>
                      <span className="valid-error" style={{ display: ward ? "none" : "block", color: "red", fontSize: "12px" }}>
                        Trường này là bắt buộc
                      </span>
                    </div>
                  </span>
                </div>

                <div className="form-group">
                  <div>
                    <label htmlFor="dia-chi">Địa chỉ chi tiết</label>
                    <input
                      type="text"
                      name="dia-chi"
                      id="dia-chi"
                      placeholder="Nhập chi tiết địa chỉ"
                      className="form-control"
                      value={detailAddress}
                      onChange={(e) => setDetailAddress(e.target.value)}
                    />
                    <span className="valid-error" style={{ display: detailAddress.trim() ? "none" : "block", color: "red", fontSize: "12px" }}>
                      Trường này là bắt buộc
                    </span>
                  </div>
                </div>
              </form>

              <label className="shipping-method__option">
                <input type="radio" name="shipping-method" checked />
                <span className="shipping-method__option-content">
                  <span className="shipping-method__option-info">
                    <b className="shipping-method__option-title">
                      Giao tiêu chuẩn 2-5 ngày
                    </b>{" "}
                    <br />
                    <span className="shipping-method__option-des">
                      Thời gian giao hàng tùy thuộc vào điều kiện của đơn vị vận
                      chuyển. Dự kiến giao hàng: 2-5 ngày
                    </span>
                  </span>
                  <span className="shipping-method__option-price">{formatPrice(0)}</span>
                </span>
              </label>
            </div>
          </div>
          <div className="checkout-step payment-method">
            <div className="checkout-step__heading">
              <h2 className="checkout-step__title">Phương thức thanh toán</h2>
            </div>
            <div className="checkout-step-content">
              <div className="payment-method__note">
                Đơn hàng của bạn sẽ được giữ tại cửa hàng 24 tiếng tính từ khi
                đơn hàng được xác nhận có sẵn. Quá thời gian đơn hàng của bạn sẽ
                bị hủy.
              </div>
              <label className="payment-method__option">
                <input
                  type="radio"
                  value="cod"
                  name="payment-method"
                  checked={paymentMethod === "cod"}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                />
                <span className="payment-method__option-content">
                  <b className="payment-method__option-title">
                    Thanh toán khi nhận hàng (COD)
                  </b>
                  <span className="payment-method__option-image">
                    <img src="https://canifa.com/_nuxt/img/cod.1b96f88.svg" />
                  </span>
                </span>
              </label>
              <label className="payment-method__option">
                <input
                  type="radio"
                  value="vnpay"
                  name="payment-method"
                  checked={paymentMethod === "vnpay"}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                />
                <span className="payment-method__option-content">
                  <b className="payment-method__option-title">
                    Thanh toán bằng VNPAY
                  </b>
                  <span className="payment-method__option-image">
                    <img src="https://canifa.com/_nuxt/img/vnpay.a822fb1.svg" />
                  </span>
                </span>
              </label>
            
            </div>
          </div>
          <div className="checkout-step checkout-review active">
            <div className="checkout-step__heading">
              <h2 className="checkout-step__title">
                Sản phẩm ({cart?.length})
              </h2>
            </div>
            {cart.length === 0 ? (
              <div className="checkout-step__content">
                <p style={{ color: "red", fontWeight: "bold" }}>
                  Giỏ hàng của bạn đang trống. Vui lòng thêm sản phẩm để tiếp tục!
                </p>
              </div>
            ) : (
              cart.map((item, index) => (
                <div className="checkout-step__content" key={item.id || index}>
                  <div className="checkout-cart__item">
                    <div className="checkout-cart__item-photo">
                      <a href="#">
                        <img
                          src={item.image}
                          alt={item.name}
                          width={75}
                          height={100}
                        />
                      </a>
                    </div>
                    <div className="checkout-cart__item-detail">
                      <div className="checkout-cart__item-info">
                        <div className="checkout-cart__item-name">
                          <a href="#">{item.name}</a>
                        </div>
                        <div className="checkout-cart__item-options">
                          <div className="checkout-cart__item-option">
                            <span>{item.variant}</span>
                          </div>
                        </div>
                        <div className="checkout-cart__item-options">
                          <div className="checkout-cart__item-option">
                            <span>Màu: {item.variant}</span>
                          </div>
                        </div>
                        <div className="checkout-cart__item-option">
                          Size: {item.size}
                        </div>
                      </div>
                      <div className="checkout-cart__item-qty">
                        Số lượng: X {item.quantity}
                      </div>
                      <div className="checkout-cart__item-price">
                        <div className="checkout-cart__item-price--normal">
                          Đơn giá: {formatPrice(item.price)}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
            <div className="amount">
              Thành tiền: {formatPrice(total)}
            </div>
          </div>
        </div>
        <div className="checkout-container--right">
          <div>
            <div className="checkout-step checkout-coupon checkout-coupon--desktop">
              <div className="checkout-step__heading">
                <h2 className="checkout-step__title"> Mã ưu đãi</h2>
                <div
                  className="checkout-coupon__show"
                  onClick={() => setShowVoucherModal(true)}
                  style={{ cursor: "pointer" }}
                >
                  <span>
                    {voucher
                      ? `${voucher.voucher_code} - Giảm ${voucher.value}${voucher.type === "%" ? "%" : " ₫"}`
                      : "Chọn hoặc nhập mã"}
                  </span>
                </div>
              </div>
            </div>
            <div className="checkout-step checkout-summary">
              <div className="checkout-step__heading">
                <h2 className="checkout-step__title">Chi tiết đơn hàng</h2>
              </div>
              <div className="checkout-totals">
                <table>
                  <tbody>
                    <tr>
                      <th>
                        <div className="label">Giá trị đơn hàng</div>
                      </th>
                      <td>
                        <div className="price">
                          {formatPrice(total)}
                        </div>
                      </td>
                    </tr>
                    {voucher && (
                      <tr>
                        <th>
                          <label className="label">Mã ưu đãi đã áp dụng</label>
                        </th>
                        <td>
                          <div className="price-discount">
                            {voucher.voucher_code} - Giảm {voucher.value}
                            {voucher.type === "%" ? "%" : " ₫"}
                          </div>
                        </td>
                      </tr>
                    )}
                    <tr>
                      <th>
                        <label className="label">Chiết khấu</label>
                      </th>
                      <td>
                        <div className="price price-discount">
                          -{formatPrice(discountAmount)}
                        </div>
                      </td>
                    </tr>
                    <tr>
                      <th>
                        <div className="label">Phí vận chuyển</div>
                      </th>
                      <td className="price">{formatPrice(0)}</td>
                    </tr>
                  </tbody>
                  <tfoot>
                    <tr className="khtt">
                      <th>Điểm KHTT</th>
                      <td>200</td>
                    </tr>
                    <tr className="grand-totals">
                      <th>
                        <div className="label">Tổng tiền thanh toán</div>
                        <small>(Đã bao gồm thuế VAT)</small>
                      </th>
                      <td className="price">
                        {formatPrice(finalTotal)}
                      </td>
                    </tr>
                    <tr>
                      <td colSpan={2}>
                        <button
                          onClick={handleCheckout}
                          className="btn btn-primary w-full"
                          disabled={cart.length === 0 || !name || !phone || !province || !ward || !detailAddress}
                        >
                          Thanh Toán
                        </button>
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
              <div className="checkout-bottom">
                <div className="grand-totals grand-totals--mb">
                  <div className="grand-totals__label">
                    <span>Tổng tiền thanh toán</span>
                    <div className="grand-totals__note">
                      Đã bao gồm thuế VAT
                    </div>
                  </div>
                  <div className="grand-totals__price">
                    <span>{formatPrice(finalTotal)}</span>
                    <span className="grand-totals__save">
                      (Tiết kiệm {formatPrice(discountAmount)})
                    </span>
                  </div>
                  <div className="checkout-proceed"></div>
                </div>
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
                        <div className="modal-coupon__item-label">
                          Mã ưu đãi
                        </div>
                        <div className="modal-coupon__item-detail">
                          <div className="modal-coupon__item-title">
                            Voucher {item.value}
                            {item.type}
                          </div>
                          <div className="modal-coupon__item-des">
                            Áp dụng từ {formatPrice(item.min_total)} đến {formatPrice(item.max_total)}
                          </div>
                          <div className="modal-coupon__item-code">
                            <span>Mã</span> <strong>{item.voucher_code}</strong>
                          </div>
                          <div className="modal-coupon__item-bottom">
                            <span className="promotion__item-date">
                              HSD: {item.expired_at?.slice(0, 10) || "Không có"}
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
      <HomeEffectsJs />
    </>
  );
}