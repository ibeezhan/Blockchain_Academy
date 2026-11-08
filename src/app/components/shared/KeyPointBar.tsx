import { KeyRound } from 'lucide-react';

interface KeyPointBarProps {
  /** One memorable, business-relevant sentence — the single thing to remember from the slide. */
  text: string;
  /** Accent colour; defaults to the course's amber highlight. */
  color?: string;
  label?: string;
  className?: string;
}

/** Shared "Key point" footer bar. Literal label on purpose: slides are English-only until the pt pass. */
export function KeyPointBar({ text, color = '#f59e0b', label = 'Key point', className = '' }: KeyPointBarProps) {
  if (!text) return null;
  return (
    <div
      className={`flex items-center gap-3 rounded-xl border px-3 py-2 ${className}`}
      style={{ borderColor: color + '66', backgroundColor: color + '0f' }}
    >
      <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-widest shrink-0" style={{ color }}>
        <KeyRound className="size-3.5 shrink-0" />
        {label}
      </span>
      <p className="text-xs lg:text-sm font-semibold text-foreground leading-snug">{text}</p>
    </div>
  );
}
