import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'motion/react';
import { TitleSlide } from '../../components/templates/TitleSlide';
import { TakeawaySlide } from '../../components/templates/TakeawaySlide';
import { QuizSlide } from '../../components/templates/QuizSlide';
import { SectionNav } from '../../components/navigation/SectionNav';
import { SiteFooter } from '../../components/shared/SiteFooter';
import { Building2 } from 'lucide-react';
import { TeamCheckpoint } from '../../components/TeamCheckpoint';
import { UnderTheHood } from '../../components/shared/UnderTheHood';
import {
  NftUtilitySlide, TokenGateDemo, NftHonestSlide,
  DaoIntroSlide, GovernanceBlocksExplorer, VotingPowerSim, DaoExamplesSlide,
  TradeLensCase,
} from './Section3Extras';

import imgDefiIntro      from '../../../assets/sc/defi-intro.png';
import imgDefiBorderless from '../../../assets/sc/defi-borderless.png';
import imgNftGaming      from '../../../assets/sc/nft-gaming.png';
import imgP2eEcosystem   from '../../../assets/sc/p2e-ecosystem.png';
import imgZhartaLoans    from '../../../assets/sc/zharta-loans.png';
import imgRwaProcess     from '../../../assets/sc/rwa-process.png';
import imgSupplyProv     from '../../../assets/sc/supply-provenance.png';
import imgGsbnEbl        from '../../../assets/sc/gsbn-ebl.png';
import imgCertDecent     from '../../../assets/sc/cert-decentralization.png';
import imgWalmart        from '../../../assets/sc/walmart-food-trust.jpg';
import imgSantander      from '../../../assets/sc/santander-bank.jpg';

// Language-neutral shape — IDs + kind only. Labels resolved via t() at render time.
const chapterShape = [
  { id: 's3-team-pick' },
  { id: 's3-industries-intro' },

  { kind: 'group' as const, id: 'g-defi' },
  { id: 's3-defi-intro' },
  { id: 's3-defi-dex' },
  { id: 's3-defi-amm' },
  { id: 's3-defi-stablecoins-intro' },
  { id: 's3-defi-stablecoins' },
  { id: 's3-defi-borderless' },
  { id: 's3-defi-prosCons' },

  { kind: 'group' as const, id: 'g-nft' },
  { id: 's3-nft-intro' },
  { id: 's3-nft-economies' },
  { id: 's3-nft-p2e' },
  { id: 's3-nft-p2e-real' },
  { id: 's3-nft-finance' },
  { id: 's3-nft-prosCons' },

  { kind: 'group' as const, id: 'g-apps' },
  { id: 's3-apps-intro' },
  { id: 's3-nft-utility' },
  { id: 's3-nft-gate' },
  { id: 's3-nft-honest' },
  { id: 's3-dao-intro' },
  { id: 's3-dao-structures' },
  { id: 's3-dao-vote' },
  { id: 's3-dao-examples' },
  { id: 's3-dao-prosCons' },

  { kind: 'group' as const, id: 'g-rwa' },
  { id: 's3-rwa-intro' },
  { id: 's3-rwa-spectrum' },
  { id: 's3-rwa-securitize' },
  { id: 's3-rwa-mortgages' },
  { id: 's3-rwa-collateral' },
  { id: 's3-rwa-property' },
  { id: 's3-rwa-prosCons' },

  { kind: 'group' as const, id: 'g-sc' },
  { id: 's3-sc-intro' },
  { id: 's3-sc-provenance' },
  { id: 's3-sc-prov-real' },
  { id: 's3-sc-shipping' },
  { id: 's3-sc-prosCons' },

  { kind: 'group' as const, id: 'g-cert' },
  { id: 's3-cert-intro' },
  { id: 's3-cert-howitworks' },
  { id: 's3-cert-law' },
  { id: 's3-cert-education' },
  { id: 's3-cert-products' },
  { id: 's3-cert-prosCons' },

  { kind: 'group' as const, id: 'g-cases' },
  { id: 's3-cases-intro' },
  { id: 's3-homedepot' },
  { id: 's3-realestate' },
  { id: 's3-dmv' },
  { id: 's3-walmart' },
  { id: 's3-santander' },
  { id: 's3-tradelens' },

  { kind: 'group' as const, id: 'g-close' },
  { id: 's3-exercise' },
  { id: 's3-quiz' },
  { id: 's3-takeaways' },
  { id: 's3-summary' },
];

// ─── Industry Vertical Divider ───────────────────────────────────────────────

function VerticalDivider({
  emoji, title, subtitle, color, image,
}: { emoji: string; title: string; subtitle: string; color: string; image?: string }) {
  const { t } = useTranslation('smart-contracts/section-3');
  return (
    <div className="h-full flex items-center justify-center p-10">
      <div className="text-center max-w-2xl">
        {image ? (
          <img src={image} alt="" className="mx-auto mb-4 h-40 lg:h-48 object-contain" />
        ) : (
          <div className="text-7xl mb-5">{emoji}</div>
        )}
        <div className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color }}>
          {emoji} &nbsp; {t('verticalDivider.industryVertical')}
        </div>
        <h2 className="text-4xl lg:text-5xl font-black text-foreground mb-3">{title}</h2>
        <p className="text-base text-muted-foreground leading-relaxed">{subtitle}</p>
        <div className="mt-6 inline-flex items-center gap-2 px-4 py-2 rounded-full border" style={{ borderColor: color + '40', backgroundColor: color + '10' }}>
          <span className="text-xs font-semibold" style={{ color }}>{t('verticalDivider.scrollHint')}</span>
        </div>
      </div>
    </div>
  );
}

// ─── Pros / Cons Slide Helper ────────────────────────────────────────────────

function ProsConsSlide({
  title, accent, pros, cons,
}: {
  title: string; accent: string;
  pros: { label: string; desc: string }[];
  cons: { label: string; desc: string }[];
}) {
  const { t } = useTranslation('smart-contracts/section-3');
  return (
    <div className="h-full flex flex-col p-6 lg:p-10">
      <div className="shrink-0 mb-5">
        <h2 className="text-2xl lg:text-3xl font-bold text-foreground">{title}</h2>
      </div>
      <div className="flex-1 min-h-0 grid grid-cols-2 gap-5">
        <div className="flex flex-col gap-2 overflow-y-auto">
          <div className="text-xs font-bold text-[#39B54A] uppercase tracking-widest mb-1">{t('prosCons.prosLabel')}</div>
          {pros.map(p => (
            <div key={p.label} className="p-3 bg-card border border-[#39B54A]/25 rounded-xl">
              <div className="font-bold text-sm text-foreground">{p.label}</div>
              <div className="text-xs text-muted-foreground mt-1">{p.desc}</div>
            </div>
          ))}
        </div>
        <div className="flex flex-col gap-2 overflow-y-auto">
          <div className="text-xs font-bold text-[#ED1C24] uppercase tracking-widest mb-1">{t('prosCons.consLabel')}</div>
          {cons.map(c => (
            <div key={c.label} className="p-3 bg-card border border-[#ED1C24]/25 rounded-xl">
              <div className="font-bold text-sm text-foreground">{c.label}</div>
              <div className="text-xs text-muted-foreground mt-1">{c.desc}</div>
            </div>
          ))}
        </div>
      </div>
      <div className="shrink-0 mt-3 h-1 rounded-full" style={{ backgroundColor: accent + '30' }} />
    </div>
  );
}

// ─── Interactive AMM Bonding Curve ───────────────────────────────────────────

