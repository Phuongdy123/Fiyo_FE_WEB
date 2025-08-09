'use client';
import { useEffect } from 'react';

export default function AccountEffects() {
  useEffect(() => {
    const provinceSelect = document.getElementById('province') as HTMLSelectElement | null;
    const districtSelect = document.getElementById('district') as HTMLSelectElement | null;
    const wardSelect = document.getElementById('ward') as HTMLSelectElement | null;
    const apiURL = '';

    const loadProvinces = async () => {
      if (!provinceSelect) return;
      const response = await fetch(`${apiURL}/p/`);
      const data = await response.json();
      data.forEach((province: any) => {
        const option = document.createElement('option');
        option.value = province.name; // Sử dụng name thay vì code
        option.textContent = province.name;
        provinceSelect.appendChild(option);
      });
    };

    provinceSelect?.addEventListener('change', async () => {
      const provinceName = provinceSelect.value;
      if (!districtSelect || !wardSelect) return;

      districtSelect.innerHTML = '<option value="">Chọn Quận / Huyện</option>';
      wardSelect.innerHTML = '<option value="">Chọn Phường/Xã</option>';
      wardSelect.disabled = true;

      if (provinceName) {
        districtSelect.disabled = false;
        const province = (await (await fetch(`${apiURL}/p/`)).json()).find(
          (p: any) => p.name === provinceName
        );
        if (province) {
          const response = await fetch(`${apiURL}/p/${province.code}?depth=2`);
          const data = await response.json();
          data.districts.forEach((district: any) => {
            const option = document.createElement('option');
            option.value = district.name; // Sử dụng name thay vì code
            option.textContent = district.name;
            districtSelect.appendChild(option);
          });
        }
      } else {
        districtSelect.disabled = true;
      }
    });

    districtSelect?.addEventListener('change', async () => {
      const districtName = districtSelect.value;
      if (!wardSelect) return;
      wardSelect.innerHTML = '<option value="">Chọn Phường/Xã</option>';

      if (districtName) {
        wardSelect.disabled = false;
        const provinceName = provinceSelect?.value;
        const province = (await (await fetch(`${apiURL}/p/`)).json()).find(
          (p: any) => p.name === provinceName
        );
        if (province) {
          const response = await fetch(`${apiURL}/p/${province.code}?depth=2`);
          const data = await response.json();
          const district = data.districts.find((d: any) => d.name === districtName);
          if (district) {
            const wardResponse = await fetch(`${apiURL}/d/${district.code}?depth=2`);
            const wardData = await wardResponse.json();
            wardData.wards.forEach((ward: any) => {
              const option = document.createElement('option');
              option.value = ward.name; // Sử dụng name thay vì code
              option.textContent = ward.name;
              wardSelect.appendChild(option);
            });
          }
        }
      } else {
        wardSelect.disabled = true;
      }
    });

    loadProvinces();

    // Validate input
    const formInputs = document.querySelectorAll<HTMLInputElement>('.form-control');
    formInputs.forEach((input) => {
      let hasInteracted = false;

      input.addEventListener('blur', () => {
        hasInteracted = true;
        if (!input.value.trim()) {
          input.classList.add('error');
          const errorElement = input.nextElementSibling as HTMLElement | null;
          if (errorElement?.classList.contains('valid-error')) {
            errorElement.style.display = 'flex';
          }
        }
      });

      input.addEventListener('focus', () => {
        if (hasInteracted) {
          input.classList.remove('error');
          const errorElement = input.nextElementSibling as HTMLElement | null;
          if (errorElement?.classList.contains('valid-error')) {
            errorElement.style.display = 'none';
          }
        }
      });
    });

    // Modal xử lý
    const modal = document.getElementById('addressModal');
    const openModalBtn = document.getElementById('openModal');
    const closeModalBtn = document.getElementById('closeModal');

    openModalBtn?.addEventListener('click', () => {
      if (modal) modal.style.display = 'flex';
    });

    closeModalBtn?.addEventListener('click', () => {
      if (modal) modal.style.display = 'none';
    });

    window.addEventListener('click', (event) => {
      if (event.target === modal) {
        modal!.style.display = 'none';
      }
    });

    // Cleanup
    return () => {
      window.removeEventListener('click', () => {});
    };
  }, []);

  return null;
} 