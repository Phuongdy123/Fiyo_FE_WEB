'use client';
import HomeEffectsJs from '@/app/assets/js/home';
import { useState, useEffect } from "react";
import { IProduct } from "@/app/untils/IProduct";
import { getAllProduct } from "@/app/services/SProduct";
import PageNavComponents from '../../shared/PageNav';
import ProductList from '../../shared/ListProduct';

export default function ProductFlashSaleSection() {
  const [listProduct, setListProduct] = useState<IProduct[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 8;

  const fetchData = async (page: number) => {
    try {
      const res = await fetch(`http://fiyo.click/api/products/pro/?page=${page}&limit=${limit}`);
      const data = await res.json();

      setListProduct(data.data || []);
      setTotalPages(data.totalPages || 1);
      setCurrentPage(data.currentPage || 1);
    } catch (error) {
      console.error('Error fetching products:', error);
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
