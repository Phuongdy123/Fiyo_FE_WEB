"use client";

type ShopStats = {
  reviews: number;
  responseRate: number;
  joinedText: string;
  products: number;
  responseTimeText: string;
  followers: number;
};

type Props = {
  avatar?: string;
  name: string;
  onlineText: string;
  onChat?: () => void;
  onViewShop?: () => void;
  stats: ShopStats;
};

export default function ShopInfoCard({
  avatar = "https://placehold.co/96x96?text=Shop",
  name,
  onlineText,
  onChat,
  onViewShop,
  stats,
}: Props) {
  return (
    <div className="shopHero">
      {/* Left */}
      <div className="shopLeft">
        <img className="shopAvatar" src={avatar} alt={name} />
        <div className="shopMeta">
          <div className="shopName">{name}</div>
          <div className="shopOnline">{onlineText}</div>
          <div className="shopActions">
            <button className="shopChatBtn" onClick={onChat}>
            Chat Ngay
            </button>
            <button className="shopViewBtn" onClick={onViewShop}>
            Xem Shop
            </button>
          </div>
        </div>
      </div>

      {/* Right */}
      <div className="shopRight">
        <div className="shopCol">
          <div className="shopLabel">Đánh Giá</div>
          <div className="shopValue">{stats.reviews.toLocaleString("vi-VN")}</div>
        </div>
        <div className="shopCol">
          <div className="shopLabel">Tỉ Lệ Phản Hồi</div>
          <div className="shopValue">{stats.responseRate}%</div>
        </div>
        <div className="shopCol">
          <div className="shopLabel">Tham Gia</div>
          <div className="shopValue">{stats.joinedText}</div>
        </div>
        <div className="shopCol">
          <div className="shopLabel">Sản Phẩm</div>
          <div className="shopValue">{stats.products.toLocaleString("vi-VN")}</div>
        </div>
        <div className="shopCol">
          <div className="shopLabel">Thời Gian Phản Hồi</div>
          <div className="shopValue">{stats.responseTimeText}</div>
        </div>
        <div className="shopCol">
          <div className="shopLabel">Người Theo Dõi</div>
          <div className="shopValue">{stats.followers.toLocaleString("vi-VN")}</div>
        </div>
      </div>
    </div>
  );
}
