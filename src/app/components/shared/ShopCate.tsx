"use client";
import { useEffect, useState } from "react";

interface ICategory {
  _id: string;
  name: string;
}

export default function ShopCategories({ shopId }: { shopId: string }) {
  const [categories, setCategories] = useState<ICategory[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!shopId) return;
    (async () => {
      try {
        const res = await fetch(`https://fiyo-be.onrender.com/api/shop/${shopId}/categories`);
        const data = await res.json();
        if (!res.ok) throw new Error(data.message);
        setCategories(data.categories);
      } catch (err: any) {
        setError(err.message || "Lỗi khi tải danh mục");
      }
    })();
  }, [shopId]);

  if (error) return <p style={{ color: "red" }}>{error}</p>;
  if (!categories.length) return <p>Shop này chưa có danh mục nào.</p>;

  return (
    <div className="shop-categories">
      <h3>Danh mục của shop</h3>
      <ul>
        {categories.map((c) => (
          <li key={c._id}>{c.name}</li>
        ))}
      </ul>
    </div>
  );
}
