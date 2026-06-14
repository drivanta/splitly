"use client";

import { useRef, useState, useTransition } from "react";
import { addExpenseAction } from "@/app/actions";
import type { Member } from "@/lib/types";

interface Props {
  groupId: string;
  members: Member[];
}

export function AddExpenseForm({ groupId, members }: Props) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [sharers, setSharers] = useState<Set<string>>(
    () => new Set(members.map((m) => m.id)),
  );
  const formRef = useRef<HTMLFormElement>(null);

  function toggleSharer(id: string) {
    setSharers((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function selectAll() {
    setSharers(new Set(members.map((m) => m.id)));
  }

  function selectNone() {
    setSharers(new Set());
  }

  function handleSubmit(formData: FormData) {
    setError(null);
    formData.delete("sharerIds");
    for (const id of sharers) formData.append("sharerIds", id);
    startTransition(async () => {
      try {
        await addExpenseAction(formData);
        formRef.current?.reset();
        setSharers(new Set(members.map((m) => m.id)));
      } catch (err) {
        setError(err instanceof Error ? err.message : "Could not add expense");
      }
    });
  }

  return (
    <form ref={formRef} action={handleSubmit} className="flex flex-col gap-4">
      <input type="hidden" name="groupId" value={groupId} />

      <div>
        <label htmlFor="description" className="label mb-1.5">
          What was it for?
        </label>
        <input
          id="description"
          name="description"
          type="text"
          required
          placeholder="Dinner, taxi, groceries..."
          className="input"
        />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="amount" className="label mb-1.5">
            Amount
          </label>
          <input
            id="amount"
            name="amount"
            type="text"
            inputMode="decimal"
            required
            placeholder="0.00"
            className="input"
          />
        </div>
        <div>
          <label htmlFor="paidBy" className="label mb-1.5">
            Paid by
          </label>
          <select
            id="paidBy"
            name="paidBy"
            required
            defaultValue={members[0]?.id ?? ""}
            className="input"
          >
            {members.map((m) => (
              <option key={m.id} value={m.id}>
                {m.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <div className="mb-1.5 flex items-center justify-between">
          <span className="label">Split between</span>
          <div className="flex gap-3 text-xs">
            <button
              type="button"
              onClick={selectAll}
              className="font-medium text-brand-navy/70 hover:text-brand-navy"
            >
              All
            </button>
            <button
              type="button"
              onClick={selectNone}
              className="font-medium text-brand-navy/70 hover:text-brand-navy"
            >
              None
            </button>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          {members.map((m) => {
            const active = sharers.has(m.id);
            return (
              <button
                key={m.id}
                type="button"
                onClick={() => toggleSharer(m.id)}
                className={`rounded-full border px-3 py-1.5 text-sm transition ${
                  active
                    ? "border-brand-teal bg-brand-teal/20 font-medium text-brand-navy"
                    : "border-brand-navy/15 bg-white text-brand-navy/70 hover:border-brand-navy/30"
                }`}
              >
                {m.name}
              </button>
            );
          })}
        </div>
      </div>

      {error ? (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      ) : null}

      <button type="submit" disabled={pending} className="btn-primary">
        {pending ? "Adding..." : "Add expense"}
      </button>
    </form>
  );
}
