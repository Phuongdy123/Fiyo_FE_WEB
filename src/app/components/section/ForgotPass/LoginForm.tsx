"use client";

import { useState } from "react";
import "@/app/assets/css/register.css";
import { useToast } from "@/app/context/CToast";

export default function ForgotPassFormSection() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const { showToast } = useToast();

  const validateEmail = (email: string) => {
    if (!email.trim()) {
      return "Vui lòng nhập địa chỉ email!";
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return "Email không hợp lệ!";
    }
    return "";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const emailError = validateEmail(email);
    if (emailError) {
      setError(emailError);
      showToast(emailError, "error");
      return;
    }

    try {
      const res = await fetch("http://localhost:3000/user/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const result = await res.json();

      if (result.status) {
        showToast(result.message, "success");
        setEmail(""); // reset input
      } else {
        const msg =
          result.message?.toLowerCase().includes("email") ||
          result.message?.toLowerCase().includes("không tồn tại")
            ? "Email không hợp lệ hoặc không tồn tại!"
            : result.message;
        setError(msg);
        showToast(msg, "error");
      }
    } catch (error) {
      const errorMsg = "Đã xảy ra lỗi. Vui lòng thử lại sau!";
      setError(errorMsg);
      showToast(errorMsg, "error");
    }
  };

  return (
    <div className="container-default">
      <article>
        <h1>Quên mật khẩu</h1>
        <h2>____________</h2>
      </article>
      <aside>
        <div className="form-container">
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <h2>Phục hồi mật khẩu</h2>
              <div className="form-group">
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onBlur={() => setError(validateEmail(email))}
                  required
                  placeholder="Nhập địa chỉ email đã đăng ký"
                />
                {error && <div style={{ color: "red", fontSize: 13, marginTop: 5 }}>{error}</div>}
              </div>
              <p className="note">
                This site is protected by reCAPTCHA and the Google{" "}
                <a href="https://policies.google.com/privacy" target="_blank">
                  Privacy Policy
                </a>{" "}
                and{" "}
                <a href="https://policies.google.com/terms" target="_blank">
                  Terms of Service
                </a>{" "}
                apply.
              </p>
              <button type="submit" className="submit-btn">
                Gửi
              </button>
              <a href="/" className="back-link">
                <strong style={{ fontSize: 14, marginRight: 10 }}>← </strong>
                Quay lại trang chủ
              </a>
            </div>
          </form>
        </div>
      </aside>
    </div>
  );
}