"use client";

import { useState } from "react";

export function ShareButton({ groupId }: { groupId: string }) {
  const [copied, setCopied] = useState(false);

  async function handleClick() {
    const url =
      typeof window !== "undefined" ? window.location.href : `/g/${groupId}`;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // ignore clipboard errors
    }
  }

  return (
    <button type="button" onClick={handleClick} className="btn-primary">
      {copied ? "Link copied" : "Share group"}
    </button>
  );
}
