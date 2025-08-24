'use client';
import HomeEffectsJs from '@/app/assets/js/home';
import { useState, useEffect } from "react";
import { IProduct } from "@/app/untils/IProduct";
import PageNavComponents from '../../shared/PageNav';
import ProductList from '../../shared/ListProduct';

export default function ProductFlashSaleSection() {
  const [listProduct, setListProduct] = useState<IProduct[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 8;

  const fetchData = async (page: number) => {
    try {
      let tempList: IProduct[] = [];
      let currentPageFetch = page;
      let totalPagesFromApi = 1;

      while (tempList.length < limit) {
        const res = await fetch(`https://fiyo.click/api/products/pro?page=${currentPageFetch}&limit=${limit}`);
        const data = await res.json();

        totalPagesFromApi = data.totalPages || 1;

        // Lọc bỏ sản phẩm bị ẩn
        const visibleProducts = (data.data || []).filter(
          (product: any) => product.isHidden === false || product.isHidden === undefined
        );

        tempList = [...tempList, ...visibleProducts];

        
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
