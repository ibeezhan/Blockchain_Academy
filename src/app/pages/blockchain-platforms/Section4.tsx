import { useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import anime from 'animejs';
import { motion } from 'motion/react';
import { ConceptSlide } from '../../components/templates/ConceptSlide';
import { TitleSlide } from '../../components/templates/TitleSlide';
import { TakeawaySlide } from '../../components/templates/TakeawaySlide';
import { SectionNav } from '../../components/navigation/SectionNav';
import { SiteFooter } from '../../components/shared/SiteFooter';
import { QuizSlide } from '../../components/templates/QuizSlide';
import { UnderTheHood } from '../../components/shared/UnderTheHood';
import { RecapHandoff } from '../../components/shared/RecapHandoff';
import { KeyPointBar } from '../../components/shared/KeyPointBar';
import { Network } from 'lucide-react';

// Language-neutral shape — IDs + kind only. Labels resolved via t() at render time.
const chapterShape = [
  { kind: 'group' as const, id: 'g-s4-problem' },
  { id: 's4-interop' },
  { id: 's4-usecases' },
  { id: 's4-interop-compare' },
  { id: 's4-chooser' },

  { kind: 'group' as const, id: 'g-s4-bridges' },
  { id: 's4-bridges' },

  { kind: 'group' as const, id: 'g-s4-cosmos' },
  { id: 's4-cosmos' },
  { id: 's4-cosmos-eco' },

  { kind: 'group' as const, id: 'g-s4-l0' },
  { id: 's4-layer0' },
  { id: 's4-layer0-2' },

  { kind: 'group' as const, id: 'g-s4-xrp' },
  { id: 's4-xrp' },
  { id: 's4-xrp-anim' },

  { kind: 'group' as const, id: 'g-s4-wrap' },
  { id: 's4-quiz' },
  { id: 's4-takeaways' },
] as const;

/* ──────────────────────── Animated Layer 0 stack ─────────────────────────
   Shows a tx packet rising from L2 → L1, crossing through the L0 hub, and
   landing on a DIFFERENT L1 (which can then hand it down to its own L2).
   Driven by anime.js timelines. Auto-plays on scroll-in + manual replay.
   ───────────────────────────────────────────────────────────────────────── */

function Layer0AnimatedStack() {
  const { t } = useTranslation('blockchain-platforms/section-4');
  const rootRef     = useRef<HTMLDivElement | null>(null);
  const packetRef   = useRef<SVGGElement | null>(null);
  const stepRef     = useRef<HTMLDivElement | null>(null);
  const pathRef     = useRef<SVGPathElement | null>(null);
  const [phase, setPhase] = useState<'idle' | 'playing'>('idle');
  const playedRef   = useRef(false);

  const STEP_COLORS = ['#8b5cf6', '#6366f1', '#22d3ee', '#10b981'];
  const stepLabels = t('layer0Anim.steps', { returnObjects: true }) as string[];
  const STEPS = STEP_COLORS.map((color, i) => ({ label: stepLabels[i], color }));

  function setStep(i: number) {
    if (!stepRef.current) return;
    stepRef.current.textContent = STEPS[i].label;
    stepRef.current.style.color = STEPS[i].color;
    stepRef.current.style.borderColor = STEPS[i].color + 'AA';
    stepRef.current.style.backgroundColor = STEPS[i].color + '14';
  }

  const play = () => {
    if (phase === 'playing') return;
    setPhase('playing');

    // Reset
    if (packetRef.current) {
      packetRef.current.style.opacity = '0';
      packetRef.current.style.transform = 'translate(0px, 0px)';
    }
    setStep(0);

    // Waypoints in SVG coords (viewBox 0 0 480 280):
    //   L2A (left bottom) → L1A (left mid) → L0 hub (centre top) → L1B (right mid) → L2B (right bottom)
    const W = [
      { x: 80,  y: 230 }, // L2 A
      { x: 80,  y: 145 }, // L1 A
      { x: 240, y: 50  }, // L0 hub
      { x: 400, y: 145 }, // L1 B
      { x: 400, y: 230 }, // L2 B
    ];

    const tl = anime.timeline({
      easing: 'easeInOutCubic',
      complete: () => setPhase('idle'),
    });

    tl.add({
      targets: packetRef.current,
      opacity: [0, 1],
      translateX: [W[0].x - W[0].x, 0],
      translateY: [W[0].y - W[0].y + 12, 0],
      duration: 300,
      easing: 'easeOutQuad',
    })
    // Step 1: L2 A → L1 A (up)
    .add({
      targets: packetRef.current,
      translateY: W[1].y - W[0].y,
      duration: 850,
      changeBegin: () => setStep(0),
    })
    // Step 2: L1 A → L0 hub (up + right curve)
    .add({
      targets: packetRef.current,
      translateX: W[2].x - W[0].x,
      translateY: W[2].y - W[0].y,
      duration: 1000,
      changeBegin: () => setStep(1),
    })
    // Step 3: L0 → L1 B (down + right)
    .add({
      targets: packetRef.current,
      translateX: W[3].x - W[0].x,
      translateY: W[3].y - W[0].y,
      duration: 1000,
      changeBegin: () => setStep(2),
    })
    // Step 4: L1 B → L2 B (down)
    .add({
      targets: packetRef.current,
      translateY: W[4].y - W[0].y,
      duration: 700,
      changeBegin: () => setStep(3),
    })
    // Settle pulse
    .add({
      targets: packetRef.current,
      scale: [1, 1.4, 1],
      duration: 500,
      easing: 'easeOutQuad',
    });

    // Animate the trail path drawing
    if (pathRef.current) {
      const len = pathRef.current.getTotalLength();
      pathRef.current.style.strokeDasharray = String(len);
      pathRef.current.style.strokeDashoffset = String(len);
      anime({
        targets: pathRef.current,
        strokeDashoffset: [len, 0],
        duration: 3500,
        easing: 'easeInOutCubic',
      });
    }
  };

  useEffect(() => {
    if (!rootRef.current) return;
    const obs = new IntersectionObserver(entries => {
      for (const e of entries) {
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
      {/* Header + replay */}
      <div className="flex items-start justify-between gap-2 shrink-0">
        <div>
          <div className="text-sm font-bold text-foreground">{t('layer0Anim.headline')}</div>
        </div>
        <button
          onClick={play}
          disabled={phase === 'playing'}
          className="text-[11px] px-2.5 py-1 rounded-md bg-muted/60 hover:bg-muted text-foreground font-semibold disabled:opacity-50 transition-colors shrink-0"
        >{t('layer0Anim.replay')}</button>
      </div>

      {/* Step caption */}
      <div
        ref={stepRef}
        className="shrink-0 px-3 py-2 rounded-lg border-2 text-xs font-bold transition-all"
        style={{ borderColor: STEPS[0].color + 'AA', backgroundColor: STEPS[0].color + '14', color: STEPS[0].color }}
      >
        {STEPS[0].label}
      </div>

      {/* SVG stage */}
      <div className="flex-1 min-h-[260px] rounded-xl border border-border bg-card/40 p-3">
        <svg viewBox="0 0 480 280" className="w-full h-full" style={{ overflow: 'visible' }}>
          {/* L0 hub band */}
          <rect x="120" y="30" width="240" height="40" rx="6" fill="#22d3ee15" stroke="#22d3ee" strokeWidth="1.2" />
          <text x="240" y="48" textAnchor="middle" fontSize="11" fontWeight="800" fill="#22d3ee">{t('layer0Anim.svg.l0Title')}</text>
          <text x="240" y="62" textAnchor="middle" fontSize="9" fill="hsl(var(--muted-foreground))">{t('layer0Anim.svg.l0Sub')}</text>

          {/* L1 left */}
          <rect x="30" y="110" width="100" height="50" rx="5" fill="#6366f115" stroke="#6366f1" strokeWidth="1.2" />
          <text x="80" y="130" textAnchor="middle" fontSize="11" fontWeight="800" fill="#6366f1">{t('layer0Anim.svg.l1aTitle')}</text>
          <text x="80" y="146" textAnchor="middle" fontSize="9" fill="hsl(var(--muted-foreground))">{t('layer0Anim.svg.l1aSub')}</text>

          {/* L1 right */}
          <rect x="350" y="110" width="100" height="50" rx="5" fill="#6366f115" stroke="#6366f1" strokeWidth="1.2" />
          <text x="400" y="130" textAnchor="middle" fontSize="11" fontWeight="800" fill="#6366f1">{t('layer0Anim.svg.l1bTitle')}</text>
          <text x="400" y="146" textAnchor="middle" fontSize="9" fill="hsl(var(--muted-foreground))">{t('layer0Anim.svg.l1bSub')}</text>

          {/* L2 left */}
          <rect x="30" y="200" width="100" height="50" rx="5" fill="#8b5cf615" stroke="#8b5cf6" strokeWidth="1.2" />
          <text x="80" y="220" textAnchor="middle" fontSize="11" fontWeight="800" fill="#8b5cf6">{t('layer0Anim.svg.l2aTitle')}</text>
          <text x="80" y="236" textAnchor="middle" fontSize="9" fill="hsl(var(--muted-foreground))">{t('layer0Anim.svg.l2aSub')}</text>

          {/* L2 right */}
          <rect x="350" y="200" width="100" height="50" rx="5" fill="#10b98115" stroke="#10b981" strokeWidth="1.2" />
          <text x="400" y="220" textAnchor="middle" fontSize="11" fontWeight="800" fill="#10b981">{t('layer0Anim.svg.l2bTitle')}</text>
          <text x="400" y="236" textAnchor="middle" fontSize="9" fill="hsl(var(--muted-foreground))">{t('layer0Anim.svg.l2bSub')}</text>

          {/* Static link cues (lines) */}
          <line x1="80" y1="200" x2="80" y2="160" stroke="#8b5cf680" strokeWidth="1" strokeDasharray="3 3" />
          <line x1="80" y1="110" x2="160" y2="70"  stroke="#6366f180" strokeWidth="1" strokeDasharray="3 3" />
          <line x1="320" y1="70" x2="400" y2="110" stroke="#6366f180" strokeWidth="1" strokeDasharray="3 3" />
          <line x1="400" y1="160" x2="400" y2="200" stroke="#10b98180" strokeWidth="1" strokeDasharray="3 3" />

          {/* Animated trail (drawn as packet travels) */}
          <path
            ref={pathRef}
            d="M 80 230 L 80 145 Q 80 100 240 50 Q 400 100 400 145 L 400 230"
            fill="none"
            stroke="#22d3ee"
            strokeWidth="2"
            strokeOpacity="0.85"
          />

          {/* The tx packet (animated by anime.js) */}
          <g ref={packetRef} style={{ opacity: 0, transformBox: 'fill-box' as React.CSSProperties['transformBox'], transformOrigin: '80px 230px' }}>
            <circle cx="80" cy="230" r="9" fill="#facc15" stroke="#a16207" strokeWidth="1.4" />
            <text x="80" y="234" textAnchor="middle" fontSize="9" fontWeight="900" fill="#7c2d12">tx</text>
          </g>
        </svg>
      </div>

      {/* Mini-legend */}
      <div className="shrink-0 grid grid-cols-3 gap-2 text-[10px]">
        <div className="rounded-md p-1.5 border" style={{ borderColor: '#22d3ee55', backgroundColor: '#22d3ee10' }}>
          <span className="font-black text-[#22d3ee]">L0</span> <span className="text-muted-foreground">{t('layer0Anim.legend.l0')}</span>
        </div>
        <div className="rounded-md p-1.5 border" style={{ borderColor: '#6366f155', backgroundColor: '#6366f110' }}>
          <span className="font-black text-[#6366f1]">L1</span> <span className="text-muted-foreground">{t('layer0Anim.legend.l1')}</span>
        </div>
        <div className="rounded-md p-1.5 border" style={{ borderColor: '#8b5cf655', backgroundColor: '#8b5cf610' }}>
          <span className="font-black text-[#8b5cf6]">L2</span> <span className="text-muted-foreground">{t('layer0Anim.legend.l2')}</span>
        </div>
      </div>
    </div>
  );
}

/* ──────────────────── Animated XRPL ↔ Axelar interop ─────────────────────
   Shows a GMP (General Message Passing) call leaving XRPL, hitting the
   Axelar validator network, and landing on an EVM chain. Auto-plays.
   ───────────────────────────────────────────────────────────────────────── */

function XrplAxelarFlow() {
  const { t } = useTranslation('blockchain-platforms/section-4');
  const rootRef    = useRef<HTMLDivElement | null>(null);
  const packetRef  = useRef<SVGGElement | null>(null);
  const stepRef    = useRef<HTMLDivElement | null>(null);
  const validatorRefs = useRef<(SVGCircleElement | null)[]>([]);
  const [phase, setPhase] = useState<'idle' | 'playing'>('idle');
  const playedRef  = useRef(false);

  const STEP_COLORS = ['#06b6d4', '#f59e0b', '#10b981', '#6366f1'];
  const stepLabels = t('xrplAxelarAnim.steps', { returnObjects: true }) as string[];
  const STEPS = STEP_COLORS.map((color, i) => ({ label: stepLabels[i], color }));

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
    setStep(0);

    // Reset
    if (packetRef.current) {
      packetRef.current.style.opacity = '0';
      packetRef.current.style.transform = 'translate(0, 0)';
    }
    validatorRefs.current.forEach(c => {
      if (c) { c.setAttribute('fill', '#f59e0b22'); c.setAttribute('stroke', '#f59e0b'); }
    });

    // Waypoints (viewBox 0 0 520 240): XRPL → Axelar hub centre → EVM chain
    const W = [
      { x: 75,  y: 130 },  // XRPL
      { x: 260, y: 130 },  // Axelar hub
      { x: 445, y: 130 },  // EVM chain
    ];

    const tl = anime.timeline({ easing: 'easeInOutCubic', complete: () => setPhase('idle') });

    tl.add({
      targets: packetRef.current,
      opacity: [0, 1],
      duration: 250,
      easing: 'easeOutQuad',
    })
    .add({
      targets: packetRef.current,
      translateX: W[1].x - W[0].x,
      duration: 1100,
      changeBegin: () => setStep(0),
    })
    // Validators flash one by one (consensus)
    .add({
      targets: { i: 0 },
      i: 4,
      duration: 1200,
      easing: 'linear',
      changeBegin: () => setStep(1),
      update: (a) => {
        const n = Math.floor((a.animations[0].currentValue as unknown) as number);
        for (let k = 0; k <= n && k < validatorRefs.current.length; k++) {
          const c = validatorRefs.current[k];
          if (c) {
            c.setAttribute('fill', '#10b98140');
            c.setAttribute('stroke', '#10b981');
          }
        }
      },
    })
    .add({
      targets: packetRef.current,
      scale: [1, 1.4, 1],
      duration: 400,
      easing: 'easeOutQuad',
      changeBegin: () => setStep(2),
    })
    .add({
      targets: packetRef.current,
      translateX: W[2].x - W[0].x,
      duration: 1100,
      changeBegin: () => setStep(3),
    })
    .add({
      targets: packetRef.current,
      scale: [1, 1.4, 1],
      duration: 400,
      easing: 'easeOutQuad',
    });
  };

  useEffect(() => {
    if (!rootRef.current) return;
    const obs = new IntersectionObserver(entries => {
      for (const e of entries) {
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
      {/* Header + replay */}
      <div className="flex items-start justify-between gap-2 shrink-0">
        <div>
          <div className="text-sm font-bold text-foreground">{t('xrplAxelarAnim.headline')}</div>
        </div>
        <button
          onClick={play}
          disabled={phase === 'playing'}
          className="text-[11px] px-2.5 py-1 rounded-md bg-muted/60 hover:bg-muted text-foreground font-semibold disabled:opacity-50 transition-colors shrink-0"
        >{t('xrplAxelarAnim.replay')}</button>
      </div>

      {/* Step caption */}
      <div
        ref={stepRef}
        className="shrink-0 px-3 py-2 rounded-lg border-2 text-xs font-bold transition-all"
        style={{ borderColor: STEPS[0].color + 'AA', backgroundColor: STEPS[0].color + '14', color: STEPS[0].color }}
      >
        {STEPS[0].label}
      </div>

      {/* SVG stage */}
      <div className="flex-1 min-h-[200px] rounded-xl border border-border bg-card/40 p-3">
        <svg viewBox="0 0 520 240" className="w-full h-full" style={{ overflow: 'visible' }}>
          {/* XRPL node */}
          <rect x="15" y="80" width="120" height="100" rx="8" fill="#06b6d418" stroke="#06b6d4" strokeWidth="1.5" />
          <text x="75" y="105" textAnchor="middle" fontSize="11" fontWeight="900" fill="#06b6d4">{t('xrplAxelarAnim.svg.xrplTitle')}</text>
          <text x="75" y="123" textAnchor="middle" fontSize="9" fill="hsl(var(--muted-foreground))">{t('xrplAxelarAnim.svg.xrplSub')}</text>
          <text x="75" y="148" textAnchor="middle" fontSize="9" fontWeight="700" fill="hsl(var(--foreground))">{t('xrplAxelarAnim.svg.xrplLine1')}</text>
          <text x="75" y="164" textAnchor="middle" fontSize="8" fill="hsl(var(--muted-foreground))">{t('xrplAxelarAnim.svg.xrplLine2')}</text>

          {/* Axelar hub (centre) */}
          <rect x="200" y="55" width="120" height="150" rx="8" fill="#f59e0b14" stroke="#f59e0b" strokeWidth="1.5" />
          <text x="260" y="78" textAnchor="middle" fontSize="11" fontWeight="900" fill="#f59e0b">{t('xrplAxelarAnim.svg.axelarTitle')}</text>
          <text x="260" y="92" textAnchor="middle" fontSize="8" fill="hsl(var(--muted-foreground))">{t('xrplAxelarAnim.svg.axelarSub')}</text>

          {/* Validator ring inside the Axelar box */}
          {[
            { x: 230, y: 130 },
            { x: 260, y: 115 },
            { x: 290, y: 130 },
            { x: 275, y: 165 },
            { x: 245, y: 165 },
          ].map((v, i) => (
            <g key={i}>
              <circle
                ref={el => { validatorRefs.current[i] = el; }}
                cx={v.x} cy={v.y} r={9}
                fill="#f59e0b22" stroke="#f59e0b" strokeWidth={1.2}
              />
              <text x={v.x} y={v.y + 3} textAnchor="middle" fontSize={7} fontWeight="800" fill="hsl(var(--foreground))">v{i+1}</text>
            </g>
          ))}
          <text x="260" y="195" textAnchor="middle" fontSize="8" fontWeight="700" fill="hsl(var(--muted-foreground))">{t('xrplAxelarAnim.svg.axelarSign')}</text>

          {/* EVM chain */}
          <rect x="385" y="80" width="120" height="100" rx="8" fill="#6366f118" stroke="#6366f1" strokeWidth="1.5" />
          <text x="445" y="105" textAnchor="middle" fontSize="11" fontWeight="900" fill="#6366f1">{t('xrplAxelarAnim.svg.evmTitle')}</text>
          <text x="445" y="123" textAnchor="middle" fontSize="9" fill="hsl(var(--muted-foreground))">{t('xrplAxelarAnim.svg.evmSub')}</text>
          <text x="445" y="148" textAnchor="middle" fontSize="9" fontWeight="700" fill="hsl(var(--foreground))">{t('xrplAxelarAnim.svg.evmLine1')}</text>
          <text x="445" y="164" textAnchor="middle" fontSize="8" fill="hsl(var(--muted-foreground))">{t('xrplAxelarAnim.svg.evmLine2')}</text>

          {/* Static channel cues */}
          <line x1="135" y1="130" x2="200" y2="130" stroke="#06b6d460" strokeWidth="1.4" strokeDasharray="4 3" />
          <line x1="320" y1="130" x2="385" y2="130" stroke="#6366f160" strokeWidth="1.4" strokeDasharray="4 3" />

          {/* Animated packet */}
          <g ref={packetRef} style={{ opacity: 0, transformBox: 'fill-box' as React.CSSProperties['transformBox'], transformOrigin: '75px 130px' }}>
            <rect x="60" y="118" width="30" height="22" rx="3" fill="#facc15" stroke="#a16207" strokeWidth="1.3" />
            <text x="75" y="133" textAnchor="middle" fontSize="9" fontWeight="900" fill="#7c2d12">GMP</text>
          </g>
        </svg>
      </div>

      {/* Mini-legend */}
      <div className="shrink-0 grid grid-cols-3 gap-2 text-[10px]">
        <div className="rounded-md p-1.5 border" style={{ borderColor: '#06b6d455', backgroundColor: '#06b6d410' }}>
          <span className="font-black text-[#06b6d4]">XRPL</span> <span className="text-muted-foreground">{t('xrplAxelarAnim.legend.xrpl')}</span>
        </div>
        <div className="rounded-md p-1.5 border" style={{ borderColor: '#f59e0b55', backgroundColor: '#f59e0b10' }}>
          <span className="font-black text-[#f59e0b]">Axelar</span> <span className="text-muted-foreground">{t('xrplAxelarAnim.legend.axelar')}</span>
        </div>
        <div className="rounded-md p-1.5 border" style={{ borderColor: '#6366f155', backgroundColor: '#6366f110' }}>
          <span className="font-black text-[#6366f1]">EVM</span> <span className="text-muted-foreground">{t('xrplAxelarAnim.legend.evm')}</span>
        </div>
      </div>
    </div>
  );
}

/* ───────────── "How should these two chains talk?" — tiny chooser ─────────────
   Pick a scenario, pick a route (bridge / IBC / Layer 0), get fit + main risk. */
type RouteId = 'bridge' | 'ibc' | 'l0';
type Verdict = 'best' | 'ok' | 'poor';
const CHOOSER_ROUTES: { id: RouteId; color: string; emoji: string }[] = [
  { id: 'bridge', color: '#f59e0b', emoji: '🌉' },
  { id: 'ibc',    color: '#22d3ee', emoji: '🔁' },
  { id: 'l0',     color: '#6366f1', emoji: '🏛️' },
];
const CHOOSER_VERDICT: Record<Verdict, { color: string; emoji: string }> = {
  best: { color: '#39B54A', emoji: '✅' },
  ok:   { color: '#f59e0b', emoji: '🟡' },
  poor: { color: '#ef4444', emoji: '❌' },
};

function InteropChooser() {
  const { t } = useTranslation('blockchain-platforms/section-4');
  const [scenario, setScenario] = useState(0);
  const [route, setRoute] = useState<RouteId | null>(null);
  const scenarios = t('chooser.scenarios', { returnObjects: true }) as { title: string; desc: string }[];
  const options = t('chooser.options', { returnObjects: true }) as Record<RouteId, { label: string; sub: string }>;
  const fb = route ? (t(`chooser.feedback.s${scenario}.${route}`, { returnObjects: true }) as { verdict: Verdict; text: string; risk: string }) : null;
  const v = fb ? CHOOSER_VERDICT[fb.verdict] : null;

  return (
    <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-3 gap-4">
      {/* 1 — scenario */}
      <div className="flex flex-col gap-2 min-h-0">
        <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground shrink-0">{t('chooser.scenarioLabel')}</p>
        {scenarios.map((sc, i) => {
          const active = scenario === i;
          return (
            <button
              key={sc.title}
              onClick={() => { setScenario(i); setRoute(null); }}
              className={`text-left rounded-xl border-2 p-3 transition-all hover:-translate-y-0.5 flex-1 min-h-0 ${active ? 'shadow-md' : ''}`}
              style={{ borderColor: active ? '#22d3ee' : '#22d3ee40', backgroundColor: active ? '#22d3ee12' : 'hsl(var(--card))' }}
            >
              <p className="text-sm font-bold text-foreground leading-tight">{sc.title}</p>
              <p className="text-xs text-muted-foreground leading-snug mt-1">{sc.desc}</p>
            </button>
          );
        })}
      </div>

      {/* 2 — route */}
      <div className="flex flex-col gap-2 min-h-0">
        <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground shrink-0">{t('chooser.optionLabel')}</p>
        {CHOOSER_ROUTES.map((r) => {
          const active = route === r.id;
          return (
            <button
              key={r.id}
              onClick={() => setRoute(r.id)}
              className={`text-left rounded-xl border-2 p-3 transition-all hover:-translate-y-0.5 flex-1 min-h-0 flex items-center gap-3 ${active ? 'shadow-md' : ''}`}
              style={{ borderColor: active ? r.color : r.color + '55', backgroundColor: active ? r.color + '14' : 'hsl(var(--card))' }}
            >
              <span className="text-2xl leading-none">{r.emoji}</span>
              <div className="min-w-0">
                <p className="text-sm font-bold leading-tight" style={{ color: r.color }}>{options[r.id].label}</p>
                <p className="text-xs text-muted-foreground leading-snug mt-0.5">{options[r.id].sub}</p>
              </div>
            </button>
          );
        })}
      </div>

      {/* 3 — feedback */}
      <div className="flex flex-col gap-2 min-h-0">
        <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground shrink-0">{t('chooser.feedbackLabel')}</p>
        <div className="flex-1 min-h-0 rounded-xl border-2 p-4 flex flex-col gap-3 transition-colors" style={{ borderColor: (v?.color ?? '#6b7280') + '66', backgroundColor: (v?.color ?? '#6b7280') + '0a' }}>
          {!fb || !v ? (
            <p className="text-sm text-muted-foreground italic">{t('chooser.idle')}</p>
          ) : (
            <motion.div key={`${scenario}-${route}`} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col gap-3 min-h-0">
              <div className="inline-flex items-center gap-2 self-start rounded-lg border-2 px-3 py-1.5 text-sm font-black" style={{ borderColor: v.color, backgroundColor: v.color + '14', color: v.color }}>
                <span>{v.emoji}</span>{t(`chooser.verdicts.${fb.verdict}`)}
              </div>
              <p className="text-sm text-foreground leading-snug">{fb.text}</p>
              <div className="rounded-lg border p-2.5 mt-auto" style={{ borderColor: '#ef444450', backgroundColor: '#ef44440a' }}>
                <p className="text-[9px] font-black uppercase tracking-widest text-[#ef4444]">⚠️ {t('chooser.riskLabel')}</p>
                <p className="text-xs text-foreground leading-snug mt-0.5">{fb.risk}</p>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}

interface CardItem { emoji: string; title: string; desc: string; }
interface IconCard { icon: string; title: string; desc: string; }
interface TitledCard { title: string; desc: string; }
interface EmojiCard { emoji: string; title: string; desc: string; }
interface SolutionItem { label: string; sub: string; }
interface PlatformItem { name: string; tagline: string; }
interface ZoneItem { label: string; purpose: string; }
interface MetricItem { metric: string; label: string; }
interface HackItem { name: string; amount: string; year: string; chain: string; method: string; }
interface UseCaseItem { title: string; scenario: string; how: string; }
interface EcoApp {
  emoji: string;
  name: string;
  category: string;
  tag: string;
  stats: string;
  items: { name: string; kind: string }[];
}

export function BP_Section4() {
  const { t } = useTranslation('blockchain-platforms/section-4');

  const chapters = useMemo(
    () =>
      chapterShape.map((c) =>
        'kind' in c
          ? { kind: 'group' as const, id: c.id, label: t(`groups.${c.id}`) }
          : { id: c.id, label: t(`chapters.${c.id}`) }
      ),
    [t]
  );

  const islandCards = t('interop.islands.cards', { returnObjects: true }) as CardItem[];
  const mattersSolutions = t('interop.matters.solutions', { returnObjects: true }) as SolutionItem[];
  const useCases = t('usecases.items', { returnObjects: true }) as UseCaseItem[];
  const hoodLabel = t('ui.hood');
  const recapLabel = t('ui.recap');
  const keyLabel = t('ui.keyPoint');
  const kp = (id: string) => <KeyPointBar label={keyLabel} text={t(`keyPoints.${id}`)} color="#22d3ee" className="mt-3" />;

  const layer0Provides = t('layer0.provides', { returnObjects: true }) as IconCard[];
  const layer0Platforms = t('layer02.platforms', { returnObjects: true }) as PlatformItem[];

  const bridgeHacks = t('bridges.hacks', { returnObjects: true }) as HackItem[];
  const bridgeDangers = t('bridges.dangers', { returnObjects: true }) as IconCard[];
  const bridgeSafer = t('bridges.safer', { returnObjects: true }) as TitledCard[];

  const cosmosZones = t('cosmos.zones', { returnObjects: true }) as ZoneItem[];
  const cosmosMetrics = t('cosmos.metrics', { returnObjects: true }) as MetricItem[];
  const cosmosProperties = t('cosmos.properties', { returnObjects: true }) as EmojiCard[];
  const cosmosApps = t('cosmosEco.apps', { returnObjects: true }) as EcoApp[];

  const xrpDesign = t('xrp.design', { returnObjects: true }) as EmojiCard[];
  const xrpPillars = t('xrp.pillars', { returnObjects: true }) as Array<{ label: string; title: string; body: string }>;

  const quizOptions = t('quiz.options', { returnObjects: true }) as string[];
  const takeawayItems = t('takeaways.items', { returnObjects: true }) as string[];

  // Color/style data kept language-neutral; merged with translated text below.
  const platformMeta = [
    { emoji: '🔴', token: 'DOT',  consensus: 'BABE + GRANDPA',   color: '#e6007a' },
    { emoji: '🔺', token: 'AVAX', consensus: 'Snowman (sub-1s)', color: '#e84142' },
    { emoji: '₿',  token: 'BABY', consensus: 'BTC-staked PoS',   color: '#f59e0b' },
  ];
  const hackColors = ['#ef4444', '#f97316', '#eab308', '#6366f1'];
  const saferColors = ['#39B54A', '#6366f1', '#ef4444'];
  const zoneMeta = [
    { angle: -90,  color: '#f59e0b' },
    { angle: -30,  color: '#6366f1' },
    { angle: 30,   color: '#8b5cf6' },
    { angle: 90,   color: '#ec4899' },
    { angle: 150,  color: '#ef4444' },
    { angle: -150, color: '#10b981' },
  ];
  const cosmosAppColors = ['#7B2BF9', '#6966FF', '#7E5CF7', '#FF414C', '#E91E63'];
  const xrpPillarColors = ['#06b6d4', '#f59e0b', '#10b981'];
  const useCaseMeta = [
    { emoji: '💱', color: '#6366f1' },
    { emoji: '₿',  color: '#f7931a' },
    { emoji: '💵', color: '#10b981' },
    { emoji: '🎮', color: '#ec4899' },
    { emoji: '🏢', color: '#0EA5E9' },
    { emoji: '🌍', color: '#f59e0b' },
  ];
  // Island map for the opening slide — positions in a 480×240 viewBox.
  const islands = [
    { name: 'Bitcoin',  x: 80,  y: 70,  color: '#f7931a' },
    { name: 'Ethereum', x: 240, y: 55,  color: '#627EEA' },
    { name: 'Solana',   x: 400, y: 80,  color: '#9945FF' },
    { name: 'Fabric',   x: 160, y: 185, color: '#0EA5E9' },
    { name: 'XRPL',     x: 330, y: 190, color: '#06b6d4' },
  ];
  const islandGaps: [number, number][] = [[0, 1], [1, 2], [0, 3], [1, 4], [3, 4], [2, 4]];

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
            icon={<Network className="size-20 text-[#22d3ee]" />}
            gradient="from-[#22d3ee] to-[#6366f1]"
          />
        </div>

        {/* ═══════ S4-INTEROP ═══════ */}
        <div id="s4-interop" className="h-full flex flex-col p-6 lg:p-10">
          <div className="shrink-0 mb-4">
            <h2 className="text-2xl lg:text-4xl font-bold text-foreground mb-1">{t('interop.heading')}</h2>
            <p className="text-sm lg:text-base text-muted-foreground max-w-4xl">{t('interop.subtitle')}</p>
            <div className="mt-2">
              <RecapHandoff label={recapLabel} text={t('interop.recap')} color="#39B54A" />
            </div>
          </div>

          <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6 min-h-0">
            {/* Left — island map + analogy */}
            <div className="flex flex-col gap-3 min-h-0">
              <div className="flex-1 min-h-[220px] rounded-xl border border-border bg-card/40 p-3 flex flex-col">
                <svg viewBox="0 0 480 240" className="w-full flex-1">
                  {islandGaps.map(([a, b], i) => {
                    const A = islands[a], B = islands[b];
                    const mx = (A.x + B.x) / 2, my = (A.y + B.y) / 2;
                    return (
                      <g key={i}>
                        <line x1={A.x} y1={A.y} x2={B.x} y2={B.y} stroke="hsl(var(--muted-foreground))" strokeWidth="1" strokeDasharray="3 4" opacity="0.35" />
                        <circle cx={mx} cy={my} r="8" fill="hsl(var(--card))" stroke="#ef4444" strokeWidth="1" />
                        <text x={mx} y={my + 3.5} textAnchor="middle" fontSize="9" fontWeight="900" fill="#ef4444">✕</text>
                      </g>
                    );
                  })}
                  {islands.map((isl) => (
                    <g key={isl.name}>
                      <circle cx={isl.x} cy={isl.y} r="30" fill={isl.color + '22'} stroke={isl.color} strokeWidth="1.5" />
                      <text x={isl.x} y={isl.y + 4} textAnchor="middle" fontSize="11" fontWeight="800" fill={isl.color}>{isl.name}</text>
                    </g>
                  ))}
                  <text x="240" y="232" textAnchor="middle" fontSize="9" fill="hsl(var(--muted-foreground))">✕ = {t('interop.svg.noLink')}</text>
                </svg>
                <p className="text-[11px] text-muted-foreground text-center shrink-0 mt-1">{t('interop.svg.caption')}</p>
              </div>
              <div className="shrink-0 rounded-xl border p-3" style={{ borderColor: '#22d3ee55', backgroundColor: '#22d3ee0d' }}>
                <p className="text-[10px] font-black uppercase tracking-widest text-[#22d3ee]">{t('interop.analogyLabel')}</p>
                <p className="text-sm text-foreground mt-1 leading-snug">{t('interop.analogy')}</p>
              </div>
            </div>

            {/* Right — the three frictions + where we go next */}
            <div className="flex flex-col gap-3 min-h-0">
              <div className="shrink-0">
                <h3 className="text-base lg:text-lg font-semibold text-foreground">{t('interop.islands.title')}</h3>
                <p className="text-xs lg:text-sm text-muted-foreground">{t('interop.islands.intro')}</p>
              </div>
              <div className="flex-1 min-h-0 grid auto-rows-fr gap-2">
                {islandCards.map((card) => (
                  <motion.div
                    key={card.title}
                    initial={{ opacity: 0, x: 16 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.3 }}
                    className="flex gap-3 p-3 bg-card rounded-xl border border-[#22d3ee]/20 hover:border-[#22d3ee]/60 transition-colors min-h-0 items-start"
                  >
                    <span className="text-xl lg:text-2xl flex-shrink-0">{card.emoji}</span>
                    <div className="min-w-0">
                      <p className="text-sm lg:text-base font-semibold text-foreground">{card.title}</p>
                      <p className="text-xs lg:text-sm text-muted-foreground mt-0.5 leading-snug">{card.desc}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
              <div className="shrink-0">
                <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">{t('interop.matters.solutionsLabel')}</p>
                <div className="grid grid-cols-3 gap-2">
                  {mattersSolutions.map((s, i) => {
                    const color = ['#f59e0b', '#22d3ee', '#6366f1'][i];
                    return (
                      <div key={s.label} className="p-2 bg-card rounded-lg border text-center" style={{ borderColor: `${color}40` }}>
                        <p className="text-xs lg:text-sm font-semibold" style={{ color }}>{s.label}</p>
                        <p className="text-[10px] lg:text-xs text-muted-foreground mt-0.5">{s.sub}</p>
                      </div>
                    );
                  })}
                </div>
              </div>
              <UnderTheHood label={hoodLabel} terms={['consensus', 'state', 'wrapped token', 'light client']} className="self-start" />
            </div>
          </div>
          {kp('s4-interop')}
        </div>

        {/* ═══════ S4-USECASES — real-world situations ═══════ */}
        <div id="s4-usecases" className="h-full flex flex-col p-6 lg:p-10">
          <div className="shrink-0 mb-4">
            <h2 className="text-2xl lg:text-3xl font-bold text-foreground">{t('usecases.heading')}</h2>
            <p className="text-sm text-muted-foreground mt-1 max-w-4xl">{t('usecases.subtitle')}</p>
          </div>

          <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-3 gap-3">
            {useCases.map((u, i) => {
              const { emoji, color } = useCaseMeta[i % useCaseMeta.length];
              return (
                <motion.div
                  key={u.title}
                  initial={{ opacity: 0, y: 12 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.3, delay: i * 0.05 }}
                  className="rounded-xl border-2 p-4 flex flex-col gap-2 min-h-0"
                  style={{ borderColor: color + '50', backgroundColor: color + '08' }}
                >
                  <div className="flex items-center gap-2.5">
                    <span className="text-2xl leading-none">{emoji}</span>
                    <p className="font-bold text-lg text-foreground leading-tight">{u.title}</p>
                  </div>
                  <p className="text-base text-muted-foreground leading-snug flex-1">{u.scenario}</p>
                  <div className="shrink-0 flex items-baseline gap-1.5 flex-wrap">
                    <span className="text-[9px] font-black uppercase tracking-widest" style={{ color }}>{t('usecases.howLabel')}</span>
                    <span className="text-[11px] font-semibold text-foreground">{u.how}</span>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {kp('s4-usecases')}
        </div>

        {/* ═══════ S4-INTEROP-COMPARE ═══════ */}
        <div id="s4-interop-compare" className="h-full flex flex-col p-6 lg:p-10">
          <div className="shrink-0 mb-4">
            <h2 className="text-2xl lg:text-3xl font-bold text-foreground">{t('interopCompare.heading')}</h2>
            <p className="text-sm text-muted-foreground mt-1">{t('interopCompare.subtitle')}</p>
          </div>

          <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-3 gap-4">

            {[
              {
                key: 'col1',
                accent: '#f59e0b',
                rowColors: { mechanism: '#f59e0b', trust: '#f97316', risk: '#ef4444', finality: '#6b7280', compatibility: '#10b981' },
              },
              {
                key: 'col2',
                accent: '#22d3ee',
                rowColors: { mechanism: '#22d3ee', trust: '#10b981', risk: '#10b981', finality: '#22d3ee', compatibility: '#f59e0b' },
              },
              {
                key: 'col3',
                accent: '#6366f1',
                rowColors: { mechanism: '#6366f1', trust: '#10b981', risk: '#f59e0b', finality: '#10b981', compatibility: '#ef4444' },
              },
            ].map((col) => {
              // Three plain-language rows; the analogy card is the one to read first.
              const rowKeys = ['mechanism', 'trust', 'risk'] as const;
              return (
                <div key={col.key} className="flex flex-col gap-2 min-h-0 rounded-xl border-2 p-4" style={{ borderColor: col.accent + '55', backgroundColor: col.accent + '05' }}>
                  <div className="shrink-0">
                    <div className="text-[10px] font-black uppercase tracking-widest mb-1" style={{ color: col.accent }}>{t(`interopCompare.${col.key}.approachLabel`)}</div>
                    <div className="text-lg font-black text-foreground leading-tight">{t(`interopCompare.${col.key}.title`)}</div>
                    <div className="text-xs text-muted-foreground mt-0.5">{t(`interopCompare.${col.key}.subtitle`)}</div>
                  </div>

                  <div className="shrink-0 p-3 rounded-lg border-2" style={{ borderColor: col.accent + '70', backgroundColor: col.accent + '12' }}>
                    <div className="text-[9px] font-black uppercase tracking-wider mb-1" style={{ color: col.accent }}>{t('interopCompare.rowLabels.analogy')}</div>
                    <div className="text-sm font-semibold text-foreground leading-snug">{t(`interopCompare.${col.key}.analogy`)}</div>
                  </div>

                  <div className="flex-1 min-h-0 flex flex-col gap-2">
                    {rowKeys.map((rk) => (
                      <div key={rk} className="flex flex-col gap-0.5 p-2 rounded-lg bg-card border border-border">
                        <div className="text-[9px] font-black uppercase tracking-wider" style={{ color: col.rowColors[rk] }}>{t(`interopCompare.rowLabels.${rk}`)}</div>
                        <div className="text-xs text-muted-foreground leading-snug">{t(`interopCompare.${col.key}.${rk}`)}</div>
                      </div>
                    ))}
                    <div className="mt-auto p-2 rounded-lg border" style={{ borderColor: col.accent + '40', backgroundColor: col.accent + '08' }}>
                      <div className="text-[9px] font-black uppercase tracking-wider mb-1" style={{ color: col.accent }}>{t('interopCompare.examplesLabel')}</div>
                      <div className="text-[11px] text-muted-foreground">{t(`interopCompare.${col.key}.examples`)}</div>
                    </div>
                  </div>
                </div>
              );
            })}

          </div>
          {kp('s4-interop-compare')}
          <div className="shrink-0 mt-2">
            <UnderTheHood label={hoodLabel} terms={['lock-and-mint', 'multisig', 'light client', 'relayer', 'shared validator set']} />
          </div>
        </div>

        {/* ═══════ S4-CHOOSER — interactive: how should these two chains talk? ═══════ */}
        <div id="s4-chooser" className="h-full flex flex-col p-6 lg:p-10">
          <div className="shrink-0 mb-4">
            <span className="px-2.5 py-0.5 rounded-full bg-[#22d3ee]/15 border border-[#22d3ee]/40 text-[#22d3ee] text-xs font-bold">{t('chooser.badge')}</span>
            <h2 className="text-2xl lg:text-3xl font-bold text-foreground mt-1">{t('chooser.heading')}</h2>
            <p className="text-sm text-muted-foreground mt-1 max-w-4xl">{t('chooser.subtitle')}</p>
          </div>
          <InteropChooser />
          {kp('s4-chooser')}
        </div>

        {/* ═══════ BRIDGE SECURITY ═══════ */}
        <div id="s4-bridges" className="h-full flex flex-col p-5 lg:p-8">
          <div className="shrink-0 mb-4">
            <h2 className="text-2xl lg:text-3xl font-bold text-foreground mb-1">{t('bridges.heading')}</h2>
            <p className="text-sm text-muted-foreground max-w-4xl">{t('bridges.subA')}<span className="font-semibold text-foreground">{t('bridges.subAmount')}</span>{t('bridges.subB')}</p>
          </div>
          <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-3 gap-4">

            {/* How a bridge works — the vault visual */}
            <div className="flex flex-col gap-2 min-h-0">
              <div className="text-xs font-black uppercase tracking-widest text-muted-foreground shrink-0">{t('bridges.vault.label')}</div>
              <div className="flex-1 min-h-0 rounded-xl border border-border bg-card/40 p-3 flex flex-col">
                <svg viewBox="0 0 300 200" className="w-full flex-1">
                  {/* Chain A vault */}
                  <rect x="12" y="40" width="110" height="120" rx="10" fill="#f59e0b14" stroke="#f59e0b" strokeWidth="1.5" />
                  <text x="67" y="30" textAnchor="middle" fontSize="11" fontWeight="900" fill="#f59e0b">{t('bridges.vault.chainA')}</text>
                  <text x="67" y="78" textAnchor="middle" fontSize="26">🔒</text>
                  <text x="67" y="112" textAnchor="middle" fontSize="15" fontWeight="900" fill="hsl(var(--foreground))">1,000 ETH</text>
                  <text x="67" y="128" textAnchor="middle" fontSize="8.5" fill="hsl(var(--muted-foreground))">{t('bridges.vault.locked')}</text>
                  <text x="67" y="150" textAnchor="middle" fontSize="8.5" fill="#f59e0b">+ every new user ↑</text>
                  {/* Arrow */}
                  <line x1="128" y1="100" x2="168" y2="100" stroke="hsl(var(--muted-foreground))" strokeWidth="1.5" strokeDasharray="4 3" />
                  <polygon points="168,95 178,100 168,105" fill="hsl(var(--muted-foreground))" />
                  <text x="150" y="90" textAnchor="middle" fontSize="8" fill="hsl(var(--muted-foreground))">bridge</text>
                  {/* Chain B copies */}
                  <rect x="178" y="40" width="110" height="120" rx="10" fill="#6366f114" stroke="#6366f1" strokeWidth="1.5" />
                  <text x="233" y="30" textAnchor="middle" fontSize="11" fontWeight="900" fill="#6366f1">{t('bridges.vault.chainB')}</text>
                  <text x="233" y="78" textAnchor="middle" fontSize="26">🎟️</text>
                  <text x="233" y="112" textAnchor="middle" fontSize="15" fontWeight="900" fill="hsl(var(--foreground))">1,000 wETH</text>
                  <text x="233" y="128" textAnchor="middle" fontSize="8.5" fill="hsl(var(--muted-foreground))">{t('bridges.vault.minted')}</text>
                  <text x="150" y="190" textAnchor="middle" fontSize="9" fontWeight="700" fill="#ef4444">🍯 {bridgeDangers[0]?.title}</text>
                </svg>
                <p className="text-[11px] text-muted-foreground leading-snug shrink-0 mt-1">{t('bridges.vault.caption')}</p>
              </div>
              <div className="shrink-0 rounded-lg border p-2.5" style={{ borderColor: '#f59e0b60', backgroundColor: '#f59e0b10' }}>
                <p className="text-[10px] font-black uppercase tracking-widest text-[#f59e0b]">{t('bridges.honestLabel')}</p>
                <p className="text-xs text-foreground leading-snug mt-0.5">{t('bridges.honest')}</p>
              </div>
            </div>

            {/* Hall of shame */}
            <div className="flex flex-col gap-2 min-h-0">
              <div className="text-xs font-black uppercase tracking-widest text-muted-foreground shrink-0">{t('bridges.hacksLabel')}</div>
              <div className="flex-1 min-h-0 grid auto-rows-fr gap-2">
                {bridgeHacks.map((h, i) => {
                  const color = hackColors[i];
                  return (
                    <div key={h.name} className="min-h-0 p-3 bg-card border rounded-xl flex flex-col gap-1" style={{ borderColor: color + '40' }}>
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-sm text-foreground">{h.name}</span>
                        <span className="font-black text-base" style={{ color }}>{h.amount}</span>
                      </div>
                      <div className="text-[11px] text-muted-foreground">{h.year} · {h.chain}</div>
                      <div className="text-xs text-muted-foreground leading-snug">{h.method}</div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Why risky (3) + what safer looks like (3) */}
            <div className="flex flex-col gap-2 min-h-0">
              <div className="text-xs font-black uppercase tracking-widest text-muted-foreground shrink-0">{t('bridges.dangerLabel')}</div>
              <div className="flex-1 min-h-0 grid auto-rows-fr gap-2">
                {bridgeDangers.slice(0, 3).map(r => (
                  <div key={r.title} className="min-h-0 p-2.5 bg-card border border-border rounded-xl flex gap-2.5 items-start">
                    <span className="text-xl shrink-0 leading-none">{r.icon}</span>
                    <div className="min-w-0">
                      <div className="font-bold text-xs text-foreground mb-0.5">{r.title}</div>
                      <div className="text-xs text-muted-foreground leading-snug">{r.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="text-xs font-black uppercase tracking-widest text-muted-foreground shrink-0 mt-1">{t('bridges.saferLabel')}</div>
              <div className="flex-1 min-h-0 grid auto-rows-fr gap-2">
                {[0, 1, 2].map((idx) => {
                  const p = bridgeSafer[idx];
                  if (!p) return null;
                  const color = saferColors[idx];
                  return (
                    <div key={p.title} className="min-h-0 flex gap-2.5 p-2.5 bg-card border rounded-xl items-start" style={{ borderColor: color + '30' }}>
                      <div className="w-1 self-stretch rounded-full shrink-0" style={{ backgroundColor: color }} />
                      <div className="min-w-0">
                        <div className="font-bold text-xs mb-0.5" style={{ color }}>{p.title}</div>
                        <div className="text-xs text-muted-foreground leading-snug">{p.desc}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
          {kp('s4-bridges')}
        </div>

        {/* ═══════ S4-COSMOS ═══════ */}
        <div id="s4-cosmos" className="h-full flex flex-col p-6 lg:p-10">
          <div className="shrink-0 mb-4">
            <h2 className="text-2xl lg:text-3xl font-bold text-foreground">
              {t('cosmos.heading')}
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              {t('cosmos.subtitle')}
            </p>
          </div>

          <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-5 min-h-0">

            {/* Left — Architecture visual */}
            <div className="flex flex-col gap-2 min-h-0">
              <div className="flex items-center gap-2 shrink-0">
                <div className="size-2 rounded-full bg-[#22d3ee]" />
                <h3 className="text-base lg:text-lg font-semibold text-foreground">{t('cosmos.archTitle')}</h3>
                <span className="ml-auto text-[10px] text-muted-foreground italic">{t('cosmos.archNote')}</span>
              </div>

              {/* Hub visual */}
              <div className="relative flex-1 min-h-[260px] flex items-center justify-center bg-card/50 rounded-xl border border-border p-4">
                {/* IBC mesh lines (drawn behind everything) */}
                <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: 0 }}>
                  {/* Hub-to-zone (solid-ish) */}
                  {[-90, -30, 30, 90, 150, -150].map((angle, i) => {
                    const rad = (angle * Math.PI) / 180;
                    const r = 38;
                    const ex = 50 + Math.cos(rad) * r;
                    const ey = 50 + Math.sin(rad) * r;
                    return (
                      <line
                        key={`spoke-${i}`}
                        x1="50%" y1="50%"
                        x2={`${ex}%`} y2={`${ey}%`}
                        stroke="#22d3ee"
                        strokeWidth="1.2"
                        strokeDasharray="4 3"
                        opacity="0.5"
                      />
                    );
                  })}
                  {/* A few zone-to-zone arcs to suggest the mesh */}
                  {[
                    { a: -90, b: -30 },
                    { a: -30, b: 90 },
                    { a: 90, b: 150 },
                    { a: 150, b: -150 },
                  ].map(({ a, b }, i) => {
                    const ra = (a * Math.PI) / 180;
                    const rb = (b * Math.PI) / 180;
                    const r = 38;
                    return (
                      <line
                        key={`mesh-${i}`}
                        x1={`${50 + Math.cos(ra) * r}%`} y1={`${50 + Math.sin(ra) * r}%`}
                        x2={`${50 + Math.cos(rb) * r}%`} y2={`${50 + Math.sin(rb) * r}%`}
                        stroke="#22d3ee"
                        strokeWidth="0.8"
                        strokeDasharray="2 4"
                        opacity="0.25"
                      />
                    );
                  })}
                </svg>

                {/* Central hub */}
                <div className="relative z-10 flex flex-col items-center">
                  <div className="size-16 lg:size-20 rounded-full bg-[#22d3ee]/15 border-2 border-[#22d3ee] flex flex-col items-center justify-center shadow-[0_0_20px_rgba(34,211,238,0.25)]">
                    <span className="text-[11px] lg:text-xs font-black text-[#22d3ee] leading-tight">{t('cosmos.hubName1')}</span>
                    <span className="text-[11px] lg:text-xs font-black text-[#22d3ee] leading-tight">{t('cosmos.hubName2')}</span>
                  </div>
                  <p className="text-[10px] text-muted-foreground mt-1 font-medium">{t('cosmos.hubToken')}</p>
                </div>

                {/* Zone satellites */}
                {cosmosZones.map(({ label, purpose }, zi) => {
                  const { angle, color } = zoneMeta[zi];
                  const rad = (angle * Math.PI) / 180;
                  const rPct = 38;
                  return (
                    <div
                      key={label}
                      className="absolute flex flex-col items-center gap-0.5 z-10"
                      style={{
                        left: `calc(50% + ${Math.cos(rad) * rPct}%)`,
                        top: `calc(50% + ${Math.sin(rad) * rPct}%)`,
                        transform: 'translate(-50%, -50%)',
                      }}
                    >
                      <div
                        className="size-11 lg:size-12 rounded-full flex items-center justify-center text-[9px] lg:text-[10px] font-black text-center px-1 leading-none"
                        style={{ backgroundColor: `${color}20`, border: `1.5px solid ${color}`, color }}
                      >
                        {label}
                      </div>
                      <span className="text-[9px] text-muted-foreground whitespace-nowrap font-medium">{purpose}</span>
                    </div>
                  );
                })}
              </div>

              {/* Metric strip */}
              <div className="grid grid-cols-3 gap-2 shrink-0">
                {cosmosMetrics.map(s => (
                  <div key={s.label} className="px-2 py-1.5 rounded-lg border border-[#22d3ee]/30 bg-[#22d3ee]/5 text-center">
                    <div className="text-xs font-black text-[#22d3ee] leading-none">{s.metric}</div>
                    <div className="text-[9px] text-muted-foreground mt-0.5 uppercase tracking-wider leading-snug">{s.label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right — Properties + token role + IBC reach */}
            <div className="flex flex-col gap-2 min-h-0">
              <div className="flex items-center gap-2 shrink-0">
                <div className="size-2 rounded-full bg-[#6366f1]" />
                <h3 className="text-base lg:text-lg font-semibold text-foreground">{t('cosmos.propertiesTitle')}</h3>
              </div>

              <div className="flex-1 min-h-0 grid auto-rows-fr gap-2">
                {cosmosProperties.map((card) => (
                  <motion.div
                    key={card.title}
                    initial={{ opacity: 0, x: 16 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.3 }}
                    className="flex gap-3 p-2.5 bg-card rounded-lg border border-[#22d3ee]/25 hover:border-[#22d3ee]/55 transition-colors min-h-0"
                  >
                    <span className="text-lg lg:text-xl flex-shrink-0 leading-none mt-0.5">{card.emoji}</span>
                    <div className="min-w-0">
                      <p className="text-xs lg:text-sm font-semibold text-foreground">{card.title}</p>
                      <p className="text-[10px] lg:text-xs text-muted-foreground mt-0.5 leading-relaxed">{card.desc}</p>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* IBC reach beyond Cosmos */}
              <div className="shrink-0">
                <div className="p-2.5 bg-[#6366f1]/5 rounded-lg border border-[#6366f1]/30">
                  <p className="text-[11px] font-bold text-[#6366f1] mb-1 flex items-center gap-1.5">
                    <span>🔗</span> {t('cosmos.beyondTitle')}
                  </p>
                  <p className="text-[10px] text-muted-foreground leading-relaxed">
                    {t('cosmos.beyondBodyA')}<span className="font-semibold text-foreground">{t('cosmos.beyondBodyStrong')}</span>{t('cosmos.beyondBodyB')}
                  </p>
                </div>
              </div>
            </div>
          </div>
          {kp('s4-cosmos')}
        </div>

        {/* ═══════ COSMOS APPS — ecosystem ═══════ */}
        <div id="s4-cosmos-eco" className="h-full flex flex-col p-6 lg:p-10">
          <div className="shrink-0 mb-3">
            <h2 className="text-2xl lg:text-3xl font-bold text-foreground">{t('cosmosEco.heading')}</h2>
            <p className="text-sm text-muted-foreground mt-1">{t('cosmosEco.subtitle')}</p>
          </div>

          <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-5 gap-2.5">
            {cosmosApps.map((app, ai) => {
              const color = cosmosAppColors[ai];
              return (
                <motion.div
                  key={app.name}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className="flex flex-col gap-1.5 p-2.5 rounded-xl border-2 min-h-0"
                  style={{ borderColor: color + '55', backgroundColor: color + '0a' }}
                >
                  <div className="shrink-0">
                    <div className="flex items-center gap-1.5">
                      <span className="text-base shrink-0 leading-none">{app.emoji}</span>
                      <div className="font-black text-[12px] leading-tight" style={{ color }}>{app.name}</div>
                    </div>
                    <span
                      className="inline-block text-[8px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded mt-1"
                      style={{ backgroundColor: color + '20', color, border: `1px solid ${color}40` }}
                    >
                      {app.category}
                    </span>
                  </div>

                  <div className="shrink-0">
                    <div className="text-[10px] text-foreground font-medium leading-tight">{app.tag}</div>
                    <div className="text-[9px] text-muted-foreground italic leading-snug mt-0.5">{app.stats}</div>
                  </div>

                  <div className="flex-1 min-h-0 flex flex-col gap-1">
                    {app.items.slice(0, 3).map(item => (
                      <div
                        key={item.name}
                        className="rounded-md border bg-card/60 px-1.5 py-1 min-h-0"
                        style={{ borderColor: color + '35' }}
                      >
                        <div className="text-[10px] font-bold leading-tight" style={{ color }}>{item.name}</div>
                        <div className="text-[9px] text-muted-foreground leading-snug mt-0.5">{item.kind}</div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              );
            })}
          </div>

          <div className="shrink-0 mt-3 rounded-xl border p-2.5" style={{ borderColor: '#22d3ee55', backgroundColor: '#22d3ee0d' }}>
            <p className="text-[11px] text-muted-foreground leading-snug">
              <span className="font-bold" style={{ color: '#22d3ee' }}>{t('cosmosEco.footerStrong')}</span>
              <span className="font-medium text-foreground">{t('cosmosEco.footerA')}</span>{t('cosmosEco.footerAtext')}<span className="font-medium text-foreground">{t('cosmosEco.footerB')}</span>{t('cosmosEco.footerBtext')}<span className="font-medium text-foreground">{t('cosmosEco.footerC')}</span>{t('cosmosEco.footerCtext')}<span className="font-medium text-foreground">{t('cosmosEco.footerD')}</span>{t('cosmosEco.footerDtext')}<span className="font-medium text-foreground">{t('cosmosEco.footerE')}</span>{t('cosmosEco.footerEtext')}<span className="font-medium text-foreground">{t('cosmosEco.footerF')}</span>{t('cosmosEco.footerFtext')}<span className="font-medium text-foreground">{t('cosmosEco.footerG')}</span>{t('cosmosEco.footerGtext')}
            </p>
          </div>
          {kp('s4-cosmos-eco')}
        </div>

        {/* ═══════ S4-LAYER0 (1/2) — Animated Concept ═══════ */}
        <div id="s4-layer0" className="h-full flex flex-col p-5 lg:p-8">
          <div className="shrink-0 mb-3">
            <h2 className="text-2xl lg:text-3xl font-bold text-foreground">{t('layer0.heading')}</h2>
            <p className="text-sm text-muted-foreground max-w-3xl">
              {t('layer0.leadA')}<strong className="text-foreground">{t('layer0.leadStrong')}</strong>{t('layer0.leadB')}<em>{t('layer0.leadEm')}</em>{t('layer0.leadC')}
            </p>
            <div className="mt-2 flex flex-wrap gap-2">
              <RecapHandoff label={recapLabel} text="Section 02 · Rollups & L2s" to="/blockchain-platforms/section-2" color="#39B54A" />
              <UnderTheHood label={hoodLabel} terms={['relay chain', 'parachain', 'XCM', 'Warp', 'restaking']} />
            </div>
          </div>

          <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-[1.3fr_1fr] gap-5">
            {/* Left: animated stack */}
            <Layer0AnimatedStack />

            {/* Right: what L0 provides */}
            <div className="flex flex-col gap-3 min-h-0">
              <div className="rounded-xl border p-3" style={{ borderColor: '#22d3ee55', backgroundColor: '#22d3ee0d' }}>
                <p className="text-[10px] font-black uppercase tracking-widest" style={{ color: '#22d3ee' }}>{t('layer0.inOneLineLabel')}</p>
                <p className="text-sm text-foreground mt-1 leading-snug">
                  {t('layer0.inOneLine')}
                </p>
              </div>
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider shrink-0">{t('layer0.providesLabel')}</p>
              <div className="flex-1 min-h-0 grid auto-rows-fr gap-2">
                {layer0Provides.map(c => (
                  <div key={c.title} className="rounded-lg border border-[#22d3ee]/30 bg-card p-2.5 flex items-start gap-2.5 min-h-0">
                    <span className="text-lg shrink-0 leading-none mt-0.5">{c.icon}</span>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-foreground">{c.title}</p>
                      <p className="text-[11px] text-muted-foreground leading-snug mt-0.5">{c.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          {kp('s4-layer0')}
        </div>

        {/* ═══════ S4-LAYER0 (2/2) — Platforms & Trade-off vs Cosmos ═══════ */}
        <div id="s4-layer0-2" className="h-full flex flex-col p-6 lg:p-10">
          <div className="shrink-0 mb-5">
            <h2 className="text-2xl lg:text-3xl font-bold text-foreground">{t('layer02.heading')}</h2>
            <p className="text-sm text-muted-foreground mt-1">{t('layer02.subtitle')}</p>
          </div>

          <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-6 min-h-0">

            {/* Left — L0 platforms */}
            <div className="flex flex-col gap-3 min-h-0">
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider shrink-0">{t('layer02.platformsLabel')}</p>
              <div className="flex-1 min-h-0 grid auto-rows-fr gap-3">
                {layer0Platforms.map((p, i) => {
                  const meta = platformMeta[i];
                  return (
                    <div key={p.name} className="rounded-xl p-4 min-h-0 flex flex-col gap-2 border" style={{ borderColor: meta.color + '55', backgroundColor: meta.color + '08' }}>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-base">{meta.emoji}</span>
                        <p className="text-base font-bold text-foreground">{p.name}</p>
                        <span className="text-xs px-1.5 py-0.5 rounded font-mono" style={{ backgroundColor: meta.color + '18', color: meta.color, border: `1px solid ${meta.color}35` }}>{meta.token}</span>
                        <span className="ml-auto text-xs text-muted-foreground">{meta.consensus}</span>
                      </div>
                      <p className="text-sm text-muted-foreground leading-snug">{p.tagline}</p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Right — Trade-off vs Cosmos */}
            <div className="flex flex-col justify-center min-h-0">
              <div className="rounded-xl border p-6" style={{ borderColor: '#6366f155', backgroundColor: '#6366f10d' }}>
                <p className="text-[10px] font-black uppercase tracking-widest mb-4" style={{ color: '#6366f1' }}>{t('layer02.tradeoffLabel')}</p>
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <p className="text-sm font-bold text-foreground mb-2">{t('layer02.l0ModelTitle')}</p>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      <span className="text-[#10b981]">↑</span> {t('layer02.l0ModelBody1')}<br/>
                      <span className="text-[#10b981]">↑</span> {t('layer02.l0ModelBody2')}<br/>
                      <span className="text-[#ef4444]">↓</span> {t('layer02.l0ModelBody3')}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-bold text-foreground mb-2">{t('layer02.cosmosModelTitle')}</p>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      <span className="text-[#10b981]">↑</span> {t('layer02.cosmosModelBody1')}<br/>
                      <span className="text-[#10b981]">↑</span> {t('layer02.cosmosModelBody2')}<br/>
                      <span className="text-[#ef4444]">↓</span> {t('layer02.cosmosModelBody3')}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          {kp('s4-layer0-2')}
        </div>

        {/* ═══════ S4-XRP — XRP Ledger (focused, one takeaway) ═══════ */}
        <div id="s4-xrp" className="h-full flex flex-col p-5 lg:p-8">
          <div className="shrink-0 mb-3">
            <span className="px-2.5 py-0.5 rounded-full bg-[#06b6d4]/15 border border-[#06b6d4]/40 text-[#06b6d4] text-xs font-bold">{t('xrp.badgePartner')}</span>
            <h2 className="text-2xl lg:text-3xl font-bold text-foreground mt-1">{t('xrp.heading')}</h2>
          </div>

          {/* Three pillars */}
          <div className="shrink-0 grid grid-cols-1 lg:grid-cols-3 gap-2.5 mb-3">
            {xrpPillars.map((p, i) => {
              const c = xrpPillarColors[i];
              return (
                <div key={p.title} className="rounded-xl border-2 p-3" style={{ borderColor: c + 'AA', backgroundColor: c + '0d' }}>
                  <div className="text-[10px] font-black uppercase tracking-widest" style={{ color: c }}>{p.label}</div>
                  <div className="text-sm font-bold text-foreground mt-0.5">{p.title}</div>
                  <div className="text-[11px] text-muted-foreground leading-snug mt-1">{p.body}</div>
                </div>
              );
            })}
          </div>

          {/* How it's built — design cards in a 2-col grid */}
          <div className="flex-1 min-h-0 flex flex-col gap-2">
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider shrink-0">{t('xrp.designLabel')}</p>
            <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-2 auto-rows-fr gap-2">
              {xrpDesign.map(card => (
                <div key={card.title} className="flex gap-2.5 p-2.5 bg-card rounded-lg border border-[#06b6d4]/25 min-h-0">
                  <span className="text-base shrink-0 leading-none mt-0.5">{card.emoji}</span>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-foreground leading-tight">{card.title}</p>
                    <p className="text-[11px] text-muted-foreground leading-snug mt-0.5">{card.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Honest context footer */}
          <div className="shrink-0 mt-3 flex flex-col lg:flex-row gap-2 lg:items-stretch">
            <div className="flex-1 p-2.5 bg-[#f59e0b]/08 rounded-lg border border-[#f59e0b]/40">
              <p className="text-[11px] font-bold text-[#f59e0b] mb-1">{t('xrp.honestTitle')}</p>
              <p className="text-[11px] text-muted-foreground leading-snug">{t('xrp.honestBody')}</p>
            </div>
            <UnderTheHood label={hoodLabel} terms={['UNL', 'federated BFT', 'Trust Lines', 'XLS-30 AMM', 'Hooks']} className="self-start lg:self-center" />
          </div>
          {kp('s4-xrp')}
        </div>

        {/* ═══════ XRPL ↔ AXELAR — dedicated animation slide ═══════ */}
        <div id="s4-xrp-anim" className="h-full flex flex-col p-5 lg:p-8">
          <div className="shrink-0 mb-3">
            <h2 className="text-2xl lg:text-3xl font-bold text-foreground">{t('xrpAnim.heading')}</h2>
            <p className="text-sm text-muted-foreground max-w-3xl">
              {t('xrpAnim.subtitle')}
            </p>
          </div>
          <div className="flex-1 min-h-0">
            <XrplAxelarFlow />
          </div>
          {kp('s4-xrp-anim')}
        </div>

        {/* ═══════ QUIZ ═══════ */}
        <div id="s4-quiz" className="h-full">
          <QuizSlide
            question={t('quiz.question')}
            options={quizOptions.map((text, i) => ({ text, correct: i === 2 }))}
            explanation={t('quiz.explanation')}
          />
        </div>

        {/* ═══════ TAKEAWAYS ═══════ */}
        <div id="s4-takeaways" className="h-full">
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
