import { IProduct } from "@/app/untils/IProduct";
import ProductItem from "./ProductItem";
import { memo } from "react";

// 1. Sử dụng memo cho ProductItem (nếu chưa làm ở file ProductItem)
// Việc này giúp React bỏ qua việc render lại các item không thay đổi dữ liệu.
const MemoizedProductItem = memo(ProductItem);

export default function ProductList({
  products,
}: {
  products: IProduct[];
}) {
  // 2. Chặn render nếu danh sách rỗng để tránh tạo DOM thừa
  if (!products || products.length === 0) {
    return null;
  }

  return (
    <>
      {products.map((product) => (
        <MemoizedProductItem 
          // 3. Tối ưu Key: 
          // Tránh dùng index nếu có thể, ưu tiên dùng ID duy nhất từ database.
          // Dùng template literal tối giản để tiết kiệm bộ nhớ.
          key={product._id || `p-${product.name}`} 
          product={product} 
        />
      ))}
    </>
  );
} 