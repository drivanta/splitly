"use client";

import { useEffect, useState, useTransition } from "react";
import { clearGroupAction } from "@/app/actions";

export function ClearGroupButton({ groupId }: { groupId: string }) {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  // Close the dialog on Escape so a stray keypress does not strand it open.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !pending) setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, pending]);

  function confirmClear() {
    setError(null);
    const formData = new FormData();
    formData.set("groupId", groupId);
    startTransition(async () => {
      try {
        await clearGroupAction(formData);
        setOpen(false);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Could not clear group");
      }
    });
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center justify-center rounded-lg border border-red-200 bg-white px-4 py-2.5 text-sm font-medium text-red-700 shadow-sm transition hover:bg-red-50"
      >
        Clear group
      </button>

      {open ? (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="clear-group-title"
          className="fixed inset-0 z-50 flex items-end justify-center bg-brand-navy/50 p-4 sm:items-center"
          onClick={(e) => {
            if (e.target === e.currentTarget && !pending) setOpen(false);
          }}
        >
          <div className="w-full max-w-sm rounded-2xl bg-white p-5 shadow-xl">
            <h3
              id="clear-group-title"
              className="text-base font-semibold text-brand-navy"
            >
              Clear this group?
            </h3>
            <p className="mt-2 text-sm text-brand-navy/70">
              This removes all expenses and members. This cannot be undone.
              The group link stays the same.
            </p>

            {error ? (
              <p className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
                {error}
              </p>
            ) : null}

            <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => setOpen(false)}
                disabled={pending}
                className="btn-secondary"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmClear}
                disabled={pending}
                className="inline-flex items-center justify-center rounded-lg bg-red-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition active:scale-[0.98] hover:bg-red-700 disabled:opacity-50 disabled:pointer-events-none"
              >
                {pending ? "Clearing..." : "Clear"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
