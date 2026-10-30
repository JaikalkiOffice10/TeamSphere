import { NavLink, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { LogoMark, Wordmark } from "./Brand";
import { roleLabel } from "../utils/format";

export default function Layout() {
  const { user, role, isStaff, logout } = useAuth();
  const links = [
    ["/dashboard", "Dashboard", "⌂"],
    isStaff && ["/companies", "Companies", "▣"],
    isStaff && ["/employees", "Employees", "♟"],
    ["/projects", "Projects", "◫"],
    ["/profile", "My profile", "◎"],
  ].filter(Boolean);

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <NavLink to="/dashboard" className="sidebar-brand"><LogoMark size={36} /><div><Wordmark /><small>Management</small></div></NavLink>
        <div className="sidebar-section-label">Workspace</div>
        <nav className="side-nav">
          {links.map(([to, label, icon]) => <NavLink key={to} to={to} end><span className="nav-icon">{icon}</span><span>{label}</span></NavLink>)}
        </nav>
        <div className="sidebar-spacer" />
        <div className="sidebar-user">
          <div className="avatar">{user?.full_name?.charAt(0)?.toUpperCase() || "U"}</div>
          <div className="sidebar-user-text"><strong>{user?.full_name}</strong><span>{roleLabel(role)}</span></div>
          <button className="icon-btn logout-icon" title="Log out" onClick={logout}>↪</button>
        </div>
      </aside>
      <div className="main-shell">
        <header className="mobile-topbar"><span className="brand"><Wordmark /></span><button className="btn small" onClick={logout}>Log out</button></header>
        <main className="container"><Outlet /></main>
      </div>
    </div>
  );
}
