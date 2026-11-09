import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useParams } from 'react-router';
import { TitleSlide } from '../components/templates/TitleSlide';
import { DiscussionSlide } from '../components/templates/DiscussionSlide';
import { TakeawaySlide } from '../components/templates/TakeawaySlide';
import { QuizSlide } from '../components/templates/QuizSlide';
import { Rocket, ExternalLink, Telescope, Cpu, Landmark, Image as ImageIcon, Vote, Lightbulb, Server, Database, ServerCrash, Ban, Coins, Music, Users, FileText, Scale, Target } from 'lucide-react';
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
  { id: 's3-smartcontract' },
  { id: 's3-accounts' },
  { id: 's3-limits' },
  { id: 's3-gas' },
  { id: 's3-gas-why' },
  { id: 's3-defi' },
  { id: 's3-nfts' },
  { id: 's3-daos' },
  { id: 's3-tokens' },
  { id: 's3-tokens-sort' },

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
  { id: 's3-assignment' },
];

const PEEK = '#22d3ee';

/** Forward-pointing footer used on every "sneak peek" slide. */
function PeekFooter({ body, className = 'mt-3' }: { body: string; className?: string }) {
  const { t } = useTranslation(NS);
  return (
    <div className={`shrink-0 min-w-0 px-3 py-2 rounded-lg border border-dashed flex items-center gap-2 text-[11px] text-muted-foreground ${className}`}
      style={{ borderColor: PEEK + '80', backgroundColor: PEEK + '10' }}>
      <Telescope className="size-3.5 shrink-0" style={{ color: PEEK }} />
      <span><strong style={{ color: PEEK }}>{t('peek.label')}</strong> {body}</span>
    </div>
  );
}

const KEY = '#f59e0b';

/** The one sentence to remember from a slide — rendered as a consistent bar at the bottom. */
function KeyPoint({ body, className = 'mt-3' }: { body: string; className?: string }) {
  const { t } = useTranslation(NS);
  return (
    <div className={`shrink-0 min-w-0 px-3 py-2 rounded-lg border-2 flex items-center gap-2.5 ${className}`}
      style={{ borderColor: KEY + '80', backgroundColor: KEY + '14' }}>
      <span className="text-base leading-none shrink-0">🔑</span>
      <span className="text-[10px] font-black uppercase tracking-widest shrink-0" style={{ color: KEY }}>{t('keyPoint.label')}</span>
      <span className="text-xs lg:text-sm font-semibold text-foreground leading-snug">{body}</span>
    </div>
  );
}

/** Bottom row shared by the Ethereum cluster: key point (wide) + "later session" peek (narrow). */
function SlideFooter({ keyPoint, peek }: { keyPoint: string; peek?: string }) {
  if (!peek) return <KeyPoint body={keyPoint} />;
  return (
    <div className="shrink-0 mt-3 grid grid-cols-[3fr_2fr] gap-3">
      <KeyPoint body={keyPoint} className="" />
      <PeekFooter body={peek} className="" />
    </div>
  );
}

const HOOD = '#8b5cf6';

