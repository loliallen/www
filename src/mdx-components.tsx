import type { MDXComponents } from "mdx/types";

/**
 * Styling for MDX content (case studies). These map raw markdown elements to
 * the editorial design system so written content inherits the site's voice
 * without per-file styling. Tailwind classes only - tokens live in globals.css.
 */
const components: MDXComponents = {
  h1: ({ children }) => (
    <h1 className="font-display text-4xl font-extrabold leading-[0.95] tracking-tight text-ink sm:text-6xl">
      {children}
    </h1>
  ),
  h2: ({ children }) => (
    <h2 className="mt-16 font-display text-2xl font-bold tracking-tight text-ink sm:text-3xl">
      {children}
    </h2>
  ),
  h3: ({ children }) => (
    <h3 className="mt-10 font-display text-xl font-bold tracking-tight text-ink">
      {children}
    </h3>
  ),
  p: ({ children }) => (
    <p className="mt-5 max-w-prose text-lg leading-relaxed text-ink/80">
      {children}
    </p>
  ),
  ul: ({ children }) => (
    <ul className="mt-5 max-w-prose list-disc space-y-2 pl-6 text-lg leading-relaxed text-ink/80 marker:text-accent">
      {children}
    </ul>
  ),
  ol: ({ children }) => (
    <ol className="mt-5 max-w-prose list-decimal space-y-2 pl-6 text-lg leading-relaxed text-ink/80 marker:text-accent">
      {children}
    </ol>
  ),
  li: ({ children }) => <li className="pl-1">{children}</li>,
  a: ({ children, href }) => (
    <a
      href={href}
      className="font-medium text-ink underline decoration-accent decoration-2 underline-offset-4 transition-colors hover:text-accent"
    >
      {children}
    </a>
  ),
  blockquote: ({ children }) => (
    <blockquote className="mt-8 border-l-4 border-accent bg-plum/5 py-2 pl-6 font-display text-xl italic text-ink">
      {children}
    </blockquote>
  ),
  code: ({ children }) => (
    <code className="rounded bg-ink/5 px-1.5 py-0.5 font-mono text-[0.9em] text-plum">
      {children}
    </code>
  ),
  pre: ({ children }) => (
    <pre className="mt-6 overflow-x-auto rounded-none border-2 border-ink bg-ink p-5 font-mono text-sm text-paper">
      {children}
    </pre>
  ),
  hr: () => <hr className="my-12 border-t-2 border-ink/15" />,
};

export function useMDXComponents(): MDXComponents {
  return components;
}
