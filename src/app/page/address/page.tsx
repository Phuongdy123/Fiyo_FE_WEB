"use client";
import { useEffect, useState } from "react";
import { useAuth } from "@/app/context/CAuth";
import "@/app/assets/css/account.css";
import LogoutComponent from "../../components/shared/Logout";
import AccountSiteBar from "@/app/components/shared/AccountSiteBar";
import { IAddress } from "@/app/untils/IAddress";
import { addAddress, getAllAddress } from "@/app/services/Address/SAddress";
import { useToast } from "@/app/context/CToast";

/** ==== Chuẩn hoá dữ liệu từ API thành format dùng cho UI ==== */
type NormProvince = { code: string; name: string };
type NormWard = { code: string; name: string; province_code: string };

function normalizeProvinces(raw: any): NormProvince[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .map((p: any) => ({
      code: String(p?.province_code ?? p?.code ?? p?.id ?? "").trim(),
      name: String(p?.province_name ?? p?.name ?? p?.full_name ?? "").trim(),
    }))
    .filter((x) => x.code && x.name);
}

function normalizeWards(raw: any): NormWard[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .map((w: any) => ({
      code: String(w?.ward_code ?? w?.code ?? w?.id ?? "").trim(),
      name: String(w?.ward_name ?? w?.name ?? w?.full_name ?? "").trim(),
      province_code: String(w?.province_code ?? w?.parent_code ?? "").trim(),
    }))
    .filter((x) => x.code && x.name);
}

export default function AddressPage() {
  const { user } = useAuth();
  const userId = user?._id;

  const { showToast } = useToast(); // <-- thêm khởi tạo showToast

  const [editId, setEditId] = useState<string | null>(null);
  const [addressList, setAddressList] = useState<IAddress[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  const [provinces, setProvinces] = useState<NormProvince[]>([]);
  const [wards, setWards] = useState<NormWard[]>([]);
  const [isLoadingWards, setIsLoadingWards] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState<IAddress>({
    name: "",
    phone: "",
    address: "", // build tự động
    is_default: false,
    detail: "", // số nhà/đường
    type: "Nhà Riêng",
    user_id: userId || "",
    province: "", // lưu province_code
    ward: "", // lưu ward_code
  });

  const [selectedAddress, setSelectedAddress] = useState({
    province: "", // province_code
    ward: "", // ward_code
  });

  /** Lấy Tỉnh/Thành phố (không lọc) */
  useEffect(() => {
    (async () => {
      try {
        setError(null);
        const res = await fetch("https://34tinhthanh.com/api/provinces", {
          headers: { Accept: "application/json" },
          cache: "no-store",
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        setProvinces(normalizeProvinces(data));
      } catch (e: any) {
        console.error("Lỗi provinces:", e);
        setError("Không thể tải danh sách Tỉnh/Thành.");
        setProvinces([]);
      }
    })();
  }, []);

  /** Lấy Phường/Xã theo province_code */
  useEffect(() => {
    if (!selectedAddress.province) {
      setWards([]);
      setIsLoadingWards(false);
      return;
    }
    (async () => {
      try {
        setError(null);
        setIsLoadingWards(true);
        const res = await fetch(
          `https://34tinhthanh.com/api/wards?province_code=${encodeURIComponent(
            selectedAddress.province
          )}`,
          { headers: { Accept: "application/json" }, cache: "no-store" }
        );
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        setWards(normalizeWards(data));
      } catch (e: any) {
        console.error("Lỗi wards:", e);
        setError("Không thể tải danh sách Phường/Xã.");
        setWards([]);
      } finally {
        setIsLoadingWards(false);
      }
    })();
  }, [selectedAddress.province]);

  /** Lấy danh sách địa chỉ của user */
  useEffect(() => {
    (async () => {
      try {
        if (!userId) return;
        const result = await getAllAddress(
          `https://fiyo.click/api/address/user/${userId}`
        );
        const mapped = result.map((item: IAddress) => ({
          ...item,
          name: item.name || "",
          phone: item.phone || "",
          address: item.address || "",
        }));
        setAddressList(mapped);
      } catch (e) {
        console.error("Lỗi danh sách địa chỉ:", e);
        setError("Không thể lấy danh sách địa chỉ.");
      }
    })();
  }, [userId]);

  /** Modal handlers */
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

  /** Form handlers */
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
  };

  const handleRadioChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, type: e.target.value as "Nhà Riêng" | "Công Ty" }));
  };

  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    setSelectedAddress((prev) => ({
      ...prev,
      [name]: value,
      ...(name === "province" ? { ward: "" } : null),
    }));
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  /** Lưu địa chỉ */
  const handleSave = async () => {
    try {
      const provinceName =
        provinces.find((p) => p.code === selectedAddress.province)?.name || "";
      const wardName =
        wards.find((w) => w.code === selectedAddress.ward)?.name || "";

      const fullAddress = [form.detail?.trim(), wardName, provinceName]
        .filter(Boolean)
        .join(", ")
        .replace(/,\s*,/g, ", ")
        .replace(/,\s*$/, "");

      const payload: IAddress = {
        ...form,
        address: fullAddress,
        user_id: userId || "",
        province: selectedAddress.province, // code
        ward: selectedAddress.ward, // code
      };

      if (editId) {
        await fetch(`https://fiyo.click/api/address/${editId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        // alert("Cập nhật địa chỉ thành công");
        showToast("Cập nhật địa chỉ thành công", "success");
      } else {
        await addAddress(payload);
        // alert("Thêm địa chỉ thành công");
        showToast("Thêm địa chỉ thành công", "success");
      }

      closeForm();

      // Refresh list
      const result = await getAllAddress(
        `https://fiyo.click/api/address/user/${userId}`
      );
      const mapped = result.map((item: IAddress) => ({
        ...item,
        name: item.name || "",
        phone: item.phone || "",
        address: item.address || "",
      }));
      setAddressList(mapped);
    } catch (e: any) {
      console.error("Lỗi khi lưu địa chỉ:", e);
      setError(e.message || "Lỗi khi lưu địa chỉ");
      showToast(e?.message || "Lỗi khi lưu địa chỉ", "error"); // thêm toast lỗi (không đổi logic khác)
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
                        <div className="addresses__item-content">{item.address}</div>
                        <div className="addresses__item-top">
                          <div className="addresses__item-name">{item.name}</div>
                          <div className="addresses__item-phone">{item.phone}</div>
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
                          <span className="openModal" onClick={() => openEditForm(item)}>
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
                  <button className="btn btn-primary btn-add" onClick={openForm}>
                    Thêm địa chỉ
                  </button>
                </div>

                {/* Modal thêm/sửa */}
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
                                placeholder="Nhập họ và tên"
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
                                placeholder="Nhập số điện thoại"
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
                                  {isLoadingWards ? "Đang tải..." : "Chọn Phường/Xã"}
                                </option>
                                {wards.map((w) => (
                                  <option key={w.code} value={w.code}>
                                    {w.name}
                                  </option>
                                ))}
                              </select>
                            </div>
                          </div>

                          {/* Chỉ nhập chi tiết số nhà/đường */}
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
                              name="is_default"
                              checked={form.is_default}
                              onChange={handleChange}
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
                {/* /Modal */}
              </span>
            </div>
          </div>
          <AccountSiteBar />
        </div>
      </div>
    </>
  );
}
