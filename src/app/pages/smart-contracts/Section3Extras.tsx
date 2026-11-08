import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'motion/react';
import { Check, X, KeyRound } from 'lucide-react';
import { UnderTheHood } from '../../components/shared/UnderTheHood';
import { KeyPointBar } from '../../components/shared/KeyPointBar';

// Section 3 — NFT Utility & DAO applications block + TradeLens failure case.
// Text lives in smart-contracts/section-3.json; this file holds layout + language-neutral data.

const NS = 'smart-contracts/section-3';

// ─── NFTs beyond art ─────────────────────────────────────────────────────────

const UTILITY_META = [
  { emoji: '🪪', color: '#8b5cf6' },
  { emoji: '🔐', color: '#6366f1' },
  { emoji: '🎟️', color: '#f59e0b' },
  { emoji: '🎓', color: '#22d3ee' },
  { emoji: '⌚', color: '#39B54A' },
  { emoji: '☕', color: '#ED1C24' },
];

interface UtilityCard { title: string; how: string; example: string; replaces: string; ended: boolean }

export function NftUtilitySlide() {
  const { t } = useTranslation(NS);
  const cards = t('nftUtility.cards', { returnObjects: true }) as UtilityCard[];
  return (
    <div className="h-full flex flex-col p-6 lg:p-10">
      <div className="shrink-0 mb-4">
        <h2 className="text-2xl lg:text-3xl font-bold text-foreground">{t('nftUtility.heading')}</h2>
        <p className="text-muted-foreground text-sm mt-1">{t('nftUtility.subtitle')}</p>
      </div>
      <div className="flex-1 min-h-0 grid grid-cols-3 gap-3 content-center">
        {cards.map((c, i) => {
          const m = UTILITY_META[i];
          return (
            <div key={c.title} className="p-3.5 bg-card border rounded-xl flex flex-col gap-1.5" style={{ borderColor: m.color + '40' }}>
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{m.emoji}</span>
                  <div className="font-bold text-sm text-foreground leading-tight">{c.title}</div>
                </div>
                {c.ended && <span className="shrink-0 text-[9px] font-bold uppercase tracking-widest px-1.5 py-0.5 rounded bg-[#ED1C24]/15 text-[#ED1C24]">{t('nftUtility.endedTag')}</span>}
              </div>
              <p className="text-xs text-muted-foreground leading-snug flex-1">{c.how}</p>
              <div className="text-[11px] text-foreground/90 leading-snug p-2 rounded-lg" style={{ backgroundColor: m.color + '12' }}>{c.example}</div>
              <div className="text-[10px] text-muted-foreground"><span className="font-semibold" style={{ color: m.color }}>{t('nftUtility.replacesLabel')}</span> {c.replaces}</div>
            </div>
          );
        })}
      </div>
      <div className="shrink-0 mt-3 flex items-center justify-between gap-4 flex-wrap pr-16">
        <div className="p-2.5 rounded-xl border border-[#8b5cf6]/30 text-xs text-muted-foreground flex-1" style={{ backgroundColor: '#8b5cf60f' }}>
          <span className="font-bold text-[#8b5cf6]">{t('nftUtility.patternLabel')}</span>{t('nftUtility.patternBody')}
        </div>
        <UnderTheHood terms={['ERC-721', 'ERC-1155', 'soulbound (ERC-5192)', 'tokenURI']} />
      </div>
      <KeyPointBar text={t('keyPoints.s3-nft-utility')} className="mt-3" />
    </div>
  );
}

// ─── Token gate demo ─────────────────────────────────────────────────────────

type WalletId = 'member' | 'wrong' | 'empty';
const WALLETS: { id: WalletId; color: string; balance: number }[] = [
  { id: 'member', color: '#39B54A', balance: 1 },
  { id: 'wrong',  color: '#f59e0b', balance: 0 },
  { id: 'empty',  color: '#9ca3af', balance: 0 },
];

