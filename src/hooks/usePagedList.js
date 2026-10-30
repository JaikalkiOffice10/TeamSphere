import { useEffect, useState } from "react";
import { errorMessage } from "../api/client";

/**
 * Loads a paginated list. The API has no total count, so we ask for one extra
 * row to know whether a next page exists.
 *
 *   const list = usePagedList((p) => companyApi.list({ ...p, search }), [search]);
 *
 * `deps` are the filter values; when they change the list goes back to page 1.
 */
export default function usePagedList(fetcher, deps = [], pageSize = 10) {
  const key = JSON.stringify(deps);
  const [pageState, setPageState] = useState({ key, page: 0 });
  const page = pageState.key === key ? pageState.page : 0; // filters changed -> page 0
  const setPage = (p) => setPageState({ key, page: p });

  const [items, setItems] = useState([]);
  const [hasNext, setHasNext] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let alive = true;
    setLoading(true);
    setError("");
    fetcher({ skip: page * pageSize, limit: pageSize + 1 })
      .then((res) => {
        if (!alive) return;
        setHasNext(res.data.length > pageSize);
        setItems(res.data.slice(0, pageSize));
      })
      .catch((e) => alive && setError(errorMessage(e)))
      .finally(() => alive && setLoading(false));
    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, page, reloadKey]);

  const reload = () => setReloadKey((k) => k + 1);

  // After deleting the last row of a page, step back one page
  const afterRemove = () => {
    if (items.length === 1 && page > 0) setPage(page - 1);
    else reload();
  };

  return { items, hasNext, loading, error, setError, page, setPage, reload, afterRemove };
}
