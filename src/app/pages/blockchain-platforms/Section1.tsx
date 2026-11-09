import { useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import anime from 'animejs';
import { motion, AnimatePresence } from 'motion/react';
import { TitleSlide } from '../../components/templates/TitleSlide';
import { TakeawaySlide } from '../../components/templates/TakeawaySlide';
import { SectionNav } from '../../components/navigation/SectionNav';
import { SiteFooter } from '../../components/shared/SiteFooter';
import { QuizSlide } from '../../components/templates/QuizSlide';
import { Bitcoin, Zap } from 'lucide-react';
import { UnderTheHood } from '../../components/shared/UnderTheHood';
import { KeyPointBar } from '../../components/shared/KeyPointBar';

// Language-neutral shape — IDs + kind only. Labels resolved via t() at render.
const chapterShape = [
  { id: 's1-handoff' },

  { kind: 'group' as const, id: 'g-s1-arch' },
  { id: 's1-architecture' },
  { id: 's1-tx-lifecycle' },

  { kind: 'group' as const, id: 'g-s1-tradeoffs' },
  { id: 's1-trilemma' },
  { id: 's1-quiz-trilemma' },

  { kind: 'group' as const, id: 'g-s1-apps' },
  { id: 's1-apps' },
  { id: 's1-lightning' },

  { kind: 'group' as const, id: 'g-s1-fit' },
  { id: 's1-bestfits' },
  { id: 's1-quiz-fit' },

  { kind: 'group' as const, id: 'g-s1-wrap' },
  { id: 's1-takeaways' },
] as const;

/* ─────────────────── Lightning vault — animated demo ───────────────────
   A 2-of-2 multisig "vault" between Alice and Bob. Open it → exchange
   off-chain payments freely → Close it to settle balances back on-chain.
   Interactions:
     - Open Channel button   → an on-chain tx animates from Alice + Bob into the vault
     - ⚡ Pay buttons         → fast Lightning flashes that update the channel state
     - Close Vault button    → a settlement tx animates from the vault up to L1
   ──────────────────────────────────────────────────────────────────────── */

const VAULT_DEPOSIT = 1.0;                  // BTC each side commits

function LightningVaultDemo() {
  const { t } = useTranslation('blockchain-platforms/section-1');
  const rootRef       = useRef<HTMLDivElement | null>(null);
  const stepRef       = useRef<HTMLDivElement | null>(null);
  const openPacketA   = useRef<SVGGElement | null>(null);
  const openPacketB   = useRef<SVGGElement | null>(null);
  const settlePacketA = useRef<SVGGElement | null>(null);
  const settlePacketB = useRef<SVGGElement | null>(null);
  const lightningRef  = useRef<SVGGElement | null>(null);
  const newBlockRef   = useRef<SVGGElement | null>(null);
  const vaultBoxRef   = useRef<SVGGElement | null>(null);

  type Phase = 'closed' | 'opening' | 'open' | 'closing' | 'settled';
  const [phase,        setPhase]        = useState<Phase>('closed');
  const [aliceLocked,  setAliceLocked]  = useState(0);     // committed to vault
  const [bobLocked,    setBobLocked]    = useState(0);
  const [aliceShare,   setAliceShare]   = useState(0);     // Alice's claim inside vault
  const [bobShare,     setBobShare]     = useState(0);
  const [paymentLog,   setPaymentLog]   = useState<{ dir: 'A→B' | 'B→A'; amt: number }[]>([]);
  const [aliceWallet,  setAliceWallet]  = useState(5.0);   // off-vault L1 balance
  const [bobWallet,    setBobWallet]    = useState(3.0);

  const setStep = (label: string, color: string) => {
    if (!stepRef.current) return;
    stepRef.current.textContent = label;
    stepRef.current.style.color = color;
    stepRef.current.style.borderColor = color + 'AA';
    stepRef.current.style.backgroundColor = color + '14';
  };

  /* OPEN CHANNEL — one on-chain tx, each side commits VAULT_DEPOSIT BTC. */
  const openChannel = () => {
    if (phase !== 'closed') return;
    setPhase('opening');
    setStep(t('lightning.steps.opening'), '#f59e0b');

    // Reset packet positions
    [openPacketA, openPacketB].forEach(ref => {
      if (!ref.current) return;
      ref.current.style.opacity = '0';
      ref.current.style.transform = 'translate(0, 0)';
    });

    const tl = anime.timeline({ easing: 'easeInOutCubic' });

    // Alice → vault (from 70 → 220 on x axis, slight downward arc)
    tl.add({
      targets: openPacketA.current,
      opacity: [0, 1],
      translateX: [0, 150],
      duration: 900,
    }, 0)
    .add({
      targets: openPacketB.current,
      opacity: [0, 1],
      translateX: [0, -150],
      duration: 900,
    }, 0)
    .add({
      targets: vaultBoxRef.current,
      scale: [1, 1.15, 1],
      duration: 500,
      easing: 'easeOutQuad',
    })
    .add({
      targets: [openPacketA.current, openPacketB.current],
      opacity: 0,
      duration: 300,
      complete: () => {
        setAliceLocked(VAULT_DEPOSIT);
        setBobLocked(VAULT_DEPOSIT);
        setAliceShare(VAULT_DEPOSIT);
        setBobShare(VAULT_DEPOSIT);
        setAliceWallet(w => +(w - VAULT_DEPOSIT).toFixed(4));
        setBobWallet(w => +(w - VAULT_DEPOSIT).toFixed(4));
        setPhase('open');
        setStep(t('lightning.steps.open'), '#10b981');
      },
    });
  };

  /* PAY — pure off-chain balance update + Lightning bolt flash. */
  const pay = (dir: 'A→B' | 'B→A', amount: number) => {
    if (phase !== 'open') return;
    if (dir === 'A→B' && aliceShare < amount) return;
    if (dir === 'B→A' && bobShare   < amount) return;

    setStep(t('lightning.payStep', { dir, amount }), '#8b5cf6');
    setPaymentLog(log => [{ dir, amt: amount }, ...log].slice(0, 6));

    if (dir === 'A→B') {
      setAliceShare(s => +(s - amount).toFixed(4));
      setBobShare(s => +(s + amount).toFixed(4));
    } else {
      setBobShare(s => +(s - amount).toFixed(4));
      setAliceShare(s => +(s + amount).toFixed(4));
    }

    // Flash the lightning bolt over the channel
    if (lightningRef.current) {
      lightningRef.current.style.opacity = '0';
      const dx = dir === 'A→B' ? 1 : -1;
      anime({
        targets: lightningRef.current,
        opacity: [0, 1, 0],
        translateX: [-50 * dx, 50 * dx],
        duration: 700,
        easing: 'easeOutQuad',
      });
    }
  };

  /* CLOSE VAULT — one on-chain settlement tx. Final balances back to wallets. */
  const closeChannel = () => {
    if (phase !== 'open') return;
    setPhase('closing');
    setStep(t('lightning.steps.closing'), '#ED1C24');

    [settlePacketA, settlePacketB].forEach(ref => {
      if (!ref.current) return;
      ref.current.style.opacity = '0';
      ref.current.style.transform = 'translate(0, 0)';
    });
    if (newBlockRef.current) newBlockRef.current.style.opacity = '0';

    const finalA = aliceShare;
    const finalB = bobShare;

    const tl = anime.timeline({ easing: 'easeInOutCubic' });

    // Vault releases tx into the L1 chain
    tl.add({
      targets: newBlockRef.current,
      opacity: [0, 1],
      scale: [0.6, 1],
      duration: 600,
      easing: 'easeOutQuad',
    })
    // Settlement packets fly to each wallet
    .add({
      targets: settlePacketA.current,
      opacity: [0, 1],
      translateX: [0, -150],
      duration: 800,
    })
    .add({
      targets: settlePacketB.current,
      opacity: [0, 1],
      translateX: [0, 150],
      duration: 800,
    }, '-=800')
    .add({
      targets: [settlePacketA.current, settlePacketB.current],
      opacity: 0,
      duration: 300,
      complete: () => {
        setAliceWallet(w => +(w + finalA).toFixed(4));
        setBobWallet(w   => +(w + finalB).toFixed(4));
        setAliceLocked(0);
        setBobLocked(0);
        setAliceShare(0);
        setBobShare(0);
        setPhase('settled');
        setStep(t('lightning.settledStep', { count: paymentLog.length }), '#10b981');
      },
    });
  };

  const reset = () => {
    setPhase('closed');
    setAliceLocked(0); setBobLocked(0); setAliceShare(0); setBobShare(0);
    setAliceWallet(5.0); setBobWallet(3.0); setPaymentLog([]);
    if (newBlockRef.current) newBlockRef.current.style.opacity = '0';
    setStep(t('lightning.steps.idle'), '#737373');
  };

  useEffect(() => {
    setStep(t('lightning.steps.idle'), '#737373');
    if (rootRef.current) {
      const obs = new IntersectionObserver(es => {
        for (const e of es) {
          if (e.isIntersecting && phase === 'closed' && aliceWallet === 5.0) {
            setTimeout(openChannel, 600);
            break;
          }
        }
      }, { threshold: 0.35 });
      obs.observe(rootRef.current);
      return () => obs.disconnect();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div ref={rootRef} className="h-full flex flex-col p-5 lg:p-8">
      {/* Header */}
      <div className="shrink-0 mb-3 flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-[#f59e0b]/15 border border-[#f59e0b]/40 text-[#f59e0b] text-xs font-bold">{t('lightning.badge')}</span>
            <Zap className="size-5 text-[#f59e0b]" />
            <h2 className="text-2xl lg:text-3xl font-bold text-foreground">{t('lightning.heading')}</h2>
            <span className="px-2 py-0.5 bg-[#f59e0b]/20 text-[#f59e0b] rounded text-[10px] font-bold border border-[#f59e0b]/30">{t('lightning.layer2')}</span>
          </div>
          <p className="text-sm text-muted-foreground max-w-3xl mt-1">
            {t('lightning.introA')}<strong className="text-foreground">{t('lightning.introStrong')}</strong>{t('lightning.introB')}<em>{t('lightning.introEm')}</em>{t('lightning.introC')}
          </p>
        </div>
        <div className="shrink-0 flex flex-col gap-1.5 items-end">
          {phase === 'closed' && (
            <button onClick={openChannel} className="px-3 py-1.5 rounded-md bg-[#f59e0b] text-white text-xs font-bold hover:bg-[#f59e0b]/90 transition-colors">{t('lightning.openChannel')}</button>
          )}
          {phase === 'open' && (
            <>
              <button onClick={() => pay('A→B', 0.1)} className="w-full px-3 py-1.5 rounded-md bg-[#6366f1] text-white text-xs font-bold hover:bg-[#6366f1]/90 transition-colors disabled:opacity-50" disabled={aliceShare < 0.1}>{t('lightning.payAliceBob')}</button>
              <button onClick={() => pay('B→A', 0.05)} className="w-full px-3 py-1.5 rounded-md bg-[#39B54A] text-white text-xs font-bold hover:bg-[#39B54A]/90 transition-colors disabled:opacity-50" disabled={bobShare < 0.05}>{t('lightning.payBobAlice')}</button>
              <button onClick={closeChannel} className="w-full px-3 py-1.5 rounded-md bg-[#ED1C24] text-white text-xs font-bold hover:bg-[#ED1C24]/90 transition-colors">{t('lightning.closeVault')}</button>
            </>
          )}
          {phase === 'settled' && (
            <button onClick={reset} className="px-3 py-1.5 rounded-md bg-muted text-foreground text-xs font-bold hover:bg-muted/80 transition-colors">{t('lightning.resetDemo')}</button>
          )}
        </div>
      </div>

      {/* Step caption */}
      <div ref={stepRef} className="shrink-0 mb-3 px-3 py-2 rounded-lg border-2 text-xs font-bold transition-all" style={{ borderColor: '#737373AA', backgroundColor: '#73737314', color: '#737373' }}>
        {t('lightning.steps.idle')}
      </div>

      <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-[1.6fr_1fr] gap-4">
        {/* SVG stage */}
        <div className="rounded-xl border border-border bg-card/40 p-3 min-h-[340px]">
          <svg viewBox="0 0 520 340" className="w-full h-full" style={{ overflow: 'visible' }}>
            {/* L1 chain band */}
            <rect x="20" y="20" width="480" height="64" rx="8" fill="#f7931a14" stroke="#f7931a" strokeWidth="1.2" />
            <text x="40" y="42" fontSize="11" fontWeight="900" fill="#f7931a">{t('lightning.svg.l1Title')}</text>
            <text x="40" y="56" fontSize="9" fill="hsl(var(--muted-foreground))">{t('lightning.svg.l1Sub')}</text>

            {/* OPEN block — labelled so it doesn't blend in with regular chain */}
            <g>
              <rect x="170" y="40" width="36" height="28" rx="2" fill="#10b98140" stroke="#10b981" strokeWidth="1.2" />
              <text x="188" y="58" textAnchor="middle" fontSize="7" fontWeight="800" fill="#10b981">{t('lightning.svg.open')}</text>
            </g>
            {/* Existing chain blocks (decorative) — shifted right so OPEN/CLOSE don't overlap them */}
            {[1, 2, 3, 4].map((i) => (
              <g key={i}>
                <rect x={210 + i * 50} y="40" width="32" height="28" rx="2" fill="#f7931a25" stroke="#f7931a" strokeWidth="0.8" />
                <text x={226 + i * 50} y="58" textAnchor="middle" fontSize="7" fontWeight="800" fill="#f7931a">#{900_000 + i}</text>
              </g>
            ))}
            {/* New CLOSE block — flashes when channel closes, sits at the right edge */}
            <g ref={newBlockRef} style={{ opacity: 0, transformBox: 'fill-box' as React.CSSProperties['transformBox'], transformOrigin: '478px 54px' }}>
              <rect x="460" y="40" width="36" height="28" rx="2" fill="#ED1C2440" stroke="#ED1C24" strokeWidth="1.2" />
              <text x="478" y="58" textAnchor="middle" fontSize="7" fontWeight="800" fill="#ED1C24">{t('lightning.svg.close')}</text>
            </g>

            {/* Alice */}
            <g>
              <circle cx="70" cy="190" r="32" fill="#6366f120" stroke="#6366f1" strokeWidth="1.6" />
              <text x="70" y="186" textAnchor="middle" fontSize="20">👩</text>
              <text x="70" y="208" textAnchor="middle" fontSize="10" fontWeight="900" fill="#6366f1">{t('lightning.svg.alice')}</text>
              <text x="70" y="232" textAnchor="middle" fontSize="9" fontWeight="700" fill="hsl(var(--foreground))">{aliceWallet.toFixed(2)} BTC</text>
              <text x="70" y="246" textAnchor="middle" fontSize="7" fill="hsl(var(--muted-foreground))">{t('lightning.svg.l1Wallet')}</text>
            </g>

            {/* Bob */}
            <g>
              <circle cx="450" cy="190" r="32" fill="#39B54A20" stroke="#39B54A" strokeWidth="1.6" />
              <text x="450" y="186" textAnchor="middle" fontSize="20">👨</text>
              <text x="450" y="208" textAnchor="middle" fontSize="10" fontWeight="900" fill="#39B54A">{t('lightning.svg.bob')}</text>
              <text x="450" y="232" textAnchor="middle" fontSize="9" fontWeight="700" fill="hsl(var(--foreground))">{bobWallet.toFixed(2)} BTC</text>
              <text x="450" y="246" textAnchor="middle" fontSize="7" fill="hsl(var(--muted-foreground))">{t('lightning.svg.l1Wallet')}</text>
            </g>

            {/* Vault (center) */}
            <g ref={vaultBoxRef} style={{ transformBox: 'fill-box' as React.CSSProperties['transformBox'], transformOrigin: '260px 190px' }}>
              <rect x="200" y="140" width="120" height="100" rx="10" fill={aliceLocked + bobLocked > 0 ? '#10b98118' : '#73737318'} stroke={aliceLocked + bobLocked > 0 ? '#10b981' : '#737373'} strokeWidth="1.6" />
              <text x="260" y="160" textAnchor="middle" fontSize="22">{aliceLocked + bobLocked > 0 ? '🔓' : '🔒'}</text>
              <text x="260" y="182" textAnchor="middle" fontSize="10" fontWeight="900" fill={aliceLocked + bobLocked > 0 ? '#10b981' : '#737373'}>{t('lightning.svg.vaultTitle')}</text>
              <text x="260" y="208" textAnchor="middle" fontSize="12" fontWeight="900" fill="hsl(var(--foreground))">{(aliceLocked + bobLocked).toFixed(2)} BTC</text>
              <text x="260" y="223" textAnchor="middle" fontSize="8" fill="hsl(var(--muted-foreground))">{t('lightning.svg.aliceLabel')} {aliceShare.toFixed(2)} · {t('lightning.svg.bobLabel')} {bobShare.toFixed(2)}</text>
            </g>

            {/* Channel lines — Alice ↔ Vault ↔ Bob */}
            <line x1="102" y1="190" x2="200" y2="190" stroke={aliceLocked > 0 ? '#10b981' : '#737373'} strokeWidth="1.4" strokeDasharray={aliceLocked > 0 ? 'none' : '4 4'} />
            <line x1="320" y1="190" x2="418" y2="190" stroke={bobLocked > 0 ? '#10b981' : '#737373'} strokeWidth="1.4" strokeDasharray={bobLocked > 0 ? 'none' : '4 4'} />

            {/* Lightning bolt (flashes on payment) */}
            <g ref={lightningRef} style={{ opacity: 0, transformBox: 'fill-box' as React.CSSProperties['transformBox'], transformOrigin: '260px 190px' }}>
              <text x="260" y="195" textAnchor="middle" fontSize="22" fontWeight="900" fill="#facc15">⚡</text>
            </g>

            {/* Open packets (Alice → vault, Bob → vault) */}
            <g ref={openPacketA} style={{ opacity: 0, transformBox: 'fill-box' as React.CSSProperties['transformBox'], transformOrigin: '70px 130px' }}>
              <rect x="55" y="115" width="32" height="22" rx="3" fill="#6366f1" stroke="#1e1b4b" strokeWidth="0.8" />
              <text x="71" y="131" textAnchor="middle" fontSize="9" fontWeight="900" fill="#fff">1 BTC</text>
            </g>
            <g ref={openPacketB} style={{ opacity: 0, transformBox: 'fill-box' as React.CSSProperties['transformBox'], transformOrigin: '450px 130px' }}>
              <rect x="434" y="115" width="32" height="22" rx="3" fill="#39B54A" stroke="#14532d" strokeWidth="0.8" />
              <text x="450" y="131" textAnchor="middle" fontSize="9" fontWeight="900" fill="#fff">1 BTC</text>
            </g>

            {/* Settle packets (vault → Alice, vault → Bob) */}
            <g ref={settlePacketA} style={{ opacity: 0, transformBox: 'fill-box' as React.CSSProperties['transformBox'], transformOrigin: '230px 270px' }}>
              <rect x="214" y="258" width="40" height="22" rx="3" fill="#6366f1" stroke="#1e1b4b" strokeWidth="0.8" />
              <text x="234" y="274" textAnchor="middle" fontSize="9" fontWeight="900" fill="#fff">{t('lightning.svg.aliceArrow')}</text>
            </g>
            <g ref={settlePacketB} style={{ opacity: 0, transformBox: 'fill-box' as React.CSSProperties['transformBox'], transformOrigin: '290px 270px' }}>
              <rect x="266" y="258" width="40" height="22" rx="3" fill="#39B54A" stroke="#14532d" strokeWidth="0.8" />
              <text x="286" y="274" textAnchor="middle" fontSize="9" fontWeight="900" fill="#fff">{t('lightning.svg.bobArrow')}</text>
            </g>
          </svg>
        </div>

        {/* Side panel — channel state + log */}
        <div className="flex flex-col gap-2 min-h-0 overflow-y-auto">
          <div className="rounded-xl border-2 p-3" style={{ borderColor: phase === 'open' ? '#10b98155' : '#73737355', backgroundColor: phase === 'open' ? '#10b9810d' : '#73737308' }}>
            <div className="text-[10px] font-black uppercase tracking-widest" style={{ color: phase === 'open' ? '#10b981' : '#737373' }}>{t('lightning.panel.channelState')}</div>
            <div className="text-sm font-bold text-foreground mt-0.5">{phase === 'closed' ? t('lightning.panel.stateClosed') : phase === 'opening' ? t('lightning.panel.stateOpening') : phase === 'open' ? t('lightning.panel.stateOpen') : phase === 'closing' ? t('lightning.panel.stateClosing') : t('lightning.panel.stateSettled')}</div>
            <div className="grid grid-cols-2 gap-2 mt-2 text-[11px]">
              <div className="bg-card border border-border rounded-md p-1.5">
                <div className="text-[9px] text-muted-foreground uppercase tracking-widest">{t('lightning.panel.alice')}</div>
                <div className="font-mono font-bold text-[#6366f1]">{aliceShare.toFixed(2)} BTC</div>
              </div>
              <div className="bg-card border border-border rounded-md p-1.5">
                <div className="text-[9px] text-muted-foreground uppercase tracking-widest">{t('lightning.panel.bob')}</div>
                <div className="font-mono font-bold text-[#39B54A]">{bobShare.toFixed(2)} BTC</div>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-border bg-card p-2.5 flex-1 min-h-[120px] overflow-y-auto">
            <div className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1.5">{t('lightning.panel.payments', { count: paymentLog.length })}</div>
            {paymentLog.length === 0 ? (
              <div className="text-[11px] text-muted-foreground italic">{t('lightning.panel.noPayments')}</div>
            ) : (
              <div className="flex flex-col gap-1">
                {paymentLog.map((p, i) => (
                  <div key={i} className="flex items-center gap-2 text-[11px]">
                    <span className="text-[#facc15]">⚡</span>
                    <span className="font-mono font-bold" style={{ color: p.dir === 'A→B' ? '#6366f1' : '#39B54A' }}>{p.dir}</span>
                    <span className="text-foreground">{p.amt.toFixed(2)} BTC</span>
                    <span className="ml-auto text-[9px] text-muted-foreground uppercase tracking-widest">{t('lightning.panel.offChain')}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="rounded-xl p-2.5 text-[11px] text-muted-foreground leading-snug" style={{ borderWidth: '1px', borderColor: '#f59e0b40', backgroundColor: '#f59e0b08' }}>
            <strong className="text-[#f59e0b]">{t('lightning.panel.trickLabel')}</strong>{t('lightning.panel.trickBody')}
          </div>
        </div>
      </div>
      <KeyPointBar text={t('lightning.keyPoint')} className="shrink-0 mt-3 lg:mr-20" />
    </div>
  );
}

/* ─────────── Transaction flow, end to end — animated systemisation recap ───────────
   8 platform-neutral stages from wallet to irreversible. A single tx packet rides
   through each stage; auto-plays on scroll-in, ↻ Replay always available.
   ──────────────────────────────────────────────────────────────────────────────── */

// Language-neutral stage metadata. Text (title/what/note) comes from t() by index.
const TX_STAGES = [
  { n: 1, emoji: '👛', zone: '#f59e0b' },
  { n: 2, emoji: '📡', zone: '#6366f1' },
  { n: 3, emoji: '🔁', zone: '#6366f1' },
  { n: 4, emoji: '⏳', zone: '#06b6d4' },
  { n: 5, emoji: '⛏️', zone: '#8b5cf6' },
  { n: 6, emoji: '🧱', zone: '#39B54A' },
  { n: 7, emoji: '🔒', zone: '#16a34a' },
  { n: 8, emoji: '✅', zone: '#10b981' },
];

interface TxStageText { title: string; what: string; note: string; }

function TxLifecycleAnimated() {
  const { t } = useTranslation('blockchain-platforms/section-1');
  const stageText = t('txLifecycle.stages', { returnObjects: true }) as TxStageText[];
  const rootRef    = useRef<HTMLDivElement | null>(null);
  const packetRef  = useRef<HTMLDivElement | null>(null);
  const stepRef    = useRef<HTMLDivElement | null>(null);
  const cardRefs   = useRef<(HTMLDivElement | null)[]>([]);
  const [phase, setPhase] = useState<'idle' | 'playing'>('idle');
  const playedRef  = useRef(false);

  const play = () => {
    if (phase === 'playing') return;
    setPhase('playing');

    // Reset all stage cards
    cardRefs.current.forEach((c) => {
      if (!c) return;
      c.style.boxShadow = 'none';
      c.style.borderColor = 'hsl(var(--border))';
    });
    if (packetRef.current) {
      packetRef.current.style.opacity = '0';
      packetRef.current.style.transform = 'translate(0, 0)';
    }
    if (stepRef.current) {
      stepRef.current.textContent = t('txLifecycle.starting');
    }

    const tl = anime.timeline({
      easing: 'easeInOutCubic',
      complete: () => setPhase('idle'),
    });

    // Reveal packet at stage 1 position
    tl.add({
      targets: packetRef.current,
      opacity: [0, 1],
      scale: [0.6, 1],
      duration: 350,
      easing: 'easeOutQuad',
      changeBegin: () => moveTo(0),
    });

    // For each subsequent stage, slide the packet over + highlight the card
    for (let i = 1; i < TX_STAGES.length; i++) {
      tl.add({
        targets: packetRef.current,
        translateX: i * 100, // each card is ~100px wide on the timeline
        duration: 750,
        changeBegin: () => moveTo(i),
      });
    }
    // Final pulse
    tl.add({
      targets: packetRef.current,
      scale: [1, 1.5, 1],
      duration: 600,
      easing: 'easeOutQuad',
    });

    function moveTo(i: number) {
      const stage = TX_STAGES[i];
      const text = stageText[i];
      // Highlight current card
      cardRefs.current.forEach((c, k) => {
        if (!c) return;
        if (k === i) {
          c.style.boxShadow = `0 0 0 2px ${stage.zone}, 0 6px 18px ${stage.zone}40`;
          c.style.borderColor = stage.zone;
        } else {
          c.style.boxShadow = 'none';
          c.style.borderColor = 'hsl(var(--border))';
        }
      });
      if (stepRef.current) {
        stepRef.current.textContent = t('txLifecycle.stageCaption', { n: stage.n, title: text.title, what: text.what });
        stepRef.current.style.color = stage.zone;
        stepRef.current.style.borderColor = stage.zone + 'AA';
        stepRef.current.style.backgroundColor = stage.zone + '14';
      }
    }
  };

  useEffect(() => {
    if (!rootRef.current) return;
    const obs = new IntersectionObserver(es => {
      for (const e of es) {
        if (e.isIntersecting && !playedRef.current) {
          playedRef.current = true;
          setTimeout(play, 400);
          break;
        }
      }
    }, { threshold: 0.35 });
    obs.observe(rootRef.current);
    return () => obs.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div ref={rootRef} className="h-full flex flex-col p-5 lg:p-8">
      {/* Header */}
      <div className="shrink-0 mb-3 flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-[#f59e0b]/15 border border-[#f59e0b]/40 text-[#f59e0b] text-xs font-bold">{t('txLifecycle.badge')}</span>
            <h2 className="text-2xl lg:text-3xl font-bold text-foreground">{t('txLifecycle.heading')}</h2>
          </div>
          <p className="text-sm text-muted-foreground max-w-3xl mt-1">
            {t('txLifecycle.intro')}
          </p>
        </div>
        <button
          onClick={play}
          disabled={phase === 'playing'}
          className="text-[11px] px-2.5 py-1 rounded-md bg-muted/60 hover:bg-muted text-foreground font-semibold disabled:opacity-50 transition-colors shrink-0"
        >{t('txLifecycle.replay')}</button>
      </div>

      {/* Step caption */}
      <div ref={stepRef} className="shrink-0 mb-3 px-3 py-2 rounded-lg border-2 text-xs font-bold transition-all min-h-[40px]" style={{ borderColor: '#737373AA', backgroundColor: '#73737314', color: '#737373' }}>
        {t('txLifecycle.starting')}
      </div>

      {/* Stage rail with moving packet */}
      <div className="flex-1 min-h-0 relative">
        {/* Stage cards */}
        <div className="grid grid-cols-4 lg:grid-cols-8 gap-2 h-full">
          {TX_STAGES.map((s, i) => (
            <div
              key={s.n}
              ref={el => { cardRefs.current[i] = el; }}
              className="flex flex-col rounded-xl border bg-card p-2.5 transition-all min-h-0"
              style={{ borderColor: 'hsl(var(--border))' }}
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="size-6 rounded-md flex items-center justify-center text-white text-[11px] font-black shrink-0" style={{ backgroundColor: s.zone }}>{s.n}</span>
                <span className="text-base leading-none">{s.emoji}</span>
              </div>
              <div className="font-bold text-[11px] text-foreground leading-tight">{stageText[i].title}</div>
              <div className="text-[10px] text-muted-foreground leading-snug flex-1 mt-1">{stageText[i].what}</div>
              <div className="mt-2 text-[9px] font-medium leading-snug rounded-md px-1.5 py-1" style={{ backgroundColor: s.zone + '14', color: s.zone }}>{stageText[i].note}</div>
            </div>
          ))}
        </div>

        {/* Packet — anime.js translates it across the rail (only on lg, where 8 columns laid out) */}
        <div
          ref={packetRef}
          className="absolute top-2 left-2 pointer-events-none z-20 hidden lg:flex items-center justify-center"
          style={{ opacity: 0, width: '40px', height: '40px' }}
        >
          <div className="size-9 rounded-full bg-[#facc15] border-2 border-[#a16207] flex items-center justify-center shadow-lg">
            <span className="text-[12px] font-black text-[#7c2d12]">tx</span>
          </div>
        </div>
      </div>

      {/* Timing strip */}
      <div className="shrink-0 mt-3 rounded-xl border border-border bg-card px-4 py-2.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px]">
        <span className="font-black uppercase tracking-widest text-muted-foreground">{t('txLifecycle.timing.label')}</span>
        <span className="text-muted-foreground">{t('txLifecycle.timing.signLabel')} <span className="font-bold text-foreground">{t('txLifecycle.timing.signValue')}</span></span>
        <span className="text-muted-foreground">{t('txLifecycle.timing.mempoolLabel')} <span className="font-bold text-foreground">{t('txLifecycle.timing.mempoolValue')}</span>{t('txLifecycle.timing.mempoolSuffix')}</span>
        <span className="text-muted-foreground">{t('txLifecycle.timing.blockLabel')} <span className="font-bold text-foreground">{t('txLifecycle.timing.blockValue')}</span></span>
        <span className="text-muted-foreground">{t('txLifecycle.timing.confLabel')} <span className="font-bold text-foreground">{t('txLifecycle.timing.confValue')}</span></span>
      </div>
      <div className="shrink-0 mt-2 flex flex-col gap-2 lg:pr-20">
        <KeyPointBar text={t('txLifecycle.keyPoint')} />
        <UnderTheHood items={t('txLifecycle.hood', { returnObjects: true }) as string[]} />
      </div>
    </div>
  );
}

// ─── Data ────────────────────────────────────────────────────────────────────

// Language-neutral layer metadata. Text comes from t() keyed by id.
const LAYERS = [
  { id: 'app', color: '#6366f1', icon: '💼' },
  { id: 'p2p', color: '#39B54A', icon: '🌐' },
  { id: 'consensus', color: '#f59e0b', icon: '⛏️' },
  { id: 'data', color: '#ED1C24', icon: '🗄️' },
];

function BitcoinArchitectureSlide() {
  const { t } = useTranslation('blockchain-platforms/section-1');
  const [active, setActive] = useState<string | null>(null);
  const activeLayer = LAYERS.find(l => l.id === active);
  const layerLabel = (id: string) => t(`architecture.layers.${id}.label`);
  const layerSublabel = (id: string) => t(`architecture.layers.${id}.sublabel`);

  return (
    <div className="h-full flex flex-col p-6 lg:p-10">
      <div className="shrink-0 mb-4">
        <h2 className="text-2xl lg:text-3xl font-bold text-foreground">{t('architecture.heading')}</h2>
        <p className="text-muted-foreground text-sm mt-1">{t('architecture.subtitle')}</p>
      </div>

      <div className="flex-1 min-h-0 flex flex-col gap-4">

        {/* ── 4 large layer cards ── */}
        <div className="grid grid-cols-4 gap-3 shrink-0">
          {LAYERS.map((layer, i) => (
            <motion.button
              key={layer.id}
              onClick={() => setActive(active === layer.id ? null : layer.id)}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1, duration: 0.4, ease: 'easeOut' }}
              whileHover={{ y: -3 }}
              whileTap={{ scale: 0.97 }}
              className="flex flex-col items-center gap-2 p-5 rounded-2xl border-2 cursor-pointer transition-all text-center"
              style={{
                borderColor: active === layer.id ? layer.color : layer.color + '40',
                backgroundColor: active === layer.id ? layer.color + '18' : layer.color + '08',
              }}
            >
              <span className="text-4xl">{layer.icon}</span>
              <div className="font-bold text-sm lg:text-base text-foreground">{layerLabel(layer.id)}</div>
              <div className="text-xs text-muted-foreground leading-snug">{layerSublabel(layer.id)}</div>
              <motion.div
                className="w-12 h-1 rounded-full mt-1"
                style={{ backgroundColor: layer.color }}
                animate={{ scaleX: active === layer.id ? 2 : 1, opacity: active === layer.id ? 1 : 0.4 }}
                transition={{ duration: 0.2 }}
              />
            </motion.button>
          ))}
        </div>

        {/* ── Detail panel ── */}
        <div className="flex-1 min-h-0 relative">
          <AnimatePresence mode="wait">
            {activeLayer ? (
              <motion.div
                key={activeLayer.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.25, ease: 'easeOut' }}
                className="h-full rounded-2xl border-2 p-6 flex gap-8"
                style={{ borderColor: activeLayer.color + '50', background: `linear-gradient(135deg, ${activeLayer.color}10, transparent)` }}
              >
                {/* Left: description + facts */}
                <div className="flex flex-col gap-4 w-72 shrink-0">
                  <div className="flex items-center gap-4">
                    <span className="text-5xl">{activeLayer.icon}</span>
                    <div>
                      <h3 className="text-xl font-black text-foreground">{layerLabel(activeLayer.id)}</h3>
                      <p className="text-xs text-muted-foreground">{layerSublabel(activeLayer.id)}</p>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed flex-1">{t(`architecture.layers.${activeLayer.id}.description`)}</p>
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-2">{t('architecture.facts')}</p>
                    <div className="flex flex-col gap-1.5">
                      {(t(`architecture.layers.${activeLayer.id}.examples`, { returnObjects: true }) as string[]).map(ex => (
                        <motion.span
                          key={ex}
                          initial={{ opacity: 0, x: -8 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.2 }}
                          className="px-3 py-1.5 rounded-lg text-sm font-medium border"
                          style={{ color: activeLayer.color, borderColor: activeLayer.color + '40', backgroundColor: activeLayer.color + '10' }}
                        >
                          {ex}
                        </motion.span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Right: layer-specific visual */}
                <div className="flex-1 min-w-0 flex flex-col justify-center gap-3">
                  {activeLayer.id === 'data' && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.15 }} className="flex flex-col gap-3">
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">{t('architecture.dataVisual.title')}</p>
                      <div className="flex items-stretch gap-2">
                        {['#839,998', '#839,999', '#840,000', '#840,001'].map((num, idx) => (
                          <div key={num} className="flex items-center gap-2 flex-1">
                            <motion.div
                              initial={{ opacity: 0, scale: 0.8 }}
                              animate={{ opacity: 1, scale: 1 }}
                              transition={{ delay: 0.1 + idx * 0.12 }}
                              className="flex-1 rounded-xl border-2 p-3 text-center"
                              style={{ borderColor: '#ED1C2460', backgroundColor: '#ED1C2410' }}
                            >
                              <div className="text-xs font-black text-[#ED1C24]">{t('architecture.dataVisual.block')}</div>
                              <div className="text-sm font-bold text-foreground mt-1">{num}</div>
                              <div className="text-[10px] text-muted-foreground mt-2 font-mono">prev: 0xa3f…</div>
                              <div className="text-[10px] text-muted-foreground font-mono">root: 0x7b2…</div>
                            </motion.div>
                            {idx < 3 && (
                              <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.4 + idx * 0.12 }}
                                className="text-[#ED1C24] font-bold text-lg shrink-0"
                              >→</motion.div>
                            )}
                          </div>
                        ))}
                      </div>
                      <p className="text-xs text-muted-foreground">{t('architecture.dataVisual.caption')}</p>
                    </motion.div>
                  )}
                  {activeLayer.id === 'p2p' && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.15 }} className="flex flex-col gap-4">
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">{t('architecture.p2pVisual.title')}</p>
                      <div className="flex items-center gap-2">
                        {(t('architecture.p2pVisual.steps', { returnObjects: true }) as { emoji: string; label: string; desc: string }[]).map((step, idx) => (
                          <div key={step.label} className="flex items-center gap-2 flex-1">
                            <motion.div
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: 0.1 + idx * 0.15 }}
                              className="flex-1 flex flex-col items-center gap-2 p-3 rounded-xl border border-border bg-card text-center"
                            >
                              <span className="text-3xl">{step.emoji}</span>
                              <div className="text-xs font-bold text-foreground">{step.label}</div>
                              <div className="text-xs text-muted-foreground leading-tight">{step.desc}</div>
                            </motion.div>
                            {idx < 3 && <span className="text-muted-foreground font-bold shrink-0">→</span>}
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                  {activeLayer.id === 'consensus' && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.15 }} className="flex flex-col gap-3">
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">{t('architecture.consensusVisual.title')}</p>
                      <div className="rounded-xl border-2 p-4" style={{ borderColor: '#f59e0b50', backgroundColor: '#f59e0b0a' }}>
                        <p className="text-sm text-foreground leading-relaxed">{t('architecture.consensusVisual.body')}</p>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        {(t('architecture.consensusVisual.buys', { returnObjects: true }) as { label: string; text: string }[]).map(item => (
                          <div key={item.label} className="p-2.5 rounded-lg border border-[#f59e0b]/40 text-xs" style={{ backgroundColor: '#f59e0b0d' }}>
                            <div className="font-bold text-[#f59e0b]">{item.label}</div>
                            <div className="text-muted-foreground leading-snug mt-0.5">{item.text}</div>
                          </div>
                        ))}
                      </div>
                      <UnderTheHood items={t('architecture.consensusVisual.hood', { returnObjects: true }) as string[]} />
                    </motion.div>
                  )}
                  {activeLayer.id === 'app' && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.15 }} className="flex flex-col gap-3">
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">{t('architecture.appVisual.title')}</p>
                      <div className="grid grid-cols-3 gap-3">
                        {(t('architecture.appVisual.apps', { returnObjects: true }) as { name: string; ex: string }[]).map((app, idx) => (
                          <div key={app.name} className="p-3 rounded-xl border border-border bg-card text-center">
                            <div className="text-2xl mb-1">{['💼', '🔍', '🔄'][idx]}</div>
                            <div className="font-bold text-sm text-foreground">{app.name}</div>
                            <div className="text-xs text-muted-foreground mt-1">{app.ex}</div>
                          </div>
                        ))}
                      </div>
                      <p className="text-xs text-muted-foreground">{t('architecture.appVisual.caption')}</p>
                    </motion.div>
                  )}
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="h-full rounded-2xl border-2 border-dashed border-border flex items-center justify-center"
              >
                <p className="text-muted-foreground text-sm">{t('architecture.emptyHint')}</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

      </div>
      <KeyPointBar text={t('architecture.keyPoint')} className="shrink-0 mt-3 lg:mr-20" />
    </div>
  );
}

