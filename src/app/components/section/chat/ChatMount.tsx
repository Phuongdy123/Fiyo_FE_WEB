"use client";
import { useAuth } from "@/app/context/CAuth";
import UserChatDock from "./UserChatDock";

export default function ChatMount() {
  const { user } = useAuth();
  if (!user?._id) return null; // chưa đăng nhập thì ẩn dock

  // KHÔNG bọc UserChatProvider ở đây nữa — Provider đã bọc toàn app
  return <UserChatDock currentUserId={user._id} />;
}
