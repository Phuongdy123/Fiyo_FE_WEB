"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import { useCart } from "@/app/context/Ccart";
import { useAuth } from "@/app/context/CAuth";
import { getVoucherByUserId } from "@/app/services/Voucher/SVoucher";
import { IVoucher } from "@/app/untils/IVoucher";
import { getColorStyle } from '@/app/components/shared/ColorBox';
import { useMinicart } from "@/app/context/MinicartContext";

// Định dạng ngày tháng ngoài component để không khởi tạo lại
const formatDate = (dateInput: Date | string | null | undefined) => {
  if (!dateInput) return "";
  const date = new Date(dateInput);
  return date.toLocaleDateString("vi-VN");
};

const formatPrice = (price: number) => price.toLocaleString("vi-VN") + " ₫";

export default function MiniCartComponent() {
  const { isOpen, close } = useMinicart();
  const { cart, updateQuantity, removeFromCart } = useCart();
  const { user } = useAuth();
  
  const [voucher, setVoucher] = useState<IVoucher | null>(null);
  const [showVoucherModal, setShowVoucherModal] = useState(false);
  const [voucherList, setVoucherList] = useState<IVoucher[]>([]);

  // 1. Tối ưu tính toán bằng useMemo (Chỉ tính lại khi cart hoặc voucher thay đổi)
  const { totalPrice, discountApplied, finalTotal, outOfStockProduct } = useMemo(() => {
    const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const disc = voucher?.type === "percent" 
      ? (total * voucher.value) / 100 
      : (voucher?.value || 0);
    
    const applied = Math.min(disc, total);
    return {
      totalPrice: total,
      discountApplied: applied,
      finalTotal: Math.max(0, total - applied),
      outOfStockProduct: cart.some(item => item.quantity_Product < 1)
    };
  }, [cart, voucher]);

  // 2. Fetch dữ liệu an toàn
  useEffect(() => {
    if (!user?._id) return;
    
    let isMounted = true;
    const fetchVouchers = async () => {
      try {
        const { vouchers } = await getVoucherByUserId(user._id);
        if (isMounted) setVoucherList(vouchers);
      } catch (error) {
        console.error("Voucher Fetch Error:", error);
      }
    };

    fetchVouchers();
    
    const stored = localStorage.getItem("selectedVoucher");
    if (stored) {
      try { setVoucher(JSON.parse(stored)); } catch {}
    }

    return () => { isMounted = false; };
  }, [user?._id]);

  // 3. Sử dụng useCallback cho các hành động lặp lại
  const handleSelectVoucher = useCallback((v: IVoucher) => {
    setVoucher(v);
    localStorage.setItem("selectedVoucher", JSON.stringify(v));
    setShowVoucherModal(false);
  }, []);

  const handleCheckout = () => {
    if (outOfStockProduct || cart.length === 0) return;
    localStorage.setItem("finalTotal", finalTotal.toString());
    // Tránh dùng window.location.href để giữ trạng thái SPA nếu có thể
    window.location.assign(user ? "/page/checkout" : "/page/checkoutNoLogin");
  };

  return (
    <div className={`minicart ${isOpen ? "active" : ""}`}>
      <div className="minicart__container">
        <div className="minicart__body active">
          {/* Thay thế thao tác DOM bằng State từ Context */}
          <div className="minicart__backdrop" onClick={close} />
          
          <div className="minicart__heading">
            <h2 className="minicart__title">Giỏ hàng ({cart.length})</h2>
            <button className="minicart__close" onClick={close} aria-label="Đóng" />
          </div>

          <div className="minicart__content">
            <ShippingNoti totalPrice={totalPrice} hasItems={cart.length > 0} />

            <ol className="minicart__items">
              {cart.map((item) => (
                <CartItem 
                  key={`${item.id}-${item.variant_id}-${item.size}`}
                  item={item}
                  onRemove={removeFromCart}
                  onUpdate={updateQuantity}
                />
              ))}
            </ol>

            {outOfStockProduct && (
              <div className="minicart__noti-list">
                <div className="minicart__noti">
                  <div className="minicart__noti-text">Một số sản phẩm đã hết hàng.</div>
                </div>
              </div>
            )}
          </div>

          <div className="minicart__bottom">
            <VoucherSection 
              selectedVoucher={voucher} 
              onOpenModal={() => setShowVoucherModal(true)} 
            />

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
                      <td>-{formatPrice(discountApplied)}</td>
                    </tr>
                  )}
                  <tr className="subtotal">
                    <th>Tạm tính</th>
                    <td><span className="price">{formatPrice(finalTotal)}</span></td>
                  </tr>
                </tfoot>
              </table>
            </div>

            <div className="minicart__actions">
              <button
                className="minicart__actions-button"
                disabled={cart.length === 0 || outOfStockProduct}
                onClick={handleCheckout}
                style={{ opacity: (cart.length === 0 || outOfStockProduct) ? 0.5 : 1 }}
              >
                Thanh toán
              </button>
            </div>
          </div>
        </div>
      </div>

      {showVoucherModal && (
        <VoucherModal 
          vouchers={voucherList} 
          onClose={() => setShowVoucherModal(false)} 
          onSelect={handleSelectVoucher} 
        />
      )}
    </div>
  );
}

