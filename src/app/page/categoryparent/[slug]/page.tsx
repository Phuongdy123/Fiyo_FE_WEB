import CategoryProductSection from "@/app/components/section/CategoryParent/CategoryProduct";
import ClientCategoryWrapper from "./ClientCategoryWrapper";
import { getParentCategoryBySlug } from "@/app/services/Category/SCategory";
import { ICategory } from "@/app/untils/ICategory";
import "@/app/assets/css/category.css";

export default async function ProductByParentCatePage({
  params,
}: {
  params: { slug: string };
}) {
  const { slug } = params;

  const category = await getParentCategoryBySlug(slug);

  if (!category) {
    return (
      <div className="main-content">
        <div className="container">
          <h2>Không tìm thấy danh mục phù hợp.</h2>
        </div>
      </div>
    );
  }

  const categoryList: ICategory[] = [category];

  return (
    <div className="main-content">
      <div className="container">
    
        <CategoryProductSection categorybyslug={categoryList} />

        <div className="columns">
          <ClientCategoryWrapper
            categorybyslug={categoryList}
            parentSlug={slug}
          />
        </div>
      </div>
    </div>
  );
}
