import { Navigate, Route, Routes } from "react-router-dom";
import Layout from "./components/Layout";
import { LandingGate, PublicOnly, RequireAuth, RequireRole } from "./components/RouteGuards";
import CompanyDetail from "./pages/CompanyDetail";
import Dashboard from "./pages/Dashboard";
import Landing from "./pages/Landing";
import Companies from "./pages/Companies";
import Employees from "./pages/Employees";
import Login from "./pages/Login";
import Profile from "./pages/Profile";
import Projects from "./pages/Projects";
import Setup from "./pages/Setup";

export default function App() {
  return (
    <Routes>
      {/* Public home: signed-in users go straight to their dashboard */}
      <Route path="/" element={<LandingGate><Landing /></LandingGate>} />

      {/* Public */}
      <Route element={<PublicOnly />}>
        <Route path="/login" element={<Login />} />
        <Route path="/setup" element={<Setup />} />
      </Route>

      {/* Logged in */}
      <Route element={<RequireAuth />}>
        <Route element={<Layout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/projects" element={<Projects />} />

          <Route element={<RequireRole roles={["admin", "manager"]} />}>
            <Route path="/companies" element={<Companies />} />
            <Route path="/companies/:id" element={<CompanyDetail />} />
            <Route path="/employees" element={<Employees />} />
          </Route>


          <Route path="*" element={<p className="empty">Page not found.</p>} />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
