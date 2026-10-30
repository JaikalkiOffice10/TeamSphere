import { useState } from "react";
import { Link } from "react-router-dom";
import { errorMessage } from "../api/client";
import { useAuth } from "../context/AuthContext";
import { LogoMark } from "../components/Brand";
import PublicFooter from "../components/PublicFooter";
import PublicNavbar from "../components/PublicNavbar";

export default function Login() {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const submit = async (e) => {
    e.preventDefault(); setSubmitting(true); setError("");
    try { await login(email.trim(), password); } catch (err) { setError(errorMessage(err)); setSubmitting(false); }
  };

  return (
    <div className="public-page">
      <PublicNavbar />
      <main className="login-main">
        <section className="login-copy" id="about">
          <span className="eyebrow">TeamSphere workspace</span>
          <h1>Run your teams and projects from one simple workspace.</h1>
          <p>Manage companies, employees and projects with clear role-based access designed for modern teams.</p>
          <div className="login-points" id="features"><div><span>✓</span><strong>Role-based access</strong></div><div><span>✓</span><strong>Company & employee management</strong></div><div><span>✓</span><strong>Project visibility and tracking</strong></div></div>
        </section>
        <form className="auth-card modern-auth" onSubmit={submit}>
          <LogoMark size={46} /><h2>Welcome back</h2><p className="muted">Sign in to access your workspace.</p>
          {error && <div className="alert error">{error}</div>}
          <label className="field">Email<input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required autoFocus placeholder="you@company.com" /></label>
          <label className="field">Password<input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required placeholder="Enter your password" /></label>
          <button className="btn primary block" type="submit" disabled={submitting}>{submitting ? "Signing in…" : "Sign in"}</button>
          <p className="muted small center">First time setting up the system? <Link to="/setup">Set up admin account</Link></p>
        </form>
      </main>
      <PublicFooter />
    </div>
  );
}
