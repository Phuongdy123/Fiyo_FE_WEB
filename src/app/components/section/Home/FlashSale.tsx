'use client';

import { useEffect, useMemo, useState } from "react";
import { IProduct } from "@/app/untils/IProduct";
import ProductList from "../../shared/ListProduct";
import PageNavComponents from "../../shared/PageNav";
import HomeEffectsJs from "@/app/assets/js/home";
import { useCountdown } from "@/app/assets/js/useCountdown";

type Props = {
  startAt: string;
  endAt: string;
  limit?: number;
};

export default function ProductFlashSaleSection({
  startAt,
  endAt,
  limit = 8,
}: Props) {
  const [listProduct, setListProduct] = useState<IProduct[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // tránh trùng với window.status (deprecated)
  const { status: countdownStatus } = useCountdown(startAt, endAt, true);
  const isFlashTime = useMemo(
    () => countdownStatus === "running" || countdownStatus === "upcoming",
    [countdownStatus]
  );

  const fetchData = async (page: number) => {
    try {
      let temp: IProduct[] = [];
      let pageCursor = page;
      let totalFromApi = 1;

      while (temp.length < limit) {
        const res = await fetch(
          `https://fiyo.click/api/products/pro?page=${pageCursor}&limit=${limit}`,
          { cache: "no-store" }
        );
        const data = await res.json();

        const items = Array.isArray(data?.data)
          ? data.data
          : Array.isArray(data)
          ? data
          : [];
        totalFromApi = data?.totalPages ?? totalFromApi;

        // lọc ẩn
        let filtered = items.filter(
          (p: any) => p?.isHidden === false || p?.isHidden === undefined
        );

        // nếu flash thì chỉ lấy sp có sale
        if (isFlashTime) {
          filtered = filtered.filter(
            (p: any) => Number(p?.sale) > 0 && Number(p?.sale) < Number(p?.price)
          );
        }

        temp = [...temp, ...filtered];

        if (pageCursor >= (totalFromApi || 1)) break;
        pageCursor++;
      }

      // nếu không có sp sale thì fallback load all
      if (isFlashTime && temp.length === 0) {
        pageCursor = page;
        temp = [];
        while (temp.length < limit) {
          const resAll = await fetch(
            `https://fiyo.click/api/products/pro?page=${pageCursor}&limit=${limit}`,
            { cache: "no-store" }
          );
          const dataAll = await resAll.json();
          totalFromApi = dataAll?.totalPages ?? 1;
          const chunkAll: IProduct[] = (dataAll.data || []).filter(
            (p: any) => p?.isHidden === false || p?.isHidden === undefined
          );
          temp = [...temp, ...chunkAll];
          if (pageCursor >= totalFromApi) break;
          pageCursor++;
        }
      }

      setListProduct(temp.slice(0, limit));
      setTotalPages(totalFromApi || 1);
      setCurrentPage(page);
    } catch (error) {
      console.error("❌ Error fetching flash sale products:", error);
    }
  };

  useEffect(() => {
    fetchData(currentPage);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, isFlashTime, limit]);

  return (
    <div className="products-grid">
      <div className="product-items-new">
        <ProductList products={listProduct} />
      </div>

      <PageNavComponents
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
      />

      <HomeEffectsJs />
    </div>
  );
}
