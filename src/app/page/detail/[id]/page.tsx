"use client";

import "@/app/assets/css/detail.css";
import { useEffect, useState } from "react";
import DetailSection from "@/app/components/section/Detail/ProductDetail";
import RealatedProductSection from "@/app/components/section/Detail/RelatedProduct";
import DetailEffect from "@/app/effects/detail";
import BreadcumComponent from "@/app/components/shared/Breadcrumb";
import { IProduct } from "@/app/untils/IProduct";
import { useParams } from "next/navigation";

export default function DetailPage() {
  const { id } = useParams();
  const [product, setProduct] = useState<IProduct | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        let res = await fetch(`https://fiyo.click/api/products/${id}`);
        let data = await res.json();
        setProduct(data);
      } catch (error) {
        console.error("Lỗi khi tải sản phẩm:", error);
      }
    };

    if (id) fetchData();
  }, [id]);

  if (!product) return <div>Đang tải sản phẩm...</div>;

  return (
    <>
      <div className="detail-content">
        <BreadcumComponent />
        <DetailSection product={product} />
        <div className="title">
          <h2>Sản phẩm liên quan</h2>
        </div>
        <RealatedProductSection productId={id as string} />
      </div>
      <DetailEffect />
    </>
  );
}
