"use client";

import { useState, useEffect } from "react";
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
  const [showNewAddressModal, setShowNewAddressModal] = useState(false);
  const { showToast } = useToast();
  const userId = user?._id;
  const { cart, clearCart } = useCart();

  const formatPrice = (price: number | null | undefined) =>
    (typeof price === "number" && !isNaN(price))
      ? price.toLocaleString("vi-VN") + " ₫"
      : "0 ₫";

  // Add formatDate function from VoucherPage
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

  const VALID_PROVINCE_CODES = [
    "01",
    "26",
    "04",
    "11",
    "12",
    "14",
    "20",
    "22",
    "38",
    "40",
    "42",
    "02",
    "10",
    "19",
    "25",
    "27",
    "33",
    "31",
    "37",
    "45",
    "48",
    "51",
    "52",
    "56",
    "66",
    "68",
    "72",
    "75",
    "79",
    "86",
    "87",
    "89",
    "92",
    "96",
  ];

  const [provinces, setProvinces] = useState<Province[]>([]);
  const [wards, setWards] = useState<Ward[]>([]);
  const [isLoadingWards, setIsLoadingWards] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [paymentMethod, setPaymentMethod] = useState("");
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [voucher, setVoucher] = useState<IVoucher | null>(null);
  const [defaultAddress, setDefaultAddress] = useState<IAddress | null>(null);
  const [addressList, setAddressList] = useState<IAddress[]>([]);
  const [voucherList, setVoucherList] = useState<IVoucher[]>([]);
  const [showVoucherModal, setShowVoucherModal] = useState(false);
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

  // Hàm kiểm tra tính hợp lệ của form
  const validateForm = () => {
    const errors = {
      name: "",
      phone: "",
      province: "",
      ward: "",
      detail: "",
    };
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

  // Initialize voucher from localStorage or sessionStorage
  useEffect(() => {
    const initializeVoucher = () => {
      let savedVoucher = sessionStorage.getItem("selectedVoucher");
      if (savedVoucher) {
        try {
          const parsedVoucher = JSON.parse(savedVoucher);
          if (typeof parsedVoucher.value === "number") {
            setVoucher(parsedVoucher);
            return;
          } else {
            console.error("Invalid voucher value in sessionStorage:", parsedVoucher);
            sessionStorage.removeItem("selectedVoucher");
          }
        } catch (err) {
          console.error("Mã ưu đãi trong sessionStorage không hợp lệ:", err);
          sessionStorage.removeItem("selectedVoucher");
        }
      }
      savedVoucher = localStorage.getItem("selectedVoucher");
      if (savedVoucher) {
        try {
          const parsedVoucher = JSON.parse(savedVoucher);
          if (typeof parsedVoucher.value === "number") {
            setVoucher(parsedVoucher);
            sessionStorage.setItem("selectedVoucher", JSON.stringify(parsedVoucher));
          } else {
            console.error("Invalid voucher value in localStorage:", parsedVoucher);
            localStorage.removeItem("selectedVoucher");
          }
        } catch (err) {
          console.error("Mã ưu đãi trong localStorage không hợp lệ:", err);
          localStorage.removeItem("selectedVoucher");
        }
      }
    };
    initializeVoucher();
  }, []);

  // Fetch provinces from API and filter for 34 provinces
  useEffect(() => {
    const fetchProvinces = async () => {
      try {
        setError(null);
        const response = await fetch(
          "https://tinhthanhpho.com/api/v1/new-provinces",
          {
            headers: { Accept: "application/json" },
          }
        );
        if (!response.ok)
          throw new Error(`Lỗi HTTP! trạng thái: ${response.status}`);
        const data = await response.json();
        if (data.success) {
          const filteredProvinces = data.data
            .filter((province: Province) =>
              VALID_PROVINCE_CODES.includes(province.code.padStart(2, "0"))
            )
            .map((province: Province) => ({
              ...province,
              code: province.code.padStart(2, "0"),
            }));
          setProvinces(filteredProvinces);
        } else {
          throw new Error("API trả về success: false");
        }
      } catch (error: any) {
        console.error("Lỗi khi lấy danh sách tỉnh/thành phố:", error);
        setError("Không thể tải danh sách tỉnh/thành phố. Vui lòng thử lại sau.");
      }
    };
    fetchProvinces();
  }, []);

  // Fetch wards when province changes
  useEffect(() => {
    if (!selectedAddress.province) {
      setWards([]);
      setError(null);
      setIsLoadingWards(false);
      return;
    }

    const fetchWards = async () => {
      try {
        setError(null);
        setIsLoadingWards(true);
        const paddedCode = selectedAddress.province.padStart(2, "0");
        const response = await fetch(
          `https://tinhthanhpho.com/api/v1/new-provinces/${paddedCode}/wards`,
          { headers: { Accept: "application/json" } }
        );
        if (!response.ok)
          throw new Error(`Lỗi HTTP! trạng thái: ${response.status}`);
        const data = await response.json();
        if (data.success) {
          setWards(data.data || []);
        } else {
          throw new Error("API trả về success: false");
        }
      } catch (error: any) {
        console.error("Lỗi khi lấy danh sách phường/xã:", error);
        setError("Không thể tải danh sách phường/xã. Vui lòng thử lại sau.");
        setWards([]);
      } finally {
        setIsLoadingWards(false);
      }
    };
    fetchWards();
  }, [selectedAddress.province]);

  // Fetch address and voucher data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const defaultAddress = await getDefaultAddress(
          `http://fiyo.click/api/address/user/${userId}`
        );
        if (defaultAddress) {
          setDefaultAddress(defaultAddress);
          setSelectedAddress({
            province: defaultAddress.province || "",
            ward: defaultAddress.ward || "",
          });
        }

        const allAddresses = await getAllAddress(
          `http://fiyo.click/api/address/user/${userId}`
        );
        setAddressList(allAddresses);

        if (userId) {
          const { vouchers } = await getVoucherByUserId(userId);
          setVoucherList(vouchers);
        }
      } catch (error) {
        console.error("Lỗi khi tải dữ liệu:", error);
        setError("Không thể tải dữ liệu. Vui lòng thử lại sau.");
      }
    };

    if (userId) fetchData();
  }, [userId]);

  useEffect(() => {
    console.log("Cart:", cart);
    console.log("Total:", total);
    console.log("Discount Amount:", discountAmount);
    console.log("Final Total:", finalTotal);
  }, [cart, voucher]);

  const handleCheckout = async () => {
    if (cart.length === 0) {
      showToast("Không có dữ liệu sản phẩm để thanh toán!", "error");
      return;
    }

    if (!paymentMethod) {
      showToast("Vui lòng chọn phương thức thanh toán!", "error");
      return;
    }
    if (!defaultAddress || !defaultAddress._id) {
      showToast("Vui lòng chọn địa chỉ giao hàng!", "error");
      return;
    }
    if (isNaN(finalTotal)) {
      showToast("Tổng tiền không hợp lệ. Vui lòng kiểm tra giỏ hàng!", "error");
      return;
    }

    const data = {
      user_id: user?._id,
      address_id: defaultAddress._id,
      voucher_id: voucher?._id,
      total_price: finalTotal,
      payment_method: paymentMethod,
      status_order: "pending",
      products: cart.map((item) => ({
        product_id: item.id,
        variant_id: item.variant_id,
        size_id: item.size_id,
        quantity: item.quantity,
        image: item.image,
      })),
    };

    try {
      const res = await fetch("http://fiyo.click/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await res.json();

      if (result.status) {
        const orderId = result.order._id;
        sessionStorage.removeItem("selectedVoucher");
        localStorage.removeItem("selectedVoucher");
        clearCart();

        if (paymentMethod === "vnpay" || paymentMethod === "zalopay") {
          window.location.href = `/page/payment/${paymentMethod}/${orderId}`;
        } else {
          showToast("Đặt hàng thành công!", "success");
          setTimeout(() => {
            window.location.href = "/";
          }, 1500);
        }
      } else {
        showToast(result.message || "Đặt hàng không thành công!", "error");
      }
    } catch (error) {
      console.error("Lỗi khi đặt hàng:", error);
      showToast("Lỗi khi gửi đơn hàng!", "error");
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
    if (!validateForm()) {
      return;
    }

    try {
      const provinceName =
        provinces.find((p) => p.code === selectedAddress.province)?.name || "";
      const wardName =
        wards.find((w) => w.code === selectedAddress.ward)?.name || "";
      const fullAddress = `${newAddress.detail || ""}, ${wardName}, ${provinceName}`
        .replace(/, ,/g, ",")
        .replace(/,$/, "");

      const addressData: IAddress = {
        ...newAddress,
        address: fullAddress,
        is_default: newAddress.is_default,
        user_id: userId || "",
        province: selectedAddress.province,
        ward: selectedAddress.ward,
      };

      await addAddress(addressData);
      showToast("Thêm địa chỉ thành công!", "success");
      setShowAddressModal(false);
      setShowNewAddressModal(false);

      const updatedAddresses = await getAllAddress(
        `http://fiyo.click/api/address/user/${userId}`
      );
      setAddressList(updatedAddresses);

      if (addressData.is_default) {
        setDefaultAddress(addressData);
        setSelectedAddress({
          province: addressData.province ?? "",
          ward: addressData.ward ?? "",
        });
      }

      setTimeout(() => {
        window.location.reload();
      }, 1500);
    } catch (error: any) {
      console.error("Lỗi khi lưu địa chỉ:", error);
      showToast("Không thể lưu địa chỉ. Vui lòng thử lại!", "error");
    }
  };

  const discountAmount = voucher
    ? voucher.type === "%"
      ? Math.round((total * (voucher.value || 0)) / 100)
      : (voucher.value || 0)
    : 0;

  const finalTotal = total - discountAmount;

  const isFormValid =
    newAddress.name.trim() &&
    newAddress.phone.trim() &&
    /^\d{10}$/.test(newAddress.phone.trim()) &&
    selectedAddress.province &&
    selectedAddress.ward &&
    newAddress.detail.trim();

  // Kiểm tra dữ liệu cart trước khi render
  if (!cart || !Array.isArray(cart) || cart.some(item => item.price == null || item.quantity == null)) {
    return (
      <div className="alert alert-danger">
        Dữ liệu giỏ hàng không hợp lệ. Vui lòng làm mới trang hoặc xóa giỏ hàng.
      </div>
    );
  }

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
            <div className="checkout-step__heading">
              <h2 className="checkout-step__title">Phương thức thanh toán</h2>
            </div>
            <div className="checkout-step-content">
              <div className="payment-method__note">
                Đơn hàng của bạn sẽ được giữ tại cửa hàng trong 24 giờ kể từ khi
                được xác nhận có sẵn. Sau thời gian này, đơn hàng sẽ bị hủy.
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
              <label className="payment-method__option">
                <input
                  type="radio"
                  value="zalopay"
                  name="payment-method"
                  checked={paymentMethod === "zalopay"}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                />
                <span className="payment-method__option-content">
                  <b className="payment-method__option-title">
                    Thanh toán qua ZaloPay
                  </b>
                  <span className="payment-method__option-image">
                    <img
                      src="https://simg.zalopay.com.vn/zlp-website/assets/icon_hd_export_svg_ee6dd1e844.png"
                      alt="ZaloPay"
                      style={{ width: 50, height: "auto" }}
                    />
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
            {cart.map((item, index) => (
              <div className="checkout-step__content" key={index}>
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
                    </div>
                    <div className="checkout-cart__item-qty">
                      Số lượng: x{item.quantity}
                    </div>
                    <div className="checkout-cart__item-price">
                      <div className="checkout-cart__item-price--normal">
                        Đơn giá: {formatPrice(item.price)} VND
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            <div className="amount">
              Thành tiền: {formatPrice(total)} VND
            </div>
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
                          voucher.type === "%"
                            ? `${voucher.value}%`
                            : formatPrice(voucher.value)
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
                        <div className="price">
                          {formatPrice(total)} VND
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
                            {voucher.voucher_code} – Giảm{" "}
                            {voucher.type === "%"
                              ? `${voucher.value}%`
                              : formatPrice(voucher.value)}
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
                          -{formatPrice(discountAmount)} VND
                        </div>
                      </td>
                    </tr>
                    <tr>
                      <th>
                        <div className="label">Phí vận chuyển</div>
                      </th>
                      <td className="price">0 ₫</td>
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
                        {formatPrice(finalTotal)} VND
                      </td>
                    </tr>
                    <tr>
                      <td colSpan={2}>
                        <button
                          onClick={handleCheckout}
                          className="btn btn-primary w-full"
                          disabled={cart.length === 0}
                        >
                          Thanh toán
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
                    <span>{formatPrice(finalTotal)} ₫</span>
                    <span className="grand-totals__save">
                      (Tiết kiệm {formatPrice(discountAmount)} ₫ )
                    </span>
                  </div>
                  <div className="checkout-proceed"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="wrapper">
          <div className="modal-backdrop" />
          {showAddressModal && (
            <div className="modal-address modal">
              <div className="modal-backdrop" />
              <div className="modal-container">
                <div className="modal-content">
                  <div className="modal-header">
                    <div
                      className="modal-close"
                      onClick={() => setShowAddressModal(false)}
                    >
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
                            <div className="modal-address-item-name">
                              {add.name}
                            </div>
                            <div className="modal-address-item-phone">
                              {add.phone}
                            </div>
                          </div>
                          <div className="modal-address-item-address">
                            {add.address}
                          </div>
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
                        setFormErrors({
                          name: "",
                          phone: "",
                          province: "",
                          ward: "",
                          detail: "",
                        });
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
          <span>
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
                        setFormErrors({
                          name: "",
                          phone: "",
                          province: "",
                          ward: "",
                          detail: "",
                        });
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
                              setNewAddress({
                                ...newAddress,
                                name: e.target.value,
                              });
                              setFormErrors({
                                ...formErrors,
                                name: e.target.value.trim()
                                  ? ""
                                  : "Vui lòng nhập họ và tên!",
                              });
                            }}
                          />
                          {formErrors.name && (
                            <span
                              className="error-text"
                              style={{ color: "red", fontSize: "12px" }}
                            >
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
                              setNewAddress({
                                ...newAddress,
                                phone: e.target.value,
                              });
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
                            <span
                              className="error-text"
                              style={{ color: "red", fontSize: "12px" }}
                            >
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
                              setSelectedAddress({
                                province: e.target.value,
                                ward: "",
                              });
                              setNewAddress({
                                ...newAddress,
                                province: e.target.value,
                                ward: "",
                              });
                              setFormErrors({
                                ...formErrors,
                                province: e.target.value
                                  ? ""
                                  : "Vui lòng chọn tỉnh/thành phố!",
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
                            <span
                              className="error-text"
                              style={{ color: "red", fontSize: "12px" }}
                            >
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
                              setSelectedAddress({
                                ...selectedAddress,
                                ward: e.target.value,
                              });
                              setNewAddress({
                                ...newAddress,
                                ward: e.target.value,
                              });
                              setFormErrors({
                                ...formErrors,
                                ward: e.target.value
                                  ? ""
                                  : "Vui lòng chọn phường/xã!",
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
                            <span
                              className="error-text"
                              style={{ color: "red", fontSize: "12px" }}
                            >
                              {formErrors.ward}
                            </span>
                          )}
                        </div>
                      </div>
                      <div>
                        <div className="form-group">
                          <label htmlFor="dia-chi">Địa chỉ chi tiết</label>
                          <input
                            type="text"
                            id="dia-chi"
                            placeholder="Nhập địa chỉ chi tiết"
                            className="form-control"
                            value={newAddress.detail}
                            onChange={(e) => {
                              setNewAddress({
                                ...newAddress,
                                detail: e.target.value,
                              });
                              setFormErrors({
                                ...formErrors,
                                detail: e.target.value.trim()
                                  ? ""
                                  : "Vui lòng nhập địa chỉ chi tiết!",
                              });
                            }}
                          />
                          {formErrors.detail && (
                            <span
                              className="error-text"
                              style={{ color: "red", fontSize: "12px" }}
                            >
                              {formErrors.detail}
                            </span>
                          )}
                        </div>
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
                            setNewAddress({
                              ...newAddress,
                              is_default: e.target.checked,
                            })
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
          </span>
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
                              Áp dụng từ {formatPrice(item.min_total)} đến{" "}
                              {formatPrice(item.max_total)}₫
                            </div>
                            <div className="modal-coupon__item-code">
                              <span>Mã</span>{" "}
                              <strong>{item.voucher_code}</strong>
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
      </div>
    </>
  );
}