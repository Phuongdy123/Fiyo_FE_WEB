"use client";

import { useState, useEffect } from "react";
import { useCart } from "@/app/context/Ccart";
import { useAuth } from "@/app/context/CAuth";
import { useToast } from "@/app/context/CToast";
import HomeEffectsJs from "@/app/effects/home";
import { IVoucher } from "@/app/untils/IVoucher";
import { getDefaultAddress } from "@/app/services/Address/SAddress";
import { getAllVoucher } from "@/app/services/Voucher/SVoucher";

/* ===== Chuẩn hoá dữ liệu từ API 34tinhthanh ===== */
type Province = { code: string; name: string };
type Ward = { code: string; name: string; province_code: string };

function normalizeProvinces(raw: any): Province[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .map((p: any) => ({
      code: String(p?.province_code ?? p?.code ?? p?.id ?? "").trim(),
      name: String(p?.province_name ?? p?.name ?? p?.full_name ?? "").trim(),
    }))
    .filter((x) => x.code && x.name);
}

function normalizeWards(raw: any): Ward[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .map((w: any) => ({
      code: String(w?.ward_code ?? w?.code ?? w?.id ?? "").trim(),
      name: String(w?.ward_name ?? w?.name ?? w?.full_name ?? "").trim(),
      province_code: String(w?.province_code ?? w?.parent_code ?? "").trim(),
    }))
    .filter((x) => x.code && x.name);
}

