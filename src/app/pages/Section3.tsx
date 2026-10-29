import { useMemo, useState, type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { TitleSlide } from '../components/templates/TitleSlide';
import { DiscussionSlide } from '../components/templates/DiscussionSlide';
import { TakeawaySlide } from '../components/templates/TakeawaySlide';
import { QuizSlide } from '../components/templates/QuizSlide';
import { Rocket, ExternalLink, Telescope, Landmark, Image as ImageIcon, Vote, Lightbulb, Server, Database, ServerCrash, Ban, Coins, Music } from 'lucide-react';
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
  { id: 's3-usecases-trust' },
  { id: 's3-usecases-provenance' },
  { id: 's3-usecases-coord' },
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

// ─── Accounts: EOA vs Contract ──────────────────────────────────────────────

interface AccountCopy { abbr: string; title: string; tagline: string; traits: Array<{ emoji: string; label: string }>; points: string[]; examples: string }

function AccountCard({ color, emoji, copy }: { color: string; emoji: string; copy: AccountCopy }) {
  const { t } = useTranslation(NS);
  return (
    <div className="flex-1 min-w-0 min-h-0 rounded-2xl border-2 bg-card flex flex-col overflow-hidden" style={{ borderColor: color + '66' }}>
      <div className="px-4 py-3 flex items-center gap-3 shrink-0" style={{ background: `linear-gradient(to right, ${color}2e, transparent)` }}>
        <div className="size-12 rounded-xl flex items-center justify-center text-2xl shrink-0" style={{ backgroundColor: color + '26' }}>{emoji}</div>
        <div className="min-w-0">
          <div className="text-[10px] font-black uppercase tracking-widest" style={{ color }}>{copy.abbr} · {copy.tagline}</div>
          <div className="font-bold text-foreground text-base lg:text-lg leading-tight">{copy.title}</div>
        </div>
      </div>
      <div className="shrink-0 px-4 pt-4 grid grid-cols-3 gap-2">
        {copy.traits.map((tr, i) => (
          <div key={i} className="rounded-xl border px-2 py-3 flex flex-col items-center text-center gap-1" style={{ borderColor: color + '40', backgroundColor: color + '0d' }}>
            <span className="text-2xl leading-none">{tr.emoji}</span>
            <span className="text-[11px] font-bold leading-tight text-foreground">{tr.label}</span>
          </div>
        ))}
      </div>
      <ul className="flex-1 px-4 py-3 text-sm lg:text-base text-muted-foreground space-y-3 flex flex-col justify-center">
        {copy.points.map((p, i) => (
          <li key={i} className="flex gap-2"><span className="shrink-0 font-black" style={{ color }}>•</span><span>{p}</span></li>
        ))}
      </ul>
      <div className="px-4 py-2.5 border-t border-border text-[11px] text-muted-foreground shrink-0">
        <span className="font-bold" style={{ color }}>{t('ethAccounts.examplesLabel')}</span> {copy.examples}
      </div>
    </div>
  );
}

/** The one arrow that matters on the accounts slide: EOA ──tx──▶ Contract. */
function AccountsArrow() {
  const { t } = useTranslation(NS);
  const C = '#f59e0b';
  return (
    <div className="w-36 lg:w-44 shrink-0 flex flex-col items-center justify-center gap-2 px-2 text-center">
      <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest" style={{ color: C, backgroundColor: C + '22' }}>{t('ethAccounts.arrowLabel')}</span>
      <svg viewBox="0 0 120 20" className="w-full h-5" aria-hidden>
        <ArrowDefs id="acc-arrow" color={C} />
        <line x1="2" y1="10" x2="112" y2="10" stroke={C} strokeWidth="3" strokeLinecap="round" markerEnd="url(#acc-arrow)" />
      </svg>
      <p className="text-[11px] text-muted-foreground leading-snug">{t('ethAccounts.arrowSub')}</p>
    </div>
  );
}

// ─── Interactive: gas fee calculator ────────────────────────────────────────

const ETH_USD = 3000;                                   // assumed price for the rough $ figure
const GAS_PRESETS = [0, 375, 21_000, 22_100, 500_000];  // numeric twins of ethGas.rows
const PRESET_COLORS = ['#39B54A', '#6366f1', '#f59e0b', '#ED1C24', '#8b5cf6'];
const EXAMPLE_GAS = 21_000, EXAMPLE_GWEI = 20;

const feeEth = (gas: number, gwei: number) => gas * gwei * 1e-9;
const fmtEth = (v: number) => v.toLocaleString('en-US', { maximumFractionDigits: 7 });
const fmtUsd = (v: number) => (v > 0 && v < 0.01 ? '< $0.01' : '$' + v.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }));

function GasSlider({ label, value, display, unit, min, max, step, onChange, color, aria }: {
  label: string; value: number; display: string; unit: string; min: number; max: number; step: number;
  onChange: (v: number) => void; color: string; aria: string;
}) {
  return (
    <div>
      <div className="flex items-center justify-between gap-3 mb-1">
        <span className="text-xs font-semibold text-muted-foreground">{label}</span>
        <span className="font-mono font-black text-base" style={{ color }}>{display} <span className="text-[10px] font-bold text-muted-foreground">{unit}</span></span>
      </div>
      <input type="range" min={min} max={max} step={step} value={value} onChange={e => onChange(Number(e.target.value))}
        className="w-full" style={{ accentColor: color }} aria-label={aria} />
    </div>
  );
}

