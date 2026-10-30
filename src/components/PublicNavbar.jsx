import { Link } from "react-router-dom";
import { LogoMark, Wordmark } from "./Brand";

// Top bar for the public pages (home, login, setup). `home` = true adds the in-page section links.
export default function PublicNavbar({ home = false }) {
  const section = (id) => (home ? `#${id}` : `/#${id}`);
  return (
    <header className="public-navbar">
      <Link to="/" className="public-brand" aria-label="TeamSphere home">
        <LogoMark size={38} />
        <Wordmark />
      </Link>
      <nav className="public-nav-links" aria-label="Main">
        <a href={section("features")}>Features</a>
        <a href={section("roles")}>Roles</a>
        <a href={section("about")}>About</a>
        <Link className="btn small" to="/setup">
          Admin setup
        </Link>
        <Link className="btn small primary" to="/login">
          Sign in
        </Link>
      </nav>
    </header>
  );
}
