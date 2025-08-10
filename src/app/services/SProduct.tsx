  import { ICategory } from "../untils/ICategory";
  import { IProduct } from "../untils/IProduct";

    export const getAllProduct = async (url: string): Promise<IProduct[]> => {
      const res = await fetch(url);
      const data = await res.json();

      const products: IProduct[] = data.map((product: any) => {
        const category = product.category_id || { _id: "", name: "" };

        return {
          _id: product._id,
          name: product.name,
          images: product.images,
          price: product.price,
          sale: product.sale,
          material: product.material,
          shop_id: product.shop_id,
          description: product.description,
          sale_count: product.sale_count,
          category_id: {
            _id: category._id,
            name: category.name,
          },
          isHidden: product.isHidden,
          create_at: product.create_at,
        };
      });

      return products;
    };
  export const getAllSaleProduct = async (url: string): Promise<IProduct[]> => {
    const res = await fetch(url);
    const data = await res.json();

    // Chỉ lấy sản phẩm có sale > 0
    const saleProducts = data.filter((product: any) => product.sale && product.sale > 0);

    const products: IProduct[] = saleProducts.map((product: any) => {
      const category = product.category_id || { _id: "", name: "" };

      return {
        _id: product._id,
        name: product.name,
        images: product.images,
        price: product.price,
        sale: product.sale,
        material: product.material,
        shop_id: product.shop_id,
        description: product.description,
        sale_count: product.sale_count,
        category_id: {
          _id: category._id,
          name: category.name,
        },
        isHidden: product.isHidden,
        create_at: product.create_at,
      };
    });

    return products;
  };

    export const getProductsByCategoryParent = async (parentCategoryId: string): Promise<IProduct[]> => {
      
      try {
        // Lấy sản phẩm từ danh mục cha
        const resParentCategory = await fetch(`https://fiyo.click/api/products/category/${parentCategoryId}`);
        const parentCategoryProducts = await resParentCategory.json();

        // Lấy danh sách danh mục con từ danh mục cha
        const resChildCategories = await fetch(`https://fiyo.click/api/category/children/${parentCategoryId}`);
        const childCategories = await resChildCategories.json();

        // Lấy sản phẩm từ từng danh mục con
        const childProductsPromises = childCategories.map(async (category: any) => {
          const resChildProducts = await fetch(`https://fiyo.click/api/products/category/${category._id}`);
          return resChildProducts.json();
        });

        // Chờ lấy xong toàn bộ sản phẩm từ danh mục con
        const childProductsResults = await Promise.all(childProductsPromises);

        // Gộp tất cả sản phẩm từ danh mục cha và danh mục con
        const allProducts: IProduct[] = [
          ...parentCategoryProducts,
          ...childProductsResults.flat(),
        ];

        console.log("Tất cả sản phẩm:", allProducts);
        return allProducts;
      } catch (error) {
        console.error("Lỗi khi lấy sản phẩm:", error);
        return [];
      }
    };

    export const getSaleProductsByCategoryParent = async (parentCategoryId: string): Promise<IProduct[]> => {
    try {
      // 1. Lấy sản phẩm từ danh mục cha
      const resParentCategory = await fetch(`https://fiyo.click/api/products/category/${parentCategoryId}`);
      const parentCategoryProducts = await resParentCategory.json();

      // 2. Lấy danh sách danh mục con từ danh mục cha
      const resChildCategories = await fetch(`https://fiyo.click/api/category/children/${parentCategoryId}`);
      const childCategories = await resChildCategories.json();

      // 3. Lấy sản phẩm từ từng danh mục con
      const childProductsPromises = childCategories.map(async (category: any) => {
        const resChildProducts = await fetch(`https://fiyo.click/api/products/category/${category._id}`);
        return resChildProducts.json();
      });

      // 4. Chờ lấy xong toàn bộ sản phẩm từ danh mục con
      const childProductsResults = await Promise.all(childProductsPromises);

      // 5. Gộp tất cả sản phẩm
      const allProducts: IProduct[] = [
        ...parentCategoryProducts,
        ...childProductsResults.flat(),
      ];

      // 6. Lọc chỉ những sản phẩm có sale > 0
      const saleProducts = allProducts.filter((product) => product.sale && product.sale > 0);

      console.log("Sản phẩm sale:", saleProducts);
      return saleProducts;
    } catch (error) {
      console.error("Lỗi khi lấy sản phẩm sale:", error);
      return [];
    }
  };
export const getGroupedSaleProducts = async (
  parentCategoryId: string
): Promise<{
  parent: IProduct[];
  children: {
    category: ICategory;
    products: IProduct[];
  }[];
}> => {
  try {
    // 1. Lấy sản phẩm từ danh mục cha
    const resParentProducts = await fetch(`https://fiyo.click/api/products/category/${parentCategoryId}`);
    const parentProductsData: IProduct[] = await resParentProducts.json();

    // 2. Lấy danh mục con
    const resChildCategories = await fetch(`https://fiyo.click/api/category/children/${parentCategoryId}`);
    const childCategories: ICategory[] = await resChildCategories.json();

    // 3. Lấy 3 danh mục con đầu tiên (gần nhất)
    const selectedChildren = childCategories.slice(0, 3);

    // 4. Lấy sản phẩm từ từng danh mục con
    const childrenData = await Promise.all(
      selectedChildren.map(async (cate) => {
        const res = await fetch(`https://fiyo.click/api/products/category/${cate._id}`);
        const data: IProduct[] = await res.json();

        return {
          category: cate,
          products: data,
        };
      })
    );

    return {
      parent: parentProductsData,
      children: childrenData,
    };
  } catch (error) {
    console.error("Lỗi khi lấy sản phẩm:", error);
    return {
      parent: [],
      children: [],
    };
  }
};



    export const getRelatedProducts = async (productId: string): Promise<IProduct[]> => {
      try {
        const res = await fetch(`https://fiyo.click/api/products/related/${productId}`);
        if (!res.ok) {
          throw new Error(`Lỗi API: ${res.status} ${res.statusText}`);
        }
        const data = await res.json();

        const relatedProducts: IProduct[] = data.map((product: any) => {
          const category = product.category_id || { _id: "", name: "" };

          return {
            _id: product._id,
            name: product.name,
            images: product.images,
            price: product.price,
            sale: product.sale,
            material: product.material,
            shop_id: product.shop_id,
            description: product.description,
            sale_count: product.sale_count,
            category_id: {
              _id: category._id,
              name: category.name,
            },
            isHidden: product.isHidden,
            create_at: product.create_at,
          };
        });

        return relatedProducts;
      } catch (error) {
        console.error("Lỗi khi lấy sản phẩm liên quan:", error);
        return [];
      }
    };


