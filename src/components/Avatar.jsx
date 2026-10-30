// Round "initials" avatar with a colour derived from the name, plus an overlapping stack of them.
const hue = (str) => {
  let h = 0;
  for (const ch of str) h = (h * 31 + ch.charCodeAt(0)) % 360;
  return h;
};

export const fullName = (e) => `${e.first_name || ""} ${e.last_name || ""}`.trim();

export function Avatar({ person, size = 32 }) {
  const name = fullName(person) || person.email || "?";
  const initials = `${person.first_name?.[0] || name[0] || "?"}${person.last_name?.[0] || ""}`.toUpperCase();
  const h = hue(name);
  return (
    <span
      className={`avatar${person.role === "manager" ? " is-manager" : ""}`}
      style={{
        width: size,
        height: size,
        fontSize: size * 0.36,
        background: `hsl(${h} 60% 88%)`,
        color: `hsl(${h} 55% 28%)`,
      }}
      title={`${name}${person.designation ? " · " + person.designation : ""}${person.role === "manager" ? " (manager)" : ""}`}
    >
      {initials}
    </span>
  );
}

export function AvatarStack({ people, max = 5, size = 32 }) {
  const shown = people.slice(0, max);
  const extra = people.length - shown.length;
  return (
    <span className="avatar-stack">
      {shown.map((p) => (
        <Avatar key={p.id} person={p} size={size} />
      ))}
      {extra > 0 && (
        <span className="avatar avatar-more" style={{ width: size, height: size, fontSize: size * 0.38 }}>
          +{extra}
        </span>
      )}
    </span>
  );
}