export default function CheckoutComponent() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const userId = user?._id;
  const { cart, clearCart } = useCart();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const total = cart.reduce(
    (acc, item) => acc + (item.price || 0) * (item.quantity || 0),
    0
  );

  const formatPrice = (price: number | null | undefined) =>
    typeof price === "number" && !isNaN(price)
      ? price.toLocaleString("vi-VN") + " ₫"
      : "0 ₫";

  // ===== Provinces / Wards =====
  const [provinces, setProvinces] = useState<Province[]>([]);
  const [wards, setWards] = useState<Ward[]>([]);
  const [isLoadingWards, setIsLoadingWards] = useState(false);

  // ===== Form fields =====
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setMail] = useState("");
  const [province, setProvince] = useState("");
  const [ward, setWard] = useState("");
  const [detailAddress, setDetailAddress] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("cod");

  // ===== Voucher =====
  const [voucher, setVoucher] = useState<IVoucher | null>(null);
  const [voucherList, setVoucherList] = useState<IVoucher[]>([]);
  const [showVoucherModal, setShowVoucherModal] = useState(false);

  // ===== Errors =====
  const [error, setError] = useState<string | null>(null);
  const [formErrors, setFormErrors] = useState({
    name: "",
    phone: "",
    email: "",
    province: "",
    ward: "",
    detailAddress: "",
  });

  // Validate tập trung
  const validateForm = () => {
    const errors = {
      name: "",
      phone: "",
      email: "",
      province: "",
      ward: "",
      detailAddress: "",
    };
    let isValid = true;

    if (!name.trim()) {
      errors.name = "Vui lòng nhập họ và tên!";
      isValid = false;
    }
    if (!phone.trim()) {
      errors.phone = "Vui lòng nhập số điện thoại!";
      isValid = false;
    } else if (!/^\d{10}$/.test(phone.trim())) {
      errors.phone = "Số điện thoại phải có 10 chữ số!";
      isValid = false;
    }
    if (!email.trim()) {
      errors.email = "Vui lòng nhập địa chỉ email!";
      isValid = false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      errors.email = "Địa chỉ email không hợp lệ!";
      isValid = false;
    }
    if (!province) {
      errors.province = "Vui lòng chọn tỉnh/thành phố!";
      isValid = false;
    }
    if (!ward) {
      errors.ward = "Vui lòng chọn phường/xã!";
      isValid = false;
    }
    if (!detailAddress.trim()) {
      errors.detailAddress = "Vui lòng nhập địa chỉ chi tiết!";
      isValid = false;
    }

    setFormErrors(errors);
    return isValid;
  };

  // Validate realtime
  useEffect(() => {
    validateForm();
  }, [name, phone, email, province, ward, detailAddress]);

  // Voucher init
  useEffect(() => {
    const initializeVoucher = () => {
      let saved = sessionStorage.getItem("selectedVoucher");
      const trySet = (s: string | null) => {
        if (!s) return false;
        try {
          const v = JSON.parse(s);
          setVoucher(v);
          return true;
        } catch {
          return false;
        }
      };
      if (!trySet(saved)) {
        saved = localStorage.getItem("selectedVoucher");
        if (trySet(saved)) {
          sessionStorage.setItem("selectedVoucher", saved!);
        }
      }
    };
    initializeVoucher();
  }, []);

  // Lấy danh sách Tỉnh/TP (API mới, KHÔNG lọc)
  useEffect(() => {
    (async () => {
      try {
        setError(null);
        const res = await fetch("https://34tinhthanh.com/api/provinces", {
          headers: { Accept: "application/json" },
          cache: "no-store",
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        setProvinces(normalizeProvinces(data));
      } catch (e: any) {
        console.error("Lỗi provinces:", e);
        setError("Không thể lấy danh sách Tỉnh/Thành. Vui lòng thử lại sau.");
        setProvinces([]);
      }
    })();
  }, []);

  // Lấy Phường/Xã theo province_code
  useEffect(() => {
    if (!province) {
      setWards([]);
      setWard("");
      setIsLoadingWards(false);
      return;
    }
    (async () => {
      try {
        setError(null);
        setIsLoadingWards(true);
        const res = await fetch(
          `https://34tinhthanh.com/api/wards?province_code=${encodeURIComponent(
            province
          )}`,
          { headers: { Accept: "application/json" }, cache: "no-store" }
        );
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        setWards(normalizeWards(data));
        setWard("");
      } catch (e: any) {
        console.error("Lỗi wards:", e);
        setError("Không thể lấy danh sách Phường/Xã. Vui lòng thử lại sau.");
        setWards([]);
      } finally {
        setIsLoadingWards(false);
      }
    })();
  }, [province]);

  // Default address + voucher list
  useEffect(() => {
    const fetchData = async () => {
      try {
        if (!userId) return;

        const def = await getDefaultAddress(
          `http://localhost:3000/api/address/user/${userId}`
        );
        if (def) {
          setProvince(def.province || "");
          setWard(def.ward || "");
          setDetailAddress(def.detail || "");
          setName(def.name || "");
          setPhone(def.phone || "");
          setMail(def.email || "");
        }

        const vouchers = await getAllVoucher("http://localhost:3000/api/voucher");
        setVoucherList(vouchers);
      } catch (e) {
        console.error("Lỗi khi load dữ liệu:", e);
        setError("Không thể tải dữ liệu. Vui lòng thử lại sau.");
      }
    };
    if (userId && provinces.length > 0) fetchData();
  }, [userId, provinces]);

  const handleCheckout = async () => {
    if (isSubmitting) return;

    if (cart.length === 0) {
      showToast("Giỏ hàng trống. Vui lòng thêm sản phẩm để thanh toán!", "error");
      return;
    }

    if (!validateForm()) {
      showToast("Vui lòng kiểm tra và điền đầy đủ thông tin!", "error");
      return;
    }

    if (
      voucher &&
      (total < (voucher.min_total || 0) || total > (voucher.max_total || Infinity))
    ) {
      showToast("Mã ưu đãi không áp dụng được cho đơn hàng này!", "error");
      return;
    }

    setIsSubmitting(true);

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
      province, // lưu code
      ward,     // lưu code
    };

    const discountAmount =
      voucher?.type === "%" ? Math.round((total * (voucher.value || 0)) / 100) : (voucher?.value || 0);
    const finalTotal = Math.max(0, total - (discountAmount || 0));

    const body = {
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
      const res = await fetch("http://localhost:3000/api/orders/guess", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const result = await res.json();

      if (result.status) {
        const orderId = result.order._id;
        clearCart();
        localStorage.removeItem("selectedVoucher");
        sessionStorage.removeItem("selectedVoucher");
        showToast("Đặt hàng thành công!", "success");

        if (paymentMethod === "vnpay" || paymentMethod === "momo") {
          window.location.href = `/page/payment_guess/${paymentMethod}/${orderId}`;
        } else {
          setTimeout(() => (window.location.href = "/"), 1500);
        }
      } else {
        showToast(result.message || "Đặt hàng thất bại!", "error");
      }
    } catch (e) {
      console.error("Lỗi khi đặt hàng:", e);
      showToast("Lỗi khi gửi đơn hàng!", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSelectVoucher = (v: IVoucher) => {
    setVoucher(v);
    localStorage.setItem("selectedVoucher", JSON.stringify(v));
    sessionStorage.setItem("selectedVoucher", JSON.stringify(v));
    setShowVoucherModal(false);
  };

  const discountAmount = voucher
    ? voucher.type === "%"
      ? Math.round((total * (voucher.value || 0)) / 100)
      : (voucher.value || 0)
    : 0;

  const finalTotal = Math.max(0, total - discountAmount);

  return (
    <>
      <div className="checkout-container">
        <div className="checkout-container--left">
          <div className="checkout-step checkout-shipping">
            <div className="checkout-step__heading">
              <h2 className="checkout-step__title">Mua hàng không cần đăng nhập</h2>
            </div>
            <div className="checkout-step__content">
              {error && <div className="alert alert-danger">{error}</div>}

              <form className="checkout-shipping__form checkout-shipping__form--desktop">
                <div className="row">
                  <span className="form-group col-sm-6">
                    <label htmlFor="name">Họ tên</label>
                    <input
                      id="name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="form-control"
                      type="text"
                    />
                    {formErrors.name && (
                      <span className="valid-error" style={{ color: "red", fontSize: 12 }}>
                        {formErrors.name}
                      </span>
                    )}
                  </span>

                  <span className="form-group col-sm-6">
                    <label htmlFor="phone">Số điện thoại</label>
                    <input
                      id="phone"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="form-control"
                      type="text"
                    />
                    {formErrors.phone && (
                      <span className="valid-error" style={{ color: "red", fontSize: 12 }}>
                        {formErrors.phone}
                      </span>
                    )}
                  </span>

                  <span className="form-group col-sm-6">
                    <label htmlFor="email">Địa chỉ Email</label>
                    <input
                      id="email"
                      value={email}
                      onChange={(e) => setMail(e.target.value)}
                      className="form-control"
                      type="text"
                    />
                    {formErrors.email && (
                      <span className="valid-error" style={{ color: "red", fontSize: 12 }}>
                        {formErrors.email}
                      </span>
                    )}
                  </span>
                </div>

                <div className="row">
                  <span className="form-group col-sm-6">
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
                    {formErrors.province && (
                      <span className="valid-error" style={{ color: "red", fontSize: 12 }}>
                        {formErrors.province}
                      </span>
                    )}
                  </span>

                  <span className="form-group col-sm-6">
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
                    {formErrors.ward && (
                      <span className="valid-error" style={{ color: "red", fontSize: 12 }}>
                        {formErrors.ward}
                      </span>
                    )}
                  </span>
                </div>

                <div className="form-group">
                  <label htmlFor="dia-chi">Địa chỉ chi tiết</label>
                  <input
                    id="dia-chi"
                    value={detailAddress}
                    onChange={(e) => setDetailAddress(e.target.value)}
                    className="form-control"
                    type="text"
                    placeholder="Nhập chi tiết địa chỉ"
                  />
                  {formErrors.detailAddress && (
                    <span className="valid-error" style={{ color: "red", fontSize: 12 }}>
                      {formErrors.detailAddress}
                    </span>
                  )}
                </div>
              </form>

              <label className="shipping-method__option">
                <input type="radio" name="shipping-method" defaultChecked />
                <span className="shipping-method__option-content">
                  <span className="shipping-method__option-info">
                    <b className="shipping-method__option-title">Giao tiêu chuẩn 2-5 ngày</b>
                    <br />
                    <span className="shipping-method__option-des">
                      Thời gian giao hàng phụ thuộc đơn vị vận chuyển.
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
                Đơn hàng sẽ được giữ 24 giờ kể từ khi xác nhận có sẵn.
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
                  <b className="payment-method__option-title">Thanh toán khi nhận hàng (COD)</b>
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
                  <b className="payment-method__option-title">Thanh toán bằng VNPAY</b>
                  <span className="payment-method__option-image">
                    <img src="https://canifa.com/_nuxt/img/vnpay.a822fb1.svg" />
                  </span>
                </span>
              </label>
            </div>
          </div>

          <div className="checkout-step checkout-review active">
            <div className="checkout-step__heading">
              <h2 className="checkout-step__title">Sản phẩm ({cart?.length})</h2>
            </div>

            {cart.length === 0 ? (
              <div className="checkout-step__content">
                <p style={{ color: "red", fontWeight: "bold" }}>
                  Giỏ hàng đang trống. Vui lòng thêm sản phẩm để tiếp tục!
                </p>
              </div>
            ) : (
              cart.map((item, index) => (
                <div className="checkout-step__content" key={item.id || index}>
                  <div className="checkout-cart__item">
                    <div className="checkout-cart__item-photo">
                      <a href="#">
                        <img src={item.image} alt={item.name} width={75} height={100} />
                      </a>
                    </div>
                    <div className="checkout-cart__item-detail">
                      <div className="checkout-cart__item-info">
                        <div className="checkout-cart__item-name">
                          <a href="#">{item.name}</a>
                        </div>
                        <div className="checkout-cart__item-option">Màu: {item.variant}</div>
                        <div className="checkout-cart__item-option">Size: {item.size}</div>
                      </div>
                      <div className="checkout-cart__item-qty">Số lượng: x {item.quantity}</div>
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

            <div className="amount">Thành tiền: {formatPrice(total)}</div>
          </div>
        </div>

        <div className="checkout-container--right">
          <div>
            <div className="checkout-step checkout-coupon checkout-coupon--desktop">
              <div className="checkout-step__heading">
                <h2 className="checkout-step__title">Mã ưu đãi</h2>
                <div
                  className="checkout-coupon__show"
                  onClick={() => setShowVoucherModal(true)}
                  style={{ cursor: "pointer" }}
                >
                  <span>
                    {voucher
                      ? `${voucher.voucher_code} - Giảm ${
                          voucher.type === "%" ? `${voucher.value}%` : `${voucher.value} ₫`
                        }`
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
                        <div className="price">{formatPrice(total)}</div>
                      </td>
                    </tr>
                    {voucher && (
                      <tr>
                        <th>
                          <label className="label">Mã ưu đãi đã áp dụng</label>
                        </th>
                        <td>
                          <div className="price-discount">
                            {voucher.voucher_code} – Giảm{" "}
                            {voucher.type === "%" ? `${voucher.value}%` : `${voucher.value} ₫`}
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
                      <td>{Math.max(0, total - discountAmount)}</td>
                    </tr>
                    <tr className="grand-totals">
                      <th>
                        <div className="label">Tổng tiền thanh toán</div>
                        <small>(Đã bao gồm thuế VAT)</small>
                      </th>
                      <td className="price">{formatPrice(finalTotal)}</td>
                    </tr>
                    <tr>
                      <td colSpan={2}>
                        <button
                          onClick={handleCheckout}
                          className="btn btn-primary w-full"
                          disabled={cart.length === 0 || isSubmitting}
                        >
                          {isSubmitting ? "Đang xử lý..." : "Thanh Toán"}
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
                    <div className="grand-totals__note">Đã bao gồm thuế VAT</div>
                  </div>
                  <div className="grand-totals__price">
                    <span>{formatPrice(finalTotal)}</span>
                    <span className="grand-totals__save">
                      (Tiết kiệm {formatPrice(discountAmount)})
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Modal Voucher */}
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
                    <button disabled id="applyButton" className="modal-coupon__form-add">
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
                    <button className="btn btn-primary" onClick={() => setShowVoucherModal(false)}>
                      Áp dụng
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <HomeEffectsJs />
    </>
  );
}
