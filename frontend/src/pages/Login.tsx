import { FormEvent, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../state/AuthContext";

export function Login() {
  const { login, register } = useAuth();
  const navigate = useNavigate();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("admin@example.com");
  const [password, setPassword] = useState("AdminChangeMe123!");
  const [error, setError] = useState("");

  async function submit(event: FormEvent) {
    event.preventDefault();
    setError("");
    try {
      if (mode === "login") await login(email, password);
      else await register(name, email, password);
      navigate("/dashboard");
    } catch (err) {
      setError("Authentication failed. Check credentials and try again.");
    }
  }

  return (
    <div className="mx-auto max-w-md px-4 py-12">
      <form onSubmit={submit} className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <h1 className="text-2xl font-semibold">{mode === "login" ? "Sign in" : "Create account"}</h1>
        {mode === "register" && (
          <label className="mt-5 block text-sm">
            Name
            <input className="mt-1 w-full rounded-md border border-slate-300 bg-transparent px-3 py-2 dark:border-slate-700" value={name} onChange={(e) => setName(e.target.value)} required />
          </label>
        )}
        <label className="mt-5 block text-sm">
          Email
          <input className="mt-1 w-full rounded-md border border-slate-300 bg-transparent px-3 py-2 dark:border-slate-700" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </label>
        <label className="mt-4 block text-sm">
          Password
          <input className="mt-1 w-full rounded-md border border-slate-300 bg-transparent px-3 py-2 dark:border-slate-700" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        </label>
        {error && <p className="mt-4 text-sm text-risk">{error}</p>}
        <button className="mt-6 w-full rounded-md bg-slate-950 px-4 py-3 text-white dark:bg-white dark:text-slate-950">{mode === "login" ? "Sign in" : "Register"}</button>
        <button type="button" className="mt-4 w-full text-sm text-signal" onClick={() => setMode(mode === "login" ? "register" : "login")}>
          {mode === "login" ? "Need an account?" : "Already registered?"}
        </button>
      </form>
    </div>
  );
}
