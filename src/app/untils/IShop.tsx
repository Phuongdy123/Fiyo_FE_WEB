export interface IShop {
  _id: string;
  name: string;
  address: string;
  phone: string;
  email: string;
  description?: string;
  avatar?: string;
  banner?: string;
  status: "active" | "inactive" | "pending";
  created_at?: string;
  updated_at?: string;

  sale_count?: number;
  rating?: number | { average: number; count: number }; // ✅ thêm kiểu object
  followers?: { _id: string; name: string; email: string; avatar?: string }[];
  followers_count?: number;
}