// --- Các Sub-components để tối ưu Re-render ---

function ShippingNoti({ totalPrice, hasItems }: { totalPrice: number, hasItems: boolean }) {
  if (!hasItems) return (
    <div className="minicart__noti-list">
      <div className="minicart__noti">
        <div className="minicart__noti-text">Giỏ hàng đang trống.</div>
      </div>
    </div>
  );

  return (
    <div className="minicart__noti-list">
      {totalPrice >= 100000 ? (
        <div className="minicart__noti--succes">
          <div className="minicart__noti-text">Bạn đã được miễn phí vận chuyển</div>
        </div>
      ) : (
        <div className="minicart__noti">
          <div className="minicart__noti-text">
            Mua thêm {formatPrice(100000 - totalPrice)} để miễn phí vận chuyển
          </div>
        </div>
      )}
    </div>
  );
}

function CartItem({ item, onRemove, onUpdate }: any) {
  return (
    <li className="minicart__item">
      <div className="minicart__item-info">
        <div className="minicart__item-photo">
          <img src={item.image} width={80} height={105} alt={item.name} loading="lazy" />
          {item.quantity_Product < 1 && <div className="sold-out-badge">Hết hàng</div>}
        </div>
        <div className="minicart__item-details">
          <h3 className="minicart__item-name">{item.name}</h3>
          <div className="minicart__item-options">
             <span className="swatch-option" style={{ ...getColorStyle(item.variant), borderRadius: "50%", width: "14px", height: "14px", display: "inline-block" }} />
             <span className="value">{item.variant} / {item.size}</span>
          </div>
          <div className="minicart__item-bottom">
            <span className="price">{formatPrice(item.price)}</span>
            <div className="minicart__item-qty">
              <button className="btn-qty btn-qty-min" onClick={() => item.quantity <= 1 ? onRemove(item.id, item.variant_id, item.size) : onUpdate(item.id, item.variant_id, item.size, item.quantity - 1)} />
              <input type="text" readOnly className="input-qty" value={item.quantity} />
              <button className="btn-qty btn-qty-plus" onClick={() => item.quantity < item.quantity_Product && onUpdate(item.id, item.variant_id, item.size, item.quantity + 1)} />
            </div>
          </div>
        </div>
        <button className="minicart__delete-btn" onClick={() => onRemove(item.id, item.variant_id, item.size)} />
      </div>
    </li>
  );
}

function VoucherSection({ selectedVoucher, onOpenModal }: any) {
  return (
    <div className="minicart__coupon">
      <div className="minicart__coupon-title">Mã ưu đãi</div>
      <span className="minicart__coupon-lable" onClick={onOpenModal} style={{ cursor: "pointer" }}>
        {selectedVoucher 
          ? `${selectedVoucher.voucher_code} - Giảm ${selectedVoucher.value}${selectedVoucher.type === "percent" ? "%" : "đ"}`
          : "Chọn hoặc nhập mã"}
      </span>
    </div>
  );
}

function VoucherModal({ vouchers, onClose, onSelect }: any) {
  return (
    <div className="modal-coupon__container">
      <div className="modal-coupon__content">
        <div className="modal-coupon__header">
          <div className="modal-coupon__close" onClick={onClose}>×</div>
          <h4 className="modal-coupon__title">Mã ưu đãi của bạn</h4>
        </div>
        <div className="modal-coupon__body">
          {vouchers.map((item: any) => (
            <div className="modal-coupon__item" key={item._id} onClick={() => onSelect(item)}>
              <div className="modal-coupon__item-title">Voucher {item.value}{item.type === 'percent' ? '%' : 'đ'}</div>
              <div className="modal-coupon__item-code">Mã: <strong>{item.voucher_code}</strong></div>
              <div className="modal-coupon__item-date text-xs opacity-70">HSD: {formatDate(item.expired_at)}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}