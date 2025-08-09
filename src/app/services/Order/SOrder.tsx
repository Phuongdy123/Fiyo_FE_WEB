import { IOrder, IOrderProduct, OrderProduct } from "@/app/untils/IOrder";
import { IOrderDetailResponse } from '../../untils/IOrder';

export const getOrderByUserId = async (url: string): Promise<IOrder[]> => {
  const res = await fetch(url);
  const data = await res.json();

  const orders: IOrder[] = data.map((order: any) => {
    return {
      _id: order._id,
      total_price: order.total_price,
      status_order: order.status_order,
      
      voucher_id: order.voucher_id,
      user_id: order.user_id,
      evaluate: order.evaluate,
      payment_method: order.payment_method,
      transaction_code: order.transaction_code,
      transaction_status: order.transaction_status,
   createdAt: order.createdAt,
updatedAt: order.updatedAt,
    };
  });

  return orders;
}
export const getOrderDetailByUserId = async (url: string): Promise<IOrderDetailResponse> => {
  const res = await fetch(url);
  if (!res.ok) throw new Error("Failed to fetch order details");

  const data = await res.json();

  const orderDetail: IOrderDetailResponse = {
    order_id: data.result[0]?.order_id || "",
    products: data.result.map((item: OrderProduct): IOrderProduct => ({
      product_id: item.product.product_id,
      name: item.product.name,
      images: item.product.images,
      price: item.product.price,
      quantity: item.quantity,
      color: item.product.variant?.color || "",
      size: item.product.size?.size || null,
    })),
    user: {
      _id: data.user._id,
      name: data.user.name,
      email: data.user.email,
      phone: data.user.phone,
      address: {
        _id: data.user.address._id,
        name: data.user.address.name,
        phone: data.user.address.phone,
        address: data.user.address.address,
        detail: data.user.address.detail,
        type: data.user.address.type,
      }
    },
    order: {
      payment_method: data.order.payment_method,
      status_order: data.order.status_order,
      transaction_status: data.order.transaction_status,
      total_price: data.order.total_price,
      createdAt: data.order.createdAt,
      status_history: data.order.status_history || [], // ✅ Thêm dòng này
    }
  };

  return orderDetail;
};
