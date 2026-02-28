"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from "react";
import { User, AuthResponse, verifyTokenApi } from "@/api/api";
import { useRouter, usePathname } from "next/navigation";
import Cookies from "js-cookie";

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (data: AuthResponse["data"]) => void;
  logout: () => void;
  updateUser: (u: User) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const initializeAuth = async () => {
      const storedToken = localStorage.getItem("chat_token");

      if (storedToken) {
        const verifiedUser = await verifyTokenApi(storedToken);
        if (verifiedUser) {
          setToken(storedToken);
          setUser(verifiedUser);
          // Persist full user (including avatar/about) back to localStorage
          localStorage.setItem("chat_user", JSON.stringify(verifiedUser));
        } else {
          localStorage.removeItem("chat_token");
          localStorage.removeItem("chat_user");
          Cookies.remove("chat_token");
          setToken(null);
          setUser(null);
        }
      }
      setIsLoading(false);
    };

    initializeAuth();
  }, []);

  const login = (data: AuthResponse["data"]) => {
    localStorage.setItem("chat_token", data.token);
    localStorage.setItem("chat_user", JSON.stringify(data.user));
    Cookies.set("chat_token", data.token, { expires: 7 });
    setToken(data.token);
    setUser(data.user);
  };

  const updateUser = (u: User) => {
    setUser(u);
    localStorage.setItem("chat_user", JSON.stringify(u));
  };

  const logout = () => {
    localStorage.removeItem("chat_token");
    localStorage.removeItem("chat_user");
    Cookies.remove("chat_token");
    setToken(null);
    setUser(null);
    router.push("/signin");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading...
      </div>
    );
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!token,
        isLoading,
        login,
        logout,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
