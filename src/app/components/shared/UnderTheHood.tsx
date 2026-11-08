import { Wrench } from 'lucide-react';

interface UnderTheHoodProps {
  /** Technical keywords for students who want to dig deeper — kept as a quiet hint, not teaching content. */
  terms: string[];
  label?: string;
  className?: string;
}

export function UnderTheHood({ terms, label = 'under the hood →', className = '' }: UnderTheHoodProps) {
  return (
    <div className={`inline-flex flex-wrap items-center gap-1.5 rounded-full border border-dashed border-border bg-muted/30 px-2.5 py-1 ${className}`}>
      <Wrench className="size-3 shrink-0 text-muted-foreground" />
      <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">{label}</span>
      {terms.map((term) => (
        <span key={term} className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-card border border-border text-foreground/80 leading-none">
          {term}
        </span>
      ))}
    </div>
  );
}
