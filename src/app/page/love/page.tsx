"use client";
import { useWishlist } from "@/app/context/CWishlist";
import Link from "next/link";
import { useRouter } from 'next/navigation';
import "@/app/assets/css/account.css";
import AccountEffects from "@/app/assets/js/account";
import { useEffect } from "react";
import { useState } from "react";

import LogoutComponent from "../../components/shared/Logout";
import AccountSiteBar from "@/app/components/shared/AccountSiteBar";

export default function LovePage() {
     const { wishlist, removeFromWishlist } = useWishlist(); 
 
  return (
    <>
      <LogoutComponent></LogoutComponent>
      <div className="account-page">
  <div className="account-container">
    <div className="account-main account-main-information">
      <div className="account-information">
        <div className="account-mobile__header">
          <div className="account-mobile__back">
            <span className="screen-reader-text">Back</span>
          </div>
        </div>
        <div className="account-information__header account__page-header account__page-header--desktop">
          <h1 className="account-information__title">Sản phẩm yêu thích</h1>
        <div className="box-love--product">
  {wishlist.length === 0 ? (
    <p>Bạn chưa có sản phẩm nào trong danh sách yêu thích.</p>
  ) : (
    wishlist.map((item) => (
      <div key={item._id} className="product-item" tabIndex={-1}>
        <div className="product-item__info">
          <div className="product-item__photo">
            <Link
              href={`/page/detail/${item._id}`}
              className="product-item__image"
              tabIndex={-1}
              aria-label={item.name}
            >
              <img
                src={item.image}
                width={415}
                height={554}
                alt={item.name}
                loading="lazy"
                className="product-image-photo"
              />
            </Link>
            <div className="product-item__button-tocart">
              <span>Xem nhanh</span>
            </div>
          </div>
          <div className="product-item__details">
            <h4 className="product-item__name">
              <Link href={`/product/${item._id}`}>{item.name}</Link>
            </h4>
            <div className="product-item__price">
              <span className="product-item__price--regular">
                {item.price.toLocaleString("vi-VN")} ₫
              </span>
            </div>
            <button
              onClick={() => removeFromWishlist(item._id)}
              className="btn-remove-love"
            >
             
            </button>
          </div>
        </div>
      </div>
    ))
  )}
</div>

        </div>
      </div>
    </div>
    <AccountSiteBar></AccountSiteBar>
  </div>
</div>


      <AccountEffects></AccountEffects>
    </>
  );
}
