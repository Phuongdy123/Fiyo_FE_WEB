"use client";

import { useRouter } from "next/navigation";
import { useAuth } from "@/app/context/CAuth";
import "@/app/assets/css/account.css";
import AccountEffects from "@/app/assets/js/account";
import { useEffect, useRef, useState } from "react";
import LogoutComponent from "../../components/shared/Logout";
import AccountSiteBar from "@/app/components/shared/AccountSiteBar";
import { IOrder } from "@/app/untils/IOrder";

/* =========================
   Helpers & Types
   ========================= */

// Dịch trạng thái sang tiếng Việt (dùng chung cho đơn con)
const translateStatus = (status?: string) => {
  switch (status) {
    case "unpending": return "Chưa xử lý";
    case "pending": return "Đang chờ xử lý";
    case "confirmed": return "Đã xác nhận";
    case "preparing": return "Đang chuẩn bị";
    case "awaiting_shipment": return "Chờ vận chuyển";
    case "shipping": return "Đang giao hàng";
    case "delivered": return "Đã giao hàng";
    case "failed": return "Giao hàng thất bại";
    case "cancelled": return "Đã hủy";
    case "refund": return "Hoàn tiền";
    default: return "Không xác định";
  }
};

type OrderShopStatus =
  | "unpending" | "pending" | "confirmed" | "preparing"
  | "awaiting_shipment" | "shipping" | "delivered"
  | "failed" | "cancelled" | "refund";

type OrderShop = {
  _id: string;
  order_id: string | null | { _id: string };
  shop_id: { _id: string; name?: string } | string | null;
  total_price: number;
  status_order: OrderShopStatus;
  createdAt?: string;
  updatedAt?: string;
};

/** Dòng dữ liệu phẳng để render card đơn con */
type ShopRow = {
  orderShopId: string;
  parentOrderId?: string;
  shopName: string;
  total: number;
  status: OrderShopStatus;
  createdAt?: string;
  updatedAt?: string;
};

// Định dạng tiền VNĐ
const formatPrice = (price: number) =>
  (Number(price) || 0).toLocaleString("vi-VN") + " ₫";

// Định dạng thời gian dd/MM/yyyy HH:mm
const formatDate = (dateInput: Date | string | null | undefined) => {
  if (!dateInput) return "Không xác định";
  const date = new Date(dateInput);
  if (isNaN(date.getTime())) return "Không xác định";
  const d = String(date.getDate()).padStart(2, "0");
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const y = date.getFullYear();
  const hh = String(date.getHours()).padStart(2, "0");
  const mm = String(date.getMinutes()).padStart(2, "0");
  return `${d}/${m}/${y} ${hh}:${mm}`;
};

/* =========================
   Page Component
   ========================= */