// ─── Trilemma ────────────────────────────────────────────────────────────────

// Language-neutral vertex metadata. name/desc resolved via t() by vertex id.
const TRILEMMA_VERTICES = {
  security:         { color: '#f59e0b', icon: '🔒', pos: { x: 270, y: 110 } },
  decentralization: { color: '#39B54A', icon: '🌐', pos: { x: 90,  y: 380 } },
  scalability:      { color: '#ED1C24', icon: '⚡', pos: { x: 450, y: 380 } },
} as const;

type VertexId = keyof typeof TRILEMMA_VERTICES;

// Language-neutral platform metadata. name/tagline/stats/detail from t() by id.
const TRILEMMA_PLATFORMS: {
  id: string;
  symbol: string;
  color: string;
  picks: VertexId[];
  sacrifices: VertexId | null;
}[] = [
  { id: 'bitcoin',  symbol: '₿', color: '#f59e0b', picks: ['security', 'decentralization'], sacrifices: 'scalability' },
  { id: 'ethereum', symbol: '◆', color: '#6366f1', picks: ['security', 'decentralization', 'scalability'], sacrifices: null },
  { id: 'solana',   symbol: '◎', color: '#ED1C24', picks: ['security', 'scalability'], sacrifices: 'decentralization' },
];

interface PlatformStat { label: string; value: string; }

