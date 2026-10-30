import { Link } from "react-router-dom";
import { LogoMark, Wordmark } from "./Brand";

export default function PublicFooter() {
  return (
    <footer className="site-footer">
      <div className="footer-inner">
        <div className="footer-brand">
          <Link to="/" className="public-brand">
            <LogoMark size={34} />
            <Wordmark />
          </Link>
          <p>A modern company management system to streamline your workforce, projects and operations, all in one place.</p>
        </div>
        <div className="footer-col">
          <h4>Product</h4>
          <a href="/#features">Features</a>
          <a href="/#roles">Roles and access</a>
          <a href="/#about">About</a>
        </div>
        <div className="footer-col">
          <h4>Get started</h4>
          <Link to="/login">Sign in</Link>
          <Link to="/setup">Admin setup</Link>
        </div>
        <div className="footer-col">
          <h4>What you manage</h4>
          <span>Companies</span>
          <span>Employees</span>
          <span>Projects and teams</span>
        </div>
      </div>
      <div className="footer-bottom">
        <span>© {new Date().getFullYear()} TeamSphere. All rights reserved.</span>
        <span className="footer-motto">TeamSphere: more than just management</span>
      </div>
    </footer>
  );
}
