import type { Expense, Member } from "@/lib/types";
import { formatCents } from "@/lib/money";
import { EmptyState } from "./empty-state";

interface Props {
  expenses: Expense[];
  members: Member[];
  currency: string;
}

export function ExpenseList({ expenses, members, currency }: Props) {
  if (expenses.length === 0) {
    return (
      <EmptyState
        title="No expenses yet"
        body="Add the first one above. Balances and the settlement plan update automatically."
      />
    );
  }

  const memberName = (id: string) =>
    members.find((m) => m.id === id)?.name ?? "Unknown";

  return (
    <ul className="divide-y divide-brand-navy/5">
      {expenses.map((e) => (
        <li key={e.id} className="flex items-start justify-between gap-4 py-3">
          <div className="min-w-0">
            <p className="truncate text-sm font-medium">{e.description}</p>
            <p className="mt-0.5 text-xs text-brand-navy/60">
              Paid by {memberName(e.paidBy)}
              <span className="mx-1.5">·</span>
              split among {e.sharerIds.length}{" "}
              {e.sharerIds.length === 1 ? "person" : "people"}
            </p>
          </div>
          <span className="shrink-0 text-sm font-semibold tabular-nums">
            {formatCents(e.amountCents, currency)}
          </span>
        </li>
      ))}
    </ul>
  );
}
