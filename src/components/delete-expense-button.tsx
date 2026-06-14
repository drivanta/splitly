"use client";

import { useTransition } from "react";
import { deleteExpenseAction } from "@/app/actions";

interface Props {
  groupId: string;
  expenseId: string;
}

// Intentionally has no confirmation. Quick removal for mistaken entries.
export function DeleteExpenseButton({ groupId, expenseId }: Props) {
  const [pending, startTransition] = useTransition();

  function handleClick() {
    const formData = new FormData();
    formData.set("groupId", groupId);
    formData.set("expenseId", expenseId);
    startTransition(async () => {
      try {
        await deleteExpenseAction(formData);
      } catch {
        // ignore: revalidation will refresh the list
      }
    });
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={pending}
      aria-label="Delete expense"
      title="Delete expense"
      className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-brand-navy/40 transition hover:bg-red-50 hover:text-red-600 disabled:opacity-40"
    >
      <svg
        viewBox="0 0 20 20"
        fill="currentColor"
        aria-hidden="true"
        className="h-3.5 w-3.5"
      >
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M5.28 4.22a.75.75 0 011.06 0L10 7.88l3.66-3.66a.75.75 0 111.06 1.06L11.06 8.94l3.66 3.66a.75.75 0 11-1.06 1.06L10 10l-3.66 3.66a.75.75 0 11-1.06-1.06l3.66-3.66-3.66-3.66a.75.75 0 010-1.06z"
        />
      </svg>
    </button>
  );
}
