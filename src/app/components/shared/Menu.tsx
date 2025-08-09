"use client";
import { useState, useEffect } from "react";
import { ICategory } from "@/app/untils/ICategory";
import { getAllCategoryParents } from "@/app/services/Category/SCategory";
import Link from "next/link"; // Thêm import Link
import { usePathname } from "next/navigation"; // Thêm import usePathname

export default function MenuComponent() {
  const [parentsCategory, setParentsCategory] = useState<ICategory[]>([]);
  const [subsCategory, setSubsCategory] = useState<ICategory[]>([]);
  const [activeParent, setActiveParent] = useState<string | null>(null);
  const pathname = usePathname(); // Lấy đường dẫn hiện tại

  useEffect(() => {
    const fetchDataParents = async () => {
      try {
        const res = await getAllCategoryParents(
          "http://localhost:3000/category/parents"
        );
        setParentsCategory(res);
      } catch (error) {
        console.log("Lỗi khi lấy danh mục cha", error);
      }
    };
    fetchDataParents();
  }, []);

  const fetchSubsCategory = async (parentId: string) => {
    try {
      const res = await getAllCategoryParents(
        `http://localhost:3000/category/children/${parentId}`
      );
      setSubsCategory(res);
     
    } catch (error) {
      console.log("Lỗi khi lấy danh mục con", error);
    }
  };

  return (
    <div className="menu">
      <ul className="menu__container">
        {/* Mục cố định đầu tiên */}
        <li className="menu__item">
          <Link
            href="/page/product"
            className={`menu__item-link ${pathname === "/page/product" ? "nuxt-link-active" : ""}`}
          >
            <span>Tưng bừng hàng mới</span>
          </Link>
        </li>

        {/* Mục động từ API */}
        {parentsCategory.map((parent) => (
          <li
            key={parent._id}
            className="menu__item has-children"
            onMouseEnter={() => {
              setActiveParent(parent._id);
              fetchSubsCategory(parent._id);
            }}
          >
            <Link
              href={`/page/categoryparent/${parent.slug}`}
              className={`menu__item-link ${pathname === `/page/categoryparent/${parent.slug}` ? "nuxt-link-active" : ""}`}
            >
              <span>{parent.name}</span>
            </Link>
            <div className="menu__submenu">
              <div className="menu__submenu-content">
                <div className="menu__submenu-heading">
                  <Link
                    href={`/${parent.slug}`}
                    className={`menu__submenu-heading-link ${pathname === `/${parent.slug}` ? "nuxt-link-active" : ""}`}
                  >
                    <span>Thời trang cho {parent.name.toLowerCase()}</span>
                  </Link>
                </div>

                <div className="menu__submenu--left">
                  <ul>
                    <li>
                      <Link href={`/page/product`}>
                        Sản phẩm mới
                      </Link>
                    </li>
                  </ul>
                  <ul>
                    <li>
                      <Link href={`/page/sale`}>Giá tốt</Link>
                    </li>
                  </ul>
                  <ul>
                    <li>
                      <Link
                        href={`/page/sale`}
                        style={{ color: "rgb(218, 41, 28)" }}
                      >
                        Siêu sale ngày đôi
                      </Link>
                    </li>
                  </ul>
                </div>
                <div className="menu__submenu--mid">
                  <div className="menu__submenu-cat">
                    <div className="menu__submenu-title">
                      <span>Danh mục sản phẩm</span>
                    </div>

                    {activeParent === parent._id && (
                      <div className="menu__submenu-cat-content">
                        {/* Chia danh sách làm 2 mảng nhỏ */}
                        <ul>
                          {subsCategory
                            .slice(0, Math.ceil(subsCategory.length / 2))
                            .map((child) => (
                              <li key={child._id}>
                                <Link
                                  href={`/page/category/${parent.slug}/${child.slug}`}
                                >
                                  {child.name}
                                  {child.name.toLowerCase().includes("hot") && (
                                    <span className="menu__submenu-label menu__submenu-label--text">
                                      <label
                                        className="megamenu-label label-position-top"
                                        style={{
                                          color: "white",
                                          backgroundColor: "rgb(218, 41, 28)",
                                          fontSize: 10,
                                        }}
                                      >
                                        <div className="label-animation label-animation-bounce">
                                          <div className="label-text">HOT</div>
                                          <span className="label-arrow" />
                                        </div>
                                      </label>
                                    </span>
                                  )}
                                </Link>
                              </li>
                            ))}
                        </ul>

                        <ul>
                          {subsCategory
                            .slice(Math.ceil(subsCategory.length / 2))
                            .map((child) => (
                              <li key={child._id}>
                                <Link href={`/page/category/${parent.slug}/${child.slug}`}>
                                  {child.name}
                                  {child.name.toLowerCase().includes("hot") && (
                                    <span className="menu__submenu-label menu__submenu-label--text">
                                      <label
                                        className="megamenu-label label-position-top"
                                        style={{
                                          color: "white",
                                          backgroundColor: "rgb(218, 41, 28)",
                                          fontSize: 10,
                                        }}
                                      >
                                        <div className="label-animation label-animation-bounce">
                                          <div className="label-text">HOT</div>
                                          <span className="label-arrow" />
                                        </div>
                                      </label>
                                    </span>
                                  )}
                                </Link>
                              </li>
                            ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>

                <div className="menu__submenu--right">
  {/* PHỤ KIỆN */}
  <div className="menu__submenu-cat">
    <div className="menu__submenu-title">
      <span>Phụ kiện</span>
    </div>
    {activeParent === parent._id && (
      <div className="menu__submenu-cat-content">
        <ul>
    {subsCategory
  .filter((child) => child.type?.toLowerCase() === "accessory")
  .map((child) => (
    <li key={child._id}>
      <Link href={`/page/category/${parent.slug}/${child.slug}`}>
        {child.name}
      </Link>
    </li>
))}

        </ul>
      </div>
    )}
  </div>

  {/* GỢI Ý NHANH */}
  <div className="menu__submenu-cat">
    <div className="menu__submenu-title">
      <span> GỢI Ý NHANH </span>
    </div>
    <div className="menu__submenu-cat-content">
      <ul>
        <li>
          <Link href="/san-pham-moi">Mới ra mắt</Link>
        </li>
        <li>
          <Link href="/hot-items">Đang hot</Link>
        </li>
        <li>
          <Link href="/duoi-199k">Giá dưới 199K</Link>
        </li>
        <li>
          <Link href="/best-seller">Bán chạy nhất</Link>
        </li>
      </ul>
    </div>
  </div>

  {/* HÌNH ẢNH */}
  <div className="menu__submenu-images">
    <span className="images">
      <img
        width="203"
        height="274"
        src="https://media.canifa.com/mega_menu/item/Nu-1-menu-05Mar.webp"
        alt="image"
      />
    </span>
    <span className="images">
      <img
        width="203"
        height="274"
        src="https://media.canifa.com/mega_menu/item/Nu-1-menu-05Mar.webp"
        alt="image"
      />
    </span>
  </div>
</div>

              </div>
            </div>
          </li>
        ))}
        <li className="menu__item">
          <Link
            href="/page/sale"
            className={`menu__item-link ${pathname === "/bst-em-oi-em-a" ? "nuxt-link-active" : ""}`}
          >
            <span>SIÊU SALE MÙA HÈ</span>
          </Link>
        </li>
      </ul>
    </div>
  );
}