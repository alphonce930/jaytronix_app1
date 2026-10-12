import { LockKeyhole } from "lucide-react";
import { useState } from "react";
import { Navigate, useNavigate } from "react-router";
import { Button, Input } from "../components/ui";
import { useAuth } from "../context/AuthContext";

export default function LoginPage() {
  const { user, login, isDemo } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState(isDemo ? "admin@jaytronix.co.tz" : "");
  const [password, setPassword] = useState(isDemo ? "demo1234" : "");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  if (user) return <Navigate to="/admin" replace />;

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true); setError("");
    try { await login(email, password); navigate("/admin"); } catch (reason) { setError(reason instanceof Error ? reason.message : "Unable to sign in."); } finally { setBusy(false); }
  }

  return (
    <div className="grid min-h-screen bg-cream lg:grid-cols-2">
      <div className="hidden bg-navy p-12 text-white lg:flex lg:flex-col lg:justify-between">
        <div className="font-display text-2xl font-bold">JAYTRONIX</div>
        <div><p className="text-sm font-bold uppercase tracking-widest text-lime">Store command center</p><h1 className="mt-4 max-w-lg font-display text-6xl font-semibold tracking-tight">Keep your catalog current and your store moving.</h1></div>
        <p className="text-sm text-slate-400">Authorized administrators only.</p>
      </div>
      <div className="flex items-center justify-center px-5 py-16">
        <div className="w-full max-w-md">
          <div className="grid size-12 place-items-center rounded-2xl bg-lime"><LockKeyhole className="size-5" /></div>
          <h1 className="mt-7 font-display text-4xl font-semibold tracking-tight">Welcome back.</h1>
          <p className="mt-3 text-muted">Sign in to manage the Jaytronix catalog.</p>
          <form onSubmit={submit} className="mt-9 space-y-5">
            <label className="block"><span className="mb-2 block text-sm font-bold">Email address</span><Input type="email" value={email} onChange={(event) => setEmail(event.target.value)} required /></label>
            <label className="block"><span className="mb-2 block text-sm font-bold">Password</span><Input type="password" value={password} onChange={(event) => setPassword(event.target.value)} required /></label>
            {error && <p className="rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</p>}
            <Button className="w-full" disabled={busy}>{busy ? "Signing in…" : "Sign in securely"}</Button>
          </form>
          {isDemo && <div className="mt-6 rounded-2xl border border-line bg-white p-4 text-sm text-muted"><strong className="text-navy">Demo mode:</strong> credentials are pre-filled. Configure Firebase Authentication and Supabase to enable production sign-in and catalog management.</div>}
          <a href="/" className="mt-7 inline-block text-sm font-bold text-emerald">← Return to storefront</a>
        </div>
      </div>
    </div>
  );
}
