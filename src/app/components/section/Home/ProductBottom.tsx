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

  // Chuẩn hoá tiếng Việt: bỏ dấu, lower-case, trim
  const vn = (s?: string) =>
    (s ?? "")
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "") // bỏ dấu
      .replace(/đ/g, "d")
      .trim();

  const queryPrefix = vn("quần"); // đổi thành "áo" để test nhanh với data bạn gửi

  const fetchData = async (page: number) => {
    try {
      let tempList: IProduct[] = [];
      let currentPageFetch = page;
      let totalPagesFromApi = 1;

      while (tempList.length < limit) {
        const res = await fetch(`https://fiyo.click/api/products/pro/?page=${currentPageFetch}&limit=${limit}`);
        const data = await res.json();

        // Nếu API trả object { data, totalPages, ... }
        const items = Array.isArray(data?.data) ? data.data : Array.isArray(data) ? data : [];
        totalPagesFromApi = data?.totalPages ?? totalPagesFromApi;

        // Lọc: không ẩn + tên bắt đầu bằng "Quần" (không phân biệt dấu)
        const filtered = items.filter((p: any) => {
          const notHidden = p?.isHidden === false || p?.isHidden === undefined;
          const nameStarts = vn(p?.name).startsWith(queryPrefix);
          return notHidden && nameStarts;
        });

        tempList = [...tempList, ...filtered];

        if (currentPageFetch >= (totalPagesFromApi || 1)) break;
        currentPageFetch++;
      }

      setListProduct(tempList.slice(0, limit));
      setTotalPages(totalPagesFromApi || 1);
      setCurrentPage(page);
    } catch (error) {
      console.error("Error fetching products:", error);
    }
  };

  useEffect(() => {
    fetchData(currentPage);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage]);

  const handlePageChange = (page: number) => setCurrentPage(page);

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
