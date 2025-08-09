"use client";
import { useEffect } from "react";

export default function CheckoutJs() {
  useEffect(() => {
    // ==== 1. Handle radio buttons ====
    const addressInputs = document.querySelectorAll<HTMLInputElement>('input[name="addressType"]');
    const paymentInputs = document.querySelectorAll<HTMLInputElement>('input[name="payment"]');

    addressInputs.forEach((input) => {
      input.addEventListener("change", (e) => {
        console.log(`Selected address type: ${(e.target as HTMLInputElement).value}`);
      });
    });

    paymentInputs.forEach((input) => {
      input.addEventListener("change", (e) => {
        console.log(`Selected payment method: ${(e.target as HTMLInputElement).id}`);
      });
    });

    // ==== 2. Thanh toán button alert ====
    const checkoutButton = document.querySelector("button");
    checkoutButton?.addEventListener("click", () => {
      alert("Thanh toán thành công!");
    });

    // ==== 3. Promo code input ====
    const promoCodeInput = document.getElementById("promoCode") as HTMLInputElement | null;
    const applyButton = document.getElementById("applyButton") as HTMLButtonElement | null;

    promoCodeInput?.addEventListener("input", () => {
      if (applyButton)
        applyButton.disabled = promoCodeInput.value.trim() === "";
    });

    // ==== 4. Coupon item click toggle ====
    const couponActions = document.querySelectorAll<HTMLElement>(".modal-coupon__item-action");
    couponActions.forEach((action) => {
      action.addEventListener("click", () => {
        const parentItem = action.closest(".modal-coupon__item");
        if (parentItem) parentItem.classList.toggle("active");
      });
    });

    // ==== 5. Open/close coupon modal ====
    const showCouponButton = document.querySelector<HTMLElement>(".checkout-coupon__show");
    const couponContainer = document.querySelector<HTMLElement>(".modal-coupon__container");
    const closeCouponButton = document.querySelector<HTMLElement>(".modal-coupon__close");

    showCouponButton?.addEventListener("click", () => {
      if (couponContainer) couponContainer.style.display = "block";
    });

    closeCouponButton?.addEventListener("click", () => {
      if (couponContainer) couponContainer.style.display = "none";
    });

    // ==== 6. Load tỉnh, huyện, xã ====
    

    // ==== 7. Validate input ====
    const formInputs = document.querySelectorAll<HTMLInputElement | HTMLSelectElement>(".form-control");

    formInputs.forEach((input) => {
      let hasInteracted = false;
      input.addEventListener("blur", () => {
        hasInteracted = true;
        if (!input.value.trim()) {
          input.classList.add("error");
          const errorElement = input.nextElementSibling;
          if (errorElement?.classList.contains("valid-error")) {
            errorElement.setAttribute("style", "display:flex");
          }
        }
      });

      input.addEventListener("focus", () => {
        if (hasInteracted) {
          input.classList.remove("error");
          const errorElement = input.nextElementSibling;
          if (errorElement?.classList.contains("valid-error")) {
            errorElement.setAttribute("style", "display:none");
          }
        }
      });
    });

    // ==== 8. Modal xác nhận địa chỉ ====
    const modal = document.getElementById("addressModal");
    const openModalBtn = document.getElementById("openModal");
    const closeModalBtn = document.getElementById("closeModal");

    openModalBtn?.addEventListener("click", () => {
      if (modal) modal.style.display = "flex";
    });

    closeModalBtn?.addEventListener("click", () => {
      if (modal) modal.style.display = "none";
    });

    window.addEventListener("click", (event) => {
      if (event.target === modal) {
        if (modal) modal.style.display = "none";
      }
    });
  }, []);

  return null;
}
