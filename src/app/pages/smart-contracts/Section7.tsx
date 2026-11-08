import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'motion/react';
import { SectionNav } from '../../components/navigation/SectionNav';
import { SiteFooter } from '../../components/shared/SiteFooter';
import { TitleSlide } from '../../components/templates/TitleSlide';
import { DiscussionSlide } from '../../components/templates/DiscussionSlide';
import { UnderTheHood } from '../../components/shared/UnderTheHood';
import { ClipboardList, Check } from 'lucide-react';

// Language-neutral shape — IDs + kind only. Labels come from t() at render time.
const chapterShape = [
  { kind: 'group' as const, id: 'g-brief' },
  { id: 's7-brief' },
  { id: 's7-three-parts' },

  { kind: 'group' as const, id: 'g-work' },
  { id: 's7-problem-bank' },
  { id: 's7-lens' },
  { id: 's7-report' },

  { kind: 'group' as const, id: 'g-wrap' },
  { id: 's7-discussion' },
  { id: 's7-rubric' },
] as const;

const STAT_COLORS = ['#6366f1', '#8b5cf6', '#39B54A', '#f59e0b'];
const FLOW_COLORS = ['#6366f1', '#8b5cf6', '#22d3ee', '#39B54A'];
const PART_COLORS = ['#ED1C24', '#6366f1', '#39B54A'];
const PART_EMOJI = ['🩹', '⚙️', '⚖️'];
const PROBLEM_EMOJI = ['🎓', '🎟️', '💸', '🤝', '🌱', '🍼', '🧑‍💻', '🏛️'];
const PROBLEM_COLORS = ['#22d3ee', '#8b5cf6', '#6366f1', '#39B54A', '#10b981', '#f59e0b', '#ec4899', '#a855f7'];
const RUBRIC_COLORS = ['#ED1C24', '#6366f1', '#39B54A', '#8b5cf6'];

interface Stat { label: string; value: string; note: string }
interface FlowStep { step: string; time: string; desc: string }
interface Part { num: string; title: string; words: string; lead: string; prompts: string[] }
interface Problem { title: string; sector: string; actors: string; friction: string; angle: string; alternative: string }
interface LensCheck { label: string; hint: string }
interface SubmissionItem { label: string; value: string; note: string }
interface Criterion { label: string; weight: string; desc: string }

// ─── Interactive: Problem starters ───────────────────────────────────────────

function ProblemBank() {
  const { t } = useTranslation('smart-contracts/section-7');
  const items = t('problemBank.items', { returnObjects: true }) as Problem[];
  const [selected, setSelected] = useState<number | null>(null);
  const sel = selected !== null ? items[selected] : null;
  const color = selected !== null ? PROBLEM_COLORS[selected] : '#6366f1';

  return (
    <div className="h-full flex flex-col p-6 lg:p-8">
      <div className="shrink-0 mb-4">
        <span className="px-2.5 py-0.5 rounded-full bg-[#6366f1]/15 border border-[#6366f1]/40 text-[#6366f1] text-xs font-bold">{t('problemBank.badge')}</span>
        <h2 className="text-2xl font-bold text-foreground mt-1">{t('problemBank.heading')}</h2>
        <p className="text-muted-foreground text-sm">{t('problemBank.subtitle')}</p>
      </div>

      <div className="flex-1 min-h-0 grid grid-cols-[1.1fr_1fr] gap-5">
        <div className="grid grid-cols-2 gap-2.5 content-center">
          {items.map((p, i) => {
            const active = i === selected;
            const c = PROBLEM_COLORS[i];
            return (
              <motion.button
                key={i}
                onClick={() => setSelected(i)}
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.98 }}
                className="text-left p-3 rounded-xl border-2 transition-colors flex items-start gap-2.5"
                style={{ borderColor: active ? c : 'var(--border)', backgroundColor: active ? c + '14' : 'var(--card)' }}
              >
                <span className="text-xl shrink-0">{PROBLEM_EMOJI[i]}</span>
                <span className="min-w-0">
                  <span className="block text-[10px] font-bold uppercase tracking-widest" style={{ color: c }}>{p.sector}</span>
                  <span className="block font-bold text-sm text-foreground leading-tight">{p.title}</span>
                </span>
              </motion.button>
            );
          })}
        </div>

        <div className="min-h-0 flex flex-col">
          {!sel ? (
            <div className="flex-1 flex items-center justify-center text-center border border-dashed border-border rounded-2xl">
              <div className="text-muted-foreground">
                <div className="text-5xl mb-3">👈</div>
                <p className="text-sm">{t('problemBank.selectPrompt')}</p>
              </div>
            </div>
          ) : (
            <AnimatePresence mode="wait">
              <motion.div
                key={selected}
                initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }}
                className="flex-1 min-h-0 flex flex-col gap-2.5 p-4 rounded-2xl border-2 bg-card overflow-y-auto"
                style={{ borderColor: color + '60' }}
              >
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{PROBLEM_EMOJI[selected!]}</span>
                  <div className="font-black text-base text-foreground">{sel.title}</div>
                </div>
                {[
                  { label: t('problemBank.actorsLabel'), body: sel.actors, c: '#6366f1' },
                  { label: t('problemBank.frictionLabel'), body: sel.friction, c: '#ED1C24' },
                  { label: t('problemBank.angleLabel'), body: sel.angle, c: '#39B54A' },
                  { label: t('problemBank.alternativeLabel'), body: sel.alternative, c: '#f59e0b' },
                ].map((row) => (
                  <div key={row.label} className="p-2.5 rounded-lg border-l-2" style={{ borderColor: row.c, backgroundColor: row.c + '0d' }}>
                    <div className="text-[10px] font-bold uppercase tracking-widest" style={{ color: row.c }}>{row.label}</div>
                    <div className="text-xs text-foreground leading-snug mt-0.5">{row.body}</div>
                  </div>
                ))}
              </motion.div>
            </AnimatePresence>
          )}
          <div className="shrink-0 mt-3 p-2.5 rounded-xl border border-border bg-muted/30 text-xs text-muted-foreground">
            <span className="font-semibold text-foreground">{t('problemBank.ownLabel')}</span>{t('problemBank.ownBody')}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Interactive: Blockchain lens checklist ──────────────────────────────────

