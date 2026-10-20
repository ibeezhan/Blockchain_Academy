import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router';
import { useTranslation } from 'react-i18next';
import { trackEvent } from '../../analytics';
import {
  motion,
  AnimatePresence,
  useMotionValue,
  useTransform,
  type PanInfo,
} from 'motion/react';
import {
  X,
  Check,
  ArrowRight,
  RotateCcw,
  Sparkles,
  Unplug,
  Users,
  Share2,
  EyeOff,
  Coins,
  ScanEye,
  Lock,
  Database,
  type LucideIcon,
} from 'lucide-react';
import { useLang } from '../../../i18n/useLang';

/* ------------------------------------------------------------------ */
/*  Scoring model                                                      */
/*                                                                     */
/*  All copy lives in the `blockchain-check` i18n namespace; the logic */
/*  (which answer pushes which axis, and how the axes map to a result) */
/*  lives here so it can be reasoned about and tuned in one place.     */
/* ------------------------------------------------------------------ */

type Axis = 'need' | 'permissioned' | 'public' | 'token';
type Scores = Record<Axis, number>;

interface Question {
  /** Matches the key under `questions.<id>` in the locale file. */
  id: string;
  icon: LucideIcon;
  /** Accent color for the card (brand palette). */
  color: string;
  yes: Partial<Scores>;
  no: Partial<Scores>;
}

/**
 * The funnel. Order matters narratively (broad "is there friction?" first,
 * the honest "would a plain DB do?" last) but not for scoring.
 */
const QUESTIONS: Question[] = [
  {
    id: 'intermediary',
    icon: Unplug,
    color: '#ED1C24',
    yes: { need: 2, public: 1 },
    no: {},
  },
  {
    id: 'multiParty',
    icon: Users,
    color: '#6366f1',
    yes: { need: 2, permissioned: 1 },
    no: { need: -1 },
  },
  {
    id: 'shareData',
    icon: Share2,
    color: '#39B54A',
    yes: { need: 1, permissioned: 2 },
    no: {},
  },
  {
    id: 'confidential',
    icon: EyeOff,
    color: '#0ea5e9',
    yes: { permissioned: 2 },
    no: { public: 2 },
  },
  {
    id: 'tokenize',
    icon: Coins,
    color: '#f59e0b',
    yes: { need: 2, public: 1, token: 3 },
    no: {},
  },
  {
    id: 'publicVerify',
    icon: ScanEye,
    color: '#8b5cf6',
    yes: { need: 1, public: 2 },
    no: { permissioned: 1 },
  },
  {
    id: 'immutable',
    icon: Lock,
    color: '#14b8a6',
    yes: { need: 2, permissioned: 1 },
    no: { need: -1 },
  },
  {
    id: 'centralDb',
    icon: Database,
    color: '#64748b',
    yes: { need: -3 },
    no: { need: 1 },
  },
];

type ResultKey = 'not-needed' | 'permissioned' | 'public-evm' | 'public-general';

interface ResultMeta {
  key: ResultKey;
  color: string;
  /** Course slug to recommend, or null for the "not needed" outcome. */
  courseSlug: string;
}

const RESULT_META: Record<ResultKey, ResultMeta> = {
  'not-needed': { key: 'not-needed', color: '#64748b', courseSlug: 'blockchain-fundamentals' },
  permissioned: { key: 'permissioned', color: '#39B54A', courseSlug: 'blockchain-platforms' },
  'public-evm': { key: 'public-evm', color: '#6366f1', courseSlug: 'smart-contracts' },
  'public-general': { key: 'public-general', color: '#ED1C24', courseSlug: 'blockchain-fundamentals' },
};

function resolveResult(s: Scores): ResultKey {
  // Not enough friction → a plain database wins. Honest by design.
  if (s.need <= 3) return 'not-needed';
  // Tokenisation / open asset markets → public EVM.
  if (s.token >= 3 || (s.public >= 4 && s.public > s.permissioned)) return 'public-evm';
  // Known parties + confidentiality → permissioned / consortium.
  if (s.permissioned >= s.public) return 'permissioned';
  // Public verifiability / disintermediation, no tokenisation.
  return 'public-general';
}

/** Map the running `need` score to a friendly 0–100 fit percentage. */
function fitScore(need: number): number {
  const clamped = Math.max(0, Math.min(10, need));
  return Math.round((clamped / 10) * 100);
}

const EMPTY_SCORES: Scores = { need: 0, permissioned: 0, public: 0, token: 0 };

