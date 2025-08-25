'use client';

import { useCountdown } from '@/app/assets/js/useCountdown';

import Slider from './components/shared/Slider';
import VoucherSection from './components/section/Home/Voucher';
import CollectionSection from './components/section/Home/Collection';
import HotProductSection from './components/section/Home/HotPro';
import LoadingPage from './components/LoadingPage';
import ProductFlashSaleSection from './components/section/Home/FlashSale'; // <- đảm bảo đúng path
import ProductBottomSection from './components/section/Home/ProductBottom';
import ProductTopSection from './components/section/Home/ProductTop';
import CountdownBar from './components/section/Home/CountdownBar';

export default function Home() {
  // Thiết lập khung thời gian flash sale
  const startAt = '2025-08-22T12:00:00+07:00';
  const endAt   = '2025-08-27T23:59:59+07:00';

  // ĐỔI TÊN status -> countdownStatus để tránh đụng window.status (deprecated)
  const { status: countdownStatus } = useCountdown(startAt, endAt, true);

  const isEnded = countdownStatus === 'ended';

  return (
    <>
      <LoadingPage />

      <Slider />

      <div className="main-content">
        {/* Service blocks */}
        <div className="block-service">
          <div className="item">
            <div className="icon">
              <img
                src="https://2885371169.e.cdneverest.net/media/Simiconnector/Service/s/e/service1.png"
                alt=""
              />
            </div>
            <div className="title">
              <span style={{ fontSize: 16, fontWeight: 600 }}>
                Thanh toán khi nhận hàng (COD)
              </span>
              <br />
              <span style={{ fontSize: 14, fontWeight: 400 }}>
                giao hàng toàn quốc
              </span>
            </div>
          </div>

          <div className="item">
            <div className="icon">
              <img
                src="https://2885371169.e.cdneverest.net/media/Simiconnector/Service/s/e/service2.png"
                alt=""
              />
            </div>
            <div className="title">
              <span style={{ fontSize: 16, fontWeight: 600 }}>
                Miễn phí giao hàng
              </span>
              <br />
              <span style={{ fontSize: 14, fontWeight: 400 }}>
                với đơn hàng trên 99.000đ
              </span>
            </div>
          </div>

          <div className="item">
            <div className="icon">
              <img
                src="https://2885371169.e.cdneverest.net/media/Simiconnector/Service/s/e/service1.png"
                alt=""
              />
            </div>
            <div className="title">
              <span style={{ fontSize: 16, fontWeight: 600 }}>
                Đổi hàng miễn phí
              </span>
              <br />
              <span style={{ fontSize: 14, fontWeight: 400 }}>
                Trong 30 ngày kể từ ngày mua
              </span>
            </div>
          </div>
        </div>

        {/* Ưu đãi */}
        <div className="title-home">
          <h2>ƯU ĐÃI NỔI BẬC</h2>
        </div>
        <VoucherSection />
        <CollectionSection />

        {/* Tiêu đề FlashSale / Sản phẩm + đếm ngược cạnh title */}
        <div
          className="title-home"
          style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}
        >
          <h2>
            {isEnded ? (
              <>
                SẢN <span>PHẨM</span>
              </>
            ) : (
              <>
                FLASH<span style={{ color: 'red' }}>SALE</span>
              </>
            )}
          </h2>

          {/* Đồng hồ chỉ hiện khi chưa kết thúc */}
          {!isEnded && <CountdownBar startAt={startAt} endAt={endAt} />}
        </div>

        {/* Section sản phẩm (tự lọc sale khi đang/sắp flashsale, hết thì hiển thị all) */}
        <ProductFlashSaleSection startAt={startAt} endAt={endAt}/>

        {/* Banner & các section khác */}
        <div className="banner-hot">
          <img src="https://2885371169.e.cdneverest.net/media/Simiconnector/TSDH_cate_desktop-210525.webp" />
        </div>

        <HotProductSection />

        <div className="banner2">
          <img src="https://2885371169.e.cdneverest.net/media/Simiconnector/2.Quansooc_blockhomepage_desktop-17Mar25H.webp" />
        </div>

        <ProductBottomSection />

        <div className="banner2">
          <img src="https://2885371169.e.cdneverest.net/media/Simiconnector/1.Aophong_blockhomepage_desktop-17Mar25H.webp" />
        </div>

        <ProductTopSection />
      </div>
    </>
  );
}