function BlockchainLens() {
  const { t } = useTranslation('smart-contracts/section-7');
  const checks = t('lens.checks', { returnObjects: true }) as LensCheck[];
  const [ticked, setTicked] = useState<boolean[]>(() => checks.map(() => false));
  const count = ticked.filter(Boolean).length;
  const verdict: 'sc' | 'hybrid' | 'db' = count >= 5 ? 'sc' : count >= 3 ? 'hybrid' : 'db';
  const vColor = verdict === 'sc' ? '#39B54A' : verdict === 'hybrid' ? '#f59e0b' : '#ED1C24';

  return (
    <div className="h-full flex flex-col p-6 lg:p-8">
      <div className="shrink-0 mb-4 flex items-start justify-between gap-4">
        <div>
          <span className="px-2.5 py-0.5 rounded-full bg-[#39B54A]/15 border border-[#39B54A]/40 text-[#39B54A] text-xs font-bold">{t('lens.badge')}</span>
          <h2 className="text-2xl font-bold text-foreground mt-1">{t('lens.heading')}</h2>
          <p className="text-muted-foreground text-sm">{t('lens.subtitle')}</p>
        </div>
        {count > 0 && (
          <button onClick={() => setTicked(checks.map(() => false))} className="shrink-0 px-3 py-1.5 rounded-lg bg-muted text-xs font-semibold text-muted-foreground hover:bg-muted/80 transition-colors">{t('lens.reset')}</button>
        )}
      </div>

      <div className="flex-1 min-h-0 grid grid-cols-[1.4fr_1fr] gap-5">
        <div className="flex flex-col gap-2 justify-center">
          {checks.map((c, i) => {
            const on = ticked[i];
            return (
              <button
                key={i}
                onClick={() => setTicked(prev => prev.map((v, j) => (j === i ? !v : v)))}
                className="flex items-start gap-3 p-3 rounded-xl border-2 text-left transition-colors"
                style={{ borderColor: on ? '#39B54A' : 'var(--border)', backgroundColor: on ? '#39B54A12' : 'var(--card)' }}
              >
                <span className="size-6 rounded-md border-2 flex items-center justify-center shrink-0 mt-0.5" style={{ borderColor: on ? '#39B54A' : 'var(--muted-foreground)', backgroundColor: on ? '#39B54A' : 'transparent' }}>
                  {on && <Check className="size-4 text-white" strokeWidth={3} />}
                </span>
                <span className="min-w-0">
                  <span className="block text-sm font-semibold text-foreground leading-snug">{c.label}</span>
                  <span className="block text-xs text-muted-foreground mt-0.5">{c.hint}</span>
                </span>
              </button>
            );
          })}
        </div>

        <div className="flex flex-col gap-3 justify-center">
          <motion.div
            key={verdict}
            initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }}
            className="p-6 rounded-2xl border-4 bg-card text-center flex flex-col gap-3"
            style={{ borderColor: vColor }}
          >
            <div className="text-xs font-bold uppercase tracking-widest" style={{ color: vColor }}>{t('lens.scoreLabel', { count, total: checks.length })}</div>
            <div className="flex justify-center gap-1.5">
              {checks.map((_, i) => (
                <div key={i} className="h-2 w-8 rounded-full" style={{ backgroundColor: i < count ? vColor : 'var(--muted)' }} />
              ))}
            </div>
            <div className="text-xl font-black text-foreground leading-tight">{t(`lens.verdicts.${verdict}.title`)}</div>
            <p className="text-sm text-muted-foreground leading-relaxed">{t(`lens.verdicts.${verdict}.desc`)}</p>
          </motion.div>
          <div className="p-2.5 rounded-xl border border-border bg-muted/30 text-xs text-muted-foreground italic">{t('lens.footnote')}</div>
        </div>
      </div>
    </div>
  );
}