export default function AccountPage() {
  const router = useRouter();
  const { user } = useAuth();
  const userId = user?._id as string | undefined;

  const [loading, setLoading] = useState(false);
  const [rows, setRows] = useState<ShopRow[]>([]);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    // Gói toàn bộ logic load vào 1 hàm để dễ huỷ (cleanup)
    const run = async () => {
      if (!userId) return;

      // Huỷ mọi request cũ (nếu có) để tránh race-condition
      if (abortRef.current) abortRef.current.abort();
      abortRef.current = new AbortController();

      try {
        setLoading(true);
        setRows([]);

        // 1) Lấy danh sách ĐƠN CHA của user
        const res = await fetch(
          `http://localhost:3000/api/orders/user/${userId}`,
          { cache: "no-store", signal: abortRef.current.signal }
        );
        if (!res.ok) throw new Error(`HTTP ${res.status}`);

        const ordersArr: IOrder[] = await res.json();

        // 2) Sắp xếp đơn cha mới nhất trước (nếu BE chưa sort)
        const sorted = [...(ordersArr || [])].sort(
          (a, b) =>
            new Date(b.createdAt as any).getTime() -
            new Date(a.createdAt as any).getTime()
        );

        if (sorted.length === 0) {
          setRows([]);
          setLoading(false);
          return;
        }

        // 3) Gọi SONG SONG danh sách OrderShop cho từng order cha
        //    => nhanh hơn rất nhiều so với for/await tuần tự
        const calls = sorted.map((o) =>
          fetch(
            `http://localhost:3000/api/orderShop/order/${o._id}?page=1&limit=50`,
            { cache: "no-store", signal: abortRef.current?.signal }
          )
            .then(async (r) => {
              if (!r.ok) return [];
              const data = await r.json();

              // Chuẩn hoá nhiều kiểu trả về:
              // - { result: { items: [...] } } (có phân trang)
              // - { result: [...] }
              // - [...]
              const list =
                Array.isArray(data?.result?.items) ? data.result.items :
                Array.isArray(data?.result)        ? data.result :
                Array.isArray(data)                ? data :
                [];

              // Map về dữ liệu phẳng để render
              return (list as OrderShop[]).map((os) => ({
                orderShopId: os._id,
                parentOrderId:
                  typeof os.order_id === "object"
                    ? os.order_id?._id
                    : (os.order_id || undefined),
                shopName:
                  typeof os.shop_id === "object"
                    ? (os.shop_id?.name || "(Không rõ shop)")
                    : (os.shop_id || "(Không rõ shop)"),
                total: os.total_price,
                status: os.status_order,
                createdAt: os.createdAt,
                updatedAt: os.updatedAt,
              }) as ShopRow);
            })
            .catch(() => [])
        );

        const settled = await Promise.allSettled(calls);

        // 4) Gộp phẳng các kết quả, sort theo thời gian mới nhất
        const flat: ShopRow[] = [];
        for (const s of settled) {
          if (s.status === "fulfilled" && Array.isArray(s.value)) flat.push(...s.value);
        }

        flat.sort(
          (a, b) =>
            new Date(b.createdAt || b.updatedAt || 0).getTime() -
            new Date(a.createdAt || a.updatedAt || 0).getTime()
        );

        setRows(flat);
        setLoading(false);
      } catch (err) {
        if ((err as any)?.name === "AbortError") return; // bị huỷ do re-run
        console.error("Lỗi load OrderShop:", err);
        setRows([]);
        setLoading(false);
      }
    };

    run();
    // Cleanup: huỷ request khi unmount / userId đổi
    return () => abortRef.current?.abort();
  }, [userId]);

  /* ---------- UI ---------- */

  return (
    <>
      <LogoutComponent />
      <div>
        <div className="account-page">
          <div className="account-container">
            <div className="account-main account-main-information">
              <div className="account-information">
                {/* Header mobile */}
                <div className="account-mobile__header">
                  <div className="account-mobile__back">
                    <span className="screen-reader-text">Back</span>
                  </div>
                  <h1 className="account-mobile__title">Thông tin tài khoản</h1>
                </div>

                {/* Header desktop */}
                <div className="account-information__header account__page-header account__page-header--desktop">
                  <h1 className="account-information__title">Đơn hàng theo shop</h1>
                </div>

                <span className="account-information__content">
                  <h2 className="voucher__content-title">Danh sách đơn hàng</h2>

                  {loading && (
                    <div style={{ padding: 12, color: "#666", fontSize: 14 }}>
                      Đang tải đơn hàng vui lòng chờ…
                    </div>
                  )}

                  {!loading && rows.length === 0 && (
                    <div style={{ padding: 12, color: "#666", fontSize: 14 }}>
                      Bạn chưa có đơn nào.
                    </div>
                  )}

                  {/* Chỉ render ĐƠN CON (OrderShop) — bỏ hẳn đơn cha */}
                  {rows.map((row) => (
                    <div
                      className="box-order"
                      key={row.orderShopId}
                      onClick={() => router.push(`/page/orderDetail/${row.orderShopId}`)}
                      style={{ cursor: "pointer" }}
                    >
                      <div className="order">
                        {/* Hàng tiêu đề: TÊN SHOP bên trái, badge trạng thái bên phải */}
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                          <h3> Đơn hàng thuộc shop "{row.shopName || "Online"}"</h3>
                          <div className="order-status">{translateStatus(row.status)}</div>
                        </div>

                        {/* Nội dung như layout đơn cha trong ảnh: Mã đơn / Thời gian / Tổng tiền */}
                        <div className="order-content">
                          <div className="order-detail">
                            <div className="order-title">Mã đơn hàng</div>
                            {/* Hiển thị ID đơn con; muốn show ID đơn cha thì đổi ra row.parentOrderId */}
                            <p className="link-like">{row.orderShopId}</p>
                          </div>

                          <div className="order-detail">
                            <div className="order-title">Thời gian:</div>
                            <p>{formatDate(row.createdAt || row.updatedAt)}</p>
                          </div>

                          <div className="order-detail">
                            <div className="order-title">Tổng tiền:</div>
                            <p className="total-amount">{formatPrice(row.total)}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </span>
              </div>
            </div>

            <AccountSiteBar />
          </div>
        </div>

        {/* Footer giữ nguyên layout sẵn có */}
     

        
      </div>

      <AccountEffects />
    </>
  );
}
