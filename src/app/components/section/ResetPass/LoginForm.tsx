"use client";

import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import "@/app/assets/css/register.css";
import { useToast } from "@/app/context/CToast";

export default function ForgotPassFormSection() {
  const { token } = useParams();
  const router = useRouter();
  const { showToast } = useToast();

  const [password, setPassword] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!password.trim()) {
      showToast("Vui lòng nhập mật khẩu mới!", "error");
      return;
    }

    try {
      const res = await fetch("https://fiyo.click/api/user/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, newPassword: password }),
      });

      const data = await res.json();

      if (!data.status) {
        if (data.message.toLowerCase().includes("hết hạn")) {
          showToast("Token đã hết hạn. Vui lòng yêu cầu gửi lại email!", "error");
          setTimeout(() => {
            router.push("/page/forgotpass");
          }, 2500);
        } else {
          showToast(data.message, "error");
        }
      } else {
        showToast("Mật khẩu đã được đặt lại thành công!", "success");
        setTimeout(() => {
          router.push("/page/login");
        }, 2000);
      }
    } catch (error) {
      console.error("Lỗi khi gửi mật khẩu mới:", error);
      showToast("Đã xảy ra lỗi. Vui lòng thử lại.", "error");
    }
  };

  return (
    <div className="container-default">
      <article>
        <h1>Đặt lại mật khẩu</h1>
        <h2>____________</h2>
      </article>
      <aside>
        <div className="form-container">
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <h2>Phục hồi mật khẩu</h2>
              <input
                type="password"
                id="password"
                name="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Nhập mật khẩu mới"
              />

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
