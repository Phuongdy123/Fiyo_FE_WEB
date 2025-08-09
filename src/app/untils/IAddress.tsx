type AddressType = "Nhà Riêng" | "Công Ty";
export interface IAddress {
  _id?: string;
  name: string;
  phone: string;
address: string;
  is_default?: boolean;
  user_id: string;
  type?: AddressType; 
  detail: string; 
  createdAt?: string;
  updatedAt?: string;

province?: string;
  district?: string;
  ward?: string;
}