function TrilemmaSlide() {
  const { t } = useTranslation('blockchain-platforms/section-1');
  const vertexName = (id: VertexId) => t(`trilemma.vertices.${id}.name`);
  const vertexDesc = (id: VertexId) => t(`trilemma.vertices.${id}.desc`);
  const [hovered, setHovered] = useState<string | null>(null);
  const active = TRILEMMA_PLATFORMS.find(p => p.id === hovered) ?? null;

  const isPicked = (v: VertexId) => active ? active.picks.includes(v) : false;
  const isSacrificed = (v: VertexId) => active?.sacrifices === v;
  const isEdgeActive = (a: VertexId, b: VertexId) => active ? active.picks.includes(a) && active.picks.includes(b) : false;

  // Card position for each vertex (relative to the SVG container)
  const vertexCardStyle = (id: VertexId): React.CSSProperties => {
    if (id === 'security')         return { left: '50%', top: 0,        transform: 'translate(-50%, -8%)' };
    if (id === 'decentralization') return { left: 0,    bottom: 0,      transform: 'translate(-4%, 20%)' };
    return                                { right: 0,   bottom: 0,      transform: 'translate(4%, 20%)' };
  };

  return (
    <div className="h-full flex flex-col p-6 lg:p-10">
      {/* Header */}
      <div className="shrink-0 mb-5">
        <h2 className="text-2xl lg:text-3xl font-bold text-foreground">{t('trilemma.heading')}</h2>
        <p className="text-muted-foreground text-sm mt-1">{t('trilemma.subtitle')}</p>
      </div>

      <div className="flex-1 min-h-0 grid lg:grid-cols-[minmax(0,1fr)_minmax(0,420px)] gap-6 lg:gap-8">
        {/* ── Triangle column ── */}
        <div className="relative flex items-center justify-center min-h-0">
          <div className="relative w-full max-w-[540px]" style={{ aspectRatio: '540 / 500' }}>
            <svg viewBox="0 0 540 500" className="absolute inset-0 w-full h-full overflow-visible">
              <defs>
                <linearGradient id="edge-S-D" gradientUnits="userSpaceOnUse" x1="270" y1="110" x2="90" y2="380">
                  <stop offset="0%" stopColor="#f59e0b" />
                  <stop offset="100%" stopColor="#39B54A" />
                </linearGradient>
                <linearGradient id="edge-S-Sc" gradientUnits="userSpaceOnUse" x1="270" y1="110" x2="450" y2="380">
                  <stop offset="0%" stopColor="#f59e0b" />
                  <stop offset="100%" stopColor="#ED1C24" />
                </linearGradient>
                <linearGradient id="edge-D-Sc" gradientUnits="userSpaceOnUse" x1="90" y1="380" x2="450" y2="380">
                  <stop offset="0%" stopColor="#39B54A" />
                  <stop offset="100%" stopColor="#ED1C24" />
                </linearGradient>
                <radialGradient id="triFill" cx="50%" cy="55%" r="55%">
                  <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.08" />
                  <stop offset="100%" stopColor="#f59e0b" stopOpacity="0" />
                </radialGradient>
              </defs>

              {/* Inner triangle fill */}
              <polygon points="270,110 90,380 450,380" fill="url(#triFill)" />

              {/* Edges (lines) */}
              {([
                { a: 'security', b: 'decentralization', x1: 270, y1: 110, x2: 90, y2: 380, gradient: 'edge-S-D' },
                { a: 'security', b: 'scalability',     x1: 270, y1: 110, x2: 450, y2: 380, gradient: 'edge-S-Sc' },
                { a: 'decentralization', b: 'scalability', x1: 90, y1: 380, x2: 450, y2: 380, gradient: 'edge-D-Sc' },
              ] as const).map(e => {
                const isActive = isEdgeActive(e.a, e.b);
                const dim = active && !isActive;
                return (
                  <motion.line
                    key={`${e.a}-${e.b}`}
                    x1={e.x1} y1={e.y1} x2={e.x2} y2={e.y2}
                    stroke={`url(#${e.gradient})`}
                    strokeLinecap="round"
                    initial={false}
                    animate={{
                      strokeWidth: isActive ? 6 : 3,
                      strokeOpacity: dim ? 0.18 : isActive ? 1 : 0.55,
                    }}
                    transition={{ duration: 0.25 }}
                    style={isActive ? { filter: `drop-shadow(0 0 10px currentColor)` } : undefined}
                  />
                );
              })}

              {/* Vertex dots inside the SVG (small connector points) */}
              {(Object.entries(TRILEMMA_VERTICES) as [VertexId, typeof TRILEMMA_VERTICES[VertexId]][]).map(([id, v]) => {
                const picked = isPicked(id);
                const sacrificed = isSacrificed(id);
                return (
                  <motion.circle
                    key={id}
                    cx={v.pos.x} cy={v.pos.y}
                    fill={v.color}
                    initial={false}
                    animate={{
                      r: picked ? 12 : sacrificed ? 5 : 8,
                      opacity: active && !picked && !sacrificed ? 0.4 : 1,
                    }}
                    transition={{ duration: 0.25 }}
                    style={picked ? { filter: `drop-shadow(0 0 12px ${v.color})` } : undefined}
                  />
                );
              })}

              {/* Center label */}
              <text x={270} y={258} textAnchor="middle" className="fill-muted-foreground" fontSize="11" letterSpacing="4" fontWeight="700">{t('trilemma.chooseLabel')}</text>
              <text x={270} y={300} textAnchor="middle" className="fill-foreground" fontSize="44" fontWeight="900" letterSpacing="-1">{t('trilemma.chooseTwo')}</text>
              {active && (
                <motion.text
                  key={active.id}
                  x={270} y={332}
                  textAnchor="middle"
                  fontSize="11"
                  fontWeight="700"
                  letterSpacing="2"
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  fill={active.color}
                >
                  {t(`trilemma.platforms.${active.id}.name`).toUpperCase()}
                </motion.text>
              )}
            </svg>

            {/* Vertex label cards (HTML, positioned around the triangle) */}
            {(Object.entries(TRILEMMA_VERTICES) as [VertexId, typeof TRILEMMA_VERTICES[VertexId]][]).map(([id, v]) => {
              const picked = isPicked(id);
              const sacrificed = isSacrificed(id);
              const dimmed = active && !picked && !sacrificed;
              return (
                <motion.div
                  key={id}
                  className="absolute"
                  style={vertexCardStyle(id)}
                  initial={false}
                  animate={{
                    scale: picked ? 1.06 : sacrificed ? 0.94 : 1,
                    opacity: dimmed ? 0.5 : 1,
                  }}
                  transition={{ duration: 0.25 }}
                >
                  <div
                    className="flex flex-col items-center gap-1 px-3.5 py-2 rounded-2xl border-2 bg-card/90 backdrop-blur-sm whitespace-nowrap"
                    style={{
                      borderColor: picked ? v.color : v.color + '50',
                      backgroundColor: picked ? v.color + '15' : undefined,
                      boxShadow: picked ? `0 0 24px ${v.color}55, 0 4px 16px ${v.color}30` : undefined,
                    }}
                  >
                    <div className="flex items-center gap-1.5">
                      <span className="text-base">{v.icon}</span>
                      <span className="font-black text-[13px] tracking-tight" style={{ color: v.color }}>{vertexName(id)}</span>
                    </div>
                    <span className="text-[10px] text-muted-foreground leading-none">{vertexDesc(id)}</span>
                    {sacrificed && (
                      <span className="text-[9px] font-black uppercase tracking-[2px] mt-0.5 px-1.5 py-0.5 rounded" style={{ color: v.color, backgroundColor: v.color + '15' }}>
                        {t('trilemma.tradedOff')}
                      </span>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* ── Platform cards column ── */}
        <div className="flex flex-col gap-3 min-h-0">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground shrink-0">{t('trilemma.hoverHint')}</p>
          {TRILEMMA_PLATFORMS.map((p, i) => {
            const isHovered = hovered === p.id;
            const pStats = t(`trilemma.platforms.${p.id}.stats`, { returnObjects: true }) as PlatformStat[];
            return (
              <motion.button
                key={p.id}
                type="button"
                onMouseEnter={() => setHovered(p.id)}
                onMouseLeave={() => setHovered(null)}
                onFocus={() => setHovered(p.id)}
                onBlur={() => setHovered(null)}
                initial={{ opacity: 0, x: 16 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 + i * 0.08, duration: 0.3 }}
                whileHover={{ x: -3 }}
                className="text-left rounded-xl border-2 p-3.5 bg-card flex flex-col gap-2 relative overflow-hidden cursor-pointer transition-colors flex-1 min-h-0"
                style={{
                  borderColor: isHovered ? p.color : p.color + '35',
                  backgroundColor: isHovered ? p.color + '0a' : undefined,
                }}
              >
                {/* Color accent bar */}
                <div className="absolute left-0 top-0 bottom-0 w-1" style={{ backgroundColor: p.color }} />

                {/* Header row */}
                <div className="flex items-start justify-between gap-3 pl-2">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div
                      className="size-10 shrink-0 rounded-lg flex items-center justify-center text-xl font-black"
                      style={{ backgroundColor: p.color + '20', color: p.color }}
                    >
                      {p.symbol}
                    </div>
                    <div className="min-w-0">
                      <div className="font-black text-sm text-foreground truncate">{t(`trilemma.platforms.${p.id}.name`)}</div>
                      <div className="text-[10px] text-muted-foreground truncate">{t(`trilemma.platforms.${p.id}.tagline`)}</div>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-0.5 shrink-0">
                    {pStats.map(s => (
                      <div key={s.label} className="text-right leading-tight">
                        <span className="text-xs font-black text-foreground">{s.value}</span>
                        <span className="text-[9px] text-muted-foreground ml-1 uppercase tracking-wider">{s.label}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Pillars */}
                <div className="flex flex-wrap gap-1 pl-2">
                  {p.picks.map(pick => (
                    <span
                      key={pick}
                      className="text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider"
                      style={{ backgroundColor: TRILEMMA_VERTICES[pick].color + '22', color: TRILEMMA_VERTICES[pick].color }}
                    >
                      {t('trilemma.pickPrefix')}{vertexName(pick)}
                    </span>
                  ))}
                  {p.sacrifices && (
                    <span
                      className="text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider"
                      style={{
                        backgroundColor: TRILEMMA_VERTICES[p.sacrifices].color + '12',
                        color: TRILEMMA_VERTICES[p.sacrifices].color,
                        textDecoration: 'line-through',
                        opacity: 0.75,
                      }}
                    >
                      {vertexName(p.sacrifices)}
                    </span>
                  )}
                </div>

                {/* Detail */}
                <p className="text-xs text-muted-foreground leading-relaxed pl-2">{t(`trilemma.platforms.${p.id}.detail`)}</p>
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Business framing + hint pills */}
      <div className="shrink-0 mt-4 flex flex-col gap-2 lg:pr-20">
        <KeyPointBar text={t('trilemma.keyPoint')} />
        <UnderTheHood items={t('trilemma.hood', { returnObjects: true }) as string[]} />
      </div>
    </div>
  );
}

// ─── Handoff from Blockchain Fundamentals ────────────────────────────────────

const LENS_COLORS = ['#6366f1', '#f59e0b', '#39B54A'];

function HandoffSlide() {
  const { t } = useTranslation('blockchain-platforms/section-1');
  const covered = t('handoff.covered', { returnObjects: true }) as string[];
  const lens = t('handoff.lens', { returnObjects: true }) as { emoji: string; title: string; desc: string; question: string; where: string }[];
  const hood = t('handoff.hood', { returnObjects: true }) as string[];

  return (
    <div className="h-full flex flex-col p-6 lg:p-10">
      <div className="shrink-0 mb-4">
        <span className="inline-flex px-2.5 py-0.5 rounded-full bg-[#6366f1]/15 border border-[#6366f1]/40 text-[#6366f1] text-[10px] font-black uppercase tracking-widest mb-2">
          {t('handoff.badge')}
        </span>
        <h2 className="text-2xl lg:text-3xl font-bold text-foreground">{t('handoff.heading')}</h2>
        <p className="text-sm text-muted-foreground mt-2 max-w-4xl leading-relaxed">{t('handoff.lead')}</p>
      </div>

      {/* Already covered — one line of chips */}
      <div className="shrink-0 rounded-xl border border-border bg-card/50 p-3 mb-4 flex flex-wrap items-center gap-2">
        <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mr-1">{t('handoff.coveredLabel')}</span>
        {covered.map((c) => (
          <span key={c} className="px-2.5 py-1 rounded-full text-xs font-semibold border" style={{ borderColor: '#39B54A60', color: '#39B54A', backgroundColor: '#39B54A10' }}>✓ {c}</span>
        ))}
      </div>

      {/* Today's lens */}
      <p className="shrink-0 text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-2">{t('handoff.lensLabel')}</p>
      <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-3 gap-4">
        {lens.map((item, i) => (
          <motion.div
            key={item.title}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 + i * 0.1, duration: 0.3 }}
            className="rounded-2xl border-2 p-5 flex flex-col gap-3"
            style={{ borderColor: LENS_COLORS[i] + '55', backgroundColor: LENS_COLORS[i] + '0a' }}
          >
            <span className="text-4xl">{item.emoji}</span>
            <div className="text-lg font-black text-foreground">{item.title}</div>
            <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
            <div className="mt-auto rounded-xl border bg-card p-3" style={{ borderColor: LENS_COLORS[i] + '40' }}>
              <div className="text-[10px] font-black uppercase tracking-widest" style={{ color: LENS_COLORS[i] }}>{t('handoff.questionLabel')}</div>
              <p className="text-sm font-semibold text-foreground mt-1 leading-snug">{item.question}</p>
              <p className="text-xs text-muted-foreground mt-2">{item.where}</p>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="shrink-0 mt-4 flex flex-col gap-2 lg:pr-20">
        <KeyPointBar text={t('handoff.keyPoint')} />
        <UnderTheHood items={hood} />
      </div>
    </div>
  );
}

export function BP_Section1() {
  const { t } = useTranslation('blockchain-platforms/section-1');

  const chapters = useMemo(
    () =>
      chapterShape.map((c) =>
        'kind' in c
          ? { kind: 'group' as const, id: c.id, label: t(`groups.${c.id}`) }
          : { id: c.id, label: t(`chapters.${c.id}`) }
      ),
    [t]
  );

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
            icon={<Bitcoin className="size-20 text-[#f59e0b]" />}
            gradient="from-[#f59e0b] to-[#ED1C24]"
          />
        </div>

        {/* ═══════ HANDOFF — recap from Blockchain Fundamentals ═══════ */}
        <div id="s1-handoff" className="h-full">
          <HandoffSlide />
        </div>

        {/* ═══════ ARCHITECTURE ═══════ */}
        <div id="s1-architecture" className="h-full">
          <BitcoinArchitectureSlide />
        </div>

        {/* ═══════ TRANSACTION FLOW — end-to-end systemisation recap ═══════ */}
        <div id="s1-tx-lifecycle" className="h-full">
          <TxLifecycleAnimated />
        </div>

        {/* ═══════ TRILEMMA ═══════ */}
        <div id="s1-trilemma" className="h-full">
          <TrilemmaSlide />
        </div>

        {/* ═══════ QUIZ — trilemma scenario ═══════ */}
        <div id="s1-quiz-trilemma" className="h-full">
          <QuizSlide
            question={t('quizTrilemma.question')}
            options={(t('quizTrilemma.options', { returnObjects: true }) as string[]).map((text, i) => ({ text, correct: i === 1 }))}
            explanation={t('quizTrilemma.explanation')}
          />
        </div>

        {/* ═══════ APPS — Bitcoin's app layer ═══════ */}
        <div id="s1-apps" className="h-full flex flex-col p-6 lg:p-10">
          <div className="shrink-0 mb-3">
            <h2 className="text-2xl lg:text-3xl font-bold text-foreground">{t('apps.heading')}</h2>
            <p className="text-sm text-muted-foreground mt-1">{t('apps.subtitle')}</p>
          </div>

          <div className="shrink-0 mb-4 rounded-xl border p-3" style={{ borderColor: '#f59e0b55', backgroundColor: '#f59e0b0d' }}>
            <p className="text-[10px] font-black uppercase tracking-widest" style={{ color: '#f59e0b' }}>{t('apps.whereLabel')}</p>
            <p className="text-sm text-foreground mt-0.5 leading-snug">
              {t('apps.whereBodyA')}<span className="font-semibold">{t('apps.whereChannels')}</span>{t('apps.whereBodyB')}<span className="font-semibold">{t('apps.whereInscriptions')}</span>{t('apps.whereBodyC')}<span className="font-semibold">{t('apps.whereSidechains')}</span>{t('apps.whereBodyD')}<span className="font-semibold">{t('apps.whereStaking')}</span>{t('apps.whereBodyE')}
            </p>
          </div>

          <div className="flex-1 min-h-0 overflow-y-auto grid grid-cols-1 lg:grid-cols-2 lg:auto-rows-fr gap-3">
            {[
              { icon: '⚡', color: '#f59e0b' },
              { icon: '📜', color: '#ef4444' },
              { icon: '🔗', color: '#6366f1' },
              { icon: '🛡️', color: '#39B54A' },
            ].map((appMeta, idx) => {
              const app = (t('apps.items', { returnObjects: true }) as { title: string; sub: string; what: string; adoption: string; limit: string }[])[idx];
              return (
              <motion.div
                key={app.title}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="rounded-xl border-2 p-3 flex flex-col gap-2 min-h-0 overflow-hidden"
                style={{ borderColor: appMeta.color + '50', backgroundColor: appMeta.color + '08' }}
              >
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-xl shrink-0 leading-none">{appMeta.icon}</span>
                  <div className="min-w-0">
                    <div className="font-black text-sm leading-tight" style={{ color: appMeta.color }}>{app.title}</div>
                    <div className="text-[11px] text-muted-foreground leading-tight">{app.sub}</div>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground leading-snug flex-1">{app.what}</p>
                <div className="rounded-lg border bg-card/60 px-2 py-1 text-[11px] leading-snug" style={{ borderColor: appMeta.color + '40' }}>
                  <span className="font-bold" style={{ color: appMeta.color }}>{t('apps.adoptionLabel')}</span>
                  <span className="text-muted-foreground">{app.adoption}</span>
                </div>
                <div className="rounded-lg border bg-card/60 px-2 py-1 text-[11px] leading-snug" style={{ borderColor: '#ED1C2440' }}>
                  <span className="font-bold" style={{ color: '#ED1C24' }}>{t('apps.limitLabel')}</span>
                  <span className="text-muted-foreground">{app.limit}</span>
                </div>
              </motion.div>
              );
            })}
          </div>

          <div className="shrink-0 mt-3 rounded-xl border p-2.5" style={{ borderColor: '#f59e0b55', backgroundColor: '#f59e0b0d' }}>
            <p className="text-xs text-muted-foreground leading-snug">
              <span className="font-bold" style={{ color: '#f59e0b' }}>{t('apps.caveatLabel')}</span>
              {t('apps.caveatBody')}
            </p>
          </div>
          <KeyPointBar text={t('apps.keyPoint')} className="shrink-0 mt-2 lg:mr-20" />
        </div>

        {/* ═══════ LIGHTNING NETWORK ═══════ */}
        {/* ─── Lightning: Channel Lifecycle ─── */}
        <div id="s1-lightning" className="h-full">
          <LightningVaultDemo />
        </div>

        {/* ═══════ BEST FITS — WHERE BITCOIN WINS ═══════ */}
        <div id="s1-bestfits" className="h-full flex flex-col p-5 lg:p-8">
          <div className="shrink-0 mb-3">
            <h2 className="text-2xl lg:text-3xl font-bold text-foreground mt-1">{t('bestFits.heading')}</h2>
            <p className="text-sm text-muted-foreground max-w-3xl">
              {t('bestFits.subtitle')}
            </p>
          </div>
          <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-2 gap-3">
            {(t('bestFits.items', { returnObjects: true }) as { emoji: string; name: string; why: string; example: string }[]).map(uc => (
              <div key={uc.name} className="rounded-xl border-2 p-3 flex flex-col gap-2" style={{ borderColor: '#f7931a55', backgroundColor: '#f7931a08' }}>
                <div className="flex items-center gap-2">
                  <span className="text-2xl shrink-0">{uc.emoji}</span>
                  <div className="font-black text-foreground text-base leading-tight">{uc.name}</div>
                </div>
                <div className="text-xs text-muted-foreground leading-snug">
                  <span className="font-bold text-[#f7931a] uppercase tracking-widest text-[9px] mr-1">{t('bestFits.whyLabel')}</span>
                  {uc.why}
                </div>
                <div className="mt-auto text-[11px] text-foreground bg-card border border-border rounded-md px-2 py-1.5 leading-snug">
                  <span className="font-bold text-[#f7931a] uppercase tracking-widest text-[9px] mr-1">{t('bestFits.wildLabel')}</span>
                  {uc.example}
                </div>
              </div>
            ))}
          </div>
          <div className="shrink-0 mt-3 p-2.5 bg-[#ef4444]/08 border border-[#ef4444]/30 rounded-lg text-[11px] text-muted-foreground">
            <strong className="text-[#ef4444]">{t('bestFits.notFitLabel')}</strong>{t('bestFits.notFitBody')}
          </div>
          <KeyPointBar text={t('bestFits.keyPoint')} className="shrink-0 mt-2 lg:mr-20" />
        </div>

        {/* ═══════ QUIZ — best/worst fit judgement ═══════ */}
        <div id="s1-quiz-fit" className="h-full">
          <QuizSlide
            question={t('quizFit.question')}
            options={(t('quizFit.options', { returnObjects: true }) as string[]).map((text, i) => ({ text, correct: i === 1 }))}
            explanation={t('quizFit.explanation')}
          />
        </div>

        {/* ═══════ TAKEAWAYS ═══════ */}
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
