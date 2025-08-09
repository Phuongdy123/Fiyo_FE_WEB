'use client';
import { useState, useEffect } from "react";
import { IProduct } from "@/app/untils/IProduct";
import { getRelatedProducts } from "@/app/services/SProduct";
import PageNavComponents from '../../shared/PageNav';
import ProductList from '../../shared/ListProduct';

export default function RealatedProductSection({productId}:{productId:string}) {
  let title = 'FLash Sale'
  const [listProduct, setListProduct] = useState<IProduct[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        let products: IProduct[] = await getRelatedProducts(productId);
        setListProduct(products);
      } catch (error) {
        console.error('Error fetching products:', error);
      }
    };
    fetchData();
  }, []);

  return (
    <>
    <div className="products-grid">
        <div className="product-items-new">
          <ProductList products={listProduct}/>
        </div>
        
        </div>
     
    </>
  );
}

