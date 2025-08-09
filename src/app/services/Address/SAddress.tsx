import { IAddress } from "@/app/untils/IAddress";

export const addAddress = async (data: IAddress): Promise<IAddress> => {
  const res = await fetch("http://localhost:3000/address/create", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || "Thêm địa chỉ thất bại");
  }

  const result = await res.json();
  return result.result as IAddress;
};

export const getAllAddress = async (url: string): Promise<IAddress[]> => {
  const res = await fetch(url);
  const data = await res.json();

  const address: IAddress[] = data.map((addr: any) => {
    return {
      _id: addr._id,
      name: addr.name,
      phone: addr.phone,
      address: addr.address,
      status: addr.status,
      user_id: addr.user_id,
      type: addr.type,
      detail: addr.detail,
      is_default:addr.is_default,
      createdAt: addr.createdAt,
      updatedAt: addr.updatedAt
    };
  });

  return address;
};

export const getDefaultAddress = async (url: string): Promise<IAddress | null> => {
  try {
    const res = await fetch(url);
    const data = await res.json();

    const defaultAddr = data.find((addr: any) => addr.is_default === true);

    if (!defaultAddr) return null;

    const address: IAddress = {
      _id: defaultAddr._id,
      name: defaultAddr.name,
      phone: defaultAddr.phone,
      address: defaultAddr.address,
      user_id: defaultAddr.user_id,
      type: defaultAddr.type,
      detail: defaultAddr.detail,
      is_default: defaultAddr.is_default,
      createdAt: defaultAddr.createdAt,
      updatedAt: defaultAddr.updatedAt
    };

    return address;
  } catch (error) {
    console.error("Lỗi khi lấy địa chỉ mặc định:", error);
    return null;
  }
};