import { IProductInOrder } from "./IProduct";

export interface IOrder {
  _id?: string;
  total_price: number;
  status_order?: "pending" | "confirmed" | "shipped" | " delivered" | "cancelled";
  address_id: string; 
  voucher_id?: string;
  user_id: string;
  evaluate?: string;
  payment_method: "COD" | "vnpay" | "zalopay";
  transaction_code?: string;
  transaction_status?: "unpaid" | "paid" | "failed" | "refunded";
  createdAt?: Date ;
updatedAt?: Date;
}

export interface IOrderProduct {
  product_id: string;
  name: string;
  images: string[];
  price: number;
  quantity: number;
  color: string;
  size: string | null;
}


export interface OrderProduct {
  order_id: string;
  quantity: number;
  createdAt: string;
  product: {
    product_id: string;
    name: string;
    description: string;
    price: number;
    images: string[];
    variant: {
      _id: string;
      color: string;
    };
    size: {
      _id: string;
      size: string;
      sku: string;
      quantity: number;
    };
  };
}



export interface IUserInfo {
  _id: string;
  name: string;
  email: string;
  phone: string;
  address: {
    _id: string;
    name: string;
    phone: string;
    address: string;
    detail: string;
    type: string;
  };
}

export interface IOrderInfo {
  payment_method: string;
  status_order: string;
  transaction_status: string;
  total_price: number;
  createdAt: string;

  status_history: {
    _id: string;
    status: string;
    updatedAt: string;
    note?: string;
  }[];
}

export interface IOrderDetailResponse {
  order_id: string;
  products: IOrderProduct[];
  user: IUserInfo;
  order: IOrderInfo;
}