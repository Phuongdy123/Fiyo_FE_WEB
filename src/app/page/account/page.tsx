"use client";
import { useAuth } from "@/app/context/CAuth";
import { useRouter } from "next/navigation";
import "@/app/assets/css/account.css";
import AccountEffects from "@/app/assets/js/account";
import { useEffect, useState } from "react";
import LogoutComponent from "../../components/shared/Logout";
import AccountSiteBar from "@/app/components/shared/AccountSiteBar";
import { getUserById } from "@/app/services/SUser";
import { IUser } from "@/app/untils/IUser";

export default function AccountPage() {
  const { user, loginUser } = useAuth();
  const [previewAvatar, setPreviewAvatar] = useState<string | null>(null);
  const user_id = user?._id;
  const [onetuser, setOneUser] = useState<IUser | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!user_id) return;
      const data = await getUserById(user_id);
      setOneUser(data);
    };
    fetchData();
  }, [user_id]);

  // State for edit form inputs and errors
  const [formData, setFormData] = useState({
    firstName: "",
    phoneNumber: "",
    email: "",
    avatar: null as File | null,
    gender: "",
  });
  const [errors, setErrors] = useState({
    firstName: "",
    phoneNumber: "",
    email: "",
  });

  useEffect(() => {
    if (onetuser) {
      setFormData({
        firstName: onetuser.name || "",
        phoneNumber: onetuser.phone || "",
        email: onetuser.email || "",
        avatar: null,
        gender: onetuser.gender || "",
      });
    }
  }, [onetuser]);

  const [isEditOpen, setIsEditOpen] = useState(false);

  const formatDate = (isoDate: string) => {
    if (!isoDate) return "";
    const date = new Date(isoDate);
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const openEditForm = () => {
    setIsEditOpen(true);
  };

  const closeEditForm = () => {
    setIsEditOpen(false);
    setPreviewAvatar(null);
    setErrors({ firstName: "", phoneNumber: "", email: "" }); // Reset errors when closing
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData((prev) => ({ ...prev, avatar: file }));
      setPreviewAvatar(URL.createObjectURL(file));
    }
  };

  const validateField = (name: string, value: string) => {
    let error = "";
    switch (name) {
      case "firstName":
        if (!value.trim()) error = "Vui lòng nhập họ và tên";
        break;
      case "phoneNumber":
        if (!value.trim()) error = "Vui lòng nhập số điện thoại";
        else if (!/^\d{10,11}$/.test(value))
          error = "Số điện thoại phải từ 10-11 số và chỉ chứa số";
        break;
      case "email":
        if (!value.trim()) error = "Vui lòng nhập địa chỉ email";
        else if (!/^\S+@\S+\.\S+$/.test(value))
          error = "Địa chỉ email không hợp lệ";
        break;
      default:
        break;
    }
    return error;
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const error = validateField(name, value);
    setErrors((prev) => ({ ...prev, [name]: error }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate all fields on submit
    const newErrors = {
      firstName: validateField("firstName", formData.firstName),
      phoneNumber: validateField("phoneNumber", formData.phoneNumber),
      email: validateField("email", formData.email),
    };
    setErrors(newErrors);

    if (Object.values(newErrors).some((error) => error !== "")) {
      alert("Vui lòng sửa các lỗi trước khi lưu.");
      return;
    }

    const form = new FormData();
    form.append("name", formData.firstName);
    form.append("phone", formData.phoneNumber);
    form.append("email", formData.email);
    form.append("gender", formData.gender);

    if (formData.avatar) {
      form.append("avatar", formData.avatar);
    }

    try {
      const res = await fetch(
        `http://localhost:3000/user/update/${user?._id}`,
        {
          method: "PATCH",
          body: form,
        }
      );

      const data = await res.json();
      if (res.ok) {
        alert("Cập nhật thành công");
        window.location.reload();
        const newUser = await getUserById(user?._id!);
        if (newUser) {
          console.log("New user:", newUser);
          loginUser(newUser);
          setOneUser(newUser);
        } else {
          alert("Lỗi: Không lấy được thông tin người dùng mới");
        }
        setIsEditOpen(false);
        setPreviewAvatar(null);
      } else {
        alert("Lỗi: " + data.message);
      }
    } catch (error) {
      alert("Lỗi kết nối");
      console.error(error);
    }
  };

  return (
    <>
      <LogoutComponent />
      <div className="account-page">
        <div className="account-container">
          <div className="account-main account-main-information">
            <div className="account-information">
              <div className="account-mobile__header">
                <div className="account-mobile__back">
                  <span className="screen-reader-text">Back</span>
                </div>
                <h1 className="account-mobile__title">Thông tin tài khoản</h1>
              </div>
              <div className="account-information__header account__page-header account__page-header--desktop">
                <h1 className="account-information__title">
                  Thông tin tài khoản
                </h1>
              </div>
              <span className="account-information__content">
                <form className="form">
                  <input type="hidden" name="lastname" defaultValue="-" />
                  <div className="form-group form-gender">
                    <div className="label">Giới tính</div>
                    <div className="control">
                      <label>
                        <input
                          type="radio"
                          name="gender"
                          id="Nam"
                          checked={
                            onetuser?.gender === "Nam" || user?.gender === "Nam"
                          }
                          disabled
                        />
                        <span>Nam</span>
                      </label>
                      <label>
                        <input
                          type="radio"
                          name="gender"
                          id="Nữ"
                          checked={
                            onetuser?.gender === "Nữ" || user?.gender === "Nữ"
                          }
                          disabled
                        />
                        <span>Nữ</span>
                      </label>
                      <label>
                        <input
                          type="radio"
                          name="gender"
                          id="Khác"
                          checked={
                            onetuser?.gender === "Khác" ||
                            user?.gender === "Khác"
                          }
                          disabled
                        />
                        <span>Khác</span>
                      </label>
                    </div>
                  </div>
                  <div>
                    <div id="firstName" className="form-group has-text">
                      <label
                        htmlFor="firstName"
                        className="will-change will-change-active"
                        style={{ willChange: "font-size" }}
                      >
                        Họ và tên
                      </label>
                      <input
                        type="text"
                        name="firstname"
                        id="firstName"
                        className="form-control"
                        defaultValue={onetuser?.name || user?.name || ""}
                        readOnly
                        style={{ outline: "none" }}
                      />
                    </div>
                  </div>
                  <div>
                    <div id="phoneNumber" className="form-group has-text">
                      <label
                        htmlFor="phoneNumber"
                        className="will-change will-change-active"
                        style={{ willChange: "font-size" }}
                      >
                        Số điện thoại
                      </label>
                      <input
                        type="number"
                        name="phoneNumber"
                        id="phoneNumber"
                        className="form-control"
                        defaultValue={onetuser?.phone || user?.phone || ""}
                        readOnly={!!(onetuser?.phone || user?.phone)} // Chỉ readOnly nếu có giá trị
                        style={{ outline: "none" }}
                      />
                    </div>
                  </div>
                  <div>
                    <div id="email" className="form-group has-text">
                      <label
                        htmlFor="email"
                        className="will-change will-change-active"
                        style={{ willChange: "font-size" }}
                      >
                        Địa chỉ Email
                      </label>
                      <input
                        type="email"
                        name="email"
                        id="email"
                        className="form-control"
                        defaultValue={onetuser?.email || user?.email || ""}
                        readOnly
                        style={{ outline: "none" }}
                      />
                    </div>
                  </div>
                  <div className="form-group active">
                    <label>Sinh Nhật</label>
                    <input
                      type="text"
                      name="createdAt"
                      className="form-control"
                      defaultValue={
                        formatDate(onetuser?.createdAt || user?.createdAt || "")
                      }
                      readOnly
                    />
                  </div>
                  <div className="form-group active"></div>
                  <div className="account-information__bottom">
                    <button
                      type="button"
                      className="btn btn-primary btn-save"
                      onClick={openEditForm}
                    >
                      Sửa thông tin
                    </button>
                  </div>
                </form>
              </span>
            </div>
          </div>
          <AccountSiteBar />
        </div>

        <div
          className={`edit-overlay ${isEditOpen ? "show" : "hidden"}`}
          onClick={closeEditForm}
        >
          <div
            className="edit-form-container"
            onClick={(e) => e.stopPropagation()}
          >
            <button className="edit-close-button" onClick={closeEditForm}>
              ✖
            </button>
            <div className="account-main-mini account-main-information">
              <div className="account-information">
                <div className="account-mobile__header">
                  <div className="account-mobile__back">
                    <span className="screen-reader-text">Back</span>
                  </div>
                  <h1 className="account-mobile__title">Thông tin tài khoản</h1>
                </div>
                <div className="account-information__header account__page-header account__page-header--desktop">
                  <h1 className="account-information__title">
                    Thông tin tài khoản
                  </h1>
                </div>
                <span className="account-information__content">
                  <form className="form" onSubmit={handleSubmit}>
                    <input type="hidden" name="lastname" defaultValue="-" />
                    <div className="form-group form-gender">
                      <div className="label">Giới tính</div>
                      <div className="control">
                        <label>
                          <input
                            type="radio"
                            name="gender"
                            value="Nam"
                            checked={formData.gender === "Nam"}
                            onChange={handleInputChange}
                          />
                          <span>Nam</span>
                        </label>
                        <label>
                          <input
                            type="radio"
                            name="gender"
                            value="Nữ"
                            checked={formData.gender === "Nữ"}
                            onChange={handleInputChange}
                          />
                          <span>Nữ</span>
                        </label>
                        <label>
                          <input
                            type="radio"
                            name="gender"
                            value="Khác"
                            checked={formData.gender === "Khác"}
                            onChange={handleInputChange}
                          />
                          <span>Khác</span>
                        </label>
                      </div>
                    </div>
                    <div>
                      <div id="firstName" className="form-group has-text">
                        <label
                          htmlFor="firstName"
                          className="will-change will-change-active"
                        >
                          Họ và tên
                        </label>
                        <input
                          type="text"
                          name="firstName"
                          required
                          id="firstName"
                          className="form-control"
                          value={formData.firstName}
                          onChange={handleInputChange}
                          onBlur={handleBlur}
                          style={{ outline: "none" }}
                        />
                        {errors.firstName && (
                          <span className="sf-input__error-message">
                            {errors.firstName}
                          </span>
                        )}
                      </div>
                    </div>
                    <div>
                      <div id="phoneNumber" className="form-group has-text">
                        <label
                          htmlFor="phoneNumber"
                          className="will-change will-change-active"
                        >
                          Số điện thoại
                        </label>
                        <input
                          type="number"
                          name="phoneNumber"
                          required
                          id="phoneNumber"
                          className="form-control"
                          value={formData.phoneNumber}
                          onChange={(e) =>
                            setFormData((prev) => ({
                              ...prev,
                              phoneNumber: e.target.value,
                            }))
                          }
                          disabled={!!(onetuser?.phone || user?.phone)} // Disable nếu user đã có sđt lưu trong hệ thống
                          onBlur={handleBlur}
                          style={{ outline: "none" }}
                        />
                        {errors.phoneNumber && (
                          <span className="sf-input__error-message">
                            {errors.phoneNumber}
                          </span>
                        )}
                      </div>
                    </div>
                    <div>
                      <div id="email" className="form-group has-text">
                        <label
                          htmlFor="email"
                          className="will-change will-change-active"
                        >
                          Địa chỉ Email
                        </label>
                        <input
                          type="email"
                          name="email"
                          required
                          id="email"
                          className="form-control"
                          value={formData.email}
                          onChange={handleInputChange}
                          onBlur={handleBlur}
                          style={{ outline: "none" }}
                        />
                        {errors.email && (
                          <span className="sf-input__error-message">
                            {errors.email}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="form-group active">
                      <label>Hình ảnh đại diện</label>
                      <input
                        type="file"
                        name="avatar"
                        className="form-control"
                        id="avatar"
                        accept="image/*"
                        onChange={handleAvatarChange}
                      />
                      <div style={{ marginTop: "15px" }}>
                        {previewAvatar && (
                          <>
                            <label>Ảnh xem trước:</label>
                            <div>
                              <img
                                src={previewAvatar}
                                alt="Avatar preview"
                                style={{
                                  width: "60px",
                                  height: "60px",
                                  borderRadius: "50%",
                                  objectFit: "cover",
                                  border: "1px solid #ccc",
                                  marginTop: "5px",
                                }}
                              />
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                    <div className="account-information__bottom">
                      <button
                        type="submit"
                        className="btn btn-primary btn-save"
                      >
                        Lưu Thông Tin
                      </button>
                    </div>
                  </form>
                </span>
              </div>
            </div>
          </div>
        </div>
        <AccountEffects />
      </div>
    </>
  );
}