export function TokenGateDemo() {
  const { t } = useTranslation(NS);
  const [wallet, setWallet] = useState<WalletId>('member');
  const [phase, setPhase] = useState(0); // 0 idle · 1 sign · 2 read · 3 decided
  const steps = t('nftGate.steps', { returnObjects: true }) as { label: string; desc: string }[];
  const w = WALLETS.find(x => x.id === wallet)!;

  useEffect(() => {
    if (phase === 0 || phase >= 3) return;
    const id = setTimeout(() => setPhase(p => p + 1), 700);
    return () => clearTimeout(id);
  }, [phase]);

  const granted = w.balance >= 1;
  const resultColor = phase < 3 ? '#6366f1' : granted ? '#39B54A' : '#ED1C24';
  const resultText = phase < 3 ? t('nftGate.idle') : granted ? t('nftGate.granted') : wallet === 'wrong' ? t('nftGate.deniedWrong') : t('nftGate.deniedEmpty');

  return (
    <div className="h-full flex flex-col p-6 lg:p-8">
      <div className="shrink-0 mb-3">
        <span className="px-2.5 py-0.5 rounded-full bg-[#8b5cf6]/15 border border-[#8b5cf6]/40 text-[#8b5cf6] text-xs font-bold">{t('interactiveBadge')}</span>
        <h2 className="text-2xl font-bold text-foreground mt-1">{t('nftGate.title')}</h2>
        <p className="text-muted-foreground text-sm">{t('nftGate.subtitle')}</p>
      </div>

      <div className="flex-1 min-h-0 grid grid-cols-[1fr_1.2fr] gap-5">
        {/* Wallets */}
        <div className="flex flex-col gap-3 justify-center">
          <div className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">{t('nftGate.walletsLabel')}</div>
          {WALLETS.map(x => {
            const active = x.id === wallet;
            return (
              <button key={x.id} onClick={() => { setWallet(x.id); setPhase(0); }}
                className="text-left p-3 rounded-xl border-2 flex items-center gap-3 transition-colors"
                style={{ borderColor: active ? x.color : 'var(--border)', backgroundColor: active ? x.color + '12' : 'var(--card)' }}>
                <div className="size-10 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: x.color + '20' }}>
                  <KeyRound className="size-5" style={{ color: x.color }} />
                </div>
                <div className="min-w-0">
                  <div className="font-bold text-sm text-foreground">{t(`nftGate.wallets.${x.id}.name`)}</div>
                  <div className="text-xs text-muted-foreground">{t(`nftGate.wallets.${x.id}.holds`)}</div>
                </div>
                <div className="ml-auto font-mono text-[10px] text-muted-foreground shrink-0">balanceOf = {x.balance}</div>
              </button>
            );
          })}
          <div className="flex gap-2 mt-1">
            <button onClick={() => setPhase(1)} disabled={phase !== 0}
              className="flex-1 px-4 py-2.5 rounded-xl bg-[#8b5cf6] text-white text-sm font-black hover:bg-[#8b5cf6]/90 disabled:opacity-40 transition-colors">
              {t('nftGate.enter')}
            </button>
            {phase === 3 && (
              <button onClick={() => setPhase(0)} className="px-3 py-2.5 rounded-xl bg-muted text-xs font-semibold text-muted-foreground hover:bg-muted/80 transition-colors">{t('nftGate.tryAnother')}</button>
            )}
          </div>
        </div>

        {/* Gate steps + door */}
        <div className="flex flex-col gap-3 min-h-0">
          <div className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">{t('nftGate.stepsLabel')}</div>
          <div className="flex flex-col gap-2">
            {steps.map((s, i) => {
              const reached = phase >= i + 1;
              const current = phase === i + 1 && phase < 3;
              return (
                <motion.div key={i} animate={{ opacity: reached ? 1 : 0.35 }}
                  className="flex items-start gap-3 p-3 rounded-xl border bg-card"
                  style={{ borderColor: reached ? '#8b5cf660' : 'var(--border)' }}>
                  <div className="size-7 rounded-full flex items-center justify-center text-xs font-black shrink-0 text-white"
                    style={{ backgroundColor: reached ? '#8b5cf6' : 'var(--muted)' }}>
                    {current ? <motion.span animate={{ opacity: [1, 0.3, 1] }} transition={{ repeat: Infinity, duration: 0.8 }}>…</motion.span> : i + 1}
                  </div>
                  <div className="min-w-0">
                    <div className="font-bold text-sm text-foreground">{s.label}</div>
                    <div className="text-xs text-muted-foreground leading-snug">{s.desc}</div>
                  </div>
                </motion.div>
              );
            })}
          </div>

          <motion.div key={`${wallet}-${phase >= 3}`} initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }}
            className="flex-1 min-h-[4.5rem] rounded-2xl border-4 flex items-center justify-center gap-3 p-4 text-center"
            style={{ borderColor: resultColor + '70', backgroundColor: resultColor + '0d' }}>
            {phase >= 3 && (granted ? <Check className="size-7 shrink-0" style={{ color: resultColor }} strokeWidth={3} /> : <X className="size-7 shrink-0" style={{ color: resultColor }} strokeWidth={3} />)}
            <div className="font-black text-base" style={{ color: resultColor }}>{resultText}</div>
          </motion.div>

          <div className="shrink-0 flex items-center justify-between gap-3 flex-wrap pr-14">
            <div className="text-[11px] text-muted-foreground flex-1 min-w-[12rem]">
              <span className="font-semibold text-foreground">{t('nftGate.noteLabel')}</span>{t('nftGate.noteBody')}
            </div>
            <UnderTheHood terms={['balanceOf', 'ownerOf', 'wallet signature', 'SIWE (EIP-4361)']} />
          </div>
        </div>
      </div>
      <KeyPointBar text={t('keyPoints.s3-nft-gate')} className="mt-3" />
    </div>
  );
}

