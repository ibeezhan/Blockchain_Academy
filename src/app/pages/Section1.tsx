/**
 * Section 1 — How a blockchain works
 *
 * Restructured per the v2 pedagogy locked in 01-course-master-plan.md:
 *   Trust → Ledger → Hash → Chain → Cascade → Network → Consensus → Capstone → Takeaways
 *
 * Slides cut from this section (parked in Section1.legacy.tsx for Phase 2):
 *   • Vocabulary Wall (anti-pattern: front-loading definitions)
 *   • DLT Models comparison table (kept the topology demo only)
 *   • Blockchain Types (public/private/consortium) — moves to Course 3
 *   • Merkle Trees (both slides) — optional appendix or Course 2/3
 *   • Wallets / Signatures / UTXO / Transaction Lifecycle — moves to Course 2
 *   • Proof of Stake + DPoS deep dives + consensus comparison table — moves to Course 3
 *   • Blockchain Trilemma exercise — moves to Course 3
 *   • 6 of 8 quizzes — move with their parent topics
 */
import { useState, useEffect, useCallback, useRef, useMemo, type CSSProperties } from 'react';
import anime from 'animejs';
import { useTranslation } from 'react-i18next';
import { TitleSlide } from '../components/templates/TitleSlide';
import { ConceptSlide } from '../components/templates/ConceptSlide';
import { DiagramSlide } from '../components/templates/DiagramSlide';
import { QuizSlide } from '../components/templates/QuizSlide';
import { TakeawaySlide } from '../components/templates/TakeawaySlide';
import { CalloutBox } from '../components/shared/CalloutBox';
import { BlockchainChain } from '../components/blockchain/BlockchainChain';
import { ConsensusVisualization } from '../components/blockchain/ConsensusVisualization';
import { SectionNav } from '../components/navigation/SectionNav';
import { SiteFooter } from '../components/shared/SiteFooter';
import { Blocks, ExternalLink } from 'lucide-react';

/** Sidebar shape — labels resolved at render time via i18n */
const section1ChaptersShape: ReadonlyArray<{ id: string; kind?: 'group' }> = [
  { kind: 'group', id: 'g-s1-problem' },
  { id: 's1-trust' },
  { id: 's1-ledger' },

  { kind: 'group', id: 'g-s1-basics' },
  { id: 's1-what-is' },
  { id: 's1-transaction' },

  { kind: 'group', id: 'g-s1-crypto' },
  { id: 's1-hashing' },
  { id: 's1-chain' },
  { id: 's1-cascade' },

  { kind: 'group', id: 'g-s1-network' },
  { id: 's1-network' },
  { id: 's1-network-sort' },
  { id: 's1-consensus' },
  { id: 's1-protocols' },

  { kind: 'group', id: 'g-s1-mining' },
  { id: 's1-mining' },

  { kind: 'group', id: 'g-s1-wallet' },
  { id: 's1-wallet' },

  { kind: 'group', id: 'g-s1-wrap' },
  { id: 's1-takeaways' },
];

/* ── SHA-256 helper ─────────────────────────────────── */
async function sha256(text: string): Promise<string> {
  const data = new TextEncoder().encode(text);
  const buffer = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(buffer))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

/* ── Interactive SHA-256 input ─────────────────────────────────── */
function InteractiveHash() {
  const { t } = useTranslation('blockchain-fundamentals/section-1');
  const [input, setInput] = useState('');
  const [hash, setHash] = useState('');

  useEffect(() => {
    if (!input) {
      setHash('');
      return;
    }
    const encoder = new TextEncoder();
    const data = encoder.encode(input);
    crypto.subtle.digest('SHA-256', data).then(buffer => {
      const hashArray = Array.from(new Uint8Array(buffer));
      setHash(hashArray.map(b => b.toString(16).padStart(2, '0')).join(''));
    });
  }, [input]);

  return (
    <div className="p-5 bg-card rounded-xl border-2 border-[#39B54A]">
      <div className="text-sm font-bold text-[#39B54A] mb-3">{t('interactiveHash.tryYourself')}</div>
      <input
        type="text"
        value={input}
        onChange={e => setInput(e.target.value)}
        placeholder={t('interactiveHash.placeholder')}
        className="w-full px-4 py-2 bg-muted rounded-lg border border-border text-foreground font-mono text-sm mb-3 focus:outline-none focus:ring-2 focus:ring-[#39B54A]/50"
      />
      {hash ? (
        <>
          <div className="text-sm text-muted-foreground mb-1">{t('interactiveHash.outputLabel')}</div>
          <div className="font-mono text-xs text-[#39B54A] break-all">{hash}</div>
        </>
      ) : (
        <div className="text-sm text-muted-foreground italic">{t('interactiveHash.empty')}</div>
      )}
    </div>
  );
}

/* ── Village Ledger visual (NEW) ─────────────────────────────────── */
function VillageLedgerVisual() {
  const { t } = useTranslation('blockchain-fundamentals/section-1');
  return (
    <div className="w-full flex flex-col items-center gap-4 py-4">
      <p className="text-xs uppercase tracking-widest text-muted-foreground font-semibold">{t('villageLedger.subhead')}</p>
      <div className="grid grid-cols-5 gap-3">
        {Array.from({ length: 10 }).map((_, i) => {
          const isMallory = i === 7;
          return (
            <div
              key={i}
              className={`
                p-3 rounded-lg border-2 text-center
                ${isMallory
                  ? 'border-[#ef4444] bg-[#ef4444]/10'
                  : 'border-[#39B54A]/50 bg-[#39B54A]/5'
                }
              `}
            >
              <div className="text-2xl mb-1">📓</div>
              <div className="text-[10px] font-mono text-muted-foreground">
                {isMallory ? 'Mallory' : `${t('villageLedger.villager')} ${i < 7 ? i + 1 : i}`}
              </div>
            </div>
          );
        })}
      </div>
      <CalloutBox type="warning" title={t('villageLedger.calloutTitle')}>
        {t('villageLedger.calloutLead')} <span className="font-mono">{t('villageLedger.calloutQuestion')}</span>
      </CalloutBox>
    </div>
  );
}

/* ── Inside-a-Block Anatomy (animated) ─────────────────────────────────── */
const ANATOMY_FIELDS = [
  { id: 'prev-hash', value: '0x1a2b3c…',         color: '#8b5cf6', icon: '🔗' },
  { id: 'data',      value: '25 BTC → Bob',      color: '#22d3ee', icon: '📦' },
  { id: 'timestamp', value: 'Jan 4 2009, 10:45', color: '#10b981', icon: '⏰' },
  { id: 'nonce',     value: '2,083,236,893',     color: '#39B54A', icon: '🎲' },
  { id: 'hash',      value: '0x4d5e6f…',         color: '#ED1C24', icon: '🔐' },
];

/* ── Transaction Flow (NEW) ────────────────────────────────────────────── */
const TX_USERS = [
  { key: 'alice', emoji: '👩‍💼', color: '#ED1C24' },
  { key: 'bob',   emoji: '👨‍🚀', color: '#6366f1' },
  { key: 'carol', emoji: '👩‍🎨', color: '#f59e0b' },
  { key: 'dave',  emoji: '👨‍⚕️', color: '#39B54A' },
];

const TX_BLOCK_CAPACITY = 8;
const FLOW_W = 800;
const FLOW_H = 500;
const USER_X = 12;
const USER_Y0 = 22;
const USER_SPACING = 118;
const USER_W = 112;
const USER_H = 78;
const MEMPOOL_X = 196;
const MEMPOOL_Y = 36;
const MEMPOOL_W = 280;
const MEMPOOL_H = 428;
const TX_BLOCK_X = 528;
const TX_BLOCK_Y = 36;
const TX_BLOCK_W = 252;
const TX_BLOCK_H = 428;
const TX_W = 102;
const TX_H = 30;

interface TxFlowItem {
  id: string;
  userIdx: number;
  amount: string;
  status: 'mempool' | 'in-block';
}

