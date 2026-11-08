import { useTranslation } from 'react-i18next';
import { Wrench } from 'lucide-react';

interface UnderTheHoodProps {
  /** Short technical keywords — the terms a curious student can look up later. */
  items: string[];
  className?: string;
}

/**
 * "under the hood →" keyword hint pills. Used on business-facing slides to
 * name the technical mechanism without explaining it on the slide itself.
 */
export function UnderTheHood({ items, className = '' }: UnderTheHoodProps) {
  const { t } = useTranslation('common');
  return (
    <div className={`flex flex-wrap items-center gap-1.5 ${className}`}>
      <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-widest text-muted-foreground">
        <Wrench className="size-3" />
        {t('common.underTheHood')}
      </span>
      {items.map((item) => (
        <span
          key={item}
          className="px-2 py-0.5 rounded-full border border-border bg-card text-[10px] font-mono text-muted-foreground"
        >
          {item}
        </span>
      ))}
    </div>
  );
}
