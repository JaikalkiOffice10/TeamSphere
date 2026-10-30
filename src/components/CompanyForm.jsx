import { useState } from "react";
import { clean, pick } from "../utils/form";

const FIELDS = ["name", "industry", "location", "website", "founded_year"];

export default function CompanyForm({ initial, onSubmit, onCancel, submitting, error }) {
  const [form, setForm] = useState(() => ({
    name: "",
    industry: "",
    location: "",
    website: "",
    founded_year: "",
    ...pick(initial, FIELDS),
  }));

  const onChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const submit = (e) => {
    e.preventDefault();
    onSubmit(
      clean({
        ...form,
        founded_year: form.founded_year === "" ? "" : Number(form.founded_year),
      })
    );
  };

  return (
    <form onSubmit={submit}>
      {error && <div className="alert error">{error}</div>}
      <div className="form-grid">
        <label className="field full">
          Name *
          <input name="name" value={form.name} onChange={onChange} required maxLength={150} autoFocus />
        </label>
        <label className="field">
          Industry
          <input name="industry" value={form.industry} onChange={onChange} maxLength={100} />
        </label>
        <label className="field">
          Location
          <input name="location" value={form.location} onChange={onChange} maxLength={150} />
        </label>
        <label className="field">
          Website
          <input name="website" value={form.website} onChange={onChange} maxLength={255} placeholder="https://" />
        </label>
        <label className="field">
          Founded year
          <input name="founded_year" type="number" min="1800" max="2100" value={form.founded_year} onChange={onChange} />
        </label>
      </div>
      <div className="form-actions">
        <button type="button" className="btn" onClick={onCancel}>
          Cancel
        </button>
        <button type="submit" className="btn primary" disabled={submitting}>
          {submitting ? "Saving…" : "Save"}
        </button>
      </div>
    </form>
  );
}
