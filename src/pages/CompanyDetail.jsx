import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import companyApi from "../api/companyApi";
import employeeApi from "../api/employeeApi";
import projectApi from "../api/projectApi";
import { errorMessage } from "../api/client";
import AssignEmployeesModal from "../components/AssignEmployeesModal";
import CompanyForm from "../components/CompanyForm";
import EmployeeForm from "../components/EmployeeForm";
import EmployeeTable from "../components/EmployeeTable";
import Modal from "../components/Modal";
import Pagination from "../components/Pagination";
import ProjectForm from "../components/ProjectForm";
import ProjectGrid from "../components/ProjectGrid";
import { useAuth } from "../context/AuthContext";
import useFormModal from "../hooks/useFormModal";
import usePagedList from "../hooks/usePagedList";
import { formatMoney } from "../utils/format";

export default function CompanyDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAdmin, isManager, employeeId } = useAuth();

  const [company, setCompany] = useState(null);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [reloadKey, setReloadKey] = useState(0);

  const employees = usePagedList((p) => companyApi.employees(id, p), [id]);
  const projects = usePagedList((p) => projectApi.list({ ...p, company_id: id }), [id]);
  const [assigning, setAssigning] = useState(null);
  const [teamKey, setTeamKey] = useState(0);
  const modal = useFormModal(); // modal.modal = { type: "company" | "employee" | "project", item? }

  useEffect(() => {
    let alive = true;
    setLoading(true);
    setError("");
    Promise.all([companyApi.get(id), companyApi.stats(id)])
      .then(([c, s]) => {
        if (!alive) return;
        setCompany(c.data);
        setStats(s.data);
      })
      .catch((e) => alive && setError(errorMessage(e)))
      .finally(() => alive && setLoading(false));
    return () => {
      alive = false;
    };
  }, [id, reloadKey]);

  const refreshAll = () => {
    setReloadKey((k) => k + 1);
    employees.reload();
    projects.reload();
  };

  const saveCompany = (payload) => modal.submit(() => companyApi.update(id, payload), refreshAll);
  const saveEmployee = (payload) =>
    modal.submit(
      () =>
        modal.modal.item
          ? employeeApi.update(modal.modal.item.id, payload)
          : employeeApi.create(payload),
      refreshAll
    );
  const saveProject = (payload) =>
    modal.submit(
      () =>
        modal.modal.item
          ? projectApi.update(modal.modal.item.id, payload)
          : projectApi.create(payload),
      refreshAll
    );

  const deleteCompany = async () => {
    if (!window.confirm(`Delete "${company.name}" and all of its employees and projects?`)) return;
    try {
      await companyApi.remove(id);
      navigate("/companies");
    } catch (e) {
      setError(errorMessage(e));
    }
  };

  const deleteEmployee = async (emp) => {
    if (!window.confirm(`Delete ${emp.first_name} ${emp.last_name}?`)) return;
    try {
      await employeeApi.remove(emp.id);
      employees.afterRemove();
      setReloadKey((k) => k + 1);
    } catch (e) {
      setError(errorMessage(e));
    }
  };

  const deleteProject = async (p) => {
    if (!window.confirm(`Delete project "${p.name}"?`)) return;
    try {
      await projectApi.remove(p.id);
      projects.afterRemove();
    } catch (e) {
      setError(errorMessage(e));
    }
  };

  if (loading && !company) return <p className="empty">Loading…</p>;
  if (!company) {
    return (
      <section>
        <div className="alert error">{error || "Company not found"}</div>
        <Link to="/companies">← Back to companies</Link>
      </section>
    );
  }

  const canEditEmployee = (e) => isAdmin || (isManager && e.id !== employeeId);

  return (
    <section>
      <Link to="/companies" className="back">
        ← Companies
      </Link>

      <div className="page-head">
        <div>
          <h1>{company.name}</h1>
          <p className="muted">
            {[company.industry, company.location, company.founded_year && `Founded ${company.founded_year}`]
              .filter(Boolean)
              .join(" · ") || "No details added"}
            {company.website && (
              <>
                {" · "}
                <a href={company.website} target="_blank" rel="noreferrer">
                  {company.website}
                </a>
              </>
            )}
          </p>
        </div>
        {isAdmin && (
          <div className="row">
            <button className="btn" onClick={() => modal.open({ type: "company" })}>
              Edit
            </button>
            <button className="btn danger" onClick={deleteCompany}>
              Delete
            </button>
          </div>
        )}
      </div>

      {error && <div className="alert error">{error}</div>}

      {stats && (
        <div className="stats">
          <div className="stat">
            <span>Total employees</span>
            <strong>{stats.total_employees}</strong>
          </div>
          <div className="stat">
            <span>Active</span>
            <strong>{stats.active_employees}</strong>
          </div>
          <div className="stat">
            <span>Average salary</span>
            <strong>{formatMoney(stats.average_salary)}</strong>
          </div>
          <div className="stat">
            <span>Total payroll</span>
            <strong>{formatMoney(stats.total_payroll)}</strong>
          </div>
        </div>
      )}

      <div className="page-head">
        <h2>Employees</h2>
        <button className="btn primary" onClick={() => modal.open({ type: "employee" })}>
          + Add employee
        </button>
      </div>
      {employees.error && <div className="alert error">{employees.error}</div>}
      <EmployeeTable
        employees={employees.items}
        canEdit={canEditEmployee}
        canDelete={canEditEmployee}
        onEdit={(emp) => modal.open({ type: "employee", item: emp })}
        onDelete={deleteEmployee}
      />
      <Pagination page={employees.page} hasNext={employees.hasNext} onChange={employees.setPage} />

      <div className="page-head section-gap">
        <h2>Projects</h2>
        <button className="btn primary" onClick={() => modal.open({ type: "project" })}>
          + Add project
        </button>
      </div>
      {projects.error && <div className="alert error">{projects.error}</div>}
      <ProjectGrid
        projects={projects.items}
        teamKey={teamKey}
        canEdit
        canAssign
        onAssign={setAssigning}
        canDelete={isAdmin}
        onEdit={(p) => modal.open({ type: "project", item: p })}
        onDelete={deleteProject}
      />
      <Pagination page={projects.page} hasNext={projects.hasNext} onChange={projects.setPage} />

      {modal.modal?.type === "company" && (
        <Modal title="Edit company" onClose={modal.close}>
          <CompanyForm
            initial={company}
            onSubmit={saveCompany}
            onCancel={modal.close}
            submitting={modal.saving}
            error={modal.formError}
          />
        </Modal>
      )}

      {modal.modal?.type === "employee" && (
        <Modal title={modal.modal.item ? "Edit employee" : "Add employee"} onClose={modal.close}>
          <EmployeeForm
            initial={modal.modal.item}
            companies={[company]}
            lockedCompanyId={company.id}
            onSubmit={saveEmployee}
            onCancel={modal.close}
            submitting={modal.saving}
            error={modal.formError}
          />
        </Modal>
      )}

      {modal.modal?.type === "project" && (
        <Modal title={modal.modal.item ? "Edit project" : "Add project"} onClose={modal.close}>
          <ProjectForm
            initial={modal.modal.item}
            companies={[company]}
            lockedCompanyId={company.id}
            onSubmit={saveProject}
            onCancel={modal.close}
            submitting={modal.saving}
            error={modal.formError}
          />
        </Modal>
      )}

      {assigning && <AssignEmployeesModal project={assigning} onClose={() => setAssigning(null)} onSaved={() => setTeamKey((k) => k + 1)} />}
    </section>
  );
}
