import { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'motion/react';
import { TitleSlide } from '../../components/templates/TitleSlide';
import { TakeawaySlide } from '../../components/templates/TakeawaySlide';
import { QuizSlide } from '../../components/templates/QuizSlide';
import { SectionNav } from '../../components/navigation/SectionNav';
import { SiteFooter } from '../../components/shared/SiteFooter';
import { UnderTheHood } from '../../components/shared/UnderTheHood';
import { KeyPointBar } from '../../components/shared/KeyPointBar';
import { ShieldAlert } from 'lucide-react';

// Language-neutral shape — only IDs. Labels come from t() at render time.
const chapterIds = [
  's5-oracle',
  's5-challenges',
  's5-technical',
  's5-ex-oracle',
  's5-risks-security',
  's5-failures',
  's5-risks-cost',
  's5-risks-regulatory',
  's5-quiz',
  's5-takeaways',
  's5-summary',
] as const;

// ─── Exercise: Oracle Attack Scenario ───────────────────────────────────────
// Language-neutral data: emoji + color + presence of a mitigation. Text via t().

const ORACLE_ROW_META = [
  { emoji: '🌾', color: '#39B54A', hasMitigation: false },
  { emoji: '🏢', color: '#6366f1', hasMitigation: true },
  { emoji: '🔓', color: '#ED1C24', hasMitigation: true },
  { emoji: '📡', color: '#ED1C24', hasMitigation: true },
  { emoji: '💸', color: '#f59e0b', hasMitigation: true },
  { emoji: '🔒', color: '#ED1C24', hasMitigation: false },
] as const;

interface OracleRowText {
  actor: string;
  event: string;
  consequence: string;
  mitigation?: { title: string; desc: string };
}

interface CardItem {
  label: string;
  what: string;
  body: string;
  tag: string;
}

interface WhyFixItem {
  title: string;
  what: string;
  why: string;
  fix: string;
  stat?: string;
}

interface SecurityItem {
  title: string;
  what: string;
  fix: string;
  stat: string;
}

interface SummaryCard {
  title: string;
  summary: string;
}

interface FailureItem {
  name: string;
  date: string;
  loss: string;
  category: string;
  what: string;
  lesson: string;
}

const FAILURE_META = [
  { emoji: '🔑', color: '#ED1C24' },
  { emoji: '🗳️', color: '#8b5cf6' },
  { emoji: '📡', color: '#f59e0b' },
  { emoji: '🐛', color: '#6366f1' },
  { emoji: '🧊', color: '#22d3ee' },
  { emoji: '📉', color: '#7c2d12' },
];

function OracleAttackExercise() {
  const { t } = useTranslation('smart-contracts/section-5');
  const [revealed, setRevealed] = useState(0);
  const rows = t('exercise.rows', { returnObjects: true }) as OracleRowText[];
  const allDone = revealed >= ORACLE_ROW_META.length;
  const reset = () => setRevealed(0);

  return (
    <div className="h-full flex flex-col p-6 lg:p-8">
      <div className="shrink-0 flex items-center justify-between mb-4">
        <div>
          <span className="px-2.5 py-0.5 rounded-full bg-[#ED1C24]/15 border border-[#ED1C24]/40 text-[#ED1C24] text-xs font-bold">{t('exercise.badge')}</span>
          <h2 className="text-2xl font-bold text-foreground mt-1">{t('exercise.title')}</h2>
          <p className="text-muted-foreground text-sm">{t('exercise.subtitle')}</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-xs text-muted-foreground">{Math.min(revealed, ORACLE_ROW_META.length)} / {ORACLE_ROW_META.length} {t('exercise.stepsLabel')}</div>
          {allDone && <button onClick={reset} className="px-3 py-1.5 rounded-lg bg-muted text-xs font-semibold text-muted-foreground hover:bg-muted/80 transition-colors">{t('exercise.reset')}</button>}
        </div>
      </div>

      <div className="shrink-0 grid grid-cols-2 gap-4 mb-2 px-1">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">{t('exercise.whatHappened')}</p>
        <p className="text-xs font-semibold text-[#39B54A] uppercase tracking-widest">{t('exercise.howToPrevent')}</p>
      </div>

      <div className="flex-1 min-h-0 flex flex-col gap-2">
        {ORACLE_ROW_META.map((meta, i) => {
          const row = rows[i];
          return (
          <motion.div
            key={i}
            className="flex-1 grid grid-cols-2 gap-4 min-h-0"
            initial={{ opacity: 0.15 }}
            animate={{ opacity: i < revealed ? 1 : 0.15 }}
          >
            <div
              className="flex items-start gap-2.5 p-3 rounded-xl border transition-colors"
              style={{
                borderColor: i < revealed ? meta.color + '40' : 'var(--border)',
                backgroundColor: i < revealed ? meta.color + '08' : 'transparent',
              }}
            >
              <div className="size-7 rounded-full flex items-center justify-center text-base shrink-0"
                style={{ backgroundColor: i < revealed ? meta.color + '20' : 'var(--muted)' }}>
                {i < revealed ? meta.emoji : '?'}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 mb-0.5 flex-wrap">
                  <span className="text-xs font-bold shrink-0" style={{ color: i < revealed ? meta.color : 'var(--muted-foreground)' }}>{row.actor}</span>
                  <span className="text-xs font-semibold text-foreground">{i < revealed ? row.event : t('exercise.unknownEvent')}</span>
                </div>
                {i < revealed && <div className="text-xs text-muted-foreground leading-snug">{row.consequence}</div>}
              </div>
            </div>

            <div className="p-3 rounded-xl border transition-colors"
              style={{
                borderColor: meta.hasMitigation && allDone ? '#39B54A40' : 'transparent',
                backgroundColor: meta.hasMitigation && allDone ? '#39B54A08' : 'transparent',
              }}
            >
              {meta.hasMitigation && allDone && row.mitigation && (
                <motion.div initial={{ opacity: 0, x: 8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}>
                  <div className="font-bold text-xs text-[#39B54A] mb-1">✓ {row.mitigation.title}</div>
                  <div className="text-xs text-muted-foreground leading-snug">{row.mitigation.desc}</div>
                </motion.div>
              )}
            </div>
          </motion.div>
          );
        })}
      </div>

      {!allDone && (
        <div className="shrink-0 mt-3">
          <button
            onClick={() => setRevealed(r => r + 1)}
            className="px-4 py-2 rounded-lg bg-[#ED1C24] text-white text-xs font-bold hover:bg-[#ED1C24]/90 transition-colors"
          >
            {t('exercise.revealNext')}
          </button>
        </div>
      )}
    </div>
  );
}

export function SC_Section5() {
  const { t } = useTranslation('smart-contracts/section-5');

  const chapters = useMemo(
    () => chapterIds.map((id) => ({ id, label: t(`chapters.${id}`) })),
    [t]
  );

  const oracleCards = t('oracle.cards', { returnObjects: true }) as CardItem[];
  const oracleColors = ['#ED1C24', '#6366f1', '#f59e0b'];
  const oracleEmojis = ['🔒', '🌉', '⚠️'];
  const oracleNetworks = t('oracle.networks.items', { returnObjects: true }) as { n: string; d: string }[];
  const oracleNetworkColors = ['#375BD2', '#8b5cf6', '#6366f1', '#f59e0b'];

  const challengeItems = t('challenges.items', { returnObjects: true }) as WhyFixItem[];
  const challengeMeta = [
    { emoji: '🚦', color: '#ED1C24' },
    { emoji: '⏱️', color: '#f59e0b' },
    { emoji: '💾', color: '#8b5cf6' },
    { emoji: '⚙️', color: '#6366f1' },
  ];

  const technicalItems = t('technical.items', { returnObjects: true }) as WhyFixItem[];
  const technicalMeta = [
    { emoji: '🤖', color: '#ED1C24' },
    { emoji: '🔧', color: '#f59e0b' },
    { emoji: '🔺', color: '#6366f1' },
    { emoji: '📈', color: '#39B54A' },
  ];

  const securityItems = t('security.items', { returnObjects: true }) as SecurityItem[];
  const securityMeta = [
    { emoji: '🔁', color: '#ED1C24' },
    { emoji: '⚡', color: '#f59e0b' },
    { emoji: '🔑', color: '#8b5cf6' },
    { emoji: '🧮', color: '#6366f1' },
    { emoji: '🐛', color: '#39B54A' },
    { emoji: '💸', color: '#ED1C24' },
  ];

  const failureItems = t('failures.items', { returnObjects: true }) as FailureItem[];

  const costItems = t('cost.items', { returnObjects: true }) as WhyFixItem[];
  const costMeta = [
    { emoji: '🧱', color: '#ED1C24' },
    { emoji: '🛠️', color: '#f59e0b' },
    { emoji: '⛽', color: '#8b5cf6' },
    { emoji: '⚖️', color: '#6366f1' },
  ];

  const regulatoryItems = t('regulatory.items', { returnObjects: true }) as CardItem[];
  const regulatoryMeta = [
    { emoji: '⚖️', color: '#ED1C24' },
    { emoji: '🔍', color: '#8b5cf6' },
    { emoji: '🏃', color: '#f59e0b' },
  ];

  const quizOptionsText = t('quiz.options', { returnObjects: true }) as string[];
  const quizCorrect = [false, true, false, false];
  const quizOptions = quizOptionsText.map((text, i) => ({ text, correct: quizCorrect[i] }));

  const takeawayItems = t('takeaways.items', { returnObjects: true }) as string[];

  const summaryCards = t('summary.cards', { returnObjects: true }) as SummaryCard[];
  const summaryIcons = ['🔒', '🔮', '⛽', '⚖️', '💸', '🛡️'];

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
            icon={<ShieldAlert className="size-20 text-[#6366f1]" />}
            gradient="from-[#ED1C24] to-[#6366f1]"
          />
        </div>

        {/* ═══════ THE ORACLE PROBLEM ═══════ */}
        <div id="s5-oracle" className="h-full flex flex-col p-6 lg:p-10">
          <div className="shrink-0 mb-5">
            <h2 className="text-2xl lg:text-3xl font-bold text-foreground">{t('oracle.heading')}</h2>
            <p className="text-muted-foreground text-sm mt-1">{t('oracle.subtitle')}</p>
          </div>

          <div className="flex-1 min-h-0 grid grid-cols-3 gap-4">
            {oracleCards.map((c, i) => {
              const color = oracleColors[i];
              return (
              <motion.div
                key={c.label}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3 }}
                className="flex flex-col gap-3 rounded-xl border-2 p-5 justify-center"
                style={{ borderColor: color + '50', backgroundColor: color + '08' }}
              >
                <div className="flex items-center gap-3">
                  <div className="size-11 rounded-xl flex items-center justify-center text-2xl shrink-0" style={{ backgroundColor: color + '18' }}>{oracleEmojis[i]}</div>
                  <div>
                    <div className="font-black text-base text-foreground leading-tight">{c.label}</div>
                    <div className="text-sm font-semibold mt-0.5" style={{ color }}>{c.what}</div>
                  </div>
                </div>
                <p className="text-sm text-foreground leading-relaxed flex-1">{c.body}</p>
                <p className="text-xs italic text-muted-foreground border-l-2 pl-2" style={{ borderColor: color }}>{c.tag}</p>
              </motion.div>
              );
            })}
          </div>

          <div className="shrink-0 mt-4 grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="rounded-xl border p-4" style={{ borderColor: '#6366f140', backgroundColor: '#6366f10a' }}>
              <div className="text-xs font-black uppercase tracking-widest text-[#6366f1] mb-1">{t('oracle.example.label')}</div>
              <p className="text-sm text-foreground leading-snug">
                {t('oracle.example.bodyA')}<span className="font-semibold">{t('oracle.example.bodyStrong')}</span>{t('oracle.example.bodyB')}
              </p>
            </div>
            <div className="rounded-xl border bg-card p-4">
              <div className="text-xs font-black uppercase tracking-widest text-muted-foreground mb-2">{t('oracle.networks.label')}</div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                {oracleNetworks.map((o, i) => (
                  <div key={o.n} className="flex items-baseline gap-1.5">
                    <span className="font-bold shrink-0" style={{ color: oracleNetworkColors[i] }}>{o.n}</span>
                    <span className="text-muted-foreground leading-snug">{o.d}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <UnderTheHood terms={['data feed', 'TWAP', 'signed report', 'VRF (randomness)']} className="shrink-0 mt-3" />
          <KeyPointBar text={t('keyPoints.s5-oracle')} className="mt-3" />
        </div>

        {/* ═══════ CHALLENGES & LIMITATIONS ═══════ */}
        <div id="s5-challenges" className="h-full flex flex-col p-6 lg:p-10">
          <div className="shrink-0 mb-5">
            <h2 className="text-2xl lg:text-3xl font-bold text-foreground">{t('challenges.heading')}</h2>
            <p className="text-muted-foreground text-sm mt-1">{t('challenges.subtitle')}</p>
          </div>

          <div className="flex-1 min-h-0 grid grid-cols-2 grid-rows-2 gap-4">
            {challengeItems.map((c, i) => {
              const color = challengeMeta[i].color;
              return (
              <motion.div
                key={c.title}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3 }}
                className="flex flex-col gap-3 rounded-xl border-2 p-5 justify-center"
                style={{ borderColor: color + '50', backgroundColor: color + '08' }}
              >
                <div className="flex items-center gap-3">
                  <div className="size-11 rounded-xl flex items-center justify-center text-2xl shrink-0" style={{ backgroundColor: color + '18' }}>{challengeMeta[i].emoji}</div>
                  <div>
                    <div className="font-black text-base text-foreground leading-tight">{c.title}</div>
                    <div className="text-sm font-semibold mt-0.5" style={{ color }}>{c.what}</div>
                  </div>
                </div>
                <div className="rounded-lg bg-card border p-3" style={{ borderColor: color + '25' }}>
                  <span className="text-xs font-black uppercase tracking-widest text-muted-foreground">{t('challenges.whyLabel')}</span>
                  <p className="text-sm text-foreground leading-snug mt-0.5">{c.why}</p>
                </div>
                <div className="rounded-lg p-3 border-l-2" style={{ borderColor: color, backgroundColor: color + '12' }}>
                  <span className="text-xs font-black uppercase tracking-widest" style={{ color }}>{t('challenges.fixLabel')}</span>
                  <p className="text-sm text-foreground leading-snug mt-0.5">{c.fix}</p>
                </div>
                <p className="text-xs text-muted-foreground italic">{c.stat}</p>
              </motion.div>
              );
            })}
          </div>
          <KeyPointBar text={t('keyPoints.s5-challenges')} className="mt-3" />
        </div>

        {/* ═══════ TECHNICAL CHALLENGES ═══════ */}
        <div id="s5-technical" className="h-full flex flex-col p-6 lg:p-10">
          <div className="shrink-0 mb-5">
            <h2 className="text-2xl lg:text-3xl font-bold text-foreground">{t('technical.heading')}</h2>
            <p className="text-muted-foreground text-sm mt-1">{t('technical.subtitle')}</p>
          </div>

          <div className="flex-1 min-h-0 grid grid-cols-2 grid-rows-2 gap-4">
            {technicalItems.map((c, i) => {
              const color = technicalMeta[i].color;
              return (
              <motion.div
                key={c.title}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3 }}
                className="flex flex-col gap-3 rounded-xl border-2 p-5 justify-center"
                style={{ borderColor: color + '50', backgroundColor: color + '08' }}
              >
                <div className="flex items-center gap-3">
                  <div className="size-11 rounded-xl flex items-center justify-center text-2xl shrink-0" style={{ backgroundColor: color + '18' }}>{technicalMeta[i].emoji}</div>
                  <div>
                    <div className="font-black text-base text-foreground leading-tight">{c.title}</div>
                    <div className="text-sm font-semibold mt-0.5" style={{ color }}>{c.what}</div>
                  </div>
                </div>
                <div className="rounded-lg bg-card border p-3" style={{ borderColor: color + '25' }}>
                  <span className="text-xs font-black uppercase tracking-widest text-muted-foreground">{t('technical.whyLabel')}</span>
                  <p className="text-sm text-foreground leading-snug mt-0.5">{c.why}</p>
                </div>
                <div className="rounded-lg p-3 border-l-2" style={{ borderColor: color, backgroundColor: color + '12' }}>
                  <span className="text-xs font-black uppercase tracking-widest" style={{ color }}>{t('technical.fixLabel')}</span>
                  <p className="text-sm text-foreground leading-snug mt-0.5">{c.fix}</p>
                </div>
                <p className="text-xs text-muted-foreground italic">{c.stat}</p>
              </motion.div>
              );
            })}
          </div>
          <KeyPointBar text={t('keyPoints.s5-technical')} className="mt-3" />
        </div>

        {/* ═══════ EXERCISE: ORACLE ATTACK ═══════ */}
        <div id="s5-ex-oracle" className="h-full flex flex-col">
          <div className="flex-1 min-h-0">
            <OracleAttackExercise />
          </div>
          <KeyPointBar text={t('keyPoints.s5-ex-oracle')} className="mx-6 lg:mx-8 mb-6 -mt-3" />
        </div>

        {/* ═══════ SECURITY RISKS ═══════ */}
        <div id="s5-risks-security" className="h-full flex flex-col p-6 lg:p-10">
          <div className="shrink-0 mb-5">
            <h2 className="text-2xl lg:text-3xl font-bold text-foreground">{t('security.heading')}</h2>
            <p className="text-muted-foreground text-sm mt-1">{t('security.subtitle')}</p>
          </div>

          <div className="flex-1 min-h-0 grid grid-cols-3 grid-rows-2 gap-4">
            {securityItems.map((r, i) => {
              const color = securityMeta[i].color;
              return (
              <motion.div
                key={r.title}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.25 }}
                className="flex flex-col gap-2.5 rounded-xl border-2 p-4 justify-center"
                style={{ borderColor: color + '50', backgroundColor: color + '08' }}
              >
                <div className="flex items-center gap-2.5">
                  <div className="size-9 rounded-lg flex items-center justify-center text-lg shrink-0" style={{ backgroundColor: color + '18' }}>{securityMeta[i].emoji}</div>
                  <div className="font-black text-base text-foreground leading-tight">{r.title}</div>
                </div>
                <p className="text-sm text-foreground leading-snug flex-1">{r.what}</p>
                <div className="rounded-lg p-2 border-l-2" style={{ borderColor: color, backgroundColor: color + '12' }}>
                  <span className="text-[11px] font-bold" style={{ color }}>{t('security.fixLabel')}</span>
                  <span className="text-[11px] text-muted-foreground">{r.fix}</span>
                </div>
                <p className="text-xs text-muted-foreground italic">{r.stat}</p>
              </motion.div>
              );
            })}
          </div>
          <KeyPointBar text={t('keyPoints.s5-risks-security')} className="mt-3" />
        </div>

        {/* ═══════ FAILURES GALLERY ═══════ */}
        <div id="s5-failures" className="h-full flex flex-col p-6 lg:p-10">
          <div className="shrink-0 mb-4">
            <h2 className="text-2xl lg:text-3xl font-bold text-foreground">{t('failures.heading')}</h2>
            <p className="text-muted-foreground text-sm mt-1">{t('failures.subtitle')}</p>
          </div>

          <div className="flex-1 min-h-0 grid grid-cols-3 grid-rows-2 gap-3">
            {failureItems.map((f, i) => {
              const m = FAILURE_META[i];
              return (
                <motion.div
                  key={f.name}
                  initial={{ opacity: 0, y: 12 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.25, delay: i * 0.04 }}
                  className="flex flex-col gap-2 rounded-xl border-2 p-3.5 min-h-0"
                  style={{ borderColor: m.color + '50', backgroundColor: m.color + '08' }}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-xl shrink-0">{m.emoji}</span>
                      <div className="min-w-0">
                        <div className="font-black text-sm text-foreground leading-tight">{f.name}</div>
                        <div className="text-[10px] text-muted-foreground font-mono">{f.date}</div>
                      </div>
                    </div>
                    <div className="font-mono font-black text-sm shrink-0" style={{ color: m.color }}>{f.loss}</div>
                  </div>
                  <span className="self-start text-[9px] font-bold uppercase tracking-widest px-1.5 py-0.5 rounded" style={{ backgroundColor: m.color + '18', color: m.color }}>{f.category}</span>
                  <p className="text-xs text-foreground/90 leading-snug flex-1">{f.what}</p>
                  <div className="text-[11px] text-muted-foreground p-2 rounded-lg border-l-2" style={{ borderColor: m.color, backgroundColor: m.color + '10' }}>
                    <span className="font-bold" style={{ color: m.color }}>{t('failures.lessonLabel')}</span>{f.lesson}
                  </div>
                </motion.div>
              );
            })}
          </div>

          <div className="shrink-0 mt-3 flex items-center justify-between gap-4 flex-wrap pr-16">
            <p className="text-xs text-muted-foreground italic flex-1">{t('failures.footer')}</p>
            <UnderTheHood terms={['validator keys', 'flash loan', 'oracle manipulation', 'selfdestruct', 'reflexivity']} />
          </div>
          <KeyPointBar text={t('keyPoints.s5-failures')} className="mt-3" />
        </div>

        {/* ═══════ COST RISKS ═══════ */}
        <div id="s5-risks-cost" className="h-full flex flex-col p-6 lg:p-10">
          <div className="shrink-0 mb-5">
            <h2 className="text-2xl lg:text-3xl font-bold text-foreground">{t('cost.heading')}</h2>
            <p className="text-muted-foreground text-sm mt-1">{t('cost.subtitle')}</p>
          </div>

          <div className="flex-1 min-h-0 grid grid-cols-2 grid-rows-2 gap-4">
            {costItems.map((c, i) => {
              const color = costMeta[i].color;
              return (
              <motion.div
                key={c.title}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3 }}
                className="flex flex-col gap-3 rounded-xl border-2 p-5 justify-center"
                style={{ borderColor: color + '50', backgroundColor: color + '08' }}
              >
                <div className="flex items-center gap-3">
                  <div className="size-11 rounded-xl flex items-center justify-center text-2xl shrink-0" style={{ backgroundColor: color + '18' }}>{costMeta[i].emoji}</div>
                  <div>
                    <div className="font-black text-base text-foreground leading-tight">{c.title}</div>
                    <div className="text-sm font-semibold mt-0.5" style={{ color }}>{c.what}</div>
                  </div>
                </div>
                <div className="rounded-lg bg-card border p-3" style={{ borderColor: color + '25' }}>
                  <span className="text-xs font-black uppercase tracking-widest text-muted-foreground">{t('cost.whyLabel')}</span>
                  <p className="text-sm text-foreground leading-snug mt-0.5">{c.why}</p>
                </div>
                <div className="rounded-lg p-3 border-l-2" style={{ borderColor: color, backgroundColor: color + '12' }}>
                  <span className="text-xs font-black uppercase tracking-widest" style={{ color }}>{t('cost.fixLabel')}</span>
                  <p className="text-sm text-foreground leading-snug mt-0.5">{c.fix}</p>
                </div>
              </motion.div>
              );
            })}
          </div>
          <KeyPointBar text={t('keyPoints.s5-risks-cost')} className="mt-3" />
        </div>

        {/* ═══════ REGULATORY RISKS ═══════ */}
        <div id="s5-risks-regulatory" className="h-full flex flex-col p-6 lg:p-10">
          <div className="shrink-0 mb-5">
            <h2 className="text-2xl lg:text-3xl font-bold text-foreground">{t('regulatory.heading')}</h2>
            <p className="text-muted-foreground text-sm mt-1">{t('regulatory.subtitle')}</p>
          </div>

          <div className="flex-1 min-h-0 grid grid-cols-3 gap-4">
            {regulatoryItems.map((c, i) => {
              const color = regulatoryMeta[i].color;
              return (
              <motion.div
                key={c.title}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3 }}
                className="flex flex-col gap-3 rounded-xl border-2 p-5 justify-center"
                style={{ borderColor: color + '50', backgroundColor: color + '08' }}
              >
                <div className="flex items-center gap-3">
                  <div className="size-11 rounded-xl flex items-center justify-center text-2xl shrink-0" style={{ backgroundColor: color + '18' }}>{regulatoryMeta[i].emoji}</div>
                  <div>
                    <div className="font-black text-base text-foreground leading-tight">{c.title}</div>
                    <div className="text-sm font-semibold mt-0.5" style={{ color }}>{c.what}</div>
                  </div>
                </div>
                <p className="text-sm text-foreground leading-relaxed flex-1">{c.body}</p>
                <p className="text-xs italic text-muted-foreground border-l-2 pl-2" style={{ borderColor: color }}>{c.tag}</p>
              </motion.div>
              );
            })}
          </div>
          <KeyPointBar text={t('keyPoints.s5-risks-regulatory')} className="mt-3" />
        </div>

        {/* ═══════ QUIZ ═══════ */}
        <div id="s5-quiz" className="h-full">
          <QuizSlide
            question={t('quiz.question')}
            options={quizOptions}
            explanation={t('quiz.explanation')}
          />
        </div>

        <div id="s5-takeaways" className="h-full">
          <TakeawaySlide
            title={t('takeaways.title')}
            takeaways={takeawayItems}
          />
        </div>

        <div id="s5-summary" className="h-full flex flex-col p-6 lg:p-10">
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
                <div className="text-3xl">{summaryIcons[i]}</div>
                <div className="font-bold text-sm text-foreground">{card.title}</div>
                <div className="text-xs text-muted-foreground leading-relaxed">{card.summary}</div>
              </motion.div>
            ))}
          </div>
        </div>

        </div>
        <SiteFooter className="snap-start" />
      </div>
    </div>
  );
}
