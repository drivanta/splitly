import { notFound } from "next/navigation";
import Link from "next/link";
import {
  getExpenses,
  getGroup,
  getMembers,
} from "@/lib/queries";
import { computeBalances, simplifyDebts } from "@/lib/settlement";
import { AddExpenseForm } from "@/components/add-expense-form";
import { AddMemberForm } from "@/components/add-member-form";
import { ExpenseList } from "@/components/expense-list";
import { BalancesPanel } from "@/components/balances-panel";
import { SettlementPanel } from "@/components/settlement-panel";
import { ShareButton } from "@/components/share-button";
import { ClearGroupButton } from "@/components/clear-group-button";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export default function GroupPage({
  params,
}: {
  params: { groupId: string };
}) {
  const group = getGroup(params.groupId);
  if (!group) notFound();

  const members = getMembers(group.id);
  const expenses = getExpenses(group.id);
  const balances = computeBalances(members, expenses);
  const transfers = simplifyDebts(balances);

  return (
    <main className="mx-auto flex min-h-screen max-w-3xl flex-col gap-6 px-4 pb-24 pt-8 sm:px-6 sm:pt-12">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <Link
            href="/"
            className="mb-2 inline-block text-xs font-medium text-brand-navy/60 hover:text-brand-navy"
          >
            &larr; splitly
          </Link>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
            {group.name}
          </h1>
          <p className="mt-1 text-sm text-brand-navy/60">
            {members.length} {members.length === 1 ? "member" : "members"}
            <span className="mx-2">·</span>
            {group.currency}
          </p>
        </div>
        <ShareButton groupId={group.id} />
      </header>

      <section className="card">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-base font-semibold">Members</h2>
        </div>
        {members.length === 0 ? (
          <p className="text-sm text-brand-navy/60">No members yet.</p>
        ) : (
          <ul className="mb-4 flex flex-wrap gap-2">
            {members.map((m) => (
              <li
                key={m.id}
                className="rounded-full bg-brand-navy/5 px-3 py-1 text-sm"
              >
                {m.name}
              </li>
            ))}
          </ul>
        )}
        <AddMemberForm groupId={group.id} />
      </section>

      <section className="card">
        <h2 className="mb-4 text-base font-semibold">Add an expense</h2>
        {members.length < 1 ? (
          <p className="text-sm text-brand-navy/60">
            Add at least one member before logging expenses.
          </p>
        ) : (
          <AddExpenseForm groupId={group.id} members={members} />
        )}
      </section>

      <BalancesPanel
        members={members}
        balances={balances}
        currency={group.currency}
      />

      <SettlementPanel
        groupName={group.name}
        members={members}
        expenses={expenses}
        balances={balances}
        transfers={transfers}
        currency={group.currency}
      />

      <section className="card">
        <h2 className="mb-4 text-base font-semibold">Expenses</h2>
        <ExpenseList
          groupId={group.id}
          members={members}
          expenses={expenses}
          currency={group.currency}
        />
      </section>

      <div className="mt-2 flex justify-center pt-2">
        <ClearGroupButton groupId={group.id} />
      </div>
    </main>
  );
}
