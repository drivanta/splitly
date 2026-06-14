// Pure settlement logic. No I/O, no DB.
// All amounts are integer cents.

import type { Balance, Expense, Member, Transfer } from "./types";
import { splitEqually } from "./money";

/**
 * Compute each member's balance in cents.
 * Positive means the member is owed money. Negative means they owe.
 * The sum across all balances is exactly 0.
 */
export function computeBalances(members: Member[], expenses: Expense[]): Balance[] {
  const totals = new Map<string, number>();
  for (const m of members) totals.set(m.id, 0);

  for (const e of expenses) {
    if (!totals.has(e.paidBy)) continue;
    const sharers = e.sharerIds.filter((id) => totals.has(id));
    if (sharers.length === 0) continue;

    totals.set(e.paidBy, (totals.get(e.paidBy) ?? 0) + e.amountCents);

    const shares = splitEqually(e.amountCents, sharers.length);
    for (let i = 0; i < sharers.length; i++) {
      const memberId = sharers[i];
      totals.set(memberId, (totals.get(memberId) ?? 0) - shares[i]);
    }
  }

  return members.map((m) => ({
    memberId: m.id,
    balanceCents: totals.get(m.id) ?? 0,
  }));
}

/**
 * Greedy minimum-transfers settlement.
 * Repeatedly matches the largest creditor with the largest debtor and
 * transfers the smaller of the two amounts until all balances clear.
 */
export function simplifyDebts(balances: Balance[]): Transfer[] {
  const creditors = balances
    .filter((b) => b.balanceCents > 0)
    .map((b) => ({ id: b.memberId, amount: b.balanceCents }));
  const debtors = balances
    .filter((b) => b.balanceCents < 0)
    .map((b) => ({ id: b.memberId, amount: -b.balanceCents }));

  const transfers: Transfer[] = [];

  while (creditors.length > 0 && debtors.length > 0) {
    creditors.sort((a, b) => b.amount - a.amount);
    debtors.sort((a, b) => b.amount - a.amount);

    const creditor = creditors[0];
    const debtor = debtors[0];
    const amount = Math.min(creditor.amount, debtor.amount);

    transfers.push({
      fromMemberId: debtor.id,
      toMemberId: creditor.id,
      amountCents: amount,
    });

    creditor.amount -= amount;
    debtor.amount -= amount;

    if (creditor.amount === 0) creditors.shift();
    if (debtor.amount === 0) debtors.shift();
  }

  return transfers;
}
