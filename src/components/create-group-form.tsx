"use client";

import { useState, useTransition } from "react";
import { createGroupAction } from "@/app/actions";

export function CreateGroupForm() {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(formData: FormData) {
    setError(null);
    startTransition(async () => {
      try {
        await createGroupAction(formData);
      } catch (err) {
        if (err instanceof Error && err.message === "NEXT_REDIRECT") return;
        setError(err instanceof Error ? err.message : "Could not create group");
      }
    });
  }

  return (
    <form action={handleSubmit} className="flex flex-col gap-4">
      <div>
        <label htmlFor="name" className="label mb-1.5">
          Group name
        </label>
        <input
          id="name"
          name="name"
          type="text"
          required
          placeholder="Lisbon trip"
          className="input"
        />
      </div>

      <div>
        <label htmlFor="currency" className="label mb-1.5">
          Currency
        </label>
        <select id="currency" name="currency" className="input" defaultValue="USD">
          <option value="USD">USD · $</option>
          <option value="EUR">EUR · €</option>
          <option value="GBP">GBP · £</option>
          <option value="CAD">CAD</option>
          <option value="AUD">AUD</option>
          <option value="JPY">JPY</option>
        </select>
      </div>

      <div>
        <label htmlFor="members" className="label mb-1.5">
          Members
        </label>
        <textarea
          id="members"
          name="members"
          rows={3}
          placeholder="One name per line, or comma separated"
          className="input resize-none"
        />
        <p className="mt-1 text-xs text-brand-navy/50">
          You can add more later.
        </p>
      </div>

      {error ? (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      ) : null}

      <button type="submit" disabled={pending} className="btn-primary mt-1">
        {pending ? "Creating..." : "Create group"}
      </button>
    </form>
  );
}
