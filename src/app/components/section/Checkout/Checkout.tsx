"use client";

import { useState, useEffect, useRef } from "react";
import { useCart } from "@/app/context/Ccart";
import { useAuth } from "@/app/context/CAuth";
import { IVoucher } from "@/app/untils/IVoucher";
import {
  getAllAddress,
  getDefaultAddress,
  addAddress,
} from "@/app/services/Address/SAddress";
import { IAddress } from "@/app/untils/IAddress";
import { getVoucherByUserId } from "@/app/services/Voucher/SVoucher";
import { useToast } from "@/app/context/CToast";
import { getColorStyle } from "../../shared/ColorBox";

/* ===== Chuẩn hoá dữ liệu từ API 34tinhthanh ===== */
type NormProvince = { code: string; name: string };
type NormWard = { code: string; name: string; province_code: string };

function normalizeProvinces(raw: any): NormProvince[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .map((p: any) => ({
      code: String(p?.province_code ?? p?.code ?? p?.id ?? "").trim(),
      name: String(p?.province_name ?? p?.name ?? p?.full_name ?? "").trim(),
    }))
    .filter((x) => x.code && x.name);
}

function normalizeWards(raw: any): NormWard[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .map((w: any) => ({
      code: String(w?.ward_code ?? w?.code ?? w?.id ?? "").trim(),
      name: String(w?.ward_name ?? w?.name ?? w?.full_name ?? "").trim(),
      province_code: String(w?.province_code ?? w?.parent_code ?? "").trim(),
    }))
    .filter((x) => x.code && x.name);
}

