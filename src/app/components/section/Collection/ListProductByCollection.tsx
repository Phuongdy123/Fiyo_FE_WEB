import { IProduct } from "@/app/untils/IProduct";
import ProductByCateItem from "./ProductByCateItem";

export default function ProductListByCollection(
  { props }: {
    props: {
      title: string;
      products: IProduct[];
    };
  }
) {
  const { products } = props;

  return (
    <>
      {products.map((product, index) => (
        <ProductByCateItem
          key={`${product._id ?? product.name}-${index}`}
          product={product}
        />
      ))}
    </>
  );
}
