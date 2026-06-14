import type { Expense, Member } from "@/lib/types";
import { formatCents } from "@/lib/money";
import { EmptyState } from "./empty-state";
import { DeleteExpenseButton } from "./delete-expense-button";

interface Props {
  groupId: string;
  expenses: Expense[];
  members: Member[];
  currency: string;
}

export function ExpenseList({ groupId, expenses, members, currency }: Props) {
  if (expenses.length === 0) {
    return (
      <EmptyState
        title="No expenses yet"
        body="Add the first one above. Balances and the settlement plan update automatically."
      />
    );
  }

  const nameById = new Map(members.map((m) => [m.id, m.name] as const));
  const memberName = (id: string) => nameById.get(id) ?? "Unknown";
  const sharerNames = (ids: string[]) =>
    ids.map(memberName).join(", ");

  return (
    <ul className="divide-y divide-brand-navy/5">
      {expenses.map((e) => (
        <li key={e.id} className="flex items-start gap-3 py-3">
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium">{e.description}</p>
            <p className="mt-0.5 text-xs text-brand-navy/60">
              Paid by {memberName(e.paidBy)}
              <span className="mx-1.5">·</span>
              split among {e.sharerIds.length}{" "}
              {e.sharerIds.length === 1 ? "person" : "people"}
              {e.sharerIds.length > 0 ? (
                <span className="text-brand-navy/50">
                  {" "}
                  ({sharerNames(e.sharerIds)})
                </span>
              ) : null}
            </p>
          </div>
          <span className="shrink-0 text-sm font-semibold tabular-nums">
            {formatCents(e.amountCents, currency)}
          </span>
          <DeleteExpenseButton groupId={groupId} expenseId={e.id} />
        </li>
      ))}
    </ul>
  );
}
