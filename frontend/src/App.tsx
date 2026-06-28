import { FileText, Gauge, KeyRound, LayoutDashboard, LogOut, Moon, Shield, ShieldAlert, Sun, Users } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, Navigate, Route, Routes, useLocation } from "react-router-dom";
import { Admin } from "./pages/Admin";
import { Analyzer } from "./pages/Analyzer";
import { CredentialExposureSimulator } from "./pages/CredentialExposureSimulator";
import { Dashboard } from "./pages/Dashboard";
import { Generator } from "./pages/Generator";
import { Landing } from "./pages/Landing";
import { Login } from "./pages/Login";
import { Reports } from "./pages/Reports";
import { useAuth } from "./state/AuthContext";

function Protected({ children, role }: { children: React.ReactNode; role?: "admin" }) {
  const { token, user } = useAuth();
  const location = useLocation();
  if (!token) return <Navigate to="/login" state={{ from: location }} replace />;
  if (role && user?.role !== role) return <Navigate to="/dashboard" replace />;
  return <>{children}</>;
}

function Shell({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth();
  const [dark, setDark] = useState(localStorage.getItem("pea_theme") === "dark");

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
    localStorage.setItem("pea_theme", dark ? "dark" : "light");
  }, [dark]);

  const nav = [
    { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { to: "/analyzer", label: "Analyzer", icon: Gauge },
    { to: "/generator", label: "Generator", icon: KeyRound },
    { to: "/reports", label: "Reports", icon: FileText },
    ...(user?.role === "admin"
      ? [
          { to: "/credential-exposure", label: "Exposure Simulator", icon: ShieldAlert },
          { to: "/admin", label: "Admin", icon: Users }
        ]
      : [])
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-950 dark:bg-slate-950 dark:text-slate-100">
      <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/95 backdrop-blur dark:border-slate-800 dark:bg-slate-950/95">
        <div className="mx-auto flex max-w-7xl items-center gap-4 px-4 py-3">
          <Link to="/" className="flex items-center gap-2 font-semibold">
            <Shield className="h-6 w-6 text-signal" aria-hidden />
            <span>Password Exposure Analyzer</span>
          </Link>
          <nav className="ml-auto hidden items-center gap-1 md:flex">
            {nav.map((item) => (
              <Link key={item.to} to={item.to} className="flex items-center gap-2 rounded-md px-3 py-2 text-sm hover:bg-slate-100 dark:hover:bg-slate-900">
                <item.icon className="h-4 w-4" aria-hidden />
                {item.label}
              </Link>
            ))}
          </nav>
          <button title="Toggle theme" className="rounded-md border border-slate-300 p-2 dark:border-slate-700" onClick={() => setDark((value) => !value)}>
            {dark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>
          {user ? (
            <button title="Logout" className="rounded-md border border-slate-300 p-2 dark:border-slate-700" onClick={logout}>
              <LogOut className="h-4 w-4" />
            </button>
          ) : (
            <Link to="/login" className="rounded-md bg-ink px-3 py-2 text-sm text-white dark:bg-slate-100 dark:text-slate-950">
              Sign in
            </Link>
          )}
        </div>
      </header>
      <main>{children}</main>
      <footer className="border-t border-slate-200 px-4 py-6 text-center text-sm text-slate-500 dark:border-slate-800">
        Defensive security education only. Do not use the platform to facilitate unauthorized access.
      </footer>
    </div>
  );
}

export function App() {
  return (
    <Shell>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<Protected><Dashboard /></Protected>} />
        <Route path="/analyzer" element={<Protected><Analyzer /></Protected>} />
        <Route path="/generator" element={<Protected><Generator /></Protected>} />
        <Route path="/reports" element={<Protected><Reports /></Protected>} />
        <Route path="/credential-exposure" element={<Protected role="admin"><CredentialExposureSimulator /></Protected>} />
        <Route path="/admin" element={<Protected role="admin"><Admin /></Protected>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Shell>
  );
}
