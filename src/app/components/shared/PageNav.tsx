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

  // Tính tổng nhóm trang
  const totalGroups = Math.ceil(totalPages / maxPagesToShow);

  // Trạng thái nhóm trang đang hiển thị (0-based)
  const [pageGroup, setPageGroup] = useState(0);

  // Khi currentPage thay đổi, cập nhật pageGroup để pageGroup chứa currentPage
  useEffect(() => {
    const newGroup = Math.floor((currentPage - 1) / maxPagesToShow);
    setPageGroup(newGroup);
  }, [currentPage]);

  // Tính trang bắt đầu và kết thúc của nhóm hiện tại
  const startPage = pageGroup * maxPagesToShow + 1;
  const endPage = Math.min(startPage + maxPagesToShow - 1, totalPages);

  // Tạo mảng trang cho nhóm hiện tại
  const pages = [];
  for (let i = startPage; i <= endPage; i++) {
    pages.push(i);
  }

  // Hàm xử lý nút prev nhóm
  const handlePrevGroup = (e: React.MouseEvent) => {
    e.preventDefault();
    if (pageGroup > 0) {
      const newGroup = pageGroup - 1;
      setPageGroup(newGroup);
      onPageChange(newGroup * maxPagesToShow + 1);
    }
  };

  // Hàm xử lý nút next nhóm
  const handleNextGroup = (e: React.MouseEvent) => {
    e.preventDefault();
    if (pageGroup < totalGroups - 1) {
      const newGroup = pageGroup + 1;
      setPageGroup(newGroup);
      onPageChange(newGroup * maxPagesToShow + 1);
    }
  };

  return (
    <div className="pagination">
      <a
        href="#"
        className="page-item first"
        onClick={(e) => {
          e.preventDefault();
          // Bấm nút "<" để lùi 1 trang, nhưng nếu trang hiện tại là đầu nhóm thì chuyển nhóm trước
          if (currentPage > 1) {
            if (currentPage === startPage) {
              // Nếu đang ở đầu nhóm thì chuyển nhóm trước
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
          // Bấm nút ">" để tiến 1 trang, nếu vượt qua nhóm thì chuyển nhóm sau
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
