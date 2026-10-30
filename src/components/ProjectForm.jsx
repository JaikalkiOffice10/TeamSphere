import { useState } from "react";
import { clean, pick } from "../utils/form";
import { PROJECT_STATUSES } from "../utils/format";

const FIELDS = ["name", "description", "status", "start_date", "end_date", "budget", "company_id"];

export default function ProjectForm({
  initial,
  companies,
  lockedCompanyId,
  onSubmit,
  onCancel,
  submitting,
  error,
}) {
  const [form, setForm] = useState(() => ({
    name: "",
    description: "",
    status: "planned",
    start_date: "",
    end_date: "",
    budget: "",
    company_id: lockedCompanyId ?? "",
    ...pick(initial, FIELDS),
  }));
  const [localError, setLocalError] = useState("");

  const onChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const submit = (e) => {
    e.preventDefault();
    if (form.start_date && form.end_date && form.end_date < form.start_date) {
      setLocalError("End date cannot be before the start date.");
      return;
    }
    setLocalError("");
    onSubmit(
      clean({
        ...form,
        budget: form.budget === "" ? "" : Number(form.budget),
        company_id: Number(form.company_id),
      })
    );
  };

  const shownError = localError || error;

  return (
    <form onSubmit={submit}>
      {shownError && <div className="alert error">{shownError}</div>}
      <div className="form-grid">
        <label className="field full">
          Name *
          <input name="name" value={form.name} onChange={onChange} required maxLength={150} autoFocus />
        </label>
        <label className="field full">
          Description
          <textarea name="description" value={form.description} onChange={onChange} rows={3} maxLength={2000} />
        </label>
        <label className="field">
          Company *
          <select
            name="company_id"
            value={form.company_id}
            onChange={onChange}
            required
            disabled={lockedCompanyId != null}
          >
            <option value="">Select a company…</option>
            {companies.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </label>
        <label className="field">
          Status
          <select name="status" value={form.status} onChange={onChange}>
            {PROJECT_STATUSES.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
        </label>
        <label className="field">
          Start date
          <input name="start_date" type="date" value={form.start_date} onChange={onChange} />
        </label>
        <label className="field">
          End date
          <input name="end_date" type="date" value={form.end_date} onChange={onChange} />
        </label>
        <label className="field">
          Budget
          <input name="budget" type="number" min="0" step="0.01" value={form.budget} onChange={onChange} />
        </label>
      </div>
      <div className="form-actions">
        <button type="button" className="btn" onClick={onCancel}>
          Cancel
        </button>
        <button type="submit" className="btn primary" disabled={submitting || companies.length === 0}>
          {submitting ? "Saving…" : "Save"}
        </button>
      </div>
    </form>
  );
}
