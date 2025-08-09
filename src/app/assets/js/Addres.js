'use client';
import { useEffect } from 'react';

export default function AddressEffects() {
 
    useEffect(() => {
    const formInputs = document.querySelectorAll(".form-control");

    formInputs.forEach((input) => {
      let hasInteracted = false;

      input.addEventListener("blur", () => {
        hasInteracted = true;
        if (!input.value.trim()) {
          input.classList.add("error");

          const errorElement = input.parentElement.querySelector(".valid-error");
          if (errorElement) {
            errorElement.style.display = "flex";
          }
        }
      });

      input.addEventListener("focus", () => {
        if (hasInteracted) {
          input.classList.remove("error");

          const errorElement = input.parentElement.querySelector(".valid-error");
          if (errorElement) {
            errorElement.style.display = "none";
          }
        }
      });
    });
  }, []);

  return null;
}
