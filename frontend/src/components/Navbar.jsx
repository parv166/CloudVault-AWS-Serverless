import { Cloud, Files, LayoutDashboard } from "lucide-react";
import { NavLink } from "react-router-dom";

const navItems = [
  { label: "Dashboard", to: "/", icon: LayoutDashboard },
  { label: "Files", to: "/files", icon: Files },
];

function Navbar() {
  return (
    <header className="border-b border-slate-200 bg-white/90 backdrop-blur">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-4 px-4 py-4 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center bg-slate-900 text-sky-300" style={{ borderRadius: 8 }}>
            <Cloud className="h-6 w-6" aria-hidden="true" />
          </div>
          <div>
            <p className="text-lg font-bold tracking-normal text-slate-950">CloudVault</p>
            <p className="text-sm text-slate-500">Serverless File Management</p>
          </div>
        </div>

        <nav className="flex gap-2 overflow-x-auto" aria-label="Primary navigation">
          {navItems.map(({ label, to, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              end={to === "/"}
              className={({ isActive }) =>
                [
                  "inline-flex min-h-10 items-center gap-2 whitespace-nowrap border px-4 py-2 text-sm font-semibold transition",
                  isActive
                    ? "border-sky-200 bg-sky-50 text-sky-800"
                    : "border-transparent text-slate-600 hover:border-slate-200 hover:bg-slate-50 hover:text-slate-950",
                ].join(" ")
              }
              style={{ borderRadius: 8 }}
            >
              <Icon className="h-4 w-4" aria-hidden="true" />
              {label}
            </NavLink>
          ))}
        </nav>
      </div>
    </header>
  );
}

export default Navbar;
