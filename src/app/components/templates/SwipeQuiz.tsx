import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  motion,
  AnimatePresence,
  useMotionValue,
  useTransform,
  type PanInfo,
} from 'motion/react';
import { Check, X, ArrowRight, RotateCcw } from 'lucide-react';
import { trackEvent } from '../../analytics';

/* ------------------------------------------------------------------ */
/*  SwipeQuiz — a Tinder-style True/False quiz for use inside a slide. */
/*                                                                     */
/*  Mirrors the role of QuizSlide but for binary statements: the user  */
/*  swipes right for TRUE, left for FALSE (or taps the buttons), gets  */
/*  instant feedback with an explanation, and a score at the end.      */
/*                                                                     */
/*  Arrow keys are intentionally NOT bound — inside a slide deck the   */
/*  global slide navigation owns ← / →. Swipe + buttons only.          */
/* ------------------------------------------------------------------ */

export interface SwipeStatement {
  /** The claim shown on the card. */
  text: string;
  /** Whether the claim is actually true. */
  isTrue: boolean;
  /** Why — revealed after the user answers. */
  explanation?: string;
}

interface SwipeQuizProps {
  /** Optional prompt shown above the deck. Defaults to the namespace instruction. */
  question?: string;
  statements: SwipeStatement[];
}

const SWIPE_THRESHOLD = 100;

interface CardProps {
  statement: SwipeStatement;
  trueLabel: string;
  falseLabel: string;
  onDecide: (answeredTrue: boolean) => void;
}

function StatementCard({ statement, trueLabel, falseLabel, onDecide }: CardProps) {
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-220, 220], [-12, 12]);
  const trueOpacity = useTransform(x, [20, 120], [0, 1]);
  const falseOpacity = useTransform(x, [-120, -20], [1, 0]);

  const handleDragEnd = (_e: unknown, info: PanInfo) => {
    if (info.offset.x > SWIPE_THRESHOLD || info.velocity.x > 600) onDecide(true);
    else if (info.offset.x < -SWIPE_THRESHOLD || info.velocity.x < -600) onDecide(false);
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
      initial={{ scale: 0.92, y: 20, opacity: 0 }}
      animate={{ scale: 1, y: 0, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 320, damping: 28 }}
    >
      <div className="relative h-full w-full rounded-3xl border-2 border-[#6366f1]/40 bg-card p-6 shadow-2xl flex flex-col items-center justify-center text-center overflow-hidden select-none">
        <motion.div
          style={{ opacity: trueOpacity, color: '#10b981', borderColor: '#10b981' }}
          className="absolute top-5 left-5 -rotate-12 rounded-lg border-[3px] px-3 py-1 text-lg font-black uppercase tracking-wider"
        >
          {trueLabel}
        </motion.div>
        <motion.div
          style={{ opacity: falseOpacity, color: '#ef4444', borderColor: '#ef4444' }}
          className="absolute top-5 right-5 rotate-12 rounded-lg border-[3px] px-3 py-1 text-lg font-black uppercase tracking-wider"
        >
          {falseLabel}
        </motion.div>
        <p className="text-lg lg:text-xl font-semibold text-foreground leading-snug">{statement.text}</p>
      </div>
    </motion.div>
  );
}

