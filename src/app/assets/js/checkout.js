// JavaScript to handle user interactions
document.addEventListener("DOMContentLoaded", () => {
  const addressInputs = document.querySelectorAll('input[name="addressType"]');
  const paymentInputs = document.querySelectorAll('input[name="payment"]');
  
  // Update address type
  addressInputs.forEach(input => {
    input.addEventListener("change", (e) => {
      console.log(`Selected address type: ${e.target.value}`);
    });
  });

  // Handle payment selection
  paymentInputs.forEach(input => {
    input.addEventListener("change", (e) => {
      console.log(`Selected payment method: ${e.target.id}`);
    });
  });

  // Example: Submit form on button click
  const checkoutButton = document.querySelector("button");
  checkoutButton.addEventListener("click", () => {
    alert("Thanh toán thành công!");
  });
});

  // Lấy tham chiếu đến input và button
  const promoCodeInput = document.getElementById("promoCode");
  const applyButton = document.getElementById("applyButton");

  // Lắng nghe sự kiện input
  promoCodeInput.addEventListener("input", function () {
    // Kiểm tra nếu input không rỗng thì bỏ disabled
    if (promoCodeInput.value.trim() !== "") {
      applyButton.disabled = false;
    } else {
      applyButton.disabled = true;
    }
  });
    // Lấy tất cả các phần tử `modal-coupon__item-action`
  const couponActions = document.querySelectorAll(".modal-coupon__item-action");

  couponActions.forEach((action) => {
    action.addEventListener("click", function () {
      // Tìm phần tử cha `modal-coupon__item` của `modal-coupon__item-action`
      const parentItem = action.closest(".modal-coupon__item");

      // Kiểm tra và thêm/lấy bỏ lớp `active`
      if (parentItem) {
        parentItem.classList.toggle("active");
      }
    });
  });
  
  document.addEventListener("DOMContentLoaded", function () {
  const showCouponButton = document.querySelector(".checkout-coupon__show");
  const couponContainer = document.querySelector(".modal-coupon__container");
  const closeCouponButton = document.querySelector(".modal-coupon__close");

  // Hiển thị modal khi nhấp vào nút "Chọn hoặc nhập mã"
  showCouponButton.addEventListener("click", function () {
    couponContainer.style.display = "block";
  });

  // Ẩn modal khi nhấn nút "X"
  closeCouponButton.addEventListener("click", function () {
    couponContainer.style.display = "none";
  });

  // Tự động bỏ `disabled` trên nút "Áp dụng" khi nhập mã
  const promoCodeInput = document.getElementById("promoCode");
  const applyButton = document.getElementById("applyButton");

  promoCodeInput.addEventListener("input", function () {
    applyButton.disabled = promoCodeInput.value.trim() === "";
  });
  
  const provinceSelect = document.getElementById("province");
const districtSelect = document.getElementById("district");
const wardSelect = document.getElementById("ward");

const apiURL = ""; // API công khai dữ liệu

// Load danh sách Tỉnh/Thành phố
async function loadProvinces() {
    const response = await fetch(`${apiURL}/p/`);
    const data = await response.json();
    data.forEach(province => {
        const option = document.createElement("option");
        option.value = province.code;
        option.textContent = province.name;
        provinceSelect.appendChild(option);
    });
}

// Khi chọn Tỉnh/Thành phố
provinceSelect.addEventListener("change", async () => {
    const provinceCode = provinceSelect.value;

    // Xóa dữ liệu cũ trong dropdown
    districtSelect.innerHTML = '<option value="">Chọn Quận / Huyện</option>';
    wardSelect.innerHTML = '<option value="">Chọn Phường/Xã</option>';
    wardSelect.disabled = true;

    if (provinceCode) {
        districtSelect.disabled = false;
        const response = await fetch(`${apiURL}/p/${provinceCode}?depth=2`);
        const data = await response.json();

        data.districts.forEach(district => {
            const option = document.createElement("option");
            option.value = district.code;
            option.textContent = district.name;
            districtSelect.appendChild(option);
        });
    } else {
        districtSelect.disabled = true;
    }
});

// Khi chọn Quận/Huyện
districtSelect.addEventListener("change", async () => {
    const districtCode = districtSelect.value;

    wardSelect.innerHTML = '<option value="">Chọn Phường/Xã</option>';

    if (districtCode) {
        wardSelect.disabled = false;
        const response = await fetch(`${apiURL}/d/${districtCode}?depth=2`);
        const data = await response.json();

        data.wards.forEach(ward => {
            const option = document.createElement("option");
            option.value = ward.code;
            option.textContent = ward.name;
            wardSelect.appendChild(option);
        });
    } else {
        wardSelect.disabled = true;
    }
});

// Khởi chạy
loadProvinces();

// Lấy tất cả các input trong form
const formInputs = document.querySelectorAll('.form-control');

// Xử lý sự kiện focus và blur
formInputs.forEach(input => {
    let hasInteracted = false; // Biến trạng thái để kiểm tra người dùng đã tương tác

    input.addEventListener('blur', () => {
        hasInteracted = true; // Đánh dấu là đã tương tác
        if (!input.value.trim()) {
            input.classList.add('error'); // Thêm class error
            const errorElement = input.nextElementSibling;
            if (errorElement && errorElement.classList.contains('valid-error')) {
                errorElement.style.display = 'flex'; // Hiển thị lỗi
            }
        }
    });

    input.addEventListener('focus', () => {
        // Xóa class error và thông báo lỗi khi người dùng focus lại vào input
        if (hasInteracted) {
            input.classList.remove('error');
            const errorElement = input.nextElementSibling;
            if (errorElement && errorElement.classList.contains('valid-error')) {
                errorElement.style.display = 'none';
            }
        }
    });
});

// Lấy các phần tử cần thiết
const modal = document.getElementById('addressModal');
const openModalBtn = document.getElementById('openModal');
const closeModalBtn = document.getElementById('closeModal');

// Hiển thị modal khi nhấp vào nút "Xác nhận"
openModalBtn.addEventListener('click', () => {
    modal.style.display = 'flex';
});

// Ẩn modal khi nhấp vào nút đóng
closeModalBtn.addEventListener('click', () => {
    modal.style.display = 'none';
});

// Ẩn modal khi nhấp ra ngoài nội dung modal
window.addEventListener('click', (event) => {
    if (event.target === modal) {
        modal.style.display = 'none';
    }
});

});
