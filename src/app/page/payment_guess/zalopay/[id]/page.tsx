'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import '@/app/assets/css/payment.css';
import { getColorStyle } from '@/app/components/shared/ColorBox';

interface OrderProduct {
  order_id: string;
  quantity: number;
  createdAt: string;
  product: {
    product_id: string;
    name: string;
    description: string;
    price: number;
    images: string[];
    variant: {
      _id: string;
      color: string;
    };
    
  };
}

interface UserInfo {
  _id?: string;
  name: string;
  phone: string;
  email: string;
  address: {
    _id?: string;
    name: string;
    phone: string;
    address: string;
    detail: string;
    type: string;
  };
}

export default function ZalopayPage() {
  const { id } = useParams();
  const [products, setProducts] = useState<OrderProduct[]>([]);
  const [user, setUser] = useState<UserInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      fetch(`http://fiyo.click/api/orderDetail/${id}`)
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

  const handleZalopayPayment = async () => {
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
      payment_method: 'zalopay',
      products: products.map((item) => ({
        product_id: item.product.product_id,
        variant_id: item.product.variant._id,
      
        quantity: item.quantity,
      })),
    };

    try {
      const res = await fetch('http://fiyo.click/api/orders/zalopay', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData),
      });

      const data = await res.json();

      if (data.status && data.payment_url) {
        window.location.href = data.payment_url;
      } else {
        setError(data.message || 'Không tạo được thanh toán ZaloPay.');
      }
    } catch (err: any) {
      console.error('Lỗi khi gọi ZaloPay:', err);
      setError('Lỗi kết nối tới máy chủ.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="wrapper checkout-page">
      <main className="site-main">
        <div className="checkout-success checkout-zalopay">
          <header className="checkout-header checkout-header--zalopay">
            <div className="checkout-header__container">
             
              <div className="checkout-header__title">
                Thanh toán qua cổng ZaloPay
              </div>
            </div>
          </header>

          <div className="checkout-success__body">
            <h1 className="checkout-zalopay__title">Thanh toán qua cổng ZaloPay</h1>

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
                    Thẻ ATM/Visa/Master/JCB/QR Pay qua cổng ZaloPay
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
                          
                        </div>
                        <div className="checkout-success__product-options">
                          <div className="checkout-success__product-option">
                            <div className="checkout-success__product-option">
  <span
    className="checkout-success__product-option--color"
    style={{
      ...getColorStyle(item.product.variant?.color),
      display: 'inline-block',
      width: '16px',
      height: '20px',
      borderRadius: '50%',
      border: '1px solid #ccc',
      marginRight: '6px',
      verticalAlign: 'middle',
    }}
  />
  <span style={{ verticalAlign: 'middle' }}>
    {item.product.variant?.color || 'Không rõ màu'}
  </span>
</div>

                          </div>
                       
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
                  onClick={handleZalopayPayment}
                  disabled={loading}
                >
                  {loading ? 'Đang chuyển đến ZaloPay...' : 'Thanh toán'}
                </button>
                {error && <p style={{ color: 'red' }}>{error}</p>}
              </div>
            </div>
          </div>

          <div className="checkout-success__footer">
            <button
              className="btn btn-primary"
              onClick={handleZalopayPayment}
              disabled={loading}
            >
              {loading ? 'Đang chuyển đến ZaloPay...' : 'Thanh toán'}
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
