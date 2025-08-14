'use client';
import { useEffect } from "react";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import HeaderSection from "./components/section/Header";
import FooterSection from "./components/section/Footer";
import { CartProvider } from './context/Ccart';
import { WishlistProvider } from './context/CWishlist';
import { GoogleOAuthProvider } from "@react-oauth/google";
import { AuthProvider } from './context/CAuth';
import { ToastProvider } from './context/CToast';
import BoxChatComponent from './components/shared/Boxchat';
import { MinicartProvider } from "./context/MinicartContext";
import BackToTop from './components/shared/BacktoTop';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});
const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default function RootLayout({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    document.documentElement.classList.add("mdl-js");
  }, []);

  return (
    <html lang="en">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;700&display=swap"
          rel="stylesheet"
          precedence="default"
        />
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css"
          precedence="default"
        />
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        <GoogleOAuthProvider clientId="756906268617-23mum8c7o6k6ceomevaltks29di7o891.apps.googleusercontent.com">
          <AuthProvider>
            <WishlistProvider>
              <CartProvider>
                <MinicartProvider>
                  <HeaderSection />
                  <ToastProvider>
                    {children}
                    <BackToTop></BackToTop>
                  </ToastProvider>
                </MinicartProvider>
                <BoxChatComponent />
                <FooterSection />
              </CartProvider>
            </WishlistProvider>
          </AuthProvider>
        </GoogleOAuthProvider>
      </body>
    </html>
  );
}