function TransactionFlow() {
  const { t } = useTranslation('blockchain-fundamentals/section-1');
  const [transactions, setTransactions] = useState<TxFlowItem[]>([]);
  const [blockNum, setBlockNum] = useState(8421);

  const txRefs    = useRef<Map<string, HTMLDivElement>>(new Map());
  const animTimeouts = useRef<ReturnType<typeof setTimeout>[]>([]);
  const resettingRef = useRef(false);
  const blockSlotMap = useRef<Map<string, number>>(new Map());

  // Helper to schedule an animation + track for cleanup
  const scheduleAnim = (fn: () => void, delay = 20) => {
    const t = setTimeout(fn, delay);
    animTimeouts.current.push(t);
  };

  // Spawn transactions periodically
  useEffect(() => {
    const spawnInterval = setInterval(() => {
      if (resettingRef.current) return;
      setTransactions(prev => {
        if (prev.length >= 15) return prev; // cap
        const userIdx = Math.floor(Math.random() * TX_USERS.length);
        const amount = (Math.random() * 4 + 0.05).toFixed(2);
        const id = `tx-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
        const newTx: TxFlowItem = { id, userIdx, amount, status: 'mempool' };

        scheduleAnim(() => {
          const el = txRefs.current.get(id);
          if (!el) return;
          const targetX = MEMPOOL_X + 10 + Math.random() * (MEMPOOL_W - TX_W - 20);
          const targetY = MEMPOOL_Y + 12 + Math.random() * (MEMPOOL_H - TX_H - 24);
          anime({
            targets: el,
            left: `${targetX}px`,
            top: `${targetY}px`,
            duration: 750,
            easing: 'easeOutQuad',
          });
        });

        return [...prev, newTx];
      });
    }, 850);
    return () => clearInterval(spawnInterval);
  }, []);

  // Pull one mempool tx into the block periodically
  useEffect(() => {
    const moveInterval = setInterval(() => {
      if (resettingRef.current) return;
      setTransactions(prev => {
        const inBlock = prev.filter(t => t.status === 'in-block');
        if (inBlock.length >= TX_BLOCK_CAPACITY) return prev;
        const oldest = prev.find(t => t.status === 'mempool');
        if (!oldest) return prev;

        const slotIdx = inBlock.length;
        blockSlotMap.current.set(oldest.id, slotIdx);

        scheduleAnim(() => {
          const el = txRefs.current.get(oldest.id);
          if (!el) return;
          const targetX = TX_BLOCK_X + 10;
          const targetY = TX_BLOCK_Y + 28 + slotIdx * (TX_H + 4);
          anime({
            targets: el,
            left: `${targetX}px`,
            top: `${targetY}px`,
            width: `${TX_BLOCK_W - 20}px`,
            duration: 580,
            easing: 'easeOutQuad',
          });
        });

        return prev.map(t => t.id === oldest.id ? { ...t, status: 'in-block' as const } : t);
      });
    }, 1050);
    return () => clearInterval(moveInterval);
  }, []);

  // When the block is full, freeze it, then animate out + start fresh
  const inBlockCount = transactions.filter(t => t.status === 'in-block').length;
  useEffect(() => {
    if (inBlockCount >= TX_BLOCK_CAPACITY && !resettingRef.current) {
      resettingRef.current = true;
      const timeout = setTimeout(() => {
        // Animate in-block transactions sliding up off the canvas
        const inBlockTxs = transactions.filter(t => t.status === 'in-block');
        inBlockTxs.forEach(tx => {
          const el = txRefs.current.get(tx.id);
          if (!el) return;
          anime({
            targets: el,
            top: `-${TX_H + 30}px`,
            opacity: [1, 0],
            duration: 600,
            easing: 'easeInQuad',
          });
        });
        // Clear them from state after the animation
        scheduleAnim(() => {
          setTransactions(prev => prev.filter(t => t.status !== 'in-block'));
          setBlockNum(n => n + 1);
          blockSlotMap.current.clear();
          resettingRef.current = false;
        }, 650);
      }, 2000);
      return () => clearTimeout(timeout);
    }
  }, [inBlockCount, transactions]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      animTimeouts.current.forEach(t => clearTimeout(t));
      animTimeouts.current = [];
    };
  }, []);

  const isBlockFull = inBlockCount >= TX_BLOCK_CAPACITY;

  return (
    <div className="w-full max-w-[1280px]">
      <div className="text-center mb-4">
        <h2 className="text-2xl lg:text-3xl font-bold text-foreground mb-2">{t('transactionFlow.heading')}</h2>
        <p className="text-sm lg:text-base text-muted-foreground max-w-3xl mx-auto">
          {t('transactionFlow.leadA')} <strong className="text-foreground">{t('transactionFlow.leadMempool')}</strong>{t('transactionFlow.leadB')}
        </p>
      </div>

      <div className="flex gap-6 items-start flex-wrap lg:flex-nowrap justify-center">
        {/* LEFT — example transaction card */}
        <div className="w-full lg:w-[290px] shrink-0">
          <div className="rounded-xl border-2 border-[#6366f1] bg-card p-5 shadow-lg shadow-[#6366f1]/20">
            <div className="text-[10px] uppercase tracking-widest font-bold text-[#6366f1] mb-3 text-center">
              {t('transactionFlow.exampleHeader')}
            </div>
            <div className="space-y-2.5 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground text-xs">{t('transactionFlow.from')}</span>
                <span className="font-mono text-foreground text-xs">0xa3b1…f02</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground text-xs">{t('transactionFlow.to')}</span>
                <span className="font-mono text-foreground text-xs">0x9c4d…7e1</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground text-xs">{t('transactionFlow.amount')}</span>
                <span className="font-mono text-foreground font-bold">0.5 BTC</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground text-xs">{t('transactionFlow.fee')}</span>
                <span className="font-mono text-foreground text-xs">0.0001 BTC</span>
              </div>
              <div className="flex justify-between border-t border-border pt-2.5">
                <span className="text-muted-foreground text-xs">{t('transactionFlow.signed')}</span>
                <span className="text-[#39B54A] font-bold text-xs">{t('transactionFlow.signedBy')}</span>
              </div>
            </div>
          </div>
          <p className="text-xs text-muted-foreground mt-3 italic text-center leading-relaxed">
            {t('transactionFlow.cardCaption')}
          </p>
        </div>

        {/* RIGHT — animated user → mempool → block flow */}
        <div className="flex flex-col items-center">
          <div
            className="relative bg-muted/20 rounded-2xl border-2 border-dashed border-border/60 overflow-hidden"
            style={{ width: FLOW_W, height: FLOW_H }}
          >
            {/* Users */}
            {TX_USERS.map((u, i) => (
              <div
                key={u.key}
                className="absolute flex items-center gap-2 px-2 py-1.5 rounded-lg border-2 bg-card text-xs"
                style={{
                  left: USER_X,
                  top: USER_Y0 + i * USER_SPACING,
                  width: USER_W,
                  height: USER_H,
                  borderColor: u.color + '90',
                  boxShadow: `0 2px 8px ${u.color}15`,
                }}
              >
                <span className="text-xl">{u.emoji}</span>
                <div className="flex-1 min-w-0">
                  <div className="text-[10px] font-bold" style={{ color: u.color }}>{t(`transactionFlow.users.${u.key}`)}</div>
                  <div className="text-[9px] text-muted-foreground">{t('transactionFlow.sender')}</div>
                </div>
              </div>
            ))}

            {/* Mempool zone */}
            <div
              className="absolute rounded-xl border-2 border-dashed border-[#f59e0b]/60 bg-[#f59e0b]/5"
              style={{ left: MEMPOOL_X, top: MEMPOOL_Y, width: MEMPOOL_W, height: MEMPOOL_H }}
            >
              <div className="absolute -top-3 left-3 px-2 py-0.5 bg-background text-[10px] font-bold text-[#f59e0b] uppercase tracking-widest border border-[#f59e0b]/60 rounded-md">
                {t('transactionFlow.mempool')}
              </div>
            </div>

            {/* Block zone */}
            <div
              className={`absolute rounded-xl border-2 transition-colors duration-300 ${
                isBlockFull
                  ? 'border-[#39B54A] bg-[#39B54A]/10 shadow-[0_0_0_3px_rgba(57,181,74,0.15)]'
                  : 'border-dashed border-[#6366f1]/60 bg-[#6366f1]/5'
              }`}
              style={{ left: TX_BLOCK_X, top: TX_BLOCK_Y, width: TX_BLOCK_W, height: TX_BLOCK_H }}
            >
              <div
                className="absolute -top-3 left-3 px-2 py-0.5 bg-background text-[10px] font-bold uppercase tracking-widest border rounded-md"
                style={{
                  borderColor: isBlockFull ? '#39B54A' : '#6366f1',
                  color: isBlockFull ? '#39B54A' : '#6366f1',
                }}
              >
                {isBlockFull ? t('transactionFlow.blockFull', { n: blockNum }) : t('transactionFlow.blockLabel', { n: blockNum })}
              </div>
              <div className="absolute bottom-2 left-2 right-2">
                <div className="flex items-center gap-1.5">
                  <span className="text-[9px] text-muted-foreground font-mono">{inBlockCount}/{TX_BLOCK_CAPACITY}</span>
                  <div className="flex-1 h-1.5 rounded-full bg-muted/40 overflow-hidden">
                    <div
                      className="h-full transition-all duration-300"
                      style={{
                        width: `${(inBlockCount / TX_BLOCK_CAPACITY) * 100}%`,
                        backgroundColor: isBlockFull ? '#39B54A' : '#6366f1',
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Transactions (absolutely positioned, anime.js animates) */}
            {transactions.map(tx => {
              const user = TX_USERS[tx.userIdx];
              const startX = USER_X + USER_W + 4;
              const startY = USER_Y0 + tx.userIdx * USER_SPACING + USER_H / 2 - TX_H / 2;
              return (
                <div
                  key={tx.id}
                  ref={el => {
                    if (el) txRefs.current.set(tx.id, el);
                    else txRefs.current.delete(tx.id);
                  }}
                  className="absolute rounded-md border-2 px-2 py-0.5 text-[10px] font-mono font-bold whitespace-nowrap shadow-sm flex items-center justify-center"
                  style={{
                    left: `${startX}px`,
                    top: `${startY}px`,
                    width: `${TX_W}px`,
                    height: `${TX_H}px`,
                    borderColor: user.color,
                    backgroundColor: user.color + '18',
                    color: user.color,
                  }}
                >
                  {tx.amount} BTC
                </div>
              );
            })}
          </div>

          <p className="text-xs text-muted-foreground text-center mt-3 italic max-w-md">
            {t('transactionFlow.footerA')} <span className="text-[#f59e0b] font-semibold not-italic">{t('transactionFlow.footerMempoolWord')}</span>{t('transactionFlow.footerB')}{' '}
            <span className="text-[#6366f1] font-semibold not-italic">{t('transactionFlow.footerBlockWord')}</span> {t('transactionFlow.footerC')}
          </p>
        </div>
      </div>
    </div>
  );
}

/* ── Linked Blocks Reveal — improved "Each Block Points Back" ────────────── */
const LINKED_BLOCKS = [
  { n: 0, prevHash: null,        hash: '0x8b5cf6', color: '#8b5cf6' },
  { n: 1, prevHash: '0x8b5cf6',  hash: '0x10b981', color: '#10b981' },
  { n: 2, prevHash: '0x10b981',  hash: '0xED1C24', color: '#ED1C24' },
];

function LinkedBlocksReveal() {
  const { t } = useTranslation('blockchain-fundamentals/section-1');
  const containerRef = useRef<HTMLDivElement | null>(null);
  const blockRefs    = useRef<(HTMLDivElement | null)[]>([]);
  const arrowRefs    = useRef<(HTMLDivElement | null)[]>([]);
  const [revealed, setRevealed] = useState(false);

  const runReveal = useCallback(() => {
    blockRefs.current.forEach((el, i) => {
      if (!el) return;
      anime.remove(el);
      el.style.opacity = '0';
      el.style.transform = 'translateY(24px) scale(0.96)';
      anime({
        targets: el,
        opacity: [0, 1],
        translateY: [24, 0],
        scale: [0.96, 1],
        duration: 520,
        delay: 200 + i * 400,
        easing: 'easeOutQuad',
      });
    });
    arrowRefs.current.forEach((el, i) => {
      if (!el) return;
      anime.remove(el);
      el.style.opacity = '0';
      el.style.transform = 'scale(0.6)';
      anime({
        targets: el,
        opacity: [0, 1],
        scale: [0.6, 1],
        duration: 360,
        delay: 200 + 280 + i * 400,
        easing: 'easeOutBack',
      });
    });
  }, []);

  useEffect(() => {
    if (!containerRef.current) return;
    const obs = new IntersectionObserver(entries => {
      for (const e of entries) {
        if (e.isIntersecting && !revealed) {
          setRevealed(true);
          setTimeout(runReveal, 60);
          break;
        }
      }
    }, { threshold: 0.4 });
    obs.observe(containerRef.current);
    return () => obs.disconnect();
  }, [revealed, runReveal]);

  return (
    <div className="max-w-6xl w-full">
      <div className="text-center mb-6">
        <h2 className="text-2xl lg:text-3xl font-bold text-foreground mb-2">{t('linkedBlocks.heading')}</h2>
        <p className="text-sm text-muted-foreground max-w-3xl mx-auto">
          {t('linkedBlocks.leadA')} <em className="text-foreground not-italic font-semibold">{t('linkedBlocks.leadEm')}</em>{t('linkedBlocks.leadB')}{' '}
          <span className="font-mono">{t('linkedBlocks.leadHashWord')}</span> {t('linkedBlocks.leadC')}{' '}
          <span className="font-mono">{t('linkedBlocks.leadPrevHashWord')}</span>{t('linkedBlocks.leadTail')}
        </p>
      </div>

      <div ref={containerRef} className="flex items-center justify-center gap-0 flex-wrap">
        {LINKED_BLOCKS.map((b, i) => (
          <div key={b.n} className="flex items-center">
            <div
              ref={el => { blockRefs.current[i] = el; }}
              className="relative w-[230px] bg-card rounded-2xl border-2 p-5 mt-3"
              style={{
                borderColor: b.color,
                boxShadow: `0 8px 28px ${b.color}25, 0 0 0 1px ${b.color}10`,
                opacity: 0,
              }}
            >
              <div
                className="absolute -top-3 left-5 px-3 py-1 rounded-full text-xs font-mono font-bold text-white shadow-md"
                style={{ backgroundColor: b.color }}
              >
                {t('linkedBlocks.blockLabel', { n: b.n })}
              </div>

              <div className="mt-2 space-y-3">
                <div>
                  <div className="text-[10px] uppercase tracking-widest text-muted-foreground mb-0.5 font-semibold">{t('linkedBlocks.dataLabel')}</div>
                  <div className="font-mono text-sm text-foreground">{t(`linkedBlocks.data.${b.n}`)}</div>
                </div>

                <div className="border-t border-border pt-3">
                  <div className="text-[10px] uppercase tracking-widest text-muted-foreground mb-0.5 font-semibold flex items-center gap-1">
                    {t('linkedBlocks.prevHashLabel')}
                    {i > 0 && (
                      <span
                        className="size-2 rounded-full"
                        style={{ backgroundColor: LINKED_BLOCKS[i - 1].color }}
                        title={t('linkedBlocks.matchesTitle')}
                      />
                    )}
                  </div>
                  <div
                    className="font-mono text-sm font-bold"
                    style={i === 0
                      ? { color: 'var(--muted-foreground)' }
                      : { color: LINKED_BLOCKS[i - 1].color, backgroundColor: LINKED_BLOCKS[i - 1].color + '15', padding: '2px 6px', borderRadius: '4px', display: 'inline-block' }
                    }
                  >
                    {b.prevHash ?? t('linkedBlocks.genesisDash')}
                  </div>
                </div>

                <div>
                  <div className="text-[10px] uppercase tracking-widest text-muted-foreground mb-0.5 font-semibold flex items-center gap-1">
                    {t('linkedBlocks.hashLabel')}
                    <span
                      className="size-2 rounded-full"
                      style={{ backgroundColor: b.color }}
                    />
                  </div>
                  <div
                    className="font-mono text-sm font-bold"
                    style={{ color: b.color, backgroundColor: b.color + '15', padding: '2px 6px', borderRadius: '4px', display: 'inline-block' }}
                  >
                    {b.hash}
                  </div>
                </div>
              </div>
            </div>

            {i < LINKED_BLOCKS.length - 1 && (
              <div
                ref={el => { arrowRefs.current[i] = el; }}
                className="flex flex-col items-center justify-center mx-3 shrink-0"
                style={{ opacity: 0 }}
              >
                <svg width="56" height="60" viewBox="0 0 56 60">
                  <line
                    x1="2" y1="30" x2="44" y2="30"
                    stroke={b.color}
                    strokeWidth="3"
                    strokeLinecap="round"
                  />
                  <polygon points="44,22 56,30 44,38" fill={b.color} />
                </svg>
                <div className="text-[10px] font-bold mt-1 whitespace-nowrap uppercase tracking-wider" style={{ color: b.color }}>
                  {t('linkedBlocks.matches')}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="mt-8 max-w-2xl mx-auto p-4 bg-muted/40 rounded-xl border border-border text-center">
        <p className="text-xs text-foreground leading-relaxed">
          <strong className="font-bold">{t('linkedBlocks.footerA')}</strong> {t('linkedBlocks.footerB')}
        </p>
      </div>
    </div>
  );
}

function InsideBlockAnatomy() {
  const { t } = useTranslation('blockchain-fundamentals/section-1');
  const containerRef = useRef<HTMLDivElement | null>(null);
  const blockRef     = useRef<HTMLDivElement | null>(null);
  const fieldRefs    = useRef<(HTMLDivElement | null)[]>([]);
  const defRefs      = useRef<(HTMLDivElement | null)[]>([]);
  const [animated, setAnimated] = useState(false);

  const runReveal = useCallback(() => {
    defRefs.current.forEach(el => {
      if (!el) return;
      anime.remove(el);
      el.style.opacity = '0';
      el.style.transform = 'translateX(20px)';
    });
    fieldRefs.current.forEach(el => {
      if (!el) return;
      anime.remove(el);
    });

    ANATOMY_FIELDS.forEach((_, i) => {
      const delay = 200 + i * 180;

      const fieldEl = fieldRefs.current[i];
      if (fieldEl) {
        anime({
          targets: fieldEl,
          scale: [1, 1.05, 1],
          duration: 380,
          delay,
          easing: 'easeOutQuad',
        });
      }

      const defEl = defRefs.current[i];
      if (defEl) {
        anime({
          targets: defEl,
          opacity: [0, 1],
          translateX: [20, 0],
          duration: 420,
          delay: delay + 80,
          easing: 'easeOutQuad',
        });
      }
    });
  }, []);

  // Trigger animation on first scroll-into-view
  useEffect(() => {
    if (!containerRef.current) return;
    const obs = new IntersectionObserver(entries => {
      for (const e of entries) {
        if (e.isIntersecting && !animated) {
          setAnimated(true);
          // Slight delay so paths/refs settle
          setTimeout(runReveal, 80);
          break;
        }
      }
    }, { threshold: 0.35 });
    obs.observe(containerRef.current);
    return () => obs.disconnect();
  }, [animated, runReveal]);

  return (
    <div className="max-w-6xl w-full">
      <div className="text-center mb-6">
        <h2 className="text-2xl lg:text-3xl font-bold text-foreground mb-1">{t('insideBlock.heading')}</h2>
        <p className="text-sm text-muted-foreground max-w-2xl mx-auto">
          {t('insideBlock.lead')}
        </p>
      </div>

      <div
        ref={containerRef}
        className="relative grid grid-cols-1 lg:grid-cols-[340px_1fr] gap-6 lg:gap-[140px] items-stretch"
      >
        {/* Block on the left */}
        <div className="relative">
          <div
            ref={blockRef}
            className="relative bg-card rounded-2xl border-2 border-[#6366f1] shadow-xl shadow-[#6366f1]/20 p-5 mt-4"
          >
            <div className="absolute -top-3.5 left-5 bg-[#6366f1] text-white px-3 py-1 rounded-full text-xs font-mono font-bold shadow">
              {t('insideBlock.blockTag')}
            </div>
            <div className="space-y-3 mt-2">
              {ANATOMY_FIELDS.map((f, i) => (
                <div
                  key={f.id}
                  ref={el => { fieldRefs.current[i] = el; }}
                  className="rounded-lg p-2.5 border-l-4 transition-shadow"
                  style={{
                    borderLeftColor: f.color,
                    backgroundColor: f.color + '0F',
                    transformOrigin: 'left center',
                  }}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-base">{f.icon}</span>
                    <span className="text-[10px] uppercase tracking-widest font-bold" style={{ color: f.color }}>
                      {t(`insideBlock.fields.${f.id}.label`)}
                    </span>
                  </div>
                  <div className="font-mono text-sm text-foreground">{f.value}</div>
                </div>
              ))}
            </div>
          </div>
        </div>


        {/* Definitions on the right */}
        <div className="flex flex-col gap-2.5 justify-between">
          {ANATOMY_FIELDS.map((f, i) => (
            <div
              key={f.id}
              ref={el => { defRefs.current[i] = el; }}
              className="rounded-lg bg-card border-l-4 p-3"
              style={{
                borderLeftColor: f.color,
                opacity: 0,
                transform: 'translateX(20px)',
              }}
            >
              <div className="flex items-baseline gap-2 mb-1">
                <span className="text-xs">{f.icon}</span>
                <span className="text-[10px] uppercase tracking-widest font-bold" style={{ color: f.color }}>
                  {t(`insideBlock.fields.${f.id}.label`)}
                </span>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">{t(`insideBlock.fields.${f.id}.desc`)}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-6 flex justify-center">
        <button
          onClick={runReveal}
          className="px-4 py-2 rounded-xl border border-border text-sm text-muted-foreground hover:text-foreground hover:border-foreground transition-all"
        >
          {t('insideBlock.replay')}
        </button>
      </div>
    </div>
  );
}

/* ── PrevHashExercise — chain the blocks ─────────────────────────────────── */
const CHAIN_BLOCKS = [
  { number: 0, hash: '0x000000', prevHash: '—',        prevHashRevealed: true  },
  { number: 1, hash: '0x1a2b3c', prevHash: '0x000000', prevHashRevealed: false },
  { number: 2, hash: '0x4d5e6f', prevHash: '0x1a2b3c', prevHashRevealed: false },
];

const PREV_HASH_OPTION_VALUES = ['0x000000', '0x1a2b3c', '0x4d5e6f', '0x9f3c21'];

function PrevHashExercise() {
  const { t } = useTranslation('blockchain-fundamentals/section-1');
  const [answers, setAnswers]   = useState<Record<number, string>>({ 1: '', 2: '' });
  const [checked, setChecked]   = useState(false);

  const allAnswered = answers[1] !== '' && answers[2] !== '';
  const isCorrect   = (n: number) => answers[n] === CHAIN_BLOCKS[n].prevHash;
  const score       = checked ? [1, 2].filter(n => isCorrect(n)).length : 0;

  const reset = () => { setAnswers({ 1: '', 2: '' }); setChecked(false); };

  const blockBorder = (n: number) => {
    if (!checked) return 'border-border';
    return isCorrect(n) ? 'border-[#10b981]' : 'border-[#ef4444]';
  };

  const chainLinkColor = (fromBlock: number) => {
    if (!checked) return '#6b7280';
    return isCorrect(fromBlock + 1) ? '#10b981' : '#ef4444';
  };

  return (
    <div className="max-w-5xl w-full">
      <div className="text-center mb-8">
        <div className="size-14 rounded-full bg-[#ED1C24]/20 flex items-center justify-center mx-auto mb-4">
          <span className="text-2xl">🔗</span>
        </div>
        <h2 className="text-3xl font-bold text-foreground mb-2">{t('prevHashExercise.heading')}</h2>
        <p className="text-sm text-muted-foreground max-w-lg mx-auto">
          {t('prevHashExercise.leadA')} <span className="text-[#ED1C24] font-semibold">{t('prevHashExercise.leadStrong')}</span>{t('prevHashExercise.leadB')}{' '}
          <span className="text-[#ED1C24] font-semibold">{t('prevHashExercise.leadPrev')}</span> {t('prevHashExercise.leadC')}
        </p>
      </div>

      <div className="flex items-center gap-0">
        {CHAIN_BLOCKS.map((block, i) => (
          <div key={block.number} className="flex items-center flex-1">
            <div className={`flex-1 rounded-xl border-2 bg-card transition-colors overflow-hidden ${blockBorder(block.number)}`}>
              <div className="px-4 py-2 bg-muted/40 border-b border-border flex items-center justify-between">
                <span className="font-mono text-xs font-bold text-muted-foreground">{t('prevHashExercise.blockLabel', { n: block.number })}</span>
                {checked && !block.prevHashRevealed && (
                  <span className="text-sm">{isCorrect(block.number) ? '✓' : '✗'}</span>
                )}
              </div>

              <div className="p-4 space-y-2.5 text-xs">
                <div>
                  <span className="text-muted-foreground uppercase tracking-widest text-[10px]">{t('prevHashExercise.dataLabel')}</span>
                  <div className="font-mono text-foreground mt-0.5 truncate">{t(`prevHashExercise.blocks.${block.number}`)}</div>
                </div>

                <div>
                  <span className="text-muted-foreground uppercase tracking-widest text-[10px]">{t('prevHashExercise.hashLabel')}</span>
                  <div className="font-mono text-[#39B54A] mt-0.5">{block.hash}</div>
                </div>

                <div>
                  <span className="text-muted-foreground uppercase tracking-widest text-[10px]">{t('prevHashExercise.prevHashLabel')}</span>
                  {block.prevHashRevealed ? (
                    <div className="font-mono text-[#6366f1] mt-0.5">{block.prevHash}</div>
                  ) : (
                    <select
                      disabled={checked}
                      value={answers[block.number]}
                      onChange={e => setAnswers(prev => ({ ...prev, [block.number]: e.target.value }))}
                      className={`mt-1 w-full font-mono text-xs rounded-lg px-2 py-1.5 border bg-background text-foreground
                        focus:outline-none focus:ring-1 focus:ring-[#ED1C24] cursor-pointer transition-colors
                        ${checked
                          ? isCorrect(block.number)
                            ? 'border-[#10b981] text-[#10b981]'
                            : 'border-[#ef4444] text-[#ef4444]'
                          : answers[block.number]
                            ? 'border-[#6366f1]'
                            : 'border-border'
                        }`}
                    >
                      <option value="" disabled>{t('prevHashExercise.pickPrev')}</option>
                      {PREV_HASH_OPTION_VALUES.map(v => (
                        <option key={v} value={v}>{t(`prevHashExercise.options.${v}`)}</option>
                      ))}
                    </select>
                  )}
                </div>

                {checked && !block.prevHashRevealed && (
                  <div className={`text-[10px] rounded-lg px-2 py-1.5 ${
                    isCorrect(block.number)
                      ? 'bg-[#10b981]/10 text-[#10b981]'
                      : 'bg-[#ef4444]/10 text-[#ef4444]'
                  }`}>
                    {isCorrect(block.number)
                      ? t('prevHashExercise.correctMsg', { prev: block.number - 1 })
                      : t('prevHashExercise.wrongMsg', { expected: block.prevHash, prev: block.number - 1 })
                    }
                  </div>
                )}
              </div>
            </div>

            {i < CHAIN_BLOCKS.length - 1 && (
              <div className="flex flex-col items-center mx-1 shrink-0">
                <svg width="32" height="20" viewBox="0 0 32 20">
                  <line x1="0" y1="10" x2="24" y2="10" stroke={chainLinkColor(i)} strokeWidth="2" />
                  <polygon points="24,5 32,10 24,15" fill={chainLinkColor(i)} />
                </svg>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="flex items-center justify-center gap-4 mt-8">
        {!checked && (
          <button
            onClick={() => setChecked(true)}
            disabled={!allAnswered}
            className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${
              allAnswered
                ? 'bg-[#39B54A] text-white hover:opacity-90 shadow-lg shadow-[#39B54A]/30'
                : 'bg-muted text-muted-foreground cursor-not-allowed'
            }`}
          >
            {t('prevHashExercise.checkAnswers')}
          </button>
        )}
        {checked && (
          <div className="flex items-center gap-6">
            <div className="text-center">
              <div
                className="text-3xl font-black"
                style={{ color: score === 2 ? '#10b981' : '#ef4444' }}
              >
                {score}/2
              </div>
              <div className="text-xs text-muted-foreground mt-0.5">
                {score === 2 ? t('prevHashExercise.perfectChain') : t('prevHashExercise.reviewHashes')}
              </div>
            </div>
            <button
              onClick={reset}
              className="px-4 py-2 rounded-xl border border-border text-sm text-muted-foreground hover:text-foreground hover:border-foreground transition-all"
            >
              {t('prevHashExercise.tryAgain')}
            </button>
          </div>
        )}
      </div>

      {checked && (
        <div className="mt-6 p-4 rounded-xl bg-[#6366f1]/10 border border-[#6366f1]/30 text-sm text-center text-muted-foreground max-w-xl mx-auto">
          {t('prevHashExercise.insightIcon')} <span className="font-semibold text-[#6366f1]">{t('prevHashExercise.insightStrong')}</span> {t('prevHashExercise.insightBody')}
        </div>
      )}
    </div>
  );
}

/* ── Tamper Cascade (NEW) ─────────────────────────────────── */
const ZERO_HASH = '0'.repeat(64);

interface CascadeBlock {
  index: number;
  data: string;
  prevHash: string;
  hash: string;
}

async function computeCascadeHash(b: { index: number; data: string; prevHash: string }): Promise<string> {
  return sha256(`${b.index}|${b.data}|${b.prevHash}|0`);
}

async function buildCascadeChain(items: string[]): Promise<CascadeBlock[]> {
  const blocks: CascadeBlock[] = [];
  let prev = ZERO_HASH;
  for (let i = 0; i < items.length; i++) {
    const data = items[i] ?? '';
    const hash = await computeCascadeHash({ index: i, data, prevHash: prev });
    blocks.push({ index: i, data, prevHash: prev, hash });
    prev = hash;
  }
  return blocks;
}

async function recomputeFromEdit(blocks: CascadeBlock[], editedIndex: number, newData: string): Promise<CascadeBlock[]> {
  const next = blocks.map(b => ({ ...b }));
  const edited = next[editedIndex];
  if (!edited) return next;
  edited.data = newData;
  edited.hash = await computeCascadeHash(edited);
  return next;
}

function chainValidity(blocks: CascadeBlock[]): { blocks: ('valid' | 'invalid')[]; links: boolean[] } {
  const blockValidity: ('valid' | 'invalid')[] = [];
  const linkValidity: boolean[] = [];
  let broken = false;

  for (let i = 0; i < blocks.length; i++) {
    if (i > 0) {
      const prev = blocks[i - 1];
      const ok = !!prev && blocks[i].prevHash === prev.hash;
      if (!ok) broken = true;
      linkValidity.push(!broken);
    }
    blockValidity.push(broken ? 'invalid' : 'valid');
  }

  return { blocks: blockValidity, links: linkValidity };
}

function CascadeBlockCard({
  block,
  validity,
  editable,
  onChange,
}: {
  block: CascadeBlock;
  validity: 'valid' | 'invalid';
  editable: boolean;
  onChange: (v: string) => void;
}) {
  const { t } = useTranslation('blockchain-fundamentals/section-1');
  const invalid = validity === 'invalid';
  return (
    <div className={`flex-1 min-w-0 rounded-xl border-2 bg-card overflow-hidden transition-colors duration-300 ${
      invalid ? 'border-[#ef4444]' : 'border-[#39B54A]'
    }`}>
      <div className="px-3 py-1.5 bg-muted/40 border-b border-border flex items-center justify-between">
        <span className="font-mono text-[10px] font-bold text-muted-foreground">{t('cascade.blockLabel', { n: block.index })}</span>
        {invalid && <span className="text-xs text-[#ef4444]">✗</span>}
        {!editable && <span className="text-[9px] text-muted-foreground uppercase">{t('cascade.readOnly')}</span>}
      </div>
      <div className="p-3 space-y-2 text-xs">
        <div>
          <span className="text-[10px] uppercase tracking-widest text-muted-foreground">{t('cascade.dataLabel')}</span>
          {editable ? (
            <input
              type="text"
              value={block.data}
              onChange={(e) => onChange(e.target.value)}
              className="w-full font-mono text-xs text-foreground mt-0.5 bg-transparent border-b border-border focus:border-[#6366f1] focus:outline-none py-0.5"
              spellCheck={false}
            />
          ) : (
            <div className="font-mono text-xs text-foreground mt-0.5 truncate">{block.data}</div>
          )}
        </div>
        <div>
          <span className="text-[10px] uppercase tracking-widest text-muted-foreground">{t('cascade.prevHashLabel')}</span>
          <div
            className={`font-mono text-[10px] mt-0.5 truncate ${invalid ? 'text-[#ef4444] line-through' : 'text-[#6366f1]'}`}
            title={block.prevHash}
          >
            {block.prevHash.slice(0, 14)}…
          </div>
        </div>
        <div>
          <span className="text-[10px] uppercase tracking-widest text-muted-foreground">{t('cascade.hashLabel')}</span>
          <div
            className="font-mono text-[10px] text-[#39B54A] mt-0.5 truncate"
            title={block.hash}
          >
            {block.hash.slice(0, 14)}…
          </div>
        </div>
      </div>
    </div>
  );
}

function TamperCascade() {
  const { t } = useTranslation('blockchain-fundamentals/section-1');
  const cascadeInitial = useMemo(() => t('cascade.initialData', { returnObjects: true }) as string[], [t]);
  const cascadeIdle = t('cascade.idleMessage');
  const cascadeMsg = useCallback((editedIndex: number, total: number): string => {
    const affected = total - 1 - editedIndex;
    if (affected <= 0) return t('cascade.nothingDownstream');
    return affected === 1
      ? t('cascade.brokenMessageSingular', { n: editedIndex, count: affected })
      : t('cascade.brokenMessagePlural',   { n: editedIndex, count: affected });
  }, [t]);
  const [blocks, setBlocks] = useState<CascadeBlock[]>([]);
  const [actualValidity, setActualValidity] = useState<('valid' | 'invalid')[]>([]);
  const [actualLinks, setActualLinks] = useState<boolean[]>([]);
  const [revealedUpTo, setRevealedUpTo] = useState(-1);
  const [sideMsg, setSideMsg] = useState(cascadeIdle);

  const blocksRef = useRef<CascadeBlock[]>([]);
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const reduceMotionRef = useRef(false);

  useEffect(() => { blocksRef.current = blocks; }, [blocks]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      reduceMotionRef.current = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    buildCascadeChain(cascadeInitial).then(chain => {
      if (cancelled) return;
      const v = chainValidity(chain);
      setBlocks(chain);
      setActualValidity(v.blocks);
      setActualLinks(v.links);
    });
    return () => { cancelled = true; };
  }, [cascadeInitial]);

  const clearTimers = useCallback(() => {
    timersRef.current.forEach(t => clearTimeout(t));
    timersRef.current = [];
  }, []);

  function runCascade(nextBlocks: CascadeBlock[], nextLinks: boolean[], editedIndex: number) {
    clearTimers();
    const firstBroken = nextLinks.findIndex(v => !v);

    if (firstBroken === -1) {
      setRevealedUpTo(-1);
      setSideMsg(t('cascade.cleanMessage'));
      return;
    }

    setRevealedUpTo(firstBroken);

    if (reduceMotionRef.current) {
      setRevealedUpTo(nextBlocks.length - 1);
      setSideMsg(cascadeMsg(editedIndex, nextBlocks.length));
      return;
    }

    for (let step = firstBroken + 1; step < nextBlocks.length; step++) {
      const stepIndex = step;
      const delay = (stepIndex - firstBroken) * 400;
      timersRef.current.push(setTimeout(() => {
        setRevealedUpTo(stepIndex);
      }, delay));
    }

    const finalDelay = (nextBlocks.length - 1 - firstBroken) * 400 + 200;
    timersRef.current.push(setTimeout(() => {
      setSideMsg(cascadeMsg(editedIndex, nextBlocks.length));
    }, finalDelay));
  }

  function handleChange(blockIndex: number, newData: string) {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      const next = await recomputeFromEdit(blocksRef.current, blockIndex, newData);
      const v = chainValidity(next);
      setBlocks(next);
      setActualValidity(v.blocks);
      setActualLinks(v.links);
      runCascade(next, v.links, blockIndex);
    }, 200);
  }

  async function handleReset() {
    clearTimers();
    if (debounceRef.current) clearTimeout(debounceRef.current);
    const chain = await buildCascadeChain(cascadeInitial);
    const v = chainValidity(chain);
    setBlocks(chain);
    setActualValidity(v.blocks);
    setActualLinks(v.links);
    setRevealedUpTo(-1);
    setSideMsg(cascadeIdle);
  }

  const displayValidity = actualValidity.map((v, i) =>
    revealedUpTo === -1 || i <= revealedUpTo ? v : 'valid'
  );
  const displayLinks = actualLinks.map((v, i) =>
    revealedUpTo === -1 || revealedUpTo > i ? v : true
  );

  if (blocks.length === 0) {
    return <div className="text-muted-foreground text-center py-12">{t('cascade.computingGenesis')}</div>;
  }

  return (
    <div className="max-w-5xl w-full">
      <div className="text-center mb-5">
        <div className="size-12 rounded-full bg-[#ED1C24]/20 flex items-center justify-center mx-auto mb-3 text-xl">⚡</div>
        <h2 className="text-2xl lg:text-3xl font-bold text-foreground mb-1">{t('cascade.heading')}</h2>
        <p className="text-sm text-muted-foreground max-w-xl mx-auto">
          {t('cascade.lead')}
        </p>
      </div>

      <div className="flex items-stretch gap-0 mb-5">
        {blocks.map((block, i) => (
          <div key={block.index} className="flex items-center flex-1 min-w-0">
            <CascadeBlockCard
              block={block}
              validity={displayValidity[i] ?? 'valid'}
              editable={i > 0}
              onChange={(v) => handleChange(i, v)}
            />
            {i < blocks.length - 1 && (
              <div className="flex items-center mx-1 shrink-0">
                <svg width="28" height="14" viewBox="0 0 28 14">
                  <line
                    x1="0" y1="7" x2="20" y2="7"
                    stroke={displayLinks[i] ? '#10b981' : '#ef4444'}
                    strokeWidth="2"
                    style={{ transition: 'stroke 300ms' }}
                  />
                  <polygon
                    points="20,3 28,7 20,11"
                    fill={displayLinks[i] ? '#10b981' : '#ef4444'}
                    style={{ transition: 'fill 300ms' }}
                  />
                </svg>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="flex gap-4 items-start max-w-3xl mx-auto">
        <div className="flex-1 p-4 rounded-xl bg-[#6366f1]/10 border-l-4 border-[#6366f1]">
          <div className="text-[10px] font-bold text-[#6366f1] uppercase tracking-widest mb-1">{t('cascade.whatHappened')}</div>
          <p className="text-sm text-foreground/90 leading-relaxed">{sideMsg}</p>
        </div>
        <button
          onClick={handleReset}
          className="shrink-0 px-4 py-2 rounded-xl border border-border text-sm text-muted-foreground hover:text-foreground hover:border-foreground transition-all"
        >
          {t('cascade.reset')}
        </button>
      </div>

      <div className="mt-6 text-center max-w-2xl mx-auto">
        <p className="text-sm italic text-foreground">
          <span className="font-semibold not-italic">{t('cascade.moralStrong')}</span>{' '}
          {t('cascade.moralBody')}
        </p>
      </div>
    </div>
  );
}

/* ── Network Topology Demo ─────────────────────────────────── */
type TopoMode = 'centralized' | 'decentralized' | 'distributed';
interface TopoNode { id: string; x: number; y: number; size?: number }
interface TopoEdge { a: string; b: string }
interface Topology { nodes: TopoNode[]; edges: TopoEdge[] }

const TOPOLOGIES: Record<TopoMode, Topology> = {
  centralized: {
    nodes: [
      { id: 'c',  x: 160, y: 140, size: 14 },
      { id: 's0', x: 260, y: 140 },
      { id: 's1', x: 218, y: 222 },
      { id: 's2', x: 126, y: 240 },
      { id: 's3', x: 44,  y: 200 },
      { id: 's4', x: 44,  y: 80  },
      { id: 's5', x: 140, y: 30  },
      { id: 's6', x: 250, y: 58  },
    ],
    edges: ['s0','s1','s2','s3','s4','s5','s6'].map(s => ({ a: 'c', b: s })),
  },
  decentralized: {
    nodes: [
      { id: 'h0', x: 60,  y: 70,  size: 11 },
      { id: 'h1', x: 215, y: 50,  size: 11 },
      { id: 'h2', x: 140, y: 215, size: 11 },
      { id: 'h3', x: 275, y: 175, size: 11 },
      { id: 'l0a', x: 20,  y: 25  },
      { id: 'l0b', x: 18,  y: 135 },
      { id: 'l1a', x: 175, y: 6   },
      { id: 'l1b', x: 270, y: 12  },
      { id: 'l1c', x: 255, y: 100 },
      { id: 'l2a', x: 80,  y: 262 },
      { id: 'l2b', x: 195, y: 262 },
      { id: 'l3a', x: 305, y: 230 },
    ],
    edges: [
      { a: 'h0', b: 'h1' }, { a: 'h1', b: 'h2' }, { a: 'h2', b: 'h3' }, { a: 'h0', b: 'h2' }, { a: 'h1', b: 'h3' },
      { a: 'h0', b: 'l0a' }, { a: 'h0', b: 'l0b' },
      { a: 'h1', b: 'l1a' }, { a: 'h1', b: 'l1b' }, { a: 'h1', b: 'l1c' },
      { a: 'h2', b: 'l2a' }, { a: 'h2', b: 'l2b' },
      { a: 'h3', b: 'l3a' },
    ],
  },
  distributed: {
    nodes: [
      { id: 'p1',  x: 45,  y: 55  },
      { id: 'p2',  x: 130, y: 28  },
      { id: 'p3',  x: 235, y: 60  },
      { id: 'p4',  x: 295, y: 30  },
      { id: 'p5',  x: 80,  y: 130 },
      { id: 'p6',  x: 180, y: 115 },
      { id: 'p7',  x: 270, y: 140 },
      { id: 'p8',  x: 35,  y: 215 },
      { id: 'p9',  x: 135, y: 230 },
      { id: 'p10', x: 215, y: 245 },
      { id: 'p11', x: 295, y: 220 },
    ],
    edges: [
      { a: 'p1', b: 'p2'  }, { a: 'p1', b: 'p5'  },
      { a: 'p2', b: 'p3'  }, { a: 'p2', b: 'p5'  }, { a: 'p2', b: 'p6' },
      { a: 'p3', b: 'p4'  }, { a: 'p3', b: 'p6'  }, { a: 'p3', b: 'p7' },
      { a: 'p4', b: 'p7'  },
      { a: 'p5', b: 'p6'  }, { a: 'p5', b: 'p8'  }, { a: 'p5', b: 'p9' },
      { a: 'p6', b: 'p7'  }, { a: 'p6', b: 'p9'  }, { a: 'p6', b: 'p10' },
      { a: 'p7', b: 'p10' }, { a: 'p7', b: 'p11' },
      { a: 'p8', b: 'p9'  },
      { a: 'p9', b: 'p10' },
      { a: 'p10', b: 'p11' },
    ],
  },
};

const MODE_COLORS: Record<TopoMode, string> = {
  centralized:   '#ED1C24',
  decentralized: '#f59e0b',
  distributed:   '#39B54A',
};

function largestConnected(topo: Topology, failed: Set<string>): Set<string> {
  const adj = new Map<string, string[]>();
  for (const n of topo.nodes) adj.set(n.id, []);
  for (const e of topo.edges) { adj.get(e.a)!.push(e.b); adj.get(e.b)!.push(e.a); }

  const visited = new Set<string>();
  let best = new Set<string>();
  for (const n of topo.nodes) {
    if (failed.has(n.id) || visited.has(n.id)) continue;
    const comp = new Set<string>();
    const stack = [n.id];
    while (stack.length) {
      const cur = stack.pop()!;
      if (comp.has(cur)) continue;
      comp.add(cur);
      visited.add(cur);
      for (const nb of adj.get(cur) || []) if (!failed.has(nb) && !comp.has(nb)) stack.push(nb);
    }
    if (comp.size > best.size) best = comp;
  }
  return best;
}

function NetworkTopologyDemo() {
  const { t } = useTranslation('blockchain-fundamentals/section-1');
  const [mode, setMode] = useState<TopoMode>('centralized');
  const [failed, setFailed] = useState<Set<string>>(new Set());

  const topo = TOPOLOGIES[mode];
  const infoColor   = MODE_COLORS[mode];
  const infoLabel   = t(`networkTopo.modes.${mode}.label`);
  const infoTagline = t(`networkTopo.modes.${mode}.tagline`);
  const infoLesson  = t(`networkTopo.modes.${mode}.lesson`);
  const info = { color: infoColor, label: infoLabel, tagline: infoTagline, lesson: infoLesson };
  const total = topo.nodes.length;
  const aliveCount = total - failed.size;
  const main = largestConnected(topo, failed);
  const connected = main.size;
  const isolated = aliveCount - connected;

  let status: { color: string; label: string };
  if (aliveCount === 0)              status = { color: '#ED1C24', label: t('networkTopo.status.down') };
  else if (connected === aliveCount) status = { color: '#39B54A', label: t('networkTopo.status.operational', { connected, total }) };
  else if (connected / aliveCount <= 0.5) status = { color: '#ED1C24', label: t('networkTopo.status.broken', { connected, total, isolated }) };
  else                               status = { color: '#f59e0b', label: t('networkTopo.status.degraded', { connected, total, isolated }) };

  const toggleNode = (id: string) => {
    setFailed(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const switchMode = (m: TopoMode) => {
    setMode(m);
    setFailed(new Set());
  };

  const nodeFill = (id: string) => {
    if (failed.has(id)) return '#ED1C24';
    if (main.has(id))   return info.color;
    return '#9ca3af';
  };

  return (
    <div className="w-full flex flex-col gap-3">
      <div className="grid grid-cols-3 gap-1.5">
        {(['centralized','decentralized','distributed'] as TopoMode[]).map(m => {
          const active = m === mode;
          const c = { color: MODE_COLORS[m], label: t(`networkTopo.modes.${m}.label`) };
          return (
            <button
              key={m}
              onClick={() => switchMode(m)}
              className="px-2.5 py-2 rounded-lg border-2 text-xs font-bold transition-colors"
              style={{
                borderColor: active ? c.color : 'var(--border)',
                backgroundColor: active ? c.color + '15' : 'transparent',
                color: active ? c.color : 'var(--foreground)',
              }}
            >
              {c.label}
            </button>
          );
        })}
      </div>

      <div className="bg-card rounded-xl border border-border p-2">
        <svg viewBox="0 0 320 280" className="w-full h-auto" role="img" aria-label={`${info.label} ${t('networkTopo.ariaSuffix')}`}>
          {topo.edges.map((e, i) => {
            const a = topo.nodes.find(n => n.id === e.a)!;
            const b = topo.nodes.find(n => n.id === e.b)!;
            const dead = failed.has(e.a) || failed.has(e.b);
            return (
              <line
                key={i}
                x1={a.x} y1={a.y} x2={b.x} y2={b.y}
                stroke={dead ? '#ED1C2440' : info.color + '70'}
                strokeWidth={1.5}
                strokeDasharray={dead ? '3 3' : undefined}
              />
            );
          })}
          {topo.nodes.map(n => {
            const r = n.size ?? 9;
            const fill = nodeFill(n.id);
            const isFailed = failed.has(n.id);
            return (
              <g key={n.id} onClick={() => toggleNode(n.id)} style={{ cursor: 'pointer' }}>
                {!isFailed && main.has(n.id) && (
                  <circle cx={n.x} cy={n.y} r={r + 5} fill={fill} opacity={0.12} />
                )}
                <circle cx={n.x} cy={n.y} r={r} fill={fill} stroke="#fff" strokeWidth={2} />
                {isFailed && (
                  <>
                    <line x1={n.x - r * 0.55} y1={n.y - r * 0.55} x2={n.x + r * 0.55} y2={n.y + r * 0.55} stroke="#fff" strokeWidth={2} />
                    <line x1={n.x + r * 0.55} y1={n.y - r * 0.55} x2={n.x - r * 0.55} y2={n.y + r * 0.55} stroke="#fff" strokeWidth={2} />
                  </>
                )}
              </g>
            );
          })}
        </svg>
      </div>

      <div className="flex items-center gap-2">
        <div className="flex-1 px-3 py-2 rounded-lg border-2 text-xs font-bold flex items-center gap-2"
             style={{ borderColor: status.color + '60', backgroundColor: status.color + '12', color: status.color }}>
          <span className="size-2 rounded-full" style={{ backgroundColor: status.color }} />
          {status.label}
        </div>
        <button
          onClick={() => setFailed(new Set())}
          disabled={failed.size === 0}
          className="px-2.5 py-2 rounded-lg bg-muted text-xs font-semibold text-muted-foreground hover:bg-muted/80 disabled:opacity-40 transition-colors"
        >
          {t('networkTopo.reset')}
        </button>
      </div>

      <div className="px-3 py-2 rounded-lg text-[11px] text-muted-foreground leading-snug"
           style={{ backgroundColor: info.color + '08', borderLeft: `3px solid ${info.color}` }}>
        <span className="font-semibold text-foreground">{info.label}.</span> {info.tagline}{' '}
        <span className="italic">{info.lesson}</span>
      </div>
    </div>
  );
}

/* ── Control Sorter: who is in charge? (governance axis, not network shape) ── */
type NetworkCategory = 'centralized' | 'decentralized';

interface SortItem {
  id: string;
  icon: string;
  correct: NetworkCategory;
}

// Answer key is about CONTROL (who can freeze / censor / shut it down), not network shape.
// Google's servers are distributed, yet control is centralized — one company. DNS is the fuzzy one.
const SORT_ITEMS: SortItem[] = [
  { id: 'bofa',       icon: '🏦', correct: 'centralized'   },
  { id: 'google',     icon: '🔍', correct: 'centralized'   },
  { id: 'visa',       icon: '💳', correct: 'centralized'   },
  { id: 'dns',        icon: '🌐', correct: 'centralized'   },
  { id: 'email',      icon: '📧', correct: 'decentralized' },
  { id: 'mastodon',   icon: '🐘', correct: 'decentralized' },
  { id: 'bitcoin',    icon: '₿',  correct: 'decentralized' },
  { id: 'ipfs',       icon: '📦', correct: 'decentralized' },
  { id: 'bittorrent', icon: '⬇️', correct: 'decentralized' },
];

const SORT_CATEGORIES: { id: NetworkCategory; color: string }[] = [
  { id: 'centralized',   color: '#ED1C24' },
  { id: 'decentralized', color: '#39B54A' },
];

function NetworkTypeSorter() {
  const { t } = useTranslation('blockchain-fundamentals/section-1');
  const [placements, setPlacements] = useState<Record<string, NetworkCategory | null>>(() =>
    Object.fromEntries(SORT_ITEMS.map(i => [i.id, null]))
  );
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [checked, setChecked] = useState(false);

  const allPlaced = SORT_ITEMS.every(i => placements[i.id] != null);
  const pool = SORT_ITEMS.filter(i => placements[i.id] == null);
  const correctCount = checked ? SORT_ITEMS.filter(i => placements[i.id] === i.correct).length : 0;

  const itemsByCategory = (cat: NetworkCategory) =>
    SORT_ITEMS.filter(i => placements[i.id] === cat);

  const handleItemClick = (id: string) => {
    if (checked) return;
    setSelectedId(prev => (prev === id ? null : id));
  };

  const handleCategoryClick = (cat: NetworkCategory) => {
    if (checked) return;
    if (selectedId) {
      setPlacements(prev => ({ ...prev, [selectedId]: cat }));
      setSelectedId(null);
    }
  };

  const handlePlacedItemClick = (id: string) => {
    if (checked) return;
    // Remove from category back to pool
    setPlacements(prev => ({ ...prev, [id]: null }));
    setSelectedId(null);
  };

  const reset = () => {
    setPlacements(Object.fromEntries(SORT_ITEMS.map(i => [i.id, null])));
    setSelectedId(null);
    setChecked(false);
  };

  const resultColor = correctCount === SORT_ITEMS.length ? '#10b981'
    : correctCount >= 7 ? '#f59e0b'
    : '#ef4444';

  return (
    <div className="w-full max-w-[1100px] mx-auto">
      {/* Header */}
      <div className="text-center mb-5">
        <div className="size-12 rounded-full bg-[#6366f1]/20 flex items-center justify-center mx-auto mb-3 text-xl">🧩</div>
        <h2 className="text-2xl lg:text-3xl font-bold text-foreground mb-2">{t('sortSystems.heading')}</h2>
        <p className="text-sm text-muted-foreground max-w-2xl mx-auto">
          {t('sortSystems.lead')}
        </p>
      </div>

      {/* Pool */}
      <div className="mb-5">
        <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold text-center mb-2">
          {checked ? t('sortSystems.items') : pool.length > 0 ? t('sortSystems.pickN', { n: pool.length }) : t('sortSystems.allPlacedHeader')}
        </p>
        <div className="flex flex-wrap justify-center gap-2 min-h-[56px]">
          {pool.length === 0 && !checked && (
            <div className="text-xs text-muted-foreground italic py-3">{t('sortSystems.allPlacedNote')}</div>
          )}
          {pool.map(item => {
            const isSelected = selectedId === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleItemClick(item.id)}
                disabled={checked}
                className={`flex items-center gap-2 px-3 py-2 rounded-xl border-2 bg-card text-sm font-bold transition-all ${
                  isSelected
                    ? 'border-[#6366f1] bg-[#6366f1]/15 shadow-lg shadow-[#6366f1]/30 scale-105'
                    : 'border-border hover:border-[#6366f1]/60 cursor-pointer'
                }`}
              >
                <span className="text-base">{item.icon}</span>
                <span className="text-foreground">{t(`sortSystems.items_.${item.id}.label`)}</span>
                {isSelected && <span className="text-[10px] text-[#6366f1]">{t('sortSystems.selected')}</span>}
              </button>
            );
          })}
        </div>
      </div>

      {/* 2 category zones: centralized vs decentralized control */}
      <div className="grid grid-cols-2 gap-3">
        {SORT_CATEGORIES.map(cat => {
          const placed = itemsByCategory(cat.id);
          const isTarget = !!selectedId && !checked;
          return (
            <div
              key={cat.id}
              onClick={() => handleCategoryClick(cat.id)}
              className={`relative rounded-xl border-2 transition-all min-h-[180px] ${
                isTarget ? 'cursor-pointer ring-2 ring-offset-2 ring-offset-background' : ''
              }`}
              style={{
                borderColor: cat.color + (isTarget ? 'FF' : '60'),
                backgroundColor: cat.color + (isTarget ? '15' : '08'),
                ['--tw-ring-color' as 'color']: isTarget ? cat.color : 'transparent',
              } as React.CSSProperties}
            >
              {/* Header */}
              <div
                className="px-3 py-2 border-b font-bold text-center"
                style={{ borderColor: cat.color + '40', color: cat.color }}
              >
                <div className="text-sm">{t(`sortSystems.categories.${cat.id}.label`)}</div>
                <div className="text-[10px] font-normal text-muted-foreground mt-0.5 leading-snug">
                  {t(`sortSystems.categories.${cat.id}.desc`)}
                </div>
              </div>

              {/* Placed items */}
              <div className="p-3 flex flex-wrap gap-1.5 min-h-[100px] items-start content-start">
                {placed.length === 0 && !selectedId && (
                  <div className="text-[11px] text-muted-foreground/50 italic w-full text-center pt-4">
                    {t('sortSystems.dropHere')}
                  </div>
                )}
                {placed.length === 0 && selectedId && (
                  <div
                    className="text-[11px] font-bold w-full text-center pt-4"
                    style={{ color: cat.color }}
                  >
                    {t('sortSystems.placeHere')}
                  </div>
                )}
                {placed.map(item => {
                  const isRight = checked && item.correct === cat.id;
                  const isWrong = checked && item.correct !== cat.id;
                  return (
                    <button
                      key={item.id}
                      onClick={e => { e.stopPropagation(); handlePlacedItemClick(item.id); }}
                      disabled={checked}
                      className="flex flex-wrap items-center gap-x-1.5 px-2 py-1 rounded-lg border bg-card text-xs font-bold transition-colors text-left"
                      style={{
                        borderColor: isRight ? '#10b981' : isWrong ? '#ef4444' : cat.color + '60',
                        backgroundColor: isRight ? '#10b98115' : isWrong ? '#ef444415' : 'var(--card)',
                        cursor: checked ? 'default' : 'pointer',
                      }}
                    >
                      <span className="text-sm">{item.icon}</span>
                      <span className="text-foreground">{t(`sortSystems.items_.${item.id}.label`)}</span>
                      {checked && (
                        <span style={{ color: isRight ? '#10b981' : '#ef4444' }}>
                          {isRight ? '✓' : '✗'}
                        </span>
                      )}
                      {checked && (
                        <span className="basis-full text-[10px] font-normal text-muted-foreground leading-snug">
                          {t(`sortSystems.items_.${item.id}.hint`)}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Controls + result */}
      <div className="mt-5 flex items-center justify-center gap-4 min-h-[44px]">
        {!checked ? (
          <button
            onClick={() => setChecked(true)}
            disabled={!allPlaced}
            className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${
              allPlaced
                ? 'bg-[#39B54A] text-white hover:opacity-90 shadow-lg shadow-[#39B54A]/30'
                : 'bg-muted text-muted-foreground cursor-not-allowed'
            }`}
          >
            {t('sortSystems.checkAnswers')}
          </button>
        ) : (
          <div className="flex items-center gap-5">
            <div className="text-center">
              <div className="text-3xl font-black" style={{ color: resultColor }}>
                {correctCount}/{SORT_ITEMS.length}
              </div>
              <div className="text-[10px] text-muted-foreground uppercase tracking-widest mt-0.5">
                {correctCount === SORT_ITEMS.length ? t('sortSystems.results.perfect') : correctCount >= 7 ? t('sortSystems.results.almost') : t('sortSystems.results.review')}
              </div>
            </div>
            <button
              onClick={reset}
              className="px-4 py-2 rounded-xl border border-border text-sm text-muted-foreground hover:text-foreground hover:border-foreground transition-all"
            >
              {t('sortSystems.tryAgain')}
            </button>
          </div>
        )}
      </div>

      {checked && correctCount < SORT_ITEMS.length && (
        <div className="mt-4 p-3 rounded-xl bg-[#6366f1]/10 border border-[#6366f1]/30 text-xs text-muted-foreground max-w-xl mx-auto">
          <span className="font-semibold text-[#6366f1]">{t('sortSystems.hintLabel')}</span> {t('sortSystems.hintBody')}{' '}
          <em>{t('sortSystems.hintBodyEm')}</em> {t('sortSystems.hintBodyTail')}
        </div>
      )}
    </div>
  );
}

/* ── Chain Builder Exercise ─────────────────────────────────── */
const BUILDER_BLOCKS = [
  { id: 'b0', hash: '0x0000ab' },
  { id: 'b1', hash: '0x1a2b3c' },
  { id: 'b2', hash: '0x4d5e6f' },
  { id: 'b3', hash: '0x7c8d9e' },
] as const;

type BuilderBlockId = typeof BUILDER_BLOCKS[number]['id'];
const SCRAMBLED_IDS: BuilderBlockId[] = ['b2', 'b0', 'b3', 'b1'];

function BuilderBlockCard({ block }: { block: typeof BUILDER_BLOCKS[number] }) {
  const { t } = useTranslation('blockchain-fundamentals/section-1');
  return (
    <div className="p-3 space-y-2.5 text-xs">
      <div>
        <div className="text-[10px] text-muted-foreground uppercase tracking-widest mb-0.5">{t('chainBuilder.cardDataLabel')}</div>
        <div className="font-mono text-foreground truncate">{t(`chainBuilder.blocks.${block.id}.data`)}</div>
      </div>
      <div>
        <div className="text-[10px] text-muted-foreground uppercase tracking-widest mb-0.5">{t('chainBuilder.cardPrevHashLabel')}</div>
        <div className="font-mono text-[#6366f1]">{t(`chainBuilder.blocks.${block.id}.prevHash`)}</div>
      </div>
      <div>
        <div className="text-[10px] text-muted-foreground uppercase tracking-widest mb-0.5">{t('chainBuilder.cardHashLabel')}</div>
        <div className="font-mono text-[#39B54A]">{block.hash}</div>
      </div>
    </div>
  );
}

function ChainBuilderExercise() {
  const { t } = useTranslation('blockchain-fundamentals/section-1');
  const [placements, setPlacements] = useState<Partial<Record<number, BuilderBlockId>>>({});
  const [selected, setSelected]     = useState<BuilderBlockId | null>(null);
  const [checked, setChecked]       = useState(false);
  const [showHint, setShowHint]     = useState(false);

  const placedIds = Object.values(placements) as BuilderBlockId[];
  const pool      = SCRAMBLED_IDS.filter(id => !placedIds.includes(id));
  const allFilled = placedIds.length === BUILDER_BLOCKS.length;

  const getBlock = (id: BuilderBlockId) => BUILDER_BLOCKS.find(b => b.id === id)!;
  /** Each block's expected prevHash is the previous block's hash (b0 is genesis = 0x000000) */
  const expectedPrevHash = (id: BuilderBlockId): string => {
    const idx = BUILDER_BLOCKS.findIndex(b => b.id === id);
    return idx === 0 ? '0x000000' : BUILDER_BLOCKS[idx - 1].hash;
  };
  const isSlotCorrect = (i: number) => placements[i] === `b${i}`;

  const isLinkValid = (i: number) => {
    const from = placements[i];
    const to   = placements[i + 1];
    if (!from || !to) return false;
    return expectedPrevHash(to) === getBlock(from).hash;
  };

  const score = checked ? [0, 1, 2, 3].filter(i => isSlotCorrect(i)).length : 0;

  const handlePoolClick = (id: BuilderBlockId) => {
    if (checked) return;
    setSelected(prev => (prev === id ? null : id));
  };

  const handleSlotClick = (slotIndex: number) => {
    if (checked) return;
    if (selected) {
      setPlacements(prev => {
        const next = { ...prev };
        for (const k in next) { if (next[+k] === selected) delete next[+k]; }
        next[slotIndex] = selected;
        return next;
      });
      setSelected(null);
    } else {
      const blockId = placements[slotIndex];
      if (blockId) {
        setPlacements(prev => { const next = { ...prev }; delete next[slotIndex]; return next; });
        setSelected(blockId);
      }
    }
  };

  const reset = () => { setPlacements({}); setSelected(null); setChecked(false); setShowHint(false); };

  const resultColor = score === 4 ? '#10b981' : score >= 2 ? '#f59e0b' : '#ef4444';
  const resultMsg   = score === 4
    ? t('chainBuilder.resultPerfect')
    : score >= 2
    ? t('chainBuilder.resultClose')
    : t('chainBuilder.resultReview');

  return (
    <div className="max-w-5xl w-full">
      <div className="text-center mb-6">
        <div className="size-14 rounded-full bg-[#6366f1]/20 flex items-center justify-center mx-auto mb-3 text-2xl">🔗</div>
        <h2 className="text-3xl font-bold text-foreground mb-2">{t('chainBuilder.heading')}</h2>
        <p className="text-sm text-muted-foreground max-w-xl mx-auto">
          {t('chainBuilder.leadA')} <span className="text-[#ED1C24] font-semibold">{t('chainBuilder.leadScrambled')}</span>{t('chainBuilder.leadB')}{' '}
          <span className="font-mono text-[#6366f1] font-semibold">{t('chainBuilder.leadPrev')}</span> {t('chainBuilder.leadAnd')}{' '}
          <span className="font-mono text-[#39B54A] font-semibold">{t('chainBuilder.leadHash')}</span> {t('chainBuilder.leadC')}
          <br /><span className="text-muted-foreground/60 text-xs">{t('chainBuilder.subLead')}</span>
        </p>
      </div>

      <div className="mb-1">
        <p className="text-[10px] text-muted-foreground uppercase tracking-widest mb-2 font-semibold text-center">
          {t('chainBuilder.placeHere')}
        </p>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {[0, 1, 2, 3].map(slotIndex => {
            const blockId    = placements[slotIndex];
            const isOccupied = !!blockId;
            const isRight    = checked && isSlotCorrect(slotIndex);
            const isWrong    = checked && isOccupied && !isSlotCorrect(slotIndex);

            return (
              <div
                key={slotIndex}
                onClick={() => handleSlotClick(slotIndex)}
                className={`
                  rounded-xl border-2 transition-all min-h-[148px]
                  ${!checked ? 'cursor-pointer' : ''}
                  ${!isOccupied ? 'border-dashed' : ''}
                  ${!isOccupied && selected  ? 'border-[#f59e0b] bg-[#f59e0b]/5 hover:bg-[#f59e0b]/10' : ''}
                  ${!isOccupied && !selected ? 'border-border/60 bg-muted/5' : ''}
                  ${isOccupied && !checked   ? 'border-[#6366f1]/50 bg-card hover:border-[#6366f1]' : ''}
                  ${isRight  ? 'border-[#10b981] bg-[#10b981]/5' : ''}
                  ${isWrong  ? 'border-[#ef4444] bg-[#ef4444]/5' : ''}
                `}
              >
                <div className="px-3 py-2 border-b border-border/50 flex items-center justify-between">
                  <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                    {t('chainBuilder.slot', { n: slotIndex + 1 })}
                  </span>
                  {checked && isOccupied && (
                    <span className="text-sm font-bold" style={{ color: isRight ? '#10b981' : '#ef4444' }}>
                      {isRight ? '✓' : '✗'}
                    </span>
                  )}
                </div>

                {isOccupied
                  ? <BuilderBlockCard block={getBlock(blockId)} />
                  : (
                    <div className="flex items-center justify-center h-24 text-xs text-muted-foreground/40">
                      {selected ? t('chainBuilder.dropHere') : t('chainBuilder.empty')}
                    </div>
                  )
                }
              </div>
            );
          })}
        </div>
      </div>

      {checked && (
        <div className="flex items-center justify-around px-2 py-2 mb-3">
          {[0, 1, 2].map(i => {
            const valid    = isLinkValid(i);
            const fromHash = placements[i] ? getBlock(placements[i]!).hash : '—';
            const toNext   = placements[i + 1] ? expectedPrevHash(placements[i + 1]!) : '—';
            return (
              <div key={i} className="flex items-center gap-1 text-[10px] font-mono" style={{ color: valid ? '#10b981' : '#ef4444' }}>
                <span>{fromHash}</span>
                <span className="text-xs font-sans">{valid ? ' ⟶✓' : ' ⟶✗'}</span>
                <span>{toNext}</span>
              </div>
            );
          })}
        </div>
      )}

      <div className="mb-4">
        <p className="text-[10px] text-muted-foreground uppercase tracking-widest mb-2 font-semibold text-center">
          {t('chainBuilder.blockPool')}
        </p>
        <div className={`grid gap-3 min-h-[60px] ${pool.length > 0 ? 'grid-cols-2 lg:grid-cols-4' : 'grid-cols-1'}`}>
          {pool.length === 0 ? (
            <div className="col-span-4 flex items-center justify-center text-sm text-muted-foreground/40 italic py-3">
              {t('chainBuilder.allPlaced')}
            </div>
          ) : pool.map(id => {
            const isSelected = selected === id;
            return (
              <div
                key={id}
                onClick={() => handlePoolClick(id)}
                className={`
                  rounded-xl border-2 cursor-pointer transition-all
                  ${isSelected
                    ? 'border-[#f59e0b] bg-[#f59e0b]/15 shadow-lg shadow-[#f59e0b]/20 scale-[1.02]'
                    : 'border-border bg-card hover:border-[#6366f1]/50'
                  }
                `}
              >
                <div className="px-3 py-2 border-b border-border/50">
                  <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                    {isSelected ? t('chainBuilder.selectedTag') : t('chainBuilder.blockTag')}
                  </span>
                </div>
                <BuilderBlockCard block={getBlock(id)} />
              </div>
            );
          })}
        </div>
      </div>

      {!checked && (
        <div className="flex justify-center mb-3">
          <button
            onClick={() => setShowHint(h => !h)}
            className="text-xs text-muted-foreground hover:text-foreground border border-border rounded-lg px-4 py-2 transition-all"
          >
            {showHint ? t('chainBuilder.hideHint') : t('chainBuilder.showHint')}
          </button>
        </div>
      )}
      {showHint && !checked && (
        <div className="max-w-lg mx-auto mb-4 p-4 rounded-xl bg-[#f59e0b]/10 border border-[#f59e0b]/30 text-sm">
          <p className="font-semibold text-[#f59e0b] mb-1">{t('chainBuilder.hintTitle')}</p>
          <p className="text-muted-foreground text-xs">
            {t('chainBuilder.hintStep1A')} <strong>{t('chainBuilder.hintStep1Genesis')}</strong> {t('chainBuilder.hintStep1B')}{' '}
            <span className="font-mono text-[#6366f1]">{t('chainBuilder.hintStep1PrevHash')}</span> {t('chainBuilder.hintStep1Reads')}{' '}
            <span className="font-mono bg-muted px-1 rounded">{t('chainBuilder.hintStep1Value')}</span>{t('chainBuilder.hintStep1End')}<br />
            {t('chainBuilder.hintStep2A')} <span className="font-mono text-[#6366f1]">{t('chainBuilder.hintStep2PrevHash')}</span> {t('chainBuilder.hintStep2To')}{' '}
            <span className="font-mono text-[#39B54A]">{t('chainBuilder.hintStep2Hash')}</span> {t('chainBuilder.hintStep2End')}
          </p>
        </div>
      )}

      <div className="flex items-center justify-center gap-4">
        {!checked ? (
          <button
            onClick={() => setChecked(true)}
            disabled={!allFilled}
            className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${
              allFilled
                ? 'bg-[#39B54A] text-white hover:opacity-90 shadow-lg shadow-[#39B54A]/30'
                : 'bg-muted text-muted-foreground cursor-not-allowed'
            }`}
          >
            {t('chainBuilder.checkChain')}
          </button>
        ) : (
          <div className="flex items-center gap-6">
            <div className="text-center">
              <div className="text-3xl font-black" style={{ color: resultColor }}>{score}/4</div>
              <div className="text-xs text-muted-foreground mt-0.5">{resultMsg}</div>
            </div>
            <button
              onClick={reset}
              className="px-4 py-2 rounded-xl border border-border text-sm text-muted-foreground hover:text-foreground hover:border-foreground transition-all"
            >
              {t('chainBuilder.tryAgain')}
            </button>
          </div>
        )}
      </div>

      {checked && (
        <div className={`mt-5 p-4 rounded-xl border text-sm text-center max-w-xl mx-auto ${
          score === 4
            ? 'bg-[#10b981]/10 border-[#10b981]/30 text-muted-foreground'
            : 'bg-[#6366f1]/10 border-[#6366f1]/30 text-muted-foreground'
        }`}>
          {score === 4 ? (
            <>
              {t('chainBuilder.perfectIcon')} <span className="font-semibold text-[#10b981]">{t('chainBuilder.perfectStrong')}</span>{' '}
              {t('chainBuilder.perfectBody')}
            </>
          ) : (
            <>
              {t('chainBuilder.imperfectIcon')} <span className="font-semibold text-[#6366f1]">{t('chainBuilder.imperfectStrong')}</span>{' '}
              {t('chainBuilder.imperfectBody')}
            </>
          )}
        </div>
      )}
    </div>
  );
}

/* ── Consensus Protocols Cloud (NEW) ─────────────────────────────────── */
interface ProtocolTag {
  short: string;
  full?: string;
  used?: string;
  color: string;
  size: 'lg' | 'md' | 'sm';
  top: string;
  left: string;
}

const PROTOCOLS: ProtocolTag[] = [
  // Top row
  { short: 'PoH',         full: 'Proof of History',      used: 'Solana',             color: '#22d3ee', size: 'sm', top: '14%', left: '20%' },
  { short: 'PoW',         full: 'Proof of Work',         used: 'Bitcoin',            color: '#ED1C24', size: 'lg', top: '18%', left: '50%' },
  { short: 'NPoS',        full: 'Nominated PoS',         used: 'Polkadot',           color: '#ec4899', size: 'sm', top: '14%', left: '80%' },
  // Upper middle row
  { short: 'Avalanche',   full: 'Avalanche',             used: 'Avalanche',          color: '#facc15', size: 'sm', top: '38%', left: '14%' },
  { short: 'DPoS',        full: 'Delegated PoS',         used: 'EOS · Tron',         color: '#f59e0b', size: 'md', top: '36%', left: '70%' },
  // Middle row
  { short: 'PoS',         full: 'Proof of Stake',        used: 'Ethereum',           color: '#6366f1', size: 'lg', top: '52%', left: '34%' },
  { short: 'PBFT',        full: 'Practical BFT',         used: 'Hyperledger Fabric', color: '#f97316', size: 'sm', top: '54%', left: '66%' },
  // Lower middle row
  { short: 'PoB',         full: 'Proof of Burn',         used: 'Slimcoin',           color: '#a3a3a3', size: 'sm', top: '72%', left: '17%' },
  { short: 'BFT',         full: 'Tendermint BFT',        used: 'Cosmos',             color: '#10b981', size: 'md', top: '72%', left: '50%' },
  { short: 'Raft',        full: 'Raft',                  used: 'private chains',     color: '#64748b', size: 'sm', top: '72%', left: '82%' },
  // Bottom row
  { short: 'PoET',        full: 'Proof of Elapsed Time', used: 'Sawtooth',           color: '#0ea5e9', size: 'sm', top: '90%', left: '24%' },
  { short: 'PoA',         full: 'Proof of Authority',    used: 'private chains',     color: '#8b5cf6', size: 'md', top: '90%', left: '54%' },
  { short: 'PoC',         full: 'Proof of Capacity',     used: 'Chia',               color: '#84cc16', size: 'sm', top: '90%', left: '82%' },
];

const SIZE_CLASSES = {
  lg: { padding: 'px-5 py-2.5', text: 'text-base', shortText: 'text-lg', tier: 'font-black' },
  md: { padding: 'px-4 py-2',   text: 'text-sm',  shortText: 'text-base', tier: 'font-bold' },
  sm: { padding: 'px-3 py-1.5', text: 'text-xs',  shortText: 'text-sm',  tier: 'font-bold' },
};

function ConsensusProtocolsCloud() {
  const { t } = useTranslation('blockchain-fundamentals/section-1');
  const containerRef = useRef<HTMLDivElement | null>(null);
  const tagRefs      = useRef<(HTMLDivElement | null)[]>([]);
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    if (!containerRef.current) return;
    const obs = new IntersectionObserver(entries => {
      for (const e of entries) {
        if (e.isIntersecting && !revealed) {
          setRevealed(true);
          // Reveal tags with stagger
          tagRefs.current.forEach((el, i) => {
            if (!el) return;
            anime.remove(el);
            el.style.opacity = '0';
            el.style.transform = 'scale(0.6)';
            anime({
              targets: el,
              opacity: [0, 1],
              scale: [0.6, 1],
              duration: 520,
              delay: 80 + i * 70,
              easing: 'easeOutBack',
              complete: () => {
                // After fade-in, start a very gentle floating loop on each tag (small drift so they don't bump)
                const driftY = (Math.random() * 3 + 1.5) * (Math.random() < 0.5 ? -1 : 1);
                const driftX = (Math.random() * 2 + 1) * (Math.random() < 0.5 ? -1 : 1);
                const dur = 2800 + Math.random() * 1800;
                anime({
                  targets: el,
                  translateY: driftY,
                  translateX: driftX,
                  duration: dur,
                  easing: 'easeInOutSine',
                  direction: 'alternate',
                  loop: true,
                });
              },
            });
          });
          break;
        }
      }
    }, { threshold: 0.35 });
    obs.observe(containerRef.current);
    return () => obs.disconnect();
  }, [revealed]);

  useEffect(() => {
    return () => {
      tagRefs.current.forEach(el => { if (el) anime.remove(el); });
    };
  }, []);

  return (
    <div className="w-full max-w-[1280px]">
      <div className="text-center mb-4">
        <h2 className="text-2xl lg:text-3xl font-bold text-foreground mb-2">{t('protocols.heading')}</h2>
        <p className="text-sm lg:text-base text-muted-foreground max-w-3xl mx-auto">
          {t('protocols.leadA')}<em>{t('protocols.leadQuestion')}</em>{t('protocols.leadB')}
        </p>
      </div>

      <div
        ref={containerRef}
        className="relative w-full h-[520px] bg-gradient-to-br from-muted/10 via-transparent to-muted/10 rounded-2xl border border-dashed border-border/60 px-4 py-2"
      >
        {PROTOCOLS.map((p, i) => {
          const size = SIZE_CLASSES[p.size];
          return (
            <div
              key={p.short}
              ref={el => { tagRefs.current[i] = el; }}
              className={`absolute rounded-full border-2 bg-card shadow-md whitespace-nowrap ${size.padding}`}
              style={{
                top: p.top,
                left: p.left,
                transform: 'translate(-50%, -50%) scale(0.6)',
                opacity: 0,
                borderColor: p.color,
                boxShadow: `0 4px 14px ${p.color}30`,
              }}
            >
              <div className="flex items-baseline gap-1.5">
                <span className={`${size.shortText} ${size.tier}`} style={{ color: p.color }}>
                  {p.short}
                </span>
                {p.full && p.short !== p.full && (
                  <span className={`${size.text} text-foreground/80 font-medium`}>{p.full}</span>
                )}
              </div>
              {p.used && (
                <div className="text-[10px] text-muted-foreground mt-0.5 font-mono">{p.used}</div>
              )}
            </div>
          );
        })}
      </div>

      <div className="mt-4 max-w-2xl mx-auto text-center">
        <p className="text-xs text-muted-foreground italic">
          {t('protocols.footerA')} <span className="font-semibold text-[#ED1C24] not-italic">{t('protocols.footerPoW')}</span> {t('protocols.footerB')}
        </p>
      </div>
    </div>
  );
}

/* ── Mining Race ─────────────────────────────────── */
const MINERS = [
  { letter: 'A', color: '#ED1C24', pos: { top: '6%',  left: '50%', transform: 'translateX(-50%)' } as CSSProperties },
  { letter: 'B', color: '#6366f1', pos: { top: '34%', right: '3%' } as CSSProperties },
  { letter: 'C', color: '#f59e0b', pos: { bottom: '4%', right: '18%' } as CSSProperties },
  { letter: 'D', color: '#39B54A', pos: { bottom: '4%', left: '18%' } as CSSProperties },
  { letter: 'E', color: '#8b5cf6', pos: { top: '34%', left: '3%' } as CSSProperties },
];

const HEX = '0123456789abcdef';
function randomHex(len: number): string {
  let s = '';
  for (let i = 0; i < len; i++) s += HEX[Math.floor(Math.random() * 16)];
  return s;
}

type MiningPhase = 'idle' | 'racing' | 'won' | 'verifying' | 'added';

const BLOCK_REWARD_BTC = '3.125';
const MINING_TX_CAPACITY = 8;
const TX_PILL_COLORS = ['#ED1C24', '#6366f1', '#f59e0b', '#39B54A', '#8b5cf6', '#22d3ee', '#ec4899', '#0ea5e9'];

const DATA_POOL = [
  '12 → Carol',
  'Bob → Dave: 8',
  'Eve → Frank: 4',
  'Carol → Helen: 6',
  'Dave → Bob: 2',
  'Frank → Eve: 7',
  'Helen → Grace: 5',
  'Grace → Alice: 9',
];

interface ConfirmedBlock {
  n: number;
  data: string;
  hash: string;
}

function MiningRace() {
  const { t } = useTranslation('blockchain-fundamentals/section-1');
  const minerName = useCallback((letter: string) => `${t('mining.minerName')} ${letter}`, [t]);
  const INITIAL_CHAIN: ConfirmedBlock[] = useMemo(() => [
    { n: 0, data: t('mining.genesisData'), hash: '0x000000' },
    { n: 1, data: t('mining.data1'),       hash: '0x1a2b3c' },
    { n: 2, data: t('mining.data2'),       hash: '0x4d5e6f' },
  ], [t]);
  const [phase, setPhase] = useState<MiningPhase>('idle');
  const [winnerIdx, setWinnerIdx] = useState<number | null>(null);
  const [finalNonce, setFinalNonce] = useState('');
  const [finalHash, setFinalHash] = useState('');
  const [verifiedIdxs, setVerifiedIdxs] = useState<number[]>([]);
  const [confirmedBlocks, setConfirmedBlocks] = useState<ConfirmedBlock[]>(INITIAL_CHAIN);
  const [pendingNum, setPendingNum] = useState(3);
  const [pendingData, setPendingData] = useState(DATA_POOL[0]);
  const [isLooping, setIsLooping] = useState(false);
  const [walletBalances, setWalletBalances] = useState<number[]>(() => MINERS.map(() => 0));
  const [blocksMined, setBlocksMined]       = useState<number[]>(() => MINERS.map(() => 0));
  const [pendingTxs, setPendingTxs]         = useState<string[]>([]);

  const minerRefs    = useRef<(HTMLDivElement | null)[]>([]);
  const nonceRefs    = useRef<(HTMLDivElement | null)[]>([]);
  const hashRefs     = useRef<(HTMLDivElement | null)[]>([]);
  const walletRefs   = useRef<(HTMLDivElement | null)[]>([]);
  const rewardRef    = useRef<HTMLDivElement | null>(null);
  const animRef      = useRef<ReturnType<typeof anime> | null>(null);
  const phaseTimers  = useRef<ReturnType<typeof setTimeout>[]>([]);
  const txArrivalTimer = useRef<ReturnType<typeof setInterval> | null>(null);
  const pendingTxsRef  = useRef<string[]>([]);

  // Refs mirroring state for use in async callbacks
  const isLoopingRef    = useRef(false);
  const pendingNumRef   = useRef(3);
  const pendingDataRef  = useRef(DATA_POOL[0]);
  useEffect(() => { isLoopingRef.current   = isLooping; },   [isLooping]);
  useEffect(() => { pendingNumRef.current  = pendingNum; },  [pendingNum]);
  useEffect(() => { pendingDataRef.current = pendingData; }, [pendingData]);
  useEffect(() => { pendingTxsRef.current  = pendingTxs; },  [pendingTxs]);

  useEffect(() => {
    return () => {
      animRef.current?.pause();
      phaseTimers.current.forEach(t => clearTimeout(t));
      if (txArrivalTimer.current) clearInterval(txArrivalTimer.current);
    };
  }, []);

  useEffect(() => {
    if (phase === 'added' && rewardRef.current) {
      anime.remove(rewardRef.current);
      anime({
        targets: rewardRef.current,
        translateY: [0, -36],
        opacity: [0, 1],
        scale: [0.6, 1],
        duration: 700,
        easing: 'easeOutQuad',
      });
    }

    // Pay the winner's wallet exactly once when 'added' is reached
    if (phase === 'added' && winnerIdx !== null) {
      setWalletBalances(prev => prev.map((b, i) => i === winnerIdx ? b + parseFloat(BLOCK_REWARD_BTC) : b));
      setBlocksMined(prev   => prev.map((c, i) => i === winnerIdx ? c + 1 : c));
      // Brief pulse on the winner's wallet row
      const walletEl = walletRefs.current[winnerIdx];
      if (walletEl) {
        anime.remove(walletEl);
        anime({
          targets: walletEl,
          scale: [1, 1.06, 1],
          duration: 500,
          easing: 'easeOutQuad',
        });
      }
    }
  }, [phase, winnerIdx]);

  const clearMinerDisplays = useCallback(() => {
    for (let i = 0; i < MINERS.length; i++) {
      const n = nonceRefs.current[i];
      const h = hashRefs.current[i];
      if (n) n.textContent = '—';
      if (h) h.textContent = '—';
    }
  }, []);

  function advanceToNextBlock(thisFinalHash: string) {
    if (txArrivalTimer.current) {
      clearInterval(txArrivalTimer.current);
      txArrivalTimer.current = null;
    }
    // Append the just-mined block to the confirmed chain — summary = tx count
    const txCount = pendingTxsRef.current.length || 1;
    setConfirmedBlocks(prev => [
      ...prev,
      { n: pendingNumRef.current, data: `${txCount} ${txCount === 1 ? t('mining.txSingular') : t('mining.txPlural')}`, hash: thisFinalHash.slice(0, 8) },
    ]);

    // Move to the next pending block
    const nextN = pendingNumRef.current + 1;
    pendingNumRef.current = nextN;
    setPendingNum(nextN);
    const nextData = DATA_POOL[(nextN - INITIAL_CHAIN.length) % DATA_POOL.length];
    pendingDataRef.current = nextData;
    setPendingData(nextData);

    // Reset miner state
    setWinnerIdx(null);
    setFinalNonce('');
    setFinalHash('');
    setVerifiedIdxs([]);
    clearMinerDisplays();
    if (rewardRef.current) {
      anime.remove(rewardRef.current);
      rewardRef.current.style.opacity = '0';
      rewardRef.current.style.transform = 'translateY(0) scale(0.6)';
    }

    // Brief breathing room, then start the next race
    setPhase('idle');
    phaseTimers.current.push(setTimeout(() => {
      if (isLoopingRef.current) startRace();
    }, 250));
  }

  function startRace() {
    setPhase('racing');
    setWinnerIdx(null);
    setFinalNonce('');
    setFinalHash('');
    setVerifiedIdxs([]);

    // Begin filling the candidate block with arriving transactions
    setPendingTxs([]);
    pendingTxsRef.current = [];
    if (txArrivalTimer.current) clearInterval(txArrivalTimer.current);
    txArrivalTimer.current = setInterval(() => {
      setPendingTxs(prev => {
        if (prev.length >= MINING_TX_CAPACITY) {
          if (txArrivalTimer.current) {
            clearInterval(txArrivalTimer.current);
            txArrivalTimer.current = null;
          }
          return prev;
        }
        const idx = (pendingNumRef.current * MINING_TX_CAPACITY + prev.length) % DATA_POOL.length;
        const next = [...prev, DATA_POOL[idx]];
        pendingTxsRef.current = next;
        return next;
      });
    }, 480);

    const obj = { t: 0 };
    animRef.current = anime({
      targets: obj,
      t: 1,
      duration: 4200,
      easing: 'linear',
      update: () => {
        for (let i = 0; i < MINERS.length; i++) {
          const nEl = nonceRefs.current[i];
          const hEl = hashRefs.current[i];
          if (nEl) nEl.textContent = String(Math.floor(Math.random() * 9999999)).padStart(7, '0');
          if (hEl) hEl.textContent = randomHex(10);
        }
      },
      complete: () => {
        const winner = Math.floor(Math.random() * MINERS.length);
        const finalN = String(1000000 + Math.floor(Math.random() * 9000000));
        const finalH = '0000' + randomHex(56);
        setWinnerIdx(winner);
        setFinalNonce(finalN);
        setFinalHash(finalH);
        setPhase('won');

        // Pin the winner's nonce + hash display
        for (let i = 0; i < MINERS.length; i++) {
          const nEl = nonceRefs.current[i];
          const hEl = hashRefs.current[i];
          if (i === winner) {
            if (nEl) nEl.textContent = finalN;
            if (hEl) hEl.textContent = finalH.slice(0, 10);
          }
        }

        const winnerEl = minerRefs.current[winner];
        if (winnerEl) {
          anime({
            targets: winnerEl,
            scale: [1, 1.08, 1],
            duration: 600,
            easing: 'easeOutQuad',
          });
        }

        // After 700ms: verification stage
        phaseTimers.current.push(setTimeout(() => {
          setPhase('verifying');
          const losers = MINERS.map((_, idx) => idx).filter(idx => idx !== winner);
          losers.forEach((minerIdx, order) => {
            phaseTimers.current.push(setTimeout(() => {
              setVerifiedIdxs(prev => prev.includes(minerIdx) ? prev : [...prev, minerIdx]);
              const el = minerRefs.current[minerIdx];
              if (el) {
                anime({
                  targets: el,
                  scale: [1, 1.04, 1],
                  duration: 280,
                  easing: 'easeOutQuad',
                });
              }
            }, order * 180));
          });

          phaseTimers.current.push(setTimeout(() => {
            setPhase('added');
            // Loop: schedule advancement after admiring the reward
            if (isLoopingRef.current) {
              phaseTimers.current.push(setTimeout(() => {
                if (isLoopingRef.current) advanceToNextBlock(finalH);
              }, 2200));
            }
          }, losers.length * 180 + 300));
        }, 600));
      },
    });
  }

  function startLoop() {
    setIsLooping(true);
    isLoopingRef.current = true;
    startRace();
  }

  function stopLoop() {
    setIsLooping(false);
    isLoopingRef.current = false;
  }

  function reset() {
    animRef.current?.pause();
    animRef.current = null;
    phaseTimers.current.forEach(t => clearTimeout(t));
    phaseTimers.current = [];
    if (txArrivalTimer.current) {
      clearInterval(txArrivalTimer.current);
      txArrivalTimer.current = null;
    }
    setPendingTxs([]);
    pendingTxsRef.current = [];
    if (rewardRef.current) anime.remove(rewardRef.current);
    setIsLooping(false);
    isLoopingRef.current = false;
    setPhase('idle');
    setWinnerIdx(null);
    setFinalNonce('');
    setFinalHash('');
    setVerifiedIdxs([]);
    setConfirmedBlocks(INITIAL_CHAIN);
    pendingNumRef.current = 3;
    setPendingNum(3);
    pendingDataRef.current = DATA_POOL[0];
    setPendingData(DATA_POOL[0]);
    setWalletBalances(MINERS.map(() => 0));
    setBlocksMined(MINERS.map(() => 0));
    clearMinerDisplays();
  }

  // Truncate the chain to the most recent 4 confirmed blocks + an "...earlier" indicator
  const VISIBLE_CONFIRMED = 4;
  const hasMore = confirmedBlocks.length > VISIBLE_CONFIRMED;
  const visibleConfirmed = hasMore
    ? confirmedBlocks.slice(-VISIBLE_CONFIRMED)
    : confirmedBlocks;

  return (
    <div className="w-full max-w-[1280px]">
      <div className="text-center mb-4">
        <div className="size-12 rounded-full bg-[#f59e0b]/20 flex items-center justify-center mx-auto mb-3 text-xl">⛏️</div>
        <h2 className="text-2xl lg:text-3xl font-bold text-foreground mb-1">
          {t('mining.heading', { n: pendingNum })}
        </h2>
        <p className="text-sm lg:text-base text-muted-foreground max-w-3xl mx-auto">
          {t('mining.leadA')}{' '}
          <span className="font-mono text-[#f59e0b] font-semibold">{t('mining.leadCode')}</span>{t('mining.leadB')}
        </p>
      </div>

      {/* Chain so far + pending block — truncated to last few */}
      <div className="flex items-center justify-center gap-2 mb-5 flex-wrap">
        {hasMore && (
          <div className="flex items-center gap-2">
            <div className="px-2 py-1.5 text-[10px] text-muted-foreground italic">
              {t('mining.earlierTag', { n: confirmedBlocks.length - VISIBLE_CONFIRMED })}
            </div>
            <div className="text-[#6366f1] font-bold">→</div>
          </div>
        )}
        {visibleConfirmed.map(b => (
          <div key={b.n} className="flex items-center gap-2">
            <div className="px-3 py-1.5 bg-card border-2 border-[#39B54A]/60 rounded-lg text-xs min-w-[100px]">
              <div className="font-mono text-[10px] text-muted-foreground">{t('mining.blockTag', { n: b.n })}</div>
              <div className="font-mono text-xs text-foreground truncate">{b.data}</div>
              <div className="font-mono text-[10px] text-[#39B54A]">{b.hash}</div>
            </div>
            <div className="text-[#6366f1] font-bold">→</div>
          </div>
        ))}
        <div
          className={`relative bg-card border-2 rounded-lg transition-colors duration-500 w-[210px] ${
            phase === 'added'
              ? 'border-[#39B54A]/70 shadow-[0_0_0_3px_rgba(57,181,74,0.15)]'
              : 'border-dashed border-[#f59e0b]'
          }`}
        >
          {/* Header */}
          <div className="px-2.5 py-1.5 border-b border-border/70 flex items-center justify-between">
            <span className="font-mono text-[10px] text-muted-foreground font-bold">{t('mining.blockTag', { n: pendingNum })}</span>
            <span className="text-[9px] uppercase tracking-widest font-bold" style={{
              color: phase === 'added' ? '#39B54A' : phase === 'racing' ? '#f59e0b' : '#6366f1',
            }}>
              {phase === 'added' ? t('mining.status.mined') : phase === 'racing' ? t('mining.status.filling') : t('mining.status.awaiting')}
            </span>
          </div>

          {/* Tx pool — pills accumulating */}
          <div className="p-2 min-h-[60px]">
            <div className="grid grid-cols-4 gap-1">
              {Array.from({ length: MINING_TX_CAPACITY }).map((_, i) => {
                const tx = pendingTxs[i];
                const isFilled = !!tx;
                const color = TX_PILL_COLORS[i % TX_PILL_COLORS.length];
                return (
                  <div
                    key={i}
                    className="h-5 rounded-sm flex items-center justify-center transition-all duration-300"
                    style={{
                      backgroundColor: isFilled ? color + '25' : 'transparent',
                      border: isFilled ? `1px solid ${color}80` : '1px dashed rgba(115,115,115,0.3)',
                      transform: isFilled ? 'scale(1)' : 'scale(0.9)',
                      opacity: isFilled ? 1 : 0.3,
                    }}
                    title={tx ?? 'pending'}
                  >
                    {isFilled && (
                      <span className="text-[8px] font-mono font-bold" style={{ color }}>
                        tx
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Fill meter + hash */}
          <div className="px-2.5 pb-2 pt-1 border-t border-border/70">
            <div className="flex items-center gap-1.5 mb-1">
              <span className="text-[9px] font-mono text-muted-foreground tabular-nums">
                {pendingTxs.length}/{MINING_TX_CAPACITY}
              </span>
              <div className="flex-1 h-1 rounded-full bg-muted/50 overflow-hidden">
                <div
                  className="h-full transition-all duration-300"
                  style={{
                    width: `${(pendingTxs.length / MINING_TX_CAPACITY) * 100}%`,
                    backgroundColor: phase === 'added' ? '#39B54A' : '#f59e0b',
                  }}
                />
              </div>
            </div>
            <div className={`font-mono text-[10px] truncate ${
              phase === 'added' ? 'text-[#39B54A] font-bold' : 'text-muted-foreground italic'
            }`}>
              {phase === 'added' ? finalHash.slice(0, 14) + '…' : t('mining.awaitingNonce')}
            </div>
          </div>
        </div>
      </div>

      {/* Mining arena + wallet sidebar */}
      <div className="flex items-start gap-5 justify-center flex-wrap lg:flex-nowrap">
      <div className="relative w-full max-w-[820px] h-[440px] bg-muted/20 rounded-2xl border-2 border-dashed border-border/60">
        {/* Central target */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10 px-4 py-3 bg-card border-2 border-[#f59e0b] rounded-xl shadow-lg shadow-[#f59e0b]/20 w-[200px]">
          <div className="text-[10px] uppercase tracking-widest text-muted-foreground text-center mb-1">{t('mining.target')}</div>
          <div className="font-mono text-xs text-foreground text-center mb-2">{t('mining.startsWith')}</div>
          <div className="font-mono text-2xl font-black text-[#f59e0b] text-center tracking-wider">0000…</div>
          <div className="text-[10px] text-muted-foreground text-center mt-2 leading-tight">
            {t('mining.difficulty')}<br />
            {t('mining.rarity')}
          </div>
        </div>

        {/* 5 miner cards */}
        {MINERS.map((m, i) => {
          const isWinner = (phase === 'won' || phase === 'verifying' || phase === 'added') && winnerIdx === i;
          const isLoser  = (phase === 'won' || phase === 'verifying' || phase === 'added') && winnerIdx !== null && winnerIdx !== i;
          const isVerified = (phase === 'verifying' || phase === 'added') && isLoser && verifiedIdxs.includes(i);
          const dimLoser = isLoser && !isVerified && phase !== 'verifying';
          return (
            <div
              key={m.letter}
              ref={el => { minerRefs.current[i] = el; }}
              className={`absolute w-[150px] px-3 py-2 rounded-xl border-2 bg-card text-xs transition-all duration-500 ${
                dimLoser ? 'opacity-50' : ''
              } ${isWinner ? 'shadow-lg' : ''}`}
              style={{
                borderColor: isVerified ? '#39B54A' : m.color + (isWinner ? 'FF' : '80'),
                boxShadow: isWinner ? `0 0 0 3px ${m.color}30` : undefined,
                ...m.pos,
              }}
            >
              {/* Verified badge for losers who checked the work */}
              {isVerified && (
                <div className="absolute -top-2 -right-2 size-6 rounded-full bg-[#39B54A] text-white text-xs flex items-center justify-center font-bold shadow-md">
                  ✓
                </div>
              )}

              {/* Bitcoin reward — floats up over winner on 'added' */}
              {isWinner && phase === 'added' && (
                <div
                  ref={rewardRef}
                  className="absolute -top-7 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-[#f7931a] text-white text-xs font-bold shadow-lg shadow-[#f7931a]/50 whitespace-nowrap pointer-events-none"
                  style={{ opacity: 0 }}
                >
                  ₿ + {BLOCK_REWARD_BTC} BTC
                </div>
              )}

              <div className="flex items-center justify-between mb-1">
                <span className="text-base">💻</span>
                <span className="text-[10px] font-bold" style={{ color: m.color }}>{minerName(m.letter)}</span>
              </div>
              <div className="space-y-1">
                <div>
                  <div className="text-[9px] uppercase tracking-widest text-muted-foreground">{t('mining.nonceLabel')}</div>
                  <div
                    ref={el => { nonceRefs.current[i] = el; }}
                    className="font-mono text-[11px] text-foreground"
                  >
                    —
                  </div>
                </div>
                <div>
                  <div className="text-[9px] uppercase tracking-widest text-muted-foreground">{t('mining.hashTryLabel')}</div>
                  <div
                    ref={el => { hashRefs.current[i] = el; }}
                    className={`font-mono text-[10px] truncate ${isWinner ? 'text-[#39B54A] font-bold' : 'text-muted-foreground'}`}
                  >
                    —
                  </div>
                </div>
              </div>
              {isWinner && (
                <div className="mt-1.5 text-center text-[10px] font-bold text-[#39B54A]">{t('mining.foundIt')}</div>
              )}
              {isVerified && (
                <div className="mt-1.5 text-center text-[10px] font-bold text-[#39B54A]">{t('mining.verified')}</div>
              )}
            </div>
          );
        })}
      </div>

      {/* Wallet sidebar — track each miner's session earnings */}
      <div className="w-full lg:w-[200px] bg-card border border-border rounded-xl p-3 self-stretch">
        <div className="text-[9px] uppercase tracking-widest font-bold text-muted-foreground mb-2 text-center">
          {t('mining.minedSession')}
        </div>
        <div className="space-y-1.5">
          {MINERS.map((m, i) => {
            const isCurrentWinner = (phase === 'won' || phase === 'verifying' || phase === 'added') && winnerIdx === i;
            const count = blocksMined[i] ?? 0;
            return (
              <div
                key={m.letter}
                ref={el => { walletRefs.current[i] = el; }}
                className="flex items-center gap-2 px-2 py-1.5 rounded-lg border transition-colors"
                style={{
                  borderColor: m.color + (isCurrentWinner ? '90' : '30'),
                  backgroundColor: isCurrentWinner ? m.color + '0F' : 'transparent',
                }}
              >
                <span className="text-sm">💻</span>
                <div className="flex-1 min-w-0">
                  <div className="text-[10px] font-bold truncate" style={{ color: m.color }}>{minerName(m.letter)}</div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-[9px] text-muted-foreground font-mono">{count} {count === 1 ? t('mining.blockSingular') : t('mining.blockPlural')}</span>
                  </div>
                </div>
                <div className="font-mono text-[11px] font-bold text-[#f7931a] tabular-nums">
                  ₿{(walletBalances[i] ?? 0).toFixed(3)}
                </div>
              </div>
            );
          })}
        </div>
        <div className="mt-3 pt-2 border-t border-border flex items-baseline justify-between">
          <span className="text-[9px] uppercase tracking-widest text-muted-foreground font-semibold">{t('mining.totalMined')}</span>
          <span className="font-mono text-sm font-bold text-[#f7931a] tabular-nums">
            ₿{walletBalances.reduce((a, b) => a + b, 0).toFixed(3)}
          </span>
        </div>
      </div>
      </div>

      {/* Status + controls */}
      <div className="mt-5 flex items-center justify-center gap-3 min-h-[44px] flex-wrap">
        {/* Status pill — changes with phase */}
        {phase === 'idle' && !isLooping && (
          <button
            onClick={startLoop}
            className="px-6 py-2.5 rounded-xl bg-[#f59e0b] text-white text-sm font-bold hover:opacity-90 shadow-lg shadow-[#f59e0b]/30 transition-all"
          >
            {t('mining.startMining')}
          </button>
        )}
        {phase === 'racing' && (
          <div className="px-5 py-2 rounded-xl bg-[#f59e0b]/10 border border-[#f59e0b]/40 text-sm text-[#f59e0b] font-bold">
            <span className="inline-block animate-pulse mr-1">⛏️</span>
            {t('mining.racingMsg', { n: pendingNum })}
          </div>
        )}
        {phase === 'won' && winnerIdx !== null && (
          <div
            className="px-5 py-2 rounded-xl text-sm font-bold"
            style={{
              backgroundColor: MINERS[winnerIdx].color + '20',
              color: MINERS[winnerIdx].color,
              border: `1px solid ${MINERS[winnerIdx].color}40`,
            }}
          >
            {t('mining.wonMsg', { name: minerName(MINERS[winnerIdx].letter) })}{' '}
            <code className="font-mono font-bold">0000</code>
          </div>
        )}
        {phase === 'verifying' && winnerIdx !== null && (
          <div className="px-5 py-2 rounded-xl bg-[#39B54A]/10 border border-[#39B54A]/40 text-sm text-[#39B54A] font-bold">
            <span className="inline-block animate-pulse mr-1">🔎</span>
            {t('mining.verifyingMsg', { name: minerName(MINERS[winnerIdx].letter), verified: verifiedIdxs.length })}
          </div>
        )}
        {phase === 'added' && winnerIdx !== null && (
          <div className="px-5 py-2 rounded-xl bg-[#39B54A]/10 border border-[#39B54A]/40 text-sm text-[#39B54A] font-bold">
            {t('mining.addedMsg', { n: pendingNum, name: minerName(MINERS[winnerIdx].letter) })}{' '}
            <span className="text-[#f7931a]">₿ {BLOCK_REWARD_BTC} BTC</span>
            {isLooping && <span className="ml-2 text-muted-foreground font-normal italic">{t('mining.nextIn')}</span>}
          </div>
        )}

        {/* Loop controls — visible whenever the race is running */}
        {isLooping && (
          <button
            onClick={stopLoop}
            className="px-4 py-2 rounded-xl border border-[#ef4444]/50 bg-[#ef4444]/10 text-[#ef4444] text-sm font-bold hover:bg-[#ef4444]/15 transition-all"
            title={t('mining.stopLoopTitle')}
          >
            {t('mining.stopLoop')}
          </button>
        )}
        {!isLooping && phase !== 'idle' && (
          <button
            onClick={startLoop}
            className="px-4 py-2 rounded-xl border border-[#39B54A]/50 bg-[#39B54A]/10 text-[#39B54A] text-sm font-bold hover:bg-[#39B54A]/15 transition-all"
          >
            {t('mining.resume')}
          </button>
        )}
        {phase !== 'idle' && (
          <button
            onClick={reset}
            className="px-4 py-2 rounded-xl border border-border text-sm text-muted-foreground hover:text-foreground hover:border-foreground transition-all"
          >
            {t('mining.reset')}
          </button>
        )}
      </div>

      {/* Pedagogical caption */}
      <div className="mt-4 max-w-2xl mx-auto text-center">
        <p className="text-xs text-muted-foreground italic">
          {t('mining.footerA')} <span className="text-[#f7931a] font-semibold not-italic">{t('mining.footerReward', { reward: BLOCK_REWARD_BTC })}</span> {t('mining.footerB')}
        </p>
      </div>
    </div>
  );
}

/* ── MetaMask Tease ─────────────────────────────────── */
function MetaMaskTease() {
  const { t } = useTranslation('blockchain-fundamentals/section-1');
  const foxRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!foxRef.current) return;
    anime.remove(foxRef.current);
    const anim = anime({
      targets: foxRef.current,
      translateY: [-6, 6],
      rotate: [-3, 3],
      duration: 2600,
      direction: 'alternate',
      loop: true,
      easing: 'easeInOutSine',
    });
    return () => { anim.pause(); };
  }, []);

  return (
    <div className="w-full max-w-5xl mx-auto text-center">
      <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-3">
        {t('metamask.headPrefix')}<span className="text-[#f6851b]">{t('metamask.headBrand')}</span>
      </h2>
      <p className="text-base lg:text-lg text-muted-foreground max-w-2xl mx-auto mb-6">
        {t('metamask.lead')}
      </p>

      {/* Fox card — clickable, goes to metamask.io */}
      <a
        href="https://metamask.io"
        target="_blank"
        rel="noopener noreferrer"
        className="inline-block group mb-6"
        aria-label={t('metamask.ariaLabel')}
      >
        <div className="relative">
          {/* Glow */}
          <div className="absolute inset-0 rounded-full bg-[#f6851b] blur-3xl opacity-30 group-hover:opacity-50 transition-opacity" />
          {/* Fox itself */}
          <div
            ref={foxRef}
            className="relative bg-gradient-to-br from-[#f6851b] via-[#e2761b] to-[#cd6116] rounded-3xl p-6 lg:p-8 border-[5px] border-card shadow-2xl shadow-[#f6851b]/40 inline-block"
          >
            <div className="text-8xl lg:text-9xl leading-none select-none drop-shadow-2xl">🦊</div>
          </div>
        </div>
      </a>

      <div className="mb-7">
        <a
          href="https://metamask.io"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-3 px-7 py-3.5 rounded-2xl bg-[#f6851b] hover:bg-[#e2761b] text-white text-base lg:text-lg font-bold shadow-lg shadow-[#f6851b]/40 hover:scale-[1.03] transition-all"
        >
          {t('metamask.cta')}
          <ExternalLink className="size-5" />
        </a>
        <p className="text-xs text-muted-foreground italic mt-3 max-w-lg mx-auto">
          {t('metamask.ctaCaptionA')}{' '}
          <strong className="not-italic text-foreground">{t('metamask.ctaCaptionCourse')}</strong>{t('metamask.ctaCaptionB')}
        </p>
      </div>

      {/* 3 quick facts */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 max-w-3xl mx-auto">
        {(t('metamask.facts', { returnObjects: true }) as Array<{ tag: string; body: string }>).map((f, i) => (
          <div key={i} className="p-4 bg-card rounded-xl border border-[#f6851b]/30 text-left">
            <div className="text-[10px] font-bold uppercase tracking-widest text-[#f6851b] mb-1.5">{f.tag}</div>
            <p className="text-sm text-foreground leading-snug">{f.body}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════ */
/* MAIN SECTION 1                                                          */
/* ═══════════════════════════════════════════════════════════════════════ */
export function Section1() {
  const { t } = useTranslation('blockchain-fundamentals/section-1');
  const section1Chapters = useMemo(
    () =>
      section1ChaptersShape.map((ch) =>
        ch.kind === 'group'
          ? { kind: 'group' as const, id: ch.id, label: t(`groups.${ch.id}`) }
          : { id: ch.id, label: t(`chapters.${ch.id}`) },
      ),
    [t],
  );
  return (
    <div className="size-full flex overflow-hidden">
      <SectionNav chapters={section1Chapters} />
      <div id="section-scroll" className="flex-1 overflow-y-auto snap-y snap-mandatory">
        <div className="slide-flow">

          {/* ═══════ TITLE ═══════ */}
          <div className="h-full">
            <TitleSlide
              sectionNumber={t('title.sectionNumber')}
              title={t('title.title')}
              subtitle={t('title.subtitle')}
              icon={<Blocks className="size-20 text-[#ED1C24]" />}
            />
          </div>

          {/* ═══════ 01 — THE TRUST PROBLEM ═══════ */}
          <div id="s1-trust" className="h-full">
            <ConceptSlide
              title={t('trust.title')}
              description={t('trust.description')}
              visual={
                <div className="flex flex-col gap-4 w-full">
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-2">{t('trust.middlemenHeader')}</p>
                    <div className="grid grid-cols-5 gap-2">
                      {[
                        { emoji: '🏦', key: 'banks' },
                        { emoji: '⚖️', key: 'notaries' },
                        { emoji: '🏛️', key: 'registry' },
                        { emoji: '💳', key: 'paypal' },
                        { emoji: '🔐', key: 'ca' },
                      ].map(ex => (
                        <div key={ex.key} className="p-2.5 bg-muted rounded-lg text-center">
                          <div className="text-xl mb-1">{ex.emoji}</div>
                          <div className="text-xs font-bold text-foreground">{t(`trust.middlemen.${ex.key}.label`)}</div>
                          <div className="text-[10px] text-muted-foreground mt-0.5">{t(`trust.middlemen.${ex.key}.sub`)}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <CalloutBox type="important" title={t('trust.calloutTitle')}>
                    {t('trust.calloutLead')} <em>{t('trust.calloutEm')}</em>{t('trust.calloutTail')}
                  </CalloutBox>
                </div>
              }
              keyPoints={t('trust.keyPoints', { returnObjects: true }) as string[]}
            />
          </div>

          {/* ═══════ 02 — THE SHARED LEDGER (NEW) ═══════ */}
          <div id="s1-ledger" className="h-full">
            <ConceptSlide
              title={t('ledger.title')}
              description={t('ledger.description')}
              visual={<VillageLedgerVisual />}
              keyPoints={t('ledger.keyPoints', { returnObjects: true }) as string[]}
            />
          </div>

          {/* ═══════ 03 — WHAT IS BLOCKCHAIN? ═══════ */}
          <div id="s1-what-is" className="h-full">
            <ConceptSlide
              title={t('whatIs.title')}
              description={t('whatIs.description')}
              visual={
                <div className="space-y-3 w-full">
                  <div className="p-4 bg-card rounded-xl border-2 border-[#6366f1]">
                    <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-2 font-semibold">{t('whatIs.plainDefHeader')}</p>
                    <p className="text-foreground text-sm leading-relaxed">
                      {t('whatIs.plainDefLead')}{' '}
                      <span className="font-semibold text-[#6366f1]">{t('whatIs.plainDefDLT')}</span>{' '}
                      {t('whatIs.plainDefMidA')}{' '}
                      <span className="font-semibold text-foreground">{t('whatIs.plainDefShared')}</span>{t('whatIs.plainDefMidB')}{' '}
                      <span className="font-semibold text-foreground">{t('whatIs.plainDefAppendOnly')}</span>{t('whatIs.plainDefMidC')}{' '}
                      <span className="font-semibold text-foreground">{t('whatIs.plainDefLinked')}</span>{t('whatIs.plainDefTail')}
                    </p>
                  </div>
                  <CalloutBox type="important" title={t('whatIs.calloutTitle')}>
                    {t('whatIs.calloutLead')} <span className="font-mono">{t('whatIs.calloutAddress')}</span>{' '}
                    {t('whatIs.calloutMid')} <span className="font-mono text-[#ED1C24]">{t('whatIs.calloutHex')}</span> {t('whatIs.calloutTail')}
                  </CalloutBox>
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div className="p-2 bg-muted/40 rounded-lg">
                      <div className="text-base">🌐</div>
                      <div className="text-[10px] font-bold text-foreground mt-0.5">{t('whatIs.props.distributed')}</div>
                    </div>
                    <div className="p-2 bg-muted/40 rounded-lg">
                      <div className="text-base">⚖️</div>
                      <div className="text-[10px] font-bold text-foreground mt-0.5">{t('whatIs.props.noAuthority')}</div>
                    </div>
                    <div className="p-2 bg-muted/40 rounded-lg">
                      <div className="text-base">🎭</div>
                      <div className="text-[10px] font-bold text-foreground mt-0.5">{t('whatIs.props.pseudonymous')}</div>
                    </div>
                    <div className="p-2 bg-muted/40 rounded-lg">
                      <div className="text-base">➕</div>
                      <div className="text-[10px] font-bold text-foreground mt-0.5">{t('whatIs.props.appendOnly')}</div>
                    </div>
                    <div className="p-2 bg-muted/40 rounded-lg">
                      <div className="text-base">👁️</div>
                      <div className="text-[10px] font-bold text-foreground mt-0.5">{t('whatIs.props.transparent')}</div>
                    </div>
                    <div className="p-2 bg-muted/40 rounded-lg">
                      <div className="text-base">🔐</div>
                      <div className="text-[10px] font-bold text-foreground mt-0.5">{t('whatIs.props.tamperEvident')}</div>
                    </div>
                  </div>
                </div>
              }
              keyPoints={t('whatIs.keyPoints', { returnObjects: true }) as string[]}
            />
          </div>

          {/* ═══════ 03b — TRANSACTIONS (animated flow) ═══════ */}
          <div id="s1-transaction" className="h-full flex items-center justify-center p-6 lg:p-10">
            <TransactionFlow />
          </div>

          {/* ═══════ 04 — HASHING ═══════ */}
          <div id="s1-hashing" className="h-full">
            <ConceptSlide
              title={t('hashing.title')}
              description={t('hashing.description')}
              visual={
                <div className="space-y-4 w-full">
                  <div className="p-4 bg-card rounded-xl border-2 border-[#6366f1]">
                    <div className="text-sm text-muted-foreground mb-1">{t('hashing.inputLabel')}</div>
                    <div className="font-mono text-foreground mb-2">"Hello World"</div>
                    <div className="text-sm text-muted-foreground mb-1">{t('hashing.hashLabel')}</div>
                    <div className="font-mono text-xs text-[#6366f1] break-all">
                      a591a6d40bf420404a011733cfb7b190d62c65bf0bcda32b57b277d9ad9f146e
                    </div>
                  </div>
                  <div className="p-4 bg-card rounded-xl border-2 border-[#8b5cf6]">
                    <div className="text-sm text-muted-foreground mb-1">{t('hashing.inputLabel')}</div>
                    <div className="font-mono text-foreground mb-2">"Hello World!"</div>
                    <div className="text-sm text-muted-foreground mb-1">{t('hashing.hashLabel')}</div>
                    <div className="font-mono text-xs text-[#8b5cf6] break-all">
                      7f83b1657ff1fc53b92dc18148a1d65dfc2d4b1fa3d677284addd200126d9069
                    </div>
                  </div>
                  <InteractiveHash />
                </div>
              }
              keyPoints={t('hashing.keyPoints', { returnObjects: true }) as string[]}
            />
          </div>

          {/* ── Quick check: avalanche ── */}
          <div className="h-full">
            <QuizSlide
              question={t('quizAvalanche.question')}
              options={(t('quizAvalanche.options', { returnObjects: true }) as string[]).map((text, i) => ({ text, correct: i === 2 }))}
              explanation={t('quizAvalanche.explanation')}
            />
          </div>

          {/* ═══════ 04 — LINKING BLOCKS ═══════ */}
          <div id="s1-chain" className="h-full flex items-center justify-center p-6 lg:p-10">
            <LinkedBlocksReveal />
          </div>

          {/* Chain Builder — practice reconstruction by following the hashes */}
          <div id="s1-builder" className="h-full flex items-center justify-center p-8 lg:p-12">
            <ChainBuilderExercise />
          </div>

          {/* Inside a single block — animated anatomy */}
          <div className="h-full flex items-center justify-center p-6 lg:p-10">
            <InsideBlockAnatomy />
          </div>

          {/* PrevHashExercise — practice the link */}
          <div className="h-full flex items-center justify-center p-8">
            <PrevHashExercise />
          </div>

          {/* ── Quick check: prev hash purpose ── */}
          <div className="h-full">
            <QuizSlide
              question={t('quizPrevHash.question')}
              options={(t('quizPrevHash.options', { returnObjects: true }) as string[]).map((text, i) => ({ text, correct: i === 1 }))}
              explanation={t('quizPrevHash.explanation')}
            />
          </div>

          {/* ═══════ 05 — THE CASCADE (NEW) ═══════ */}
          <div id="s1-cascade" className="h-full flex items-center justify-center p-6">
            <TamperCascade />
          </div>

          {/* ═══════ 06 — THE NETWORK ═══════ */}
          <div id="s1-network" className="h-full">
            <div className="slide-template w-full flex flex-col p-5 lg:p-8">
              <div className="shrink-0 mb-3">
                <h2 className="text-2xl lg:text-3xl font-bold text-foreground mb-1">{t('network.heading')}</h2>
                <p className="text-sm lg:text-base text-muted-foreground max-w-3xl">
                  {t('network.lead')}
                </p>
              </div>

              <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-[1.05fr_1fr] gap-4 lg:gap-6">
                <div className="flex items-center justify-center">
                  <NetworkTopologyDemo />
                </div>

                <div className="flex flex-col justify-center gap-3">
                  {(['#ED1C24', '#f59e0b', '#39B54A', '#6366f1']).map((color, i) => {
                    const rows = t('network.rows', { returnObjects: true }) as Array<{ title: string; desc: string }>;
                    const p = rows[i];
                    return (
                      <div
                        key={i}
                        className="flex items-start gap-3 p-3 lg:p-4 bg-card rounded-lg border"
                        style={{ borderColor: color + '40' }}
                      >
                        <div className="size-7 lg:size-8 rounded-full flex items-center justify-center flex-shrink-0 text-white font-bold text-sm"
                             style={{ backgroundColor: color }}>
                          {i + 1}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-bold text-foreground leading-snug">{p.title}</div>
                          <div className="text-xs lg:text-sm text-muted-foreground mt-0.5 leading-snug">{p.desc}</div>
                        </div>
                      </div>
                    );
                  })}
                  <p className="text-xs lg:text-sm text-muted-foreground italic px-1">
                    {t('network.note')}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* ═══════ 06b — SORT THE SYSTEMS (NEW) ═══════ */}
          <div id="s1-network-sort" className="h-full flex items-center justify-center p-6 lg:p-10">
            <NetworkTypeSorter />
          </div>

          {/* ── Quick check: network resilience ── */}
          <div className="h-full">
            <QuizSlide
              question={t('quiz51.question')}
              options={(t('quiz51.options', { returnObjects: true }) as string[]).map((text, i) => ({ text, correct: i === 1 }))}
              explanation={t('quiz51.explanation')}
            />
          </div>

          {/* ═══════ 07 — CONSENSUS ═══════ */}
          <div id="s1-consensus" className="h-full flex items-center justify-center p-8 lg:p-12">
            <div className="max-w-5xl w-full">
              <div className="flex items-center gap-3 mb-1">
                <div className="size-10 rounded-full bg-[#ED1C24]/20 flex items-center justify-center text-xl">⛏️</div>
                <h2 className="text-3xl font-bold text-foreground">{t('consensus.heading')}</h2>
              </div>
              <p className="text-muted-foreground mb-6 ml-[52px] max-w-3xl">
                {t('consensus.leadA')} <span className="text-[#ED1C24] font-semibold">{t('consensus.leadPoW')}</span>{t('consensus.leadB')}
              </p>

              <ConsensusVisualization mechanism="pow" />

              <div className="grid grid-cols-2 gap-3 mt-6">
                <div className="p-3 bg-[#39B54A]/10 rounded-lg border border-[#39B54A]/30">
                  <h4 className="text-xs font-bold text-[#39B54A] mb-1">{t('consensus.whyTitle')}</h4>
                  <ul className="text-[11px] text-muted-foreground space-y-1">
                    {(t('consensus.why', { returnObjects: true }) as string[]).map((w, i) => (
                      <li key={i}>• {w}</li>
                    ))}
                  </ul>
                </div>
                <div className="p-3 bg-[#6366f1]/10 rounded-lg border border-[#6366f1]/30">
                  <h4 className="text-xs font-bold text-[#6366f1] mb-1">{t('consensus.altTitle')}</h4>
                  <p className="text-[11px] text-muted-foreground">
                    {t('consensus.altLead')} <span className="font-semibold text-foreground">{t('consensus.altCourse')}</span>{t('consensus.altTail')}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* ═══════ 08 — THE PROTOCOL ZOO ═══════ */}
          <div id="s1-protocols" className="h-full flex items-center justify-center p-6 lg:p-10">
            <ConsensusProtocolsCloud />
          </div>

          {/* ═══════ 09 — MINING RACE (PoW in action, loops) ═══════ */}
          <div id="s1-mining" className="h-full flex items-center justify-center p-6 lg:p-10">
            <MiningRace />
          </div>

          {/* ═══════ 10 — METAMASK TEASE ═══════ */}
          <div id="s1-wallet" className="h-full flex items-center justify-center p-6 lg:p-10">
            <MetaMaskTease />
          </div>

          {/* ═══════ 11 — TAKEAWAYS ═══════ */}
          <div id="s1-takeaways" className="h-full">
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
