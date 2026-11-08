import { useTranslation } from 'react-i18next';

interface KeyPointBarProps {
  /** One memorable, business-relevant sentence for this slide. */
  text: string;
  className?: string;
}

/** Slim "🔑 Key point" footer used on every content slide of the Smart Contracts course. */
export function KeyPointBar({ text, className = '' }: KeyPointBarProps) {
  const { t } = useTranslation();
  return (
    <div
      className={`shrink-0 flex items-center gap-2.5 px-3.5 py-2 rounded-xl border border-[#f59e0b]/40 ${className}`}
      style={{ backgroundColor: '#f59e0b12' }}
    >
      <span className="text-base leading-none" aria-hidden>🔑</span>
      <span className="text-[10px] font-black uppercase tracking-widest text-[#f59e0b] shrink-0">{t('keyPoint')}</span>
      <span className="text-sm font-semibold text-foreground leading-snug">{text}</span>
    </div>
  );
}
