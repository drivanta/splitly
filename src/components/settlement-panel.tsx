"use client";

import { useState } from "react";
import { jsPDF } from "jspdf";
import type { Member, Transfer } from "@/lib/types";
import { formatCents } from "@/lib/money";
import { EmptyState } from "./empty-state";

interface Props {
  groupName: string;
  members: Member[];
  transfers: Transfer[];
  currency: string;
}

function buildPlainText(
  groupName: string,
  members: Member[],
  transfers: Transfer[],
  currency: string,
): string {
  const memberName = (id: string) =>
    members.find((m) => m.id === id)?.name ?? "Unknown";
  const lines = [`Settlement plan for ${groupName}`, ""];
  if (transfers.length === 0) {
    lines.push("Everyone is settled. No transfers needed.");
  } else {
    for (const t of transfers) {
      lines.push(
        `${memberName(t.fromMemberId)} pays ${memberName(t.toMemberId)} ${formatCents(t.amountCents, currency)}`,
      );
    }
    const total = transfers.reduce((acc, t) => acc + t.amountCents, 0);
    lines.push("");
    lines.push(`Total moved: ${formatCents(total, currency)}`);
    lines.push(`Transfers: ${transfers.length}`);
  }
  return lines.join("\n");
}

export function SettlementPanel({
  groupName,
  members,
  transfers,
  currency,
}: Props) {
  const [copied, setCopied] = useState(false);

  const memberName = (id: string) =>
    members.find((m) => m.id === id)?.name ?? "Unknown";

  async function handleCopy() {
    const text = buildPlainText(groupName, members, transfers, currency);
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // ignore clipboard errors
    }
  }

  function handlePdf() {
    const doc = new jsPDF({ unit: "pt", format: "letter" });
    const marginX = 56;
    let y = 64;

    doc.setFontSize(20);
    doc.text(`splitly · ${groupName}`, marginX, y);
    y += 28;

    doc.setFontSize(12);
    doc.setTextColor(90);
    doc.text("Settlement plan", marginX, y);
    y += 24;
    doc.setTextColor(0);

    if (transfers.length === 0) {
      doc.setFontSize(12);
      doc.text("Everyone is settled. No transfers needed.", marginX, y);
    } else {
      doc.setFontSize(12);
      for (const t of transfers) {
        const line = `${memberName(t.fromMemberId)} pays ${memberName(t.toMemberId)}: ${formatCents(t.amountCents, currency)}`;
        doc.text(line, marginX, y);
        y += 20;
        if (y > 720) {
          doc.addPage();
          y = 64;
        }
      }
      const total = transfers.reduce((acc, t) => acc + t.amountCents, 0);
      y += 16;
      doc.setFontSize(11);
      doc.setTextColor(90);
      doc.text(`Total moved: ${formatCents(total, currency)}`, marginX, y);
      y += 16;
      doc.text(`Transfers: ${transfers.length}`, marginX, y);
    }

    const safeName = groupName.replace(/[^a-z0-9-_]+/gi, "-").toLowerCase();
    doc.save(`splitly-${safeName || "settlement"}.pdf`);
  }

  return (
    <section className="card">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-base font-semibold">Settlement</h2>
        {transfers.length > 0 ? (
          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleCopy}
              className="btn-secondary px-3 py-1.5 text-xs"
            >
              {copied ? "Copied" : "Copy"}
            </button>
            <button
              type="button"
              onClick={handlePdf}
              className="btn-secondary px-3 py-1.5 text-xs"
            >
              PDF
            </button>
          </div>
        ) : null}
      </div>

      {transfers.length === 0 ? (
        <EmptyState
          title="Nothing to settle"
          body="Add expenses to see the minimum set of transfers that clears every debt."
        />
      ) : (
        <ul className="space-y-2">
          {transfers.map((t, i) => (
            <li
              key={i}
              className="flex items-center justify-between rounded-xl bg-brand-navy/5 px-4 py-3"
            >
              <div className="text-sm">
                <span className="font-semibold">{memberName(t.fromMemberId)}</span>
                <span className="mx-2 text-brand-navy/50">pays</span>
                <span className="font-semibold">{memberName(t.toMemberId)}</span>
              </div>
              <span className="text-sm font-semibold tabular-nums">
                {formatCents(t.amountCents, currency)}
              </span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