// ─── The honest NFT story ────────────────────────────────────────────────────

const HONEST_META = [
  { emoji: '💸', color: '#ED1C24' },
  { emoji: '🔁', color: '#f59e0b' },
  { emoji: '🔗', color: '#8b5cf6' },
  { emoji: '🌱', color: '#39B54A' },
];

export function NftHonestSlide() {
  const { t } = useTranslation(NS);
  const cards = t('nftHonest.cards', { returnObjects: true }) as { title: string; body: string; lesson: string }[];
  const stats = t('nftHonest.stats', { returnObjects: true }) as { value: string; label: string }[];
  return (
    <div className="h-full flex flex-col p-6 lg:p-10">
      <div className="shrink-0 mb-4">
        <h2 className="text-2xl lg:text-3xl font-bold text-foreground">{t('nftHonest.heading')}</h2>
        <p className="text-muted-foreground text-sm mt-1">{t('nftHonest.subtitle')}</p>
      </div>
      <div className="flex-1 min-h-0 grid grid-cols-2 gap-3 content-center">
        {cards.map((c, i) => {
          const m = HONEST_META[i];
          return (
            <div key={c.title} className="p-4 rounded-xl border-2 flex flex-col gap-2" style={{ borderColor: m.color + '50', backgroundColor: m.color + '08' }}>
              <div className="flex items-center gap-2">
                <span className="text-2xl">{m.emoji}</span>
                <div className="font-black text-sm text-foreground leading-tight">{c.title}</div>
              </div>
              <p className="text-xs text-foreground/90 leading-snug flex-1">{c.body}</p>
              <div className="text-[11px] text-muted-foreground p-2 rounded-lg border-l-2" style={{ borderColor: m.color, backgroundColor: m.color + '10' }}>
                <span className="font-bold" style={{ color: m.color }}>{t('nftHonest.lessonLabel')}</span>{c.lesson}
              </div>
            </div>
          );
        })}
      </div>
      <div className="shrink-0 mt-3 grid grid-cols-3 gap-3">
        {stats.map((s) => (
          <div key={s.label} className="p-2.5 bg-card border border-border rounded-xl text-center">
            <div className="font-mono font-black text-sm text-[#ED1C24]">{s.value}</div>
            <div className="text-[10px] text-muted-foreground leading-snug">{s.label}</div>
          </div>
        ))}
      </div>
      <KeyPointBar text={t('keyPoints.s3-nft-honest')} className="mt-3" />
    </div>
  );
}

// ─── What is a DAO ───────────────────────────────────────────────────────────

export function DaoIntroSlide() {
  const { t } = useTranslation(NS);
  const trad = t('daoIntro.tradChain', { returnObjects: true }) as { label: string; sub: string }[];
  const dao = t('daoIntro.daoChain', { returnObjects: true }) as { label: string; sub: string }[];

  const Chain = ({ items, color, label, note }: { items: { label: string; sub: string }[]; color: string; label: string; note: string }) => (
    <div className="flex-1 flex flex-col rounded-2xl border-2 bg-card p-4 min-h-0" style={{ borderColor: color + '50' }}>
      <div className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color }}>{label}</div>
      <div className="flex-1 flex flex-col justify-center gap-1">
        {items.map((it, i) => (
          <div key={it.label} className="flex flex-col items-center">
            <div className="w-full px-3 py-2 rounded-lg border text-center" style={{ borderColor: color + '50', backgroundColor: color + (i === items.length - 1 ? '20' : '0c') }}>
              <div className="font-bold text-sm text-foreground leading-tight">{it.label}</div>
              <div className="text-[10px] text-muted-foreground">{it.sub}</div>
            </div>
            {i < items.length - 1 && <div className="text-lg leading-none" style={{ color }}>↓</div>}
          </div>
        ))}
      </div>
      <div className="mt-3 text-[11px] text-muted-foreground italic leading-snug">{note}</div>
    </div>
  );

  return (
    <div className="h-full flex flex-col p-6 lg:p-10">
      <div className="shrink-0 mb-4">
        <h2 className="text-2xl lg:text-3xl font-bold text-foreground">{t('daoIntro.heading')}</h2>
        <p className="text-muted-foreground text-sm mt-1">{t('daoIntro.subtitle')}</p>
      </div>
      <div className="flex-1 min-h-0 grid grid-cols-[1fr_1fr_1.3fr] gap-4">
        <Chain items={trad} color="#ED1C24" label={t('daoIntro.tradLabel')} note={t('daoIntro.tradEnforced')} />
        <Chain items={dao} color="#8b5cf6" label={t('daoIntro.daoLabel')} note={t('daoIntro.daoEnforced')} />
        <div className="flex flex-col gap-3 min-h-0">
          <div className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">{t('daoIntro.twoLabel')}</div>
          <div className="flex-1 p-4 rounded-xl border bg-card flex flex-col gap-1.5" style={{ borderColor: '#6366f140' }}>
            <div className="flex items-center gap-2"><span className="text-xl">🏢</span><div className="font-bold text-sm text-[#6366f1]">{t('daoIntro.mimicTitle')}</div></div>
            <p className="text-xs text-muted-foreground leading-snug">{t('daoIntro.mimicBody')}</p>
          </div>
          <div className="flex-1 p-4 rounded-xl border bg-card flex flex-col gap-1.5" style={{ borderColor: '#39B54A40' }}>
            <div className="flex items-center gap-2"><span className="text-xl">🧬</span><div className="font-bold text-sm text-[#39B54A]">{t('daoIntro.newTitle')}</div></div>
            <p className="text-xs text-muted-foreground leading-snug">{t('daoIntro.newBody')}</p>
          </div>
          <div className="p-3 rounded-xl border border-[#8b5cf6]/30 text-xs text-muted-foreground" style={{ backgroundColor: '#8b5cf60f' }}>
            <span className="font-bold text-[#8b5cf6]">{t('daoIntro.defLabel')}</span>{t('daoIntro.defBody')}
          </div>
          <UnderTheHood terms={['Governor contract', 'proposal', 'quorum', 'timelock', 'Safe multisig']} />
        </div>
      </div>
      <KeyPointBar text={t('keyPoints.s3-dao-intro')} className="mt-3" />
    </div>
  );
}