/* ===== Idempotency key helper ===== */
function genIdemKey() {
  // Trình duyệt mới có crypto.randomUUID; fallback nếu thiếu
  return (globalThis.crypto && "randomUUID" in globalThis.crypto)
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export default function CheckoutComponent() {
  const [shopNames, setShopNames] = useState<Record<string, string>>({});
  const { user } = useAuth();
  const { cart, clearCart } = useCart();
  const { showToast } = useToast();

  const userId = user?._id;
  const [isSubmitting, setIsSubmitting] = useState(false);
  const lockRef = useRef(false); // 👈 chống bấm liên tiếp

  const formatPrice = (price: number | null | undefined) =>
    typeof price === "number" && !isNaN(price)
      ? price.toLocaleString("vi-VN")
      : "0";

  const formatDate = (dateInput: Date | string | null | undefined) => {
    if (!dateInput) return "";
    const date = typeof dateInput === "string" ? new Date(dateInput) : dateInput;
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const total = cart.reduce(
    (acc, item) => acc + ((item.price || 0) * (item.quantity || 0)),
    0
  );

  // === Địa chỉ & tỉnh/ward ===
  const [provinces, setProvinces] = useState<NormProvince[]>([]);
  const [wards, setWards] = useState<NormWard[]>([]);
  const [isLoadingWards, setIsLoadingWards] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [paymentMethod, setPaymentMethod] = useState(""); // "cod" | "vnpay" | "zalopay"
  const [showAddressModal, setShowAddressModal] = useState(false);

  const [voucher, setVoucher] = useState<IVoucher | null>(null);
  const [defaultAddress, setDefaultAddress] = useState<IAddress | null>(null);
  const [addressList, setAddressList] = useState<IAddress[]>([]);
  const [voucherList, setVoucherList] = useState<IVoucher[]>([]);
  const [showVoucherModal, setShowVoucherModal] = useState(false);
  const [showNewAddressModal, setShowNewAddressModal] = useState(false);

  const [newAddress, setNewAddress] = useState<IAddress>({
    name: "",
    phone: "",
    address: "",
    is_default: false,
    detail: "",
    type: "Nhà Riêng",
    user_id: userId || "",
    province: "",
    ward: "",
  });

  const [selectedAddress, setSelectedAddress] = useState({
    province: "",
    ward: "",
  });

  const [formErrors, setFormErrors] = useState({
    name: "",
    phone: "",
    province: "",
    ward: "",
    detail: "",
  });

  const validateForm = () => {
    const errors = { name: "", phone: "", province: "", ward: "", detail: "" };
    let isValid = true;

    if (!newAddress.name.trim()) {
      errors.name = "Vui lòng nhập họ và tên!";
      isValid = false;
    }
    if (!newAddress.phone.trim()) {
      errors.phone = "Vui lòng nhập số điện thoại!";
      isValid = false;
    } else if (!/^\d{10}$/.test(newAddress.phone.trim())) {
      errors.phone = "Số điện thoại phải có 10 chữ số!";
      isValid = false;
    }
    if (!selectedAddress.province) {
      errors.province = "Vui lòng chọn tỉnh/thành phố!";
      isValid = false;
    }
    if (!selectedAddress.ward) {
      errors.ward = "Vui lòng chọn phường/xã!";
      isValid = false;
    }
    if (!newAddress.detail.trim()) {
      errors.detail = "Vui lòng nhập địa chỉ chi tiết!";
      isValid = false;
    }

    setFormErrors(errors);
    return isValid;
  };

  /* ====== Voucher init from storage ====== */
  useEffect(() => {
    const initializeVoucher = () => {
      let saved = sessionStorage.getItem("selectedVoucher");
      const trySet = (s: string | null) => {
        if (!s) return false;
        try {
          const v = JSON.parse(s);
          if (typeof v?.value === "number") {
            setVoucher(v);
            return true;
          }
        } catch {}
        return false;
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

  /* ====== Provinces (API mới, KHÔNG lọc) ====== */
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
        setError("Không thể tải danh sách Tỉnh/Thành.");
        setProvinces([]);
      }
    })();
  }, []);

  /* ====== Wards theo province_code ====== */
  useEffect(() => {
    if (!selectedAddress.province) {
      setWards([]);
      setIsLoadingWards(false);
      return;
    }
    (async () => {
      try {
        setError(null);
        setIsLoadingWards(true);
        const res = await fetch(
          `https://34tinhthanh.com/api/wards?province_code=${encodeURIComponent(
            selectedAddress.province
          )}`,
          { headers: { Accept: "application/json" }, cache: "no-store" }
        );
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        setWards(normalizeWards(data));
      } catch (e: any) {
        console.error("Lỗi wards:", e);
        setError("Không thể tải danh sách Phường/Xã.");
        setWards([]);
      } finally {
        setIsLoadingWards(false);
      }
    })();
  }, [selectedAddress.province]);

  /* ====== Default address + address list + vouchers ====== */
  useEffect(() => {
    const fetchData = async () => {
      try {
        const def = await getDefaultAddress(
          `https://fiyo-be.onrender.com/api/address/user/${userId}`
        );
        if (def) {
          setDefaultAddress(def);
          setSelectedAddress({
            province: def.province || "",
            ward: def.ward || "",
          });
        }

        const all = await getAllAddress(
          `https://fiyo-be.onrender.com/api/address/user/${userId}`
        );
        setAddressList(all);

        if (userId) {
          const { vouchers } = await getVoucherByUserId(userId);
          setVoucherList(vouchers);
        }
      } catch (e) {
        console.error("Lỗi khi tải dữ liệu:", e);
        setError("Không thể tải dữ liệu. Vui lòng thử lại sau.");
      }
    };
    if (userId) fetchData();
  }, [userId]);

  // ===== Giảm giá / Phí ship / Tổng =====
  const discountAmount = voucher
    ? voucher.type === "%"
      ? Math.round((total * (voucher.value || 0)) / 100)
      : (voucher.value || 0)
    : 0;

  const shippingFee = total - discountAmount < 100000 ? 20000 : 0;
  const finalTotal = Math.max(0, total - discountAmount + shippingFee);

  useEffect(() => {
    console.log("Cart:", cart);
    console.log("Total:", total);
    console.log("Discount Amount:", discountAmount);
    console.log("Final Total:", finalTotal);
  }, [cart, voucher]);

  /* ====== CHỈ GỌI 1 API /api/orders & redirect trực tiếp payment_url ====== */
  const handleCheckout = async () => {
    if (isSubmitting || lockRef.current) return;

    if (cart.length === 0) {
      showToast("Không có dữ liệu sản phẩm để thanh toán!", "error");
      return;
    }
    if (!paymentMethod) {
      showToast("Vui lòng chọn phương thức thanh toán!", "error");
      return;
    }
    if (!defaultAddress?._id) {
      showToast("Vui lòng chọn địa chỉ giao hàng!", "error");
      return;
    }
    if (isNaN(finalTotal)) {
      showToast("Tổng tiền không hợp lệ. Vui lòng kiểm tra giỏ hàng!", "error");
      return;
    }

    setIsSubmitting(true);
    lockRef.current = true;

    const data = {
      user_id: user?._id,
      address_id: defaultAddress._id,
      voucher_id: voucher?._id,
      total_price: finalTotal,
      payment_method: paymentMethod, // "cod" | "vnpay" | "zalopay"
      status_order: "pending",
      products: cart.map((item) => ({
        product_id: item.id,
        variant_id: item.variant_id,
        size_id: item.size_id,
        quantity: item.quantity,
        image: item.image,
      })),
      locale: "vn",
    };

    try {
      const res = await fetch("https://fiyo-be.onrender.com/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-idempotency-key": genIdemKey(), // 👈 chống double submit
        },
        body: JSON.stringify(data),
      });

      const result = await res.json();

      if (!result?.status) {
        showToast(result?.message || "Đặt hàng không thành công!", "error");
        return;
      }

      if (paymentMethod === "cod") {
        // COD: clear luôn
        sessionStorage.removeItem("selectedVoucher");
        localStorage.removeItem("selectedVoucher");
        clearCart();
        showToast("Đặt hàng thành công!", "success");
        setTimeout(() => (window.location.href = "/page/order"), 1200);
        return;
      }

      // Online (VNPAY / ZaloPay): redirect trực tiếp sang cổng thanh toán
      const paymentUrl = result?.payment_url;
      if (paymentUrl) {
        window.location.href = paymentUrl;
      } else {
        showToast("Không lấy được link thanh toán, thử lại sau.", "error");
      }
    } catch (e) {
      console.error("Lỗi khi đặt hàng:", e);
      showToast("Lỗi khi gửi đơn hàng!", "error");
    } finally {
      setIsSubmitting(false);
      lockRef.current = false;
    }
  };

  const handleSelectAddress = (addr: IAddress) => {
    setDefaultAddress(addr);
    setSelectedAddress({
      province: addr.province || "",
      ward: addr.ward || "",
    });
    setShowAddressModal(false);
  };

  const handleSelectVoucher = (v: IVoucher) => {
    setVoucher(v);
    localStorage.setItem("selectedVoucher", JSON.stringify(v));
    sessionStorage.setItem("selectedVoucher", JSON.stringify(v));
    setShowVoucherModal(false);
  };

  const handleSaveAddress = async () => {
    if (!validateForm()) return;

    try {
      const provinceName =
        provinces.find((p) => p.code === selectedAddress.province)?.name || "";
      const wardName =
        wards.find((w) => w.code === selectedAddress.ward)?.name || "";

      const fullAddress = [newAddress.detail?.trim(), wardName, provinceName]
        .filter(Boolean)
        .join(", ")
        .replace(/,\s*,/g, ", ")
        .replace(/,\s*$/, "");

      const addressData: IAddress = {
        ...newAddress,
        address: fullAddress,
        user_id: userId || "",
        province: selectedAddress.province, // code
        ward: selectedAddress.ward,         // code
      };

      await addAddress(addressData);
      showToast("Thêm địa chỉ thành công!", "success");
      setShowAddressModal(false);
      setShowNewAddressModal(false);

      const updated = await getAllAddress(
        `https://fiyo-be.onrender.com/api/address/user/${userId}`
      );
      setAddressList(updated);

      if (addressData.is_default) {
        setDefaultAddress(addressData);
        setSelectedAddress({
          province: addressData.province ?? "",
          ward: addressData.ward ?? "",
        });
      }

      setTimeout(() => window.location.reload(), 1500);
    } catch (e) {
      console.error("Lỗi khi lưu địa chỉ:", e);
      showToast("Không thể lưu địa chỉ. Vui lòng thử lại!", "error");
    }
  };

  const isFormValid =
    newAddress.name.trim() &&
    newAddress.phone.trim() &&
    /^\d{10}$/.test(newAddress.phone.trim()) &&
    selectedAddress.province &&
    selectedAddress.ward &&
    newAddress.detail.trim();

  if (
    !cart ||
    !Array.isArray(cart) ||
    cart.some((item) => item.price == null || item.quantity == null)
  ) {
    return (
      <div className="alert alert-danger">
        Dữ liệu giỏ hàng không hợp lệ. Vui lòng làm mới trang hoặc xóa giỏ hàng.
      </div>
    );
  }
  
