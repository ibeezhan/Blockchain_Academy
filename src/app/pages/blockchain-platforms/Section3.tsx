import { Fragment, useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'motion/react';
import { TitleSlide } from '../../components/templates/TitleSlide';
import { TakeawaySlide } from '../../components/templates/TakeawaySlide';
import { SectionNav } from '../../components/navigation/SectionNav';
import { SiteFooter } from '../../components/shared/SiteFooter';
import { ComparisonSlide } from '../../components/templates/ComparisonSlide';
import { ConceptSlide } from '../../components/templates/ConceptSlide';
import { QuizSlide } from '../../components/templates/QuizSlide';
import { Building2 } from 'lucide-react';
import { UnderTheHood } from '../../components/shared/UnderTheHood';
import { KeyPointBar } from '../../components/shared/KeyPointBar';

// Language-neutral shape — only IDs + kind. Labels come from t() at render time.
const chapterShape = [
  { kind: 'group' as const, id: 'g-s3-why' },
  { id: 's3-why' },
  { id: 's3-tradeoffs' },
  { id: 's3-usecases' },
  { id: 's3-supplychains' },

  { kind: 'group' as const, id: 'g-s3-arch' },
  { id: 's3-overview' },
  { id: 's3-how-agrees' },

  { kind: 'group' as const, id: 'g-s3-privacy' },
  { id: 's3-channels' },
  { id: 's3-txflow' },

  { kind: 'group' as const, id: 'g-s3-exercises' },
  { id: 's3-exercise-supply' },
  { id: 's3-exercise-health' },

  { kind: 'group' as const, id: 'g-s3-prod' },
  { id: 's3-production' },
  { id: 's3-comparison' },

  { kind: 'group' as const, id: 'g-s3-fit' },
  { id: 's3-bestfits' },
  { id: 's3-worstfits' },
  { id: 's3-vocab' },

  { kind: 'group' as const, id: 'g-s3-wrap' },
  { id: 's3-quiz' },
  { id: 's3-takeaways' },
] as const;

// ─── s3-why ───────────────────────────────────────────────────────────────────

const WHY_PROBLEM_COLORS = ['#ED1C24', '#f59e0b', '#f59e0b', '#ED1C24'];

function WhyPermissionedSlide() {
  const { t } = useTranslation('blockchain-platforms/section-3');
  const problems = t('why.problems', { returnObjects: true }) as { emoji: string; label: string; desc: string }[];
  const solutions = t('why.solutions', { returnObjects: true }) as { label: string; desc: string }[];
  const adopters = ['Walmart', 'Carrefour', 'IBM Food Trust', 'DL Freight (Walmart Canada)', 'EU EBSI', 'we.trade (2018–22)'];

  return (
    <div className="h-full flex flex-col p-6 lg:p-10">
      <div className="shrink-0 mb-5">
        <h2 className="text-2xl lg:text-3xl font-bold text-foreground">{t('why.heading')}</h2>
        <p className="text-sm text-muted-foreground mt-1">{t('why.subtitle')}</p>
      </div>

      <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left — problems */}
        <div className="flex flex-col gap-3">
          <h3 className="text-base font-bold text-foreground shrink-0">{t('why.problemsHeading')}</h3>
          {problems.map((item, i) => {
            const color = WHY_PROBLEM_COLORS[i];
            return (
            <motion.div
              key={item.label}
              initial={{ opacity: 0, x: -24 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1, duration: 0.35 }}
              className="flex items-start gap-3 p-3 rounded-xl border"
              style={{
                borderColor: color + '50',
                backgroundColor: color + '0d',
              }}
            >
              <span className="text-xl shrink-0">{item.emoji}</span>
              <div>
                <div className="font-bold text-sm text-foreground">{item.label}</div>
                <div className="text-xs text-muted-foreground">{item.desc}</div>
              </div>
            </motion.div>
          );})}
        </div>

        {/* Right — solutions */}
        <div className="flex flex-col gap-3">
          <h3 className="text-base font-bold text-foreground shrink-0">{t('why.solutionsHeading')}</h3>
          {solutions.map((item, i) => (
            <motion.div
              key={item.label}
              initial={{ opacity: 0, x: 24 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 + i * 0.1, duration: 0.35 }}
              className="flex items-start gap-3 p-3 rounded-xl border border-[#39B54A]/40 bg-[#39B54A]/08"
              style={{ backgroundColor: '#39B54A0d' }}
            >
              <div className="size-5 rounded-full bg-[#39B54A] flex items-center justify-center shrink-0 mt-0.5">
                <svg className="size-3 text-white" fill="none" viewBox="0 0 12 12">
                  <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <div>
                <div className="font-bold text-sm text-foreground">{item.label}</div>
                <div className="text-xs text-muted-foreground">{item.desc}</div>
              </div>
            </motion.div>
          ))}

          {/* Real-world adopters */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.4 }}
            className="mt-auto p-3 rounded-xl border border-border bg-card"
          >
            <div className="text-xs font-bold text-muted-foreground mb-2 uppercase tracking-wider">{t('why.adoptersLabel')}</div>
            <div className="flex flex-wrap gap-2">
              {adopters.map(name => (
                <span
                  key={name}
                  className="px-2 py-0.5 rounded-full text-xs font-medium border border-[#39B54A]/40 text-[#39B54A]"
                >
                  {name}
                </span>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
      <div className="shrink-0 mt-3 flex flex-col gap-2 lg:pr-20">
        <KeyPointBar text={t('why.keyPoint')} />
        <UnderTheHood items={t('why.hood', { returnObjects: true }) as string[]} />
      </div>
    </div>
  );
}

// ─── s3-tradeoffs ─────────────────────────────────────────────────────────────

interface TradeoffItem { emoji: string; label: string; desc: string; example: string; }

function TradeoffsSlide() {
  const { t } = useTranslation('blockchain-platforms/section-3');
  const gains = t('tradeoffs.gains', { returnObjects: true }) as TradeoffItem[];
  const losses = t('tradeoffs.losses', { returnObjects: true }) as TradeoffItem[];
  const hood = t('tradeoffs.hood', { returnObjects: true }) as string[];

  const column = (title: string, items: TradeoffItem[], color: string, sign: string) => (
    <div className="flex flex-col gap-2 min-h-0">
      <div className="shrink-0 flex items-center gap-2">
        <span className="size-6 rounded-full flex items-center justify-center text-white text-sm font-black" style={{ backgroundColor: color }}>{sign}</span>
        <h3 className="text-base font-bold text-foreground">{title}</h3>
      </div>
      <div className="flex-1 min-h-0 grid auto-rows-fr gap-2">
        {items.map((item, i) => (
          <motion.div
            key={item.label}
            initial={{ opacity: 0, x: sign === '+' ? -20 : 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.08, duration: 0.3 }}
            className="rounded-xl border p-3 flex items-start gap-3 min-h-0"
            style={{ borderColor: color + '50', backgroundColor: color + '0a' }}
          >
            <span className="text-xl shrink-0 leading-none mt-0.5">{item.emoji}</span>
            <div className="min-w-0">
              <div className="font-bold text-sm text-foreground leading-tight">{item.label}</div>
              <div className="text-xs text-muted-foreground leading-snug mt-0.5">{item.desc}</div>
              <div className="text-[11px] mt-1 leading-snug" style={{ color }}>
                <span className="font-bold uppercase tracking-wider text-[9px] mr-1">{t('tradeoffs.exampleLabel')}</span>{item.example}
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="h-full flex flex-col p-6 lg:p-10">
      <div className="shrink-0 mb-4">
        <h2 className="text-2xl lg:text-3xl font-bold text-foreground">{t('tradeoffs.heading')}</h2>
        <p className="text-sm text-muted-foreground mt-1">{t('tradeoffs.subtitle')}</p>
      </div>

      <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-2 gap-5">
        {column(t('tradeoffs.gainTitle'), gains, '#39B54A', '+')}
        {column(t('tradeoffs.loseTitle'), losses, '#ED1C24', '−')}
      </div>

      <div className="shrink-0 mt-3 flex flex-col gap-2 lg:pr-20">
        <KeyPointBar text={t('tradeoffs.keyPoint')} />
        <UnderTheHood items={hood} />
      </div>
    </div>
  );
}

// ─── s3-usecases ──────────────────────────────────────────────────────────────

interface UseCaseExample { name: string; status: string; note: string; }
interface UseCaseText { emoji: string; title: string; pain: string; change: string; examples: UseCaseExample[]; consortium: string; }

const USECASE_COLORS = ['#39B54A', '#6366f1', '#f59e0b'];

function statusColor(status: string) {
  if (status.startsWith('live')) return '#39B54A';
  if (status.startsWith('closed')) return '#ED1C24';
  return '#f59e0b';
}

function UseCasesSlide() {
  const { t } = useTranslation('blockchain-platforms/section-3');
  const cases = t('usecases.cases', { returnObjects: true }) as UseCaseText[];
  const hood = t('usecases.hood', { returnObjects: true }) as string[];

  return (
    <div className="h-full flex flex-col p-6 lg:p-10">
      <div className="shrink-0 mb-4">
        <h2 className="text-2xl lg:text-3xl font-bold text-foreground">{t('usecases.heading')}</h2>
        <p className="text-sm text-muted-foreground mt-1">{t('usecases.subtitle')}</p>
      </div>

      <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-3 gap-4">
        {cases.map((c, i) => {
          const color = USECASE_COLORS[i];
          return (
            <motion.div
              key={c.title}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1, duration: 0.3 }}
              className="rounded-2xl border-2 p-4 flex flex-col gap-3 min-h-0"
              style={{ borderColor: color + '55', backgroundColor: color + '08' }}
            >
              <div className="shrink-0 flex items-center gap-2.5">
                <span className="text-3xl leading-none">{c.emoji}</span>
                <div className="font-black text-base text-foreground leading-tight">{c.title}</div>
              </div>

              <div className="shrink-0">
                <div className="text-[9px] font-black uppercase tracking-widest text-[#ED1C24]">{t('usecases.painLabel')}</div>
                <p className="text-xs text-muted-foreground leading-snug mt-0.5">{c.pain}</p>
              </div>

              <div className="shrink-0">
                <div className="text-[9px] font-black uppercase tracking-widest" style={{ color }}>{t('usecases.changeLabel')}</div>
                <p className="text-xs text-foreground leading-snug mt-0.5">{c.change}</p>
              </div>

              <div className="flex-1 min-h-0 flex flex-col gap-1.5">
                <div className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">{t('usecases.examplesLabel')}</div>
                {c.examples.map(ex => (
                  <div key={ex.name} className="rounded-lg border bg-card/60 px-2.5 py-1.5" style={{ borderColor: color + '30' }}>
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-bold text-foreground">{ex.name}</span>
                      <span className="text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded-full shrink-0" style={{ color: statusColor(ex.status), backgroundColor: statusColor(ex.status) + '18' }}>{ex.status}</span>
                    </div>
                    <div className="text-[11px] text-muted-foreground leading-snug mt-0.5">{ex.note}</div>
                  </div>
                ))}
              </div>

              <div className="shrink-0 rounded-lg px-2.5 py-1.5 border-l-2" style={{ borderColor: color, backgroundColor: color + '12' }}>
                <div className="text-[9px] font-black uppercase tracking-widest" style={{ color }}>{t('usecases.consortiumLabel')}</div>
                <div className="text-[11px] text-muted-foreground leading-snug mt-0.5">{c.consortium}</div>
              </div>
            </motion.div>
          );
        })}
      </div>

      <div className="shrink-0 mt-3 flex flex-col gap-2 lg:pr-20">
        <KeyPointBar text={t('usecases.keyPoint')} />
        <UnderTheHood items={hood} />
      </div>
    </div>
  );
}

// ─── s3-supplychains ──────────────────────────────────────────────────────────

// Language-neutral: step icons only. Labels + ledger writes resolved via t().
const SUPPLY_STEP_ICONS = ['🌾', '🏭', '🚛', '🏪', '👤'];

function SupplyChainsSlide() {
  const { t } = useTranslation('blockchain-platforms/section-3');
  const stepText = t('supplychains.steps', { returnObjects: true }) as { label: string; preTool: string; preIssue: string }[];
  const writes = t('supplychains.writes', { returnObjects: true }) as string[];
  const steps = SUPPLY_STEP_ICONS.map((icon, i) => ({ icon, write: writes[i], ...stepText[i] }));
  const deployments = t('supplychains.deployments', { returnObjects: true }) as { label: string; detail: string }[];
  const results = t('supplychains.results', { returnObjects: true }) as { metric: string; label: string }[];

  return (
    <div className="h-full flex flex-col p-6 lg:p-10">
      <div className="shrink-0 mb-3">
        <h2 className="text-2xl lg:text-3xl font-bold text-foreground">{t('supplychains.heading')}</h2>
        <p className="text-sm text-muted-foreground mt-1">{t('supplychains.subtitle')}</p>
      </div>

      {/* Real-world deployments strip */}
      <div className="shrink-0 mb-4 grid grid-cols-1 lg:grid-cols-3 gap-2">
        {deployments.map(d => (
          <div key={d.label} className="px-3 py-1.5 rounded-lg border border-border bg-card">
            <div className="text-[11px] font-bold text-foreground leading-tight">{d.label}</div>
            <div className="text-[10px] text-muted-foreground leading-snug mt-0.5">{d.detail}</div>
          </div>
        ))}
      </div>

      <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-2 gap-5">

        {/* Left — siloed today */}
        <div className="flex flex-col gap-2 min-h-0">
          <div className="shrink-0 flex items-center gap-2 flex-wrap">
            <span
              className="text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full"
              style={{ backgroundColor: '#ED1C2418', color: '#ED1C24', border: '1px solid #ED1C2450' }}
            >
              {t('supplychains.siloedBadge')}
            </span>
            <span className="text-xs text-muted-foreground">{t('supplychains.siloedNote')}</span>
          </div>
          <div className="flex-1 min-h-0 grid auto-rows-fr gap-1.5">
            {steps.map((step) => (
              <div
                key={step.label}
                className="rounded-xl border p-2.5 flex items-start gap-2.5 min-h-0"
                style={{ borderColor: '#ED1C2430', backgroundColor: '#ED1C2408' }}
              >
                <span className="text-base shrink-0 leading-none mt-0.5">{step.icon}</span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-baseline justify-between gap-2 flex-wrap">
                    <span className="font-bold text-sm text-foreground">{step.label}</span>
                    <span className="text-[10px] font-mono text-muted-foreground truncate">{step.preTool}</span>
                  </div>
                  <div className="text-[11px] leading-snug mt-0.5" style={{ color: '#ED1C24' }}>{step.preIssue}</div>
                </div>
              </div>
            ))}
          </div>
          <div className="shrink-0 rounded-lg p-2.5 text-[11px] leading-snug" style={{ backgroundColor: '#ED1C2412', border: '1px solid #ED1C2440' }}>
            <span className="font-bold" style={{ color: '#ED1C24' }}>{t('supplychains.walmartCaseLabel')}</span>
            <span className="text-muted-foreground">{t('supplychains.walmartCaseBody')}</span>
          </div>
        </div>

        {/* Right — Fabric channel */}
        <div className="flex flex-col gap-2 min-h-0">
          <div className="shrink-0 flex items-center gap-2 flex-wrap">
            <span
              className="text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full"
              style={{ backgroundColor: '#39B54A18', color: '#39B54A', border: '1px solid #39B54A50' }}
            >
              {t('supplychains.fabricBadge')}
            </span>
            <span className="text-xs text-muted-foreground">{t('supplychains.fabricNote')}</span>
          </div>
          <div className="flex-1 min-h-0 grid auto-rows-fr gap-1.5">
            {steps.map((step) => (
              <div
                key={step.label}
                className="rounded-xl border p-2.5 flex items-start gap-2.5 min-h-0"
                style={{ borderColor: '#39B54A40', backgroundColor: '#39B54A08' }}
              >
                <span className="text-base shrink-0 leading-none mt-0.5">{step.icon}</span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-baseline justify-between gap-2 flex-wrap">
                    <span className="font-bold text-sm text-foreground">{step.label}</span>
                    <span className="text-[10px] font-medium" style={{ color: '#39B54A' }}>{t('supplychains.writeLabel')}</span>
                  </div>
                  <div className="text-[11px] leading-snug mt-0.5 text-foreground">{step.write}</div>
                </div>
              </div>
            ))}
          </div>
          <div className="shrink-0 grid grid-cols-3 gap-2">
            {results.map(r => (
              <div key={r.label} className="p-2 rounded-lg border text-center" style={{ borderColor: '#39B54A50', backgroundColor: '#39B54A0d' }}>
                <div className="font-black text-xs leading-tight" style={{ color: '#39B54A' }}>{r.metric}</div>
                <div className="text-[10px] text-muted-foreground mt-0.5 leading-snug">{r.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="shrink-0 mt-3 flex flex-col gap-2 lg:pr-20">
        <KeyPointBar text={t('supplychains.keyPoint')} />
        <UnderTheHood items={t('supplychains.hood', { returnObjects: true }) as string[]} />
      </div>
    </div>
  );
}

// ─── s3-overview ─────────────────────────────────────────────────────────────

function FabricOverviewVisual() {
  const { t } = useTranslation('blockchain-platforms/section-3');
  const cards = t('overview.cards', { returnObjects: true }) as { emoji: string; title: string; desc: string }[];
  return (
    <div className="grid grid-cols-2 gap-3 w-full">
      {cards.map(card => (
        <div
          key={card.title}
          className="p-3 rounded-xl border border-[#39B54A]/40 flex flex-col gap-1"
          style={{ backgroundColor: '#39B54A0d' }}
        >
          <span className="text-xl">{card.emoji}</span>
          <div className="font-bold text-sm text-foreground">{card.title}</div>
          <div className="text-xs text-muted-foreground">{card.desc}</div>
        </div>
      ))}
    </div>
  );
}

// ─── s3-how-agrees ───────────────────────────────────────────────────────────

const HOW_AGREES_COLORS = ['#f59e0b', '#6366f1', '#39B54A'];

interface MechanismText { emoji: string; label: string; one: string; business: string; }
interface CompareRow { platform: string; who: string; time: string; finality: string; }

function HowFabricAgreesSlide() {
  const { t } = useTranslation('blockchain-platforms/section-3');
  const mechanisms = t('howAgrees.mechanisms', { returnObjects: true }) as MechanismText[];
  const compareCols = t('howAgrees.compareCols', { returnObjects: true }) as string[];
  const compare = t('howAgrees.compare', { returnObjects: true }) as CompareRow[];
  const hood = t('howAgrees.hood', { returnObjects: true }) as string[];

  return (
    <div className="h-full flex flex-col p-6 lg:p-10">
      <div className="shrink-0 mb-4">
        <h2 className="text-2xl lg:text-3xl font-bold text-foreground">{t('howAgrees.heading')}</h2>
        <p className="text-sm text-muted-foreground mt-1">{t('howAgrees.subtitle')}</p>
      </div>

      <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-3 gap-4">
        {mechanisms.map((m, i) => {
          const color = HOW_AGREES_COLORS[i];
          return (
            <motion.div
              key={m.label}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1, duration: 0.3 }}
              className="rounded-2xl border-2 p-4 flex flex-col gap-3 min-h-0"
              style={{ borderColor: color + '55', backgroundColor: color + '08' }}
            >
              <div className="shrink-0 flex items-center gap-2.5">
                <span className="text-3xl leading-none">{m.emoji}</span>
                <div className="font-black text-base text-foreground leading-tight">{m.label}</div>
              </div>
              <div className="flex-1 min-h-0">
                <div className="text-[9px] font-black uppercase tracking-widest" style={{ color }}>{t('howAgrees.oneLineLabel')}</div>
                <p className="text-sm lg:text-base text-foreground leading-snug mt-1">{m.one}</p>
              </div>
              <div className="shrink-0 rounded-lg px-2.5 py-2 border-l-2" style={{ borderColor: color, backgroundColor: color + '12' }}>
                <div className="text-[9px] font-black uppercase tracking-widest" style={{ color }}>{t('howAgrees.businessLabel')}</div>
                <div className="text-xs lg:text-sm text-muted-foreground leading-snug mt-0.5">{m.business}</div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Bitcoin vs Fabric at a glance + which ordering to pick */}
      <div className="shrink-0 mt-3 grid grid-cols-1 lg:grid-cols-2 gap-3">
        <div className="rounded-xl border border-border bg-card/50 p-3">
          <div className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-2">{t('howAgrees.compareLabel')}</div>
          <div className="grid grid-cols-[auto_1.3fr_1fr_1.2fr] gap-x-3 gap-y-1.5 text-[11px] items-start">
            <div />
            {compareCols.map((c) => (
              <div key={c} className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">{c}</div>
            ))}
            {compare.map((row, i) => {
              const color = i === 0 ? '#f7931a' : '#39B54A';
              return (
                <Fragment key={row.platform}>
                  <div className="font-black" style={{ color }}>{row.platform}</div>
                  <div className="text-muted-foreground leading-snug">{row.who}</div>
                  <div className="text-foreground font-semibold leading-snug">{row.time}</div>
                  <div className="text-muted-foreground leading-snug">{row.finality}</div>
                </Fragment>
              );
            })}
          </div>
        </div>
        <div className="rounded-xl border p-3 flex flex-col gap-1.5" style={{ borderColor: '#6366f155', backgroundColor: '#6366f10d' }}>
          <div className="text-[10px] font-black uppercase tracking-widest" style={{ color: '#6366f1' }}>{t('howAgrees.chooseLabel')}</div>
          <p className="text-[11px] text-muted-foreground leading-snug">
            <span className="font-bold" style={{ color: '#6366f1' }}>{t('howAgrees.chooseRaft.term')}</span>{t('howAgrees.chooseRaft.body')}
          </p>
          <p className="text-[11px] text-muted-foreground leading-snug">
            <span className="font-bold" style={{ color: '#39B54A' }}>{t('howAgrees.chooseBft.term')}</span>{t('howAgrees.chooseBft.body')}
          </p>
        </div>
      </div>

      <div className="shrink-0 mt-3 flex flex-col gap-2 lg:pr-20">
        <KeyPointBar text={t('howAgrees.keyPoint')} />
        <UnderTheHood items={hood} />
      </div>
    </div>
  );
}

// ─── s3-channels ─────────────────────────────────────────────────────────────

// Language-neutral: icons, colors, membership ids. Labels/data/why resolved via t().
const CHANNEL_ORG_STYLE = [
  { id: 'pharmaA', icon: '🔵', color: '#6366f1' },
  { id: 'pharmaB', icon: '🟢', color: '#39B54A' },
  { id: 'hospital', icon: '🏥', color: '#ED1C24' },
  { id: 'regulator', icon: '⚖️', color: '#f59e0b' },
];

const CHANNELS_DEF_STYLE = [
  { id: 'ch1', color: '#6366f1', members: ['pharmaA', 'pharmaB'] },
  { id: 'ch2', color: '#ED1C24', members: ['pharmaA', 'hospital'] },
  { id: 'ch3', color: '#f59e0b', members: ['pharmaA', 'pharmaB', 'hospital', 'regulator'] },
];

function ChannelsSlide() {
  const { t } = useTranslation('blockchain-platforms/section-3');
  const orgText = t('channels.orgs', { returnObjects: true }) as { id: string; label: string }[];
  const CHANNEL_ORGS = CHANNEL_ORG_STYLE.map((s) => ({ ...s, label: orgText.find(o => o.id === s.id)?.label ?? s.id }));
  const channelText = t('channels.channels', { returnObjects: true }) as { id: string; label: string; data: string; why: string }[];
  const CHANNELS_DEF = CHANNELS_DEF_STYLE.map((s) => ({ ...s, ...(channelText.find(c => c.id === s.id) ?? { label: s.id, data: '', why: '' }) }));

  const [activeChannel, setActiveChannel] = useState<string | null>(null);
  const active = CHANNELS_DEF.find(c => c.id === activeChannel);

  return (
    <div className="h-full flex flex-col p-6 lg:p-10">
      <div className="shrink-0 mb-4">
        <h2 className="text-2xl lg:text-3xl font-bold text-foreground">{t('channels.heading')}</h2>
        <p className="text-sm text-muted-foreground mt-1">
          {t('channels.subtitle')}
        </p>
        <UnderTheHood items={t('channels.hood', { returnObjects: true }) as string[]} className="mt-2" />
      </div>

      <div className="flex-1 min-h-0 flex flex-col gap-4">
        {/* Companies row */}
        <div className="shrink-0 flex gap-3 justify-center">
          {CHANNEL_ORGS.map(org => (
            <div
              key={org.id}
              className="flex items-center gap-2 px-4 py-2 rounded-xl border-2 font-bold text-sm"
              style={{ borderColor: org.color, backgroundColor: org.color + '15', color: org.color }}
            >
              <span>{org.icon}</span> {org.label}
            </div>
          ))}
        </div>

        {/* Channels + detail */}
        <div className="flex-1 min-h-0 flex gap-4">
          {/* Channels column */}
          <div className="flex flex-col gap-3 w-56 shrink-0">
            {CHANNELS_DEF.map(ch => (
              <button
                key={ch.id}
                onClick={() => setActiveChannel(activeChannel === ch.id ? null : ch.id)}
                className="flex-1 flex flex-col gap-2 p-4 rounded-xl border-2 border-dashed text-left cursor-pointer transition-all"
                style={{
                  borderColor: activeChannel === ch.id ? ch.color : ch.color + '50',
                  backgroundColor: activeChannel === ch.id ? ch.color + '14' : ch.color + '06',
                }}
              >
                <div className="font-bold text-sm" style={{ color: ch.color }}>{ch.label}</div>
                <div className="flex flex-wrap gap-1">
                  {CHANNEL_ORGS.map(org => (
                    <span
                      key={org.id}
                      className="px-2 py-0.5 rounded-full text-xs border font-medium transition-all"
                      style={
                        ch.members.includes(org.id)
                          ? { borderColor: org.color + '80', color: org.color, backgroundColor: org.color + '12' }
                          : { borderColor: 'var(--border)', color: 'var(--muted-foreground)', opacity: 0.35 }
                      }
                    >
                      {org.label}
                    </span>
                  ))}
                </div>
                <div className="text-xs text-muted-foreground">{ch.data}</div>
              </button>
            ))}
          </div>

          {/* Detail / visual panel */}
          <div className="flex-1 min-w-0 rounded-xl border border-border bg-card/50 p-5 flex flex-col">
            {active ? (
              <motion.div
                key={active.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col gap-4 h-full"
              >
                <div className="font-bold text-lg" style={{ color: active.color }}>
                  {t('channels.channelPrefix')}{active.label}
                </div>

                {/* Who sees what visual */}
                <div className="flex-1 flex flex-col gap-3">
                  <div className="text-xs font-bold text-muted-foreground uppercase tracking-wider">{t('channels.visibilityHeading')}</div>
                  <div className="flex flex-col gap-2">
                    {CHANNEL_ORGS.map(org => {
                      const canSee = active.members.includes(org.id);
                      return (
                        <div
                          key={org.id}
                          className="flex items-center gap-3 p-3 rounded-xl border"
                          style={{
                            borderColor: canSee ? org.color + '60' : 'var(--border)',
                            backgroundColor: canSee ? org.color + '0a' : 'transparent',
                          }}
                        >
                          <span className="text-lg">{org.icon}</span>
                          <span className="font-semibold text-sm text-foreground flex-1">{org.label}</span>
                          <span
                            className="text-xs font-bold px-2 py-0.5 rounded-full"
                            style={
                              canSee
                                ? { backgroundColor: org.color + '20', color: org.color }
                                : { backgroundColor: 'var(--muted)', color: 'var(--muted-foreground)' }
                            }
                          >
                            {canSee ? t('channels.canRead') : t('channels.noAccess')}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                  <div
                    className="mt-auto p-3 rounded-xl border text-xs text-muted-foreground"
                    style={{ borderColor: active.color + '40', backgroundColor: active.color + '08' }}
                  >
                    <span className="font-semibold" style={{ color: active.color }}>{t('channels.whyPrefix')}</span>
                    {active.why}
                  </div>
                </div>
              </motion.div>
            ) : (
              <div className="h-full flex items-center justify-center text-muted-foreground text-sm">
                {t('channels.emptyHint')}
              </div>
            )}
          </div>
        </div>
      </div>
      <KeyPointBar text={t('channels.keyPoint')} className="shrink-0 mt-3 lg:mr-20" />
    </div>
  );
}

// ─── s3-txflow ────────────────────────────────────────────────────────────────

// Language-neutral: emoji/colour per stage. label/who/what/analogy resolved via t().
const TX_STAGE_STYLE = [
  { emoji: '📝', color: '#6366f1' },
  { emoji: '✍️', color: '#39B54A' },
  { emoji: '📮', color: '#f59e0b' },
  { emoji: '✅', color: '#ED1C24' },
  { emoji: '📢', color: '#22d3ee' },
];

interface TxStageText { label: string; who: string; what: string; analogy: string; why: string; }

function TxFlowSlide() {
  const { t } = useTranslation('blockchain-platforms/section-3');
  const stageText = t('txflow.stages', { returnObjects: true }) as TxStageText[];
  const stages = TX_STAGE_STYLE.map((s, i) => ({ ...s, ...stageText[i] }));
  const [active, setActive] = useState(0);
  const stage = stages[active];
  const isLast = active === stages.length - 1;
  const trackPos = (i: number) => `${(i / (stages.length - 1)) * 100}%`;

  return (
    <div className="h-full flex flex-col p-6 lg:p-10">
      <div className="shrink-0 mb-4">
        <h2 className="text-2xl lg:text-3xl font-bold text-foreground">{t('txflow.heading')}</h2>
        <p className="text-sm text-muted-foreground mt-1">{t('txflow.subtitle')}</p>
      </div>

      {/* Horizontal track */}
      <div className="shrink-0 rounded-2xl border border-border bg-card/50 px-8 pt-6 pb-4 mb-4">
        <div className="relative h-1.5 rounded-full bg-border mx-6">
          <motion.div
            className="absolute left-0 top-0 h-full rounded-full"
            style={{ background: 'linear-gradient(90deg, #6366f1, #39B54A, #f59e0b, #ED1C24, #22d3ee)' }}
            initial={false}
            animate={{ width: trackPos(active) }}
            transition={{ duration: 0.4, ease: 'easeInOut' }}
          />
          <motion.div
            className="absolute top-1/2 size-5 rounded-full border-2 border-background shadow-lg -translate-y-1/2 -translate-x-1/2 z-10"
            style={{ backgroundColor: stage.color }}
            initial={false}
            animate={{ left: trackPos(active) }}
            transition={{ duration: 0.4, ease: 'easeInOut' }}
          />
          {stages.map((st, i) => (
            <button
              key={st.label}
              type="button"
              onClick={() => setActive(i)}
              className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 flex flex-col items-center gap-2 cursor-pointer group"
              style={{ left: trackPos(i) }}
            >
              <span
                className="size-10 rounded-full border-2 flex items-center justify-center text-lg transition-all bg-card"
                style={{
                  borderColor: i <= active ? st.color : 'var(--border)',
                  backgroundColor: i === active ? st.color + '20' : undefined,
                  opacity: i <= active ? 1 : 0.55,
                  transform: i === active ? 'scale(1.15)' : undefined,
                }}
              >
                {st.emoji}
              </span>
              <span className="text-[11px] font-bold whitespace-nowrap" style={{ color: i === active ? st.color : 'var(--muted-foreground)' }}>
                {i + 1}. {st.label}
              </span>
            </button>
          ))}
        </div>
        <div className="h-12" />
      </div>

      <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Active stage detail */}
        <motion.div
          key={stage.label}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
          className="lg:col-span-2 rounded-2xl border-2 p-5 flex flex-col gap-4"
          style={{ borderColor: stage.color + '60', backgroundColor: stage.color + '0a' }}
        >
          <div className="flex items-center gap-3">
            <span className="text-4xl leading-none">{stage.emoji}</span>
            <h3 className="text-xl font-black text-foreground">{active + 1}. {stage.label}</h3>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 flex-1">
            <div>
              <div className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">{t('txflow.whoLabel')}</div>
              <p className="text-sm font-semibold text-foreground mt-1">{stage.who}</p>
              <div className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mt-4">{t('txflow.whatLabel')}</div>
              <p className="text-sm text-muted-foreground mt-1 leading-relaxed">{stage.what}</p>
            </div>
            <div className="flex flex-col gap-3">
              <div className="rounded-xl border p-4 bg-card" style={{ borderColor: stage.color + '40' }}>
                <div className="text-[10px] font-black uppercase tracking-widest" style={{ color: stage.color }}>{t('txflow.analogyLabel')}</div>
                <p className="text-sm text-foreground mt-2 leading-relaxed italic">“{stage.analogy}”</p>
              </div>
              <div className="rounded-xl border p-4 flex-1" style={{ borderColor: stage.color + '40', backgroundColor: stage.color + '10' }}>
                <div className="text-[10px] font-black uppercase tracking-widest" style={{ color: stage.color }}>{t('txflow.whyLabel')}</div>
                <p className="text-sm text-foreground mt-2 leading-relaxed">{stage.why}</p>
              </div>
            </div>
          </div>
          <div className="flex gap-2 shrink-0">
            <button
              type="button"
              onClick={() => setActive(isLast ? 0 : active + 1)}
              className="px-4 py-2 rounded-xl text-sm font-bold text-white cursor-pointer"
              style={{ backgroundColor: stage.color }}
            >
              {isLast ? t('txflow.restart') : t('txflow.next')}
            </button>
          </div>
        </motion.div>

        {/* Side notes */}
        <div className="flex flex-col gap-3 min-h-0">
          <div className="p-4 rounded-xl border border-[#39B54A]/40" style={{ backgroundColor: '#39B54A0d' }}>
            <div className="font-bold text-sm text-foreground mb-1">{t('txflow.policyTitle')}</div>
            <div className="text-xs text-muted-foreground leading-relaxed">{t('txflow.policyBody')}</div>
          </div>
          <div className="p-4 rounded-xl border border-border bg-card">
            <div className="font-bold text-sm text-foreground mb-1">{t('txflow.eovTitle')}</div>
            <div className="text-xs text-muted-foreground leading-relaxed">
              {t('txflow.eovBodyA')}<strong>{t('txflow.eovBefore')}</strong>{t('txflow.eovBodyB')}
            </div>
          </div>
          <UnderTheHood items={t('txflow.hood', { returnObjects: true }) as string[]} className="mt-auto" />
        </div>
      </div>
      <KeyPointBar text={t('txflow.keyPoint')} className="shrink-0 mt-3 lg:mr-20" />
    </div>
  );
}

// ─── s3-exercise-supply ───────────────────────────────────────────────────────

// Language-neutral: id + correct answer. label/context/reason resolved via t().
const SUPPLY_EVENT_ANSWERS = [
  { id: 1, answer: true },
  { id: 2, answer: false },
  { id: 3, answer: true },
  { id: 4, answer: true },
  { id: 5, answer: false },
  { id: 6, answer: true },
  { id: 7, answer: false },
  { id: 8, answer: true },
];

function SupplyChainExercise() {
  const { t } = useTranslation('blockchain-platforms/section-3');
  const eventText = t('exerciseSupply.events', { returnObjects: true }) as { label: string; context: string; reason: string }[];
  const SUPPLY_EVENTS = SUPPLY_EVENT_ANSWERS.map((e, i) => ({ ...e, ...eventText[i] }));

  const [answers, setAnswers] = useState<Record<number, boolean | null>>({});
  const [revealed, setRevealed] = useState<Record<number, boolean>>({});
  const allAnswered = SUPPLY_EVENTS.every(e => answers[e.id] !== undefined);

  function toggle(id: number, val: boolean) {
    if (revealed[id]) return;
    setAnswers(prev => ({ ...prev, [id]: val }));
  }

  function reveal(id: number) {
    setRevealed(prev => ({ ...prev, [id]: true }));
  }

  const score = allAnswered
    ? SUPPLY_EVENTS.filter(e => answers[e.id] === e.answer).length
    : null;

  return (
    <div className="h-full flex flex-col p-6 lg:p-10">
      <div className="shrink-0 mb-4">
        <h2 className="text-2xl lg:text-3xl font-bold text-foreground">{t('exerciseSupply.heading')}</h2>
        <p className="text-sm text-muted-foreground mt-1">
          {t('exerciseSupply.subtitle')}
        </p>
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto grid grid-cols-1 lg:grid-cols-2 gap-3 content-start">
        {SUPPLY_EVENTS.map(ev => {
          const chosen = answers[ev.id];
          const isRevealed = revealed[ev.id];
          const correct = ev.answer;
          const isRight = chosen === correct;

          return (
            <div
              key={ev.id}
              className="flex flex-col gap-2 p-3 rounded-xl border transition-all"
              style={{
                borderColor: isRevealed
                  ? (isRight ? '#39B54A60' : '#ED1C2460')
                  : 'var(--border)',
                backgroundColor: isRevealed
                  ? (isRight ? '#39B54A0a' : '#ED1C240a')
                  : 'var(--card)',
              }}
            >
              <div className="text-sm font-semibold text-foreground">{ev.label}</div>
              <div className="text-xs text-muted-foreground">{ev.context}</div>
              <div className="flex gap-2 items-center">
                {[true, false].map(val => (
                  <button
                    key={String(val)}
                    onClick={() => toggle(ev.id, val)}
                    className="flex-1 py-1.5 rounded-lg border text-xs font-bold transition-all cursor-pointer"
                    style={{
                      borderColor: chosen === val ? (val ? '#39B54A' : '#ED1C24') : 'var(--border)',
                      backgroundColor: chosen === val ? (val ? '#39B54A18' : '#ED1C2418') : 'transparent',
                      color: chosen === val ? (val ? '#39B54A' : '#ED1C24') : 'var(--muted-foreground)',
                    }}
                  >
                    {val ? t('exerciseSupply.onChain') : t('exerciseSupply.offChain')}
                  </button>
                ))}
                {chosen !== undefined && !isRevealed && (
                  <button
                    onClick={() => reveal(ev.id)}
                    className="px-3 py-1.5 rounded-lg border border-border text-xs font-medium text-muted-foreground hover:bg-card transition-all cursor-pointer"
                  >
                    {t('exerciseSupply.why')}
                  </button>
                )}
              </div>
              {isRevealed && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="text-xs rounded-lg p-2 font-medium"
                  style={{
                    backgroundColor: isRight ? '#39B54A0d' : '#ED1C240d',
                    color: isRight ? '#39B54A' : '#ED1C24',
                  }}
                >
                  {isRight ? t('exerciseSupply.correctPrefix') : t('exerciseSupply.incorrectPrefix')}{ev.reason}
                </motion.div>
              )}
            </div>
          );
        })}
      </div>

      {allAnswered && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="shrink-0 mt-3 p-3 rounded-xl border border-[#39B54A]/40 text-center"
          style={{ backgroundColor: '#39B54A0d' }}
        >
          <span className="font-bold text-[#39B54A]">
            {t('exerciseSupply.scorePrefix')}{score}/{SUPPLY_EVENTS.length}
            {score === SUPPLY_EVENTS.length ? t('exerciseSupply.scorePerfect') : score! >= 6 ? t('exerciseSupply.scoreGreat') : t('exerciseSupply.scoreReview')}
          </span>
        </motion.div>
      )}
      <KeyPointBar text={t('exerciseSupply.keyPoint')} className="shrink-0 mt-3 lg:mr-20" />
    </div>
  );
}

// ─── s3-exercise-health ───────────────────────────────────────────────────────

// Language-neutral: id/icon/color. label/members/desc resolved via t().
const HEALTH_CHANNEL_STYLE = [
  { id: 'clinical', icon: '🏥', color: '#6366f1' },
  { id: 'billing', icon: '💳', color: '#39B54A' },
  { id: 'compliance', icon: '📋', color: '#f59e0b' },
];

// Language-neutral: id/correct/icon. label resolved via t().
const HEALTH_ITEM_DATA = [
  { id: 1, correct: 'clinical', icon: '🩺' },
  { id: 2, correct: 'billing', icon: '📄' },
  { id: 3, correct: 'clinical', icon: '💊' },
  { id: 4, correct: 'compliance', icon: '🔍' },
  { id: 5, correct: 'billing', icon: '💰' },
  { id: 6, correct: 'compliance', icon: '📊' },
];

function HealthDataExercise() {
  const { t } = useTranslation('blockchain-platforms/section-3');
  const channelText = t('exerciseHealth.channels', { returnObjects: true }) as { id: string; label: string; members: string; desc: string }[];
  const HEALTH_CHANNELS = HEALTH_CHANNEL_STYLE.map((s) => ({ ...s, ...(channelText.find(c => c.id === s.id) ?? { label: s.id, members: '', desc: '' }) }));
  const itemText = t('exerciseHealth.items', { returnObjects: true }) as { label: string }[];
  const HEALTH_ITEMS = HEALTH_ITEM_DATA.map((it, i) => ({ ...it, label: itemText[i].label }));

  const [selected, setSelected] = useState<number | null>(null);
  const [placed, setPlaced] = useState<Record<number, string>>({});
  const [checked, setChecked] = useState(false);
  const allPlaced = HEALTH_ITEMS.every(it => placed[it.id]);

  function handleItemClick(id: number) {
    if (checked) return;
    setSelected(prev => (prev === id ? null : id));
  }

  function handleChannelClick(channelId: string) {
    if (checked || selected === null) return;
    setPlaced(prev => ({ ...prev, [selected]: channelId }));
    setSelected(null);
  }

  const score = checked
    ? HEALTH_ITEMS.filter(it => placed[it.id] === it.correct).length
    : null;

  return (
    <div className="h-full flex flex-col p-6 lg:p-10">
      <div className="shrink-0 mb-4">
        <h2 className="text-2xl lg:text-3xl font-bold text-foreground">{t('exerciseHealth.heading')}</h2>
        <p className="text-sm text-muted-foreground mt-1">
          {t('exerciseHealth.subtitle')}
          <span className="ml-2 font-medium text-foreground">{t('exerciseHealth.subtitleHint')}</span>
        </p>
      </div>

      <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Left — data items */}
        <div className="flex flex-col gap-2">
          <div className="text-xs font-bold text-muted-foreground uppercase tracking-wider shrink-0">{t('exerciseHealth.dataTypesLabel')}</div>
          <div className="flex flex-col gap-2 flex-1 min-h-0 overflow-y-auto">
            {HEALTH_ITEMS.map(item => {
              const ch = HEALTH_CHANNELS.find(c => c.id === placed[item.id]);
              const isRight = checked && placed[item.id] === item.correct;
              const isWrong = checked && placed[item.id] !== undefined && placed[item.id] !== item.correct;
              return (
                <button
                  key={item.id}
                  onClick={() => handleItemClick(item.id)}
                  className="flex items-center gap-3 p-3 rounded-xl border text-left transition-all cursor-pointer"
                  style={{
                    borderColor: selected === item.id
                      ? '#6366f1'
                      : isRight
                        ? '#39B54A60'
                        : isWrong
                          ? '#ED1C2460'
                          : ch
                            ? ch.color + '60'
                            : 'var(--border)',
                    backgroundColor: selected === item.id
                      ? '#6366f118'
                      : isRight
                        ? '#39B54A0a'
                        : isWrong
                          ? '#ED1C240a'
                          : ch
                            ? ch.color + '0a'
                            : 'var(--card)',
                  }}
                >
                  <span className="text-lg shrink-0">{item.icon}</span>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-foreground">{item.label}</div>
                    {ch && !checked && (
                      <div className="text-xs mt-0.5" style={{ color: ch.color }}>→ {ch.label}</div>
                    )}
                    {checked && (
                      <div
                        className="text-xs mt-0.5 font-semibold"
                        style={{ color: isRight ? '#39B54A' : '#ED1C24' }}
                      >
                        {isRight ? t('exerciseHealth.correct') : `${t('exerciseHealth.shouldBePrefix')}${HEALTH_CHANNELS.find(c => c.id === item.correct)?.label}`}
                      </div>
                    )}
                  </div>
                  {selected === item.id && (
                    <span className="text-xs text-[#6366f1] font-bold shrink-0">{t('exerciseHealth.selected')}</span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Right — channels */}
        <div className="flex flex-col gap-3">
          <div className="text-xs font-bold text-muted-foreground uppercase tracking-wider shrink-0">{t('exerciseHealth.channelsLabel')}</div>
          {HEALTH_CHANNELS.map(ch => {
            const itemsHere = HEALTH_ITEMS.filter(it => placed[it.id] === ch.id);
            return (
              <button
                key={ch.id}
                onClick={() => handleChannelClick(ch.id)}
                className="flex-1 flex flex-col gap-2 p-3 rounded-xl border-2 border-dashed text-left transition-all cursor-pointer"
                style={{
                  borderColor: selected !== null ? ch.color : ch.color + '60',
                  backgroundColor: selected !== null ? ch.color + '0d' : ch.color + '05',
                }}
              >
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-lg">{ch.icon}</span>
                  <div>
                    <div className="font-bold text-sm" style={{ color: ch.color }}>{ch.label}</div>
                    <div className="text-xs text-muted-foreground">{ch.members}</div>
                  </div>
                </div>
                <div className="text-xs text-muted-foreground">{ch.desc}</div>
                {itemsHere.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-1">
                    {itemsHere.map(it => (
                      <span
                        key={it.id}
                        className="px-2 py-0.5 rounded-full text-xs border font-medium"
                        style={{ borderColor: ch.color + '60', color: ch.color, backgroundColor: ch.color + '10' }}
                      >
                        {it.icon} {it.label}
                      </span>
                    ))}
                  </div>
                )}
                {selected !== null && itemsHere.length === 0 && (
                  <div className="text-xs text-muted-foreground italic">{t('exerciseHealth.dropHere')}</div>
                )}
              </button>
            );
          })}

          {allPlaced && !checked && (
            <button
              onClick={() => setChecked(true)}
              className="shrink-0 py-2 px-4 rounded-xl border-2 font-bold text-sm cursor-pointer transition-all"
              style={{ borderColor: '#39B54A', backgroundColor: '#39B54A18', color: '#39B54A' }}
            >
              {t('exerciseHealth.checkAnswers')}
            </button>
          )}
          {checked && (
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              className="shrink-0 p-3 rounded-xl border border-[#39B54A]/40 text-center"
              style={{ backgroundColor: '#39B54A0d' }}
            >
              <span className="font-bold text-[#39B54A]">
                {t('exerciseHealth.scorePrefix')}{score}/{HEALTH_ITEMS.length}
                {score === HEALTH_ITEMS.length ? t('exerciseHealth.scorePerfect') : score! >= 4 ? t('exerciseHealth.scoreGreat') : t('exerciseHealth.scoreReview')}
              </span>
            </motion.div>
          )}
        </div>
      </div>
      <KeyPointBar text={t('exerciseHealth.keyPoint')} className="shrink-0 mt-3 lg:mr-20" />
    </div>
  );
}

// ─── BP_Section3 ──────────────────────────────────────────────────────────────

export function BP_Section3() {
  const { t } = useTranslation('blockchain-platforms/section-3');

  const chapters = useMemo(
    () => chapterShape.map((c) =>
      'kind' in c
        ? { kind: 'group' as const, id: c.id, label: t(`groups.${c.id}`) }
        : { id: c.id, label: t(`chapters.${c.id}`) }
    ),
    [t]
  );

  const overviewKeyPoints = t('overview.keyPoints', { returnObjects: true }) as string[];
  const comparisonItems = t('comparison.items', { returnObjects: true }) as { feature: string; option1: string; option2: string }[];
  const productionCases = t('production.cases', { returnObjects: true }) as {
    statusLabel: string; name: string; sub: string; members: string; flow: string; outcome: string; lesson: string;
  }[];
  const productionColors = ['#39B54A', '#ED1C24', '#6366f1'];
  const productionCaseList = productionCases.map((c, i) => ({ ...c, statusColor: productionColors[i] }));
  const bestfitCases = t('bestfits.cases', { returnObjects: true }) as { emoji: string; name: string; why: string; example: string }[];
  const worstfitCases = t('worstfits.cases', { returnObjects: true }) as { emoji: string; name: string; why: string; alt: string }[];
  const vocabRows = t('vocab.rows', { returnObjects: true }) as { pub: string; fab: string; note: string }[];
  const quizOptions = t('quiz.options', { returnObjects: true }) as { text: string }[];
  const quiz2Options = t('quiz2.options', { returnObjects: true }) as { text: string }[];
  const quiz3Options = t('quiz3.options', { returnObjects: true }) as { text: string }[];
  const takeawayItems = t('takeaways.items', { returnObjects: true }) as string[];

  // Correct-answer flags stay in code (language-neutral); text comes from t().
  const quizCorrect = [false, true, false, false];
  const quiz2Correct = [false, true, false, false];
  const quiz3Correct = [false, true, false, false];

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
            icon={<Building2 className="size-20 text-[#39B54A]" />}
            gradient="from-[#39B54A] to-[#22d3ee]"
          />
        </div>

        {/* ═══════ WHY PERMISSIONED ═══════ */}
        <div id="s3-why" className="h-full">
          <WhyPermissionedSlide />
        </div>

        {/* ═══════ PUBLIC VS PERMISSIONED TRADE-OFFS ═══════ */}
        <div id="s3-tradeoffs" className="h-full">
          <TradeoffsSlide />
        </div>

        {/* ═══════ ENTERPRISE USE CASES ═══════ */}
        <div id="s3-usecases" className="h-full">
          <UseCasesSlide />
        </div>

        {/* ═══════ SUPPLY CHAINS ═══════ */}
        <div id="s3-supplychains" className="h-full">
          <SupplyChainsSlide />
        </div>

        {/* ═══════ FABRIC OVERVIEW ═══════ */}
        <div id="s3-overview" className="h-full flex flex-col">
          <div className="flex-1 min-h-0 overflow-hidden">
            <ConceptSlide
              title={t('overview.title')}
              description={t('overview.description')}
              visual={<FabricOverviewVisual />}
              keyPoints={overviewKeyPoints}
            />
          </div>
          <KeyPointBar text={t('overview.keyPoint')} className="shrink-0 mx-5 mb-5 lg:ml-10 lg:mr-30 lg:mb-8" />
        </div>

        {/* ═══════ UNDER THE HOOD — HOW FABRIC AGREES ═══════ */}
        <div id="s3-how-agrees" className="h-full">
          <HowFabricAgreesSlide />
        </div>

        {/* ═══════ CHANNELS ═══════ */}
        <div id="s3-channels" className="h-full">
          <ChannelsSlide />
        </div>

        {/* ═══════ TX FLOW ═══════ */}
        <div id="s3-txflow" className="h-full">
          <TxFlowSlide />
        </div>

        {/* ═══════ EXERCISE: SUPPLY CHAIN ═══════ */}
        <div id="s3-exercise-supply" className="h-full">
          <SupplyChainExercise />
        </div>

        {/* ═══════ EXERCISE: HEALTH DATA ═══════ */}
        <div id="s3-exercise-health" className="h-full">
          <HealthDataExercise />
        </div>

        {/* ═══════ PRODUCTION — Fabric in the wild ═══════ */}
        <div id="s3-production" className="h-full flex flex-col p-6 lg:p-10">
          <div className="shrink-0 mb-3">
            <h2 className="text-2xl lg:text-3xl font-bold text-foreground">{t('production.heading')}</h2>
            <p className="text-sm text-muted-foreground mt-1">{t('production.subtitle')}</p>
          </div>

          <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-3 gap-3">
            {productionCaseList.map(p => (
              <motion.div
                key={p.name}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="flex flex-col gap-2 p-3 rounded-xl border-2 min-h-0"
                style={{ borderColor: p.statusColor + '55', backgroundColor: p.statusColor + '0a' }}
              >
                <div className="shrink-0">
                  <span
                    className="text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full"
                    style={{ backgroundColor: p.statusColor + '18', color: p.statusColor, border: `1px solid ${p.statusColor}40` }}
                  >
                    {p.statusLabel}
                  </span>
                </div>

                <div className="shrink-0">
                  <div className="font-black text-base text-foreground leading-tight">{p.name}</div>
                  <div className="text-[11px] text-muted-foreground leading-snug">{p.sub}</div>
                </div>

                <div className="shrink-0 rounded-lg border bg-card/50 px-2 py-1.5" style={{ borderColor: p.statusColor + '30' }}>
                  <div className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground">{t('production.consortiumLabel')}</div>
                  <div className="text-[10px] text-foreground leading-snug mt-0.5">{p.members}</div>
                </div>

                <div className="shrink-0 rounded-lg border bg-card/50 px-2 py-1.5" style={{ borderColor: p.statusColor + '30' }}>
                  <div className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground">{t('production.dataFlowLabel')}</div>
                  <div className="text-[10px] text-muted-foreground leading-snug mt-0.5">{p.flow}</div>
                </div>

                <div className="rounded-lg border bg-card/50 px-2 py-1.5 flex-1 min-h-0" style={{ borderColor: p.statusColor + '30' }}>
                  <div className="text-[9px] font-bold uppercase tracking-wider" style={{ color: p.statusColor }}>{t('production.outcomeLabel')}</div>
                  <div className="text-[10px] text-muted-foreground leading-snug mt-0.5">{p.outcome}</div>
                </div>

                <div className="shrink-0 rounded-lg p-2 border-l-2" style={{ borderColor: p.statusColor, backgroundColor: p.statusColor + '12' }}>
                  <div className="text-[9px] font-black uppercase tracking-widest" style={{ color: p.statusColor }}>{t('production.lessonLabel')}</div>
                  <div className="text-[10px] text-muted-foreground leading-snug mt-0.5">{p.lesson}</div>
                </div>
              </motion.div>
            ))}
          </div>

          <KeyPointBar text={t('production.keyPoint')} className="shrink-0 mt-3 lg:mr-20" />
        </div>

        {/* ═══════ COMPARISON ═══════ */}
        <div id="s3-comparison" className="h-full flex flex-col">
          <div className="flex-1 min-h-0">
            <ComparisonSlide
              title={t('comparison.title')}
              featureLabel={t('comparison.featureLabel')}
              option1Label={t('comparison.option1Label')}
              option2Label={t('comparison.option2Label')}
              items={comparisonItems}
            />
          </div>
          <KeyPointBar text={t('comparison.keyPoint')} className="shrink-0 mx-5 mb-5 lg:ml-8 lg:mr-28 lg:mb-8" />
        </div>

        {/* ═══════ BEST FITS — WHERE FABRIC WINS ═══════ */}
        <div id="s3-bestfits" className="h-full flex flex-col p-5 lg:p-8">
          <div className="shrink-0 mb-3">
            <h2 className="text-2xl lg:text-3xl font-bold text-foreground mt-1">{t('bestfits.heading')}</h2>
            <p className="text-sm text-muted-foreground max-w-3xl">
              {t('bestfits.intro.a')}<strong className="text-foreground">{t('bestfits.intro.strong')}</strong>{t('bestfits.intro.b')}
            </p>
          </div>
          <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-2 gap-3">
            {bestfitCases.map(uc => (
              <div key={uc.name} className="rounded-xl border-2 p-3 flex flex-col gap-2" style={{ borderColor: '#0EA5E955', backgroundColor: '#0EA5E908' }}>
                <div className="flex items-center gap-2">
                  <span className="text-2xl shrink-0">{uc.emoji}</span>
                  <div className="font-black text-foreground text-base leading-tight">{uc.name}</div>
                </div>
                <div className="text-xs text-muted-foreground leading-snug">
                  <span className="font-bold text-[#0EA5E9] uppercase tracking-widest text-[9px] mr-1">{t('bestfits.whyLabel')}</span>
                  {uc.why}
                </div>
                <div className="mt-auto text-[11px] text-foreground bg-card border border-border rounded-md px-2 py-1.5 leading-snug">
                  <span className="font-bold text-[#0EA5E9] uppercase tracking-widest text-[9px] mr-1">{t('bestfits.inTheWildLabel')}</span>
                  {uc.example}
                </div>
              </div>
            ))}
          </div>
          <div className="shrink-0 mt-3 p-2.5 bg-[#ef4444]/08 border border-[#ef4444]/30 rounded-lg text-[11px] text-muted-foreground">
            <strong className="text-[#ef4444]">{t('bestfits.notAFitLabel')}</strong>{t('bestfits.notAFitBody')}
          </div>
          <KeyPointBar text={t('bestfits.keyPoint')} className="shrink-0 mt-2 lg:mr-20" />
        </div>

        {/* ═══════ WORST FITS — WHERE FABRIC IS WRONG ═══════ */}
        <div id="s3-worstfits" className="h-full flex flex-col p-5 lg:p-8">
          <div className="shrink-0 mb-3">
            <h2 className="text-2xl lg:text-3xl font-bold text-foreground mt-1">{t('worstfits.headingA')}<em>{t('worstfits.headingEm')}</em>{t('worstfits.headingB')}</h2>
            <p className="text-sm text-muted-foreground max-w-3xl">
              {t('worstfits.intro')}
            </p>
          </div>
          <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-2 gap-3">
            {worstfitCases.map(uc => (
              <div key={uc.name} className="rounded-xl border-2 p-3 flex flex-col gap-2" style={{ borderColor: '#ef444455', backgroundColor: '#ef444408' }}>
                <div className="flex items-center gap-2">
                  <span className="text-2xl shrink-0">{uc.emoji}</span>
                  <div className="font-black text-foreground text-base leading-tight">{uc.name}</div>
                </div>
                <div className="text-xs text-muted-foreground leading-snug">
                  <span className="font-bold text-[#ef4444] uppercase tracking-widest text-[9px] mr-1">{t('worstfits.whyNotLabel')}</span>
                  {uc.why}
                </div>
                <div className="mt-auto text-[11px] text-foreground bg-card border border-border rounded-md px-2 py-1.5 leading-snug">
                  <span className="font-bold text-[#10b981] uppercase tracking-widest text-[9px] mr-1">{t('worstfits.useInsteadLabel')}</span>
                  {uc.alt}
                </div>
              </div>
            ))}
          </div>
          <div className="shrink-0 mt-3 p-2.5 bg-[#10b981]/08 border border-[#10b981]/30 rounded-lg text-[11px] text-muted-foreground">
            <strong className="text-[#10b981]">{t('worstfits.rightToolLabel')}</strong>{t('worstfits.rightToolBody.a')}<em>{t('worstfits.rightToolBody.known')}</em>{t('worstfits.rightToolBody.b')}<em>{t('worstfits.rightToolBody.regulated')}</em>{t('worstfits.rightToolBody.c')}<em>{t('worstfits.rightToolBody.selective')}</em>{t('worstfits.rightToolBody.d')}
          </div>
          <KeyPointBar text={t('worstfits.keyPoint')} className="shrink-0 mt-2 lg:mr-20" />
        </div>

        {/* ═══════ FABRIC ↔ PUBLIC-CHAIN GLOSSARY ═══════ */}
        <div id="s3-vocab" className="h-full flex flex-col p-5 lg:p-8">
          <div className="shrink-0 mb-3">
            <h2 className="text-2xl lg:text-3xl font-bold text-foreground mt-1">{t('vocab.heading')}</h2>
            <p className="text-sm text-muted-foreground max-w-3xl">
              {t('vocab.intro.a')}<strong className="text-foreground">{t('vocab.intro.strong')}</strong>{t('vocab.intro.b')}
            </p>
          </div>

          <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-2 gap-3 overflow-y-auto">
            {vocabRows.map(row => (
              <div key={row.pub} className="rounded-xl border bg-card p-3 flex flex-col gap-1.5">
                <div className="grid grid-cols-2 gap-2 items-start">
                  <div>
                    <div className="text-[9px] font-black uppercase tracking-widest" style={{ color: '#627EEA' }}>{t('vocab.pubLabel')}</div>
                    <div className="text-sm font-bold text-foreground mt-0.5">{row.pub}</div>
                  </div>
                  <div>
                    <div className="text-[9px] font-black uppercase tracking-widest" style={{ color: '#0EA5E9' }}>{t('vocab.fabLabel')}</div>
                    <div className="text-sm font-bold text-foreground mt-0.5">{row.fab}</div>
                  </div>
                </div>
                <div className="text-[11px] text-muted-foreground leading-snug border-t border-border pt-1.5">
                  <span className="text-[#0EA5E9] font-bold mr-1">↔</span>{row.note}
                </div>
              </div>
            ))}
          </div>

          <KeyPointBar text={t('vocab.keyPoint')} className="shrink-0 mt-3 lg:mr-20" />
        </div>

        {/* ═══════ QUIZ ═══════ */}
        <div id="s3-quiz" className="h-full">
          <QuizSlide
            question={t('quiz.question')}
            options={quizOptions.map((o, i) => ({ text: o.text, correct: quizCorrect[i] }))}
            explanation={t('quiz.explanation')}
          />
        </div>

        {/* ═══════ QUIZ 2 — MSP / identity ═══════ */}
        <div id="s3-quiz-2" className="h-full">
          <QuizSlide
            question={t('quiz2.question')}
            options={quiz2Options.map((o, i) => ({ text: o.text, correct: quiz2Correct[i] }))}
            explanation={t('quiz2.explanation')}
          />
        </div>

        {/* ═══════ QUIZ 3 — Endorsement policy ═══════ */}
        <div id="s3-quiz-3" className="h-full">
          <QuizSlide
            question={t('quiz3.question')}
            options={quiz3Options.map((o, i) => ({ text: o.text, correct: quiz3Correct[i] }))}
            explanation={t('quiz3.explanation')}
          />
        </div>

        {/* ═══════ TAKEAWAYS ═══════ */}
        <div id="s3-takeaways" className="h-full">
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
