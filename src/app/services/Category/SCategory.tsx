import { ICategory } from "@/app/untils/ICategory";
export const getAllCategory = async(url:string)=>{
    let res = await fetch(url);
    let data = await res.json();
    let categories = data.map((category:ICategory) =>{
        return{
            _id:category._id,
            name:category.name,
            slug:category.slug,
            parentId: category.parentId
        }
    })
    return categories;
}

export const getParentCategoryBySlug = async (
  slug: string
): Promise<ICategory | null> => {
  try {
    const res = await fetch(`http://localhost:3000/category/slug/${slug}`);
    if (!res.ok) {
      console.error("❌ Lỗi response:", res.status);
      throw new Error("Không tìm thấy danh mục cha theo slug");
    }

    const data = await res.json();
    console.log("✅ Dữ liệu trả về từ API:", data);

    const item = data.data;

    if (!item?.id || !item?.name || !item?.slug) {
      console.error("❌ Dữ liệu không đầy đủ:", item);
      throw new Error("Thiếu dữ liệu danh mục");
    }

    return {
      _id: item.id,
      name: item.name,
      slug: item.slug,
      parentId: item.parentId || null,
      image: item.image || "", // mặc định chuỗi rỗng nếu không có ảnh
    };
  } catch (error) {
    console.error("Lỗi khi lấy danh mục cha theo slug:", error);
    return null;
  }
};


export const getAllCategoryChilds = async(parentId:string)=>{
    let res = await fetch(`http://localhost:3000/category/children/${parentId}`);
    let data = await res.json();
    let categories = data.map((category:ICategory) =>{
        return{
            _id:category._id,
            name:category.name,
            slug:category.slug,
            parentId: category.parentId,
            image:category.image
        }
    })
    return categories;
}
export const getAllCategoryParents = async (url: string): Promise<ICategory[]> => {
  const res = await fetch(url);
  const data = await res.json();

  const validData = data.filter((item: any) => item.name && item.slug);

  return validData.map((category: ICategory) => ({
    _id: category._id,
    name: category.name,
    slug: category.slug,
    parentId: category.parentId
  }));
};
export const getCategoryBySlugs = async (
  parentSlug: string,
  childSlug: string
): Promise<ICategory[]> => {
  try {
    const res = await fetch(`http://localhost:3000/category/${parentSlug}/${childSlug}`);
    if (!res.ok) throw new Error("Không tìm thấy danh mục");

    const data = await res.json();
    return [
      {
        _id: data.id,
        name: data.name,
        slug: data.slug,
        image: data.image,
        parentId: data.parent?.id || null,
      },
    ];
  } catch (error) {
    console.error("Lỗi khi gọi getCategoryBySlugs:", error);
    return [];
  }
};

export const getOneCategory = async (id: string): Promise<ICategory[]> => {
  try {
    const res = await fetch(`http://localhost:3000/category/${id}`);
    if (!res.ok) throw new Error("Không tìm thấy danh mục");

    const data = await res.json();
    return [
      {
        _id: data.id,
        name: data.name,
        slug: data.slug,
        image: data.image,
        parentId: data.parent?.id || null,
      },
    ];
  } catch (error) {
    console.error("Lỗi khi gọi getCategoryBySlugs:", error);
    return [];
  }
};



export const getAllProductByParentSlug = async (
  parentSlug: string
): Promise<ICategory[]> => {
  try {
    const res = await fetch(
      `http://localhost:3000/category/parent-with-products/${parentSlug}`,
      { cache: "no-store" }
    );

    if (!res.ok) throw new Error("Không tìm thấy sản phẩm theo danh mục cha");

    const data = await res.json();
    return data; // dạng: ICategory[] có 1 phần tử chứa danh sách sản phẩm
  } catch (error) {
    console.error("Lỗi khi gọi getAllProductByParentSlug:", error);
    return [];
  }
};

export const getParentCategoryById = async (id: string): Promise<ICategory | null> => {
  try {
    const res = await fetch(`http://localhost:3000/category/${id}`);
    if (!res.ok) throw new Error("Không tìm thấy danh mục cha theo ID");

    const data = await res.json();
    return {
      _id: data._id || data.id,
      name: data.name,
      slug: data.slug,
      parentId: data.parentId || null,
      image: data.image || "" // ✅ Thêm dòng này để fix lỗi
    };
  } catch (error) {
    console.error("Lỗi khi lấy danh mục cha theo ID:", error);
    return null;
  }
};