'use client';
import { useState, useEffect } from "react";
import { IProduct } from "@/app/untils/IProduct";
import PageNavComponents from '../../shared/PageNav';
import ProductList from '../../shared/ListProduct';

export default function ProductBottomSection() {
  const [listProduct, setListProduct] = useState<IProduct[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 8;

  const fetchData = async (page: number) => {
    try {
      let tempList: IProduct[] = [];
      let currentPageFetch = page;
      let totalPagesFromApi = 1;

      // Hàm bỏ dấu + lowercase
      const normalize = (s: string) =>
        s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

      const target = normalize("Áo");

      while (tempList.length < limit) {
        const res = await fetch(
          `https://fiyo.click/api/products/pro/?page=${currentPageFetch}&limit=${limit}`
        );
        const data = await res.json();

        totalPagesFromApi = data?.totalPages || totalPagesFromApi;

        const items: any[] = Array.isArray(data?.data)
          ? data.data
          : Array.isArray(data)
          ? data
          : [];

        const visibleAo = items.filter((p: any) => {
          if (!p || typeof p !== "object") return false;

          const visible = p.isHidden === false || p.isHidden === undefined;
          if (!visible) return false;

          if (typeof p.name !== "string") return false;
          return normalize(p.name).startsWith(target);
        });

        tempList = tempList.concat(visibleAo);

        if (currentPageFetch >= totalPagesFromApi) break;
        currentPageFetch++;
      }

      setListProduct(tempList.slice(0, limit));
      setTotalPages(totalPagesFromApi);
      setCurrentPage(page);
    } catch (error) {
      console.error("Error fetching products:", error);
    }
  };

  useEffect(() => {
    fetchData(currentPage);
  }, [currentPage]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  return (
    <div className="products-grid">
      <div className="product-items-new">
        <ProductList products={listProduct} />
      </div>
      <PageNavComponents
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={handlePageChange}
      />
    </div>
  );
}
