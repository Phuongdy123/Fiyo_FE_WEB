// src/app/stores/page.tsx
export const metadata = { title: "Hệ thống cửa hàng | Fiyo" };


type Store = { name: string; address: string; phone: string };

const stores: Store[] = [
  { name: "Fiyo Hà Đông", address: "688 Quang Trung, Hà Đông, Hà Nội", phone: "024 1234 5678" },
  { name: "Fiyo Quận 1", address: "XX Lê Lợi, Quận 1, TP.HCM", phone: "028 1234 5678" },
];

export default function StoresPage() {
  return (
    <main className="stores-container">
      <h1 className="stores-title">Hệ thống cửa hàng</h1>

      <div className="stores-grid">
        {stores.map((s) => (
          <article key={s.name} className="store-card">
            <h2 className="store-name">{s.name}</h2>
            <p className="store-address">{s.address}</p>
            <p className="store-phone">
              Điện thoại: <a href={`tel:${s.phone.replace(/\s+/g, "")}`}>{s.phone}</a>
            </p>
            <div className="store-actions">
              <a
                className="btn-outline"
                href={`https://maps.google.com/?q=${encodeURIComponent(s.address)}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                Xem bản đồ
              </a>
              <a className="btn-primary" href={`tel:${s.phone.replace(/\s+/g, "")}`}>
                Gọi ngay
              </a>
            </div>
          </article>
        ))}
      </div>
    </main>
  );
}
