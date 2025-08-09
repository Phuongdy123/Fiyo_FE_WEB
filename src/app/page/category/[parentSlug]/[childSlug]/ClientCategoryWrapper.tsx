"use client";
import { useState } from "react";
import { ICategory } from "@/app/untils/ICategory";
import FilterSection from "@/app/components/section/Category/Filter";
import ListProductCate from "@/app/components/section/Category/ListProduct";
import { IFilter } from "@/app/untils/IFilter";

export default function ClientCategoryWrapper({
  categorybyslug,
  parentSlug,
}: {
  categorybyslug: ICategory[];
  parentSlug: string;
}) {
  const [filters, setFilters] = useState<IFilter>({
    size: null,
    color: null,
    minPrice: null,
    maxPrice: null,
    sort: "newest",
  });

  return (
    <>
      <FilterSection
        categorybyslug={categorybyslug}
        parentSlug={parentSlug}
        filters={filters} 
        onFilterChange={setFilters}
      />
      <ListProductCate
        categorybyslug={categorybyslug}
        filters={filters}
        onFilterChange={setFilters}
      />
    </>
  );
}
