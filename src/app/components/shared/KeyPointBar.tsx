interface KeyPointBarProps {
  /** One memorable, business-relevant sentence — the single thing to remember from the slide. */
  text: string;
  label?: string;
  color?: string;
  className?: string;
}

export function KeyPointBar({ text, label = 'Key point', color = '#f59e0b', className = '' }: KeyPointBarProps) {
  return (
    <div
      className={`shrink-0 flex items-center gap-2.5 rounded-lg border border-l-4 px-3 py-2 ${className}`}
      style={{ borderColor: color + '55', borderLeftColor: color, backgroundColor: color + '0d' }}
    >
      <span className="text-base leading-none shrink-0">🔑</span>
      <span className="text-[9px] font-black uppercase tracking-widest shrink-0" style={{ color }}>{label}</span>
      <p className="text-xs lg:text-sm font-semibold text-foreground leading-snug">{text}</p>
    </div>
  );
}
