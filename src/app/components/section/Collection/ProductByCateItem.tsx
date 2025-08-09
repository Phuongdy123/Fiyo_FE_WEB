'use client';
import { IProduct } from "@/app/untils/IProduct";

export default function ProductByCateItem({ product }: { product: IProduct }) {
  if (!product || !product.name) {
    return null; // Không render nếu product không hợp lệ
  }

  return (
    <div tabIndex={-1} className="product-item">
      {/* Phần thông tin sản phẩm */}
      <div className="product-item__info">
        {/* Phần ảnh sản phẩm */}
        <div className="product-item__photo"
        style={{ width: "270px", height: "350px",  overflow: "hidden" }}
        >

          <div>
            <a
              href={`/page/detail/${product._id}`}
              className="product-item__image"
              tabIndex={-1}
              aria-label={product.name}
            >
              <img
                src={product.images?.[0] || "/default-image.jpg"} // Hiển thị ảnh mặc định nếu không có ảnh
                width={415}
                height={554}
                alt={product.name}
                loading="lazy"
                className="product-image-photo"
              />
            </a>
          </div>
          {/* Nhãn freeship */}
          <div className="product-item__label--image">
            <img
              src="https://2885371169.e.cdneverest.net/pub/media/attribute/swatch/f/r/freeship_taglisting_desktop-02oct.png"
              width={412}
              height={50}
              loading="lazy"
            />
          </div>
          {/* Nút xem nhanh */}
          <div className="product-item__button-tocart">
            <span>Xem nhanh</span>
          </div>
        </div>

        {/* Phần chi tiết sản phẩm */}
        <div className="product-item__details">
          {/* Phần tùy chọn màu sắc */}
          <div className="product-item__color">
            {product.images?.slice(0, 4).map((image, index) => (
              <div
                key={index}
                className={`product-item__color-option ${index === 0 ? "selected" : ""}`}
                style={{ backgroundImage: `url("${image}")` }}
              />
            ))}
            {/* Hiển thị số lượng màu còn lại nếu có */}
            {product.images?.length > 4 && (
              <span className="product-item__color-viewall">
                <span>+{product.images.length - 4}</span>
              </span>
            )}
          </div>

          {/* Tên sản phẩm */}
          <h4 aria-label={product.name} className="product-item__name">
            <a
              href={`/page/detail/${product._id}`}
              aria-label={product.name}
              tabIndex={-1}
            >
              {product.name}
            </a>
          </h4>

          {/* Giá sản phẩm */}
          <div className="product-item__price">
            <span className="product-item__price--regular">
              {product.price?.toLocaleString("vi-VN") || "0"}&nbsp;₫
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
