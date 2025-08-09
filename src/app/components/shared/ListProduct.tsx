import { IProduct } from "@/app/untils/IProduct";
import ProductItem from "./ProductItem";

// Định nghĩa props: chỉ còn danh sách sản phẩm
export default function ProductList({
  products,
}: {
  products: IProduct[];
}) {
  return (
    <>
     {products.map((product: IProduct, index) => (
  <ProductItem key={`${product._id ?? product.name}-${index}`} product={product} />
))}
    </>
  );
}
