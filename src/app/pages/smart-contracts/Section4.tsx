import { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'motion/react';
import { TitleSlide } from '../../components/templates/TitleSlide';
import { TakeawaySlide } from '../../components/templates/TakeawaySlide';
import { QuizSlide } from '../../components/templates/QuizSlide';
import { SectionNav } from '../../components/navigation/SectionNav';
import { SiteFooter } from '../../components/shared/SiteFooter';
import { Brain } from 'lucide-react';
import { ClassDiscussion } from '../../components/shared/ClassDiscussion';
import { UnderTheHood } from '../../components/shared/UnderTheHood';
import { KeyPointBar } from '../../components/shared/KeyPointBar';

import imgDaoTimeline   from '../../../assets/sc/dao-timeline.png';
import imgAsxAsic       from '../../../assets/sc/asx-asic.jpg';
import imgDecisionChart from '../../../assets/sc/decision-flowchart.png';

// Language-neutral shape — IDs + kind only. Labels resolved via t() at render time.
const chapterShape = [
  { kind: 'group' as const, id: 'g-decide' },
  { id: 's4-decision-intro' },
  { id: 's4-decision-chart' },
  { id: 's4-decision-flow' },
  { id: 's4-discussion' },
  { id: 's4-decision-yes' },
  { id: 's4-decision-no' },

  { kind: 'group' as const, id: 'g-cases' },
  { id: 's4-cases-intro' },
  { id: 's4-case-success' },
  { id: 's4-case-sc-fail' },
  { id: 's4-case-org-fail' },
  { id: 's4-case-dao-quiz' },
  { id: 's4-case-asx-quiz' },

  { kind: 'group' as const, id: 'g-adopt' },
  { id: 's4-adoption-intro' },
  { id: 's4-adoption-strategy' },
  { id: 's4-adoption-tech' },
  { id: 's4-adoption-legal' },
  { id: 's4-adoption-risk' },
  { id: 's4-adoption-finance' },

  { kind: 'group' as const, id: 'g-strat' },
  { id: 's4-opportunities' },
  { id: 's4-challenges-academic' },
  { id: 's4-strategies' },

  { kind: 'group' as const, id: 'g-close' },
  { id: 's4-quiz' },
  { id: 's4-takeaways' },
] as const;

// ─── Interactive Decision Flow ───────────────────────────────────────────────

type Verdict = 'sc' | 'hybrid' | 'db';

// Language-neutral: question ids + branch targets. Prompt text resolved via t().
const QUESTIONS = [
  { id: 'parties', yes: 'sc',     no: 'db' },
  { id: 'auto',    yes: 'sc',     no: 'db' },
  { id: 'inter',   yes: 'sc',     no: 'db' },
  { id: 'immut',   yes: 'sc',     no: 'hybrid' },
  { id: 'trans',   yes: 'sc',     no: 'hybrid' },
  { id: 'priv',    yes: 'hybrid', no: 'sc' },
  { id: 'reg',     yes: 'hybrid', no: 'sc' },
  { id: 'flex',    yes: 'db',     no: 'sc' },
] as const;

const VERDICT_META: Record<Verdict, { emoji: string; color: string }> = {
  sc:     { emoji: '✅', color: '#39B54A' },
  hybrid: { emoji: '⚠️', color: '#f59e0b' },
  db:     { emoji: '❌', color: '#ED1C24' },
};

function DecisionFlow() {
  const { t } = useTranslation('smart-contracts/section-4');
  const [answers, setAnswers] = useState<Record<string, 'yes' | 'no'>>({});
  const [done,    setDone]    = useState(false);
  const idx = Object.keys(answers).length;
  const current = QUESTIONS[idx];

  const verdict: Verdict | null = (() => {
    if (!done) return null;
    const counts: Record<Verdict, number> = { sc: 0, hybrid: 0, db: 0 };
    QUESTIONS.forEach(q => {
      const a = answers[q.id];
      if (!a) return;
      const v = (a === 'yes' ? q.yes : q.no) as Verdict;
      counts[v]++;
    });
    // Prefer most-frequent; tie-break: hybrid > db > sc
    const max = Math.max(counts.sc, counts.hybrid, counts.db);
    if (counts.hybrid >= 3) return 'hybrid';
    if (counts.db >= 4)     return 'db';
    if (counts.sc >= 4)     return 'sc';
    return 'hybrid';
  })();

  const answer = (a: 'yes' | 'no') => {
    const next = { ...answers, [current.id]: a };
    setAnswers(next);
    if (Object.keys(next).length === QUESTIONS.length) setDone(true);
  };

  const reset = () => { setAnswers({}); setDone(false); };

  return (
    <div className="h-full flex flex-col p-6 lg:p-8">
      <div className="shrink-0 mb-3">
        <span className="px-2.5 py-0.5 rounded-full bg-[#6366f1]/15 border border-[#6366f1]/40 text-[#6366f1] text-xs font-bold">{t('decisionFlow.badge')}</span>
        <h2 className="text-2xl font-bold text-foreground mt-1">{t('decisionFlow.heading')}</h2>
        <p className="text-muted-foreground text-sm">{t('decisionFlow.subtitle')}</p>
      </div>

      <div className="flex-1 min-h-0 flex flex-col gap-4">

        {/* Progress */}
        <div className="shrink-0 flex items-center gap-1.5">
          {QUESTIONS.map((q, i) => (
            <div key={q.id} className="flex-1 h-1.5 rounded-full transition-colors"
              style={{ backgroundColor: i < idx || done ? '#6366f1' : 'var(--muted)' }} />
          ))}
          <div className="text-xs text-muted-foreground ml-2 w-12 text-right">{Math.min(idx + 1, QUESTIONS.length)} / {QUESTIONS.length}</div>
        </div>

        <div className="flex-1 min-h-0 flex items-center justify-center">
          {!done && current ? (
            <motion.div key={current.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
              className="max-w-2xl w-full p-6 bg-card border border-[#6366f1]/30 rounded-2xl flex flex-col gap-5">
              <div className="text-xs font-bold text-[#6366f1] uppercase tracking-widest">{t('decisionFlow.questionLabel', { num: idx + 1 })}</div>
              <div className="text-2xl font-bold text-foreground">{t(`decisionFlow.questions.${current.id}`)}</div>
              <div className="grid grid-cols-2 gap-3">
                <button onClick={() => answer('yes')}
                  className="px-5 py-3 rounded-xl bg-[#39B54A] text-white font-bold hover:bg-[#39B54A]/90 transition-colors">
                  {t('decisionFlow.yes')}
                </button>
                <button onClick={() => answer('no')}
                  className="px-5 py-3 rounded-xl bg-[#ED1C24] text-white font-bold hover:bg-[#ED1C24]/90 transition-colors">
                  {t('decisionFlow.no')}
                </button>
              </div>
            </motion.div>
          ) : verdict ? (
            <AnimatePresence>
              <motion.div key="verdict" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                className="max-w-3xl w-full p-8 bg-card border-4 rounded-2xl flex flex-col gap-4 text-center"
                style={{ borderColor: VERDICT_META[verdict].color }}>
                <div className="text-6xl">{VERDICT_META[verdict].emoji}</div>
                <div className="text-xs font-bold uppercase tracking-widest" style={{ color: VERDICT_META[verdict].color }}>{t('decisionFlow.verdictLabel')}</div>
                <div className="text-3xl font-black text-foreground">{t(`decisionFlow.verdicts.${verdict}.title`)}</div>
                <p className="text-sm text-muted-foreground leading-relaxed max-w-xl mx-auto">{t(`decisionFlow.verdicts.${verdict}.desc`)}</p>
                <button onClick={reset}
                  className="self-center mt-3 px-5 py-2 rounded-xl bg-muted text-sm font-semibold text-muted-foreground hover:bg-muted/80 transition-colors">
                  {t('decisionFlow.startOver')}
                </button>
              </motion.div>
            </AnimatePresence>
          ) : null}
        </div>

      </div>
    </div>
  );
}

interface TitleDesc { title: string; desc: string }
interface ChartStep { q: string; verdict: string }
interface CaseCard { verdict: string; name: string; tag: string; desc: string; lesson: string }
interface ResultStat { value: string; label: string }
interface PillarItem { label: string; desc: string }
interface CostItem { label: string; range: string; desc: string }
interface OppItem { label: string; desc: string }
interface StrategyItem { name: string; moat: string; desc: string }
const YES_EMOJI = ['👥', '⚡', '🔍', '💰', '🔓', '🔒', '🌍'];
const NO_EMOJI = ['🏢', '⚡', '🔄', '📦', '🤐', '⚖️', '🧑', '💸'];
const CASE_COLORS = ['#39B54A', '#f59e0b', '#ED1C24'];
const PILLAR_META = [
  { num: '01', emoji: '🎯', color: '#6366f1' },
  { num: '02', emoji: '🏗', color: '#8b5cf6' },
  { num: '03', emoji: '⚖️', color: '#22d3ee' },
  { num: '04', emoji: '🛡', color: '#ED1C24' },
  { num: '05', emoji: '💰', color: '#39B54A' },
];
const STRATEGY_META = [
  { color: '#6366f1' }, { color: '#8b5cf6' }, { color: '#39B54A' },
  { color: '#22d3ee' }, { color: '#f59e0b' }, { color: '#ec4899' },
];
const ADOPTION_STRATEGY_COLORS = ['#6366f1', '#8b5cf6', '#22d3ee', '#39B54A'];
const ADOPTION_TECH_META = [
  { emoji: '⚡', color: '#8b5cf6' }, { emoji: '🔌', color: '#6366f1' }, { emoji: '🛠', color: '#22d3ee' },
  { emoji: '🔐', color: '#39B54A' }, { emoji: '💾', color: '#f59e0b' }, { emoji: '📊', color: '#ec4899' },
];
const RISK_META = [
  { emoji: '🔍', color: '#ED1C24' }, { emoji: '🧮', color: '#f59e0b' }, { emoji: '💰', color: '#8b5cf6' },
  { emoji: '⚙️', color: '#6366f1' }, { emoji: '🚨', color: '#22d3ee' }, { emoji: '📡', color: '#39B54A' },
];
const CHALLENGE_META = [
  { emoji: '⚙️', color: '#6366f1' }, { emoji: '⚖️', color: '#8b5cf6' }, { emoji: '🐛', color: '#ED1C24' },
  { emoji: '⚡', color: '#f59e0b' }, { emoji: '🤝', color: '#22d3ee' }, { emoji: '🧑', color: '#39B54A' },
];
const STRATEGY_EMOJI = ['🏦', '🌐', '🦄', '🏡', '✈️', '🛠'];

// Rebuild a rich-text bullet (text + bold/italic spans) from a structured item.
export function SC_Section4() {
  const { t } = useTranslation('smart-contracts/section-4');

  const chapters = useMemo(
    () => chapterShape.map((c) =>
      'kind' in c
        ? { kind: 'group' as const, id: c.id, label: t(`groups.${c.id}`) }
        : { id: c.id, label: t(`chapters.${c.id}`) }
    ),
    [t]
  );

  const chartSteps   = t('decisionChart.steps', { returnObjects: true }) as ChartStep[];
  const yesItems     = t('decisionYes.items', { returnObjects: true }) as TitleDesc[];
  const noItems      = t('decisionNo.items', { returnObjects: true }) as TitleDesc[];
  const caseCards    = t('casesIntro.items', { returnObjects: true }) as CaseCard[];

  const successBg    = t('caseSuccess.background', { returnObjects: true }) as string[];
  const successUse   = t('caseSuccess.useCases', { returnObjects: true }) as string[];
  const successRes   = t('caseSuccess.results', { returnObjects: true }) as ResultStat[];

  const scFailVision   = t('caseScFail.vision', { returnObjects: true }) as string[];
  const scFailHack     = t('caseScFail.hack', { returnObjects: true }) as string[];
  const scFailResponse = t('caseScFail.response', { returnObjects: true }) as string[];

  const orgFailBg       = t('caseOrgFail.background', { returnObjects: true }) as string[];
  const orgFailHappened = t('caseOrgFail.happened', { returnObjects: true }) as string[];
  const orgFailWhy      = t('caseOrgFail.why', { returnObjects: true }) as string[];

  const daoQuizOptions = t('daoQuiz.options', { returnObjects: true }) as string[];
  const asxQuizOptions = t('asxQuiz.options', { returnObjects: true }) as string[];

  const pillars        = t('adoptionIntro.pillars', { returnObjects: true }) as PillarItem[];
  const strategyItems  = t('adoptionStrategy.items', { returnObjects: true }) as TitleDesc[];
  const techItems      = t('adoptionTech.items', { returnObjects: true }) as TitleDesc[];
  const legalEngage    = t('adoptionLegal.engage', { returnObjects: true }) as string[];
  const legalCross     = t('adoptionLegal.crossPoints', { returnObjects: true }) as string[];
  const riskItems      = t('adoptionRisk.items', { returnObjects: true }) as TitleDesc[];
  const upfrontCosts   = t('adoptionFinance.upfront', { returnObjects: true }) as CostItem[];
  const ongoingCosts   = t('adoptionFinance.ongoing', { returnObjects: true }) as CostItem[];

  const opsOpps        = t('opportunities.operational', { returnObjects: true }) as OppItem[];
  const stratOpps      = t('opportunities.strategic', { returnObjects: true }) as OppItem[];
  const challengeItems = t('challenges.items', { returnObjects: true }) as TitleDesc[];
  const competitive    = t('strategies.items', { returnObjects: true }) as StrategyItem[];


  const daoQuizOptionsTyped = daoQuizOptions.map((text, i) => ({ text, correct: i === 0 }));
  const asxQuizOptionsTyped = asxQuizOptions.map((text, i) => ({ text, correct: i === 2 }));
  const mainQuizOptions = (t('quiz.options', { returnObjects: true }) as string[]).map((text, i) => ({ text, correct: i === 1 }));

  const takeaways = t('takeaways.items', { returnObjects: true }) as string[];

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
            icon={<Brain className="size-20 text-[#6366f1]" />}
            gradient="from-[#6366f1] to-[#8b5cf6]"
          />
        </div>

        {/* ═══════ DECISION INTRO ═══════ */}
        <div id="s4-decision-intro" className="h-full flex flex-col p-6 lg:p-10">
          <div className="shrink-0 mb-5">
            <h2 className="text-2xl lg:text-3xl font-bold text-foreground">{t('decisionIntro.heading')}</h2>
            <p className="text-muted-foreground text-sm mt-1">{t('decisionIntro.subtitle')}</p>
          </div>
          <div className="flex-1 min-h-0 flex items-center justify-center">
            <div className="max-w-3xl text-center space-y-6">
              <div className="text-5xl lg:text-6xl font-black text-foreground leading-tight">
                {t('decisionIntro.bigA')}<br/>
                <span className="text-[#6366f1]">{t('decisionIntro.bigEmph')}</span> {t('decisionIntro.bigB')}<br/>
                {t('decisionIntro.bigC')}
              </div>
              <div className="grid grid-cols-2 gap-4 mt-8">
                <div className="p-5 bg-card border border-[#6366f1]/30 rounded-xl">
                  <div className="text-2xl mb-2">🚫</div>
                  <div className="font-bold text-foreground mb-1">{t('decisionIntro.card1')}</div>
                </div>
                <div className="p-5 bg-card border border-[#8b5cf6]/30 rounded-xl">
                  <div className="text-2xl mb-2">🚫</div>
                  <div className="font-bold text-foreground mb-1">{t('decisionIntro.card2')}</div>
                </div>
              </div>
              <p className="text-muted-foreground text-sm italic">
                {t('decisionIntro.footnote')}
              </p>
            </div>
          </div>
          <KeyPointBar text={t('keyPoints.s4-decision-intro')} className="mt-3" />
        </div>

        {/* ═══════ DECISION TREE — CANONICAL CHART ═══════ */}
        <div id="s4-decision-chart" className="h-full flex flex-col p-6 lg:p-10">
          <div className="shrink-0 mb-3">
            <h2 className="text-2xl lg:text-3xl font-bold text-foreground">{t('decisionChart.heading')}</h2>
            <p className="text-muted-foreground text-sm mt-1">{t('decisionChart.subtitle')}</p>
          </div>
          <div className="flex-1 min-h-0 grid grid-cols-[2fr_1fr] gap-5">
            {/* Chart */}
            <div className="flex items-center justify-center bg-white rounded-xl border border-border p-3 min-h-0">
              <img
                src={imgDecisionChart}
                alt={t('decisionChart.imgAlt')}
                className="max-h-full max-w-full object-contain"
              />
            </div>
            {/* Walkthrough */}
            <div className="flex flex-col gap-2 overflow-y-auto">
              <div className="text-xs font-bold text-[#6366f1] uppercase tracking-widest">{t('decisionChart.howToRead')}</div>
              {chartSteps.map((step, i) => {
                const color = ['#ED1C24', '#ED1C24', '#f59e0b', '#f59e0b', '#22d3ee', '#39B54A'][i];
                return (
                  <div key={i} className="p-2 bg-card border border-border rounded-lg" style={{ borderColor: color + '40' }}>
                    <div className="text-[10px] text-muted-foreground">Q{i + 1}</div>
                    <div className="font-semibold text-xs text-foreground">{step.q}</div>
                    <div className="text-[10px] font-bold mt-0.5" style={{ color }}>{step.verdict}</div>
                  </div>
                );
              })}
              <div className="mt-auto p-2 bg-[#6366f1]/10 border border-[#6366f1]/30 rounded-lg text-[11px] text-muted-foreground">
                <span className="font-semibold text-foreground">{t('decisionChart.pointLabel')}</span>{t('decisionChart.pointBody')}
              </div>
              <UnderTheHood terms={['permissioned vs public', 'access control', 'Bitcoin-like ledger']} />
            </div>
          </div>
          <KeyPointBar text={t('keyPoints.s4-decision-chart')} className="mt-3" />
        </div>

        {/* ═══════ INTERACTIVE DECISION FLOW ═══════ */}
        <div id="s4-decision-flow" className="h-full flex flex-col">
          <div className="flex-1 min-h-0">
            <DecisionFlow />
          </div>
          <KeyPointBar text={t('keyPoints.s4-decision-flow')} className="mx-6 lg:mx-8 mb-6 -mt-3" />
        </div>

        {/* ═══════ DISCUSSION — RUN THE FRAMEWORK TOGETHER ═══════ */}
        <div id="s4-discussion" className="h-full">
          <ClassDiscussion
            badge={t('discussion.badge')}
            duration={t('discussion.duration')}
            title={t('discussion.title')}
            lead={t('discussion.lead')}
            questions={t('discussion.questions', { returnObjects: true }) as string[]}
            note={t('discussion.note')}
          />
        </div>

        {/* ═══════ WHEN SC MAKE SENSE ═══════ */}
        <div id="s4-decision-yes" className="h-full flex flex-col p-6 lg:p-10">
          <div className="shrink-0 mb-5">
            <h2 className="text-2xl lg:text-3xl font-bold text-foreground">{t('decisionYes.heading')}</h2>
            <p className="text-muted-foreground text-sm mt-1">{t('decisionYes.subtitle')}</p>
          </div>
          <div className="flex-1 min-h-0 grid grid-cols-2 gap-4 content-center">
            {yesItems.map((p, i) => (
              <div key={p.title} className="flex items-start gap-3 p-4 bg-card border border-[#39B54A]/25 rounded-xl">
                <div className="size-10 rounded-xl bg-[#39B54A]/15 flex items-center justify-center text-2xl shrink-0">{YES_EMOJI[i]}</div>
                <div>
                  <div className="font-bold text-sm text-foreground mb-1">{p.title}</div>
                  <div className="text-xs text-muted-foreground">{p.desc}</div>
                </div>
              </div>
            ))}
          </div>
          <KeyPointBar text={t('keyPoints.s4-decision-yes')} className="mt-3" />
        </div>

        {/* ═══════ WHEN TO RETHINK ═══════ */}
        <div id="s4-decision-no" className="h-full flex flex-col p-6 lg:p-10">
          <div className="shrink-0 mb-5">
            <h2 className="text-2xl lg:text-3xl font-bold text-foreground">{t('decisionNo.heading')}</h2>
            <p className="text-muted-foreground text-sm mt-1">{t('decisionNo.subtitle')}</p>
          </div>
          <div className="flex-1 min-h-0 grid grid-cols-2 gap-4 content-center">
            {noItems.map((p, i) => (
              <div key={p.title} className="flex items-start gap-3 p-4 bg-card border border-[#ED1C24]/25 rounded-xl">
                <div className="size-10 rounded-xl bg-[#ED1C24]/15 flex items-center justify-center text-2xl shrink-0">{NO_EMOJI[i]}</div>
                <div>
                  <div className="font-bold text-sm text-foreground mb-1">{p.title}</div>
                  <div className="text-xs text-muted-foreground">{p.desc}</div>
                </div>
              </div>
            ))}
          </div>
          <KeyPointBar text={t('keyPoints.s4-decision-no')} className="mt-3" />
        </div>

        {/* ═══════════════════════════════════════════════════════════ */}
        {/* THREE LESSONS FROM THE FIELD                                */}
        {/* ═══════════════════════════════════════════════════════════ */}

        {/* Lessons intro — overview of the 3 outcomes */}
        <div id="s4-cases-intro" className="h-full flex flex-col p-6 lg:p-10">
          <div className="shrink-0 mb-5">
            <h2 className="text-2xl lg:text-3xl font-bold text-foreground">{t('casesIntro.heading')}</h2>
            <p className="text-muted-foreground text-sm mt-1">{t('casesIntro.subtitle')}</p>
          </div>
          <div className="flex-1 min-h-0 grid grid-cols-3 gap-5 content-center">
            {caseCards.map((c, i) => {
              const color = CASE_COLORS[i];
              const emoji = ['✅', '⚠️', '❌'][i];
              return (
                <div key={c.name} className="p-5 bg-card border-2 rounded-xl flex flex-col gap-3" style={{ borderColor: color + '50' }}>
                  <div className="flex items-center gap-3">
                    <div className="text-4xl">{emoji}</div>
                    <div>
                      <div className="text-[10px] font-bold uppercase tracking-widest" style={{ color }}>{c.tag}</div>
                      <div className="font-black text-foreground">{c.name}</div>
                    </div>
                  </div>
                  <div className="text-[10px] font-semibold text-muted-foreground italic">{c.verdict}</div>
                  <p className="text-xs text-muted-foreground leading-relaxed flex-1">{c.desc}</p>
                  <div className="p-2 rounded-lg text-xs" style={{ backgroundColor: color + '15' }}>
                    <span className="font-bold" style={{ color }}>{t('casesIntro.lessonLabel')}</span>
                    <span className="text-muted-foreground">{c.lesson}</span>
                  </div>
                </div>
              );
            })}
          </div>
          <div className="shrink-0 mt-4 p-3 rounded-xl border border-border bg-muted/30 text-xs text-muted-foreground">
            <span className="font-semibold text-foreground">{t('casesIntro.patternLabel')}</span>{t('casesIntro.patternBody')}
          </div>
          <KeyPointBar text={t('keyPoints.s4-cases-intro')} className="mt-3" />
        </div>

        {/* ═══════ CASE: ESTONIA — SUCCESS ═══════ */}
        <div id="s4-case-success" className="h-full flex flex-col p-6 lg:p-10">
          <div className="shrink-0 mb-1">
            <div className="text-xs font-bold text-[#39B54A] uppercase tracking-widest mb-1">{t('caseSuccess.kicker')}</div>
            <h2 className="text-2xl lg:text-3xl font-bold text-foreground">{t('caseSuccess.heading')}</h2>
            <p className="text-muted-foreground text-sm mt-1">{t('caseSuccess.subtitle')}</p>
          </div>
          <div className="flex-1 min-h-0 grid grid-cols-3 gap-4 content-center mt-4">
            <div className="p-4 bg-gradient-to-br from-[#22d3ee]/10 to-transparent border border-[#22d3ee]/30 rounded-xl flex flex-col gap-2">
              <div className="text-xs font-bold text-[#22d3ee] uppercase tracking-widest">{t('caseSuccess.backgroundLabel')}</div>
              <ul className="text-xs text-muted-foreground space-y-1.5">
                {successBg.map((item, i) => (
                  <li key={i} className="flex gap-1.5"><span className="text-[#22d3ee]">›</span>{item}</li>
                ))}
              </ul>
            </div>
            <div className="p-4 bg-gradient-to-br from-[#6366f1]/10 to-transparent border border-[#6366f1]/30 rounded-xl flex flex-col gap-2">
              <div className="text-xs font-bold text-[#6366f1] uppercase tracking-widest">{t('caseSuccess.useCasesLabel')}</div>
              <ul className="text-xs text-muted-foreground space-y-1.5">
                {successUse.map((item, i) => (
                  <li key={i} className="flex gap-1.5"><span className="text-[#6366f1]">›</span>{item}</li>
                ))}
              </ul>
            </div>
            <div className="p-4 bg-gradient-to-br from-[#39B54A]/10 to-transparent border border-[#39B54A]/30 rounded-xl flex flex-col gap-2">
              <div className="text-xs font-bold text-[#39B54A] uppercase tracking-widest">{t('caseSuccess.resultsLabel')}</div>
              <div className="grid grid-cols-1 gap-2">
                {successRes.map((r, i) => (
                  <div key={i} className="p-2 bg-card border border-border rounded-lg">
                    <div className="font-mono font-black text-base text-[#39B54A]">{r.value}</div>
                    <div className="text-[10px] text-muted-foreground">{r.label}</div>
                  </div>
                ))}
              </div>
              <div className="text-xs text-muted-foreground p-2 bg-[#39B54A]/10 rounded-lg mt-auto">
                <span className="font-semibold text-foreground">{t('caseSuccess.whyLabel')}</span>{t('caseSuccess.whyBody')}
              </div>
            </div>
          </div>
          <KeyPointBar text={t('keyPoints.s4-case-success')} className="mt-3" />
        </div>

        {/* ═══════ CASE: THE DAO — SMART CONTRACT FAILURE ═══════ */}
        <div id="s4-case-sc-fail" className="h-full flex flex-col p-6 lg:p-10">
          <div className="shrink-0 mb-1 flex items-start gap-4">
            <img src={imgDaoTimeline} alt={t('caseScFail.imgAlt')} className="hidden lg:block h-24 rounded-lg object-contain shrink-0 bg-white p-1" />
            <div>
              <div className="text-xs font-bold text-[#f59e0b] uppercase tracking-widest mb-1">{t('caseScFail.kicker')}</div>
              <h2 className="text-2xl lg:text-3xl font-bold text-foreground">{t('caseScFail.heading')}</h2>
              <p className="text-muted-foreground text-sm mt-1">{t('caseScFail.subtitle')}</p>
            </div>
          </div>
          <div className="flex-1 min-h-0 grid grid-cols-3 gap-4 content-center mt-4">
            <div className="p-4 bg-gradient-to-br from-[#6366f1]/10 to-transparent border border-[#6366f1]/30 rounded-xl flex flex-col gap-2">
              <div className="text-xs font-bold text-[#6366f1] uppercase tracking-widest">{t('caseScFail.visionLabel')}</div>
              <ul className="text-xs text-muted-foreground space-y-1.5">
                {scFailVision.map((item, i) => (
                  <li key={i} className="flex gap-1.5"><span className="text-[#6366f1]">›</span>{item}</li>
                ))}
              </ul>
            </div>
            <div className="p-4 bg-gradient-to-br from-[#ED1C24]/10 to-transparent border border-[#ED1C24]/30 rounded-xl flex flex-col gap-2">
              <div className="text-xs font-bold text-[#ED1C24] uppercase tracking-widest">{t('caseScFail.hackLabel')}</div>
              <ul className="text-xs text-muted-foreground space-y-1.5">
                {scFailHack.map((item, i) => (
                  <li key={i} className="flex gap-1.5"><span className="text-[#ED1C24]">›</span>{item}</li>
                ))}
              </ul>
            </div>
            <div className="p-4 bg-gradient-to-br from-[#f59e0b]/10 to-transparent border border-[#f59e0b]/30 rounded-xl flex flex-col gap-2">
              <div className="text-xs font-bold text-[#f59e0b] uppercase tracking-widest">{t('caseScFail.responseLabel')}</div>
              <ul className="text-xs text-muted-foreground space-y-1.5">
                {scFailResponse.map((item, i) => (
                  <li key={i} className="flex gap-1.5"><span className="text-[#f59e0b]">›</span>{item}</li>
                ))}
              </ul>
              <div className="p-2 bg-[#f59e0b]/10 rounded-lg text-xs text-muted-foreground mt-auto">
                <span className="font-semibold text-foreground">{t('caseScFail.lessonsLabel')}</span>{t('caseScFail.lessonsBody')}
              </div>
            </div>
          </div>
          <KeyPointBar text={t('keyPoints.s4-case-sc-fail')} className="mt-3" />
        </div>

        {/* ═══════ CASE: ASX — ORGANISATIONAL FAILURE ═══════ */}
        <div id="s4-case-org-fail" className="h-full flex flex-col p-6 lg:p-10">
          <div className="shrink-0 mb-1 flex items-start gap-4">
            <img src={imgAsxAsic} alt={t('caseOrgFail.imgAlt')} className="hidden lg:block h-24 rounded-lg object-cover shrink-0" />
            <div>
              <div className="text-xs font-bold text-[#ED1C24] uppercase tracking-widest mb-1">{t('caseOrgFail.kicker')}</div>
              <h2 className="text-2xl lg:text-3xl font-bold text-foreground">{t('caseOrgFail.heading')}</h2>
              <p className="text-muted-foreground text-sm mt-1">{t('caseOrgFail.subtitle')}</p>
            </div>
          </div>
          <div className="flex-1 min-h-0 grid grid-cols-3 gap-4 content-center mt-4">
            <div className="p-4 bg-gradient-to-br from-[#6366f1]/10 to-transparent border border-[#6366f1]/30 rounded-xl flex flex-col gap-2">
              <div className="text-xs font-bold text-[#6366f1] uppercase tracking-widest">{t('caseOrgFail.backgroundLabel')}</div>
              <ul className="text-xs text-muted-foreground space-y-1.5">
                {orgFailBg.map((item, i) => (
                  <li key={i} className="flex gap-1.5"><span className="text-[#6366f1]">›</span>{item}</li>
                ))}
              </ul>
            </div>
            <div className="p-4 bg-gradient-to-br from-[#ED1C24]/10 to-transparent border border-[#ED1C24]/30 rounded-xl flex flex-col gap-2">
              <div className="text-xs font-bold text-[#ED1C24] uppercase tracking-widest">{t('caseOrgFail.happenedLabel')}</div>
              <ul className="text-xs text-muted-foreground space-y-1.5">
                {orgFailHappened.map((item, i) => (
                  <li key={i} className="flex gap-1.5"><span className="text-[#ED1C24]">›</span>{item}</li>
                ))}
              </ul>
            </div>
            <div className="p-4 bg-gradient-to-br from-[#f59e0b]/10 to-transparent border border-[#f59e0b]/30 rounded-xl flex flex-col gap-2">
              <div className="text-xs font-bold text-[#f59e0b] uppercase tracking-widest">{t('caseOrgFail.whyLabel')}</div>
              <ul className="text-xs text-muted-foreground space-y-1.5">
                {orgFailWhy.map((item, i) => (
                  <li key={i} className="flex gap-1.5"><span className="text-[#f59e0b]">›</span>{item}</li>
                ))}
              </ul>
              <div className="p-2 bg-[#f59e0b]/10 rounded-lg text-xs text-muted-foreground mt-auto">
                <span className="font-semibold text-foreground">{t('caseOrgFail.lessonLabel')}</span>{t('caseOrgFail.lessonBody')}
              </div>
            </div>
          </div>
          <KeyPointBar text={t('keyPoints.s4-case-org-fail')} className="mt-3" />
        </div>

        {/* ═══════ QUIZ — DAO ═══════ */}
        <div id="s4-case-dao-quiz" className="h-full">
          <QuizSlide
            question={t('daoQuiz.question')}
            options={daoQuizOptionsTyped}
            explanation={t('daoQuiz.explanation')}
          />
        </div>

        {/* ═══════ QUIZ — ASX ═══════ */}
        <div id="s4-case-asx-quiz" className="h-full">
          <QuizSlide
            question={t('asxQuiz.question')}
            options={asxQuizOptionsTyped}
            explanation={t('asxQuiz.explanation')}
          />
        </div>

        {/* ═══════ ADOPTION INTRO — 5 PILLARS ═══════ */}
        <div id="s4-adoption-intro" className="h-full flex flex-col p-6 lg:p-10">
          <div className="shrink-0 mb-5">
            <h2 className="text-2xl lg:text-3xl font-bold text-foreground">{t('adoptionIntro.heading')}</h2>
            <p className="text-muted-foreground text-sm mt-1">{t('adoptionIntro.subtitle')}</p>
          </div>

          <div className="flex-1 min-h-0 grid grid-cols-5 gap-3 content-center">
            {pillars.map((p, i) => {
              const meta = PILLAR_META[i];
              return (
                <div key={meta.num} className="p-4 bg-card border rounded-xl flex flex-col gap-2"
                  style={{ borderColor: meta.color + '40' }}>
                  <div className="flex items-center gap-2">
                    <div className="size-8 rounded-lg flex items-center justify-center text-white text-xs font-black" style={{ backgroundColor: meta.color }}>{meta.num}</div>
                    <div className="text-2xl">{meta.emoji}</div>
                  </div>
                  <div className="font-bold text-sm text-foreground">{p.label}</div>
                  <div className="text-xs text-muted-foreground leading-snug">{p.desc}</div>
                </div>
              );
            })}
          </div>
          <div className="shrink-0 mt-4 p-3 rounded-xl border border-border bg-muted/30 text-xs text-muted-foreground italic">
            {t('adoptionIntro.footnote')}
          </div>
          <KeyPointBar text={t('keyPoints.s4-adoption-intro')} className="mt-3" />
        </div>

        {/* ═══════ STRATEGIC ALIGNMENT ═══════ */}
        <div id="s4-adoption-strategy" className="h-full flex flex-col p-6 lg:p-10">
          <div className="shrink-0 mb-5">
            <div className="text-xs font-bold text-[#6366f1] uppercase tracking-widest mb-1">{t('adoptionStrategy.kicker')}</div>
            <h2 className="text-2xl lg:text-3xl font-bold text-foreground">{t('adoptionStrategy.heading')}</h2>
            <p className="text-muted-foreground text-sm mt-1">{t('adoptionStrategy.subtitle')}</p>
          </div>
          <div className="flex-1 min-h-0 grid grid-cols-2 gap-5 content-center">
            {strategyItems.map((c, i) => {
              const color = ADOPTION_STRATEGY_COLORS[i];
              return (
                <div key={c.title} className="p-5 bg-card border rounded-xl flex flex-col gap-3" style={{ borderColor: color + '30' }}>
                  <div className="font-bold text-sm" style={{ color }}>{c.title}</div>
                  <p className="text-xs text-muted-foreground leading-relaxed flex-1">{c.desc}</p>
                </div>
              );
            })}
          </div>
          <KeyPointBar text={t('keyPoints.s4-adoption-strategy')} className="mt-3" />
        </div>

        {/* ═══════ TECHNICAL INFRASTRUCTURE ═══════ */}
        <div id="s4-adoption-tech" className="h-full flex flex-col p-6 lg:p-10">
          <div className="shrink-0 mb-5">
            <div className="text-xs font-bold text-[#8b5cf6] uppercase tracking-widest mb-1">{t('adoptionTech.kicker')}</div>
            <h2 className="text-2xl lg:text-3xl font-bold text-foreground">{t('adoptionTech.heading')}</h2>
            <p className="text-muted-foreground text-sm mt-1">{t('adoptionTech.subtitle')}</p>
          </div>
          <div className="flex-1 min-h-0 grid grid-cols-3 gap-4 content-center">
            {techItems.map((c, i) => {
              const meta = ADOPTION_TECH_META[i];
              return (
                <div key={c.title} className="p-4 bg-card border rounded-xl flex flex-col gap-2" style={{ borderColor: meta.color + '30' }}>
                  <div className="flex items-center gap-2">
                    <div className="size-9 rounded-lg flex items-center justify-center text-xl" style={{ backgroundColor: meta.color + '15' }}>{meta.emoji}</div>
                    <div className="font-bold text-sm" style={{ color: meta.color }}>{c.title}</div>
                  </div>
                  <div className="text-xs text-muted-foreground leading-snug">{c.desc}</div>
                </div>
              );
            })}
          </div>
          <UnderTheHood terms={['RPC node', 'indexer', 'HSM / multisig', 'IPFS + encryption']} className="shrink-0 mt-3" />
          <KeyPointBar text={t('keyPoints.s4-adoption-tech')} className="mt-3" />
        </div>

        {/* ═══════ LEGAL & REGULATORY ═══════ */}
        <div id="s4-adoption-legal" className="h-full flex flex-col p-6 lg:p-10">
          <div className="shrink-0 mb-5">
            <div className="text-xs font-bold text-[#22d3ee] uppercase tracking-widest mb-1">{t('adoptionLegal.kicker')}</div>
            <h2 className="text-2xl lg:text-3xl font-bold text-foreground">{t('adoptionLegal.heading')}</h2>
            <p className="text-muted-foreground text-sm mt-1">{t('adoptionLegal.subtitle')}</p>
          </div>
          <div className="flex-1 min-h-0 grid grid-cols-2 gap-5 content-center">
            <div className="p-5 bg-card border border-[#22d3ee]/30 rounded-xl flex flex-col gap-3">
              <div className="font-bold text-sm text-[#22d3ee]">{t('adoptionLegal.engageLabel')}</div>
              <ul className="text-xs text-muted-foreground space-y-2 flex-1">
                {legalEngage.map((item, i) => (
                  <li key={i} className="flex gap-2"><span className="text-[#22d3ee]">›</span>{item}</li>
                ))}
              </ul>
            </div>
            <div className="p-5 bg-gradient-to-br from-[#22d3ee]/10 to-transparent border border-[#22d3ee]/30 rounded-xl flex flex-col gap-3">
              <div className="font-bold text-sm text-[#22d3ee]">{t('adoptionLegal.crossLabel')}</div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {t('adoptionLegal.crossBody')}
              </p>
              <ul className="text-xs text-muted-foreground space-y-1.5 mt-1">
                {legalCross.map((item, i) => (
                  <li key={i} className="flex gap-1.5"><span className="text-[#22d3ee]">›</span>{item}</li>
                ))}
              </ul>
              <div className="p-2 bg-[#22d3ee]/10 rounded-lg text-xs text-muted-foreground mt-auto">
                <span className="font-semibold text-foreground">{t('adoptionLegal.practicalLabel')}</span>{t('adoptionLegal.practicalBody')}
              </div>
            </div>
          </div>
          <KeyPointBar text={t('keyPoints.s4-adoption-legal')} className="mt-3" />
        </div>

        {/* ═══════ RISK MANAGEMENT ═══════ */}
        <div id="s4-adoption-risk" className="h-full flex flex-col p-6 lg:p-10">
          <div className="shrink-0 mb-5">
            <div className="text-xs font-bold text-[#ED1C24] uppercase tracking-widest mb-1">{t('adoptionRisk.kicker')}</div>
            <h2 className="text-2xl lg:text-3xl font-bold text-foreground">{t('adoptionRisk.heading')}</h2>
            <p className="text-muted-foreground text-sm mt-1">{t('adoptionRisk.subtitle')}</p>
          </div>
          <div className="flex-1 min-h-0 grid grid-cols-3 gap-4 content-center">
            {riskItems.map((c, i) => {
              const meta = RISK_META[i];
              return (
                <div key={c.title} className="p-4 bg-card border rounded-xl flex flex-col gap-2" style={{ borderColor: meta.color + '30' }}>
                  <div className="flex items-center gap-2">
                    <div className="size-9 rounded-lg flex items-center justify-center text-xl" style={{ backgroundColor: meta.color + '15' }}>{meta.emoji}</div>
                    <div className="font-bold text-sm" style={{ color: meta.color }}>{c.title}</div>
                  </div>
                  <div className="text-xs text-muted-foreground leading-snug flex-1">{c.desc}</div>
                </div>
              );
            })}
          </div>
          <UnderTheHood terms={['audit', 'formal verification', 'proxy upgrade', 'timelock', 'bug bounty']} className="shrink-0 mt-3" />
          <KeyPointBar text={t('keyPoints.s4-adoption-risk')} className="mt-3" />
        </div>

        {/* ═══════ FINANCIAL PLANNING ═══════ */}
        <div id="s4-adoption-finance" className="h-full flex flex-col p-6 lg:p-10">
          <div className="shrink-0 mb-5">
            <div className="text-xs font-bold text-[#39B54A] uppercase tracking-widest mb-1">{t('adoptionFinance.kicker')}</div>
            <h2 className="text-2xl lg:text-3xl font-bold text-foreground">{t('adoptionFinance.heading')}</h2>
            <p className="text-muted-foreground text-sm mt-1">{t('adoptionFinance.subtitle')}</p>
          </div>
          <div className="flex-1 min-h-0 grid grid-cols-2 gap-5 content-center">
            <div className="flex flex-col gap-3">
              <div className="text-xs font-bold text-[#39B54A] uppercase tracking-widest">{t('adoptionFinance.upfrontLabel')}</div>
              {upfrontCosts.map((c) => (
                <div key={c.label} className="p-3 bg-card border border-[#39B54A]/25 rounded-xl">
                  <div className="flex items-center justify-between">
                    <div className="font-bold text-sm text-foreground">{c.label}</div>
                    <div className="font-mono text-xs text-[#39B54A]">{c.range}</div>
                  </div>
                  <div className="text-[10px] text-muted-foreground mt-1">{c.desc}</div>
                </div>
              ))}
            </div>
            <div className="flex flex-col gap-3">
              <div className="text-xs font-bold text-[#6366f1] uppercase tracking-widest">{t('adoptionFinance.ongoingLabel')}</div>
              {ongoingCosts.map((c) => (
                <div key={c.label} className="p-3 bg-card border border-[#6366f1]/25 rounded-xl">
                  <div className="flex items-center justify-between">
                    <div className="font-bold text-sm text-foreground">{c.label}</div>
                    <div className="font-mono text-xs text-[#6366f1]">{c.range}</div>
                  </div>
                  <div className="text-[10px] text-muted-foreground mt-1">{c.desc}</div>
                </div>
              ))}
            </div>
          </div>
          <div className="shrink-0 mt-3 p-3 rounded-xl border border-border bg-muted/30 text-xs text-muted-foreground italic">
            {t('adoptionFinance.footnote')}
          </div>
          <KeyPointBar text={t('keyPoints.s4-adoption-finance')} className="mt-3" />
        </div>

        {/* ═══════ OPPORTUNITIES ═══════ */}
        <div id="s4-opportunities" className="h-full flex flex-col p-6 lg:p-10">
          <div className="shrink-0 mb-5">
            <h2 className="text-2xl lg:text-3xl font-bold text-foreground">{t('opportunities.heading')}</h2>
            <p className="text-muted-foreground text-sm mt-1">{t('opportunities.subtitle')}</p>
          </div>
          <div className="flex-1 min-h-0 grid grid-cols-2 gap-5 content-center">
            <div className="flex flex-col gap-3">
              <div className="text-xs font-bold text-[#39B54A] uppercase tracking-widest">{t('opportunities.operationalLabel')}</div>
              {opsOpps.map((o) => (
                <div key={o.label} className="p-3 bg-card border border-[#39B54A]/25 rounded-xl">
                  <div className="font-bold text-sm text-foreground">{o.label}</div>
                  <div className="text-xs text-muted-foreground mt-1">{o.desc}</div>
                </div>
              ))}
            </div>
            <div className="flex flex-col gap-3">
              <div className="text-xs font-bold text-[#6366f1] uppercase tracking-widest">{t('opportunities.strategicLabel')}</div>
              {stratOpps.map((o) => (
                <div key={o.label} className="p-3 bg-card border border-[#6366f1]/25 rounded-xl">
                  <div className="font-bold text-sm text-foreground">{o.label}</div>
                  <div className="text-xs text-muted-foreground mt-1">{o.desc}</div>
                </div>
              ))}
            </div>
          </div>
          <div className="shrink-0 mt-3 text-[10px] text-muted-foreground italic">
            {t('opportunities.sources')}
          </div>
          <KeyPointBar text={t('keyPoints.s4-opportunities')} className="mt-3" />
        </div>

        {/* ═══════ CHALLENGES (ACADEMIC) ═══════ */}
        <div id="s4-challenges-academic" className="h-full flex flex-col p-6 lg:p-10">
          <div className="shrink-0 mb-5">
            <h2 className="text-2xl lg:text-3xl font-bold text-foreground">{t('challenges.heading')}</h2>
            <p className="text-muted-foreground text-sm mt-1">{t('challenges.subtitle')}</p>
          </div>
          <div className="flex-1 min-h-0 grid grid-cols-3 gap-4 content-center">
            {challengeItems.map((c, i) => {
              const meta = CHALLENGE_META[i];
              return (
                <div key={c.title} className="p-4 bg-card border rounded-xl flex flex-col gap-2" style={{ borderColor: meta.color + '30' }}>
                  <div className="text-3xl">{meta.emoji}</div>
                  <div className="font-bold text-sm" style={{ color: meta.color }}>{c.title}</div>
                  <div className="text-xs text-muted-foreground leading-snug">{c.desc}</div>
                </div>
              );
            })}
          </div>
          <div className="shrink-0 mt-3 text-[10px] text-muted-foreground italic">
            {t('challenges.sources')}
          </div>
          <KeyPointBar text={t('keyPoints.s4-challenges-academic')} className="mt-3" />
        </div>

        {/* ═══════ STRATEGIES — APPLIED ═══════ */}
        <div id="s4-strategies" className="h-full flex flex-col p-6 lg:p-10">
          <div className="shrink-0 mb-5">
            <h2 className="text-2xl lg:text-3xl font-bold text-foreground">{t('strategies.heading')}</h2>
            <p className="text-muted-foreground text-sm mt-1">{t('strategies.subtitle')}</p>
          </div>
          <div className="flex-1 min-h-0 grid grid-cols-3 gap-4 content-center">
            {competitive.map((s, i) => {
              const color = STRATEGY_META[i].color;
              const emoji = STRATEGY_EMOJI[i];
              return (
                <div key={s.name} className="p-4 bg-card border rounded-xl flex flex-col gap-2" style={{ borderColor: color + '30' }}>
                  <div className="flex items-center gap-2">
                    <div className="text-3xl">{emoji}</div>
                    <div>
                      <div className="font-black text-sm text-foreground">{s.name}</div>
                      <div className="text-[10px] text-muted-foreground uppercase tracking-widest">{s.moat}</div>
                    </div>
                  </div>
                  <div className="text-xs text-muted-foreground leading-snug flex-1">{s.desc}</div>
                </div>
              );
            })}
          </div>
          <div className="shrink-0 mt-3 text-[10px] text-muted-foreground italic">
            {t('strategies.sources')}
          </div>
          <KeyPointBar text={t('keyPoints.s4-strategies')} className="mt-3" />
        </div>

        {/* ═══════ QUIZ ═══════ */}
        <div id="s4-quiz" className="h-full">
          <QuizSlide
            question={t('quiz.question')}
            options={mainQuizOptions}
            explanation={t('quiz.explanation')}
          />
        </div>

        {/* ═══════ TAKEAWAYS ═══════ */}
        <div id="s4-takeaways" className="h-full">
          <TakeawaySlide
            title={t('takeaways.title')}
            takeaways={takeaways}
          />
        </div>

        </div>
        <SiteFooter className="snap-start" />
      </div>
    </div>
  );
}