// ─── Governance building blocks explorer ─────────────────────────────────────

type BlockId = 'tokenVote' | 'multisig' | 'nested' | 'quadratic' | 'timelock' | 'roles' | 'ragequit';
const BLOCKS: { id: BlockId; kind: 'mimic' | 'new'; color: string }[] = [
  { id: 'tokenVote', kind: 'mimic', color: '#6366f1' },
  { id: 'multisig',  kind: 'mimic', color: '#22d3ee' },
  { id: 'roles',     kind: 'mimic', color: '#f59e0b' },
  { id: 'timelock',  kind: 'mimic', color: '#8b5cf6' },
  { id: 'nested',    kind: 'new',   color: '#39B54A' },
  { id: 'quadratic', kind: 'new',   color: '#ec4899' },
  { id: 'ragequit',  kind: 'new',   color: '#ED1C24' },
];

/** Tiny language-neutral glyph per governance block. */
function BlockGlyph({ id, color, size = 56 }: { id: BlockId; color: string; size?: number }) {
  const s = size;
  const common = { width: s, height: s, viewBox: '0 0 56 56', fill: 'none', stroke: color, strokeWidth: 2.5, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const };
  switch (id) {
    case 'tokenVote': return (
      <svg {...common}><rect x="8" y="30" width="8" height="18" fill={color} fillOpacity="0.25" /><rect x="22" y="18" width="8" height="30" fill={color} fillOpacity="0.5" /><rect x="36" y="8" width="8" height="40" fill={color} /><line x1="6" y1="50" x2="50" y2="50" /></svg>
    );
    case 'multisig': return (
      <svg {...common}><rect x="10" y="22" width="36" height="26" rx="4" /><path d="M18 22v-6a10 10 0 0 1 20 0v6" /><circle cx="20" cy="36" r="2.5" fill={color} /><circle cx="28" cy="36" r="2.5" fill={color} /><circle cx="36" cy="36" r="2.5" fill={color} fillOpacity="0.25" /><circle cx="44" cy="36" r="0" /></svg>
    );
    case 'nested': return (
      <svg {...common}><rect x="6" y="6" width="44" height="44" rx="5" /><rect x="14" y="14" width="18" height="18" rx="3" fill={color} fillOpacity="0.15" /><rect x="18" y="18" width="8" height="8" rx="1.5" fill={color} /><rect x="36" y="30" width="10" height="10" rx="2" fill={color} fillOpacity="0.4" /></svg>
    );
    case 'quadratic': return (
      <svg {...common}><path d="M8 48 Q 20 46 28 36 T 48 8" /><line x1="8" y1="48" x2="48" y2="48" strokeOpacity="0.4" /><line x1="8" y1="48" x2="8" y2="8" strokeOpacity="0.4" /><text x="30" y="20" fontSize="12" fill={color} stroke="none" fontWeight="700">n²</text></svg>
    );
    case 'timelock': return (
      <svg {...common}><circle cx="28" cy="30" r="18" /><path d="M28 18v12l8 5" /><path d="M20 6h16" /></svg>
    );
    case 'roles': return (
      <svg {...common}><rect x="22" y="6" width="12" height="10" rx="2" fill={color} /><rect x="6" y="38" width="12" height="10" rx="2" fill={color} fillOpacity="0.4" /><rect x="22" y="38" width="12" height="10" rx="2" fill={color} fillOpacity="0.4" /><rect x="38" y="38" width="12" height="10" rx="2" fill={color} fillOpacity="0.4" /><path d="M28 16v10M12 38v-8h32v8M28 26v12" /></svg>
    );
    case 'ragequit': return (
      <svg {...common}><rect x="8" y="8" width="26" height="40" rx="3" /><circle cx="28" cy="29" r="2" fill={color} /><path d="M34 28h14m0 0-6-6m6 6-6 6" /></svg>
    );
  }
}

