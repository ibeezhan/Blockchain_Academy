import { Wrench } from 'lucide-react';

interface UnderTheHoodProps {
  /** Technical keywords a curious student can look up later — a quiet hint, not teaching content. */
  terms?: string[];
  /** Alias of `terms` (kept so every course section can use either name). */
  items?: string[];
  label?: string;
  className?: string;
}

/** Shared "under the hood →" keyword-pill row used across all courses. Literal label on purpose: slides are English-only until the pt pass. */
export function UnderTheHood({ terms, items, label = 'under the hood →', className = '' }: UnderTheHoodProps) {
  const list = terms ?? items ?? [];
  if (list.length === 0) return null;
  return (
    <div className={`inline-flex flex-wrap items-center gap-1.5 ${className}`}>
      <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-widest text-muted-foreground">
        <Wrench className="size-3 shrink-0" />
        {label}
      </span>
      {list.map((term) => (
        <span
          key={term}
          className="px-2 py-0.5 rounded-full border border-border bg-card text-[10px] font-mono text-muted-foreground leading-none"
        >
          {term}
        </span>
      ))}
    </div>
  );
}
