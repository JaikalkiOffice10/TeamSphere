import { useMemo, useState } from "react";
import projectApi from "../api/projectApi";
import { errorMessage } from "../api/client";
import AssignEmployeesModal from "../components/AssignEmployeesModal";
import Modal from "../components/Modal";
import Pagination from "../components/Pagination";
import ProjectForm from "../components/ProjectForm";
import ProjectGrid from "../components/ProjectGrid";
import { useAuth } from "../context/AuthContext";
import useCompanies from "../hooks/useCompanies";
import useDebounce from "../hooks/useDebounce";
import useFormModal from "../hooks/useFormModal";
import usePagedList from "../hooks/usePagedList";
import { PROJECT_STATUSES } from "../utils/format";

export default function Projects() {
  const { isAdmin, isManager, isStaff, isEmployee, companyId } = useAuth();
  // Employees can't list companies (the API refuses), and they only see their own company's projects anyway
  const companies = useCompanies(0, isStaff);
  const companyNames = useMemo(
    () => Object.fromEntries(companies.map((c) => [c.id, c.name])),
    [companies]
  );

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [filterCompany, setFilterCompany] = useState("");
  const debouncedSearch = useDebounce(search);

  // Employees see only the projects they are assigned to; admin / manager see the company's projects
  const list = usePagedList(
    (p) =>
      isEmployee
        ? projectApi.mine(p).then((res) => ({
            ...res,
            // this endpoint has no paging/filters, so do them here
            data: res.data
              .filter(
                (x) =>
                  (!debouncedSearch || x.name.toLowerCase().includes(debouncedSearch.toLowerCase())) &&
                  (!status || x.status === status)
              )
              .slice(p.skip, p.skip + p.limit),
          }))
        : projectApi.list({
            ...p,
            search: debouncedSearch || undefined,
            status: status || undefined,
            company_id: filterCompany || undefined,
          }),
    [debouncedSearch, status, filterCompany, isEmployee]
  );
  const form = useFormModal();
  const [assigning, setAssigning] = useState(null); // project whose team is being edited
  const [teamKey, setTeamKey] = useState(0); // bump to refresh the team avatars on the cards

  const save = (payload) =>
    form.submit(
      () =>
        form.modal.project
          ? projectApi.update(form.modal.project.id, payload)
          : projectApi.create(payload),
      list.reload
    );

  const remove = async (p) => {
    if (!window.confirm(`Delete project "${p.name}"?`)) return;
    try {
      await projectApi.remove(p.id);
      list.afterRemove();
    } catch (e) {
      list.setError(errorMessage(e));
    }
  };

  return (
    <section>
      <div className="page-head">
        <h1>{isEmployee ? "My projects" : "Projects"}</h1>
        {isStaff && (
          <button className="btn primary" onClick={() => form.open()}>
            + Add project
          </button>
        )}
      </div>

      <div className="toolbar">
        <input type="search" placeholder="Search projects…" value={search} onChange={(e) => setSearch(e.target.value)} />
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
        <select value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="">Any status</option>
          {PROJECT_STATUSES.map((s) => (
            <option key={s.value} value={s.value}>
              {s.label}
            </option>
          ))}
        </select>
      </div>

      {list.error && <div className="alert error">{list.error}</div>}

      {list.loading && list.items.length === 0 ? (
        <p className="empty">Loading…</p>
      ) : (
        <ProjectGrid
          projects={list.items}
          teamKey={teamKey}
          companyNames={isAdmin ? companyNames : undefined}
          showBudget={!isEmployee}
          canEdit={isStaff}
          canDelete={isAdmin}
          canAssign={isStaff}
          onAssign={setAssigning}
          onEdit={(p) => form.open({ project: p })}
          onDelete={remove}
        />
      )}

      <Pagination page={list.page} hasNext={list.hasNext} onChange={list.setPage} />

      {form.modal && (
        <Modal title={form.modal.project ? "Edit project" : "Add project"} onClose={form.close}>
          <ProjectForm
            initial={form.modal.project}
            companies={companies}
            lockedCompanyId={isManager ? companyId ?? undefined : undefined}
            onSubmit={save}
            onCancel={form.close}
            submitting={form.saving}
            error={form.formError}
          />
        </Modal>
      )}

      {assigning && (
        <AssignEmployeesModal project={assigning} onClose={() => setAssigning(null)} onSaved={() => setTeamKey((k) => k + 1)} />
      )}
    </section>
  );
}
