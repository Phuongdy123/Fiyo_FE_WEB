import { useEffect } from "react";

export default function HomeEffectsJs() {
  useEffect(() => {
    // Xử lý Minicart
    const cartIcon = document.getElementById("cart-icon");
    const minicart = document.querySelector(".minicart");
    const backdrop = document.querySelector(".minicart__backdrop");
    const closeBtn = document.querySelector(".minicart__close");

    function toggleMinicart() {
      minicart?.classList.toggle("active");
    }

    function closeMinicart() {
      minicart?.classList.remove("active");
    }

    if (cartIcon) cartIcon.addEventListener("click", toggleMinicart);
    if (backdrop) backdrop.addEventListener("click", closeMinicart);
    if (closeBtn) closeBtn.addEventListener("click", closeMinicart);

    return () => {
      if (cartIcon) cartIcon.removeEventListener("click", toggleMinicart);
      if (backdrop) backdrop.removeEventListener("click", closeMinicart);
      if (closeBtn) closeBtn.removeEventListener("click", closeMinicart);
    };
  }, []);

  useEffect(() => {
    // Xử lý Popup tìm kiếm
    const searchInput = document.querySelector(".search-input");
    const searchPopup = document.querySelector(".search-popup");
    const closePopupBtn = document.querySelector(".search-popup__close");

    function openSearchPopup() {
      searchPopup?.classList.add("opened");
      searchInput?.setAttribute("aria-expanded", "true");
    }

    function closeSearchPopup() {
      searchPopup?.classList.remove("opened");
      searchInput?.setAttribute("aria-expanded", "false");
    }

    if (searchInput) searchInput.addEventListener("focus", openSearchPopup);
    if (closePopupBtn) closePopupBtn.addEventListener("click", closeSearchPopup);

    return () => {
      if (searchInput) searchInput.removeEventListener("focus", openSearchPopup);
      if (closePopupBtn) closePopupBtn.removeEventListener("click", closeSearchPopup);
    };
  }, []);

  useEffect(() => {
    // Bổ sung logic tìm kiếm
    const searchInput = document.querySelector(".search-input");
    const searchPopup = document.querySelector(".search-popup");
    const closePopupBtn = document.querySelector(".search-popup__close");

    if (searchInput && searchPopup && closePopupBtn) {
      // Hiển thị popup khi nhấn vào input
      searchInput.addEventListener("focus", () => {
        searchPopup.classList.add("opened");
        searchInput.setAttribute("aria-expanded", "true");
      });

      // Ẩn popup khi nhấn nút đóng
      closePopupBtn.addEventListener("click", () => {
        searchPopup.classList.remove("opened");
        searchInput.setAttribute("aria-expanded", "false");
      });
    }

    return () => {
      if (searchInput) searchInput.removeEventListener("focus", () => {
        searchPopup.classList.add("opened");
        searchInput.setAttribute("aria-expanded", "true");
      });

      if (closePopupBtn) closePopupBtn.removeEventListener("click", () => {
        searchPopup.classList.remove("opened");
        searchInput.setAttribute("aria-expanded", "false");
      });
    };
  }, []);

  useEffect(() => {
    // Xử lý sản phẩm
    const productItems = document.querySelectorAll(".product-item");

    productItems.forEach((productItem) => {
      const mainImage = productItem.querySelector(".product-item__photo img");
      const colorOptions = productItem.querySelectorAll(
        ".product-item__color-option"
      );

      colorOptions.forEach((option) => {
        const handleOptionClick = function () {
          const imageUrl = this.style.backgroundImage
            .replace('url("', "")
            .replace('")', "");

          if (mainImage) {
            mainImage.style.opacity = "0";
            setTimeout(() => {
              mainImage.src = imageUrl;
              mainImage.style.opacity = "1";
            }, 300);
          }

          colorOptions.forEach((opt) => opt.classList.remove("selected"));
          this.classList.add("selected");
        };

        option.addEventListener("click", handleOptionClick);

        return () => {
          option.removeEventListener("click", handleOptionClick);
        };
      });
    });
  }, []);

  return null; 
}
