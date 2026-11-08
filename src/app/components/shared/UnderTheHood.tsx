import { Cog } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface UnderTheHoodProps {
  /** Technical keywords for students who want to look deeper. Not translated. */
  terms: string[];
  className?: string;
}

/** Small "under the hood →" hint pill row: a consistent, low-noise pointer to the tech behind a business slide. */
export function UnderTheHood({ terms, className = '' }: UnderTheHoodProps) {
  const { t } = useTranslation();
  return (
    <div className={`inline-flex flex-wrap items-center gap-1.5 ${className}`}>
      <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/80">
        <Cog className="size-3" />
        {t('underTheHood')}
      </span>
      {terms.map((term) => (
        <span
          key={term}
          className="px-2 py-0.5 rounded-full border border-border bg-muted/40 text-[10px] font-mono text-muted-foreground"
        >
          {term}
        </span>
      ))}
    </div>
  );
}
