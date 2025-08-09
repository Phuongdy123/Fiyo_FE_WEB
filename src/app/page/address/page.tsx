"use client";
import { useEffect, useState } from "react";
import { useAuth } from "@/app/context/CAuth";
import "@/app/assets/css/account.css";
import LogoutComponent from "../../components/shared/Logout";
import AccountSiteBar from "@/app/components/shared/AccountSiteBar";
import { IAddress } from "@/app/untils/IAddress";
import { addAddress, getAllAddress } from "@/app/services/Address/SAddress";

interface Province {
  code: string;
  name: string;
  type: string;
}

interface Ward {
  code: string;
  name: string;
  type: string;
  province_code: string;
}

export default function AddressPage() {
  const VALID_PROVINCE_CODES = [
    "01",
    "26",
    "04",
    "11",
    "12",
    "14",
    "20",
    "22",
    "38",
    "40",
    "42",
    "02",
    "10",
    "19",
    "25",
    "27",
    "33",
    "31",
    "37",
    "45",
    "48",
    "51",
    "52",
    "56",
    "66",
    "68",
    "72",
    "75",
    "79",
    "86",
    "87",
    "89",
    "92",
    "96",
  ];

  const { user } = useAuth();
  const userId = user?._id;

  const [editId, setEditId] = useState<string | null>(null);
  const [addressList, setAddressList] = useState<IAddress[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [provinces, setProvinces] = useState<Province[]>([]);
  const [wards, setWards] = useState<Ward[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoadingWards, setIsLoadingWards] = useState(false);

  const [form, setForm] = useState<IAddress>({
    name: "",
    phone: "",
    address: "",
    is_default: false,
    detail: "",
    type: "Nhà Riêng",
    user_id: userId || "",
    province: "",
    ward: "",
  });

  const [selectedAddress, setSelectedAddress] = useState({
    province: "",
    ward: "",
  });

  // Fetch provinces from API and filter for 34 provinces
  useEffect(() => {
    const fetchProvinces = async () => {
      try {
        setError(null);
        const response = await fetch(
          "https://tinhthanhpho.com/api/v1/new-provinces",
          {
            headers: { Accept: "application/json" },
          }
        );
        if (!response.ok)
          throw new Error(`HTTP error! status: ${response.status}`);
        const data = await response.json();
        if (data.success) {
          const filteredProvinces = data.data
            .filter((province: Province) =>
              VALID_PROVINCE_CODES.includes(province.code.padStart(2, "0"))
            )
            .map((province: Province) => ({
              ...province,
              code: province.code.padStart(2, "0"),
            }));
          setProvinces(filteredProvinces);
        } else {
          throw new Error("API returned success: false");
        }
      } catch (error: any) {
        console.error("Lỗi khi lấy danh sách tỉnh/thành:", error);
        setError("Không thể lấy danh sách tỉnh/thành. Vui lòng thử lại sau.");
      }
    };
    fetchProvinces();
  }, []);

  // Fetch wards from API
  useEffect(() => {
    if (!selectedAddress.province) {
      setWards([]);
      setError(null);
      setIsLoadingWards(false);
      return;
    }

    const fetchWards = async () => {
      try {
        setError(null);
        setIsLoadingWards(true);
        const paddedCode = selectedAddress.province.padStart(2, "0");
        const response = await fetch(
          `https://tinhthanhpho.com/api/v1/new-provinces/${paddedCode}/wards`,
          { headers: { Accept: "application/json" } }
        );
        if (!response.ok)
          throw new Error(`HTTP error! status: ${response.status}`);
        const data = await response.json();
        if (data.success) {
          setWards(data.data || []);
        } else {
          throw new Error("API returned success: false");
        }
      } catch (error: any) {
        console.error("Lỗi khi lấy danh sách phường/xã:", error);
        setError("Không thể lấy danh sách phường/xã. Vui lòng thử lại sau.");
        setWards([]);
      } finally {
        setIsLoadingWards(false);
      }
    };
    fetchWards();
  }, [selectedAddress.province]);

  // Fetch address list
  useEffect(() => {
    const fetchData = async () => {
      try {
        if (!userId) return;
        const result = await getAllAddress(
          `http://localhost:3000/address/user/${userId}`
        );
        console.log("Address List API Response:", result); // Debug the raw data
        const mappedResult = result.map((item: IAddress) => ({
          ...item,
          name: item.name || "",
          phone: item.phone || "",
          address: item.address || "",
        }));
        setAddressList(mappedResult);
      } catch (error) {
        console.error("Lỗi khi lấy địa chỉ:", error);
        setError("Không thể lấy danh sách địa chỉ. Vui lòng thử lại sau.");
      }
    };
    if (provinces.length > 0) {
      fetchData();
    }
  }, [userId, provinces]);

  const openForm = () => {
    setForm({
      name: "",
      phone: "",
      address: "",
      is_default: false,
      detail: "",
      type: "Nhà Riêng",
      user_id: userId || "",
      province: "",
      ward: "",
    });
    setSelectedAddress({ province: "", ward: "" });
    setEditId(null);
    setIsOpen(true);
    setError(null);
  };

  const openEditForm = (item: IAddress) => {
    setForm({
      ...item,
      name: item.name || "",
      phone: item.phone || "",
      address: item.address || "",
      province: item.province || "",
      ward: item.ward || "",
      is_default: item.is_default || false,
    });
    setSelectedAddress({
      province: item.province || "",
      ward: item.ward || "",
    });
    setEditId(item._id || null);
    setIsOpen(true);
    setError(null);
  };

  const closeForm = () => {
    setIsOpen(false);
    setEditId(null);
    setError(null);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleRadioChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({
      ...prev,
      type: e.target.value as "Nhà Riêng" | "Công Ty",
    }));
  };

  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    setSelectedAddress((prev) => ({
      ...prev,
      [name]: value,
      ...(name === "province" && { ward: "" }),
    }));
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({
      ...prev,
      is_default: e.target.checked,
    }));
  };

  const handleSave = async () => {
    try {
      const provinceName =
        provinces.find((p) => p.code === selectedAddress.province)?.name || "";
      const wardName =
        wards.find((w) => w.code === selectedAddress.ward)?.name || "";
      const fullAddress = `${form.detail || ""}, ${wardName}, ${provinceName}`
        .replace(/, ,/g, ",")
        .replace(/,$/, "");

      const addressData: IAddress = {
        ...form,
        address: fullAddress,
        is_default: form.is_default,
        user_id: userId || "",
        province: selectedAddress.province,
        ward: selectedAddress.ward,
      };

      if (editId) {
        await fetch(`http://localhost:3000/address/${editId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(addressData),
        });
        alert("Cập nhật địa chỉ thành công");
      } else {
        await addAddress(addressData);
        alert("Thêm địa chỉ thành công");
      }

      closeForm();
      const result = await getAllAddress(
        `http://localhost:3000/address/user/${userId}`
      );
      const mappedResult = result.map((item: IAddress) => ({
        ...item,
        name: item.name || "",
        phone: item.phone || "",
        address: item.address || "",
      }));
      setAddressList(mappedResult);
    } catch (error: any) {
      console.error("Lỗi khi lưu địa chỉ:", error);
      setError(error.message || "Lỗi khi lưu địa chỉ");
    }
  };

  return (
    <>
      <LogoutComponent />
      <div className="account-page">
        <div className="account-container">
          <div className="account-main account-main-information">
            <div className="account-information">
              <span className="account-information__content">
                <h2>Sổ địa chỉ</h2>

                {error && <div className="alert alert-danger">{error}</div>}

                {addressList.length > 0 ? (
                  addressList.map((item) => (
                    <div className="addresses__item" key={item._id}>
                      <div className="addresses__item-info">
                        <div className="addresses__item-content">
                          {item.address}
                        </div>
                        <div className="addresses__item-top">
                          <div className="addresses__item-name">
                            {item.name}
                          </div>
                          <div className="addresses__item-phone">
                            {item.phone}
                          </div>
                        </div>
                      </div>
                      <div className="addresses__item-bottom">
                        <div className="addresses__item-type">
                          <span>{item.type}</span>
                        </div>
                        {item.is_default && (
                          <div className="addresses__item-default">
                            <span>Địa chỉ mặc định</span>
                          </div>
                        )}
                        <div className="addresses__item-edit">
                          <span
                            className="openModal"
                            onClick={() => openEditForm(item)}
                          >
                            Sửa
                          </span>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <p>Không có địa chỉ nào để hiển thị.</p>
                )}

                <div className="account-information__bottom">
                  <button
                    className="btn btn-primary btn-add"
                    onClick={openForm}
                  >
                    Thêm địa chỉ
                  </button>
                </div>

                <div
                  className={`address-new modal in ${editId ? "edit" : "add"}`}
                  style={{ display: isOpen ? "flex" : "none" }}
                >
                  <div className="modal-backdrop" onClick={closeForm} />
                  <div className="address-new__container">
                    <div className="address-new__content">
                      <div className="address-new__header">
                        <div className="address-new__close" onClick={closeForm}>
                          <span className="screen-reader-text">close</span>
                        </div>
                        <h4 className="address-new__title">
                          {editId ? "Sửa địa chỉ" : "Thêm địa chỉ mới"}
                        </h4>
                      </div>
                      <div className="address-new__body">
                        <div className="address-new__form">
                          <div className="row">
                            <div className="form-group col-sm-6">
                              <label>Họ tên</label>
                              <input
                                type="text"
                                className="form-control"
                                placeholder="nhập họ và tên"
                                name="name"
                                onChange={handleChange}
                                value={form.name || ""}
                                required
                              />
                            </div>
                            <div className="form-group col-sm-6">
                              <label>Số điện thoại</label>
                              <input
                                type="text"
                                className="form-control"
                                placeholder="nhập số điện thoại"
                                name="phone"
                                onChange={handleChange}
                                value={form.phone || ""}
                                required
                              />
                            </div>
                          </div>
                          <div className="row">
                            <div className="form-group col-sm-6">
                              <label htmlFor="province">Tỉnh / Thành phố</label>
                              <select
                                id="province"
                                className="form-control"
                                name="province"
                                value={selectedAddress.province}
                                onChange={handleSelectChange}
                                required
                              >
                                <option value="" disabled>
                                  Chọn Tỉnh/Thành phố
                                </option>
                                {provinces.map((p) => (
                                  <option key={p.code} value={p.code}>
                                    {p.name}
                                  </option>
                                ))}
                              </select>
                            </div>
                            <div className="form-group col-sm-6">
                              <label htmlFor="ward">Phường / Xã</label>
                              <select
                                id="ward"
                                className="form-control"
                                name="ward"
                                value={selectedAddress.ward}
                                onChange={handleSelectChange}
                                required
                                disabled={!wards.length || isLoadingWards}
                              >
                                <option value="" disabled>
                                  {isLoadingWards
                                    ? "Đang tải..."
                                    : "Chọn Phường/Xã"}
                                </option>
                                {wards.map((w) => (
                                  <option key={w.code} value={w.code}>
                                    {w.name}
                                  </option>
                                ))}
                              </select>
                            </div>
                          </div>
                          {editId && (
                            <div className="form-group">
                              <label>Địa chỉ hiện tại</label>
                              <input
                                type="text"
                                className="form-control"
                                placeholder="Tòa nhà, số nhà, tên đường"
                                name="address"
                                onChange={handleChange}
                                value={form.address || ""}
                              />
                            </div>
                          )}

                          <div className="form-group">
                            <label>Địa chỉ chi tiết</label>
                            <input
                              type="text"
                              className="form-control"
                              placeholder="Tòa nhà, số nhà, tên đường"
                              name="detail"
                              onChange={handleChange}
                              value={form.detail || ""}
                            />
                          </div>

                          <div className="form-group form-address-type">
                            <label>Loại địa chỉ</label>
                            <div className="control">
                              {["Nhà Riêng", "Công Ty"].map((type) => (
                                <label key={type} className="radio">
                                  <input
                                    type="radio"
                                    name="type"
                                    value={type}
                                    onChange={handleRadioChange}
                                    checked={form.type === type}
                                  />
                                  <span>{type}</span>
                                </label>
                              ))}
                            </div>
                          </div>
                          <div className="form-checkbox">
                            <input
                              type="checkbox"
                              id="checkbox1"
                              checked={form.is_default}
                              onChange={handleCheckboxChange}
                            />
                            <label htmlFor="checkbox1">
                              <span>Đặt làm địa chỉ mặc định</span>
                            </label>
                          </div>
                        </div>
                      </div>
                      <div className="address-new__footer">
                        <button
                          className="address-new__button--save btn btn-primary"
                          onClick={handleSave}
                        >
                          Lưu địa chỉ
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </span>
            </div>
          </div>
          <AccountSiteBar />
        </div>
      </div>
    </>
  );
}
