import { createContext, useContext, useMemo, useState } from "react";
import { api } from "../services/api";

type User = { id: string; email: string; role: "user" | "admin" };

type AuthContextValue = {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState(localStorage.getItem("pea_token"));
  const [user, setUser] = useState<User | null>(() => {
    const stored = localStorage.getItem("pea_user");
    return stored ? JSON.parse(stored) : null;
  });

  async function persistAuth(data: { token: string; user: User }) {
    localStorage.setItem("pea_token", data.token);
    localStorage.setItem("pea_user", JSON.stringify(data.user));
    setToken(data.token);
    setUser(data.user);
  }

  async function login(email: string, password: string) {
    const { data } = await api.post("/auth/login", { email, password });
    await persistAuth(data);
  }

  async function register(name: string, email: string, password: string) {
    const { data } = await api.post("/auth/register", { name, email, password });
    await persistAuth(data);
  }

  async function logout() {
    try {
      await api.post("/auth/logout");
    } finally {
      localStorage.removeItem("pea_token");
      localStorage.removeItem("pea_user");
      setToken(null);
      setUser(null);
    }
  }

  const value = useMemo(() => ({ user, token, login, register, logout }), [user, token]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const value = useContext(AuthContext);
  if (!value) throw new Error("useAuth must be used inside AuthProvider");
  return value;
}
