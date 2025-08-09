'use client';
import { useEffect } from "react";
export default function DetailEffect() {
  useEffect(() => {
    // Click chọn ảnh phụ
    const images = document.querySelectorAll(".more-images");
    images.forEach((image) => {
      image.addEventListener("click", () => {
        images.forEach((img) => img.classList.remove("selected"));
        image.classList.add("selected");
      });
    });

    // Swatch option (chọn màu)
    const swatchOptions = document.querySelectorAll(".swatch-option");
    swatchOptions.forEach((option) => {
      option.addEventListener("click", (e) => {
        e.preventDefault();
        swatchOptions.forEach((opt) => opt.classList.remove("selected"));
        option.classList.add("selected");

        const selectedOption = document.querySelector(".swatch-attribute-selected-option");
        if (selectedOption) {
          const color = getComputedStyle(option.querySelector(".swatch-option-link")).backgroundImage;
          selectedOption.textContent = color ? "Đã chọn" : "Chưa chọn";
        }
      });
    });

    // Accordion cho mô tả chi tiết
    document.querySelectorAll(".product-info-detailed .item-title").forEach((title) => {
      title.addEventListener("click", () => {
        const content = title.nextElementSibling;
        content.style.display = (content.style.display === "none" || content.style.display === "")
          ? "block"
          : "none";
        title.classList.toggle("expanded");
      });
    });

    // Slider ảnh sản phẩm
    const mainImage = document.querySelector(".product-main-image img");
    const moreImages = document.querySelectorAll(".more-images img");
    const nextBtn = document.getElementById("next-btn");
    const backBtn = document.getElementById("back-btn");

    let currentIndex = 0;

    function updateMainImage(index) {
      currentIndex = index;
      const newSrc = moreImages[currentIndex].src;
      if (mainImage) mainImage.src = newSrc;

      document.querySelector(".more-images img.active")?.classList.remove("active");
      moreImages[currentIndex].classList.add("active");

      document.querySelector(".more-images.selected")?.classList.remove("selected");
      moreImages[currentIndex].parentElement.classList.add("selected");

      backBtn?.classList.toggle("swiper-button-disabled", currentIndex === 0);
      nextBtn?.classList.toggle("swiper-button-disabled", currentIndex === moreImages.length - 1);
    }

    nextBtn?.addEventListener("click", () => {
      if (currentIndex < moreImages.length - 1) updateMainImage(currentIndex + 1);
    });

    backBtn?.addEventListener("click", () => {
      if (currentIndex > 0) updateMainImage(currentIndex - 1);
    });

    moreImages.forEach((image, index) => {
      image.addEventListener("click", () => {
        updateMainImage(index);
      });
    });

    updateMainImage(currentIndex);

    // Cleanup sự kiện khi component bị huỷ
    return () => {
      images.forEach((image) => {
        image.removeEventListener("click", () => {});
      });
      swatchOptions.forEach((option) => {
        option.removeEventListener("click", () => {});
      });
      nextBtn?.removeEventListener("click", () => {});
      backBtn?.removeEventListener("click", () => {});
      moreImages.forEach((image) => {
        image.removeEventListener("click", () => {});
      });
    };
  }, []);

  return null; // Đây chỉ là logic gắn vào DOM
}
