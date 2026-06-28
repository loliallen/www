"use client";

export function PrintButton({ label }: { label: string }) {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="inline-flex items-center gap-1.5 border-2 border-ink bg-ink px-3 py-1.5 font-mono text-xs uppercase tracking-widest text-paper transition-colors hover:bg-chartreuse hover:text-ink"
    >
      {label}
      <span aria-hidden>↓</span>
    </button>
  );
}