/** "Under the hood →" pill: names the deep topic and links to Blockchain Platforms §2, where it is taught properly. */
function TechHint({ body, className = '' }: { body: string; className?: string }) {
  const { t } = useTranslation(NS);
  const { lang = 'en' } = useParams<{ lang?: string }>();
  return (
    <Link to={`/${lang}/blockchain-platforms/section-2`} title={t('techHint.title')}
      className={`inline-flex items-center gap-1.5 shrink-0 whitespace-nowrap px-2.5 py-1 rounded-full border text-[10px] leading-tight text-muted-foreground hover:bg-[#8b5cf6]/15 transition-colors ${className}`}
      style={{ borderColor: HOOD + '66', backgroundColor: HOOD + '0f' }}>
      <Cpu className="size-3 shrink-0" style={{ color: HOOD }} />
      <strong className="shrink-0" style={{ color: HOOD }}>{t('techHint.label')}</strong>
      <span>{body}</span>
      <span className="font-bold" style={{ color: HOOD }}>· {t('techHint.target')}</span>
    </Link>
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

/** Three "who can start this?" scenarios; tap one to reveal ✓/✗ and the one-line why. */
function WhoStartsQuiz() {
  const { t } = useTranslation(NS);
  const q = t('ethAccounts.quiz', { returnObjects: true }) as { title: string; hint: string; items: Array<{ emoji: string; text: string; ok: boolean; why: string }> };
  const [open, setOpen] = useState<Record<number, boolean>>({});
  const OK = '#39B54A', RED = '#ef4444';
  return (
    <div className="shrink-0 mt-3 grid grid-cols-[auto_1fr_1fr_1fr] gap-2 items-stretch">
      <div className="px-3 py-2 rounded-xl border flex flex-col justify-center max-w-[11rem]" style={{ borderColor: KEY + '66', backgroundColor: KEY + '12' }}>
        <div className="text-xs font-black text-foreground leading-tight">{q.title}</div>
        <div className="text-[10px] text-muted-foreground leading-snug mt-0.5">{q.hint}</div>
      </div>
      {q.items.map((it, i) => {
        const shown = open[i];
        const tone = it.ok ? OK : RED;
        return (
          <button key={i} type="button" onClick={() => setOpen(o => ({ ...o, [i]: true }))} aria-expanded={!!shown}
            className="text-left px-3 py-2 rounded-xl border-2 bg-card flex items-center gap-2.5 transition-all hover:-translate-y-0.5 min-w-0"
            style={{ borderColor: shown ? tone : 'var(--border)', backgroundColor: shown ? tone + '10' : undefined }}>
            <span className="text-xl shrink-0">{it.emoji}</span>
            <div className="min-w-0">
              <div className="text-xs font-bold text-foreground leading-tight">{it.text}</div>
              {shown && <div className="text-[10px] leading-snug mt-0.5 font-semibold" style={{ color: tone }}>{it.ok ? '✓' : '✗'} {it.why}</div>}
            </div>
          </button>
        );
      })}
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

// ─── Limits: what a contract can't do ───────────────────────────────────────

interface LimitCopy { title: string; example: string; body: string; catch: string; svg: Record<string, string> }

function LimitCard({ color, emoji, copy, children }: { color: string; emoji: string; copy: LimitCopy; children: ReactNode }) {
  return (
    <div className="flex-1 min-w-0 min-h-0 rounded-2xl border-2 bg-card flex flex-col overflow-hidden" style={{ borderColor: color + '66' }}>
      <div className="px-4 py-3 flex items-center gap-3 shrink-0" style={{ background: `linear-gradient(to right, ${color}2e, transparent)` }}>
        <div className="size-12 rounded-xl flex items-center justify-center text-2xl shrink-0" style={{ backgroundColor: color + '26' }}>{emoji}</div>
        <div className="min-w-0">
          <div className="text-[10px] font-black uppercase tracking-widest" style={{ color }}>{copy.example}</div>
          <div className="font-bold text-foreground text-base lg:text-lg leading-tight">{copy.title}</div>
        </div>
      </div>
      <div className="flex-1 min-h-0 px-4 py-2 flex items-center justify-center">{children}</div>
      <div className="shrink-0 px-4 pb-4 space-y-1.5">
        <p className="text-sm lg:text-base text-muted-foreground leading-snug">{copy.body}</p>
        <p className="text-xs lg:text-sm font-bold" style={{ color }}>{copy.catch}</p>
      </div>
    </div>
  );
}

/** The chain is a closed room: an outside fact (the flight was late) only gets in when an oracle writes it on-chain. */
function OracleSvg({ v, color }: { v: Record<string, string>; color: string }) {
  const WORLD = '#f59e0b';
  return (
    <svg viewBox="0 0 320 156" className="w-full h-full max-h-56" role="img" aria-label={v.alt}>
      <ArrowDefs id="lim-oracle" color={color} />
      <rect x="8" y="14" width="124" height="128" rx="12" fill={color + '12'} stroke={color} strokeWidth="2" />
      <text x="70" y="32" fontSize="9" fontWeight="800" textAnchor="middle" fill={color}>{v.chain}</text>
      <text x="70" y="76" fontSize="30" textAnchor="middle">⚙️</text>
      <text x="70" y="94" fontSize="8.5" fontWeight="700" textAnchor="middle" fill="var(--foreground)">{v.contract}</text>
      <line x1="160" y1="6" x2="160" y2="150" stroke="var(--muted-foreground)" strokeWidth="3" strokeDasharray="6 4" />
      <text x="250" y="32" fontSize="9" fontWeight="800" textAnchor="middle" fill={WORLD}>{v.world}</text>
      <text x="250" y="76" fontSize="30" textAnchor="middle">✈️</text>
      <rect x="198" y="84" width="104" height="18" rx="9" fill={WORLD + '1f'} stroke={WORLD} strokeWidth="1.2" />
      <text x="250" y="96.5" fontSize="8.5" fontWeight="700" textAnchor="middle" fill={WORLD}>{v.fact}</text>
      <line x1="250" y1="102" x2="250" y2="122" stroke={color} strokeWidth="2" />
      <line x1="250" y1="122" x2="182" y2="122" stroke={color} strokeWidth="2" />
      <path d="M138,122 L70,122 L70,104" fill="none" stroke={color} strokeWidth="2" markerEnd="url(#lim-oracle)" />
      <rect x="138" y="110" width="44" height="24" rx="8" fill="var(--card)" stroke={color} strokeWidth="2" />
      <text x="160" y="126.5" fontSize="13" textAnchor="middle">📡</text>
      <text x="160" y="152" fontSize="8.5" fontWeight="800" textAnchor="middle" fill={color}>{v.oracle}</text>
      <circle r="3.5" fill={WORLD}><animateMotion dur="2.6s" repeatCount="indefinite" path="M250,102 L250,122 L70,122 L70,104" /></circle>
    </svg>
  );
}

/** No clock inside: the contract sits idle until a wallet's transaction reaches it. */
function TriggerSvg({ v, color }: { v: Record<string, string>; color: string }) {
  const WALLET = '#627EEA', RED = '#ef4444';
  return (
    <svg viewBox="0 0 320 156" className="w-full h-full max-h-56" role="img" aria-label={v.alt}>
      <ArrowDefs id="lim-trigger" color={color} />
      <text x="62" y="92" fontSize="30" textAnchor="middle">🔑</text>
      <text x="62" y="112" fontSize="8.5" fontWeight="700" textAnchor="middle" fill="var(--foreground)">{v.wallet}</text>
      <line x1="92" y1="84" x2="206" y2="84" stroke={color} strokeWidth="2.5" strokeLinecap="round" markerEnd="url(#lim-trigger)" />
      <text x="150" y="76" fontSize="8.5" fontWeight="800" textAnchor="middle" fill={color}>{v.tx}</text>
      <circle r="3.5" fill={WALLET}><animateMotion dur="2.2s" repeatCount="indefinite" path="M92,84 L204,84" /></circle>
      <rect x="212" y="54" width="100" height="62" rx="12" fill={color + '12'} stroke={color} strokeWidth="2" />
      <text x="262" y="88" fontSize="30" textAnchor="middle">⚙️</text>
      <text x="262" y="108" fontSize="8.5" fontWeight="700" textAnchor="middle" fill="var(--foreground)">{v.contract}</text>
      <text x="262" y="30" fontSize="20" textAnchor="middle">⏰</text>
      <circle cx="262" cy="23" r="15" fill="none" stroke={RED} strokeWidth="2.5" />
      <line x1="251" y1="12" x2="273" y2="34" stroke={RED} strokeWidth="2.5" strokeLinecap="round" />
      <text x="262" y="48" fontSize="8" fontWeight="800" textAnchor="middle" fill={RED}>{v.noClock}</text>
      <text x="160" y="146" fontSize="8.5" fontStyle="italic" textAnchor="middle" fill="var(--muted-foreground)">{v.caption}</text>
    </svg>
  );
}

function ContractLimitsSlide() {
  const { t } = useTranslation(NS);
  const oracle = t('contractLimits.oracle', { returnObjects: true }) as LimitCopy;
  const trigger = t('contractLimits.trigger', { returnObjects: true }) as LimitCopy;
  const ORACLE = '#39B54A', TRIGGER = '#f59e0b';
  return (
    <div id="s3-limits" className="h-full flex flex-col p-5 lg:p-8">
      <div className="shrink-0 mb-3">
        <div className="flex items-center gap-2 mb-1.5 text-[10px] text-muted-foreground">
          <span className="px-1.5 py-0.5 rounded bg-[#f59e0b]/15 text-[#f59e0b] font-bold shrink-0 whitespace-nowrap">{t('contractLimits.recapBadge')}</span>
          <span className="truncate">{t('contractLimits.recapBody')}</span>
          <TechHint body={t('contractLimits.hood')} className="ml-auto" />
        </div>
        <div className="flex items-center gap-3 mb-1">
          <Ban className="size-7 shrink-0" style={{ color: '#ef4444' }} />
          <h2 className="text-2xl lg:text-3xl font-bold text-foreground">{t('contractLimits.heading')}</h2>
        </div>
        <p className="text-sm text-muted-foreground">{t('contractLimits.lead')}</p>
      </div>
      <div className="flex-1 min-h-0 flex items-stretch gap-4">
        <LimitCard color={ORACLE} emoji="📡" copy={oracle}><OracleSvg v={oracle.svg} color={ORACLE} /></LimitCard>
        <LimitCard color={TRIGGER} emoji="⏰" copy={trigger}><TriggerSvg v={trigger.svg} color={TRIGGER} /></LimitCard>
      </div>
      <SlideFooter keyPoint={t('contractLimits.keyPoint')} peek={t('contractLimits.peek')} />
    </div>
  );
}

// ─── Interactive: a smart contract as a vending machine ─────────────────────

type VendStep = 'idle' | 'short' | 'checking' | 'done';
const VEND_PRICE = 2;

interface VendCopy {
  badge: string; hint: string; machineTitle: string; priceLabel: string; balanceLabel: string;
  insert: string; undo: string; reset: string; dispensed: string;
  display: Record<VendStep, string>; displayExploit: string;
  trace: {
    inputLabel: string; inputIdle: string; inputCoin: string; ruleLabel: string; rule: string; rulePass: string; ruleFail: string;
    ruleTypo: string; ruleTypoPass: string;
    outcomeLabel: string; outcomeIdle: string; outcomeShort: string; outcomeDone: string; outcomeExploit: string;
  };
  undoMsg: string; escrowNote: string;
  typo: { toggle: string; hint: string; undoMsg: string; pillsLabel: string; pills: string[] };
}

function TraceRow({ n, label, body, detail, color }: { n: number; label: string; body: string; detail?: string; color: string }) {
  return (
    <div className="flex-1 min-h-0 rounded-xl border bg-card px-3 py-2 flex items-center gap-3" style={{ borderColor: color + '55' }}>
      <span className="size-6 rounded-full flex items-center justify-center text-[11px] font-black text-white shrink-0" style={{ backgroundColor: color }}>{n}</span>
      <div className="min-w-0">
        <div className="text-[10px] font-black uppercase tracking-widest" style={{ color }}>{label}</div>
        <div className="text-sm text-foreground leading-snug">{body}</div>
        {detail && <div className="text-xs font-bold leading-snug" style={{ color }}>{detail}</div>}
      </div>
    </div>
  );
}

/** Insert a coin → the rule checks itself → dispense or refund. The "undo" button exists only to prove it does nothing.
 *  "Rule has a typo" flips ≥ into ≤: a €1 coin now buys a €2 can — and that runs exactly as written too (The DAO, 2016). */
function VendingMachineDemo() {
  const { t } = useTranslation(NS);
  const d = t('smartContract.demo', { returnObjects: true }) as VendCopy;
  const [step, setStep] = useState<VendStep>('idle');
  const [coin, setCoin] = useState(0);
  const [undoTried, setUndoTried] = useState(false);
  const [typo, setTypo] = useState(false);
  useEffect(() => {
    if (step !== 'checking') return;
    const id = setTimeout(() => setStep('done'), 900);
    return () => clearTimeout(id);
  }, [step]);
  const passes = (amount: number) => (typo ? amount <= VEND_PRICE : amount >= VEND_PRICE);
  const insert = (amount: number) => { setCoin(amount); setUndoTried(false); setStep(passes(amount) ? 'checking' : 'short'); };
  const reset = () => { setStep('idle'); setCoin(0); setUndoTried(false); };
  const toggleTypo = () => { setTypo(v => !v); reset(); };

  const OK = '#39B54A', AMBER = '#f59e0b', RED = '#ef4444', GRAY = '#9ca3af', BUG = '#a855f7';
  const fmt = (n: number) => `€${n}`;
  const held = step === 'checking' || step === 'done' ? coin : 0;
  const exploit = typo && coin < VEND_PRICE && step !== 'idle' && step !== 'short';
  const ruleColor = step === 'idle' ? GRAY : step === 'short' ? RED : exploit ? BUG : OK;
  const outcome = step === 'done'
    ? (exploit ? t('smartContract.demo.trace.outcomeExploit', { amount: fmt(coin) }) : d.trace.outcomeDone)
    : step === 'short' ? d.trace.outcomeShort : d.trace.outcomeIdle;
  const ruleDetail = step === 'idle' ? undefined : step === 'short' ? d.trace.ruleFail : exploit ? d.trace.ruleTypoPass : d.trace.rulePass;
  const display = step === 'done' && exploit ? d.displayExploit : d.display[step];

  return (
    <div className="h-full min-h-0 flex flex-col gap-3">
      <div className="flex items-center gap-3 shrink-0">
        <span className="px-2 py-0.5 rounded-full bg-[#f59e0b]/15 border border-[#f59e0b]/40 text-[#f59e0b] text-[10px] font-bold shrink-0">{d.badge}</span>
        <span className="text-[11px] text-muted-foreground truncate">{typo ? d.typo.hint : d.hint}</span>
        <button type="button" onClick={toggleTypo} aria-pressed={typo}
          className="ml-auto shrink-0 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[10px] font-bold transition-colors"
          style={{ borderColor: BUG + (typo ? 'ff' : '66'), backgroundColor: BUG + (typo ? '26' : '0f'), color: typo ? BUG : 'var(--muted-foreground)' }}>
          <span className={`size-3 rounded-full border transition-colors ${typo ? '' : 'bg-transparent'}`} style={{ borderColor: BUG, backgroundColor: typo ? BUG : 'transparent' }} />
          🐛 {d.typo.toggle}
        </button>
      </div>

      <div className="flex-1 min-h-0 grid grid-cols-[auto_1fr] gap-4">
        {/* The machine */}
        <div className="w-44 lg:w-52 rounded-2xl border-2 p-3 flex flex-col gap-2" style={{ borderColor: OK + '66', background: `linear-gradient(to bottom, ${OK}1f, var(--card))` }}>
          <div className="text-center text-[10px] font-black tracking-[0.3em]" style={{ color: OK }}>{d.machineTitle}</div>
          <div className="flex-1 min-h-0 rounded-xl bg-background/70 border border-border flex items-center justify-center text-5xl relative overflow-hidden">
            <span className={`transition-opacity duration-500 ${step === 'done' ? 'opacity-20' : ''}`}>🥤</span>
            {step === 'done' && <span className="absolute inset-x-0 bottom-2 text-center text-[10px] font-bold" style={{ color: OK }}>↓ {d.dispensed}</span>}
          </div>
          <div className="rounded-md px-2 py-1.5 font-mono text-[11px] font-bold text-center bg-[#0f172a]" style={{ color: step === 'short' ? RED : exploit ? BUG : OK }}>{display}</div>
          <div className="grid grid-cols-2 gap-1.5 text-[10px]">
            <div className="rounded-md border border-border bg-card px-2 py-1 text-center">
              <div className="text-muted-foreground">{d.priceLabel}</div><div className="font-mono font-black text-foreground">{fmt(VEND_PRICE)}</div>
            </div>
            <div className="rounded-md border bg-card px-2 py-1 text-center" style={{ borderColor: AMBER + '66' }}>
              <div className="text-muted-foreground">{d.balanceLabel}</div><div className="font-mono font-black" style={{ color: AMBER }}>{fmt(held)}</div>
            </div>
          </div>
          <div className="h-9 rounded-lg border border-border bg-muted/40 flex items-center justify-center text-xl" aria-live="polite">
            {step === 'done' ? '🥤' : step === 'short' ? '🪙' : ''}
          </div>
        </div>

        {/* Rule trace + controls */}
        <div className="min-w-0 flex flex-col gap-2">
          <TraceRow n={1} color={step === 'idle' ? GRAY : AMBER} label={d.trace.inputLabel}
            body={step === 'idle' ? d.trace.inputIdle : t('smartContract.demo.trace.inputCoin', { amount: fmt(coin) })} />
          <TraceRow n={2} color={ruleColor} label={d.trace.ruleLabel}
            body={t(typo ? 'smartContract.demo.trace.ruleTypo' : 'smartContract.demo.trace.rule', { price: fmt(VEND_PRICE) })}
            detail={ruleDetail} />
          <TraceRow n={3} color={step === 'done' ? (exploit ? BUG : OK) : step === 'short' ? RED : GRAY} label={d.trace.outcomeLabel} body={outcome} />

          <div className="shrink-0 flex flex-wrap items-center gap-2 pt-1">
            {step !== 'done' && [1, 2].map(a => (
              <button key={a} type="button" disabled={step === 'checking'} onClick={() => insert(a)}
                className="px-3 py-1.5 rounded-lg border text-sm font-bold transition-all hover:-translate-y-0.5 disabled:opacity-50"
                style={{ borderColor: AMBER + '80', backgroundColor: AMBER + '1a', color: AMBER }}>
                🪙 {t('smartContract.demo.insert', { amount: fmt(a) })}
              </button>
            ))}
            {step === 'done' && !undoTried && (
              <button type="button" onClick={() => setUndoTried(true)}
                className="px-3 py-1.5 rounded-lg border text-sm font-bold transition-all hover:-translate-y-0.5"
                style={{ borderColor: RED + '80', backgroundColor: RED + '14', color: RED }}>{d.undo}</button>
            )}
            {step !== 'idle' && (
              <button type="button" onClick={reset} className="px-3 py-1.5 rounded-lg border border-border bg-card text-sm font-semibold text-muted-foreground hover:bg-muted transition-colors">{d.reset}</button>
            )}
          </div>
          {undoTried && (
            <div className="shrink-0 px-3 py-2 rounded-lg border text-xs font-semibold leading-snug" style={{ borderColor: RED + '66', backgroundColor: RED + '12', color: RED }}>
              🔒 {exploit ? d.typo.undoMsg : d.undoMsg}
            </div>
          )}
          {typo ? (
            <div className="shrink-0 flex flex-wrap items-center gap-1.5 text-[10px] text-muted-foreground">
              <span className="font-bold" style={{ color: BUG }}>{d.typo.pillsLabel}</span>
              {d.typo.pills.map((p, i) => (
                <span key={i} className="px-2 py-0.5 rounded-full border font-semibold text-foreground" style={{ borderColor: BUG + '66', backgroundColor: BUG + '12' }}>{p}</span>
              ))}
            </div>
          ) : (
            <p className="shrink-0 text-[11px] text-muted-foreground italic">{d.escrowNote}</p>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Keystone slide: what is a smart contract? ──────────────────────────────

function SmartContractSlide() {
  const { t } = useTranslation(NS);
  const principles = t('smartContract.principles', { returnObjects: true }) as Array<{ emoji: string; title: string; body: string }>;
  const COLORS = ['#f59e0b', '#627EEA', '#8b5cf6', '#ef4444'];
  return (
    <div id="s3-smartcontract" className="h-full flex flex-col p-5 lg:p-8">
      <div className="shrink-0 mb-3">
        <div className="flex items-center gap-2 mb-1.5 text-[10px] text-muted-foreground">
          <span className="px-1.5 py-0.5 rounded bg-[#39B54A]/15 text-[#39B54A] font-bold shrink-0 whitespace-nowrap">{t('smartContract.kicker')}</span>
          <span className="truncate">{t('smartContract.kickerBody')}</span>
          <TechHint body={t('smartContract.hood')} className="ml-auto" />
        </div>
        <div className="flex items-center gap-3 mb-1">
          <span className="text-2xl">🤖</span>
          <h2 className="text-2xl lg:text-3xl font-bold text-foreground">{t('smartContract.heading')}</h2>
        </div>
        <p className="text-base text-foreground font-medium max-w-4xl">{t('smartContract.lead')}</p>
      </div>

      <div className="flex-1 min-h-0 grid grid-cols-5 gap-4">
        <div className="col-span-3 min-h-0"><VendingMachineDemo /></div>
        <div className="col-span-2 min-h-0 flex flex-col gap-3">
          {principles.map((p, i) => {
            const last = i === principles.length - 1;
            return (
              <div key={i} className="flex-1 min-h-0 rounded-2xl border-2 bg-card px-4 py-3 flex items-center gap-3"
                style={{ borderColor: COLORS[i] + (last ? '80' : '40'), backgroundColor: last ? COLORS[i] + '0d' : undefined }}>
                <div className="size-12 rounded-2xl text-2xl flex items-center justify-center shrink-0" style={{ backgroundColor: COLORS[i] + '1a' }}>{p.emoji}</div>
                <div className="min-w-0">
                  <div className="font-black text-base text-foreground leading-tight" style={last ? { color: COLORS[i] } : undefined}>{p.title}</div>
                  <p className="text-xs lg:text-sm text-muted-foreground mt-0.5 leading-snug">{p.body}</p>
                </div>
              </div>
            );
          })}
          <div className="shrink-0 px-3 py-2 rounded-xl bg-[#39B54A]/10 border border-[#39B54A]/30 text-[11px] text-muted-foreground">
            <span className="font-bold text-[#39B54A]">{t('smartContract.business.strong')}</span> {t('smartContract.business.body')}
          </div>
        </div>
      </div>
      <SlideFooter keyPoint={t('smartContract.keyPoint')} peek={t('smartContract.peek')} />
    </div>
  );
}

// ─── Tokens: the business primitive ─────────────────────────────────────────

interface TokenKindCopy { standard: string; title: string; sub: string; examples: string[]; verb: string }

type TokenShape = 'fungible' | 'unique';
interface SorterCard { emoji: string; label: string; answer: TokenShape; why: string }
interface SorterCopy { title: string; hint: string; countBtn: string; nameBtn: string; right: string; wrong: string; score: string; cards: SorterCard[] }

/** Six everyday things, two buckets. Tap "Fungible" (ERC-20) or "Non-fungible" (ERC-721); the card turns green or red with a one-line why. */
function TokenSorter() {
  const { t } = useTranslation(NS);
  const s = t('tokens.sorter', { returnObjects: true }) as SorterCopy;
  const [picks, setPicks] = useState<Record<number, TokenShape>>({});
  const F = '#627EEA', U = '#f97316', OK = '#39B54A', RED = '#ef4444';
  const done = Object.keys(picks).length;
  const correct = s.cards.filter((c, i) => picks[i] === c.answer).length;
  return (
    <div className="flex-1 min-h-0 flex flex-col gap-3">
      <div className="shrink-0 h-5 flex items-center justify-end">
        {done > 0 && (
          <span className="text-sm font-bold" style={{ color: correct === done ? OK : 'var(--muted-foreground)' }}>
            {t('tokens.sorter.score', { correct, total: done })}
          </span>
        )}
      </div>
      <div className="flex-1 min-h-0 grid grid-cols-3 grid-rows-2 gap-3">
        {s.cards.map((c, i) => {
          const pick = picks[i];
          const right = pick === c.answer;
          const tone = pick ? (right ? OK : RED) : 'var(--border)';
          return (
            <div key={i} className="min-h-0 rounded-2xl border-2 bg-card px-4 py-3 flex flex-col items-center justify-center text-center gap-2 transition-colors"
              style={{ borderColor: tone, backgroundColor: pick ? tone + '12' : undefined }}>
              <span className="text-4xl leading-none">{c.emoji}</span>
              <span className="text-sm lg:text-base font-bold text-foreground leading-tight">{c.label}</span>
              {pick ? (
                <p className="text-xs lg:text-sm leading-snug" style={{ color: tone }}>
                  <strong>{right ? s.right : s.wrong}</strong> {c.why}
                </p>
              ) : (
                <div className="grid grid-cols-2 gap-2 w-full max-w-xs mt-1">
                  {([['fungible', F, s.countBtn], ['unique', U, s.nameBtn]] as const).map(([shape, color, label]) => (
                    <button key={shape} type="button" onClick={() => setPicks(p => ({ ...p, [i]: shape }))}
                      className="px-2 py-1.5 rounded-lg border text-xs font-bold transition-all hover:-translate-y-0.5"
                      style={{ borderColor: color + '80', backgroundColor: color + '14', color }}>{label}</button>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function TokenSorterSlide() {
  const { t } = useTranslation(NS);
  return (
    <div id="s3-tokens-sort" className="h-full flex flex-col p-5 lg:p-8">
      <div className="shrink-0 mb-3">
        <div className="flex items-center gap-2 mb-1.5 text-[10px] text-muted-foreground">
          <span className="px-1.5 py-0.5 rounded bg-[#f59e0b]/15 text-[#f59e0b] font-bold shrink-0 whitespace-nowrap">{t('tokens.sorter.badge')}</span>
          <span className="truncate">{t('tokens.sorter.recap')}</span>
        </div>
        <div className="flex items-center gap-3 mb-1">
          <span className="text-2xl">🪙</span>
          <h2 className="text-2xl lg:text-3xl font-bold text-foreground">{t('tokens.sorter.title')}</h2>
        </div>
        <p className="text-sm text-muted-foreground max-w-4xl">{t('tokens.sorter.hint')}</p>
      </div>
      <TokenSorter />
      <SlideFooter keyPoint={t('tokens.sorter.keyPoint')} />
    </div>
  );
}

function TokensSlide() {
  const { t } = useTranslation(NS);
  const kinds = [
    { key: 'fungible', color: '#627EEA', glyph: '=' },
    { key: 'unique', color: '#f97316', glyph: '≠' },
  ] as const;
  const TINTS = ['#8b5cf6', '#22d3ee', '#ED1C24'];
  return (
    <div id="s3-tokens" className="h-full flex flex-col p-5 lg:p-8">
      <div className="shrink-0 mb-3">
        <div className="flex items-center gap-2 mb-1.5 text-[10px] text-muted-foreground">
          <span className="px-1.5 py-0.5 rounded bg-[#f59e0b]/15 text-[#f59e0b] font-bold shrink-0 whitespace-nowrap">{t('tokens.kicker')}</span>
          <span className="truncate">{t('tokens.kickerBody')}</span>
          <TechHint body={t('tokens.hood')} className="ml-auto" />
        </div>
        <div className="flex items-center gap-3 mb-1">
          <span className="text-2xl">🪙</span>
          <h2 className="text-2xl lg:text-3xl font-bold text-foreground">{t('tokens.heading')}</h2>
        </div>
        <p className="text-sm text-muted-foreground max-w-4xl">{t('tokens.lead')}</p>
      </div>

      <div className="flex-1 min-h-0 grid grid-cols-2 gap-4">
        {kinds.map(k => {
          const c = t(`tokens.${k.key}`, { returnObjects: true }) as TokenKindCopy;
          const unique = k.key === 'unique';
          return (
            <div key={k.key} className="min-h-0 rounded-2xl border-2 bg-card flex flex-col overflow-hidden" style={{ borderColor: k.color + '66' }}>
              <div className="px-4 py-3 flex items-center gap-3 shrink-0" style={{ background: `linear-gradient(to right, ${k.color}2e, transparent)` }}>
                <span className="px-2 py-0.5 rounded-md font-mono text-[11px] font-black text-white shrink-0" style={{ backgroundColor: k.color }}>{c.standard}</span>
                <div className="min-w-0">
                  <div className="font-bold text-foreground text-base lg:text-lg leading-tight">{c.title}</div>
                  <div className="text-xs text-muted-foreground">{c.sub}</div>
                </div>
              </div>
              {/* Visual: three identical coins vs three distinct tickets */}
              <div className="flex-1 min-h-0 flex items-center justify-center gap-3 px-4 py-2">
                {[0, 1, 2].map(i => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="size-20 lg:size-24 rounded-2xl border-2 flex flex-col items-center justify-center text-4xl lg:text-5xl gap-0.5"
                      style={{ borderColor: unique ? TINTS[i] : k.color, backgroundColor: (unique ? TINTS[i] : k.color) + '1a' }}>
                      {unique ? '🎟️' : '🪙'}
                      {unique && <span className="font-mono text-[11px] font-bold" style={{ color: TINTS[i] }}>#00{i + 1}</span>}
                    </div>
                    {i < 2 && <span className="text-3xl font-black" style={{ color: k.color }}>{k.glyph}</span>}
                  </div>
                ))}
              </div>
              <div className="shrink-0 px-4 pb-3 flex flex-wrap items-center gap-2">
                {c.examples.map((ex, i) => (
                  <span key={i} className="px-2.5 py-1 rounded-full border text-xs font-semibold text-foreground" style={{ borderColor: k.color + '55', backgroundColor: k.color + '10' }}>{ex}</span>
                ))}
                <span className="ml-auto text-sm font-black" style={{ color: k.color }}>{c.verb}</span>
              </div>
            </div>
          );
        })}
      </div>

      <SlideFooter keyPoint={t('tokens.keyPoint')} peek={t('tokens.peek')} />
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

/** DeFi: a real order book (bids · spread · asks, matchmaker in the middle) vs an interactive x·y=k pool. */
const POOL_ETH0 = 100, POOL_USDC0 = 300_000, POOL_K = POOL_ETH0 * POOL_USDC0, POOL_MIN_ETH = 70;
const fmtInt = (n: number) => Math.round(n).toLocaleString('en-US');

function OrderBookSvg({ v }: { v: Record<string, string> }) {
  const GRAY = '#9ca3af', BUY = '#22c55e', SELL = '#ef4444', AMBER = '#f59e0b';
  const bids = [['2,990', 1.5], ['2,985', 2.2], ['2,980', 3.0], ['2,970', 4.1]] as const;
  const asks = [['3,010', 1.2], ['3,015', 2.0], ['3,020', 2.8], ['3,030', 3.6]] as const;
  const rows = [54, 80, 106, 132];
  return (
    <svg viewBox="0 0 320 218" className="w-full h-full" role="img" aria-label={v.orderBookTitle}>
      <text x="160" y="14" fontSize="12" fontWeight="800" textAnchor="middle" fill={GRAY}>{v.orderBookTitle}</text>
      <text x="160" y="27" fontSize="8.5" textAnchor="middle" fill="var(--muted-foreground)">{v.orderBookSub}</text>
      <text x="62" y="46" fontSize="8.5" fontWeight="800" textAnchor="middle" fill={BUY}>{v.bids}</text>
      <text x="258" y="46" fontSize="8.5" fontWeight="800" textAnchor="middle" fill={SELL}>{v.asks}</text>
      {rows.map((y, i) => (
        <g key={i}>
          {/* bids descend from the best bid; the depth bar grows toward the spread */}
          <rect x="10" y={y} width="104" height="20" rx="4" fill={BUY + '12'} stroke={BUY} strokeWidth={i === 0 ? 1.6 : 0.8} />
          <rect x={114 - bids[i][1] * 22} y={y} width={bids[i][1] * 22} height="20" rx="4" fill={BUY + '2e'} />
          <text x="17" y={y + 13.5} fontSize="7" fill="var(--muted-foreground)">{bids[i][1]} ETH</text>
          <text x="107" y={y + 13.5} fontSize="9" fontFamily="monospace" fontWeight={i === 0 ? 800 : 600} textAnchor="end" fill="var(--foreground)">{bids[i][0]}</text>
          <rect x="206" y={y} width="104" height="20" rx="4" fill={SELL + '12'} stroke={SELL} strokeWidth={i === 0 ? 1.6 : 0.8} />
          <rect x="206" y={y} width={asks[i][1] * 22} height="20" rx="4" fill={SELL + '2e'} />
          <text x="213" y={y + 13.5} fontSize="9" fontFamily="monospace" fontWeight={i === 0 ? 800 : 600} fill="var(--foreground)">{asks[i][0]}</text>
          <text x="303" y={y + 13.5} fontSize="7" textAnchor="end" fill="var(--muted-foreground)">{asks[i][1]} ETH</text>
          {i > 0 && <line x1="114" y1={y + 10} x2="118" y2="146" stroke={GRAY} strokeWidth="0.8" strokeDasharray="2 2" />}
          {i > 0 && <line x1="206" y1={y + 10} x2="202" y2="146" stroke={GRAY} strokeWidth="0.8" strokeDasharray="2 2" />}
        </g>
      ))}
      {/* spread between best bid and best ask */}
      <rect x="118" y="54" width="84" height="20" rx="4" fill={AMBER + '1a'} stroke={AMBER} strokeWidth="1.4" strokeDasharray="3 2" />
      <text x="160" y="67.5" fontSize="9" fontWeight="900" textAnchor="middle" fill={AMBER}>{v.spread}</text>
      <text x="160" y="84" fontSize="7" fontStyle="italic" textAnchor="middle" fill={AMBER}>{v.spreadSub}</text>
      {/* mid price / last trade marker */}
      <line x1="122" y1="94" x2="198" y2="94" stroke={GRAY} strokeWidth="1" strokeDasharray="3 2" />
      <polygon points="160,90 164,94 160,98 156,94" fill="var(--foreground)" />
      <text x="160" y="106" fontSize="7" fontWeight="700" textAnchor="middle" fill="var(--foreground)">{v.mid}</text>
      <text x="160" y="115" fontSize="6.5" textAnchor="middle" fill="var(--muted-foreground)">{v.lastTrade}</text>
      {/* the exchange: best bid and best ask travel to it, meet, and a fee is taken */}
      <rect x="118" y="122" width="84" height="52" rx="8" fill="var(--card)" stroke={GRAY} strokeWidth="2" />
      <text x="160" y="141" fontSize="16" textAnchor="middle">🏛️</text>
      <text x="160" y="153" fontSize="8.5" fontWeight="800" textAnchor="middle" fill="var(--foreground)">{v.exchange}</text>
      <text x="160" y="162" fontSize="6.5" textAnchor="middle" fill="var(--muted-foreground)">{v.matching}</text>
      <text x="160" y="170" fontSize="6.5" fontWeight="800" textAnchor="middle" fill={AMBER}>{v.fee}</text>
      <circle r="3.5" fill={BUY}><animateMotion dur="2.6s" repeatCount="indefinite" path="M114,64 L116,64 L116,126 L124,126" /></circle>
      <circle r="3.5" fill={SELL}><animateMotion dur="2.6s" repeatCount="indefinite" path="M206,64 L204,64 L204,126 L196,126" /></circle>
      <text x="160" y="190" fontSize="8.5" fontWeight="800" textAnchor="middle" fill="var(--foreground)">{v.tradeWhen}</text>
      <text x="160" y="206" fontSize="8.5" fontStyle="italic" textAnchor="middle" fill="var(--muted-foreground)">{v.orderBookNote}</text>
    </svg>
  );
}

/** The x·y=k hyperbola with the pool's live point; `eth` is the current ETH reserve. */
function AmmSvg({ v, eth }: { v: Record<string, string>; eth: number }) {
  const G = '#39B54A', ETH = '#627EEA', USDC = '#2775CA', GRAY = '#9ca3af';
  const usdc = POOL_K / eth;
  const W = 166, H = 102;
  const px = (e: number) => ((e - 64) / 68) * W;
  const py = (u: number) => H - ((u - 220_000) / 260_000) * H;
  const curve = Array.from({ length: 35 }, (_, i) => 64 + i * 2).map((e, i) => `${i ? 'L' : 'M'}${px(e).toFixed(1)},${py(POOL_K / e).toFixed(1)}`).join(' ');
  const cx = px(eth), cy = py(usdc), moved = eth !== POOL_ETH0;
  return (
    <svg viewBox="0 0 320 172" className="w-full h-full" role="img" aria-label={v.ammTitle}>
      <ArrowDefs id="defi-arrow" color={G} />
      <text x="160" y="14" fontSize="12" fontWeight="800" textAnchor="middle" fill={G}>{v.ammTitle}</text>
      <text x="160" y="27" fontSize="8.5" textAnchor="middle" fill="var(--muted-foreground)">{v.ammSub}</text>
      {/* small pool card — reserves follow the swaps */}
      <rect x="6" y="38" width="106" height="122" rx="12" fill={G + '12'} stroke={G} strokeWidth="1.5" />
      <text x="59" y="52" fontSize="9" fontWeight="800" textAnchor="middle" fill={G}>{v.pool}</text>
      <text x="59" y="62" fontSize="6.5" textAnchor="middle" fill="var(--muted-foreground)">{v.poolFunded}</text>
      <circle cx="34" cy="84" r="15" fill={ETH} />
      <text x="34" y="87.5" fontSize="8" fontWeight="800" textAnchor="middle" fill="#fff">ETH</text>
      <circle cx="84" cy="84" r="15" fill={USDC} />
      <text x="84" y="87" fontSize="7" fontWeight="800" textAnchor="middle" fill="#fff">USDC</text>
      <text x="34" y="110" fontSize="8" fontWeight="800" fontFamily="monospace" textAnchor="middle" fill="var(--foreground)">{fmtInt(eth)}</text>
      <text x="84" y="110" fontSize="8" fontWeight="800" fontFamily="monospace" textAnchor="middle" fill="var(--foreground)">{fmtInt(usdc)}</text>
      <rect x="12" y="120" width="44" height="13" rx="4" fill={USDC + '22'} stroke={USDC + '88'} strokeWidth="0.8" />
      <text x="34" y="129" fontSize="6.5" fontWeight="700" textAnchor="middle" fill="var(--foreground)">{v.tokenIn}</text>
      <rect x="62" y="120" width="44" height="13" rx="4" fill={ETH + '22'} stroke={ETH + '88'} strokeWidth="0.8" />
      <text x="84" y="129" fontSize="6.5" fontWeight="700" textAnchor="middle" fill="var(--foreground)">{v.tokenOut}</text>
      <text x="59" y="150" fontSize="7" textAnchor="middle" fill="var(--muted-foreground)">{v.you}</text>
      {/* the curve is the hero */}
      <g transform="translate(142,40)">
        <line x1="0" y1={H} x2={W} y2={H} stroke={GRAY} strokeWidth="1" />
        <line x1="0" y1="0" x2="0" y2={H} stroke={GRAY} strokeWidth="1" />
        <text x={W / 2} y={H + 11} fontSize="7" textAnchor="middle" fill="var(--muted-foreground)">{v.axisX}</text>
        <text transform="rotate(-90)" x={-H / 2} y="-5" fontSize="7" textAnchor="middle" fill="var(--muted-foreground)">{v.axisY}</text>
        <text x={W - 2} y="12" fontSize="11" fontFamily="monospace" fontWeight="900" textAnchor="end" fill={G}>{v.formula}</text>
        <path d={curve} fill="none" stroke={G} strokeWidth="2.2" strokeLinejoin="round" />
        {moved && (
          <g opacity="0.7">
            <circle cx={px(POOL_ETH0)} cy={py(POOL_USDC0)} r="4" fill="none" stroke={GRAY} strokeWidth="1.5" strokeDasharray="2 1.5" />
            <text x={px(POOL_ETH0) + 6} y={py(POOL_USDC0) + 10} fontSize="6.5" fill="var(--muted-foreground)">{v.start}</text>
          </g>
        )}
        <g style={{ transform: `translate(${cx}px, ${cy}px)`, transition: 'transform 600ms cubic-bezier(.4,0,.2,1)' }}>
          <line x1="0" y1="0" x2="0" y2={H - cy} stroke={G} strokeWidth="1" strokeDasharray="2 2" />
          <line x1="0" y1="0" x2={-cx} y2="0" stroke={G} strokeWidth="1" strokeDasharray="2 2" />
          <text x="3" y={H - cy - 2} fontSize="7" fontWeight="800" fontFamily="monospace" fill={ETH}>{fmtInt(eth)} ETH</text>
          <text x={-cx + 3} y="-3" fontSize="7" fontWeight="800" fontFamily="monospace" fill={USDC}>{fmtInt(usdc)} USDC</text>
          <circle r="6" fill={G} stroke="var(--card)" strokeWidth="2" />
        </g>
      </g>
      <text x="160" y="169" fontSize="8.5" fontStyle="italic" textAnchor="middle" fill="var(--muted-foreground)">{v.ammNote}</text>
    </svg>
  );
}

function DefiIllustration({ v }: { v: Record<string, string> }) {
  const G = '#39B54A', AMBER = '#f59e0b';
  const [eth, setEth] = useState(POOL_ETH0);
  const usdc = POOL_K / eth, price = usdc / eth, price0 = POOL_USDC0 / POOL_ETH0;
  const bought = POOL_ETH0 - eth, paid = usdc - POOL_USDC0;
  const delta = ((price / price0 - 1) * 100).toFixed(1);
  const canSwap = (n: number) => eth - n >= POOL_MIN_ETH;
  const btn = 'px-2.5 py-1 rounded-md border text-[11px] font-bold transition-all hover:-translate-y-0.5 disabled:opacity-40 disabled:hover:translate-y-0';
  return (
    <div className="w-full h-full min-h-0 flex flex-col gap-2">
      <div className="flex-1 min-h-0 grid grid-cols-2 gap-3">
        <div className="min-h-0 flex items-center justify-center"><OrderBookSvg v={v} /></div>
        <div className="min-h-0 flex flex-col gap-1.5 border-l border-dashed border-border pl-3">
          <div className="flex-1 min-h-0 flex items-center justify-center"><AmmSvg v={v} eth={eth} /></div>
          <div className="shrink-0 flex items-center gap-2 flex-wrap">
            <span className="px-2 py-1 rounded-md border font-mono text-[11px] font-bold text-foreground" style={{ borderColor: G + '66', backgroundColor: G + '12' }}>
              {v.priceLabel} {fmtInt(price)} USDC{bought > 0 && <span className="ml-1.5" style={{ color: AMBER }}>+{delta}%</span>}
            </span>
            {bought > 0 && <span className="text-[10px] text-muted-foreground">{v.paid} {fmtInt(paid)} USDC · {bought} ETH</span>}
            <div className="ml-auto flex gap-1.5">
              {[[1, v.swapBtn], [5, v.swapBigBtn]].map(([n, label]) => (
                <button key={n} type="button" disabled={!canSwap(n as number)} onClick={() => setEth(e => e - (n as number))}
                  className={btn} style={{ borderColor: G + '80', backgroundColor: G + '14', color: G }}>{label}</button>
              ))}
              {bought > 0 && <button type="button" onClick={() => setEth(POOL_ETH0)} className={btn + ' text-muted-foreground border-border'}>{v.resetBtn}</button>}
            </div>
          </div>
          <p className="shrink-0 text-[10px] leading-snug text-muted-foreground"><strong style={{ color: AMBER }}>↗</strong> {v.impactHint}</p>
        </div>
      </div>
      <div className="shrink-0 mx-auto px-5 py-1.5 rounded-full text-[11px] font-extrabold border" style={{ color: G, backgroundColor: G + '1a', borderColor: G + '66' }}>{v.bottomLine}</div>
    </div>
  );
}

/** NFTs: the provenance trail of one token — minted, sold, sold, current owner — drawn top-down. */
function NftProvenance({ v }: { v: Record<string, string> }) {
  const C = '#f97316', ART = '#8b5cf6';
  const steps = [
    { emoji: '🎨', label: v.minted, who: 'block 18,204,112' },
    { emoji: '🔁', label: v.sold, who: '0x3f…a9' },
    { emoji: '🔁', label: v.sold, who: '0x7c…e1' },
    { emoji: '👤', label: v.currentOwner, who: '0x9b…42' },
  ];
  return (
    <svg viewBox="0 0 280 336" className="w-full h-full" role="img" aria-label={v.bottomLine}>
      <ArrowDefs id="nft-arrow" color={C} />
      <text x="140" y="16" fontSize="10" fontWeight="800" textAnchor="middle" fill={C}>{v.provenance}</text>
      {/* the token itself */}
      <rect x="100" y="28" width="80" height="66" rx="8" fill="var(--card)" stroke={C} strokeWidth="2" />
      <circle cx="140" cy="54" r="14" fill={ART} />
      <text x="140" y="85" fontSize="9" fontFamily="monospace" fontWeight="800" textAnchor="middle" fill={C}>#001</text>
      <line x1="140" y1="96" x2="140" y2="110" stroke={C} strokeWidth="2" markerEnd="url(#nft-arrow)" />
      {steps.map((s, i) => {
        const y = 112 + i * 48, last = i === 3;
        return (
          <g key={i}>
            <rect x="40" y={y} width="200" height="36" rx="10" fill={last ? C + '1f' : 'var(--card)'} stroke={C} strokeWidth={last ? 2 : 1.2} />
            <text x="60" y={y + 24} fontSize="17" textAnchor="middle">{s.emoji}</text>
            <text x="80" y={y + 15} fontSize="9.5" fontWeight="700" fill="var(--foreground)">{s.label}</text>
            <text x="80" y={y + 28} fontSize="8.5" fontFamily="monospace" fill="var(--muted-foreground)">{s.who}</text>
            {i < 3 && <line x1="140" y1={y + 38} x2="140" y2={y + 46} stroke={C} strokeWidth="2" markerEnd="url(#nft-arrow)" />}
          </g>
        );
      })}
      <text x="140" y="314" fontSize="9" fontWeight="700" textAnchor="middle" fill="var(--muted-foreground)">🔒 {v.forever}</text>
      <rect x="20" y="322" width="240" height="0" fill="none" />
      <text x="140" y="331" fontSize="9.5" fontWeight="800" textAnchor="middle" fill={C}>{v.bottomLine}</text>
    </svg>
  );
}

/** NFTs: one visual (provenance of #001) on the left; definition, three example chips and one honest note on the right. */
function NftSlide() {
  const { t } = useTranslation(NS);
  const app = (t('ethApps.apps', { returnObjects: true }) as AppPeek[])[1];
  const C = '#f97316';
  return (
    <div id="s3-nfts" className="h-full flex flex-col p-5 lg:p-8">
      <div className="shrink-0 mb-3 flex items-center gap-2 text-[10px] text-muted-foreground">
        <span className="px-1.5 py-0.5 rounded font-bold shrink-0 whitespace-nowrap" style={{ color: PEEK, backgroundColor: PEEK + '26' }}>{t('ethApps.peekBadge')}</span>
        <span className="truncate">{app.tease}</span>
        <TechHint body={app.hood} className="ml-auto" />
      </div>

      <div className="flex-1 min-h-0 grid grid-cols-12 gap-5">
        <div className="col-span-5 min-h-0 bg-card border rounded-xl p-3 flex items-center justify-center overflow-hidden" style={{ borderColor: C + '55' }}>
          <NftProvenance v={app.visual} />
        </div>
        <div className="col-span-7 min-h-0 flex flex-col justify-center gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2 flex-wrap">
              <div className="size-10 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: C + '26', color: C }}><ImageIcon className="size-6" /></div>
              <h2 className="text-2xl lg:text-3xl font-bold text-foreground leading-none">{app.title} <span className="text-base lg:text-lg font-semibold text-muted-foreground">— {app.subtitle}</span></h2>
            </div>
            <span className="inline-block text-xs italic text-muted-foreground px-2.5 py-1 rounded-full border border-border bg-card mb-2">{t('ethApps.replacesLabel')} {app.replaces}</span>
            <p className="text-base lg:text-lg text-foreground leading-snug">{app.description}</p>
          </div>
          <div>
            <div className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1.5">{t('ethApps.examplesLabel')}</div>
            <div className="flex gap-2">
              {(app.examples ?? []).map((ex, j) => (
                <div key={j} className="flex-1 min-w-0 px-3 py-2 rounded-xl border bg-card" style={{ borderColor: C + '55' }}>
                  <div className="font-bold text-sm text-foreground leading-tight">{ex.name}</div>
                  <div className="text-xs text-muted-foreground leading-snug mt-0.5">{ex.desc}</div>
                </div>
              ))}
            </div>
          </div>
          <div className="rounded-xl border border-border bg-muted/30 px-3 py-2.5 text-xs text-muted-foreground space-y-1.5">
            <div><span className="font-bold text-[#f59e0b] mr-1">{t('ethApps.hypeLabel')}</span>{app.hype}</div>
            <div><span className="font-bold text-[#ef4444] mr-1">{t('ethApps.riskLabel')}</span>{app.risk}</div>
          </div>
        </div>
      </div>

      <SlideFooter keyPoint={app.keyPoint} peek={app.later} />
    </div>
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
  examples?: Array<{ name: string; desc: string }>; risk: string; hype: string; stat?: string; later: string; hood: string; keyPoint: string;
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
          <span className="px-1.5 py-0.5 rounded font-bold shrink-0 whitespace-nowrap" style={{ color: PEEK, backgroundColor: PEEK + '26' }}>{t('ethApps.peekBadge')}</span>
          <span className="truncate">{app.tease}</span>
          <TechHint body={app.hood} className="ml-auto" />
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
        <div className="shrink-0 mt-3 grid gap-3" style={{ gridTemplateColumns: `auto repeat(${examples.length}, minmax(0, 1fr))` }}>
          <div className="px-3 flex items-center max-w-[6.5rem] text-[10px] font-black uppercase tracking-widest leading-tight text-muted-foreground">{t('ethApps.examplesLabel')}</div>
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

      <div className="shrink-0 mt-3 grid grid-cols-[auto_1fr_1fr] gap-3">
        <div className="px-4 py-2 rounded-xl border flex items-center" style={{ borderColor: color + '55', background: `linear-gradient(to right, ${color}26, transparent)` }}>
          <div className="text-sm font-black" style={{ color }}>{app.stat}</div>
        </div>
        <div className="px-3 py-2 rounded-xl bg-[#ef4444]/8 border border-[#ef4444]/30 text-xs text-muted-foreground flex items-center">
          <span className="font-bold text-[#ef4444] mr-1 shrink-0">{t('ethApps.riskLabel')}</span><span>{app.risk}</span>
        </div>
        <div className="px-3 py-2 rounded-xl bg-[#f59e0b]/8 border border-[#f59e0b]/30 text-xs text-muted-foreground flex items-center">
          <span className="font-bold text-[#f59e0b] mr-1 shrink-0">{t('ethApps.hypeLabel')}</span><span>{app.hype}</span>
        </div>
      </div>

      <SlideFooter keyPoint={app.keyPoint} peek={app.later} />
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

      <div className="flex-1 min-h-0 flex flex-col items-center justify-center gap-3">
        <div className="w-full max-w-4xl text-[10px] font-black uppercase tracking-widest text-muted-foreground">{t('useCases.showsUpIn')}</div>
        <div className="grid grid-cols-2 gap-5 w-full max-w-4xl">
          {group.industries.map((ind, j) => (
            <div key={j} className="rounded-2xl border-2 bg-card px-5 py-4 flex items-center gap-4" style={{ borderColor: cfg.color + '40', background: `linear-gradient(to bottom right, ${cfg.color}12, transparent 60%)` }}>
              <div className="size-14 rounded-2xl flex items-center justify-center text-3xl shrink-0" style={{ backgroundColor: cfg.color + '1a' }}>{cfg.industryEmojis[j]}</div>
              <div className="min-w-0">
                <div className="font-black text-lg lg:text-xl text-foreground leading-tight">{ind.name}</div>
                <div className="text-sm text-muted-foreground mt-1 leading-snug">{ind.hook}</div>
              </div>
            </div>
          ))}
        </div>
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

// ─── In-class Assignment #1 — closing group activity ─────────────────────────

function AssignmentSlide() {
  const { t } = useTranslation(NS);
  const COLOR = '#f59e0b', STAGE1 = '#39B54A', STAGE2 = '#6366f1';
  const seeds = t('assignment.seeds', { returnObjects: true }) as Array<{ emoji: string; title: string }>;
  const parts = t('assignment.parts', { returnObjects: true }) as Array<{ title: string; desc: string }>;
  const steps = t('assignment.steps', { returnObjects: true }) as Array<{ time: string; label: string }>;
  const rules = t('assignment.rules', { returnObjects: true }) as Array<{ emoji: string; text: string }>;
  const partIcons = [Target, Lightbulb, Scale];
  const partColors = ['#ED1C24', '#6366f1', '#39B54A'];
  return (
    <div className="h-full flex flex-col p-6 lg:p-10 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none opacity-60"
        style={{ background: `radial-gradient(circle at 20% 0%, ${COLOR}1f, transparent 60%), radial-gradient(circle at 80% 100%, #ED1C2418, transparent 60%)` }} />

      {/* Header */}
      <div className="shrink-0 relative z-10 mb-4 flex items-start justify-between gap-4 flex-wrap">
        <div className="flex items-start gap-4">
          <div className="px-3 py-1.5 rounded-full text-xs font-black uppercase tracking-widest text-white shadow-md shrink-0"
            style={{ background: `linear-gradient(135deg, ${COLOR}, #ED1C24)` }}>
            {t('assignment.ribbon')}
          </div>
          <div>
            <div className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">{t('assignment.contextLabel')}</div>
            <h2 className="text-2xl lg:text-3xl font-bold text-foreground mt-0.5">{t('assignment.title')}</h2>
            <p className="text-muted-foreground text-sm mt-1 max-w-3xl">{t('assignment.subtitle')}</p>
          </div>
        </div>
        <div className="shrink-0 flex items-center gap-2 self-center">
          <div className="px-3 py-1.5 rounded-full text-xs font-bold border-2 flex items-center gap-1.5"
            style={{ borderColor: COLOR + '50', color: COLOR, backgroundColor: COLOR + '10' }}>
            <Users className="size-3.5" /> {t('assignment.groupSize')}
          </div>
          <div className="px-3 py-1.5 rounded-full text-xs font-bold border-2"
            style={{ borderColor: COLOR + '50', color: COLOR, backgroundColor: COLOR + '10' }}>
            ⏱ {t('assignment.duration')}
          </div>
        </div>
      </div>

      {/* Panes */}
      <div className="flex-1 min-h-0 relative z-10 grid grid-cols-12 gap-4">
        {/* Left: pick a problem + Stage 1 (in class, spoken) */}
        <div className="col-span-5 flex flex-col gap-4 min-h-0">
          <div className="flex-1 p-4 bg-card border-2 rounded-2xl flex flex-col gap-3 min-h-0" style={{ borderColor: COLOR + '50' }}>
            <div className="text-[10px] font-black uppercase tracking-widest" style={{ color: COLOR }}>{t('assignment.seedsLabel')}</div>
            <p className="text-xs text-muted-foreground leading-snug">{t('assignment.seedsIntro')}</p>
            <div className="flex flex-wrap gap-2 content-start">
              {seeds.map((s, i) => (
                <div key={i} className="px-2.5 py-1.5 rounded-full border border-border bg-muted/30 flex items-center gap-1.5">
                  <span className="text-base leading-none">{s.emoji}</span>
                  <span className="font-semibold text-xs text-foreground leading-tight">{s.title}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="shrink-0 p-4 bg-card border-2 rounded-2xl flex flex-col gap-2.5" style={{ borderColor: STAGE1 + '80' }}>
            <div className="text-[10px] font-black uppercase tracking-widest" style={{ color: STAGE1 }}>{t('assignment.stage1Label')}</div>
            {steps.map((s, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="shrink-0 w-[5.6rem] text-center px-1.5 py-1 rounded-md text-[10px] font-black font-mono whitespace-nowrap" style={{ backgroundColor: STAGE1 + '26', color: STAGE1 }}>{s.time}</div>
                <p className="text-xs lg:text-sm text-foreground leading-snug">{s.label}</p>
              </div>
            ))}
            <p className="text-[11px] italic text-muted-foreground leading-snug border-t border-border pt-2">🗣️ {t('assignment.stage1Note')}</p>
          </div>
        </div>

        {/* Right: Stage 2 (homework) — the one-page write-up and its rules */}
        <div className="col-span-7 p-5 bg-card border-2 rounded-2xl flex flex-col gap-3 min-h-0" style={{ borderColor: STAGE2 + '80' }}>
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div className="flex items-center gap-2">
              <FileText className="size-4" style={{ color: STAGE2 }} />
              <div className="text-[10px] font-black uppercase tracking-widest" style={{ color: STAGE2 }}>{t('assignment.stage2Label')}</div>
            </div>
            <div className="px-3 py-1 rounded-full text-xs font-black border-2 text-white shadow-sm" style={{ borderColor: STAGE2, backgroundColor: STAGE2 }}>
              {t('assignment.deliverableLimit')}
            </div>
          </div>
          <div className="grid grid-cols-4 gap-2">
            {rules.map((r, i) => (
              <div key={i} className="px-2.5 py-2 rounded-xl border-2 flex items-center gap-2 text-xs font-semibold text-foreground leading-tight"
                style={{ borderColor: STAGE2 + '55', backgroundColor: STAGE2 + '10' }}>
                <span className="text-base leading-none shrink-0">{r.emoji}</span>{r.text}
              </div>
            ))}
          </div>
          <p className="text-sm text-muted-foreground leading-snug">{t('assignment.deliverableIntro')}</p>
          <div className="flex-1 min-h-0 grid grid-cols-3 gap-3">
            {parts.map((p, i) => {
              const Icon = partIcons[i];
              const c = partColors[i];
              return (
                <div key={i} className="p-4 rounded-xl border-2 bg-muted/20 flex flex-col gap-2 min-h-0 overflow-hidden" style={{ borderColor: c + '50' }}>
                  <div className="flex items-center gap-2">
                    <div className="size-7 rounded-full flex items-center justify-center text-xs font-black text-white shrink-0" style={{ backgroundColor: c }}>{i + 1}</div>
                    <Icon className="size-4 shrink-0" style={{ color: c }} />
                    <div className="font-bold text-base text-foreground leading-tight">{p.title}</div>
                  </div>
                  <p className="text-xs lg:text-sm text-muted-foreground leading-snug">{p.desc}</p>
                  <div className="mt-auto pt-2 text-[10px] font-semibold uppercase tracking-widest truncate" style={{ color: c + 'aa' }}>{t('assignment.partHint')}</div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="shrink-0 relative z-10 mt-4 p-3 rounded-xl border-2 text-sm" style={{ borderColor: COLOR + '40', backgroundColor: COLOR + '10' }}>
        <strong className="text-foreground">{t('assignment.footerStrong')}</strong> <span className="text-muted-foreground">{t('assignment.footerBody')}</span>
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

        {/* ═══════ 1. ETHEREUM — THE WORLD COMPUTER ═══════ */}
        <div id="s3-ethereum" className="h-full flex flex-col p-5 lg:p-8">

          <div className="shrink-0 mb-3">
            <div className="flex items-center gap-2 mb-1.5 text-[10px] text-muted-foreground">
              <span className="px-1.5 py-0.5 rounded bg-[#f59e0b]/15 text-[#f59e0b] font-bold shrink-0 whitespace-nowrap">{t('ethereum.recapBadge')}</span>
              <span className="truncate">{t('ethereum.recapA')} <strong className="text-foreground">{t('ethereum.recapStrong')}</strong>{t('ethereum.recapTail')}</span>
              <TechHint body={t('ethereum.hood')} className="ml-auto" />
            </div>
            <div className="flex items-center gap-3 mb-1">
              <img src={ethereumLogo} alt="Ethereum" className="h-8 object-contain" />
              <h2 className="text-2xl lg:text-3xl font-bold text-foreground">{t('ethereum.heading')}</h2>
            </div>
            <p className="text-base lg:text-lg text-foreground font-semibold">{t('ethereum.lead')}</p>
          </div>

          <div className="flex-1 min-h-0 grid grid-cols-3 gap-4">

            {/* Vitalik card + one-line origin */}
            <div className="bg-card border border-border rounded-xl overflow-hidden flex flex-col min-h-0">
              <img src={vitalikPhoto} alt={t('ethereum.vitalikName')} className="w-full object-cover object-top flex-1 min-h-0" />
              <div className="p-4 shrink-0">
                <div className="font-black text-foreground text-lg leading-tight">{t('ethereum.vitalikName')}</div>
                <div className="text-xs text-[#627EEA] font-medium mt-0.5">{t('ethereum.vitalikRole')}</div>
                <div className="text-xs text-muted-foreground mt-2">{t('ethereum.vitalikBio')} <span className="text-foreground font-bold">{t('ethereum.vitalikAge')}</span>. {t('ethereum.originLine')}</div>
              </div>
            </div>

            <div className="col-span-2 flex flex-col gap-3 min-h-0">
              {/* World-computer framing */}
              <div className="shrink-0 rounded-xl border p-4 flex items-center gap-4" style={{ borderColor: '#627EEA55', background: 'linear-gradient(to right, #627EEA26, transparent)' }}>
                <div className="size-14 rounded-2xl bg-[#627EEA]/15 flex items-center justify-center text-3xl shrink-0">🌍</div>
                <div className="min-w-0">
                  <h3 className="font-black text-foreground text-base leading-tight">{t('ethereum.worldTitle')}</h3>
                  <p className="text-sm text-muted-foreground mt-1 leading-snug">{t('ethereum.worldBody')}</p>
                </div>
              </div>

              {/* Three milestones */}
              <div className="flex-1 min-h-0 grid grid-cols-3 gap-3">
                {(t('ethereum.milestones', { returnObjects: true }) as Array<{ emoji: string; year: string; label: string; note: string }>).map((m, i) => {
                  const color = ['#627EEA', '#39B54A', PEEK][i];
                  return (
                    <div key={i} className="min-h-0 rounded-xl border-2 bg-card p-4 flex flex-col items-center text-center justify-center gap-1.5" style={{ borderColor: color + '55', background: `linear-gradient(to bottom, ${color}14, var(--card) 60%)` }}>
                      <span className="size-16 rounded-full flex items-center justify-center text-4xl mb-1" style={{ backgroundColor: color + '1f' }}>{m.emoji}</span>
                      <span className="font-black text-2xl leading-none" style={{ color }}>{m.year}</span>
                      <span className="font-bold text-sm text-foreground leading-tight">{m.label}</span>
                      <span className="text-xs text-muted-foreground leading-snug">{m.note}</span>
                    </div>
                  );
                })}
              </div>

              <a
                href="https://rabby.io"
                target="_blank"
                rel="noopener noreferrer"
                className="shrink-0 flex items-center gap-3 px-3 py-2.5 bg-[#7084ff]/10 border border-[#7084ff]/40 rounded-lg hover:bg-[#7084ff]/20 hover:border-[#7084ff]/70 transition-all group"
              >
                <span className="text-xl shrink-0">🐰</span>
                <div className="flex-1">
                  <div className="text-sm font-bold text-[#7084ff]">{t('ethereum.walletCta')}</div>
                  <div className="text-xs text-muted-foreground">rabby.io</div>
                </div>
                <ExternalLink className="size-4 text-[#7084ff]/60 group-hover:text-[#7084ff] transition-colors shrink-0" />
              </a>
            </div>

          </div>
          <KeyPoint body={t('ethereum.keyPoint')} />
        </div>

        {/* ═══════ KEYSTONE: WHAT IS A SMART CONTRACT? ═══════ */}
        <SmartContractSlide />

        {/* ═══════ ETH ACCOUNTS — EOA vs CONTRACT ═══════ */}
        <div id="s3-accounts" className="h-full flex flex-col p-5 lg:p-8">
          <div className="shrink-0 mb-3">
            <div className="flex items-center gap-2 mb-1.5 text-[10px] text-muted-foreground">
              <span className="px-1.5 py-0.5 rounded bg-[#f59e0b]/15 text-[#f59e0b] font-bold shrink-0 whitespace-nowrap">{t('ethAccounts.recapBadge')}</span>
              <span className="truncate">{t('ethAccounts.recapA')} <strong className="text-foreground">{t('ethAccounts.recapStrong')}</strong> {t('ethAccounts.recapTail')}</span>
              <TechHint body={t('ethAccounts.hood')} className="ml-auto" />
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
          <WhoStartsQuiz />
          <SlideFooter keyPoint={t('ethAccounts.keyPoint')} peek={t('ethAccounts.peek')} />
        </div>

        {/* ═══════ LIMITS — WHAT A CONTRACT CAN'T DO ═══════ */}
        <ContractLimitsSlide />

        {/* ═══════ GAS — INTERACTIVE FEE CALCULATOR ═══════ */}
        <div id="s3-gas" className="h-full flex flex-col p-5 lg:p-8">
          <div className="shrink-0 mb-3">
            <div className="flex items-center gap-2 mb-1.5 text-[10px] text-muted-foreground">
              <span className="px-1.5 py-0.5 rounded bg-[#627EEA]/15 text-[#627EEA] font-bold shrink-0 whitespace-nowrap">{t('ethGas.recapBadge')}</span>
              <span className="truncate">{t('ethGas.recapBody')}</span>
              <TechHint body={t('ethGas.hood')} className="ml-auto" />
            </div>
            <div className="flex items-center gap-3 mb-1">
              <span className="text-2xl">⛽</span>
              <h2 className="text-2xl lg:text-3xl font-bold text-foreground">{t('ethGas.heading')}</h2>
            </div>
            <p className="text-sm text-muted-foreground">{t('ethGas.lead')}</p>
          </div>
          <div className="flex-1 min-h-0 flex justify-center">
            <div className="w-full max-w-5xl min-h-0 flex flex-col"><GasFeeDemo /></div>
          </div>
          <SlideFooter keyPoint={t('ethGas.demoKeyPoint')} peek={t('ethGas.peek')} />
        </div>

        {/* ═══════ GAS — WHY IT EXISTS (fuel analogy, surge pricing, the brake on spam) ═══════ */}
        <div id="s3-gas-why" className="h-full flex flex-col p-5 lg:p-8">
          <div className="shrink-0 mb-3">
            <div className="flex items-center gap-2 mb-1.5 text-[10px] text-muted-foreground">
              <span className="px-1.5 py-0.5 rounded bg-[#627EEA]/15 text-[#627EEA] font-bold shrink-0 whitespace-nowrap">{t('ethGas.whySlide.recapBadge')}</span>
              <span className="truncate">{t('ethGas.whySlide.recapBody')}</span>
              <TechHint body={t('ethGas.hood')} className="ml-auto" />
            </div>
            <div className="flex items-center gap-3 mb-1">
              <span className="text-2xl">⛽</span>
              <h2 className="text-2xl lg:text-3xl font-bold text-foreground">{t('ethGas.whySlide.heading')}</h2>
            </div>
            <p className="text-sm text-muted-foreground">{t('ethGas.whySlide.lead')}</p>
          </div>
          <div className="flex-1 min-h-0 grid grid-cols-2 gap-4">
            <div className="min-h-0 flex flex-col"><FuelAnalogy /></div>
            <div className="min-h-0 flex flex-col gap-4">
              {/* Surge-pricing analogy for the gas-price slider */}
              <div className="flex-1 min-h-0 px-5 py-4 rounded-2xl border-2 flex items-center gap-4" style={{ borderColor: '#f59e0b66', backgroundColor: '#f59e0b10' }}>
                <span className="text-4xl shrink-0">🚕</span>
                <div className="min-w-0">
                  <div className="text-base lg:text-lg font-bold text-foreground leading-tight">{t('ethGas.surge.title')}</div>
                  <div className="text-sm lg:text-base text-muted-foreground leading-snug mt-1">{t('ethGas.surge.body')}</div>
                </div>
              </div>
              {/* Why a per-step fee exists at all: the brake on endless loops and spam */}
              <div className="flex-1 min-h-0 px-5 py-4 rounded-2xl border-2 flex items-center gap-4" style={{ borderColor: '#ef444466', backgroundColor: '#ef444410' }}>
                <span className="text-4xl shrink-0">🔁</span>
                <div className="min-w-0">
                  <div className="text-base lg:text-lg font-bold text-foreground leading-tight">{t('ethGas.why.title')}</div>
                  <div className="text-sm lg:text-base text-muted-foreground leading-snug mt-1">{t('ethGas.why.body')}</div>
                </div>
              </div>
            </div>
          </div>
          <SlideFooter keyPoint={t('ethGas.keyPoint')} />
        </div>

        {/* ═══════ SNEAK PEEKS: DeFi · NFTs · DAOs ═══════ */}
        <SneakPeekSlide id="s3-defi" index={0} color="#39B54A" icon={<Landmark className="size-6" />} illustration={v => <DefiIllustration v={v} />} />
        <NftSlide />
        <SneakPeekSlide id="s3-daos" index={2} color="#6366f1" icon={<Vote className="size-6" />} illustration={v => <DaoIllustration v={v} />} />

        {/* ═══════ TOKENS — THE BUSINESS PRIMITIVE ═══════ */}
        <TokensSlide />
        <TokenSorterSlide />

        {/* ═══════ 2. BLOCKCHAIN USE CASES — ONE SLIDE PER PATTERN ═══════ */}
        <UseCasePatternSlide id="s3-usecases-trust" index={0} />
        <UseCasePatternSlide id="s3-usecases-provenance" index={1} />
        <UseCasePatternSlide id="s3-usecases-coord" index={2} />

        {/* ═══════ 2. BLOCKCHAIN & WEB3 ECOSYSTEM MAP ═══════ */}
        <div id="s3-ecosystem" className="h-full flex items-center justify-center p-8">
          <div className="max-w-4xl w-full">
            <div className="flex flex-col items-center gap-1 mb-2 text-[10px] text-muted-foreground text-center">
              <span className="px-1.5 py-0.5 rounded bg-[#6366f1]/15 text-[#6366f1] font-bold whitespace-nowrap">{t('ecosystem.recapBadge')}</span>
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

        {/* ═══════ IN-CLASS ASSIGNMENT #1 — CLOSING ACTIVITY ═══════ */}
        <div id="s3-assignment" className="h-full">
          <AssignmentSlide />
        </div>

      </div>
        <SiteFooter className="snap-start" />
      </div>
    </div>
  );
}
