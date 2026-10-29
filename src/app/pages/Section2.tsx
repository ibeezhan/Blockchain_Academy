import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import anime from 'animejs';
import { useTranslation } from 'react-i18next';
import { TitleSlide } from '../components/templates/TitleSlide';
import { ConceptSlide } from '../components/templates/ConceptSlide';
import { ComparisonSlide } from '../components/templates/ComparisonSlide';
import { QuizSlide } from '../components/templates/QuizSlide';
import { TakeawaySlide } from '../components/templates/TakeawaySlide';
import { CalloutBox } from '../components/shared/CalloutBox';
import { DefinitionBox } from '../components/shared/DefinitionBox';
import { Bitcoin, ExternalLink, AlertTriangle } from 'lucide-react';
import { SectionNav } from '../components/navigation/SectionNav';
import { SiteFooter } from '../components/shared/SiteFooter';
import secpCurve from '../../assets/bf/secp256k1-curve.svg';

/** Sidebar shape — labels resolved at render time via i18n */
const section2ChaptersShape: ReadonlyArray<{ id: string; kind?: 'group' }> = [
  { kind: 'group', id: 'g-s2-origins' },
  { id: 's2-breakthrough' },
  { id: 's2-paper' },
  { id: 's2-what' },

  { kind: 'group', id: 'g-s2-problems' },
  { id: 's2-byzantine' },
  { id: 's2-consensus' },
  { id: 's2-doublespend' },
  { id: 's2-utxo' },

  { kind: 'group', id: 'g-s2-tokenomics' },
  { id: 's2-supply' },
  { id: 's2-stats' },
  { id: 's2-nodes' },

  { kind: 'group', id: 'g-s2-keys' },
  { id: 's2-keys' },
  { id: 's2-seed' },
  { id: 's2-keys-demo' },

  { kind: 'group', id: 'g-s2-structure' },
  { id: 's2-security' },
  { id: 's2-merkle-build' },
  { id: 's2-merkle' },
  { id: 's2-immutability' },

  { kind: 'group', id: 'g-s2-mining' },
  { id: 's2-mining' },
  { id: 's2-mining-demo' },

  { kind: 'group', id: 'g-s2-realworld' },
  { id: 's2-realworld-cases' },
  { id: 's2-rw-legaltender' },
  { id: 's2-rw-volcano' },
  { id: 's2-rw-pizza' },
  { id: 's2-rw-landfill' },
  { id: 's2-rw-heat' },

  { kind: 'group', id: 'g-s2-limits' },
  { id: 's2-limits' },
  { id: 's2-ethereum-bridge' },

  { kind: 'group', id: 'g-s2-wrap' },
  { id: 's2-quiz' },
  { id: 's2-takeaways' },
];

// ─── Interactive: Bitcoin Supply Chart ──────────────────────────────────────

// Halving epochs — start year (as decimal), reward, cumulative BTC at the
// START of the epoch. Cumulative-at-start follows the geometric series:
// after the k-th halving, 21,000,000 × (1 − 1/2^k) BTC has been mined.
const EPOCHS = [
  { start: 2009.01, reward: 50,           cumAtStart: 0          },
  { start: 2012.91, reward: 25,           cumAtStart: 10_500_000 },
  { start: 2016.52, reward: 12.5,         cumAtStart: 15_750_000 },
  { start: 2020.36, reward: 6.25,         cumAtStart: 18_375_000 },
  { start: 2024.30, reward: 3.125,        cumAtStart: 19_687_500 },
  { start: 2028.30, reward: 1.5625,       cumAtStart: 20_343_750 },
  { start: 2032.30, reward: 0.78125,      cumAtStart: 20_671_875 },
  { start: 2036.30, reward: 0.390625,     cumAtStart: 20_835_938 },
  { start: 2040.30, reward: 0.1953125,    cumAtStart: 20_917_969 },
  { start: 2044.30, reward: 0.09765625,   cumAtStart: 20_958_984 },
];

const MAX_BTC = 21_000_000;
const MIN_YEAR = 2009;
const MAX_YEAR = 2048;

function epochAtYear(year: number) {
  for (let i = EPOCHS.length - 1; i >= 0; i--) {
    if (year >= EPOCHS[i].start) return { ...EPOCHS[i], idx: i };
  }
  return { ...EPOCHS[0], idx: 0 };
}

function supplyAtYear(year: number): number {
  if (year <= MIN_YEAR) return 0;
  const e = epochAtYear(year);
  // 210,000 blocks per epoch, epoch length ≈ 4 years → 52,500 blocks per year
  const yearsIn = year - e.start;
  const btcPerYear = 52_500 * e.reward;
  const total = e.cumAtStart + yearsIn * btcPerYear;
  return Math.min(total, MAX_BTC);
}

function fmtBtc(n: number): string {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(2) + 'M';
  if (n >= 1_000)     return (n / 1_000).toFixed(1) + 'k';
  return n.toFixed(0);
}

