import { IUser } from "../untils/IUser";

export const getUserById = async (id: string): Promise<IUser | null> => {
  try {
    const res = await fetch(`http://fiyo.click/api/user/${id}`);
    const data = await res.json();

    if (!res.ok || !data.status) {
      console.error("Không tìm thấy người dùng:", data.message);
      return null;
    }

    const user: IUser = data.data;
    return user;
  } catch (error) {
    console.error("Lỗi khi lấy người dùng:", error);
    return null;
  }
};
