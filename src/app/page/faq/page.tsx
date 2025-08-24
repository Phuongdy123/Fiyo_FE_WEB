// src/app/faq/page.tsx
export const metadata = { title: "Hỏi đáp | Fiyo" };


type QA = { q: string; a: string };

const faqs: QA[] = [
  { q: "Thời gian giao hàng?", a: "3–5 ngày làm việc tuỳ khu vực." },
  { q: "Đổi trả thế nào?", a: "Đổi trong 7 ngày, giữ tem mác và hoá đơn." },
  { q: "Các phương thức thanh toán?", a: "COD, VNPay, ZaloPay…" },
];

export default function FAQPage() {
  return (
    <main className="faq-container">
      <h1 className="faq-title">Hỏi đáp</h1>

      <div className="faq-list">
        {faqs.map((f, i) => (
          <details key={i} className="faq-item">
            <summary className="faq-summary">{f.q}</summary>
            <p className="faq-answer">{f.a}</p>
          </details>
        ))}
      </div>

      <p className="faq-footer">
        Không thấy câu trả lời bạn cần?{" "}
        <a href="mailto:cs@fiyo.vn" className="faq-link">Liên hệ hỗ trợ</a>.
      </p>
    </main>
  );
}
