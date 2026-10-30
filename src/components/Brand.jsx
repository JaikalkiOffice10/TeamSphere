import { useId } from "react";

// TeamSphere logo mark: a "C" ring that holds a team (three people) standing on a growth chart.
export function LogoMark({ size = 40 }) {
  const id = useId().replace(/:/g, "");
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" role="img" aria-label="TeamSphere" className="logo-mark">
      <defs>
        <linearGradient id={`ring${id}`} x1="0.1" y1="0" x2="0.9" y2="1">
          <stop offset="0" stopColor="#0aa6ff" />
          <stop offset="1" stopColor="#0447d4" />
        </linearGradient>
        <linearGradient id={`bar${id}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#1e84f5" />
          <stop offset="1" stopColor="#0b4fd8" />
        </linearGradient>
      </defs>
      {/* the open "C" ring */}
      <path d="M80 27A38 38 0 1 0 66 86" fill="none" stroke={`url(#ring${id})`} strokeWidth="13" />
      {/* swoosh under the team */}
      <path d="M17 85C52 103 93 86 98 47 88 72 52 90 17 85Z" fill={`url(#ring${id})`} />
      {/* people */}
      <circle cx="31" cy="44" r="5.6" fill="#1e84f5" />
      <path d="M21 66q0-15 10-15t10 15z" fill="#1e84f5" />
      <circle cx="69" cy="44" r="5.6" fill="#1e84f5" />
      <path d="M59 66q0-15 10-15t10 15z" fill="#1e84f5" />
      <circle cx="50" cy="34" r="7" fill="#0a2a6b" />
      <path d="M36 66q0-21 14-21t14 21z" fill="#0a2a6b" />
      <path d="M48 47h4l1.5 8-3.5 4-3.5-4z" fill="#fff" />
      {/* growth bars */}
      <rect x="35" y="62" width="9" height="16" rx="1.5" fill={`url(#bar${id})`} />
      <rect x="46" y="55" width="9" height="23" rx="1.5" fill={`url(#bar${id})`} />
      <rect x="57" y="47" width="9" height="31" rx="1.5" fill={`url(#bar${id})`} />
    </svg>
  );
}

export function Wordmark({ className = "" }) {
  return (
    <span className={`wordmark ${className}`}>
      <span className="wm-team">Team</span>
      <span className="wm-sphere">Sphere</span>
    </span>
  );
}

export const TAGLINE = ["Manage People", "Manage Companies", "Achieve More"];
