import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../hooks/useAuth.js";

export default function GuestRoute() {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="p-10 text-center text-slate-500">Loading...</div>;
  }

  if (user) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}
