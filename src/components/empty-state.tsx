interface Props {
  title: string;
  body: string;
}

export function EmptyState({ title, body }: Props) {
  return (
    <div className="rounded-xl border border-dashed border-brand-navy/15 bg-brand-cream/40 px-4 py-6 text-center">
      <p className="text-sm font-semibold text-brand-navy">{title}</p>
      <p className="mt-1 text-xs text-brand-navy/60">{body}</p>
    </div>
  );
}
