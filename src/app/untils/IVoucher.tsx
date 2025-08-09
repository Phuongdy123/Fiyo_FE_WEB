export interface IVoucher {
  _id: string; 
  value: number;
  voucher_code: string;
  created_at: string; 
  min_total: number;
  max_total: number;
  quantity: number;
  expired_at:string | null | '';
  type: "%" | "₫" | string;
}
