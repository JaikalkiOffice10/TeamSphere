import { useState } from "react";
import { clean, pick } from "../utils/form";

const FIELDS = [
  "first_name", "last_name", "email", "password", "phone", "designation",
  "department", "salary", "hire_date", "is_active", "company_id", "role",
];

export default function EmployeeForm({
  initial,
  companies,
  lockedCompanyId,
  onSubmit,
  onCancel,
  submitting,
  error,
}) {
  const [form, setForm] = useState(() => ({
    first_name: "",
    last_name: "",
    email: "",
    password: "",
    phone: "",
    designation: "",
    department: "",
    salary: "",
    hire_date: "",
    is_active: true,
    role: "employee",
    company_id: lockedCompanyId ?? "",
    ...pick(initial, FIELDS),
  }));

  const onChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((f) => ({ ...f, [name]: type === "checkbox" ? checked : value }));
  };

  const submit = (e) => {
    e.preventDefault();
    onSubmit(
      clean({
        ...form,
        salary: form.salary === "" ? 0 : Number(form.salary),
        company_id: Number(form.company_id),
      })
    );
  };

  return (
    <form onSubmit={submit}>
      {error && <div className="alert error">{error}</div>}
      {companies.length === 0 && (
        <div className="alert">Create a company first, then add employees to it.</div>
      )}
      <div className="form-grid">
        <label className="field">
          First name *
          <input name="first_name" value={form.first_name} onChange={onChange} required maxLength={80} autoFocus />
        </label>
        <label className="field">
          Last name *
          <input name="last_name" value={form.last_name} onChange={onChange} required maxLength={80} />
        </label>
        <label className="field">
          Email *
          <input name="email" type="email" value={form.email} onChange={onChange} required />
        </label>
        {!initial && (
          <label className="field">
            Password *
            <input name="password" type="password" value={form.password} onChange={onChange} required minLength={8} autoComplete="new-password" />
            <small className="field-help">Minimum 8 characters.</small>
          </label>
        )}
        <label className="field">
          Phone
          <input name="phone" value={form.phone} onChange={onChange} maxLength={30} />
        </label>
        <label className="field">
          Designation *
          <input name="designation" value={form.designation} onChange={onChange} required maxLength={100} />
        </label>
        <label className="field">
          Department
          <input name="department" value={form.department} onChange={onChange} maxLength={100} />
        </label>
        <label className="field">
          Salary
          <input name="salary" type="number" min="0" step="0.01" value={form.salary} onChange={onChange} />
        </label>
        <label className="field">
          Hire date
          <input name="hire_date" type="date" value={form.hire_date} onChange={onChange} />
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
          Role
          <select name="role" value={form.role} onChange={onChange}>
            <option value="employee">Employee</option>
            <option value="manager">Manager (can manage this company)</option>
          </select>
        </label>
        <label className="field checkbox">
          <input name="is_active" type="checkbox" checked={form.is_active} onChange={onChange} />
          Active
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
