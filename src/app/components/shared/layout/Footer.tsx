export default function FooterComponent(){
    return(
        <>
         <div className="footer">
    <div className="footer-content">
      <div className="footer-top">
        <h3>Đăng ký nhận bản tin</h3>
        <p style={{fontSize: 14}}>Cùng Canifa Blog cập nhật những thông tin
          mới nhất về thời trang và phong cách sống.</p>
        <form className="newsletter-form">
          <input type="email" style={{textAlign: 'center'}} placeholder="Nhập email đăng ký của bạn" />
          <button type="submit">Đăng ký</button>
        </form>
        <div className="social-icons">
          <a href="#" aria-label="Facebook"><i className="fab fa-facebook-f" /></a>
          <a href="#" aria-label="Instagram"><i className="fab fa-instagram" /></a>
          <a href="#" aria-label="YouTube"><i className="fab fa-youtube" /></a>
          <a href="#" aria-label="TikTok"><i className="fab fa-tiktok" /></a>
        </div>
      </div>
      <div className="footer-bottom">
        <div className="footer-section">
          <h4>Công ty cổ phần Canifa</h4>
          <p>Số ĐKKD: 0107574310, ngày cấp: 23/09/2016, nơi cấp: Sở KHĐT Hà
            Nội</p>
          <p>Địa chỉ: Số 688 Đường Quang Trung, Phường La Khê, Hà Đông, Hà
            Nội</p>
          <p>Email: hello@canifa.com</p>
        </div>
        <div className="footer-section">
          <h4>Thương hiệu</h4>
          <ul>
            <li><a href="#">Giới thiệu</a></li>
            <li><a href="#">Tuyển dụng</a></li>
            <li><a href="#">Hệ thống cửa hàng</a></li>
          </ul>
        </div>
        <div className="footer-section">
          <h4>Hỗ trợ</h4>
          <ul>
            <li><a href="#">Hỏi đáp</a></li>
            <li><a href="#">Chính sách KH</a></li>
            <li><a href="#">Chính sách vận chuyển</a></li>
          </ul>
        </div>
        <div className="footer-section">
          <h4>Fanbage</h4>
          <img src="https://photo.salekit.com/uploads/fchat_5b4872d13803896dd77125af/cach-tao-fanpage-facebook.jpg" alt="QR Code" />
        </div>
      </div>
    </div>
  </div>
        </>
    )
}