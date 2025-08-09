export interface ICart  {
  id: string;
  name: string;
  price: number;
  image: string;
  variant_id: string;
  variant: string;
  size: string;
  size_id?: string; // nếu cần
  quantity: number;
  quantity_Product:number;
}