export function GovernanceBlocksExplorer() {
  const { t } = useTranslation(NS);
  const [sel, setSel] = useState<BlockId>('tokenVote');
  const b = BLOCKS.find(x => x.id === sel)!;

  return (
    <div className="h-full flex flex-col p-6 lg:p-8">
      <div className="shrink-0 mb-3">
        <span className="px-2.5 py-0.5 rounded-full bg-[#8b5cf6]/15 border border-[#8b5cf6]/40 text-[#8b5cf6] text-xs font-bold">{t('interactiveBadge')}</span>
        <h2 className="text-2xl font-bold text-foreground mt-1">{t('daoStructures.title')}</h2>
        <p className="text-muted-foreground text-sm">{t('daoStructures.subtitle')}</p>
      </div>

      <div className="flex-1 min-h-0 grid grid-cols-[1.25fr_1fr] gap-5">
        <div className="flex flex-col gap-2 min-h-0">
          <div className="flex items-center gap-3 text-[10px] font-bold uppercase tracking-widest">
            <span className="flex items-center gap-1.5 text-[#6366f1]"><span className="size-2 rounded-full bg-[#6366f1]" />{t('daoStructures.mimicTag')}</span>
            <span className="flex items-center gap-1.5 text-[#39B54A]"><span className="size-2 rounded-full bg-[#39B54A]" />{t('daoStructures.newTag')}</span>
          </div>
          <div className="flex-1 min-h-0 grid grid-cols-4 grid-rows-2 gap-2">
            {BLOCKS.map(x => {
              const active = x.id === sel;
              return (
                <motion.button key={x.id} onClick={() => setSel(x.id)} whileHover={{ y: -2 }} whileTap={{ scale: 0.98 }}
                  className="rounded-xl border-2 p-2.5 flex flex-col items-center justify-center gap-1.5 text-center transition-colors min-h-0"
                  style={{ borderColor: active ? x.color : 'var(--border)', backgroundColor: active ? x.color + '14' : 'var(--card)' }}>
                  <BlockGlyph id={x.id} color={x.color} size={44} />
                  <div className="font-bold text-[11px] text-foreground leading-tight">{t(`daoStructures.blocks.${x.id}.name`)}</div>
                  <span className="text-[9px] font-bold uppercase tracking-widest px-1.5 py-0.5 rounded" style={{ backgroundColor: (x.kind === 'mimic' ? '#6366f1' : '#39B54A') + '18', color: x.kind === 'mimic' ? '#6366f1' : '#39B54A' }}>
                    {x.kind === 'mimic' ? '🏢' : '🧬'}
                  </span>
                </motion.button>
              );
            })}
            <div className="rounded-xl border border-dashed border-border p-2.5 flex items-center justify-center text-center text-[10px] text-muted-foreground italic">
              {t('daoStructures.mimicTag')} 🏢 · {t('daoStructures.newTag')} 🧬
            </div>
          </div>
        </div>

        <AnimatePresence mode="wait">
          <motion.div key={sel} initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }}
            className="min-h-0 p-4 rounded-2xl border-2 bg-card flex flex-col gap-2.5 overflow-y-auto" style={{ borderColor: b.color + '60' }}>
            <div className="flex items-center gap-3">
              <BlockGlyph id={b.id} color={b.color} size={48} />
              <div>
                <div className="text-[10px] font-bold uppercase tracking-widest" style={{ color: b.kind === 'mimic' ? '#6366f1' : '#39B54A' }}>{b.kind === 'mimic' ? t('daoStructures.mimicTag') : t('daoStructures.newTag')}</div>
                <div className="font-black text-base text-foreground leading-tight">{t(`daoStructures.blocks.${b.id}.name`)}</div>
              </div>
            </div>
            {[
              { label: t('daoStructures.analogyLabel'), body: t(`daoStructures.blocks.${b.id}.analogy`), c: '#6366f1' },
              { label: t('daoStructures.howLabel'), body: t(`daoStructures.blocks.${b.id}.how`), c: b.color },
              { label: t('daoStructures.exampleLabel'), body: t(`daoStructures.blocks.${b.id}.example`), c: '#39B54A' },
              { label: t('daoStructures.riskLabel'), body: t(`daoStructures.blocks.${b.id}.risk`), c: '#ED1C24' },
            ].map(row => (
              <div key={row.label} className="p-2.5 rounded-lg border-l-2" style={{ borderColor: row.c, backgroundColor: row.c + '0d' }}>
                <div className="text-[10px] font-bold uppercase tracking-widest" style={{ color: row.c }}>{row.label}</div>
                <div className="text-xs text-foreground leading-snug mt-0.5">{row.body}</div>
              </div>
            ))}
          </motion.div>
        </AnimatePresence>
      </div>
      <KeyPointBar text={t('keyPoints.s3-dao-structures')} className="mt-3" />
    </div>
  );
}

