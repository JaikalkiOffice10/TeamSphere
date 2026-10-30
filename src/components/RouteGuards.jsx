import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

// Logged-in users only; everyone else is sent to /login
export function RequireAuth() {
  const { user, loading } = useAuth();
  const location = useLocation();
  if (loading) return <p className="empty">Loading…</p>;
  if (!user) return <Navigate to="/login" state={{ from: location }} replace />;
  return <Outlet />;
}

// Only the listed roles may see these routes
export function RequireRole({ roles }) {
  const { role } = useAuth();
  if (!roles.includes(role)) {
    return (
      <div className="alert error">
        You don’t have permission to view this page.
      </div>
    );
  }
  return <Outlet />;
}

// Login / setup pages: logged-in users are sent on to where they were headed
// export function PublicOnly() {
//   const { user, loading } = useAuth();
//   const location = useLocation();
//   if (loading) return <p className="empty">Loading…</p>;
//   if (user) return <Navigate to={location.state?.from?.pathname || "/dashboard"} replace />;
//   return <Outlet />;
// }


export function PublicOnly() {
  const { user, role, loading } = useAuth();
  const location = useLocation();

  if (loading) return <p className="empty">Loading…</p>;

  if (user) {
    const requestedPath = location.state?.from?.pathname;

    // Employee should not be redirected to an admin/manager page
    if (
      role === "employee" &&
      (requestedPath === "/companies" ||
        requestedPath === "/employees" ||
        requestedPath?.startsWith("/companies/"))
    ) {
      return <Navigate to="/dashboard" replace />;
    }

    return (
      <Navigate
        to={requestedPath || "/dashboard"}
        replace
      />
    );
  }

  return <Outlet />;
}

// Public home page for visitors; signed-in users are sent to their dashboard
export function LandingGate({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <p className="empty">Loading…</p>;
  if (user) return <Navigate to="/dashboard" replace />;
  return children;
}
