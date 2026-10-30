import { Link } from "react-router-dom";
import { formatDate, formatMoney, roleLabel } from "../utils/format";

/**
 * employees:      rows to show
 * companyNames:   optional { [id]: name } - shows a Company column when given
 * canEdit(emp):   whether to show Edit for that row
 * canDelete:      boolean, or (emp) => boolean, whether to show Delete
 */
export default function EmployeeTable({
  employees,
  companyNames,
  canEdit = () => false,
  canDelete = () => false,
  onEdit,
  onDelete,
}) {
  if (employees.length === 0) return <p className="empty">No employees found.</p>;
  const deletable = typeof canDelete === "function" ? canDelete : () => Boolean(canDelete);
  const showActions = employees.some((e) => canEdit(e) || deletable(e));

  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Role</th>
            <th>Designation</th>
            <th>Department</th>
            {companyNames && <th>Company</th>}
            <th className="num">Salary</th>
            <th>Hired</th>
            <th>Status</th>
            {showActions && <th></th>}
          </tr>
        </thead>
        <tbody>
          {employees.map((e) => (
            <tr key={e.id}>
              <td>
                <div className="strong">
                  {e.first_name} {e.last_name}
                </div>
                <div className="muted small">{e.email}</div>
              </td>
              <td>
                <span className={`badge role-${e.role}`}>{roleLabel(e.role)}</span>
              </td>
              <td>{e.designation}</td>
              <td>{e.department || "—"}</td>
              {companyNames && (
                <td>
                  <Link to={`/companies/${e.company_id}`}>
                    {companyNames[e.company_id] || `#${e.company_id}`}
                  </Link>
                </td>
              )}
              <td className="num">{formatMoney(e.salary)}</td>
              <td>{formatDate(e.hire_date)}</td>
              <td>
                <span className={`badge ${e.is_active ? "ok" : "off"}`}>
                  {e.is_active ? "Active" : "Inactive"}
                </span>
              </td>
              {showActions && (
                <td className="actions">
                  {canEdit(e) && (
                    <button className="btn small" onClick={() => onEdit(e)}>
                      Edit
                    </button>
                  )}
                  {deletable(e) && (
                    <button className="btn small danger" onClick={() => onDelete(e)}>
                      Delete
                    </button>
                  )}
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
