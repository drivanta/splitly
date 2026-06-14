import { nanoid } from "nanoid";
import { getDb } from "./db";
import type { Expense, Group, Member } from "./types";

interface GroupRow {
  id: string;
  name: string;
  currency: string;
  created_at: number;
}

interface MemberRow {
  id: string;
  group_id: string;
  name: string;
}

interface ExpenseRow {
  id: string;
  group_id: string;
  description: string;
  amount_cents: number;
  paid_by: string;
  created_at: number;
}

interface ShareRow {
  expense_id: string;
  member_id: string;
}

function groupFromRow(row: GroupRow): Group {
  return {
    id: row.id,
    name: row.name,
    currency: row.currency,
    createdAt: row.created_at,
  };
}

function memberFromRow(row: MemberRow): Member {
  return { id: row.id, groupId: row.group_id, name: row.name };
}

/** Create a new group with its initial members. Returns the new group id. */
export function createGroup(input: {
  name: string;
  currency: string;
  memberNames: string[];
}): string {
  const db = getDb();
  const id = nanoid(10);
  const now = Date.now();

  const insertGroup = db.prepare(
    "INSERT INTO groups (id, name, currency, created_at) VALUES (?, ?, ?, ?)",
  );
  const insertMember = db.prepare(
    "INSERT INTO members (id, group_id, name) VALUES (?, ?, ?)",
  );

  const tx = db.transaction(() => {
    insertGroup.run(id, input.name, input.currency, now);
    for (const name of input.memberNames) {
      const trimmed = name.trim();
      if (trimmed === "") continue;
      insertMember.run(nanoid(10), id, trimmed);
    }
  });
  tx();
  return id;
}

export function getGroup(groupId: string): Group | null {
  const row = getDb()
    .prepare("SELECT id, name, currency, created_at FROM groups WHERE id = ?")
    .get(groupId) as GroupRow | undefined;
  return row ? groupFromRow(row) : null;
}

export function getMembers(groupId: string): Member[] {
  const rows = getDb()
    .prepare("SELECT id, group_id, name FROM members WHERE group_id = ? ORDER BY name")
    .all(groupId) as MemberRow[];
  return rows.map(memberFromRow);
}

export function addMember(groupId: string, name: string): Member {
  const trimmed = name.trim();
  if (trimmed === "") {
    throw new Error("Member name is required");
  }
  const id = nanoid(10);
  getDb()
    .prepare("INSERT INTO members (id, group_id, name) VALUES (?, ?, ?)")
    .run(id, groupId, trimmed);
  return { id, groupId, name: trimmed };
}

export function addExpense(input: {
  groupId: string;
  description: string;
  amountCents: number;
  paidBy: string;
  sharerIds: string[];
}): string {
  if (input.sharerIds.length === 0) {
    throw new Error("At least one sharer is required");
  }
  const db = getDb();
  const id = nanoid(10);
  const now = Date.now();

  const insertExpense = db.prepare(
    "INSERT INTO expenses (id, group_id, description, amount_cents, paid_by, created_at) VALUES (?, ?, ?, ?, ?, ?)",
  );
  const insertShare = db.prepare(
    "INSERT INTO expense_shares (expense_id, member_id) VALUES (?, ?)",
  );

  const tx = db.transaction(() => {
    insertExpense.run(
      id,
      input.groupId,
      input.description,
      input.amountCents,
      input.paidBy,
      now,
    );
    for (const memberId of input.sharerIds) {
      insertShare.run(id, memberId);
    }
  });
  tx();
  return id;
}

/**
 * Delete a single expense and its share rows. Expense_shares cascade via
 * the schema's ON DELETE CASCADE.
 */
export function deleteExpense(expenseId: string): void {
  getDb().prepare("DELETE FROM expenses WHERE id = ?").run(expenseId);
}

/**
 * Remove every expense and member for a group. The group row itself stays
 * so the shareable link is preserved. Expense_shares cascade via the schema.
 */
export function clearGroup(groupId: string): void {
  const db = getDb();
  const deleteExpenses = db.prepare("DELETE FROM expenses WHERE group_id = ?");
  const deleteMembers = db.prepare("DELETE FROM members WHERE group_id = ?");
  const tx = db.transaction(() => {
    deleteExpenses.run(groupId);
    deleteMembers.run(groupId);
  });
  tx();
}

/** Return all expenses for a group, newest first, each with its sharer ids. */
export function getExpenses(groupId: string): Expense[] {
  const db = getDb();
  const expenseRows = db
    .prepare(
      "SELECT id, group_id, description, amount_cents, paid_by, created_at FROM expenses WHERE group_id = ? ORDER BY created_at DESC",
    )
    .all(groupId) as ExpenseRow[];

  if (expenseRows.length === 0) return [];

  const ids = expenseRows.map((r) => r.id);
  const placeholders = ids.map(() => "?").join(",");
  const shareRows = db
    .prepare(
      `SELECT expense_id, member_id FROM expense_shares WHERE expense_id IN (${placeholders})`,
    )
    .all(...ids) as ShareRow[];

  const sharers = new Map<string, string[]>();
  for (const s of shareRows) {
    const list = sharers.get(s.expense_id);
    if (list) list.push(s.member_id);
    else sharers.set(s.expense_id, [s.member_id]);
  }

  return expenseRows.map((r) => ({
    id: r.id,
    groupId: r.group_id,
    description: r.description,
    amountCents: r.amount_cents,
    paidBy: r.paid_by,
    createdAt: r.created_at,
    sharerIds: sharers.get(r.id) ?? [],
  }));
}
