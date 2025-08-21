export interface IFilter {
  size: string | null;
  color: string | null;
  minPrice: number | null;
  maxPrice: number | null;
  sort: "price_asc" | "price_desc" | "newest"; // ✅ thêm field sort
}
export const defaultFilters: IFilter = {
  sort: "newest",
  size: null,
  color: null,
  minPrice: 99000,
  maxPrice: 399000,
};