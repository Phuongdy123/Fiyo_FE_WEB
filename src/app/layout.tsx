"use client";
import { useEffect } from "react";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import HeaderSection from "./components/section/Header";
import FooterSection from "./components/section/Footer";
import { CartProvider } from "./context/Ccart";
import { WishlistProvider } from "./context/CWishlist";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { AuthProvider, useAuth } from "./context/CAuth";
import { ToastProvider } from "./context/CToast";
import { MinicartProvider } from "./context/MinicartContext";
import BackToTop from "./components/shared/BacktoTop";
import ChatMount from "./components/section/chat/ChatMount";
import { UserChatProvider } from "./components/section/chat/UserChatProvider";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

/** Cầu nối để đọc user từ Auth rồi truyền vào UserChatProvider */
function ChatProviderBridge({ children }: { children: React.ReactNode }) {
  const { user } = useAuth(); // chỉ dùng được bên trong AuthProvider
  const uid = user?._id || ""; // nếu chưa đăng nhập thì để chuỗi rỗng
  return (
    <UserChatProvider currentUserId={uid}>
      {children}
    </UserChatProvider>
  );
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    document.documentElement.classList.add("mdl-js");
  }, []);

  return (
    <html lang="en">
      <head>
        <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;700&display=swap" rel="stylesheet" precedence="default" />
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css" precedence="default" />
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        <GoogleOAuthProvider clientId="756906268617-23mum8c7o6k6ceomevaltks29di7o891.apps.googleusercontent.com">
          <AuthProvider>
            <WishlistProvider>
              <CartProvider>
                <MinicartProvider>
                  {/* ⤵️ Bọc toàn bộ app trong UserChatProvider (thông qua cầu ChatProviderBridge) */}
                  <ChatProviderBridge>
                    <HeaderSection />
                    <ToastProvider>
                      {children}

                      {/* Dock chat chỉ *dùng* context, KHÔNG tạo Provider ở đây */}
                      <ChatMount />

                      <BackToTop />
                    </ToastProvider>
                    <FooterSection />
                  </ChatProviderBridge>
                </MinicartProvider>
              </CartProvider>
            </WishlistProvider>
          </AuthProvider>
        </GoogleOAuthProvider>
      </body>
    </html>
  );
}
