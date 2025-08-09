  'use client';

  import { useEffect, useState } from 'react';
  import { useParams, useRouter } from 'next/navigation';
  import '@/app/assets/css/payment.css';

  export default function PaymentSuccessPage() {
    const { id } = useParams(); // Mã giao dịch
    const router = useRouter();
    const [seconds, setSeconds] = useState(5);

    
    useEffect(() => {
      const interval = setInterval(() => {
        setSeconds((prev) => prev - 1);
      }, 1000);

      const timeout = setTimeout(() => {
        router.push('/');
      }, 5000);

      return () => {
        clearInterval(interval);
        clearTimeout(timeout);
      };
    }, [router]);

    return (
      <div className="wrapper checkout-page">
        <main className="site-main">
          <div className="checkout-success checkout-vnpay">
            <header className="checkout-header checkout-header--vnpay">
              <div className="checkout-header__container">
                <a href="/" className="checkout-header__logo">
                  <img src="/_nuxt/img/logo.ad56f98.svg" alt="logo" />
                </a>
              </div>
            </header>

            <div className="checkout-success__body text-center">
            
              <h1 className="checkout-vnpay__title">Thanh toán thành công!</h1>
              <p className="mb-2">
                Mã giao dịch: <strong>{id}</strong>
              </p>
              <p className="text-gray-500 mb-4">
                Bạn sẽ được chuyển về trang chủ sau <b>{seconds}</b> giây...
              </p>

              <div className="checkout-success__actions text-center">
                <a href="/" className="btn btn-outline-primary mt-4">
                  Quay về trang chủ ngay
                </a>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }
