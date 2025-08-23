// src/app/shipping-policy/page.tsx
export const metadata = { title: "Chính sách vận chuyển | Fiyo" };

export default function ShippingPolicyPage() {
  return (
    <main className="ship-container">
      <h1 className="ship-title">Chính sách vận chuyển</h1>
      <p className="ship-updated">Cập nhật gần nhất: 08/2025</p>

      <section className="ship-section" id="fee">
        <h2 className="section-title">1) Phí vận chuyển</h2>
        <ul className="ship-list">
          <li>Miễn phí với đơn từ <strong>499.000₫</strong>.</li>
          <li>Đơn dưới mức trên: tính phí theo khu vực và đơn vị vận chuyển.</li>
          <li>Phí hiển thị tại bước thanh toán trước khi xác nhận đơn.</li>
        </ul>
      </section>

      <section className="ship-section" id="leadtime">
        <h2 className="section-title">2) Thời gian giao hàng (ước tính)</h2>
        <ul className="ship-list">
          <li>Nội thành: <strong>1–2</strong> ngày làm việc.</li>
          <li>Ngoại tỉnh: <strong>3–5</strong> ngày làm việc.</li>
          <li>Mùa cao điểm/ thời tiết xấu có thể phát sinh chậm trễ.</li>
        </ul>
      </section>

      <section className="ship-section" id="area">
        <h2 className="section-title">3) Phạm vi & đơn vị vận chuyển</h2>
        <ul className="ship-list">
          <li>Giao hàng toàn quốc qua đối tác vận chuyển.</li>
          <li>Hỗ trợ giao hỏa tốc nội thành (nếu khả dụng, phí tính theo đối tác).</li>
        </ul>
      </section>

      <section className="ship-section" id="tracking">
        <h2 className="section-title">4) Theo dõi đơn & liên hệ</h2>
        <p className="ship-text">
          Bạn có thể tra cứu tại mục <strong>“Đơn hàng của tôi”</strong> (đối với tài khoản đã đăng ký) hoặc
          liên hệ CSKH để được hỗ trợ.
        </p>
        <ul className="ship-list">
          <li>Email: <a href="mailto:cs@fiyo.vn">cs@fiyo.vn</a></li>
          <li>Hotline: 1900-xxxx (8:30–17:30, T2–T7)</li>
        </ul>
      </section>

      <section className="ship-section" id="notes">
        <h2 className="section-title">5) Lưu ý</h2>
        <ul className="ship-list">
          <li>Đơn hàng có nhiều sản phẩm có thể tách kiện để giao sớm nhất.</li>
          <li>Vui lòng cung cấp địa chỉ/ số điện thoại chính xác để tránh chậm trễ.</li>
          <li>Chính sách có thể thay đổi theo từng thời điểm; phí/ thời gian thực tế hiển thị ở bước thanh toán là thông tin ưu tiên.</li>
        </ul>
      </section>
    </main>
  );
}
