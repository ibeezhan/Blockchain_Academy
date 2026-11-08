import { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'motion/react';
import { TitleSlide } from '../../components/templates/TitleSlide';
import { TakeawaySlide } from '../../components/templates/TakeawaySlide';
import { QuizSlide } from '../../components/templates/QuizSlide';
import { SectionNav } from '../../components/navigation/SectionNav';
import { SiteFooter } from '../../components/shared/SiteFooter';
import { UnderTheHood } from '../../components/shared/UnderTheHood';
import { FileCode2, Check, X } from 'lucide-react';

import imgSzaboVending from '../../../assets/sc/szabo-vending-machine.png';

// Language-neutral shape — only IDs. Labels come from t() at render time.
const chapterIds = [
  's1-warmup',
  's1-recap',
  's1-what',
  's1-hype',
  's1-szabo',
  's1-history',
  's1-exercise',
  's1-quiz',
  's1-takeaways',
  's1-summary',
] as const;


// ─── Exercise: Is this a Smart Contract? ────────────────────────────────────

// Language-neutral data: only the boolean answer is fixed per scenario.
const SCENARIO_ANSWERS = [true, true, false, true, false, true, false, true, false, true];

interface Scenario { title: string; desc: string; reason: string; }

function SmartContractSortingExercise() {
  const { t } = useTranslation('smart-contracts/section-1');
  const scenarioText = t('exercise.scenarios', { returnObjects: true }) as Scenario[];
  const SCENARIOS = scenarioText.map((s, i) => ({ ...s, answer: SCENARIO_ANSWERS[i] }));

  const [answers, setAnswers]   = useState<Record<number, boolean | null>>({});
  const [revealed, setRevealed] = useState<Record<number, boolean>>({});
  const total   = SCENARIOS.length;
  const done    = Object.keys(revealed).length;
  const correct = Object.entries(answers).filter(([i, a]) => a === SCENARIOS[+i].answer).length;

  const handlePick = (i: number, pick: boolean) => {
    if (revealed[i]) return;
    setAnswers(prev => ({ ...prev, [i]: pick }));
    setRevealed(prev => ({ ...prev, [i]: true }));
  };

  const reset = () => { setAnswers({}); setRevealed({}); };

  return (
    <div className="h-full flex flex-col p-6 lg:p-8">
      {/* Header */}
      <div className="shrink-0 flex items-center justify-between mb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full bg-[#6366f1]/15 border border-[#6366f1]/40 text-[#6366f1] text-xs font-bold">{t('exercise.badge')}</span>
          </div>
          <h2 className="text-2xl font-bold text-foreground">{t('exercise.heading')}</h2>
          <p className="text-muted-foreground text-sm mt-0.5">{t('exercise.subtitle')}</p>
        </div>
        <div className="flex items-center gap-4">
          {done > 0 && (
            <div className="text-right">
              <div className="text-2xl font-black" style={{ color: correct === done ? '#39B54A' : '#f59e0b' }}>{correct}/{done}</div>
              <div className="text-xs text-muted-foreground">{t('exercise.scoreLabel')}</div>
            </div>
          )}
          {done === total && (
            <button onClick={reset} className="px-3 py-1.5 rounded-lg bg-muted hover:bg-muted/80 text-xs font-semibold text-muted-foreground transition-colors">{t('exercise.reset')}</button>
          )}
        </div>
      </div>

      {/* Grid */}
      <div className="flex-1 min-h-0 grid grid-cols-5 grid-rows-2 gap-3">
        {SCENARIOS.map((s, i) => {
          const picked  = answers[i];
          const isRight = picked === s.answer;
          const isOpen  = !!revealed[i];
          return (
            <motion.div
              key={i}
              layout
              className="relative rounded-xl border-2 overflow-hidden flex flex-col transition-colors"
              style={{
                borderColor: !isOpen ? 'var(--border)' : isRight ? '#39B54A' : '#ED1C24',
                backgroundColor: !isOpen ? 'var(--card)' : isRight ? '#39B54A10' : '#ED1C2410',
              }}
            >
              {/* Card body */}
              <div className="flex-1 p-4 flex flex-col gap-2">
                <div className="font-black text-sm text-foreground leading-tight">{s.title}</div>
                <div className="text-xs text-muted-foreground leading-snug flex-1">{s.desc}</div>

                <AnimatePresence>
                  {isOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-xs leading-snug font-medium"
                      style={{ color: isRight ? '#39B54A' : '#ED1C24' }}
                    >
                      {isRight ? '✓ ' : '✗ '}{s.reason}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Buttons or result badge */}
              {!isOpen ? (
                <div className="flex border-t border-border shrink-0">
                  <button
                    onClick={() => handlePick(i, true)}
                    className="flex-1 py-2 text-sm font-black text-[#39B54A] hover:bg-[#39B54A]/15 transition-colors border-r border-border"
                  >{t('exercise.yes')}</button>
                  <button
                    onClick={() => handlePick(i, false)}
                    className="flex-1 py-2 text-sm font-black text-[#ED1C24] hover:bg-[#ED1C24]/15 transition-colors"
                  >{t('exercise.no')}</button>
                </div>
              ) : (
                <div className="shrink-0 flex items-center justify-center py-2 gap-1.5 border-t" style={{ borderColor: isRight ? '#39B54A40' : '#ED1C2440' }}>
                  {isRight
                    ? <Check className="size-4 text-[#39B54A]" strokeWidth={3} />
                    : <X     className="size-4 text-[#ED1C24]" strokeWidth={3} />}
                  <span className="text-xs font-bold" style={{ color: isRight ? '#39B54A' : '#ED1C24' }}>
                    {s.answer ? t('exercise.resultSc') : t('exercise.resultNotSc')}
                  </span>
                </div>
              )}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Warm-up: Bitcoin or Ethereum? (recap from Course 02) ───────────────────

type Chain = 'btc' | 'eth' | 'both';

// Language-neutral: only the correct chain per statement is fixed.
const BTC_ETH_ANSWERS: Chain[] = ['btc', 'eth', 'btc', 'eth', 'btc', 'eth', 'eth', 'both'];

const CHAIN_COLORS: Record<Chain, { color: string; glyph: string }> = {
  btc:  { color: '#f59e0b', glyph: '₿' },
  eth:  { color: '#6366f1', glyph: 'Ξ' },
  both: { color: '#8b5cf6', glyph: '⇋' },
};

interface BtcEthItem { stmt: string; why: string; }

function BitcoinEthereumWarmup() {
  const { t } = useTranslation('smart-contracts/section-1');
  const itemsText = t('warmup.items', { returnObjects: true }) as BtcEthItem[];
  const BTC_ETH = itemsText.map((q, i) => ({ ...q, answer: BTC_ETH_ANSWERS[i] }));
  const chainLabel = (c: Chain) => t(`warmup.chainMeta.${c}`);

  const [picks, setPicks] = useState<Record<number, Chain>>({});
  const total = BTC_ETH.length;
  const done = Object.keys(picks).length;
  const correct = Object.entries(picks).filter(([i, p]) => p === BTC_ETH[+i].answer).length;

  const pick = (i: number, c: Chain) => {
    if (picks[i]) return;
    setPicks(prev => ({ ...prev, [i]: c }));
  };
  const reset = () => setPicks({});

  return (
    <div className="h-full flex flex-col p-6 lg:p-8">
      <div className="shrink-0 flex items-center justify-between mb-4">
        <div>
          <span className="px-2.5 py-0.5 rounded-full bg-[#6366f1]/15 border border-[#6366f1]/40 text-[#6366f1] text-xs font-bold">{t('warmup.badge')}</span>
          <h2 className="text-2xl font-bold text-foreground mt-1">{t('warmup.heading')}</h2>
          <p className="text-muted-foreground text-sm mt-0.5">{t('warmup.subtitle')}</p>
        </div>
        <div className="flex items-center gap-4">
          {done > 0 && (
            <div className="text-right">
              <div className="text-2xl font-black" style={{ color: correct === done ? '#39B54A' : '#f59e0b' }}>{correct}/{done}</div>
              <div className="text-xs text-muted-foreground">{t('warmup.scoreLabel')}</div>
            </div>
          )}
          {done === total && (
            <button onClick={reset} className="px-3 py-1.5 rounded-lg bg-muted hover:bg-muted/80 text-xs font-semibold text-muted-foreground transition-colors">{t('warmup.reset')}</button>
          )}
        </div>
      </div>

      <div className="flex-1 min-h-0 grid grid-cols-2 lg:grid-cols-4 gap-3 content-center auto-rows-min">
        {BTC_ETH.map((q, i) => {
          const picked = picks[i];
          const open = !!picked;
          const right = picked === q.answer;
          const ans = CHAIN_COLORS[q.answer];
          return (
            <motion.div
              key={i}
              layout
              className="relative rounded-xl border-2 overflow-hidden flex flex-col min-h-[9.5rem] lg:min-h-[11rem]"
              style={{
                borderColor: !open ? 'var(--border)' : right ? '#39B54A' : '#ED1C24',
                backgroundColor: !open ? 'var(--card)' : right ? '#39B54A10' : '#ED1C2410',
              }}
            >
              <div className="flex-1 p-3 flex flex-col gap-2">
                <div className="text-sm font-semibold text-foreground leading-snug flex-1">{q.stmt}</div>
                <AnimatePresence>
                  {open && (
                    <motion.div
                      initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }}
                      className="text-[11px] leading-snug"
                    >
                      <span className="font-black" style={{ color: ans.color }}>{ans.glyph} {chainLabel(q.answer)}</span>
                      <span className="text-muted-foreground"> — {q.why}</span>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              {!open ? (
                <div className="flex border-t border-border shrink-0">
                  {(['btc','eth','both'] as Chain[]).map((c, ci) => {
                    const m = CHAIN_COLORS[c];
                    return (
                      <button
                        key={c}
                        onClick={() => pick(i, c)}
                        className={`flex-1 py-2 text-xs font-black transition-colors ${ci < 2 ? 'border-r border-border' : ''}`}
                        style={{ color: m.color }}
                      >
                        {m.glyph} {chainLabel(c)}
                      </button>
                    );
                  })}
                </div>
              ) : (
                <div className="shrink-0 flex items-center justify-center py-2 gap-1.5 border-t" style={{ borderColor: right ? '#39B54A40' : '#ED1C2440' }}>
                  {right
                    ? <Check className="size-4 text-[#39B54A]" strokeWidth={3} />
                    : <X className="size-4 text-[#ED1C24]" strokeWidth={3} />}
                  <span className="text-xs font-bold" style={{ color: right ? '#39B54A' : '#ED1C24' }}>
                    {right ? t('warmup.correctBadge') : t('warmup.youSaid', { label: chainLabel(picked) })}
                  </span>
                </div>
              )}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

interface RecapCard { title: string; desc: string; tag: string; }
interface WhatProp { title: string; desc: string; }
interface CompareRow { trad: string; smart: string; }
interface WhyPoint { a: string; strong: string; b: string; }
interface SzaboStep { label: string; detail: string; }
interface HistoryEvent { year: string; tag: string; title: string; desc: string; }
interface SummaryCard { title: string; summary: string; }
interface HypeCard { title: string; body: string; }

const HYPE_META = [
  { emoji: '⚖️', color: '#ED1C24' },
  { emoji: '🤖', color: '#f59e0b' },
  { emoji: '⛽', color: '#8b5cf6' },
  { emoji: '🔌', color: '#6366f1' },
];

export function SC_Section1() {
  const { t } = useTranslation('smart-contracts/section-1');

  const chapters = useMemo(
    () => chapterIds.map((id) => ({ id, label: t(`chapters.${id}`) })),
    [t]
  );

  // Language-neutral presentation data merged with translated text.
  const recapColors = ['#6366f1', '#8b5cf6', '#f59e0b', '#39B54A'];
  const recapEmojis = ['👤', '🖥️', '⛽', '✍️'];
  const recapText = t('recap.cards', { returnObjects: true }) as RecapCard[];
  const recapCards = recapText.map((c, i) => ({ ...c, color: recapColors[i], emoji: recapEmojis[i] }));

  const compareRows = t('what.compareRows', { returnObjects: true }) as CompareRow[];

  const propColors = ['#6366f1', '#8b5cf6', '#39B54A', '#f59e0b', '#ED1C24'];
  const propEmojis = ['⚙️', '🔒', '🌐', '📐', '🛡️'];
  const propText = t('what.props', { returnObjects: true }) as WhatProp[];
  const props = propText.map((p, i) => ({ ...p, color: propColors[i], emoji: propEmojis[i] }));

  const whyPoints = t('szabo.whyPoints', { returnObjects: true }) as WhyPoint[];

  const stepColors = ['#6366f1', '#8b5cf6', '#39B54A', '#ED1C24'];
  const stepText = t('szabo.steps', { returnObjects: true }) as SzaboStep[];
  const szaboSteps = stepText.map((s, i) => ({ ...s, color: stepColors[i] }));

  const eventColors = ['#8b5cf6', '#f59e0b', '#6366f1', '#ED1C24', '#6366f1', '#f97316', '#39B54A', '#22d3ee'];
  const eventText = t('history.events', { returnObjects: true }) as HistoryEvent[];
  const historyEvents = eventText.map((e, i) => ({ ...e, color: eventColors[i] }));

  const quizOptionTexts = t('quiz.options', { returnObjects: true }) as string[];
  const quizOptions = quizOptionTexts.map((text, i) => ({ text, correct: i === 1 }));

  const takeawayItems = t('takeaways.items', { returnObjects: true }) as string[];

  const summaryIcons = ['📜', '⛓️', '🌐', '✅', '⚠️', '🎯'];
  const summaryText = t('summary.cards', { returnObjects: true }) as SummaryCard[];
  const summaryCards = summaryText.map((c, i) => ({ ...c, icon: summaryIcons[i] }));

  const hypeCards = t('hype.cards', { returnObjects: true }) as HypeCard[];
  const hypeValue = t('hype.value', { returnObjects: true }) as string[];

  return (
    <div className="h-full w-full flex overflow-hidden">
      <SectionNav chapters={chapters} accentColor="#6366f1" />
      <div id="section-scroll" className="flex-1 overflow-y-auto snap-y snap-mandatory">
        <div className="slide-flow">

        {/* ═══════ TITLE ═══════ */}
        <div className="h-full">
          <TitleSlide
            sectionNumber={t('title.sectionNumber')}
            title={t('title.title')}
            subtitle={t('title.subtitle')}
            icon={<FileCode2 className="size-20 text-[#6366f1]" />}
            gradient="from-[#6366f1] to-[#8b5cf6]"
          />
        </div>

        {/* ═══════ 0a. WARM-UP: BITCOIN vs ETHEREUM ═══════ */}
        <div id="s1-warmup" className="h-full">
          <BitcoinEthereumWarmup />
        </div>

        {/* ═══════ 0b. ETHEREUM RECAP (warm-up) ═══════ */}
        <div id="s1-recap" className="h-full flex flex-col p-6 lg:p-10">
          <div className="shrink-0 mb-4">
            <span className="text-xs font-black uppercase tracking-widest text-[#6366f1]">{t('recap.badge')}</span>
            <h2 className="text-2xl lg:text-3xl font-bold text-foreground mt-1">{t('recap.heading')}</h2>
            <p className="text-sm text-muted-foreground mt-1">
              {t('recap.leadA')}<span className="font-semibold text-foreground">{t('recap.leadStrong')}</span>{t('recap.leadB')}
            </p>
          </div>

          <div className="flex-1 min-h-0 grid grid-cols-2 lg:grid-cols-4 gap-4 content-center">
            {recapCards.map((c, i) => (
              <motion.div
                key={c.title}
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08, duration: 0.3 }}
                className="flex flex-col gap-2 p-4 rounded-2xl border bg-card"
                style={{ borderColor: c.color + '40' }}
              >
                <div className="text-3xl">{c.emoji}</div>
                <div className="font-black text-base" style={{ color: c.color }}>{c.title}</div>
                <div className="text-xs text-muted-foreground leading-relaxed flex-1">{c.desc}</div>
                <div className="text-[10px] font-bold uppercase tracking-widest rounded-md px-2 py-1 self-start" style={{ backgroundColor: c.color + '15', color: c.color }}>{c.tag}</div>
              </motion.div>
            ))}
          </div>

          <div className="shrink-0 mt-4 p-3 rounded-xl border border-[#6366f1]/30 bg-[#6366f1]/08 text-center text-sm" style={{ backgroundColor: '#6366f10f' }}>
            <span className="font-bold text-[#6366f1]">{t('recap.footerLabel')}</span>
            <span className="text-muted-foreground">{t('recap.footerA')}<em>{t('recap.footerEm')}</em>{t('recap.footerB')}</span>
          </div>
          <UnderTheHood terms={['EOA vs contract account', 'EVM', 'gas · gwei', 'nonce', 'state']} className="shrink-0 mt-2 justify-center" />
        </div>

        {/* ═══════ 1. WHAT IS A SMART CONTRACT ═══════ */}
        <div id="s1-what" className="h-full flex flex-col p-6 lg:p-10">
          <div className="shrink-0 mb-6">
            <h2 className="text-2xl lg:text-3xl font-bold text-foreground">{t('what.heading')}</h2>
            <p className="text-muted-foreground text-sm mt-1">{t('what.subtitle')}</p>
          </div>

          <div className="flex-1 min-h-0 grid grid-cols-2 gap-5 content-center">

            {/* Left: definition + analogy */}
            <div className="flex flex-col gap-4">
              <div className="p-5 bg-gradient-to-br from-[#6366f1]/15 to-transparent border border-[#6366f1]/40 rounded-xl">
                <div className="text-xs font-semibold text-[#6366f1] uppercase tracking-widest mb-2">{t('what.definitionLabel')}</div>
                <p className="text-base text-foreground font-medium leading-relaxed">
                  {t('what.defLeadA')}<span className="font-black text-[#6366f1]">{t('what.defTerm')}</span>{t('what.defLeadB')}
                </p>
                <p className="text-sm text-muted-foreground mt-3">
                  {t('what.defBody')}
                </p>
              </div>

              <div className="p-4 bg-card border border-border rounded-xl">
                <div className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-3">{t('what.compareLabel')}</div>
                <div className="space-y-2">
                  {compareRows.map((row, i) => (
                    <div key={i} className="grid grid-cols-2 gap-2 text-xs">
                      <div className="px-2 py-1.5 rounded bg-[#ED1C24]/10 text-muted-foreground border border-[#ED1C24]/20">❌ {row.trad}</div>
                      <div className="px-2 py-1.5 rounded bg-[#39B54A]/10 text-muted-foreground border border-[#39B54A]/20">✅ {row.smart}</div>
                    </div>
                  ))}
                </div>
              </div>
              <UnderTheHood terms={['Solidity', 'bytecode', 'deterministic', 'immutable address']} />
            </div>

            {/* Right: key properties */}
            <div className="flex flex-col gap-3">
              <div className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">{t('what.propsLabel')}</div>
              {props.map(p => (
                <div key={p.title} className="flex items-start gap-3 p-3 bg-card border border-border rounded-xl flex-1" style={{ borderColor: p.color + '30' }}>
                  <div className="text-xl shrink-0">{p.emoji}</div>
                  <div>
                    <div className="font-bold text-sm mb-0.5" style={{ color: p.color }}>{p.title}</div>
                    <div className="text-xs text-muted-foreground">{p.desc}</div>
                  </div>
                </div>
              ))}
            </div>

          </div>
        </div>

        {/* ═══════ 1b. HYPE vs VALUE ═══════ */}
        <div id="s1-hype" className="h-full flex flex-col p-6 lg:p-10">
          <div className="shrink-0 mb-5">
            <h2 className="text-2xl lg:text-3xl font-bold text-foreground">{t('hype.heading')}</h2>
            <p className="text-muted-foreground text-sm mt-1">{t('hype.subtitle')}</p>
          </div>

          <div className="flex-1 min-h-0 grid grid-cols-[1.5fr_1fr] gap-5">
            <div className="grid grid-cols-2 gap-3 content-center">
              {hypeCards.map((c, i) => {
                const m = HYPE_META[i];
                return (
                  <motion.div
                    key={c.title}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.07 }}
                    className="p-4 rounded-xl border-2 flex flex-col gap-2"
                    style={{ borderColor: m.color + '50', backgroundColor: m.color + '08' }}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{m.emoji}</span>
                      <div className="font-black text-base text-foreground">{c.title}</div>
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed">{c.body}</p>
                  </motion.div>
                );
              })}
            </div>

            <div className="flex flex-col gap-3 justify-center">
              <div className="flex-1 p-5 rounded-2xl border-2 border-[#39B54A]/50 bg-gradient-to-br from-[#39B54A]/12 to-transparent flex flex-col gap-3">
                <div className="font-black text-base text-[#39B54A]">{t('hype.valueLabel')}</div>
                <ul className="space-y-2.5 text-sm text-foreground/90 flex-1">
                  {hypeValue.map((v, i) => (
                    <li key={i} className="flex gap-2 leading-snug"><span className="text-[#39B54A] shrink-0 font-black">{i + 1}</span><span>{v}</span></li>
                  ))}
                </ul>
                <div className="text-xs text-muted-foreground italic border-t border-[#39B54A]/30 pt-2">{t('hype.footer')}</div>
              </div>
              <UnderTheHood terms={['legal wrapper', 'oracle', 'admin key', 'front-end vs contract']} />
            </div>
          </div>
        </div>

        {/* ═══════ 2. NICK SZABO'S VENDING MACHINE ═══════ */}
        <div id="s1-szabo" className="h-full flex flex-col p-6 lg:p-10">
          <div className="shrink-0 mb-5">
            <h2 className="text-2xl lg:text-3xl font-bold text-foreground">{t('szabo.heading')}</h2>
            <p className="text-muted-foreground text-sm mt-1">{t('szabo.subtitle')}</p>
          </div>

          <div className="flex-1 min-h-0 grid grid-cols-2 gap-6 content-center">

            {/* Left: Szabo bio + quote */}
            <div className="flex flex-col gap-4">
              <div className="p-5 bg-gradient-to-br from-[#6366f1]/15 to-transparent border border-[#6366f1]/40 rounded-xl">
                <div className="flex items-center gap-3 mb-3">
                  <div className="size-12 rounded-full bg-gradient-to-br from-[#6366f1] to-[#8b5cf6] flex items-center justify-center text-white font-black shrink-0">NS</div>
                  <div>
                    <div className="font-black text-foreground">Nick Szabo</div>
                    <div className="text-xs text-muted-foreground">{t('szabo.role')}</div>
                  </div>
                </div>
                <blockquote className="border-l-2 border-[#6366f1] pl-4 italic text-sm text-muted-foreground">
                  {t('szabo.quote')}
                </blockquote>
                <div className="mt-2 text-right text-xs text-muted-foreground">{t('szabo.quoteAttribution')}</div>
              </div>

              <div className="p-4 bg-card border border-border rounded-xl flex-1">
                <div className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-3">{t('szabo.whyLabel')}</div>
                <ul className="space-y-2.5 text-sm text-muted-foreground">
                  {whyPoints.map((p, i) => (
                    <li key={i} className="flex gap-2"><span className="text-[#6366f1] shrink-0">•</span>{p.a}<span className="text-foreground font-semibold">{p.strong}</span>{p.b}</li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Right: Vending machine diagram */}
            <div className="flex flex-col gap-3 min-h-0">
              <div className="text-xs font-semibold text-muted-foreground uppercase tracking-widest shrink-0">{t('szabo.modelLabel')}</div>

              <div className="shrink-0 flex items-center justify-center bg-white rounded-xl border border-border p-3">
                <img src={imgSzaboVending} alt={t('szabo.imgAlt')} className="max-h-64 w-auto object-contain" />
              </div>

              <div className="shrink-0 flex flex-wrap gap-2">
                {szaboSteps.map(s => (
                  <div key={s.label} className="flex-1 min-w-[140px] px-2 py-1.5 rounded-lg border text-xs" style={{ borderColor: s.color + '40', backgroundColor: s.color + '0c' }}>
                    <span className="font-bold" style={{ color: s.color }}>{s.label}: </span>
                    <span className="text-muted-foreground">{s.detail}</span>
                  </div>
                ))}
              </div>

              <div className="shrink-0 p-2.5 bg-[#6366f1]/10 border border-[#6366f1]/30 rounded-lg text-xs text-muted-foreground text-center">
                <span className="font-semibold text-foreground">{t('szabo.insightLabel')}</span>{t('szabo.insightA')}<em>{t('szabo.insightEm')}</em>{t('szabo.insightB')}
              </div>
            </div>

          </div>
        </div>

        {/* ═══════ 3. HISTORICAL EVOLUTION ═══════ */}
        <div id="s1-history" className="h-full flex flex-col p-6 lg:p-10">
          <div className="shrink-0 mb-4">
            <span className="text-xs font-black uppercase tracking-widest text-[#6366f1]">{t('history.badge')}</span>
            <h2 className="text-2xl lg:text-3xl font-bold text-foreground mt-1">{t('history.heading')}</h2>
            <p className="text-sm text-muted-foreground mt-1">{t('history.subtitle')}</p>
          </div>

          <div className="flex-1 min-h-0 grid grid-cols-2 lg:grid-cols-4 gap-3 content-center">
            {historyEvents.map((e, i) => (
              <motion.div
                key={e.year}
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06, duration: 0.3 }}
                className="flex flex-col rounded-xl border bg-card overflow-hidden"
                style={{ borderColor: e.color + '40' }}
              >
                <div className="h-1.5 shrink-0" style={{ backgroundColor: e.color }} />
                <div className="flex-1 flex flex-col gap-1.5 p-3.5">
                  <div className="flex items-baseline justify-between gap-2">
                    <span className="font-mono font-black text-lg" style={{ color: e.color }}>{e.year}</span>
                    <span className="text-[9px] font-bold uppercase tracking-widest px-1.5 py-0.5 rounded" style={{ backgroundColor: e.color + '18', color: e.color }}>{e.tag}</span>
                  </div>
                  <div className="font-bold text-sm text-foreground leading-tight">{e.title}</div>
                  <div className="text-xs text-muted-foreground leading-snug">{e.desc}</div>
                </div>
              </motion.div>
            ))}
          </div>
          <UnderTheHood terms={['Bitcoin Script', 'EVM', 'ERC-20', 'ERC-721', 'reentrancy']} className="shrink-0 mt-3" />
        </div>

        {/* ═══════ EXERCISE ═══════ */}
        <div id="s1-exercise" className="h-full">
          <SmartContractSortingExercise />
        </div>

        {/* ═══════ QUIZ ═══════ */}
        <div id="s1-quiz" className="h-full">
          <QuizSlide
            question={t('quiz.question')}
            options={quizOptions}
            explanation={t('quiz.explanation')}
          />
        </div>

        {/* ═══════ TAKEAWAYS ═══════ */}
        <div id="s1-takeaways" className="h-full">
          <TakeawaySlide
            title={t('takeaways.title')}
            takeaways={takeawayItems}
          />
        </div>

        {/* ═══════ SUMMARY ═══════ */}
        <div id="s1-summary" className="h-full flex flex-col p-6 lg:p-10">
          <div className="shrink-0 mb-5">
            <h2 className="text-2xl lg:text-3xl font-bold text-foreground">{t('summary.heading')}</h2>
            <p className="text-sm text-muted-foreground mt-1">{t('summary.subtitle')}</p>
          </div>
          <div className="flex-1 min-h-0 grid grid-cols-3 gap-4 content-start">
            {summaryCards.map((card, i) => (
              <motion.div
                key={card.title}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.08, duration: 0.3 }}
                className="flex flex-col gap-2 p-4 rounded-2xl border bg-card"
                style={{ borderColor: '#6366f130' }}
              >
                <div className="text-3xl">{card.icon}</div>
                <div className="font-bold text-sm text-foreground">{card.title}</div>
                <div className="text-xs text-muted-foreground leading-relaxed">{card.summary}</div>
              </motion.div>
            ))}
          </div>
          <div className="shrink-0 mt-4 p-3 rounded-xl border border-border bg-card/50 text-center">
            <span className="text-xs text-muted-foreground">{t('summary.footer')}</span>
          </div>
        </div>

        </div>
        <SiteFooter className="snap-start" />
      </div>
    </div>
  );
}
