import { NextPage } from 'next';
import CategoryProductSection from '@/app/components/section/Category/CategoryProduct';
import { ICategory } from '@/app/untils/ICategory';
import { getCategoryBySlugs } from '@/app/services/Category/SCategory';
import ClientCategoryWrapper from './ClientCategoryWrapper';
import '@/app/assets/css/category.css';

const ProductByCatePage: NextPage<{
  params: { parentSlug: string; childSlug: string };
}> = async ({ params }) => {
  const { parentSlug, childSlug } = params;
  let categorybyslug: ICategory[] = [];

  try {
    categorybyslug = await getCategoryBySlugs(parentSlug, childSlug);
  } catch (error) {
    console.error('Lỗi khi lấy danh mục:', error);
    return <div>Không tìm thấy danh mục</div>;
  }

  if (!categorybyslug.length) {
    return <div>Không tìm thấy danh mục</div>;
  }

  return (
    <div className="main-content">
      <CategoryProductSection categorybyslug={categorybyslug} />
      <div className="container">
        <div className="columns">
          <ClientCategoryWrapper
            categorybyslug={categorybyslug}
            parentSlug={parentSlug}
          />
        </div>
      </div>
    </div>
  );
};

export default ProductByCatePage;