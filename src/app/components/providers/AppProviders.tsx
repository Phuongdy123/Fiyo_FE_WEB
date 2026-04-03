"use client";

import { useEffect } from "react";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { AuthProvider, useAuth } from "@/app/context/CAuth";
import { WishlistProvider } from "@/app/context/CWishlist";
import { CartProvider } from "@/app/context/Ccart";
import { MinicartProvider } from "@/app/context/MinicartContext";
import { ToastProvider } from "@/app/context/CToast";
import { UserChatProvider } from "@/app/components/section/chat/UserChatProvider";

/** Cầu nối để đọc user từ Auth rồi truyền vào UserChatProvider */
function ChatProviderBridge({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const uid = user?._id || ""; 
  return (
    <UserChatProvider currentUserId={uid}>
      {children}
    </UserChatProvider>
  );
}

export default function AppProviders({ children }: { children: React.ReactNode }) {
  // Di chuyển logic DOM của Layout vào đây
  useEffect(() => {
    document.documentElement.classList.add("mdl-js");
  }, []);

  return (
    <GoogleOAuthProvider clientId="756906268617-23mum8c7o6k6ceomevaltks29di7o891.apps.googleusercontent.com">
      <AuthProvider>
        <WishlistProvider>
          <CartProvider>
            <MinicartProvider>
              <ChatProviderBridge>
                <ToastProvider>
                  {children}
                </ToastProvider>
              </ChatProviderBridge>
            </MinicartProvider>
          </CartProvider>
        </WishlistProvider>
      </AuthProvider>
    </GoogleOAuthProvider>
  );
}