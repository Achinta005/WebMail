"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";

interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  accessToken: string | null;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  isLoading: true,
  accessToken: null,
  logout: () => {},
});

const ACCESS_TOKEN_KEY = "webmail_access_token";
const REFRESH_TOKEN_KEY = "webmail_refresh_token";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    // 1. Check if tokens arrived from OAuth redirect in URL
    const tokenFromUrl = searchParams.get("access_token");
    const refreshFromUrl = searchParams.get("refresh_token");

    if (tokenFromUrl) {
      localStorage.setItem(ACCESS_TOKEN_KEY, tokenFromUrl);
      if (refreshFromUrl) {
        localStorage.setItem(REFRESH_TOKEN_KEY, refreshFromUrl);
      }
      setAccessToken(tokenFromUrl);
      setIsLoading(false);

      // Clean tokens from URL for security
      const newUrl = window.location.pathname;
      window.history.replaceState({}, document.title, newUrl);
      return;
    }

    // 2. Check localStorage for existing session
    const storedToken = localStorage.getItem(ACCESS_TOKEN_KEY);
    if (storedToken) {
      setAccessToken(storedToken);
    }
    setIsLoading(false);
  }, [searchParams]);

  // Route guard
  useEffect(() => {
    if (isLoading) return;

    const isPublicPage =
      pathname === "/login" ||
      pathname === "/privacy-policy" ||
      pathname === "/terms-conditions";

    if (!accessToken && !isPublicPage) {
      router.replace("/login");
    } else if (accessToken && pathname === "/login") {
      router.replace("/");
    }
  }, [accessToken, isLoading, pathname, router]);

  const logout = () => {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    setAccessToken(null);
    router.replace("/login");
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated: !!accessToken,
        isLoading,
        accessToken,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
