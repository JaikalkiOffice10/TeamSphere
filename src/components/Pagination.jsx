export default function Pagination({ page, hasNext, onChange }) {
  if (page === 0 && !hasNext) return null;
  return (
    <div className="pagination">
      <button className="btn" disabled={page === 0} onClick={() => onChange(page - 1)}>
        Previous
      </button>
      <span>Page {page + 1}</span>
      <button className="btn" disabled={!hasNext} onClick={() => onChange(page + 1)}>
        Next
      </button>
    </div>
  );
}
