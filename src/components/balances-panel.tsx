import type { Balance, Member } from "@/lib/types";
import { formatCents } from "@/lib/money";
import { EmptyState } from "./empty-state";

interface Props {
  members: Member[];
  balances: Balance[];
  currency: string;
}

export function BalancesPanel({ members, balances, currency }: Props) {
  const hasActivity = balances.some((b) => b.balanceCents !== 0);

  return (
    <section className="card">
      <h2 className="mb-4 text-base font-semibold">Balances</h2>
      {!hasActivity ? (
        <EmptyState
          title="All settled"
          body="Once expenses come in, each member's balance will appear here."
        />
      ) : (
        <ul className="divide-y divide-brand-navy/5">
          {balances.map((b) => {
            const member = members.find((m) => m.id === b.memberId);
            const owed = b.balanceCents > 0;
            const owes = b.balanceCents < 0;
            const tone = owed
              ? "text-emerald-700"
              : owes
                ? "text-red-700"
                : "text-brand-navy/60";
            const label = owed ? "is owed" : owes ? "owes" : "is settled";
            return (
              <li
                key={b.memberId}
                className="flex items-center justify-between py-3"
              >
                <div>
                  <p className="text-sm font-medium">{member?.name ?? "Unknown"}</p>
                  <p className="text-xs text-brand-navy/60">{label}</p>
                </div>
                <span className={`text-sm font-semibold tabular-nums ${tone}`}>
                  {formatCents(Math.abs(b.balanceCents), currency)}
                </span>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
