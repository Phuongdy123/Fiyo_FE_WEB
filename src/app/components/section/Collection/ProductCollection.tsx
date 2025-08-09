'use client';

import { useEffect, useState } from 'react';
import { IProduct } from '@/app/untils/IProduct';
import { getProductsByCategoryParent } from '@/app/services/SProduct';
import ProductListByCollection from './ListProductByCollection';

export default function ProductByCatePage({ id }: { id: string }) {
  const [products, setProducts] = useState<IProduct[]>([]);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const allProducts = await getProductsByCategoryParent(id);
        setProducts(allProducts);
      } catch (error) {
        console.error('Lỗi khi lấy sản phẩm:', error);
      }
    };

    fetchProducts();
  }, [id]);

  return (
    <div className="block-products">
      <div className="block-product-products" id="productContainer">
        <ProductListByCollection props={{ title: 'Sản phẩm theo danh mục', products }} />
      </div>
    </div>
  );
}
