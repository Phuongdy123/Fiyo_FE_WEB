"use client";

import "@/app/assets/css/register.css";
import { useState, useEffect } from "react";
import { useAuth } from "@/app/context/CAuth";
import { GoogleLogin, CredentialResponse } from "@react-oauth/google";
import { useToast } from "@/app/context/CToast";
// Global declaration cho Facebook SDK
declare global {
  interface Window {
    fbAsyncInit: () => void;
    FB: any;
  }
}

export default function LoginFormSection() {
  const { loginUser } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
    const { showToast } = useToast();
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();

  // Validate
  const emailError = validateEmail(email);
  const passwordError = validatePassword(password);

  if (emailError || passwordError) {
    const msg = emailError || passwordError || "Vui lòng kiểm tra lại thông tin.";
    setError(msg);              // ✅ msg luôn là string
    showToast(msg, "error");
    return;
  }

  try {
    const res = await fetch("http://fiyo.click/api/user/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();

    if (data.status) {
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      loginUser(data.user);

      const msg = "Đăng nhập thành công!";
      setSuccess(msg);
      showToast(msg, "success");
      setError("");
       setTimeout(() => {
    window.location.href = "/";
  }, 1200);
    } else {
      const msg = data.message || "Lỗi đăng nhập";
      setError(msg);
      showToast(msg, "error");
      setSuccess("");
    }
  } catch (err) {
    const msg = "Đăng nhập thất bại. Vui lòng thử lại.";
    setError(msg);
    showToast(msg, "error");
    setSuccess("");
  }
};

  
  const handleGoogleLogin = async (credentialResponse: CredentialResponse) => {
    if (!credentialResponse.credential) {
      setError("Không nhận được mã xác thực từ Google");
      return;
    }

    try {
      const res = await fetch("http://fiyo.click/api/user/login-google", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: credentialResponse.credential }),
      });
      const data = await res.json();
      if (data.status) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));
        loginUser(data.user);
        setSuccess("Đăng nhập bằng Google thành công!");
        showToast("Đăng nhập thành công!", "success");
        setError("");
         setTimeout(() => {
    window.location.href = "/";
  }, 2000);
      } else {
        setError(data.message || "Lỗi đăng nhập Google");
        showToast(data.message || "Lỗi đăng nhập", "error");
        setSuccess("");
      }
    } catch (err) {
      setError("Lỗi đăng nhập Google");
showToast("Đăng nhập thất bại. Vui lòng thử lại.", "error");
      setSuccess("");
    }
  };

  const handleFacebookLogin = () => {
    window.FB.login(
      async (response: any) => {
        if (response.authResponse) {
          try {
            const res = await fetch("http://fiyo.click/api/user/login-facebook", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                accessToken: response.authResponse.accessToken,
              }),
            });
            const data = await res.json();
            if (data.status) {
              localStorage.setItem("token", data.token);
              localStorage.setItem("user", JSON.stringify(data.user));
              loginUser(data.user);
              setSuccess("Đăng nhập bằng Facebook thành công!");
              showToast("Đăng nhập thành công!", "success");
              setError("");
               setTimeout(() => {
    window.location.href = "/";
  }, 2000);
            } else {
              setError(data.message || "Lỗi đăng nhập Facebook");
           showToast("Đăng nhập thất bại. Vui lòng thử lại.", "error");;
              setSuccess("");
            }
          } catch (err) {
            setError("Lỗi hệ thống khi đăng nhập Facebook");
          }
        } else {
          setError("Người dùng đã hủy đăng nhập Facebook");
        }
      },
      { scope: "email" }
    );
  };

  useEffect(() => {
    // Khởi tạo SDK Facebook
    window.fbAsyncInit = function () {
      window.FB.init({
        appId: "YOUR_FACEBOOK_APP_ID", // Thay bằng App ID thật
        cookie: true,
        xfbml: true,
        version: "v19.0",
      });
    };

    // Tải Facebook SDK
    (function (d, s, id) {
      const fjs = d.getElementsByTagName(s)[0];
      if (d.getElementById(id)) return;

      const js = d.createElement(s) as HTMLScriptElement;
      js.id = id;
      js.src = "https://connect.facebook.net/vi_VN/sdk.js";
      if (fjs && fjs.parentNode) fjs.parentNode.insertBefore(js, fjs);
    })(document, "script", "facebook-jssdk");
  }, []);

  // validate UX
  
  const validateEmail = (email: string): string | null => {
  if (!email.trim()) return "Email không được để trống.";
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) return "Email không hợp lệ.";
  return null;
};

const validatePassword = (password: string): string | null => {
  if (!password.trim()) return "Mật khẩu không được để trống.";
  return null;
};
const handleEmailBlur = () => {
  const errorMsg = validateEmail(email);
  if (errorMsg) {
    setError(errorMsg);
   
  } else {
    setError("");
  }
};

const handlePasswordBlur = () => {
  const errorMsg = validatePassword(password);
  if (errorMsg) {
    setError(errorMsg);
   
  } else {
    setError("");
  }
};


  return (
    <div className="container-default">
      <article>
        <h1>Đăng nhập</h1>
        <h2>____</h2>
      </article>
      <aside>
        <div className="form-container">
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onBlur={handleEmailBlur}
              />
            </div>
            <div className="form-group">
              <input
                type="password"
                placeholder="Mật khẩu"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onBlur={handlePasswordBlur}
              />
            </div>

            <p className="note">
              This site is protected by reCAPTCHA and the Google{" "}
              <a href="https://policies.google.com/privacy" target="_blank">Privacy Policy</a> and{" "}
              <a href="https://policies.google.com/terms" target="_blank">Terms of Service</a> apply.
            </p>

            {error && <div style={{ color: "red", fontSize: 14 }}>{error}</div>}
            {success && <div style={{ color: "green", fontSize: 14 }}>{success}</div>}

            <button type="submit" className="submit-btn">
              ĐĂNG NHẬP
            </button>

            <div className="social-login-buttons" style={{ marginTop: 20 }}>
              <GoogleLogin
                onSuccess={handleGoogleLogin}
                onError={() => setError("Lỗi xác thực Google")}
              />

              <button
                type="button"
                onClick={handleFacebookLogin}
                style={{
                  width: "100%",
                  padding: "10px",
                  backgroundColor: "#3b5998",
                  color: "white",
                  border: "none",
                  borderRadius: "4px",
                  marginTop: "10px",
                  cursor: "pointer",
                }}
              >
                Đăng nhập bằng Facebook
              </button>
            </div>

              <div style={{ marginTop: "10px" }}>
                  <a href="quenmatkhau.html" className="back-link">
                    <strong style={{ fontSize: 14 }}>Quên mật khẩu?</strong>
                  </a>
                  <strong
                    style={{
                      fontSize: 12,
                      fontWeight: 100,
                      color: "#939090",
                      margin: "0 5px",
                    }}
                  >
                    hoặc
                  </strong>
                  <a
                    href="/page/register"
                    style={{
                      textDecoration: "none",
                      fontSize: 12,
                      fontWeight: 200,
                      color: "black",
                    }}
                  >
                    đăng ký
                  </a>
                  <br />
                  <a href="/" className="back-link">
                    <strong style={{ fontSize: 14 }}>←</strong> Quay lại trang
                    chủ
                  </a>
                </div>
          </form>
        </div>
      </aside>
    </div>
  );
}
