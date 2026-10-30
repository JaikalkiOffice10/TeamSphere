import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import authApi from "../api/authApi";
import employeeApi from "../api/employeeApi";
import { setUnauthorizedHandler, tokenStore } from "../api/client";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null); // the login account
  const [employee, setEmployee] = useState(null); // the linked employee record, if any
  const [loading, setLoading] = useState(() => Boolean(tokenStore.get()));

  const logout = useCallback(() => {
    tokenStore.clear();
    setUser(null);
    setEmployee(null);
  }, []);

  const loadSession = useCallback(async () => {
    const me = (await authApi.me()).data;
    let emp = null;
    if (me.employee_id != null) {
      try {
        emp = (await employeeApi.me()).data;
      } catch {
        emp = null; // account exists but the employee record is gone
      }
    }
    setUser(me);
    setEmployee(emp);
  }, []);

  // Any 401 from the API logs the user out (expired token, disabled account, ...)
  useEffect(() => {
    setUnauthorizedHandler(logout);
  }, [logout]);

  // Restore the session on page load
  useEffect(() => {
    if (!tokenStore.get()) {
      setLoading(false);
      return;
    }
    loadSession()
      .catch(() => logout())
      .finally(() => setLoading(false));
  }, [loadSession, logout]);

  const login = useCallback(
    async (email, password) => {
      const res = await authApi.login(email, password);
      tokenStore.set(res.data.access_token);
      try {
        await loadSession();
      } catch (e) {
        tokenStore.clear();
        throw e;
      }
    },
    [loadSession]
  );

  const value = useMemo(() => {
    const role = user?.role ?? null;
    return {
      user,
      employee,
      loading,
      login,
      logout,
      role,
      isAdmin: role === "admin",
      isManager: role === "manager",
      isEmployee: role === "employee",
      isStaff: role === "admin" || role === "manager", // can manage data
      employeeId: user?.employee_id ?? null,
      companyId: employee?.company_id ?? null, // the user's own company (managers / employees)
    };
  }, [user, employee, loading, login, logout]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}