// ─── Voting power simulator ──────────────────────────────────────────────────

type Mode = 'token' | 'quadratic' | 'person';
const VOTER_TOKENS = [5000, 2500, 400, 100, 50];
const VOTER_COLORS = ['#ED1C24', '#f59e0b', '#6366f1', '#22d3ee', '#39B54A'];
const weightFor = (mode: Mode, tokens: number) => mode === 'token' ? tokens : mode === 'quadratic' ? Math.sqrt(tokens) : 1;
const fmt = (n: number) => n >= 100 ? Math.round(n).toLocaleString() : n.toFixed(1);

export function VotingPowerSim() {
  const { t } = useTranslation(NS);
  const voters = t('daoVote.voters', { returnObjects: true }) as { name: string; role: string }[];
  const [mode, setMode] = useState<Mode>('token');
  const [votes, setVotes] = useState<boolean[]>([true, false, false, false, false]);

  const yes = VOTER_TOKENS.reduce((s, tk, i) => s + (votes[i] ? weightFor(mode, tk) : 0), 0);
  const no  = VOTER_TOKENS.reduce((s, tk, i) => s + (!votes[i] ? weightFor(mode, tk) : 0), 0);
  const total = yes + no;
  const passes = yes > no;

  return (
    <div className="h-full flex flex-col p-6 lg:p-8">
      <div className="shrink-0 mb-3">
        <span className="px-2.5 py-0.5 rounded-full bg-[#8b5cf6]/15 border border-[#8b5cf6]/40 text-[#8b5cf6] text-xs font-bold">{t('interactiveBadge')}</span>
        <h2 className="text-2xl font-bold text-foreground mt-1">{t('daoVote.title')}</h2>
        <p className="text-muted-foreground text-sm">{t('daoVote.subtitle')}</p>
      </div>

      <div className="shrink-0 mb-3 p-2.5 rounded-xl border border-[#8b5cf6]/30 text-sm font-semibold text-foreground text-center" style={{ backgroundColor: '#8b5cf60f' }}>
        📜 {t('daoVote.proposal')}
      </div>

      <div className="flex-1 min-h-0 grid grid-cols-[1.2fr_1fr] gap-5">
        {/* Voters */}
        <div className="flex flex-col gap-2 min-h-0 justify-center">
          <div className="text-[10px] text-muted-foreground italic">{t('daoVote.clickHint')}</div>
          {voters.map((v, i) => {
            const yesVote = votes[i];
            const c = yesVote ? '#39B54A' : '#ED1C24';
            const w = weightFor(mode, VOTER_TOKENS[i]);
            return (
              <button key={v.name} onClick={() => setVotes(prev => prev.map((x, j) => (j === i ? !x : x)))}
                className="flex items-center gap-3 p-2.5 rounded-xl border-2 bg-card text-left transition-colors"
                style={{ borderColor: c + '60' }}>
                <div className="size-9 rounded-full flex items-center justify-center text-white text-xs font-black shrink-0" style={{ backgroundColor: VOTER_COLORS[i] }}>{v.name[0]}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline gap-2">
                    <div className="font-bold text-sm text-foreground">{v.name}</div>
                    <div className="text-[10px] text-muted-foreground">{v.role}</div>
                  </div>
                  <div className="text-[11px] text-muted-foreground font-mono">{t('daoVote.tokensLabel', { count: VOTER_TOKENS[i] })} → <span className="font-bold text-foreground">{fmt(w)}</span></div>
                </div>
                <div className="px-3 py-1 rounded-full text-xs font-black text-white shrink-0" style={{ backgroundColor: c }}>{yesVote ? t('daoVote.yes') : t('daoVote.no')}</div>
              </button>
            );
          })}
        </div>

        {/* Mode + result */}
        <div className="flex flex-col gap-3 min-h-0">
          <div className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">{t('daoVote.modeLabel')}</div>
          <div className="grid grid-cols-3 gap-2">
            {(['token', 'quadratic', 'person'] as Mode[]).map(m => {
              const active = m === mode;
              return (
                <button key={m} onClick={() => setMode(m)} className="p-2 rounded-xl border-2 text-xs font-bold transition-colors leading-tight"
                  style={{ borderColor: active ? '#8b5cf6' : 'var(--border)', backgroundColor: active ? '#8b5cf615' : 'var(--card)', color: active ? '#8b5cf6' : 'var(--foreground)' }}>
                  {t(`daoVote.modes.${m}.name`)}
                </button>
              );
            })}
          </div>

          <motion.div key={`${mode}-${passes}`} initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }}
            className="p-4 rounded-2xl border-4 bg-card flex flex-col gap-3" style={{ borderColor: passes ? '#39B54A' : '#ED1C24' }}>
            <div className="flex items-center justify-between">
              <div className="text-xs font-bold uppercase tracking-widest text-muted-foreground">{t('daoVote.resultLabel')}</div>
              <div className="font-black text-xl" style={{ color: passes ? '#39B54A' : '#ED1C24' }}>{passes ? t('daoVote.passes') : t('daoVote.fails')}</div>
            </div>
            <div className="h-6 rounded-lg overflow-hidden flex bg-muted">
              <motion.div animate={{ width: `${total ? (yes / total) * 100 : 0}%` }} className="h-full bg-[#39B54A] flex items-center justify-center text-[10px] font-bold text-white">{fmt(yes)}</motion.div>
              <motion.div animate={{ width: `${total ? (no / total) * 100 : 0}%` }} className="h-full bg-[#ED1C24] flex items-center justify-center text-[10px] font-bold text-white">{fmt(no)}</motion.div>
            </div>
            <div className="flex justify-between text-[11px] text-muted-foreground">
              <span><span className="font-bold text-[#39B54A]">{fmt(yes)}</span> {t('daoVote.votesFor')}</span>
              <span><span className="font-bold text-[#ED1C24]">{fmt(no)}</span> {t('daoVote.votesAgainst')}</span>
            </div>
          </motion.div>

          <div className="flex-1 p-3 rounded-xl border border-[#8b5cf6]/30 text-xs text-muted-foreground leading-relaxed" style={{ backgroundColor: '#8b5cf60c' }}>
            <div className="text-[10px] font-bold uppercase tracking-widest text-[#8b5cf6] mb-1">{t('daoVote.lessonLabel')}</div>
            {t(`daoVote.modes.${mode}.lesson`)}
          </div>
          <UnderTheHood terms={['getVotes()', 'delegation', 'quorum', 'Sybil resistance']} />
        </div>
      </div>
      <KeyPointBar text={t('keyPoints.s3-dao-vote')} className="mt-3" />
    </div>
  );
}

