import { useState } from "react";
import { Link } from "react-router-dom";
import authApi from "../api/authApi";
import { errorMessage } from "../api/client";
import { useAuth } from "../context/AuthContext";
import PublicFooter from "../components/PublicFooter";
import PublicNavbar from "../components/PublicNavbar";

// One-time page: the backend only allows this while there are no users, and the first user becomes admin.
export default function Setup() {
  const { login } = useAuth();
  const [form, setForm] = useState({ full_name: "", email: "", password: "", confirm: "" });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const onChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirm) {
      setError("Passwords do not match.");
      return;
    }
    setSubmitting(true);
    setError("");
    try {
      await authApi.register({
        full_name: form.full_name.trim(),
        email: form.email.trim(),
        password: form.password,
      });
      await login(form.email.trim(), form.password);
    } catch (err) {
      const closed = err.response?.status === 403; // an admin already exists
      setError(closed ? "Setup is already done. Please log in instead." : errorMessage(err));
      setSubmitting(false);
    }
  };

  return (
    <div className="public-page">
      <PublicNavbar />
      <div className="auth-page auth-fill">
      <form className="auth-card" onSubmit={submit}>
        <h1>Set up the admin account</h1>
        <p className="muted">
          This works only once, before any account exists. The account you create here becomes the admin.
        </p>
        {error && <div className="alert error">{error}</div>}
        <label className="field">
          Full name
          <input name="full_name" value={form.full_name} onChange={onChange} required maxLength={120} autoFocus />
        </label>
        <label className="field">
          Email
          <input name="email" type="email" value={form.email} onChange={onChange} required />
        </label>
        <label className="field">
          Password <span className="hint">(at least 8 characters)</span>
          <input name="password" type="password" value={form.password} onChange={onChange} required minLength={8} />
        </label>
        <label className="field">
          Confirm password
          <input name="confirm" type="password" value={form.confirm} onChange={onChange} required minLength={8} />
        </label>
        <button className="btn primary block" type="submit" disabled={submitting}>
          {submitting ? "Creating…" : "Create admin account"}
        </button>
        <p className="muted small center">
          <Link to="/login">Back to log in</Link>
        </p>
      </form>
      </div>
      <PublicFooter />
    </div>
  );
}
