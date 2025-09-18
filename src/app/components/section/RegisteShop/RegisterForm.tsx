"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import "@/app/assets/css/register.css";
import { useToast } from "@/app/context/CToast";
import { useAuth } from "@/app/context/CAuth";

export default function SellerRegisterForm() {
  const router = useRouter();
  const { showToast } = useToast();
  const { user, loginUser } = useAuth();
  const [step, setStep] = useState<1 | 2>(1);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Step 1
  const [formData, setFormData] = useState({
    shopName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    avatar: null as File | null,
    description: "",
  });

  // Step 2
  const [addressForm, setAddressForm] = useState({
    detail: "",
    province: "",
    ward: "",
  });

  // Provinces & Wards
  interface Province { code: string; name: string }
  interface Ward { code: string; name: string }
  const VALID_PROVINCE_CODES = useMemo(
    () => ["01","26","04","11","12","14","20","22","38","40","42","02","10","19","25","27","33","31","37","45","48","51","52","56","66","68","72","75","79","86","87","89","92","96"],
    []
  );
  const [provinces, setProvinces] = useState<Province[]>([]);
  const [wards, setWards] = useState<Ward[]>([]);
  const [isLoadingWards, setIsLoadingWards] = useState(false);

  useEffect(() => {
    fetch("https://tinhthanhpho.com/api/v1/new-provinces")
      .then(r => r.json())
      .then(d => {
        if (d.success) {
          setProvinces(d.data.filter((p: any) => VALID_PROVINCE_CODES.includes(String(p.code).padStart(2,"0")))
            .map((p: any) => ({code: String(p.code).padStart(2,"0"), name: p.name})));
        }
      });
  }, [VALID_PROVINCE_CODES]);

  useEffect(() => {
    if (!addressForm.province) return;
    setIsLoadingWards(true);
    fetch(`https://tinhthanhpho.com/api/v1/new-provinces/${addressForm.province}/wards`)
      .then(r => r.json())
      .then(d => setWards(d.success ? d.data : []))
      .finally(() => setIsLoadingWards(false));
  }, [addressForm.province]);

  // ---------------- Handlers ----------------
  const handleChange = (e: any) => {
    const { name, value, files } = e.target;
    if (files) setFormData((p) => ({ ...p, [name]: files[0] }));
    else setFormData((p) => ({ ...p, [name]: value }));
  };
  const handleAddressChange = (e: any) => {
    setAddressForm((p) => ({ ...p, [e.target.name]: e.target.value }));
  };

  // ---------------- Validation ----------------
  const validateStep1 = () => {
    if (!formData.shopName) return "Vui lòng nhập tên shop.";
    if (!formData.email) return "Vui lòng nhập email.";
    if (formData.password !== formData.confirmPassword) return "Mật khẩu nhập lại không khớp.";
    return null;
  };
  const validateStep2 = () => {
    if (!addressForm.province || !addressForm.ward || !addressForm.detail) return "Vui lòng nhập địa chỉ.";
    return null;
  };

  // ---------------- Submit ----------------
  const handleNext = (e: any) => {
    e.preventDefault();
    const msg = validateStep1();
    if (msg) return setError(msg);
    setError("");
    setStep(2);
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    const msg = validateStep2();
    if (msg) return setError(msg);
    setError("");

    if (!user?._id) {
      setError("Bạn cần đăng nhập để đăng ký shop.");
      return;
    }

    try {
      const provinceName = provinces.find((p) => p.code === addressForm.province)?.name || "";
      const wardName = wards.find((w) => w.code === addressForm.ward)?.name || "";
      const fullAddress = `${addressForm.detail}, ${wardName}, ${provinceName}`;

      const form = new FormData();
      form.append("user_id", user._id);
      form.append("name", formData.shopName);
      form.append("email", formData.email);
      form.append("phone", formData.phone);
      form.append("description", formData.description);
      form.append("status", "pending");
      form.append("address", fullAddress);
      if (formData.avatar) form.append("avatar", formData.avatar);

      const res = await fetch("https://fiyo-be.onrender.com/api/shop/", { method: "POST", body: form });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Lỗi tạo shop");

      // Cập nhật role của user thành 2 (seller)
      const roleUpdateRes = await fetch(`https://fiyo-be.onrender.com/api/user/update-role/${user._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: 2 }),
      });
      const roleUpdateData = await roleUpdateRes.json();
      if (!roleUpdateRes.ok) throw new Error(roleUpdateData.message || "Lỗi cập nhật role");

      // Cập nhật user trong AuthContext
      const updatedUser = { ...user, role: 2 };
      loginUser(updatedUser);
      showToast('Chúc mừng bạn đã đăng ký thành công')
      setSuccess("Đăng ký shop thành công!");
      setTimeout(() => {
        router.replace("/page/shop/shop-infor");
      }, 2000); // Delay 2 seconds before redirect
      setStep(1);
      setFormData({ shopName: "", email: "", phone: "", password: "", confirmPassword: "", avatar: null, description: "" });
      setAddressForm({ detail: "", province: "", ward: "" });
    } catch (err: any) {
      setError(err.message);
    }
  };

  // ---------------- UI ----------------
  return (
    <div className="container-default">
      <article><h1>Đăng ký trở thành Người bán</h1><h2>____</h2></article>
      <aside>
        <div className="form-container">
          <div style={{ textAlign: "center", marginBottom: 12 }}>Bước {step} / 2</div>

          {step === 1 && (
            <form onSubmit={handleNext}>
              <div className="form-group"><input type="text" name="shopName" placeholder="Tên Shop" value={formData.shopName} onChange={handleChange} /></div>
              <div className="form-group"><input type="email" name="email" placeholder="Email" value={formData.email} onChange={handleChange} /></div>
              <div className="form-group"><input type="text" name="phone" placeholder="Số điện thoại" value={formData.phone} onChange={handleChange} /></div>
              <div className="form-group"><input type="password" name="password" placeholder="Mật khẩu" value={formData.password} onChange={handleChange} /></div>
              <div className="form-group"><input type="password" name="confirmPassword" placeholder="Nhập lại mật khẩu" value={formData.confirmPassword} onChange={handleChange} /></div>
              <div className="form-group"><input type="file" name="avatar" onChange={handleChange} /></div>
              <div className="form-group"><textarea style={{ width: "100%" }} name="description" placeholder="Mô tả shop" value={formData.description} onChange={handleChange} /></div>
              <button type="submit" className="submit-btn">TIẾP TỤC</button>
            </form>
          )}

          {step === 2 && (
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <select name="province" value={addressForm.province} onChange={handleAddressChange}>
                  <option value="">Chọn Tỉnh/Thành</option>
                  {provinces.map(p => <option key={p.code} value={p.code}>{p.name}</option>)}
                </select>
              </div>
              <div className="form-group">
                <select name="ward" value={addressForm.ward} onChange={handleAddressChange} disabled={!wards.length || isLoadingWards}>
                  <option value="">{isLoadingWards ? "Đang tải..." : "Chọn Phường/Xã"}</option>
                  {wards.map(w => <option key={w.code} value={w.code}>{w.name}</option>)}
                </select>
              </div>
              <div className="form-group"><input type="text" name="detail" placeholder="Số nhà, tên đường" value={addressForm.detail} onChange={handleAddressChange} /></div>
              <div style={{ display: "flex", gap: 8 }}>
                <button type="button" onClick={() => setStep(1)} className="submit-btn">QUAY LẠI</button>
                <button type="submit" className="submit-btn">ĐĂNG KÝ</button>
              </div>
            </form>
          )}

          {error && <div style={{ color: "red", marginTop: 10 }}>{error}</div>}
          {success && <div style={{ color: "green", marginTop: 10 }}>{success}</div>}
        </div>
      </aside>
    </div>
  );
}