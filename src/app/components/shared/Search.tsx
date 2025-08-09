'use client';
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import HomeEffectsJs from '@/app/effects/home';

const HISTORY_KEY = "search_history";

export default function SearchComponent() {
  const router = useRouter();
  const [history, setHistory] = useState<string[]>([]);

  // Load lịch sử từ localStorage khi component mounted
  useEffect(() => {
    const stored = localStorage.getItem(HISTORY_KEY);
    if (stored) {
      setHistory(JSON.parse(stored));
    }
  }, []);

  // Lưu từ khóa mới
  const addSearchTerm = (term: string) => {
    const newHistory = [term, ...history.filter(t => t !== term)].slice(0, 10); // không trùng, max 10
    setHistory(newHistory);
    localStorage.setItem(HISTORY_KEY, JSON.stringify(newHistory));
  };

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const keyword = (document.getElementById("searchInput") as HTMLInputElement).value;
    const trimmed = keyword.trim();
    if (trimmed) {
      addSearchTerm(trimmed);
       window.location.href = `/page/search?keyword=${encodeURIComponent(keyword)}`;
    }
  };

  const clearHistory = () => {
    localStorage.removeItem(HISTORY_KEY);
    setHistory([]);
  };

 const handleKeywordClick = (keyword: string) => {
  const input = document.getElementById("searchInput") as HTMLInputElement;
  if (input) {
    input.value = keyword;
  }

  addSearchTerm(keyword);

  // Tự động submit form (giống người nhấn Enter)
  const form = document.querySelector(".search-popup__form") as HTMLFormElement;
  if (form) {
    form.requestSubmit(); // hoặc form.submit() nếu không dùng onSubmit
  }
};


  return (
    <div className="search-content">
      <div className="search-popup">
        <div className="search-popup__top">
          <form className="search-popup__form" method="get" onSubmit={handleSearch}>
            <button type="submit" className="search-popup__form-btn">
              <span className="screen-reader-text">tìm kiếm</span>
            </button>
            <input
              id="searchInput"
              type="text"
              name="query"
              placeholder="Tìm kiếm"
              className="search-popup__form-input"
            />
          </form>

          <button className="search-popup__close">
            <span className="screen-reader-text">close</span>
          </button>
        </div>

        <div className="search-popup__bottom">
          {/* Lịch sử tìm kiếm */}
          <div className="search-popup__suggested-heading">
            <h2 className="search-popup__suggested-title">Lịch sử tìm kiếm</h2>
            <div className="search-popup__suggested-remove" onClick={clearHistory}>Xóa</div>
          </div>
          <div className="search-popup__suggested-content">
            {history.length === 0 ? (
              <span className="search-popup__suggested-label text-gray-400">Chưa có lịch sử</span>
            ) : (
              history.map((item, index) => (
                <span
                  key={index}
                  className="search-popup__suggested-label cursor-pointer"
                  onClick={() => handleKeywordClick(item)}
                >
                  {item}
                </span>
              ))
            )}
          </div>

          {/* Từ khoá nổi bật */}
          <div className="search-popup__suggested-keywords">
            <div className="search-popup__suggested-heading">
              <h2 className="search-popup__suggested-title">Từ khóa nổi bật</h2>
            </div>
            <div className="search-popup__suggested-content">
              {["Áo phông", "Hoodie", "Áo khoác", "Váy"].map((kw, idx) => (
                <span
                  key={idx}
                  className="search-popup__suggested-label cursor-pointer"
                  onClick={() => handleKeywordClick(kw)}
                >
                  {kw}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      <HomeEffectsJs />
    </div>
  );
}
