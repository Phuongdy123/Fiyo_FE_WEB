export interface IFilter {
  size: string | null;
  color: string | null;
  minPrice: number | null;
  maxPrice: number | null;
  sort: "price_asc" | "price_desc" | "newest"; // ✅ thêm field sort
}
