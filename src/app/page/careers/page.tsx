// src/app/careers/page.tsx
export const metadata = { title: "Tuyển dụng | Fiyo" };



const jobs = [
  { id: "fe", title: "Frontend Developer", location: "Hà Nội", type: "Full-time" },
  { id: "cs", title: "Chăm sóc khách hàng", location: "TP. HCM", type: "Part-time" },
];

export default function CareersPage() {
  return (
    <main className="careers-container">
      <h1 className="careers-title">Tuyển dụng</h1>
      <p className="careers-intro">
        Gia nhập đội ngũ Fiyo để xây dựng trải nghiệm mua sắm tốt hơn.
      </p>

      <div className="careers-grid">
        {jobs.map((j) => (
          <article key={j.id} className="job-card">
            <h2 className="job-title">{j.title}</h2>
            <p className="job-meta">
              <span>{j.location}</span> • <span>{j.type}</span>
            </p>
            <a
              className="job-apply"
              href={`mailto:hr@fiyo.vn?subject=${encodeURIComponent("Ứng tuyển " + j.title)}`}
            >
              Ứng tuyển
            </a>
          </article>
        ))}
      </div>
    </main>
  );
}
