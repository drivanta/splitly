"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import {
  addExpense as addExpenseQuery,
  addMember as addMemberQuery,
  clearGroup as clearGroupQuery,
  createGroup as createGroupQuery,
  deleteExpense as deleteExpenseQuery,
} from "@/lib/queries";
import { parseAmountToCents } from "@/lib/money";

export async function createGroupAction(formData: FormData): Promise<void> {
  const name = String(formData.get("name") ?? "").trim();
  const currency = String(formData.get("currency") ?? "USD").trim().toUpperCase();
  const membersRaw = String(formData.get("members") ?? "");

  if (name === "") {
    throw new Error("Group name is required");
  }

  const memberNames = membersRaw
    .split(/[\n,]/)
    .map((s) => s.trim())
    .filter((s) => s !== "");

  const id = createGroupQuery({
    name,
    currency: currency || "USD",
    memberNames,
  });

  redirect(`/g/${id}`);
}

export async function addMemberAction(formData: FormData): Promise<void> {
  const groupId = String(formData.get("groupId") ?? "");
  const name = String(formData.get("name") ?? "").trim();
  if (groupId === "" || name === "") {
    throw new Error("Group id and member name are required");
  }
  addMemberQuery(groupId, name);
  revalidatePath(`/g/${groupId}`);
}

export async function addExpenseAction(formData: FormData): Promise<void> {
  const groupId = String(formData.get("groupId") ?? "");
  const description = String(formData.get("description") ?? "").trim();
  const amount = String(formData.get("amount") ?? "");
  const paidBy = String(formData.get("paidBy") ?? "");
  const sharerIds = formData.getAll("sharerIds").map(String).filter((s) => s !== "");

  if (groupId === "" || description === "" || paidBy === "") {
    throw new Error("Description, payer, and group are required");
  }
  const amountCents = parseAmountToCents(amount);
  if (amountCents === null || amountCents === 0) {
    throw new Error("Amount must be a positive number");
  }
  if (sharerIds.length === 0) {
    throw new Error("Pick at least one sharer");
  }

  addExpenseQuery({
    groupId,
    description,
    amountCents,
    paidBy,
    sharerIds,
  });
  revalidatePath(`/g/${groupId}`);
}

export async function deleteExpenseAction(formData: FormData): Promise<void> {
  const groupId = String(formData.get("groupId") ?? "");
  const expenseId = String(formData.get("expenseId") ?? "");
  if (groupId === "" || expenseId === "") {
    throw new Error("Group id and expense id are required");
  }
  deleteExpenseQuery(expenseId);
  revalidatePath(`/g/${groupId}`);
}

export async function clearGroupAction(formData: FormData): Promise<void> {
  const groupId = String(formData.get("groupId") ?? "");
  if (groupId === "") {
    throw new Error("Group id is required");
  }
  clearGroupQuery(groupId);
  revalidatePath(`/g/${groupId}`);
}
