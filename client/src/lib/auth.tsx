import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useQueryClient } from "@tanstack/react-query";

interface User {
  id: string;
  username: string;
  email: string | null;
  tier: string;
  avatarUrl?: string | null;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isPro: boolean;
  isBusiness: boolean;
  isUnlimited: boolean;
  isAdmin: boolean;
  login: (username: string, password: string) => Promise<void>;
  signup: (username: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const queryClient = useQueryClient();

  const refreshUser = async () => {
    try {
      const res = await fetch("/api/auth/me", { credentials: "include" });
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
      } else {
        setUser(null);
      }
    } catch {
      setUser(null);
    }
  };

  useEffect(() => {
    refreshUser().finally(() => setIsLoading(false));
  }, []);

  const login = async (username: string, password: string) => {
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
      credentials: "include",
    });

    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.error || "Login failed");
    }

    const data = await res.json();
    setUser(data.user);
    queryClient.invalidateQueries();
  };

  const signup = async (username: string, email: string, password: string) => {
    const res = await fetch("/api/auth/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, email, password }),
      credentials: "include",
    });

    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.error || "Signup failed");
    }

    const data = await res.json();
    setUser(data.user);
    queryClient.invalidateQueries();
  };

  const logout = async () => {
    await fetch("/api/auth/logout", {
      method: "POST",
      credentials: "include",
    });
    setUser(null);
    queryClient.invalidateQueries();
  };

  const proTiers = ["supporter", "pro", "business", "enterprise", "unlimited"];
  const businessTiers = ["business", "enterprise", "unlimited"];
  const unlimitedTiers = ["unlimited"];
  const isPro = user ? proTiers.includes(user.tier) : false;
  const isBusiness = user ? businessTiers.includes(user.tier) : false;
  const isUnlimited = user ? unlimitedTiers.includes(user.tier) : false;
  const ADMIN_EMAIL = "kbpc.inc@gmail.com";
  const isAdmin = user?.email === ADMIN_EMAIL;

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        isPro,
        isBusiness,
        isUnlimited,
        isAdmin,
        login,
        signup,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
