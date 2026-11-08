import { useMemo, useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { motion } from 'motion/react';
import { TitleSlide } from '../../components/templates/TitleSlide';
import { TakeawaySlide } from '../../components/templates/TakeawaySlide';
import { SectionNav } from '../../components/navigation/SectionNav';
import { SiteFooter } from '../../components/shared/SiteFooter';
import { QuizSlide } from '../../components/templates/QuizSlide';
import { MessageCircle, Zap } from 'lucide-react';
import { KeyPointBar } from '../../components/shared/KeyPointBar';
import { UnderTheHood } from '../../components/shared/UnderTheHood';
import { RecapHandoff } from '../../components/shared/RecapHandoff';

/* ──────────── ZK bouncer demo — pick passport or proof, watch what leaks ──────────── */
function ZkBouncerDemo() {
  const { t } = useTranslation('blockchain-platforms/section-5');
  const [mode, setMode] = useState<'idle' | 'passport' | 'proof'>('idle');
  const leaked = t('zkp.demo.leaked', { returnObjects: true }) as string[];
  const accent = mode === 'passport' ? '#ef4444' : mode === 'proof' ? '#39B54A' : '#8b5cf6';

  const optionCls = (active: boolean, color: string) =>
    `text-left rounded-xl border-2 px-4 py-3 transition-all hover:-translate-y-0.5 hover:shadow-md font-bold text-sm text-foreground ${active ? 'shadow-md' : ''}`;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 h-full min-h-0">
      {/* You */}
      <div className="rounded-xl border-2 p-4 flex flex-col gap-3 min-h-0" style={{ borderColor: '#8b5cf655', backgroundColor: '#8b5cf608' }}>
        <div className="flex items-center gap-3 shrink-0">
          <span className="text-3xl">🧍</span>
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-[#8b5cf6]">{t('zkp.demo.youLabel')}</p>
            <p className="text-sm text-muted-foreground">{t('zkp.demo.pick')}</p>
          </div>
        </div>
        <button
          onClick={() => setMode('passport')}
          className={optionCls(mode === 'passport', '#ef4444')}
          style={{ borderColor: mode === 'passport' ? '#ef4444' : '#ef444455', backgroundColor: mode === 'passport' ? '#ef444414' : 'hsl(var(--card))' }}
        >{t('zkp.demo.passportBtn')}</button>
        <button
          onClick={() => setMode('proof')}
          className={optionCls(mode === 'proof', '#39B54A')}
          style={{ borderColor: mode === 'proof' ? '#39B54A' : '#39B54A55', backgroundColor: mode === 'proof' ? '#39B54A14' : 'hsl(var(--card))' }}
        >{t('zkp.demo.proofBtn')}</button>
      </div>

      {/* Bouncer */}
      <div className="rounded-xl border-2 p-4 flex flex-col gap-3 min-h-0 transition-colors" style={{ borderColor: accent + '66', backgroundColor: accent + '0a' }}>
        <div className="flex items-center gap-3 shrink-0">
          <span className="text-3xl">🕴️</span>
          <p className="text-[10px] font-black uppercase tracking-widest" style={{ color: accent }}>{t('zkp.demo.bouncerLabel')}</p>
        </div>
        {mode === 'idle' ? (
          <p className="text-sm text-muted-foreground italic">{t('zkp.demo.idle')}</p>
        ) : (
          <>
            <motion.div
              key={`verdict-${mode}`}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              className="shrink-0 rounded-lg border-2 px-3 py-2 text-sm font-black"
              style={{ borderColor: '#39B54A', backgroundColor: '#39B54A14', color: '#39B54A' }}
            >{t('zkp.demo.verdict')}</motion.div>
            <div className="flex flex-wrap gap-1.5">
              {leaked.map((f, i) => (
                <motion.span
                  key={`${mode}-${f}`}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.06 }}
                  className={`text-xs px-2 py-1 rounded-md border ${mode === 'proof' ? 'line-through text-muted-foreground/60 border-dashed border-border' : 'font-semibold'}`}
                  style={mode === 'passport' ? { borderColor: '#ef444480', backgroundColor: '#ef444414', color: '#ef4444' } : undefined}
                >{mode === 'passport' ? f : `${f} ${t('zkp.demo.hidden')}`}</motion.span>
              ))}
            </div>
            <p className="mt-auto text-xs font-black" style={{ color: accent }}>
              {mode === 'passport' ? t('zkp.demo.leakedCountPassport') : t('zkp.demo.leakedCountProof')}
            </p>
          </>
        )}
      </div>
    </div>
  );
}

/* ──────────── Interactive Platform Recommender (Airtable-style) ────────────
   5 questions appear one at a time. Each answer narrows the field of
   suitable blockchains. After Q5, runs a simple decision tree and shows
   the top recommendation + 1-2 close runners-up with logos and one-line
   reasoning. Restart available at any point.
   ─────────────────────────────────────────────────────────────────────────── */

interface PROpt { label: string; value: string; hint?: string }
interface PRQuestion { id: string; title: string; subtitle: string; options: PROpt[] }

// Language-neutral question shape — only ids. Display text comes from t().
const PR_QUESTION_SHAPE = [
  { id: 'permission',  optionValues: ['public', 'permissioned'] },
  { id: 'purpose',     optionValues: ['value', 'contracts', 'highperf'] },
  { id: 'throughput',  optionValues: ['low', 'med', 'high'] },
  { id: 'privacy',     optionValues: ['none', 'channel', 'strong'] },
  { id: 'sovereignty', optionValues: ['inherit', 'own', 'agnostic'] },
] as const;

interface PRPlatform {
  id: string;
  name: string;
  short: string;       // 1-char emoji or letter for the badge
  color: string;
  tagline: string;
  reason: string;      // why this platform fits the answers
}

// Language-neutral platform shape — short badge + color. name/tagline/reason from t().
const PLATFORM_SHAPE: Record<string, { id: string; short: string; color: string }> = {
  btc:    { id: 'btc',    short: '₿',  color: '#f7931a' },
  ln:     { id: 'ln',     short: '⚡', color: '#f59e0b' },
  eth:    { id: 'eth',    short: 'Ξ',  color: '#627EEA' },
  arb:    { id: 'arb',    short: '◎',  color: '#28A0F0' },
  sol:    { id: 'sol',    short: '◐',  color: '#9945FF' },
  avax:   { id: 'avax',   short: '🔺', color: '#E84142' },
  cosmos: { id: 'cosmos', short: '⚛', color: '#22d3ee' },
  fabric: { id: 'fabric', short: '🪢', color: '#0EA5E9' },
  stark:  { id: 'stark',  short: '⭑', color: '#EC796B' },
  aztec:  { id: 'aztec',  short: '◆', color: '#8b5cf6' },
  xrpl:   { id: 'xrpl',   short: '✕', color: '#06b6d4' },
};

// Decision tree — returns ranked platform ids. Pure logic, language-neutral.
function recommendPlatformIds(ans: Record<string, string>): string[] {
  const { permission, purpose, throughput, privacy, sovereignty } = ans;

  // Permissioned short-circuits everything else.
  if (permission === 'permissioned') return ['fabric'];

  // Strong privacy is the next strongest signal.
  if (privacy === 'strong')          return ['aztec', 'stark'];

  // Value-only on a public chain.
  if (purpose === 'value') {
    if (throughput === 'high') return ['ln', 'xrpl'];
    if (throughput === 'med')  return ['xrpl', 'ln'];
    return ['btc', 'xrpl'];
  }

  // Sovereign / own-validators path
  if (sovereignty === 'own') {
    if (throughput === 'high') return ['avax', 'cosmos'];
    return ['cosmos', 'avax'];
  }

  // Smart contracts / high-perf on a public chain
  if (purpose === 'highperf' || throughput === 'high') {
    return ['sol', 'arb', 'avax'];
  }
  if (throughput === 'med') {
    return ['arb', 'eth'];
  }
  // throughput low + contracts → high-value DeFi L1
  return ['eth', 'arb'];
}

