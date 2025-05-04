"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import { toast } from "react-hot-toast";
import Cookies from "js-cookie";

interface User {
  _id: string;
  name: string;
  email: string;
  role: "admin" | "user";
  status: "active" | "inactive";
  profilePhoto?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  register: (name: string, email: string, password: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const token = Cookies.get("token");
      if (!token) {
        setLoading(false);
        router.push("/login");
        return;
      }

      const response = await api.get("/users/me");
      const userData = response.data.data.user;
      setUser(userData);
    } catch (error: any) {
      console.error("Error in checkAuth:", error);
      if (error.response?.status === 401) {
        Cookies.remove("token");
        router.push("/login");
      }
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      const response = await api.post("/users/login", { email, password });
      const userData = response.data.data.user;
      Cookies.set("token", response.data.token, { expires: 7 });
      setUser(userData);
      toast.success("Logged in successfully");
      router.push("/dashboard");
    } catch (error: any) {
      console.error("Login error:", error);
      toast.error(error.response?.data?.message || "Login failed");
      throw error;
    }
  };

  const logout = () => {
    Cookies.remove("token");
    setUser(null);
    toast.success("Logged out successfully");
    router.push("/login");
  };

  const register = async (name: string, email: string, password: string) => {
    try {
      const response = await api.post("/users/register", {
        name,
        email,
        password,
      });
      Cookies.set("token", response.data.token, { expires: 7 });
      setUser(response.data.data.user);
      toast.success("Registration successful");
      router.push("/dashboard");
    } catch (error: any) {
      console.error("Register error:", error);
      toast.error(error.response?.data?.message || "Registration failed");
      throw error;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        logout,
        register,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
