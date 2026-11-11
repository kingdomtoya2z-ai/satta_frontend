"use client";

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react";
import { ADMIN_API } from "@/lib/api";

interface AuthContextType {
  token: string | null;
  isAuthenticated: boolean;
  hydrated: boolean;
  login: (password: string) => Promise<string | null>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

function getTokenExp(token: string): number | null {
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    return payload.exp || null;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  // Start with no token on the server and the first client render, then
  // hydrate from localStorage in an effect to avoid hydration mismatches.
  const [token, setToken] = useState<string | null>(null);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setToken(localStorage.getItem("admin_token"));
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    if (token) localStorage.setItem("admin_token", token);
    else localStorage.removeItem("admin_token");
  }, [token, hydrated]);

  const logout = useCallback(() => setToken(null), []);

  // Auto-logout on token expiry
  useEffect(() => {
    if (!token) return;
    const exp = getTokenExp(token);
    if (!exp) return;
    const ms = exp * 1000 - Date.now();
    if (ms <= 0) { logout(); return; }
    const id = setTimeout(logout, ms);
    return () => clearTimeout(id);
  }, [token, logout]);

  const login = async (password: string): Promise<string | null> => {
    try {
      const res = await fetch(`${ADMIN_API}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        return err.error || "Login failed";
      }
      const data = await res.json();
      setToken(data.token);
      return null;
    } catch {
      return "Cannot connect to server";
    }
  };

  return (
    <AuthContext.Provider value={{ token, isAuthenticated: !!token, hydrated, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
