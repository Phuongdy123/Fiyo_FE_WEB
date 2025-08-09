'use client';
import { useAuth } from "@/app/context/CAuth";

export default function LogoutComponent() {
  const { logoutUser } = useAuth();

  const hideModal = () => {
    const modal = document.getElementById("modalConfirm");
    if (modal) modal.classList.add("hidden");
  };

  const handleLogout = () => {
    logoutUser(); // xoá user & token
    hideModal();
    window.location.href = "/"; // hoặc dùng router.push("/") nếu cần
  };

  return (
    <>
      <div id="modalConfirm" className="modal-confirm__container hidden">
        <div className="modal-confirm__content">
          <h4 className="modal-confirm__title">Đăng xuất</h4>
          <p className="modal-confirm__des">
            Bạn có chắc muốn đăng xuất không?
          </p>
          <div className="modal-confirm__actions">
            <button
              className="modal-confirm__button modal-confirm__button--inline"
              onClick={hideModal}
            >
              Hủy
            </button>
            <button
              className="modal-confirm__button modal-confirm__button--primary"
              style={{ backgroundColor: "red", color: "aliceblue" }}
              onClick={handleLogout}
            >
              Xác nhận
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
