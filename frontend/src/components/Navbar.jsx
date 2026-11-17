import { useState } from "react";
import { Cloud, Files, LayoutDashboard, LogOut } from "lucide-react";
import { NavLink, useNavigate } from "react-router-dom";

import { useAuth } from "../hooks/useAuth.js";

const navItems = [
  { label: "Dashboard", to: "/", icon: LayoutDashboard },
  { label: "Files", to: "/files", icon: Files },
];

export default function Navbar() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [signingOut, setSigningOut] = useState(false);
  const [error, setError] = useState("");

  async function handleSignOut() {
    setError("");
    setSigningOut(true);

    try {
      await signOut();
      navigate("/login", { replace: true });
    } catch (err) {
      setError(err.message || "Unable to sign out.");
    } finally {
      setSigningOut(false);
    }
  }

  return (
    <header className="border-b border-slate-200 bg-white/95 backdrop-blur">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-4 px-4 py-4 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-slate-900 text-sky-300">
            <Cloud className="h-6 w-6" aria-hidden="true" />
          </div>
          <div>
            <p className="text-lg font-bold text-slate-950">CloudVault</p>
            <p className="text-sm text-slate-500">Serverless File Management</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <nav className="flex gap-2 overflow-x-auto" aria-label="Primary navigation">
            {navItems.map(({ label, to, icon: Icon }) => (
              <NavLink
                key={to}
                to={to}
                end={to === "/"}
                className={({ isActive }) =>
                  [
                    "inline-flex min-h-10 items-center gap-2 whitespace-nowrap rounded-lg border px-4 py-2 text-sm font-semibold transition",
                    isActive
                      ? "border-sky-200 bg-sky-50 text-sky-800"
                      : "border-transparent text-slate-600 hover:border-slate-200 hover:bg-slate-50",
                  ].join(" ")
                }
              >
                <Icon className="h-4 w-4" aria-hidden="true" />
                {label}
              </NavLink>
            ))}
          </nav>

          <div className="flex items-center gap-2 border-l border-slate-200 pl-3">
            <span className="hidden max-w-36 truncate text-xs text-slate-500 sm:block">
              {user?.username || "Account"}
            </span>
            <button
              type="button"
              onClick={handleSignOut}
              disabled={signingOut}
              className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
            >
              <LogOut className="h-4 w-4" />
              {signingOut ? "Signing out..." : "Sign out"}
            </button>
          </div>
        </div>
      </div>

      {error && (
        <p role="alert" className="mx-auto max-w-7xl px-4 pb-3 text-sm text-red-700">
          {error}
        </p>
      )}
    </header>
  );
}
