interface KeyPointBarProps {
  /** One memorable, business-relevant sentence for this slide. */
  text: string;
  /** Optional accent (hex). Defaults to the course-neutral amber. */
  color?: string;
  label?: string;
  className?: string;
}

/** Shared slim "🔑 Key point" footer used across all courses. Literal label on purpose: slides are English-only until the pt pass. */
export function KeyPointBar({ text, color = '#f59e0b', label = 'Key point', className = '' }: KeyPointBarProps) {
  return (
    <div
      className={`shrink-0 flex items-center gap-2.5 px-3.5 py-2 rounded-xl border ${className}`}
      style={{ borderColor: color + '66', backgroundColor: color + '12' }}
    >
      <span className="text-base leading-none" aria-hidden>🔑</span>
      <span className="text-[10px] font-black uppercase tracking-widest shrink-0" style={{ color }}>{label}</span>
      <span className="text-sm font-semibold text-foreground leading-snug">{text}</span>
    </div>
  );
}
