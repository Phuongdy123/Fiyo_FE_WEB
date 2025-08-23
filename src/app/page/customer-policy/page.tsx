// src/app/customer-policy/page.tsx
export const metadata = { title: "Chính sách Khách hàng | Fiyo" };


export default function CustomerPolicyPage() {
  return (
    <main className="policy-container">
      <h1 className="policy-title">Chính sách Khách hàng</h1>
      <p className="policy-updated">Cập nhật gần nhất: 08/2025</p>

      <section className="policy-section" id="exchange-return">
        <h2 className="section-title">1) Đổi/Trả</h2>
        <p className="policy-text">
          Fiyo hỗ trợ đổi/ trả trong <strong>07 ngày</strong> kể từ ngày nhận hàng đối với sản phẩm mua
          tại website/ cửa hàng chính thức.
        </p>
        <ul className="policy-list">
          <li>Sản phẩm còn nguyên tem mác, chưa qua sử dụng, không bẩn/ hỏng/ ám mùi.</li>
          <li>Giữ hoá đơn mua hàng hoặc thông tin đơn hàng để đối chiếu.</li>
          <li>Hỗ trợ đổi size/ màu (nếu còn hàng) hoặc đổi sang sản phẩm khác có giá trị tương đương/ cao hơn.</li>
          <li>Không áp dụng đổi/ trả cho sản phẩm giảm giá sâu, quà tặng, đồ lót/ tất, sản phẩm đặt theo yêu cầu.</li>
        </ul>
        <p className="policy-note">
          Lưu ý: Phí vận chuyển 2 chiều khi đổi/ trả do khách hàng chi trả (trừ trường hợp lỗi do Fiyo/ nhà sản xuất).
        </p>
        <h3 className="sub-title">Quy trình</h3>
        <ol className="policy-steps">
          <li>Liên hệ CSKH qua email <a href="mailto:cs@fiyo.vn">cs@fiyo.vn</a> hoặc hotline 1900-xxxx.</li>
          <li>Gửi sản phẩm về kho theo hướng dẫn, kèm hoá đơn/ mã đơn hàng.</li>
          <li>Fiyo kiểm tra tình trạng sản phẩm trong 1–2 ngày làm việc và xử lý đổi/ trả theo yêu cầu.</li>
        </ol>
      </section>

      <section className="policy-section" id="warranty">
        <h2 className="section-title">2) Bảo hành</h2>
        <p className="policy-text">
          Fiyo hỗ trợ bảo hành/ đổi mới đối với lỗi kỹ thuật do nhà sản xuất (đứt chỉ, bung cúc/ khoá,
          lỗi in/ thêu…) trong vòng <strong>30 ngày</strong> kể từ ngày mua.
        </p>
        <ul className="policy-list">
          <li>Không áp dụng với hư hỏng do sử dụng/ bảo quản sai hướng dẫn hoặc tác động ngoại lực.</li>
          <li>Tuỳ mức độ, Fiyo sẽ hỗ trợ sửa chữa miễn phí, đổi mới hoặc hoàn tiền (nếu hết hàng).</li>
          <li>Thời gian xử lý bảo hành dự kiến 3–7 ngày làm việc.</li>
        </ul>
      </section>

      <section className="policy-section" id="privacy">
        <h2 className="section-title">3) Bảo mật thông tin</h2>
        <p className="policy-text">
          Fiyo cam kết bảo mật thông tin cá nhân của khách hàng, chỉ sử dụng cho mục đích xử lý đơn hàng,
          chăm sóc hậu mãi và cải thiện dịch vụ.
        </p>
        <ul className="policy-list">
          <li>Không chia sẻ cho bên thứ ba trừ khi có yêu cầu pháp lý hoặc đối tác vận chuyển/ thanh toán liên quan.</li>
          <li>Khách hàng có quyền yêu cầu xem, sửa, xoá dữ liệu cá nhân qua email <a href="mailto:privacy@fiyo.vn">privacy@fiyo.vn</a>.</li>
          <li>Áp dụng các biện pháp kỹ thuật nhằm bảo vệ dữ liệu khỏi truy cập trái phép.</li>
        </ul>
      </section>

      <section className="policy-section" id="shipping-fee">
        <h2 className="section-title">4) Vận chuyển & Phí</h2>
        <ul className="policy-list">
          <li>Thời gian giao hàng: 2–5 ngày làm việc (tuỳ khu vực và điều kiện thời tiết/ lễ tết).</li>
          <li>Phí vận chuyển hiển thị ở bước thanh toán; miễn phí với đơn từ mức giá áp dụng (nếu có).</li>
          <li>COD, thẻ/ ví điện tử (VNPay, ZaloPay…) được hỗ trợ.</li>
        </ul>
      </section>

      <section className="policy-section" id="contact">
        <h2 className="section-title">5) Liên hệ</h2>
        <p className="policy-text">
          Mọi thắc mắc vui lòng liên hệ: CSKH <a href="mailto:cs@fiyo.vn">cs@fiyo.vn</a> hoặc hotline 1900-xxxx (8:30–17:30).
        </p>
      </section>

      <p className="policy-disclaimer">
        *Chính sách có thể được cập nhật theo từng thời điểm. Vui lòng kiểm tra thông tin mới nhất trên website Fiyo.
      </p>
    </main>
  );
}
