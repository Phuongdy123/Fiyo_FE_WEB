"use client";
import { useParams } from "next/navigation";
import PublicShop from "@/app/components/section/Shop/Publicshop";

export default function ShopPublicPage() {
  const params = useParams<{ id: string }>();
  const shopId = params?.id;

  if (!shopId) return <p>Không tìm thấy shopId.</p>;

  return <PublicShop shopId={shopId} />;
}
