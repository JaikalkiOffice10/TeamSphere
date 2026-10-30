// Change the currency here if your amounts are not in INR
const CURRENCY = "INR";

const money = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: CURRENCY,
  maximumFractionDigits: 0,
});

export const formatMoney = (n) => money.format(Number(n) || 0);

export const formatDate = (d) =>
  d ? new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "—";

export const PROJECT_STATUSES = [
  { value: "planned", label: "Planned" },
  { value: "active", label: "Active" },
  { value: "on_hold", label: "On hold" },
  { value: "completed", label: "Completed" },
  { value: "cancelled", label: "Cancelled" },
];

export const statusLabel = (value) =>
  PROJECT_STATUSES.find((s) => s.value === value)?.label ?? value;

export const ROLES = [
  { value: "admin", label: "Admin" },
  { value: "manager", label: "Manager" },
  { value: "employee", label: "Employee" },
];

export const roleLabel = (value) => ROLES.find((r) => r.value === value)?.label ?? value;
