import { useState } from "react";
import { login } from "../api/auths";

interface LoginProps {
  onLoginSuccess: () => void;
}

const FONT = { fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif" };

export function Login({ onLoginSuccess }: LoginProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const data = await login({ email, password });
      localStorage.setItem("access_token", data.access_token);
      localStorage.setItem("user", JSON.stringify(data.user));
      onLoginSuccess();
    } catch (error) {
      setError(error instanceof Error ? error.message : "Login failed");
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    "h-12 w-full rounded-xl border border-slate-200 bg-white pl-11 pr-4 text-[15px] text-slate-900 outline-none transition placeholder:text-slate-400 hover:border-slate-300 focus:border-slate-900 focus:ring-4 focus:ring-slate-900/5";

  return (
    <div className="min-h-screen bg-white text-slate-900 lg:grid lg:grid-cols-[1.1fr_1fr]" style={FONT}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap');`}</style>

      {/* Brand panel */}
      <aside className="relative hidden overflow-hidden bg-slate-900 p-14 text-white lg:flex lg:flex-col lg:justify-between">
        <div className="pointer-events-none absolute -left-24 -top-24 h-96 w-96 rounded-full bg-emerald-500/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-32 right-0 h-[28rem] w-[28rem] rounded-full bg-indigo-500/20 blur-3xl" />

        <div className="relative">
          <Brand dark />
        </div>

        <div className="relative max-w-lg">
          <h2 className="text-5xl font-semibold leading-[1.1] tracking-tight">
            Every uniform, in stock and on time.
          </h2>
          <p className="mt-6 text-lg leading-relaxed text-slate-300">
            Track ties, belts, sweaters and dresses for every school you supply.
          </p>
        </div>

        <div className="relative max-w-sm rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur">
          <div className="flex items-center gap-2 text-sm font-medium text-emerald-300">
            <SparkIcon />
            AI Analyst
          </div>
          <p className="mt-2 text-[15px] leading-relaxed text-slate-200">
            Sweaters (size 10-12) will run out in about 9 days. Reorder 120 units to stay ahead.
          </p>
        </div>
      </aside>

      {/* Form */}
      <main className="flex min-h-screen items-center justify-center px-6 py-16 sm:px-12 lg:min-h-0">
        <div className="w-full max-w-[400px]">
          <div className="mb-14 lg:hidden">
            <Brand />
          </div>

          <h1 className="text-3xl font-bold tracking-tight">Welcome back</h1>
          <p className="mt-3 text-base text-slate-500">
            Sign in to manage your stock and school orders.
          </p>

          <form onSubmit={handleLogin} className="mt-10 space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-slate-700">
                Email
              </label>
              <div className="relative mt-2">
                <MailIcon />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@yourcompany.com"
                  required
                  autoComplete="email"
                  className={inputClass}
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-slate-700">
                Password
              </label>
              <div className="relative mt-2">
                <LockIcon />
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  required
                  autoComplete="current-password"
                  className={`${inputClass} pr-16`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md px-2 py-1 text-sm font-medium text-slate-500 outline-none hover:text-slate-900 focus-visible:ring-2 focus-visible:ring-slate-900/20"
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
            </div>

            {error && (
              <div
                role="alert"
                className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600"
              >
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-slate-900 text-[15px] font-semibold text-white shadow-lg shadow-slate-900/10 transition hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-slate-900/20 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading && (
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
              )}
              {loading ? "Signing in" : "Sign in"}
            </button>
          </form>

          <p className="mt-10 text-center text-sm text-slate-400">
            Can't sign in? Contact support to reset your access.
          </p>
        </div>
      </main>
    </div>
  );
}

function Brand({ dark = false }: { dark?: boolean }) {
  return (
    <div className="flex items-center gap-3">
      <div
        className={`flex h-10 w-10 items-center justify-center rounded-xl ${
          dark ? "bg-white text-slate-900" : "bg-slate-900 text-white"
        }`}
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <polygon points="12 2 2 7 12 12 22 7 12 2" />
          <polyline points="2 17 12 22 22 17" />
          <polyline points="2 12 12 17 22 12" />
        </svg>
      </div>
      <div className="leading-tight">
        <p className="text-[15px] font-semibold">SOFIM CONCERN</p>
        <p className={`text-sm ${dark ? "text-slate-400" : "text-slate-500"}`}>School Supply Management</p>
      </div>
    </div>
  );
}

const iconProps = {
  width: 18,
  height: 18,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  "aria-hidden": true,
};
const iconClass = "pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400";

function MailIcon() {
  return (
    <svg {...iconProps} className={iconClass}>
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="m3 7 9 6 9-6" />
    </svg>
  );
}

function LockIcon() {
  return (
    <svg {...iconProps} className={iconClass}>
      <rect x="4" y="11" width="16" height="10" rx="2" />
      <path d="M8 11V7a4 4 0 0 1 8 0v4" />
    </svg>
  );
}

function SparkIcon() {
  return (
    <svg {...iconProps} width={16} height={16}>
      <path d="M12 3l1.9 5.1L19 10l-5.1 1.9L12 17l-1.9-5.1L5 10l5.1-1.9L12 3Z" />
    </svg>
  );
}