function GasFeeDemo() {
  const { t } = useTranslation(NS);
  const [gas, setGas] = useState(EXAMPLE_GAS);
  const [gwei, setGwei] = useState(EXAMPLE_GWEI);
  const eth = feeEth(gas, gwei);
  const rows = t('ethGas.rows', { returnObjects: true }) as Array<{ op: string; gas: string; note: string }>;
  const C = '#627EEA';
  return (
    <div className="h-full min-h-0 flex flex-col gap-3">
      <div className="bg-card border border-border rounded-xl p-4 flex flex-col gap-3 shrink-0">
        <div className="flex items-center justify-between gap-3">
          <span className="px-2 py-0.5 rounded-full bg-[#f59e0b]/15 border border-[#f59e0b]/40 text-[#f59e0b] text-[10px] font-bold">{t('ethGas.demo.badge')}</span>
          <span className="text-[11px] text-muted-foreground">{t('ethGas.demo.hint')}</span>
        </div>
        <GasSlider label={t('ethGas.demo.gasUsed')} value={gas} display={gas.toLocaleString('en-US')} unit={t('ethGas.demo.unitGas')}
          min={0} max={600_000} step={100} onChange={setGas} color="#39B54A" aria={t('ethGas.demo.gasAria')} />
        <GasSlider label={t('ethGas.demo.gasPrice')} value={gwei} display={String(gwei)} unit={t('ethGas.demo.unitGwei')}
          min={1} max={200} step={1} onChange={setGwei} color="#f59e0b" aria={t('ethGas.demo.gweiAria')} />
      </div>

      {/* Live result */}
      <div className="flex-1 min-h-0 rounded-xl border p-4 flex flex-col items-center justify-center gap-1.5 text-center"
        style={{ borderColor: C + '55', background: `linear-gradient(to bottom right, ${C}26, transparent)` }}>
        <div className="text-[10px] font-black uppercase tracking-widest" style={{ color: C }}>{t('ethGas.demo.feeLabel')}</div>
        <div className="font-mono text-sm text-muted-foreground">
          <span className="font-bold text-[#39B54A]">{gas.toLocaleString('en-US')}</span> {t('ethGas.demo.unitGas')} × <span className="font-bold text-[#f59e0b]">{gwei}</span> {t('ethGas.demo.unitGwei')}
        </div>
        <div className="font-mono font-black text-3xl lg:text-4xl text-foreground">= {fmtEth(eth)} ETH</div>
        <div className="text-base font-bold" style={{ color: C }}>
          ≈ {fmtUsd(eth * ETH_USD)} <span className="text-[10px] font-normal text-muted-foreground">{t('ethGas.demo.priceNote', { price: '$' + ETH_USD.toLocaleString('en-US') })}</span>
        </div>
      </div>

      {/* Compact reference table — doubles as presets */}
      <div className="shrink-0">
        <div className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1.5">{t('ethGas.demo.presetsLabel')}</div>
        <div className="grid grid-cols-5 gap-1.5">
          {rows.map((r, i) => {
            const active = gas === GAS_PRESETS[i];
            return (
              <button key={i} type="button" onClick={() => setGas(GAS_PRESETS[i])}
                className="p-2.5 rounded-lg border text-left transition-all hover:-translate-y-0.5 flex flex-col gap-0.5"
                style={{ borderColor: active ? PRESET_COLORS[i] : 'var(--border)', backgroundColor: active ? PRESET_COLORS[i] + '1f' : 'var(--card)' }}>
                <div className="text-xs font-bold text-foreground leading-tight">{r.op}</div>
                <div className="font-mono font-black text-sm" style={{ color: PRESET_COLORS[i] }}>{r.gas}</div>
                <div className="text-[10px] text-muted-foreground leading-snug">{r.note}</div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function Receipt({ color, emoji, title, line, total, sub }: { color: string; emoji: string; title: string; line: string; total: string; sub?: string }) {
  return (
    <div className="rounded-xl border p-3 text-center min-w-0" style={{ borderColor: color + '66', backgroundColor: color + '0f' }}>
      <div className="text-3xl leading-none">{emoji}</div>
      <div className="text-[10px] font-black uppercase tracking-widest mt-1.5" style={{ color }}>{title}</div>
      <div className="font-mono text-xs text-muted-foreground mt-1.5 leading-tight">{line}</div>
      <div className="font-mono font-black text-base text-foreground">= {total}</div>
      {sub && <div className="font-mono text-xs font-bold" style={{ color }}>{sub}</div>}
    </div>
  );
}

/** Car-fuel analogy: litres × price-per-litre ⟷ gas units × gas price. */
function FuelAnalogy() {
  const { t } = useTranslation(NS);
  const a = t('ethGas.analogy', { returnObjects: true }) as {
    title: string; carTitle: string; carUnits: string; carPrice: string; carTotal: string; ethTitle: string;
    mapRows: Array<{ car: string; eth: string }>; caption: string;
  };
  const exEth = feeEth(EXAMPLE_GAS, EXAMPLE_GWEI);
  const CAR = '#f59e0b', ETH = '#627EEA';
  return (
    <div className="bg-card border border-border rounded-xl p-4 flex flex-col gap-3 flex-1 min-h-0">
      <div className="font-bold text-sm text-foreground shrink-0">{a.title}</div>
      <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2 shrink-0">
        <Receipt color={CAR} emoji="🚗" title={a.carTitle} line={`${a.carUnits} × ${a.carPrice}`} total={a.carTotal} />
        <span className="text-xl font-black text-muted-foreground">⟷</span>
        <Receipt color={ETH} emoji="⛽" title={a.ethTitle} line={`${EXAMPLE_GAS.toLocaleString('en-US')} gas × ${EXAMPLE_GWEI} gwei`}
          total={`${fmtEth(exEth)} ETH`} sub={`≈ ${fmtUsd(exEth * ETH_USD)}`} />
      </div>
      <div className="flex-1 flex flex-col justify-center gap-1.5">
        {a.mapRows.map((r, i) => (
          <div key={i} className="grid grid-cols-[1fr_auto_1fr] items-center gap-2 text-xs">
            <span className="px-2 py-1.5 rounded-md text-right font-semibold" style={{ backgroundColor: CAR + '1a', color: CAR }}>{r.car}</span>
            <span className="text-muted-foreground">⟷</span>
            <span className="px-2 py-1.5 rounded-md font-semibold" style={{ backgroundColor: ETH + '1a', color: ETH }}>{r.eth}</span>
          </div>
        ))}
      </div>
      <p className="text-[11px] text-muted-foreground italic text-center shrink-0">{a.caption}</p>
    </div>
  );
}

// ─── Sneak-peek illustrations (DeFi / NFTs / DAOs) ───────────────────────────

/** DeFi: order book + matchmaker (left) vs liquidity pool + x·y=k (right). */
function DefiIllustration({ v }: { v: Record<string, string> }) {
  const G = '#39B54A', GRAY = '#9ca3af', BUY = '#22c55e', SELL = '#ef4444', ETH = '#627EEA';
  const bids = ['buy @ 2,990', 'buy @ 2,985', 'buy @ 2,980', 'buy @ 2,970'];
  const asks = ['sell @ 3,010', 'sell @ 3,015', 'sell @ 3,020', 'sell @ 3,030'];
  // x·y=k drawn in the mini chart's local coordinates
  const curve = [18, 22, 26, 30, 36, 44, 54, 66, 78].map((x, i) => `${i ? 'L' : 'M'}${x},${(104 - 900 / (x - 6)).toFixed(1)}`).join(' ');
  return (
    <svg viewBox="0 0 640 250" className="w-full h-full" role="img" aria-label={v.bottomLine}>
      <ArrowDefs id="defi-arrow" color={G} />
      {/* ── Order book ── */}
      <text x="155" y="18" fontSize="12" fontWeight="800" textAnchor="middle" fill={GRAY}>{v.orderBookTitle}</text>
      <text x="155" y="32" fontSize="9" textAnchor="middle" fill="var(--muted-foreground)">{v.orderBookSub}</text>
      <text x="50" y="56" fontSize="9" fontWeight="800" textAnchor="middle" fill={BUY}>{v.buyers}</text>
      <text x="260" y="56" fontSize="9" fontWeight="800" textAnchor="middle" fill={SELL}>{v.sellers}</text>
      {[64, 90, 116, 142].map((y, i) => (
        <g key={i}>
          <rect x="14" y={y} width="72" height="18" rx="4" fill={BUY + '22'} stroke={BUY} strokeWidth="1" />
          <text x="50" y={y + 12.5} fontSize="8" fontFamily="monospace" textAnchor="middle" fill="var(--foreground)">{bids[i]}</text>
          <line x1="86" y1={y + 9} x2="104" y2="110" stroke={GRAY} strokeWidth="1" strokeDasharray="2 2" />
          <rect x="224" y={y} width="72" height="18" rx="4" fill={SELL + '22'} stroke={SELL} strokeWidth="1" />
          <text x="260" y={y + 12.5} fontSize="8" fontFamily="monospace" textAnchor="middle" fill="var(--foreground)">{asks[i]}</text>
          <line x1="206" y1="110" x2="224" y2={y + 9} stroke={GRAY} strokeWidth="1" strokeDasharray="2 2" />
        </g>
      ))}
      <rect x="104" y="78" width="102" height="64" rx="10" fill="var(--card)" stroke={GRAY} strokeWidth="2" />
      <text x="155" y="104" fontSize="18" textAnchor="middle">🏛️</text>
      <text x="155" y="121" fontSize="9" fontWeight="800" textAnchor="middle" fill="var(--foreground)">{v.exchange}</text>
      <text x="155" y="132" fontSize="7.5" textAnchor="middle" fill="var(--muted-foreground)">{v.matching}</text>
      <text x="155" y="190" fontSize="9" fontStyle="italic" textAnchor="middle" fill="var(--muted-foreground)">{v.orderBookNote}</text>

      <line x1="320" y1="10" x2="320" y2="200" stroke="var(--border)" strokeWidth="1.5" strokeDasharray="4 4" />

      {/* ── AMM ── */}
      <text x="480" y="18" fontSize="12" fontWeight="800" textAnchor="middle" fill={G}>{v.ammTitle}</text>
      <text x="480" y="32" fontSize="9" textAnchor="middle" fill="var(--muted-foreground)">{v.ammSub}</text>
      <circle cx="356" cy="110" r="22" fill={ETH + '22'} stroke={ETH} strokeWidth="2" />
      <text x="356" y="117" fontSize="18" textAnchor="middle">🧑</text>
      <text x="356" y="146" fontSize="9" fontWeight="700" textAnchor="middle" fill={ETH}>{v.you}</text>
      <rect x="404" y="52" width="122" height="116" rx="14" fill={G + '14'} stroke={G} strokeWidth="2" />
      <text x="465" y="70" fontSize="10" fontWeight="800" textAnchor="middle" fill={G}>{v.pool}</text>
      <circle cx="442" cy="104" r="18" fill={ETH} />
      <text x="442" y="108" fontSize="9" fontWeight="800" textAnchor="middle" fill="#fff">ETH</text>
      <circle cx="488" cy="104" r="18" fill="#2775CA" />
      <text x="488" y="108" fontSize="8" fontWeight="800" textAnchor="middle" fill="#fff">USDC</text>
      <text x="465" y="146" fontSize="8" textAnchor="middle" fill="var(--muted-foreground)">{v.poolFunded}</text>
      <line x1="380" y1="96" x2="400" y2="96" stroke={G} strokeWidth="2" markerEnd="url(#defi-arrow)" />
      <text x="390" y="90" fontSize="7.5" fontWeight="700" textAnchor="middle" fill="var(--foreground)">{v.tokenIn}</text>
      <line x1="400" y1="126" x2="380" y2="126" stroke={G} strokeWidth="2" markerEnd="url(#defi-arrow)" />
      <text x="390" y="137" fontSize="7.5" fontWeight="700" textAnchor="middle" fill="var(--foreground)">{v.tokenOut}</text>
      {/* mini x·y=k chart */}
      <g transform="translate(542,52)">
        <rect width="88" height="116" rx="8" fill="var(--card)" stroke="var(--border)" />
        <line x1="12" y1="104" x2="82" y2="104" stroke="var(--muted-foreground)" strokeWidth="1" />
        <line x1="12" y1="10" x2="12" y2="104" stroke="var(--muted-foreground)" strokeWidth="1" />
        <path d={curve} fill="none" stroke={G} strokeWidth="2" strokeLinejoin="round" />
        <circle r="4" fill={G}><animateMotion dur="5s" repeatCount="indefinite" path={curve} /></circle>
        <text x="80" y="22" fontSize="9" fontFamily="monospace" fontWeight="800" textAnchor="end" fill={G}>{v.formula}</text>
        <text x="80" y="113" fontSize="7" textAnchor="end" fill="var(--muted-foreground)">ETH</text>
        <text transform="rotate(-90)" x="-20" y="8" fontSize="7" fill="var(--muted-foreground)">USDC</text>
      </g>
      <text x="480" y="190" fontSize="9" fontStyle="italic" textAnchor="middle" fill="var(--muted-foreground)">{v.ammNote}</text>

      <rect x="140" y="212" width="360" height="26" rx="13" fill={G + '1a'} stroke={G + '66'} />
      <text x="320" y="229" fontSize="10.5" fontWeight="800" textAnchor="middle" fill={G}>{v.bottomLine}</text>
    </svg>
  );
}

/** NFTs: fungible vs unique tokens (top), then the provenance trail of one token (bottom). */
function NftIllustration({ v }: { v: Record<string, string> }) {
  const C = '#f97316', ETH = '#627EEA';
  const shapes = ['#8b5cf6', '#22d3ee', '#ED1C24'];
  const steps = [
    { emoji: '🎨', label: v.minted, who: 'block 18,204,112' },
    { emoji: '🔁', label: v.sold, who: '0x3f…a9' },
    { emoji: '🔁', label: v.sold, who: '0x7c…e1' },
    { emoji: '👤', label: v.currentOwner, who: '0x9b…42' },
  ];
  return (
    <svg viewBox="0 0 640 250" className="w-full h-full" role="img" aria-label={v.bottomLine}>
      <ArrowDefs id="nft-arrow" color={C} />
      {/* fungible */}
      <text x="160" y="20" fontSize="12" fontWeight="800" textAnchor="middle" fill="var(--muted-foreground)">{v.fungible}</text>
      <text x="160" y="33" fontSize="9" textAnchor="middle" fill="var(--muted-foreground)">{v.fungibleSub}</text>
      {[100, 160, 220].map((cx, i) => (
        <g key={i}>
          <circle cx={cx} cy="70" r="20" fill={ETH} stroke="#4c5fd0" strokeWidth="2" />
          <text x={cx} y="74" fontSize="9" fontWeight="800" textAnchor="middle" fill="#fff">1 ETH</text>
          {i < 2 && <text x={cx + 30} y="75" fontSize="16" fontWeight="900" textAnchor="middle" fill="var(--muted-foreground)">=</text>}
        </g>
      ))}
      <line x1="320" y1="12" x2="320" y2="104" stroke="var(--border)" strokeWidth="1.5" strokeDasharray="4 4" />
      {/* non-fungible */}
      <text x="480" y="20" fontSize="12" fontWeight="800" textAnchor="middle" fill={C}>{v.nonFungible}</text>
      <text x="480" y="33" fontSize="9" textAnchor="middle" fill="var(--muted-foreground)">{v.nonFungibleSub}</text>
      {[404, 460, 516].map((x, i) => (
        <g key={i}>
          <rect x={x} y="44" width="48" height="52" rx="5" fill="var(--card)" stroke={C} strokeWidth={i === 0 ? 2.5 : 1.5} />
          {i === 0 && <circle cx={x + 24} cy="64" r="10" fill={shapes[0]} />}
          {i === 1 && <rect x={x + 14} y="54" width="20" height="20" rx="3" fill={shapes[1]} />}
          {i === 2 && <polygon points={`${x + 24},53 ${x + 35},75 ${x + 13},75` } fill={shapes[2]} />}
          <text x={x + 24} y="90" fontSize="8" fontFamily="monospace" fontWeight="700" textAnchor="middle" fill={C}>#00{i + 1}</text>
          {i < 2 && <text x={x + 52} y="75" fontSize="16" fontWeight="900" textAnchor="middle" fill={C}>≠</text>}
        </g>
      ))}
      {/* provenance trail of #001 */}
      <line x1="20" y1="114" x2="620" y2="114" stroke="var(--border)" strokeWidth="1" />
      <text x="24" y="132" fontSize="10" fontWeight="800" fill={C}>{v.provenance}</text>
      <text x="616" y="132" fontSize="9" textAnchor="end" fill="var(--muted-foreground)">🔒 {v.forever}</text>
      <rect x="24" y="146" width="40" height="44" rx="4" fill="var(--card)" stroke={C} strokeWidth="2" />
      <circle cx="44" cy="162" r="9" fill={shapes[0]} />
      <text x="44" y="184" fontSize="7.5" fontFamily="monospace" fontWeight="700" textAnchor="middle" fill={C}>#001</text>
      <line x1="66" y1="168" x2="80" y2="168" stroke={C} strokeWidth="2" markerEnd="url(#nft-arrow)" />
      {steps.map((s, i) => {
        const x = 84 + i * 140;
        return (
          <g key={i}>
            <rect x={x} y="140" width="118" height="56" rx="10" fill={i === 3 ? C + '1f' : 'var(--card)'} stroke={C} strokeWidth={i === 3 ? 2 : 1.2} />
            <text x={x + 18} y="174" fontSize="18" textAnchor="middle">{s.emoji}</text>
            <text x={x + 36} y="163" fontSize="9" fontWeight="700" fill="var(--foreground)">{s.label}</text>
            <text x={x + 36} y="179" fontSize="8.5" fontFamily="monospace" fill="var(--muted-foreground)">{s.who}</text>
            {i < 3 && <line x1={x + 120} y1="168" x2={x + 138} y2="168" stroke={C} strokeWidth="2" markerEnd="url(#nft-arrow)" />}
          </g>
        );
      })}
      <rect x="140" y="212" width="360" height="26" rx="13" fill={C + '1a'} stroke={C + '66'} />
      <text x="320" y="229" fontSize="10.5" fontWeight="800" textAnchor="middle" fill={C}>{v.bottomLine}</text>
    </svg>
  );
}

/** DAOs: token holders → proposal → on-chain vote → auto-executing outcome. */
function DaoIllustration({ v }: { v: Record<string, string> }) {
  const C = '#6366f1', OK = '#39B54A', NO = '#ED1C24', AMBER = '#f59e0b';
  const stages = [
    { title: v.holders, sub: v.holdersSub, color: C },
    { title: v.proposal, sub: v.proposalSub, color: AMBER },
    { title: v.vote, sub: v.voteSub, color: C },
    { title: v.autoExec, sub: v.autoExecSub, color: OK },
  ];
  const xs = [20, 176, 332, 488];
  return (
    <svg viewBox="0 0 640 250" className="w-full h-full" role="img" aria-label={v.bottomLine}>
      <ArrowDefs id="dao-arrow" color={C} />
      {stages.map((s, i) => {
        const x = xs[i];
        return (
          <g key={i}>
            <circle cx={x + 14} cy="22" r="10" fill={s.color} />
            <text x={x + 14} y="26" fontSize="10" fontWeight="900" textAnchor="middle" fill="#fff">{i + 1}</text>
            <text x={x + 30} y="26" fontSize="11" fontWeight="800" fill={s.color}>{s.title}</text>
            <rect x={x} y="38" width="132" height="124" rx="12" fill={s.color + '14'} stroke={s.color} strokeWidth={i === 3 ? 2 : 1.5} />
            <text x={x + 66} y="178" fontSize="8.5" textAnchor="middle" fill="var(--muted-foreground)">{s.sub}</text>
            {i < 3 && <line x1={x + 136} y1="100" x2={x + 152} y2="100" stroke={C} strokeWidth="2" markerEnd="url(#dao-arrow)" />}
          </g>
        );
      })}
      {/* 1 · holders with token badges */}
      {[0, 1, 2].map(i => {
        const cx = xs[0] + 30 + i * 36;
        return (
          <g key={i}>
            <circle cx={cx} cy="94" r="16" fill="var(--muted)" stroke="var(--border)" />
            <text x={cx} y="100" fontSize="15" textAnchor="middle">👤</text>
            <circle cx={cx + 11} cy="106" r="7" fill={AMBER} />
            <text x={cx + 11} y="109" fontSize="7" fontWeight="900" textAnchor="middle" fill="#fff">T</text>
          </g>
        );
      })}
      {/* 2 · proposal card */}
      <rect x={xs[1] + 26} y="58" width="80" height="80" rx="6" fill="var(--card)" stroke={AMBER} strokeWidth="1.5" />
      <text x={xs[1] + 66} y="86" fontSize="20" textAnchor="middle">📜</text>
      {[100, 110, 120].map((y, i) => (
        <rect key={i} x={xs[1] + 38} y={y} width={[56, 48, 40][i]} height="4" rx="2" fill="var(--muted-foreground)" opacity="0.5" />
      ))}
      {/* 3 · vote bar */}
      <text x={xs[2] + 66} y="78" fontSize="20" textAnchor="middle">🗳️</text>
      <rect x={xs[2] + 16} y="92" width="100" height="18" rx="9" fill={NO + '66'} />
      <rect x={xs[2] + 16} y="92" width="72" height="18" rx="9" fill={OK} />
      <text x={xs[2] + 52} y="105" fontSize="9" fontWeight="900" textAnchor="middle" fill="#fff">72% {v.yes}</text>
      <text x={xs[2] + 102} y="105" fontSize="8" fontWeight="800" textAnchor="middle" fill="#fff">28%</text>
      <text x={xs[2] + 66} y="130" fontSize="8.5" textAnchor="middle" fill={NO}>{v.no}: 28%</text>
      {/* 4 · contract executes */}
      <text x={xs[3] + 66} y="80" fontSize="22" textAnchor="middle">⚙️</text>
      <circle cx={xs[3] + 66} cy="112" r="16" fill={OK} />
      <text x={xs[3] + 66} y="118" fontSize="16" fontWeight="900" textAnchor="middle" fill="#fff">✓</text>
      <text x={xs[3] + 66} y="148" fontSize="9" fontFamily="monospace" fontWeight="700" textAnchor="middle" fill={OK}>50,000 DAI → X</text>

      <rect x="140" y="206" width="360" height="26" rx="13" fill={C + '1a'} stroke={C + '66'} />
      <text x="320" y="223" fontSize="10.5" fontWeight="800" textAnchor="middle" fill={C}>{v.bottomLine}</text>
    </svg>
  );
}

// ─── Sneak-peek slide (DeFi / NFTs / DAOs) ───────────────────────────────────

interface AppPeek {
  title: string; subtitle: string; replaces: string; tease: string; description: string;
  examples?: Array<{ name: string; desc: string }>; risk: string; stat: string; later: string;
  visual: Record<string, string>;
}

function SneakPeekSlide({ id, index, color, icon, illustration }: {
  id: string; index: number; color: string; icon: ReactNode; illustration: (v: Record<string, string>) => ReactNode;
}) {
  const { t } = useTranslation(NS);
  const app = (t('ethApps.apps', { returnObjects: true }) as AppPeek[])[index];
  const examples = app.examples ?? [];
  return (
    <div id={id} className="h-full flex flex-col p-5 lg:p-8">
      <div className="shrink-0 mb-3">
        <div className="flex items-center gap-2 mb-1.5 text-[10px] text-muted-foreground">
          <span className="px-1.5 py-0.5 rounded font-bold" style={{ color: PEEK, backgroundColor: PEEK + '26' }}>{t('ethApps.peekBadge')}</span>
          <span>{app.tease}</span>
        </div>
        <div className="flex items-center gap-3 mb-1">
          <div className="size-10 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: color + '26', color }}>{icon}</div>
          <h2 className="text-2xl lg:text-3xl font-bold text-foreground leading-none">{app.title} <span className="text-base lg:text-lg font-semibold text-muted-foreground">— {app.subtitle}</span></h2>
          <span className="ml-auto text-xs italic text-muted-foreground px-2.5 py-1 rounded-full border border-border bg-card">{t('ethApps.replacesLabel')} {app.replaces}</span>
        </div>
        <p className="text-sm text-muted-foreground max-w-4xl">{app.description}</p>
      </div>

      <div className="flex-1 min-h-0 bg-card border rounded-xl p-3 flex items-center justify-center overflow-hidden" style={{ borderColor: color + '55' }}>
        {illustration(app.visual)}
      </div>
      {examples.length > 0 && (
        <div className="shrink-0 mt-3 grid grid-cols-3 gap-3">
          {examples.map((ex, j) => (
            <div key={j} className="px-3 py-2 rounded-xl bg-card border border-border flex items-center gap-3">
              <span className="size-7 rounded-lg flex items-center justify-center text-xs font-black text-white shrink-0" style={{ backgroundColor: color }}>{j + 1}</span>
              <div className="min-w-0">
                <div className="font-bold text-sm text-foreground leading-tight">{ex.name}</div>
                <div className="text-xs text-muted-foreground leading-snug">{ex.desc}</div>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="shrink-0 mt-3 grid grid-cols-[auto_1fr] gap-3">
        <div className="px-4 py-2 rounded-xl border flex items-center" style={{ borderColor: color + '55', background: `linear-gradient(to right, ${color}26, transparent)` }}>
          <div className="text-sm font-black" style={{ color }}>{app.stat}</div>
        </div>
        <div className="px-3 py-2 rounded-xl bg-[#ef4444]/8 border border-[#ef4444]/30 text-xs text-muted-foreground flex items-center">
          <span className="font-bold text-[#ef4444] mr-1">{t('ethApps.riskLabel')}</span>{app.risk}
        </div>
      </div>

      <PeekFooter body={app.later} />
    </div>
  );
}

// ─── Use cases — one slide per pattern ───────────────────────────────────────

const USECASE_SHAPE = [
  { emoji: '🤝', color: '#f59e0b', industryEmojis: ['💰', '📈', '🏦', '🪙'] },
  { emoji: '🔗', color: '#39B54A', industryEmojis: ['🚚', '🌐', '🏥', '🎬'] },
  { emoji: '🌐', color: '#6366f1', industryEmojis: ['🪪', '🗳️', '🌍', '⚖️'] },
];

interface UseCaseGroup { pattern: string; tagline: string; industries: Array<{ name: string; hook: string }> }

function UseCasePatternSlide({ id, index }: { id: string; index: number }) {
  const { t } = useTranslation(NS);
  const cfg = USECASE_SHAPE[index];
  const groups = t('useCases.groups', { returnObjects: true }) as UseCaseGroup[];
  const group = groups[index];
  return (
    <div id={id} className="h-full flex flex-col p-5 lg:p-8">
      <div className="shrink-0 mb-3">
        <div className="flex items-center gap-2 mb-2 text-[10px] text-muted-foreground">
          <span className="px-1.5 py-0.5 rounded bg-[#ED1C24]/15 text-[#ED1C24] font-bold">{t('useCases.recapBadge')}</span>
          <span>{t('useCases.recapBody')}</span>
          <span className="ml-auto px-2 py-0.5 rounded-full border font-bold shrink-0" style={{ color: cfg.color, borderColor: cfg.color + '66', backgroundColor: cfg.color + '12' }}>
            {t('useCases.patternCount', { n: index + 1 })}
          </span>
        </div>
        <div className="flex items-center gap-3">
          <div className="size-12 rounded-2xl flex items-center justify-center text-3xl shrink-0" style={{ backgroundColor: cfg.color + '26' }}>{cfg.emoji}</div>
          <div className="min-w-0">
            <div className="text-[10px] font-black uppercase tracking-widest" style={{ color: cfg.color }}>{t('useCases.heading')}</div>
            <h2 className="text-2xl lg:text-3xl font-bold text-foreground leading-tight">{group.pattern}</h2>
          </div>
        </div>
        <p className="text-sm text-muted-foreground mt-1.5 max-w-3xl">{group.tagline}</p>
      </div>

      <div className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-2 shrink-0">{t('useCases.showsUpIn')}</div>
      <div className="flex-1 min-h-0 grid grid-cols-2 grid-rows-2 gap-4">
        {group.industries.map((ind, j) => (
          <div key={j} className="rounded-2xl border-2 bg-card p-6 flex items-center gap-5 min-h-0" style={{ borderColor: cfg.color + '40', background: `linear-gradient(to bottom right, ${cfg.color}12, transparent 60%)` }}>
            <div className="size-20 rounded-2xl flex items-center justify-center text-5xl shrink-0" style={{ backgroundColor: cfg.color + '1a' }}>{cfg.industryEmojis[j]}</div>
            <div className="min-w-0">
              <div className="font-black text-xl lg:text-2xl text-foreground leading-tight">{ind.name}</div>
              <div className="text-base text-muted-foreground mt-1.5 leading-snug">{ind.hook}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Pattern strip — where we are in the three-slide tour */}
      <div className="shrink-0 mt-3 flex items-center gap-2">
        {groups.map((g, i) => (
          <div key={i} className="flex-1 flex items-center gap-2 px-3 py-1.5 rounded-lg border text-[11px] font-semibold truncate"
            style={{ borderColor: i === index ? USECASE_SHAPE[i].color : 'var(--border)', color: i === index ? USECASE_SHAPE[i].color : 'var(--muted-foreground)', backgroundColor: i === index ? USECASE_SHAPE[i].color + '12' : 'transparent' }}>
            <span>{USECASE_SHAPE[i].emoji}</span><span className="truncate">{g.pattern}</span>
          </div>
        ))}
      </div>
      {index === 2 && (
        <div className="shrink-0 mt-2 p-2.5 bg-muted/40 border border-border rounded-lg text-[11px] text-muted-foreground">
          <strong className="text-foreground">{t('useCases.noticeStrong')}</strong> {t('useCases.noticeBodyA')} <em>{t('useCases.noticeBodyEm')}</em>{t('useCases.noticeBodyTail')}
        </div>
      )}
    </div>
  );
}

// ─── App vs dApp — compact two-column comparison ─────────────────────────────

const DAPP_ROW_ICONS = [Server, Database, ServerCrash, Ban, Coins, Music];

function DappComparisonSlide() {
  const { t } = useTranslation(NS);
  const items = t('dappComparison.items', { returnObjects: true }) as Array<{ feature: string; option1: string; option2: string }>;
  const OLD = '#9ca3af', NEW = '#39B54A';
  return (
    <div id="s3-dapp" className="h-full flex flex-col p-5 lg:p-8">
      <div className="shrink-0 mb-3">
        <h2 className="text-2xl lg:text-3xl font-bold text-foreground mb-1">{t('dappComparison.title')}</h2>
        <p className="text-sm text-muted-foreground">{t('dappComparison.subtitle')}</p>
      </div>
      <div className="flex-1 min-h-0 flex flex-col w-full max-w-5xl mx-auto gap-1.5">
        <div className="grid grid-cols-[160px_1fr_1fr] gap-2 shrink-0">
          <div />
          <div className="py-2 rounded-xl text-center font-black text-sm" style={{ backgroundColor: OLD + '26', color: OLD }}>🏢 {t('dappComparison.option1Label')}</div>
          <div className="py-2 rounded-xl text-center font-black text-sm" style={{ backgroundColor: NEW + '26', color: NEW }}>⛓️ {t('dappComparison.option2Label')}</div>
        </div>
        {items.map((it, i) => {
          const Icon = DAPP_ROW_ICONS[i];
          return (
            <div key={i} className="grid grid-cols-[160px_1fr_1fr] gap-2 flex-1 min-h-0">
              <div className="flex items-center gap-2 px-3 rounded-lg bg-muted/50 text-xs font-bold text-foreground">
                <Icon className="size-4 text-muted-foreground shrink-0" /><span className="truncate">{it.feature}</span>
              </div>
              <div className="flex items-center px-3 py-1.5 rounded-lg bg-card border border-border border-l-[3px] text-sm text-muted-foreground leading-snug" style={{ borderLeftColor: OLD }}>{it.option1}</div>
              <div className="flex items-center px-3 py-1.5 rounded-lg bg-card border border-border border-l-[3px] text-sm text-foreground leading-snug" style={{ borderLeftColor: NEW }}>{it.option2}</div>
            </div>
          );
        })}
      </div>
      <PeekFooter body={t('dappComparison.peek')} />
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
          <div className="flex-1 min-h-0 flex items-stretch">
            <AccountCard color="#627EEA" emoji="🔑" copy={t('ethAccounts.eoa', { returnObjects: true }) as AccountCopy} />
            <AccountsArrow />
            <AccountCard color="#39B54A" emoji="⚙️" copy={t('ethAccounts.contract', { returnObjects: true }) as AccountCopy} />
          </div>
          <div className="shrink-0 mt-3 p-3 bg-[#f59e0b]/10 border border-[#f59e0b]/30 rounded-lg text-xs text-muted-foreground">
            <span className="font-bold text-[#f59e0b]">{t('ethAccounts.keyRuleStrong')}</span> {t('ethAccounts.keyRuleBody')}
          </div>
          <PeekFooter body={t('ethAccounts.peek')} />
        </div>

        {/* ═══════ GAS — INTERACTIVE FEE CALCULATOR ═══════ */}
        <div id="s3-gas" className="h-full flex flex-col p-5 lg:p-8">
          <div className="shrink-0 mb-3">
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
          <div className="flex-1 min-h-0 grid grid-cols-5 gap-4">
            <div className="col-span-3 min-h-0"><GasFeeDemo /></div>
            <div className="col-span-2 min-h-0 flex flex-col gap-3">
              <FuelAnalogy />
              <div className="shrink-0 p-2.5 bg-muted/40 border border-border rounded-lg text-[11px] text-muted-foreground leading-snug">{t('ethGas.eipNote')}</div>
            </div>
          </div>
          <PeekFooter body={t('ethGas.peek')} />
        </div>

        {/* ═══════ SNEAK PEEKS: DeFi · NFTs · DAOs ═══════ */}
        <SneakPeekSlide id="s3-defi" index={0} color="#39B54A" icon={<Landmark className="size-6" />} illustration={v => <DefiIllustration v={v} />} />
        <SneakPeekSlide id="s3-nfts" index={1} color="#f97316" icon={<ImageIcon className="size-6" />} illustration={v => <NftIllustration v={v} />} />
        <SneakPeekSlide id="s3-daos" index={2} color="#6366f1" icon={<Vote className="size-6" />} illustration={v => <DaoIllustration v={v} />} />

        {/* ═══════ 2. BLOCKCHAIN USE CASES — ONE SLIDE PER PATTERN ═══════ */}
        <UseCasePatternSlide id="s3-usecases-trust" index={0} />
        <UseCasePatternSlide id="s3-usecases-provenance" index={1} />
        <UseCasePatternSlide id="s3-usecases-coord" index={2} />

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
        <DappComparisonSlide />

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
            {(['#ED1C24', '#8b5cf6', '#f59e0b', '#39B54A']).map((color, i) => {
              const themes = t('ethics.themes', { returnObjects: true }) as Array<{ title: string; desc: string; ask: string }>;
              const th = themes[i];
              const [emoji, ...rest] = th.title.split(' ');
              return (
                <div key={i} className="p-5 rounded-2xl border-2 bg-card flex flex-col gap-3 min-h-0" style={{ borderColor: color + '4D' }}>
                  <div className="flex items-center gap-3">
                    <div className="size-12 rounded-xl flex items-center justify-center text-2xl shrink-0" style={{ backgroundColor: color + '26' }}>{emoji}</div>
                    <div className="font-black text-xl leading-tight" style={{ color }}>{rest.join(' ')}</div>
                  </div>
                  <p className="text-base text-muted-foreground flex-1 flex items-center">{th.desc}</p>
                  <div className="mt-auto px-3 py-2 rounded-lg text-xs text-foreground italic" style={{ backgroundColor: color + '12' }}>
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

          <div className="flex-1 min-h-0 grid grid-cols-[1fr_auto_1fr] gap-4">
            {([
              { key: 'good', color: '#39B54A', sign: '+', emojis: ['🌍', '🤝'] },
              { key: 'control', color: '#ED1C24', sign: '!', emojis: ['🇨🇳', '🇪🇺'] },
            ] as const).map((side, s) => {
              const projects = t(`ethicsControl.${side.key}`, { returnObjects: true }) as Array<{ title: string; subtitle: string; points: string[] }>;
              return (
                <div key={side.key} className={`flex flex-col min-h-0 gap-2 ${s === 1 ? 'order-3' : ''}`}>
                  <div className="shrink-0 flex items-center gap-2 px-3 py-2 rounded-xl" style={{ backgroundColor: side.color + '1f' }}>
                    <div className="size-5 rounded-full flex items-center justify-center text-white text-xs font-black" style={{ backgroundColor: side.color }}>{side.sign}</div>
                    <h3 className="font-black text-sm uppercase tracking-wide" style={{ color: side.color }}>{t(`ethicsControl.${side.key}Header`)}</h3>
                    <span className="ml-auto text-[10px] font-semibold px-2 py-0.5 rounded-full bg-card border" style={{ color: side.color, borderColor: side.color + '55' }}>{t(`ethicsControl.${side.key}Tag`)}</span>
                  </div>
                  {projects.map((proj, idx) => (
                    <div key={idx} className="flex-1 min-h-0 bg-card border-2 rounded-2xl p-4 flex flex-col gap-2" style={{ borderColor: side.color + '40' }}>
                      <div className="flex items-center gap-3 shrink-0">
                        <div className="size-10 rounded-xl flex items-center justify-center text-xl shrink-0" style={{ backgroundColor: side.color + '1a' }}>{side.emojis[idx]}</div>
                        <div className="min-w-0">
                          <div className="font-black text-foreground text-base leading-tight">{proj.title}</div>
                          <div className="text-[11px] text-muted-foreground">{proj.subtitle}</div>
                        </div>
                      </div>
                      <ul className="text-sm text-muted-foreground space-y-2 flex-1 flex flex-col justify-center">
                        {proj.points.map((p, i) => (
                          <li key={i} className="flex gap-2"><span className="shrink-0 font-black" style={{ color: side.color }}>•</span>{p}</li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              );
            })}
            <div className="order-2 self-center flex flex-col items-center gap-2 text-muted-foreground">
              <div className="w-px h-16 bg-border" />
              <span className="text-xs font-black uppercase tracking-widest">vs</span>
              <div className="w-px h-16 bg-border" />
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
            {(['#ED1C24', '#6366f1', '#39B54A', '#f59e0b', '#8b5cf6', '#22d3ee']).map((color, i) => {
              const trends = t('future.trends', { returnObjects: true }) as Array<{ title: string; blurb: string }>;
              const trend = trends[i];
              const [emoji, ...rest] = trend.title.split(' ');
              return (
                <div key={i} className="rounded-2xl border-2 bg-card p-5 flex flex-col items-center justify-center text-center gap-2 min-h-0" style={{ borderColor: color + '4D' }}>
                  <div className="size-20 rounded-full flex items-center justify-center text-5xl shrink-0" style={{ background: `linear-gradient(to bottom right, ${color}40, ${color}10)` }}>{emoji}</div>
                  <h4 className="font-black text-lg leading-tight" style={{ color }}>{rest.join(' ')}</h4>
                  <p className="text-sm text-muted-foreground leading-snug max-w-[30ch]">{trend.blurb}</p>
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
