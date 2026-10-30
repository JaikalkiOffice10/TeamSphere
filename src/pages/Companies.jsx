import { useState } from "react";
import { Link } from "react-router-dom";
import companyApi from "../api/companyApi";
import { errorMessage } from "../api/client";
import CompanyForm from "../components/CompanyForm";
import Modal from "../components/Modal";
import Pagination from "../components/Pagination";
import { useAuth } from "../context/AuthContext";
import useDebounce from "../hooks/useDebounce";
import useFormModal from "../hooks/useFormModal";
import usePagedList from "../hooks/usePagedList";

export default function Companies() {
  const { isAdmin } = useAuth(); // managers only see their own company and can't change it
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search);

  const list = usePagedList(
    (p) => companyApi.list({ ...p, search: debouncedSearch || undefined }),
    [debouncedSearch]
  );
  const form = useFormModal();

  const save = (payload) =>
    form.submit(
      () =>
        form.modal.company
          ? companyApi.update(form.modal.company.id, payload)
          : companyApi.create(payload),
      list.reload
    );

  const remove = async (company) => {
    if (!window.confirm(`Delete "${company.name}" and all of its employees and projects?`)) return;
    try {
      await companyApi.remove(company.id);
      list.afterRemove();
    } catch (e) {
      list.setError(errorMessage(e));
    }
  };

  return (
    <section>
      <div className="page-head">
        <h1>Companies</h1>
        {isAdmin && (
          <button className="btn primary" onClick={() => form.open()}>
            + Add company
          </button>
        )}
      </div>

      <div className="toolbar">
        <input
          type="search"
          placeholder="Search companies…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {list.error && <div className="alert error">{list.error}</div>}

      {list.loading && list.items.length === 0 ? (
        <p className="empty">Loading…</p>
      ) : list.items.length === 0 ? (
        <p className="empty">No companies found.</p>
      ) : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Industry</th>
                <th>Location</th>
                <th>Founded</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {list.items.map((c) => (
                <tr key={c.id}>
                  <td>
                    <Link className="strong" to={`/companies/${c.id}`}>
                      {c.name}
                    </Link>
                    {c.website && <div className="muted small">{c.website}</div>}
                  </td>
                  <td>{c.industry || "—"}</td>
                  <td>{c.location || "—"}</td>
                  <td>{c.founded_year || "—"}</td>
                  <td className="actions">
                    <Link className="btn small" to={`/companies/${c.id}`}>
                      View
                    </Link>
                    {isAdmin && (
                      <>
                        <button className="btn small" onClick={() => form.open({ company: c })}>
                          Edit
                        </button>
                        <button className="btn small danger" onClick={() => remove(c)}>
                          Delete
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Pagination page={list.page} hasNext={list.hasNext} onChange={list.setPage} />

      {form.modal && (
        <Modal title={form.modal.company ? "Edit company" : "Add company"} onClose={form.close}>
          <CompanyForm
            initial={form.modal.company}
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
