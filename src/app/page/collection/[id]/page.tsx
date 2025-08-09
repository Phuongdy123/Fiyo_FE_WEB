import "@/app/assets/css/collection.css";
import RealatedCategorySection from "../../../components/section/Collection/RealatedCategory";
import ProductListByCollection from "@/app/components/section/Collection/ListProductByCollection";
import { getGroupedSaleProducts } from "@/app/services/SProduct";
import { IProduct } from "@/app/untils/IProduct";

export default async function WomanPage({
  params,
}: {
  params: { id: string };
}) {
  const { id } = params;

  const { parent: parentProducts, children: groupedChildren } =
    await getGroupedSaleProducts(id);

  return (
    <>
      <div className="banner-product">
        <img src="https://2885371169.e.cdneverest.net/pub/media/Simiconnector/spmoi_cate_desktop-220425.webp" />
      </div>

      <div className="main-content">
        {groupedChildren.map((group) => (
          <div className="pro" key={group.category._id}>
            <div className="title">
              <h2>{group.category.name}</h2>
            </div>

            <div className="block-products">
              {group.category.images && group.category.images.length > 0 && (
                <div className="block-product-banner">
                  <img
                    src={`${group.category.images}`}
                    alt={group.category.name}
                  />
                </div>
              )}

              <div className="block-product-products" id="productContainer">
                <ProductListByCollection
                  props={{
                    title: `Sản phẩm từ: ${group.category.name}`,
                    products: group.products,
                  }}
                />
              </div>
            </div>
          </div>
        ))}

        <div className="title">
          <h2>DÒNG HÀNG NỔI BẬC</h2>
        </div>
        <RealatedCategorySection />
      </div>
    </>
  );
}
