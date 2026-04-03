import { Geist, Geist_Mono, Montserrat } from "next/font/google";
import "./globals.css";
import HeaderSection from "./components/section/Header";
import FooterSection from "./components/section/Footer";
import BackToTop from "./components/shared/BacktoTop";
import ChatMount from "./components/section/chat/ChatMount";
import BoxChatComponent from './components/shared/Boxchat';
import AppProviders from "./components/providers/AppProviders";

// Tối ưu hóa phông chữ: Tải Montserrat qua Next.js thay vì dùng thẻ <link>
const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });
const montserrat = Montserrat({ subsets: ["latin"], weight: ["400", "700"], display: "swap", variable: "--font-montserrat" });

// Khai báo MetaData cho SEO (Chỉ Server Component mới làm được)
export const metadata = {
  title: "Fiyo - Thời trang nam nữ trẻ em chính hãng",
  description: "Mô tả website của bạn",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi">
      <head>
        {/* FontAwesome có thể giữ nguyên thẻ link nếu chưa cài gói npm */}
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css" precedence="default" />
      </head>
      {/* Tích hợp biến CSS của các phông chữ vào thẻ body */}
      <body className={`${geistSans.variable} ${geistMono.variable} ${montserrat.variable}`}>
        {/* Chỉ truyền AppProviders (Client) vào Server Layout */}
        <AppProviders>
          <HeaderSection />
          {children}
          <ChatMount />
          <BoxChatComponent />
          <BackToTop />
          <FooterSection />
        </AppProviders>
      </body>
    </html>
  );
}