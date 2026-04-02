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
          src="https://i.ibb.co/9HgqvwqW/B-TRAI-1.png"
          alt="Nữ"
        />
      </div>

      <div className="slick-slide" onClick={() => handleClick('64f0d0008f1e7e0012345680')}>
        <img
          src="https://i.ibb.co/39kH5ZKW/B-TRAI-2.png"
          alt="Nam"
        />
      </div>

      <div className="slick-slide" onClick={() => handleClick('64f0c0008f1e7e0012345678')}>
        <img
          src="https://i.ibb.co/bgs3H87f/B-TRAI-3.png"
          alt="Bé gái"
        />
      </div>

      <div className="slick-slide" onClick={() => handleClick('64f0d0008f1e7e0012345671')}>
        <img
          src="https://i.ibb.co/GzrZnBf/B-TRAI.png"
          alt="Bé trai"
        />
      </div>
    </div>
  );
}
