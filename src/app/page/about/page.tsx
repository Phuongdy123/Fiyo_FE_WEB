// src/app/about/page.tsx
export const metadata = { title: "Giới thiệu | Fiyo" };

export default function AboutPage() {
  return (
    <main className="about-container">
      <h1 className="about-title">Giới thiệu</h1>
      <p className="about-text">
        Fiyo là thương hiệu thời trang trẻ trung và hiện đại, được xây dựng với
        mong muốn mang đến cho khách hàng những sản phẩm chất lượng, thiết kế
        tinh tế và phù hợp với xu hướng. Chúng tôi không chỉ bán quần áo, mà còn
        truyền tải phong cách sống tự tin, năng động và sáng tạo cho cộng đồng
        người tiêu dùng Việt Nam.
      </p>

      <section className="about-section">
        <h2 className="about-subtitle">Sứ mệnh</h2>
        <p className="about-text">
          Sứ mệnh của Fiyo là mang đến sản phẩm thời trang chất lượng với mức giá
          hợp lý, giúp mỗi khách hàng đều có thể tự tin thể hiện cá tính riêng.
          Đồng thời, Fiyo luôn nỗ lực đổi mới và cải tiến để trở thành thương
          hiệu gần gũi, đáng tin cậy với mọi gia đình Việt.
        </p>

        <h2 className="about-subtitle">Giá trị cốt lõi</h2>
        <ul className="about-list">
          <li><strong>Chất lượng:</strong> Luôn đặt chất lượng sản phẩm và dịch vụ lên hàng đầu.</li>
          <li><strong>Đổi mới:</strong> Cập nhật xu hướng, sáng tạo trong từng thiết kế.</li>
          <li><strong>Khách hàng là trung tâm:</strong> Lắng nghe, thấu hiểu và phục vụ tận tâm.</li>
        </ul>

        <h2 className="about-subtitle">Tầm nhìn</h2>
        <p className="about-text">
          Fiyo hướng tới trở thành thương hiệu thời trang uy tín hàng đầu tại Việt
          Nam, góp phần xây dựng hình ảnh người Việt trẻ trung, tự tin và hội nhập
          quốc tế.
        </p>
      </section>
    </main>
  );
}
