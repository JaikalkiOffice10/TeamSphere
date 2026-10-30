import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import companyApi from "../api/companyApi";
import employeeApi from "../api/employeeApi";
import projectApi from "../api/projectApi";
import { errorMessage } from "../api/client";
import { useAuth } from "../context/AuthContext";

const STATUS_ORDER = ["planned", "active", "on_hold", "completed", "cancelled"];
const STATUS_LABELS = { planned: "Planned", active: "Active", on_hold: "On hold", completed: "Completed", cancelled: "Cancelled" };

function BarChart({ data, labelKey = "label", valueKey = "value" }) {
  const max = Math.max(1, ...data.map((x) => x[valueKey]));
  return (
    <div className="bar-chart" aria-label="Dashboard bar chart">
      {data.map((item) => (
        <div className="bar-item" key={item[labelKey]}>
          <div className="bar-value">{item[valueKey]}</div>
          <div className="bar-track"><div className="bar-fill" style={{ height: `${Math.max(5, (item[valueKey] / max) * 100)}%` }} /></div>
          <div className="bar-label">{item[labelKey]}</div>
        </div>
      ))}
    </div>
  );
}

function DonutChart({ values }) {
  const total = values.reduce((sum, x) => sum + x.value, 0);
  const radius = 42;
  const circumference = 2 * Math.PI * radius;
  let offset = 0;
  return (
    <div className="donut-wrap">
      <div className="donut-chart">
        <svg viewBox="0 0 120 120" role="img" aria-label="Project status distribution">
          <circle cx="60" cy="60" r={radius} fill="none" stroke="var(--border)" strokeWidth="14" />
          {total > 0 && values.map((item, index) => {
            const length = (item.value / total) * circumference;
            const dash = `${length} ${circumference - length}`;
            const circle = (
              <circle key={item.label} cx="60" cy="60" r={radius} fill="none" stroke={`var(--chart-${(index % 5) + 1})`} strokeWidth="14" strokeDasharray={dash} strokeDashoffset={-offset} transform="rotate(-90 60 60)" />
            );
            offset += length;
            return circle;
          })}
        </svg>
        <div className="donut-center"><strong>{total}</strong><span>Projects</span></div>
      </div>
      <div className="legend-list">
        {values.map((x, index) => <div className="legend-item" key={x.label}><i style={{ background: `var(--chart-${(index % 5) + 1})` }} /> <span>{x.label}</span><strong>{x.value}</strong></div>)}
      </div>
    </div>
  );
}

export default function Dashboard() {
  const { user, role, isStaff, isEmployee } = useAuth();
  const [data, setData] = useState({ companies: [], employees: [], projects: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let alive = true;
    const requests = [
      isStaff ? companyApi.list({ skip: 0, limit: 100 }) : Promise.resolve({ data: [] }),
      isStaff ? employeeApi.list({ skip: 0, limit: 100 }) : Promise.resolve({ data: [] }),
      isEmployee ? projectApi.mine({ skip: 0, limit: 100 }) : projectApi.list({ skip: 0, limit: 100 }),
    ];
    Promise.all(requests)
      .then(([companies, employees, projects]) => alive && setData({ companies: companies.data || [], employees: employees.data || [], projects: projects.data || [] }))
      .catch((e) => alive && setError(errorMessage(e)))
      .finally(() => alive && setLoading(false));
    return () => { alive = false; };
  }, [isStaff, isEmployee]);

  const statusData = useMemo(() => STATUS_ORDER.map((status) => ({ label: STATUS_LABELS[status], value: data.projects.filter((p) => p.status === status).length })).filter((x) => x.value > 0), [data.projects]);
  const departmentData = useMemo(() => {
    const counts = {};
    data.employees.forEach((e) => { const d = e.department || "Other"; counts[d] = (counts[d] || 0) + 1; });
    return Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 6).map(([label, value]) => ({ label, value }));
  }, [data.employees]);
  const activeProjects = data.projects.filter((p) => p.status === "active").length;
  const completedProjects = data.projects.filter((p) => p.status === "completed").length;

  return (
    <section className="dashboard">
      <div className="dashboard-hero">
        <div>
          <p className="eyebrow">Overview</p>
          <h1>Good to see you, {user?.full_name?.split(" ")[0] || "there"}.</h1>
          <p className="muted">Here’s a quick view of your {role} workspace and current activity.</p>
        </div>
        <div className="quick-actions">
          {isStaff && <Link className="btn primary" to="/employees">Manage employees</Link>}
          <Link className="btn" to="/projects">View projects</Link>
        </div>
      </div>

      {error && <div className="alert error">{error}</div>}
      {loading ? <p className="empty">Loading dashboard…</p> : (
        <>
          <div className="stats dashboard-stats">
            {isStaff && <div className="stat dashboard-stat"><span>Total companies</span><strong>{data.companies.length}</strong><small>Managed in this workspace</small></div>}
            {isStaff && <div className="stat dashboard-stat"><span>Employees</span><strong>{data.employees.length}</strong><small>People in your scope</small></div>}
            <div className="stat dashboard-stat"><span>Total projects</span><strong>{data.projects.length}</strong><small>{activeProjects} currently active</small></div>
            <div className="stat dashboard-stat"><span>Completed</span><strong>{completedProjects}</strong><small>Finished projects</small></div>
          </div>

          <div className="dashboard-grid">
            <div className="card chart-card">
              <div className="card-title-row"><div><h2>Project status</h2><p className="muted small">Current project distribution</p></div><Link to="/projects">Open projects →</Link></div>
              {statusData.length ? <DonutChart values={statusData} /> : <p className="empty">No project data yet.</p>}
            </div>
            {isStaff && <div className="card chart-card">
              <div className="card-title-row"><div><h2>Employees by department</h2><p className="muted small">Top departments by headcount</p></div><Link to="/employees">Open employees →</Link></div>
              {departmentData.length ? <BarChart data={departmentData} /> : <p className="empty">No employee data yet.</p>}
            </div>}
          </div>

          <div className="dashboard-grid lower">
            <div className="card activity-card">
              <div className="card-title-row"><div><h2>Workspace snapshot</h2><p className="muted small">Useful next steps</p></div></div>
              <div className="action-grid">
                {isStaff && <Link to="/companies" className="action-tile"><span>🏢</span><div><strong>Companies</strong><small>View and manage companies</small></div></Link>}
                {isStaff && <Link to="/employees" className="action-tile"><span>👥</span><div><strong>Employees</strong><small>Manage your people</small></div></Link>}
                <Link to="/projects" className="action-tile"><span>📊</span><div><strong>Projects</strong><small>Track project progress</small></div></Link>
                <Link to="/profile" className="action-tile"><span>👤</span><div><strong>My profile</strong><small>Review account details</small></div></Link>
              </div>
            </div>
            <div className="card welcome-card">
              <span className="welcome-icon">✓</span>
              <h2>{isEmployee ? "Your workspace is ready" : "Everything in one place"}</h2>
              <p className="muted">Use the sidebar to move between your company, employee, project and profile areas. Your access is controlled by your role.</p>
            </div>
          </div>
        </>
      )}
    </section>
  );
}