export function SC_Section7() {
  const { t } = useTranslation('smart-contracts/section-7');

  const chapters = useMemo(
    () =>
      chapterShape.map((c) =>
        'kind' in c
          ? { kind: 'group' as const, id: c.id, label: t(`groups.${c.id}`) }
          : { id: c.id, label: t(`chapters.${c.id}`) }
      ),
    [t]
  );

  const stats = t('brief.stats', { returnObjects: true }) as Stat[];
  const flow = t('brief.flow', { returnObjects: true }) as FlowStep[];
  const parts = t('parts.items', { returnObjects: true }) as Part[];
  const submission = t('report.submission', { returnObjects: true }) as SubmissionItem[];
  const strong = t('report.strong', { returnObjects: true }) as string[];
  const questions = t('discussion.questions', { returnObjects: true }) as string[];
  const criteria = t('rubric.criteria', { returnObjects: true }) as Criterion[];

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
            icon={<ClipboardList className="size-20 text-[#6366f1]" />}
            gradient="from-[#39B54A] to-[#6366f1]"
          />
        </div>

        {/* ═══════ AT A GLANCE ═══════ */}
        <div id="s7-brief" className="h-full flex flex-col p-6 lg:p-10">
          <div className="shrink-0 mb-5">
            <span className="text-xs font-black uppercase tracking-widest text-[#6366f1]">{t('brief.badge')}</span>
            <h2 className="text-2xl lg:text-3xl font-bold text-foreground mt-1">{t('brief.heading')}</h2>
            <p className="text-muted-foreground text-sm mt-1">{t('brief.subtitle')}</p>
          </div>

          <div className="flex-1 min-h-0 grid grid-cols-[1fr_1.3fr] gap-5">
            <div className="flex flex-col gap-3">
              <div className="grid grid-cols-2 gap-3">
                {stats.map((s, i) => (
                  <div key={s.label} className="p-3 bg-card border rounded-xl" style={{ borderColor: STAT_COLORS[i] + '40' }}>
                    <div className="text-[10px] font-bold uppercase tracking-widest" style={{ color: STAT_COLORS[i] }}>{s.label}</div>
                    <div className="font-black text-lg text-foreground mt-1 leading-tight">{s.value}</div>
                    <div className="text-[10px] text-muted-foreground mt-0.5">{s.note}</div>
                  </div>
                ))}
              </div>
              <div className="flex-1 p-4 rounded-xl border border-[#6366f1]/30 text-sm" style={{ backgroundColor: '#6366f10f' }}>
                <span className="font-bold text-[#6366f1]">{t('brief.mindsetLabel')}</span>
                <span className="text-muted-foreground">{t('brief.mindsetBody')}</span>
              </div>
            </div>

            <div className="flex flex-col gap-2 min-h-0">
              <div className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">{t('brief.flowLabel')}</div>
              {flow.map((f, i) => (
                <motion.div
                  key={f.step}
                  initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.07 }}
                  className="flex-1 flex items-center gap-3 p-3 bg-card border rounded-xl"
                  style={{ borderColor: FLOW_COLORS[i] + '40' }}
                >
                  <div className="size-9 rounded-lg flex items-center justify-center text-white font-black text-sm shrink-0" style={{ backgroundColor: FLOW_COLORS[i] }}>{i + 1}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline justify-between gap-2">
                      <div className="font-bold text-sm text-foreground">{f.step}</div>
                      <div className="text-[11px] font-mono shrink-0" style={{ color: FLOW_COLORS[i] }}>{f.time}</div>
                    </div>
                    <div className="text-xs text-muted-foreground leading-snug">{f.desc}</div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        {/* ═══════ THE THREE PARTS ═══════ */}
        <div id="s7-three-parts" className="h-full flex flex-col p-6 lg:p-10">
          <div className="shrink-0 mb-5">
            <h2 className="text-2xl lg:text-3xl font-bold text-foreground">{t('parts.heading')}</h2>
            <p className="text-muted-foreground text-sm mt-1">{t('parts.subtitle')}</p>
          </div>

          <div className="flex-1 min-h-0 grid grid-cols-3 gap-4">
            {parts.map((p, i) => {
              const color = PART_COLORS[i];
              return (
                <div key={p.num} className="flex flex-col rounded-2xl border-2 bg-card overflow-hidden" style={{ borderColor: color + '50' }}>
                  <div className="h-1.5" style={{ backgroundColor: color }} />
                  <div className="flex-1 flex flex-col gap-3 p-4">
                    <div className="flex items-center gap-3">
                      <div className="size-10 rounded-xl flex items-center justify-center text-white text-lg font-black shrink-0" style={{ backgroundColor: color }}>{p.num}</div>
                      <div className="min-w-0">
                        <div className="font-black text-base text-foreground leading-tight">{p.title}</div>
                        <div className="text-[11px] font-mono" style={{ color }}>{t('parts.wordsLabel', { words: p.words })} · {PART_EMOJI[i]}</div>
                      </div>
                    </div>
                    <div className="text-sm font-semibold text-foreground/90 italic">{p.lead}</div>
                    <ul className="space-y-2 text-xs text-muted-foreground flex-1">
                      {p.prompts.map((q, j) => (
                        <li key={j} className="flex gap-2 leading-snug"><span className="shrink-0 mt-0.5 font-bold" style={{ color }}>›</span><span>{q}</span></li>
                      ))}
                    </ul>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="shrink-0 mt-4 p-3 rounded-xl border border-border bg-muted/30 text-center text-xs text-muted-foreground">{t('parts.footer')}</div>
        </div>

        {/* ═══════ PROBLEM STARTERS ═══════ */}
        <div id="s7-problem-bank" className="h-full">
          <ProblemBank />
        </div>

        {/* ═══════ BLOCKCHAIN LENS ═══════ */}
        <div id="s7-lens" className="h-full">
          <BlockchainLens />
        </div>

        {/* ═══════ THE 1-PAGE REPORT ═══════ */}
        <div id="s7-report" className="h-full flex flex-col p-6 lg:p-10">
          <div className="shrink-0 mb-4">
            <h2 className="text-2xl lg:text-3xl font-bold text-foreground">{t('report.heading')}</h2>
            <p className="text-muted-foreground text-sm mt-1">{t('report.subtitle')}</p>
          </div>

          <div className="flex-1 min-h-0 grid grid-cols-[1fr_1.1fr] gap-6">
            {/* Mock page */}
            <div className="min-h-0 flex items-center justify-center">
              <div className="w-full max-w-sm h-full max-h-full bg-white text-[#111] rounded-md shadow-xl border border-border p-5 flex flex-col gap-2.5 overflow-hidden" style={{ aspectRatio: '1 / 1.3' }}>
                <div className="text-[9px] uppercase tracking-widest text-[#6366f1] font-bold">{t('report.pageTitle')}</div>
                <div className="text-[9px] text-[#555] border-b border-[#ddd] pb-1.5">{t('report.pageGroup')}</div>
                {[t('report.pageProblemTitle'), t('report.pageSolutionTitle')].map((title, i) => (
                  <div key={title} className="flex flex-col gap-1">
                    <div className="text-[11px] font-black" style={{ color: PART_COLORS[i] }}>{title}</div>
                    {[100, 92, 96, 70].map((w, k) => <div key={k} className="h-1.5 rounded bg-[#e5e5e5]" style={{ width: `${w}%` }} />)}
                  </div>
                ))}
                <div className="flex flex-col gap-1 flex-1">
                  <div className="text-[11px] font-black text-[#39B54A]">{t('report.pageProsConsTitle')}</div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <div className="text-[9px] font-bold text-[#39B54A]">{t('report.pageProsLabel')}</div>
                      {[90, 80, 85].map((w, k) => <div key={k} className="h-1.5 rounded bg-[#e5e5e5] mt-1" style={{ width: `${w}%` }} />)}
                    </div>
                    <div>
                      <div className="text-[9px] font-bold text-[#ED1C24]">{t('report.pageConsLabel')}</div>
                      {[85, 95, 75].map((w, k) => <div key={k} className="h-1.5 rounded bg-[#e5e5e5] mt-1" style={{ width: `${w}%` }} />)}
                    </div>
                  </div>
                </div>
                <div className="mt-auto p-2 rounded border border-[#6366f1]/40 bg-[#6366f1]/08 text-[10px]" style={{ backgroundColor: 'rgba(99,102,241,0.08)' }}>
                  <span className="font-black text-[#6366f1]">{t('report.pageVerdictLabel')} </span>
                  <span className="text-[#555] italic">{t('report.pageVerdictPlaceholder')}</span>
                </div>
              </div>
            </div>

            {/* Submission + checklist */}
            <div className="flex flex-col gap-3 min-h-0">
              <div className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">{t('report.submissionLabel')}</div>
              <div className="grid grid-cols-2 gap-2.5">
                {submission.map((s) => (
                  <div key={s.label} className="p-3 bg-card border border-border rounded-xl">
                    <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{s.label}</div>
                    <div className="font-bold text-sm text-foreground mt-0.5">{s.value}</div>
                    <div className="text-[10px] text-muted-foreground">{s.note}</div>
                  </div>
                ))}
              </div>
              <div className="flex-1 min-h-0 p-4 bg-card border border-[#39B54A]/30 rounded-xl flex flex-col">
                <div className="text-xs font-bold text-[#39B54A] uppercase tracking-widest mb-2">{t('report.strongLabel')}</div>
                <ul className="space-y-1.5 text-xs text-muted-foreground overflow-y-auto">
                  {strong.map((s, i) => (
                    <li key={i} className="flex gap-2 leading-snug"><Check className="size-3.5 text-[#39B54A] shrink-0 mt-0.5" strokeWidth={3} /><span>{s}</span></li>
                  ))}
                </ul>
              </div>
              <UnderTheHood terms={['trigger', 'state', 'on-chain vs off-chain', 'oracle', 'multisig']} />
            </div>
          </div>
        </div>

        {/* ═══════ CLASS DISCUSSION ═══════ */}
        <div id="s7-discussion" className="h-full">
          <DiscussionSlide prompt={t('discussion.prompt')} guidingQuestions={questions} />
        </div>

        {/* ═══════ RUBRIC ═══════ */}
        <div id="s7-rubric" className="h-full flex flex-col p-6 lg:p-10">
          <div className="shrink-0 mb-5">
            <h2 className="text-2xl lg:text-3xl font-bold text-foreground">{t('rubric.heading')}</h2>
            <p className="text-muted-foreground text-sm mt-1">{t('rubric.subtitle')}</p>
          </div>

          <div className="flex-1 min-h-0 grid grid-cols-2 gap-4 content-center">
            {criteria.map((c, i) => {
              const color = RUBRIC_COLORS[i];
              return (
                <div key={c.label} className="flex items-stretch gap-3 p-4 bg-card border rounded-xl" style={{ borderColor: color + '40' }}>
                  <div className="w-2 rounded-full shrink-0" style={{ backgroundColor: color }} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <div className="font-black text-base text-foreground">{c.label}</div>
                      <div className="font-black text-lg shrink-0" style={{ color }}>{c.weight}</div>
                    </div>
                    <div className="text-sm text-muted-foreground mt-1 leading-snug">{c.desc}</div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="shrink-0 mt-4 p-3 rounded-xl border border-[#6366f1]/30 text-sm" style={{ backgroundColor: '#6366f10f' }}>
            <span className="font-bold text-[#6366f1]">{t('rubric.noteLabel')}</span>
            <span className="text-muted-foreground">{t('rubric.noteBody')}</span>
          </div>
        </div>

        </div>
        <SiteFooter className="snap-start" />
      </div>
    </div>
  );
}