// ─── Real DAOs ───────────────────────────────────────────────────────────────

const DAO_EXAMPLE_META = [
  { emoji: '🏦', color: '#39B54A' },
  { emoji: '🦄', color: '#ec4899' },
  { emoji: '🌱', color: '#22d3ee' },
  { emoji: '📜', color: '#f59e0b' },
  { emoji: '💥', color: '#ED1C24' },
];

interface DaoExample { name: string; tag: string; stat: string; what: string; structure: string; lesson: string }

export function DaoExamplesSlide() {
  const { t } = useTranslation(NS);
  const items = t('daoExamples.items', { returnObjects: true }) as DaoExample[];
  return (
    <div className="h-full flex flex-col p-6 lg:p-10">
      <div className="shrink-0 mb-4">
        <h2 className="text-2xl lg:text-3xl font-bold text-foreground">{t('daoExamples.heading')}</h2>
        <p className="text-muted-foreground text-sm mt-1">{t('daoExamples.subtitle')}</p>
      </div>
      <div className="flex-1 min-h-0 grid grid-cols-5 gap-3">
        {items.map((d, i) => {
          const m = DAO_EXAMPLE_META[i];
          return (
            <div key={d.name} className="flex flex-col rounded-xl border-2 bg-card overflow-hidden min-h-0" style={{ borderColor: m.color + '50' }}>
              <div className="h-1.5 shrink-0" style={{ backgroundColor: m.color }} />
              <div className="flex-1 min-h-0 p-3 flex flex-col gap-2 overflow-y-auto">
                <div className="flex items-center gap-2">
                  <span className="text-xl">{m.emoji}</span>
                  <div className="font-black text-sm text-foreground leading-tight">{d.name}</div>
                </div>
                <div className="text-[10px] font-bold" style={{ color: m.color }}>{d.tag}</div>
                <div className="text-[10px] font-mono text-muted-foreground px-1.5 py-0.5 rounded self-start" style={{ backgroundColor: m.color + '15' }}>{d.stat}</div>
                <div>
                  <div className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground">{t('daoExamples.whatLabel')}</div>
                  <p className="text-[11px] text-foreground/90 leading-snug">{d.what}</p>
                </div>
                <div>
                  <div className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground">{t('daoExamples.structureLabel')}</div>
                  <p className="text-[11px] text-foreground/90 leading-snug">{d.structure}</p>
                </div>
                <div className="mt-auto p-2 rounded-lg text-[11px] leading-snug" style={{ backgroundColor: m.color + '12' }}>
                  <span className="font-bold" style={{ color: m.color }}>{t('daoExamples.lessonLabel')}: </span>
                  <span className="text-muted-foreground">{d.lesson}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      <div className="shrink-0 mt-3 p-2.5 rounded-xl border border-[#f59e0b]/30 text-xs text-muted-foreground" style={{ backgroundColor: '#f59e0b0f' }}>
        <span className="font-bold text-[#f59e0b]">{t('daoExamples.legalLabel')}</span>{t('daoExamples.legalBody')}
      </div>
      <KeyPointBar text={t('keyPoints.s3-dao-examples')} className="mt-3" />
    </div>
  );
}

// ─── TradeLens failure case ──────────────────────────────────────────────────

export function TradeLensCase() {
  const { t } = useTranslation(NS);
  const problem = t('tradelens.problemPoints', { returnObjects: true }) as string[];
  const solution = t('tradelens.solutionPoints', { returnObjects: true }) as string[];
  const happened = t('tradelens.happenedPoints', { returnObjects: true }) as string[];
  const cols = [
    { num: '01', color: '#ED1C24', label: t('common.theProblem') },
    { num: '02', color: '#6366f1', label: t('common.theSolution') },
    { num: '03', color: '#f59e0b', label: t('common.whatHappened') },
  ];
  return (
    <div className="h-full flex flex-col p-6 lg:p-10">
      <div className="shrink-0 mb-1">
        <div className="text-xs font-bold text-[#ED1C24] uppercase tracking-widest mb-1">{t('tradelens.kicker')}</div>
        <h2 className="text-2xl lg:text-3xl font-bold text-foreground">{t('tradelens.heading')}</h2>
        <p className="text-muted-foreground text-sm mt-1">{t('tradelens.subtitle')}</p>
      </div>
      <div className="flex-1 min-h-0 grid grid-cols-3 gap-4 content-center mt-4">
        {cols.map((c, ci) => (
          <div key={c.num} className="flex flex-col gap-3 min-h-0">
            <div className="flex items-center gap-2">
              <div className="size-7 rounded-lg flex items-center justify-center text-white text-xs font-black shrink-0" style={{ backgroundColor: c.color }}>{c.num}</div>
              <div className="text-xs font-bold uppercase tracking-widest" style={{ color: c.color }}>{c.label}</div>
            </div>
            <div className="flex-1 p-4 rounded-xl border flex flex-col gap-3 min-h-0" style={{ borderColor: c.color + '40', background: `linear-gradient(135deg, ${c.color}1a, transparent)` }}>
              {ci === 0 && (
                <>
                  <p className="text-sm text-muted-foreground leading-relaxed">{t('tradelens.problemBodyA')}<span className="text-foreground font-semibold">{t('tradelens.problemBodyStrong')}</span>{t('tradelens.problemBodyB')}</p>
                  <ul className="space-y-2">{problem.map((p, i) => <li key={i} className="flex gap-2 text-xs text-muted-foreground"><span className="text-[#ED1C24] shrink-0 mt-0.5">✗</span>{p}</li>)}</ul>
                  <div className="mt-auto p-2 rounded-lg text-xs text-center" style={{ backgroundColor: '#ED1C2415' }}><span className="font-bold text-[#ED1C24]">{t('tradelens.problemCostLabel')}</span> <span className="text-muted-foreground">{t('tradelens.problemCostBody')}</span></div>
                </>
              )}
              {ci === 1 && (
                <>
                  <p className="text-sm text-muted-foreground leading-relaxed">{t('tradelens.solutionBodyA')}<span className="text-foreground font-semibold">{t('tradelens.solutionBodyStrong')}</span>{t('tradelens.solutionBodyB')}</p>
                  <ul className="space-y-2">{solution.map((s, i) => <li key={i} className="flex gap-2 text-xs text-muted-foreground"><span className="text-[#6366f1] shrink-0 mt-0.5">›</span>{s}</li>)}</ul>
                  <div className="mt-auto p-2 rounded-lg text-xs text-center font-mono" style={{ backgroundColor: '#6366f115' }}>{t('tradelens.solutionFlow')}</div>
                </>
              )}
              {ci === 2 && (
                <>
                  <ul className="space-y-2">{happened.map((h, i) => <li key={i} className="flex gap-2 text-xs text-muted-foreground"><span className="text-[#f59e0b] shrink-0 mt-0.5">›</span>{h}</li>)}</ul>
                  <div className="mt-auto p-2 rounded-lg text-xs text-muted-foreground" style={{ backgroundColor: '#f59e0b15' }}><span className="font-semibold text-foreground">{t('tradelens.lessonLabel')}</span>{t('tradelens.lessonBody')}</div>
                </>
              )}
            </div>
          </div>
        ))}
      </div>
      <KeyPointBar text={t('keyPoints.s3-tradelens')} className="mt-3" />
    </div>
  );
}
