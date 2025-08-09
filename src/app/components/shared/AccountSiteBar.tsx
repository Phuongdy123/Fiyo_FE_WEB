"use client";
import { useAuth } from "@/app/context/CAuth";
import { IUser } from "@/app/untils/IUser";
import { useState, useEffect } from "react";
import { getUserById } from "@/app/services/SUser";

export default function AccountSiteBar() {
  const user = useAuth();
  const user_id = user.user?._id;
  const [onetuser, setOneUser] = useState<IUser | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!user_id) return;
      const data = await getUserById(user_id);
      setOneUser(data);
    };
    fetchData();
  }, [user_id]);

  const showModal = () => {
    const modal = document.getElementById("modalConfirm");
    if (modal) modal.classList.remove("hidden");
  };

  const getProgressInfo = (point: number) => {
    let nextRank = "";
    let maxPoint = 0;

    if (point >= 1000000)
      return { percent: 100, remaining: 0, nextRank: "platinum" };

    if (point >= 500000) {
      nextRank = "platinum";
      maxPoint = 1000000;
    } else if (point >= 200000) {
      nextRank = "gold";
      maxPoint = 500000;
    } else {
      nextRank = "silver";
      maxPoint = 200000;
    }

    const currentMin =
      nextRank === "silver" ? 0 : nextRank === "gold" ? 200000 : 500000;

    const percent = ((point - currentMin) / (maxPoint - currentMin)) * 100;
    const remaining = maxPoint - point;

    return { percent: Math.min(percent, 100), remaining, nextRank };
  };

  const { percent, remaining, nextRank } = getProgressInfo(
    onetuser?.point || 0
  );

  return (
    <>
      <ul className="sf-list account-sidebar">
        <div className="profile">
          <div className="profile-user">
            <div
              className="profile-user__icon"
              style={{ backgroundColor: "transparent" }}
            >
              {onetuser?.avatar ? (
                <img
                  src={`${onetuser.avatar}?t=${new Date().getTime()}`}
                  alt="Avatar"
                  style={{
                    width: "60px",
                    height: "60px",
                    borderRadius: "50%",
                    objectFit: "cover",
                    border: "1px solid #ccc",
                    marginTop: "5px",
                  }}
                />
              ) : (
                <svg
                  width={58}
                  height={58}
                  viewBox="0 0 58 58"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  style={{ display: "block" }}
                >
                  <g opacity="0.2">
                    <path
                      fillRule="evenodd"
                      clipRule="evenodd"
                      d="M15.8182 22.4091C15.8182 15.129 21.7199 9.22727 29 9.22727C36.2801 9.22727 42.1818 15.129 42.1818 22.4091C42.1818 29.6892 36.2801 35.5909 29 35.5909C21.7199 35.5909 15.8182 29.6892 15.8182 22.4091Z"
                      fill="#A6B3C2"
                    />
                    <path
                      fillRule="evenodd"
                      clipRule="evenodd"
                      d="M29 0C12.9837 0 0 12.9837 0 29C0 45.0163 12.9837 58 29 58C45.0163 58 58 45.0163 58 29C58 12.9837 45.0163 0 29 0ZM5.27273 29C5.27273 15.8958 15.8958 5.27273 29 5.27273C42.1042 5.27273 52.7273 15.8958 52.7273 29C52.7273 34.8556 50.6061 40.2159 47.0902 44.3542C44.6749 41.4209 41.0123 39.5455 36.9092 39.5455H21.091C16.9879 39.5455 13.3252 41.4209 10.9099 44.3543C7.39396 40.216 5.27273 34.8557 5.27273 29Z"
                      fill="#A6B3C2"
                    />
                  </g>
                </svg>
              )}
            </div>

            <div className="profile-user__info">
              <span className="profile-user__name">{onetuser?.phone}</span>
            </div>
          </div>

          <div className="profile-card">
            <div
              className="profile-card__box"
              style={{
                backgroundImage:
                  "url(https://canifa.com/_nuxt/img/card-green.26a68bd.webp)",
              }}
            >
              <div className="profile-card__items">
                <div className="profile-card__item">
                  <div className="profile-card__title">Hạng thẻ</div>
                  <div className="profile-card__value">{onetuser?.rank}</div>
                </div>
                <div className="profile-card__item">
                  <div className="profile-card__title">KHTT</div>
                  <div className="profile-card__value">
                    {onetuser?.point || 0}
                  </div>
                </div>
              </div>

              <div className="profile-card__bottom">
                <div className="profile-card__progress">
                  <div className="profile-card__progress-bar">
                    <div
                      className="profile-card__progress-value"
                      style={{ width: `${percent}%` }}
                    >
                      <span className="screen-reader-text">
                        {percent.toFixed(0)}% Complete
                      </span>
                    </div>
                  </div>
                  <div className="profile-card__progress-text">
                    Cần {remaining.toLocaleString()} điểm để lên hạng {nextRank}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="profile-usermenu">
            <div>
              <li className="profile-usermenu__item">
                <a
                  href="/page/voucher"
                  className="sf-link profile-usermenu__link"
                >
                  <span className="profile-usermenu__icon profile-usermenu__icon--coupon" />
                  <span className="profile-usermenu__text">Mã ưu đãi</span>
                </a>
              </li>
              <li className="profile-usermenu__item">
                <a
                  href="/page/order"
                  className="sf-link profile-usermenu__link"
                >
                  <span className="profile-usermenu__icon profile-usermenu__icon--order" />
                  <span className="profile-usermenu__text">Đơn hàng</span>
                </a>
              </li>
              <li className="profile-usermenu__item">
                <a
                  href="/page/address"
                  className="sf-link profile-usermenu__link"
                >
                  <span className="profile-usermenu__icon profile-usermenu__icon--address" />
                  <span className="profile-usermenu__text">Sổ địa chỉ</span>
                </a>
              </li>
              <li className="profile-usermenu__item">
                <a href="/page/love" className="sf-link profile-usermenu__link">
                  <span className="profile-usermenu__icon profile-usermenu__icon--love" />
                  <span className="profile-usermenu__text">Yêu thích</span>
                </a>
              </li>
              <li className="profile-usermenu__item">
                <button
                  type="button"
                  className="button profile-usermenu__link sf-button"
                  onClick={showModal}
                >
                  <span className="profile-usermenu__icon profile-usermenu__icon--logout" />
                  <span className="profile-usermenu__text">Đăng xuất</span>
                </button>
              </li>
            </div>
          </div>
        </div>
      </ul>
    </>
  );
}
