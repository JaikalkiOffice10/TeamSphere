import { useEffect, useState } from "react";
import companyApi from "../api/companyApi";

// Loads up to 100 companies for dropdowns and name lookups.
// Admin gets all of them, a manager just their own. Pass enabled=false for roles that may not list companies.
export default function useCompanies(reloadKey = 0, enabled = true) {
  const [companies, setCompanies] = useState([]);
  useEffect(() => {
    if (!enabled) return;
    let alive = true;
    companyApi
      .list({ limit: 100 })
      .then((res) => alive && setCompanies(res.data))
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, [reloadKey, enabled]);
  return companies;
}
