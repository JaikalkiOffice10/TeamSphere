// Copy only the given keys from obj, turning null/undefined into "" for inputs
export function pick(obj, keys) {
  const out = {};
  if (!obj) return out;
  keys.forEach((k) => {
    if (k in obj) out[k] = obj[k] ?? "";
  });
  return out;
}

// Trim strings and turn empty strings into null before sending to the API
export function clean(obj) {
  return Object.fromEntries(
    Object.entries(obj).map(([k, v]) => {
      if (typeof v === "string") {
        const t = v.trim();
        return [k, t === "" ? null : t];
      }
      return [k, v];
    })
  );
}
