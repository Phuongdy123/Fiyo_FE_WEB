'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import '@/app/assets/css/payment.css';
import { OrderProduct, IUserInfo } from '@/app/untils/IOrder';
import { getColorStyle } from '@/app/components/shared/ColorBox';


export default function VnpayPage() {
  const { id } = useParams();
  const [products, setProducts] = useState<OrderProduct[]>([]);
  const [user, setUser] = useState<IUserInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      fetch(`https://fiyo.click/api/orderDetail/${id}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.status) {
            setProducts(data.result);
            setUser(data.user);
          }
        })
        .catch((err) => console.error('Lỗi lấy đơn hàng:', err));
    }
  }, [id]);

  if (!products.length || !user) return <p>Đang tải đơn hàng...</p>;

  const total = products.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );

  const handleVnpayPayment = async () => {
    if (!user || !user._id || !user.address?._id) {
      setError('Thiếu thông tin user hoặc địa chỉ.');
      return;
    }

    setLoading(true);
    setError(null);

    const orderData = {
      user_id: user._id,
      address_id: user.address._id,
      voucher_id: null,
      total_price: total,
      payment_method: 'vnpay',
      locale: 'vn',
      products: products.map((item) => ({
        product_id: item.product.product_id,
        variant_id: item.product.variant._id,
        size_id: item.product.size._id,
        quantity: item.quantity,
      })),
    };

    try {
      const res = await fetch('https://fiyo.click/api/orders/vnpay', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData),
      });

      const data = await res.json();

      if (data.status && data.payment_url) {
        window.location.href = data.payment_url;
      } else {
        setError(data.message || 'Không tạo được thanh toán VNPay.');
      }
    } catch (err: any) {
      console.error('Lỗi khi gọi VNPay:', err);
      setError('Lỗi kết nối tới máy chủ.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="wrapper checkout-page">
      <main className="site-main">
        <div className="checkout-success checkout-vnpay">
          <header className="checkout-header checkout-header--vnpay">
            <div className="checkout-header__container">
             
              <div className="checkout-header__title">
                Thanh toán qua cổng VNPAY
              </div>
            </div>
          </header>

          <div className="checkout-success__body">
            <h1 className="checkout-vnpay__title">Thanh toán qua cổng VNPAY</h1>

            <div className="checkout-success__content">
              <div className="checkout-success__subtitle">Thông tin đơn hàng</div>
              <ul className="checkout-success__information">
                <li>
                  <label>Mã đơn hàng</label>
                  <div className="value"><b>{products[0].order_id}</b></div>
                </li>
                <li>
                  <label>Người nhận</label>
                  <div className="value">{user.name}</div>
                </li>
                <li>
                  <label>Địa chỉ</label>
                  <div className="value">{user.address.address}</div>
                </li>
                <li>
                  <label>Thanh toán</label>
                  <div className="value">
                    Thẻ ATM/Visa/Master/JCB/QR Pay qua cổng VNPAY
                  </div>
                </li>
                <li>
                  <label>Tổng tiền</label>
                  <div className="value"><b>{total.toLocaleString()} ₫</b></div>
                </li>
                <li>
                  <label>Sản phẩm</label>
                  <div className="value">
                    ({products.length}) sản phẩm
                  </div>
                </li>
              </ul>

              <div className="checkout-success__products">
                {products.map((item, index) => (
                  <div className="checkout-success__product" key={index}>
                    <div className="checkout-success__product-photo">
                      <img
                        src={item.product.images[0]}
                        alt={item.product.name}
                        width={75}
                        height={100}
                      />
                    </div>
                    <div className="checkout-success__product-detail">
                      <div className="checkout-success__product-info">
                        <div className="checkout-success__product-name">
                          {item.product.name}
                        </div>
                        <div className="checkout-success__product-sku">
                          {item.product.size.sku}
                        </div>
                        <div className="checkout-success__product-options">
                          <div className="checkout-success__product-option">
                            
                           <span
                              className="checkout-success__product-option--color"
                               style={{
                                 ...getColorStyle(item.product.variant.color),
                                 border: "1px solid #ccc",
                                 width: "18px",
                                 height: "18px",
                                 display: "inline-block",
                                 borderRadius: "50%",
                                 marginRight: "4px"
                               }}
                             />
                             
                          </div>
                          <div className="checkout-success__product-option">
                            Size: {item.product.size.size}
                          </div>
                          X {item.quantity}
                        </div>
                      </div>
                      <div className="checkout-success__product-price">
                        <div className="checkout-success__product-price--normal">
                          {item.product.price.toLocaleString()} ₫
                        </div>
                      </div>
                      <div className="checkout-success__product-qty">
                        SL: {item.quantity}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="checkout-success__actions">
                <button
                  className="btn btn-primary btn-block"
                  onClick={handleVnpayPayment}
                  disabled={loading}
                >
                  {loading ? 'Đang chuyển đến VNPay...' : 'Thanh toán'}
                </button>
                {error && <p style={{ color: 'red' }}>{error}</p>}
              </div>
            </div>
          </div>

          <div className="checkout-success__footer">
              <button
                className="btn btn-primary"
                onClick={handleVnpayPayment}
                disabled={loading}
              >
                {loading ? 'Đang chuyển đến VNPay...' : 'Thanh toán'}
              </button>
            </div>
          </div>
      </main>
    </div>
  );
}
