import { useEffect, useRef } from 'react';

type ConfirmDialogProps = {
  open: boolean;
  title: string;
  description: string;
  confirmLabel: string;
  busy?: boolean;
  onConfirm: () => void;
  onClose: () => void;
};

export function ConfirmDialog({ open, title, description, confirmLabel, busy = false, onConfirm, onClose }: ConfirmDialogProps) {
  const cancelButton = useRef<HTMLButtonElement>(null);
  const previouslyFocused = useRef<HTMLElement | null>(null);
  const closeRef = useRef(onClose);
  closeRef.current = onClose;

  useEffect(() => {
    if (!open) return;
    previouslyFocused.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    cancelButton.current?.focus();
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') closeRef.current();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => { window.removeEventListener('keydown', onKeyDown); previouslyFocused.current?.focus(); };
  }, [open]);

  if (!open) return null;
  return <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4" onMouseDown={onClose}>
    <section role="dialog" aria-modal="true" aria-labelledby="confirm-dialog-title" className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl" onMouseDown={(event) => event.stopPropagation()}>
      <h2 id="confirm-dialog-title" className="text-xl font-bold text-brand-dark">{title}</h2>
      <p className="mt-2 text-slate-700">{description}</p>
      <div className="mt-6 flex justify-end gap-3">
        <button ref={cancelButton} type="button" onClick={onClose} disabled={busy} className="rounded border border-slate-300 px-4 py-2 font-semibold text-slate-700">Cancel</button>
        <button type="button" onClick={onConfirm} disabled={busy} className="rounded bg-brand-dark px-4 py-2 font-semibold text-white disabled:opacity-60">{busy ? 'Purchasing…' : confirmLabel}</button>
      </div>
    </section>
  </div>;
}
