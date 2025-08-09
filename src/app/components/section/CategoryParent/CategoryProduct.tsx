"use client";
import { ICategory } from "@/app/untils/ICategory";

export default function CategoryProductSection({
  categorybyslug,
}: {
  categorybyslug: ICategory[];
}) {
  return (
    <div className="cate-children">
         {categorybyslug.map((category) => (
      <h1 key={category._id || category.slug} className="category-title">{category.name}</h1>
         ))}
      <div>
        {/* <div className="category-children">
          <div className="category-children__content swiper">
            <div className="swiper-wrapper">
              {categorybyslug.map((category) => (
                <div
                  key={category._id}
                  className="category-children__item swiper-slide active"
                >
                  <div className="category-children__image">
                    <img
                      src={
                        category.image ||
                        "https://2885371169.e.cdneverest.net/pub/media//catalog/category/Nu_SPmoi.webp"
                      }
                      alt={category.name}
                      width={160}
                      height={214}
                    />
                  </div>
                  <span className="category-children__name">{category.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div> */}
      </div>
    </div>
  );
}
