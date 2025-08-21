"use client";

import ShopInfor from "../../../components/shared/ShopInfor";
import { useAuth } from "@/app/context/CAuth";

export default function ShopPage() {
  const { user } = useAuth();

  if (!user?._id) {
    return <p>Bạn cần đăng nhập để xem thông tin shop.</p>;
  }

  return (
    <>
      <ShopInfor userId={user._id} />

    </>
  );
}