function PlatformRecommender() {
  const { t } = useTranslation('blockchain-platforms/section-5');
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});

  // Resolve question text from t() while keeping logic ordering from the shape.
  const PR_QUESTIONS: PRQuestion[] = useMemo(() => {
    const tQuestions = t('recommender.questions', { returnObjects: true }) as PRQuestion[];
    return PR_QUESTION_SHAPE.map((shape) => {
      const tq = tQuestions.find((q) => q.id === shape.id)!;
      return {
        id: shape.id,
        title: tq.title,
        subtitle: tq.subtitle,
        options: shape.optionValues.map((v) => {
          const to = tq.options.find((o) => o.value === v)!;
          return { value: v, label: to.label, hint: to.hint };
        }),
      };
    });
  }, [t]);

  // Resolve platform display text from t() merged with the language-neutral shape.
  const PLATFORMS: Record<string, PRPlatform> = useMemo(() => {
    const out: Record<string, PRPlatform> = {};
    for (const key of Object.keys(PLATFORM_SHAPE)) {
      const shape = PLATFORM_SHAPE[key];
      out[key] = {
        ...shape,
        name: t(`recommender.platforms.${key}.name`),
        tagline: t(`recommender.platforms.${key}.tagline`),
        reason: t(`recommender.platforms.${key}.reason`),
      };
    }
    return out;
  }, [t]);

  const finished = step >= PR_QUESTIONS.length;
  const ranked = finished ? recommendPlatformIds(answers).map((id) => PLATFORMS[id]) : [];

  const choose = (qId: string, optValue: string) => {
    setAnswers(a => ({ ...a, [qId]: optValue }));
    setStep(s => s + 1);
  };

  const restart = () => { setStep(0); setAnswers({}); };

  const back = () => { if (step > 0) setStep(s => s - 1); };

  return (
    <div className="h-full flex flex-col p-5 lg:p-8">
      <div className="shrink-0 mb-3 flex items-start justify-between gap-3">
        <div>
          <span className="px-2.5 py-0.5 rounded-full bg-[#6366f1]/15 border border-[#6366f1]/40 text-[#6366f1] text-xs font-bold">{t('recommender.badge')}</span>
          <h2 className="text-2xl lg:text-3xl font-bold text-foreground mt-1">{t('recommender.heading')}</h2>
          <p className="text-sm text-muted-foreground max-w-3xl">{t('recommender.intro')}</p>
        </div>
        <div className="shrink-0 flex flex-col items-end gap-1">
          <div className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">{finished ? t('recommender.complete') : t('recommender.questionProgress', { current: step + 1, total: PR_QUESTIONS.length })}</div>
          <button onClick={restart} className="text-[10px] px-2 py-0.5 rounded-md bg-muted/60 hover:bg-muted text-muted-foreground font-semibold transition-colors">{t('recommender.restart')}</button>
        </div>
      </div>

      {/* Progress bar */}
      <div className="shrink-0 mb-3 flex gap-1">
        {PR_QUESTIONS.map((_, i) => (
          <div key={i} className="flex-1 h-1.5 rounded-full" style={{ background: i < step ? '#6366f1' : i === step ? '#6366f140' : 'hsl(var(--muted))' }} />
        ))}
      </div>

      {/* Body */}
      <div className="flex-1 min-h-0 overflow-y-auto">
        {!finished ? (
          <div className="rounded-2xl border-2 p-6 max-w-3xl mx-auto" style={{ borderColor: '#6366f155', backgroundColor: '#6366f10d' }}>
            <div className="text-[10px] font-black uppercase tracking-widest text-[#6366f1] mb-1">{t('recommender.questionLabel', { n: step + 1 })}</div>
            <h3 className="text-xl lg:text-2xl font-black text-foreground leading-tight">{PR_QUESTIONS[step].title}</h3>
            <p className="text-sm text-muted-foreground mt-1">{PR_QUESTIONS[step].subtitle}</p>
            <div className="grid gap-2 mt-4">
              {PR_QUESTIONS[step].options.map(opt => (
                <button
                  key={opt.value}
                  onClick={() => choose(PR_QUESTIONS[step].id, opt.value)}
                  className="text-left rounded-xl border-2 px-4 py-3 transition-all hover:-translate-y-0.5 hover:shadow-md"
                  style={{ borderColor: '#6366f155', backgroundColor: 'hsl(var(--card))' }}
                >
                  <div className="font-bold text-sm text-foreground">{opt.label}</div>
                  {opt.hint && <div className="text-xs text-muted-foreground mt-0.5">{opt.hint}</div>}
                </button>
              ))}
            </div>
            {step > 0 && (
              <div className="mt-4">
                <button onClick={back} className="text-[11px] text-muted-foreground hover:text-foreground font-semibold">{t('recommender.backToPrevious')}</button>
              </div>
            )}
          </div>
        ) : (
          <div className="flex flex-col gap-3 max-w-3xl mx-auto">
            <div className="rounded-2xl border-2 p-5 flex flex-col gap-3" style={{ borderColor: ranked[0]?.color + 'AA', backgroundColor: ranked[0]?.color + '10' }}>
              <div className="text-[10px] font-black uppercase tracking-widest" style={{ color: ranked[0]?.color }}>{t('recommender.recommended')}</div>
              <div className="flex items-center gap-4">
                <div className="size-16 rounded-2xl flex items-center justify-center text-3xl font-black text-white shrink-0 shadow" style={{ background: ranked[0]?.color }}>
                  {ranked[0]?.short}
                </div>
                <div className="min-w-0">
                  <div className="text-xl lg:text-2xl font-black text-foreground leading-tight">{ranked[0]?.name}</div>
                  <div className="text-sm text-muted-foreground mt-0.5">{ranked[0]?.tagline}</div>
                </div>
              </div>
              <p className="text-sm text-foreground leading-snug">{ranked[0]?.reason}</p>
            </div>

            {ranked.length > 1 && (
              <div className="rounded-xl border border-border bg-card p-3">
                <div className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-2">{t('recommender.alsoConsider')}</div>
                <div className="grid gap-2">
                  {ranked.slice(1).map(p => (
                    <div key={p.id} className="flex items-center gap-3 rounded-lg border p-2.5" style={{ borderColor: p.color + '55', backgroundColor: p.color + '0d' }}>
                      <div className="size-10 rounded-lg flex items-center justify-center text-lg font-black text-white shrink-0" style={{ background: p.color }}>{p.short}</div>
                      <div className="min-w-0">
                        <div className="text-sm font-bold text-foreground">{p.name}</div>
                        <div className="text-[11px] text-muted-foreground">{p.tagline}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Answers recap */}
            <div className="rounded-xl border border-border bg-card p-3">
              <div className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-2">{t('recommender.yourAnswers')}</div>
              <div className="grid grid-cols-1 lg:grid-cols-5 gap-2 text-[11px]">
                {PR_QUESTIONS.map(q => {
                  const opt = q.options.find(o => o.value === answers[q.id]);
                  return (
                    <div key={q.id} className="rounded-lg border border-border bg-muted/30 p-2">
                      <div className="text-[9px] text-muted-foreground uppercase tracking-widest">{q.title}</div>
                      <div className="text-xs font-bold text-foreground mt-0.5 leading-tight">{opt?.label}</div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="rounded-xl border border-[#f59e0b]/40 bg-[#f59e0b]/08 p-2.5 text-[11px] text-muted-foreground">
              <strong className="text-[#f59e0b]">{t('recommender.realityCheckLabel')}</strong>{t('recommender.realityCheckBody')}
            </div>

            <button onClick={restart} className="mx-auto rounded-md bg-[#6366f1] text-white font-bold text-sm px-4 py-2 hover:bg-[#6366f1]/90 transition-colors">
              {t('recommender.runAgain')}
            </button>
          </div>
        )}
      </div>
      <KeyPointBar label={t('ui.keyPoint')} text={t('keyPoints.s5-decision')} color="#6366f1" className="mt-3" />
    </div>
  );
}

/* ──────────── Platform snapshot — one compact slide per platform ────────────
   What it is · what it's good at · one real app · one caveat. Text from t(). */
type SnapshotId = 'starknet' | 'polkadot' | 'avalanche';
const SNAPSHOT_CARD_META = [
  { icon: '🧭', color: '#6366f1' },
  { icon: '💪', color: '#39B54A' },
  { icon: '🚀', color: '#8b5cf6' },
  { icon: '⚠️', color: '#f59e0b' },
];

function PlatformSnapshot({ id, color, emoji, hood, recapTo }: { id: SnapshotId; color: string; emoji: string; hood: string[]; recapTo?: string }) {
  const { t } = useTranslation('blockchain-platforms/section-5');
  const cards = t(`snapshot.${id}.cards`, { returnObjects: true }) as { label: string; title: string; body: string }[];
  return (
    <div id={`s5-${id}`} className="h-full flex flex-col p-6 lg:p-10">
      <div className="shrink-0 mb-4">
        <span className="px-2.5 py-0.5 rounded-full text-xs font-bold border" style={{ color, borderColor: color + '66', backgroundColor: color + '14' }}>{t('snapshot.badge')}</span>
        <h2 className="text-2xl lg:text-3xl font-bold text-foreground mt-1"><span className="mr-2">{emoji}</span>{t(`snapshot.${id}.heading`)}</h2>
        <p className="text-sm text-muted-foreground mt-1 max-w-4xl">{t(`snapshot.${id}.subtitle`)}</p>
        <div className="mt-2 flex flex-wrap gap-2">
          {recapTo && <RecapHandoff label={t('ui.recap')} text={t(`snapshot.${id}.recap`)} to={recapTo} color="#39B54A" />}
          <UnderTheHood label={t('ui.hood')} terms={hood} />
        </div>
      </div>

      <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-2 gap-4">
        {cards.map((c, i) => {
          const m = SNAPSHOT_CARD_META[i % SNAPSHOT_CARD_META.length];
          return (
            <motion.div
              key={c.label}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.3, delay: i * 0.05 }}
              className="rounded-xl border-2 p-4 lg:p-5 flex flex-col gap-2 min-h-0"
              style={{ borderColor: m.color + '55', backgroundColor: m.color + '08' }}
            >
              <div className="flex items-center gap-2.5 shrink-0">
                <span className="text-2xl leading-none">{m.icon}</span>
                <span className="text-[10px] font-black uppercase tracking-widest" style={{ color: m.color }}>{c.label}</span>
              </div>
              <p className="text-base lg:text-lg font-bold text-foreground leading-tight shrink-0">{c.title}</p>
              <p className="text-sm text-muted-foreground leading-relaxed">{c.body}</p>
            </motion.div>
          );
        })}
      </div>
      <KeyPointBar label={t('ui.keyPoint')} text={t(`keyPoints.s5-${id}`)} color={color} className="mt-3" />
    </div>
  );
}

// Language-neutral shape — IDs + kind only. Labels come from t() at render time.
const chapterShape = [
  { kind: 'group' as const, id: 'g-s5-zk' },
  { id: 's5-zkp' },
  { id: 's5-zkp-cave' },
  { id: 's5-zk-apps' },
  { id: 's5-zk-identity' },

  { kind: 'group' as const, id: 'g-s5-l2' },
  { id: 's5-l2-why' },
  { id: 's5-layer2' },
  { id: 's5-l2apps' },

  { kind: 'group' as const, id: 'g-s5-platforms' },
  { id: 's5-starknet' },
  { id: 's5-polkadot' },
  { id: 's5-avalanche' },

  { kind: 'group' as const, id: 'g-s5-priv' },
  { id: 's5-privacy' },
  { id: 's5-privacy-approaches' },
  { id: 's5-privacy-regulation' },
  { id: 's5-privacy-future' },

  { kind: 'group' as const, id: 'g-s5-eval' },
  { id: 's5-evaluate' },
  { id: 's5-evaluate-2' },

  { kind: 'group' as const, id: 'g-s5-decide' },
  { id: 's5-decision' },
  { id: 's5-decision-examples' },

  { kind: 'group' as const, id: 'g-s5-wrap' },
  { id: 's5-quiz' },
  { id: 's5-quiz-2' },
  { id: 's5-takeaways' },
  { id: 's5-discussion' },
];

interface AppItem { name: string; kind: string }
interface CompareRow { label: string; value: string }
interface EvalAxis { title: string; green: string[]; red: string[] }

export function BP_Section5() {
  const { t } = useTranslation('blockchain-platforms/section-5');

  const chapters = useMemo(
    () =>
      chapterShape.map((c) =>
        'kind' in c
          ? { kind: 'group' as const, id: c.id, label: t(`groups.${c.id}`) }
          : { id: c.id, label: t(`chapters.${c.id}`) }
      ),
    [t]
  );

  // ── Array data resolved via t() ──
  const caveSteps = t('zkpCave.steps', { returnObjects: true }) as { title: string; text: string }[];
  const zkMore = t('zkp.more', { returnObjects: true }) as { icon: string; text: string }[];
  const zkAppProps = t('zkApps.props', { returnObjects: true }) as { t: string; d: string }[];
  const zkAppItems = t('zkApps.items', { returnObjects: true }) as { name: string; who: string; does: string; since: string }[];
  const zkIdFlow = t('zkIdentity.flow', { returnObjects: true }) as { node: string; holds: string }[];
  const zkIdBusiness = t('zkIdentity.business', { returnObjects: true }) as string[];
  const kycSteps = t('starknetCompare.kycSteps', { returnObjects: true }) as { label: string; desc: string }[];
  const l2WhySteps = t('l2Why.steps', { returnObjects: true }) as { title: string; text: string }[];
  const l2WhyMetrics = t('l2Why.metrics', { returnObjects: true }) as { k: string; l1: string; l2: string }[];
  const triCorners = t('l2Why.triangle.corners', { returnObjects: true }) as { name: string; biz: string }[];
  const hoodLabel = t('ui.hood');
  const recapLabel = t('ui.recap');
  const keyLabel = t('ui.keyPoint');
  const kp = (id: string, color = '#8b5cf6') => <KeyPointBar label={keyLabel} text={t(`keyPoints.${id}`)} color={color} className="mt-3" />;
  const discussionScenarios = t('discussion.scenarios', { returnObjects: true }) as { title: string; desc: string }[];
  const discussionQuestions = t('discussion.questions', { returnObjects: true }) as string[];
  const layer2OpRows = t('layer2.op.rows', { returnObjects: true }) as CompareRow[];
  const layer2ZkRows = t('layer2.zk.rows', { returnObjects: true }) as CompareRow[];
  const layer2Shared = t('layer2.shared', { returnObjects: true }) as string[];
  const layer2Choose = t('layer2.choose', { returnObjects: true }) as { strong: string; rest: string }[];
  const l2appsRollups = t('l2apps.rollups', { returnObjects: true }) as { name: string; type: string; culture: string; tvl: string; apps: AppItem[] }[];
  const privacyApproaches = t('privacyApproaches.items', { returnObjects: true }) as { name: string; sub: string; mech: string; trade: string }[];
  const privacyTrace = t('privacy.trace', { returnObjects: true }) as { who: string; note: string }[];
  const privacyBusiness = t('privacy.business', { returnObjects: true }) as string[];
  const privacyStory = t('privacyRegulation.story', { returnObjects: true }) as { yr: string; t: string; d: string }[];
  const privacyFutureItems = t('privacyFuture.items', { returnObjects: true }) as { title: string; d: string }[];
  const evaluateAxes = t('evaluate.axes', { returnObjects: true }) as EvalAxis[];
  const evaluate2Axes = t('evaluate2.axes', { returnObjects: true }) as EvalAxis[];
  const decisionItems = t('decisionExamples.items', { returnObjects: true }) as { use: string; rec: string; why: string }[];
  const quizOptions = t('quiz.options', { returnObjects: true }) as string[];
  const quiz2Options = t('quiz2.options', { returnObjects: true }) as string[];
  const takeawayItems = t('takeaways.items', { returnObjects: true }) as string[];

  // Static color/visual data, paired with translated arrays by index.
  const caveColors = ['🗣️', '📄', '✅'];
  const zkpPropMeta = [
    { emoji: '✅', color: '#39B54A' },
    { emoji: '🔒', color: '#ED1C24' },
    { emoji: '🙈', color: '#8b5cf6' },
  ];
  const zkAppMeta = [
    { icon: '⚡', color: '#8b5cf6' },
    { icon: '🧑', color: '#10b981' },
    { icon: '🛡️', color: '#f59e0b' },
    { icon: '🏦', color: '#6366f1' },
    { icon: '📧', color: '#ec4899' },
    { icon: '🌐', color: '#06b6d4' },
    { icon: '🔑', color: '#0EA5E9' },
    { icon: '🗳️', color: '#39B54A' },
    { icon: '✅', color: '#f97316' },
  ];
  const zkIdFlowMeta = [
    { icon: '🏦', color: '#6366f1' },
    { icon: '👛', color: '#8b5cf6' },
    { icon: '🖥️', color: '#39B54A' },
  ];
  const triCornerMeta = [
    { color: '#6366f1', anchor: 'start' as const },
    { color: '#ED1C24', anchor: 'middle' as const },
    { color: '#39B54A', anchor: 'end' as const },
  ];
  const privacyTraceMeta = ['🏦', '👛', '🏠', '❤️'];
  const privacyStoryColors = ['#6366f1', '#ef4444', '#f59e0b', '#39B54A', '#8b5cf6'];
  const layer2OpColors = ['#f97316', '#ef4444', '#39B54A', '#39B54A', '#f97316', '#f97316', '#6366f1'];
  const layer2ZkColors = ['#6366f1', '#39B54A', '#ef4444', '#f97316', '#39B54A', '#6366f1', '#6366f1'];
  const l2WhyStepMeta = ['⚡', '📦', '⚖️'];
  const l2appsMeta = [
    { emoji: '🟦', typeColor: '#f97316', color: '#28A0F0' },
    { emoji: '🔴', typeColor: '#f97316', color: '#FF0420' },
    { emoji: '🔵', typeColor: '#f97316', color: '#0052FF' },
    { emoji: '🟪', typeColor: '#8b5cf6', color: '#EC796B' },
  ];
  const discussionMeta = [
    { icon: '🏦', color: '#6366f1' },
    { icon: '🎮', color: '#ec4899' },
    { icon: '🌍', color: '#39B54A' },
  ];
  const privacyApproachMeta = [
    { icon: '🛡️', color: '#f59e0b' },
    { icon: '👁️‍🗨️', color: '#ef4444' },
    { icon: '🧬', color: '#10b981' },
    { icon: '🔀', color: '#6b7280' },
  ];
  const privacyFutureMeta = [
    { icon: '🏦', color: '#6366f1' },
    { icon: '🪪', color: '#10b981' },
    { icon: '📊', color: '#f59e0b' },
    { icon: '🤖', color: '#ec4899' },
  ];
  const evaluateMeta = [
    { icon: '👥', color: '#6366f1' },
    { icon: '🔍', color: '#10b981' },
    { icon: '💰', color: '#f59e0b' },
  ];
  const evaluate2Meta = [
    { icon: '🌊', color: '#8b5cf6' },
    { icon: '📣', color: '#ec4899' },
    { icon: '🔬', color: '#06b6d4' },
  ];
  const decisionColors = ['#f59e0b', '#627EEA', '#39B54A', '#8b5cf6', '#ec4899', '#22d3ee', '#6366f1'];

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
            icon={<Zap className="size-20 text-[#8b5cf6]" />}
            gradient="from-[#8b5cf6] to-[#ec4899]"
          />
        </div>

        {/* ═══════ S5-ZKP — the one idea ═══════ */}
        <div id="s5-zkp" className="h-full flex flex-col p-6 lg:p-10">
          <div className="shrink-0 mb-4">
            <span className="text-xs font-black uppercase tracking-widest text-[#8b5cf6]">{t('zkp.eyebrow')}</span>
            <h2 className="text-2xl lg:text-3xl font-bold text-foreground mt-1">{t('zkp.heading')}</h2>
            <p className="text-sm text-muted-foreground mt-1">{t('zkp.subtitle')}</p>
          </div>

          <div className="shrink-0 mb-5 rounded-2xl border-2 p-5 text-center" style={{ borderColor: '#8b5cf680', backgroundColor: '#8b5cf60d' }}>
            <p className="text-lg lg:text-xl font-semibold text-foreground leading-snug">
              {t('zkp.oneLinerA')}<span style={{ color: '#8b5cf6' }}>{t('zkp.oneLinerB')}</span>
            </p>
          </div>

          <div className="flex-1 min-h-0 flex flex-col gap-3">
            <div className="shrink-0 flex items-center gap-2.5">
              <span className="text-3xl">🍺</span>
              <div>
                <p className="font-bold text-foreground text-lg">{t('zkp.exampleTitle')} <span className="ml-1 px-2 py-0.5 rounded-full bg-[#8b5cf6]/15 border border-[#8b5cf6]/40 text-[#8b5cf6] text-[10px] font-bold align-middle">{t('zkp.demo.badge')}</span></p>
                <p className="text-sm text-muted-foreground">{t('zkp.exampleSubtitle')}</p>
              </div>
            </div>

            <div className="flex-1 min-h-0">
              <ZkBouncerDemo />
            </div>
          </div>

          {/* Same trick, other doors */}
          <div className="shrink-0 mt-4 flex flex-col lg:flex-row gap-3 lg:items-stretch">
            <div className="flex-1 rounded-xl border border-border bg-card p-3">
              <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1.5">{t('zkp.moreLabel')}</p>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-2">
                {zkMore.map((m) => (
                  <div key={m.text} className="flex gap-2 items-start text-xs text-foreground leading-snug">
                    <span className="text-base leading-none shrink-0">{m.icon}</span>
                    <span>{m.text}</span>
                  </div>
                ))}
              </div>
            </div>
            <UnderTheHood label={hoodLabel} terms={['prover', 'verifier', 'statement', 'witness']} className="self-start lg:self-center" />
          </div>
          {kp('s5-zkp')}
        </div>

        {/* ═══════ S5-ZKP-CAVE — Where's Waldo ═══════ */}
        <div id="s5-zkp-cave" className="h-full flex flex-col p-6 lg:p-10">
          <div className="shrink-0 mb-4">
            <span className="text-xs font-black uppercase tracking-widest text-[#22d3ee]">{t('zkpCave.eyebrow')}</span>
            <h2 className="text-2xl lg:text-3xl font-bold text-foreground mt-1">{t('zkpCave.heading')}</h2>
            <p className="text-sm text-muted-foreground mt-1">{t('zkpCave.subtitle')}</p>
          </div>

          <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-3 gap-4">
            {caveSteps.map((s, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3 }}
                className="flex flex-col gap-3 rounded-xl border-2 p-5 justify-center"
                style={{ borderColor: '#22d3ee45', backgroundColor: '#22d3ee0a' }}
              >
                <div className="flex items-center gap-3">
                  <div className="size-9 rounded-full flex items-center justify-center text-base font-black text-white shrink-0" style={{ backgroundColor: '#22d3ee' }}>{i + 1}</div>
                  <span className="text-3xl">{caveColors[i]}</span>
                </div>
                <p className="font-bold text-foreground text-lg">{s.title}</p>
                <p className="text-sm text-muted-foreground leading-relaxed flex-1">{s.text}</p>
              </motion.div>
            ))}
          </div>

          <div className="shrink-0 mt-4 grid grid-cols-1 lg:grid-cols-2 gap-3">
            <div className="rounded-xl border p-3.5" style={{ borderColor: '#22d3ee40', backgroundColor: '#22d3ee0d' }}>
              <p className="text-sm text-foreground leading-snug"><span className="font-bold text-[#22d3ee]">{t('zkpCave.punchlineLabel')}</span>{t('zkpCave.punchlineA')}<span className="font-semibold">{t('zkpCave.punchlineStrong')}</span>{t('zkpCave.punchlineB')}</p>
            </div>
            <div className="rounded-xl border p-3.5" style={{ borderColor: '#6366f140', backgroundColor: '#6366f10d' }}>
              <p className="text-sm text-foreground leading-snug"><span className="font-bold text-[#6366f1]">{t('zkpCave.classicLabel')}</span>{t('zkpCave.classicBody')}</p>
            </div>
          </div>
          <div className="shrink-0 mt-3">
            <UnderTheHood label={hoodLabel} terms={['interactive proof', 'soundness', 'repeated rounds', 'Fiat–Shamir']} />
          </div>
          {kp('s5-zkp-cave', '#22d3ee')}
        </div>

        {/* ═══════ S5-ZK-APPS — real, live ZK products ═══════ */}
        <div id="s5-zk-apps" className="h-full flex flex-col p-6 lg:p-10">
          <div className="shrink-0 mb-3">
            <span className="text-xs font-black uppercase tracking-widest text-[#8b5cf6]">{t('zkApps.eyebrow')}</span>
            <h2 className="text-2xl lg:text-3xl font-bold text-foreground mt-1">{t('zkApps.heading')}</h2>
            <p className="text-sm text-muted-foreground mt-1 max-w-4xl">{t('zkApps.subtitle')}</p>
          </div>

          {/* Three promises — plain words */}
          <div className="shrink-0 grid grid-cols-1 lg:grid-cols-3 gap-2 mb-3">
            {zkAppProps.map((p, i) => (
              <div key={p.t} className="flex gap-2.5 items-center rounded-lg border px-3 py-2 bg-card" style={{ borderColor: zkpPropMeta[i].color + '50' }}>
                <span className="text-xl shrink-0 leading-none">{zkpPropMeta[i].emoji}</span>
                <div className="min-w-0">
                  <p className="text-xs font-black leading-tight" style={{ color: zkpPropMeta[i].color }}>{p.t}</p>
                  <p className="text-[11px] text-muted-foreground leading-snug">{p.d}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Nine live apps — 3×3 */}
          <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-3 gap-2.5">
            {zkAppItems.map((u, i) => {
              const { icon, color } = zkAppMeta[i % zkAppMeta.length];
              return (
                <motion.div
                  key={u.name}
                  initial={{ opacity: 0, y: 8 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.3, delay: i * 0.04 }}
                  className="rounded-xl border-2 p-3 bg-card flex flex-col gap-1 min-h-0"
                  style={{ borderColor: color + '55' }}
                >
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-xl leading-none">{icon}</span>
                    <div className="min-w-0">
                      <p className="font-black text-sm leading-tight" style={{ color }}>{u.name}</p>
                      <p className="text-[10px] text-muted-foreground leading-tight truncate">{u.who}</p>
                    </div>
                  </div>
                  <p className="text-xs text-foreground leading-snug flex-1"><span className="font-black text-[9px] uppercase tracking-widest mr-1" style={{ color }}>{t('zkApps.doesLabel')}</span>{u.does}</p>
                  <p className="text-[10px] font-semibold shrink-0" style={{ color }}>{u.since}</p>
                </motion.div>
              );
            })}
          </div>

          <div className="shrink-0 mt-3 flex flex-col lg:flex-row gap-2 lg:items-center">
            <p className="flex-1 text-[11px] text-muted-foreground leading-snug">
              <span className="font-bold text-[#8b5cf6]">{t('zkApps.familiesLabel')}</span>{t('zkApps.families')}
            </p>
            <UnderTheHood label={hoodLabel} terms={['SNARK', 'STARK', 'trusted setup', 'circuit', 'prover cost']} className="self-start" />
          </div>
          {kp('s5-zk-apps')}
        </div>

        {/* ═══════ S5-ZK-IDENTITY — KYC walkthrough ═══════ */}
        <div id="s5-zk-identity" className="h-full flex flex-col p-6 lg:p-10">
          <div className="shrink-0 mb-4">
            <span className="text-xs font-black uppercase tracking-widest text-[#8b5cf6]">{t('zkIdentity.eyebrow')}</span>
            <h2 className="text-2xl lg:text-3xl font-bold text-foreground mt-1">{t('zkIdentity.heading')}</h2>
            <p className="text-sm text-muted-foreground mt-1 max-w-4xl">{t('zkIdentity.subtitle')}</p>
          </div>

          {/* Who holds what — three nodes with arrows */}
          <div className="shrink-0 mb-4 rounded-xl border p-3" style={{ borderColor: '#8b5cf640', backgroundColor: '#8b5cf608' }}>
            <p className="text-[10px] font-black uppercase tracking-widest text-[#8b5cf6] mb-2">{t('zkIdentity.flowLabel')}</p>
            <div className="flex flex-col lg:flex-row items-stretch gap-2">
              {zkIdFlow.map((n, i) => {
                const { icon, color } = zkIdFlowMeta[i % zkIdFlowMeta.length];
                return (
                  <div key={n.node} className="flex-1 flex items-center gap-2">
                    <div className="flex-1 rounded-lg border-2 bg-card px-3 py-2 flex items-center gap-2.5" style={{ borderColor: color + '70' }}>
                      <span className="text-2xl leading-none">{icon}</span>
                      <div className="min-w-0">
                        <p className="text-sm font-black leading-tight" style={{ color }}>{n.node}</p>
                        <p className="text-[11px] text-muted-foreground leading-snug">{n.holds}</p>
                      </div>
                    </div>
                    {i < zkIdFlow.length - 1 && <span className="hidden lg:block text-xl text-muted-foreground shrink-0">→</span>}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Three steps */}
          <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-3 gap-4">
            {kycSteps.map((s, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3 }}
                className="rounded-xl border bg-card p-4 flex flex-col gap-2"
                style={{ borderColor: '#8b5cf640' }}
              >
                <div className="flex items-center gap-2">
                  <div className="size-8 rounded-full flex items-center justify-center text-sm font-black text-white shrink-0" style={{ backgroundColor: '#8b5cf6' }}>{i + 1}</div>
                  <p className="text-lg font-bold text-foreground leading-tight">{s.label}</p>
                </div>
                <p className="text-base text-muted-foreground leading-relaxed">{s.desc}</p>
              </motion.div>
            ))}
          </div>

          <div className="shrink-0 mt-4 grid grid-cols-1 lg:grid-cols-[1.2fr_1fr] gap-3">
            <div className="rounded-xl border p-3" style={{ borderColor: '#39B54A50', backgroundColor: '#39B54A0a' }}>
              <p className="text-[10px] font-black uppercase tracking-widest text-[#39B54A] mb-1.5">{t('zkIdentity.businessLabel')}</p>
              <ul className="grid grid-cols-1 lg:grid-cols-3 gap-2">
                {zkIdBusiness.map((b) => (
                  <li key={b} className="text-xs text-foreground leading-snug flex gap-1.5"><span className="text-[#39B54A]">✓</span>{b}</li>
                ))}
              </ul>
            </div>
            <div className="flex flex-col gap-2 justify-between">
              <p className="text-xs text-muted-foreground italic leading-snug">
                {t('starknetCompare.kycFootA')}<span className="font-medium text-foreground">{t('starknetCompare.kycFootStrong')}</span>{t('starknetCompare.kycFootB')}
              </p>
              <UnderTheHood label={hoodLabel} terms={['verifiable credential', 'selective disclosure', 'nullifier', 'issuer signature']} className="self-start" />
            </div>
          </div>
          {kp('s5-zk-identity')}
        </div>

        {/* ═══════ S5-L2-WHY — what an L2 is & why we need it ═══════ */}
        <div id="s5-l2-why" className="h-full flex flex-col p-6 lg:p-10">
          <div className="shrink-0 mb-4">
            <span className="text-xs font-black uppercase tracking-widest text-[#39B54A]">{t('l2Why.eyebrow')}</span>
            <h2 className="text-2xl lg:text-3xl font-bold text-foreground mt-1">{t('l2Why.heading')}</h2>
            <p className="text-sm text-muted-foreground mt-1 max-w-4xl">{t('l2Why.subtitle')}</p>
            <div className="mt-2 flex flex-wrap gap-2">
              <RecapHandoff label={recapLabel} text={t('l2Why.recap1')} to="/blockchain-platforms/section-1" color="#39B54A" />
              <RecapHandoff label={recapLabel} text={t('l2Why.recap2')} to="/blockchain-platforms/section-2" color="#39B54A" />
            </div>
          </div>

          <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-[1fr_1.15fr] gap-4">
            {/* Trilemma triangle — business labels, L1 position, L2 adds the third corner */}
            <div className="rounded-xl border border-border bg-card/40 p-3 flex flex-col min-h-[240px]">
              <svg viewBox="0 0 360 270" className="w-full flex-1">
                <polygon points="180,45 60,205 300,205" fill="hsl(var(--muted))" fillOpacity="0.25" stroke="hsl(var(--muted-foreground))" strokeWidth="1.2" />
                <text x="180" y="100" textAnchor="middle" fontSize="9" fontWeight="800" fill="hsl(var(--muted-foreground))" letterSpacing="1.5">{t('l2Why.triangle.pickTwo').toUpperCase()}</text>
                {/* L1 on the open–secure edge */}
                <line x1="180" y1="45" x2="60" y2="205" stroke="#6366f1" strokeWidth="4" strokeOpacity="0.5" />
                <circle cx="120" cy="125" r="9" fill="#627EEA" stroke="hsl(var(--card))" strokeWidth="2" />
                <text x="120" y="129" textAnchor="middle" fontSize="9" fontWeight="900" fill="#fff">L1</text>
                <text x="134" y="121" fontSize="8.5" fontWeight="700" fill="#627EEA">{t('l2Why.triangle.l1Label')}</text>
                {/* L2 reaches the cheap & fast corner */}
                <line x1="130" y1="132" x2="282" y2="196" stroke="#39B54A" strokeWidth="2" strokeDasharray="5 4" />
                <polygon points="282,196 270,187 274,201" fill="#39B54A" />
                <text x="222" y="152" textAnchor="middle" fontSize="8.5" fontWeight="700" fill="#39B54A">{t('l2Why.triangle.l2Label')}</text>
                {/* Corners — captions split on " · " so the bottom two never collide */}
                {triCorners.map((c, i) => {
                  const m = triCornerMeta[i % triCornerMeta.length];
                  const cx = i === 1 ? 180 : i === 0 ? 60 : 300, cy = i === 1 ? 45 : 205;
                  const tx = i === 1 ? 180 : i === 0 ? 14 : 346, ty = i === 1 ? 24 : 228;
                  const lines = c.biz.split(' · ');
                  return (
                    <g key={c.name}>
                      <circle cx={cx} cy={cy} r="6" fill={m.color} />
                      <text x={tx} y={ty} textAnchor={m.anchor} fontSize="11" fontWeight="900" fill={m.color}>{c.name}</text>
                      {lines.map((ln, k) => (
                        <text key={k} x={tx} y={ty + 12 + k * 10} textAnchor={m.anchor} fontSize="8" fill="hsl(var(--muted-foreground))">{ln}</text>
                      ))}
                    </g>
                  );
                })}
              </svg>
            </div>

            {/* Analogy + the three steps */}
            <div className="flex flex-col gap-3 min-h-0">
              <div className="shrink-0 rounded-xl border-2 p-4" style={{ borderColor: '#39B54A50', backgroundColor: '#39B54A0a' }}>
                <p className="text-xs font-black uppercase tracking-widest text-[#39B54A] mb-1">⚖️ {t('l2Why.analogyLabel')}</p>
                <p className="text-sm text-foreground leading-snug">{t('l2Why.analogy')}</p>
              </div>
              <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-3 gap-2">
                {l2WhySteps.map((s, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 12 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.3 }}
                    className="flex flex-col gap-1.5 rounded-xl border-2 p-3 min-h-0"
                    style={{ borderColor: '#6366f145', backgroundColor: '#6366f10a' }}
                  >
                    <div className="flex items-center gap-2">
                      <div className="size-7 rounded-full flex items-center justify-center text-sm font-black text-white shrink-0" style={{ backgroundColor: '#6366f1' }}>{i + 1}</div>
                      <span className="text-2xl">{l2WhyStepMeta[i]}</span>
                    </div>
                    <p className="font-bold text-foreground text-sm leading-tight">{s.title}</p>
                    <p className="text-xs text-muted-foreground leading-snug">{s.text}</p>
                  </motion.div>
                ))}
              </div>
              <UnderTheHood label={hoodLabel} terms={['throughput', 'block space', 'sequencer', 'data availability', 'EIP-4844 blobs']} className="self-start" />
            </div>
          </div>

          <div className="shrink-0 mt-4 rounded-xl border bg-card p-3 grid grid-cols-3 gap-3 text-center">
            {l2WhyMetrics.map((m, i) => (
              <div key={i} className="flex flex-col">
                <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">{m.k}</span>
                <span className="text-sm text-[#ef4444] font-semibold mt-0.5">L1 {m.l1}</span>
                <span className="text-sm text-[#39B54A] font-semibold">L2 {m.l2}</span>
              </div>
            ))}
          </div>
          {kp('s5-l2-why', '#39B54A')}
        </div>

        {/* ═══════ LAYER 2: OPTIMISTIC VS ZK ═══════ */}
        <div id="s5-layer2" className="h-full flex flex-col p-5 lg:p-8">
          <div className="shrink-0 mb-4">
            <span className="text-xs font-black uppercase tracking-widest text-[#39B54A]">{t('layer2.eyebrow')}</span>
            <h2 className="text-2xl lg:text-3xl font-bold text-foreground mt-1 mb-1">{t('layer2.heading')}</h2>
            <p className="text-sm text-muted-foreground">{t('layer2.subtitleA')}<em>{t('layer2.subtitleItalic')}</em>{t('layer2.subtitleB')}</p>
            <div className="mt-2 flex flex-wrap gap-2">
              <RecapHandoff label={recapLabel} text={t('layer2.recap')} to="/blockchain-platforms/section-2" color="#39B54A" />
              <UnderTheHood label={hoodLabel} terms={['fraud proof', 'validity proof', 'challenge window', 'sequencer', 'zkEVM types']} />
            </div>
          </div>
          <div className="flex-1 min-h-0 flex flex-col gap-4">
            {/* Head-to-head cards */}
            <div className="flex gap-4 flex-1 min-h-0">
              {/* Optimistic */}
              <div className="flex-1 flex flex-col rounded-xl border-2 border-[#f97316]/40 bg-card overflow-hidden">
                <div className="h-1.5 bg-[#f97316] shrink-0" />
                <div className="flex flex-col flex-1 p-4 gap-3 min-h-0">
                  <div className="shrink-0">
                    <div className="font-black text-lg text-[#f97316]">{t('layer2.op.title')}</div>
                    <div className="text-xs text-muted-foreground font-medium">{t('layer2.op.tagline')}</div>
                  </div>
                  <div className="text-xs text-muted-foreground shrink-0">{t('layer2.op.introA')}<span className="font-semibold text-foreground">{t('layer2.op.introStrong1')}</span>{t('layer2.op.introB')}<span className="font-semibold text-[#f97316]">{t('layer2.op.introStrong2')}</span>{t('layer2.op.introC')}</div>
                  {layer2OpRows.map((r, i) => (
                    <div key={i} className="flex gap-2 text-xs shrink-0">
                      <span className="text-muted-foreground w-28 shrink-0">{r.label}</span>
                      <span style={{ color: layer2OpColors[i] }} className="font-medium">{r.value}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* ZK */}
              <div className="flex-1 flex flex-col rounded-xl border-2 border-[#6366f1]/40 bg-card overflow-hidden">
                <div className="h-1.5 bg-[#6366f1] shrink-0" />
                <div className="flex flex-col flex-1 p-4 gap-3 min-h-0">
                  <div className="shrink-0">
                    <div className="font-black text-lg text-[#6366f1]">{t('layer2.zk.title')}</div>
                    <div className="text-xs text-muted-foreground font-medium">{t('layer2.zk.tagline')}</div>
                  </div>
                  <div className="text-xs text-muted-foreground shrink-0">{t('layer2.zk.introA')}<span className="font-semibold text-foreground">{t('layer2.zk.introStrong')}</span>{t('layer2.zk.introB')}</div>
                  {layer2ZkRows.map((r, i) => (
                    <div key={i} className="flex gap-2 text-xs shrink-0">
                      <span className="text-muted-foreground w-28 shrink-0">{r.label}</span>
                      <span style={{ color: layer2ZkColors[i] }} className="font-medium">{r.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Shared mechanics + decision rule */}
            <div className="grid grid-cols-2 gap-4 shrink-0">
              <div className="p-4 bg-card border border-border rounded-xl">
                <div className="font-bold text-sm text-foreground mb-2">{t('layer2.sharedTitle')}</div>
                <ul className="space-y-1.5 text-xs text-muted-foreground">
                  {layer2Shared.map((s, i) => (
                    <li key={i} className="flex gap-2"><span className="text-[#39B54A]">•</span>{s}</li>
                  ))}
                </ul>
              </div>
              <div className="p-4 bg-[#6366f1]/8 border border-[#6366f1]/30 rounded-xl">
                <div className="font-bold text-sm text-[#6366f1] mb-2">{t('layer2.chooseTitle')}</div>
                <ul className="space-y-1.5 text-xs text-muted-foreground">
                  {layer2Choose.map((c, i) => (
                    <li key={i} className="flex gap-2"><span className={i === 0 ? 'text-[#f97316]' : 'text-[#6366f1]'}>→</span><span><span className="font-semibold text-foreground">{c.strong}</span>{c.rest}</span></li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
          {kp('s5-layer2', '#39B54A')}
        </div>

        {/* ═══════ L2 APPS — what runs on each rollup ═══════ */}
        <div id="s5-l2apps" className="h-full flex flex-col p-6 lg:p-10">
          <div className="shrink-0 mb-4">
            <h2 className="text-2xl lg:text-3xl font-bold text-foreground">{t('l2apps.heading')}</h2>
            <p className="text-sm text-muted-foreground mt-1">{t('l2apps.subtitle')}</p>
          </div>

          <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-4 gap-4 content-center">
            {l2appsRollups.map((rollup, i) => {
              const { emoji, typeColor, color } = l2appsMeta[i];
              return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="flex flex-col gap-3 p-4 rounded-2xl border-2"
                style={{ borderColor: color + '55', backgroundColor: color + '0a' }}
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xl leading-none">{emoji}</span>
                    <div className="font-black text-base leading-tight" style={{ color }}>{rollup.name}</div>
                  </div>
                  <span className="inline-block text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded mt-2"
                    style={{ backgroundColor: typeColor + '20', color: typeColor, border: `1px solid ${typeColor}40` }}>
                    {rollup.type}
                  </span>
                </div>
                <div>
                  <div className="text-sm text-foreground font-semibold leading-tight">{rollup.culture}</div>
                  <div className="text-xs text-muted-foreground italic leading-snug mt-0.5">{rollup.tvl}</div>
                </div>
                <div className="flex flex-col gap-2">
                  {rollup.apps.map((app, j) => (
                    <div key={j} className="rounded-lg border bg-card/60 px-2.5 py-2" style={{ borderColor: color + '35' }}>
                      <div className="text-sm font-bold leading-tight" style={{ color }}>{app.name}</div>
                      <div className="text-xs text-muted-foreground leading-snug mt-0.5">{app.kind}</div>
                    </div>
                  ))}
                </div>
              </motion.div>
            );})}
          </div>

          <div className="shrink-0 mt-4 rounded-xl border p-3" style={{ borderColor: '#8b5cf655', backgroundColor: '#8b5cf60d' }}>
            <p className="text-sm text-muted-foreground leading-snug">
              <span className="font-bold" style={{ color: '#8b5cf6' }}>{t('l2apps.chooseLabel')}</span>
              {t('l2apps.chooseBody')}
            </p>
          </div>
          {kp('s5-l2apps', '#39B54A')}
        </div>

        {/* ═══════ PLATFORM SNAPSHOTS — one slide each ═══════ */}
        <PlatformSnapshot id="starknet" color="#EC796B" emoji="⭑" hood={['Cairo', 'STARK', 'sequencer', 'prover', 'account abstraction']} recapTo="/blockchain-platforms/section-2" />
        <PlatformSnapshot id="polkadot" color="#e6007a" emoji="🔴" hood={['Relay Chain', 'parachain', 'XCM', 'Coretime', 'GRANDPA']} recapTo="/blockchain-platforms/section-4" />
        <PlatformSnapshot id="avalanche" color="#e84142" emoji="🔺" hood={['Snowman', 'P-Chain', 'Avalanche L1', 'Warp messaging', 'ACP-77']} recapTo="/blockchain-platforms/section-4" />

        {/* ═══════ PRIVACY PRIMITIVES ═══════ */}
        {/* ═══════ S5-PRIVACY — why it is hard ═══════ */}
        <div id="s5-privacy" className="h-full flex flex-col p-6 lg:p-10">
          <div className="shrink-0 mb-4">
            <span className="text-xs font-black uppercase tracking-widest text-[#8b5cf6]">{t('privacy.eyebrow')}</span>
            <h2 className="text-2xl lg:text-3xl font-bold text-foreground mt-1">{t('privacy.heading')}</h2>
            <p className="text-sm text-muted-foreground mt-1 max-w-4xl">{t('privacy.subtitle')}</p>
            <div className="mt-2">
              <RecapHandoff label={recapLabel} text={t('privacy.recapCypherpunk')} to="/blockchain-fundamentals/prologue" color="#ED1C24" />
            </div>
          </div>

          <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Left — what a normal vs shielded tx exposes */}
            <div className="flex flex-col gap-3 min-h-0">
              <div className="flex-1 rounded-xl border-2 p-3" style={{ borderColor: '#ef444450', backgroundColor: '#ef44440a' }}>
                <p className="text-xs font-black uppercase tracking-widest text-[#ef4444] mb-1.5">{t('privacy.normalLabel')}</p>
                <div className="font-mono text-xs text-foreground space-y-0.5">
                  <div>from <span className="text-[#ef4444]">0xA1b2…</span></div>
                  <div>to&nbsp;&nbsp; <span className="text-[#ef4444]">0xC3d4…</span></div>
                  <div>value <span className="text-[#ef4444]">12.5 ETH</span></div>
                </div>
                <p className="text-xs text-muted-foreground mt-1.5">{t('privacy.normalCaption')}</p>
              </div>
              <div className="flex-1 rounded-xl border-2 p-3" style={{ borderColor: '#39B54A50', backgroundColor: '#39B54A0a' }}>
                <p className="text-xs font-black uppercase tracking-widest text-[#39B54A] mb-1.5">{t('privacy.shieldedLabel')}</p>
                <div className="font-mono text-xs text-foreground space-y-0.5">
                  <div>from <span className="text-[#39B54A]">••••••</span></div>
                  <div>to&nbsp;&nbsp; <span className="text-[#39B54A]">••••••</span></div>
                  <div>value <span className="text-[#39B54A]">••••••</span> <span className="text-[#39B54A]">{t('privacy.shieldedProof')}</span></div>
                </div>
                <p className="text-xs text-muted-foreground mt-1.5">{t('privacy.shieldedCaption')}</p>
              </div>
            </div>

            {/* Right — the trail + why a business cares */}
            <div className="flex flex-col gap-3 min-h-0">
              <div className="flex-1 rounded-xl border border-border bg-card p-3 flex flex-col">
                <p className="text-xs font-black uppercase tracking-widest text-[#8b5cf6] mb-2">{t('privacy.traceLabel')}</p>
                <div className="flex-1 flex flex-col lg:flex-row items-stretch gap-1.5">
                  {privacyTrace.map((n, i) => (
                    <div key={n.who} className="flex-1 flex items-center gap-1.5 min-w-0">
                      <div className="flex-1 rounded-lg border px-2 py-1.5 min-w-0" style={{ borderColor: i === 0 ? '#ef444480' : '#8b5cf640', backgroundColor: i === 0 ? '#ef44440d' : 'transparent' }}>
                        <div className="text-base leading-none">{privacyTraceMeta[i % privacyTraceMeta.length]}</div>
                        <div className="text-[11px] font-bold text-foreground leading-tight mt-1">{n.who}</div>
                        <div className="text-[10px] text-muted-foreground leading-snug">{n.note}</div>
                      </div>
                      {i < privacyTrace.length - 1 && <span className="hidden lg:block text-muted-foreground shrink-0">→</span>}
                    </div>
                  ))}
                </div>
                <p className="text-[11px] text-muted-foreground mt-2 leading-snug">{t('privacy.traceCaption')}</p>
              </div>
              <div className="shrink-0 rounded-xl border p-3" style={{ borderColor: '#f59e0b50', backgroundColor: '#f59e0b0a' }}>
                <p className="text-[10px] font-black uppercase tracking-widest text-[#f59e0b] mb-1">{t('privacy.businessLabel')}</p>
                <ul className="grid grid-cols-1 lg:grid-cols-3 gap-1.5">
                  {privacyBusiness.map((b) => (
                    <li key={b} className="text-xs text-foreground leading-snug flex gap-1.5"><span className="text-[#f59e0b]">•</span>{b}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* The core difficulty + the trick */}
          <div className="shrink-0 mt-4 grid grid-cols-1 lg:grid-cols-2 gap-3">
            <div className="rounded-xl border-2 p-3" style={{ borderColor: '#8b5cf680', backgroundColor: '#8b5cf60d' }}>
              <p className="text-[10px] font-black uppercase tracking-widest text-[#8b5cf6] mb-1">{t('privacy.difficultyLabel')}</p>
              <p className="text-sm text-foreground leading-snug">{t('privacy.difficultyA')}<span className="font-semibold">{t('privacy.difficultyStrong')}</span>{t('privacy.difficultyB')}</p>
            </div>
            <div className="rounded-xl border p-3 bg-card">
              <p className="text-sm text-foreground leading-snug">
                {t('privacy.trickA')}<span className="font-semibold text-[#8b5cf6]">{t('privacy.trickStrong1')}</span>{t('privacy.trickB')}<span className="font-semibold">{t('privacy.trickStrong2')}</span>{t('privacy.trickC')}<span className="font-semibold">{t('privacy.trickStrong3')}</span>{t('privacy.trickD')}<span className="font-semibold">{t('privacy.trickStrong4')}</span>{t('privacy.trickE')}
              </p>
              <p className="text-xs text-muted-foreground mt-1">{t('privacy.trickCaption')}</p>
            </div>
          </div>
          {kp('s5-privacy')}
        </div>

        {/* ═══════ S5-PRIVACY-APPROACHES — the four families ═══════ */}
        <div id="s5-privacy-approaches" className="h-full flex flex-col p-6 lg:p-10">
          <div className="shrink-0 mb-4">
            <span className="text-xs font-black uppercase tracking-widest text-[#8b5cf6]">{t('privacyApproaches.eyebrow')}</span>
            <h2 className="text-2xl lg:text-3xl font-bold text-foreground mt-1">{t('privacyApproaches.heading')}</h2>
            <p className="text-sm text-muted-foreground mt-1">{t('privacyApproaches.subtitle')}</p>
          </div>

          <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-2 gap-4">
            {privacyApproaches.map((p, i) => {
              const { icon, color } = privacyApproachMeta[i];
              return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3 }}
                className="flex flex-col gap-2.5 rounded-xl border-2 p-4 justify-center"
                style={{ borderColor: color + '50', backgroundColor: color + '0a' }}
              >
                <div className="flex items-center gap-3">
                  <span className="text-3xl">{icon}</span>
                  <div>
                    <div className="font-black text-lg" style={{ color }}>{p.name}</div>
                    <div className="text-xs text-muted-foreground">{p.sub}</div>
                  </div>
                </div>
                <p className="text-sm text-foreground leading-relaxed"><span className="font-semibold" style={{ color }}>{t('privacyApproaches.howLabel')}</span>{p.mech}</p>
                <p className="text-sm text-muted-foreground leading-relaxed"><span className="font-semibold">{t('privacyApproaches.tradeLabel')}</span>{p.trade}</p>
              </motion.div>
            );})}
          </div>
          <div className="shrink-0 mt-3">
            <UnderTheHood label={hoodLabel} terms={['zk-SNARK', 'ring signature', 'stealth address', 'nullifier', 'anonymity set']} />
          </div>
          {kp('s5-privacy-approaches')}
        </div>

        {/* ═══════ S5-PRIVACY-REGULATION — the contested frontier ═══════ */}
        <div id="s5-privacy-regulation" className="h-full flex flex-col p-6 lg:p-10">
          <div className="shrink-0 mb-4">
            <span className="text-xs font-black uppercase tracking-widest text-[#f59e0b]">{t('privacyRegulation.eyebrow')}</span>
            <h2 className="text-2xl lg:text-3xl font-bold text-foreground mt-1">{t('privacyRegulation.heading')}</h2>
            <p className="text-sm text-muted-foreground mt-1">{t('privacyRegulation.subtitle')}</p>
            <div className="mt-2">
              <RecapHandoff label={recapLabel} text={t('privacyRegulation.recapFreedom')} to="/blockchain-fundamentals/prologue" color="#ED1C24" />
            </div>
          </div>

          {/* Timeline — five beats */}
          <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-5 gap-2.5">
            {privacyStory.map((s, i) => {
              const c = privacyStoryColors[i % privacyStoryColors.length];
              return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3, delay: i * 0.06 }}
                className="flex flex-col gap-1.5 rounded-xl border-2 p-3 min-h-0"
                style={{ borderColor: c + '55', backgroundColor: c + '0a' }}
              >
                <span className="text-[10px] font-black uppercase tracking-widest" style={{ color: c }}>{s.yr}</span>
                <p className="font-bold text-foreground text-base leading-tight">{s.t}</p>
                <p className="text-sm text-muted-foreground leading-snug flex-1">{s.d}</p>
              </motion.div>
            );})}
          </div>

          {/* Two truths + the cypherpunk tie-back */}
          <div className="shrink-0 mt-3 grid grid-cols-1 lg:grid-cols-3 gap-3">
            <div className="rounded-xl border-2 p-3 flex flex-col gap-1" style={{ borderColor: '#ef444450', backgroundColor: '#ef44440a' }}>
              <p className="text-[10px] font-black uppercase tracking-widest text-[#ef4444]">⚖️ {t('privacyRegulation.truthsLabel')} · 1</p>
              <p className="text-xs text-foreground leading-snug">{t('privacyRegulation.truthA')}</p>
            </div>
            <div className="rounded-xl border-2 p-3 flex flex-col gap-1" style={{ borderColor: '#39B54A50', backgroundColor: '#39B54A0a' }}>
              <p className="text-[10px] font-black uppercase tracking-widest text-[#39B54A]">⚖️ {t('privacyRegulation.truthsLabel')} · 2</p>
              <p className="text-xs text-foreground leading-snug">{t('privacyRegulation.truthB')}</p>
            </div>
            <div className="rounded-xl border-2 p-3 flex flex-col gap-1" style={{ borderColor: '#ED1C2460', backgroundColor: '#ED1C240a' }}>
              <p className="text-[10px] font-black uppercase tracking-widest text-[#ED1C24]">🔁 {t('privacyRegulation.cypherpunkLabel')}</p>
              <p className="text-xs text-foreground leading-snug">{t('privacyRegulation.cypherpunk')}</p>
            </div>
          </div>

          <div className="shrink-0 mt-3 rounded-xl border p-2.5" style={{ borderColor: '#39B54A50', backgroundColor: '#39B54A0d' }}>
            <p className="text-xs text-foreground leading-snug">
              <span className="font-bold text-[#39B54A]">{t('privacyRegulation.guidanceLabel')}</span>
              {t('privacyRegulation.guidanceA')}<span className="font-semibold">{t('privacyRegulation.guidanceStrong1')}</span>{t('privacyRegulation.guidanceB')}<span className="font-semibold">{t('privacyRegulation.guidanceStrong2')}</span>{t('privacyRegulation.guidanceC')}
            </p>
          </div>
          {kp('s5-privacy-regulation', '#f59e0b')}
        </div>

        {/* ═══════ S5-PRIVACY-FUTURE — the upside of ZK privacy ═══════ */}
        <div id="s5-privacy-future" className="h-full flex flex-col p-6 lg:p-10">
          <div className="shrink-0 mb-4">
            <span className="text-xs font-black uppercase tracking-widest text-[#8b5cf6]">{t('privacyFuture.eyebrow')}</span>
            <h2 className="text-2xl lg:text-3xl font-bold text-foreground mt-1">{t('privacyFuture.heading')}</h2>
            <p className="text-sm text-muted-foreground mt-1">{t('privacyFuture.subtitleA')}<span className="font-semibold">{t('privacyFuture.subtitleStrong')}</span>{t('privacyFuture.subtitleB')}</p>
          </div>

          <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-2 gap-4">
            {privacyFutureItems.map((c, i) => {
              const { icon, color } = privacyFutureMeta[i];
              return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3 }}
                className="flex gap-4 items-start rounded-xl border-2 p-5 justify-center flex-col"
                style={{ borderColor: color + '50', backgroundColor: color + '0a' }}
              >
                <div className="flex items-center gap-3">
                  <span className="text-3xl">{icon}</span>
                  <p className="font-black text-lg" style={{ color }}>{c.title}</p>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">{c.d}</p>
              </motion.div>
            );})}
          </div>

          <div className="shrink-0 mt-4 rounded-xl border-2 p-4 text-center" style={{ borderColor: '#8b5cf680', backgroundColor: '#8b5cf60d' }}>
            <p className="text-base text-foreground leading-snug">
              {t('privacyFuture.bannerA')}<span className="font-semibold">{t('privacyFuture.bannerStrong1')}</span>{t('privacyFuture.bannerB')}<span className="font-semibold text-[#8b5cf6]">{t('privacyFuture.bannerStrong2')}</span>{t('privacyFuture.bannerC')}
            </p>
          </div>
          {kp('s5-privacy-future')}
        </div>

        {/* ═══════ EVALUATE A PROJECT — part 1 ═══════ */}
        <div id="s5-evaluate" className="h-full flex flex-col p-6 lg:p-10">
          <div className="shrink-0 mb-4">
            <span className="text-xs font-black uppercase tracking-widest text-[#06b6d4]">{t('evaluate.eyebrow')}</span>
            <h2 className="text-2xl lg:text-3xl font-bold text-foreground mt-1">{t('evaluate.heading')}</h2>
            <p className="text-sm text-muted-foreground mt-1">{t('evaluate.subtitle')}</p>
          </div>

          <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-3 gap-4">
            {evaluateAxes.map((c, idx) => {
              const { icon, color } = evaluateMeta[idx];
              return (
              <motion.div key={idx} initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.3 }}
                className="flex flex-col gap-3 rounded-xl border-2 p-4" style={{ borderColor: color + '50', backgroundColor: color + '08' }}>
                <div className="flex items-center gap-2.5">
                  <span className="text-2xl">{icon}</span>
                  <div className="font-black text-base leading-tight" style={{ color }}>{c.title}</div>
                </div>
                <div className="flex-1 rounded-lg border p-3" style={{ borderColor: '#39B54A40', backgroundColor: '#39B54A08' }}>
                  <div className="text-xs font-black uppercase tracking-widest mb-1.5 text-[#39B54A]">{t('evaluate.greenLabel')}</div>
                  <ul className="space-y-1">{c.green.map((g,i)=>(<li key={i} className="text-sm text-muted-foreground leading-snug flex gap-1.5"><span className="text-[#39B54A]">·</span>{g}</li>))}</ul>
                </div>
                <div className="flex-1 rounded-lg border p-3" style={{ borderColor: '#ED1C2440', backgroundColor: '#ED1C2408' }}>
                  <div className="text-xs font-black uppercase tracking-widest mb-1.5 text-[#ED1C24]">{t('evaluate.redLabel')}</div>
                  <ul className="space-y-1">{c.red.map((r,i)=>(<li key={i} className="text-sm text-muted-foreground leading-snug flex gap-1.5"><span className="text-[#ED1C24]">·</span>{r}</li>))}</ul>
                </div>
              </motion.div>
            );})}
          </div>
          {kp('s5-evaluate', '#06b6d4')}
        </div>

        {/* ═══════ EVALUATE A PROJECT — part 2 ═══════ */}
        <div id="s5-evaluate-2" className="h-full flex flex-col p-6 lg:p-10">
          <div className="shrink-0 mb-4">
            <span className="text-xs font-black uppercase tracking-widest text-[#06b6d4]">{t('evaluate2.eyebrow')}</span>
            <h2 className="text-2xl lg:text-3xl font-bold text-foreground mt-1">{t('evaluate2.heading')}</h2>
            <p className="text-sm text-muted-foreground mt-1">{t('evaluate2.subtitle')}</p>
          </div>

          <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-3 gap-4">
            {evaluate2Axes.map((c, idx) => {
              const { icon, color } = evaluate2Meta[idx];
              return (
              <motion.div key={idx} initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.3 }}
                className="flex flex-col gap-3 rounded-xl border-2 p-4" style={{ borderColor: color + '50', backgroundColor: color + '08' }}>
                <div className="flex items-center gap-2.5">
                  <span className="text-2xl">{icon}</span>
                  <div className="font-black text-base leading-tight" style={{ color }}>{c.title}</div>
                </div>
                <div className="flex-1 rounded-lg border p-3" style={{ borderColor: '#39B54A40', backgroundColor: '#39B54A08' }}>
                  <div className="text-xs font-black uppercase tracking-widest mb-1.5 text-[#39B54A]">{t('evaluate2.greenLabel')}</div>
                  <ul className="space-y-1">{c.green.map((g,i)=>(<li key={i} className="text-sm text-muted-foreground leading-snug flex gap-1.5"><span className="text-[#39B54A]">·</span>{g}</li>))}</ul>
                </div>
                <div className="flex-1 rounded-lg border p-3" style={{ borderColor: '#ED1C2440', backgroundColor: '#ED1C2408' }}>
                  <div className="text-xs font-black uppercase tracking-widest mb-1.5 text-[#ED1C24]">{t('evaluate2.redLabel')}</div>
                  <ul className="space-y-1">{c.red.map((r,i)=>(<li key={i} className="text-sm text-muted-foreground leading-snug flex gap-1.5"><span className="text-[#ED1C24]">·</span>{r}</li>))}</ul>
                </div>
              </motion.div>
            );})}
          </div>

          <div className="shrink-0 mt-4 rounded-xl border p-3" style={{ borderColor: '#06b6d455', backgroundColor: '#06b6d40d' }}>
            <p className="text-sm text-muted-foreground leading-snug">
              <span className="font-bold text-[#06b6d4]">{t('evaluate2.toolsLabel')}</span>
              <Trans
                t={t}
                i18nKey="evaluate2.toolsBody"
                components={Array.from({ length: 5 }, (_, k) => <span key={k} className="font-medium text-foreground" />)}
              />
            </p>
          </div>
          {kp('s5-evaluate-2', '#06b6d4')}
        </div>

        {/* ═══════ DECISION FRAMEWORK — Interactive wizard ═══════ */}
        <div id="s5-decision" className="h-full">
          <PlatformRecommender />
        </div>

        {/* ═══════ DECISION EXAMPLES — Worked Examples ═══════ */}
        <div id="s5-decision-examples" className="h-full flex flex-col p-6 lg:p-10">
          <div className="shrink-0 mb-4">
            <h2 className="text-2xl lg:text-3xl font-bold text-foreground">{t('decisionExamples.heading')}</h2>
            <p className="text-sm text-muted-foreground mt-1">{t('decisionExamples.subtitle')}</p>
          </div>

          <div className="flex-1 min-h-0 grid grid-cols-2 gap-3">
            {decisionItems.map((c, i, arr) => {
              const color = decisionColors[i];
              return (
              <div
                key={i}
                className={`rounded-xl border p-4 min-h-0 flex flex-col gap-1.5${i === arr.length - 1 && arr.length % 2 !== 0 ? ' col-span-2' : ''}`}
                style={{ borderColor: color + '50', backgroundColor: color + '08' }}
              >
                <div className="text-xs font-black uppercase tracking-wider leading-tight" style={{ color }}>{c.use}</div>
                <div className="text-base font-bold text-foreground leading-snug">→ {c.rec}</div>
                <div className="text-sm text-muted-foreground italic leading-snug">{c.why}</div>
              </div>
            );})}
          </div>
          {kp('s5-decision-examples', '#6366f1')}
        </div>

        {/* ═══════ QUIZ — Optimistic vs ZK withdrawal latency ═══════ */}
        <div id="s5-quiz" className="h-full">
          <QuizSlide
            question={t('quiz.question')}
            options={quizOptions.map((text, i) => ({ text, correct: i === 1 }))}
            explanation={t('quiz.explanation')}
          />
        </div>

        {/* ═══════ QUIZ 2 — Sovereignty vs shared security ═══════ */}
        <div id="s5-quiz-2" className="h-full">
          <QuizSlide
            question={t('quiz2.question')}
            options={quiz2Options.map((text, i) => ({ text, correct: i === 1 }))}
            explanation={t('quiz2.explanation')}
          />
        </div>

        {/* ═══════ TAKEAWAYS ═══════ */}
        <div id="s5-takeaways" className="h-full">
          <TakeawaySlide
            title={t('takeaways.title')}
            takeaways={takeawayItems}
          />
        </div>

        {/* ═══════ DISCUSSION — in-class, no deliverable ═══════ */}
        <div id="s5-discussion" className="h-full flex flex-col p-6 lg:p-10">
          <div className="shrink-0 mb-4 flex items-start gap-4">
            <div className="size-12 lg:size-14 shrink-0 rounded-full bg-gradient-to-br from-[#8b5cf6] to-[#ec4899] flex items-center justify-center shadow-lg shadow-[#8b5cf6]/30">
              <MessageCircle className="size-6 lg:size-7 text-white" strokeWidth={2} />
            </div>
            <div>
              <span className="text-xs font-black uppercase tracking-widest text-[#8b5cf6]">{t('discussion.eyebrow')}</span>
              <h2 className="text-2xl lg:text-3xl font-bold text-foreground mt-1">{t('discussion.prompt')}</h2>
              <p className="text-sm text-muted-foreground mt-1 max-w-4xl">{t('discussion.subtitle')}</p>
            </div>
          </div>

          <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-3 gap-4">
            {discussionScenarios.map((sc, i) => {
              const { icon, color } = discussionMeta[i % discussionMeta.length];
              return (
                <motion.div
                  key={sc.title}
                  initial={{ opacity: 0, y: 12 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.3, delay: i * 0.06 }}
                  className="rounded-xl border-2 p-5 flex flex-col gap-3 justify-center min-h-0"
                  style={{ borderColor: color + '55', backgroundColor: color + '0a' }}
                >
                  <span className="text-4xl leading-none">{icon}</span>
                  <p className="text-[10px] font-black uppercase tracking-widest" style={{ color }}>{t('discussion.scenarioLabel', { n: i + 1 })}</p>
                  <p className="text-lg font-bold text-foreground leading-tight">{sc.title}</p>
                  <p className="text-sm text-muted-foreground leading-relaxed">{sc.desc}</p>
                </motion.div>
              );
            })}
          </div>

          <div className="shrink-0 mt-4 rounded-xl border border-border bg-card p-4">
            <p className="text-[10px] font-black uppercase tracking-widest text-[#39B54A] mb-2">💡 {t('discussion.thinkLabel')}</p>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
              {discussionQuestions.map((q, i) => (
                <div key={q} className="flex items-start gap-2.5">
                  <div className="size-6 rounded-full bg-[#8b5cf6]/15 flex items-center justify-center shrink-0 mt-0.5"><span className="text-xs text-[#8b5cf6] font-black">{i + 1}</span></div>
                  <p className="text-sm text-foreground leading-snug">{q}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        </div>
        <SiteFooter className="snap-start" />
      </div>
    </div>
  );
}
