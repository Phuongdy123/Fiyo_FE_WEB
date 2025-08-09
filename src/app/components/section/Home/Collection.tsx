'use client';
import { useRouter } from 'next/navigation';

export default function CollectionSlider() {
  const router = useRouter();

  const handleClick = (id: string) => {
    router.push(`/page/collection/${id}`);
  };

  return (
    <div className="collections">
      <div className="slick-slide" onClick={() => handleClick('64f0d0008f1e7e001234568f')}>
        <img
          src="https://2885371169.e.cdneverest.net/media/Simiconnector/Nu-spMoi-05Mar.webp"
          alt="Nữ"
        />
      </div>

      <div className="slick-slide" onClick={() => handleClick('64f0d0008f1e7e0012345680')}>
        <img
          src="http://2885371169.e.cdneverest.net/media/Simiconnector/Nam-spMoi-05Mar.webp"
          alt="Nam"
        />
      </div>

      <div className="slick-slide" onClick={() => handleClick('64f0c0008f1e7e0012345678')}>
        <img
          src="https://2885371169.e.cdneverest.net/media/Simiconnector/BG-07Mar.webp"
          alt="Bé gái"
        />
      </div>

      <div className="slick-slide" onClick={() => handleClick('64f0d0008f1e7e0012345671')}>
        <img
          src="https://2885371169.e.cdneverest.net/media/Simiconnector/BT-07Mar.webp"
          alt="Bé trai"
        />
      </div>
    </div>
  );
}
