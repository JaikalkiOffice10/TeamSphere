import { useState } from "react";
import { errorMessage } from "../api/client";

/**
 * State for a create/edit modal.
 *   open({ item })  -> opens the modal and remembers `item` (omit for "create")
 *   submit(() => api.call(), onDone) -> runs the call, closes on success, shows the error on failure
 */
export default function useFormModal() {
  const [modal, setModal] = useState(null); // null = closed
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");

  const open = (data = {}) => {
    setFormError("");
    setModal(data);
  };
  const close = () => setModal(null);

  const submit = async (action, onDone) => {
    setSaving(true);
    setFormError("");
    try {
      await action();
      setModal(null);
      onDone?.();
    } catch (e) {
      setFormError(errorMessage(e));
    } finally {
      setSaving(false);
    }
  };

  return { modal, open, close, saving, formError, submit };
}
