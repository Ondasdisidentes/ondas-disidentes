"use client";

import { useEffect } from "react";
import { cx } from "./shared";

export function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = "Eliminar",
  cancelLabel = "Cancelar",
  danger = true,
  pending = false,
  onConfirm,
  onCancel,
}: {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  danger?: boolean;
  pending?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  useEffect(() => {
    if (!open) return;
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onCancel();
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open, onCancel]);

  if (!open) return null;

  return (
    <div className="admin__modal-backdrop" onClick={onCancel}>
      <div
        className="admin__modal"
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="admin-modal-title"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 id="admin-modal-title" className={cx("admin__heading", "admin__modal-title")}>
          {title}
        </h3>
        <p className="admin__modal-msg">{message}</p>
        <div className="admin__modal-actions">
          <button type="button" className="admin__btn admin__btn--ghost" onClick={onCancel} disabled={pending}>
            {cancelLabel}
          </button>
          <button
            type="button"
            className={cx("admin__btn", danger && "admin__btn--danger")}
            onClick={onConfirm}
            disabled={pending}
          >
            {pending ? "Eliminando…" : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