useEffect(() => {
  async function fetchShops() {
    const names: Record<string, string> = {};
    for (const item of cart) {
      if (item.shop_id && !names[item.shop_id]) {
        try {
          const res = await fetch(`https://fiyo-be.onrender.com/api/shop/${item.shop_id}`);
          const data = await res.json();
          if (data?.name || data?.shop?.name) {
            names[item.shop_id] = data.name || data.shop.name;
          }
        } catch (e) {
          console.error("Không lấy được shop:", e);
        }
      }
    }
    setShopNames(names);
  }
  if (cart.length > 0) fetchShops();
}, [cart]);


  return (
    <>
      <div className="checkout-container">
        <div className="checkout-container--left">
          <div className="checkout-step checkout-shipping">
            <div className="checkout-step__heading">
              <h2 className="checkout-step__title">Thông tin giao hàng</h2>
            </div>
            <div className="checkout-step__content">
              {error && <div className="alert alert-danger">{error}</div>}
              <div className="shipping-address__items shipping-address__items--desktop">
                {defaultAddress ? (
                  <div className="shipping-address__item">
                    <div
                      className="shipping-address__item-edit"
                      onClick={() => setShowAddressModal(true)}
                    >
                      <span>Sửa</span>
                    </div>
                    <div className="shipping-address__item-top">
                      <span className="shipping-address__item-name">
                        {defaultAddress.name}
                      </span>
                      <span className="shipping-address__item-phone">
                        {defaultAddress.phone}
                      </span>
                    </div>
                    <div className="shipping-address__item-address">
                      {defaultAddress.address}
                    </div>
                  </div>
                ) : (
                  <div className="shipping-address__item">
                    <button
                      className="btn btn-primary"
                      onClick={() => setShowNewAddressModal(true)}
                    >
                      Thêm địa chỉ
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="checkout-step payment-method">
            <label className="shipping-method__option">
              <input type="radio" name="shipping-method" defaultChecked />
              <span className="shipping-method__option-content">
                <span className="shipping-method__option-info">
                  <b className="shipping-method__option-title">
                    Giao tiêu chuẩn 2-5 ngày
                  </b>
                  <br />
                  <span className="shipping-method__option-des">
                    Thời gian giao hàng tùy thuộc vào điều kiện của đơn vị vận
                    chuyển. Dự kiến: 2-5 ngày.
                  </span>
                </span>
                <span className="shipping-method__option-price">
                  {formatPrice(shippingFee)} ₫
                </span>
              </span>
            </label>

            <div className="checkout-step__heading">
              <h2 className="checkout-step__title">Phương thức thanh toán</h2>
            </div>
            <div className="checkout-step-content">
              <div className="payment-method__note">
                Đơn hàng sẽ được giữ tại cửa hàng trong 24 giờ kể từ khi được
                xác nhận có sẵn. Sau thời gian này, đơn hàng sẽ bị hủy.
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
                    Thanh toán qua VNPAY
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
              <h2 className="checkout-step__title">Sản phẩm ({cart?.length})</h2>
            </div>
            {cart.map((item, index) => (
              <div className="checkout-step__content" key={index}>
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
                      
                      
                      <div className="checkout-cart__item-options">
                        <div className="checkout-cart__item-option">
                          <span
                            className="swatch-option"
                            style={{
                              ...getColorStyle(item.variant),
                              border: "1px solid #ccc",
                              width: "16px",
                              height: "16px",
                              display: "inline-block",
                              borderRadius: "50%",
                              marginRight: "4px",
                            }}
                          />
                          <span className="value">{item.variant}</span>
                        </div>
                      </div>
                      
                      <div className="checkout-cart__item-option">
                        Kích thước: {item.size}
                      </div>
                      <div className="checkout-cart__item-name">
        <b>Shop :</b> {shopNames[item.shop_id] || "Đang tải..."}
      </div>
                    </div>
                    <div className="checkout-cart__item-qty">
                      Số lượng: x{item.quantity}
                    </div>
                    <div className="checkout-cart__item-price">
                      <div className="checkout-cart__item-price--normal">
                        Đơn giá: {formatPrice(item.price)} ₫
                      </div>
                      
                    </div>
                    
                  </div>
                </div>
              </div>
            ))}
            <div className="amount">Thành tiền: {formatPrice(total)} ₫</div>
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
                          voucher.type === "%" ? `${voucher.value}%` : formatPrice(voucher.value)
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
                      <th><div className="label">Giá trị đơn hàng</div></th>
                      <td><div className="price">{formatPrice(total)} ₫</div></td>
                    </tr>
                    {voucher && (
                      <tr>
                        <th><label className="label">Mã ưu đãi đã áp dụng</label></th>
                        <td>
                          <div className="price-discount">
                            {voucher.voucher_code} – Giảm{" "}
                            {voucher.type === "%" ? `${voucher.value}%` : formatPrice(voucher.value)}
                          </div>
                        </td>
                      </tr>
                    )}
                    <tr>
                      <th><label className="label">Chiết khấu</label></th>
                      <td><div className="price price-discount">-{formatPrice(discountAmount)} ₫</div></td>
                    </tr>
                    <tr>
                      <th><div className="label">Phí vận chuyển</div></th>
                      <td className="price">{formatPrice(shippingFee)} ₫</td>
                    </tr>
                  </tbody>
                  <tfoot>
                    <tr className="khtt">
                      <th>Điểm KHTT</th>
                      <td>{finalTotal}</td>
                    </tr>
                    <tr className="grand-totals">
                      <th>
                        <div className="label">Tổng tiền thanh toán</div>
                        <small>(Đã bao gồm thuế VAT)</small>
                      </th>
                      <td className="price">{formatPrice(finalTotal)} ₫</td>
                    </tr>
                    <tr>
                      <td colSpan={2}>
                        <button
                          onClick={handleCheckout}
                          className="btn btn-primary w-full"
                          disabled={cart.length === 0 || isSubmitting}
                        >
                          {isSubmitting ? "Đang xử lý..." : "Thanh toán"}
                        </button>
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          </div>

          {/* Modal chọn địa chỉ */}
          {showAddressModal && (
            <div className="modal-address modal">
              <div className="modal-backdrop" />
              <div className="modal-container">
                <div className="modal-content">
                  <div className="modal-header">
                    <div className="modal-close" onClick={() => setShowAddressModal(false)}>
                      <span className="screen-reader-text">Đóng</span>
                    </div>
                    <h4 className="modal-title">Sổ địa chỉ</h4>
                  </div>
                  <div className="modal-body">
                    {addressList.map((add) => (
                      <div
                        key={add._id}
                        className="modal-address-item"
                        onClick={() => handleSelectAddress(add)}
                        style={{ cursor: "pointer" }}
                      >
                        <div className="modal-address-item-info">
                          <div className="modal-address-item-top">
                            <div className="modal-address-item-name">{add.name}</div>
                            <div className="modal-address-item-phone">{add.phone}</div>
                          </div>
                          <div className="modal-address-item-address">{add.address}</div>
                          {add.is_default && (
                            <label className="modal-address-item-default">
                              <span>Địa chỉ mặc định</span>
                            </label>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="modal-footer">
                    <button
                      className="btn btn-primary"
                      onClick={() => {
                        setNewAddress({
                          name: "",
                          phone: "",
                          address: "",
                          is_default: false,
                          detail: "",
                          type: "Nhà Riêng",
                          user_id: userId || "",
                          province: "",
                          ward: "",
                        });
                        setSelectedAddress({ province: "", ward: "" });
                        setFormErrors({ name: "", phone: "", province: "", ward: "", detail: "" });
                        setShowAddressModal(false);
                        setShowNewAddressModal(true);
                      }}
                    >
                      Thêm địa chỉ
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Modal thêm địa chỉ */}
          <div
            className="address-new modal in"
            style={{ display: showNewAddressModal ? "flex" : "none" }}
          >
            <div className="modal-backdrop" />
            <div className="address-new__container">
              <div className="address-new__content">
                <div className="address-new__header">
                  <div
                    className="address-new__close"
                    onClick={() => {
                      setNewAddress({
                        name: "",
                        phone: "",
                        address: "",
                        is_default: false,
                        detail: "",
                        type: "Nhà Riêng",
                        user_id: userId || "",
                        province: "",
                        ward: "",
                      });
                      setFormErrors({ name: "", phone: "", province: "", ward: "", detail: "" });
                      setShowNewAddressModal(false);
                    }}
                  >
                    <span className="screen-reader-text">Đóng</span>
                  </div>
                  <h4 className="address-new__title">Thêm địa chỉ mới</h4>
                </div>

                <div className="address-new__body">
                  <div className="address-new__form">
                    <div className="form-row">
                      <div className="form-group">
                        <label htmlFor="name">Họ và tên</label>
                        <input
                          type="text"
                          id="name"
                          placeholder="Nhập họ và tên"
                          className="form-control"
                          value={newAddress.name}
                          onChange={(e) => {
                            setNewAddress({ ...newAddress, name: e.target.value });
                            setFormErrors({
                              ...formErrors,
                              name: e.target.value.trim() ? "" : "Vui lòng nhập họ và tên!",
                            });
                          }}
                        />
                        {formErrors.name && (
                          <span className="error-text" style={{ color: "red", fontSize: 12 }}>
                            {formErrors.name}
                          </span>
                        )}
                      </div>

                      <div className="form-group">
                        <label htmlFor="phone">Số điện thoại</label>
                        <input
                          type="text"
                          id="phone"
                          placeholder="Nhập số điện thoại"
                          className="form-control"
                          value={newAddress.phone}
                          onChange={(e) => {
                            setNewAddress({ ...newAddress, phone: e.target.value });
                            setFormErrors({
                              ...formErrors,
                              phone: e.target.value.trim()
                                ? /^\d{10}$/.test(e.target.value.trim())
                                  ? ""
                                  : "Số điện thoại phải có 10 chữ số!"
                                : "Vui lòng nhập số điện thoại!",
                            });
                          }}
                        />
                        {formErrors.phone && (
                          <span className="error-text" style={{ color: "red", fontSize: 12 }}>
                            {formErrors.phone}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="form-row">
                      <div className="form-group">
                        <label htmlFor="province">Tỉnh / Thành phố</label>
                        <select
                          id="province"
                          className="form-control"
                          value={selectedAddress.province}
                          onChange={(e) => {
                            setSelectedAddress({ province: e.target.value, ward: "" });
                            setNewAddress({ ...newAddress, province: e.target.value, ward: "" });
                            setFormErrors({
                              ...formErrors,
                              province: e.target.value ? "" : "Vui lòng chọn tỉnh/thành phố!",
                              ward: "",
                            });
                          }}
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
                          <span className="error-text" style={{ color: "red", fontSize: 12 }}>
                            {formErrors.province}
                          </span>
                        )}
                      </div>

                      <div className="form-group">
                        <label htmlFor="ward">Phường / Xã</label>
                        <select
                          id="ward"
                          className="form-control"
                          value={selectedAddress.ward}
                          onChange={(e) => {
                            setSelectedAddress({ ...selectedAddress, ward: e.target.value });
                            setNewAddress({ ...newAddress, ward: e.target.value });
                            setFormErrors({
                              ...formErrors,
                              ward: e.target.value ? "" : "Vui lòng chọn phường/xã!",
                            });
                          }}
                          disabled={!selectedAddress.province || isLoadingWards}
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
                          <span className="error-text" style={{ color: "red", fontSize: 12 }}>
                            {formErrors.ward}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="form-group">
                      <label htmlFor="dia-chi">Địa chỉ chi tiết</label>
                      <input
                        type="text"
                        id="dia-chi"
                        placeholder="Tòa nhà, số nhà, tên đường"
                        className="form-control"
                        value={newAddress.detail}
                        onChange={(e) => {
                          setNewAddress({ ...newAddress, detail: e.target.value });
                          setFormErrors({
                            ...formErrors,
                            detail: e.target.value.trim() ? "" : "Vui lòng nhập địa chỉ chi tiết!",
                          });
                        }}
                      />
                      {formErrors.detail && (
                        <span className="error-text" style={{ color: "red", fontSize: 12 }}>
                          {formErrors.detail}
                        </span>
                      )}
                    </div>

                    <div className="form-group form-address-type">
                      <label>Loại địa chỉ</label>
                      <div className="control">
                        {["Nhà Riêng", "Công Ty"].map((type) => (
                          <label key={type} className="radio">
                            <input
                              type="radio"
                              name="type"
                              value={type}
                              checked={newAddress.type === type}
                              onChange={(e) =>
                                setNewAddress({
                                  ...newAddress,
                                  type: e.target.value as "Nhà Riêng" | "Công Ty",
                                })
                              }
                            />
                            <span>{type}</span>
                          </label>
                        ))}
                      </div>
                    </div>

                    <div className="form-checkbox">
                      <input
                        type="checkbox"
                        id="checkbox1"
                        checked={newAddress.is_default}
                        onChange={(e) =>
                          setNewAddress({ ...newAddress, is_default: e.target.checked })
                        }
                      />
                      <label htmlFor="checkbox1">
                        <span>Đặt làm địa chỉ mặc định</span>
                      </label>
                    </div>
                  </div>
                </div>

                <div className="address-new__footer">
                  <button
                    className="address-new__button--save btn btn-primary"
                    onClick={handleSaveAddress}
                    disabled={!isFormValid}
                  >
                    Lưu thông tin
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Modal voucher */}
          {showVoucherModal && (
            <div className="modal-coupon__container">
              <div className="modal-coupon__content">
                <div className="modal-coupon__header">
                  <div
                    className="modal-coupon__close"
                    onClick={() => setShowVoucherModal(false)}
                    style={{ cursor: "pointer" }}
                  >
                    <span className="screen-reader-text">Đóng</span>
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
                              Áp dụng từ {formatPrice(item.min_total)} đến {formatPrice(item.max_total)}₫
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
                    <button className="btn btn-primary" onClick={() => setShowVoucherModal(false)}>
                      Áp dụng
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
          {/* /Modal voucher */}
        </div>
      </div>
    </>
  );
}
