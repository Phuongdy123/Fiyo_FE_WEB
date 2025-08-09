"use client";

import { useState } from "react";
import "@/app/assets/css/register.css";
import { useToast } from "@/app/context/CToast";

export default function RegisterFormSection() {
  const { showToast } = useToast();
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    gender: "",
    createdAt: "",
  });

  const [errors, setErrors] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    gender: "",
    createdAt: "",
  });

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    let error = "";
    switch (name) {
      case "name":
        if (!value.trim()) error = "Vui lòng nhập tên.";
        break;
      case "email":
        if (!value.trim()) error = "Vui lòng nhập email.";
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) error = "Email không hợp lệ.";
        break;
      case "password":
        if (!value.trim()) error = "Vui lòng nhập mật khẩu.";
        else if (value.length < 6) error = "Mật khẩu phải có ít nhất 6 ký tự.";
        else if (!/\d/.test(value)) error = "Mật khẩu phải chứa ít nhất một chữ số.";
        break;
      case "phone":
        if (!value.trim()) error = "Vui lòng nhập số điện thoại.";
        else if (!/^(0|\+84)[0-9]{9,10}$/.test(value)) error = "Số điện thoại không hợp lệ.";
        break;
      case "createdAt":
        if (!value) error = "Vui lòng chọn ngày sinh.";
        break;
      case "gender":
        if (!value) error = "Vui lòng chọn giới tính.";
        break;
      default:
        break;
    }

    setErrors((prev) => ({ ...prev, [name]: error }));
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const validateForm = () => {
    if (!formData.name.trim()) return "Vui lòng nhập tên.";
    if (!formData.email.trim()) return "Vui lòng nhập email.";
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) return "Email không hợp lệ.";
    if (!formData.password.trim()) return "Vui lòng nhập mật khẩu.";
    if (formData.password.length < 6) return "Mật khẩu phải có ít nhất 6 ký tự.";
    if (!/\d/.test(formData.password)) return "Mật khẩu phải chứa ít nhất một chữ số.";
    if (!formData.phone.trim()) return "Vui lòng nhập số điện thoại.";
    const phoneRegex = /^(0|\+84)[0-9]{9,10}$/;
    if (!phoneRegex.test(formData.phone)) return "Số điện thoại không hợp lệ.";
    if (!formData.gender) return "Vui lòng chọn giới tính.";
    if (!formData.createdAt) return "Vui lòng chọn ngày sinh.";
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    const errorMessage = validateForm();
    if (errorMessage) {
      setError(errorMessage);
      return;
    }

    try {
      const payload = {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        phone: formData.phone,
        gender: formData.gender,
        createdAt: formData.createdAt,
      };

      const res = await fetch("http://localhost:3000/user/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (data.status) {
        setSuccess("Đăng ký thành công!");
        showToast("Đăng ký thành công!", "success");
        setFormData({
          name: "",
          email: "",
          password: "",
          phone: "",
          gender: "",
          createdAt: "",
        });
        setTimeout(() => {
          window.location.href = "/page/login";
        }, 1500);
      } else {
        setError("Đăng ký thất bại: " + data.message);
      }
    } catch (err) {
      setError("Đã xảy ra lỗi. Vui lòng thử lại sau.");
    }
  };

  return (
    <div className="container-default">
      <article>
        <h1>Tạo tài khoản</h1>
        <h2>____</h2>
      </article>
      <aside>
        <div className="form-container">
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <input
                type="text"
                name="name"
                placeholder="Tên"
                value={formData.name}
                onChange={handleChange}
                onBlur={handleBlur}
              />
              {errors.name && <div style={{ color: "red", fontSize: 13 }}>{errors.name}</div>}
            </div>
            <div className="form-group">
              <label>
                <input
                  type="radio"
                  name="gender"
                  value="Nữ"
                  checked={formData.gender === "Nữ"}
                  onChange={handleChange}
                  onBlur={handleBlur}
                />{" "}
                Nữ
                <input
                  type="radio"
                  name="gender"
                  value="Nam"
                  checked={formData.gender === "Nam"}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  style={{ marginLeft: "20px" }}
                />{" "}
                Nam
                <input
                  type="radio"
                  name="gender"
                  value="Khác"
                  checked={formData.gender === "Khác"}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  style={{ marginLeft: "20px" }}
                />{" "}
                Khác
              </label>
              {errors.gender && <div style={{ color: "red", fontSize: 13 }}>{errors.gender}</div>}
            </div>
            <div className="form-group">
              <input
                type="date"
                name="createdAt"
                value={formData.createdAt}
                onChange={handleChange}
                onBlur={handleBlur}
              />
              {errors.createdAt && <div style={{ color: "red", fontSize: 13 }}>{errors.createdAt}</div>}
            </div>
            <div className="form-group">
              <input
                type="email"
                name="email"
                placeholder="Email"
                value={formData.email}
                onChange={handleChange}
                onBlur={handleBlur}
              />
              {errors.email && <div style={{ color: "red", fontSize: 13 }}>{errors.email}</div>}
            </div>
            <div className="form-group">
              <input
                type="text"
                name="phone"
                placeholder="Số điện thoại"
                value={formData.phone}
                onChange={handleChange}
                onBlur={handleBlur}
              />
              {errors.phone && <div style={{ color: "red", fontSize: 13 }}>{errors.phone}</div>}
            </div>
            <div className="form-group">
              <input
                type="password"
                name="password"
                placeholder="Mật khẩu"
                value={formData.password}
                onChange={handleChange}
                onBlur={handleBlur}
              />
              {errors.password && <div style={{ color: "red", fontSize: 13 }}>{errors.password}</div>}
            </div>
            <button type="submit" className="submit-btn">
              ĐĂNG KÝ
            </button>
          </form>
          {error && <div style={{ color: "red", fontSize: 14, marginTop: 10 }}>{error}</div>}
          {success && <div style={{ color: "green", fontSize: 14, marginTop: 10 }}>{success}</div>}
        </div>
      </aside>
    </div>
  );
}