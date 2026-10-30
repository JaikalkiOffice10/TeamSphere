import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import projectApi from "../api/projectApi";
import { formatDate, formatMoney, statusLabel } from "../utils/format";
import { AvatarStack } from "./Avatar";

const DAY = 86400000;

// Where the project is on its timeline: { pct, label, tone } or null when there are no dates
function timeline(p) {
  if (!p.start_date && !p.end_date) return null;
  if (p.status === "completed") return { pct: 100, label: "Completed", tone: "done" };
  if (p.status === "cancelled") return { pct: 0, label: "Cancelled", tone: "off" };
  const now = Date.now();
  const start = p.start_date ? new Date(p.start_date).getTime() : null;
  const end = p.end_date ? new Date(p.end_date).getTime() : null;
  if (start && now < start) return { pct: 0, label: `Starts in ${Math.ceil((start - now) / DAY)} days`, tone: "idle" };
  if (start && end && end > start) {
    const pct = Math.min(100, Math.max(0, Math.round(((now - start) / (end - start)) * 100)));
    const left = Math.ceil((end - now) / DAY);
    if (left < 0) return { pct: 100, label: `Overdue by ${-left} days`, tone: "late" };
    return { pct, label: left === 0 ? "Due today" : `${left} days left`, tone: left <= 7 ? "warn" : "ok" };
  }
  return { pct: 0, label: p.end_date ? `Due ${formatDate(p.end_date)}` : `Since ${formatDate(p.start_date)}`, tone: "idle" };
}

/**
 * One project as a card: status, timeline bar and the team as avatars.
 * teamKey: change it to make the card re-load its team (after assigning in the modal).
 */
export default function ProjectCard({
  project: p,
  companyName,
  showBudget = true,
  canEdit,
  canDelete,
  canAssign,
  onAssign,
  onEdit,
  onDelete,
  teamKey = 0,
}) {
  const [team, setTeam] = useState(null); // null = loading

  useEffect(() => {
    let alive = true;
    projectApi
      .employees(p.id)
      .then((res) => alive && setTeam(res.data))
      .catch(() => alive && setTeam([]));
    return () => {
      alive = false;
    };
  }, [p.id, teamKey]);

  const tl = timeline(p);
  const managers = (team || []).filter((m) => m.role === "manager").length;

  return (
    <article className={`project-card st-border-${p.status}`}>
      <header>
        <span className={`badge st-${p.status}`}>{statusLabel(p.status)}</span>
        {companyName && (
          <Link to={`/companies/${p.company_id}`} className="muted small">
            {companyName}
          </Link>
        )}
      </header>

      <h3>{p.name}</h3>
      {p.description ? <p className="muted small clamp">{p.description}</p> : <p className="muted small">No description</p>}

      {tl && (
        <div className="timeline">
          <div className="timeline-bar">
            <span className={`timeline-fill tone-${tl.tone}`} style={{ width: `${tl.pct}%` }} />
          </div>
          <div className="timeline-meta small muted">
            <span>
              {formatDate(p.start_date)} → {formatDate(p.end_date)}
            </span>
            <span className={`tone-text-${tl.tone}`}>{tl.label}</span>
          </div>
        </div>
      )}

      <div className="team-row">
        {team === null ? (
          <span className="muted small">Loading team…</span>
        ) : team.length === 0 ? (
          <span className="muted small">No one assigned yet</span>
        ) : (
          <>
            <AvatarStack people={team} max={5} size={34} />
            <span className="small">
              <span className="strong">{team.length}</span> member{team.length > 1 ? "s" : ""}
              {managers > 0 && <span className="muted"> · {managers} manager{managers > 1 ? "s" : ""}</span>}
            </span>
          </>
        )}
      </div>

      <footer>
        {showBudget && <span className="budget">{p.budget == null ? "" : formatMoney(p.budget)}</span>}
        <span className="card-actions">
          {canAssign && (
            <button className="btn small primary" onClick={() => onAssign(p)}>
              {team && team.length ? "Manage team" : "+ Assign team"}
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
        </span>
      </footer>
    </article>
  );
}