function InteractiveAMM() {
  const { t } = useTranslation('smart-contracts/section-3');
  // Initial pool: 1000 ETH × 1000 USDC (k = 1,000,000)
  const X0 = 1000;
  const Y0 = 1000;
  const k  = X0 * Y0;

  // Trade size in ETH (X). Negative = sell ETH (add X), positive = buy ETH (remove X).
  const [dx, setDx] = useState(0);

  // After-trade reserves
  const newX = Math.max(1, X0 - dx); // buy: remove dx ETH; sell: add |dx|
  const newY = k / newX;
  const dyAbs = Math.abs(newY - Y0);
  const action = dx > 0 ? 'buy' : dx < 0 ? 'sell' : 'idle';

  // Effective price per ETH paid/received
  const effectivePrice = dx !== 0 ? dyAbs / Math.abs(dx) : Y0 / X0;
  // Spot price before trade
  const spotPrice = Y0 / X0; // = 1.000 USDC per ETH initially
  const slippage = dx !== 0 ? ((effectivePrice / spotPrice) - 1) * 100 : 0;

  // Build curve points for SVG (x from 100 to 5000, y = k/x)
  const W = 360, H = 220;
  const xMin = 100, xMax = 5000;
  const yMin = k / xMax, yMax = k / xMin;
  const sx = (x: number) => ((x - xMin) / (xMax - xMin)) * (W - 30) + 22;
  const sy = (y: number) => H - 24 - ((y - yMin) / (yMax - yMin)) * (H - 36);

  const points: string[] = [];
  for (let i = 0; i <= 60; i++) {
    const x = xMin + (i / 60) * (xMax - xMin);
    const y = k / x;
    points.push(`${sx(x).toFixed(1)},${sy(y).toFixed(1)}`);
  }

  return (
    <div className="h-full flex flex-col p-6 lg:p-8">
      <div className="shrink-0 mb-3">
        <span className="px-2.5 py-0.5 rounded-full bg-[#6366f1]/15 border border-[#6366f1]/40 text-[#6366f1] text-xs font-bold">{t('interactiveBadge')}</span>
        <h2 className="text-2xl font-bold text-foreground mt-1">{t('amm.title')}<code className="text-[#6366f1]">x · y = k</code></h2>
        <p className="text-muted-foreground text-sm">{t('amm.subtitle')}</p>
        <UnderTheHood terms={['constant product', 'liquidity pool', 'slippage', 'LP fee']} className="mt-1.5" />
      </div>

      <div className="flex-1 min-h-0 grid grid-cols-2 gap-5">

        {/* Left: chart + slider */}
        <div className="flex flex-col gap-3 min-h-0">
          <div className="p-3 bg-card border border-border rounded-xl flex-1 min-h-0 flex flex-col">
            <div className="text-xs font-semibold text-muted-foreground mb-2 flex items-center justify-between">
              <span>{t('amm.curveTitle')}</span>
              <span className="font-mono text-[#6366f1]">k = {k.toLocaleString()}</span>
            </div>
            <svg viewBox={`0 0 ${W} ${H}`} className="w-full flex-1">
              {/* Axes */}
              <line x1="22" y1={H - 24} x2={W - 8} y2={H - 24} stroke="currentColor" strokeOpacity="0.2" />
              <line x1="22" y1="6"        x2="22"     y2={H - 24} stroke="currentColor" strokeOpacity="0.2" />
              <text x="22" y={H - 4} fontSize="9" fill="currentColor" opacity="0.5">{t('amm.axisX')}</text>
              <text x="6" y="14" fontSize="9" fill="currentColor" opacity="0.5">{t('amm.axisY')}</text>

              {/* Curve */}
              <polyline points={points.join(' ')} fill="none" stroke="#6366f1" strokeWidth="2" />

              {/* Initial point (X0, Y0) */}
              <circle cx={sx(X0)} cy={sy(Y0)} r="5" fill="#9ca3af" />
              <text x={sx(X0) + 8} y={sy(Y0) - 6} fontSize="9" fill="#9ca3af">{t('amm.startLabel')}</text>

              {/* Current point */}
              <circle cx={sx(newX)} cy={sy(newY)} r="6" fill={action === 'buy' ? '#ED1C24' : action === 'sell' ? '#39B54A' : '#9ca3af'} />
              <text x={sx(newX) + 9} y={sy(newY) + 4} fontSize="10" fontWeight="bold"
                fill={action === 'buy' ? '#ED1C24' : action === 'sell' ? '#39B54A' : '#9ca3af'}>
                {t('amm.nowLabel')}
              </text>

              {/* Trade arrow */}
              {dx !== 0 && (
                <line
                  x1={sx(X0)} y1={sy(Y0)}
                  x2={sx(newX)} y2={sy(newY)}
                  stroke={action === 'buy' ? '#ED1C24' : '#39B54A'}
                  strokeWidth="1.5"
                  strokeDasharray="3 3"
                />
              )}
            </svg>
          </div>

          {/* Slider */}
          <div className="shrink-0 p-3 bg-card border border-border rounded-xl">
            <div className="flex items-center justify-between mb-2">
              <div className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">{t('amm.yourTrade')}</div>
              <button
                onClick={() => setDx(0)}
                className="text-[10px] px-2 py-0.5 rounded bg-muted text-muted-foreground hover:bg-muted/70"
              >
                {t('amm.reset')}
              </button>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs text-[#39B54A] font-semibold w-20 text-right">{t('amm.sellEth')}</span>
              <input
                type="range"
                min={-500}
                max={500}
                step={10}
                value={dx}
                onChange={e => setDx(Number(e.target.value))}
                className="flex-1 accent-[#6366f1]"
              />
              <span className="text-xs text-[#ED1C24] font-semibold w-20">{t('amm.buyEth')}</span>
            </div>
            <div className="text-center mt-1 text-sm font-mono">
              {dx === 0 ? <span className="text-muted-foreground">{t('amm.noTrade')}</span>
                : dx > 0 ? <span className="text-[#ED1C24]">{t('amm.buying', { amount: dx })}</span>
                : <span className="text-[#39B54A]">{t('amm.selling', { amount: -dx })}</span>}
            </div>
          </div>
        </div>

        {/* Right: numbers */}
        <div className="flex flex-col gap-3 min-h-0 overflow-y-auto">
          <div className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">{t('amm.poolReserves')}</div>
          <div className="grid grid-cols-2 gap-2">
            <div className="p-3 bg-card border border-border rounded-xl">
              <div className="text-[10px] text-muted-foreground">{t('amm.ethLabel')}</div>
              <div className="font-mono font-black text-base text-foreground">{newX.toFixed(2)}</div>
              <div className="text-[10px] text-muted-foreground">{t('amm.was', { value: X0 })}</div>
            </div>
            <div className="p-3 bg-card border border-border rounded-xl">
              <div className="text-[10px] text-muted-foreground">{t('amm.usdcLabel')}</div>
              <div className="font-mono font-black text-base text-foreground">{newY.toFixed(2)}</div>
              <div className="text-[10px] text-muted-foreground">{t('amm.was', { value: Y0 })}</div>
            </div>
          </div>

          <div className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mt-1">{t('amm.pricing')}</div>
          <div className="grid grid-cols-2 gap-2">
            <div className="p-3 bg-card border border-border rounded-xl">
              <div className="text-[10px] text-muted-foreground">{t('amm.spotPrice')}</div>
              <div className="font-mono font-black text-base text-[#6366f1]">{spotPrice.toFixed(4)}</div>
              <div className="text-[10px] text-muted-foreground">{t('amm.usdcPerEth')}</div>
            </div>
            <div className="p-3 bg-card border border-border rounded-xl">
              <div className="text-[10px] text-muted-foreground">{t('amm.effectivePrice')}</div>
              <div className="font-mono font-black text-base" style={{ color: action === 'buy' ? '#ED1C24' : action === 'sell' ? '#39B54A' : '#9ca3af' }}>
                {effectivePrice.toFixed(4)}
              </div>
              <div className="text-[10px] text-muted-foreground">{t('amm.usdcPerEth')}</div>
            </div>
          </div>

          <div className="p-3 bg-card border-2 rounded-xl"
            style={{ borderColor: Math.abs(slippage) > 5 ? '#ED1C24' : Math.abs(slippage) > 1 ? '#f59e0b' : '#39B54A' }}>
            <div className="flex items-center justify-between">
              <div className="text-xs font-semibold text-foreground">{t('amm.slippage')}</div>
              <div className="font-mono font-black text-lg"
                style={{ color: Math.abs(slippage) > 5 ? '#ED1C24' : Math.abs(slippage) > 1 ? '#f59e0b' : '#39B54A' }}>
                {slippage > 0 ? '+' : ''}{slippage.toFixed(2)}%
              </div>
            </div>
            <p className="text-[11px] text-muted-foreground mt-1">
              {Math.abs(slippage) > 10
                ? t('amm.slippageMassive')
                : Math.abs(slippage) > 1
                ? t('amm.slippageNoticeable')
                : t('amm.slippageMinimal')}
            </p>
          </div>

          <div className="p-3 bg-[#6366f1]/10 border border-[#6366f1]/30 rounded-xl text-xs text-muted-foreground">
            <div className="font-bold text-[#6366f1] mb-1">{t('amm.invariantTitle')}</div>
            <p>{t('amm.invariantA')}<code className="text-foreground">x · y</code>{t('amm.invariantB')}<code className="text-foreground">{k.toLocaleString()}</code>{t('amm.invariantC')}</p>
          </div>
        </div>

      </div>
    </div>
  );
}

// ─── Interactive RWA Spectrum ────────────────────────────────────────────────

const RWA_TIERS = [
  { id: 'sov',      complexity: 1, color: '#39B54A' },
  { id: 'pubeq',    complexity: 2, color: '#22d3ee' },
  { id: 'corpbond', complexity: 3, color: '#6366f1' },
  { id: 'credit',   complexity: 4, color: '#8b5cf6' },
  { id: 'struct',   complexity: 5, color: '#a855f7' },
  { id: 'funds',    complexity: 6, color: '#d946ef' },
  { id: 'commod',   complexity: 6, color: '#ec4899' },
  { id: 'trade',    complexity: 7, color: '#f43f5e' },
  { id: 'realest',  complexity: 8, color: '#f59e0b' },
  { id: 'infra',    complexity: 9, color: '#ED1C24' },
];

function RWASpectrum() {
  const { t } = useTranslation('smart-contracts/section-3');
  const [selected, setSelected] = useState<string>('sov');
  const tier = RWA_TIERS.find(t => t.id === selected)!;

  return (
    <div className="h-full flex flex-col p-6 lg:p-8">
      <div className="shrink-0 mb-3">
        <span className="px-2.5 py-0.5 rounded-full bg-[#39B54A]/15 border border-[#39B54A]/40 text-[#39B54A] text-xs font-bold">{t('interactiveBadge')}</span>
        <h2 className="text-2xl font-bold text-foreground mt-1">{t('rwaSpectrum.title')}</h2>
        <p className="text-muted-foreground text-sm">{t('rwaSpectrum.subtitle')}</p>
      </div>

      <div className="flex-1 min-h-0 grid grid-cols-3 gap-5">
        {/* Left: spectrum bars */}
        <div className="col-span-2 flex flex-col gap-2 overflow-y-auto pr-2">
          <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
            <span>{t('rwaSpectrum.easier')}</span>
            <span>{t('rwaSpectrum.harder')}</span>
          </div>
          {RWA_TIERS.map(tr => (
            <button
              key={tr.id}
              onClick={() => setSelected(tr.id)}
              className="text-left p-2 rounded-xl border-2 transition-all hover:scale-[1.01]"
              style={{
                borderColor: selected === tr.id ? tr.color : 'transparent',
                backgroundColor: selected === tr.id ? tr.color + '12' : 'var(--card)',
              }}
            >
              <div className="flex items-center gap-2">
                <div className="font-bold text-sm shrink-0 w-44 text-foreground">{t(`rwaSpectrum.tiers.${tr.id}.label`)}</div>
                <div className="flex-1 h-3 bg-muted rounded-full overflow-hidden">
                  <div className="h-full rounded-full" style={{ width: `${tr.complexity * 10}%`, backgroundColor: tr.color }} />
                </div>
                <div className="font-mono font-bold text-xs w-10 text-right" style={{ color: tr.color }}>{t('rwaSpectrum.complexityUnit', { value: tr.complexity })}</div>
              </div>
            </button>
          ))}
        </div>

        {/* Right: details */}
        <motion.div
          key={selected}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="p-5 bg-card border-2 rounded-xl flex flex-col gap-3"
          style={{ borderColor: tier.color + '60' }}
        >
          <div className="flex items-center gap-2">
            <div className="size-10 rounded-xl flex items-center justify-center font-black text-white" style={{ backgroundColor: tier.color }}>
              {tier.complexity}
            </div>
            <div>
              <div className="text-[10px] font-bold uppercase tracking-widest" style={{ color: tier.color }}>{t('rwaSpectrum.assetClass')}</div>
              <div className="font-black text-foreground">{t(`rwaSpectrum.tiers.${tier.id}.label`)}</div>
            </div>
          </div>
          <div className="p-3 bg-muted rounded-lg">
            <div className="text-xs font-semibold text-foreground mb-1">{t('rwaSpectrum.whyScore')}</div>
            <p className="text-xs text-muted-foreground leading-relaxed">{t(`rwaSpectrum.tiers.${tier.id}.desc`)}</p>
          </div>
          <div className="p-3 rounded-lg flex-1" style={{ backgroundColor: tier.color + '10' }}>
            <div className="text-xs font-semibold mb-1" style={{ color: tier.color }}>{t('rwaSpectrum.adoptionToday')}</div>
            <p className="text-xs text-muted-foreground leading-relaxed">{t(`rwaSpectrum.tiers.${tier.id}.adoption`)}</p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

// ─── Interactive Proof-of-Existence (SHA-256) ────────────────────────────────

async function sha256Hex(input: string): Promise<string> {
  if (typeof crypto === 'undefined' || !crypto.subtle) return '0000…unavailable';
  const buf  = new TextEncoder().encode(input);
  const hash = await crypto.subtle.digest('SHA-256', buf);
  return Array.from(new Uint8Array(hash)).map(b => b.toString(16).padStart(2, '0')).join('');
}

function ProofOfExistenceDemo() {
  const { t } = useTranslation('smart-contracts/section-3');
  const [doc, setDoc]   = useState(t('poe.defaultDoc'));
  const [hash, setHash] = useState<string>('');
  const [anchored, setAnchored] = useState<{ hash: string; ts: number } | null>(null);
  const [verifyDoc, setVerifyDoc] = useState('');
  const [verifyHash, setVerifyHash] = useState('');

  useEffect(() => { sha256Hex(doc).then(setHash); }, [doc]);

  const onDocChange = (v: string) => setDoc(v);

  const anchor = () => setAnchored({ hash, ts: Date.now() });

  const verify = async () => {
    setVerifyHash(await sha256Hex(verifyDoc));
  };

  const verifyMatches = anchored && verifyHash && verifyHash === anchored.hash;

  return (
    <div className="h-full flex flex-col p-6 lg:p-8">
      <div className="shrink-0 mb-3">
        <span className="px-2.5 py-0.5 rounded-full bg-[#22d3ee]/15 border border-[#22d3ee]/40 text-[#22d3ee] text-xs font-bold">{t('interactiveBadge')}</span>
        <h2 className="text-2xl font-bold text-foreground mt-1">{t('poe.title')}</h2>
        <p className="text-muted-foreground text-sm">{t('poe.subtitle')}</p>
      </div>

      <div className="flex-1 min-h-0 grid grid-cols-2 gap-5">

        {/* Issue */}
        <div className="flex flex-col gap-3">
          <div className="text-xs font-bold text-[#22d3ee] uppercase tracking-widest">{t('poe.issueStep')}</div>
          <div className="p-3 bg-card border border-border rounded-xl flex flex-col gap-2">
            <div className="text-[10px] font-semibold text-muted-foreground">{t('poe.credentialText')}</div>
            <textarea
              value={doc}
              onChange={e => onDocChange(e.target.value)}
              rows={3}
              className="w-full p-2 bg-muted rounded-lg text-xs font-mono text-foreground resize-none border border-border focus:outline-none focus:ring-1 focus:ring-[#22d3ee]"
            />
          </div>
          <div className="p-3 bg-card border border-border rounded-xl">
            <div className="text-[10px] font-semibold text-muted-foreground mb-1">{t('poe.hashLabel')}</div>
            <div className="font-mono text-[10px] text-[#6366f1] break-all leading-relaxed">{hash || '…'}</div>
          </div>
          <button
            onClick={anchor}
            disabled={!hash}
            className="px-4 py-2.5 rounded-xl bg-[#22d3ee] text-white text-xs font-black hover:bg-[#22d3ee]/90 disabled:opacity-40 transition-colors"
          >
            {t('poe.anchorButton')}
          </button>
          {anchored && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-3 bg-[#22d3ee]/10 border border-[#22d3ee]/30 rounded-xl">
              <div className="font-bold text-xs text-[#22d3ee] mb-1">{t('poe.anchored')}</div>
              <div className="text-[10px] text-muted-foreground">{t('poe.blockTimestamp', { ts: new Date(anchored.ts).toISOString() })}</div>
              <div className="text-[10px] text-muted-foreground">{t('poe.anchoredHash')}<span className="font-mono">{anchored.hash.slice(0, 24)}…</span></div>
            </motion.div>
          )}
        </div>

        {/* Verify */}
        <div className="flex flex-col gap-3">
          <div className="text-xs font-bold text-[#39B54A] uppercase tracking-widest">{t('poe.verifyStep')}</div>
          {!anchored ? (
            <div className="p-4 rounded-xl border border-dashed border-border flex-1 flex items-center justify-center text-center">
              <p className="text-xs text-muted-foreground italic">{t('poe.verifyPlaceholderPrompt')}</p>
            </div>
          ) : (
            <>
              <div className="p-3 bg-card border border-border rounded-xl flex flex-col gap-2">
                <div className="text-[10px] font-semibold text-muted-foreground">{t('poe.reenterCredential')}</div>
                <textarea
                  value={verifyDoc}
                  onChange={e => setVerifyDoc(e.target.value)}
                  placeholder={t('poe.verifyTextareaPlaceholder')}
                  rows={3}
                  className="w-full p-2 bg-muted rounded-lg text-xs font-mono text-foreground resize-none border border-border focus:outline-none focus:ring-1 focus:ring-[#39B54A]"
                />
                <button
                  onClick={verify}
                  disabled={!verifyDoc}
                  className="self-start px-3 py-1.5 rounded-lg bg-[#39B54A] text-white text-xs font-bold hover:bg-[#39B54A]/90 disabled:opacity-40 transition-colors"
                >
                  {t('poe.computeHash')}
                </button>
              </div>

              {verifyHash && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-3 rounded-xl border-2"
                  style={{ borderColor: verifyMatches ? '#39B54A' : '#ED1C24', backgroundColor: (verifyMatches ? '#39B54A' : '#ED1C24') + '12' }}
                >
                  <div className="font-black mb-1" style={{ color: verifyMatches ? '#39B54A' : '#ED1C24' }}>
                    {verifyMatches ? t('poe.verifiedMatch') : t('poe.verifiedMismatch')}
                  </div>
                  <div className="font-mono text-[10px] text-muted-foreground break-all leading-relaxed">
                    {t('poe.computedLabel')}{verifyHash.slice(0, 32)}…<br/>
                    {t('poe.anchoredLabelShort')}{anchored.hash.slice(0, 32)}…
                  </div>
                </motion.div>
              )}
            </>
          )}
        </div>

      </div>

      <div className="shrink-0 mt-3 p-2 bg-muted/50 rounded-lg text-[11px] text-muted-foreground">
        <span className="font-semibold text-foreground">{t('poe.whyWorksLabel')}</span>{t('poe.whyWorksBody')}
      </div>
    </div>
  );
}

// ─── Exercise: Design Your Own Mini-Brief ────────────────────────────────────

// Language-neutral industry IDs — display labels and example text come from t().
const INDUSTRIES = ['Finance', 'Supply Chain', 'Healthcare', 'Real Estate', 'Government', 'Entertainment', 'Insurance', 'Gaming'];

// ─── Interactive Peg-Stability Simulator ────────────────────────────────────

type PegType = 'fiat' | 'crypto' | 'algo';

// Language-neutral: numeric controls + ticker examples + color. Text via t() by key.
const PEG_TYPES: Record<PegType, { example: string; color: string; controlMin: number; controlMax: number; controlDefault: number; controlUnit: string }> = {
  fiat:   { example: 'USDC · USDT',  color: '#6366f1', controlMin: 50, controlMax: 100, controlDefault: 100, controlUnit: '%' },
  crypto: { example: 'DAI · LUSD',   color: '#8b5cf6', controlMin: 80, controlMax: 250, controlDefault: 150, controlUnit: '%' },
  algo:   { example: 'UST (defunct)', color: '#f59e0b', controlMin: 0,  controlMax: 100, controlDefault: 30,  controlUnit: '%' },
};

function PegSimulator() {
  const { t } = useTranslation('smart-contracts/section-3');
  const [type, setType]     = useState<PegType>('crypto');
  const [control, setCtl]   = useState(PEG_TYPES.crypto.controlDefault);
  const [shock, setShock]   = useState(20); // % of supply being sold

  // When the type changes, reset its control to default
  const setTypeAndDefault = (t: PegType) => {
    setType(t);
    setCtl(PEG_TYPES[t].controlDefault);
  };

  // Compute peg deviation (cents off $1)
  let dev = 0;
  let regime: 'stable' | 'wobble' | 'depeg' | 'collapse' = 'stable';
  if (type === 'fiat') {
    const gap = Math.max(0, 100 - control);    // unbacked %
    dev = (gap / 100) * (shock / 100) * 35;
  } else if (type === 'crypto') {
    const cushion = Math.max(0, control - 100); // over-collateralisation above $1
    const stress  = Math.max(0, shock - cushion * 0.7);
    dev = (stress / 100) * 25 + (control < 100 ? (100 - control) * 0.5 : 0);
  } else {
    // algo — exponential below cushion
    const ratio = (shock / Math.max(1, control));
    dev = Math.min(100, Math.pow(ratio, 1.8) * 20);
  }

  const peg = Math.max(0, 1 - dev / 100);
  if      (dev < 1)   regime = 'stable';
  else if (dev < 5)   regime = 'wobble';
  else if (dev < 30)  regime = 'depeg';
  else                regime = 'collapse';

  const regimeColor = regime === 'stable'   ? '#39B54A'
                    : regime === 'wobble'   ? '#f59e0b'
                    : regime === 'depeg'    ? '#ED1C24'
                    :                          '#7c2d12';
  const regimeLabel = t(`pegSim.regime.${regime}`);

  const lesson = type === 'fiat'
    ? t('pegSim.lessons.fiat')
    : type === 'crypto'
    ? t('pegSim.lessons.crypto')
    : t('pegSim.lessons.algo');

  const cfg = PEG_TYPES[type];

  return (
    <div className="h-full flex flex-col p-6 lg:p-8">
      <div className="shrink-0 mb-3">
        <span className="px-2.5 py-0.5 rounded-full bg-[#6366f1]/15 border border-[#6366f1]/40 text-[#6366f1] text-xs font-bold">{t('interactiveBadge')}</span>
        <h2 className="text-2xl font-bold text-foreground mt-1">{t('pegSim.title')}</h2>
        <p className="text-muted-foreground text-sm">{t('pegSim.subtitle')}</p>
      </div>

      <div className="flex-1 min-h-0 grid grid-cols-2 gap-5">
        {/* Controls */}
        <div className="flex flex-col gap-3">
          <div className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">{t('pegSim.design')}</div>
          <div className="grid grid-cols-3 gap-2">
            {(Object.keys(PEG_TYPES) as PegType[]).map(pt => {
              const tcfg = PEG_TYPES[pt];
              const active = pt === type;
              return (
                <button key={pt} onClick={() => setTypeAndDefault(pt)}
                  className="p-2.5 rounded-xl border-2 text-left transition-colors"
                  style={{
                    borderColor: active ? tcfg.color : 'var(--border)',
                    backgroundColor: active ? tcfg.color + '15' : 'var(--card)',
                  }}>
                  <div className="font-bold text-xs" style={{ color: active ? tcfg.color : 'var(--foreground)' }}>{t(`pegSim.types.${pt}.name`)}</div>
                  <div className="text-[10px] font-mono text-muted-foreground mt-0.5">{tcfg.example}</div>
                </button>
              );
            })}
          </div>

          <div className="p-3 bg-card border border-border rounded-xl">
            <div className="flex items-center justify-between mb-1">
              <div className="text-xs font-semibold text-foreground">{t(`pegSim.types.${type}.control`)}</div>
              <div className="font-mono font-bold text-sm" style={{ color: cfg.color }}>{control}{cfg.controlUnit}</div>
            </div>
            <input type="range" min={cfg.controlMin} max={cfg.controlMax} step={1} value={control}
              onChange={e => setCtl(Number(e.target.value))}
              className="w-full" style={{ accentColor: cfg.color }} />
            <div className="text-[10px] text-muted-foreground mt-1">{t(`pegSim.types.${type}.controlDesc`)}</div>
          </div>

          <div className="p-3 bg-card border border-border rounded-xl">
            <div className="flex items-center justify-between mb-1">
              <div className="text-xs font-semibold text-foreground">{t('pegSim.shockLabel')}</div>
              <div className="font-mono font-bold text-sm text-[#ED1C24]">{shock}%</div>
            </div>
            <input type="range" min={0} max={100} step={1} value={shock}
              onChange={e => setShock(Number(e.target.value))}
              className="w-full accent-[#ED1C24]" />
            <div className="text-[10px] text-muted-foreground mt-1">{t('pegSim.shockDesc')}</div>
          </div>

          <div className="mt-auto p-3 rounded-xl border" style={{ borderColor: cfg.color + '40', backgroundColor: cfg.color + '0c' }}>
            <div className="text-[10px] font-bold uppercase tracking-widest mb-1" style={{ color: cfg.color }}>{t('pegSim.lessonLabel')}</div>
            <p className="text-xs text-muted-foreground leading-relaxed">{lesson}</p>
          </div>
        </div>

        {/* Peg display */}
        <div className="flex flex-col gap-3">
          <div className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">{t('pegSim.currentPeg')}</div>

          <div className="flex-1 min-h-0 p-5 rounded-2xl border-4 flex flex-col items-center justify-center gap-3" style={{ borderColor: regimeColor + '60', backgroundColor: regimeColor + '0c' }}>
            <div className="text-xs text-muted-foreground">{t('pegSim.target')}</div>
            <div className="font-mono font-black text-6xl lg:text-7xl" style={{ color: regimeColor }}>
              ${peg.toFixed(peg < 0.5 ? 4 : 3)}
            </div>
            <div className="px-3 py-1 rounded-full text-sm font-bold" style={{ backgroundColor: regimeColor + '20', color: regimeColor }}>
              {regimeLabel}
            </div>

            {/* Peg gauge bar */}
            <div className="w-full mt-2">
              <div className="h-2 bg-muted rounded-full overflow-hidden relative">
                {/* target marker at right */}
                <div className="absolute right-0 top-0 h-full w-0.5 bg-foreground/40" />
                <div className="h-full transition-all duration-300" style={{ width: `${peg * 100}%`, backgroundColor: regimeColor }} />
              </div>
              <div className="flex justify-between text-[10px] text-muted-foreground mt-1">
                <span>$0</span><span>{t('pegSim.pegRange')}</span>
              </div>
            </div>

            <div className="text-xs text-center text-muted-foreground">
              {t('pegSim.deviation')}<span className="font-mono font-bold" style={{ color: regimeColor }}>−{dev.toFixed(2)}¢</span>
            </div>
          </div>

          <div className="shrink-0 p-2.5 bg-muted/30 border border-border rounded-lg text-[11px] text-muted-foreground">
            <span className="font-semibold text-foreground">{t('pegSim.noteLabel')}</span>{t('pegSim.noteBody')}<span className="italic">{t('pegSim.noteEmphasis')}</span>.
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Interactive Royalty Cascade Calculator ──────────────────────────────────

function RoyaltyCalculator() {
  const { t } = useTranslation('smart-contracts/section-3');
  const [salePrice, setSalePrice] = useState(10000);
  const [creatorPct,  setCreator]   = useState(5);   // ERC-2981 default-ish
  const [marketPct,   setMarketPct] = useState(2.5); // marketplace fee
  const [resales,     setResales]   = useState(3);

  const creator   = salePrice * creatorPct  / 100;
  const market    = salePrice * marketPct   / 100;
  const seller    = salePrice - creator - market;

  // Royalty earned across N resales (cumulative)
  const totalRoyalty = creator * resales;

  const slices = [
    { key: 'seller',      label: t('royalty.sellerLabel'),      value: seller,  color: '#6366f1' },
    { key: 'creator',     label: t('royalty.creatorLabel'),     value: creator, color: '#39B54A' },
    { key: 'marketplace', label: t('royalty.marketplaceLabel'), value: market,  color: '#f59e0b' },
  ];

  return (
    <div className="h-full flex flex-col p-6 lg:p-8">
      <div className="shrink-0 mb-3">
        <span className="px-2.5 py-0.5 rounded-full bg-[#8b5cf6]/15 border border-[#8b5cf6]/40 text-[#8b5cf6] text-xs font-bold">{t('interactiveBadge')}</span>
        <h2 className="text-2xl font-bold text-foreground mt-1">{t('royalty.title')}</h2>
        <p className="text-muted-foreground text-sm">{t('royalty.subtitle')}</p>
      </div>

      <div className="flex-1 min-h-0 grid grid-cols-2 gap-5">

        {/* Controls */}
        <div className="flex flex-col gap-3">
          <div className="p-3 bg-card border border-border rounded-xl">
            <div className="flex items-center justify-between mb-1">
              <div className="text-xs font-semibold text-foreground">{t('royalty.salePrice')}</div>
              <div className="font-mono font-bold text-sm text-foreground">${salePrice.toLocaleString()}</div>
            </div>
            <input type="range" min={100} max={100000} step={100} value={salePrice}
              onChange={e => setSalePrice(Number(e.target.value))}
              className="w-full accent-[#6366f1]" />
          </div>

          {[
            { key: 'creator', label: t('royalty.creatorRoyalty'),  val: creatorPct, set: setCreator,   color: '#39B54A', max: 15 },
            { key: 'market',  label: t('royalty.marketplaceFee'),  val: marketPct,  set: setMarketPct, color: '#f59e0b', max: 10 },
          ].map(s => (
            <div key={s.key} className="p-3 bg-card border border-border rounded-xl">
              <div className="flex items-center justify-between mb-1">
                <div className="text-xs font-semibold text-foreground">{s.label}</div>
                <div className="font-mono font-bold text-sm" style={{ color: s.color }}>{s.val}%</div>
              </div>
              <input type="range" min={0} max={s.max} step={0.5} value={s.val}
                onChange={e => s.set(Number(e.target.value))}
                className="w-full" style={{ accentColor: s.color }} />
            </div>
          ))}

          <div className="p-3 bg-card border border-border rounded-xl">
            <div className="flex items-center justify-between mb-1">
              <div className="text-xs font-semibold text-foreground">{t('royalty.futureResales')}</div>
              <div className="font-mono font-bold text-sm text-[#22d3ee]">{resales}×</div>
            </div>
            <input type="range" min={0} max={20} step={1} value={resales}
              onChange={e => setResales(Number(e.target.value))}
              className="w-full accent-[#22d3ee]" />
          </div>
        </div>

        {/* Output */}
        <div className="flex flex-col gap-3 min-h-0">
          <div className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">{t('royalty.splitForSale')}</div>

          {/* Stacked-bar */}
          <div className="p-3 bg-card border border-border rounded-xl">
            <div className="h-8 rounded-lg overflow-hidden flex">
              {slices.map(s => s.value > 0 && (
                <div key={s.key} className="h-full flex items-center justify-center text-[10px] font-bold text-white"
                  style={{ width: `${(s.value / salePrice) * 100}%`, backgroundColor: s.color }}
                  title={`${s.label}: $${s.value.toFixed(0)}`}>
                  {(s.value / salePrice) >= 0.08 ? `${((s.value / salePrice) * 100).toFixed(0)}%` : ''}
                </div>
              ))}
            </div>
            <div className="grid grid-cols-2 gap-1.5 mt-3">
              {slices.map(s => (
                <div key={s.key} className="flex items-center justify-between p-1.5 rounded text-xs" style={{ backgroundColor: s.color + '12' }}>
                  <div className="flex items-center gap-1.5">
                    <div className="size-3 rounded-sm" style={{ backgroundColor: s.color }} />
                    <span className="text-foreground font-semibold">{s.label}</span>
                  </div>
                  <span className="font-mono font-bold" style={{ color: s.color }}>${s.value.toFixed(0)}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Cumulative royalty over N resales */}
          <div className="p-3 bg-gradient-to-br from-[#39B54A]/10 to-transparent border border-[#39B54A]/30 rounded-xl">
            <div className="text-[10px] font-bold text-[#39B54A] uppercase tracking-widest">{t('royalty.cumulativeTitle')}</div>
            <div className="flex items-baseline gap-2 mt-1">
              <div className="font-mono font-black text-2xl text-[#39B54A]">${totalRoyalty.toLocaleString(undefined, { maximumFractionDigits: 0 })}</div>
              <div className="text-xs text-muted-foreground">{t('royalty.acrossResales', { count: resales })}</div>
            </div>
          </div>

          {/* Trad vs SC */}
          <div className="grid grid-cols-2 gap-2 mt-auto">
            <div className="p-3 bg-card border border-[#ED1C24]/30 rounded-xl text-center">
              <div className="text-[10px] font-bold text-[#ED1C24] uppercase tracking-widest">{t('royalty.tradWeb2')}</div>
              <div className="font-mono font-black text-base text-[#ED1C24] mt-1">$0</div>
              <div className="text-[10px] text-muted-foreground">{t('royalty.tradWeb2Desc')}</div>
            </div>
            <div className="p-3 bg-card border border-[#39B54A]/30 rounded-xl text-center">
              <div className="text-[10px] font-bold text-[#39B54A] uppercase tracking-widest">{t('royalty.withErc2981')}</div>
              <div className="font-mono font-black text-base text-[#39B54A] mt-1">${totalRoyalty.toLocaleString(undefined, { maximumFractionDigits: 0 })}</div>
              <div className="text-[10px] text-muted-foreground">{t('royalty.withErc2981Desc')}</div>
            </div>
          </div>
          <div className="p-2 rounded-lg border border-[#f59e0b]/40 text-[11px] text-muted-foreground" style={{ backgroundColor: '#f59e0b0f' }}>
            <span className="font-bold text-[#f59e0b]">{t('royalty.caveatLabel')}</span>{t('royalty.caveatBody')}
          </div>
        </div>

      </div>
    </div>
  );
}

// ─── Interactive Provenance QR-Scan Trail ────────────────────────────────────

// Language-neutral: emoji, who (proper names/places), ts, sig. label & detail via t() by index.
const PROVENANCE_STEPS = [
  { emoji: '🐔', who: 'Ferme Bio Sud-Ouest, FR',     ts: '2026-03-15 06:24', sig: '0x8a3f…91c4' },
  { emoji: '🌾', who: 'Ferme Bio Sud-Ouest, FR',     ts: '2026-05-02 18:00', sig: '0x8a3f…91c4' },
  { emoji: '🚛', who: 'CoolChain Logistique',        ts: '2026-05-05 04:11', sig: '0x4d12…77ae' },
  { emoji: '🏭', who: 'Abattoir Toulouse SARL',      ts: '2026-05-05 09:48', sig: '0x91bc…2f08' },
  { emoji: '📦', who: 'Carrefour BIO line, Lyon',    ts: '2026-05-05 14:22', sig: '0xc7e2…b41d' },
  { emoji: '🚚', who: 'Carrefour Logistics',         ts: '2026-05-06 02:30', sig: '0x4d12…77ae' },
  { emoji: '🛒', who: 'Carrefour Lyon Part-Dieu',    ts: '2026-05-06 08:15', sig: '0xa1f5…3e90' },
];

function ProvenanceQR() {
  const { t } = useTranslation('smart-contracts/section-3');
  const [scanned, setScanned] = useState(false);
  const [active, setActive]   = useState(0);

  return (
    <div className="h-full flex flex-col p-6 lg:p-8">
      <div className="shrink-0 mb-3">
        <span className="px-2.5 py-0.5 rounded-full bg-[#f59e0b]/15 border border-[#f59e0b]/40 text-[#f59e0b] text-xs font-bold">{t('interactiveBadge')}</span>
        <h2 className="text-2xl font-bold text-foreground mt-1">{t('provenance.title')}</h2>
        <p className="text-muted-foreground text-sm">{t('provenance.subtitle')}</p>
      </div>

      <div className="flex-1 min-h-0 grid grid-cols-[260px_1fr] gap-5">

        {/* QR + product card */}
        <div className="flex flex-col gap-3 min-h-0">
          <div className="shrink-0 p-4 bg-card border-2 border-border rounded-xl text-center">
            <div className="text-xs text-muted-foreground mb-1">{t('provenance.productLabel')}</div>
            <div className="font-bold text-sm text-foreground">{t('provenance.batchLabel')}</div>
          </div>

          <button onClick={() => setScanned(s => !s)}
            className="shrink-0 relative p-4 rounded-xl border-2 transition-colors group"
            style={{
              borderColor: scanned ? '#39B54A' : '#f59e0b',
              backgroundColor: scanned ? '#39B54A08' : '#f59e0b08',
            }}>
            {/* Fake QR — checker pattern */}
            <svg viewBox="0 0 21 21" className="w-full h-auto" style={{ imageRendering: 'pixelated' }}>
              {Array.from({ length: 21 }).map((_, y) =>
                Array.from({ length: 21 }).map((_, x) => {
                  // Corner finder patterns + pseudo-random fill
                  const isCorner = (x < 7 && y < 7) || (x > 13 && y < 7) || (x < 7 && y > 13);
                  const cornerRing = isCorner && (
                    x === 0 || x === 6 || x === 14 || x === 20 ||
                    y === 0 || y === 6 || y === 14 || y === 20 ||
                    ((x >= 2 && x <= 4 && y >= 2 && y <= 4)) ||
                    ((x >= 16 && x <= 18 && y >= 2 && y <= 4)) ||
                    ((x >= 2 && x <= 4 && y >= 16 && y <= 18))
                  );
                  if (isCorner && !cornerRing) return null;
                  const fill = isCorner ? true : ((x * 7 + y * 13 + 3) % 5 < 2);
                  if (!fill) return null;
                  return <rect key={`${x}-${y}`} x={x} y={y} width="1" height="1" fill="currentColor" />;
                })
              )}
            </svg>
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              {!scanned && (
                <span className="px-3 py-1.5 rounded-full bg-[#f59e0b] text-white text-xs font-bold shadow-lg group-hover:scale-105 transition-transform">
                  {t('provenance.tapToScan')}
                </span>
              )}
              {scanned && (
                <span className="px-3 py-1.5 rounded-full bg-[#39B54A] text-white text-xs font-bold shadow-lg">
                  {t('provenance.trailLoaded')}
                </span>
              )}
            </div>
          </button>

          {scanned && (
            <div className="shrink-0 p-2.5 bg-[#39B54A]/10 border border-[#39B54A]/30 rounded-lg text-[11px] text-muted-foreground">
              <span className="font-semibold text-foreground">{t('provenance.handoffsLabel')}</span>{t('provenance.handoffsRest')}
            </div>
          )}
        </div>

        {/* Trail */}
        <div className="flex flex-col gap-2 min-h-0">
          <div className="shrink-0 text-xs font-semibold text-muted-foreground uppercase tracking-widest">{t('provenance.trailTitle')}</div>

          {!scanned ? (
            <div className="flex-1 flex items-center justify-center text-center text-sm text-muted-foreground border border-dashed border-border rounded-xl">
              {t('provenance.scanPrompt')}
            </div>
          ) : (
            <div className="flex-1 min-h-0 flex flex-col gap-1.5 overflow-y-auto pr-1">
              {PROVENANCE_STEPS.map((s, i) => {
                const isActive = i === active;
                return (
                  <motion.button key={i}
                    onClick={() => setActive(i)}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="text-left p-2.5 rounded-lg border transition-colors"
                    style={{
                      borderColor: isActive ? '#f59e0b' : 'var(--border)',
                      backgroundColor: isActive ? '#f59e0b12' : 'var(--card)',
                    }}>
                    <div className="flex items-center gap-2">
                      <div className="text-xl shrink-0">{s.emoji}</div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <div className="font-bold text-sm text-foreground">{t('provenance.stepLabel', { number: i + 1, label: t(`provenance.steps.${i}.label`) })}</div>
                          <div className="text-[10px] font-mono text-muted-foreground">{s.ts}</div>
                        </div>
                        <div className="text-xs text-muted-foreground">{s.who}</div>
                        {isActive && (
                          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
                            className="mt-1.5 pt-1.5 border-t border-[#f59e0b]/30">
                            <div className="text-xs text-foreground">{t(`provenance.steps.${i}.detail`)}</div>
                            <div className="text-[10px] font-mono text-muted-foreground mt-0.5">{t('provenance.signedBy', { sig: s.sig })}</div>
                          </motion.div>
                        )}
                      </div>
                    </div>
                  </motion.button>
                );
              })}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}

function DesignYourOwnExercise() {
  const { t } = useTranslation('smart-contracts/section-3');
  const [selected,  setSelected]  = useState<string | null>(null);
  const [stepIndex, setStepIndex] = useState(0);

  // Step shape is language-neutral: emoji + label key + example field key.
  const stepShape = [
    { labelKey: 'pain',    emoji: '🩹', field: 'pain' },
    { labelKey: 'parties', emoji: '👥', field: 'parties' },
    { labelKey: 'trigger', emoji: '⚡', field: 'trigger' },
    { labelKey: 'output',  emoji: '✅', field: 'output' },
    { labelKey: 'risk',    emoji: '⚠️', field: 'risk' },
  ];
  const steps = selected ? stepShape.map(s => ({
    label: t(`exercise.stepLabels.${s.labelKey}`),
    emoji: s.emoji,
    value: t(`exercise.examples.${selected}.${s.field}`),
  })) : [];

  const handleSelect = (ind: string) => { setSelected(ind); setStepIndex(0); };
  const next = () => setStepIndex(i => Math.min(i + 1, steps.length - 1));
  const prev = () => setStepIndex(i => Math.max(i - 1, 0));

  return (
    <div className="h-full flex flex-col p-6 lg:p-8">
      <div className="shrink-0 mb-4">
        <span className="px-2.5 py-0.5 rounded-full bg-[#39B54A]/15 border border-[#39B54A]/40 text-[#39B54A] text-xs font-bold">{t('exerciseBadge')}</span>
        <h2 className="text-2xl font-bold text-foreground mt-1">{t('exercise.title')}</h2>
        <p className="text-muted-foreground text-sm">{t('exercise.subtitle')}</p>
      </div>

      <div className="flex-1 min-h-0 flex gap-6">

        {/* Industry selector */}
        <div className="flex flex-col gap-2 w-44 shrink-0 justify-center">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-1">{t('exercise.chooseIndustry')}</p>
          {INDUSTRIES.map(ind => (
            <motion.button key={ind} onClick={() => handleSelect(ind)} whileHover={{ x: 4 }} whileTap={{ scale: 0.97 }}
              className="px-3 py-2 rounded-xl border-2 text-left text-xs font-semibold transition-colors"
              style={{
                borderColor: selected === ind ? '#39B54A' : 'var(--border)',
                backgroundColor: selected === ind ? '#39B54A18' : 'var(--card)',
                color: selected === ind ? '#39B54A' : 'var(--foreground)',
              }}>
              {t(`exercise.industries.${ind}`)}
            </motion.button>
          ))}
        </div>

        {/* Step-through panel */}
        <div className="flex-1 min-w-0 flex flex-col">
          {!selected ? (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center text-muted-foreground">
                <div className="text-5xl mb-3">👈</div>
                <p className="text-sm">{t('exercise.selectPrompt')}</p>
              </div>
            </div>
          ) : (
            <AnimatePresence mode="wait">
              <motion.div key={selected} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }} className="flex-1 flex flex-col gap-4">

                {/* Progress dots */}
                <div className="flex items-center gap-2 shrink-0">
                  {steps.map((s, i) => (
                    <button key={i} onClick={() => setStepIndex(i)}
                      className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold transition-colors"
                      style={{
                        backgroundColor: i <= stepIndex ? '#39B54A20' : 'var(--muted)',
                        color: i <= stepIndex ? '#39B54A' : 'var(--muted-foreground)',
                        border: `1px solid ${i === stepIndex ? '#39B54A' : 'transparent'}`,
                      }}>
                      {s.emoji} {s.label}
                    </button>
                  ))}
                </div>

                {/* Prompt card — show question first, reveal on click */}
                <motion.div key={stepIndex} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
                  className="flex-1 flex flex-col gap-4">

                  <div className="p-5 rounded-xl border-2 border-[#39B54A]/30 bg-[#39B54A]/06 flex flex-col gap-3">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{steps[stepIndex].emoji}</span>
                      <div className="font-black text-lg text-foreground">{steps[stepIndex].label}</div>
                      <span className="ml-auto text-xs text-muted-foreground">{t('exercise.stepCounter', { current: stepIndex + 1, total: steps.length })}</span>
                    </div>

                    {/* Question prompt */}
                    <div className="p-3 bg-muted rounded-lg text-sm text-muted-foreground italic">
                      {t(`exercise.prompts.${stepIndex}`, { industry: t(`exercise.industries.${selected}`) })}
                    </div>

                    {/* Example answer */}
                    <div className="p-3 bg-[#39B54A]/10 border border-[#39B54A]/30 rounded-lg">
                      <div className="text-[10px] font-bold text-[#39B54A] uppercase tracking-widest mb-1">{t('exercise.exampleAnswer', { industry: t(`exercise.industries.${selected}`) })}</div>
                      <div className="text-sm text-foreground">{steps[stepIndex].value}</div>
                    </div>
                  </div>

                  {/* Nav */}
                  <div className="flex items-center gap-3 shrink-0">
                    <button onClick={prev} disabled={stepIndex === 0}
                      className="px-4 py-2 rounded-lg bg-muted text-xs font-semibold text-muted-foreground hover:bg-muted/80 disabled:opacity-30 transition-colors">{t('exercise.previous')}</button>
                    <button onClick={next} disabled={stepIndex === steps.length - 1}
                      className="px-4 py-2 rounded-lg bg-[#39B54A] text-white text-xs font-bold hover:bg-[#39B54A]/90 disabled:opacity-30 transition-colors">{t('exercise.next')}</button>
                    {stepIndex === steps.length - 1 && (
                      <span className="text-xs text-[#39B54A] font-semibold ml-2">{t('exercise.complete')}</span>
                    )}
                  </div>
                </motion.div>

              </motion.div>
            </AnimatePresence>
          )}
        </div>

      </div>
    </div>
  );
}

interface ProsConsItem { label: string; desc: string }
interface MetricItem { metric: string; label: string }
interface StrongBullet { a: string; strong: string; b: string }

export function SC_Section3() {
  const { t } = useTranslation('smart-contracts/section-3');

  const chapters = useMemo(
    () =>
      chapterShape.map((c) =>
        'kind' in c
          ? { kind: 'group' as const, id: c.id, label: t(`groups.${c.id}`) }
          : { id: c.id, label: t(`chapters.${c.id}`) }
      ),
    [t]
  );

  // Pros/Cons
  const defiPros = t('defiProsCons.pros', { returnObjects: true }) as ProsConsItem[];
  const defiCons = t('defiProsCons.cons', { returnObjects: true }) as ProsConsItem[];
  const nftPros = t('nftProsCons.pros', { returnObjects: true }) as ProsConsItem[];
  const nftCons = t('nftProsCons.cons', { returnObjects: true }) as ProsConsItem[];
  const rwaPros = t('rwaProsCons.pros', { returnObjects: true }) as ProsConsItem[];
  const rwaCons = t('rwaProsCons.cons', { returnObjects: true }) as ProsConsItem[];
  const scPros = t('scProsCons.pros', { returnObjects: true }) as ProsConsItem[];
  const scCons = t('scProsCons.cons', { returnObjects: true }) as ProsConsItem[];
  const certPros = t('certProsCons.pros', { returnObjects: true }) as ProsConsItem[];
  const certCons = t('certProsCons.cons', { returnObjects: true }) as ProsConsItem[];
  const daoPros = t('daoProsCons.pros', { returnObjects: true }) as ProsConsItem[];
  const daoCons = t('daoProsCons.cons', { returnObjects: true }) as ProsConsItem[];

  // Bullet/array content
  const industryVerticals = [
    { key: 'defi', emoji: '💸', color: '#6366f1' },
    { key: 'nft',  emoji: '🎮', color: '#8b5cf6' },
    { key: 'rwa',  emoji: '🏢', color: '#39B54A' },
    { key: 'sc',   emoji: '🚚', color: '#f59e0b' },
    { key: 'cert', emoji: '📜', color: '#22d3ee' },
  ];
  const defiPrimitives = [
    { key: 'dex', color: '#6366f1' },
    { key: 'lending', color: '#8b5cf6' },
    { key: 'stablecoins', color: '#39B54A' },
    { key: 'yield', color: '#f59e0b' },
    { key: 'derivatives', color: '#22d3ee' },
  ];
  const stablecoinCards = [
    { key: 'fiat',   icon: '🏦', color: '#39B54A', ex: ['USDC', 'USDT'] },
    { key: 'crypto', icon: '⛓️', color: '#6366f1', ex: ['DAI'] },
    { key: 'algo',   icon: '🧮', color: '#ED1C24', ex: ['UST ✝'] },
  ];
  const borderlessTraditional = t('borderless.traditionalItems', { returnObjects: true }) as string[];
  const borderlessSc = t('borderless.scItems', { returnObjects: true }) as string[];
  const borderlessTradeoffs = t('borderless.tradeoffsItems', { returnObjects: true }) as string[];
  const nftGamingPoints = t('nftIntro.gamingPoints', { returnObjects: true }) as string[];
  const nftEcoCards = [
    { key: 'before',   emoji: '🏛', color: '#ED1C24' },
    { key: 'withNft',  emoji: '🎯', color: '#8b5cf6' },
    { key: 'parallels', emoji: '💼', color: '#39B54A' },
  ];
  const p2eHowPoints = t('p2eReal.howPoints', { returnObjects: true }) as string[];
  const ubisoftPoints = t('p2eReal.ubisoftPoints', { returnObjects: true }) as StrongBullet[];
  const rwaSecuritizeHow = t('rwaSecuritize.howPoints', { returnObjects: true }) as string[];
  const rwaSecuritizeValue = t('rwaSecuritize.valuePoints', { returnObjects: true }) as string[];
  const rwaMortgageContract = t('rwaMortgages.contractPoints', { returnObjects: true }) as string[];
  const rwaMortgageWhy = t('rwaMortgages.whyPoints', { returnObjects: true }) as string[];
  const rwaCollateralCards = t('rwaCollateral.cards', { returnObjects: true }) as { title: string; desc: string }[];
  const rwaCollateralEmojis = ['💰', '⚙️', '🛡', '⚡', '🏗', '🌍'];
  const rwaCollateralColors = ['#39B54A', '#6366f1', '#8b5cf6', '#f59e0b', '#22d3ee', '#ec4899'];
  const scLegacyPoints = t('scShipping.legacyPoints', { returnObjects: true }) as string[];
  const gsbnPoints = t('scShipping.gsbnPoints', { returnObjects: true }) as StrongBullet[];
  const certWhatPoints = t('certLaw.whatPoints', { returnObjects: true }) as StrongBullet[];
  const certEduProblem = t('certEducation.problemPoints', { returnObjects: true }) as string[];
  const certMitPoints = t('certEducation.mitPoints', { returnObjects: true }) as StrongBullet[];
  const certProductsPoints = t('certProducts.howPoints', { returnObjects: true }) as string[];

  // Case studies
  const homedepotProblem = t('homedepot.problemPoints', { returnObjects: true }) as string[];
  const homedepotSolution = t('homedepot.solutionPoints', { returnObjects: true }) as string[];
  const homedepotResults = t('homedepot.results', { returnObjects: true }) as MetricItem[];
  const homedepotResultColors = ['#39B54A', '#6366f1', '#f59e0b', '#8b5cf6'];
  const propyProblem = t('propy.problemPoints', { returnObjects: true }) as string[];
  const propySolution = t('propy.solutionPoints', { returnObjects: true }) as string[];
  const propyResults = t('propy.results', { returnObjects: true }) as MetricItem[];
  const propyResultColors = ['#39B54A', '#8b5cf6', '#f59e0b', '#6366f1'];
  const dmvProblem = t('dmv.problemPoints', { returnObjects: true }) as string[];
  const dmvSolution = t('dmv.solutionPoints', { returnObjects: true }) as string[];
  const dmvResults = t('dmv.results', { returnObjects: true }) as MetricItem[];
  const dmvResultColors = ['#22d3ee', '#39B54A', '#6366f1', '#f59e0b'];
  const walmartProblem = t('walmart.problemPoints', { returnObjects: true }) as string[];
  const walmartSolution = t('walmart.solutionPoints', { returnObjects: true }) as string[];
  const walmartResults = t('walmart.results', { returnObjects: true }) as MetricItem[];
  const santanderBackground = t('santander.backgroundPoints', { returnObjects: true }) as StrongBullet[];
  const santanderWhy = t('santander.whyPoints', { returnObjects: true }) as string[];
  const santanderBenefits = t('santander.benefits', { returnObjects: true }) as MetricItem[];

  // Closing
  const quizOptionTexts = t('quiz.options', { returnObjects: true }) as string[];
  const takeawayItems = t('takeaways.items', { returnObjects: true }) as string[];
  const summaryCards = t('summary.cards', { returnObjects: true }) as { title: string; summary: string }[];
  const summaryMeta = [
    { icon: '💸', color: '#6366f1' },
    { icon: '🎮', color: '#8b5cf6' },
    { icon: '🏛', color: '#a855f7' },
    { icon: '🏢', color: '#39B54A' },
    { icon: '🚚', color: '#f59e0b' },
    { icon: '📜', color: '#22d3ee' },
    { icon: '🏠', color: '#6366f1' },
    { icon: '🏡', color: '#8b5cf6' },
    { icon: '🚗', color: '#22d3ee' },
    { icon: '🥬', color: '#39B54A' },
    { icon: '💼', color: '#6366f1' },
    { icon: '🚢', color: '#ED1C24' },
  ];

  return (
    <div className="h-full w-full flex overflow-hidden">
      <SectionNav chapters={chapters} accentColor="#6366f1" />
      <div id="section-scroll" className="flex-1 overflow-y-auto snap-y snap-mandatory">
        <div className="slide-flow">

        <div className="h-full">
          <TitleSlide
            sectionNumber={t('title.sectionNumber')}
            title={t('title.title')}
            subtitle={t('title.subtitle')}
            icon={<Building2 className="size-20 text-[#6366f1]" />}
            gradient="from-[#6366f1] to-[#22d3ee]"
          />
        </div>

        {/* ═══════ TEAM CHECKPOINT — PICK YOUR INDUSTRY ═══════ */}
        <div id="s3-team-pick" className="h-full">
          <TeamCheckpoint
            contextLabel={t('teamPick.contextLabel')}
            title={t('teamPick.title')}
            subtitle={t('teamPick.subtitle')}
            duration={t('teamPick.duration')}
            sections={[
              {
                label: t('teamPick.haveLabel'),
                color: '#22d3ee',
                items: [
                  <>{t('teamPick.have.item1A')}<strong>{t('teamPick.have.item1Strong')}</strong>{t('teamPick.have.item1B')}</>,
                  <>{t('teamPick.have.item2')}</>,
                ],
              },
              {
                label: t('teamPick.discussLabel'),
                color: '#39B54A',
                items: [
                  <>{t('teamPick.discuss.item1')}</>,
                  <>{t('teamPick.discuss.item2A')}<strong>{t('teamPick.discuss.item2Strong')}</strong>{t('teamPick.discuss.item2B')}</>,
                  <>{t('teamPick.discuss.item3')}</>,
                ],
              },
              {
                label: t('teamPick.duringLabel'),
                color: '#6366f1',
                items: [
                  <>{t('teamPick.during.item1')}</>,
                  <>{t('teamPick.during.item2')}</>,
                  <>{t('teamPick.during.item3A')}<strong>{t('teamPick.during.item3Strong')}</strong>{t('teamPick.during.item3B')}</>,
                ],
              },
            ]}
          />
        </div>

        {/* ═══════ INDUSTRIES OVERVIEW ═══════ */}
        <div id="s3-industries-intro" className="h-full flex flex-col p-6 lg:p-10">
          <div className="shrink-0 mb-5">
            <h2 className="text-2xl lg:text-3xl font-bold text-foreground">{t('industriesIntro.heading')}</h2>
            <p className="text-muted-foreground text-sm mt-1">{t('industriesIntro.subtitle')}</p>
          </div>
          <div className="flex-1 min-h-0 grid grid-cols-5 gap-3 content-center">
            {industryVerticals.map(v => (
              <div key={v.key} className="p-4 bg-card border rounded-xl flex flex-col gap-2"
                style={{ borderColor: v.color + '40' }}>
                <div className="text-4xl">{v.emoji}</div>
                <div className="text-[10px] font-bold uppercase tracking-widest" style={{ color: v.color }}>{t(`industriesIntro.verticals.${v.key}.tag`)}</div>
                <div className="font-bold text-sm text-foreground">{t(`industriesIntro.verticals.${v.key}.name`)}</div>
                <div className="text-xs text-muted-foreground leading-snug">{t(`industriesIntro.verticals.${v.key}.desc`)}</div>
              </div>
            ))}
          </div>
          <div className="shrink-0 mt-4 p-3 rounded-xl border border-border bg-muted/30 text-xs text-muted-foreground">
            <span className="font-semibold text-foreground">{t('industriesIntro.commonThreadLabel')}</span>{t('industriesIntro.commonThreadBody')}
          </div>
        </div>

        {/* ═══════════════════════════════════════════════════════════ */}
        {/* DeFi vertical                                              */}
        {/* ═══════════════════════════════════════════════════════════ */}

        <div id="s3-defi-intro" className="h-full">
          <VerticalDivider
            emoji="💸"
            title={t('defiDivider.title')}
            subtitle={t('defiDivider.subtitle')}
            color="#6366f1"
            image={imgDefiIntro}
          />
        </div>

        {/* DeFi: What is it */}
        <div className="h-full flex flex-col p-6 lg:p-10">
          <div className="shrink-0 mb-5">
            <h2 className="text-2xl lg:text-3xl font-bold text-foreground">{t('defiWhat.heading')}</h2>
            <p className="text-muted-foreground text-base mt-1">{t('defiWhat.subtitle')}</p>
          </div>
          <div className="flex-1 min-h-0 grid grid-cols-2 gap-5 grid-rows-1">
            <div className="flex flex-col gap-3 justify-center">
              <div className="p-4 bg-card border border-[#6366f1]/30 rounded-xl">
                <div className="font-bold text-base text-[#6366f1] mb-2">{t('defiWhat.coreIdeaTitle')}</div>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {t('defiWhat.coreIdeaBody')}
                </p>
              </div>
              <div className="p-4 bg-card border border-[#8b5cf6]/30 rounded-xl">
                <div className="font-bold text-base text-[#8b5cf6] mb-2">{t('defiWhat.valueCodeTitle')}</div>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {t('defiWhat.valueCodeBody')}
                </p>
              </div>
            </div>
            <div className="flex flex-col gap-3 justify-center">
              <div className="text-sm font-semibold text-muted-foreground uppercase tracking-widest">{t('defiWhat.primitivesLabel')}</div>
              {defiPrimitives.map(p => (
                <div key={p.key} className="flex items-start gap-3 p-2.5 bg-card border border-border rounded-lg">
                  <div className="px-2 py-0.5 rounded font-bold text-sm shrink-0 text-white" style={{ backgroundColor: p.color }}>{t(`defiWhat.primitives.${p.key}.name`)}</div>
                  <div className="text-sm text-muted-foreground">{t(`defiWhat.primitives.${p.key}.desc`)}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* DeFi: DEX use cases */}
        <div id="s3-defi-dex" className="h-full flex flex-col p-6 lg:p-10">
          <div className="shrink-0 mb-5">
            <h2 className="text-2xl lg:text-3xl font-bold text-foreground">{t('defiDex.heading')}</h2>
            <p className="text-muted-foreground text-base mt-1">{t('defiDex.subtitle')}</p>
          </div>
          <div className="flex-1 min-h-0 grid grid-cols-2 gap-5 grid-rows-1">
            <div className="p-5 bg-card border border-[#6366f1]/30 rounded-xl flex flex-col gap-3 justify-center">
              <div className="flex items-center gap-2">
                <div className="size-10 rounded-xl bg-[#6366f1]/15 flex items-center justify-center text-xl shrink-0">🦄</div>
                <div>
                  <div className="font-black text-base text-foreground">{t('defiDex.uniswapName')}</div>
                  <div className="text-sm text-[#6366f1]">{t('defiDex.uniswapTag')}</div>
                </div>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {t('defiDex.uniswapBody')}
              </p>
              <div className="grid grid-cols-2 gap-2 mt-auto">
                <div className="p-2 bg-[#6366f1]/10 rounded-lg text-center">
                  <div className="font-mono font-black text-base text-[#6366f1]">{t('defiDex.uniswapStat1Value')}</div>
                  <div className="text-xs text-muted-foreground">{t('defiDex.uniswapStat1Label')}</div>
                </div>
                <div className="p-2 bg-[#6366f1]/10 rounded-lg text-center">
                  <div className="font-mono font-black text-base text-[#6366f1]">{t('defiDex.uniswapStat2Value')}</div>
                  <div className="text-xs text-muted-foreground">{t('defiDex.uniswapStat2Label')}</div>
                </div>
              </div>
            </div>

            <div className="p-5 bg-card border border-[#8b5cf6]/30 rounded-xl flex flex-col gap-3 justify-center">
              <div className="flex items-center gap-2">
                <div className="size-10 rounded-xl bg-[#8b5cf6]/15 flex items-center justify-center text-xl shrink-0">🐮</div>
                <div>
                  <div className="font-black text-base text-foreground">{t('defiDex.cowName')}</div>
                  <div className="text-sm text-[#8b5cf6]">{t('defiDex.cowTag')}</div>
                </div>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {t('defiDex.cowBodyA')}<span className="font-semibold text-foreground">{t('defiDex.cowBodyStrong')}</span>{t('defiDex.cowBodyB')}
              </p>
              <div className="grid grid-cols-2 gap-2 mt-auto">
                <div className="p-2 bg-[#8b5cf6]/10 rounded-lg text-center">
                  <div className="font-mono font-black text-base text-[#8b5cf6]">{t('defiDex.cowStat1Value')}</div>
                  <div className="text-xs text-muted-foreground">{t('defiDex.cowStat1Label')}</div>
                </div>
                <div className="p-2 bg-[#8b5cf6]/10 rounded-lg text-center">
                  <div className="font-mono font-black text-base text-[#8b5cf6]">{t('defiDex.cowStat2Value')}</div>
                  <div className="text-xs text-muted-foreground">{t('defiDex.cowStat2Label')}</div>
                </div>
              </div>
            </div>
          </div>
          <div className="shrink-0 mt-4 p-3 rounded-xl border border-border bg-muted/30 text-sm text-muted-foreground">
            <span className="font-semibold text-foreground">{t('defiDex.whyMattersLabel')}</span>{t('defiDex.whyMattersBody')}
          </div>
        </div>

        {/* DeFi: Interactive AMM */}
        <div id="s3-defi-amm" className="h-full">
          <InteractiveAMM />
        </div>

        {/* DeFi: Stablecoins — concept primer */}
        <div id="s3-defi-stablecoins-intro" className="h-full flex flex-col p-6 lg:p-10">
          <div className="shrink-0 mb-5">
            <h2 className="text-2xl lg:text-3xl font-bold text-foreground">{t('stablecoinsIntro.heading')}</h2>
            <p className="text-muted-foreground text-sm mt-1">{t('stablecoinsIntro.subtitle')}</p>
          </div>

          <div className="flex-1 min-h-0 grid grid-cols-3 gap-5 grid-rows-1">
            {stablecoinCards.map(s => (
              <div key={s.key} className="flex flex-col rounded-2xl border-2 bg-card overflow-hidden" style={{ borderColor: s.color + '40' }}>
                <div className="h-1.5" style={{ backgroundColor: s.color }} />
                <div className="flex-1 flex flex-col gap-3 p-5 justify-center">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">{s.icon}</span>
                    <div className="font-black text-lg" style={{ color: s.color }}>{t(`stablecoinsIntro.cards.${s.key}.name`)}</div>
                  </div>
                  <p className="text-sm text-foreground leading-relaxed">{t(`stablecoinsIntro.cards.${s.key}.how`)}</p>
                  <p className="text-sm text-muted-foreground leading-relaxed"><span className="font-semibold" style={{ color: s.color }}>{t('stablecoinsIntro.riskLabel')}</span>{t(`stablecoinsIntro.cards.${s.key}.risk`)}</p>
                  <div className="flex flex-wrap gap-1.5 mt-1">
                    {s.ex.map(e => <span key={e} className="text-xs font-semibold px-2 py-0.5 rounded-full" style={{ backgroundColor: s.color + '15', color: s.color }}>{e}</span>)}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="shrink-0 mt-4 p-3 rounded-xl border border-[#6366f1]/30 text-center text-sm" style={{ backgroundColor: '#6366f10f' }}>
            <span className="font-bold text-[#6366f1]">{t('stablecoinsIntro.nextLabel')}</span>
            <span className="text-muted-foreground">{t('stablecoinsIntro.nextBody')}</span>
          </div>
          <UnderTheHood terms={['collateral ratio', 'liquidation', 'redemption', 'reserve attestation']} className="shrink-0 mt-2 justify-center w-full" />
        </div>

        {/* DeFi: Stablecoins */}
        <div id="s3-defi-stablecoins" className="h-full">
          <PegSimulator />
        </div>

        {/* DeFi: Borderless transfers */}
        <div id="s3-defi-borderless" className="h-full flex flex-col p-6 lg:p-10">
          <div className="shrink-0 mb-5 flex items-start gap-4">
            <img src={imgDefiBorderless} alt={t('borderless.imgAlt')} className="hidden lg:block h-24 object-contain shrink-0" />
            <div>
              <h2 className="text-2xl lg:text-3xl font-bold text-foreground">{t('borderless.heading')}</h2>
              <p className="text-muted-foreground text-sm mt-1">{t('borderless.subtitle')}</p>
            </div>
          </div>
          <div className="flex-1 min-h-0 grid grid-cols-3 gap-4 content-center">
            <div className="p-5 bg-card border border-[#ED1C24]/30 rounded-xl flex flex-col gap-2">
              <div className="text-xs font-bold text-[#ED1C24] uppercase tracking-widest">{t('borderless.traditionalLabel')}</div>
              <div className="font-black text-foreground">{t('borderless.traditionalTitle')}</div>
              <ul className="text-xs text-muted-foreground space-y-1.5 mt-2">
                {borderlessTraditional.map((item, i) => (
                  <li key={i} className="flex gap-1.5"><span className="text-[#ED1C24]">›</span>{item}</li>
                ))}
              </ul>
            </div>
            <div className="p-5 bg-card border border-[#39B54A]/30 rounded-xl flex flex-col gap-2">
              <div className="text-xs font-bold text-[#39B54A] uppercase tracking-widest">{t('borderless.scLabel')}</div>
              <div className="font-black text-foreground">{t('borderless.scTitle')}</div>
              <ul className="text-xs text-muted-foreground space-y-1.5 mt-2">
                {borderlessSc.map((item, i) => (
                  <li key={i} className="flex gap-1.5"><span className="text-[#39B54A]">›</span>{item}</li>
                ))}
              </ul>
            </div>
            <div className="p-5 bg-card border border-[#6366f1]/30 rounded-xl flex flex-col gap-2">
              <div className="text-xs font-bold text-[#6366f1] uppercase tracking-widest">{t('borderless.tradeoffsLabel')}</div>
              <div className="font-black text-foreground">{t('borderless.tradeoffsTitle')}</div>
              <ul className="text-xs text-muted-foreground space-y-1.5 mt-2">
                {borderlessTradeoffs.map((item, i) => (
                  <li key={i} className="flex gap-1.5"><span className="text-[#6366f1]">›</span>{item}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* DeFi: Pros / Cons */}
        <div id="s3-defi-prosCons" className="h-full">
          <ProsConsSlide
            title={t('defiProsCons.title')}
            accent="#6366f1"
            pros={defiPros}
            cons={defiCons}
          />
        </div>

        {/* ═══════════════════════════════════════════════════════════ */}
        {/* Gaming & NFTs vertical                                     */}
        {/* ═══════════════════════════════════════════════════════════ */}

        <div id="s3-nft-intro" className="h-full">
          <VerticalDivider
            emoji="🎮"
            title={t('nftDivider.title')}
            subtitle={t('nftDivider.subtitle')}
            color="#8b5cf6"
            image={imgNftGaming}
          />
        </div>

        {/* NFTs: Intro */}
        <div className="h-full flex flex-col p-6 lg:p-10">
          <div className="shrink-0 mb-5">
            <h2 className="text-2xl lg:text-3xl font-bold text-foreground">{t('nftIntro.heading')}</h2>
            <p className="text-muted-foreground text-base mt-1">{t('nftIntro.subtitle')}</p>
          </div>
          <div className="flex-1 min-h-0 grid grid-cols-2 gap-5 grid-rows-1">
            <div className="p-5 bg-card border border-[#8b5cf6]/30 rounded-xl flex flex-col gap-3 justify-center">
              <div className="font-bold text-base text-[#8b5cf6]">{t('nftIntro.unlikeTitle')}</div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {t('nftIntro.unlikeBodyA')}<span className="font-semibold text-foreground">{t('nftIntro.unlikeBodyStrong')}</span>{t('nftIntro.unlikeBodyB')}
              </p>
              <div className="grid grid-cols-2 gap-2 mt-auto">
                <div className="p-2 bg-[#8b5cf6]/10 rounded-lg">
                  <div className="text-xs text-muted-foreground">{t('nftIntro.standardLabel')}</div>
                  <div className="font-mono font-black text-base text-[#8b5cf6]">ERC-721</div>
                </div>
                <div className="p-2 bg-[#8b5cf6]/10 rounded-lg">
                  <div className="text-xs text-muted-foreground">{t('nftIntro.multiTokenLabel')}</div>
                  <div className="font-mono font-black text-base text-[#8b5cf6]">ERC-1155</div>
                </div>
              </div>
              <UnderTheHood terms={['tokenId', 'tokenURI', 'metadata', 'IPFS']} />
            </div>
            <div className="p-5 bg-card border border-[#6366f1]/30 rounded-xl flex flex-col gap-3 justify-center">
              <div className="font-bold text-base text-[#6366f1]">{t('nftIntro.gamingTitle')}</div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {t('nftIntro.gamingBody')}
              </p>
              <ul className="space-y-1.5 text-sm text-muted-foreground">
                {nftGamingPoints.map((p, i) => (
                  <li key={i} className="flex gap-1.5"><span className="text-[#6366f1]">›</span>{p}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* NFTs: Economies */}
        <div id="s3-nft-economies" className="h-full flex flex-col p-6 lg:p-10">
          <div className="shrink-0 mb-5">
            <h2 className="text-2xl lg:text-3xl font-bold text-foreground">{t('nftEconomies.heading')}</h2>
            <p className="text-muted-foreground text-sm mt-1">{t('nftEconomies.subtitle')}</p>
          </div>
          <div className="flex-1 min-h-0 grid grid-cols-3 gap-4 content-center">
            {nftEcoCards.map(c => {
              const points = t(`nftEconomies.cards.${c.key}.points`, { returnObjects: true }) as string[];
              return (
                <div key={c.key} className="p-4 bg-card border rounded-xl flex flex-col gap-2"
                  style={{ borderColor: c.color + '30' }}>
                  <div className="text-3xl">{c.emoji}</div>
                  <div className="font-bold text-sm" style={{ color: c.color }}>{t(`nftEconomies.cards.${c.key}.title`)}</div>
                  <ul className="space-y-1.5 text-xs text-muted-foreground flex-1 mt-1">
                    {points.map((p, i) => (
                      <li key={i} className="flex gap-1.5"><span style={{ color: c.color }} className="shrink-0 mt-0.5">›</span>{p}</li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
        </div>

        {/* NFTs: Play-to-Earn (interactive royalty calculator) */}
        <div id="s3-nft-p2e" className="h-full">
          <RoyaltyCalculator />
        </div>

        {/* NFTs: Ubisoft real-world */}
        <div id="s3-nft-p2e-real" className="h-full flex flex-col p-6 lg:p-10">
          <div className="shrink-0 mb-5 flex items-start gap-4">
            <img src={imgP2eEcosystem} alt={t('p2eReal.imgAlt')} className="hidden lg:block h-20 object-contain shrink-0" />
            <div>
              <h2 className="text-2xl lg:text-3xl font-bold text-foreground">{t('p2eReal.heading')}</h2>
              <p className="text-muted-foreground text-base mt-1">{t('p2eReal.subtitle')}</p>
            </div>
          </div>
          <div className="flex-1 min-h-0 grid grid-cols-2 gap-5 grid-rows-1">
            <div className="p-5 bg-card border border-[#8b5cf6]/30 rounded-xl flex flex-col gap-3 justify-center">
              <div className="font-bold text-base text-[#8b5cf6]">{t('p2eReal.howTitle')}</div>
              <ul className="text-sm text-muted-foreground space-y-2 flex-1">
                {p2eHowPoints.map((p, i) => (
                  <li key={i} className="flex gap-2"><span className="text-[#8b5cf6] shrink-0 mt-0.5">›</span>{p}</li>
                ))}
              </ul>
            </div>
            <div className="p-5 bg-gradient-to-br from-[#8b5cf6]/10 to-transparent border border-[#8b5cf6]/30 rounded-xl flex flex-col gap-3 justify-center">
              <div className="flex items-center gap-2">
                <span className="text-2xl">⚔️</span>
                <div>
                  <div className="font-black text-base text-foreground">{t('p2eReal.ubisoftTitle')}</div>
                  <div className="text-sm text-[#8b5cf6]">{t('p2eReal.ubisoftTag')}</div>
                </div>
              </div>
              <ul className="text-sm text-muted-foreground space-y-2 flex-1">
                {ubisoftPoints.map((p, i) => (
                  <li key={i} className="flex gap-2"><span className="text-[#8b5cf6] shrink-0 mt-0.5">›</span>{p.a}{p.strong && <span className="font-semibold text-foreground">{p.strong}</span>}{p.b}</li>
                ))}
              </ul>
              <div className="mt-auto p-2 bg-[#8b5cf6]/10 rounded-lg text-sm text-muted-foreground">
                {t('p2eReal.ubisoftFootnote')}
              </div>
            </div>
          </div>
        </div>

        {/* NFTs: Finance */}
        <div id="s3-nft-finance" className="h-full flex flex-col p-6 lg:p-10">
          <div className="shrink-0 mb-5">
            <h2 className="text-2xl lg:text-3xl font-bold text-foreground">{t('nftFinance.heading')}</h2>
            <p className="text-muted-foreground text-base mt-1">{t('nftFinance.subtitle')}</p>
          </div>
          <div className="flex-1 min-h-0 grid grid-cols-2 gap-5 grid-rows-1">
            <div className="flex flex-col gap-3 justify-center">
              <div className="p-4 bg-card border border-[#8b5cf6]/30 rounded-xl flex flex-col gap-2 justify-center">
                <div className="font-bold text-base text-[#8b5cf6]">{t('nftFinance.lendingTitle')}</div>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {t('nftFinance.lendingBody')}
                </p>
                <div className="text-xs text-muted-foreground italic">{t('nftFinance.lendingExamples')}</div>
              </div>
              <div className="p-4 bg-card border border-[#22d3ee]/30 rounded-xl flex flex-col gap-2 justify-center">
                <div className="font-bold text-base text-[#22d3ee]">{t('nftFinance.rentalsTitle')}</div>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {t('nftFinance.rentalsBody')}
                </p>
                <div className="text-xs text-muted-foreground italic">{t('nftFinance.rentalsPattern')}</div>
              </div>
            </div>
            <div className="flex flex-col gap-2 justify-center">
              <div className="text-sm font-bold text-[#8b5cf6] uppercase tracking-widest">{t('nftFinance.zhartaLabel')}</div>
              <div className="p-3 bg-card border border-[#8b5cf6]/30 rounded-xl">
                <img src={imgZhartaLoans} alt={t('nftFinance.zhartaImgAlt')} className="w-full h-auto rounded-lg" />
                <p className="text-sm text-muted-foreground leading-relaxed mt-2">
                  {t('nftFinance.zhartaBodyA')}<span className="font-semibold text-foreground">{t('nftFinance.zhartaBodyStrong1')}</span>{t('nftFinance.zhartaBodyB')}<span className="font-semibold text-foreground">{t('nftFinance.zhartaBodyStrong2')}</span>{t('nftFinance.zhartaBodyC')}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* NFTs: Pros / Cons */}
        <div id="s3-nft-prosCons" className="h-full">
          <ProsConsSlide
            title={t('nftProsCons.title')}
            accent="#8b5cf6"
            pros={nftPros}
            cons={nftCons}
          />
        </div>

        {/* ═══════════════════════════════════════════════════════════ */}
        {/* NFT Utility & DAOs — applications block                     */}
        {/* ═══════════════════════════════════════════════════════════ */}

        <div id="s3-apps-intro" className="h-full">
          <VerticalDivider
            emoji="🏛"
            title={t('appsDivider.title')}
            subtitle={t('appsDivider.subtitle')}
            color="#a855f7"
          />
        </div>

        <div id="s3-nft-utility" className="h-full"><NftUtilitySlide /></div>
        <div id="s3-nft-gate" className="h-full"><TokenGateDemo /></div>
        <div id="s3-nft-honest" className="h-full"><NftHonestSlide /></div>
        <div id="s3-dao-intro" className="h-full"><DaoIntroSlide /></div>
        <div id="s3-dao-structures" className="h-full"><GovernanceBlocksExplorer /></div>
        <div id="s3-dao-vote" className="h-full"><VotingPowerSim /></div>
        <div id="s3-dao-examples" className="h-full"><DaoExamplesSlide /></div>
        <div id="s3-dao-prosCons" className="h-full">
          <ProsConsSlide
            title={t('daoProsCons.title')}
            accent="#a855f7"
            pros={daoPros}
            cons={daoCons}
          />
        </div>

        {/* ═══════════════════════════════════════════════════════════ */}
        {/* Real Asset Tokenization vertical                            */}
        {/* ═══════════════════════════════════════════════════════════ */}

        <div id="s3-rwa-intro" className="h-full">
          <VerticalDivider
            emoji="🏢"
            title={t('rwaDivider.title')}
            subtitle={t('rwaDivider.subtitle')}
            color="#39B54A"
            image={imgRwaProcess}
          />
        </div>

        {/* RWA: Interactive spectrum */}
        <div id="s3-rwa-spectrum" className="h-full">
          <RWASpectrum />
        </div>

        {/* RWA: Securitize */}
        <div id="s3-rwa-securitize" className="h-full flex flex-col p-6 lg:p-10">
          <div className="shrink-0 mb-5">
            <h2 className="text-2xl lg:text-3xl font-bold text-foreground">{t('rwaSecuritize.heading')}</h2>
            <p className="text-muted-foreground text-base mt-1">{t('rwaSecuritize.subtitle')}</p>
          </div>
          <div className="flex-1 min-h-0 grid grid-cols-2 gap-5 grid-rows-1">
            <div className="p-5 bg-card border border-[#39B54A]/30 rounded-xl flex flex-col gap-3 justify-center">
              <div className="font-bold text-base text-[#39B54A]">{t('rwaSecuritize.howTitle')}</div>
              <ul className="text-sm text-muted-foreground space-y-2 flex-1">
                {rwaSecuritizeHow.map((item, i) => (
                  <li key={i} className="flex gap-2"><span className="text-[#39B54A]">›</span>{item}</li>
                ))}
              </ul>
              <div className="p-2 bg-[#39B54A]/10 rounded-lg text-sm">
                <span className="font-semibold text-foreground">{t('rwaSecuritize.regulatoryLabel')}</span> <span className="text-muted-foreground">{t('rwaSecuritize.regulatoryBody')}</span>
              </div>
              <UnderTheHood terms={['transfer restrictions', 'whitelist', 'ERC-1400 / ERC-3643', 'on-chain KYC']} />
            </div>
            <div className="flex flex-col gap-3 justify-center">
              <div className="text-sm font-bold text-[#39B54A] uppercase tracking-widest">{t('rwaSecuritize.deploymentsLabel')}</div>
              <div className="p-4 bg-card border border-[#39B54A]/25 rounded-xl">
                <div className="font-bold text-foreground text-base mb-1">{t('rwaSecuritize.buidlTitle')}</div>
                <p className="text-sm text-muted-foreground">{t('rwaSecuritize.buidlBody')}</p>
              </div>
              <div className="p-4 bg-card border border-[#39B54A]/25 rounded-xl">
                <div className="font-bold text-foreground text-base mb-1">{t('rwaSecuritize.bnyTitle')}</div>
                <p className="text-sm text-muted-foreground">{t('rwaSecuritize.bnyBody')}</p>
              </div>
              <div className="p-4 bg-[#39B54A]/10 border border-[#39B54A]/30 rounded-xl">
                <div className="font-bold text-foreground text-base mb-1">{t('rwaSecuritize.valueTitle')}</div>
                <ul className="text-sm text-muted-foreground space-y-1">
                  {rwaSecuritizeValue.map((item, i) => (
                    <li key={i} className="flex gap-1.5"><span className="text-[#39B54A]">›</span>{item}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* RWA: Mortgages */}
        <div id="s3-rwa-mortgages" className="h-full flex flex-col p-6 lg:p-10">
          <div className="shrink-0 mb-5">
            <h2 className="text-2xl lg:text-3xl font-bold text-foreground">{t('rwaMortgages.heading')}</h2>
            <p className="text-muted-foreground text-base mt-1">{t('rwaMortgages.subtitle')}</p>
          </div>
          <div className="flex-1 min-h-0 grid grid-cols-2 gap-5 grid-rows-1">
            <div className="p-5 bg-card border border-[#39B54A]/30 rounded-xl flex flex-col gap-3 justify-center">
              <div className="font-bold text-base text-[#39B54A]">{t('rwaMortgages.contractTitle')}</div>
              <ul className="text-sm text-muted-foreground space-y-2 flex-1">
                {rwaMortgageContract.map((item, i) => (
                  <li key={i} className="flex gap-2"><span className="text-[#39B54A]">›</span>{item}</li>
                ))}
              </ul>
            </div>
            <div className="p-5 bg-card border border-[#6366f1]/30 rounded-xl flex flex-col gap-3 justify-center">
              <div className="font-bold text-base text-[#6366f1]">{t('rwaMortgages.whyTitle')}</div>
              <ul className="text-sm text-muted-foreground space-y-2 flex-1">
                {rwaMortgageWhy.map((item, i) => (
                  <li key={i} className="flex gap-2"><span className="text-[#6366f1]">›</span>{item}</li>
                ))}
              </ul>
              <div className="p-2 bg-[#6366f1]/10 rounded-lg text-sm text-muted-foreground mt-auto">
                <span className="font-semibold text-foreground">{t('rwaMortgages.limitationLabel')}</span>{t('rwaMortgages.limitationBody')}
              </div>
            </div>
          </div>
        </div>

        {/* RWA: Collateral */}
        <div id="s3-rwa-collateral" className="h-full flex flex-col p-6 lg:p-10">
          <div className="shrink-0 mb-5">
            <h2 className="text-2xl lg:text-3xl font-bold text-foreground">{t('rwaCollateral.heading')}</h2>
            <p className="text-muted-foreground text-sm mt-1">{t('rwaCollateral.subtitle')}</p>
          </div>
          <div className="flex-1 min-h-0 grid grid-cols-3 gap-4 content-center">
            {rwaCollateralCards.map((c, i) => (
              <div key={i} className="p-4 bg-card border rounded-xl flex flex-col gap-2"
                style={{ borderColor: rwaCollateralColors[i] + '30' }}>
                <div className="text-3xl">{rwaCollateralEmojis[i]}</div>
                <div className="font-bold text-sm" style={{ color: rwaCollateralColors[i] }}>{c.title}</div>
                <div className="text-xs text-muted-foreground leading-snug">{c.desc}</div>
              </div>
            ))}
          </div>
        </div>

        {/* RWA: Property */}
        <div id="s3-rwa-property" className="h-full flex flex-col p-6 lg:p-10">
          <div className="shrink-0 mb-5">
            <h2 className="text-2xl lg:text-3xl font-bold text-foreground">{t('rwaProperty.heading')}</h2>
            <p className="text-muted-foreground text-sm mt-1">{t('rwaProperty.subtitle')}</p>
          </div>
          <div className="flex-1 min-h-0 grid grid-cols-3 gap-4 content-center">
            <div className="p-4 bg-card border border-[#39B54A]/30 rounded-xl flex flex-col gap-2">
              <div className="text-xs font-bold text-[#39B54A] uppercase tracking-widest">{t('rwaProperty.sweden.country')}</div>
              <div className="font-black text-foreground text-sm">{t('rwaProperty.sweden.title')}</div>
              <p className="text-xs text-muted-foreground leading-relaxed flex-1">
                {t('rwaProperty.sweden.bodyA')}<span className="font-semibold text-foreground">{t('rwaProperty.sweden.bodyStrong')}</span>{t('rwaProperty.sweden.bodyB')}
              </p>
              <div className="p-2 bg-[#39B54A]/10 rounded-lg text-[10px] text-muted-foreground">
                <span className="font-bold text-[#39B54A]">{t('rwaProperty.sweden.badgeStrong')}</span>{t('rwaProperty.sweden.badgeRest')}
              </div>
            </div>
            <div className="p-4 bg-card border border-[#6366f1]/30 rounded-xl flex flex-col gap-2">
              <div className="text-xs font-bold text-[#6366f1] uppercase tracking-widest">{t('rwaProperty.frankfurt.country')}</div>
              <div className="font-black text-foreground text-sm">{t('rwaProperty.frankfurt.title')}</div>
              <p className="text-xs text-muted-foreground leading-relaxed flex-1">
                {t('rwaProperty.frankfurt.bodyA')}<span className="font-semibold text-foreground">{t('rwaProperty.frankfurt.bodyStrong')}</span>{t('rwaProperty.frankfurt.bodyB')}
              </p>
              <div className="p-2 bg-[#6366f1]/10 rounded-lg text-[10px] text-muted-foreground">
                <span className="font-bold text-[#6366f1]">{t('rwaProperty.frankfurt.badgeStrong')}</span>{t('rwaProperty.frankfurt.badgeRest')}
              </div>
            </div>
            <div className="p-4 bg-card border border-[#8b5cf6]/30 rounded-xl flex flex-col gap-2">
              <div className="text-xs font-bold text-[#8b5cf6] uppercase tracking-widest">{t('rwaProperty.switzerland.country')}</div>
              <div className="font-black text-foreground text-sm">{t('rwaProperty.switzerland.title')}</div>
              <p className="text-xs text-muted-foreground leading-relaxed flex-1">
                {t('rwaProperty.switzerland.body')}
              </p>
              <div className="p-2 bg-[#8b5cf6]/10 rounded-lg text-[10px] text-muted-foreground">
                <span className="font-bold text-[#8b5cf6]">{t('rwaProperty.switzerland.badgeStrong')}</span>{t('rwaProperty.switzerland.badgeRest')}
              </div>
            </div>
          </div>
          <div className="shrink-0 mt-4 p-3 rounded-xl border border-[#22d3ee]/30 bg-[#22d3ee]/06 text-xs text-muted-foreground">
            <span className="font-bold text-[#22d3ee]">{t('rwaProperty.micaLabel')}</span>{t('rwaProperty.micaBody')}
          </div>
        </div>

        {/* RWA: Pros / Cons */}
        <div id="s3-rwa-prosCons" className="h-full">
          <ProsConsSlide
            title={t('rwaProsCons.title')}
            accent="#39B54A"
            pros={rwaPros}
            cons={rwaCons}
          />
        </div>

        {/* ═══════════════════════════════════════════════════════════ */}
        {/* Supply Chain vertical                                       */}
        {/* ═══════════════════════════════════════════════════════════ */}

        <div id="s3-sc-intro" className="h-full">
          <VerticalDivider
            emoji="🚚"
            title={t('scDivider.title')}
            subtitle={t('scDivider.subtitle')}
            color="#f59e0b"
            image={imgSupplyProv}
          />
        </div>

        {/* Supply Chain: Provenance (interactive QR scan) */}
        <div id="s3-sc-provenance" className="h-full">
          <ProvenanceQR />
        </div>

        {/* Supply Chain: LVMH + Carrefour real-world */}
        <div id="s3-sc-prov-real" className="h-full flex flex-col p-6 lg:p-10">
          <div className="shrink-0 mb-5">
            <h2 className="text-2xl lg:text-3xl font-bold text-foreground">{t('scProvReal.heading')}</h2>
            <p className="text-muted-foreground text-base mt-1">{t('scProvReal.subtitle')}</p>
          </div>
          <div className="flex-1 min-h-0 grid grid-cols-2 gap-5 grid-rows-1">
            <div className="p-5 bg-gradient-to-br from-[#f59e0b]/10 to-transparent border border-[#f59e0b]/30 rounded-xl flex flex-col gap-3 justify-center">
              <div className="flex items-center gap-2">
                <span className="text-2xl">👜</span>
                <div>
                  <div className="font-black text-base text-foreground">{t('scProvReal.lvmhTitle')}</div>
                  <div className="text-sm text-[#f59e0b]">{t('scProvReal.lvmhTag')}</div>
                </div>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {t('scProvReal.lvmhBodyA')}<span className="font-semibold text-foreground">{t('scProvReal.lvmhBodyStrong')}</span>{t('scProvReal.lvmhBodyB')}
              </p>
              <div className="p-2 bg-[#f59e0b]/10 rounded-lg text-sm text-muted-foreground mt-auto">
                <span className="font-semibold text-foreground">{t('scProvReal.lvmhGoalLabel')}</span>{t('scProvReal.lvmhGoalBody')}
              </div>
            </div>
            <div className="p-5 bg-gradient-to-br from-[#39B54A]/10 to-transparent border border-[#39B54A]/30 rounded-xl flex flex-col gap-3 justify-center">
              <div className="flex items-center gap-2">
                <span className="text-2xl">🐔</span>
                <div>
                  <div className="font-black text-base text-foreground">{t('scProvReal.carrefourTitle')}</div>
                  <div className="text-sm text-[#39B54A]">{t('scProvReal.carrefourTag')}</div>
                </div>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {t('scProvReal.carrefourBody')}
              </p>
              <div className="p-2 bg-[#39B54A]/10 rounded-lg text-sm text-muted-foreground mt-auto">
                {t('scProvReal.carrefourFootnote')}
              </div>
            </div>
          </div>
          <UnderTheHood terms={['permissioned ledger', 'hash anchoring', 'IoT oracle', 'NFC / QR']} className="shrink-0 mt-3" />
        </div>

        {/* Supply Chain: Shipping */}
        <div id="s3-sc-shipping" className="h-full flex flex-col p-6 lg:p-10">
          <div className="shrink-0 mb-5">
            <h2 className="text-2xl lg:text-3xl font-bold text-foreground">{t('scShipping.heading')}</h2>
            <p className="text-muted-foreground text-base mt-1">{t('scShipping.subtitle')}</p>
          </div>
          <div className="flex-1 min-h-0 grid grid-cols-2 gap-5 grid-rows-1">
            <div className="p-5 bg-card border border-[#ED1C24]/30 rounded-xl flex flex-col gap-3 justify-center">
              <div className="font-bold text-base text-[#ED1C24]">{t('scShipping.legacyTitle')}</div>
              <ul className="text-sm text-muted-foreground space-y-2 flex-1">
                {scLegacyPoints.map((item, i) => (
                  <li key={i} className="flex gap-2"><span className="text-[#ED1C24]">›</span>{item}</li>
                ))}
              </ul>
            </div>
            <div className="p-5 bg-gradient-to-br from-[#39B54A]/10 to-transparent border border-[#39B54A]/30 rounded-xl flex flex-col gap-3 justify-center">
              <div className="flex items-center gap-3">
                <img src={imgGsbnEbl} alt={t('scShipping.gsbnImgAlt')} className="hidden lg:block h-16 object-contain shrink-0" />
                <div>
                  <div className="font-black text-base text-foreground">{t('scShipping.gsbnTitle')}</div>
                  <div className="text-sm text-[#39B54A]">{t('scShipping.gsbnTag')}</div>
                </div>
              </div>
              <ul className="text-sm text-muted-foreground space-y-2 flex-1">
                {gsbnPoints.map((p, i) => (
                  <li key={i} className="flex gap-2"><span className="text-[#39B54A]">›</span>{p.a}{p.strong && <span className="font-semibold text-foreground">{p.strong}</span>}{p.b}</li>
                ))}
              </ul>
              <div className="p-2 bg-[#39B54A]/10 rounded-lg text-sm text-muted-foreground mt-auto">
                {t('scShipping.gsbnFootnoteA')}<span className="font-semibold text-foreground">{t('scShipping.gsbnFootnoteStrong')}</span>{t('scShipping.gsbnFootnoteB')}
              </div>
            </div>
          </div>
        </div>

        {/* Supply Chain: Pros / Cons */}
        <div id="s3-sc-prosCons" className="h-full">
          <ProsConsSlide
            title={t('scProsCons.title')}
            accent="#f59e0b"
            pros={scPros}
            cons={scCons}
          />
        </div>

        {/* ═══════════════════════════════════════════════════════════ */}
        {/* Digital Certification vertical                              */}
        {/* ═══════════════════════════════════════════════════════════ */}

        <div id="s3-cert-intro" className="h-full">
          <VerticalDivider
            emoji="📜"
            title={t('certDivider.title')}
            subtitle={t('certDivider.subtitle')}
            color="#22d3ee"
            image={imgCertDecent}
          />
        </div>

        {/* Cert: Interactive proof-of-existence */}
        <div id="s3-cert-howitworks" className="h-full">
          <ProofOfExistenceDemo />
        </div>

        {/* Cert: Estonia */}
        <div id="s3-cert-law" className="h-full flex flex-col p-6 lg:p-10">
          <div className="shrink-0 mb-5">
            <h2 className="text-2xl lg:text-3xl font-bold text-foreground">{t('certLaw.heading')}</h2>
            <p className="text-muted-foreground text-base mt-1">{t('certLaw.subtitle')}</p>
          </div>
          <div className="flex-1 min-h-0 grid grid-cols-2 gap-5 grid-rows-1">
            <div className="p-5 bg-card border border-[#22d3ee]/30 rounded-xl flex flex-col gap-3 justify-center">
              <div className="font-bold text-base text-[#22d3ee]">{t('certLaw.whatTitle')}</div>
              <ul className="text-sm text-muted-foreground space-y-2 flex-1">
                {certWhatPoints.map((p, i) => (
                  <li key={i} className="flex gap-2"><span className="text-[#22d3ee]">›</span>{p.a}{p.strong && <span className="font-semibold text-foreground">{p.strong}</span>}{p.b}</li>
                ))}
              </ul>
            </div>
            <div className="p-5 bg-gradient-to-br from-[#22d3ee]/10 to-transparent border border-[#22d3ee]/30 rounded-xl flex flex-col gap-3 justify-center">
              <div className="font-bold text-base text-[#22d3ee]">{t('certLaw.principleTitle')}</div>
              <p className="text-sm text-muted-foreground leading-relaxed italic border-l-2 border-[#22d3ee] pl-3">
                {t('certLaw.principleQuote')}
              </p>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {t('certLaw.principleBody')}
              </p>
              <div className="p-2 bg-[#22d3ee]/10 rounded-lg text-sm text-muted-foreground mt-auto">
                <span className="font-semibold text-foreground">{t('certLaw.whyLabel')}</span>{t('certLaw.whyBodyA')}<span className="italic">{t('certLaw.whyBodyEmphasis')}</span>{t('certLaw.whyBodyB')}
              </div>
            </div>
          </div>
          <UnderTheHood terms={['hash chain', 'KSI', 'Merkle tree', 'timestamping']} className="shrink-0 mt-3" />
        </div>

        {/* Cert: Education */}
        <div id="s3-cert-education" className="h-full flex flex-col p-6 lg:p-10">
          <div className="shrink-0 mb-5">
            <h2 className="text-2xl lg:text-3xl font-bold text-foreground">{t('certEducation.heading')}</h2>
            <p className="text-muted-foreground text-base mt-1">{t('certEducation.subtitle')}</p>
          </div>
          <div className="flex-1 min-h-0 grid grid-cols-2 gap-5 grid-rows-1">
            <div className="p-5 bg-card border border-[#22d3ee]/30 rounded-xl flex flex-col gap-3 justify-center">
              <div className="font-bold text-base text-[#22d3ee]">{t('certEducation.problemTitle')}</div>
              <ul className="text-sm text-muted-foreground space-y-2 flex-1">
                {certEduProblem.map((item, i) => (
                  <li key={i} className="flex gap-2"><span className="text-[#22d3ee]">›</span>{item}</li>
                ))}
              </ul>
            </div>
            <div className="p-5 bg-gradient-to-br from-[#22d3ee]/10 to-transparent border border-[#22d3ee]/30 rounded-xl flex flex-col gap-3 justify-center">
              <div className="flex items-center gap-2">
                <span className="text-2xl">🎓</span>
                <div>
                  <div className="font-black text-base text-foreground">{t('certEducation.mitTitle')}</div>
                  <div className="text-sm text-[#22d3ee]">{t('certEducation.mitTag')}</div>
                </div>
              </div>
              <ul className="text-sm text-muted-foreground space-y-2 flex-1">
                {certMitPoints.map((p, i) => (
                  <li key={i} className="flex gap-2"><span className="text-[#22d3ee]">›</span>{p.a}{p.strong && <span className="font-semibold text-foreground">{p.strong}</span>}{p.b}</li>
                ))}
              </ul>
              <div className="p-2 bg-[#22d3ee]/10 rounded-lg text-sm text-muted-foreground mt-auto">
                {t('certEducation.footnote')}
              </div>
            </div>
          </div>
        </div>

        {/* Cert: Products */}
        <div id="s3-cert-products" className="h-full flex flex-col p-6 lg:p-10">
          <div className="shrink-0 mb-5">
            <h2 className="text-2xl lg:text-3xl font-bold text-foreground">{t('certProducts.heading')}</h2>
            <p className="text-muted-foreground text-base mt-1">{t('certProducts.subtitle')}</p>
          </div>
          <div className="flex-1 min-h-0 grid grid-cols-2 gap-5 grid-rows-1">
            <div className="p-5 bg-card border border-[#8b5cf6]/30 rounded-xl flex flex-col gap-3 justify-center">
              <div className="font-bold text-base text-[#8b5cf6]">{t('certProducts.howTitle')}</div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {t('certProducts.howBody')}
              </p>
              <ul className="text-sm text-muted-foreground space-y-1.5 mt-1">
                {certProductsPoints.map((item, i) => (
                  <li key={i} className="flex gap-1.5"><span className="text-[#8b5cf6]">›</span>{item}</li>
                ))}
              </ul>
            </div>
            <div className="p-5 bg-gradient-to-br from-[#8b5cf6]/10 to-transparent border border-[#8b5cf6]/30 rounded-xl flex flex-col gap-3 justify-center">
              <div className="flex items-center gap-2">
                <span className="text-2xl">💎</span>
                <div>
                  <div className="font-black text-base text-foreground">{t('certProducts.auraTitle')}</div>
                  <div className="text-sm text-[#8b5cf6]">{t('certProducts.auraTag')}</div>
                </div>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {t('certProducts.auraBody')}
              </p>
              <div className="p-2 bg-[#8b5cf6]/10 rounded-lg text-sm text-muted-foreground mt-auto">
                {t('certProducts.auraFootnote')}
              </div>
            </div>
          </div>
        </div>

        {/* Cert: Pros / Cons */}
        <div id="s3-cert-prosCons" className="h-full">
          <ProsConsSlide
            title={t('certProsCons.title')}
            accent="#22d3ee"
            pros={certPros}
            cons={certCons}
          />
        </div>

        {/* ═══════════════════════════════════════════════════════════ */}
        {/* Cross-industry Case Studies                                 */}
        {/* ═══════════════════════════════════════════════════════════ */}

        <div id="s3-cases-intro" className="h-full">
          <VerticalDivider
            emoji="📁"
            title={t('casesDivider.title')}
            subtitle={t('casesDivider.subtitle')}
            color="#6366f1"
          />
        </div>

        {/* ═══════ CASE STUDY 1 — HOME DEPOT ═══════ */}
        <div id="s3-homedepot" className="h-full flex flex-col p-6 lg:p-10">
          <div className="shrink-0 mb-1">
            <div className="text-xs font-bold text-[#f59e0b] uppercase tracking-widest mb-1">{t('homedepot.kicker')}</div>
            <h2 className="text-2xl lg:text-3xl font-bold text-foreground">{t('homedepot.heading')}</h2>
            <p className="text-muted-foreground text-sm mt-1">{t('homedepot.subtitle')}</p>
          </div>

          <div className="flex-1 min-h-0 grid grid-cols-3 gap-4 content-center mt-4">

            {/* Problem */}
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-2">
                <div className="size-7 rounded-lg bg-[#ED1C24] flex items-center justify-center text-white text-xs font-black shrink-0">01</div>
                <div className="text-xs font-bold text-[#ED1C24] uppercase tracking-widest">{t('common.theProblem')}</div>
              </div>
              <div className="flex-1 p-4 bg-gradient-to-br from-[#ED1C24]/10 to-transparent border border-[#ED1C24]/30 rounded-xl flex flex-col gap-3">
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {t('homedepot.problemBodyA')}<span className="text-foreground font-semibold">{t('homedepot.problemBodyStrong')}</span>{t('homedepot.problemBodyB')}
                </p>
                <ul className="space-y-2">
                  {homedepotProblem.map((p, i) => (
                    <li key={i} className="flex gap-2 text-xs text-muted-foreground">
                      <span className="text-[#ED1C24] shrink-0 mt-0.5">✗</span>{p}
                    </li>
                  ))}
                </ul>
                <div className="mt-auto p-2 bg-[#ED1C24]/10 rounded-lg text-xs text-center">
                  <span className="font-bold text-[#ED1C24]">{t('homedepot.problemCostLabel')}</span> <span className="text-muted-foreground">{t('homedepot.problemCostBody')}</span>
                </div>
              </div>
            </div>

            {/* Solution */}
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-2">
                <div className="size-7 rounded-lg bg-[#6366f1] flex items-center justify-center text-white text-xs font-black shrink-0">02</div>
                <div className="text-xs font-bold text-[#6366f1] uppercase tracking-widest">{t('common.theSolution')}</div>
              </div>
              <div className="flex-1 p-4 bg-gradient-to-br from-[#6366f1]/10 to-transparent border border-[#6366f1]/30 rounded-xl flex flex-col gap-3">
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {t('homedepot.solutionBodyA')}<span className="text-foreground font-semibold">{t('homedepot.solutionBodyStrong')}</span>{t('homedepot.solutionBodyB')}
                </p>
                <ul className="space-y-2">
                  {homedepotSolution.map((s, i) => (
                    <li key={i} className="flex gap-2 text-xs text-muted-foreground">
                      <span className="text-[#6366f1] shrink-0 mt-0.5">›</span>{s}
                    </li>
                  ))}
                </ul>
                <div className="mt-auto p-2 bg-[#6366f1]/10 rounded-lg text-xs text-center font-mono">
                  {t('homedepot.solutionFlow')}
                </div>
              </div>
            </div>

            {/* Results */}
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-2">
                <div className="size-7 rounded-lg bg-[#39B54A] flex items-center justify-center text-white text-xs font-black shrink-0">03</div>
                <div className="text-xs font-bold text-[#39B54A] uppercase tracking-widest">{t('common.theResults')}</div>
              </div>
              <div className="flex-1 p-4 bg-gradient-to-br from-[#39B54A]/10 to-transparent border border-[#39B54A]/30 rounded-xl flex flex-col gap-3">
                <div className="grid grid-cols-1 gap-3">
                  {homedepotResults.map((r, i) => (
                    <div key={i} className="p-3 bg-card border border-border rounded-xl">
                      <div className="font-black text-sm" style={{ color: homedepotResultColors[i] }}>{r.metric}</div>
                      <div className="text-xs text-muted-foreground">{r.label}</div>
                    </div>
                  ))}
                </div>
                <div className="mt-auto p-2 bg-[#39B54A]/10 rounded-lg">
                  <div className="text-xs text-muted-foreground">
                    <span className="font-semibold text-foreground">{t('homedepot.platformLabel')}</span>{t('homedepot.platformBody')}
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* ═══════ CASE STUDY 2 — PROPY ═══════ */}
        <div id="s3-realestate" className="h-full flex flex-col p-6 lg:p-10">
          <div className="shrink-0 mb-1">
            <div className="text-xs font-bold text-[#8b5cf6] uppercase tracking-widest mb-1">{t('propy.kicker')}</div>
            <h2 className="text-2xl lg:text-3xl font-bold text-foreground">{t('propy.heading')}</h2>
            <p className="text-muted-foreground text-sm mt-1">{t('propy.subtitle')}</p>
          </div>

          <div className="flex-1 min-h-0 grid grid-cols-3 gap-4 content-center mt-4">

            {/* Problem */}
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-2">
                <div className="size-7 rounded-lg bg-[#ED1C24] flex items-center justify-center text-white text-xs font-black shrink-0">01</div>
                <div className="text-xs font-bold text-[#ED1C24] uppercase tracking-widest">{t('common.theProblem')}</div>
              </div>
              <div className="flex-1 p-4 bg-gradient-to-br from-[#ED1C24]/10 to-transparent border border-[#ED1C24]/30 rounded-xl flex flex-col gap-3">
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {t('propy.problemBodyA')}<span className="text-foreground font-semibold">{t('propy.problemBodyStrong')}</span>{t('propy.problemBodyB')}
                </p>
                <ul className="space-y-2">
                  {propyProblem.map((p, i) => (
                    <li key={i} className="flex gap-2 text-xs text-muted-foreground">
                      <span className="text-[#ED1C24] shrink-0 mt-0.5">✗</span>{p}
                    </li>
                  ))}
                </ul>
                <div className="mt-auto p-2 bg-[#ED1C24]/10 rounded-lg text-xs text-center">
                  <span className="font-bold text-[#ED1C24]">{t('propy.problemCostLabel')}</span> <span className="text-muted-foreground">{t('propy.problemCostBody')}</span>
                </div>
              </div>
            </div>

            {/* Solution */}
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-2">
                <div className="size-7 rounded-lg bg-[#8b5cf6] flex items-center justify-center text-white text-xs font-black shrink-0">02</div>
                <div className="text-xs font-bold text-[#8b5cf6] uppercase tracking-widest">{t('common.theSolution')}</div>
              </div>
              <div className="flex-1 p-4 bg-gradient-to-br from-[#8b5cf6]/10 to-transparent border border-[#8b5cf6]/30 rounded-xl flex flex-col gap-3">
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {t('propy.solutionBodyA')}<span className="text-foreground font-semibold">{t('propy.solutionBodyStrong')}</span>{t('propy.solutionBodyB')}
                </p>
                <ul className="space-y-2">
                  {propySolution.map((s, i) => (
                    <li key={i} className="flex gap-2 text-xs text-muted-foreground">
                      <span className="text-[#8b5cf6] shrink-0 mt-0.5">›</span>{s}
                    </li>
                  ))}
                </ul>
                <div className="mt-auto p-2 bg-[#8b5cf6]/10 rounded-lg text-xs text-center font-mono">
                  {t('propy.solutionFlow')}
                </div>
              </div>
            </div>

            {/* Results */}
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-2">
                <div className="size-7 rounded-lg bg-[#39B54A] flex items-center justify-center text-white text-xs font-black shrink-0">03</div>
                <div className="text-xs font-bold text-[#39B54A] uppercase tracking-widest">{t('common.theResults')}</div>
              </div>
              <div className="flex-1 p-4 bg-gradient-to-br from-[#39B54A]/10 to-transparent border border-[#39B54A]/30 rounded-xl flex flex-col gap-3">
                <div className="grid grid-cols-1 gap-3">
                  {propyResults.map((r, i) => (
                    <div key={i} className="p-3 bg-card border border-border rounded-xl">
                      <div className="font-black text-sm" style={{ color: propyResultColors[i] }}>{r.metric}</div>
                      <div className="text-xs text-muted-foreground">{r.label}</div>
                    </div>
                  ))}
                </div>
                <div className="mt-auto p-2 bg-[#39B54A]/10 rounded-lg text-xs text-muted-foreground">
                  <span className="font-semibold text-foreground">{t('propy.caveatLabel')}</span>{t('propy.caveatBody')}
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* ═══════ CASE STUDY 3 — CALIFORNIA DMV ═══════ */}
        <div id="s3-dmv" className="h-full flex flex-col p-6 lg:p-10">
          <div className="shrink-0 mb-1">
            <div className="text-xs font-bold text-[#22d3ee] uppercase tracking-widest mb-1">{t('dmv.kicker')}</div>
            <h2 className="text-2xl lg:text-3xl font-bold text-foreground">{t('dmv.heading')}</h2>
            <p className="text-muted-foreground text-sm mt-1">{t('dmv.subtitle')}</p>
          </div>

          <div className="flex-1 min-h-0 grid grid-cols-3 gap-4 content-center mt-4">

            {/* Problem */}
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-2">
                <div className="size-7 rounded-lg bg-[#ED1C24] flex items-center justify-center text-white text-xs font-black shrink-0">01</div>
                <div className="text-xs font-bold text-[#ED1C24] uppercase tracking-widest">{t('common.theProblem')}</div>
              </div>
              <div className="flex-1 p-4 bg-gradient-to-br from-[#ED1C24]/10 to-transparent border border-[#ED1C24]/30 rounded-xl flex flex-col gap-3">
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {t('dmv.problemBodyA')}<span className="text-foreground font-semibold">{t('dmv.problemBodyStrong')}</span>{t('dmv.problemBodyB')}
                </p>
                <ul className="space-y-2">
                  {dmvProblem.map((p, i) => (
                    <li key={i} className="flex gap-2 text-xs text-muted-foreground">
                      <span className="text-[#ED1C24] shrink-0 mt-0.5">✗</span>{p}
                    </li>
                  ))}
                </ul>
                <div className="mt-auto p-2 bg-[#ED1C24]/10 rounded-lg text-xs text-center">
                  <span className="font-bold text-[#ED1C24]">{t('dmv.problemScaleLabel')}</span> <span className="text-muted-foreground">{t('dmv.problemScaleBody')}</span>
                </div>
              </div>
            </div>

            {/* Solution */}
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-2">
                <div className="size-7 rounded-lg bg-[#22d3ee] flex items-center justify-center text-white text-xs font-black shrink-0">02</div>
                <div className="text-xs font-bold text-[#22d3ee] uppercase tracking-widest">{t('common.theSolution')}</div>
              </div>
              <div className="flex-1 p-4 bg-gradient-to-br from-[#22d3ee]/10 to-transparent border border-[#22d3ee]/30 rounded-xl flex flex-col gap-3">
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {t('dmv.solutionBodyA')}<span className="text-foreground font-semibold">{t('dmv.solutionBodyStrong1')}</span>{t('dmv.solutionBodyB')}<span className="text-foreground font-semibold">{t('dmv.solutionBodyStrong2')}</span>{t('dmv.solutionBodyC')}
                </p>
                <ul className="space-y-2">
                  {dmvSolution.map((s, i) => (
                    <li key={i} className="flex gap-2 text-xs text-muted-foreground">
                      <span className="text-[#22d3ee] shrink-0 mt-0.5">›</span>{s}
                    </li>
                  ))}
                </ul>
                <div className="mt-auto p-2 bg-[#22d3ee]/10 rounded-lg text-xs text-center font-mono">
                  {t('dmv.solutionFlow')}
                </div>
              </div>
            </div>

            {/* Results */}
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-2">
                <div className="size-7 rounded-lg bg-[#39B54A] flex items-center justify-center text-white text-xs font-black shrink-0">03</div>
                <div className="text-xs font-bold text-[#39B54A] uppercase tracking-widest">{t('common.theResults')}</div>
              </div>
              <div className="flex-1 p-4 bg-gradient-to-br from-[#39B54A]/10 to-transparent border border-[#39B54A]/30 rounded-xl flex flex-col gap-3">
                <div className="grid grid-cols-1 gap-3">
                  {dmvResults.map((r, i) => (
                    <div key={i} className="p-3 bg-card border border-border rounded-xl">
                      <div className="font-black text-sm" style={{ color: dmvResultColors[i] }}>{r.metric}</div>
                      <div className="text-xs text-muted-foreground">{r.label}</div>
                    </div>
                  ))}
                </div>
                <div className="mt-auto p-2 bg-[#39B54A]/10 rounded-lg">
                  <div className="text-xs text-muted-foreground">
                    <span className="font-semibold text-foreground">{t('dmv.takeawayLabel')}</span>{t('dmv.takeawayBody')}
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* ═══════ CASE STUDY — WALMART FOOD TRUST ═══════ */}
        <div id="s3-walmart" className="h-full flex flex-col p-6 lg:p-10">
          <div className="shrink-0 mb-1 flex items-start gap-4">
            <img src={imgWalmart} alt={t('walmart.imgAlt')} className="hidden lg:block h-24 rounded-lg object-cover shrink-0" />
            <div>
              <div className="text-xs font-bold text-[#39B54A] uppercase tracking-widest mb-1">{t('walmart.kicker')}</div>
              <h2 className="text-2xl lg:text-3xl font-bold text-foreground">{t('walmart.heading')}</h2>
              <p className="text-muted-foreground text-sm mt-1">{t('walmart.subtitle')}</p>
            </div>
          </div>
          <div className="flex-1 min-h-0 grid grid-cols-3 gap-4 content-center mt-4">
            <div className="p-4 bg-gradient-to-br from-[#ED1C24]/10 to-transparent border border-[#ED1C24]/30 rounded-xl flex flex-col gap-2">
              <div className="text-xs font-bold text-[#ED1C24] uppercase tracking-widest">{t('walmart.problemTitle')}</div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {t('walmart.problemBodyA')}<span className="font-semibold text-foreground">{t('walmart.problemBodyStrong')}</span>{t('walmart.problemBodyB')}
              </p>
              <ul className="text-xs text-muted-foreground space-y-1.5 mt-1">
                {walmartProblem.map((item, i) => (
                  <li key={i} className="flex gap-1.5"><span className="text-[#ED1C24]">›</span>{item}</li>
                ))}
              </ul>
            </div>
            <div className="p-4 bg-gradient-to-br from-[#6366f1]/10 to-transparent border border-[#6366f1]/30 rounded-xl flex flex-col gap-2">
              <div className="text-xs font-bold text-[#6366f1] uppercase tracking-widest">{t('walmart.solutionTitle')}</div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                <span className="font-semibold text-foreground">{t('walmart.solutionBodyStrong1')}</span>{t('walmart.solutionBodyMid')}<span className="font-semibold text-foreground">{t('walmart.solutionBodyStrong2')}</span>{t('walmart.solutionBodyEnd')}
              </p>
              <ul className="text-xs text-muted-foreground space-y-1.5 mt-1">
                {walmartSolution.map((item, i) => (
                  <li key={i} className="flex gap-1.5"><span className="text-[#6366f1]">›</span>{item}</li>
                ))}
              </ul>
            </div>
            <div className="p-4 bg-gradient-to-br from-[#39B54A]/10 to-transparent border border-[#39B54A]/30 rounded-xl flex flex-col gap-2">
              <div className="text-xs font-bold text-[#39B54A] uppercase tracking-widest">{t('walmart.resultsTitle')}</div>
              <div className="grid grid-cols-1 gap-2">
                {walmartResults.map((r, i) => (
                  <div key={i} className="p-2 bg-card border border-border rounded-lg">
                    <div className="font-mono font-black text-base text-[#39B54A]">{r.metric}</div>
                    <div className="text-[10px] text-muted-foreground">{r.label}</div>
                  </div>
                ))}
              </div>
              <div className="text-xs text-muted-foreground p-2 bg-[#39B54A]/10 rounded-lg mt-auto">
                <span className="font-semibold text-foreground">{t('walmart.whyLabel')}</span>{t('walmart.whyBody')}
              </div>
            </div>
          </div>
        </div>

        {/* ═══════ CASE STUDY — SANTANDER BOND ═══════ */}
        <div id="s3-santander" className="h-full flex flex-col p-6 lg:p-10">
          <div className="shrink-0 mb-1 flex items-start gap-4">
            <img src={imgSantander} alt={t('santander.imgAlt')} className="hidden lg:block h-24 rounded-lg object-cover shrink-0" />
            <div>
              <div className="text-xs font-bold text-[#6366f1] uppercase tracking-widest mb-1">{t('santander.kicker')}</div>
              <h2 className="text-2xl lg:text-3xl font-bold text-foreground">{t('santander.heading')}</h2>
              <p className="text-muted-foreground text-sm mt-1">{t('santander.subtitle')}</p>
            </div>
          </div>
          <div className="flex-1 min-h-0 grid grid-cols-3 gap-4 content-center mt-4">
            <div className="p-4 bg-gradient-to-br from-[#6366f1]/10 to-transparent border border-[#6366f1]/30 rounded-xl flex flex-col gap-2">
              <div className="text-xs font-bold text-[#6366f1] uppercase tracking-widest">{t('santander.backgroundTitle')}</div>
              <ul className="text-xs text-muted-foreground space-y-1.5">
                {santanderBackground.map((p, i) => (
                  <li key={i} className="flex gap-1.5"><span className="text-[#6366f1]">›</span>{p.a}{p.strong && <span className="font-semibold text-foreground">{p.strong}</span>}{p.b}</li>
                ))}
              </ul>
              <p className="text-xs text-muted-foreground italic border-l-2 border-[#6366f1] pl-2 mt-1">
                {t('santander.backgroundQuote')}
              </p>
            </div>
            <div className="p-4 bg-gradient-to-br from-[#8b5cf6]/10 to-transparent border border-[#8b5cf6]/30 rounded-xl flex flex-col gap-2">
              <div className="text-xs font-bold text-[#8b5cf6] uppercase tracking-widest">{t('santander.whyTitle')}</div>
              <ul className="text-xs text-muted-foreground space-y-1.5">
                {santanderWhy.map((item, i) => (
                  <li key={i} className="flex gap-1.5"><span className="text-[#8b5cf6]">›</span>{item}</li>
                ))}
              </ul>
            </div>
            <div className="p-4 bg-gradient-to-br from-[#39B54A]/10 to-transparent border border-[#39B54A]/30 rounded-xl flex flex-col gap-2">
              <div className="text-xs font-bold text-[#39B54A] uppercase tracking-widest">{t('santander.benefitsTitle')}</div>
              <div className="grid grid-cols-1 gap-2">
                {santanderBenefits.map((r, i) => (
                  <div key={i} className="p-2 bg-card border border-border rounded-lg">
                    <div className="font-mono font-black text-base text-[#39B54A]">{r.metric}</div>
                    <div className="text-[10px] text-muted-foreground">{r.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ═══════ CASE STUDY — TRADELENS (SHUT DOWN) ═══════ */}
        <div id="s3-tradelens" className="h-full"><TradeLensCase /></div>

        {/* ═══════ EXERCISE: DESIGN YOUR OWN ═══════ */}
        <div id="s3-exercise" className="h-full">
          <DesignYourOwnExercise />
        </div>

        {/* ═══════ QUIZ ═══════ */}
        <div id="s3-quiz" className="h-full">
          <QuizSlide
            question={t('quiz.question')}
            options={quizOptionTexts.map((text, i) => ({ text, correct: i === 1 }))}
            explanation={t('quiz.explanation')}
          />
        </div>

        <div id="s3-takeaways" className="h-full">
          <TakeawaySlide
            title={t('takeaways.title')}
            takeaways={takeawayItems}
          />
        </div>

        {/* ═══════ SUMMARY ═══════ */}
        <div id="s3-summary" className="h-full flex flex-col p-6 lg:p-10">
          <div className="shrink-0 mb-5">
            <h2 className="text-2xl lg:text-3xl font-bold text-foreground">{t('summary.heading')}</h2>
            <p className="text-sm text-muted-foreground mt-1">{t('summary.subtitle')}</p>
          </div>
          <div className="flex-1 min-h-0 grid grid-cols-4 gap-3 content-start">
            {summaryCards.map((card, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.05, duration: 0.3 }}
                className="flex flex-col gap-2 p-3 rounded-xl border bg-card"
                style={{ borderColor: summaryMeta[i].color + '30' }}
              >
                <div className="text-2xl">{summaryMeta[i].icon}</div>
                <div className="font-bold text-xs text-foreground">{card.title}</div>
                <div className="text-[11px] text-muted-foreground leading-snug">{card.summary}</div>
              </motion.div>
            ))}
          </div>
          <div className="shrink-0 mt-3 p-3 rounded-xl border border-border bg-card/50 text-center">
            <span className="text-xs text-muted-foreground">{t('summary.footer')}</span>
          </div>
        </div>

        </div>
        <SiteFooter className="snap-start" />
      </div>
    </div>
  );
}
