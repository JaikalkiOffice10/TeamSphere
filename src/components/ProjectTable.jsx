import { Link } from "react-router-dom";
import { formatDate, formatMoney, statusLabel } from "../utils/format";

/**
 * showBudget:   false for employees (the API hides the budget from them anyway)
 * companyNames: optional { [id]: name } - shows a Company column when given
 */
export default function ProjectTable({
  projects,
  companyNames,
  showBudget = true,
  canEdit = false,
  canDelete = false,
  canAssign = false,
  onAssign,
  onEdit,
  onDelete,
}) {
  if (projects.length === 0) return <p className="empty">No projects found.</p>;
  const showActions = canEdit || canDelete || canAssign;

  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            <th>Project</th>
            {companyNames && <th>Company</th>}
            <th>Status</th>
            <th>Start</th>
            <th>End</th>
            {showBudget && <th className="num">Budget</th>}
            {showActions && <th></th>}
          </tr>
        </thead>
        <tbody>
          {projects.map((p) => (
            <tr key={p.id}>
              <td>
                <div className="strong">{p.name}</div>
                {p.description && <div className="muted small clamp">{p.description}</div>}
              </td>
              {companyNames && (
                <td>
                  <Link to={`/companies/${p.company_id}`}>
                    {companyNames[p.company_id] || `#${p.company_id}`}
                  </Link>
                </td>
              )}
              <td>
                <span className={`badge st-${p.status}`}>{statusLabel(p.status)}</span>
              </td>
              <td>{formatDate(p.start_date)}</td>
              <td>{formatDate(p.end_date)}</td>
              {showBudget && (
                <td className="num">{p.budget == null ? "—" : formatMoney(p.budget)}</td>
              )}
              {showActions && (
                <td className="actions">
                  {canAssign && (
                    <button className="btn small" onClick={() => onAssign(p)}>
                      Team
                    </button>
                  )}
                  {canEdit && (
                    <button className="btn small" onClick={() => onEdit(p)}>
                      Edit
                    </button>
                  )}
                  {canDelete && (
                    <button className="btn small danger" onClick={() => onDelete(p)}>
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
