// app/context/MinicartContext.tsx
"use client";
import { createContext, useContext, useState } from "react";

interface MinicartContextProps {
  isOpen: boolean;
  open: () => void;
  close: () => void;
  toggle: () => void;
}

const MinicartContext = createContext<MinicartContextProps>({
  isOpen: false,
  open: () => {},
  close: () => {},
  toggle: () => {},
});

export const MinicartProvider = ({ children }: { children: React.ReactNode }) => {
  const [isOpen, setIsOpen] = useState(false);

  const open = () => setIsOpen(true);
  const close = () => setIsOpen(false);
  const toggle = () => setIsOpen((prev) => !prev);

  return (
    <MinicartContext.Provider value={{ isOpen, open, close, toggle }}>
      {children}
    </MinicartContext.Provider>
  );
};

export const useMinicart = () => useContext(MinicartContext);
