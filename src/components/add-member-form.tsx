"use client";

import { useRef, useState, useTransition } from "react";
import { addMemberAction } from "@/app/actions";

export function AddMemberForm({ groupId }: { groupId: string }) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const formRef = useRef<HTMLFormElement>(null);

  function handleSubmit(formData: FormData) {
    setError(null);
    startTransition(async () => {
      try {
        await addMemberAction(formData);
        formRef.current?.reset();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Could not add member");
      }
    });
  }

  return (
    <form
      ref={formRef}
      action={handleSubmit}
      className="flex flex-col gap-2 sm:flex-row"
    >
      <input type="hidden" name="groupId" value={groupId} />
      <input
        name="name"
        type="text"
        required
        placeholder="Add a member"
        className="input sm:flex-1"
      />
      <button type="submit" disabled={pending} className="btn-secondary">
        {pending ? "Adding..." : "Add"}
      </button>
      {error ? (
        <p className="text-sm text-red-700 sm:basis-full">{error}</p>
      ) : null}
    </form>
  );
}
