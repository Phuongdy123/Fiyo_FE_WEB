'use client';
import { useEffect } from "react";

export default function CateEffectsJs() {
  useEffect(() => {
    // ---------------------------
    // 1. Thanh kéo chọn khoảng giá
    // ---------------------------
    const trackContainer = document.querySelector('.track-container');
    const trackHighlight = document.querySelector('.track-highlight');
    const track1 = document.querySelector('.track1');
    const track2 = document.querySelector('.track2');
    const minPriceDisplay = document.querySelector('.range-value.min');
    const maxPriceDisplay = document.querySelector('.range-value.max');

    let minPrice = 99000;
    let maxPrice = 399000;
    let currentMin = minPrice;
    let currentMax = maxPrice;

    function updateTrackHighlight() {
      const left = ((currentMin - minPrice) / (maxPrice - minPrice)) * 100;
      const width = ((currentMax - currentMin) / (maxPrice - minPrice)) * 100;
      if (trackHighlight) {
        trackHighlight.style.left = `${left}%`;
        trackHighlight.style.width = `${width}%`;
      }
    }

    function updatePriceDisplay() {
      if (minPriceDisplay) minPriceDisplay.textContent = `${currentMin.toLocaleString()}đ`;
      if (maxPriceDisplay) maxPriceDisplay.textContent = `${currentMax.toLocaleString()}đ`;
    }

    function handleDrag(event, button, isMin) {
      const rect = trackContainer.getBoundingClientRect();
      const trackWidth = rect.width;

      function onMouseMove(e) {
        let newValue = Math.round(
          ((e.clientX - rect.left) / trackWidth) * (maxPrice - minPrice) + minPrice
        );

        if (isMin) {
          currentMin = Math.max(minPrice, Math.min(newValue, currentMax - 1000));
          button.style.left = `${((currentMin - minPrice) / (maxPrice - minPrice)) * 100}%`;
        } else {
          currentMax = Math.min(maxPrice, Math.max(newValue, currentMin + 1000));
          button.style.left = `${((currentMax - minPrice) / (maxPrice - minPrice)) * 100}%`;
        }

        updateTrackHighlight();
        updatePriceDisplay();
      }

      function onMouseUp() {
        document.removeEventListener('mousemove', onMouseMove);
        document.removeEventListener('mouseup', onMouseUp);
      }

      document.addEventListener('mousemove', onMouseMove);
      document.addEventListener('mouseup', onMouseUp);
    }

    if (track1) track1.addEventListener('mousedown', (e) => handleDrag(e, track1, true));
    if (track2) track2.addEventListener('mousedown', (e) => handleDrag(e, track2, false));

    updateTrackHighlight();
    updatePriceDisplay();

    // ---------------------------
    // 2. Chọn màu sản phẩm
    // ---------------------------
    const colorOptions = document.querySelectorAll('.filter__option-color');
    colorOptions.forEach(option => {
      option.addEventListener('click', () => {
        colorOptions.forEach(opt => opt.classList.remove('selected'));
        option.classList.add('selected');
      });
    });

    // ---------------------------
    // 3. Chọn size sản phẩm
    // ---------------------------
    const sizeOptions = document.querySelectorAll('.filter__option-size');
    sizeOptions.forEach(option => {
      option.addEventListener('click', () => {
        sizeOptions.forEach(opt => opt.classList.remove('selected'));
        option.classList.add('selected');
      });
    });

    // ---------------------------
    // 4. Bộ lọc sắp xếp (dropdown sorter)
    // ---------------------------
    const toolbarSorters = document.querySelectorAll('.toolbar-sorter');

    // ---------------------------
    // 5. Đóng menu sorter khi click ra ngoài
    // ---------------------------
    const closeAllSorters = (e) => {
      // Tránh đóng khi click chính vào sorter
      const isClickInsideSorter = Array.from(toolbarSorters).some(sorter => sorter.contains(e.target));
      if (!isClickInsideSorter) {
        toolbarSorters.forEach(sorter => sorter.classList.remove('active'));
      }
    };

    document.addEventListener('click', closeAllSorters);

    // ---------------------------
    // Cleanup khi unmount (tránh memory leak)
    // ---------------------------
    return () => {
      document.removeEventListener('click', closeAllSorters);
    };
  }, []);

  return null;
}
