import { IVoucher } from "@/app/untils/IVoucher";

export const getAllVoucher = async (url: string): Promise<IVoucher[]> => {
  const res = await fetch(url);
  const data = await res.json();

  const vouchers: IVoucher[] = data.vouchers.map((voucher: any) => ({
    _id: voucher._id,
    value: voucher.value,
    voucher_code: voucher.voucher_code,
    created_at: voucher.created_at,
    min_total: voucher.min_total,
    max_total: voucher.max_total,
    quantity: voucher.quantity,
    expired_at:voucher.expired_at,
    type: voucher.type,
  }));

  return vouchers;
};
export const getDefaultVoucher = async (url: string): Promise<IVoucher | null> => {
  const res = await fetch(url);
  const data = await res.json();

  const defaultVoucher = data.vouchers.find((voucher: any) => voucher.isDefault === true);

  if (!defaultVoucher) return null;

  const voucher: IVoucher = {
    _id: defaultVoucher._id,
    value: defaultVoucher.value,
    voucher_code: defaultVoucher.voucher_code,
    created_at: defaultVoucher.created_at,
    min_total: defaultVoucher.min_total,
    max_total: defaultVoucher.max_total,
    quantity: defaultVoucher.quantity,
    expired_at: defaultVoucher.expired_at,
    type: defaultVoucher.type,
  };

  return voucher;
};
export const getVoucherByUserId = async (userId: string): Promise<{ userRank: string; vouchers: IVoucher[] }> => {
  const res = await fetch(`https://fiyo.click/api/voucher/user/${userId}`);
  const data = await res.json();

  // ❌ bỏ check status này đi
  if (!data || !data.vouchers) {
    throw new Error(data.message || "Lỗi lấy voucher theo user");
  }

  const vouchers: IVoucher[] = data.vouchers.map((voucher: any) => ({
    _id: voucher._id,
    value: voucher.value,
    voucher_code: voucher.voucher_code,
    quantity: voucher.quantity,
    is_active: voucher.is_active,
    min_total: voucher.min_total,
    max_total: voucher.max_total,
    expired_at: voucher.expired_at,
    target_rank: voucher.target_rank || null,
    description: voucher.description || "",
    createdAt: voucher.createdAt,
    updatedAt: voucher.updatedAt,
  }));

  return {
    userRank: data.userRank,
    vouchers,
  };
};