export function SwipeQuiz({ question, statements }: SwipeQuizProps) {
  const { t } = useTranslation('swipe-quiz');
  const total = statements.length;

  const [index, setIndex] = useState(0);
  const [revealed, setRevealed] = useState<boolean | null>(null); // the answer the user gave
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);

  const current = statements[index];
  const wasCorrect = revealed !== null && current && revealed === current.isTrue;

  const decide = useCallback(
    (answeredTrue: boolean) => {
      if (revealed !== null) return;
      setRevealed(answeredTrue);
      const correct = !!current && answeredTrue === current.isTrue;
      if (correct) setScore((s) => s + 1);
      trackEvent('quiz_answer', {
        quiz: question ?? current?.text,
        quiz_type: 'swipe_true_false',
        correct,
      });
    },
    [revealed, current, question],
  );

  const advance = () => {
    const next = index + 1;
    setRevealed(null);
    if (next >= total) {
      setFinished(true);
      trackEvent('swipe_quiz_complete', { quiz: question, score, total });
    } else setIndex(next);
  };

  const restart = () => {
    setIndex(0);
    setRevealed(null);
    setScore(0);
    setFinished(false);
  };

  const messageKey =
    score === total ? 'resultPerfect' : score >= Math.ceil(total * 0.6) ? 'resultGood' : 'resultMixed';

  return (
    <div className="slide-template w-full items-center justify-center p-5 lg:p-10">
      <div className="w-full max-w-md flex flex-col items-center">
        {/* Header */}
        <div className="text-center mb-4">
          <div className="inline-block px-4 py-1.5 rounded-full bg-[#6366f1]/20 border border-[#6366f1] mb-2">
            <span className="text-[#6366f1] font-bold text-sm">{t('badge')}</span>
          </div>
          <p className="text-sm text-muted-foreground max-w-sm">{question ?? t('instruction')}</p>
        </div>

        {/* Stage */}
        <div className="relative w-full h-[300px] sm:h-[340px]">
          <AnimatePresence mode="wait">
            {finished ? (
              <motion.div
                key="result"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="absolute inset-0 rounded-3xl border-2 border-[#6366f1]/40 bg-card shadow-2xl flex flex-col items-center justify-center text-center p-6"
              >
                <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">{t('scoreLabel')}</p>
                <div className="flex items-baseline gap-2 mt-1 mb-2">
                  <span className="text-5xl font-black text-[#6366f1]">{score}</span>
                  <span className="text-2xl font-bold text-muted-foreground">/ {total}</span>
                </div>
                <p className="text-sm font-semibold text-foreground mb-5">{t(messageKey)}</p>
                <button
                  type="button"
                  onClick={restart}
                  className="flex items-center gap-2 rounded-xl bg-[#6366f1] px-6 py-2.5 font-bold text-white shadow-lg hover:-translate-y-0.5 transition-transform"
                >
                  <RotateCcw className="size-4" />
                  {t('restart')}
                </button>
              </motion.div>
            ) : revealed !== null ? (
              <motion.div
                key={`feedback-${index}`}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="absolute inset-0 rounded-3xl border-2 bg-card shadow-2xl flex flex-col p-5 overflow-hidden"
                style={{ borderColor: wasCorrect ? '#10b98188' : '#ef444488' }}
              >
                <div className="flex items-center gap-2 mb-2">
                  {wasCorrect ? (
                    <Check className="size-6 text-[#10b981]" strokeWidth={3} />
                  ) : (
                    <X className="size-6 text-[#ef4444]" strokeWidth={3} />
                  )}
                  <span className={`font-black uppercase tracking-wider ${wasCorrect ? 'text-[#10b981]' : 'text-[#ef4444]'}`}>
                    {wasCorrect ? t('correct') : t('incorrect')}
                  </span>
                  <span className="ml-auto text-xs font-bold text-muted-foreground">
                    {current.isTrue ? t('true') : t('false')}
                  </span>
                </div>
                <p className="text-sm font-semibold text-foreground leading-snug mb-2">{current.text}</p>
                {current.explanation && (
                  <p className="text-[13px] text-muted-foreground leading-relaxed overflow-y-auto">{current.explanation}</p>
                )}
                <button
                  type="button"
                  onClick={advance}
                  className="mt-auto shrink-0 flex items-center justify-center gap-2 rounded-xl bg-foreground px-5 py-2.5 font-bold text-background shadow-lg hover:-translate-y-0.5 transition-transform"
                >
                  {index + 1 >= total ? t('finish') : t('next')}
                  <ArrowRight className="size-4" />
                </button>
              </motion.div>
            ) : (
              <StatementCard
                key={`card-${index}`}
                statement={current}
                trueLabel={t('true')}
                falseLabel={t('false')}
                onDecide={decide}
              />
            )}
          </AnimatePresence>
        </div>

        {/* Controls */}
        {!finished && revealed === null && (
          <>
            <div className="mt-5 flex items-center justify-center gap-5">
              <button
                type="button"
                onClick={() => decide(false)}
                aria-label={t('false')}
                className="size-14 rounded-full bg-card border-2 border-[#ef4444]/40 text-[#ef4444] flex items-center justify-center shadow-lg hover:bg-[#ef4444] hover:text-white hover:scale-105 transition"
              >
                <X className="size-6" strokeWidth={3} />
              </button>
              <span className="text-xs font-bold text-muted-foreground tabular-nums">
                {t('progress', { current: index + 1, total })}
              </span>
              <button
                type="button"
                onClick={() => decide(true)}
                aria-label={t('true')}
                className="size-14 rounded-full bg-card border-2 border-[#10b981]/40 text-[#10b981] flex items-center justify-center shadow-lg hover:bg-[#10b981] hover:text-white hover:scale-105 transition"
              >
                <Check className="size-6" strokeWidth={3} />
              </button>
            </div>
            <div className="mt-2 flex items-center justify-center gap-6 text-[11px] font-semibold uppercase tracking-wider">
              <span className="text-[#ef4444]">← {t('false')}</span>
              <span className="text-[#10b981]">{t('true')} →</span>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
