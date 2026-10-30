import { useEffect, useMemo, useState } from "react";
import companyApi from "../api/companyApi";
import projectApi from "../api/projectApi";
import { errorMessage } from "../api/client";
import { Avatar, AvatarStack } from "./Avatar";
import Modal from "./Modal";

// The API may return employee objects or assignment rows ({ employee_id }) - handle both
const idOf = (row) => row.employee_id ?? row.id;

/**
 * Pick which employees of the project's company work on the project.
 * Saving sends only the differences (assign the newly ticked, unassign the unticked).
 */
export default function AssignEmployeesModal({ project, onClose, onSaved }) {
  const [employees, setEmployees] = useState([]);
  const [initial, setInitial] = useState(new Set());
  const [selected, setSelected] = useState(new Set());
  const [search, setSearch] = useState("");
  const [view, setView] = useState("all"); // all | team | others
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let alive = true;
    Promise.all([
      companyApi.employees(project.company_id, { skip: 0, limit: 100 }),
      projectApi.employees(project.id),
    ])
      .then(([all, assigned]) => {
        if (!alive) return;
        const ids = new Set(assigned.data.map(idOf));
        // inactive employees can't be assigned (the API refuses); keep them only if already on the project
        setEmployees(all.data.filter((e) => e.is_active || ids.has(e.id)));
        setInitial(ids);
        setSelected(new Set(ids));
      })
      .catch((e) => alive && setError(errorMessage(e)))
      .finally(() => alive && setLoading(false));
    return () => {
      alive = false;
    };
  }, [project.id, project.company_id]);

  const visible = useMemo(() => {
    const q = search.trim().toLowerCase();
    return employees
      .filter((e) => view === "all" || (view === "team") === initial.has(e.id))
      .filter(
        (e) =>
          !q ||
          `${e.first_name} ${e.last_name} ${e.email} ${e.designation || ""} ${e.department || ""}`
            .toLowerCase()
            .includes(q)
      )
      // current team members first
      .sort((a, b) => Number(initial.has(b.id)) - Number(initial.has(a.id)));
  }, [employees, search, view, initial]);

  const toggle = (id) =>
    setSelected((s) => {
      const next = new Set(s);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });

  const toAdd = [...selected].filter((id) => !initial.has(id));
  const toRemove = [...initial].filter((id) => !selected.has(id));
  const changed = toAdd.length + toRemove.length;

  const save = async () => {
    setSaving(true);
    setError("");
    try {
      await Promise.all([
        ...toAdd.map((id) => projectApi.assign(project.id, id)),
        ...toRemove.map((id) => projectApi.unassign(project.id, id)),
      ]);
      onSaved?.();
      onClose();
    } catch (e) {
      setError(errorMessage(e));
      setSaving(false);
    }
  };

  return (
    <Modal title={`Team - ${project.name}`} onClose={onClose}>
      {error && <div className="alert error">{error}</div>}
      {loading ? (
        <p className="empty">Loading…</p>
      ) : employees.length === 0 ? (
        <p className="empty">This company has no employees yet. Add employees first.</p>
      ) : (
        <>
          <div className="assign-summary">
            <AvatarStack people={employees.filter((e) => selected.has(e.id))} max={8} size={36} />
            <span className="small">
              <span className="strong">{selected.size}</span> of {employees.length} employees on this project
            </span>
          </div>
          <div className="assign-tools">
            <input
              type="search"
              className="assign-search"
              placeholder="Search employees…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <select value={view} onChange={(e) => setView(e.target.value)}>
              <option value="all">Everyone</option>
              <option value="team">Current team ({initial.size})</option>
              <option value="others">Not on the team</option>
            </select>
          </div>
          <p className="muted small">Tick to add, untick to remove, then Save.</p>
          <ul className="assign-list">
            {visible.map((e) => (
              <li key={e.id}>
                <label className="assign-row">
                  <input type="checkbox" checked={selected.has(e.id)} onChange={() => toggle(e.id)} />
                  <Avatar person={e} size={34} />
                  <span>
                    <span className="strong">
                      {e.first_name} {e.last_name}
                      {e.role === "manager" && <span className="badge role-manager assign-badge">Manager</span>}
                      {initial.has(e.id) && <span className="badge st-active assign-badge">On team</span>}
                    </span>
                    <span className="muted small">
                      {[e.designation, e.department].filter(Boolean).join(" · ") || e.email}
                    </span>
                  </span>
                </label>
              </li>
            ))}
            {visible.length === 0 && (
              <li className="empty">{view === "team" ? "No one is assigned yet." : "No matches."}</li>
            )}
          </ul>
        </>
      )}
      <div className="form-actions">
        <button type="button" className="btn" onClick={onClose}>
          Cancel
        </button>
        <button type="button" className="btn primary" onClick={save} disabled={saving || loading || changed === 0}>
          {saving ? "Saving…" : changed ? `Save (${changed} change${changed > 1 ? "s" : ""})` : "Save"}
        </button>
      </div>
    </Modal>
  );
}
