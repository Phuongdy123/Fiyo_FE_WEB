import { ICategory } from "./ICategory";
export interface IProduct {
  _id: string;
  name: string;
  images: string[];
  price: number;
  sale: number;
  material: string;
  shop_id: number;
  description: string;
  sale_count?: number;
  category_id: {
    _id: string;
    name: string;
  };
  isHidden: boolean;
  create_at: string;
  varians:IVariant;
}

export interface ISize {
  _id: string;
  size: string;
  quantity: number;
  sku: string;
}

export interface IVariant {
  _id: string;
  color: string;
  sizes: ISize[];
}

export interface IProductVariant {
  _id: string;
  product_id: string;
  variants: IVariant[];
  createdAt: string;
  updatedAt: string;
}

export interface IProductInOrder {
  product_id: string;
  name: string;
  images: string[];
  price: number;
  quantity: number;
}