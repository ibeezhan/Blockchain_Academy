import { useEffect, useMemo, useRef, useState } from 'react';
import anime from 'animejs';
import { useTranslation } from 'react-i18next';
import { TitleSlide } from '../components/templates/TitleSlide';
import { ConceptSlide } from '../components/templates/ConceptSlide';
import { TakeawaySlide } from '../components/templates/TakeawaySlide';
import { QuizSlide } from '../components/templates/QuizSlide';
import { SwipeQuiz, type SwipeStatement } from '../components/templates/SwipeQuiz';
import { CalloutBox } from '../components/shared/CalloutBox';
import { ScrollText, ExternalLink, User, X, AlertTriangle } from 'lucide-react';
import { SectionNav } from '../components/navigation/SectionNav';
import { SiteFooter } from '../components/shared/SiteFooter';
import bitcoinPedigree from '../../assets/bf/bitcoin-academic-pedigree.png';

/** Sidebar shape — labels resolved at render time via i18n */
const prologueChaptersShape: ReadonlyArray<{ id: string }> = [
  { id: 'p-money' },
  { id: 'p-money-value' },
  { id: 'p-cypherpunks' },
  { id: 'p-cypherpunk-values' },
  { id: 'p-timeline' },
  { id: 'p-pedigree' },
  { id: 'p-why' },
  { id: 'p-who-controls' },
  { id: 'p-decentralization' },
  { id: 'p-takeaways' },
  { id: 'p-quiz' },
];

/* ── Money Evolution Timeline (animated) ──────────────────────────────── */
const MONEY_EVENT_VISUAL = [
  { emoji: '🐄', color: '#8b5cf6' },
  { emoji: '🐚', color: '#f59e0b' },
  { emoji: '🪙', color: '#ED1C24' },
  { emoji: '💵', color: '#39B54A' },
  { emoji: '💳', color: '#6366f1' },
  { emoji: '₿',  color: '#22d3ee' },
];

