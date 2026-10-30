import { useEffect, useState } from "react";
import companyApi from "../api/companyApi";
import { useAuth } from "../context/AuthContext";
import { formatDate, formatMoney, roleLabel } from "../utils/format";

function Details({ rows }) {
  return (
    <dl className="details">
      {rows.map(([label, value]) => (
        <div key={label}>
          <dt>{label}</dt>
          <dd>{value ?? "—"}</dd>
        </div>
      ))}
    </dl>
  );
}

export default function Profile() {
  const { user, employee, isAdmin } = useAuth();
  const [company, setCompany] = useState(null);

  useEffect(() => {
    if (!employee) return;
    let alive = true;
    companyApi
      .get(employee.company_id)
      .then((res) => alive && setCompany(res.data))
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, [employee]);

  return (
    <section>
      <div className="page-head">
        <h1>My profile</h1>
      </div>

      <div className="card">
        <h2>Login account</h2>
        <Details
          rows={[
            ["Name", user.full_name],
            ["Email", user.email],
            ["Role", <span className={`badge role-${user.role}`}>{roleLabel(user.role)}</span>],
            [
              "Status",
              <span className={`badge ${user.is_active ? "ok" : "off"}`}>
                {user.is_active ? "Active" : "Disabled"}
              </span>,
            ],
          ]}
        />
      </div>

      <div className="card">
        <h2>Employee record</h2>
        {employee ? (
          <Details
            rows={[
              ["Name", `${employee.first_name} ${employee.last_name}`],
              ["Work email", employee.email],
              ["Phone", employee.phone],
              ["Designation", employee.designation],
              ["Department", employee.department],
              ["Company", company?.name],
              ["Salary", formatMoney(employee.salary)],
              ["Hire date", formatDate(employee.hire_date)],
              [
                "Employment",
                <span className={`badge ${employee.is_active ? "ok" : "off"}`}>
                  {employee.is_active ? "Active" : "Inactive"}
                </span>,
              ],
            ]}
          />
        ) : isAdmin ? (
          <p className="muted">Admin accounts don’t need an employee record.</p>
        ) : (
          <p className="muted">
            Your account isn’t linked to an employee record, so no company details are available. Ask an admin to link it.
          </p>
        )}
      </div>
    </section>
  );
}
