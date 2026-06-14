"use client";

import { useState } from "react";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import type { Balance, Expense, Member, Transfer } from "@/lib/types";
import { formatCents } from "@/lib/money";
import { EmptyState } from "./empty-state";

interface Props {
  groupName: string;
  members: Member[];
  expenses: Expense[];
  balances: Balance[];
  transfers: Transfer[];
  currency: string;
}

const BRAND_NAVY: [number, number, number] = [10, 22, 40];
const BRAND_TEAL: [number, number, number] = [0, 212, 170];
const TEXT_MUTED: [number, number, number] = [90, 100, 115];
const BORDER: [number, number, number] = [225, 230, 235];

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

function formatDate(d: Date): string {
  const months = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
  ];
  const day = d.getDate();
  const month = months[d.getMonth()];
  const year = d.getFullYear();
  return `${month} ${day}, ${year}`;
}

export function SettlementPanel({
  groupName,
  members,
  expenses,
  balances,
  transfers,
  currency,
}: Props) {
  const [copied, setCopied] = useState(false);

  const memberName = (id: string) =>
    members.find((m) => m.id === id)?.name ?? "Unknown";
  const sharerList = (ids: string[]) =>
    ids.map(memberName).join(", ");

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
    const pageWidth = doc.internal.pageSize.getWidth();
    const marginX = 48;
    let y = 56;

    // Brand wordmark
    doc.setFont("helvetica", "bold");
    doc.setFontSize(20);
    doc.setTextColor(BRAND_NAVY[0], BRAND_NAVY[1], BRAND_NAVY[2]);
    doc.text("splitly", marginX, y);

    // Date, right-aligned
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(TEXT_MUTED[0], TEXT_MUTED[1], TEXT_MUTED[2]);
    const dateStr = formatDate(new Date());
    doc.text(dateStr, pageWidth - marginX, y, { align: "right" });
    y += 14;

    // Teal accent rule
    doc.setDrawColor(BRAND_TEAL[0], BRAND_TEAL[1], BRAND_TEAL[2]);
    doc.setLineWidth(2);
    doc.line(marginX, y, marginX + 40, y);
    y += 22;

    // Group title
    doc.setFont("helvetica", "bold");
    doc.setFontSize(22);
    doc.setTextColor(BRAND_NAVY[0], BRAND_NAVY[1], BRAND_NAVY[2]);
    doc.text(groupName, marginX, y);
    y += 18;

    // Subtitle
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(TEXT_MUTED[0], TEXT_MUTED[1], TEXT_MUTED[2]);
    doc.text(
      `Currency ${currency.toUpperCase()}  ·  ${members.length} ${members.length === 1 ? "member" : "members"}  ·  ${expenses.length} ${expenses.length === 1 ? "expense" : "expenses"}`,
      marginX,
      y,
    );
    y += 22;

    const sectionHeader = (label: string) => {
      doc.setFont("helvetica", "bold");
      doc.setFontSize(12);
      doc.setTextColor(BRAND_NAVY[0], BRAND_NAVY[1], BRAND_NAVY[2]);
      doc.text(label, marginX, y);
      y += 6;
      doc.setDrawColor(BORDER[0], BORDER[1], BORDER[2]);
      doc.setLineWidth(0.5);
      doc.line(marginX, y, pageWidth - marginX, y);
      y += 10;
    };

    // Expenses section
    sectionHeader("Expenses");
    if (expenses.length === 0) {
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.setTextColor(TEXT_MUTED[0], TEXT_MUTED[1], TEXT_MUTED[2]);
      doc.text("No expenses recorded.", marginX, y);
      y += 18;
    } else {
      autoTable(doc, {
        startY: y,
        head: [["Description", "Paid by", "Split among", "Amount"]],
        body: expenses.map((e) => [
          e.description,
          memberName(e.paidBy),
          sharerList(e.sharerIds),
          formatCents(e.amountCents, currency),
        ]),
        margin: { left: marginX, right: marginX },
        styles: {
          font: "helvetica",
          fontSize: 9,
          textColor: BRAND_NAVY,
          cellPadding: 6,
          lineColor: BORDER,
          lineWidth: 0.5,
        },
        headStyles: {
          fillColor: [248, 250, 251],
          textColor: BRAND_NAVY,
          fontStyle: "bold",
        },
        alternateRowStyles: { fillColor: [252, 253, 254] },
        columnStyles: {
          3: { halign: "right", fontStyle: "bold" },
        },
      });
      y = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 24;
    }

    // Balances section
    sectionHeader("Balances");
    if (balances.length === 0) {
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.setTextColor(TEXT_MUTED[0], TEXT_MUTED[1], TEXT_MUTED[2]);
      doc.text("No members.", marginX, y);
      y += 18;
    } else {
      autoTable(doc, {
        startY: y,
        head: [["Member", "Status", "Amount"]],
        body: balances.map((b) => {
          const status =
            b.balanceCents > 0
              ? "is owed"
              : b.balanceCents < 0
                ? "owes"
                : "is settled";
          return [
            memberName(b.memberId),
            status,
            formatCents(Math.abs(b.balanceCents), currency),
          ];
        }),
        margin: { left: marginX, right: marginX },
        styles: {
          font: "helvetica",
          fontSize: 9,
          textColor: BRAND_NAVY,
          cellPadding: 6,
          lineColor: BORDER,
          lineWidth: 0.5,
        },
        headStyles: {
          fillColor: [248, 250, 251],
          textColor: BRAND_NAVY,
          fontStyle: "bold",
        },
        alternateRowStyles: { fillColor: [252, 253, 254] },
        columnStyles: {
          2: { halign: "right", fontStyle: "bold" },
        },
      });
      y = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 24;
    }

    // Settlement section
    sectionHeader("Settlement");
    if (transfers.length === 0) {
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.setTextColor(TEXT_MUTED[0], TEXT_MUTED[1], TEXT_MUTED[2]);
      doc.text("Everyone is settled. No transfers needed.", marginX, y);
      y += 18;
    } else {
      autoTable(doc, {
        startY: y,
        head: [["From", "To", "Amount"]],
        body: transfers.map((t) => [
          memberName(t.fromMemberId),
          memberName(t.toMemberId),
          formatCents(t.amountCents, currency),
        ]),
        margin: { left: marginX, right: marginX },
        styles: {
          font: "helvetica",
          fontSize: 10,
          textColor: BRAND_NAVY,
          cellPadding: 7,
          lineColor: BORDER,
          lineWidth: 0.5,
        },
        headStyles: {
          fillColor: BRAND_NAVY,
          textColor: [255, 255, 255],
          fontStyle: "bold",
        },
        alternateRowStyles: { fillColor: [248, 250, 251] },
        columnStyles: {
          2: { halign: "right", fontStyle: "bold" },
        },
      });
      y = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 16;

      const total = transfers.reduce((acc, t) => acc + t.amountCents, 0);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.setTextColor(TEXT_MUTED[0], TEXT_MUTED[1], TEXT_MUTED[2]);
      doc.text(`Total moved: ${formatCents(total, currency)}`, marginX, y);
      y += 14;
      doc.text(
        `Transfers: ${transfers.length}`,
        marginX,
        y,
      );
      y += 14;
    }

    // Footer
    const pageHeight = doc.internal.pageSize.getHeight();
    doc.setDrawColor(BORDER[0], BORDER[1], BORDER[2]);
    doc.setLineWidth(0.5);
    doc.line(marginX, pageHeight - 44, pageWidth - marginX, pageHeight - 44);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(TEXT_MUTED[0], TEXT_MUTED[1], TEXT_MUTED[2]);
    doc.text(
      "Generated by splitly. drivanta.co",
      marginX,
      pageHeight - 28,
    );

    const safeName = groupName.replace(/[^a-z0-9-_]+/gi, "-").toLowerCase();
    doc.save(`splitly-${safeName || "settlement"}.pdf`);
  }

  return (
    <section className="card">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-base font-semibold">Settlement</h2>
        <div className="flex gap-2">
          {transfers.length > 0 ? (
            <button
              type="button"
              onClick={handleCopy}
              className="btn-secondary px-3 py-1.5 text-xs"
            >
              {copied ? "Copied" : "Copy"}
            </button>
          ) : null}
          <button
            type="button"
            onClick={handlePdf}
            className="btn-secondary px-3 py-1.5 text-xs"
          >
            PDF
          </button>
        </div>
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
