import { Link } from "react-router-dom";
import { LogoMark, TAGLINE, Wordmark } from "../components/Brand";
import PublicFooter from "../components/PublicFooter";
import PublicNavbar from "../components/PublicNavbar";

const Icon = ({ children, color }) => (
  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    {children}
  </svg>
);

const FEATURES = [
  {
    title: "Companies",
    text: "Manage your organizations",
    icon: (
      <Icon color="#1a66e6">
        <path d="M4 21V5a1 1 0 0 1 1-1h8a1 1 0 0 1 1 1v16M14 9h5a1 1 0 0 1 1 1v11M3 21h18M8 8h2M8 12h2M8 16h2M17 13h1M17 17h1" />
      </Icon>
    ),
  },
  {
    title: "Employees",
    text: "Build your team",
    icon: (
      <Icon color="#12a37a">
        <circle cx="9" cy="8" r="3" />
        <circle cx="17" cy="9" r="2.4" />
        <path d="M3 20c0-3.3 2.7-5.5 6-5.5s6 2.2 6 5.5M15.5 14.8c3 0 5.5 1.7 5.5 4.7" />
      </Icon>
    ),
  },
  {
    title: "Projects",
    text: "Track progress and milestones",
    icon: (
      <Icon color="#6b3fd4">
        <rect x="5" y="4" width="14" height="17" rx="2" />
        <path d="M9 4V3h6v1M9 10h6M9 14h3M14.5 17.5l1.7 1.7 3-3.2" />
      </Icon>
    ),
  },
  {
    title: "Secure",
    text: "Your data, our priority",
    icon: (
      <Icon color="#e8890c">
        <path d="M12 3l8 3v6c0 4.5-3.2 8-8 9-4.8-1-8-4.5-8-9V6z" />
        <rect x="9" y="11" width="6" height="5" rx="1" />
        <path d="M10 11V9.5a2 2 0 0 1 4 0V11" />
      </Icon>
    ),
  },
  {
    title: "Grow",
    text: "Achieve more together",
    icon: (
      <Icon color="#1a66e6">
        <path d="M4 20V13M10 20V9M16 20v-5M3 20h18M13 6l4-3 4 1M17 3v3" />
      </Icon>
    ),
  },
];

const ROLES = [
  {
    name: "Admin",
    tone: "danger",
    points: ["Creates companies and their managers", "Sees every company, employee and project", "Full control, including deleting"],
  },
  {
    name: "Manager",
    tone: "primary",
    points: [
      "Sees all employees of their own company",
      "Adds, updates and removes their employees",
      "Creates projects and builds their teams",
    ],
  },
  {
    name: "Employee",
    tone: "ok",
    points: ["Sees the projects they are assigned to", "Sees who is on each project team", "Keeps their own profile up to date"],
  },
];

export default function Landing() {
  return (
    <div className="public-page">
      <PublicNavbar home />

      <main>
        <section className="hero" id="about">
          <div className="hero-lockup">
            <LogoMark size={150} />
            <Wordmark className="wordmark-xl" />
          </div>
          <p className="hero-tagline">
            {TAGLINE.map((t, i) => (
              <span key={t}>
                {i > 0 && <i aria-hidden="true">·</i>}
                {t}
              </span>
            ))}
          </p>
          <p className="hero-text">
            A modern company management system designed to streamline your workforce, projects and operations, all in one
            place.
          </p>
          <div className="hero-cta">
            <Link className="btn primary hero-btn" to="/login">
              Sign in to your workspace
            </Link>
            <Link className="btn hero-btn" to="/setup">
              Set up admin account
            </Link>
          </div>
        </section>

        <section className="features" id="features" aria-label="Features">
          {FEATURES.map((f) => (
            <div className="feature" key={f.title}>
              {f.icon}
              <strong>{f.title}</strong>
              <span>{f.text}</span>
            </div>
          ))}
        </section>

        <section className="roles" id="roles">
          <p className="eyebrow">Role-based access</p>
          <h2>The right access for everyone</h2>
          <div className="role-grid">
            {ROLES.map((r) => (
              <div className={`role-card tone-${r.tone}`} key={r.name}>
                <span className="role-pill">{r.name}</span>
                <ul>
                  {r.points.map((p) => (
                    <li key={p}>{p}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>

        <section className="cta-band">
          <h2>More than just management</h2>
          <p>Bring your companies, people and projects together in one secure workspace.</p>
          <Link className="btn hero-btn cta-btn" to="/login">
            Sign in
          </Link>
        </section>
      </main>

      <PublicFooter />
    </div>
  );
}