function applyDelta(scores: Scores, delta: Partial<Scores>): Scores {
  const next = { ...scores };
  (Object.keys(delta) as Axis[]).forEach((axis) => {
    next[axis] += delta[axis] ?? 0;
  });
  return next;
}

/* ------------------------------------------------------------------ */
/*  Swipe card                                                         */
/* ------------------------------------------------------------------ */

interface SwipeCardProps {
  question: Question;
  onDecide: (yes: boolean) => void;
}

const SWIPE_THRESHOLD = 110;

function SwipeCard({ question, onDecide }: SwipeCardProps) {
  const { t } = useTranslation('blockchain-check');
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-220, 220], [-14, 14]);
  const yesOpacity = useTransform(x, [20, 130], [0, 1]);
  const noOpacity = useTransform(x, [-130, -20], [1, 0]);
  const Icon = question.icon;

  const handleDragEnd = (_e: unknown, info: PanInfo) => {
    if (info.offset.x > SWIPE_THRESHOLD || info.velocity.x > 600) {
      onDecide(true);
    } else if (info.offset.x < -SWIPE_THRESHOLD || info.velocity.x < -600) {
      onDecide(false);
    }
  };

  return (
    <motion.div
      className="absolute inset-0 cursor-grab active:cursor-grabbing"
      style={{ x, rotate }}
      drag="x"
      dragSnapToOrigin
      dragElastic={0.5}
      dragConstraints={{ left: 0, right: 0 }}
      onDragEnd={handleDragEnd}
      initial={{ scale: 0.92, y: 24, opacity: 0 }}
      animate={{ scale: 1, y: 0, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 320, damping: 28 }}
    >
      <div
        className="relative h-full w-full rounded-3xl border bg-card p-6 shadow-2xl flex flex-col overflow-hidden select-none"
        style={{ borderColor: question.color + '55' }}
      >
        {/* Accent glow */}
        <div
          className="absolute -top-16 -right-16 size-48 rounded-full blur-3xl opacity-20 pointer-events-none"
          style={{ background: question.color }}
        />

        {/* YES / NO drag stamps */}
        <motion.div
          style={{ opacity: yesOpacity, color: '#10b981', borderColor: '#10b981' }}
          className="absolute top-6 left-6 z-10 -rotate-12 rounded-lg border-[3px] px-3 py-1 text-xl font-black uppercase tracking-wider"
        >
          {t('ui.yes')}
        </motion.div>
        <motion.div
          style={{ opacity: noOpacity, color: '#ef4444', borderColor: '#ef4444' }}
          className="absolute top-6 right-6 z-10 rotate-12 rounded-lg border-[3px] px-3 py-1 text-xl font-black uppercase tracking-wider"
        >
          {t('ui.no')}
        </motion.div>

        {/* Icon */}
        <div
          className="size-14 rounded-2xl flex items-center justify-center mb-5 shadow-lg shrink-0"
          style={{ background: question.color }}
        >
          <Icon className="size-7 text-white" />
        </div>

        {/* Title */}
        <h3 className="text-2xl font-black text-foreground mb-3 leading-tight">
          {t(`questions.${question.id}.title`)}
        </h3>

        {/* Example */}
        <div
          className="rounded-xl border p-3 mb-4 text-sm leading-relaxed text-muted-foreground"
          style={{ background: question.color + '0d', borderColor: question.color + '33' }}
        >
          <span className="font-bold uppercase text-[11px] tracking-wider" style={{ color: question.color }}>
            {t('ui.example')}
          </span>
          <p className="mt-1">{t(`questions.${question.id}.example`)}</p>
        </div>

        {/* The question */}
        <p className="mt-auto text-lg font-semibold text-foreground leading-snug">
          {t(`questions.${question.id}.question`)}
        </p>
      </div>
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/*  Result screen                                                      */
/* ------------------------------------------------------------------ */

interface ResultScreenProps {
  scores: Scores;
  onRestart: () => void;
}

function ResultScreen({ scores, onRestart }: ResultScreenProps) {
  const { t } = useTranslation('blockchain-check');
  const lang = useLang();
  const resultKey = resolveResult(scores);
  const meta = RESULT_META[resultKey];
  const score = fitScore(scores.need);

  return (
    <motion.div
      key="result"
      initial={{ opacity: 0, scale: 0.94 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: 'spring', stiffness: 260, damping: 26 }}
      className="h-full w-full rounded-3xl border bg-card shadow-2xl flex flex-col overflow-hidden"
      style={{ borderColor: meta.color + '55' }}
    >
      {/* Header band */}
      <div className="relative p-6 pb-5 overflow-hidden" style={{ background: meta.color + '14' }}>
        <div
          className="absolute -top-16 -right-10 size-44 rounded-full blur-3xl opacity-25 pointer-events-none"
          style={{ background: meta.color }}
        />
        <span
          className="inline-block text-[11px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full mb-3"
          style={{ background: meta.color, color: '#fff' }}
        >
          {t(`results.${resultKey}.tag`)}
        </span>
        <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
          {t('ui.result')}
        </p>
        <h3 className="text-2xl font-black text-foreground leading-tight mt-1">
          {t(`results.${resultKey}.title`)}
        </h3>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto p-6 pt-5 space-y-5">
        {/* Fit score bar */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              {t('ui.scoreLabel')}
            </span>
            <span className="text-sm font-black" style={{ color: meta.color }}>
              {score}%
            </span>
          </div>
          <div className="h-2.5 w-full rounded-full bg-muted overflow-hidden">
            <motion.div
              className="h-full rounded-full"
              style={{ background: meta.color }}
              initial={{ width: 0 }}
              animate={{ width: `${score}%` }}
              transition={{ delay: 0.2, duration: 0.7, ease: 'easeOut' }}
            />
          </div>
        </div>

        <p className="text-sm leading-relaxed text-foreground">
          {t(`results.${resultKey}.summary`)}
        </p>

        {/* Why */}
        <div className="rounded-xl border border-border bg-muted/40 p-4">
          <p className="text-[11px] font-black uppercase tracking-wider text-muted-foreground mb-1.5">
            {t('ui.why')}
          </p>
          <p className="text-sm leading-relaxed text-muted-foreground">
            {t(`results.${resultKey}.why`)}
          </p>
        </div>
      </div>

      {/* Footer actions */}
      <div className="p-5 pt-3 border-t border-border flex flex-col gap-2">
        <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
          {t('ui.recommendedCourse')}
        </p>
        <Link
          to={`/${lang}/${meta.courseSlug}`}
          className="flex items-center justify-between gap-2 rounded-xl px-4 py-3 font-bold text-white shadow-lg transition-transform hover:-translate-y-0.5"
          style={{ background: meta.color }}
        >
          {t('ui.goToCourse')}
          <ArrowRight className="size-4" />
        </Link>
        <button
          type="button"
          onClick={onRestart}
          className="flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 font-semibold text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
        >
          <RotateCcw className="size-4" />
          {t('ui.restart')}
        </button>
      </div>
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/*  Game modal                                                         */
/* ------------------------------------------------------------------ */

type Phase = 'intro' | 'playing' | 'result';

interface BlockchainCheckGameProps {
  open: boolean;
  onClose: () => void;
}

export function BlockchainCheckGame({ open, onClose }: BlockchainCheckGameProps) {
  const { t } = useTranslation('blockchain-check');
  const [phase, setPhase] = useState<Phase>('intro');
  const [index, setIndex] = useState(0);
  const [scores, setScores] = useState<Scores>(EMPTY_SCORES);

  const reset = useCallback(() => {
    setPhase('intro');
    setIndex(0);
    setScores(EMPTY_SCORES);
  }, []);

  // Reset whenever the modal is (re)opened so it always starts fresh.
  useEffect(() => {
    if (open) reset();
  }, [open, reset]);

  const decide = useCallback(
    (yes: boolean) => {
      setScores((prev) => {
        const q = QUESTIONS[index];
        return applyDelta(prev, yes ? q.yes : q.no);
      });
      setIndex((prev) => {
        const next = prev + 1;
        if (next >= QUESTIONS.length) {
          setPhase('result');
        }
        return next;
      });
    },
    [index],
  );

  // GA4: report completion once the final scores have been committed.
  useEffect(() => {
    if (phase !== 'result') return;
    trackEvent('blockchain_check_complete', {
      score: fitScore(scores.need),
      result: resolveResult(scores),
    });
  }, [phase, scores]);

  // Lock background scroll + wire Escape / arrow keys while open.
  useEffect(() => {
    if (!open) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (phase === 'playing') {
        if (e.key === 'ArrowRight') decide(true);
        if (e.key === 'ArrowLeft') decide(false);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener('keydown', onKey);
    };
  }, [open, phase, decide, onClose]);

  const currentQuestion = QUESTIONS[index];
  const total = QUESTIONS.length;
  const progressPct = useMemo(
    () => Math.round((index / total) * 100),
    [index, total],
  );

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-background/80 backdrop-blur-sm"
            onClick={onClose}
          />
          {/* Brand grid texture */}
          <div className="absolute inset-0 bg-[linear-gradient(rgba(237,28,36,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(237,28,36,0.05)_1px,transparent_1px)] bg-[size:50px_50px] pointer-events-none" />

          <motion.div
            className="relative z-10 w-full max-w-[420px] h-[600px] max-h-[88vh] flex flex-col"
            initial={{ scale: 0.95, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.95, y: 20 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          >
            {/* Close */}
            <button
              type="button"
              onClick={onClose}
              aria-label={t('ui.close')}
              className="absolute -top-3 -right-3 z-30 size-9 rounded-full bg-card border border-border shadow-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:scale-105 transition"
            >
              <X className="size-4" />
            </button>

            {/* Progress (only while playing) */}
            {phase === 'playing' && (
              <div className="mb-3 shrink-0">
                <div className="flex items-center justify-between mb-1.5 px-1">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                    {t('ui.progress', { current: index + 1, total })}
                  </span>
                </div>
                <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
                  <motion.div
                    className="h-full rounded-full bg-primary"
                    animate={{ width: `${progressPct}%` }}
                    transition={{ type: 'spring', stiffness: 200, damping: 30 }}
                  />
                </div>
              </div>
            )}

            {/* Stage */}
            <div className="relative flex-1 min-h-0">
              <AnimatePresence mode="wait">
                {phase === 'intro' && (
                  <motion.div
                    key="intro"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="h-full w-full rounded-3xl border border-border bg-card shadow-2xl flex flex-col items-center justify-center text-center p-8 overflow-hidden"
                  >
                    <div className="absolute -top-20 -right-16 size-56 rounded-full blur-3xl opacity-15 bg-primary pointer-events-none" />
                    <div className="size-16 rounded-2xl bg-gradient-to-br from-[#ED1C24] to-[#6366f1] flex items-center justify-center mb-6 shadow-xl">
                      <Sparkles className="size-8 text-white" />
                    </div>
                    <h3 className="text-2xl font-black text-foreground mb-3">
                      {t('ui.intro.title')}
                    </h3>
                    <p className="text-sm text-muted-foreground leading-relaxed mb-6 max-w-xs">
                      {t('ui.intro.body')}
                    </p>
                    <div className="flex flex-col gap-2 mb-7 text-sm">
                      <div className="flex items-center gap-2 text-foreground">
                        <span className="size-6 rounded-full bg-[#10b981]/15 text-[#10b981] flex items-center justify-center shrink-0">
                          <Check className="size-3.5" />
                        </span>
                        {t('ui.intro.rule1')}
                      </div>
                      <div className="flex items-center gap-2 text-foreground">
                        <span className="size-6 rounded-full bg-[#ef4444]/15 text-[#ef4444] flex items-center justify-center shrink-0">
                          <X className="size-3.5" />
                        </span>
                        {t('ui.intro.rule2')}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setPhase('playing')}
                      className="flex items-center gap-2 rounded-xl bg-primary px-7 py-3 font-bold text-primary-foreground shadow-lg hover:-translate-y-0.5 transition-transform"
                    >
                      {t('ui.intro.start')}
                      <ArrowRight className="size-4" />
                    </button>
                  </motion.div>
                )}

                {phase === 'playing' && currentQuestion && (
                  <SwipeCard
                    key={currentQuestion.id}
                    question={currentQuestion}
                    onDecide={decide}
                  />
                )}

                {phase === 'result' && (
                  <ResultScreen scores={scores} onRestart={reset} />
                )}
              </AnimatePresence>
            </div>

            {/* Yes / No buttons (only while playing) */}
            {phase === 'playing' && (
              <div className="mt-4 shrink-0">
                <div className="flex items-center justify-center gap-5">
                  <button
                    type="button"
                    onClick={() => decide(false)}
                    aria-label={t('ui.no')}
                    className="size-16 rounded-full bg-card border-2 border-[#ef4444]/40 text-[#ef4444] flex items-center justify-center shadow-lg hover:bg-[#ef4444] hover:text-white hover:scale-105 transition"
                  >
                    <X className="size-7" strokeWidth={3} />
                  </button>
                  <button
                    type="button"
                    onClick={() => decide(true)}
                    aria-label={t('ui.yes')}
                    className="size-16 rounded-full bg-card border-2 border-[#10b981]/40 text-[#10b981] flex items-center justify-center shadow-lg hover:bg-[#10b981] hover:text-white hover:scale-105 transition"
                  >
                    <Check className="size-7" strokeWidth={3} />
                  </button>
                </div>
                <p className="text-center text-[11px] text-muted-foreground mt-3">
                  {t('ui.swipeHint')}
                </p>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
