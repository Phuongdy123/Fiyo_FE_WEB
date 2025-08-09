"use client";
import { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { ICart } from "../untils/ICart";

interface CartContextType {
  cart: ICart[];
  addToCart: (item: ICart) => void;
  updateQuantity: (id: string, variant_id: string, size: string, amount: number) => void;
  removeFromCart: (id: string, variant_id: string, size: string) => void;
  clearCart: () => void; // Thêm hàm clearCart
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [cart, setCart] = useState<ICart[]>([]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedCart = localStorage.getItem("cart");
      if (storedCart) {
        try {
          setCart(JSON.parse(storedCart));
        } catch (err) {
          console.error("Cart parse error", err);
        }
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(cart));
  }, [cart]);

  const addToCart = (item: ICart) => {
    setCart((currentCart) => {
      const existingIndex = currentCart.findIndex(
        (i) => i.id === item.id && i.variant_id === item.variant_id && i.size === item.size
      );

      if (existingIndex !== -1) {
        const updatedCart = [...currentCart];
        const existingItem = updatedCart[existingIndex];

        updatedCart[existingIndex] = {
          ...existingItem,
          quantity: existingItem.quantity + 1,
        };
        return updatedCart;
      }

      return [...currentCart, { ...item, quantity: 1 }];
    });
  };

  const updateQuantity = (id: string, variant_id: string, size: string, newQuantity: number) => {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.id === id && item.variant_id === variant_id && item.size === size) {
            return { ...item, quantity: newQuantity };
          }
          return item;
        })
        .filter((item) => item.quantity > 0)
    );
  };

  const removeFromCart = (id: string, variant_id: string, size: string) => {
    setCart((prev) =>
      prev.filter((item) => !(item.id === id && item.variant_id === variant_id && item.size === size))
    );
  };

  const clearCart = () => {
    setCart([]); // Xóa toàn bộ giỏ hàng
    localStorage.removeItem("cart"); // Xóa dữ liệu giỏ hàng khỏi localStorage
  };

  return (
    <CartContext.Provider value={{ cart, addToCart, updateQuantity, removeFromCart, clearCart }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used inside CartProvider");
  return context;
};