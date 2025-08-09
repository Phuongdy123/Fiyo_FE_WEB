    'use client';

    import { IAddress } from "@/app/untils/IAddress";
    import { useEffect, useState } from "react";

    interface Props {
    form: IAddress;
    newAddress: {
        province: string;
        district: string;
        ward: string;
    };
    provinces: any[];
    districts: any[];
    wards: any[];
    setForm: React.Dispatch<React.SetStateAction<IAddress>>;
    setNewAddress: React.Dispatch<React.SetStateAction<any>>;
    onClose: () => void;
    onSave: () => void;
    editId: string | null;
    }

    export default function AddAddressForm({
    form,
    newAddress,
    provinces,
    districts,
    wards,
    setForm,
    setNewAddress,
    onClose,
    onSave,
    editId,
    }: Props) {
    return (
        <div
        className={`address-new modal in ${editId ? "edit" : "add"}`}
        style={{ display: "flex" }}
        >
        <div className="modal-backdrop" onClick={onClose} />
        <div className="address-new__container">
            <div className="address-new__content">
            <div className="address-new__header">
                <div className="address-new__close" onClick={onClose}>
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
                        onChange={(e) =>
                        setForm((prev) => ({ ...prev, name: e.target.value }))
                        }
                        value={form.name}
                    />
                    </div>
                    <div className="form-group col-sm-6">
                    <label>Số điện thoại</label>
                    <input
                        type="text"
                        className="form-control"
                        placeholder="nhập số điện thoại"
                        name="phone"
                        onChange={(e) =>
                        setForm((prev) => ({ ...prev, phone: e.target.value }))
                        }
                        value={form.phone}
                    />
                    </div>
                </div>

                {/* Province - District - Ward */}
                <div className="row">
                    <div className="form-group col-sm-6">
                    <label>Tỉnh / Thành phố</label>
                    <select
                        className="form-control"
                        value={newAddress.province}
                        onChange={(e) =>
                        setNewAddress({
                            ...newAddress,
                            province: e.target.value,
                            district: "",
                            ward: "",
                        })
                        }
                    >
                        <option value="" disabled>
                        Chọn Tỉnh/Thành phố
                        </option>
                        {provinces.map((p) => (
                        <option key={p.province_id} value={p.name}>
                            {p.name}
                        </option>
                        ))}
                    </select>
                    </div>
                    <div className="form-group col-sm-6">
                    <label>Quận / Huyện</label>
                    <select
                        className="form-control"
                        value={newAddress.district}
                        onChange={(e) =>
                        setNewAddress({
                            ...newAddress,
                            district: e.target.value,
                            ward: "",
                        })
                        }
                        disabled={!newAddress.province}
                    >
                        <option value="" disabled>
                        Chọn Quận / Huyện
                        </option>
                        {districts.map((d) => (
                        <option key={d.district_id} value={d.name}>
                            {d.name}
                        </option>
                        ))}
                    </select>
                    </div>
                </div>

                <div className="form-group">
                    <label>Phường / Xã</label>
                    <select
                    className="form-control"
                    value={newAddress.ward}
                    onChange={(e) =>
                        setNewAddress({
                        ...newAddress,
                        ward: e.target.value,
                        })
                    }
                    disabled={!newAddress.district}
                    >
                    <option value="" disabled>
                        Chọn Phường/Xã
                    </option>
                    {wards.map((w) => (
                        <option key={w.ward_id} value={w.name}>
                        {w.name}
                        </option>
                    ))}
                    </select>
                </div>

                <div className="form-group">
                    <label>Địa chỉ chi tiết</label>
                    <input
                    type="text"
                    className="form-control"
                    name="detail"
                    value={form.detail}
                    onChange={(e) =>
                        setForm((prev) => ({ ...prev, detail: e.target.value }))
                    }
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
                            checked={form.type === type}
                            onChange={(e) =>
                            setForm((prev) => ({ ...prev, type: e.target.value as any }))
                            }
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
                    onChange={(e) =>
                        setForm((prev) => ({ ...prev, is_default: e.target.checked }))
                    }
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
                onClick={onSave}
                >
                Lưu địa chỉ
                </button>
            </div>
            </div>
        </div>
        </div>
    );
    }
