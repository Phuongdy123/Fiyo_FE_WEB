"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

interface Props {
  lastName?: string; // Tên sản phẩm hoặc tên động cho phần cuối
}

export default function BreadcumComponent({ lastName }: Props) {
  const pathname = usePathname();
  const segments = pathname.split("/").filter(Boolean);

  // Mapping slug -> tên hiển thị thân thiện
  const nameMap: Record<string, string> = {
    page: "Trang",
    detail: "Chi tiết",
    order: "Đơn hàng",
    // thêm mapping khác nếu cần
  };

  return (
    <div className="breadcrumbs">
      <ul className="items">
        <li className="item">
          <Link href="/">Trang chủ</Link>
        </li>
        {segments.map((seg, idx) => {
          const href = "#" + segments.slice(0, idx + 1).join("/");
          const isLast = idx === segments.length - 1;

          // nếu có mapping thì lấy tên map, không thì lấy slug
          const displayName =
            isLast && lastName
              ? lastName
              : nameMap[seg] || decodeURIComponent(seg).replace(/-/g, " ");

          return (
            <li key={idx} className="item">
              {isLast ? (
                <strong>{displayName}</strong>
              ) : (
                <Link href={href}>{displayName}</Link>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
