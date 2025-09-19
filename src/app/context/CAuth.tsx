"use client";
import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import Cookies from "js-cookie";
import { IUser } from "../untils/IUser";

interface AuthProviderProps {
  children: ReactNode;
}

interface AuthContextType {
  user: IUser | null;
  loginUser: (userData: IUser, token: string) => void;
  logoutUser: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<IUser | null>(null);

  useEffect(() => {
    // 🔑 Ưu tiên lấy từ cookie (token share cross-domain)
    const token = Cookies.get("token");
    const storedUser = localStorage.getItem("user");

    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    // nếu cần thì verify token qua API
    // fetch("/api/verify", { headers: { Authorization: `Bearer ${token}` } })
  }, []);

  const loginUser = (userData: IUser, token: string) => {
    setUser(userData);
    localStorage.setItem("user", JSON.stringify(userData));

    // lưu token vào cookie chung
    Cookies.set("token", token, {
      domain: ".fiyo.click",
      path: "/",
      secure: true,
      sameSite: "lax",
    });
  };

  const logoutUser = () => {
    setUser(null);
    localStorage.removeItem("user");
    Cookies.remove("token", { domain: ".fiyo.click" });
  };

  return (
    <AuthContext.Provider value={{ user, loginUser, logoutUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
