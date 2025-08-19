"use client";

import { useState } from "react";
import "@/app/assets/css/register.css";
import { useToast } from "@/app/context/CToast";

export default function SellerRegisterForm() {
  const { showToast } = useToast();
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [formData, setFormData] = useState({
    shopName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    logo: null as File | null,
    description: "",
    category: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, files } = e.target as HTMLInputElement;
    if (files) {
      setFormData((prev) => ({ ...prev, [name]: files[0] }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const validateForm = () => {
    if (!formData.shopName.trim()) return "Vui lòng nhập tên shop.";
    if (!formData.email.trim()) return "Vui lòng nhập email.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) return "Email không hợp lệ.";
    if (!formData.phone.trim()) return "Vui lòng nhập số điện thoại.";
    if (!/^(0|\+84)[0-9]{9,10}$/.test(formData.phone)) return "Số điện thoại không hợp lệ.";
    if (!formData.password.trim()) return "Vui lòng nhập mật khẩu.";
    if (formData.password.length < 6) return "Mật khẩu phải ít nhất 6 ký tự.";
    if (formData.password !== formData.confirmPassword) return "Mật khẩu nhập lại không khớp.";
    if (!formData.category) return "Vui lòng chọn ngành hàng.";
    return null;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    const errorMessage = validateForm();
    if (errorMessage) {
      setError(errorMessage);
      return;
    }

    // Demo không gọi API
    setTimeout(() => {
      setSuccess("Đăng ký người bán thành công (demo)!");
      showToast("Đăng ký shop thành công!", "success");
      setFormData({
        shopName: "",
        email: "",
        phone: "",
        password: "",
        confirmPassword: "",
        logo: null,
        description: "",
        category: "",
      });
    }, 800);
  };

  return (
    <div className="container-default">
      <article>
        <h1>Đăng ký trở thành Người bán</h1>
        <h2>____</h2>
      </article>
      <aside>
        <div className="form-container">
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <input
                type="text"
                name="shopName"
                placeholder="Tên Shop"
                value={formData.shopName}
                onChange={handleChange}
              />
            </div>
            <div className="form-group">
              <input
                type="email"
                name="email"
                placeholder="Email đăng nhập"
                value={formData.email}
                onChange={handleChange}
              />
            </div>
            <div className="form-group">
              <input
                type="text"
                name="phone"
                placeholder="Số điện thoại liên hệ"
                value={formData.phone}
                onChange={handleChange}
              />
            </div>
            <div className="form-group">
              <input
                type="password"
                name="password"
                placeholder="Mật khẩu"
                value={formData.password}
                onChange={handleChange}
              />
            </div>
            <div className="form-group">
              <input
                type="password"
                name="confirmPassword"
                placeholder="Nhập lại mật khẩu"
                value={formData.confirmPassword}
                onChange={handleChange}
              />
            </div>
            <div className="form-group">
              <input
                type="file"
                name="logo"
                onChange={handleChange}
              />
              <small>Tải lên logo shop (demo)</small>
            </div>
            <div className="form-group">
              <textarea
                name="description"
                placeholder="Mô tả shop..."
                value={formData.description}
                onChange={handleChange}
              />
            </div>
            <div className="form-group">
              <select name="category" value={formData.category} onChange={handleChange}>
                <option value="">-- Chọn ngành hàng --</option>
                <option value="fashion">Thời trang</option>
                <option value="electronics">Điện tử</option>
                <option value="cosmetics">Mỹ phẩm</option>
                <option value="other">Khác</option>
              </select>
            </div>
            <div className="form-group">
              <label>
                <input type="checkbox" required /> Tôi đồng ý với điều khoản của sàn
              </label>
            </div>
            <button type="submit" className="submit-btn">
              ĐĂNG KÝ NGƯỜI BÁN
            </button>
          </form>
          {error && <div style={{ color: "red", marginTop: 10 }}>{error}</div>}
          {success && <div style={{ color: "green", marginTop: 10 }}>{success}</div>}
        </div>
      </aside>
    </div>
  );
}