function MoneyEvolutionTimeline() {
  const { t } = useTranslation('blockchain-fundamentals/prologue');
  const MONEY_EVENTS = useMemo(
    () => (t('moneyEvents', { returnObjects: true }) as Array<{ era: string; name: string; desc: string }>).map((ev, i) => ({
      ...ev,
      emoji: MONEY_EVENT_VISUAL[i].emoji,
      color: MONEY_EVENT_VISUAL[i].color,
    })),
    [t],
  );
  const containerRef = useRef<HTMLDivElement | null>(null);
  const itemRefs     = useRef<(HTMLDivElement | null)[]>([]);
  const connectorRef = useRef<SVGPathElement | null>(null);
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    if (!containerRef.current) return;
    const obs = new IntersectionObserver(entries => {
      for (const e of entries) {
        if (e.isIntersecting && !revealed) {
          setRevealed(true);

          // Draw the S-connector
          if (connectorRef.current) {
            try {
              const len = connectorRef.current.getTotalLength();
              connectorRef.current.style.strokeDasharray = String(len);
              connectorRef.current.style.strokeDashoffset = String(len);
              anime({
                targets: connectorRef.current,
                strokeDashoffset: [len, 0],
                duration: 1400,
                delay: 450,
                easing: 'easeInOutQuad',
              });
            } catch { /* ignore */ }
          }

          // Stagger reveal each card (top row first L→R, then bottom row L→R)
          itemRefs.current.forEach((el, i) => {
            if (!el) return;
            el.style.opacity = '0';
            el.style.transform = 'translateY(18px) scale(0.94)';
            anime({
              targets: el,
              opacity: [0, 1],
              translateY: [18, 0],
              scale: [0.94, 1],
              duration: 500,
              delay: 200 + i * 140,
              easing: 'easeOutQuad',
            });
          });
          break;
        }
      }
    }, { threshold: 0.3 });
    obs.observe(containerRef.current);
    return () => obs.disconnect();
  }, [revealed]);

  const top = MONEY_EVENTS.slice(0, 3);
  const bottom = MONEY_EVENTS.slice(3, 6);

  const renderCard = (m: typeof MONEY_EVENTS[number], idx: number) => (
    <div
      key={m.name}
      ref={el => { itemRefs.current[idx] = el; }}
      className="flex flex-col bg-card rounded-xl border-2 p-4 shadow-sm hover:shadow-md transition-shadow"
      style={{
        borderColor: m.color + '50',
        boxShadow: `0 4px 14px ${m.color}12`,
        opacity: 0,
      }}
    >
      <div className="flex items-center gap-3 mb-2">
        <div className="text-3xl leading-none">{m.emoji}</div>
        <div className="flex-1 min-w-0">
          <div className="text-[10px] font-mono font-bold uppercase tracking-widest" style={{ color: m.color }}>
            {m.era}
          </div>
          <div className="text-base font-bold text-foreground leading-tight">{m.name}</div>
        </div>
      </div>
      <p className="text-xs text-muted-foreground leading-snug">{m.desc}</p>
    </div>
  );

  return (
    <div ref={containerRef} className="w-full max-w-5xl mx-auto">
      {/* Top row — chronological L→R */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {top.map((m, i) => renderCard(m, i))}
      </div>

      {/* S-shaped connector (top-right of row 1 → bottom-left of row 2) */}
      <div className="relative h-20 my-1">
        {/* SVG curve — stretched to fit width, stroke uses non-scaling so thickness stays constant */}
        <svg
          className="absolute inset-0 w-full h-full"
          viewBox="0 0 1000 80"
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          <defs>
            <linearGradient id="money-snake-gradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#ED1C24" />
              <stop offset="55%" stopColor="#39B54A" />
              <stop offset="100%" stopColor="#6366f1" />
            </linearGradient>
          </defs>
          {/* Soft glow line behind the main stroke */}
          <path
            d="M 920 6 C 920 60 80 20 80 74"
            fill="none"
            stroke="url(#money-snake-gradient)"
            strokeWidth="10"
            strokeLinecap="round"
            strokeOpacity="0.15"
            vectorEffect="non-scaling-stroke"
          />
          {/* Main stroke */}
          <path
            ref={connectorRef}
            d="M 920 6 C 920 60 80 20 80 74"
            fill="none"
            stroke="url(#money-snake-gradient)"
            strokeWidth="3"
            strokeLinecap="round"
            vectorEffect="non-scaling-stroke"
          />
        </svg>
        {/* Arrowhead — separate SVG positioned with CSS, never stretched */}
        <div
          className="absolute pointer-events-none"
          style={{
            left: '8%',
            bottom: '-1px',
            transform: 'translate(-50%, 0)',
          }}
          aria-hidden="true"
        >
          <svg width="18" height="14" viewBox="0 0 18 14">
            <polygon points="2,2 16,2 9,13" fill="#6366f1" />
          </svg>
        </div>
        {/* Origin dot at the start of the curve */}
        <div
          className="absolute pointer-events-none size-2.5 rounded-full"
          style={{
            right: '8%',
            top: '0',
            transform: 'translate(50%, -50%)',
            backgroundColor: '#ED1C24',
          }}
          aria-hidden="true"
        />
      </div>

      {/* Bottom row — chronological L→R (continues the snake) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {bottom.map((m, i) => renderCard(m, i + 3))}
      </div>
    </div>
  );
}

/* ── Cypherpunks → Bitcoin timeline (compact, fits viewport) ─────────── */
const CYPHERPUNK_VISUAL = [
  { icon: '💰', color: '#8b5cf6' },
  { icon: '⏱️', color: '#f59e0b' },
  { icon: '📜', color: '#ED1C24' },
  { icon: '⛏️', color: '#39B54A' },
  { icon: '🥇', color: '#6366f1' },
  { icon: '📄', color: '#22d3ee' },
  { icon: '🚀', color: '#ec4899' },
];

function CypherpunksMovementTimeline() {
  const { t } = useTranslation('blockchain-fundamentals/prologue');
  const CYPHERPUNK_EVENTS = useMemo(
    () => (t('cypherpunksTimeline.events', { returnObjects: true }) as Array<{ year: string; title: string; desc: string }>).map((ev, i) => ({
      ...ev,
      icon: CYPHERPUNK_VISUAL[i].icon,
      color: CYPHERPUNK_VISUAL[i].color,
    })),
    [t],
  );
  const containerRef = useRef<HTMLDivElement | null>(null);
  const lineRef      = useRef<HTMLDivElement | null>(null);
  const itemRefs     = useRef<(HTMLDivElement | null)[]>([]);
  const dotRefs      = useRef<(HTMLDivElement | null)[]>([]);
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    if (!containerRef.current) return;
    const obs = new IntersectionObserver(entries => {
      for (const e of entries) {
        if (e.isIntersecting && !revealed) {
          setRevealed(true);
          if (lineRef.current) {
            lineRef.current.style.transformOrigin = 'top';
            lineRef.current.style.transform = 'scaleY(0)';
            anime({
              targets: lineRef.current,
              scaleY: [0, 1],
              duration: 1600,
              easing: 'easeInOutQuad',
            });
          }
          itemRefs.current.forEach((el, i) => {
            if (!el) return;
            el.style.opacity = '0';
            el.style.transform = 'translateX(-16px)';
            anime({
              targets: el,
              opacity: [0, 1],
              translateX: [-16, 0],
              duration: 500,
              delay: 220 + i * 150,
              easing: 'easeOutQuad',
            });
          });
          dotRefs.current.forEach((el, i) => {
            if (!el) return;
            el.style.transform = 'scale(0)';
            anime({
              targets: el,
              scale: [0, 1.2, 1],
              duration: 500,
              delay: 220 + i * 150 + 80,
              easing: 'easeOutBack',
            });
          });
          break;
        }
      }
    }, { threshold: 0.25 });
    obs.observe(containerRef.current);
    return () => obs.disconnect();
  }, [revealed]);

  return (
    <div className="w-full h-full flex flex-col p-5 lg:p-8">
      <div className="shrink-0 mb-3">
        <h2 className="text-2xl lg:text-3xl font-bold text-foreground">{t('cypherpunksTimeline.heading')}</h2>
        <p className="text-sm lg:text-base text-muted-foreground mt-1">
          {t('cypherpunksTimeline.lead')}
        </p>
      </div>

      <div ref={containerRef} className="relative flex-1 min-h-0 overflow-y-auto pl-12 pr-2">
        {/* Vertical spine */}
        <div
          ref={lineRef}
          className="absolute left-[1.15rem] top-3 bottom-3 w-[3px] rounded-full"
          style={{
            background: 'linear-gradient(to bottom, #8b5cf6 0%, #f59e0b 14%, #ED1C24 28%, #39B54A 46%, #6366f1 62%, #22d3ee 78%, #ec4899 95%)',
          }}
        />
        <div className="flex flex-col gap-3">
          {CYPHERPUNK_EVENTS.map((ev, i) => (
            <div
              key={ev.year}
              ref={el => { itemRefs.current[i] = el; }}
              className="relative pl-6"
            >
              <div
                ref={el => { dotRefs.current[i] = el; }}
                className="absolute -left-[1.45rem] top-3 size-7 rounded-full border-[3px] border-background shadow-md flex items-center justify-center text-sm leading-none"
                style={{ backgroundColor: ev.color, color: '#fff' }}
              >
                {ev.icon}
              </div>
              <div
                className="bg-card border-2 rounded-xl px-4 py-3 transition-colors hover:scale-[1.01] transition-transform"
                style={{ borderColor: ev.color + '40' }}
              >
                <div className="flex items-baseline gap-3 mb-1 flex-wrap">
                  <span className="font-mono text-base font-black tabular-nums" style={{ color: ev.color }}>
                    {ev.year}
                  </span>
                  <h3 className="text-base lg:text-lg font-bold text-foreground leading-tight">{ev.title}</h3>
                </div>
                <p className="text-xs lg:text-sm text-muted-foreground leading-relaxed">{ev.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function Prologue() {
  const { t } = useTranslation('blockchain-fundamentals/prologue');
  const prologueChapters = useMemo(
    () => prologueChaptersShape.map((ch) => ({ id: ch.id, label: t(`chapters.${ch.id}`) })),
    [t],
  );
  return (
    <div className="h-full w-full flex overflow-hidden">
      <SectionNav chapters={prologueChapters} />
      <div id="section-scroll" className="flex-1 overflow-y-auto snap-y snap-mandatory">
        <div className="slide-flow">

        {/* ═══════ TITLE ═══════ */}
        <div className="h-full">
          <TitleSlide
            sectionNumber={t('title.sectionNumber')}
            title={t('title.title')}
            subtitle={t('title.subtitle')}
            icon={<ScrollText className="size-20 text-[#8b5cf6]" />}
            gradient="from-[#8b5cf6] to-[#ED1C24]"
          />
        </div>

        {/* ═══════ MONEY · A SHORT HISTORY ═══════ */}
        <div id="p-money" className="h-full">
          <div className="w-full h-full flex flex-col p-5 lg:p-8">
            <div className="shrink-0 mb-4">
              <h2 className="text-2xl lg:text-3xl font-bold text-foreground mb-2">{t('moneyHistory.heading')}</h2>
              <p className="text-sm lg:text-base text-muted-foreground max-w-3xl">
                {t('moneyHistory.lead')}
              </p>
            </div>
            <div className="flex-1 min-h-0 overflow-y-auto">
              <MoneyEvolutionTimeline />
              <div className="max-w-3xl mx-auto mt-4">
                <CalloutBox type="tip" title={t('moneyHistory.calloutTitle')}>
                  {t('moneyHistory.calloutBody')}
                </CalloutBox>
              </div>
            </div>
          </div>
        </div>

        {/* ═══════ WHY DOES MONEY HAVE VALUE ═══════ */}
        <div id="p-money-value" className="h-full">
          <ConceptSlide
            title={t('moneyValue.title')}
            description={t('moneyValue.description')}
            visual={
              <div className="space-y-4 w-full">
                <div className="grid grid-cols-2 gap-3">
                  {(['#8b5cf6','#ED1C24','#39B54A','#6366f1']).map((color, i) => {
                    const emoji = ['🤝','🪨','🔧','🌐'][i];
                    const pillars = t('moneyValue.pillars', { returnObjects: true }) as Array<{ label: string; desc: string }>;
                    const p = pillars[i];
                    return (
                      <div key={i} className="flex items-start gap-3 p-4 bg-card rounded-xl border-2" style={{ borderColor: color + '50' }}>
                        <div className="text-3xl shrink-0">{emoji}</div>
                        <div>
                          <div className="font-black text-sm" style={{ color }}>{p.label}</div>
                          <div className="text-xs text-muted-foreground mt-1 leading-snug">{p.desc}</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
                <CalloutBox type="important" title={t('moneyValue.calloutTitle')}>
                  {t('moneyValue.calloutBodyA')} <em>{t('moneyValue.calloutBodyEm')}</em> {t('moneyValue.calloutBodyTail')}
                </CalloutBox>
              </div>
            }
            keyPoints={t('moneyValue.keyPoints', { returnObjects: true }) as string[]}
          />
        </div>

        {/* ═══════ 1. THE CYPHERPUNKS ═══════ */}
        <div id="p-cypherpunks" className="h-full">
          <div className="w-full h-full flex flex-col p-5 lg:p-8">
            <div className="shrink-0 mb-3">
              <h2 className="text-2xl lg:text-3xl font-bold text-foreground mb-2">{t('cypherpunks.heading')}</h2>
              <p className="text-sm lg:text-base text-muted-foreground max-w-3xl">
                {t('cypherpunks.lead')}
              </p>
            </div>

            {/* TOP — quote + callout on the left, portrait + manifesto link on the right */}
            <div className="shrink-0 grid grid-cols-1 lg:grid-cols-[1.5fr_1fr] gap-4 mb-3">
              <div className="flex flex-col gap-3">
                <div className="p-3 bg-gradient-to-br from-[#8b5cf6]/10 to-transparent rounded-xl border-2 border-[#8b5cf6]/40">
                  <p className="text-base italic text-foreground leading-relaxed mb-1">
                    {t('cypherpunks.quote')}
                  </p>
                  <p className="text-[11px] text-muted-foreground">{t('cypherpunks.quoteAttribution')}</p>
                </div>
                <CalloutBox type="important" title={t('cypherpunks.calloutTitle')}>
                  {t('cypherpunks.calloutBodyA')} <em>{t('cypherpunks.calloutBodyEm')}</em> {t('cypherpunks.calloutBodyTail')}
                </CalloutBox>
              </div>

              <div className="flex items-center justify-center gap-4 p-3 bg-gradient-to-br from-[#8b5cf6]/8 to-transparent rounded-xl border border-[#8b5cf6]/30">
                <div className="relative shrink-0">
                  <div className="size-20 lg:size-24 rounded-full bg-gradient-to-br from-[#8b5cf6] via-[#6366f1] to-[#ED1C24] flex items-center justify-center shadow-lg shadow-[#8b5cf6]/40 border-4 border-card">
                    <User className="size-10 lg:size-12 text-white/95" strokeWidth={1.5} />
                  </div>
                  <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-full bg-card border border-[#8b5cf6]/50 shadow text-[9px] font-mono font-bold text-[#8b5cf6] whitespace-nowrap">
                    1993
                  </div>
                </div>
                <div className="flex flex-col gap-2 min-w-0">
                  <div>
                    <div className="text-base font-bold text-foreground leading-tight">{t('cypherpunks.hughesName')}</div>
                    <div className="text-[10px] text-[#8b5cf6] font-semibold uppercase tracking-widest">
                      {t('cypherpunks.hughesRole')}
                    </div>
                  </div>
                  <a
                    href="https://www.activism.net/cypherpunk/manifesto.html"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gradient-to-br from-[#8b5cf6] to-[#ED1C24] text-white text-xs font-bold shadow-md shadow-[#8b5cf6]/40 hover:opacity-90 hover:scale-[1.02] transition-all w-fit"
                  >
                    {t('cypherpunks.readManifesto')}
                    <ExternalLink className="size-3" />
                  </a>
                </div>
              </div>
            </div>

            {/* BOTTOM — 4 principle cards filling the rest of the slide */}
            <div className="flex-1 min-h-0 grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
              {(['#ED1C24','#39B54A','#6366f1','#f59e0b']).map((color, i) => {
                const icons = ['🔐','💻','🌐','🏗️'];
                const principles = t('cypherpunks.principles', { returnObjects: true }) as Array<{ title: string; body: string }>;
                const p = principles[i];
                return (
                  <div
                    key={i}
                    className="flex flex-col p-4 lg:p-5 rounded-xl border-2 bg-gradient-to-br to-transparent transition-transform hover:scale-[1.02]"
                    style={{
                      borderColor: color + '55',
                      background: `linear-gradient(to bottom right, ${color}15, transparent)`,
                    }}
                  >
                    <div className="text-3xl lg:text-4xl mb-2">{icons[i]}</div>
                    <h4 className="font-black mb-2 text-base lg:text-lg" style={{ color }}>
                      {p.title}
                    </h4>
                    <p className="text-xs lg:text-sm text-muted-foreground leading-relaxed flex-1">
                      {p.body}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* ═══════ 2. CYPHERPUNK VALUES ═══════ */}
        <div id="p-cypherpunk-values" className="h-full">
          <ConceptSlide
            title={t('cypherpunkValues.title')}
            description={t('cypherpunkValues.description')}
            visual={
              <div className="space-y-4 w-full">
                <div className="p-5 bg-gradient-to-br from-[#8b5cf6]/15 to-[#ED1C24]/10 rounded-xl border-2 border-[#8b5cf6]/50">
                  <p className="text-base font-bold text-foreground mb-1">{t('cypherpunkValues.manifestoTitle')}</p>
                  <div className="flex gap-3 mt-3">
                    <div className="flex-1 text-center p-3 bg-[#8b5cf6]/20 rounded-lg border border-[#8b5cf6]/40">
                      <div className="text-2xl font-black text-[#8b5cf6]">{t('cypherpunkValues.wordPrivacy')}</div>
                      <div className="text-xs text-muted-foreground mt-1">{t('cypherpunkValues.wordPrivacySub')}</div>
                    </div>
                    <div className="flex-1 text-center p-3 bg-[#ED1C24]/20 rounded-lg border border-[#ED1C24]/40">
                      <div className="text-2xl font-black text-[#ED1C24]">{t('cypherpunkValues.wordAutonomy')}</div>
                      <div className="text-xs text-muted-foreground mt-1">{t('cypherpunkValues.wordAutonomySub')}</div>
                    </div>
                    <div className="flex-1 text-center p-3 bg-[#39B54A]/20 rounded-lg border border-[#39B54A]/40">
                      <div className="text-2xl font-black text-[#39B54A]">{t('cypherpunkValues.wordCode')}</div>
                      <div className="text-xs text-muted-foreground mt-1">{t('cypherpunkValues.wordCodeSub')}</div>
                    </div>
                  </div>
                </div>
                <div className="p-4 bg-card rounded-xl border border-border">
                  <p className="text-sm italic text-muted-foreground leading-relaxed">
                    {t('cypherpunkValues.secondQuote')}
                  </p>
                  <p className="text-xs text-[#8b5cf6] font-bold mt-2">{t('cypherpunkValues.secondQuoteAttribution')}</p>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 bg-muted/20 rounded-lg border border-border text-center">
                    <div className="text-lg font-black text-foreground">👤 → 🌍</div>
                    <div className="text-xs text-muted-foreground mt-1">{t('cypherpunkValues.indivSub')}</div>
                  </div>
                  <div className="p-3 bg-muted/20 rounded-lg border border-border text-center">
                    <div className="text-lg font-black text-foreground">{t('cypherpunkValues.freeLabel')}</div>
                    <div className="text-xs text-muted-foreground mt-1">{t('cypherpunkValues.freeSub')}</div>
                  </div>
                </div>
              </div>
            }
            keyPoints={t('cypherpunkValues.keyPoints', { returnObjects: true }) as string[]}
          />
        </div>

        {/* ═══════ 3. TIMELINE ═══════ */}
        <div id="p-timeline" className="h-full">
          <CypherpunksMovementTimeline />
        </div>

        {/* ═══════ BITCOIN'S ACADEMIC PEDIGREE ═══════ */}
        <div id="p-pedigree" className="h-full flex flex-col p-6 lg:p-10 relative overflow-hidden">
          <div className="shrink-0 mb-5">
            <h2 className="text-2xl lg:text-3xl font-bold text-foreground">{t('pedigree.heading')}</h2>
            <p className="text-muted-foreground text-sm mt-1">{t('pedigree.lead')}</p>
          </div>
          <div className="flex-1 min-h-0 grid grid-cols-[1.8fr_1fr] gap-6">
            <div className="flex items-center justify-center bg-white rounded-xl border border-border p-3 min-h-0">
              <img
                src={bitcoinPedigree}
                alt={t('pedigree.imageAlt')}
                className="max-h-full max-w-full object-contain"
              />
            </div>
            <div className="flex flex-col gap-3">
              <div className="p-4 bg-card border border-[#8b5cf6]/30 rounded-xl">
                <div className="text-xs font-bold text-[#8b5cf6] uppercase tracking-widest mb-2">{t('pedigree.paperKicker')}</div>
                <div className="font-bold text-foreground text-sm leading-snug mb-1">{t('pedigree.paperTitle')}</div>
                <div className="text-xs text-muted-foreground">{t('pedigree.paperAuthors')}</div>
              </div>
              <div className="p-4 bg-card border border-border rounded-xl flex-1">
                <div className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-2">{t('pedigree.strandsHeader')}</div>
                <ul className="space-y-1.5 text-xs text-muted-foreground">
                  {(['#6366f1','#39B54A','#f59e0b','#22d3ee','#ED1C24','#8b5cf6']).map((color, i) => {
                    const strands = t('pedigree.strands', { returnObjects: true }) as Array<{ label: string; source: string }>;
                    const r = strands[i];
                    return (
                      <li key={i} className="flex items-start gap-2">
                        <span className="mt-1.5 size-1.5 rounded-full shrink-0" style={{ background: color }} />
                        <div>
                          <div className="font-semibold text-foreground">{r.label}</div>
                          <div className="text-[10px]">{r.source}</div>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </div>
              <a
                href="https://www.resistance.money/class/readings/pedigree.pdf"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl bg-[#8b5cf6]/15 border border-[#8b5cf6]/40 text-[#8b5cf6] text-xs font-bold hover:bg-[#8b5cf6]/25 transition-colors"
              >
                {t('pedigree.readPaper')}
                <ExternalLink className="size-3.5" />
              </a>
            </div>
          </div>
        </div>

        {/* ═══════ 4. WHY THIS HISTORY MATTERS ═══════ */}
        <div id="p-why" className="h-full">
          <ConceptSlide
            title={t('why.title')}
            description={t('why.description')}
            visual={
              <div className="space-y-4 w-full">
                <div className="p-5 bg-card rounded-xl border-2 border-[#ED1C24]">
                  <h4 className="font-bold text-[#ED1C24] mb-3">{t('why.combinedTitle')}</h4>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    {(t('why.components', { returnObjects: true }) as Array<{ title: string; source: string }>).map((c, i) => (
                      <div key={i} className="p-3 bg-muted/30 rounded-lg">
                        <div className="font-bold text-foreground">{c.title}</div>
                        <div className="text-muted-foreground">{c.source}</div>
                      </div>
                    ))}
                  </div>
                </div>
                <CalloutBox type="tip" title={t('why.calloutTitle')}>
                  {t('why.calloutBody')}
                </CalloutBox>
              </div>
            }
            keyPoints={t('why.keyPoints', { returnObjects: true }) as string[]}
          />
        </div>

        {/* ═══════ WHO CONTROLS YOUR MONEY? ═══════ */}
        <div id="p-who-controls" className="h-full flex flex-col p-6 lg:p-10">
          <div className="shrink-0 mb-5 text-center">
            <h2 className="text-2xl lg:text-3xl font-bold text-foreground">{t('whoControls.heading')}</h2>
            <p className="text-muted-foreground text-sm mt-1">{t('whoControls.lead')}</p>
          </div>

          <div className="flex-1 min-h-0 grid grid-cols-4 gap-3">
            {(['#f59e0b','#ED1C24','#8b5cf6','#22d3ee']).map((color, idx) => {
              const emojis = ['💵','🏦','📱','₿'];
              const columns = t('whoControls.columns', { returnObjects: true }) as Array<{
                name: string; control: string; rows: Array<{ k: string; v: string }>;
              }>;
              const c = columns[idx];
              return (
                <div key={idx} className="flex flex-col rounded-xl border-2 overflow-hidden" style={{ borderColor: color + '50' }}>
                  <div className="p-3 text-center" style={{ backgroundColor: color + '15' }}>
                    <div className="text-3xl mb-1">{emojis[idx]}</div>
                    <div className="font-black text-foreground">{c.name}</div>
                    <div className="text-[10px] font-semibold uppercase tracking-widest" style={{ color }}>{c.control}</div>
                  </div>
                  <div className="flex-1 flex flex-col">
                    {c.rows.map((row, i) => (
                      <div key={i} className="px-3 py-2 text-[11px]" style={{ backgroundColor: i % 2 === 0 ? 'transparent' : 'rgba(0,0,0,0.02)' }}>
                        <div className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">{row.k}</div>
                        <div className="text-foreground leading-snug mt-0.5">{row.v}</div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="shrink-0 mt-4 p-4 bg-gradient-to-br from-[#8b5cf6]/10 via-[#ED1C24]/10 to-[#22d3ee]/10 border-2 border-[#8b5cf6]/40 rounded-xl text-center">
            <div className="text-xs font-bold text-[#8b5cf6] uppercase tracking-widest mb-1">{t('whoControls.questionKicker')}</div>
            <div className="text-base font-semibold text-foreground">{t('whoControls.questionA')} <em>{t('whoControls.questionEm')}</em> {t('whoControls.questionTail')}</div>
          </div>
        </div>

        {/* ═══════ WHAT DECENTRALIZATION REALLY MEANS ═══════ */}
        <div id="p-decentralization" className="h-full flex flex-col p-6 lg:p-10">
          <div className="shrink-0 mb-4">
            <h2 className="text-2xl lg:text-3xl font-bold text-foreground">{t('decentralization.heading')}</h2>
            <p className="text-muted-foreground text-sm mt-1 max-w-3xl">{t('decentralization.lead')}</p>
          </div>

          <div className="shrink-0 mb-4">
            <CalloutBox type="important" title={t('decentralization.definitionTitle')}>
              {t('decentralization.definitionA')} <strong>{t('decentralization.definitionEm')}</strong> {t('decentralization.definitionTail')}
            </CalloutBox>
          </div>

          <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-2 gap-4">
            {([
              { key: 'not',  color: '#ED1C24', Icon: X },
              { key: 'cost', color: '#f59e0b', Icon: AlertTriangle },
            ] as const).map(({ key, color, Icon }) => {
              const items = t(`decentralization.${key}Items`, { returnObjects: true }) as Array<{ title: string; body: string }>;
              return (
                <div
                  key={key}
                  className="flex flex-col rounded-xl border-2 p-4 lg:p-5 min-h-0"
                  style={{ borderColor: color + '50', background: `linear-gradient(to bottom right, ${color}10, transparent)` }}
                >
                  <h3 className="font-black text-base lg:text-lg mb-3 shrink-0" style={{ color }}>{t(`decentralization.${key}Title`)}</h3>
                  <ul className="flex-1 min-h-0 flex flex-col justify-between gap-2">
                    {items.map((item, i) => (
                      <li key={i} className="flex items-start gap-3 p-2.5 bg-card rounded-lg border border-border">
                        <div className="size-6 rounded-full flex items-center justify-center shrink-0 mt-0.5" style={{ backgroundColor: color + '20' }}>
                          <Icon className="size-3.5" style={{ color }} strokeWidth={3} />
                        </div>
                        <div className="min-w-0">
                          <div className="font-bold text-sm text-foreground leading-tight">{item.title}</div>
                          <div className="text-xs text-muted-foreground mt-0.5 leading-snug">{item.body}</div>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>

          <div className="shrink-0 mt-4 p-4 bg-gradient-to-br from-[#8b5cf6]/10 via-[#ED1C24]/10 to-[#22d3ee]/10 border-2 border-[#8b5cf6]/40 rounded-xl text-center">
            <div className="text-xs font-bold text-[#8b5cf6] uppercase tracking-widest mb-1">{t('decentralization.closingKicker')}</div>
            <div className="text-base font-semibold text-foreground">{t('decentralization.closingA')} <em>{t('decentralization.closingEm')}</em> {t('decentralization.closingTail')}</div>
          </div>
        </div>

        {/* ═══════ 5. TAKEAWAYS ═══════ */}
        <div id="p-takeaways" className="h-full">
          <TakeawaySlide
            title={t('takeaways.title')}
            takeaways={t('takeaways.items', { returnObjects: true }) as string[]}
          />
        </div>

        {/* ═══════ 6. QUIZZES ═══════ */}
        <div id="p-quiz" className="h-full">
          <QuizSlide
            question={t('quizMoney.question')}
            options={(t('quizMoney.options', { returnObjects: true }) as string[]).map((text, i) => ({ text, correct: i === 2 }))}
            explanation={t('quizMoney.explanation')}
          />
        </div>

        <div className="h-full">
          <SwipeQuiz
            question={t('cypherpunksTF.prompt')}
            statements={t('cypherpunksTF.statements', { returnObjects: true }) as SwipeStatement[]}
          />
        </div>

        <div className="h-full">
          <QuizSlide
            question={t('quizHashcash.question')}
            options={(t('quizHashcash.options', { returnObjects: true }) as string[]).map((text, i) => ({ text, correct: i === 2 }))}
            explanation={t('quizHashcash.explanation')}
          />
        </div>

        <div className="h-full">
          <QuizSlide
            question={t('quizGenesis.question')}
            options={(t('quizGenesis.options', { returnObjects: true }) as string[]).map((text, i) => ({ text, correct: i === 1 }))}
            explanation={t('quizGenesis.explanation')}
          />
        </div>

        </div>
        <SiteFooter className="snap-start" />
      </div>
    </div>
  );
}
