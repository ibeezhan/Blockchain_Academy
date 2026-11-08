import { useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router';
import anime from 'animejs';
import { motion } from 'motion/react';
import { useLocalizedPath } from '../../../i18n/useLang';
import { TitleSlide } from '../../components/templates/TitleSlide';
import { TakeawaySlide } from '../../components/templates/TakeawaySlide';
import { ComparisonSlide } from '../../components/templates/ComparisonSlide';
import { SectionNav } from '../../components/navigation/SectionNav';
import { SiteFooter } from '../../components/shared/SiteFooter';
import { QuizSlide } from '../../components/templates/QuizSlide';
import { Layers } from 'lucide-react';
import { GasCalculator } from '../../components/ethereum/GasCalculator';
import { Eip1559Demo } from '../../components/ethereum/Eip1559Demo';

// Language-neutral shape — only IDs + kind. Labels come from t() at render time.
const chapterShape = [
  { kind: 'group' as const, id: 'g-s2-intro' },
  { id: 's2-why' },

  { kind: 'group' as const, id: 'g-s2-accounts' },
  { id: 's2-accounts-visual' },
  { id: 's2-accounts' },

  { kind: 'group' as const, id: 'g-s2-machine' },
  { id: 's2-evm' },
  { id: 's2-transaction' },
  { id: 's2-gas' },
  { id: 's2-eip1559' },
  { id: 's2-smartcontracts' },

  { kind: 'group' as const, id: 'g-s2-consensus' },
  { id: 's2-consensus' },
  { id: 's2-staking' },
  { id: 's2-issuance' },

  { kind: 'group' as const, id: 'g-s2-scaling' },
  { id: 's2-evmecosystem' },
  { id: 's2-rollups' },
  { id: 's2-rollups-anim' },

  { kind: 'group' as const, id: 'g-s2-apps' },
  { id: 's2-defi' },
  { id: 's2-stablecoins' },
  { id: 's2-apps' },
  { id: 's2-apps-2' },

  { kind: 'group' as const, id: 'g-s2-compare' },
  { id: 's2-comparison' },

  { kind: 'group' as const, id: 'g-s2-fit' },
  { id: 's2-bestfits' },
  { id: 's2-worstfits' },

  { kind: 'group' as const, id: 'g-s2-wrap' },
  { id: 's2-quiz' },
  { id: 's2-takeaways' },
] as const;

// Language-neutral colors for the Rollups L1↔L2 animation steps (parallel to t('rollupsAnim.steps')).
const ROLLUP_STEP_COLORS = ['#8b5cf6', '#f59e0b', '#06b6d4', '#3b82f6', '#10b981'] as const;

const FUNDAMENTALS_INTRO_PATH = '/blockchain-fundamentals/section-3';

/* One-line handoff: "this was introduced in Fundamentals — here we go deeper". Links to the intro section. */
function RecapBadge({ topic }: { topic: 'why' | 'accounts' | 'gas' | 'smartContracts' | 'defi' }) {
  const { t } = useTranslation('blockchain-platforms/section-2');
  const localized = useLocalizedPath();
  return (
    <div className="flex flex-wrap items-center gap-2 mb-1.5 text-[11px] text-muted-foreground">
      <span className="px-1.5 py-0.5 rounded bg-[#f59e0b]/15 text-[#f59e0b] font-bold whitespace-nowrap">{t('recap.badge')}</span>
      <span className="leading-snug">{t(`recap.${topic}`)}</span>
      <Link to={localized(FUNDAMENTALS_INTRO_PATH)} className="font-semibold text-[#627EEA] hover:underline whitespace-nowrap">{t('recap.linkLabel')}</Link>
    </div>
  );
}

/* Keyword trail for students who want the tech underneath — never required reading. */
function HoodHint({ topic, className = '' }: { topic: string; className?: string }) {
  const { t } = useTranslation('blockchain-platforms/section-2');
  return (
    <div className={`shrink-0 min-w-0 flex items-baseline gap-2 text-[10px] text-muted-foreground ${className}`}>
      <span className="font-black uppercase tracking-widest text-[#627EEA] whitespace-nowrap shrink-0">🔧 {t('hood.label')}</span>
      <span className="font-mono leading-tight line-clamp-2 min-w-0">{t(`hood.${topic}`)}</span>
    </div>
  );
}

/* One memorable sentence per slide. Optional hood keywords share the row so the footer stays one strip. */
function KeyPoint({ topic, hood, className = '' }: { topic: string; hood?: string; className?: string }) {
  const { t } = useTranslation('blockchain-platforms/section-2');
  return (
    <div className={`shrink-0 flex flex-col lg:flex-row lg:items-center gap-1.5 lg:gap-4 ${className}`}>
      <div className="flex items-center gap-2 rounded-lg border-2 px-3 py-1.5 lg:flex-1 min-w-0" style={{ borderColor: '#f59e0b60', backgroundColor: '#f59e0b10' }}>
        <span className="text-[10px] font-black uppercase tracking-widest text-[#f59e0b] whitespace-nowrap shrink-0">{t('keyPoint.label')}</span>
        <span className="text-xs lg:text-sm font-semibold text-foreground leading-snug">{t(`keyPoint.${topic}`)}</span>
      </div>
      {hood && <HoodHint topic={hood} className="lg:w-[38%] lg:pr-14" />}
    </div>
  );
}

const ISSUANCE_BAR_MAX = 5200;
const ISSUANCE_PER_DAY = 2600;
const BURN_MIN = 150;
const BURN_MAX = 5000;

/* Issuance vs burn → net supply. A continuous activity slider drives the burn; bars + net animate. */
function IssuanceBalance() {
  const { t } = useTranslation('blockchain-platforms/section-2');
  const [activity, setActivity] = useState(45);
  // Burn grows faster than linearly with activity — busy blocks push the base fee up, not just the count.
  const burned = Math.round(BURN_MIN + (BURN_MAX - BURN_MIN) * Math.pow(activity / 100, 1.6));
  const net = ISSUANCE_PER_DAY - burned;
  const shrinking = net < 0;
  const balanced = Math.abs(net) < 250;
  const netColor = shrinking ? '#10b981' : balanced ? '#627EEA' : '#f59e0b';
  const zone = shrinking ? t('issuance.zoneShrinking') : balanced ? t('issuance.zoneBalanced') : t('issuance.zoneGrowing');
  const pctPerYear = ((net * 365) / 120_000_000 * 100).toFixed(2);
  const sliderColor = shrinking ? '#10b981' : '#f97316';

  return (
    <div className="flex flex-col gap-3 rounded-xl border border-border bg-card p-4 h-full min-h-0">
      <div className="text-[10px] font-black uppercase tracking-widest text-[#627EEA]">{t('issuance.visualLabel')}</div>

      <div>
        <div className="flex justify-between items-baseline text-xs mb-1">
          <span className="text-muted-foreground font-semibold">{t('issuance.sliderLabel')}</span>
          <span className="font-mono text-foreground">{activity}%</span>
        </div>
        <input
          type="range"
          min={0}
          max={100}
          step={1}
          value={activity}
          onChange={(e) => setActivity(parseInt(e.target.value, 10))}
          aria-label={t('issuance.sliderLabel')}
          className="w-full h-2 rounded-full appearance-none cursor-pointer"
          style={{
            background: `linear-gradient(to right, ${sliderColor} 0%, ${sliderColor} ${activity}%, var(--muted) ${activity}%, var(--muted) 100%)`,
            accentColor: sliderColor,
          }}
        />
        <div className="flex justify-between text-[10px] text-muted-foreground mt-0.5">
          <span>🌙 {t('issuance.sliderQuiet')}</span>
          <span>{t('issuance.sliderBusy')} 🔥</span>
        </div>
      </div>

      {/* Zone strip — which regime the slider is in right now */}
      <div className="grid grid-cols-3 gap-1.5 text-[10px] font-semibold text-center">
        {[
          { label: t('issuance.zoneGrowing'), color: '#f59e0b', on: !shrinking && !balanced },
          { label: t('issuance.zoneBalanced'), color: '#627EEA', on: balanced },
          { label: t('issuance.zoneShrinking'), color: '#10b981', on: shrinking },
        ].map(z => (
          <div key={z.label} className="rounded-md border px-1.5 py-1 leading-tight transition-colors" style={{ borderColor: z.color + (z.on ? 'FF' : '35'), backgroundColor: z.color + (z.on ? '20' : '00'), color: z.on ? z.color : 'var(--muted-foreground)', opacity: z.on ? 1 : 0.7 }}>
            {z.label}
          </div>
        ))}
      </div>

      <div className="flex-1 min-h-0 flex flex-col justify-evenly gap-3">
        {[
          { label: t('issuance.issuedLabel'), value: ISSUANCE_PER_DAY, color: '#627EEA', sign: '+' },
          { label: t('issuance.burnedLabel'), value: burned, color: '#f97316', sign: '−' },
        ].map((row) => (
          <div key={row.label}>
            <div className="flex justify-between text-sm mb-1">
              <span className="font-semibold text-foreground">{row.label}</span>
              <span className="font-mono font-bold" style={{ color: row.color }}>{row.sign}{row.value.toLocaleString()} {t('issuance.perDay')}</span>
            </div>
            <div className="h-7 rounded-full bg-muted overflow-hidden">
              <motion.div
                animate={{ width: `${Math.min(100, (row.value / ISSUANCE_BAR_MAX) * 100)}%` }}
                transition={{ duration: 0.25, ease: 'easeOut' }}
                className="h-full rounded-full"
                style={{ backgroundColor: row.color }}
              />
            </div>
          </div>
        ))}

        <motion.div
          animate={{ borderColor: netColor + '70', backgroundColor: netColor + '14' }}
          transition={{ duration: 0.3 }}
          className="rounded-xl border-2 px-4 py-4 flex items-center justify-between gap-3"
        >
          <div className="min-w-0">
            <div className="text-[10px] font-black uppercase tracking-widest" style={{ color: netColor }}>{t('issuance.netLabel')}</div>
            <div className="text-base text-foreground font-bold mt-0.5 leading-snug">{zone}</div>
            <div className="text-xs text-muted-foreground mt-1">{t('issuance.perYear', { pct: (net > 0 ? '+' : '') + pctPerYear })}</div>
          </div>
          <div className="text-right shrink-0">
            <motion.div
              key={shrinking ? 'neg' : 'pos'}
              initial={{ scale: 0.85, opacity: 0.6 }}
              animate={{ scale: 1, opacity: 1 }}
              className="font-mono text-4xl font-black tabular-nums"
              style={{ color: netColor }}
            >{net > 0 ? '+' : net < 0 ? '−' : ''}{Math.abs(net).toLocaleString()}</motion.div>
            <div className="text-[10px] text-muted-foreground">{t('issuance.perDay')}</div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

const STAKE_AMOUNTS = [1, 32, 1000] as const;
const STAKE_PATH_KEYS = ['solo', 'liquid', 'etf'] as const;
const STAKE_PATH_COLORS = ['#627EEA', '#06b6d4', '#8b5cf6'] as const;
const STAKE_RATES = { solo: 3.5, liquid: 3.1, etf: 3.0 } as const;
const STAGE_COLORS = ['#f59e0b', '#10b981', '#f59e0b', '#627EEA'] as const;
const STAGE_MS = 1100;

/* Stake-and-exit simulator: amount × path → qualify, yield, animated queue timeline, "need it now" outcome. */
function StakingSimulator() {
  const { t } = useTranslation('blockchain-platforms/section-2');
  const [amount, setAmount] = useState<(typeof STAKE_AMOUNTS)[number]>(32);
  const [pathIdx, setPathIdx] = useState(0);
  const [stage, setStage] = useState(0);
  const [needNow, setNeedNow] = useState(false);
  const [run, setRun] = useState(0);

  const path = STAKE_PATH_KEYS[pathIdx];
  const pathColor = STAKE_PATH_COLORS[pathIdx];
  const pathLabels = t('staking.sim.paths', { returnObjects: true }) as string[];
  const stages = t('staking.sim.stages', { returnObjects: true }) as string[];
  const waits = t(`staking.sim.waits.${path}`, { returnObjects: true }) as string[];

  const validators = Math.floor(amount / 32);
  const qualifies = path !== 'solo' || validators >= 1;
  const qualifyText = path === 'liquid'
    ? t('staking.sim.qualify.liquid')
    : path === 'etf'
      ? t('staking.sim.qualify.etf')
      : validators < 1
        ? t('staking.sim.qualify.soloNo', { amount })
        : validators === 1 && amount === 32
          ? t('staking.sim.qualify.soloOne')
          : t('staking.sim.qualify.soloYes', { validators, idle: amount - validators * 32 });
  const stakedAmount = path === 'solo' ? validators * 32 : amount;
  const rate = STAKE_RATES[path];
  const yearlyEth = stakedAmount * rate / 100;

  // Auto-play entry → earning on every input change; "need it now" jumps to the exit leg.
  useEffect(() => {
    setNeedNow(false);
    if (!qualifies) { setStage(-1); return; }
    setStage(0);
    const id = setTimeout(() => setStage(1), STAGE_MS);
    return () => clearTimeout(id);
  }, [amount, pathIdx, qualifies, run]);

  useEffect(() => {
    if (!needNow) return;
    setStage(2);
    const id = setTimeout(() => setStage(3), STAGE_MS * 1.4);
    return () => clearTimeout(id);
  }, [needNow]);

  const chip = (active: boolean, color: string) => active
    ? { backgroundColor: color, borderColor: color, color: '#fff' }
    : { borderColor: 'var(--border)', color: 'var(--muted-foreground)' };

  return (
    <div className="rounded-xl border border-border bg-card p-3 lg:p-4 flex-1 min-h-0 flex flex-col gap-2.5">
      <div>
        <div className="text-[10px] font-black uppercase tracking-widest text-[#f59e0b]">{t('staking.sim.label')}</div>
        <p className="text-[11px] text-muted-foreground leading-snug mt-0.5">{t('staking.sim.intro')}</p>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div>
          <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1">{t('staking.sim.amountLabel')}</div>
          <div className="flex gap-1.5">
            {STAKE_AMOUNTS.map(a => (
              <button key={a} onClick={() => setAmount(a)} className="flex-1 text-xs px-2 py-1 rounded-full border font-bold font-mono transition-colors" style={chip(a === amount, '#10b981')}>
                {a.toLocaleString()} Ξ
              </button>
            ))}
          </div>
        </div>
        <div>
          <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1">{t('staking.sim.pathLabel')}</div>
          <div className="flex gap-1.5">
            {pathLabels.map((label, i) => (
              <button key={i} onClick={() => setPathIdx(i)} className="flex-1 text-[11px] px-1.5 py-1 rounded-full border font-bold transition-colors leading-tight" style={chip(i === pathIdx, STAKE_PATH_COLORS[i])}>
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div className="rounded-lg border px-2.5 py-1.5" style={{ borderColor: (qualifies ? '#10b981' : '#ef4444') + '60', backgroundColor: (qualifies ? '#10b981' : '#ef4444') + '10' }}>
          <div className="text-[9px] font-black uppercase tracking-widest" style={{ color: qualifies ? '#10b981' : '#ef4444' }}>{t('staking.sim.qualifyLabel')}</div>
          <div className="text-[11px] text-foreground leading-snug mt-0.5">{qualifyText}</div>
        </div>
        <div className="rounded-lg border px-2.5 py-1.5" style={{ borderColor: pathColor + '60', backgroundColor: pathColor + '10' }}>
          <div className="text-[9px] font-black uppercase tracking-widest" style={{ color: pathColor }}>{t('staking.sim.yieldLabel')}</div>
          <div className="text-[11px] text-foreground leading-snug mt-0.5 font-mono">
            {qualifies ? t('staking.sim.yieldPerYear', { eth: yearlyEth.toLocaleString(undefined, { maximumFractionDigits: 2 }), pct: rate }) : '—'}
          </div>
        </div>
      </div>

      {/* Timeline — the active stage lights up; queue stages are dashed */}
      <div className="flex-1 min-h-0 grid grid-cols-4 gap-1.5 mt-1" style={{ maxHeight: 180 }}>
        {stages.map((label, i) => {
          const color = STAGE_COLORS[i];
          const active = stage === i;
          const done = stage > i;
          const isQueue = i === 0 || i === 2;
          return (
            <div key={i} className="flex items-center gap-1 min-w-0 min-h-0">
              <motion.div
                animate={{ opacity: !qualifies ? 0.35 : active || done ? 1 : 0.45, scale: active ? 1.04 : 1 }}
                transition={{ duration: 0.3 }}
                className="flex-1 min-w-0 h-full rounded-lg border-2 px-1.5 py-2.5 flex flex-col items-center justify-center text-center"
                style={{ borderColor: color + (active ? 'FF' : '60'), backgroundColor: color + (active ? '25' : '0d'), borderStyle: isQueue ? 'dashed' : 'solid' }}
              >
                <div className="text-2xl leading-none">{isQueue ? '⏳' : i === 1 ? '💰' : '🏦'}</div>
                <div className="text-xs font-bold text-foreground leading-tight mt-2">{label}</div>
                <div className="text-[10px] font-mono leading-tight mt-1" style={{ color }}>{waits[i]}</div>
              </motion.div>
              {i < 3 && <span className="text-muted-foreground text-xs shrink-0">→</span>}
            </div>
          );
        })}
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={() => setNeedNow(true)}
          disabled={!qualifies || stage < 1 || needNow}
          className="text-xs px-3 py-1.5 rounded-lg font-bold text-white transition-opacity disabled:opacity-40"
          style={{ backgroundColor: '#ef4444' }}
        >{t('staking.sim.needNow')}</button>
        <button onClick={() => setRun(r => r + 1)} className="text-[11px] px-2.5 py-1.5 rounded-lg bg-muted/60 hover:bg-muted text-foreground font-semibold transition-colors">{t('staking.sim.replay')}</button>
      </div>

      {/* Outcome of "need it now" — the yield-vs-liquidity payoff */}
      <div className="shrink-0 min-h-[60px] flex items-start">
        {needNow && (
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full text-sm leading-snug rounded-xl border-2 px-3 py-2.5 flex items-start gap-2"
            style={{ borderColor: (path === 'liquid' ? '#06b6d4' : '#f59e0b') + '80', backgroundColor: (path === 'liquid' ? '#06b6d4' : '#f59e0b') + '14', color: 'var(--foreground)' }}
          >
            <span className="text-lg leading-none shrink-0">{path === 'liquid' ? '💧' : '⏳'}</span>
            <span>{path === 'liquid' ? t('staking.sim.needNowLiquid') : t('staking.sim.needNowQueue')}</span>
          </motion.div>
        )}
      </div>
    </div>
  );
}

/* ──────────────────── Rollups L1 ↔ L2 — animated flow ─────────────────────
   Visualises what happens between Layer 1 and a Layer 2 rollup:
     1. Users send many small txs on L2
     2. The sequencer orders + executes them in a batch
     3. The batch is COMPRESSED into a small blob
     4. The blob is posted to L1 along with the new state root (+ proof)
     5. L1 verifies and finalises — L2 inherits L1 security
   Auto-plays on scroll-in + manual replay.
   ──────────────────────────────────────────────────────────────────────────── */

function RollupsL1L2Animation() {
  const { t } = useTranslation('blockchain-platforms/section-2');
  const rootRef     = useRef<HTMLDivElement | null>(null);
  const stepRef     = useRef<HTMLDivElement | null>(null);
  const userTxRefs  = useRef<(SVGGElement | null)[]>([]);
  const batchBoxRef = useRef<SVGGElement | null>(null);
  const blobRef     = useRef<SVGGElement | null>(null);
  const l1BlockRef  = useRef<SVGGElement | null>(null);
  const [phase, setPhase] = useState<'idle' | 'playing'>('idle');
  const playedRef   = useRef(false);

  const stepLabels = t('rollupsAnim.steps', { returnObjects: true }) as string[];
  const STEPS = ROLLUP_STEP_COLORS.map((color, i) => ({ label: stepLabels[i], color }));

  const setStep = (i: number) => {
    if (!stepRef.current) return;
    stepRef.current.textContent = STEPS[i].label;
    stepRef.current.style.color = STEPS[i].color;
    stepRef.current.style.borderColor = STEPS[i].color + 'AA';
    stepRef.current.style.backgroundColor = STEPS[i].color + '14';
  };

  const play = () => {
    if (phase === 'playing') return;
    setPhase('playing');

    userTxRefs.current.forEach(t => {
      if (!t) return;
      t.style.opacity = '0';
      t.style.transform = 'translate(0, 0)';
    });
    if (batchBoxRef.current) batchBoxRef.current.style.opacity = '0';
    if (blobRef.current)     { blobRef.current.style.opacity = '0'; blobRef.current.style.transform = 'translate(0, 0) scale(1)'; }
    if (l1BlockRef.current)  l1BlockRef.current.style.opacity = '0';

    const tl = anime.timeline({ easing: 'easeInOutCubic', complete: () => setPhase('idle') });

    tl.add({
      targets: userTxRefs.current.filter(Boolean),
      opacity: [0, 1],
      translateY: [-12, 0],
      duration: 350,
      delay: anime.stagger(80),
      changeBegin: () => setStep(0),
    })
    .add({
      targets: userTxRefs.current.filter(Boolean),
      translateY: 30,
      scale: 0.85,
      duration: 600,
      delay: anime.stagger(60),
      changeBegin: () => setStep(1),
    })
    .add({
      targets: batchBoxRef.current,
      opacity: [0, 1],
      scale: [0.6, 1],
      duration: 500,
      easing: 'easeOutQuad',
      changeBegin: () => setStep(2),
    })
    .add({
      targets: userTxRefs.current.filter(Boolean),
      opacity: 0,
      duration: 250,
    }, '-=250')
    .add({
      targets: batchBoxRef.current,
      scale: [1, 0.45],
      duration: 600,
      easing: 'easeInQuad',
    })
    .add({
      targets: batchBoxRef.current,
      opacity: 0,
      duration: 200,
    }, '-=100')
    .add({
      targets: blobRef.current,
      opacity: [0, 1],
      scale: [0.4, 1],
      duration: 350,
      easing: 'easeOutQuad',
    }, '-=100')
    .add({
      targets: blobRef.current,
      translateY: 110,
      duration: 900,
      changeBegin: () => setStep(3),
    })
    .add({
      targets: l1BlockRef.current,
      opacity: [0, 1],
      scale: [0.6, 1.15, 1],
      duration: 700,
      easing: 'easeOutQuad',
      changeBegin: () => setStep(4),
    })
    .add({
      targets: blobRef.current,
      opacity: [1, 0],
      duration: 300,
    }, '-=300');
  };

  useEffect(() => {
    if (!rootRef.current) return;
    const obs = new IntersectionObserver(es => {
      for (const e of es) {
        if (e.isIntersecting && !playedRef.current) {
          playedRef.current = true;
          setTimeout(play, 350);
          break;
        }
      }
    }, { threshold: 0.35 });
    obs.observe(rootRef.current);
    return () => obs.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div ref={rootRef} className="flex flex-col gap-3 min-h-0 h-full">
      <div className="shrink-0 flex items-start justify-between gap-3">
        <div>
          <div className="text-[10px] font-black uppercase tracking-widest text-[#8b5cf6]">{t('rollupsAnim.liveLabel')}</div>
          <div className="text-sm font-bold text-foreground">{t('rollupsAnim.heading')}</div>
        </div>
        <button
          onClick={play}
          disabled={phase === 'playing'}
          className="text-[11px] px-2.5 py-1 rounded-md bg-muted/60 hover:bg-muted text-foreground font-semibold disabled:opacity-50 transition-colors shrink-0"
        >{t('rollupsAnim.replay')}</button>
      </div>

      <div ref={stepRef} className="shrink-0 px-3 py-2 rounded-lg border-2 text-xs font-bold transition-all" style={{ borderColor: STEPS[0].color + 'AA', backgroundColor: STEPS[0].color + '14', color: STEPS[0].color }}>
        {STEPS[0].label}
      </div>

      <div className="flex-1 min-h-[280px] rounded-xl border border-border bg-card/40 p-3">
        <svg viewBox="0 0 520 280" className="w-full h-full" style={{ overflow: 'visible' }}>
          <rect x="20" y="20" width="480" height="80" rx="8" fill="#8b5cf615" stroke="#8b5cf6" strokeWidth="1.2" />
          <text x="40" y="42" fontSize="11" fontWeight="900" fill="#8b5cf6">{t('rollupsAnim.svg.l2Title')}</text>
          <text x="40" y="56" fontSize="9" fill="hsl(var(--muted-foreground))">{t('rollupsAnim.svg.l2Sub')}</text>

          {[0, 1, 2, 3].map(i => (
            <g key={i} ref={el => { userTxRefs.current[i] = el; }} style={{ opacity: 0, transformBox: 'fill-box' as React.CSSProperties['transformBox'], transformOrigin: `${100 + i * 50}px 78px` }}>
              <rect x={85 + i * 50} y="68" width="30" height="22" rx="3" fill="#8b5cf6" stroke="#4c1d95" strokeWidth="0.7" />
              <text x={100 + i * 50} y="83" textAnchor="middle" fontSize="9" fontWeight="800" fill="#fff">tx{i + 1}</text>
            </g>
          ))}

          <rect x="320" y="60" width="80" height="34" rx="4" fill="#f59e0b22" stroke="#f59e0b" strokeWidth="1.3" />
          <text x="360" y="78" textAnchor="middle" fontSize="9" fontWeight="900" fill="#f59e0b">{t('rollupsAnim.svg.sequencer')}</text>
          <text x="360" y="89" textAnchor="middle" fontSize="7" fill="hsl(var(--muted-foreground))">{t('rollupsAnim.svg.sequencerSub')}</text>

          <g ref={batchBoxRef} style={{ opacity: 0, transformBox: 'fill-box' as React.CSSProperties['transformBox'], transformOrigin: '420px 78px' }}>
            <rect x="406" y="64" width="58" height="28" rx="3" fill="#06b6d422" stroke="#06b6d4" strokeWidth="1.3" />
            <text x="435" y="82" textAnchor="middle" fontSize="9" fontWeight="900" fill="#06b6d4">{t('rollupsAnim.svg.batch')}</text>
          </g>

          <g ref={blobRef} style={{ opacity: 0, transformBox: 'fill-box' as React.CSSProperties['transformBox'], transformOrigin: '420px 78px' }}>
            <rect x="408" y="68" width="24" height="20" rx="3" fill="#3b82f6" stroke="#1e3a8a" strokeWidth="1.2" />
            <text x="420" y="82" textAnchor="middle" fontSize="7" fontWeight="900" fill="#fff">{t('rollupsAnim.svg.blob')}</text>
          </g>

          <text x="260" y="135" textAnchor="middle" fontSize="9" fontWeight="700" fill="hsl(var(--muted-foreground))" opacity="0.6">{t('rollupsAnim.svg.compressLabel')}</text>

          <rect x="20" y="170" width="480" height="80" rx="8" fill="#627EEA15" stroke="#627EEA" strokeWidth="1.2" />
          <text x="40" y="192" fontSize="11" fontWeight="900" fill="#627EEA">{t('rollupsAnim.svg.l1Title')}</text>
          <text x="40" y="206" fontSize="9" fill="hsl(var(--muted-foreground))">{t('rollupsAnim.svg.l1Sub')}</text>

          {[1, 2, 3, 4].map(i => (
            <g key={i}>
              <rect x={140 + i * 50} y="216" width="34" height="26" rx="2" fill="#627EEA25" stroke="#627EEA" strokeWidth="0.8" />
              <text x={157 + i * 50} y="232" textAnchor="middle" fontSize="7" fontWeight="800" fill="#627EEA">#L1</text>
            </g>
          ))}
          <g ref={l1BlockRef} style={{ opacity: 0, transformBox: 'fill-box' as React.CSSProperties['transformBox'], transformOrigin: '375px 229px' }}>
            <rect x="358" y="216" width="34" height="26" rx="2" fill="#10b98140" stroke="#10b981" strokeWidth="1.4" />
            <text x="375" y="232" textAnchor="middle" fontSize="7" fontWeight="800" fill="#10b981">{t('rollupsAnim.svg.verifiedBlob')}</text>
          </g>
        </svg>
      </div>

      <div className="shrink-0 grid grid-cols-2 lg:grid-cols-4 gap-2 text-[10px]">
        <div className="rounded-md p-1.5 border" style={{ borderColor: '#8b5cf655', backgroundColor: '#8b5cf610' }}>
          <span className="font-black text-[#8b5cf6]">{t('rollupsAnim.legend.l2txTerm')}</span> <span className="text-muted-foreground">{t('rollupsAnim.legend.l2txDesc')}</span>
        </div>
        <div className="rounded-md p-1.5 border" style={{ borderColor: '#f59e0b55', backgroundColor: '#f59e0b10' }}>
          <span className="font-black text-[#f59e0b]">{t('rollupsAnim.legend.sequencerTerm')}</span> <span className="text-muted-foreground">{t('rollupsAnim.legend.sequencerDesc')}</span>
        </div>
        <div className="rounded-md p-1.5 border" style={{ borderColor: '#06b6d455', backgroundColor: '#06b6d410' }}>
          <span className="font-black text-[#06b6d4]">{t('rollupsAnim.legend.compressTerm')}</span> <span className="text-muted-foreground">{t('rollupsAnim.legend.compressDesc')}</span>
        </div>
        <div className="rounded-md p-1.5 border" style={{ borderColor: '#10b98155', backgroundColor: '#10b98110' }}>
          <span className="font-black text-[#10b981]">{t('rollupsAnim.legend.finaliseTerm')}</span> <span className="text-muted-foreground">{t('rollupsAnim.legend.finaliseDesc')}</span>
        </div>
      </div>
    </div>
  );
}

interface WhyItem { title: string; detail: string; }
interface LabelDesc { label: string; desc: string; }
interface LabelDetail { label: string; detail: string; }
interface FlowItem { label: string; sub: string; }
interface ComparisonRow { feature: string; option1: string; option2: string; }
interface StackLayer { label: string; sub: string; }
interface TxField { field: string; value: string; comment: string; }
interface TxType { label: string; detail: string; }
interface StrongRest { strong: string; rest: string; }
interface LifecycleStep { label: string; detail: string; }
interface ConsensusItem { icon: string; label: string; value: string; }
interface ConsensusStep { label: string; detail: string; metric: string; }
interface StatTile { value: string; label: string; }
interface RollupStep { label: string; detail: string; }
interface RollupBullet { strong?: string; rest?: string; pre?: string; code?: string; post?: string; text?: string; }
interface RollupMetric { label: string; l1: string; l2: string; }
interface StablecoinLogo { sym: string; tag: string; }
interface StablecoinCard { title: string; sub: string; mechanism: string; logos: StablecoinLogo[]; risk: string; }
interface AppProject { sym: string; tag: string; }
interface AppCard { title: string; sub: string; what: string; projects: AppProject[]; limit: string; }
interface FitItem { name: string; why: string; example?: string; alt?: string; }
interface StakingPath { title: string; req: string; get: string; risk: string; }
interface IssuanceFact { title: string; detail: string; }

export function BP_Section2() {
  const { t } = useTranslation('blockchain-platforms/section-2');

  const chapters = useMemo(
    () =>
      chapterShape.map((c) =>
        'kind' in c
          ? { kind: 'group' as const, id: c.id, label: t(`groups.${c.id}`) }
          : { id: c.id, label: t(`chapters.${c.id}`) }
      ),
    [t]
  );

  // Static color/icon metadata kept module-side; text resolved per index from t().
  const whyLimits = t('why.limits', { returnObjects: true }) as WhyItem[];
  const whyProperties = t('why.properties', { returnObjects: true }) as LabelDesc[];

  const accountsVisualEoaPoints = t('accountsVisual.eoa.points', { returnObjects: true }) as string[];
  const accountsVisualEoaIcons = ['👤', '🚀', '💰', '⛽'];
  const accountsVisualContractPoints = t('accountsVisual.contract.points', { returnObjects: true }) as string[];
  const accountsVisualContractIcons = ['⚙️', '📩', '🗄️', '🔄'];
  const accountsVisualFlow = t('accountsVisual.flow', { returnObjects: true }) as FlowItem[];

  const accountsItems = t('accounts.items', { returnObjects: true }) as ComparisonRow[];

  const evmProperties = t('evm.properties', { returnObjects: true }) as LabelDetail[];
  const evmPropertyIcons = ['🏖️', '⚙️', '🔄', '📏'];
  const evmStack = t('evm.stack', { returnObjects: true }) as StackLayer[];
  const evmStackColors = ['#8b5cf6', '#627EEA', '#3b82f6', '#06b6d4', '#10b981'];
  const evmCompatChains = ['Polygon', 'BNB Chain', 'Arbitrum', 'Optimism', 'Base', 'zkSync', 'Avalanche C-Chain'];

  const txFields = t('transaction.fields', { returnObjects: true }) as TxField[];
  const txTypes = t('transaction.types', { returnObjects: true }) as TxType[];
  const txTypeMeta = [
    { icon: '💸', color: '#10b981' },
    { icon: '📜', color: '#627EEA' },
    { icon: '🏗️', color: '#8b5cf6' },
  ];

  const gasWhy = t('gas.why', { returnObjects: true }) as StrongRest[];

  const eip1559WhyWorks = t('eip1559.whyWorks', { returnObjects: true }) as StrongRest[];

  const scLifecycle = t('smartContracts.lifecycle', { returnObjects: true }) as LifecycleStep[];
  const scLifecycleColors = ['#8b5cf6', '#627EEA', '#3b82f6', '#10b981'];
  const scProperties = t('smartContracts.properties', { returnObjects: true }) as string[];
  const scPropertyIcons = ['🔒', '⚙️', '🔍'];

  const consensusBeforeItems = t('consensus.before.items', { returnObjects: true }) as ConsensusItem[];
  const consensusAfterItems = t('consensus.after.items', { returnObjects: true }) as ConsensusItem[];
  const consensusSteps = t('consensus.steps', { returnObjects: true }) as ConsensusStep[];
  const consensusStepColors = ['#627EEA', '#8b5cf6', '#3b82f6', '#10b981'];
  const consensusStepIcons = ['🔒', '🎲', '🗳️', '✅'];

  const stakingPaths = t('staking.paths', { returnObjects: true }) as StakingPath[];
  const stakingPathMeta = [
    { icon: '🖥️', color: '#627EEA' },
    { icon: '💧', color: '#06b6d4' },
    { icon: '🏦', color: '#8b5cf6' },
  ];

  const issuanceFacts = t('issuance.facts', { returnObjects: true }) as IssuanceFact[];
  const issuanceFactMeta = [
    { icon: '♾️', color: '#627EEA' },
    { icon: '✂️', color: '#10b981' },
    { icon: '🔥', color: '#f97316' },
  ];

  const evmReasons = t('evmEcosystem.reasons', { returnObjects: true }) as LabelDetail[];
  const evmReasonMeta = [
    { icon: '🌐', color: '#627EEA' },
    { icon: '🛠️', color: '#8b5cf6' },
    { icon: '🔗', color: '#10b981' },
  ];
  const evmL2Chains = [
    { name: 'Arbitrum', color: '#12AAFF' },
    { name: 'Optimism', color: '#FF0420' },
    { name: 'Base', color: '#0052FF' },
    { name: 'zkSync', color: '#8C8DFC' },
    { name: 'Starknet', color: '#EC796B' },
  ];
  const evmL1Chains = [
    { name: 'Polygon', color: '#8247E5' },
    { name: 'BNB Chain', color: '#F3BA2F' },
    { name: 'Avalanche C-Chain', color: '#E84142' },
    { name: 'Fantom', color: '#1969FF' },
    { name: 'Cronos', color: '#002D74' },
  ];

  const rollupSteps = t('rollups.steps', { returnObjects: true }) as RollupStep[];
  const rollupStepColors = ['#627EEA', '#8b5cf6', '#f59e0b', '#10b981'];
  const rollupOptimistic = t('rollups.optimistic', { returnObjects: true }) as RollupBullet[];
  const rollupZk = t('rollups.zk', { returnObjects: true }) as RollupBullet[];
  const rollupMetrics = t('rollups.metrics', { returnObjects: true }) as RollupMetric[];

  const stablecoinCards = t('stablecoins.cards', { returnObjects: true }) as StablecoinCard[];
  const stablecoinCardMeta = [
    { icon: '🏦', color: '#3b82f6', logoColors: ['#26A17B', '#2775CA', '#00AAE4', '#003087'] },
    { icon: '⚖️', color: '#8b5cf6', logoColors: ['#F4B731', '#B6509E', '#745DDF', '#40649F'] },
    { icon: '⚙️', color: '#ED1C24', logoColors: ['#5493F7', '#6B7280', '#94A3B8'] },
  ];
  const stablecoinStats = t('stablecoins.stats', { returnObjects: true }) as StatTile[];

  const apps1Cards = t('apps1.cards', { returnObjects: true }) as AppCard[];
  const apps1CardMeta = [
    { icon: '🎨', color: '#8b5cf6' },
    { icon: '🏛️', color: '#10b981' },
  ];
  const apps2Cards = t('apps2.cards', { returnObjects: true }) as AppCard[];
  const apps2CardMeta = [
    { icon: '🆔', color: '#f59e0b' },
    { icon: '🎮', color: '#ED1C24' },
  ];

  const comparisonItems = t('comparison.items', { returnObjects: true }) as ComparisonRow[];

  const bestFitsItems = t('bestFits.items', { returnObjects: true }) as FitItem[];
  const bestFitsEmojis = ['💰', '🖼️', '🏛️', '🪙'];
  const worstFitsItems = t('worstFits.items', { returnObjects: true }) as FitItem[];
  const worstFitsEmojis = ['₿', '🏢', '🚀', '🎮'];

  const quizOptions = (t('quiz.options', { returnObjects: true }) as string[]).map((text, i) => ({ text, correct: i === 2 }));
  const quiz2Options = (t('quiz2.options', { returnObjects: true }) as string[]).map((text, i) => ({ text, correct: i === 1 }));
  const quiz3Options = (t('quiz3.options', { returnObjects: true }) as string[]).map((text, i) => ({ text, correct: i === 2 }));

  const takeawayItems = t('takeaways.items', { returnObjects: true }) as string[];

  return (
    <div className="h-full w-full flex overflow-hidden">
      <SectionNav chapters={chapters} />
      <div id="section-scroll" className="flex-1 overflow-y-auto snap-y snap-mandatory">
        <div className="slide-flow">

        {/* ═══════ TITLE ═══════ */}
        <div className="h-full">
          <TitleSlide
            sectionNumber={t('title.sectionNumber')}
            title={t('title.title')}
            subtitle={t('title.subtitle')}
            icon={<Layers className="size-20 text-[#627EEA]" />}
            gradient="from-[#627EEA] to-[#8b5cf6]"
          />
        </div>

        {/* ═══════ S2-WHY ═══════ */}
        <div id="s2-why" className="h-full flex flex-col p-6 lg:p-10">
          <div className="shrink-0 mb-5">
            <RecapBadge topic="why" />
            <h2 className="text-2xl lg:text-3xl font-bold text-foreground">{t('why.heading')}</h2>
            <p className="text-muted-foreground text-sm mt-1">{t('why.subtitle')}</p>
          </div>

          <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-2 gap-5">

            {/* Left — What Bitcoin couldn't do */}
            <div className="flex flex-col gap-3">
              <h3 className="text-base font-bold text-foreground shrink-0">{t('why.limitsHeading')}</h3>
              <div className="flex flex-col gap-2 flex-1">
                {whyLimits.map((item, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1, duration: 0.4, ease: 'easeOut' }}
                    className="flex-1 p-3 rounded-xl border-2 border-red-500/30 bg-red-500/08 flex flex-col justify-center"
                    style={{ backgroundColor: 'rgba(239,68,68,0.07)' }}
                  >
                    <div className="flex items-start gap-2">
                      <span className="text-red-500 font-black text-sm shrink-0 mt-0.5">✕</span>
                      <div>
                        <div className="font-bold text-sm text-foreground">{item.title}</div>
                        <div className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{item.detail}</div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Right — Vitalik's Insight */}
            <div className="flex flex-col gap-3">
              <h3 className="text-base font-bold text-foreground shrink-0">{t('why.insightHeadingA')}<span className="text-muted-foreground font-normal">{t('why.insightHeadingB')}</span></h3>

              {/* Quote */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.4 }}
                className="rounded-xl border-2 p-4"
                style={{ borderColor: '#627EEA60', backgroundColor: '#627EEA12' }}
              >
                <p className="text-sm lg:text-base font-semibold text-foreground italic leading-relaxed">
                  {t('why.quoteA')}<span style={{ color: '#627EEA' }}>{t('why.quoteHighlight')}</span>{t('why.quoteB')}
                </p>
              </motion.div>

              {/* Key properties */}
              <div className="flex flex-col gap-2 flex-1">
                {whyProperties.map((prop, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 + i * 0.12, duration: 0.4, ease: 'easeOut' }}
                    className="flex-1 flex items-center gap-3 p-3 rounded-xl border bg-card"
                    style={{ borderColor: '#627EEA40' }}
                  >
                    <div
                      className="size-7 rounded-full flex items-center justify-center text-white font-bold text-xs shrink-0"
                      style={{ backgroundColor: '#627EEA' }}
                    >{i + 1}</div>
                    <div>
                      <div className="font-bold text-sm text-foreground">{prop.label}</div>
                      <div className="text-xs text-muted-foreground">{prop.desc}</div>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Bottom callout */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7, duration: 0.4 }}
                className="rounded-xl p-3 text-center text-sm font-bold shrink-0"
                style={{ backgroundColor: '#627EEA20', color: '#627EEA', border: '1px solid #627EEA40' }}
              >
                {t('why.callout')}
              </motion.div>
            </div>

          </div>

          {/* ─── PoW → PoS energy teaser ─── */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.85, duration: 0.4 }}
            className="shrink-0 mt-4 rounded-xl border border-border bg-card px-4 py-3"
          >
            <div className="flex items-center justify-between gap-3 mb-2">
              <div className="text-xs font-semibold text-foreground">
                {t('why.teaserTextA')}<span className="text-[#10b981]">{t('why.teaserHighlight')}</span>
              </div>
              <span className="text-[10px] text-muted-foreground italic shrink-0">{t('why.teaserNote')}</span>
            </div>

            {/* Energy bars */}
            <div className="grid grid-cols-[max-content_1fr_max-content] gap-x-3 gap-y-1.5 items-center text-xs">
              {/* PoW row */}
              <span className="font-bold text-[#f59e0b]">{t('why.powLabel')}</span>
              <div className="h-3 rounded-full bg-muted overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: '100%' }}
                  transition={{ delay: 1.0, duration: 0.7, ease: 'easeOut' }}
                  className="h-full rounded-full bg-gradient-to-r from-[#f59e0b] to-[#ef4444]"
                />
              </div>
              <span className="font-mono font-bold text-foreground">{t('why.powValue')}</span>

              {/* PoS row */}
              <span className="font-bold text-[#10b981]">{t('why.posLabel')}</span>
              <div className="h-3 rounded-full bg-muted overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: '0.014%' }}
                  transition={{ delay: 1.2, duration: 0.7, ease: 'easeOut' }}
                  className="h-full rounded-full bg-[#10b981]"
                />
              </div>
              <span className="font-mono font-bold text-foreground">{t('why.posValueA')}<span className="text-[#10b981]">{t('why.posValueHighlight')}</span></span>
            </div>
          </motion.div>
          <KeyPoint topic="why" hood="why" className="mt-3" />
        </div>

        {/* ═══════ S2-ACCOUNTS-VISUAL ═══════ */}
        <div id="s2-accounts-visual" className="h-full flex flex-col p-6 lg:p-10">
          <div className="shrink-0 mb-5">
            <RecapBadge topic="accounts" />
            <h2 className="text-2xl lg:text-3xl font-bold text-foreground">{t('accountsVisual.heading')}</h2>
            <p className="text-sm text-muted-foreground mt-1">{t('accountsVisual.subtitle')}</p>
          </div>

          <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-2 gap-6">

            {/* EOA */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4 }}
              className="flex flex-col gap-4 p-6 rounded-2xl border-2"
              style={{ borderColor: '#627EEA60', backgroundColor: '#627EEA08' }}
            >
              <div className="flex items-center gap-4">
                <div className="size-16 rounded-2xl flex items-center justify-center text-4xl" style={{ backgroundColor: '#627EEA18' }}>🔑</div>
                <div>
                  <div className="font-black text-xl text-foreground flex items-baseline gap-2">
                    {t('accountsVisual.eoa.title')}
                    <span className="text-sm font-bold text-[#627EEA]">{t('accountsVisual.eoa.tag')}</span>
                  </div>
                  <div className="text-sm text-muted-foreground">{t('accountsVisual.eoa.subtitle')}</div>
                </div>
              </div>
              <div className="flex flex-col gap-2 flex-1">
                {accountsVisualEoaPoints.map((text, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 + i * 0.08 }}
                    className="flex items-start gap-3 p-3 rounded-xl"
                    style={{ backgroundColor: '#627EEA0d' }}
                  >
                    <span className="text-lg shrink-0">{accountsVisualEoaIcons[i]}</span>
                    <span className="text-sm text-foreground">{text}</span>
                  </motion.div>
                ))}
              </div>
              <div className="p-3 rounded-xl border border-[#627EEA]/40 text-center">
                <div className="text-xs font-bold text-[#627EEA]">{t('accountsVisual.eoa.examplesLabel')}</div>
                <div className="text-xs text-muted-foreground mt-1">{t('accountsVisual.eoa.examples')}</div>
              </div>
            </motion.div>

            {/* Contract Account */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: 0.1 }}
              className="flex flex-col gap-4 p-6 rounded-2xl border-2"
              style={{ borderColor: '#39B54A60', backgroundColor: '#39B54A08' }}
            >
              <div className="flex items-center gap-4">
                <div className="size-16 rounded-2xl flex items-center justify-center text-4xl" style={{ backgroundColor: '#39B54A18' }}>📜</div>
                <div>
                  <div className="font-black text-xl text-foreground">{t('accountsVisual.contract.title')}</div>
                  <div className="text-sm text-muted-foreground">{t('accountsVisual.contract.subtitle')}</div>
                </div>
              </div>
              <div className="flex flex-col gap-2 flex-1">
                {accountsVisualContractPoints.map((text, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: 12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 + i * 0.08 }}
                    className="flex items-start gap-3 p-3 rounded-xl"
                    style={{ backgroundColor: '#39B54A0d' }}
                  >
                    <span className="text-lg shrink-0">{accountsVisualContractIcons[i]}</span>
                    <span className="text-sm text-foreground">{text}</span>
                  </motion.div>
                ))}
              </div>
              <div className="p-3 rounded-xl border border-[#39B54A]/40 text-center">
                <div className="text-xs font-bold text-[#39B54A]">{t('accountsVisual.contract.examplesLabel')}</div>
                <div className="text-xs text-muted-foreground mt-1">{t('accountsVisual.contract.examples')}</div>
              </div>
            </motion.div>
          </div>

          {/* Interaction flow */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="shrink-0 mt-4 flex items-center gap-3 p-4 rounded-xl border border-border bg-card"
          >
            <div className="text-sm font-bold text-foreground shrink-0">{t('accountsVisual.interactLabel')}</div>
            <div className="flex items-center gap-2 flex-1 overflow-x-auto">
              {accountsVisualFlow.map((item, i) => (
                <span key={i} className="flex items-center gap-2 shrink-0">
                  {i > 0 && <span className="text-muted-foreground font-bold shrink-0">→</span>}
                  <span className="flex flex-col items-center shrink-0 px-2">
                    <span className="text-sm font-bold text-foreground">{item.label}</span>
                    <span className="text-xs text-muted-foreground">{item.sub}</span>
                  </span>
                </span>
              ))}
            </div>
          </motion.div>
          <KeyPoint topic="accountsVisual" hood="accounts" className="mt-3" />
        </div>

        {/* ═══════ S2-ACCOUNTS ═══════ */}
        <div id="s2-accounts" className="h-full">
          <ComparisonSlide
            title={t('accounts.title')}
            featureLabel={t('accounts.featureLabel')}
            option1Label={t('accounts.option1Label')}
            option2Label={t('accounts.option2Label')}
            items={accountsItems}
            footer={<KeyPoint topic="accounts" />}
          />
        </div>

        {/* ═══════ S2-EVM ═══════ */}
        <div id="s2-evm" className="h-full flex flex-col p-6 lg:p-10">
          <div className="shrink-0 mb-3">
            <h2 className="text-2xl lg:text-3xl font-bold text-foreground">{t('evm.heading')}</h2>
            <p className="text-muted-foreground text-sm mt-1">{t('evm.subtitle')}</p>
          </div>

          {/* JVM analogy banner — anchor the concept in something familiar before EVM-specifics */}
          <div className="shrink-0 mb-3 rounded-xl border-2 p-3" style={{ borderColor: '#627EEAAA', backgroundColor: '#627EEA0d' }}>
            <div className="flex items-start gap-3">
              <span className="text-2xl shrink-0">☕</span>
              <div className="flex-1 min-w-0">
                <div className="text-[10px] font-black uppercase tracking-widest text-[#627EEA]">{t('evm.jvmLabel')}</div>
                <div className="text-xs lg:text-sm text-foreground leading-snug mt-0.5">
                  {t('evm.jvmP1A')}<strong>{t('evm.jvmP1Strong')}</strong>{t('evm.jvmP1B')}<em>{t('evm.jvmP1Em')}</em>{t('evm.jvmP1C')}<code className="text-[#627EEA] font-mono">.java</code>{t('evm.jvmP1D')}
                </div>
                <div className="text-xs lg:text-sm text-foreground leading-snug mt-1">
                  <strong className="text-[#627EEA]">{t('evm.jvmP2Strong')}</strong>{t('evm.jvmP2A')}<em>{t('evm.jvmP2Em')}</em>{t('evm.jvmP2B')}
                </div>
              </div>
            </div>
          </div>

          <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-2 gap-5">

            {/* Left — What is the EVM */}
            <div className="flex flex-col gap-2 min-h-0">
              <h3 className="text-base font-bold text-foreground shrink-0">{t('evm.whatHeading')}</h3>
              <div className="flex flex-col gap-1.5 flex-1 min-h-0">
                {evmProperties.map((prop, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1, duration: 0.4, ease: 'easeOut' }}
                    className="flex-1 min-h-0 flex items-center gap-3 px-3 py-2 rounded-xl border bg-card"
                    style={{ borderColor: '#627EEA30' }}
                  >
                    <span className="text-2xl shrink-0">{evmPropertyIcons[i]}</span>
                    <div>
                      <div className="font-bold text-sm text-foreground">{prop.label}</div>
                      <div className="text-xs text-muted-foreground leading-snug mt-0.5">{prop.detail}</div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Right — EVM Stack + compatibility */}
            <div className="flex flex-col gap-2 min-h-0">
              <h3 className="text-base font-bold text-foreground shrink-0">{t('evm.stackHeading')}</h3>

              {/* Stack diagram */}
              <div className="flex flex-col flex-1 min-h-0">
                {evmStack.map((layer, i) => {
                  const color = evmStackColors[i];
                  return (
                  <div key={i} className="flex flex-col items-center flex-1 min-h-0">
                    <motion.div
                      initial={{ opacity: 0, scaleX: 0.7 }}
                      animate={{ opacity: 1, scaleX: 1 }}
                      transition={{ delay: 0.1 + i * 0.1, duration: 0.35 }}
                      className="w-full flex-1 min-h-0 rounded-lg px-4 py-1 flex flex-col justify-center text-center border"
                      style={{ borderColor: color + '50', backgroundColor: color + '15' }}
                    >
                      <div className="font-bold text-sm leading-tight" style={{ color }}>{layer.label}</div>
                      <div className="text-xs text-muted-foreground leading-tight">{layer.sub}</div>
                    </motion.div>
                    {i < 4 && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.15 + i * 0.1 }}
                        className="text-muted-foreground text-xs leading-none"
                      >↓</motion.div>
                    )}
                  </div>
                  );
                })}
              </div>

              {/* EVM Compatibility */}
              <div className="shrink-0 flex items-center gap-2 flex-wrap">
                <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest">{t('evm.compatLabel')}</span>
                {evmCompatChains.map(chain => (
                  <span
                    key={chain}
                    className="px-2 py-0.5 rounded-full text-[11px] font-medium border"
                    style={{ color: '#627EEA', borderColor: '#627EEA40', backgroundColor: '#627EEA12' }}
                  >{chain}</span>
                ))}
              </div>
            </div>

          </div>
          <KeyPoint topic="evm" className="mt-3" />
        </div>

        {/* ═══════ S2-TRANSACTION ═══════ */}
        <div id="s2-transaction" className="h-full flex flex-col p-6 lg:p-10">
          <div className="shrink-0 mb-5">
            <h2 className="text-2xl lg:text-3xl font-bold text-foreground">{t('transaction.heading')}</h2>
            <p className="text-muted-foreground text-sm mt-1">{t('transaction.subtitle')}</p>
          </div>

          <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-2 gap-5">

            {/* Left — Receipt */}
            <div className="flex flex-col gap-3 min-h-0">
              <div className="flex items-center justify-between shrink-0">
                <h3 className="text-base font-bold text-foreground">{t('transaction.fieldsHeading')}</h3>
                <span
                  className="text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider"
                  style={{ backgroundColor: '#627EEA20', color: '#627EEA' }}
                >
                  {t('transaction.fieldsBadge')}
                </span>
              </div>
              <div
                className="flex-1 min-h-0 rounded-xl border p-4 font-mono text-[11px] flex flex-col gap-1 overflow-y-auto"
                style={{ backgroundColor: 'var(--card)', borderColor: '#627EEA40' }}
              >
                {txFields.map((row, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.04 + i * 0.05 }}
                    className="flex items-baseline gap-2 py-1 border-b last:border-b-0"
                    style={{ borderColor: 'var(--border)' }}
                  >
                    <span className="text-[#627EEA] font-bold w-36 shrink-0 truncate">{row.field}</span>
                    <span className="text-foreground shrink-0">{row.value}</span>
                    <span className="text-muted-foreground ml-auto hidden lg:inline truncate">{row.comment}</span>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Right — Transaction types */}
            <div className="flex flex-col gap-3">
              <h3 className="text-base font-bold text-foreground shrink-0">{t('transaction.typesHeading')}</h3>
              <div className="flex flex-col gap-2 flex-1">
                {txTypes.map((type, i) => {
                  const meta = txTypeMeta[i];
                  return (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 + i * 0.12 }}
                    className="flex-1 flex items-start gap-3 p-3 rounded-xl border bg-card"
                    style={{ borderColor: meta.color + '40' }}
                  >
                    <span className="text-2xl shrink-0">{meta.icon}</span>
                    <div>
                      <div className="font-bold text-sm" style={{ color: meta.color }}>{type.label}</div>
                      <div className="text-xs text-muted-foreground leading-relaxed mt-0.5 font-mono">{type.detail}</div>
                    </div>
                  </motion.div>
                  );
                })}
              </div>

              {/* Account model note */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="shrink-0 rounded-xl p-3 text-xs leading-relaxed"
                style={{ backgroundColor: '#627EEA12', border: '1px solid #627EEA30', color: 'var(--muted-foreground)' }}
              >
                <span className="font-bold" style={{ color: '#627EEA' }}>{t('transaction.noteLabel')}</span>
                {t('transaction.noteBody')}
              </motion.div>
            </div>

          </div>
          <KeyPoint topic="transaction" className="mt-3" />
        </div>

        {/* ═══════ S2-GAS ═══════ */}
        <div id="s2-gas" className="h-full flex flex-col p-6 lg:p-10">
          <div className="shrink-0 mb-4">
            <RecapBadge topic="gas" />
            <h2 className="text-2xl lg:text-3xl font-bold text-foreground">{t('gas.heading')}</h2>
            <p className="text-muted-foreground text-sm mt-1">{t('gas.subtitle')}</p>
          </div>

          <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-2 gap-5">

            {/* Left — explanation */}
            <div className="flex flex-col gap-3 min-h-0">

              {/* What is gas */}
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="rounded-xl border border-border bg-card p-4"
              >
                <div className="text-[10px] font-bold uppercase tracking-widest text-[#627EEA] mb-1">{t('gas.whatLabel')}</div>
                <p className="text-sm text-foreground leading-relaxed">
                  {t('gas.whatBodyA')}<span className="font-bold">{t('gas.whatBodyStrong')}</span>{t('gas.whatBodyB')}<span className="font-mono">{t('gas.whatBodyCode1')}</span>{t('gas.whatBodyC')}<span className="font-mono">{t('gas.whatBodyCode2')}</span>{t('gas.whatBodyD')}
                </p>
              </motion.div>

              {/* Why */}
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.1 }}
                className="rounded-xl border border-border bg-card p-4"
              >
                <div className="text-[10px] font-bold uppercase tracking-widest text-[#10b981] mb-1">{t('gas.whyLabel')}</div>
                <ul className="text-sm text-muted-foreground space-y-1.5 leading-relaxed">
                  {gasWhy.map((item, i) => (
                    <li key={i}><span className="text-foreground font-semibold">{item.strong}</span>{item.rest}</li>
                  ))}
                </ul>
              </motion.div>

              {/* Formula */}
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.2 }}
                className="rounded-xl border-2 border-[#627EEA]/40 bg-[#627EEA]/08 p-4"
                style={{ backgroundColor: '#627EEA10' }}
              >
                <div className="text-[10px] font-bold uppercase tracking-widest text-[#627EEA] mb-2">{t('gas.formulaLabel')}</div>
                <div className="font-mono text-center text-base lg:text-lg font-black text-foreground mb-2 leading-snug">
                  {t('gas.formula')}
                </div>
                <div className="grid grid-cols-3 gap-2 text-[11px] text-center">
                  <div>
                    <div className="font-bold text-foreground">{t('gas.formulaGasUsed')}</div>
                    <div className="text-muted-foreground">{t('gas.formulaGasUsedSub')}</div>
                  </div>
                  <div>
                    <div className="font-bold text-foreground">{t('gas.formulaBaseFee')}</div>
                    <div className="text-muted-foreground">{t('gas.formulaBaseFeeSub')}</div>
                  </div>
                  <div>
                    <div className="font-bold text-foreground">{t('gas.formulaTip')}</div>
                    <div className="text-muted-foreground">{t('gas.formulaTipSub')}</div>
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3, delay: 0.35 }}
                className="text-[11px] text-muted-foreground italic shrink-0"
              >
                {t('gas.footnoteA')}<span className="font-mono font-bold text-foreground">{t('gas.footnoteGwei')}</span>{t('gas.footnoteB')}<span className="text-foreground font-semibold">{t('gas.footnoteReverts')}</span>{t('gas.footnoteC')}
              </motion.div>
            </div>

            {/* Right — interactive calculator */}
            <div className="flex flex-col min-h-0">
              <GasCalculator />
            </div>

          </div>
          <KeyPoint topic="gas" hood="gas" className="mt-3" />
        </div>

        {/* ═══════ S2-EIP1559 ═══════ */}
        <div id="s2-eip1559" className="h-full flex flex-col p-6 lg:p-10">
          <div className="shrink-0 mb-4">
            <h2 className="text-2xl lg:text-3xl font-bold text-foreground">{t('eip1559.heading')}</h2>
            <p className="text-muted-foreground text-sm mt-1">{t('eip1559.subtitle')}</p>
          </div>

          <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-2 gap-5">

            {/* Left — the problem & the fix */}
            <div className="flex flex-col gap-3 min-h-0">

              {/* The Problem */}
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3 }}
                className="rounded-xl border-2 border-[#ef4444]/40 bg-[#ef4444]/05 p-4"
                style={{ backgroundColor: '#ef444410' }}
              >
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-lg">⚠️</span>
                  <h3 className="font-black text-sm text-[#ef4444]">{t('eip1559.beforeTitle')}</h3>
                </div>
                <p className="text-xs text-muted-foreground mb-2 leading-relaxed">
                  {t('eip1559.beforeBody')}
                </p>
                <div className="grid grid-cols-3 gap-1.5 text-[10px]">
                  <div className="rounded-lg bg-card border border-[#ef4444]/30 p-1.5 text-center">
                    <div className="font-bold text-foreground">{t('eip1559.beforeOverpayTitle')}</div>
                    <div className="text-muted-foreground">{t('eip1559.beforeOverpaySub')}</div>
                  </div>
                  <div className="rounded-lg bg-card border border-[#ef4444]/30 p-1.5 text-center">
                    <div className="font-bold text-foreground">{t('eip1559.beforeStuckTitle')}</div>
                    <div className="text-muted-foreground">{t('eip1559.beforeStuckSub')}</div>
                  </div>
                  <div className="rounded-lg bg-card border border-[#ef4444]/30 p-1.5 text-center">
                    <div className="font-bold text-foreground">{t('eip1559.beforeMinerTitle')}</div>
                    <div className="text-muted-foreground">{t('eip1559.beforeMinerSub')}</div>
                  </div>
                </div>
              </motion.div>

              {/* The Fix */}
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: 0.1 }}
                className="rounded-xl border-2 border-[#10b981]/40 bg-[#10b981]/05 p-4 flex-1 min-h-0 flex flex-col"
                style={{ backgroundColor: '#10b98110' }}
              >
                <div className="flex items-center gap-2 mb-2 shrink-0">
                  <span className="text-lg">✅</span>
                  <h3 className="font-black text-sm text-[#10b981]">{t('eip1559.afterTitle')}</h3>
                </div>

                <div className="grid grid-cols-2 gap-2 mb-3 shrink-0">
                  <div className="rounded-lg bg-card border-2 border-[#627EEA]/40 p-2.5">
                    <div className="flex items-center gap-1 mb-1">
                      <span className="text-sm">🔥</span>
                      <span className="font-black text-xs text-[#627EEA]">{t('eip1559.baseFeeLabel')}</span>
                    </div>
                    <p className="text-[10px] text-muted-foreground leading-relaxed">
                      {t('eip1559.baseFeeBodyA')}<span className="font-mono font-bold text-foreground">{t('eip1559.baseFeeBodyPct')}</span>{t('eip1559.baseFeeBodyB')}<span className="text-foreground font-semibold">{t('eip1559.baseFeeBodyBurned')}</span>{t('eip1559.baseFeeBodyC')}
                    </p>
                  </div>
                  <div className="rounded-lg bg-card border-2 border-[#10b981]/40 p-2.5">
                    <div className="flex items-center gap-1 mb-1">
                      <span className="text-sm">💰</span>
                      <span className="font-black text-xs text-[#10b981]">{t('eip1559.tipLabel')}</span>
                    </div>
                    <p className="text-[10px] text-muted-foreground leading-relaxed">
                      {t('eip1559.tipBodyA')}<span className="text-foreground font-semibold">{t('eip1559.tipBodyValidator')}</span>{t('eip1559.tipBodyB')}
                    </p>
                  </div>
                </div>

                <div className="flex-1 min-h-0 flex flex-col gap-1.5">
                  <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{t('eip1559.whyWorksLabel')}</div>
                  <ul className="text-[11px] text-muted-foreground space-y-1 leading-relaxed">
                    {eip1559WhyWorks.map((item, i) => (
                      <li key={i}>✓ <span className="text-foreground font-semibold">{item.strong}</span>{item.rest}</li>
                    ))}
                  </ul>
                </div>
              </motion.div>
            </div>

            {/* Right — interactive demo */}
            <div className="flex flex-col min-h-0">
              <Eip1559Demo />
            </div>

          </div>
          <KeyPoint topic="eip1559" className="mt-3" />
        </div>

        {/* ═══════ S2-SMARTCONTRACTS ═══════ */}
        <div id="s2-smartcontracts" className="h-full flex flex-col p-6 lg:p-10">
          <div className="shrink-0 mb-5">
            <RecapBadge topic="smartContracts" />
            <h2 className="text-2xl lg:text-3xl font-bold text-foreground">{t('smartContracts.heading')}</h2>
            <p className="text-muted-foreground text-sm mt-1">{t('smartContracts.subtitle')}</p>
          </div>

          <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-2 gap-5">

            {/* Left — Solidity code block */}
            <div className="flex flex-col gap-2">
              <h3 className="text-base font-bold text-foreground shrink-0">{t('smartContracts.codeHeading')}</h3>
              <div
                className="flex-1 rounded-xl p-4 font-mono text-xs leading-relaxed overflow-auto"
                style={{ backgroundColor: '#0d1117', border: '1px solid #30363d', color: '#e6edf3' }}
              >
                <div><span style={{ color: '#ff7b72' }}>pragma solidity</span> <span style={{ color: '#79c0ff' }}>^0.8.0</span>;</div>
                <div className="mt-2"><span style={{ color: '#ff7b72' }}>contract</span> <span style={{ color: '#ffa657' }}>Escrow</span> {'{'}</div>
                <div className="ml-4 mt-1"><span style={{ color: '#79c0ff' }}>address</span> <span style={{ color: '#ff7b72' }}>public</span> depositor;</div>
                <div className="ml-4"><span style={{ color: '#79c0ff' }}>address</span> <span style={{ color: '#ff7b72' }}>public</span> beneficiary;</div>
                <div className="ml-4"><span style={{ color: '#79c0ff' }}>uint256</span> <span style={{ color: '#ff7b72' }}>public</span> amount;</div>
                <div className="ml-4"><span style={{ color: '#79c0ff' }}>bool</span>    <span style={{ color: '#ff7b72' }}>public</span> released;</div>
                <div className="ml-4 mt-2"><span style={{ color: '#d2a8ff' }}>event</span> <span style={{ color: '#ffa657' }}>Released</span>(<span style={{ color: '#79c0ff' }}>address</span> to, <span style={{ color: '#79c0ff' }}>uint256</span> value);</div>
                <div className="ml-4 mt-2">
                  <span style={{ color: '#ff7b72' }}>constructor</span>(<span style={{ color: '#79c0ff' }}>address</span> _beneficiary) <span style={{ color: '#ff7b72' }}>payable</span> {'{'}
                </div>
                <div className="ml-8">depositor   = <span style={{ color: '#79c0ff' }}>msg</span>.sender;</div>
                <div className="ml-8">beneficiary = _beneficiary;</div>
                <div className="ml-8">amount      = <span style={{ color: '#79c0ff' }}>msg</span>.value;</div>
                <div className="ml-4">{'}'}</div>
                <div className="ml-4 mt-2">
                  <span style={{ color: '#ff7b72' }}>function</span> <span style={{ color: '#d2a8ff' }}>release</span>() <span style={{ color: '#ff7b72' }}>external</span> {'{'}
                </div>
                <div className="ml-8">
                  <span style={{ color: '#ff7b72' }}>require</span>(<span style={{ color: '#79c0ff' }}>msg</span>.sender == depositor, <span style={{ color: '#a5d6ff' }}>"not depositor"</span>);
                </div>
                <div className="ml-8">
                  <span style={{ color: '#ff7b72' }}>require</span>(!released, <span style={{ color: '#a5d6ff' }}>"already released"</span>);
                </div>
                <div className="ml-8">released = <span style={{ color: '#79c0ff' }}>true</span>;</div>
                <div className="ml-8">
                  <span style={{ color: '#ff7b72' }}>payable</span>(beneficiary).<span style={{ color: '#d2a8ff' }}>transfer</span>(amount);
                </div>
                <div className="ml-8">
                  <span style={{ color: '#ff7b72' }}>emit</span> <span style={{ color: '#ffa657' }}>Released</span>(beneficiary, amount);
                </div>
                <div className="ml-4">{'}'}</div>
                <div>{'}'}</div>
              </div>
            </div>

            {/* Right — Lifecycle + properties */}
            <div className="flex flex-col gap-3">
              <h3 className="text-base font-bold text-foreground shrink-0">{t('smartContracts.lifecycleHeading')}</h3>
              <div className="flex flex-col gap-2">
                {scLifecycle.map((item, i) => {
                  const color = scLifecycleColors[i];
                  return (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 + i * 0.1 }}
                    className="flex items-center gap-3 p-3 rounded-xl border bg-card"
                    style={{ borderColor: color + '40' }}
                  >
                    <div
                      className="size-8 rounded-full flex items-center justify-center text-white font-black text-sm shrink-0"
                      style={{ backgroundColor: color }}
                    >{i + 1}</div>
                    <div>
                      <div className="font-bold text-sm text-foreground">{item.label}</div>
                      <div className="text-xs text-muted-foreground">{item.detail}</div>
                    </div>
                  </motion.div>
                  );
                })}
              </div>

              <div className="mt-1">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-2">{t('smartContracts.propertiesLabel')}</p>
                <div className="flex flex-col gap-1.5">
                  {scProperties.map((text, i) => (
                    <div key={i} className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span>{scPropertyIcons[i]}</span>
                      <span>{text}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

          </div>
          <KeyPoint topic="smartContracts" hood="smartContracts" className="mt-3" />
        </div>

        {/* ═══════ S2-CONSENSUS ═══════ */}
        <div id="s2-consensus" className="h-full flex flex-col p-6 lg:p-10">
          <div className="shrink-0 mb-4">
            <h2 className="text-2xl lg:text-3xl font-bold text-foreground">{t('consensus.heading')}</h2>
            <p className="text-muted-foreground text-sm mt-1">{t('consensus.subtitle')}</p>
          </div>

          <div className="flex-1 min-h-0 flex flex-col gap-4">

            {/* Top — Before / After */}
            <div className="grid grid-cols-2 gap-4 shrink-0">
              {[
                { title: t('consensus.before.title'), color: '#f59e0b', items: consensusBeforeItems },
                { title: t('consensus.after.title'), color: '#10b981', items: consensusAfterItems },
              ].map((col, ci) => (
                <motion.div
                  key={ci}
                  initial={{ opacity: 0, y: -15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: ci * 0.15, duration: 0.4 }}
                  className="rounded-xl border-2 p-4"
                  style={{ borderColor: col.color + '50', backgroundColor: col.color + '10' }}
                >
                  <h3 className="font-bold text-sm mb-3" style={{ color: col.color }}>{col.title}</h3>
                  <div className="grid grid-cols-2 gap-2">
                    {col.items.map((item, ii) => (
                      <div key={ii} className="flex flex-col gap-0.5">
                        <span className="text-xs text-muted-foreground">{item.icon} {item.label}</span>
                        <span className="text-xs font-bold text-foreground">{item.value}</span>
                      </div>
                    ))}
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Bottom — How PoS works */}
            <div className="flex-1 min-h-0 flex flex-col gap-3">
              <h3 className="text-base font-bold text-foreground shrink-0">{t('consensus.howHeading')}</h3>
              <div className="flex-1 min-h-0 grid grid-cols-2 lg:grid-cols-4 gap-3">
                {consensusSteps.map((step, i) => {
                  const color = consensusStepColors[i];
                  return (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 + i * 0.1 }}
                    className="flex flex-col gap-2 p-3 rounded-xl border bg-card min-h-0"
                    style={{ borderColor: color + '40' }}
                  >
                    <div className="flex items-center gap-2 shrink-0">
                      <div
                        className="size-8 rounded-full flex items-center justify-center text-white font-black text-sm"
                        style={{ backgroundColor: color }}
                      >{i + 1}</div>
                      <div className="font-bold text-sm text-foreground">{step.label}</div>
                      <span className="ml-auto text-xl leading-none">{consensusStepIcons[i]}</span>
                    </div>
                    <div className="text-sm lg:text-base text-foreground/90 leading-snug flex-1">{step.detail}</div>
                    <div className="text-[11px] font-bold px-2 py-1 rounded leading-snug shrink-0" style={{ backgroundColor: color + '15', color }}>
                      {step.metric}
                    </div>
                  </motion.div>
                  );
                })}
              </div>

              {/* Handoff to the staking + issuance slides */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.75 }}
                className="shrink-0 rounded-xl px-3 py-2 text-xs leading-relaxed"
                style={{ backgroundColor: '#627EEA12', border: '1px solid #627EEA40', color: 'var(--muted-foreground)' }}
              >
                <span className="font-bold" style={{ color: '#627EEA' }}>{t('consensus.nextLabel')}</span>{t('consensus.nextBody')}
              </motion.div>
              <KeyPoint topic="consensus" hood="consensus" />
            </div>

          </div>
        </div>

        {/* ═══════ S2-STAKING — ETH's interest rate + entry/exit queue ═══════ */}
        <div id="s2-staking" className="h-full flex flex-col p-5 lg:p-8">
          <div className="shrink-0 mb-3">
            <span className="px-2.5 py-0.5 rounded-full bg-[#10b981]/15 border border-[#10b981]/40 text-[#10b981] text-xs font-bold">{t('staking.badge')}</span>
            <h2 className="text-2xl lg:text-3xl font-bold text-foreground mt-1">{t('staking.heading')}</h2>
            <p className="text-sm text-muted-foreground max-w-3xl">{t('staking.subtitle')}</p>
          </div>

          <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-2 gap-4">

            {/* Left — what it is + three ways in */}
            <div className="flex flex-col gap-3 min-h-0">
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="rounded-xl border-2 p-3"
                style={{ borderColor: '#10b98160', backgroundColor: '#10b9810d' }}
              >
                <div className="text-[10px] font-black uppercase tracking-widest text-[#10b981] mb-1">{t('staking.whatLabel')}</div>
                <p className="text-sm text-foreground leading-snug">
                  {t('staking.whatBodyA')}<span className="font-black text-[#10b981]">{t('staking.whatBodyStrong')}</span>{t('staking.whatBodyB')}<span className="font-bold text-[#ef4444]">{t('staking.whatBodySlash')}</span>{t('staking.whatBodyC')}
                </p>
              </motion.div>

              <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{t('staking.pathsLabel')}</div>
              <div className="flex-1 min-h-0 flex flex-col gap-2">
                {stakingPaths.map((p, i) => {
                  const meta = stakingPathMeta[i];
                  return (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 + i * 0.1 }}
                    className="flex-1 rounded-xl border bg-card px-3 py-2 flex items-center gap-3 min-h-0"
                    style={{ borderColor: meta.color + '50' }}
                  >
                    <span className="text-2xl shrink-0 leading-none">{meta.icon}</span>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-baseline gap-2 flex-wrap">
                        <span className="font-black text-sm" style={{ color: meta.color }}>{p.title}</span>
                        <span className="text-[10px] font-mono text-muted-foreground">{p.req}</span>
                      </div>
                      <div className="text-xs text-foreground leading-snug">{p.get}</div>
                      <div className="text-[10px] text-muted-foreground leading-snug">⚠ {p.risk}</div>
                    </div>
                  </motion.div>
                  );
                })}
              </div>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.45 }}
                className="shrink-0 rounded-xl px-3 py-2 text-[11px] leading-snug"
                style={{ backgroundColor: '#8b5cf612', border: '1px solid #8b5cf640', color: 'var(--muted-foreground)' }}
              >
                <span className="font-bold text-[#8b5cf6]">{t('staking.instructorLabel')}</span>{t('staking.instructorBody')}
              </motion.div>
            </div>

            {/* Right — interactive stake-and-exit simulator */}
            <motion.div
              initial={{ opacity: 0, x: 12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="flex flex-col min-h-0"
            >
              <StakingSimulator />
            </motion.div>

          </div>
          <KeyPoint topic="staking" hood="staking" className="mt-3" />
        </div>

        {/* ═══════ S2-ISSUANCE — monetary policy: issuance vs burn ═══════ */}
        <div id="s2-issuance" className="h-full flex flex-col p-5 lg:p-8">
          <div className="shrink-0 mb-3">
            <span className="px-2.5 py-0.5 rounded-full bg-[#f97316]/15 border border-[#f97316]/40 text-[#f97316] text-xs font-bold">{t('issuance.badge')}</span>
            <h2 className="text-2xl lg:text-3xl font-bold text-foreground mt-1">{t('issuance.heading')}</h2>
            <p className="text-sm text-muted-foreground max-w-3xl">{t('issuance.subtitle')}</p>
          </div>

          <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-2 gap-4">

            {/* Left — three facts + BTC contrast */}
            <div className="flex flex-col gap-3 min-h-0 justify-center">
              {issuanceFacts.map((f, i) => {
                const meta = issuanceFactMeta[i];
                return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="rounded-xl border bg-card p-4 flex items-start gap-3"
                  style={{ borderColor: meta.color + '50' }}
                >
                  <span className="text-3xl shrink-0 leading-none">{meta.icon}</span>
                  <div className="min-w-0">
                    <div className="font-black text-base" style={{ color: meta.color }}>{f.title}</div>
                    <div className="text-sm text-muted-foreground leading-snug mt-0.5">{f.detail}</div>
                  </div>
                </motion.div>
                );
              })}

              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.35 }}
                className="shrink-0 grid grid-cols-2 gap-2 mt-auto"
              >
                <div className="rounded-xl border-2 p-2.5" style={{ borderColor: '#f7931a60', backgroundColor: '#f7931a10' }}>
                  <div className="text-[10px] font-black uppercase tracking-widest text-[#f7931a]">{t('issuance.btcLabel')}</div>
                  <div className="text-[11px] text-muted-foreground leading-snug mt-0.5">{t('issuance.btcBody')}</div>
                </div>
                <div className="rounded-xl border-2 p-2.5" style={{ borderColor: '#627EEA60', backgroundColor: '#627EEA10' }}>
                  <div className="text-[10px] font-black uppercase tracking-widest text-[#627EEA]">{t('issuance.ethLabel')}</div>
                  <div className="text-[11px] text-muted-foreground leading-snug mt-0.5">{t('issuance.ethBody')}</div>
                </div>
              </motion.div>
            </div>

            {/* Right — issuance vs burn slider */}
            <div className="flex flex-col min-h-0">
              <IssuanceBalance />
            </div>

          </div>
          <KeyPoint topic="issuance" hood="issuance" className="mt-3" />
        </div>

        {/* ═══════ S2-EVMECOSYSTEM ═══════ */}
        <div id="s2-evmecosystem" className="h-full flex flex-col p-6 lg:p-10">
          <div className="shrink-0 mb-5">
            <h2 className="text-2xl lg:text-3xl font-bold text-foreground">{t('evmEcosystem.heading')}</h2>
            <p className="text-muted-foreground text-sm mt-1">{t('evmEcosystem.subtitle')}</p>
          </div>

          <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-2 gap-5">

            {/* Left — Why EVM won */}
            <div className="flex flex-col gap-3">
              <h3 className="text-base font-bold text-foreground shrink-0">{t('evmEcosystem.whyHeading')}</h3>
              <div className="flex flex-col gap-2 flex-1">
                {evmReasons.map((reason, i) => {
                  const meta = evmReasonMeta[i];
                  return (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.12, duration: 0.4 }}
                    className="flex-1 flex items-start gap-3 p-4 rounded-xl border bg-card"
                    style={{ borderColor: meta.color + '40' }}
                  >
                    <span className="text-2xl shrink-0">{meta.icon}</span>
                    <div>
                      <div className="font-bold text-sm text-foreground">{reason.label}</div>
                      <div className="text-xs text-muted-foreground leading-relaxed mt-0.5">{reason.detail}</div>
                    </div>
                  </motion.div>
                  );
                })}
              </div>
            </div>

            {/* Right — Chain map */}
            <div className="flex flex-col gap-3">
              <h3 className="text-base font-bold text-foreground shrink-0">{t('evmEcosystem.ecosystemHeading')}</h3>

              {/* Layer 2 Rollups */}
              <div className="flex-1 rounded-xl border bg-card p-4" style={{ borderColor: '#627EEA40' }}>
                <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: '#627EEA' }}>{t('evmEcosystem.l2Label')}</p>
                <div className="flex flex-wrap gap-2">
                  {evmL2Chains.map(chain => (
                    <span
                      key={chain.name}
                      className="px-3 py-1.5 rounded-full text-xs font-bold border"
                      style={{ color: chain.color, borderColor: chain.color + '50', backgroundColor: chain.color + '15' }}
                    >{chain.name}</span>
                  ))}
                </div>
              </div>

              {/* EVM-compatible L1s */}
              <div className="flex-1 rounded-xl border bg-card p-4" style={{ borderColor: '#10b98140' }}>
                <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: '#10b981' }}>{t('evmEcosystem.l1Label')}</p>
                <div className="flex flex-wrap gap-2">
                  {evmL1Chains.map(chain => (
                    <span
                      key={chain.name}
                      className="px-3 py-1.5 rounded-full text-xs font-bold border"
                      style={{ color: chain.color, borderColor: chain.color + '50', backgroundColor: chain.color + '15' }}
                    >{chain.name}</span>
                  ))}
                </div>
              </div>

              {/* Bottom callout */}
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="shrink-0 rounded-xl p-3 text-xs font-medium text-center leading-relaxed"
                style={{ backgroundColor: '#627EEA15', border: '1px solid #627EEA40', color: '#627EEA' }}
              >
                {t('evmEcosystem.callout')}
              </motion.div>
            </div>

          </div>
          <KeyPoint topic="evmEcosystem" className="mt-3" />
        </div>

        {/* ═══════ S2-ROLLUPS ═══════ */}
        <div id="s2-rollups" className="h-full flex flex-col p-6 lg:p-10">
          <div className="shrink-0 mb-4">
            <h2 className="text-2xl lg:text-3xl font-bold text-foreground">{t('rollups.heading')}</h2>
            <p className="text-sm text-muted-foreground mt-1">
              {t('rollups.subtitleA')}<span className="text-foreground font-semibold">{t('rollups.subtitleStrong')}</span>{t('rollups.subtitleB')}
            </p>
          </div>

          <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-2 gap-5">

            {/* Left — How a rollup works */}
            <div className="flex flex-col gap-3 min-h-0">
              <h3 className="text-base font-bold text-foreground shrink-0">{t('rollups.howHeading')}</h3>

              <div className="flex-1 min-h-0 flex flex-col gap-2">
                {rollupSteps.map((s, i) => {
                  const color = rollupStepColors[i];
                  return (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.08, duration: 0.3 }}
                    className="flex-1 flex items-start gap-3 p-3 rounded-xl border bg-card"
                    style={{ borderColor: color + '40' }}
                  >
                    <div
                      className="size-8 rounded-lg flex items-center justify-center text-white font-black text-sm shrink-0"
                      style={{ backgroundColor: color }}
                    >{i + 1}</div>
                    <div className="min-w-0">
                      <div className="font-bold text-sm text-foreground">{s.label}</div>
                      <div className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{s.detail}</div>
                    </div>
                  </motion.div>
                  );
                })}
              </div>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="shrink-0 rounded-xl border border-[#627EEA]/30 px-3 py-2 text-[11px] text-center"
                style={{ backgroundColor: '#627EEA12', color: '#627EEA' }}
              >
                <span className="font-bold">{t('rollups.securityNoteStrong')}</span>{t('rollups.securityNoteRest')}
              </motion.div>
            </div>

            {/* Right — Optimistic vs ZK + Tradeoffs */}
            <div className="flex flex-col gap-3 min-h-0">
              <h3 className="text-base font-bold text-foreground shrink-0">{t('rollups.flavorsHeading')}</h3>

              <div className="grid grid-cols-2 gap-3 shrink-0">
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15 }}
                  className="rounded-xl border-2 border-[#FF0420]/40 bg-[#FF0420]/05 p-3"
                  style={{ backgroundColor: '#FF042010' }}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-lg">🤝</span>
                    <div className="font-black text-sm text-[#FF0420]">{t('rollups.optimisticTitle')}</div>
                  </div>
                  <ul className="text-[11px] text-muted-foreground space-y-1 leading-relaxed">
                    {rollupOptimistic.map((b, i) => (
                      <li key={i}>
                        {b.text ?? <>
                          {b.pre}
                          {b.strong && <span className="text-foreground font-semibold">{b.strong}</span>}
                          {b.code && <span className="font-mono font-bold text-foreground">{b.code}</span>}
                          {b.rest}{b.post}
                        </>}
                      </li>
                    ))}
                  </ul>
                  <div className="mt-2 pt-2 border-t border-border text-[10px] text-muted-foreground">
                    <span className="font-bold text-foreground">{t('rollups.optimisticLiveLabel')}</span>{t('rollups.optimisticLive')}
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.25 }}
                  className="rounded-xl border-2 border-[#8C8DFC]/40 bg-[#8C8DFC]/05 p-3"
                  style={{ backgroundColor: '#8C8DFC10' }}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-lg">🔐</span>
                    <div className="font-black text-sm text-[#8C8DFC]">{t('rollups.zkTitle')}</div>
                  </div>
                  <ul className="text-[11px] text-muted-foreground space-y-1 leading-relaxed">
                    {rollupZk.map((b, i) => (
                      <li key={i}>
                        {b.text ?? <>
                          {b.pre}
                          {b.strong && <span className="text-foreground font-semibold">{b.strong}</span>}
                          {b.code && <span className="font-mono font-bold text-foreground">{b.code}</span>}
                          {b.rest}{b.post}
                        </>}
                      </li>
                    ))}
                  </ul>
                  <div className="mt-2 pt-2 border-t border-border text-[10px] text-muted-foreground">
                    <span className="font-bold text-foreground">{t('rollups.zkLiveLabel')}</span>{t('rollups.zkLive')}
                  </div>
                </motion.div>
              </div>

              {/* L1 vs L2 metrics */}
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.35 }}
                className="rounded-xl border border-border bg-card p-3 flex-1 min-h-0 flex flex-col"
              >
                <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-2">{t('rollups.metricsLabel')}</div>
                <div className="grid grid-cols-3 gap-2 text-center text-[11px] flex-1">
                  {rollupMetrics.map((m, i) => (
                    <div key={i} className="rounded-lg bg-muted/40 border border-border p-2 flex flex-col justify-center">
                      <div className="text-muted-foreground text-[10px]">{m.label}</div>
                      <div className="font-bold text-foreground">{m.l1}</div>
                      <div className="text-[#10b981] font-mono">{m.l2}</div>
                    </div>
                  ))}
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="shrink-0 rounded-xl border border-[#f59e0b]/30 px-3 py-2 text-[11px] leading-relaxed"
                style={{ backgroundColor: '#f59e0b12', color: 'var(--muted-foreground)' }}
              >
                <span className="font-bold text-[#f59e0b]">{t('rollups.eip4844Label')}</span>
                {t('rollups.eip4844A')}<span className="font-mono text-foreground">{t('rollups.eip4844Code')}</span>{t('rollups.eip4844B')}
              </motion.div>
            </div>

          </div>
          <KeyPoint topic="rollups" className="mt-3" />
        </div>

        {/* ═══════ S2-ROLLUPS ANIMATION — animated L1 ↔ L2 flow ═══════ */}
        <div id="s2-rollups-anim" className="h-full flex flex-col p-5 lg:p-8">
          <div className="shrink-0 mb-3">
            <span className="px-2.5 py-0.5 rounded-full bg-[#8b5cf6]/15 border border-[#8b5cf6]/40 text-[#8b5cf6] text-xs font-bold">{t('rollupsAnimSlide.badge')}</span>
            <h2 className="text-2xl lg:text-3xl font-bold text-foreground mt-1">{t('rollupsAnimSlide.heading')}</h2>
            <p className="text-sm text-muted-foreground max-w-3xl">
              {t('rollupsAnimSlide.subtitle')}
            </p>
          </div>
          <div className="flex-1 min-h-0">
            <RollupsL1L2Animation />
          </div>
        </div>

        {/* ═══════ DEFI MECHANICS ═══════ */}
        <div id="s2-defi" className="h-full flex flex-col p-5 lg:p-8">
          <div className="shrink-0 mb-4">
            <RecapBadge topic="defi" />
            <h2 className="text-2xl lg:text-3xl font-bold text-foreground mb-1">{t('defi.heading')}</h2>
            <p className="text-sm text-muted-foreground">
              {t('defi.subtitleA')}
              <span className="text-[#627EEA] font-semibold">{t('defi.subtitleHighlight')}</span>
            </p>
          </div>

          <div className="flex-1 min-h-0 grid grid-cols-3 gap-4">

            {/* AMM */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="flex flex-col rounded-xl border-2 border-[#39B54A]/40 bg-card overflow-hidden"
            >
              <div className="h-1.5 bg-[#39B54A] shrink-0" />
              <div className="flex flex-col flex-1 p-4 gap-3">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">🔄</span>
                  <div>
                    <div className="font-black text-base text-[#39B54A]">{t('defi.amm.title')}</div>
                    <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">{t('defi.amm.subtitle')}</div>
                  </div>
                </div>

                <div className="rounded-lg bg-muted/40 border border-border px-2.5 py-1.5 text-[11px]">
                  <span className="text-muted-foreground">{t('defi.amm.replacesPre')}</span>
                  <span className="font-semibold text-foreground">{t('defi.amm.replaces')}</span>
                </div>

                <p className="text-sm text-muted-foreground flex-1">
                  {t('defi.amm.body')}
                </p>

                <div className="p-3 bg-[#39B54A]/10 border border-[#39B54A]/30 rounded-xl text-center">
                  <div className="font-mono text-xl font-black text-foreground">{t('defi.amm.formula')}</div>
                  <div className="text-[10px] text-muted-foreground mt-1">{t('defi.amm.formulaSub')}</div>
                </div>

                <div className="text-[11px] text-muted-foreground pt-2 border-t border-border">
                  <span className="font-semibold text-foreground">{t('defi.amm.liveLabel')}</span>{t('defi.amm.live')}
                </div>
              </div>
            </motion.div>

            {/* Lending */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.1 }}
              className="flex flex-col rounded-xl border-2 border-[#f97316]/40 bg-card overflow-hidden"
            >
              <div className="h-1.5 bg-[#f97316] shrink-0" />
              <div className="flex flex-col flex-1 p-4 gap-3">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">🏦</span>
                  <div>
                    <div className="font-black text-base text-[#f97316]">{t('defi.lending.title')}</div>
                    <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">{t('defi.lending.subtitle')}</div>
                  </div>
                </div>

                <div className="rounded-lg bg-muted/40 border border-border px-2.5 py-1.5 text-[11px]">
                  <span className="text-muted-foreground">{t('defi.lending.replacesPre')}</span>
                  <span className="font-semibold text-foreground">{t('defi.lending.replaces')}</span>
                </div>

                <p className="text-sm text-muted-foreground flex-1">
                  {t('defi.lending.body')}
                </p>

                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div className="rounded-lg bg-[#39B54A]/10 border border-[#39B54A]/30 px-2 py-1.5 text-center">
                    <div className="font-bold text-[#39B54A]">{t('defi.lending.supplyTitle')}</div>
                    <div className="text-muted-foreground">{t('defi.lending.supplySub')}</div>
                  </div>
                  <div className="rounded-lg bg-[#f97316]/10 border border-[#f97316]/30 px-2 py-1.5 text-center">
                    <div className="font-bold text-[#f97316]">{t('defi.lending.borrowTitle')}</div>
                    <div className="text-muted-foreground">{t('defi.lending.borrowSub')}</div>
                  </div>
                </div>

                <div className="text-[11px] text-muted-foreground pt-2 border-t border-border">
                  <span className="font-semibold text-foreground">{t('defi.lending.liveLabel')}</span>{t('defi.lending.live')}
                </div>
              </div>
            </motion.div>

            {/* Yield / LP */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.2 }}
              className="flex flex-col rounded-xl border-2 border-[#6366f1]/40 bg-card overflow-hidden"
            >
              <div className="h-1.5 bg-[#6366f1] shrink-0" />
              <div className="flex flex-col flex-1 p-4 gap-3">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">🌾</span>
                  <div>
                    <div className="font-black text-base text-[#6366f1]">{t('defi.yield.title')}</div>
                    <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">{t('defi.yield.subtitle')}</div>
                  </div>
                </div>

                <div className="rounded-lg bg-muted/40 border border-border px-2.5 py-1.5 text-[11px]">
                  <span className="text-muted-foreground">{t('defi.yield.replacesPre')}</span>
                  <span className="font-semibold text-foreground">{t('defi.yield.replaces')}</span>
                </div>

                <p className="text-sm text-muted-foreground flex-1">
                  {t('defi.yield.bodyA')}<span className="font-semibold text-foreground">{t('defi.yield.bodyStrong')}</span>{t('defi.yield.bodyB')}
                </p>

                <div className="rounded-lg bg-[#ef4444]/10 border border-[#ef4444]/30 px-2.5 py-1.5 text-[11px] flex items-start gap-2">
                  <span>⚠️</span>
                  <div>
                    <span className="font-bold text-[#ef4444]">{t('defi.yield.ilStrong')}</span>
                    <span className="text-muted-foreground">{t('defi.yield.ilRest')}</span>
                  </div>
                </div>

                <div className="text-[11px] text-muted-foreground pt-2 border-t border-border">
                  <span className="font-semibold text-foreground">{t('defi.yield.liveLabel')}</span>{t('defi.yield.live')}
                </div>
              </div>
            </motion.div>

          </div>

          {/* Bottom hook */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="shrink-0 mt-4 rounded-xl border border-[#627EEA]/30 bg-[#627EEA]/08 px-4 py-2.5 text-xs text-center text-muted-foreground"
            style={{ backgroundColor: '#627EEA0F' }}
          >
            {t('defi.hook')}
          </motion.div>
          <KeyPoint topic="defi" hood="defi" className="mt-2" />
        </div>

        {/* ═══════ STABLECOINS ═══════ */}
        <div id="s2-stablecoins" className="h-full flex flex-col p-6 lg:p-10">
          <div className="shrink-0 mb-4">
            <h2 className="text-2xl lg:text-3xl font-bold text-foreground">{t('stablecoins.heading')}</h2>
            <p className="text-sm text-muted-foreground mt-1">{t('stablecoins.subtitle')}</p>
          </div>

          <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-3 gap-4">
            {stablecoinCards.map((s, ci) => {
              const meta = stablecoinCardMeta[ci];
              return (
              <motion.div
                key={ci}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: ci * 0.1 }}
                className="rounded-xl border-2 p-4 flex flex-col gap-3 min-h-0"
                style={{ borderColor: meta.color + '50', backgroundColor: meta.color + '08' }}
              >
                <div className="flex items-center gap-3 shrink-0">
                  <span className="text-3xl shrink-0 leading-none">{meta.icon}</span>
                  <div className="min-w-0">
                    <div className="font-black text-base leading-tight" style={{ color: meta.color }}>{s.title}</div>
                    <div className="text-[11px] text-muted-foreground leading-tight">{s.sub}</div>
                  </div>
                </div>
                {/* Logo strip — the visual: who's in this category */}
                <div className="flex flex-wrap gap-2 shrink-0">
                  {s.logos.map((l, li) => {
                    const logoColor = meta.logoColors[li];
                    return (
                    <div
                      key={l.sym}
                      className="flex items-center gap-1.5 rounded-md border bg-card px-2 py-1"
                      style={{ borderColor: logoColor + '55' }}
                    >
                      <div
                        className="size-6 rounded-full flex items-center justify-center text-[8px] font-black text-white shrink-0"
                        style={{ background: logoColor }}
                      >$</div>
                      <div className="flex flex-col leading-none">
                        <span className="text-[11px] font-black" style={{ color: logoColor }}>{l.sym}</span>
                        <span className="text-[9px] text-muted-foreground">{l.tag}</span>
                      </div>
                    </div>
                    );
                  })}
                </div>
                <div className="rounded-lg border bg-card/60 px-3 py-2.5" style={{ borderColor: meta.color + '30' }}>
                  <div className="text-[9px] font-bold uppercase tracking-wider" style={{ color: meta.color }}>{t('stablecoins.mechanismLabel')}</div>
                  <div className="text-sm text-foreground leading-snug mt-0.5">{s.mechanism}</div>
                </div>
                <div className="mt-auto rounded-lg p-3 border-l-2" style={{ borderColor: '#ED1C24', backgroundColor: '#ED1C2410' }}>
                  <div className="text-[9px] font-black uppercase tracking-widest" style={{ color: '#ED1C24' }}>{t('stablecoins.breakLabel')}</div>
                  <div className="text-sm text-muted-foreground leading-snug mt-0.5">{s.risk}</div>
                </div>
              </motion.div>
              );
            })}
          </div>

          {/* Scale + regulation as three stat tiles */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="shrink-0 mt-4 grid grid-cols-3 gap-2 rounded-xl border border-border bg-card px-3 py-2.5"
          >
            {stablecoinStats.map((stat, i) => (
              <div key={i} className="flex flex-col items-center gap-0.5 text-center">
                <div className="text-base lg:text-lg font-black text-foreground leading-none">{stat.value}</div>
                <div className="text-[10px] text-muted-foreground uppercase tracking-wider leading-snug">{stat.label}</div>
              </div>
            ))}
          </motion.div>
          <KeyPoint topic="stablecoins" hood="stablecoins" className="mt-2" />
        </div>

        {/* ═══════ APPS — Beyond DeFi (1/2) ═══════ */}
        {[
          { id: 's2-apps', ns: 'apps1', cards: apps1Cards, meta: apps1CardMeta },
          { id: 's2-apps-2', ns: 'apps2', cards: apps2Cards, meta: apps2CardMeta },
        ].map(slide => (
        <div key={slide.id} id={slide.id} className="h-full flex flex-col p-6 lg:p-10">
          <div className="shrink-0 mb-4">
            <h2 className="text-2xl lg:text-3xl font-bold text-foreground">{t(`${slide.ns}.heading`)}</h2>
            <p className="text-sm text-muted-foreground mt-1">{t(`${slide.ns}.subtitle`)}</p>
          </div>

          <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-2 gap-5">
            {slide.cards.map((app, ci) => {
              const meta = slide.meta[ci];
              return (
              <motion.div
                key={ci}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: ci * 0.1 }}
                className="rounded-xl border-2 p-5 flex flex-col gap-4 min-h-0"
                style={{ borderColor: meta.color + '50', backgroundColor: meta.color + '08' }}
              >
                <div className="flex items-center gap-3 shrink-0">
                  <span className="text-3xl shrink-0 leading-none">{meta.icon}</span>
                  <div className="min-w-0">
                    <div className="font-black text-lg leading-tight" style={{ color: meta.color }}>{app.title}</div>
                    <div className="text-xs text-muted-foreground leading-tight">{app.sub}</div>
                  </div>
                </div>
                <p className="text-base text-foreground leading-snug">{app.what}</p>
                {/* Project badges — the visual: who's building here */}
                <div className="flex flex-wrap gap-2.5 flex-1 content-start">
                  {app.projects.map(p => (
                    <div
                      key={p.sym}
                      className="rounded-lg border bg-card px-3 py-2 flex flex-col leading-tight"
                      style={{ borderColor: meta.color + '55' }}
                    >
                      <span className="text-sm font-bold text-foreground">{p.sym}</span>
                      <span className="text-[11px] text-muted-foreground">{p.tag}</span>
                    </div>
                  ))}
                </div>
                <div className="rounded-lg border-l-2 px-3 py-2.5 text-sm leading-snug" style={{ borderColor: '#ED1C24', backgroundColor: '#ED1C2410' }}>
                  <span className="font-bold" style={{ color: '#ED1C24' }}>{t(`${slide.ns}.limitLabel`)}</span>
                  <span className="text-muted-foreground">{app.limit}</span>
                </div>
              </motion.div>
              );
            })}
          </div>
          <KeyPoint topic={slide.ns} hood="apps" className="mt-3" />
        </div>
        ))}

        {/* ═══════ S2-COMPARISON ═══════ */}
        <div id="s2-comparison" className="h-full">
          <ComparisonSlide
            title={t('comparison.title')}
            featureLabel={t('comparison.featureLabel')}
            option1Label={t('comparison.option1Label')}
            option2Label={t('comparison.option2Label')}
            items={comparisonItems}
            footer={<KeyPoint topic="comparison" />}
          />
        </div>

        {/* ═══════ BEST FITS — WHERE ETHEREUM WINS ═══════ */}
        <div id="s2-bestfits" className="h-full flex flex-col p-5 lg:p-8">
          <div className="shrink-0 mb-3">
            <span className="px-2.5 py-0.5 rounded-full bg-[#627EEA]/15 border border-[#627EEA]/40 text-[#627EEA] text-xs font-bold">{t('bestFits.badge')}</span>
            <h2 className="text-2xl lg:text-3xl font-bold text-foreground mt-1">{t('bestFits.heading')}</h2>
            <p className="text-sm text-muted-foreground max-w-3xl">
              {t('bestFits.subtitleA')}<strong className="text-foreground">{t('bestFits.subtitleStrong')}</strong>{t('bestFits.subtitleB')}
            </p>
          </div>
          <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-2 gap-3">
            {bestFitsItems.map((uc, i) => (
              <div key={i} className="rounded-xl border-2 p-3 flex flex-col gap-2" style={{ borderColor: '#627EEA55', backgroundColor: '#627EEA08' }}>
                <div className="flex items-center gap-2">
                  <span className="text-2xl shrink-0">{bestFitsEmojis[i]}</span>
                  <div className="font-black text-foreground text-base leading-tight">{uc.name}</div>
                </div>
                <div className="text-xs text-muted-foreground leading-snug">
                  <span className="font-bold text-[#627EEA] uppercase tracking-widest text-[9px] mr-1">{t('bestFits.whyLabel')}</span>
                  {uc.why}
                </div>
                <div className="mt-auto text-[11px] text-foreground bg-card border border-border rounded-md px-2 py-1.5 leading-snug">
                  <span className="font-bold text-[#627EEA] uppercase tracking-widest text-[9px] mr-1">{t('bestFits.wildLabel')}</span>
                  {uc.example}
                </div>
              </div>
            ))}
          </div>
          <div className="shrink-0 mt-3 p-2.5 bg-[#ef4444]/08 border border-[#ef4444]/30 rounded-lg text-[11px] text-muted-foreground">
            <strong className="text-[#ef4444]">{t('bestFits.notFitLabel')}</strong>{t('bestFits.notFitBody')}
          </div>
          <KeyPoint topic="bestFits" className="mt-2" />
        </div>

        {/* ═══════ WORST FITS — WHERE ETHEREUM IS WRONG ═══════ */}
        <div id="s2-worstfits" className="h-full flex flex-col p-5 lg:p-8">
          <div className="shrink-0 mb-3">
            <span className="px-2.5 py-0.5 rounded-full bg-[#ef4444]/15 border border-[#ef4444]/40 text-[#ef4444] text-xs font-bold">{t('worstFits.badge')}</span>
            <h2 className="text-2xl lg:text-3xl font-bold text-foreground mt-1">{t('worstFits.headingA')}<em>{t('worstFits.headingEm')}</em>{t('worstFits.headingB')}</h2>
            <p className="text-sm text-muted-foreground max-w-3xl">
              {t('worstFits.subtitle')}
            </p>
          </div>
          <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-2 gap-3">
            {worstFitsItems.map((uc, i) => (
              <div key={i} className="rounded-xl border-2 p-3 flex flex-col gap-2" style={{ borderColor: '#ef444455', backgroundColor: '#ef444408' }}>
                <div className="flex items-center gap-2">
                  <span className="text-2xl shrink-0">{worstFitsEmojis[i]}</span>
                  <div className="font-black text-foreground text-base leading-tight">{uc.name}</div>
                </div>
                <div className="text-xs text-muted-foreground leading-snug">
                  <span className="font-bold text-[#ef4444] uppercase tracking-widest text-[9px] mr-1">{t('worstFits.whyNotLabel')}</span>
                  {uc.why}
                </div>
                <div className="mt-auto text-[11px] text-foreground bg-card border border-border rounded-md px-2 py-1.5 leading-snug">
                  <span className="font-bold text-[#10b981] uppercase tracking-widest text-[9px] mr-1">{t('worstFits.useInsteadLabel')}</span>
                  {uc.alt}
                </div>
              </div>
            ))}
          </div>
          <KeyPoint topic="worstFits" className="mt-3" />
        </div>

        {/* ═══════ QUIZ ═══════ */}
        <div id="s2-quiz" className="h-full">
          <QuizSlide
            question={t('quiz.question')}
            options={quizOptions}
            explanation={t('quiz.explanation')}
          />
        </div>

        {/* ═══════ QUIZ 2 — EIP-1559 fee mechanics ═══════ */}
        <div id="s2-quiz-2" className="h-full">
          <QuizSlide
            question={t('quiz2.question')}
            options={quiz2Options}
            explanation={t('quiz2.explanation')}
          />
        </div>

        {/* ═══════ QUIZ 3 — Contract deployment address ═══════ */}
        <div id="s2-quiz-3" className="h-full">
          <QuizSlide
            question={t('quiz3.question')}
            options={quiz3Options}
            explanation={t('quiz3.explanation')}
          />
        </div>

        {/* ═══════ TAKEAWAYS ═══════ */}
        <div id="s2-takeaways" className="h-full">
          <TakeawaySlide
            title={t('takeaways.title')}
            takeaways={takeawayItems}
          />
        </div>

        </div>
        <SiteFooter className="snap-start" />
      </div>
    </div>
  );
}
