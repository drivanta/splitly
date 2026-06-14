import { describe, expect, it } from "vitest";
import { computeBalances, simplifyDebts } from "../src/lib/settlement";
import type { Expense, Member } from "../src/lib/types";

function member(id: string, name: string): Member {
  return { id, groupId: "g", name };
}

function expense(
  id: string,
  description: string,
  amountCents: number,
  paidBy: string,
  sharerIds: string[],
): Expense {
  return {
    id,
    groupId: "g",
    description,
    amountCents,
    paidBy,
    sharerIds,
    createdAt: 0,
  };
}

describe("computeBalances", () => {
  it("returns all zeros when there are no expenses", () => {
    const members = [member("a", "Ann"), member("b", "Bo")];
    expect(computeBalances(members, [])).toEqual([
      { memberId: "a", balanceCents: 0 },
      { memberId: "b", balanceCents: 0 },
    ]);
  });

  it("credits the payer and debits each sharer equally", () => {
    const members = [member("a", "Ann"), member("b", "Bo")];
    const expenses = [expense("e1", "Lunch", 1000, "a", ["a", "b"])];
    const balances = computeBalances(members, expenses);
    expect(balances).toEqual([
      { memberId: "a", balanceCents: 500 },
      { memberId: "b", balanceCents: -500 },
    ]);
  });

  it("distributes the remainder cent to the first sharers", () => {
    const members = [member("a", "Ann"), member("b", "Bo"), member("c", "Cy")];
    const expenses = [expense("e1", "Tacos", 1001, "a", ["a", "b", "c"])];
    const balances = computeBalances(members, expenses);
    // a paid 1001, owes 334. b owes 334. c owes 333.
    expect(balances).toEqual([
      { memberId: "a", balanceCents: 1001 - 334 },
      { memberId: "b", balanceCents: -334 },
      { memberId: "c", balanceCents: -333 },
    ]);
  });

  it("balances always sum to zero across many expenses", () => {
    const members = [
      member("a", "Ann"),
      member("b", "Bo"),
      member("c", "Cy"),
      member("d", "Di"),
    ];
    const expenses = [
      expense("e1", "Hotel", 35017, "a", ["a", "b", "c", "d"]),
      expense("e2", "Gas", 4423, "b", ["b", "c"]),
      expense("e3", "Snacks", 999, "c", ["a", "c", "d"]),
      expense("e4", "Dinner", 12300, "d", ["a", "b", "d"]),
    ];
    const sum = computeBalances(members, expenses).reduce(
      (acc, b) => acc + b.balanceCents,
      0,
    );
    expect(sum).toBe(0);
  });

  it("ignores expenses with unknown payer", () => {
    const members = [member("a", "Ann")];
    const expenses = [expense("e1", "Ghost", 500, "ghost", ["a"])];
    expect(computeBalances(members, expenses)).toEqual([
      { memberId: "a", balanceCents: 0 },
    ]);
  });
});

describe("simplifyDebts", () => {
  it("returns no transfers when all balances are zero", () => {
    expect(simplifyDebts([{ memberId: "a", balanceCents: 0 }])).toEqual([]);
  });

  it("produces a single transfer for a simple two-party debt", () => {
    const transfers = simplifyDebts([
      { memberId: "a", balanceCents: 500 },
      { memberId: "b", balanceCents: -500 },
    ]);
    expect(transfers).toEqual([
      { fromMemberId: "b", toMemberId: "a", amountCents: 500 },
    ]);
  });

  it("greedy matches largest creditor with largest debtor", () => {
    const transfers = simplifyDebts([
      { memberId: "a", balanceCents: 600 },
      { memberId: "b", balanceCents: -400 },
      { memberId: "c", balanceCents: -200 },
    ]);
    expect(transfers).toContainEqual({
      fromMemberId: "b",
      toMemberId: "a",
      amountCents: 400,
    });
    expect(transfers).toContainEqual({
      fromMemberId: "c",
      toMemberId: "a",
      amountCents: 200,
    });
    expect(transfers).toHaveLength(2);
  });

  it("clears all debts and conserves total amount", () => {
    const balances = [
      { memberId: "a", balanceCents: 900 },
      { memberId: "b", balanceCents: 100 },
      { memberId: "c", balanceCents: -250 },
      { memberId: "d", balanceCents: -750 },
    ];
    const transfers = simplifyDebts(balances);
    const inflow = new Map<string, number>();
    const outflow = new Map<string, number>();
    for (const t of transfers) {
      inflow.set(t.toMemberId, (inflow.get(t.toMemberId) ?? 0) + t.amountCents);
      outflow.set(
        t.fromMemberId,
        (outflow.get(t.fromMemberId) ?? 0) + t.amountCents,
      );
    }
    for (const b of balances) {
      const net = (inflow.get(b.memberId) ?? 0) - (outflow.get(b.memberId) ?? 0);
      expect(net).toBe(b.balanceCents);
    }
  });

  it("uses at most N-1 transfers for N non-zero participants", () => {
    const balances = [
      { memberId: "a", balanceCents: 300 },
      { memberId: "b", balanceCents: 300 },
      { memberId: "c", balanceCents: -200 },
      { memberId: "d", balanceCents: -400 },
    ];
    const transfers = simplifyDebts(balances);
    expect(transfers.length).toBeLessThanOrEqual(3);
  });
});