function fmtYear(y: number): string {
  const year = Math.floor(y);
  const month = Math.round((y - year) * 12);
  const m = Math.max(1, Math.min(12, month + 1));
  const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${MONTHS[m - 1]} ${year}`;
}

function BitcoinSupplyInfoPanel({ year }: { year: number }) {
  const { t } = useTranslation('blockchain-fundamentals/section-2');
  const e = epochAtYear(year);
  const total = supplyAtYear(year);
  const pct = (total / MAX_BTC) * 100;
  const nextHalvingYear = EPOCHS[e.idx + 1]?.start;
  const yearsToNext = nextHalvingYear ? nextHalvingYear - year : null;
  const issuanceRate = 52_500 * e.reward;

  return (
    <div className="flex flex-col gap-2.5">
      <div className="p-3 bg-gradient-to-br from-[#f59e0b]/15 to-transparent border border-[#f59e0b]/40 rounded-xl">
        <div className="text-[10px] font-bold text-[#f59e0b] uppercase tracking-widest">{t('supply.panel.totalMined')}</div>
        <div className="font-mono font-black text-2xl text-foreground mt-0.5">{Math.round(total).toLocaleString()} BTC</div>
        <div className="mt-2 h-2 bg-muted rounded-full overflow-hidden">
          <div className="h-full bg-[#f59e0b] transition-all" style={{ width: `${pct}%` }} />
        </div>
        <div className="text-[10px] text-muted-foreground mt-1">{pct.toFixed(2)}{t('supply.panel.percentOf')}</div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div className="p-2.5 bg-card border border-border rounded-lg">
          <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{t('supply.panel.epoch')}</div>
          <div className="font-black text-foreground">#{e.idx}</div>
        </div>
        <div className="p-2.5 bg-card border border-border rounded-lg">
          <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{t('supply.panel.blockReward')}</div>
          <div className="font-black text-foreground">{e.reward < 1 ? e.reward.toFixed(4) : e.reward} BTC</div>
        </div>
        <div className="p-2.5 bg-card border border-border rounded-lg col-span-2">
          <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{t('supply.panel.yearlyIssuance')}</div>
          <div className="font-mono font-black text-foreground">≈ {issuanceRate.toLocaleString(undefined, { maximumFractionDigits: 0 })} {t('supply.panel.perYearSuffix')}</div>
        </div>
        <div className="p-2.5 bg-card border border-border rounded-lg col-span-2">
          <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{t('supply.panel.nextHalving')}</div>
          {nextHalvingYear ? (
            <div className="font-black text-foreground">
              {fmtYear(nextHalvingYear)} <span className="text-muted-foreground font-normal text-xs">{t('supply.panel.inYears', { years: yearsToNext!.toFixed(1) })} {(e.reward / 2).toFixed(4)} {t('supply.panel.rewardSuffix')}</span>
            </div>
          ) : (
            <div className="text-muted-foreground text-xs">{t('supply.panel.allHalvings')}</div>
          )}
        </div>
      </div>

      <div className="p-2.5 bg-muted/40 border border-border rounded-lg text-[11px] text-muted-foreground leading-snug">
        {t('supply.panel.footnoteA')} <strong className="text-foreground">{t('supply.panel.footnoteBlocks')}</strong> {t('supply.panel.footnoteB')} <strong className="text-foreground">{t('supply.panel.footnoteStart')}</strong> {t('supply.panel.footnoteC')} <strong className="text-foreground">{t('supply.panel.footnoteEnd')}</strong> {t('supply.panel.footnoteTail')}
      </div>
    </div>
  );
}

// Combined slide-friendly wrapper that shares a single `year` state between
// the chart (left) and info panel (right).
function BitcoinSupplyInteractive() {
  const { t } = useTranslation('blockchain-fundamentals/section-2');
  const [year, setYear] = useState(2026);
  return (
    <div className="h-full flex flex-col p-5 lg:p-8">
      <div className="shrink-0 mb-3">
        <span className="px-2.5 py-0.5 rounded-full bg-[#f59e0b]/15 border border-[#f59e0b]/40 text-[#f59e0b] text-xs font-bold">{t('supply.interactiveBadge')}</span>
        <h2 className="text-2xl lg:text-3xl font-bold text-foreground mt-1">{t('supply.heading')}</h2>
        <p className="text-sm text-muted-foreground max-w-3xl">{t('supply.lead')}</p>
      </div>

      <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-[1.7fr_1fr] gap-5">
        <div className="min-w-0">
          <BitcoinSupplyChartWithYear year={year} setYear={setYear} />
        </div>
        <div className="overflow-y-auto">
          <BitcoinSupplyInfoPanel year={year} />
        </div>
      </div>

      {/* Qualitative facts strip */}
      <div className="shrink-0 mt-3 grid grid-cols-3 gap-2 text-[11px]">
        {(t('supply.facts', { returnObjects: true }) as Array<{ strong: string; tail: string }>).map((f, i) => (
          <div key={i} className="p-2 bg-card border border-border rounded-lg">
            <span className="font-bold text-foreground">{f.strong}</span>
            <span className="text-muted-foreground"> {f.tail}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// Pulled into a separate sub-component so the slider state is owned by the parent.
function BitcoinSupplyChartWithYear({ year, setYear }: { year: number; setYear: (y: number) => void }) {
  const { t } = useTranslation('blockchain-fundamentals/section-2');
  const currentSupply = supplyAtYear(year);
  const e = epochAtYear(year);

  const W = 600, H = 300;
  const M = { top: 18, right: 14, bottom: 36, left: 56 };
  const pw = W - M.left - M.right;
  const ph = H - M.top  - M.bottom;

  const sx = (yr: number) => M.left + ((yr - MIN_YEAR) / (MAX_YEAR - MIN_YEAR)) * pw;
  const sy = (btc: number) => M.top + ph - (btc / MAX_BTC) * ph;

  const pathPoints: string[] = [];
  let first = true;
  for (const ep of EPOCHS) {
    if (ep.start > MAX_YEAR) break;
    pathPoints.push(`${first ? 'M' : 'L'} ${sx(ep.start).toFixed(2)} ${sy(ep.cumAtStart).toFixed(2)}`);
    first = false;
  }
  pathPoints.push(`L ${sx(MAX_YEAR).toFixed(2)} ${sy(supplyAtYear(MAX_YEAR)).toFixed(2)}`);
  const supplyPath = pathPoints.join(' ');

  const yearTicks = [2009, 2012, 2016, 2020, 2024, 2028, 2032, 2036, 2040, 2044, 2048];
  const supplyTicks = [0, 5, 10, 15, 20, 21];

  return (
    <div className="w-full flex flex-col gap-3">
      <div className="p-3 bg-card border border-border rounded-xl">
        <div className="flex items-center justify-between gap-3 mb-1">
          <div className="text-xs font-semibold text-muted-foreground">{t('supply.chart.dragSlider')}</div>
          <div className="font-mono font-black text-base text-[#f59e0b]">{fmtYear(year)}</div>
        </div>
        <input
          type="range"
          min={MIN_YEAR}
          max={MAX_YEAR}
          step={0.05}
          value={year}
          onChange={ev => setYear(Number(ev.target.value))}
          className="w-full accent-[#f59e0b]"
          aria-label={t('supply.chart.yearAria')}
        />
        <div className="flex justify-between text-[10px] text-muted-foreground mt-0.5 font-mono">
          <span>{MIN_YEAR}</span><span>{MAX_YEAR}</span>
        </div>
      </div>

      <div className="bg-card border border-border rounded-xl p-2">
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto" role="img" aria-label={t('supply.chart.imageAria')}>
          {supplyTicks.map(t => (
            <g key={`yt-${t}`}>
              <line x1={M.left} y1={sy(t * 1_000_000)} x2={M.left + pw} y2={sy(t * 1_000_000)}
                    stroke="currentColor" strokeOpacity="0.08" />
              <text x={M.left - 6} y={sy(t * 1_000_000) + 3} fontSize="10"
                    textAnchor="end" fill="currentColor" opacity="0.6">{t}M</text>
            </g>
          ))}
          {yearTicks.map(t => (
            <g key={`xt-${t}`}>
              <line x1={sx(t)} y1={M.top + ph} x2={sx(t)} y2={M.top + ph + 4}
                    stroke="currentColor" strokeOpacity="0.4" />
              <text x={sx(t)} y={M.top + ph + 16} fontSize="10" textAnchor="middle"
                    fill="currentColor" opacity="0.6">{t}</text>
            </g>
          ))}
          <line x1={M.left} y1={sy(MAX_BTC)} x2={M.left + pw} y2={sy(MAX_BTC)}
                stroke="#ED1C24" strokeOpacity="0.5" strokeDasharray="3 3" />
          <text x={M.left + pw - 4} y={sy(MAX_BTC) - 4} fontSize="10" textAnchor="end" fill="#ED1C24" opacity="0.8">
            {t('supply.chart.capLabel')}
          </text>
          {EPOCHS.map((ep, i) => {
            if (i === 0 || ep.start > MAX_YEAR) return null;
            const active = e.idx === i;
            return (
              <g key={`hv-${i}`} style={{ cursor: 'pointer' }} onClick={() => setYear(ep.start + 0.05)}>
                <line x1={sx(ep.start)} y1={M.top} x2={sx(ep.start)} y2={M.top + ph}
                      stroke="#f59e0b" strokeOpacity={active ? 0.9 : 0.35} strokeDasharray="2 4" />
                <text x={sx(ep.start) + 2} y={M.top + 10} fontSize="9" fill="#f59e0b"
                      opacity={active ? 1 : 0.7}>
                  H{i} · {ep.reward < 1 ? ep.reward.toFixed(4) : ep.reward} BTC
                </text>
              </g>
            );
          })}
          <path d={supplyPath} fill="none" stroke="#f59e0b" strokeWidth="2.5" />
          <path d={`${supplyPath} L ${sx(MAX_YEAR)} ${M.top + ph} L ${M.left} ${M.top + ph} Z`}
                fill="#f59e0b" opacity="0.08" />
          <line x1={sx(year)} y1={M.top} x2={sx(year)} y2={M.top + ph}
                stroke="#6366f1" strokeWidth="1.5" strokeOpacity="0.7" />
          <circle cx={sx(year)} cy={sy(currentSupply)} r="6" fill="#6366f1" stroke="#fff" strokeWidth="2" />
          <line x1={M.left} y1={M.top} x2={M.left} y2={M.top + ph} stroke="currentColor" strokeOpacity="0.25" />
          <line x1={M.left} y1={M.top + ph} x2={M.left + pw} y2={M.top + ph} stroke="currentColor" strokeOpacity="0.25" />
        </svg>
      </div>

      <div className="flex flex-wrap gap-1.5">
        {EPOCHS.map((ep, i) => {
          const active = e.idx === i;
          return (
            <button
              key={i}
              onClick={() => setYear(ep.start + 0.05)}
              className="px-2 py-1 rounded-md text-[10px] font-mono font-bold transition-colors"
              style={{
                backgroundColor: active ? '#f59e0b' : '#f59e0b15',
                color: active ? '#fff' : '#f59e0b',
                borderWidth: 1,
                borderStyle: 'solid',
                borderColor: active ? '#f59e0b' : '#f59e0b40',
              }}
            >
              {i === 0 ? t('supply.chart.genesisLabel') : `H${i}`} · {Math.floor(ep.start)}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ─── Interactive: Mining (nonce search) ────────────────────────────────────

/**
 * A fast pseudo-hash for the mining demo. NOT a real cryptographic hash —
 * SHA-256 in the browser is async per-call which makes a tight inner loop
 * painful to animate. This produces deterministic 64-char hex output so each
 * (nonce + blockData) input lands on a stable string the student can compare.
 * The footnote on the slide makes the simplification explicit.
 */
function pseudoHash(nonce: number, blockData: string): string {
  let h = 0x811c9dc5 ^ nonce;
  const s = blockData + ':' + nonce;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  let out = '';
  for (let i = 0; i < 8; i++) {
    h = Math.imul(h ^ (h >>> 13), 0x5bd1e995);
    h ^= (h >>> 15);
    out += ((h >>> 0).toString(16).padStart(8, '0'));
  }
  return out;
}

function MiningDemo() {
  const { t } = useTranslation('blockchain-fundamentals/section-2');
  const BLOCK_DATA = 'block#902451 | prev:00000000…a3f8 | tx:8 | reward:3.125 BTC';
  const [difficulty, setDifficulty] = useState(4); // leading hex zeros required
  const [mining, setMining]   = useState(false);
  const [nonce, setNonce]     = useState(0);
  const [hash, setHash]       = useState(pseudoHash(0, BLOCK_DATA));
  const [tries, setTries]     = useState(0);
  const [found, setFound]     = useState<{ nonce: number; hash: string; tries: number; elapsedMs: number } | null>(null);
  const [startedAt, setStartedAt] = useState<number | null>(null);

  const target = '0'.repeat(difficulty);

  // Animation loop — does N tries per frame and yields back to the browser.
  useEffect(() => {
    if (!mining) return;

    const PER_FRAME = 6000;
    let frame = 0;
    let stopped = false;

    const start = performance.now();
    setStartedAt(start);
    let curNonce = nonce;
    let curTries = 0;

    const tick = () => {
      if (stopped) return;
      for (let i = 0; i < PER_FRAME; i++) {
        curNonce++;
        curTries++;
        const h = pseudoHash(curNonce, BLOCK_DATA);
        if (h.startsWith(target)) {
          setNonce(curNonce);
          setHash(h);
          setTries(t => t + curTries);
          setFound({ nonce: curNonce, hash: h, tries: tries + curTries, elapsedMs: performance.now() - start });
          setMining(false);
          return;
        }
      }
      // No find this frame — push the latest values and yield
      setNonce(curNonce);
      setHash(pseudoHash(curNonce, BLOCK_DATA));
      setTries(t => t + curTries);
      curTries = 0;
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);

    return () => { stopped = true; cancelAnimationFrame(frame); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mining, target]);

  const startMining = () => {
    setMining(true);
    setFound(null);
  };
  const pause = () => setMining(false);
  const reset = () => {
    setMining(false);
    setNonce(0);
    setTries(0);
    setHash(pseudoHash(0, BLOCK_DATA));
    setFound(null);
    setStartedAt(null);
  };

  const elapsedMs = startedAt ? performance.now() - startedAt : 0;
  const hashRate = mining && elapsedMs > 0 ? Math.round((tries / elapsedMs) * 1000) : 0;
  const expectedTries = Math.pow(16, difficulty);

  // Render the hash so the matching prefix is green, the rest neutral
  const renderHash = (h: string) => {
    const ok = h.slice(0, difficulty);
    const rest = h.slice(difficulty);
    const matches = ok === target;
    return (
      <span className="font-mono break-all">
        <span className={matches ? 'text-[#39B54A] font-bold' : 'text-[#ED1C24] font-bold'}>{ok}</span>
        <span className="text-muted-foreground">{rest}</span>
      </span>
    );
  };

  return (
    <div className="h-full flex flex-col p-5 lg:p-8">
      <div className="shrink-0 mb-3 flex items-start justify-between gap-4">
        <div>
          <span className="px-2.5 py-0.5 rounded-full bg-[#f59e0b]/15 border border-[#f59e0b]/40 text-[#f59e0b] text-xs font-bold">{t('miningDemo.interactiveBadge')}</span>
          <h2 className="text-2xl lg:text-3xl font-bold text-foreground mt-1">{t('miningDemo.heading')}</h2>
          <p className="text-sm text-muted-foreground max-w-3xl">
            {t('miningDemo.lead')}
          </p>
        </div>
      </div>

      <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-[1.5fr_1fr] gap-5">
        {/* Left — block + live hash */}
        <div className="flex flex-col gap-3 min-w-0">
          <div className="p-4 bg-card border border-border rounded-xl">
            <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-2">{t('miningDemo.blockHeader')}</div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-2 bg-muted/40 rounded-md">
                <div className="text-[10px] text-muted-foreground">{t('miningDemo.blockNumLabel')}</div>
                <div className="font-mono font-bold text-foreground">902,451</div>
              </div>
              <div className="p-2 bg-muted/40 rounded-md">
                <div className="text-[10px] text-muted-foreground">{t('miningDemo.prevHashLabel')}</div>
                <div className="font-mono font-bold text-foreground">00000000…a3f8</div>
              </div>
              <div className="p-2 bg-muted/40 rounded-md">
                <div className="text-[10px] text-muted-foreground">{t('miningDemo.txLabel')}</div>
                <div className="font-mono font-bold text-foreground">8</div>
              </div>
              <div className="p-2 bg-muted/40 rounded-md">
                <div className="text-[10px] text-muted-foreground">{t('miningDemo.rewardLabel')}</div>
                <div className="font-mono font-bold text-foreground">3.125 BTC</div>
              </div>
              <div className="p-2 bg-[#6366f1]/12 border border-[#6366f1]/30 rounded-md col-span-2">
                <div className="text-[10px] text-[#6366f1] font-bold uppercase tracking-widest">{t('miningDemo.nonceLabel')}</div>
                <div className="font-mono font-black text-base text-foreground">{nonce.toLocaleString()}</div>
              </div>
            </div>
          </div>

          <div className="p-4 bg-card border-2 rounded-xl"
               style={{ borderColor: found ? '#39B54A60' : '#f59e0b40' }}>
            <div className="flex items-center justify-between mb-1">
              <div className="text-[10px] font-bold uppercase tracking-widest" style={{ color: found ? '#39B54A' : '#f59e0b' }}>
                {t('miningDemo.currentHash')}
              </div>
              <div className="text-[10px] text-muted-foreground font-mono">
                {t('miningDemo.targetLabel')} <span className="text-[#39B54A] font-bold">{target}</span>
                <span className="text-muted-foreground">{'·'.repeat(64 - difficulty)}</span>
              </div>
            </div>
            <div className="text-[12px] leading-snug">{renderHash(hash)}</div>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-2">
            {!mining ? (
              <button onClick={startMining} disabled={!!found}
                className="px-4 py-2 rounded-lg bg-[#f59e0b] text-white text-sm font-bold hover:bg-[#f59e0b]/90 disabled:opacity-50 transition-colors">
                {t('miningDemo.startMining')}
              </button>
            ) : (
              <button onClick={pause}
                className="px-4 py-2 rounded-lg bg-muted text-foreground text-sm font-bold hover:bg-muted/80 transition-colors">
                {t('miningDemo.pause')}
              </button>
            )}
            <button onClick={reset}
              className="px-3 py-2 rounded-lg bg-muted text-xs font-semibold text-muted-foreground hover:bg-muted/80 transition-colors">
              {t('miningDemo.reset')}
            </button>
            <div className="flex-1" />
            {mining && <span className="text-[11px] text-[#f59e0b] font-bold animate-pulse">{t('miningDemo.searching')}</span>}
            {found && <span className="text-[11px] text-[#39B54A] font-bold">{t('miningDemo.blockFound')}</span>}
          </div>

          {/* Found banner */}
          {found && (
            <div className="p-3 bg-gradient-to-br from-[#39B54A]/15 to-transparent border-2 border-[#39B54A]/50 rounded-xl">
              <div className="text-xs font-black text-[#39B54A] uppercase tracking-widest mb-1">{t('miningDemo.validBlock')}</div>
              <div className="text-xs text-muted-foreground leading-snug">
                {t('miningDemo.foundA')} <strong className="text-foreground">{found.tries.toLocaleString()}</strong> {t('miningDemo.foundAttempts')} {t('miningDemo.foundIn')}
                {' '}<strong className="text-foreground">{(found.elapsedMs / 1000).toFixed(2)}{t('miningDemo.foundSeconds')}</strong>{t('miningDemo.foundB')}{' '}
                <strong className="text-foreground">{t('miningDemo.foundReward')}</strong>{t('miningDemo.foundEnd')}
              </div>
            </div>
          )}
        </div>

        {/* Right — difficulty + stats */}
        <div className="flex flex-col gap-3 min-w-0 overflow-y-auto">
          <div className="p-3 bg-card border border-border rounded-xl">
            <div className="flex items-center justify-between mb-1">
              <div className="text-xs font-semibold text-foreground">{t('miningDemo.difficulty')}</div>
              <div className="font-mono font-black text-base text-[#f59e0b]">{difficulty}</div>
            </div>
            <input
              type="range"
              min={1}
              max={8}
              step={1}
              value={difficulty}
              onChange={ev => { if (!mining) setDifficulty(Number(ev.target.value)); }}
              disabled={mining}
              className="w-full accent-[#f59e0b]"
              aria-label={t('miningDemo.diffAria')}
            />
            <div className="flex justify-between text-[10px] text-muted-foreground mt-0.5 font-mono">
              <span>{t('miningDemo.easyLabel')}</span><span>{t('miningDemo.hardLabel')}</span>
            </div>
            <div className="text-[10px] text-muted-foreground mt-1.5">
              {t('miningDemo.diffNoteA')} <strong className="text-foreground font-mono">{expectedTries.toLocaleString()}</strong>.
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div className="p-2.5 bg-card border border-border rounded-lg">
              <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{t('miningDemo.tries')}</div>
              <div className="font-mono font-black text-foreground">{tries.toLocaleString()}</div>
            </div>
            <div className="p-2.5 bg-card border border-border rounded-lg">
              <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{t('miningDemo.hashRate')}</div>
              <div className="font-mono font-black text-foreground">{mining ? `${hashRate.toLocaleString()}/s` : '—'}</div>
            </div>
          </div>

          <div className="p-3 bg-[#6366f1]/10 border border-[#6366f1]/30 rounded-xl text-[11px] text-muted-foreground leading-snug">
            <div className="font-bold text-[#6366f1] mb-1">{t('miningDemo.realScaleTitle')}</div>
            {t('miningDemo.realScaleA')} <strong className="text-foreground font-mono">{t('miningDemo.realScaleRate')}</strong>{t('miningDemo.realScaleB')} <strong className="text-foreground">{t('miningDemo.realScaleZeros')}</strong>{t('miningDemo.realScaleTail')}
          </div>

          <div className="p-2.5 bg-amber-500/10 border border-amber-500/30 rounded-lg text-[10px] text-muted-foreground">
            <strong className="text-foreground">{t('miningDemo.noteLabel')}</strong> {t('miningDemo.noteA')} <strong className="text-foreground">{t('miningDemo.noteSHA')}</strong> {t('miningDemo.noteTail')}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Interactive: Tamper-detection chain ──────────────────────────────────

interface ChainBlock {
  num: number;
  data: string;
  originalData: string;
  /** Frozen at init — the prev_hash field literally written into this block's header. */
  prevHashStored: string;
  /** Frozen at init — the unix-ish timestamp baked into the block's header at mine-time. */
  timestamp: number;
  /** Frozen at init — the nonce that won the proof-of-work race for this block. */
  nonce: number;
}

function hashShort(input: string): string {
  return pseudoHash(0, input).slice(0, 12);
}

// Realistic-looking constants every Bitcoin block shares (kept identical here
// so the rendered headers feel authentic without making the demo more complex).
const BLOCK_VERSION = '0x20000000';
const BLOCK_BITS    = '0x1702a96e';

/** A block's merkle root is a one-way summary of its transactions — when the
 *  data is tampered the merkle root recomputes and changes too. */
function merkleRootOf(data: string): string {
  return hashShort('mr:' + data);
}

/** The block's hash binds EVERY header field together. Change any one and the
 *  hash changes — which is precisely why the cascade is unforgeable. */
function blockHash(b: { num: number; data: string; timestamp: number; nonce: number }, prevHash: string): string {
  return hashShort(`${BLOCK_VERSION}|${prevHash}|${merkleRootOf(b.data)}|${b.timestamp}|${BLOCK_BITS}|${b.nonce}|${b.num}`);
}

/** Formats a unix timestamp as "Dec 29, 13:46 UTC" — short and unambiguous. */
function fmtTime(unix: number): string {
  try {
    const d = new Date(unix * 1000);
    const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    const mm = String(d.getUTCMinutes()).padStart(2, '0');
    return `${MONTHS[d.getUTCMonth()]} ${d.getUTCDate()}, ${d.getUTCHours()}:${mm} UTC`;
  } catch {
    return String(unix);
  }
}

const INITIAL_BLOCKS: { num: number; data: string; timestamp: number; nonce: number }[] = [
  { num: 902450, data: 'Alice → Bob: 0.5 BTC',    timestamp: 1735480000, nonce: 2083236893 },
  { num: 902451, data: 'Bob → Carol: 0.25 BTC',   timestamp: 1735480642, nonce: 2718845192 },
  { num: 902452, data: 'Carol → Dave: 0.10 BTC',  timestamp: 1735481186, nonce:  783651029 },
  { num: 902453, data: 'Dave → Erin: 0.05 BTC',   timestamp: 1735481822, nonce: 1546872910 },
  { num: 902454, data: 'Erin → Frank: 0.20 BTC',  timestamp: 1735482449, nonce:  998234012 },
  { num: 902455, data: 'Frank → Gina: 0.15 BTC',  timestamp: 1735483102, nonce:  271828183 },
];

function buildChain(initial: typeof INITIAL_BLOCKS): ChainBlock[] {
  const chain: ChainBlock[] = [];
  let prev = '0000000000…GENESIS';
  for (const b of initial) {
    chain.push({
      num: b.num,
      data: b.data,
      originalData: b.data,
      prevHashStored: prev,
      timestamp: b.timestamp,
      nonce: b.nonce,
    });
    // The block's hash that lives in the ledger (frozen at "time of mining")
    prev = blockHash(b, prev);
  }
  return chain;
}

/** Tight key/value row used inside each block's header readout. */
function Row({ label, value, mono, title, color }: {
  label: string;
  value: string;
  mono?: boolean;
  title?: string;
  color?: string;
}) {
  return (
    <div className="flex items-baseline justify-between gap-2 leading-tight">
      <span className="text-muted-foreground shrink-0 font-sans uppercase tracking-widest text-[8.5px] font-bold">
        {label}
      </span>
      <span
        className={`min-w-0 truncate text-right ${mono ? 'font-mono' : 'font-sans'}`}
        title={title}
        style={color ? { color } : undefined}
      >
        {value}
      </span>
    </div>
  );
}

function ImmutableChainDemo() {
  const [chain, setChain] = useState<ChainBlock[]>(() => buildChain(INITIAL_BLOCKS));

  const updateData = (i: number, newData: string) => {
    setChain(prev => prev.map((b, idx) => idx === i ? { ...b, data: newData } : b));
  };

  const resetAll = () => setChain(buildChain(INITIAL_BLOCKS));

  // Compute each block's CURRENT hash from every header field. The merkle
  // root inside `blockHash` derives from `data`, so when `data` is tampered
  // both the merkle root and the block hash visibly drift.
  const currentHashes = chain.map(b => blockHash(b, b.prevHashStored));

  // A block is "broken" if either:
  //   • its stored prev-hash field no longer matches the previous block's
  //     CURRENT hash (the immediate cascade trigger), OR
  //   • any earlier block in the chain is already broken (the cascade itself
  //     — once an upstream link is severed, the whole chain downstream is
  //     part of a fork that the honest network would reject).
  const isBroken: boolean[] = [];
  for (let i = 0; i < chain.length; i++) {
    if (i === 0) {
      isBroken.push(false);
    } else {
      const linkBad = chain[i].prevHashStored !== currentHashes[i - 1];
      isBroken.push(linkBad || isBroken[i - 1]);
    }
  }
  const isTampered = chain.map(b => b.data !== b.originalData);

  const anyChange = isTampered.some(Boolean) || isBroken.some(Boolean);

  return (
    <div className="h-full flex flex-col p-5 lg:p-8">
      <div className="shrink-0 mb-3 flex items-start justify-between gap-4">
        <div>
          <span className="px-2.5 py-0.5 rounded-full bg-[#f59e0b]/15 border border-[#f59e0b]/40 text-[#f59e0b] text-xs font-bold">🧩 Interactive</span>
          <h2 className="text-2xl lg:text-3xl font-bold text-foreground mt-1">Immutability Through Block Linking</h2>
          <p className="text-sm text-muted-foreground max-w-3xl">Each block's hash depends on the previous block's hash. <strong className="text-foreground">Edit any transaction below</strong> and watch the cascade — every downstream block goes red because its stored prev-hash no longer matches.</p>
        </div>
        {anyChange && (
          <button onClick={resetAll}
            className="px-3 py-2 rounded-lg bg-muted text-xs font-semibold text-muted-foreground hover:bg-muted/80 transition-colors shrink-0">
            ↺ Reset chain
          </button>
        )}
      </div>

      <div className="flex-1 min-h-0 flex flex-row gap-1 items-stretch overflow-x-auto pb-2">
        {chain.map((b, i) => {
          const broken    = isBroken[i];
          const tampered  = isTampered[i];
          const status    = broken ? 'broken' : tampered ? 'tampered' : 'valid';
          const ringColor = status === 'valid' ? '#39B54A' : '#ED1C24';
          const merkle    = merkleRootOf(b.data);
          const merkleChanged = merkle !== merkleRootOf(b.originalData);

          return (
            <div key={i} className="flex items-stretch gap-1 shrink-0">
              <div
                className="w-[230px] rounded-xl border-2 p-3 flex flex-col gap-2 transition-colors"
                style={{
                  borderColor: ringColor + (status === 'valid' ? '60' : 'CC'),
                  backgroundColor: status === 'valid' ? ringColor + '08' : ringColor + '12',
                }}
              >
                {/* Header — block # + status badge */}
                <div className="flex items-center justify-between">
                  <div className="text-sm font-black text-foreground">Block #{b.num}</div>
                  <div
                    className="px-1.5 py-0.5 rounded text-[9px] font-black uppercase tracking-widest"
                    style={{ color: ringColor, backgroundColor: ringColor + '20' }}
                  >
                    {status === 'valid' ? '✓ valid' : status === 'tampered' ? '⚠ edited' : '✗ broken'}
                  </div>
                </div>

                {/* Header fields — compact key/value rows */}
                <div className="rounded-md border border-border/60 bg-card/50 px-2 py-1.5 text-[10px] flex flex-col gap-1 font-mono">
                  <Row label="Version"   value={BLOCK_VERSION} />
                  <Row label="Time"      value={fmtTime(b.timestamp)} />
                  <Row label="Prev hash" value={b.prevHashStored} mono title={b.prevHashStored} />
                  <Row
                    label="Merkle root"
                    value={merkle}
                    mono
                    title={merkle}
                    color={merkleChanged ? '#ED1C24' : undefined}
                  />
                  <Row label="Bits"      value={BLOCK_BITS} />
                  <Row label="Nonce"     value={b.nonce.toLocaleString('en-US')} />
                </div>

                {/* Transaction (editable — the only tampering surface) */}
                <div>
                  <div className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest mb-0.5">Transaction</div>
                  <input
                    type="text"
                    value={b.data}
                    onChange={e => updateData(i, e.target.value)}
                    className="w-full px-2 py-1 rounded bg-card border text-[11px] font-mono text-foreground focus:outline-none focus:ring-1 transition-colors"
                    style={{ borderColor: tampered ? '#ED1C24' : 'var(--border)' }}
                  />
                </div>

                {/* This block's hash (live) */}
                <div className="mt-auto pt-1 border-t border-border/60">
                  <div className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">This block's hash</div>
                  <div className="font-mono text-[11px] font-bold" style={{ color: tampered ? '#ED1C24' : '#39B54A' }}>
                    {currentHashes[i]}
                    {tampered && <span className="text-muted-foreground font-normal text-[10px]"> (recomputed)</span>}
                  </div>
                </div>
              </div>

              {/* Link arrow to next block */}
              {i < chain.length - 1 && (
                <div className="flex flex-col items-center justify-center shrink-0 w-4">
                  <div className="text-sm font-bold" style={{ color: isBroken[i + 1] ? '#ED1C24' : '#39B54A' }}>
                    {isBroken[i + 1] ? '✗' : '→'}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Explanation footer */}
      <div className="shrink-0 mt-3 grid grid-cols-3 gap-2 text-[11px]">
        <div className="p-2 bg-card border border-border rounded-lg">
          <div className="font-bold text-foreground mb-0.5">Tamper one block</div>
          <div className="text-muted-foreground">Its hash is recomputed live from its new contents — the original hash on the next block's <em>prev-hash</em> line is now stale.</div>
        </div>
        <div className="p-2 bg-card border border-border rounded-lg">
          <div className="font-bold text-foreground mb-0.5">The cascade</div>
          <div className="text-muted-foreground">Every downstream block goes red because its frozen prev-hash no longer matches the live upstream hash.</div>
        </div>
        <div className="p-2 bg-card border border-border rounded-lg">
          <div className="font-bold text-foreground mb-0.5">Why this is hard to fake</div>
          <div className="text-muted-foreground">To restore the chain you'd have to re-mine <em>every</em> downstream block faster than the entire honest network — that's what the previous slide showed.</div>
        </div>
      </div>
    </div>
  );
}

// ─── Interactive: Merkle Tree ──────────────────────────────────────────────

interface MerkleNode {
  hash: string;
  changed: boolean;
}

// ─── Interactive: Build a Merkle Tree (4 leaves, type-it-yourself) ──────────
//
// Lifted from the v1 Section 1 (Section1.legacy.tsx). Uses real SHA-256 via
// crypto.subtle so the learner watches actual hashes ripple up the tree as
// they type. The downstream MerkleTreeDemo is the "tamper a populated tree"
// counterpart — this one is the "build it from scratch" counterpart.

async function sha256(text: string): Promise<string> {
  const data   = new TextEncoder().encode(text);
  const buffer = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(buffer))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

function shortHash(hash: string) {
  return hash ? hash.slice(0, 10) + '…' : '—';
}

function InteractiveMerkleTree() {
  const [txs,        setTxs]        = useState(['', '', '', '']);
  const [leafHashes, setLeafHashes] = useState(['', '', '', '']);
  const [midHashes,  setMidHashes]  = useState(['', '']);
  const [root,       setRoot]       = useState('');

  const recompute = useCallback(async (values: string[]) => {
    const leaves = await Promise.all(
      values.map(v => (v ? sha256(v) : Promise.resolve('')))
    );
    setLeafHashes(leaves);

    const mid0 = leaves[0] && leaves[1] ? await sha256(leaves[0] + leaves[1]) : '';
    const mid1 = leaves[2] && leaves[3] ? await sha256(leaves[2] + leaves[3]) : '';
    setMidHashes([mid0, mid1]);

    const r = mid0 && mid1 ? await sha256(mid0 + mid1) : '';
    setRoot(r);
  }, []);

  useEffect(() => { recompute(txs); }, [txs, recompute]);

  const update = (i: number, v: string) => {
    setTxs(prev => prev.map((t, idx) => idx === i ? v : t));
  };

  return (
    // flex-col-reverse so the layout grows like a real tree:
    //   transactions at the top (leaves), pairs of hashes in the middle,
    //   merkle root at the bottom (trunk). Pedagogically clearer than
    //   the upside-down "root on top" convention used in CS textbooks.
    <div className="flex flex-col-reverse items-center gap-3 py-4">
      {/* Root — renders at the BOTTOM thanks to flex-col-reverse */}
      <div className={`px-6 py-3 rounded-lg border-2 transition-all duration-300 ${root ? 'bg-[#ED1C24]/20 border-[#ED1C24]' : 'bg-muted/20 border-border'}`}>
        <div className="text-xs text-muted-foreground flex items-center gap-1.5">
          <span>🌳</span>
          <span>Merkle Root</span>
          <span className="text-[9px] text-muted-foreground/70">· trunk</span>
        </div>
        <div className={`font-mono text-sm ${root ? 'text-[#ED1C24]' : 'text-muted-foreground/50'}`}>
          {root ? shortHash(root) : 'Hash(AB + CD)'}
        </div>
      </div>

      {/* Connectors root → mid */}
      <div className="flex gap-32">
        <div className="w-px h-6 bg-border" />
        <div className="w-px h-6 bg-border" />
      </div>

      {/* Level 1 */}
      <div className="flex gap-16">
        {midHashes.map((h, i) => (
          <div key={i} className={`px-5 py-2 rounded-lg border transition-all duration-300 ${h ? 'bg-[#39B54A]/20 border-[#39B54A]' : 'bg-muted/20 border-border'}`}>
            <div className="text-xs text-muted-foreground">Hash {i === 0 ? 'AB' : 'CD'}</div>
            <div className={`font-mono text-xs ${h ? 'text-[#39B54A]' : 'text-muted-foreground/50'}`}>
              {h ? shortHash(h) : `Hash(${i === 0 ? 'A + B' : 'C + D'})`}
            </div>
          </div>
        ))}
      </div>

      {/* Connectors mid → leaves */}
      <div className="flex gap-12">
        <div className="flex gap-16">
          <div className="w-px h-6 bg-border" />
          <div className="w-px h-6 bg-border" />
        </div>
        <div className="flex gap-16">
          <div className="w-px h-6 bg-border" />
          <div className="w-px h-6 bg-border" />
        </div>
      </div>

      {/* Leaves */}
      <div className="flex gap-6">
        {leafHashes.map((h, i) => (
          <div key={i} className={`px-4 py-2 rounded-lg border transition-all duration-300 ${h ? 'bg-[#6366f1]/20 border-[#6366f1]' : 'bg-muted/20 border-border'}`}>
            <div className="text-xs text-muted-foreground">Tx {String.fromCharCode(65 + i)}</div>
            <div className={`font-mono text-xs ${h ? 'text-[#6366f1]' : 'text-muted-foreground/50'}`}>
              {h ? shortHash(h) : `Hash(${String.fromCharCode(65 + i)})`}
            </div>
          </div>
        ))}
      </div>

      {/* Connectors leaves → inputs */}
      <div className="flex gap-[68px]">
        {[0, 1, 2, 3].map(i => <div key={i} className="w-px h-6 bg-border" />)}
      </div>

      {/* Input fields */}
      <div className="flex gap-6">
        {txs.map((v, i) => (
          <input
            key={i}
            type="text"
            value={v}
            onChange={e => update(i, e.target.value)}
            placeholder={`Tx ${String.fromCharCode(65 + i)} data...`}
            className="w-[120px] px-4 py-2 bg-card rounded-lg border-2 border-[#6366f1]/30 text-foreground font-mono text-xs text-center focus:outline-none focus:ring-2 focus:ring-[#6366f1]/50 focus:border-[#6366f1] transition-all placeholder:text-muted-foreground/40"
          />
        ))}
      </div>

      <p className="text-xs text-muted-foreground text-center mt-2 italic">
        🍃 Type transaction data above — each leaf hashes, pairs merge, and the trunk (root) recomputes in real time
      </p>
    </div>
  );
}

function BuildMerkleSlide() {
  return (
    <div className="h-full flex flex-col p-5 lg:p-8">
      <div className="shrink-0 mb-3">
        <span className="px-2.5 py-0.5 rounded-full bg-[#6366f1]/15 border border-[#6366f1]/40 text-[#6366f1] text-xs font-bold">🧩 Interactive</span>
        <h2 className="text-2xl lg:text-3xl font-bold text-foreground mt-1">Build a Merkle Tree</h2>
        <p className="text-sm text-muted-foreground max-w-3xl">
          Type four transactions and watch each leaf hash pair up and condense into the <strong className="text-foreground">Merkle root</strong>. One root summarises everything below — change any byte down here and the cascade reaches the top.
        </p>
      </div>
      <div className="flex-1 min-h-0 overflow-y-auto flex items-start justify-center">
        <InteractiveMerkleTree />
      </div>
    </div>
  );
}

// ─── Interactive: Tamper a Populated Merkle Tree ────────────────────────────

const MERKLE_TXS_INITIAL = [
  'Alice → Bob · 0.50 BTC',
  'Carol → Dave · 0.25 BTC',
  'Erin → Frank · 1.20 BTC',
  'Grace → Heidi · 0.08 BTC',
];

function buildMerkle(txs: string[]): { levels: string[][]; originalLevels: string[][] } {
  const levels: string[][] = [];
  let cur = txs.map(t => hashShort('tx:' + t));
  levels.push(cur);
  while (cur.length > 1) {
    const next: string[] = [];
    for (let i = 0; i < cur.length; i += 2) {
      const a = cur[i];
      const b = cur[i + 1] ?? a; // duplicate last if odd
      next.push(hashShort(a + '|' + b));
    }
    levels.push(next);
    cur = next;
  }
  return { levels, originalLevels: levels.map(l => [...l]) };
}

function MerkleTreeDemo() {
  const [txs, setTxs]   = useState<string[]>(MERKLE_TXS_INITIAL);
  // Recompute every render — at 8 leaves with a fast pseudo-hash, it's cheap.
  const original = buildMerkle(MERKLE_TXS_INITIAL);
  const current  = buildMerkle(txs);

  // Mark which nodes differ from the original tree
  const changedLevels: MerkleNode[][] = current.levels.map((lvl, li) =>
    lvl.map((h, i) => ({ hash: h, changed: h !== original.levels[li]?.[i] }))
  );

  const root = changedLevels[changedLevels.length - 1]?.[0];
  const tampered = changedLevels[0].some(n => n.changed);

  const updateTx = (i: number, v: string) => {
    setTxs(prev => prev.map((t, idx) => idx === i ? v : t));
  };
  const reset = () => setTxs(MERKLE_TXS_INITIAL);

  return (
    <div className="h-full flex flex-col p-5 lg:p-8">
      <div className="shrink-0 mb-3 flex items-start justify-between gap-4">
        <div>
          <span className="px-2.5 py-0.5 rounded-full bg-[#6366f1]/15 border border-[#6366f1]/40 text-[#6366f1] text-xs font-bold">🧩 Interactive</span>
          <h2 className="text-2xl lg:text-3xl font-bold text-foreground mt-1">Merkle Tree — How a Block Commits to its Transactions</h2>
          <p className="text-sm text-muted-foreground max-w-3xl">
            A block doesn't store transactions in its header — it stores their <strong className="text-foreground">Merkle root</strong>: a single hash that summarises all transactions in the block. Tamper with any transaction below and watch the path from leaf to root recolour.
          </p>
        </div>
        {tampered && (
          <button onClick={reset}
            className="px-3 py-2 rounded-lg bg-muted text-xs font-semibold text-muted-foreground hover:bg-muted/80 transition-colors shrink-0">
            ↺ Reset
          </button>
        )}
      </div>

      {/* flex-col-reverse so the tree grows like a real one — leaves at top,
          intermediate hashes pairing downward, merkle root as the trunk at the bottom. */}
      <div className="flex-1 min-h-0 flex flex-col-reverse gap-3 overflow-y-auto">
        {/* Root — renders at the BOTTOM thanks to flex-col-reverse */}
        <div className="flex justify-center">
          <div
            className="px-4 py-2 rounded-lg border-2 text-center transition-colors"
            style={{
              borderColor: root?.changed ? '#ED1C24' : '#39B54A',
              backgroundColor: (root?.changed ? '#ED1C24' : '#39B54A') + '12',
            }}
          >
            <div className="text-[10px] font-bold uppercase tracking-widest flex items-center justify-center gap-1.5"
                 style={{ color: root?.changed ? '#ED1C24' : '#39B54A' }}>
              <span>🌳</span>
              {root?.changed ? '⚠ Merkle root changed' : '✓ Merkle root'}
              <span className="text-[8px] opacity-70">· trunk</span>
            </div>
            <div className="font-mono font-black text-sm text-foreground mt-0.5">{root?.hash ?? '—'}</div>
          </div>
        </div>

        {/* Inner levels — render in array order (leaves-adjacent first so it sits
            ABOVE the root in flex-col-reverse, and root-adjacent last so it sits
            just above the root). */}
        {changedLevels.slice(1, -1).map((lvl, lvlIdx) => (
          <div key={`lvl-${lvlIdx}`}
               className="grid gap-2"
               style={{ gridTemplateColumns: `repeat(${lvl.length}, minmax(0, 1fr))` }}>
            {lvl.map((n, i) => (
              <div
                key={i}
                className="px-2 py-1.5 rounded-md border text-center transition-colors"
                style={{
                  borderColor: n.changed ? '#ED1C24' : '#6366f140',
                  backgroundColor: n.changed ? '#ED1C2410' : '#6366f108',
                }}
              >
                <div className="text-[9px] font-bold uppercase tracking-widest"
                     style={{ color: n.changed ? '#ED1C24' : '#6366f1' }}>
                  hash
                </div>
                <div className="font-mono text-[10px] font-bold text-foreground truncate">{n.hash}</div>
              </div>
            ))}
          </div>
        ))}

        {/* Leaves (transactions) */}
        <div className="grid gap-3"
             style={{ gridTemplateColumns: `repeat(${changedLevels[0].length}, minmax(0, 1fr))` }}>
          {changedLevels[0].map((leaf, i) => (
            <div
              key={i}
              className="rounded-lg border p-3 flex flex-col gap-1.5 transition-colors"
              style={{
                borderColor: leaf.changed ? '#ED1C24' : '#22d3ee40',
                backgroundColor: leaf.changed ? '#ED1C2410' : '#22d3ee08',
              }}
            >
              <div className="text-[10px] font-bold uppercase tracking-widest"
                   style={{ color: leaf.changed ? '#ED1C24' : '#22d3ee' }}>tx {i + 1}</div>
              <input
                type="text"
                value={txs[i]}
                onChange={e => updateTx(i, e.target.value)}
                className="w-full px-2 py-1 rounded bg-card border text-xs font-mono text-foreground focus:outline-none focus:ring-1 transition-colors"
                style={{ borderColor: leaf.changed ? '#ED1C24' : 'var(--border)' }}
              />
              <div className="font-mono text-[10px] text-muted-foreground truncate" title={leaf.hash}>{leaf.hash}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Explanation footer */}
      <div className="shrink-0 mt-3 grid grid-cols-3 gap-2 text-[11px]">
        <div className="p-2 bg-card border border-border rounded-lg">
          <div className="font-bold text-foreground mb-0.5">Hash up in pairs</div>
          <div className="text-muted-foreground">Each pair of hashes is concatenated and hashed together — repeat until one root remains.</div>
        </div>
        <div className="p-2 bg-card border border-border rounded-lg">
          <div className="font-bold text-foreground mb-0.5">One byte changes everything</div>
          <div className="text-muted-foreground">Tampering with any single transaction changes its leaf hash, which changes every node on the path up to the root.</div>
        </div>
        <div className="p-2 bg-card border border-border rounded-lg">
          <div className="font-bold text-foreground mb-0.5">Efficient proofs</div>
          <div className="text-muted-foreground">A light client can verify a tx is in a block using only log₂(N) hashes — they don't need the whole block. This is what enables SPV / mobile wallets.</div>
        </div>
      </div>
    </div>
  );
}

// ─── Interactive: Wallet Analogies (Bank IBAN + Home Keys) ──────────────────
//
// Two side-by-side analogies to make the public-vs-private asymmetry of a
// wallet visceral. Both auto-play on scroll-in and can be replayed manually.
// Animations are powered by anime.js v3.

const PUBLIC_COLOR  = '#39B54A'; // green — safe to share
const PRIVATE_COLOR = '#ED1C24'; // red — never share

/* ─────────────────────────── BANK ACCOUNT (IBAN) ────────────────────────── */

function BankIbanAnalogy() {
  const rootRef     = useRef<HTMLDivElement | null>(null);
  const cardRef     = useRef<HTMLDivElement | null>(null);
  const incomingRef = useRef<HTMLDivElement | null>(null); // coin flying IN
  const outgoingRef = useRef<HTMLDivElement | null>(null); // coin flying OUT
  const balanceRef  = useRef<HTMLSpanElement | null>(null);
  const inCaptionRef  = useRef<HTMLDivElement | null>(null);
  const outCaptionRef = useRef<HTMLDivElement | null>(null);
  const pinRef      = useRef<HTMLDivElement | null>(null);
  const padlockRef  = useRef<HTMLSpanElement | null>(null);

  const [balance, setBalance]   = useState(1420);
  const [pinDigits, setPinDigits] = useState('');
  const [phase, setPhase]       = useState<'idle' | 'playing'>('idle');
  const playedRef               = useRef(false);

  const play = () => {
    if (phase === 'playing') return;
    setPhase('playing');
    setPinDigits('');
    setBalance(1420);

    // Reset positions
    if (incomingRef.current) {
      incomingRef.current.style.opacity = '0';
      incomingRef.current.style.transform = 'translate(-180px, -10px) scale(0.6)';
    }
    if (outgoingRef.current) {
      outgoingRef.current.style.opacity = '0';
      outgoingRef.current.style.transform = 'translate(0px, 0px) scale(1)';
    }
    if (pinRef.current)     { pinRef.current.style.opacity = '0'; pinRef.current.style.transform = 'translateY(8px)'; }
    if (padlockRef.current) padlockRef.current.textContent = '🔒';
    if (inCaptionRef.current)  inCaptionRef.current.style.opacity  = '0';
    if (outCaptionRef.current) outCaptionRef.current.style.opacity = '0';

    const tl = anime.timeline({
      easing: 'easeOutQuad',
      complete: () => setPhase('idle'),
    });

    // 1) Coin flies in from the left → IBAN card → green pulse → balance bumps
    tl.add({
      targets:    incomingRef.current,
      opacity:    [0, 1],
      translateX: [-180, 0],
      translateY: [-10, 0],
      scale:      [0.6, 1],
      duration:   900,
    })
    .add({
      targets:  cardRef.current,
      boxShadow: ['0 0 0px rgba(57,181,74,0)', '0 0 38px rgba(57,181,74,0.55)', '0 0 0px rgba(57,181,74,0)'],
      duration: 700,
    }, '-=150')
    .add({
      targets: { v: 1420 },
      v:       1620,
      round:   1,
      duration: 600,
      update: (a) => {
        if (balanceRef.current) {
          const v = (a.animations[0].currentValue as unknown) as number;
          balanceRef.current.textContent = '€ ' + Number(v).toLocaleString('pt-PT') + ',00';
        }
      },
    }, '-=400')
    .add({
      targets: incomingRef.current,
      opacity: [1, 0],
      scale:   [1, 0.7],
      duration: 350,
    })
    .add({
      targets:    inCaptionRef.current,
      opacity:    [0, 1],
      translateY: [4, 0],
      duration:   350,
    }, '-=200')

    // 2) Pause, then PIN-entry overlay appears
    .add({
      targets:    pinRef.current,
      opacity:    [0, 1],
      translateY: [8, 0],
      duration:   400,
      delay:      450,
    })
    // 3) PIN digits type in
    .add({
      targets: { d: 0 },
      d:       4,
      round:   1,
      duration: 700,
      easing:  'linear',
      update: (a) => {
        const n = Math.floor((a.animations[0].currentValue as unknown) as number);
        setPinDigits('•'.repeat(n));
      },
    })
    // 4) Padlock opens
    .add({
      targets:  padlockRef.current,
      scale:    [1, 1.35, 1],
      duration: 380,
      changeBegin: () => { if (padlockRef.current) padlockRef.current.textContent = '🔓'; },
    })
    // 5) Coin flies OUT (debit) — balance decrements
    .add({
      targets:    outgoingRef.current,
      opacity:    [0, 1],
      translateX: [0, 220],
      translateY: [0, -16],
      scale:      [0.7, 1, 0.8],
      duration:   900,
    })
    .add({
      targets: { v: 1620 },
      v:       1470,
      round:   1,
      duration: 600,
      update: (a) => {
        if (balanceRef.current) {
          const v = (a.animations[0].currentValue as unknown) as number;
          balanceRef.current.textContent = '€ ' + Number(v).toLocaleString('pt-PT') + ',00';
        }
      },
    }, '-=700')
    .add({
      targets:    outCaptionRef.current,
      opacity:    [0, 1],
      translateY: [4, 0],
      duration:   350,
    }, '-=200');
  };

  // Auto-play on scroll-in (first time only)
  useEffect(() => {
    if (!rootRef.current) return;
    const obs = new IntersectionObserver(entries => {
      for (const e of entries) {
        if (e.isIntersecting && !playedRef.current) {
          playedRef.current = true;
          setTimeout(play, 250);
          break;
        }
      }
    }, { threshold: 0.35 });
    obs.observe(rootRef.current);
    return () => obs.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div ref={rootRef} className="relative flex flex-col bg-card border border-border rounded-xl p-4 min-h-[340px] overflow-hidden">
      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div>
          <div className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold">Analogy 1</div>
          <h3 className="text-base lg:text-lg font-bold text-foreground leading-tight">A bank account</h3>
        </div>
        <button
          onClick={play}
          disabled={phase === 'playing'}
          className="text-[11px] px-2.5 py-1 rounded-md bg-muted/60 hover:bg-muted text-foreground font-semibold disabled:opacity-50 transition-colors"
        >↻ Replay</button>
      </div>

      {/* Stage */}
      <div className="relative flex-1 min-h-[180px] flex items-center justify-center">
        {/* Sender — left, vertically aligned with the bank card */}
        <div className="absolute left-2 top-1/2 -translate-y-1/2 flex flex-col items-center text-center text-[10px] text-muted-foreground gap-0.5 select-none">
          <span className="text-2xl">👤</span>
          <span>Anyone</span>
        </div>

        {/* Bank card */}
        <div
          ref={cardRef}
          className="relative bg-gradient-to-br from-[#0f172a] to-[#1e293b] text-white rounded-lg shadow-lg px-4 py-3 w-[230px] z-10"
          style={{ transition: 'box-shadow 200ms' }}
        >
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[10px] font-semibold tracking-widest uppercase opacity-80">Banco</span>
            <span className="text-[10px] opacity-70">●●●●</span>
          </div>
          <div className="text-[10px] opacity-70 uppercase tracking-wider">IBAN</div>
          <div className="font-mono text-[11px] leading-snug">PT50 0033 0000<br/>4521 0000 0028 3</div>
          <div className="mt-2 flex items-center justify-between">
            <span className="text-[10px] opacity-70 uppercase tracking-wider">Saldo</span>
            <span ref={balanceRef} className="font-mono font-bold text-sm">€ 1.420,00</span>
          </div>
        </div>

        {/* Incoming coin (animated) */}
        <div
          ref={incomingRef}
          className="absolute z-20 size-9 rounded-full flex items-center justify-center text-lg font-black text-white shadow-md pointer-events-none"
          style={{
            background: 'linear-gradient(135deg, #f59e0b, #d97706)',
            opacity: 0,
            transform: 'translate(-180px, -10px) scale(0.6)',
          }}
        >€</div>

        {/* Outgoing coin (animated) */}
        <div
          ref={outgoingRef}
          className="absolute z-20 size-9 rounded-full flex items-center justify-center text-lg font-black text-white shadow-md pointer-events-none"
          style={{
            background: 'linear-gradient(135deg, #f59e0b, #d97706)',
            opacity: 0,
          }}
        >€</div>

        {/* PIN pad — appears when sending */}
        <div
          ref={pinRef}
          className="absolute right-1 bottom-1 bg-background border border-border rounded-lg px-2.5 py-2 z-10 shadow-md"
          style={{ opacity: 0 }}
        >
          <div className="flex items-center gap-1.5">
            <span ref={padlockRef} className="text-base">🔒</span>
            <div className="flex flex-col">
              <span className="text-[9px] uppercase tracking-widest text-muted-foreground font-semibold">PIN</span>
              <span className="font-mono font-bold text-foreground text-base leading-none w-12">{pinDigits || '____'}</span>
            </div>
          </div>
        </div>

        {/* Recipient — right, vertically aligned with the bank card */}
        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex flex-col items-center text-center text-[10px] text-muted-foreground gap-0.5 select-none">
          <span className="text-2xl">🏪</span>
          <span>Business</span>
        </div>
      </div>

      {/* Captions */}
      <div className="grid grid-cols-2 gap-2 mt-3 text-[11px]">
        <div ref={inCaptionRef} style={{ opacity: 0 }}
          className="p-2 rounded-md border bg-[color:var(--card)]"
          // dynamic border via style so Tailwind purge isn't needed for arbitrary alpha
          // eslint-disable-next-line react/jsx-no-comment-textnodes
        >
          <div className="text-[10px] uppercase tracking-widest font-bold mb-0.5" style={{ color: PUBLIC_COLOR }}>Anyone can send TO the IBAN</div>
          <div className="text-muted-foreground leading-snug">It's printed on receipts, on the website footer, even on a coffee mug. Public.</div>
        </div>
        <div ref={outCaptionRef} style={{ opacity: 0 }}
          className="p-2 rounded-md border bg-[color:var(--card)]"
        >
          <div className="text-[10px] uppercase tracking-widest font-bold mb-0.5" style={{ color: PRIVATE_COLOR }}>Only the PIN holder spends FROM it</div>
          <div className="text-muted-foreground leading-snug">Without the PIN, the IBAN alone moves nothing. Secret.</div>
        </div>
      </div>

      {/* Mapping row */}
      <div className="mt-3 pt-3 border-t border-border grid grid-cols-2 gap-2 text-[11px]">
        <div className="flex items-center gap-2">
          <span className="size-2 rounded-full shrink-0" style={{ background: PUBLIC_COLOR }}></span>
          <span><strong className="text-foreground">IBAN</strong> ≡ Bitcoin <strong style={{ color: PUBLIC_COLOR }}>address</strong></span>
        </div>
        <div className="flex items-center gap-2">
          <span className="size-2 rounded-full shrink-0" style={{ background: PRIVATE_COLOR }}></span>
          <span><strong className="text-foreground">PIN</strong> ≡ <strong style={{ color: PRIVATE_COLOR }}>private key</strong></span>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────── HOME (mailbox + front door key) ────────────────── */

function HomeKeysAnalogy() {
  const rootRef       = useRef<HTMLDivElement | null>(null);
  const letterRefs    = useRef<(SVGGElement | null)[]>([]);
  const keyRef        = useRef<SVGGElement | null>(null);
  const doorRef       = useRef<SVGGElement | null>(null);
  const insideRef     = useRef<SVGGElement | null>(null);
  const inCaptionRef  = useRef<HTMLDivElement | null>(null);
  const outCaptionRef = useRef<HTMLDivElement | null>(null);

  const [phase, setPhase] = useState<'idle' | 'playing'>('idle');
  const playedRef         = useRef(false);

  const play = () => {
    if (phase === 'playing') return;
    setPhase('playing');

    // Reset
    letterRefs.current.forEach(g => {
      if (!g) return;
      g.style.opacity   = '0';
      g.style.transform = 'translate(0px, -160px) rotate(-12deg)';
    });
    if (keyRef.current)    { keyRef.current.style.opacity = '0'; keyRef.current.style.transform = 'translate(80px, 0px) rotate(0deg)'; }
    if (doorRef.current)   doorRef.current.style.transform = 'rotateY(0deg)';
    if (insideRef.current) insideRef.current.style.opacity = '0';
    if (inCaptionRef.current)  inCaptionRef.current.style.opacity  = '0';
    if (outCaptionRef.current) outCaptionRef.current.style.opacity = '0';

    const tl = anime.timeline({
      easing: 'easeOutQuad',
      complete: () => setPhase('idle'),
    });

    // 1) Three letters drop into the mailbox (staggered, parabolic-ish)
    tl.add({
      targets:    letterRefs.current.filter(Boolean),
      opacity:    [0, 1],
      translateY: [-160, 0],
      translateX: (_el: SVGGElement, i: number) => [(i - 1) * 28, 0],
      rotate:     ['-12deg', '0deg'],
      duration:   650,
      delay:      anime.stagger(220),
    })
    .add({
      targets:    inCaptionRef.current,
      opacity:    [0, 1],
      translateY: [4, 0],
      duration:   400,
    }, '-=200')

    // 2) Pause, then a key flies in FROM THE RIGHT (over the door) so it
    //    doesn't pass through the mailbox on the way to the keyhole.
    .add({
      targets:    keyRef.current,
      opacity:    [0, 1],
      translateX: [80, 0],
      translateY: [0, 0],
      duration:   500,
      delay:      500,
    })
    // 3) Key rotates 90° in the lock
    .add({
      targets:  keyRef.current,
      rotate:   ['0deg', '90deg'],
      duration: 450,
      easing:   'easeInOutQuad',
    })
    // 4) Door opens (rotateY) — the inside reveals (letters retrieved)
    .add({
      targets:  doorRef.current,
      rotateY:  ['0deg', '-72deg'],
      duration: 600,
      easing:   'easeInOutCubic',
    }, '-=100')
    .add({
      targets: insideRef.current,
      opacity: [0, 1],
      duration: 350,
    }, '-=300')
    .add({
      targets:    outCaptionRef.current,
      opacity:    [0, 1],
      translateY: [4, 0],
      duration:   400,
    }, '-=200');
  };

  useEffect(() => {
    if (!rootRef.current) return;
    const obs = new IntersectionObserver(entries => {
      for (const e of entries) {
        if (e.isIntersecting && !playedRef.current) {
          playedRef.current = true;
          setTimeout(play, 250);
          break;
        }
      }
    }, { threshold: 0.35 });
    obs.observe(rootRef.current);
    return () => obs.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div ref={rootRef} className="relative flex flex-col bg-card border border-border rounded-xl p-4 min-h-[340px] overflow-hidden">
      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div>
          <div className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold">Analogy 2</div>
          <h3 className="text-base lg:text-lg font-bold text-foreground leading-tight">Your home: mailbox + front-door key</h3>
        </div>
        <button
          onClick={play}
          disabled={phase === 'playing'}
          className="text-[11px] px-2.5 py-1 rounded-md bg-muted/60 hover:bg-muted text-foreground font-semibold disabled:opacity-50 transition-colors"
        >↻ Replay</button>
      </div>

      {/* Stage — SVG house with mailbox + animated key */}
      <div className="relative flex-1 min-h-[180px] flex items-center justify-center">
        <svg viewBox="0 0 360 200" className="w-full max-w-[420px] h-auto" style={{ overflow: 'visible' }}>
          {/* Sky / ground line */}
          <line x1="0" y1="180" x2="360" y2="180" stroke="currentColor" strokeOpacity="0.15" strokeWidth="1" />

          {/* House body */}
          <rect x="90" y="80" width="200" height="100" rx="2" fill="hsl(var(--muted))" stroke="hsl(var(--border))" strokeWidth="1" />
          {/* Roof */}
          <polygon points="80,80 300,80 190,32" fill="#ED1C24" opacity="0.85" />
          {/* Window */}
          <rect x="110" y="100" width="40" height="34" rx="2" fill="#fde68a" stroke="hsl(var(--border))" strokeWidth="1" />
          <line x1="130" y1="100" x2="130" y2="134" stroke="hsl(var(--border))" strokeWidth="1" />
          <line x1="110" y1="117" x2="150" y2="117" stroke="hsl(var(--border))" strokeWidth="1" />

          {/* Inside (revealed when door opens) */}
          <g ref={insideRef} style={{ opacity: 0 }}>
            <rect x="232" y="110" width="48" height="70" fill="#fde68a" opacity="0.7" />
            <text x="256" y="150" fontSize="20" textAnchor="middle">✉️</text>
            <text x="256" y="172" fontSize="11" textAnchor="middle" fill="hsl(var(--foreground))" fontWeight="600">você</text>
          </g>

          {/* Door — pivots on its left edge for an "opens inward" rotateY */}
          <g
            ref={doorRef}
            style={{
              transformOrigin: '232px 180px',
              transformBox: 'fill-box' as React.CSSProperties['transformBox'],
            }}
          >
            <rect x="232" y="110" width="48" height="70" rx="1" fill="#7c2d12" />
            {/* Door handle */}
            <circle cx="268" cy="148" r="2.5" fill="#fbbf24" />
            {/* Lock keyhole */}
            <circle cx="262" cy="148" r="3.5" fill="#0f172a" stroke="#1e293b" strokeWidth="0.5" />
          </g>

          {/* Mailbox — STANDALONE on its own post to the LEFT of the house
              (the house body spans x=90-290, so the mailbox sits clear of it). */}
          <g>
            {/* Mailbox body — sits at x:20-60, y:120-150 */}
            <rect x="20" y="120" width="40" height="30" rx="3" fill="#1e293b" stroke="#0f172a" strokeWidth="0.8" />
            {/* Letter slot — clear opening across the top front */}
            <rect x="25" y="125" width="30" height="4" rx="1.5" fill="#94a3b8" />
            {/* "MAIL" label across the bottom of the box */}
            <text x="40" y="144" fontSize="6" textAnchor="middle" fill="#94a3b8" fontWeight="700">MAIL</text>
            {/* Post — anchors the mailbox to the ground (y=180) */}
            <rect x="38" y="150" width="4" height="30" fill="#475569" />
            {/* Tiny base on the post so it doesn't look floating */}
            <rect x="34" y="178" width="12" height="2" rx="0.5" fill="#334155" />
          </g>

          {/* Letters — three envelopes drop from above into the slot at y≈127 */}
          {[0, 1, 2].map(i => (
            <g
              key={i}
              ref={el => { letterRefs.current[i] = el; }}
              style={{ opacity: 0, transformBox: 'fill-box' as React.CSSProperties['transformBox'] }}
              transform={`translate(${29 + i * 1}, ${120 - i * 1})`}
            >
              <rect x="0" y="0" width="22" height="10" rx="1.5" fill="#fef3c7" stroke="#d97706" strokeWidth="0.7" />
              <path d="M0,0 L11,6 L22,0" fill="none" stroke="#d97706" strokeWidth="0.7" />
            </g>
          ))}

          {/* Key — handle just LEFT of the keyhole, blade extending INTO the
              keyhole at world (262, 148). Flies in from the right and rotates 90°
              around the keyhole. */}
          <g
            ref={keyRef}
            style={{
              opacity: 0,
              transformOrigin: '262px 148px',
              transformBox: 'fill-box' as React.CSSProperties['transformBox'],
            }}
            transform="translate(251, 144)"
          >
            {/* Handle ring — center at world (256, 148), just to the left of keyhole at (262, 148) */}
            <circle cx="5" cy="4" r="4" fill="none" stroke={PRIVATE_COLOR} strokeWidth="2" />
            {/* Blade — runs from world x=260 to x=274, passing through the keyhole */}
            <rect x="9" y="3" width="14" height="2" rx="0.6" fill={PRIVATE_COLOR} />
            {/* Teeth at the tip — small bumps on the blade's underside */}
            <rect x="17" y="5" width="1.6" height="2.4" fill={PRIVATE_COLOR} />
            <rect x="20" y="5" width="1.6" height="3" fill={PRIVATE_COLOR} />
          </g>
        </svg>
      </div>

      {/* Captions */}
      <div className="grid grid-cols-2 gap-2 mt-3 text-[11px]">
        <div ref={inCaptionRef} style={{ opacity: 0 }} className="p-2 rounded-md border bg-[color:var(--card)]">
          <div className="text-[10px] uppercase tracking-widest font-bold mb-0.5" style={{ color: PUBLIC_COLOR }}>Anyone drops mail in</div>
          <div className="text-muted-foreground leading-snug">The mailbox slot faces the street. Your address is on a thousand databases.</div>
        </div>
        <div ref={outCaptionRef} style={{ opacity: 0 }} className="p-2 rounded-md border bg-[color:var(--card)]">
          <div className="text-[10px] uppercase tracking-widest font-bold mb-0.5" style={{ color: PRIVATE_COLOR }}>Only the keyholder enters</div>
          <div className="text-muted-foreground leading-snug">No key, no door — and no shortcut. Lose the key and you're locked out forever.</div>
        </div>
      </div>

      {/* Mapping row */}
      <div className="mt-3 pt-3 border-t border-border grid grid-cols-2 gap-2 text-[11px]">
        <div className="flex items-center gap-2">
          <span className="size-2 rounded-full shrink-0" style={{ background: PUBLIC_COLOR }}></span>
          <span><strong className="text-foreground">Mailbox slot</strong> ≡ Bitcoin <strong style={{ color: PUBLIC_COLOR }}>address</strong></span>
        </div>
        <div className="flex items-center gap-2">
          <span className="size-2 rounded-full shrink-0" style={{ background: PRIVATE_COLOR }}></span>
          <span><strong className="text-foreground">Front-door key</strong> ≡ <strong style={{ color: PRIVATE_COLOR }}>private key</strong></span>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────── COMPOSED SLIDE ─────────────────────────────── */

// ─── Keys: private → public → address (one-way flow + curve intuition) ──────

const ADDRESS_COLOR = '#f59e0b'; // amber — public handle people receive on

function KeysPublicPrivateSlide() {
  const { t } = useTranslation('blockchain-fundamentals/section-2');
  // Illustrative key triple from Mastering Bitcoin (ch. 4), truncated.
  const nodes = [
    { k: 'private', color: PRIVATE_COLOR, term: t('keys.privateTerm'), def: t('keys.privateDef'), tag: t('keys.privateTag'), ex: '1E99…AEDD' },
    { k: 'public',  color: PUBLIC_COLOR,  term: t('keys.publicTerm'),  def: t('keys.publicDef'),  tag: t('keys.publicTag'),  ex: '03F0…341A' },
    { k: 'address', color: ADDRESS_COLOR, term: t('keys.addressTerm'), def: t('keys.addressDef'), tag: t('keys.addressTag'), ex: '1J7m…oXZy' },
  ];
  const arrows = [t('keys.arrowOneWay'), t('keys.arrowHash')];

  return (
    <div className="h-full flex flex-col p-5 lg:p-8">
      <div className="shrink-0 mb-3">
        <h2 className="text-2xl lg:text-3xl font-bold text-foreground">{t('keys.title')}</h2>
        <p className="text-sm lg:text-base text-muted-foreground mt-1 max-w-3xl">{t('keys.description')}</p>
      </div>

      <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_minmax(0,19rem)] gap-5 overflow-y-auto">
        {/* Left: left-to-right derivation flow */}
        <div className="flex flex-col justify-center gap-4">
          <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr_auto_1fr] items-stretch gap-2">
            {nodes.map((n, i) => (
              <div key={n.k} className="contents">
                <div className="rounded-xl border-2 bg-card p-4 flex flex-col gap-2"
                     style={{ borderColor: n.color + '80', background: `linear-gradient(to bottom right, ${n.color}1f, transparent)` }}>
                  <div className="text-[10px] font-bold uppercase tracking-widest" style={{ color: n.color }}>{n.tag}</div>
                  <div className="font-bold text-base text-foreground">{n.term}</div>
                  <code className="text-xs font-mono px-2 py-1 rounded bg-background/60 border border-border text-muted-foreground w-fit">{n.ex}</code>
                  <p className="text-xs lg:text-sm text-muted-foreground leading-snug">{n.def}</p>
                </div>
                {i < arrows.length && (
                  <div className="flex md:flex-col items-center justify-center gap-1 px-1 py-1 md:py-0">
                    <span className="hidden md:block text-2xl font-black text-muted-foreground/70">→</span>
                    <span className="md:hidden text-2xl font-black text-muted-foreground/70">↓</span>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-center text-muted-foreground max-w-[5.5rem]">{arrows[i]}</span>
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <CalloutBox type="important" title={t('keys.noReverseTitle')}>
              {t('keys.noReverseBody')}
            </CalloutBox>
            <CalloutBox type="tip" title={t('keys.walletNoteTitle')}>
              {t('keys.walletNoteBody')}
            </CalloutBox>
          </div>
        </div>

        {/* Right: elliptic-curve intuition (bundled SVG, no math) */}
        <aside className="flex flex-col justify-center">
          <div className="rounded-2xl border border-border bg-card/50 p-4 flex flex-col gap-3">
            <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{t('keys.curveLabel')}</div>
            <img src={secpCurve} alt={t('keys.curveAlt')} className="w-full h-auto rounded-lg" />
            <p className="text-xs lg:text-sm text-muted-foreground leading-snug">{t('keys.curveCaption')}</p>
          </div>
        </aside>
      </div>
    </div>
  );
}

// ─── Seed phrase: human-friendly master backup ──────────────────────────────

// Published example phrase (bitcoinjs/bip39 README) — shown as a visual only.
const EXAMPLE_SEED = ['army', 'van', 'defense', 'carry', 'jealous', 'true', 'garbage', 'claim', 'echo', 'media', 'make', 'crunch'];

function SeedPhraseVisual() {
  const { t } = useTranslation('blockchain-fundamentals/section-2');
  const chain = [
    { label: t('keys.chainSeed'),    color: '#6366f1' },
    { label: t('keys.chainPrivate'), color: PRIVATE_COLOR },
    { label: t('keys.chainPublic'),  color: PUBLIC_COLOR },
    { label: t('keys.chainAddress'), color: ADDRESS_COLOR },
  ];
  return (
    <div className="space-y-3 w-full">
      <DefinitionBox term={t('keys.seedTerm')} definition={t('keys.seedDef')} />
      <div className="rounded-xl border border-border bg-card p-3">
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-1.5">
          {EXAMPLE_SEED.map((w, i) => (
            <div key={w} className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-background/60 border border-border">
              <span className="text-[10px] font-mono text-muted-foreground w-4 text-right">{i + 1}</span>
              <span className="text-xs font-mono font-bold text-foreground">{w}</span>
            </div>
          ))}
        </div>
        <div className="text-[10px] text-muted-foreground mt-2 italic">{t('keys.seedExampleNote')}</div>
      </div>

      <div className="flex items-center justify-between gap-1">
        {chain.map((c, i) => (
          <div key={c.label} className="contents">
            <span className="px-2 py-1 rounded-full text-[11px] font-bold border-2 text-center"
                  style={{ color: c.color, borderColor: c.color + '80', backgroundColor: c.color + '18' }}>{c.label}</span>
            {i < chain.length - 1 && <span className="text-muted-foreground font-black">→</span>}
          </div>
        ))}
      </div>

      <CalloutBox type="warning" title={t('keys.calloutTitle')}>
        {t('keys.calloutBody')}
      </CalloutBox>
    </div>
  );
}

function WalletAnalogiesDemo() {
  return (
    <div className="h-full flex flex-col p-5 lg:p-8">
      {/* Header */}
      <div className="shrink-0 mb-3">
        <span className="px-2.5 py-0.5 rounded-full bg-[#f59e0b]/15 border border-[#f59e0b]/40 text-[#f59e0b] text-xs font-bold">🧩 Interactive</span>
        <h2 className="text-2xl lg:text-3xl font-bold text-foreground mt-1">What is a Wallet, really?</h2>
        <p className="text-sm text-muted-foreground mt-1 max-w-2xl">
          A wallet has <strong className="text-foreground">two things</strong> that behave very differently — one is public, one is secret.
          Two everyday analogies make the asymmetry obvious.
        </p>
      </div>

      <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-2 gap-5 overflow-y-auto">
        <BankIbanAnalogy />
        <HomeKeysAnalogy />
      </div>

      {/* Synthesis band */}
      <div className="shrink-0 mt-4 grid grid-cols-1 md:grid-cols-2 gap-3">
        <div className="p-3 bg-card border-2 rounded-xl" style={{ borderColor: PUBLIC_COLOR + '55' }}>
          <div className="text-[10px] font-bold uppercase tracking-widest mb-1" style={{ color: PUBLIC_COLOR }}>✅ The public half</div>
          <div className="text-sm text-foreground leading-snug">
            <strong>Address</strong> — print it on a receipt, share it on Twitter, post it on a billboard. Anyone can send Bitcoin to it. Nobody can move what's there with it alone.
          </div>
        </div>
        <div className="p-3 bg-card border-2 rounded-xl" style={{ borderColor: PRIVATE_COLOR + '55' }}>
          <div className="text-[10px] font-bold uppercase tracking-widest mb-1" style={{ color: PRIVATE_COLOR }}>🚫 The private half</div>
          <div className="text-sm text-foreground leading-snug">
            <strong>Private key</strong> — the one thing that authorises spending. Like a PIN, like a house key: lose control of it and the funds are gone. No bank to call, no support line.
          </div>
        </div>
      </div>

      <div className="shrink-0 mt-3 p-2.5 bg-amber-500/10 border border-amber-500/30 rounded-lg text-[11px] text-muted-foreground">
        <strong className="text-foreground">Where the analogies break:</strong> a bank can reverse a fraud, a locksmith can change your lock. Bitcoin has neither. The math is the only enforcement — that's both the appeal and the responsibility of self-custody.
      </div>
    </div>
  );
}

// ─── Shared building blocks for the custom (non-template) slides ────────────

/** Kicker + heading + lead, matching the header block every custom slide uses. */
function SlideHeader({ kicker, heading, lead }: { kicker?: string; heading: string; lead?: React.ReactNode }) {
  return (
    <div className="shrink-0 mb-4">
      {kicker && (
        <p className="text-[10px] font-mono uppercase tracking-widest text-[#f59e0b] mb-1 font-bold">{kicker}</p>
      )}
      <h2 className="text-2xl lg:text-3xl font-bold text-foreground mb-2">{heading}</h2>
      {lead && <p className="text-sm lg:text-base text-muted-foreground max-w-4xl">{lead}</p>}
    </div>
  );
}

/** Vertical 1982 → 2008 consensus timeline (Lamport / Paxos / PBFT / Nakamoto). */
function ConsensusTimeline() {
  const { t } = useTranslation('blockchain-fundamentals/section-2');
  const events = t('byzantine.events', { returnObjects: true }) as Array<{ year: string; title: string; who: string; body: string; verdict: string }>;
  const colors = ['#ED1C24', '#ED1C24', '#f59e0b', '#39B54A'];
  return (
    <div className="flex-1 min-h-0 relative overflow-y-auto pr-1">
      <div className="absolute left-[60px] top-1 bottom-1 w-0.5 bg-gradient-to-b from-[#ED1C24] via-[#f59e0b] to-[#39B54A]" />
      <div className="space-y-2.5">
        {events.map((e, i) => {
          const color = colors[i] ?? '#39B54A';
          return (
            <div key={i} className="relative pl-[80px] pr-1">
              <div className="absolute left-[54px] top-1.5 size-3.5 rounded-full border-2 border-background shadow" style={{ backgroundColor: color }} />
              <div className="absolute left-0 top-0 w-12 text-right font-mono font-black text-sm" style={{ color }}>{e.year}</div>
              <div className="bg-card border border-border rounded-lg p-3 hover:border-foreground/30 transition-colors">
                <div className="flex items-start justify-between gap-2 mb-0.5">
                  <h4 className="font-bold text-foreground text-sm">{e.title}</h4>
                  <span className="text-[9px] font-bold uppercase tracking-widest px-1.5 py-0.5 rounded shrink-0" style={{ color, backgroundColor: color + '18' }}>
                    {e.verdict}
                  </span>
                </div>
                <div className="text-[10px] text-muted-foreground italic mb-1">{e.who}</div>
                <p className="text-xs text-muted-foreground leading-snug">{e.body}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/** Horizontal 1983 → 2008 timeline of pre-Bitcoin digital cash attempts. */
function DigitalCashTimeline() {
  const { t } = useTranslation('blockchain-fundamentals/section-2');
  const attempts = t('doubleSpend.attempts', { returnObjects: true }) as Array<{ year: string; name: string; who: string; why: string; fate: string }>;
  const colors = ['#ED1C24', '#ED1C24', '#f59e0b', '#f59e0b', '#f59e0b', '#39B54A'];
  return (
    <div className="relative flex-1">
      <div className="absolute left-2 right-2 top-[18px] h-0.5 bg-gradient-to-r from-[#ED1C24] via-[#f59e0b] to-[#39B54A]" />
      <div className="grid grid-cols-3 lg:grid-cols-6 gap-3 relative">
        {attempts.map((item, i) => {
          const color = colors[i] ?? '#39B54A';
          return (
            <div key={i} className="flex flex-col items-center">
              <div className="size-4 rounded-full border-2 border-background shadow shrink-0 mb-2 z-10" style={{ backgroundColor: color }} />
              <div className="text-center w-full">
                <div className="font-mono font-black text-sm" style={{ color }}>{item.year}</div>
                <div className="font-bold text-foreground text-sm leading-tight">{item.name}</div>
                <div className="text-[10px] text-muted-foreground italic mt-0.5">{item.who}</div>
                <p className="text-[11px] text-muted-foreground leading-snug mt-1.5">{item.why}</p>
                <div className="mt-1.5 inline-block text-[9px] font-bold uppercase tracking-widest px-1.5 py-0.5 rounded" style={{ color, backgroundColor: color + '18' }}>
                  {item.fate}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/** Side-by-side Account model vs UTXO model, Alice pays Bob 0.4 BTC. */
function UtxoVsAccount() {
  const { t } = useTranslation('blockchain-fundamentals/section-2');
  const utxoCell = (label: string, value: string, color: string, struck = false) => (
    <div className={`flex-1 rounded-lg border px-2 py-2 text-center relative ${struck ? 'line-through' : ''}`}
         style={{ borderColor: color + '80', backgroundColor: color + '1a' }}>
      <div className="text-[10px] text-muted-foreground">{label}</div>
      <div className="font-mono font-bold text-base" style={{ color }}>{value}</div>
      {struck && <div className="absolute -top-1.5 -right-1.5 text-[10px] bg-[#ED1C24] text-white rounded-full px-1.5">✕</div>}
    </div>
  );
  return (
    <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-2 gap-4">
      {/* Account model side */}
      <div className="bg-card rounded-xl border border-border p-4 flex flex-col">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-xl">💳</span>
          <span className="text-xs font-bold text-muted-foreground uppercase tracking-wide">{t('doubleSpend.accountModelTitle')}</span>
        </div>
        <div className="text-xs text-muted-foreground mb-1">{t('doubleSpend.aliceWallet')}</div>
        <div className="rounded-lg border border-[#f59e0b]/40 bg-[#f59e0b]/10 px-3 py-2.5 flex items-center justify-between mb-3">
          <span className="text-xs text-muted-foreground">{t('doubleSpend.balance')}</span>
          <span className="font-mono font-bold text-lg text-[#f59e0b]">1.00 BTC</span>
        </div>
        <div className="text-center text-xs text-muted-foreground mb-3">{t('doubleSpend.payBobAccount')}</div>
        <div className="rounded-lg border border-[#f59e0b]/40 bg-[#f59e0b]/10 px-3 py-2.5 flex items-center justify-between">
          <span className="text-xs text-muted-foreground">{t('doubleSpend.newBalance')}</span>
          <span className="font-mono font-bold text-lg text-[#f59e0b]">0.60 BTC</span>
        </div>
        <div className="mt-auto pt-3 text-sm text-muted-foreground italic">
          {t('doubleSpend.accountNoteA')} <span className="font-bold text-foreground not-italic">{t('doubleSpend.accountNoteStrong')}</span> {t('doubleSpend.accountNoteTail')}
        </div>
      </div>

      {/* UTXO model side */}
      <div className="bg-card rounded-xl border-2 border-[#39B54A]/40 p-4 flex flex-col">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-xl">🪙</span>
          <span className="text-xs font-bold text-[#39B54A] uppercase tracking-wide">{t('doubleSpend.utxoModelTitle')}</span>
        </div>
        <div className="text-xs text-muted-foreground mb-1">{t('doubleSpend.utxoWallet')}</div>
        <div className="flex gap-2 mb-3">
          {['0.5', '0.3', '0.2'].map(v => <span key={v} className="flex-1 flex">{utxoCell(t('doubleSpend.utxoLabel'), v, '#39B54A')}</span>)}
        </div>
        <div className="text-center text-xs text-muted-foreground mb-3">
          {t('doubleSpend.utxoPayBobA')} <span className="font-mono">{t('doubleSpend.utxoPayBobValue')}</span>
        </div>
        <div className="flex gap-2">
          {utxoCell(t('doubleSpend.utxoLabel'), '0.5', '#ED1C24', true)}
          {utxoCell(t('doubleSpend.utxoToBob'), '0.4', '#6366f1')}
          {utxoCell(t('doubleSpend.utxoChange'), '0.1', '#39B54A')}
        </div>
        <div className="mt-auto pt-3 text-sm text-muted-foreground italic">
          {t('doubleSpend.utxoNoteA')} <span className="font-bold text-foreground not-italic">{t('doubleSpend.utxoNoteStrong')}</span>{t('doubleSpend.utxoNoteTail')}
        </div>
      </div>
    </div>
  );
}

/** Compact tinted card used for the non-programmability limits (throughput, finality, energy). */
function LimitCard({ color, icon, title, children }: { color: string; icon: React.ReactNode; title: string; children: React.ReactNode }) {
  return (
    <div className="p-3 rounded-xl border-2" style={{ borderColor: color + '66', background: `linear-gradient(to bottom right, ${color}26, transparent)` }}>
      <div className="flex items-center gap-2 mb-1">
        {icon}
        <h4 className="font-bold text-sm" style={{ color }}>{title}</h4>
      </div>
      <p className="text-xs text-muted-foreground leading-snug">{children}</p>
    </div>
  );
}

interface RealWorldCase { emoji: string; year: string; title: string; body: string; caveat: string }
interface SourceLink { label: string; url: string }

/** One real-world case: headline, what happened, and the honest caveat underneath. */
function RealWorldCard({ item, color }: { item: RealWorldCase; color: string }) {
  return (
    <div className="rounded-xl border-2 bg-card flex flex-col overflow-hidden min-h-0"
         style={{ borderColor: color + '66' }}>
      <div className="px-4 py-3 flex items-center gap-3" style={{ backgroundColor: color + '18' }}>
        <span className="text-2xl shrink-0">{item.emoji}</span>
        <div className="min-w-0">
          <div className="text-[10px] font-mono font-bold uppercase tracking-widest" style={{ color }}>{item.year}</div>
          <h4 className="font-bold text-foreground text-sm leading-tight">{item.title}</h4>
        </div>
      </div>
      <div className="p-4 flex flex-col gap-2 flex-1 min-h-0 overflow-y-auto">
        <p className="text-sm text-foreground/90 leading-snug">{item.body}</p>
        <p className="text-xs text-muted-foreground leading-snug mt-auto pt-2 border-t border-border italic">{item.caveat}</p>
      </div>
    </div>
  );
}

/** Small source links strip at the bottom of a slide. */
function SourceFooter({ label, sources }: { label: string; sources: SourceLink[] }) {
  return (
    <div className="shrink-0 mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-[10px] text-muted-foreground">
      <span className="font-bold uppercase tracking-widest">{label}</span>
      {sources.map((s, i) => (
        <a key={i} href={s.url} target="_blank" rel="noopener noreferrer"
           className="inline-flex items-center gap-1 hover:text-foreground underline-offset-2 hover:underline">
          {s.label}<ExternalLink className="size-2.5" />
        </a>
      ))}
    </div>
  );
}

interface Spotlight extends RealWorldCase {
  stat: string; statCaption: string;
  share?: number; shareLabels?: [string, string];
  facts?: Array<{ label: string; value: string }>;
  steps: Array<{ when: string; label: string }>;
  sources: SourceLink[];
}

/** One full-slide real-world story: big stat + mini-diagram on the left, story + honest caveat on the right. */
function RealWorldSpotlight({ id, color }: { id: string; color: string }) {
  const { t } = useTranslation('blockchain-fundamentals/section-2');
  const item = t(`realWorld.spotlights.${id}`, { returnObjects: true }) as Spotlight;
  return (
    <div className="w-full h-full flex flex-col p-5 lg:p-8">
      <SlideHeader kicker={`${t('realWorld.kicker')} · ${item.year}`} heading={item.title} />

      <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-[2fr_3fr] gap-4 lg:gap-6">
        {/* LEFT — visual: emoji, headline stat, and a small fact grid or share bar */}
        <div className="rounded-2xl border-2 flex flex-col items-center justify-center text-center p-5 gap-3 min-h-0"
             style={{ borderColor: color + '66', background: `linear-gradient(to bottom right, ${color}26, transparent)` }}>
          <span className="text-6xl lg:text-7xl leading-none drop-shadow-sm">{item.emoji}</span>
          <div className="text-4xl lg:text-5xl font-black tracking-tight" style={{ color }}>{item.stat}</div>
          <p className="text-xs lg:text-sm text-muted-foreground max-w-[28ch] leading-snug">{item.statCaption}</p>

          {item.share !== undefined && item.shareLabels && (
            <div className="w-full max-w-xs mt-2">
              <div className="h-4 w-full rounded-full overflow-hidden flex bg-muted border border-border">
                <div className="h-full" style={{ width: `${item.share}%`, backgroundColor: color }} />
                <div className="h-full flex-1" style={{ backgroundColor: '#39B54A' }} />
              </div>
              <div className="flex justify-between text-[10px] font-mono font-bold uppercase tracking-wider mt-1">
                <span style={{ color }}>{item.share}% {item.shareLabels[0]}</span>
                <span className="text-[#39B54A]">{100 - item.share}% {item.shareLabels[1]}</span>
              </div>
            </div>
          )}

          {item.facts && (
            <div className="w-full grid grid-cols-3 gap-2 mt-2">
              {item.facts.map((f, i) => (
                <div key={i} className="rounded-lg bg-card/80 border border-border px-2 py-2">
                  <div className="text-[9px] font-mono uppercase tracking-wider text-muted-foreground leading-tight">{f.label}</div>
                  <div className="text-xs lg:text-sm font-bold text-foreground leading-tight mt-0.5">{f.value}</div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* RIGHT — the story, a 3-step strip, and the honest caveat */}
        <div className="flex flex-col justify-center gap-4 min-h-0 overflow-y-auto">
          <p className="text-sm lg:text-base text-foreground/90 leading-relaxed">{item.body}</p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            {item.steps.map((st, i) => (
              <div key={i} className="relative rounded-lg border bg-card px-3 py-2" style={{ borderColor: color + '55' }}>
                <div className="text-[10px] font-mono font-bold uppercase tracking-widest mb-0.5" style={{ color }}>{st.when}</div>
                <div className="text-xs text-muted-foreground leading-snug">{st.label}</div>
                {i < item.steps.length - 1 && (
                  <span className="hidden sm:flex absolute -right-2.5 top-1/2 -translate-y-1/2 size-4 rounded-full items-center justify-center text-[10px] font-black text-white z-10" style={{ backgroundColor: color }}>›</span>
                )}
              </div>
            ))}
          </div>

          <CalloutBox type="warning" title={t('realWorld.caveatLabel')}>
            <p className="text-xs lg:text-sm leading-snug">{item.caveat}</p>
          </CalloutBox>
        </div>
      </div>

      <SourceFooter label={t('realWorld.sourcesLabel')} sources={item.sources} />
    </div>
  );
}

export function Section2() {
  const { t } = useTranslation('blockchain-fundamentals/section-2');
  const section2Chapters = useMemo(
    () =>
      section2ChaptersShape.map((ch) =>
        ch.kind === 'group'
          ? { kind: 'group' as const, id: ch.id, label: t(`groups.${ch.id}`) }
          : { id: ch.id, label: t(`chapters.${ch.id}`) },
      ),
    [t],
  );
  return (
    <div className="h-full w-full flex overflow-hidden">
      <SectionNav chapters={section2Chapters} />
      <div id="section-scroll" className="flex-1 overflow-y-auto snap-y snap-mandatory">
        <div className="slide-flow">

        {/* ═══════ TITLE ═══════ */}
        <div className="h-full">
          <TitleSlide
            sectionNumber={t('title.sectionNumber')}
            title={t('title.title')}
            subtitle={t('title.subtitle')}
            icon={<Bitcoin className="size-20 text-[#f59e0b]" />}
            gradient="from-[#f59e0b] to-[#ED1C24]"
          />
        </div>

        {/* ═══════ 1. WHY BITCOIN WAS A BREAKTHROUGH ═══════ */}
        <div id="s2-breakthrough" className="h-full">
          <ConceptSlide
            title={t('breakthrough.title')}
            description={t('breakthrough.description')}
            visual={
              <div className="space-y-4 w-full">
                <CalloutBox type="important" title={t('breakthrough.doubleSpendTitle')}>
                  {t('breakthrough.doubleSpendBody')}
                </CalloutBox>
                <CalloutBox type="tip" title={t('breakthrough.solutionTitle')}>
                  {t('breakthrough.solutionBody')}
                </CalloutBox>
                <div className="p-4 bg-card rounded-lg border border-border">
                  <div className="font-mono text-sm text-muted-foreground mb-2">{t('breakthrough.genesisLabel')}</div>
                  <div className="text-sm text-foreground italic">
                    {t('breakthrough.genesisMessage')}
                  </div>
                </div>
              </div>
            }
            keyPoints={t('breakthrough.keyPoints', { returnObjects: true }) as string[]}
          />
        </div>

        {/* ═══════ 1b. THE 2008 PAPER — Satoshi's announcement ═══════ */}
        <div id="s2-paper" className="h-full">
          <div className="w-full h-full flex flex-col p-5 lg:p-8">
            <SlideHeader
              kicker={t('paper.kicker')}
              heading={t('paper.heading')}
              lead={<>{t('paper.leadA')} <span className="font-mono text-foreground">{t('paper.leadName')}</span> {t('paper.leadB')}</>}
            />

            <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-[1.05fr_1fr] gap-4 lg:gap-6">
              {/* LEFT — the post */}
              <div className="flex flex-col gap-3 min-h-0">
                <div className="rounded-xl border-2 border-[#f59e0b]/50 bg-card overflow-hidden">
                  <div className="px-4 py-2 bg-[#f59e0b]/15 border-b border-[#f59e0b]/30 flex items-center gap-2">
                    <span className="text-xs font-mono text-[#f59e0b] font-bold">{t('paper.mailingList')}</span>
                  </div>
                  <div className="p-4 space-y-2 text-sm font-mono">
                    <div className="text-foreground"><span className="text-muted-foreground">{t('paper.from')}</span> Satoshi Nakamoto &lt;satoshi@vistomail.com&gt;</div>
                    <div className="text-foreground"><span className="text-muted-foreground">{t('paper.subject')}</span> {t('paper.subjectLine')}</div>
                    <div className="text-foreground"><span className="text-muted-foreground">{t('paper.date')}</span> {t('paper.dateLine')}</div>
                    <div className="border-t border-border my-2" />
                    <p className="text-foreground italic text-xs lg:text-sm leading-relaxed">
                      {t('paper.emailQuote')}
                    </p>
                    <div className="text-foreground text-xs pt-1"><span className="text-muted-foreground">{t('paper.paperLabel')}</span> <span className="text-[#f59e0b]">bitcoin.org/bitcoin.pdf</span></div>
                  </div>
                </div>
                <a
                  href="https://bitcoin.org/bitcoin.pdf"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-[#f59e0b]/15 border border-[#f59e0b]/40 text-[#f59e0b] text-xs font-bold hover:bg-[#f59e0b]/25 transition-colors w-fit"
                >
                  {t('paper.readWhitepaper')}
                  <ExternalLink className="size-3.5" />
                </a>
              </div>

              {/* RIGHT — what happened next + one-line teasers */}
              <div className="flex flex-col gap-3 min-h-0">
                <CalloutBox type="tip" title={t('paper.calloutTitle')}>
                  {t('paper.calloutA')}{' '}
                  <strong className="text-foreground">{t('paper.calloutDate')}</strong>{t('paper.calloutB')}{' '}
                  <em>{t('paper.calloutHeadline')}</em>{t('paper.calloutTail')}
                </CalloutBox>

                <div className="p-4 rounded-xl border border-border bg-card flex flex-col gap-2.5">
                  <p className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground">{t('paper.twoProblems')}</p>
                  <div className="flex items-start gap-2.5 text-sm">
                    <span className="text-lg shrink-0">💸</span>
                    <span className="text-foreground/90 leading-snug">{t('paper.teaserDoubleSpend')}</span>
                  </div>
                  <div className="flex items-start gap-2.5 text-sm">
                    <span className="text-lg shrink-0">⚔️</span>
                    <span className="text-foreground/90 leading-snug">{t('paper.teaserByzantine')}</span>
                  </div>
                </div>

                <div className="p-3 rounded-xl border border-[#39B54A]/40 bg-[#39B54A]/10 text-center">
                  <p className="text-sm font-bold text-foreground">
                    {t('paper.claimedA')} <span className="text-[#39B54A]">{t('paper.claimedBoth')}</span> {t('paper.claimedTail')}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1 italic">{t('paper.proof')}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ═══════ 3. WHAT IS BITCOIN ═══════ */}
        <div id="s2-what" className="h-full">
          <div className="w-full h-full flex flex-col p-5 lg:p-8">
            <SlideHeader
              kicker={t('whatIsBitcoin.kicker')}
              heading={t('whatIsBitcoin.heading')}
              lead={<>{t('whatIsBitcoin.leadA')} <strong className="text-foreground">{t('whatIsBitcoin.leadSystem')}</strong> {t('whatIsBitcoin.leadB')}</>}
            />

            <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-[1fr_1.3fr] gap-4 lg:gap-6">
              {/* LEFT — actual paper structure */}
              <div className="flex flex-col gap-3 min-h-0">
                <div className="rounded-xl border-2 border-[#f59e0b]/40 bg-card overflow-hidden">
                  <div className="px-3 py-2 bg-[#f59e0b]/10 border-b border-[#f59e0b]/30 flex items-center justify-between">
                    <span className="text-[10px] font-mono text-[#f59e0b] font-bold uppercase tracking-widest">{t('whatIsBitcoin.pdfHeader')}</span>
                    <span className="text-[9px] text-muted-foreground">{t('whatIsBitcoin.pdfDate')}</span>
                  </div>
                  <ol className="p-3 space-y-0.5 text-[11px] font-mono text-muted-foreground">
                    {(t('whatIsBitcoin.pdfSections', { returnObjects: true }) as string[]).map((s, i) => (
                      <li key={i} className="flex gap-2">
                        <span className="text-[#f59e0b] font-bold w-4 text-right shrink-0">{i + 1}.</span>
                        <span className="text-foreground">{s}</span>
                      </li>
                    ))}
                  </ol>
                </div>
                <CalloutBox type="info" title={t('whatIsBitcoin.oneSentenceTitle')}>
                  {t('whatIsBitcoin.oneSentenceBody')}
                </CalloutBox>
              </div>

              {/* RIGHT — four design choices */}
              <div className="flex flex-col gap-3">
                <p className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground">
                  {t('whatIsBitcoin.fourChoicesTitle')}
                </p>
                <div className="grid grid-cols-2 gap-3 flex-1">
                  {([
                    ['permissionless', '#f59e0b'],
                    ['openSource',     '#ED1C24'],
                    ['scarce',         '#39B54A'],
                    ['censorship',     '#6366f1'],
                  ] as const).map(([k, color]) => (
                    <div key={k} className="p-3.5 rounded-xl border-2 flex flex-col"
                         style={{ borderColor: color + '66', background: `linear-gradient(to bottom right, ${color}26, transparent)` }}>
                      <h4 className="font-bold mb-1.5 text-sm" style={{ color }}>{t(`whatIsBitcoin.${k}Title`)}</h4>
                      <p className="text-xs text-muted-foreground leading-snug">{t(`whatIsBitcoin.${k}Desc`)}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ═══════ 4a. BYZANTINE GENERALS — THE PROBLEM ═══════ */}
        <div id="s2-byzantine" className="h-full">
          <div className="w-full h-full flex flex-col p-5 lg:p-8">
            <SlideHeader
              kicker={t('byzantine.kicker')}
              heading={t('byzantine.heading')}
              lead={<>
                {t('byzantine.leadInPrefix')} <strong className="text-foreground">{t('byzantine.leadInYear')}</strong>{t('byzantine.leadInMid')} <strong className="text-foreground">{t('byzantine.leadInNames')}</strong> {t('byzantine.leadInTail')}
                <em className="text-foreground"> {t('byzantine.leadInQuestion')}</em>
              </>}
            />

            <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* LEFT — the metaphor */}
              <div className="p-5 bg-gradient-to-br from-[#ED1C24]/15 to-transparent rounded-xl border-2 border-[#ED1C24]/40 flex flex-col justify-center">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-3xl">🏰</span>
                  <h4 className="font-bold text-[#ED1C24] text-base">{t('byzantine.metaphorTitle')}</h4>
                </div>
                <p className="text-sm lg:text-base text-muted-foreground leading-relaxed">
                  {t('byzantine.metaphorBodyA')} <strong className="text-foreground">{t('byzantine.metaphorBodyStrong1')}</strong> {t('byzantine.metaphorBodyB')} <strong className="text-foreground">{t('byzantine.metaphorBodyStrong2')}</strong> {t('byzantine.metaphorBodyTail')}
                </p>
              </div>

              {/* RIGHT — computing translation + the catch */}
              <div className="flex flex-col gap-3 min-h-0">
                <div className="p-4 bg-gradient-to-br from-[#f59e0b]/15 to-transparent rounded-xl border-2 border-[#f59e0b]/40 flex-1">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-2xl">💻</span>
                    <h4 className="font-bold text-[#f59e0b] text-base">{t('byzantine.computingTitle')}</h4>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    {(['generals','messengers','traitors','battlePlan'] as const).map(k => (
                      <div key={k} className="bg-card/60 rounded-md p-2.5">
                        <div className="text-muted-foreground text-xs">{t(`byzantine.computingMap.${k}.label`)}</div>
                        <div className="text-foreground font-bold">{t(`byzantine.computingMap.${k}.value`)}</div>
                      </div>
                    ))}
                  </div>
                </div>
                <CalloutBox type="warning" title={t('byzantine.catchTitle')}>
                  {t('byzantine.catchBody')}
                </CalloutBox>
              </div>
            </div>
          </div>
        </div>

        {/* ═══════ 4b. SOLVING IT — 1982 TO BITCOIN ═══════ */}
        <div id="s2-consensus" className="h-full">
          <div className="w-full h-full flex flex-col p-5 lg:p-8">
            <SlideHeader
              kicker={t('byzantine.solvingKicker')}
              heading={t('byzantine.solvingHeading')}
              lead={t('byzantine.solvingLead')}
            />

            <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-[1.15fr_1fr] gap-4">
              {/* LEFT — historical timeline of consensus attempts */}
              <div className="flex flex-col gap-2 min-h-0">
                <p className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground">
                  {t('byzantine.timelineHeader')}
                </p>
                <ConsensusTimeline />
              </div>

              {/* RIGHT — Bitcoin's answer + the leap */}
              <div className="flex flex-col gap-3 min-h-0">
                <div className="p-4 bg-gradient-to-br from-[#39B54A]/15 to-transparent rounded-xl border-2 border-[#39B54A]/40 flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-2xl">⛏️</span>
                    <h4 className="font-bold text-[#39B54A] text-base">{t('byzantine.answerTitle')}</h4>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed mb-3">
                    {t('byzantine.answerLead')} <em>{t('byzantine.answerEm')}</em> {t('byzantine.answerMid')} <strong className="text-foreground">{t('byzantine.answerStrong')}</strong>{t('byzantine.answerTail')}
                  </p>
                  <div className="grid grid-cols-3 gap-2 text-xs">
                    {(['tolerates','trustedSetup','membership'] as const).map(k => (
                      <div key={k} className="bg-card/60 rounded-md p-2 text-center">
                        <div className="text-muted-foreground text-[10px]">{t(`byzantine.answerMap.${k}.label`)}</div>
                        <div className="font-bold text-[#39B54A]">{t(`byzantine.answerMap.${k}.value`)}</div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="shrink-0 p-3 rounded-lg bg-[#39B54A]/10 border border-[#39B54A]/40 text-sm text-muted-foreground">
                  <span className="font-bold text-[#39B54A]">{t('byzantine.leapStrong')}</span> {t('byzantine.leapA')} <strong className="text-foreground">{t('byzantine.leapStrong2')}</strong>{t('byzantine.leapB')} <strong className="text-foreground">{t('byzantine.leapStrong3')}</strong> {t('byzantine.leapTail')}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ═══════ 5a. DOUBLE-SPENDING — 20 YEARS OF FAILED DIGITAL CASH ═══════ */}
        <div id="s2-doublespend" className="h-full">
          <div className="w-full h-full flex flex-col p-5 lg:p-8">
            <SlideHeader
              kicker={t('doubleSpend.kicker')}
              heading={t('doubleSpend.title')}
              lead={t('doubleSpend.description')}
            />

            <div className="flex-1 min-h-0 flex flex-col gap-3">
              {/* The attack + old fix */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 shrink-0">
                <div className="p-4 bg-gradient-to-br from-[#ED1C24]/20 to-transparent rounded-xl border border-[#ED1C24]/30">
                  <h4 className="font-bold text-[#ED1C24] mb-1 text-sm">{t('doubleSpend.attackTitle')}</h4>
                  <p className="text-sm text-muted-foreground">{t('doubleSpend.attackBody')}</p>
                </div>
                <div className="p-4 bg-gradient-to-br from-[#f59e0b]/20 to-transparent rounded-xl border border-[#f59e0b]/30">
                  <h4 className="font-bold text-[#f59e0b] mb-1 text-sm">{t('doubleSpend.oldFixTitle')}</h4>
                  <p className="text-sm text-muted-foreground">{t('doubleSpend.oldFixBody')}</p>
                </div>
              </div>

              {/* Historical timeline of attempts — full width */}
              <div className="flex-1 p-4 bg-gradient-to-br from-[#8b5cf6]/15 via-[#6366f1]/5 to-transparent rounded-xl border-2 border-[#8b5cf6]/40 flex flex-col">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-bold text-[#8b5cf6] text-sm">{t('doubleSpend.timelineHeader')}</h4>
                  <span className="text-[10px] font-mono text-muted-foreground">{t('doubleSpend.timelineRange')}</span>
                </div>
                <DigitalCashTimeline />
              </div>

              <div className="shrink-0 p-3 rounded-lg bg-muted/40 border border-border text-sm text-muted-foreground text-center">
                {t('doubleSpend.closing')}
              </div>
            </div>
          </div>
        </div>

        {/* ═══════ 5b. BITCOIN'S FIX — THE UTXO MODEL ═══════ */}
        <div id="s2-utxo" className="h-full">
          <div className="w-full h-full flex flex-col p-5 lg:p-8">
            <SlideHeader
              kicker={t('doubleSpend.utxoKicker')}
              heading={t('doubleSpend.fixTitle')}
              lead={<>{t('doubleSpend.fixLeadA')} <span className="font-bold text-foreground">{t('doubleSpend.fixLeadStrong')}</span> {t('doubleSpend.fixLeadB')} <span className="italic">{t('doubleSpend.fixLeadEm')}</span></>}
            />

            <div className="flex-1 min-h-0 flex flex-col gap-3">
              <UtxoVsAccount />
              <div className="shrink-0 grid grid-cols-1 lg:grid-cols-3 gap-3">
                {(t('doubleSpend.keyPoints', { returnObjects: true }) as string[]).map((point, i) => (
                  <div key={i} className="flex items-start gap-3 p-3 bg-card rounded-lg border border-[#6366f1]/30">
                    <div className="size-7 rounded-full bg-[#6366f1] flex items-center justify-center shrink-0 text-white font-bold text-sm">{i + 1}</div>
                    <p className="text-sm text-foreground">{point}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ═══════ 4. SUPPLY MODEL — INTERACTIVE ═══════ */}
        <div id="s2-supply" className="h-full">
          <BitcoinSupplyInteractive />
        </div>

        {/* ═══════ 5. NETWORK STATISTICS ═══════ */}
        <div id="s2-stats" className="h-full">
          <ConceptSlide
            title={t('stats.title')}
            description={t('stats.description')}
            visual={
              <div className="space-y-3 w-full">
                <div className="grid grid-cols-3 gap-3">
                  {(['#f59e0b','#39B54A','#ED1C24','#6366f1','#8b5cf6','#f59e0b']).map((color, i) => {
                    const items = t('stats.items', { returnObjects: true }) as Array<{ value: string; label: string }>;
                    return (
                      <div key={i} className="p-4 bg-card rounded-xl border border-border text-center">
                        <div className="text-2xl font-bold" style={{ color }}>{items[i].value}</div>
                        <div className="text-xs text-muted-foreground mt-1">{items[i].label}</div>
                      </div>
                    );
                  })}
                </div>
                <CalloutBox type="info" title={t('stats.difficultyTitle')}>
                  {t('stats.difficultyBody')}
                </CalloutBox>
              </div>
            }
            keyPoints={t('stats.keyPoints', { returnObjects: true }) as string[]}
          />
        </div>

        {/* ═══════ 6. NODE TYPES — FOUR CARDS ═══════ */}
        <div id="s2-nodes" className="h-full">
          <div className="w-full h-full flex flex-col p-5 lg:p-8">
            <SlideHeader heading={t('nodes.title')} lead={t('nodes.description')} />
            <div className="flex-1 min-h-0 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3 lg:gap-4">
              {(['#f59e0b','#ED1C24','#6366f1','#39B54A']).map((color, i) => {
                const items = t('nodes.items', { returnObjects: true }) as Array<{ feature: string; option1: string; option2: string; option3: string }>;
                const n = items[i];
                const rows = [
                  [t('nodes.option1Label'), n.option1],
                  [t('nodes.option2Label'), n.option2],
                  [t('nodes.option3Label'), n.option3],
                ];
                return (
                  <div key={i} className="rounded-xl border-2 bg-card flex flex-col overflow-hidden"
                       style={{ borderColor: color + '66' }}>
                    <div className="px-4 py-3 font-bold text-base" style={{ color, backgroundColor: color + '18' }}>
                      {n.feature}
                    </div>
                    <div className="p-4 flex flex-col gap-3 flex-1">
                      {rows.map(([label, value]) => (
                        <div key={label}>
                          <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-0.5">{label}</div>
                          <div className="text-sm text-foreground leading-snug">{value}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* ═══════ KEYS — PUBLIC VS PRIVATE ═══════ */}
        <div id="s2-keys" className="h-full">
          <KeysPublicPrivateSlide />
        </div>

        {/* ═══════ SEED PHRASE & SELF-CUSTODY ═══════ */}
        <div id="s2-seed" className="h-full">
          <ConceptSlide
            title={t('keys.seedTitle')}
            description={t('keys.seedDescription')}
            visual={<SeedPhraseVisual />}
            keyPoints={t('keys.seedKeyPoints', { returnObjects: true }) as string[]}
          />
        </div>

        {/* ═══════ KEYS — INTERACTIVE DEMO ═══════ */}
        <div id="s2-keys-demo" className="h-full">
          <WalletAnalogiesDemo />
        </div>

        {/* ═══════ 7. SECURITY MODEL ═══════ */}
        <div id="s2-security" className="h-full">
          <ConceptSlide
            title={t('security.title')}
            description={t('security.description')}
            visual={
              <div className="space-y-4 w-full">
                <div className="grid grid-cols-2 gap-4">
                  {([
                    ['attack',    '#ED1C24'],
                    ['crypto',    '#39B54A'],
                    ['econ',      '#6366f1'],
                    ['decentral', '#f59e0b'],
                  ] as const).map(([k, color]) => (
                    <div key={k} className="p-4 rounded-xl border"
                         style={{ borderColor: color + '4d', background: `linear-gradient(to bottom right, ${color}33, transparent)` }}>
                      <h4 className="font-bold mb-2" style={{ color }}>{t(`security.${k}Title`)}</h4>
                      <p className="text-sm text-muted-foreground">{t(`security.${k}Body`)}</p>
                    </div>
                  ))}
                </div>
                <CalloutBox type="warning" title={t('security.quantumTitle')}>
                  {t('security.quantumBody')}
                </CalloutBox>
              </div>
            }
            keyPoints={t('security.keyPoints', { returnObjects: true }) as string[]}
          />
        </div>

        {/* ═══════ 8a-BUILD. BUILD A MERKLE TREE — TYPE YOUR OWN TXs ═══════ */}
        <div id="s2-merkle-build" className="h-full">
          <BuildMerkleSlide />
        </div>

        {/* ═══════ 8a. MERKLE TREE — INTERACTIVE (TAMPER) ═══════ */}
        <div id="s2-merkle" className="h-full">
          <MerkleTreeDemo />
        </div>

        {/* ═══════ 8b. IMMUTABILITY — INTERACTIVE TAMPER CHAIN ═══════ */}
        <div id="s2-immutability" className="h-full">
          <ImmutableChainDemo />
        </div>

        {/* ═══════ 8c. MINING — CONCEPT ═══════ */}
        <div id="s2-mining" className="h-full">
          <ConceptSlide
            title={t('mining.title')}
            description={t('mining.description')}
            visual={
              <div className="space-y-3 w-full">
                <div className="grid grid-cols-2 gap-2 text-sm">
                  {(['#6366f1','#8b5cf6','#f59e0b','#ED1C24','#22d3ee','#39B54A']).map((color, i) => {
                    const steps = t('mining.steps', { returnObjects: true }) as Array<{ emoji: string; title: string; desc: string }>;
                    const s = steps[i];
                    return (
                      <div key={i} className="flex items-start gap-3 p-3 bg-card rounded-lg border" style={{ borderColor: color + '40' }}>
                        <div className="size-7 rounded-md flex items-center justify-center text-white text-xs font-black shrink-0" style={{ backgroundColor: color }}>{i + 1}</div>
                        <div className="min-w-0">
                          <div className="font-bold text-foreground text-sm flex items-center gap-1.5">
                            <span>{s.emoji}</span>{s.title}
                          </div>
                          <div className="text-xs text-muted-foreground leading-snug mt-0.5">{s.desc}</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
                <CalloutBox type="tip" title={t('mining.calloutTitle')}>
                  {t('mining.calloutBody')}
                </CalloutBox>
              </div>
            }
            keyPoints={t('mining.keyPoints', { returnObjects: true }) as string[]}
          />
        </div>

        {/* ═══════ 8d. MINING — INTERACTIVE ═══════ */}
        <div id="s2-mining-demo" className="h-full">
          <MiningDemo />
        </div>

        {/* ═══════ 9a. REAL WORLD — WHERE IT ACTUALLY MATTERED ═══════ */}
        <div id="s2-realworld-cases" className="h-full">
          <div className="w-full h-full flex flex-col p-5 lg:p-8">
            <SlideHeader kicker={t('realWorld.kicker')} heading={t('realWorld.casesHeading')} lead={t('realWorld.casesLead')} />
            <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-3 gap-4">
              {(['#f59e0b','#ED1C24','#6366f1']).map((color, i) => {
                const cases = t('realWorld.cases', { returnObjects: true }) as RealWorldCase[];
                return <RealWorldCard key={i} color={color} item={cases[i]} />;
              })}
            </div>
            <SourceFooter label={t('realWorld.casesSourcesLabel')} sources={t('realWorld.casesSources', { returnObjects: true }) as SourceLink[]} />
          </div>
        </div>

        {/* ═══════ 9b–9f. REAL WORLD — ONE STORY PER SLIDE ═══════ */}
        {([
          ['legaltender', '#6366f1'],
          ['volcano', '#f97316'],
          ['pizza', '#f59e0b'],
          ['landfill', '#ED1C24'],
          ['heat', '#39B54A'],
        ] as const).map(([id, color]) => (
          <div key={id} id={`s2-rw-${id}`} className="h-full">
            <RealWorldSpotlight id={id} color={color} />
          </div>
        ))}

        {/* ═══════ 10a. WHAT BITCOIN CAN'T DO (BY DESIGN) ═══════ */}
        <div id="s2-limits" className="h-full">
          <div className="w-full h-full flex flex-col p-5 lg:p-8">
            <SlideHeader heading={t('limits.title')} lead={t('limits.description')} />

            <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* LEFT — Script premise + workarounds */}
              <div className="flex flex-col gap-3 min-h-0">
                <div className="bg-card border border-[#f59e0b]/40 rounded-xl p-4">
                  <div className="flex items-start gap-3">
                    <span className="size-9 rounded-lg bg-[#f59e0b]/20 flex items-center justify-center text-lg shrink-0">📜</span>
                    <div className="flex-1 min-w-0">
                      <div className="text-[10px] font-black uppercase tracking-widest text-[#f59e0b]">{t('programmability.premiseKicker')}</div>
                      <h3 className="font-bold text-foreground mb-1">{t('programmability.premiseTitle')}</h3>
                      <p className="text-sm text-muted-foreground">
                        {t('programmability.premiseBodyA')} <em>{t('programmability.premiseBodyEm')}</em> {t('programmability.premiseBodyMid')} <span className="text-foreground font-medium">{t('programmability.premiseScript')}</span>{t('programmability.premiseBodyB')} <span className="text-foreground font-medium">{t('programmability.premiseStrong')}</span>{t('programmability.premiseTail')}
                      </p>
                      <div className="mt-2 px-3 py-1.5 bg-[#f59e0b]/10 border border-[#f59e0b]/30 rounded-md text-xs text-muted-foreground italic">
                        {t('programmability.premiseNote')}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex-1 flex flex-col">
                  <div className="flex items-baseline gap-2 mb-2">
                    <span className="text-[10px] font-black uppercase tracking-widest text-[#6366f1]">{t('programmability.workaroundsKicker')}</span>
                    <span className="text-xs text-muted-foreground">{t('programmability.workaroundsSub')}</span>
                  </div>
                  <div className="flex flex-col gap-2">
                    {(t('programmability.workarounds', { returnObjects: true }) as Array<{ year: string; name: string; desc: string }>).map((item, idx) => (
                      <div key={idx} className="flex items-start gap-3 bg-card border border-border rounded-xl p-3">
                        <span className="px-1.5 py-0.5 rounded bg-background border border-border text-[10px] font-mono font-bold text-[#f59e0b] shrink-0">{item.year}</span>
                        <div className="min-w-0">
                          <div className="font-bold text-foreground text-sm leading-tight">🧪 {item.name}</div>
                          <div className="text-xs text-muted-foreground leading-snug mt-0.5">{item.desc}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* RIGHT — hard limits + other limits */}
              <div className="flex flex-col gap-3 min-h-0">
                <div className="bg-card border-2 border-[#ED1C24]/40 rounded-xl p-4 flex flex-col gap-2">
                  <div className="flex items-center gap-2">
                    <span className="size-7 rounded-lg bg-[#ED1C24]/20 flex items-center justify-center text-sm">🚧</span>
                    <div>
                      <div className="text-[10px] font-black uppercase tracking-widest text-[#ED1C24]">{t('programmability.hardLimitsKicker')}</div>
                      <h3 className="font-bold text-foreground leading-tight">{t('programmability.hardLimitsTitle')}</h3>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 gap-1.5 mt-1">
                    {(t('programmability.hardLimits', { returnObjects: true }) as Array<{ label: string; why: string }>).map((item, i) => (
                      <div key={i} className="flex items-center justify-between gap-3 bg-muted/40 rounded-lg px-2.5 py-1.5">
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="text-[#ED1C24] font-bold text-sm shrink-0">✗</span>
                          <span className="text-sm font-medium text-foreground truncate">{item.label}</span>
                        </div>
                        <span className="text-[11px] text-muted-foreground shrink-0 text-right">{item.why}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex-1 flex flex-col">
                  <div className="text-[10px] font-black uppercase tracking-widest text-[#8b5cf6] mb-2">{t('limits.otherLimitsKicker')}</div>
                  <div className="flex flex-col gap-2">
                    <LimitCard color="#f59e0b" icon={<AlertTriangle className="size-4 text-[#f59e0b]" />} title={t('limits.throughputTitle')}>
                      {t('limits.throughputBodyA')} <strong className="text-foreground/80">{t('limits.throughputBodyStrong')}</strong>
                    </LimitCard>
                    <LimitCard color="#6366f1" icon={<span className="text-base">⚡</span>} title={t('limits.finalityTitle')}>
                      {t('limits.finalityBody')}
                    </LimitCard>
                    <LimitCard color="#8b5cf6" icon={<span className="text-base">🔋</span>} title={t('limits.energyTitle')}>
                      {t('limits.energyBody')}
                    </LimitCard>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ═══════ 10b. BRIDGE — …SO A NEW CHAIN WAS BUILT ═══════ */}
        <div id="s2-ethereum-bridge" className="h-full">
          <div className="w-full h-full flex flex-col p-5 lg:p-8">
            <SlideHeader
              kicker={t('programmability.pivotKicker')}
              heading={t('programmability.bridgeHeading')}
              lead={t('programmability.bridgeLead')}
            />

            <div className="flex-1 min-h-0 flex flex-col gap-4 justify-center max-w-5xl w-full mx-auto">
              {/* The quote */}
              <div className="p-5 bg-gradient-to-br from-[#627EEA]/15 to-[#39B54A]/10 border border-[#627EEA]/40 rounded-xl">
                <p className="text-sm text-muted-foreground mb-2">
                  {t('programmability.pivotBodyA')} <span className="text-foreground font-medium">{t('programmability.pivotName')}</span> {t('programmability.pivotBodyB')}
                </p>
                <p className="text-lg lg:text-xl font-semibold text-foreground italic leading-snug">{t('programmability.pivotQuote')}</p>
                <p className="text-sm text-muted-foreground mt-3">
                  {t('programmability.pivotBodyC')} <span className="text-foreground font-medium">{t('programmability.pivotEthereum')}</span>{t('programmability.pivotBodyEnd')}
                </p>
              </div>

              {/* Bitcoin said no / Ethereum said yes */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-gradient-to-br from-[#f59e0b]/15 to-transparent rounded-xl border-2 border-[#f59e0b]/40">
                  <h4 className="font-bold text-[#f59e0b] mb-1.5">{t('programmability.bridgeNoTitle')}</h4>
                  <p className="text-sm text-muted-foreground leading-snug">{t('programmability.bridgeNoBody')}</p>
                </div>
                <div className="p-4 bg-gradient-to-br from-[#627EEA]/15 to-transparent rounded-xl border-2 border-[#627EEA]/40">
                  <h4 className="font-bold text-[#627EEA] mb-1.5">{t('programmability.bridgeYesTitle')}</h4>
                  <p className="text-sm text-muted-foreground leading-snug">{t('programmability.bridgeYesBody')}</p>
                </div>
              </div>

              {/* Where this goes next */}
              <div className="grid grid-cols-1 md:grid-cols-[auto_1fr_1fr] gap-3 items-stretch">
                <div className="px-3 py-2 flex items-center text-[10px] font-black uppercase tracking-widest text-muted-foreground">{t('programmability.bridgeNextTitle')}</div>
                {(t('programmability.bridgeNext', { returnObjects: true }) as Array<{ label: string; desc: string }>).map((n, i) => (
                  <div key={i} className="px-4 py-2.5 bg-[#627EEA]/10 border border-[#627EEA]/30 rounded-lg">
                    <div className="text-sm font-bold text-[#627EEA]">→ {n.label}</div>
                    <div className="text-xs text-muted-foreground">{n.desc}</div>
                  </div>
                ))}
              </div>

              <p className="text-sm text-muted-foreground text-center italic">{t('programmability.bridgeClosing')}</p>
            </div>
          </div>
        </div>

        {/* ═══════ QUIZ ═══════ */}
        <div id="s2-quiz" className="h-full">
          <QuizSlide
            question={t('quizSupply.question')}
            options={(t('quizSupply.options', { returnObjects: true }) as string[]).map((text, i) => ({ text, correct: i === 1 }))}
            explanation={t('quizSupply.explanation')}
          />
        </div>

        {/* Quiz: security */}
        <div className="h-full">
          <QuizSlide
            question={t('quizSecurity.question')}
            options={(t('quizSecurity.options', { returnObjects: true }) as string[]).map((text, i) => ({ text, correct: i === 1 }))}
            explanation={t('quizSecurity.explanation')}
          />
        </div>

        {/* Quiz: Byzantine Generals Problem */}
        <div className="h-full">
          <QuizSlide
            question={t('quizByzantine.question')}
            options={(t('quizByzantine.options', { returnObjects: true }) as string[]).map((text, i) => ({ text, correct: i === 2 }))}
            explanation={t('quizByzantine.explanation')}
          />
        </div>

        {/* Quiz: Node types */}
        <div className="h-full">
          <QuizSlide
            question={t('quizNodes.question')}
            options={(t('quizNodes.options', { returnObjects: true }) as string[]).map((text, i) => ({ text, correct: i === 3 }))}
            explanation={t('quizNodes.explanation')}
          />
        </div>

        {/* Quiz: real-world case — Cyprus 2013 */}
        <div className="h-full">
          <QuizSlide
            question={t('quizCyprus.question')}
            options={(t('quizCyprus.options', { returnObjects: true }) as string[]).map((text, i) => ({ text, correct: i === 1 }))}
            explanation={t('quizCyprus.explanation')}
          />
        </div>

        {/* ═══════ TAKEAWAYS ═══════ */}
        <div id="s2-takeaways" className="h-full">
          <TakeawaySlide
            title={t('takeaways.title')}
            takeaways={t('takeaways.items', { returnObjects: true }) as string[]}
          />
        </div>
      </div>
        <SiteFooter className="snap-start" />
      </div>
    </div>
  );
}