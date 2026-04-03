'use client';

import { useState, useEffect, useMemo, useCallback } from "react";

interface Props {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

const MAX_PAGES_TO_SHOW = 4;
const ITEMS_PER_PAGE = 4; // Số lượng item trên mỗi trang để hiển thị text

export default function PageNavComponents({
  currentPage,
  totalPages,
  onPageChange,
}: Props) {
  const [isMobile, setIsMobile] = useState(false);

  // 1. Theo dõi Resize (Tối ưu Cleanup)
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth <= 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // 2. Tính toán Logic phân trang (Dùng useMemo để tránh tính toán lại vô ích)
  const paginationData = useMemo(() => {
    const pageGroup = Math.floor((currentPage - 1) / MAX_PAGES_TO_SHOW);
    const startPage = pageGroup * MAX_PAGES_TO_SHOW + 1;
    const endPage = Math.min(startPage + MAX_PAGES_TO_SHOW - 1, totalPages);

    const pagesRange = [];
    for (let i = startPage; i <= endPage; i++) {
      pagesRange.push(i);
    }

    return { pagesRange, startPage, endPage };
  }, [currentPage, totalPages]);

  // 3. Hàm xử lý chuyển trang dùng chung
  const handlePageAction = useCallback((e: React.MouseEvent, targetPage: number) => {
    e.preventDefault();
    if (targetPage >= 1 && targetPage <= totalPages && targetPage !== currentPage) {
      onPageChange(targetPage);
    }
  }, [totalPages, currentPage, onPageChange]);

  // --- GIAO DIỆN MOBILE (Nút Xem thêm) ---
  if (isMobile) {
    const displayedItems = Math.min(currentPage * ITEMS_PER_PAGE, totalPages * ITEMS_PER_PAGE);
    const totalItems = totalPages * ITEMS_PER_PAGE;

    return (
      <div className="toolbar-loadmore">
        <button
          className="toolbar-loadmore__button"
          disabled={currentPage >= totalPages}
          onClick={(e) => handlePageAction(e, currentPage + 1)}
        >
          {currentPage >= totalPages ? "Đã hết sản phẩm" : "Xem thêm"}
        </button>
        <div className="toolbar-loadmore__text">
          Hiển thị <span>{displayedItems}</span> trên tổng số{" "}
          <span>{totalItems}</span> sản phẩm
        </div>
      </div>
    );
  }

  // --- GIAO DIỆN DESKTOP (Số trang) ---
  return (
    <div className="pagination">
      {/* Nút lùi 1 trang */}
      <a
        href="#"
        className={`page-item first ${currentPage === 1 ? "disabled" : ""}`}
        onClick={(e) => handlePageAction(e, currentPage - 1)}
        style={currentPage === 1 ? { pointerEvents: 'none', opacity: 0.5 } : {}}
      >
        &lt;
      </a>

      {/* Hiển thị danh sách số trang */}
      {paginationData.pagesRange.map((p) => (
        <a
          href="#"
          key={p}
          className={`page-item ${currentPage === p ? "active" : ""}`}
          onClick={(e) => handlePageAction(e, p)}
        >
          {p}
        </a>
      ))}

      {/* Nút tiến 1 trang */}
      <a
        href="#"
        className={`page-item last ${currentPage === totalPages ? "disabled" : ""}`}
        onClick={(e) => handlePageAction(e, currentPage + 1)}
        style={currentPage === totalPages ? { pointerEvents: 'none', opacity: 0.5 } : {}}
      >
        &gt;
      </a>
    </div>
  );
}