'use client'; 
import Slider from "./components/shared/Slider";
import VoucherSection from './components/section/Home/Voucher';
import CollectionSection from './components/section/Home/Collection';
import HotProductSection from "./components/section/Home/HotPro";
import LoadingPage from './components/LoadingPage';
import ProductFlashSaleSection from "./components/section/Home/FlashSale";
import ProductBottomSection from "./components/section/Home/ProductBottom copy";
import ProductTopSection from "./components/section/Home/ProductTop";

export default function Home() {
  return (
    <>
    <LoadingPage></LoadingPage>
      <Slider></Slider>
      <div className="main-content">
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
                Thanh toán khi nhâậnsss akjsnjbjbaujbhuhàng (COD)
              </span>
              <br />sss
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
        <h3>Ưu đãi nổi bậc</h3>
        <VoucherSection></VoucherSection>
        <CollectionSection></CollectionSection>
        <div className="title">
          <h2>
            FLASH<span style={{ color: "red" }}>SALE</span>
          </h2>
        </div>
        <ProductFlashSaleSection></ProductFlashSaleSection>
        <div className="banner-hot">
          <img src="https://2885371169.e.cdneverest.net/media/Simiconnector/TSDH_cate_desktop-210525.webp" />
        </div>
        <HotProductSection></HotProductSection>
    
        <div className="banner2">
          <img src="https://2885371169.e.cdneverest.net/media/Simiconnector/2.Quansooc_blockhomepage_desktop-17Mar25H.webp" />
        </div>
        <ProductBottomSection></ProductBottomSection>
        <div className="banner2">
          <img src="https://2885371169.e.cdneverest.net/media/Simiconnector/1.Aophong_blockhomepage_desktop-17Mar25H.webp" />
        </div>
        <ProductTopSection></ProductTopSection>
      </div>
    </>
  );
}
