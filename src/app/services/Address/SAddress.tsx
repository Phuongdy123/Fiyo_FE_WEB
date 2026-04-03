import { IAddress } from "@/app/untils/IAddress";

const BASE_URL = "https://fiyo-be.onrender.com/api/address";

/**
 * Hàm tiện ích xử lý gọi API dùng chung (Clean Code)
 */
async function handleResponse<T>(res: Response): Promise<T> {
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || "Thao tác thất bại");
  }
  return data;
}

/**
 * Thêm địa chỉ mới
 */
export const addAddress = async (data: IAddress): Promise<IAddress> => {
  const res = await fetch(`${BASE_URL}/create`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  const result = await handleResponse<{ result: IAddress }>(res);
  return result.result;
};

/**
 * Lấy tất cả địa chỉ của User
 * Tối ưu: Sử dụng cache của Next.js (60s) để tránh load lại khi F5 liên tục
 */
export const getAllAddress = async (url: string): Promise<IAddress[]> => {
  const res = await fetch(url, {
    next: { revalidate: 60 } 
  });
  
  const data = await handleResponse<IAddress[]>(res);
  // Ép kiểu trực tiếp thay vì map từng dòng để tăng tốc độ xử lý CPU
  return data;
};

/**
 * Lấy địa chỉ mặc định
 */
export const getDefaultAddress = async (url: string): Promise<IAddress | null> => {
  try {
    const res = await fetch(url, { next: { revalidate: 60 } });
    const data = await handleResponse<IAddress[]>(res);

    // Dùng find trực tiếp trên data đã ép kiểu, trả về null nếu không thấy
    return data.find((addr) => addr.is_default === true) || null;
  } catch (error) {
    console.error("Lỗi khi lấy địa chỉ mặc định:", error);
    return null;
  }
};