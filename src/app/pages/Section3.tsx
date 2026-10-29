import { useMemo, useState, type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { TitleSlide } from '../components/templates/TitleSlide';
import { ComparisonSlide } from '../components/templates/ComparisonSlide';
import { DiscussionSlide } from '../components/templates/DiscussionSlide';
import { TakeawaySlide } from '../components/templates/TakeawaySlide';
import { QuizSlide } from '../components/templates/QuizSlide';
import { Rocket, ExternalLink, Telescope, Landmark, Image as ImageIcon, Vote, Lightbulb } from 'lucide-react';
import { SectionNav } from '../components/navigation/SectionNav';
import { SiteFooter } from '../components/shared/SiteFooter';
import ethereumLogo from '../../ethereum-eth-logo.svg';
import vitalikPhoto from '../../vitalik-buterin.jpg';
import amazonLogo from '../../amazon.png';
import msnLogo from '../../msn.png';
import netscapeLogo from '../../netscape.png';
import tiktokLogo from '../../tiktok.jpg';
import youtubeLogo from '../../youtube.png';
import xLogo from '../../x-logo.jpg';
import bitcoinLogo from '../../bitcoin-btc-logo.svg';
import uniswapLogo from '../../uniswap-uni-logo.svg';
import usdcLogo from '../../usd-coin-usdc-logo.svg';

const NS = 'blockchain-fundamentals/section-3';

/** Sidebar shape — labels resolved at render time via i18n */
const section3ChaptersShape: ReadonlyArray<{ id: string; kind?: 'group' }> = [
  { kind: 'group', id: 'g-s3-eth' },
  { id: 's3-ethereum' },
  { id: 's3-accounts' },
  { id: 's3-gas' },
  { id: 's3-defi' },
  { id: 's3-nfts' },
  { id: 's3-daos' },

  { kind: 'group', id: 'g-s3-world' },
  { id: 's3-usecases' },
  { id: 's3-ecosystem' },

  { kind: 'group', id: 'g-s3-evol' },
  { id: 's3-web3' },
  { id: 's3-dapp' },

  { kind: 'group', id: 'g-s3-reflect' },
  { id: 's3-ethics' },
  { id: 's3-ethics-control' },
  { id: 's3-future' },
  { id: 's3-discussion' },

  { kind: 'group', id: 'g-s3-wrap' },
  { id: 's3-quiz' },
  { id: 's3-takeaways' },
  { id: 's3-recap' },
  { id: 's3-brainstorm' },
];

const PEEK = '#22d3ee';

/** Forward-pointing footer used on every "sneak peek" slide. */
function PeekFooter({ body }: { body: string }) {
  const { t } = useTranslation(NS);
  return (
    <div className="shrink-0 mt-3 px-3 py-2 rounded-lg border border-dashed flex items-center gap-2 text-[11px] text-muted-foreground"
      style={{ borderColor: PEEK + '80', backgroundColor: PEEK + '10' }}>
      <Telescope className="size-3.5 shrink-0" style={{ color: PEEK }} />
      <strong style={{ color: PEEK }}>{t('peek.label')}</strong> {body}
    </div>
  );
}

/** Shared arrowhead marker for the inline SVG illustrations. */
function ArrowDefs({ id, color }: { id: string; color: string }) {
  return (
    <defs>
      <marker id={id} viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
        <path d="M0,0 L10,5 L0,10 z" fill={color} />
      </marker>
    </defs>
  );
}

// ─── Illustrations ──────────────────────────────────────────────────────────

/** EOA (key-holder) → contract → contract; a contract can't start on its own. */
function AccountsIllustration() {
  const { t } = useTranslation(NS);
  const EOA = '#627EEA', CONTRACT = '#39B54A';
  return (
    <svg viewBox="0 0 360 210" className="w-full h-auto max-w-[460px]" role="img" aria-label={t('ethAccounts.illus.caption')}>
      <ArrowDefs id="acc-arrow" color="var(--muted-foreground)" />
      {/* EOA: human + key */}
      <circle cx="62" cy="78" r="34" fill={EOA + '22'} stroke={EOA} strokeWidth="2" />
      <text x="62" y="86" fontSize="26" textAnchor="middle">🧑</text>
      <g transform="translate(40,118)">
        <circle cx="8" cy="8" r="6" fill="none" stroke="#f59e0b" strokeWidth="2.5" />
        <line x1="13" y1="11" x2="40" y2="34" stroke="#f59e0b" strokeWidth="2.5" strokeLinecap="round" />
        <line x1="31" y1="25" x2="37" y2="19" stroke="#f59e0b" strokeWidth="2.5" strokeLinecap="round" />
        <line x1="36" y1="30" x2="42" y2="24" stroke="#f59e0b" strokeWidth="2.5" strokeLinecap="round" />
      </g>
      <text x="62" y="172" fontSize="11" fontWeight="800" textAnchor="middle" fill={EOA}>{t('ethAccounts.illus.eoa')}</text>
      <text x="62" y="186" fontSize="9" textAnchor="middle" fill="var(--muted-foreground)">{t('ethAccounts.illus.human')} + {t('ethAccounts.illus.key')}</text>

      {/* Contract A */}
      <rect x="150" y="46" width="110" height="64" rx="10" fill={CONTRACT + '1f'} stroke={CONTRACT} strokeWidth="2" />
      <text x="205" y="72" fontSize="12" fontWeight="800" textAnchor="middle" fill={CONTRACT}>{t('ethAccounts.illus.contract')}</text>
      <text x="205" y="92" fontSize="10" fontFamily="monospace" textAnchor="middle" fill="var(--muted-foreground)">{t('ethAccounts.illus.contractSub')}</text>

      {/* Contract B */}
      <rect x="150" y="140" width="110" height="52" rx="10" fill={CONTRACT + '12'} stroke={CONTRACT} strokeWidth="1.5" strokeDasharray="4 3" />
      <text x="205" y="165" fontSize="11" fontWeight="700" textAnchor="middle" fill={CONTRACT}>{t('ethAccounts.illus.contractB')}</text>
      <text x="205" y="181" fontSize="9" fontFamily="monospace" textAnchor="middle" fill="var(--muted-foreground)">{t('ethAccounts.illus.contractSub')}</text>

      {/* EOA → Contract A */}
      <line x1="100" y1="78" x2="146" y2="78" stroke="var(--muted-foreground)" strokeWidth="2" markerEnd="url(#acc-arrow)" />
      <text x="123" y="70" fontSize="9" fontWeight="700" textAnchor="middle" fill="var(--foreground)">{t('ethAccounts.illus.calls')}</text>
      {/* Contract A → Contract B */}
      <line x1="205" y1="112" x2="205" y2="136" stroke="var(--muted-foreground)" strokeWidth="2" markerEnd="url(#acc-arrow)" />
      <text x="214" y="128" fontSize="9" fontWeight="700" fill="var(--foreground)">{t('ethAccounts.illus.calls')}</text>

      {/* Contract trying to act on its own — blocked */}
      <line x1="264" y1="78" x2="330" y2="78" stroke="#ED1C24" strokeWidth="2" strokeDasharray="5 4" />
      <circle cx="300" cy="78" r="11" fill="var(--card)" stroke="#ED1C24" strokeWidth="2" />
      <text x="300" y="83" fontSize="13" fontWeight="900" textAnchor="middle" fill="#ED1C24">✕</text>
      <text x="300" y="104" fontSize="8.5" textAnchor="middle" fill="#ED1C24">{t('ethAccounts.illus.cannotStart')}</text>

      <text x="180" y="206" fontSize="10" fontStyle="italic" textAnchor="middle" fill="var(--muted-foreground)">{t('ethAccounts.illus.caption')}</text>
    </svg>
  );
}

/** Fuel-gauge style gas meter: green → amber → red, needle at "gas used". */
function GasMeter() {
  const { t } = useTranslation(NS);
  return (
    <svg viewBox="0 0 240 150" className="w-full h-auto max-w-[280px]" role="img" aria-label={t('ethGas.meterTitle')}>
      <path d="M30,120 A90,90 0 0,1 75,42.1" fill="none" stroke="#39B54A" strokeWidth="14" strokeLinecap="round" />
      <path d="M75,42.1 A90,90 0 0,1 165,42.1" fill="none" stroke="#f59e0b" strokeWidth="14" />
      <path d="M165,42.1 A90,90 0 0,1 210,120" fill="none" stroke="#ED1C24" strokeWidth="14" strokeLinecap="round" />
      {/* needle */}
      <line x1="120" y1="120" x2="66" y2="75" stroke="var(--foreground)" strokeWidth="3" strokeLinecap="round" />
      <circle cx="120" cy="120" r="7" fill="var(--foreground)" />
      <text x="30" y="142" fontSize="10" textAnchor="middle" fill="var(--muted-foreground)">{t('ethGas.meterLabelLow')}</text>
      <text x="210" y="142" fontSize="10" textAnchor="middle" fill="#ED1C24" fontWeight="700">{t('ethGas.meterLabelHigh')}</text>
      <text x="120" y="98" fontSize="16" fontWeight="900" textAnchor="middle" fill="var(--foreground)" fontFamily="monospace">{t('ethGas.meterValue')}</text>
      <text x="120" y="145" fontSize="9" textAnchor="middle" fill="var(--muted-foreground)">{t('ethGas.meterUnit')}</text>
    </svg>
  );
}

/** DeFi: you swap against a pool (a contract) that liquidity providers fund. */
function DefiIllustration({ v }: { v: Record<string, string> }) {
  const C = '#39B54A';
  return (
    <svg viewBox="0 0 360 190" className="w-full h-auto" role="img" aria-label={v.caption}>
      <ArrowDefs id="defi-arrow" color={C} />
      {/* you */}
      <circle cx="46" cy="90" r="26" fill="#627EEA22" stroke="#627EEA" strokeWidth="2" />
      <text x="46" y="98" fontSize="22" textAnchor="middle">🧑</text>
      <text x="46" y="130" fontSize="10" fontWeight="700" textAnchor="middle" fill="#627EEA">{v.you}</text>
      {/* pool */}
      <rect x="118" y="36" width="140" height="108" rx="14" fill={C + '14'} stroke={C} strokeWidth="2" />
      <text x="188" y="56" fontSize="11" fontWeight="800" textAnchor="middle" fill={C}>{v.pool}</text>
      <text x="188" y="69" fontSize="9" fontFamily="monospace" textAnchor="middle" fill="var(--muted-foreground)">{v.poolSub}</text>
      <circle cx="160" cy="104" r="20" fill="#627EEA" />
      <text x="160" y="109" fontSize="10" fontWeight="800" textAnchor="middle" fill="#fff">ETH</text>
      <circle cx="216" cy="104" r="20" fill="#2775CA" />
      <text x="216" y="109" fontSize="9" fontWeight="800" textAnchor="middle" fill="#fff">USDC</text>
      <text x="188" y="108" fontSize="12" textAnchor="middle" fill="var(--muted-foreground)">⇄</text>
      {/* you → pool / pool → you */}
      <line x1="78" y1="72" x2="114" y2="72" stroke={C} strokeWidth="2" markerEnd="url(#defi-arrow)" />
      <text x="96" y="64" fontSize="8.5" fontWeight="700" textAnchor="middle" fill="var(--foreground)">{v.tokenIn}</text>
      <line x1="114" y1="110" x2="78" y2="110" stroke={C} strokeWidth="2" markerEnd="url(#defi-arrow)" />
      <text x="96" y="124" fontSize="8.5" fontWeight="700" textAnchor="middle" fill="var(--foreground)">{v.tokenOut}</text>
      {/* liquidity providers */}
      {[52, 90, 128].map((cy, i) => (
        <g key={i}>
          <circle cx="322" cy={cy} r="13" fill="var(--muted)" stroke="var(--border)" strokeWidth="1" />
          <text x="322" y={cy + 5} fontSize="12" textAnchor="middle">👤</text>
          <line x1="306" y1={cy} x2="262" y2={90 - (90 - cy) * 0.25} stroke={C} strokeWidth="1.5" strokeDasharray="3 3" markerEnd="url(#defi-arrow)" />
        </g>
      ))}
      <text x="322" y="156" fontSize="8.5" textAnchor="middle" fill="var(--muted-foreground)">{v.providers}</text>
      <text x="180" y="182" fontSize="10" fontStyle="italic" textAnchor="middle" fill="var(--muted-foreground)">{v.caption}</text>
    </svg>
  );
}

/** NFTs: identical coins vs unique numbered tokens with an on-chain owner. */
function NftIllustration({ v }: { v: Record<string, string> }) {
  const C = '#f97316';
  const shapes = ['#8b5cf6', '#22d3ee', '#ED1C24'];
  return (
    <svg viewBox="0 0 360 190" className="w-full h-auto" role="img" aria-label={v.caption}>
      {/* fungible coins */}
      <text x="88" y="22" fontSize="11" fontWeight="800" textAnchor="middle" fill="var(--muted-foreground)">{v.fungible}</text>
      {[40, 88, 136].map((cx, i) => (
        <g key={i}>
          <circle cx={cx} cy="78" r="20" fill="#627EEA" stroke="#4c5fd0" strokeWidth="2" />
          <text x={cx} y="83" fontSize="9" fontWeight="800" textAnchor="middle" fill="#fff">1 ETH</text>
          {i < 2 && <text x={cx + 24} y="83" fontSize="14" fontWeight="900" textAnchor="middle" fill="var(--muted-foreground)">=</text>}
        </g>
      ))}
      <text x="88" y="118" fontSize="8.5" textAnchor="middle" fill="var(--muted-foreground)">{v.fungibleSub}</text>
      {/* divider */}
      <line x1="178" y1="14" x2="178" y2="150" stroke="var(--border)" strokeWidth="1.5" strokeDasharray="4 4" />
      {/* non-fungible framed tokens */}
      <text x="270" y="22" fontSize="11" fontWeight="800" textAnchor="middle" fill={C}>{v.nonFungible}</text>
      {[204, 250, 296].map((x, i) => (
        <g key={i}>
          <rect x={x} y="48" width="44" height="58" rx="5" fill="var(--card)" stroke={C} strokeWidth="2" />
          {i === 0 && <circle cx={x + 22} cy="70" r="11" fill={shapes[i]} />}
          {i === 1 && <rect x={x + 11} y="59" width="22" height="22" rx="3" fill={shapes[i]} />}
          {i === 2 && <polygon points={`${x + 22},58 ${x + 34},82 ${x + 10},82`} fill={shapes[i]} />}
          <text x={x + 22} y="99" fontSize="8" fontFamily="monospace" fontWeight="700" textAnchor="middle" fill={C}>#00{i + 1}</text>
          {i < 2 && <text x={x + 47} y="83" fontSize="14" fontWeight="900" textAnchor="middle" fill={C}>≠</text>}
        </g>
      ))}
      <text x="270" y="118" fontSize="8.5" textAnchor="middle" fill="var(--muted-foreground)">{v.nonFungibleSub}</text>
      {/* owner tag on the first token */}
      <rect x="196" y="128" width="88" height="16" rx="8" fill={C + '22'} stroke={C} strokeWidth="1" />
      <text x="240" y="139" fontSize="8" fontFamily="monospace" textAnchor="middle" fill={C}>{v.owner}</text>
      <line x1="226" y1="108" x2="236" y2="126" stroke={C} strokeWidth="1" strokeDasharray="2 2" />
      <text x="180" y="180" fontSize="10" fontStyle="italic" textAnchor="middle" fill="var(--muted-foreground)">{v.caption}</text>
    </svg>
  );
}

/** DAOs: token holders vote into a treasury contract, which executes the result. */
function DaoIllustration({ v }: { v: Record<string, string> }) {
  const C = '#6366f1';
  const holders = [
    { x: 60, y: 48 }, { x: 60, y: 132 }, { x: 300, y: 48 }, { x: 300, y: 132 }, { x: 180, y: 24 },
  ];
  return (
    <svg viewBox="0 0 360 190" className="w-full h-auto" role="img" aria-label={v.caption}>
      <ArrowDefs id="dao-arrow" color={C} />
      {/* treasury contract */}
      <rect x="120" y="60" width="120" height="60" rx="12" fill={C + '1a'} stroke={C} strokeWidth="2" />
      <text x="180" y="84" fontSize="11" fontWeight="800" textAnchor="middle" fill={C}>{v.treasury}</text>
      <text x="180" y="99" fontSize="9" fontFamily="monospace" textAnchor="middle" fill="var(--muted-foreground)">{v.treasurySub}</text>
      {/* holders + votes */}
      {holders.map((h, i) => {
        const tx = h.x < 180 ? 116 : h.x > 180 ? 244 : 180;
        const ty = h.y < 60 ? 56 : h.y > 120 ? 124 : 90;
        return (
          <g key={i}>
            <line x1={h.x} y1={h.y} x2={tx} y2={ty} stroke={C} strokeWidth="1.5" strokeDasharray="3 3" markerEnd="url(#dao-arrow)" />
            <circle cx={h.x} cy={h.y} r="15" fill="var(--muted)" stroke="var(--border)" strokeWidth="1" />
            <text x={h.x} y={h.y + 5} fontSize="13" textAnchor="middle">👤</text>
            <text x={(h.x + tx) / 2} y={(h.y + ty) / 2 - 4} fontSize="8" fontWeight="700" textAnchor="middle" fill={C}>{v.vote}</text>
          </g>
        );
      })}
      <text x="60" y="162" fontSize="8.5" textAnchor="middle" fill="var(--muted-foreground)">{v.holders}</text>
      {/* proposal card */}
      <rect x="18" y="78" width="46" height="28" rx="4" fill="var(--card)" stroke="#f59e0b" strokeWidth="1.5" />
      <text x="41" y="96" fontSize="8" fontWeight="700" textAnchor="middle" fill="#f59e0b">{v.proposal}</text>
      <line x1="66" y1="92" x2="116" y2="92" stroke="#f59e0b" strokeWidth="1.5" markerEnd="url(#dao-arrow)" />
      {/* execution */}
      <line x1="180" y1="122" x2="180" y2="148" stroke="#39B54A" strokeWidth="2" markerEnd="url(#dao-arrow)" />
      <circle cx="180" cy="160" r="11" fill="#39B54A" />
      <text x="180" y="165" fontSize="12" fontWeight="900" textAnchor="middle" fill="#fff">✓</text>
      <text x="236" y="163" fontSize="8.5" fontWeight="700" fill="#39B54A">{v.executes}</text>
      <text x="180" y="184" fontSize="10" fontStyle="italic" textAnchor="middle" fill="var(--muted-foreground)">{v.caption}</text>
    </svg>
  );
}

// ─── Sneak-peek slide (DeFi / NFTs / DAOs) ───────────────────────────────────

interface AppPeek {
  title: string; subtitle: string; replaces: string; tease: string; description: string;
  examples: Array<{ name: string; desc: string }>; risk: string; stat: string; later: string;
  visual: Record<string, string>;
}

function SneakPeekSlide({ id, index, color, icon, illustration }: {
  id: string; index: number; color: string; icon: ReactNode; illustration: (v: Record<string, string>) => ReactNode;
}) {
  const { t } = useTranslation(NS);
  const app = (t('ethApps.apps', { returnObjects: true }) as AppPeek[])[index];
  return (
    <div id={id} className="h-full flex flex-col p-5 lg:p-8">
      <div className="shrink-0 mb-3">
        <div className="flex items-center gap-2 mb-1.5 text-[10px] text-muted-foreground">
          <span className="px-1.5 py-0.5 rounded font-bold" style={{ color: PEEK, backgroundColor: PEEK + '26' }}>{t('ethApps.peekBadge')}</span>
          <span>{app.tease}</span>
        </div>
        <div className="flex items-center gap-3 mb-1">
          <div className="size-10 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: color + '26', color }}>{icon}</div>
          <div>
            <h2 className="text-2xl lg:text-3xl font-bold text-foreground leading-none">{app.title} <span className="text-base lg:text-lg font-semibold text-muted-foreground">— {app.subtitle}</span></h2>
          </div>
          <span className="ml-auto text-xs italic text-muted-foreground px-2.5 py-1 rounded-full border border-border bg-card">{t('ethApps.replacesLabel')} {app.replaces}</span>
        </div>
        <p className="text-sm text-muted-foreground max-w-4xl">{app.description}</p>
      </div>

      <div className="flex-1 min-h-0 grid grid-cols-5 gap-4">
        <div className="col-span-2 flex flex-col gap-3 min-h-0">
          <div className="flex-1 min-h-0 bg-card border rounded-xl p-3 flex items-center justify-center" style={{ borderColor: color + '55' }}>
            {illustration(app.visual)}
          </div>
          <div className="shrink-0 p-3 rounded-xl border text-center" style={{ borderColor: color + '55', background: `linear-gradient(to bottom right, ${color}26, transparent)` }}>
            <div className="text-sm font-black" style={{ color }}>{app.stat}</div>
          </div>
        </div>
        <div className="col-span-3 flex flex-col gap-2 min-h-0">
          <div className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">{t('ethApps.examplesLabel')}</div>
          {app.examples.map((ex, j) => (
            <div key={j} className="flex-1 p-3 rounded-xl bg-card border border-border flex items-start gap-3">
              <span className="size-7 rounded-lg flex items-center justify-center text-xs font-black text-white shrink-0" style={{ backgroundColor: color }}>{j + 1}</span>
              <div>
                <div className="font-bold text-sm text-foreground">{ex.name}</div>
                <div className="text-xs text-muted-foreground">{ex.desc}</div>
              </div>
            </div>
          ))}
          <div className="shrink-0 p-2.5 rounded-lg bg-[#ef4444]/8 border border-[#ef4444]/30 text-xs text-muted-foreground">
            <span className="font-bold text-[#ef4444]">{t('ethApps.riskLabel')} </span>{app.risk}
          </div>
        </div>
      </div>

      <PeekFooter body={app.later} />
    </div>
  );
}

// ─── Knowledge Wall — recap of all Course 1 vocabulary ──────────────────────

interface Brick { term: string; defn: string; section: 1 | 2 | 3 }

/** Theme-level visual + section assignments — language-neutral. The actual
 *  term + defn text comes from the locale JSON keyed by themeId + brick index. */
interface ThemeShape { id: string; color: string; sections: (1 | 2 | 3)[] }

const KNOWLEDGE_WALL_SHAPE: ThemeShape[] = [
  { id: 'foundations', color: '#ED1C24', sections: [1, 1, 1, 1, 2, 2, 1] },
  { id: 'structure',   color: '#f59e0b', sections: [1, 1, 1, 2, 2, 2, 2, 2, 2] },
  { id: 'identity',    color: '#39B54A', sections: [2, 2, 2, 2, 2, 2] },
  { id: 'network',     color: '#6366f1', sections: [1, 1, 1, 2, 3, 2, 1, 2, 2, 2] },
  { id: 'bitcoin',     color: '#f7931a', sections: [2, 2, 2, 2, 2, 2, 2, 2] },
  { id: 'ethereum',    color: '#627EEA', sections: [3, 3, 3, 3, 3, 3, 3, 3, 3] },
  { id: 'web3',        color: '#8b5cf6', sections: [3, 3, 3, 3, 3, 3, 3, 3, 3] },
  { id: 'future',      color: '#22d3ee', sections: [3, 3, 3, 3, 3, 3, 3, 3] },
];

function sectionColor(s: 1 | 2 | 3): string {
  return s === 1 ? '#ED1C24' : s === 2 ? '#f59e0b' : '#39B54A';
}

function KnowledgeWall() {
  const { t } = useTranslation(NS);

  /** Build the runtime themed bricks: pull translated term + defn for each shape entry. */
  const themes = useMemo(() => KNOWLEDGE_WALL_SHAPE.map(shape => {
    const themeName = t(`knowledgeWall.themes.${shape.id}.name`);
    const bricks = shape.sections.map((section, i) => {
      const term = t(`knowledgeWall.themes.${shape.id}.bricks.${i}.term`);
      const defn = t(`knowledgeWall.themes.${shape.id}.bricks.${i}.defn`);
      return { term, defn, section } as Brick;
    });
    return { id: shape.id, name: themeName, color: shape.color, bricks };
  }), [t]);

  const totalBricks = themes.reduce((n, g) => n + g.bricks.length, 0);
  const [selected, setSelected] = useState<Brick | null>(themes[0].bricks[0]);

  return (
    <div className="h-full flex flex-col p-5 lg:p-8">
      {/* Header */}
      <div className="shrink-0 mb-3 flex items-start justify-between gap-4">
        <div>
          <span className="px-2.5 py-0.5 rounded-full bg-[#39B54A]/15 border border-[#39B54A]/40 text-[#39B54A] text-xs font-bold">{t('knowledgeWall.recapBadge')}</span>
          <h2 className="text-2xl lg:text-3xl font-bold text-foreground mt-1">{t('knowledgeWall.heading')}</h2>
          <p className="text-sm text-muted-foreground max-w-3xl">
            {t('knowledgeWall.leadA')} <span className="text-foreground font-semibold">{t('knowledgeWall.leadStrong', { count: totalBricks })}</span>
          </p>
        </div>
        {/* Legend */}
        <div className="shrink-0 flex flex-col gap-1 text-[10px]">
          <div className="font-bold uppercase tracking-widest text-muted-foreground mb-0.5">{t('knowledgeWall.firstMet')}</div>
          {[1, 2, 3].map(s => (
            <div key={s} className="flex items-center gap-1.5 text-muted-foreground">
              <span className="size-2 rounded-full" style={{ background: sectionColor(s as 1|2|3) }}></span>
              <span>§{s} — {t(`knowledgeWall.sectionNames.${s}`)}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Definition tray */}
      <div
        className="shrink-0 mb-3 p-4 bg-card border-2 rounded-xl transition-colors min-h-[88px]"
        style={{ borderColor: selected ? sectionColor(selected.section) + 'AA' : 'var(--border)' }}
      >
        {selected ? (
          <>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-lg lg:text-xl font-black" style={{ color: sectionColor(selected.section) }}>
                {selected.term}
              </span>
              <span
                className="text-[10px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded"
                style={{ color: sectionColor(selected.section), backgroundColor: sectionColor(selected.section) + '20' }}
              >
                §{selected.section}
              </span>
            </div>
            <p className="text-sm text-foreground leading-snug">{selected.defn}</p>
          </>
        ) : (
          <p className="text-sm text-muted-foreground italic">{t('knowledgeWall.hoverHint')}</p>
        )}
      </div>

      {/* Themed brick groups */}
      <div className="flex-1 min-h-0 overflow-y-auto pr-1 flex flex-col gap-3">
        {themes.map(group => (
          <div key={group.id}>
            <div className="flex items-baseline gap-2 mb-1.5 sticky top-0 bg-background/95 backdrop-blur-sm py-1 z-10">
              <span className="size-2 rounded-full shrink-0" style={{ background: group.color }}></span>
              <span className="text-[10px] font-black uppercase tracking-widest" style={{ color: group.color }}>
                {group.name}
              </span>
              <span className="text-[10px] text-muted-foreground">· {group.bricks.length}</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {group.bricks.map((b, i) => {
                const isSelected = selected?.term === b.term;
                return (
                  <button
                    key={`${group.id}-${i}`}
                    type="button"
                    onClick={() => setSelected(b)}
                    onMouseEnter={() => setSelected(b)}
                    onFocus={() => setSelected(b)}
                    className="relative px-2.5 py-1 rounded-md text-xs font-mono font-bold border transition-all hover:-translate-y-0.5"
                    style={{
                      color: isSelected ? '#fff' : group.color,
                      backgroundColor: isSelected ? group.color : group.color + '12',
                      borderColor: isSelected ? group.color : group.color + '45',
                      boxShadow: isSelected ? `0 2px 8px ${group.color}55` : undefined,
                    }}
                  >
                    {b.term}
                    {/* tiny source-section dot */}
                    <span
                      className="absolute -top-0.5 -right-0.5 size-1.5 rounded-full ring-1 ring-background"
                      style={{ background: sectionColor(b.section) }}
                      aria-hidden
                    />
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Brainstorm — closing in-class activity ──────────────────────────────────

function BrainstormSlide() {
  const { t } = useTranslation(NS);
  const COLOR = '#f59e0b';
  const seeds = t('brainstorm.seeds', { returnObjects: true }) as Array<{ emoji: string; title: string; desc: string }>;
  const questions = t('brainstorm.questions', { returnObjects: true }) as string[];
  const steps = t('brainstorm.steps', { returnObjects: true }) as Array<{ time: string; label: string }>;
  return (
    <div className="h-full flex flex-col p-6 lg:p-10 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none opacity-60"
        style={{ background: `radial-gradient(circle at 20% 0%, ${COLOR}1f, transparent 60%), radial-gradient(circle at 80% 100%, #ED1C2418, transparent 60%)` }} />

      {/* Header */}
      <div className="shrink-0 relative z-10 mb-4 flex items-start justify-between gap-4 flex-wrap">
        <div className="flex items-start gap-4">
          <div className="px-3 py-1.5 rounded-full text-xs font-black uppercase tracking-widest text-white shadow-md shrink-0"
            style={{ background: `linear-gradient(135deg, ${COLOR}, #ED1C24)` }}>
            {t('brainstorm.ribbon')}
          </div>
          <div>
            <div className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">{t('brainstorm.contextLabel')}</div>
            <h2 className="text-2xl lg:text-3xl font-bold text-foreground mt-0.5">{t('brainstorm.title')}</h2>
            <p className="text-muted-foreground text-sm mt-1 max-w-3xl">{t('brainstorm.subtitle')}</p>
          </div>
        </div>
        <div className="shrink-0 px-3 py-1.5 rounded-full text-xs font-bold border-2 self-center"
          style={{ borderColor: COLOR + '50', color: COLOR, backgroundColor: COLOR + '10' }}>
          ⏱ {t('brainstorm.duration')}
        </div>
      </div>

      {/* Panes */}
      <div className="flex-1 min-h-0 relative z-10 grid grid-cols-12 gap-4">
        {/* Seeds */}
        <div className="col-span-5 p-4 bg-card border-2 rounded-2xl flex flex-col gap-3 min-h-0" style={{ borderColor: COLOR + '50' }}>
          <div className="text-[10px] font-black uppercase tracking-widest" style={{ color: COLOR }}>{t('brainstorm.seedsLabel')}</div>
          <div className="flex-1 min-h-0 grid grid-cols-2 gap-2.5">
            {seeds.map((s, i) => (
              <div key={i} className="p-3 rounded-xl border border-border bg-muted/30 flex flex-col gap-1">
                <div className="flex items-center gap-2">
                  <span className="text-2xl leading-none">{s.emoji}</span>
                  <div className="font-bold text-sm text-foreground leading-tight">{s.title}</div>
                </div>
                <p className="text-xs text-muted-foreground leading-snug">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
        {/* Questions */}
        <div className="col-span-4 p-4 bg-card border-2 rounded-2xl flex flex-col gap-3 min-h-0 border-[#6366f1]/50">
          <div className="text-[10px] font-black uppercase tracking-widest text-[#6366f1]">{t('brainstorm.questionsLabel')}</div>
          <div className="flex-1 flex flex-col justify-center gap-2.5">
            {questions.map((q, i) => (
              <div key={i} className="flex items-start gap-3 p-2.5 rounded-lg bg-muted/30">
                <div className="size-6 rounded-full bg-[#6366f1]/20 flex items-center justify-center shrink-0 text-xs font-bold text-[#6366f1]">{i + 1}</div>
                <p className="text-sm text-foreground leading-snug">{q}</p>
              </div>
            ))}
          </div>
        </div>
        {/* Steps */}
        <div className="col-span-3 p-4 bg-card border-2 rounded-2xl flex flex-col gap-3 min-h-0 border-[#39B54A]/50">
          <div className="text-[10px] font-black uppercase tracking-widest text-[#39B54A]">{t('brainstorm.stepsLabel')}</div>
          <div className="flex-1 flex flex-col justify-center gap-3">
            {steps.map((s, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="shrink-0 px-2 py-1 rounded-md bg-[#39B54A]/15 text-[#39B54A] text-[10px] font-black font-mono">{s.time}</div>
                <p className="text-sm text-foreground leading-snug">{s.label}</p>
              </div>
            ))}
          </div>
          <Lightbulb className="size-10 text-[#39B54A]/40 self-center shrink-0" />
        </div>
      </div>

      <div className="shrink-0 relative z-10 mt-4 p-3 rounded-xl border-2 text-sm" style={{ borderColor: COLOR + '40', backgroundColor: COLOR + '10' }}>
        <strong className="text-foreground">{t('brainstorm.footerStrong')}</strong> <span className="text-muted-foreground">{t('brainstorm.footerBody')}</span>
      </div>
    </div>
  );
}

// ─── Section ────────────────────────────────────────────────────────────────

export function Section3() {
  const { t } = useTranslation(NS);
  const section3Chapters = useMemo(
    () =>
      section3ChaptersShape.map((ch) =>
        ch.kind === 'group'
          ? { kind: 'group' as const, id: ch.id, label: t(`groups.${ch.id}`) }
          : { id: ch.id, label: t(`chapters.${ch.id}`) },
      ),
    [t],
  );
  return (
    <div className="h-full w-full flex overflow-hidden">
      <SectionNav chapters={section3Chapters} />
      <div id="section-scroll" className="flex-1 overflow-y-auto snap-y snap-mandatory">
        <div className="slide-flow">

        {/* ═══════ TITLE ═══════ */}
        <div className="h-full">
          <TitleSlide
            sectionNumber={t('title.sectionNumber')}
            title={t('title.title')}
            subtitle={t('title.subtitle')}
            icon={<Rocket className="size-20 text-[#39B54A]" />}
            gradient="from-[#39B54A] to-[#22d3ee]"
          />
        </div>

        {/* ═══════ 1. ETHEREUM & VITALIK BUTERIN ═══════ */}
        <div id="s3-ethereum" className="h-full flex flex-col p-5 lg:p-8">

          <div className="shrink-0 mb-4">
            <div className="flex items-center gap-2 mb-1.5 text-[10px] text-muted-foreground">
              <span className="px-1.5 py-0.5 rounded bg-[#f59e0b]/15 text-[#f59e0b] font-bold">{t('ethereum.recapBadge')}</span>
              <span>{t('ethereum.recapA')} <strong className="text-foreground">{t('ethereum.recapStrong')}</strong>{t('ethereum.recapTail')}</span>
            </div>
            <div className="flex items-center gap-3 mb-1">
              <img src={ethereumLogo} alt="Ethereum" className="h-8 object-contain" />
              <h2 className="text-2xl lg:text-3xl font-bold text-foreground">{t('ethereum.heading')}</h2>
            </div>
            <p className="text-sm text-muted-foreground">{t('ethereum.lead')}</p>
          </div>

          <div className="flex-1 min-h-0 grid grid-cols-3 gap-4">

            {/* Vitalik card */}
            <div className="bg-card border border-border rounded-xl overflow-hidden flex flex-col">
              <img src={vitalikPhoto} alt={t('ethereum.vitalikName')} className="w-full object-cover object-top flex-1 min-h-0" />
              <div className="p-4 shrink-0">
                <div className="font-black text-foreground text-lg leading-tight">{t('ethereum.vitalikName')}</div>
                <div className="text-xs text-[#627EEA] font-medium mt-0.5">{t('ethereum.vitalikRole')}</div>
                <div className="text-xs text-muted-foreground mt-2">{t('ethereum.vitalikBio')} <span className="text-foreground font-bold">{t('ethereum.vitalikAge')}</span>.</div>
              </div>
            </div>

            {/* Timeline + why */}
            <div className="col-span-2 flex flex-col gap-3 min-h-0">

              <div className="bg-card border border-border rounded-xl p-4 flex flex-col gap-3">
                <h3 className="font-bold text-foreground text-sm">{t('ethereum.whyTitle')}</h3>
                <p className="text-sm text-muted-foreground">
                  {t('ethereum.whyP1A')} <span className="text-foreground font-medium">{t('ethereum.whyP1Strong')}</span> {t('ethereum.whyP1Tail')}
                </p>
                <p className="text-sm text-muted-foreground">
                  {t('ethereum.whyP2A')} <span className="text-foreground font-medium">{t('ethereum.whyP2Strong1')}</span> {t('ethereum.whyP2Mid')} <span className="text-foreground font-medium">{t('ethereum.whyP2Strong2')}</span>{t('ethereum.whyP2Tail')}
                </p>
              </div>

              <div className="flex gap-3 flex-1 min-h-0">

                <div className="flex flex-col gap-2 flex-1">
                  {(['#627EEA','#627EEA','#39B54A','#ED1C24','#8b5cf6','#8b5cf6','#22d3ee']).map((color, i) => {
                    const events = t('ethereum.events', { returnObjects: true }) as Array<{ year: string; label: string }>;
                    const ev = events[i];
                    const soon = i === 6;
                    return (
                      <div key={i} className={`flex items-center gap-3 rounded-lg px-3 py-2 ${soon ? 'bg-[#22d3ee]/10 border border-dashed border-[#22d3ee]/50' : 'bg-card border border-border'}`}>
                        <span className="font-black text-sm shrink-0" style={{ color }}>{ev.year}</span>
                        <span className="text-sm text-muted-foreground flex-1">{ev.label}</span>
                        {soon && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#22d3ee]/20 text-[#22d3ee] shrink-0">{t('ethereum.soonBadge')}</span>
                        )}
                      </div>
                    );
                  })}
                  <a
                    href="https://rabby.io"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 px-3 py-2.5 bg-[#7084ff]/10 border border-[#7084ff]/40 rounded-lg hover:bg-[#7084ff]/20 hover:border-[#7084ff]/70 transition-all group mt-1"
                  >
                    <span className="text-xl shrink-0">🐰</span>
                    <div className="flex-1">
                      <div className="text-sm font-bold text-[#7084ff]">{t('ethereum.walletCta')}</div>
                      <div className="text-xs text-muted-foreground">rabby.io</div>
                    </div>
                    <ExternalLink className="size-4 text-[#7084ff]/60 group-hover:text-[#7084ff] transition-colors shrink-0" />
                  </a>
                </div>

                <div className="w-40 shrink-0 flex flex-col gap-2">
                  <div className="bg-gradient-to-br from-[#627EEA]/20 to-transparent border border-[#627EEA]/40 rounded-xl p-3 flex flex-col items-center text-center flex-1">
                    <img src={ethereumLogo} alt="ETH" className="h-10 object-contain mb-2" />
                    <div className="text-xl font-black text-[#627EEA]">{t('ethereum.rank')}</div>
                    <div className="text-xs text-muted-foreground mt-1">{t('ethereum.rankNote')}</div>
                  </div>
                  <div className="bg-card border border-border rounded-xl p-3 text-center">
                    <div className="text-lg font-black text-foreground">{t('ethereum.dappCount')}</div>
                    <div className="text-xs text-muted-foreground">{t('ethereum.dappCountNote')}</div>
                  </div>
                </div>

              </div>

            </div>

          </div>
        </div>

        {/* ═══════ ETH ACCOUNTS — EOA vs CONTRACT ═══════ */}
        <div id="s3-accounts" className="h-full flex flex-col p-5 lg:p-8">
          <div className="shrink-0 mb-4">
            <div className="flex items-center gap-2 mb-1.5 text-[10px] text-muted-foreground">
              <span className="px-1.5 py-0.5 rounded bg-[#f59e0b]/15 text-[#f59e0b] font-bold">{t('ethAccounts.recapBadge')}</span>
              <span>{t('ethAccounts.recapA')} <strong className="text-foreground">{t('ethAccounts.recapStrong')}</strong> {t('ethAccounts.recapTail')}</span>
            </div>
            <div className="flex items-center gap-3 mb-1">
              <img src={ethereumLogo} alt="Ethereum" className="h-7 object-contain" />
              <h2 className="text-2xl lg:text-3xl font-bold text-foreground">{t('ethAccounts.title')}</h2>
            </div>
            <p className="text-sm text-muted-foreground">{t('ethAccounts.intro')}</p>
          </div>
          <div className="flex-1 min-h-0 grid grid-cols-2 gap-5">
            {/* Illustration + key rule */}
            <div className="flex flex-col gap-3 min-h-0">
              <div className="flex-1 min-h-0 bg-card border border-border rounded-xl p-4 flex items-center justify-center">
                <AccountsIllustration />
              </div>
              <div className="shrink-0 p-3 bg-[#f59e0b]/10 border border-[#f59e0b]/30 rounded-lg text-xs text-muted-foreground">
                <span className="font-bold text-[#f59e0b]">{t('ethAccounts.keyRuleStrong')}</span> {t('ethAccounts.keyRuleBody')}
              </div>
            </div>
            {/* Two account cards */}
            <div className="flex flex-col gap-3 min-h-0">
              <div className="font-bold text-sm text-foreground shrink-0">{t('ethAccounts.accountsHeader')}</div>
              <div className="flex-1 grid grid-rows-2 gap-3 min-h-0">
                <div className="p-4 bg-[#627EEA]/8 border border-[#627EEA]/30 rounded-xl flex flex-col gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">🧑</span>
                    <div className="font-bold text-[#627EEA]">{t('ethAccounts.eoaTitle')}</div>
                  </div>
                  <ul className="text-sm text-muted-foreground space-y-1.5">
                    {(t('ethAccounts.eoaPoints', { returnObjects: true }) as Array<{ leadA: string; strong: string; tail: string }>).map((p, i) => (
                      <li key={i} className="flex gap-2"><span className="text-[#627EEA] shrink-0">•</span><span>{p.leadA}{p.strong && <span className="font-semibold text-foreground">{p.strong}</span>}{p.tail}</span></li>
                    ))}
                  </ul>
                </div>
                <div className="p-4 bg-[#39B54A]/8 border border-[#39B54A]/30 rounded-xl flex flex-col gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">📄</span>
                    <div className="font-bold text-[#39B54A]">{t('ethAccounts.contractTitle')}</div>
                  </div>
                  <ul className="text-sm text-muted-foreground space-y-1.5">
                    {(t('ethAccounts.contractPoints', { returnObjects: true }) as Array<{ leadA: string; strong: string; tail: string }>).map((p, i) => (
                      <li key={i} className="flex gap-2"><span className="text-[#39B54A] shrink-0">•</span><span>{p.leadA}{p.strong && <span className="font-semibold text-foreground">{p.strong}</span>}{p.tail}</span></li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
          <PeekFooter body={t('ethAccounts.peek')} />
        </div>

        {/* ═══════ GAS — FUEL OF THE EVM ═══════ */}
        <div id="s3-gas" className="h-full flex flex-col p-5 lg:p-8">
          <div className="shrink-0 mb-4">
            <div className="flex items-center gap-2 mb-1.5 text-[10px] text-muted-foreground">
              <span className="px-1.5 py-0.5 rounded bg-[#627EEA]/15 text-[#627EEA] font-bold">{t('ethGas.recapBadge')}</span>
              <span>{t('ethGas.recapBody')}</span>
            </div>
            <div className="flex items-center gap-3 mb-1">
              <span className="text-2xl">⛽</span>
              <h2 className="text-2xl lg:text-3xl font-bold text-foreground">{t('ethGas.heading')}</h2>
            </div>
            <p className="text-sm text-muted-foreground">{t('ethGas.lead')}</p>
          </div>
          <div className="flex-1 min-h-0 grid grid-cols-3 gap-4">
            {/* Meter analogy */}
            <div className="bg-card border border-border rounded-xl p-4 flex flex-col gap-3 min-h-0">
              <div className="font-bold text-sm text-foreground">{t('ethGas.meterTitle')}</div>
              <div className="flex-1 min-h-0 flex items-center justify-center"><GasMeter /></div>
              <ul className="text-sm text-muted-foreground space-y-1.5 shrink-0">
                {(t('ethGas.meterPoints', { returnObjects: true }) as string[]).map((p, i) => (
                  <li key={i} className="flex gap-2"><span className="text-[#f59e0b] shrink-0">•</span>{p}</li>
                ))}
              </ul>
            </div>
            {/* Cost table */}
            <div className="bg-card border border-border rounded-xl p-4 flex flex-col min-h-0">
              <div className="font-bold text-sm text-foreground mb-2">{t('ethGas.examplesTitle')}</div>
              <div className="flex-1 flex flex-col justify-around">
                {(['#39B54A','#6366f1','#f59e0b','#ED1C24','#8b5cf6']).map((color, i) => {
                  const rows = t('ethGas.rows', { returnObjects: true }) as Array<{ op: string; gas: string; note: string }>;
                  const r = rows[i];
                  return (
                    <div key={i} className="flex items-center gap-3 py-2 border-b border-border/50 last:border-0">
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-semibold text-foreground">{r.op}</div>
                        <div className="text-[11px] text-muted-foreground">{r.note}</div>
                      </div>
                      <span className="text-sm font-black font-mono shrink-0" style={{ color }}>{r.gas}</span>
                    </div>
                  );
                })}
              </div>
            </div>
            {/* Fee formula */}
            <div className="bg-[#627EEA]/8 border border-[#627EEA]/30 rounded-xl p-4 flex flex-col min-h-0">
              <div className="font-black text-base font-mono text-[#627EEA] mb-3 text-center py-2 rounded-lg bg-[#627EEA]/10">{t('ethGas.formulaTitle')}</div>
              <ul className="text-sm text-muted-foreground space-y-3 flex-1 flex flex-col justify-center">
                {(t('ethGas.formulaPoints', { returnObjects: true }) as Array<{ strong: string; tail: string }>).map((p, i) => (
                  <li key={i} className="flex gap-2"><span className="text-[#627EEA] shrink-0">•</span><span>{p.strong && <span className="font-semibold text-foreground">{p.strong}</span>}<span dangerouslySetInnerHTML={{ __html: p.tail }} /></span></li>
                ))}
              </ul>
            </div>
          </div>
          <PeekFooter body={t('ethGas.peek')} />
        </div>

        {/* ═══════ SNEAK PEEKS: DeFi · NFTs · DAOs ═══════ */}
        <SneakPeekSlide id="s3-defi" index={0} color="#39B54A" icon={<Landmark className="size-6" />} illustration={v => <DefiIllustration v={v} />} />
        <SneakPeekSlide id="s3-nfts" index={1} color="#f97316" icon={<ImageIcon className="size-6" />} illustration={v => <NftIllustration v={v} />} />
        <SneakPeekSlide id="s3-daos" index={2} color="#6366f1" icon={<Vote className="size-6" />} illustration={v => <DaoIllustration v={v} />} />

        {/* ═══════ 2. BLOCKCHAIN USE CASES — GROUPED BY PATTERN ═══════ */}
        <div id="s3-usecases" className="h-full flex flex-col p-5 lg:p-8">

          <div className="shrink-0 mb-3">
            <div className="flex items-center gap-2 mb-1.5 text-[10px] text-muted-foreground">
              <span className="px-1.5 py-0.5 rounded bg-[#ED1C24]/15 text-[#ED1C24] font-bold">{t('useCases.recapBadge')}</span>
              <span>{t('useCases.recapBody')}</span>
            </div>
            <h2 className="text-2xl lg:text-3xl font-bold text-foreground mb-1">{t('useCases.heading')}</h2>
            <p className="text-sm text-muted-foreground max-w-3xl">
              {t('useCases.leadA')} <strong className="text-foreground">{t('useCases.leadStrong')}</strong> {t('useCases.leadTail')}
            </p>
          </div>

          <div className="flex-1 min-h-0 grid grid-cols-3 gap-3">
            {([
              { emoji: '🤝', color: '#f59e0b', industryEmojis: ['💰','📈','🏦','🪙'] },
              { emoji: '🔗', color: '#39B54A', industryEmojis: ['🚚','🌐','🏥','🎬'] },
              { emoji: '🌐', color: '#6366f1', industryEmojis: ['🪪','🗳️','🌍','⚖️'] },
            ]).map((cfg, i) => {
              const groups = t('useCases.groups', { returnObjects: true }) as Array<{ pattern: string; tagline: string; industries: Array<{ name: string; hook: string }> }>;
              const group = groups[i];
              return (
                <div key={i} className="flex flex-col rounded-xl border-2 bg-card overflow-hidden" style={{ borderColor: cfg.color + '55' }}>
                  <div className="h-1.5 shrink-0" style={{ backgroundColor: cfg.color }} />
                  <div className="flex flex-col flex-1 p-4 gap-3 min-h-0">
                    <div className="shrink-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-2xl">{cfg.emoji}</span>
                        <div className="text-[10px] font-black uppercase tracking-widest" style={{ color: cfg.color }}>{t('useCases.patternLabel')}</div>
                      </div>
                      <h3 className="font-black text-base lg:text-lg leading-tight text-foreground">{group.pattern}</h3>
                      <p className="text-xs text-muted-foreground mt-1 leading-snug">{group.tagline}</p>
                    </div>
                    <div className="flex-1 min-h-0 flex flex-col gap-1.5">
                      <div className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">{t('useCases.showsUpIn')}</div>
                      {group.industries.map((ind, j) => (
                        <div key={j} className="rounded-lg border bg-card/60 p-2" style={{ borderColor: cfg.color + '30' }}>
                          <div className="flex items-center gap-2">
                            <span className="text-base shrink-0">{cfg.industryEmojis[j]}</span>
                            <span className="font-bold text-xs text-foreground">{ind.name}</span>
                          </div>
                          <div className="text-[11px] text-muted-foreground leading-snug mt-0.5">{ind.hook}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="shrink-0 mt-3 p-2.5 bg-muted/40 border border-border rounded-lg text-[11px] text-muted-foreground">
            <strong className="text-foreground">{t('useCases.noticeStrong')}</strong> {t('useCases.noticeBodyA')} <em>{t('useCases.noticeBodyEm')}</em>{t('useCases.noticeBodyTail')}
          </div>
        </div>

        {/* ═══════ 2. BLOCKCHAIN & WEB3 ECOSYSTEM MAP ═══════ */}
        <div id="s3-ecosystem" className="h-full flex items-center justify-center p-8">
          <div className="max-w-4xl w-full">
            <div className="flex items-center justify-center gap-2 mb-2 text-[10px] text-muted-foreground">
              <span className="px-1.5 py-0.5 rounded bg-[#6366f1]/15 text-[#6366f1] font-bold">{t('ecosystem.recapBadge')}</span>
              <span>{t('ecosystem.recapBody')}</span>
            </div>
            <h2 className="text-3xl font-bold text-foreground mb-1 text-center">{t('ecosystem.heading')}</h2>
            <p className="text-sm text-muted-foreground text-center mb-6">
              {t('ecosystem.lead')}
            </p>

            <div className="space-y-2">

              {/* Layer: Users */}
              <div className="p-4 rounded-xl bg-gradient-to-r from-[#39B54A]/20 to-transparent border border-[#39B54A]/40">
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-base">👤</span>
                  <span className="font-bold text-[#39B54A] text-xs uppercase tracking-widest">{t('ecosystem.users')}</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {(t('ecosystem.userTags', { returnObjects: true }) as string[]).map((u, i) => (
                    <span key={i} className="px-3 py-1 bg-[#39B54A]/10 border border-[#39B54A]/30 rounded-full text-xs text-foreground">{u}</span>
                  ))}
                </div>
              </div>

              {/* Layer: Interfaces */}
              <div className="p-4 rounded-xl bg-gradient-to-r from-[#6366f1]/20 to-transparent border border-[#6366f1]/40">
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-base">🖥️</span>
                  <span className="font-bold text-[#6366f1] text-xs uppercase tracking-widest">{t('ecosystem.interfaces')}</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {(t('ecosystem.interfaceTags', { returnObjects: true }) as string[]).map((u, i) => (
                    <span key={i} className="px-3 py-1 bg-[#6366f1]/10 border border-[#6366f1]/30 rounded-full text-xs text-foreground">{u}</span>
                  ))}
                </div>
              </div>

              {/* Layer: Applications */}
              <div className="p-4 rounded-xl bg-gradient-to-r from-[#f59e0b]/20 to-transparent border border-[#f59e0b]/40">
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-base">⚙️</span>
                  <span className="font-bold text-[#f59e0b] text-xs uppercase tracking-widest">{t('ecosystem.applications')}</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {(t('ecosystem.appTags', { returnObjects: true }) as string[]).map((u, i) => (
                    <span key={i} className="px-3 py-1 bg-[#f59e0b]/10 border border-[#f59e0b]/30 rounded-full text-xs text-foreground">{u}</span>
                  ))}
                </div>
              </div>

              {/* Layer: Blockchains */}
              <div className="p-4 rounded-xl bg-gradient-to-r from-[#ED1C24]/20 to-transparent border border-[#ED1C24]/40">
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-base">⛓️</span>
                  <span className="font-bold text-[#ED1C24] text-xs uppercase tracking-widest">{t('ecosystem.blockchainLayer')}</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {(t('ecosystem.chainTags', { returnObjects: true }) as string[]).map((u, i) => (
                    <span key={i} className="px-3 py-1 bg-[#ED1C24]/10 border border-[#ED1C24]/30 rounded-full text-xs text-foreground">{u}</span>
                  ))}
                </div>
              </div>

              {/* Layer: Infrastructure */}
              <div className="p-4 rounded-xl bg-gradient-to-r from-[#9ca3af]/10 to-transparent border border-[#9ca3af]/30">
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-base">🖧</span>
                  <span className="font-bold text-muted-foreground text-xs uppercase tracking-widest">{t('ecosystem.infrastructure')}</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {(t('ecosystem.infraTags', { returnObjects: true }) as string[]).map((u, i) => (
                    <span key={i} className="px-3 py-1 bg-muted border border-border rounded-full text-xs text-foreground">{u}</span>
                  ))}
                </div>
              </div>

            </div>
          </div>
        </div>

        {/* ═══════ 3. EVOLUTION OF THE INTERNET — WEB1 / WEB2 / WEB3 ═══════ */}
        <div id="s3-web3" className="h-full flex flex-col items-center p-8">
          <div className="max-w-5xl w-full flex-1 flex flex-col min-h-0">
            <div className="flex items-center justify-center gap-2 mb-2 text-[10px] text-muted-foreground shrink-0">
              <span className="px-1.5 py-0.5 rounded bg-[#39B54A]/15 text-[#39B54A] font-bold">{t('web3.kickerBadge')}</span>
              <span>{t('web3.kickerBodyA')} <strong className="text-foreground">{t('web3.kickerStrong')}</strong> {t('web3.kickerTail')}</span>
            </div>
            <h2 className="text-3xl font-bold text-foreground mb-1 text-center shrink-0">{t('web3.heading')}</h2>
            <p className="text-sm text-muted-foreground text-center mb-4 shrink-0">
              {t('web3.lead')}
            </p>

            <div className="grid grid-cols-3 gap-5 flex-1 min-h-0">

              {/* Web1 */}
              <div className="p-6 bg-card rounded-2xl border-2 border-[#9ca3af]/40 flex flex-col gap-3 h-full overflow-y-auto">
                <div className="flex items-center gap-3">
                  <div className="size-10 rounded-full bg-[#9ca3af]/20 border border-[#9ca3af]/40 flex items-center justify-center text-lg">🌐</div>
                  <div>
                    <div className="font-black text-foreground text-lg">{t('web3.web1.label')}</div>
                    <div className="text-xs text-muted-foreground">{t('web3.web1.period')}</div>
                  </div>
                </div>
                <div className="flex items-center justify-around gap-2 py-2 px-3 bg-[#9ca3af]/10 rounded-xl">
                  <img src={amazonLogo} alt="Amazon" className="h-7 object-contain" />
                  <img src={msnLogo} alt="MSN" className="h-7 object-contain" />
                  <img src={netscapeLogo} alt="Netscape" className="h-7 object-contain" />
                </div>
                <div className="px-3 py-1.5 bg-[#9ca3af]/20 rounded-full text-center text-xs font-bold text-muted-foreground tracking-widest">{t('web3.web1.tagline')}</div>
                <ul className="space-y-1.5 text-sm text-muted-foreground flex-1">
                  {(t('web3.web1.bullets', { returnObjects: true }) as string[]).map((b, i) => (
                    <li key={i} className="flex gap-2"><span className="text-[#9ca3af] shrink-0">•</span>{b}</li>
                  ))}
                </ul>
                <div className="mt-auto p-3 bg-muted rounded-lg text-xs text-muted-foreground italic">
                  {t('web3.web1.quote')}
                </div>
              </div>

              {/* Web2 */}
              <div className="p-6 bg-card rounded-2xl border-2 border-[#6366f1]/50 flex flex-col gap-3 h-full overflow-y-auto">
                <div className="flex items-center gap-3">
                  <div className="size-10 rounded-full bg-[#6366f1]/20 border border-[#6366f1]/40 flex items-center justify-center text-lg">📱</div>
                  <div>
                    <div className="font-black text-foreground text-lg">{t('web3.web2.label')}</div>
                    <div className="text-xs text-muted-foreground">{t('web3.web2.period')}</div>
                  </div>
                </div>
                <div className="flex items-center justify-around gap-2 py-2 px-3 bg-[#6366f1]/10 rounded-xl">
                  <img src={tiktokLogo} alt="TikTok" className="h-7 object-contain" />
                  <img src={youtubeLogo} alt="YouTube" className="h-7 object-contain" />
                  <img src={xLogo} alt="X" className="h-7 object-contain rounded" />
                </div>
                <div className="px-3 py-1.5 bg-[#6366f1]/20 rounded-full text-center text-xs font-bold text-[#6366f1] tracking-widest">{t('web3.web2.tagline')}</div>
                <ul className="space-y-1.5 text-sm text-muted-foreground flex-1">
                  {(t('web3.web2.bullets', { returnObjects: true }) as string[]).map((b, i) => (
                    <li key={i} className="flex gap-2"><span className="text-[#6366f1] shrink-0">•</span>{b}</li>
                  ))}
                </ul>
                <div className="mt-auto p-3 bg-muted rounded-lg text-xs text-muted-foreground italic">
                  {t('web3.web2.quote')}
                </div>
              </div>

              {/* Web3 */}
              <div className="p-6 bg-card rounded-2xl border-2 border-[#39B54A]/60 flex flex-col gap-3 shadow-[0_0_20px_rgba(57,181,74,0.1)] h-full overflow-y-auto">
                <div className="flex items-center gap-3">
                  <div className="size-10 rounded-full bg-[#39B54A]/20 border border-[#39B54A]/50 flex items-center justify-center text-lg">🔐</div>
                  <div>
                    <div className="font-black text-foreground text-lg">{t('web3.web3.label')}</div>
                    <div className="text-xs text-[#39B54A]">{t('web3.web3.period')}</div>
                  </div>
                </div>
                <div className="flex items-center justify-around gap-2 py-2 px-3 bg-[#39B54A]/10 rounded-xl">
                  <img src={bitcoinLogo} alt="Bitcoin" className="h-7 object-contain" />
                  <img src={uniswapLogo} alt="Uniswap" className="h-7 object-contain" />
                  <img src={usdcLogo} alt="USDC" className="h-7 object-contain" />
                </div>
                <div className="px-3 py-1.5 bg-[#39B54A]/20 rounded-full text-center text-xs font-bold text-[#39B54A] tracking-widest">{t('web3.web3.tagline')}</div>
                <ul className="space-y-1.5 text-sm text-muted-foreground flex-1">
                  {(t('web3.web3.bullets', { returnObjects: true }) as string[]).map((b, i) => (
                    <li key={i} className="flex gap-2"><span className="text-[#39B54A] shrink-0">•</span>{b}</li>
                  ))}
                </ul>
                <div className="mt-auto p-3 bg-[#39B54A]/10 rounded-lg border border-[#39B54A]/20 text-xs text-muted-foreground italic">
                  {t('web3.web3.quote')}
                </div>
              </div>

            </div>
          </div>
        </div>

        {/* ═══════ 4. TODAY'S APP vs DAPP ═══════ */}
        <div id="s3-dapp" className="h-full">
          <ComparisonSlide
            title={t('dappComparison.title')}
            option1Label={t('dappComparison.option1Label')}
            option2Label={t('dappComparison.option2Label')}
            items={t('dappComparison.items', { returnObjects: true }) as Array<{ feature: string; option1: string; option2: string }>}
          />
        </div>

        {/* ═══════ 5a. ETHICS — FOUR TENSIONS ═══════ */}
        <div id="s3-ethics" className="h-full flex flex-col p-5 lg:p-8">
          <div className="shrink-0 mb-3">
            <div className="flex items-center gap-2 mb-1.5 text-[10px] text-muted-foreground">
              <span className="px-1.5 py-0.5 rounded bg-[#ED1C24]/15 text-[#ED1C24] font-bold">{t('ethics.recapBadge')}</span>
              <span>{t('ethics.recapA')} <strong className="text-foreground">{t('ethics.recapStrong')}</strong> {t('ethics.recapTail')}</span>
            </div>
            <h2 className="text-2xl lg:text-3xl font-bold text-foreground mb-1">{t('ethics.heading')}</h2>
            <p className="text-sm text-muted-foreground">{t('ethics.lead')}</p>
          </div>

          <div className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-2 shrink-0">{t('ethics.tensionsLabel')}</div>
          <div className="flex-1 min-h-0 grid grid-cols-2 grid-rows-2 gap-4">
            {(['#ED1C24','#8b5cf6','#f59e0b','#39B54A']).map((color, i) => {
              const themes = t('ethics.themes', { returnObjects: true }) as Array<{ title: string; desc: string; ask: string }>;
              const th = themes[i];
              const [emoji, ...rest] = th.title.split(' ');
              return (
                <div key={i} className="p-5 rounded-xl border flex flex-col gap-2 min-h-0" style={{ borderColor: color + '4D', background: `linear-gradient(to bottom right, ${color}26, transparent)` }}>
                  <div className="flex items-center gap-3">
                    <span className="text-3xl leading-none">{emoji}</span>
                    <div className="font-black text-lg" style={{ color }}>{rest.join(' ')}</div>
                  </div>
                  <p className="text-sm text-muted-foreground flex-1">{th.desc}</p>
                  <div className="mt-auto p-2.5 rounded-lg bg-card/70 border border-border text-xs text-foreground italic">
                    <span className="not-italic font-bold" style={{ color }}>{t('ethics.askLabel')}</span> {th.ask}
                  </div>
                </div>
              );
            })}
          </div>
          <div className="shrink-0 mt-3 text-[11px] text-muted-foreground text-center">{t('ethics.footer')}</div>
        </div>

        {/* ═══════ 5b. ETHICS — FOR GOOD vs AS CONTROL ═══════ */}
        <div id="s3-ethics-control" className="h-full flex flex-col p-5 lg:p-8">
          <div className="shrink-0 mb-3">
            <div className="flex items-center gap-2 mb-1.5 text-[10px] text-muted-foreground">
              <span className="px-1.5 py-0.5 rounded bg-[#ED1C24]/15 text-[#ED1C24] font-bold">{t('ethicsControl.recapBadge')}</span>
              <span>{t('ethicsControl.recapA')} <strong className="text-foreground">{t('ethicsControl.recapStrong')}</strong> {t('ethicsControl.recapTail')}</span>
            </div>
            <h2 className="text-2xl lg:text-3xl font-bold text-foreground mb-1">{t('ethicsControl.heading')}</h2>
            <p className="text-sm text-muted-foreground max-w-4xl">{t('ethicsControl.lead')}</p>
          </div>

          <div className="flex-1 min-h-0 grid grid-cols-2 gap-4">

            {/* Positive projects */}
            <div className="flex flex-col min-h-0">
              <div className="flex items-center gap-2 mb-2 shrink-0">
                <div className="size-5 rounded-full bg-[#39B54A] flex items-center justify-center text-white text-xs font-black">+</div>
                <h3 className="font-bold text-[#39B54A] text-sm tracking-wide">{t('ethics.goodHeader')}</h3>
                <span className="ml-auto text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[#39B54A]/15 text-[#39B54A]">{t('ethicsControl.goodTag')}</span>
              </div>

              <div className="bg-card border border-[#39B54A]/40 rounded-xl p-4 flex flex-col flex-1 min-h-0 gap-0">
                {(['🌍','🤝']).map((emoji, idx) => {
                  const good = t('ethics.good', { returnObjects: true }) as Array<{ title: string; points: string[] }>;
                  const proj = good[idx];
                  return (
                    <div key={idx} className={`flex-1 flex flex-col min-h-0 ${idx === 0 ? 'pb-3' : 'border-t border-border pt-3'}`}>
                      <div className="flex items-center gap-2 mb-2 shrink-0">
                        <span className="text-xl shrink-0">{emoji}</span>
                        <div className="font-bold text-foreground text-sm">{proj.title}</div>
                      </div>
                      <ul className="text-xs text-muted-foreground space-y-1.5">
                        {proj.points.map((p, i) => (
                          <li key={i} className="flex gap-2"><span className="text-[#39B54A] shrink-0">•</span>{p}</li>
                        ))}
                      </ul>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Negative / concerning projects */}
            <div className="flex flex-col min-h-0">
              <div className="flex items-center gap-2 mb-2 shrink-0">
                <div className="size-5 rounded-full bg-[#ED1C24] flex items-center justify-center text-white text-xs font-black">!</div>
                <h3 className="font-bold text-[#ED1C24] text-sm tracking-wide">{t('ethics.controlHeader')}</h3>
                <span className="ml-auto text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[#ED1C24]/15 text-[#ED1C24]">{t('ethicsControl.controlTag')}</span>
              </div>

              <div className="bg-card border border-[#ED1C24]/40 rounded-xl p-4 flex flex-col flex-1 min-h-0 gap-0">
                {(['🇨🇳','🇪🇺']).map((emoji, idx) => {
                  const control = t('ethics.control', { returnObjects: true }) as Array<{ title: string; points: string[] }>;
                  const proj = control[idx];
                  return (
                    <div key={idx} className={`flex-1 flex flex-col min-h-0 ${idx === 0 ? 'pb-3' : 'border-t border-border pt-3'}`}>
                      <div className="flex items-center gap-2 mb-2 shrink-0">
                        <span className="text-xl shrink-0">{emoji}</span>
                        <div className="font-bold text-foreground text-sm">{proj.title}</div>
                      </div>
                      <ul className="text-xs text-muted-foreground space-y-1.5">
                        {proj.points.map((p, i) => (
                          <li key={i} className="flex gap-2"><span className="text-[#ED1C24] shrink-0">•</span>{p}</li>
                        ))}
                      </ul>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>

          <div className="shrink-0 mt-3 p-2.5 bg-muted/40 border border-border rounded-lg text-[11px] text-muted-foreground">
            <strong className="text-foreground">{t('ethicsControl.footerStrong')}</strong> {t('ethicsControl.footerBody')}
          </div>
        </div>

        {/* ═══════ 6. FUTURE TRENDS ═══════ */}
        <div id="s3-future" className="h-full flex flex-col p-5 lg:p-8">
          <div className="shrink-0 mb-4">
            <h2 className="text-2xl lg:text-3xl font-bold text-foreground mb-1">{t('future.title')}</h2>
            <p className="text-sm text-muted-foreground max-w-3xl">{t('future.description')}</p>
          </div>
          <div className="flex-1 min-h-0 grid grid-cols-3 grid-rows-2 gap-4">
            {(['#ED1C24','#6366f1','#39B54A','#f59e0b','#8b5cf6','#22d3ee']).map((color, i) => {
              const trends = t('future.trends', { returnObjects: true }) as Array<{ title: string; desc: string }>;
              const trend = trends[i];
              const [emoji, ...rest] = trend.title.split(' ');
              return (
                <div key={i} className="p-5 rounded-xl border flex flex-col gap-2" style={{ borderColor: color + '4D', background: `linear-gradient(to bottom right, ${color}33, transparent)` }}>
                  <div className="flex items-center gap-3">
                    <span className="text-3xl leading-none">{emoji}</span>
                    <h4 className="font-bold text-base" style={{ color }}>{rest.join(' ')}</h4>
                  </div>
                  <p className="text-sm text-muted-foreground">{trend.desc}</p>
                </div>
              );
            })}
          </div>
          <div className="shrink-0 mt-3 p-2.5 rounded-lg border border-dashed text-[11px] text-muted-foreground" style={{ borderColor: PEEK + '80', backgroundColor: PEEK + '10' }}>
            <strong style={{ color: PEEK }}>{t('future.footerStrong')}</strong> {t('future.footerBody')}
          </div>
        </div>

        {/* ═══════ DISCUSSION ═══════ */}
        <div id="s3-discussion" className="h-full">
          <DiscussionSlide
            prompt={t('discussion.prompt')}
            guidingQuestions={t('discussion.guidingQuestions', { returnObjects: true }) as string[]}
          />
        </div>

        {/* ═══════ QUIZZES ═══════ */}
        <div id="s3-quiz" className="h-full">
          <QuizSlide
            question={t('quizWeb3.question')}
            options={(t('quizWeb3.options', { returnObjects: true }) as string[]).map((text, i) => ({ text, correct: i === 1 }))}
            explanation={t('quizWeb3.explanation')}
          />
        </div>

        <div className="h-full">
          <QuizSlide
            question={t('quizDapp.question')}
            options={(t('quizDapp.options', { returnObjects: true }) as string[]).map((text, i) => ({ text, correct: i === 1 }))}
            explanation={t('quizDapp.explanation')}
          />
        </div>

        <div className="h-full">
          <QuizSlide
            question={t('quizLayers.question')}
            options={(t('quizLayers.options', { returnObjects: true }) as string[]).map((text, i) => ({ text, correct: i === 2 }))}
            explanation={t('quizLayers.explanation')}
          />
        </div>

        {/* ═══════ TAKEAWAYS ═══════ */}
        <div id="s3-takeaways" className="h-full">
          <TakeawaySlide
            title={t('takeaways.title')}
            takeaways={t('takeaways.items', { returnObjects: true }) as string[]}
          />
        </div>

        {/* ═══════ KNOWLEDGE WALL — RECAP OF EVERYTHING ═══════ */}
        <div id="s3-recap" className="h-full">
          <KnowledgeWall />
        </div>

        {/* ═══════ BRAINSTORM — CLOSING ACTIVITY ═══════ */}
        <div id="s3-brainstorm" className="h-full">
          <BrainstormSlide />
        </div>

      </div>
        <SiteFooter className="snap-start" />
      </div>
    </div>
  );
}
