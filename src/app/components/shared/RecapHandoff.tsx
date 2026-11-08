import { Link } from 'react-router';
import { History } from 'lucide-react';
import { useLocalizedPath } from '../../../i18n/useLang';

interface RecapHandoffProps {
  /** Where the topic was first taught, e.g. "Section 02 · Rollups & L2s". */
  text: string;
  label?: string;
  /** Optional locale-less route (e.g. "/blockchain-platforms/section-2") — renders the pill as a link. */
  to?: string;
  color?: string;
  className?: string;
}

export function RecapHandoff({ text, label = 'Already covered', to, color = '#39B54A', className = '' }: RecapHandoffProps) {
  const localize = useLocalizedPath();
  const cls = `inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 ${to ? 'hover:opacity-80 transition-opacity' : ''} ${className}`;
  const style = { borderColor: color + '55', backgroundColor: color + '0d' };
  const inner = (
    <>
      <History className="size-3 shrink-0" style={{ color }} />
      <span className="text-[9px] font-black uppercase tracking-widest" style={{ color }}>{label}</span>
      <span className="text-[11px] text-foreground/80 leading-none">{text}</span>
      {to && <span className="text-[11px] leading-none" style={{ color }}>↗</span>}
    </>
  );
  return to
    ? <Link to={localize(to)} className={cls} style={style}>{inner}</Link>
    : <div className={cls} style={style}>{inner}</div>;
}
