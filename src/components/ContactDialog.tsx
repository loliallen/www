"use client";

import { useRef } from "react";
import { profile } from "@/content/profile";

export type ContactDialogLabels = {
  trigger: string;
  title: string;
  subtitle: string;
  close: string;
  emailLabel: string;
  fastestLabel: string;
};

export function ContactDialog({ labels }: { labels: ContactDialogLabels }) {
  const ref = useRef<HTMLDialogElement>(null);
  const open = () => ref.current?.showModal();
  const close = () => ref.current?.close();

  const contacts = [
    {
      label: labels.emailLabel,
      value: profile.email,
      href: `mailto:${profile.email}`,
      external: false,
      fastest: false,
    },
    ...profile.links.map((l) => ({
      label: l.label,
      value: l.handle,
      href: l.href,
      external: true,
      fastest: l.fastest,
    })),
  ].sort((a, b) => Number(b.fastest) - Number(a.fastest)); // fastest channel first

  return (
    <>
      <button
        type="button"
        onClick={open}
        className="mt-6 inline-flex items-center gap-2 bg-chartreuse px-6 py-3 font-mono text-sm uppercase tracking-widest text-ink transition-colors hover:bg-paper"
      >
        {labels.trigger} →
      </button>

      <dialog
        ref={ref}
        aria-labelledby="contact-dialog-title"
        onClick={(e) => {
          // Close when the click lands on the backdrop (outside the box).
          const d = ref.current;
          if (!d) return;
          const r = d.getBoundingClientRect();
          const inside =
            e.clientX >= r.left &&
            e.clientX <= r.right &&
            e.clientY >= r.top &&
            e.clientY <= r.bottom;
          if (!inside) close();
        }}
        className="m-auto w-[90vw] max-w-md border-2 border-ink bg-paper p-0 text-ink backdrop:bg-ink/60"
      >
        <div className="p-6 sm:p-8">
          <div className="flex items-start justify-between gap-4">
            <h2
              id="contact-dialog-title"
              className="font-display text-2xl font-extrabold tracking-tight text-ink"
            >
              {labels.title}
            </h2>
            <button
              type="button"
              onClick={close}
              aria-label={labels.close}
              className="-mr-1 -mt-1 shrink-0 px-2 py-1 font-mono text-lg leading-none text-ink/50 transition-colors hover:text-ink"
            >
              ✕
            </button>
          </div>
          <p className="mt-2 text-sm text-ink/70">{labels.subtitle}</p>

          <ul className="mt-6 border-t-2 border-ink">
            {contacts.map((c) => (
              <li key={c.label} className="border-b-2 border-ink">
                <a
                  href={c.href}
                  target={c.external ? "_blank" : undefined}
                  rel={c.external ? "noopener noreferrer" : undefined}
                  className="group flex items-center justify-between gap-4 px-2 py-3 transition-colors hover:bg-chartreuse"
                >
                  <span className="flex items-center gap-2 font-mono text-xs uppercase tracking-widest text-ink/60">
                    {c.label}
                    {c.fastest && (
                      <span className="bg-ink px-1.5 py-0.5 text-[10px] tracking-wider text-chartreuse">
                        {labels.fastestLabel}
                      </span>
                    )}
                  </span>
                  <span className="flex-1 truncate text-right font-medium text-ink">
                    {c.value}
                  </span>
                  <span className="text-ink/40 transition-transform group-hover:translate-x-1 group-hover:text-ink">
                    →
                  </span>
                </a>
              </li>
            ))}
          </ul>
        </div>
      </dialog>
    </>
  );
}
