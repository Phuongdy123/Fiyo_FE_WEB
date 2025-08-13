interface Props {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

import { useState, useEffect } from "react";

export default function PageNavComponents({
  currentPage,
  totalPages,
  onPageChange,
}: Props) {
  const maxPagesToShow = 4;
  const [pageGroup, setPageGroup] = useState(0);
  const [isMobile, setIsMobile] = useState(false);

  const totalGroups = Math.ceil(totalPages / maxPagesToShow);

  useEffect(() => {
    const newGroup = Math.floor((currentPage - 1) / maxPagesToShow);
    setPageGroup(newGroup);
  }, [currentPage]);

  // Theo dõi thay đổi kích thước màn hình
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth <= 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const startPage = pageGroup * maxPagesToShow + 1;
  const endPage = Math.min(startPage + maxPagesToShow - 1, totalPages);

  const pages = [];
  for (let i = startPage; i <= endPage; i++) {
    pages.push(i);
  }

  const handlePrevGroup = (e: React.MouseEvent) => {
    e.preventDefault();
    if (pageGroup > 0) {
      const newGroup = pageGroup - 1;
      setPageGroup(newGroup);
      onPageChange(newGroup * maxPagesToShow + 1);
    }
  };

  const handleNextGroup = (e: React.MouseEvent) => {
    e.preventDefault();
    if (pageGroup < totalGroups - 1) {
      const newGroup = pageGroup + 1;
      setPageGroup(newGroup);
      onPageChange(newGroup * maxPagesToShow + 1);
    }
  };

  // Nếu là mobile → hiển thị nút gọn
  if (isMobile) {
    return (
      <div className="toolbar-loadmore">
        <button
          className="toolbar-loadmore__button"
          onClick={(e) => {
            e.preventDefault();
            if (currentPage < totalPages) {
              onPageChange(currentPage + 1);
            }
          }}
        >
          Xem thêm
        </button>
        <div className="toolbar-loadmore__text">
          Hiển thị <span>{currentPage * maxPagesToShow}</span> trên tổng số{" "}
          <span>{totalPages * maxPagesToShow}</span> sản phẩm
        </div>
      </div>
    );
  }

  // Nếu là desktop → hiển thị phân trang số
  return (
    <div className="pagination">
      <a
        href="#"
        className="page-item first"
        onClick={(e) => {
          e.preventDefault();
          if (currentPage > 1) {
            if (currentPage === startPage) {
              handlePrevGroup(e);
            } else {
              onPageChange(currentPage - 1);
            }
          }
        }}
      >
        &lt;
      </a>

      {pages.map((p) => (
        <a
          href="#"
          key={p}
          className={`page-item ${currentPage === p ? "active" : ""}`}
          onClick={(e) => {
            e.preventDefault();
            onPageChange(p);
          }}
        >
          {p}
        </a>
      ))}

      <a
        href="#"
        className="page-item last"
        onClick={(e) => {
          e.preventDefault();
          if (currentPage < totalPages) {
            if (currentPage === endPage) {
              handleNextGroup(e);
            } else {
              onPageChange(currentPage + 1);
            }
          }
        }}
      >
        &gt;
      </a>
    </div>
  );
}
