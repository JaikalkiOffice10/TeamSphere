import { useMemo, useState } from "react";
import employeeApi from "../api/employeeApi";
import { errorMessage } from "../api/client";
import EmployeeForm from "../components/EmployeeForm";
import EmployeeTable from "../components/EmployeeTable";
import Modal from "../components/Modal";
import Pagination from "../components/Pagination";
import { useAuth } from "../context/AuthContext";
import useCompanies from "../hooks/useCompanies";
import useDebounce from "../hooks/useDebounce";
import useFormModal from "../hooks/useFormModal";
import usePagedList from "../hooks/usePagedList";

export default function Employees() {
  const { isAdmin, isManager, employeeId, companyId } = useAuth();
  const companies = useCompanies(); // admin: all companies; manager: just their own
  const companyNames = useMemo(
    () => Object.fromEntries(companies.map((c) => [c.id, c.name])),
    [companies]
  );

  const [search, setSearch] = useState("");
  const [department, setDepartment] = useState("");
  const [filterCompany, setFilterCompany] = useState("");
  const [status, setStatus] = useState(""); // "" | "true" | "false"
  const debouncedSearch = useDebounce(search);
  const debouncedDepartment = useDebounce(department);

  const list = usePagedList(
    (p) =>
      employeeApi.list({
        ...p,
        search: debouncedSearch || undefined,
        department: debouncedDepartment || undefined,
        company_id: filterCompany || undefined,
        is_active: status || undefined,
      }),
    [debouncedSearch, debouncedDepartment, filterCompany, status]
  );
  const form = useFormModal();

  const save = (payload) =>
    form.submit(
      () =>
        form.modal.employee
          ? employeeApi.update(form.modal.employee.id, payload)
          : employeeApi.create(payload),
      list.reload
    );

  const remove = async (emp) => {
    if (!window.confirm(`Delete ${emp.first_name} ${emp.last_name}?`)) return;
    try {
      await employeeApi.remove(emp.id);
      list.afterRemove();
    } catch (e) {
      list.setError(errorMessage(e));
    }
  };

  // Managers can edit their colleagues but not their own record; managers can delete their own company's employees (not themselves)
  const canEdit = (e) => isAdmin || (isManager && e.id !== employeeId);
  const canDelete = canEdit; // same rule: admin any, manager their company's employees except themselves

  return (
    <section>
      <div className="page-head">
        <h1>Employees</h1>
        <button className="btn primary" onClick={() => form.open()}>
          + Add employee
        </button>
      </div>

      <div className="toolbar">
        <input type="search" placeholder="Search name or email…" value={search} onChange={(e) => setSearch(e.target.value)} />
        {isAdmin && (
          <select value={filterCompany} onChange={(e) => setFilterCompany(e.target.value)}>
            <option value="">All companies</option>
            {companies.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        )}
        <input placeholder="Department (exact)" value={department} onChange={(e) => setDepartment(e.target.value)} />
        <select value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="">Any status</option>
          <option value="true">Active</option>
          <option value="false">Inactive</option>
        </select>
      </div>

      {list.error && <div className="alert error">{list.error}</div>}

      {list.loading && list.items.length === 0 ? (
        <p className="empty">Loading…</p>
      ) : (
        <EmployeeTable
          employees={list.items}
          companyNames={isAdmin ? companyNames : undefined}
          canEdit={canEdit}
          canDelete={canDelete}
          onEdit={(e) => form.open({ employee: e })}
          onDelete={remove}
        />
      )}

      <Pagination page={list.page} hasNext={list.hasNext} onChange={list.setPage} />

      {form.modal && (
        <Modal title={form.modal.employee ? "Edit employee" : "Add employee"} onClose={form.close}>
          <EmployeeForm
            initial={form.modal.employee}
            companies={companies}
            lockedCompanyId={isManager ? companyId ?? undefined : undefined}
            onSubmit={save}
            onCancel={form.close}
            submitting={form.saving}
            error={form.formError}
          />
        </Modal>
      )}
    </section>
  );
}
