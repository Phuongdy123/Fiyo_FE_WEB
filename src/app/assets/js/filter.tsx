"use client";
import { useEffect } from "react";

export default function FilterEffectJS() {
  useEffect(() => {
    // ==== Category Item (hover chỉ thêm class) ====
    const categoryItems = document.querySelectorAll(".category-item");

    const handleMouseEnter = (e: Event) => {
      (e.currentTarget as HTMLElement).classList.add("hover");
    };
    const handleMouseLeave = (e: Event) => {
      (e.currentTarget as HTMLElement).classList.remove("hover");
    };
    const handleClick = (e: Event) => {
      categoryItems.forEach((el) => el.classList.remove("active"));
      (e.currentTarget as HTMLElement).classList.add("active");
    };

    categoryItems.forEach((item) => {
      item.addEventListener("mouseenter", handleMouseEnter);
      item.addEventListener("mouseleave", handleMouseLeave);
      item.addEventListener("click", handleClick);
    });

    // ==== Dropdown (chỉ click mới hiện) ====
    const dropdowns = document.querySelectorAll(".dropdown");
    const dropdownMenus: HTMLElement[] = [];

    const dropdownHandlers: {
      button: HTMLElement;
      menu: HTMLElement;
      titleSpan: HTMLElement;
      clickButtonHandler: (e: MouseEvent) => void;
      clickMenuHandler: (e: MouseEvent) => void;
    }[] = [];

    dropdowns.forEach((dropdown) => {
      const button = dropdown.querySelector(".filter-button") as HTMLElement;
      const titleSpan = button?.querySelector(".dropdown-title") as HTMLElement;
      const menu = dropdown.querySelector(".dropdown-menu") as HTMLElement;

      if (!button || !titleSpan || !menu) return;

      dropdownMenus.push(menu);

      const clickButtonHandler = (event: MouseEvent) => {
        event.stopPropagation();
        // Đóng các menu khác trước khi mở cái mới
        dropdownMenus.forEach((m) => {
          if (m !== menu) m.classList.remove("show");
        });
        menu.classList.toggle("show");
      };

      const clickMenuHandler = (event: MouseEvent) => {
        const target = event.target as HTMLElement;
        if (target.tagName === "LI") {
          titleSpan.textContent = target.textContent || "";
          menu.classList.remove("show");
        }
      };

      button.addEventListener("click", clickButtonHandler);
      menu.addEventListener("click", clickMenuHandler);

      dropdownHandlers.push({
        button,
        menu,
        titleSpan,
        clickButtonHandler,
        clickMenuHandler,
      });
    });

    // Đóng dropdown khi click ngoài
    const documentClickHandler = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest(".dropdown")) {
        dropdownMenus.forEach((menu) => menu.classList.remove("show"));
      }
    };
    document.addEventListener("click", documentClickHandler);

    // Cleanup
    return () => {
      categoryItems.forEach((item) => {
        item.removeEventListener("mouseenter", handleMouseEnter);
        item.removeEventListener("mouseleave", handleMouseLeave);
        item.removeEventListener("click", handleClick);
      });

      dropdownHandlers.forEach((handler) => {
        handler.button.removeEventListener("click", handler.clickButtonHandler);
        handler.menu.removeEventListener("click", handler.clickMenuHandler);
      });

      document.removeEventListener("click", documentClickHandler);
    };
  }, []);

  return null;
}
