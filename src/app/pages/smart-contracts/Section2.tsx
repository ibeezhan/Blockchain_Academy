import { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'motion/react';
import { TitleSlide } from '../../components/templates/TitleSlide';
import { TakeawaySlide } from '../../components/templates/TakeawaySlide';
import { QuizSlide } from '../../components/templates/QuizSlide';
import { SectionNav } from '../../components/navigation/SectionNav';
import { SiteFooter } from '../../components/shared/SiteFooter';
import { Cog, Check, X } from 'lucide-react';

import imgDisintermediation from '../../../assets/sc/disintermediation.png';
import imgDappStack         from '../../../assets/sc/dapp-stack.png';

// Language-neutral shape — only IDs. Labels come from t() at render time.
const chapterIds = [
  's2-web3',
  's2-dapp',
  's2-ex-stack',
  's2-vs',
  's2-vs-2',
  's2-standards',
  's2-components',
  's2-workflow',
  's2-solidity',
  's2-execution',
  's2-capabilities',
  's2-why',
  's2-gas',
  's2-ex-gas',
  's2-reshape',
  's2-quiz',
  's2-takeaways',
  's2-summary',
] as const;

// ─── Exercise: Gas Ranking ───────────────────────────────────────────────────

// Language-neutral data — color/order/numeric constants only. Text via t().
const GAS_OPS = [
  { id: 0, gasUnits: 0,      color: '#39B54A' },
  { id: 1, gasUnits: 375,    color: '#6366f1' },
  { id: 2, gasUnits: 21000,  color: '#f59e0b' },
  { id: 3, gasUnits: 22100,  color: '#ED1C24' },
  { id: 4, gasUnits: 500000, color: '#8b5cf6' },
];
const CORRECT_ORDER = [0, 1, 2, 3, 4];
// Shuffled display order so the answer isn't already obvious
const DISPLAY_ORDER = [3, 0, 4, 1, 2];

interface GasOpText { label: string; detail: string; gasLabel: string; }

function GasRankingExercise() {
  const { t } = useTranslation('smart-contracts/section-2');
  const opText = t('gasExercise.ops', { returnObjects: true }) as GasOpText[];
  const [picked, setPicked]   = useState<number[]>([]);
  const [done, setDone]       = useState(false);
  const [showHint, setShowHint] = useState(false);

  const handlePick = (id: number) => {
    if (done || picked.includes(id)) return;
    const next = [...picked, id];
    setPicked(next);
    if (next.length === GAS_OPS.length) setDone(true);
  };
  const reset = () => { setPicked([]); setDone(false); setShowHint(false); };

  const isCorrect = done && picked.every((id, i) => id === CORRECT_ORDER[i]);

  return (
    <div className="h-full flex flex-col p-6 lg:p-8">
      <div className="shrink-0 flex items-center justify-between mb-5">
        <div>
          <span className="px-2.5 py-0.5 rounded-full bg-[#f59e0b]/15 border border-[#f59e0b]/40 text-[#f59e0b] text-xs font-bold">{t('gasExercise.badge')}</span>
          <h2 className="text-2xl font-bold text-foreground mt-1">{t('gasExercise.heading')}</h2>
          <p className="text-muted-foreground text-sm">{t('gasExercise.instructionA')}<span className="text-[#39B54A] font-semibold">{t('gasExercise.cheapest')}</span>{t('gasExercise.instructionB')}<span className="text-[#ED1C24] font-semibold">{t('gasExercise.expensive')}</span>{t('gasExercise.instructionC')}</p>
        </div>
        {done && <button onClick={reset} className="px-3 py-1.5 rounded-lg bg-muted text-xs font-semibold text-muted-foreground hover:bg-muted/80 transition-colors">{t('gasExercise.tryAgain')}</button>}
      </div>

      <div className="flex-1 min-h-0 flex gap-6 items-stretch">

        {/* Clickable operations */}
        <div className="flex-1 flex flex-col gap-3 justify-center">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-1">{t('gasExercise.operationsLabel')}</p>
          {DISPLAY_ORDER.map(id => {
            const op = GAS_OPS[id];
            const rank = picked.indexOf(op.id);
            const selected = rank !== -1;
            const correct  = done && picked[rank] === CORRECT_ORDER[rank];
            return (
              <motion.button
                key={op.id}
                onClick={() => handlePick(op.id)}
                disabled={selected}
                whileHover={!selected ? { x: 4 } : {}}
                whileTap={!selected ? { scale: 0.98 } : {}}
                className="flex items-center gap-3 px-4 py-3 rounded-xl border-2 text-left transition-colors"
                style={{
                  borderColor: !selected ? 'var(--border)' : done ? (correct ? '#39B54A' : '#ED1C24') : op.color + '60',
                  backgroundColor: !selected ? 'var(--card)' : done ? (correct ? '#39B54A12' : '#ED1C2412') : op.color + '12',
                  cursor: selected ? 'default' : 'pointer',
                }}
              >
                <div className="size-7 rounded-full flex items-center justify-center font-black text-sm shrink-0"
                  style={{ backgroundColor: selected ? (done ? (correct ? '#39B54A' : '#ED1C24') : op.color) : 'var(--muted)', color: selected ? 'white' : 'var(--muted-foreground)' }}>
                  {selected ? rank + 1 : '?'}
                </div>
                <div className="flex-1">
                  <div className="font-semibold text-sm text-foreground">{opText[op.id].label}</div>
                  <div className="text-xs text-muted-foreground">{opText[op.id].detail}</div>
                </div>
                {done && selected && (
                  correct
                    ? <Check className="size-4 text-[#39B54A] shrink-0" strokeWidth={3} />
                    : <X     className="size-4 text-[#ED1C24] shrink-0" strokeWidth={3} />
                )}
              </motion.button>
            );
          })}
        </div>

        {/* Answer reveal */}
        <div className="w-64 shrink-0 flex flex-col justify-center gap-3">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">
              {done ? t('gasExercise.correctRanking') : t('gasExercise.placed', { count: picked.length, total: GAS_OPS.length })}
            </p>
            {!done && (
              <button
                onClick={() => setShowHint(h => !h)}
                className="px-2.5 py-1 rounded-lg text-[10px] font-bold transition-colors"
                style={{
                  backgroundColor: showHint ? '#f59e0b20' : 'var(--muted)',
                  color: showHint ? '#f59e0b' : 'var(--muted-foreground)',
                  border: `1px solid ${showHint ? '#f59e0b60' : 'transparent'}`,
                }}
              >
                {showHint ? t('gasExercise.hideHint') : t('gasExercise.hint')}
              </button>
            )}
          </div>
          {CORRECT_ORDER.map((id, rank) => {
            const op = GAS_OPS[id];
            const visible = done || showHint;
            return (
              <motion.div
                key={id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: visible ? 1 : 0, x: 0, scale: visible ? 1 : 0.95 }}
                transition={{ delay: visible ? rank * 0.07 : 0, duration: 0.2 }}
                className="flex items-center gap-2 px-3 py-2 rounded-xl"
                style={{ backgroundColor: op.color + '15', border: `1px solid ${op.color}40` }}
              >
                <span className="text-xs font-black w-4 text-center" style={{ color: op.color }}>{rank + 1}</span>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-semibold text-foreground truncate">{opText[op.id].label}</div>
                  <div className="text-[10px] font-bold" style={{ color: op.color }}>{opText[op.id].gasLabel}</div>
                </div>
              </motion.div>
            );
          })}
          {done && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-1 p-3 rounded-xl text-center"
              style={{ backgroundColor: isCorrect ? '#39B54A15' : '#f59e0b15', border: `1px solid ${isCorrect ? '#39B54A' : '#f59e0b'}40` }}
            >
              <div className="font-black text-sm" style={{ color: isCorrect ? '#39B54A' : '#f59e0b' }}>
                {isCorrect ? t('gasExercise.perfect') : t('gasExercise.reviewOrder')}
              </div>
              <div className="text-xs text-muted-foreground mt-0.5">
                {t('gasExercise.explanation')}
              </div>
            </motion.div>
          )}
        </div>

      </div>
    </div>
  );
}

// ─── Exercise: dApp Stack ────────────────────────────────────────────────────

// Language-neutral data — IDs / emoji / color / correct-layer only. Text via t().
const LAYERS = [
  { id: 'frontend',   color: '#6366f1' },
  { id: 'blockchain', color: '#f59e0b' },
  { id: 'offchain',   color: '#39B54A' },
];

const STACK_ITEMS = [
  { id: 'metamask',  emoji: '👛', layer: 'frontend'   },
  { id: 'react',     emoji: '⚛️', layer: 'frontend'   },
  { id: 'infura',    emoji: '🔌', layer: 'blockchain' },
  { id: 'solidity',  emoji: '📜', layer: 'blockchain' },
  { id: 'evm',       emoji: '⚙️', layer: 'blockchain' },
  { id: 'pos',       emoji: '🏦', layer: 'blockchain' },
  { id: 'ipfs',      emoji: '📦', layer: 'offchain'   },
  { id: 'thegraph',  emoji: '📊', layer: 'offchain'   },
  { id: 'chainlink', emoji: '🌉', layer: 'offchain'   },
];

function DAppStackExercise() {
  const { t } = useTranslation('smart-contracts/section-2');
  const itemLabel = (id: string) => t(`stackExercise.items.${id}.label`);
  const itemInfo  = (id: string) => t(`stackExercise.items.${id}.info`);
  const [placements, setPlacements] = useState<Record<string, string>>({});
  const [revealed,   setRevealed]   = useState(false);
  const [selected,   setSelected]   = useState<string | null>(null);
  const [hover,      setHover]      = useState<string | null>(null);

  const placed   = Object.keys(placements);
  const unplaced = STACK_ITEMS.filter(i => !placed.includes(i.id));
  const allDone  = placed.length === STACK_ITEMS.length;

  const handleItemClick = (id: string) => {
    if (revealed) return;
    setSelected(id === selected ? null : id);
  };

  const handleLayerClick = (layerId: string) => {
    if (!selected || revealed) return;
    setPlacements(prev => ({ ...prev, [selected]: layerId }));
    setSelected(null);
  };

  const handleRemove = (itemId: string) => {
    if (revealed) return;
    setPlacements(prev => { const n = { ...prev }; delete n[itemId]; return n; });
  };

  const reset = () => { setPlacements({}); setRevealed(false); setSelected(null); setHover(null); };

  const score = Object.entries(placements).filter(([id, layer]) => STACK_ITEMS.find(i => i.id === id)?.layer === layer).length;

  // While placing, the clicked component's info shows; after Check answers, the hovered chip's info shows.
  const infoItem = STACK_ITEMS.find(i => i.id === (revealed ? hover : (selected ?? hover))) ?? null;

  return (
    <div className="h-full flex flex-col p-6 lg:p-8">
      <div className="shrink-0 flex items-center justify-between mb-4">
        <div>
          <span className="px-2.5 py-0.5 rounded-full bg-[#6366f1]/15 border border-[#6366f1]/40 text-[#6366f1] text-xs font-bold">{t('stackExercise.badge')}</span>
          <h2 className="text-2xl font-bold text-foreground mt-1">{t('stackExercise.heading')}</h2>
          <p className="text-muted-foreground text-sm">
            {selected ? <span className="text-[#6366f1] font-semibold">{t('stackExercise.promptSelectedA')}<span className="font-black">{itemLabel(selected)}</span></span>
              : t('stackExercise.promptIdle')}
          </p>
        </div>
        <div className="flex items-center gap-3">
          {allDone && !revealed && (
            <button onClick={() => setRevealed(true)} className="px-3 py-1.5 rounded-lg bg-[#6366f1] text-white text-xs font-bold hover:bg-[#6366f1]/90 transition-colors">{t('stackExercise.checkAnswers')}</button>
          )}
          {revealed && <button onClick={reset} className="px-3 py-1.5 rounded-lg bg-muted text-xs font-semibold text-muted-foreground hover:bg-muted/80 transition-colors">{t('stackExercise.tryAgain')}</button>}
          {revealed && <div className="font-black text-lg" style={{ color: score === STACK_ITEMS.length ? '#39B54A' : score >= 6 ? '#f59e0b' : '#ED1C24' }}>{score}/{STACK_ITEMS.length}</div>}
        </div>
      </div>

      {/* Info tip — click a component (or hover a placed one after checking) */}
      <div className="shrink-0 mb-3 rounded-xl border border-border bg-card px-4 py-2.5 min-h-[3.25rem] flex items-center">
        {infoItem ? (
          <p className="text-xs leading-snug">
            <span className="font-bold text-[#6366f1]">{infoItem.emoji} {itemLabel(infoItem.id)} — </span>
            <span className="text-muted-foreground">{itemInfo(infoItem.id)}</span>
          </p>
        ) : (
          <p className="text-xs text-muted-foreground italic">
            {revealed
              ? t('stackExercise.infoHovered')
              : t('stackExercise.infoIdle')}
          </p>
        )}
      </div>

      <div className="flex-1 min-h-0 flex gap-4">

        {/* Unplaced items */}
        <div className="w-44 shrink-0 flex flex-col gap-2">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest shrink-0">{t('stackExercise.componentsLabel')}</p>
          <div className="flex-1 min-h-0 overflow-y-auto flex flex-col gap-1.5">
            {unplaced.map(item => (
              <motion.button
                key={item.id}
                onClick={() => handleItemClick(item.id)}
                onMouseEnter={() => setHover(item.id)}
                onMouseLeave={() => setHover(null)}
                title={itemInfo(item.id)}
                whileHover={{ x: 3 }}
                whileTap={{ scale: 0.97 }}
                className="flex items-center gap-2 px-2.5 py-2 rounded-lg border-2 text-left transition-colors"
                style={{
                  borderColor: selected === item.id ? '#6366f1' : 'var(--border)',
                  backgroundColor: selected === item.id ? '#6366f115' : 'var(--card)',
                }}
              >
                <span className="text-base shrink-0">{item.emoji}</span>
                <span className="text-xs font-semibold text-foreground truncate">{itemLabel(item.id)}</span>
              </motion.button>
            ))}
            {unplaced.length === 0 && <div className="text-xs text-muted-foreground italic text-center mt-4">{t('stackExercise.allPlaced')}</div>}
          </div>
        </div>

        {/* Drop zones */}
        <div className="flex-1 min-w-0 flex flex-col gap-3">
          {LAYERS.map(layer => {
            const items = STACK_ITEMS.filter(i => placements[i.id] === layer.id);
            return (
              <motion.div
                key={layer.id}
                onClick={() => handleLayerClick(layer.id)}
                className="flex-1 rounded-xl border-2 p-3 transition-colors flex flex-col gap-2"
                style={{
                  borderColor: selected ? layer.color + '80' : layer.color + '30',
                  backgroundColor: selected ? layer.color + '08' : 'var(--card)',
                  cursor: selected ? 'pointer' : 'default',
                }}
                whileHover={selected ? { scale: 1.01 } : {}}
              >
                <div className="flex items-center gap-2 shrink-0">
                  <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: layer.color }} />
                  <span className="text-xs font-bold" style={{ color: layer.color }}>{t(`stackExercise.layers.${layer.id}.label`)}</span>
                  <span className="text-[10px] text-muted-foreground">{t(`stackExercise.layers.${layer.id}.desc`)}</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  <AnimatePresence>
                    {items.map(item => {
                      const correct = item.layer === layer.id;
                      return (
                        <motion.div
                          key={item.id}
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.8 }}
                          onClick={e => { e.stopPropagation(); handleRemove(item.id); }}
                          onMouseEnter={() => setHover(item.id)}
                          onMouseLeave={() => setHover(null)}
                          className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs font-semibold cursor-pointer"
                          style={{
                            borderColor: !revealed ? layer.color + '50' : correct ? '#39B54A' : '#ED1C24',
                            backgroundColor: !revealed ? layer.color + '12' : correct ? '#39B54A12' : '#ED1C2412',
                            color: !revealed ? 'var(--foreground)' : correct ? '#39B54A' : '#ED1C24',
                          }}
                          title={revealed ? itemInfo(item.id) : t('stackExercise.clickToUnplace')}
                        >
                          <span>{item.emoji}</span> {itemLabel(item.id)}
                          {revealed && (correct ? <Check className="size-3" strokeWidth={3} /> : <X className="size-3" strokeWidth={3} />)}
                        </motion.div>
                      );
                    })}
                  </AnimatePresence>
                  {items.length === 0 && (
                    <div className="text-[10px] text-muted-foreground italic">{selected ? t('stackExercise.clickHereToPlace') : t('stackExercise.empty')}</div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>

      </div>
    </div>
  );
}

export function SC_Section2() {
  const { t } = useTranslation('smart-contracts/section-2');

  const chapters = useMemo(
    () => chapterIds.map((id) => ({ id, label: t(`chapters.${id}`) })),
    [t]
  );

  const web3Before = t('web3.before.points', { returnObjects: true }) as string[];
  const web3After = t('web3.after.points', { returnObjects: true }) as string[];
  const web3Blocks = t('web3.buildingBlocks', { returnObjects: true }) as { label: string; desc: string }[];
  const web3BlockMeta = [
    { emoji: '📱', color: '#6366f1' },
    { emoji: '📜', color: '#8b5cf6' },
    { emoji: '🔗', color: '#39B54A' },
    { emoji: '👛', color: '#f59e0b' },
    { emoji: '🔮', color: '#ED1C24' },
  ];

  const dappPillars = t('dapp.pillars', { returnObjects: true }) as { title: string; subtitle: string; items: string[] }[];
  const dappPillarMeta = [
    { color: '#6366f1', emoji: '📜' },
    { color: '#f59e0b', emoji: '🖥️' },
    { color: '#39B54A', emoji: '🗄️' },
  ];

  const vsAppRows = t('vsApp.rows', { returnObjects: true }) as { prop: string; a: string; b: string }[];
  const vsContractRows = t('vsContract.rows', { returnObjects: true }) as { prop: string; a: string; b: string }[];

  const componentCards = t('components.cards', { returnObjects: true }) as { title: string; desc: string }[];
  const componentCardMeta = [
    { color: '#6366f1', emoji: '📋' },
    { color: '#8b5cf6', emoji: '💾' },
    { color: '#39B54A', emoji: '⚙️' },
    { color: '#f59e0b', emoji: '📡' },
    { color: '#ED1C24', emoji: '🌐' },
  ];

  const workflowSteps = t('workflow.steps', { returnObjects: true }) as { label: string; desc: string }[];
  const workflowStepMeta = [
    { step: '01', emoji: '📤', color: '#6366f1' },
    { step: '02', emoji: '⚡', color: '#8b5cf6' },
    { step: '03', emoji: '⚙️', color: '#39B54A' },
    { step: '04', emoji: '🔗', color: '#f59e0b' },
    { step: '05', emoji: '📡', color: '#ED1C24' },
  ];

  const solidityAnnotations = t('solidity.annotations', { returnObjects: true }) as { title: string; desc: string }[];
  const solidityAnnotationMeta = [
    { key: 'A', color: '#6366f1' },
    { key: 'B', color: '#79c0ff' },
    { key: 'C', color: '#ffa657' },
    { key: 'D', color: '#d2a8ff' },
    { key: 'E', color: '#f0f4f8' },
    { key: 'F', color: '#39B54A' },
    { key: 'G', color: '#f0f4f8' },
    { key: 'H', color: '#ED1C24' },
  ];

  const executionProps = t('execution.properties', { returnObjects: true }) as { title: string; subtitle: string; desc: string; examples: string[] }[];
  const executionPropMeta = [
    { color: '#6366f1', emoji: '🖥️' },
    { color: '#39B54A', emoji: '🌐' },
    { color: '#f59e0b', emoji: '📐' },
    { color: '#ED1C24', emoji: '🤝' },
  ];

  const capabilityItems = t('capabilities.items', { returnObjects: true }) as { title: string; tagline: string; example: string }[];
  const capabilityMeta = [
    { color: '#6366f1', emoji: '🧩' },
    { color: '#39B54A', emoji: '⚛️' },
    { color: '#f59e0b', emoji: '🌍' },
    { color: '#8b5cf6', emoji: '💸' },
    { color: '#ED1C24', emoji: '🛡️' },
  ];

  const whyCore = t('why.core', { returnObjects: true }) as { title: string; desc: string }[];
  const whyCoreMeta = [
    { color: '#6366f1', emoji: '🤝' },
    { color: '#39B54A', emoji: '🌍' },
    { color: '#f59e0b', emoji: '🔍' },
    { color: '#8b5cf6', emoji: '⚡' },
  ];
  const whyImpact = t('why.impact', { returnObjects: true }) as { title: string; desc: string }[];
  const whyImpactMeta = [
    { color: '#ED1C24', emoji: '💰' },
    { color: '#6366f1', emoji: '🧩' },
    { color: '#39B54A', emoji: '📜' },
    { color: '#f59e0b', emoji: '🏛️' },
  ];

  const gasFundamentals = t('gas.fundamentals', { returnObjects: true }) as { term: string; def: string }[];
  const gasFundamentalMeta = [
    { color: '#6366f1', emoji: '⛽' },
    { color: '#f59e0b', emoji: '💲' },
    { color: '#39B54A', emoji: '🔢' },
    { color: '#ED1C24', emoji: '🧾' },
  ];
  const gasIncentives = t('gas.incentives', { returnObjects: true }) as { who: string; why: string }[];
  const gasIncentiveMeta = [
    { color: '#6366f1', emoji: '👤' },
    { color: '#39B54A', emoji: '✅' },
    { color: '#f59e0b', emoji: '🌐' },
    { color: '#8b5cf6', emoji: '🔥' },
  ];
  const gasImpact = t('gas.impact', { returnObjects: true }) as { label: string; desc: string }[];
  const gasImpactMeta = [
    { color: '#ED1C24', emoji: '📈' },
    { color: '#f59e0b', emoji: '⚖️' },
    { color: '#39B54A', emoji: '🚀' },
  ];

  const reshapeCards = t('reshape.cards', { returnObjects: true }) as { title: string; desc: string }[];
  const reshapeCardMeta = [
    { num: '01', emoji: '🔓', color: '#6366f1', src: 'IBM (2019)' },
    { num: '02', emoji: '⚙️', color: '#8b5cf6', src: 'Akinsola & Mary (2025)' },
    { num: '03', emoji: '🔍', color: '#22d3ee', src: 'Nzuva (2019)' },
    { num: '04', emoji: '💰', color: '#39B54A', src: 'Perlman (2019)' },
    { num: '05', emoji: '🌐', color: '#f59e0b', src: 'Dal Mas et al. (2019)' },
  ];

  const quizOptionsText = t('quiz.options', { returnObjects: true }) as string[];
  const quizCorrect = [false, true, false, false];
  const quizOptions = quizOptionsText.map((text, i) => ({ text, correct: quizCorrect[i] }));

  const takeawayItems = t('takeaways.items', { returnObjects: true }) as string[];

  const summaryCards = t('summary.cards', { returnObjects: true }) as { title: string; summary: string }[];
  const summaryCardMeta = ['🔄', '⛽', '🏗️', '🌐', '💡', '⚖️'];

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
            icon={<Cog className="size-20 text-[#6366f1]" />}
            gradient="from-[#6366f1] to-[#8b5cf6]"
          />
        </div>

        {/* ═══════ WEB3 LANDSCAPE ═══════ */}
        <div id="s2-web3" className="h-full flex flex-col p-6 lg:p-10">
          <div className="shrink-0 mb-5">
            <h2 className="text-2xl lg:text-3xl font-bold text-foreground">{t('web3.heading')}</h2>
            <p className="text-muted-foreground text-sm mt-1">{t('web3.subtitle')}</p>
          </div>

          <div className="flex-1 min-h-0 flex flex-col gap-5">

            {/* Paradigm shift */}
            <div className="grid grid-cols-2 gap-4">
              <div className="p-5 bg-gradient-to-br from-[#ED1C24]/12 to-transparent border border-[#ED1C24]/30 rounded-xl">
                <div className="text-xs font-bold text-[#ED1C24] uppercase tracking-widest mb-3">{t('web3.before.tag')}</div>
                <div className="font-black text-lg text-foreground mb-2">{t('web3.before.title')}</div>
                <div className="space-y-2 mb-3">
                  {web3Before.map(line => (
                    <div key={line} className="text-sm text-muted-foreground flex gap-2"><span className="shrink-0">→</span>{line}</div>
                  ))}
                </div>
                <div className="text-xs text-muted-foreground italic border-t border-[#ED1C24]/20 pt-2">
                  {t('web3.before.note')}
                </div>
              </div>

              <div className="p-5 bg-gradient-to-br from-[#39B54A]/12 to-transparent border border-[#39B54A]/30 rounded-xl">
                <div className="text-xs font-bold text-[#39B54A] uppercase tracking-widest mb-3">{t('web3.after.tag')}</div>
                <div className="font-black text-lg text-foreground mb-2">{t('web3.after.title')}</div>
                <div className="space-y-2 mb-3">
                  {web3After.map(line => (
                    <div key={line} className="text-sm text-muted-foreground flex gap-2"><span className="shrink-0">→</span>{line}</div>
                  ))}
                </div>
                <div className="text-xs text-muted-foreground italic border-t border-[#39B54A]/20 pt-2">
                  {t('web3.after.note')}
                </div>
              </div>
            </div>

            {/* Implication */}
            <div className="p-4 bg-gradient-to-r from-[#6366f1]/15 to-[#8b5cf6]/10 border border-[#6366f1]/40 rounded-xl flex items-center gap-4">
              <div className="size-12 rounded-xl bg-gradient-to-br from-[#6366f1] to-[#8b5cf6] flex items-center justify-center text-white text-2xl shrink-0">⚡</div>
              <div>
                <div className="font-black text-base text-foreground">{t('web3.implication.title')}</div>
                <p className="text-sm text-muted-foreground mt-0.5">
                  {t('web3.implication.body')}
                </p>
              </div>
            </div>

            {/* Web3 stack preview */}
            <div>
              <div className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-2">{t('web3.buildingBlocksLabel')}</div>
              <div className="flex gap-3">
                {web3Blocks.map((b, i) => (
                  <div key={b.label} className="flex-1 p-3 bg-card border border-border rounded-xl text-center" style={{ borderColor: web3BlockMeta[i].color + '30' }}>
                    <div className="text-2xl mb-1">{web3BlockMeta[i].emoji}</div>
                    <div className="font-bold text-xs mb-1" style={{ color: web3BlockMeta[i].color }}>{b.label}</div>
                    <div className="text-[10px] text-muted-foreground leading-tight">{b.desc}</div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>

        {/* ═══════ dAPPS ═══════ */}
        <div id="s2-dapp" className="h-full flex flex-col p-6 lg:p-10">
          <div className="shrink-0 mb-5">
            <h2 className="text-2xl lg:text-3xl font-bold text-foreground">{t('dapp.heading')}</h2>
            <p className="text-muted-foreground text-sm mt-1">{t('dapp.subtitle')}</p>
          </div>

          <div className="flex-1 min-h-0 grid grid-cols-2 gap-5 content-center">

            {/* Left: three pillars */}
            <div className="flex flex-col gap-3">
              {dappPillars.map((p, i) => (
                <div key={p.title} className="flex-1 p-4 bg-card border border-border rounded-xl" style={{ borderColor: dappPillarMeta[i].color + '30' }}>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xl">{dappPillarMeta[i].emoji}</span>
                    <div>
                      <div className="font-black text-sm text-foreground">{p.title}</div>
                      <div className="text-xs font-semibold" style={{ color: dappPillarMeta[i].color }}>{p.subtitle}</div>
                    </div>
                  </div>
                  <ul className="space-y-1">
                    {p.items.map(item => (
                      <li key={item} className="text-xs text-muted-foreground flex gap-1.5">
                        <span style={{ color: dappPillarMeta[i].color }} className="shrink-0">›</span>{item}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            {/* Right: dApp stack diagram */}
            <div className="flex flex-col gap-3">
              <div className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">{t('dapp.stackLabel')}</div>
              <div className="shrink-0 flex items-center justify-center p-4 bg-white rounded-xl border border-border">
                <img src={imgDappStack} alt={t('dapp.stackAlt')} className="max-h-80 w-auto object-contain" />
              </div>
              <div className="shrink-0 p-2.5 bg-[#6366f1]/10 border border-[#6366f1]/25 rounded-lg text-xs text-muted-foreground">
                <span className="font-semibold text-foreground">{t('dapp.insightLabel')}</span>{t('dapp.insightBody')}
              </div>
            </div>

          </div>
        </div>

        {/* ═══════ EXERCISE: dAPP STACK ═══════ */}
        <div id="s2-ex-stack" className="h-full">
          <DAppStackExercise />
        </div>

        {/* ═══════ WEB2 vs WEB3 — APP INFRASTRUCTURE ═══════ */}
        <div id="s2-vs" className="h-full flex flex-col p-6 lg:p-10">
          <div className="shrink-0 mb-5">
            <span className="text-xs font-black uppercase tracking-widest text-[#6366f1]">{t('vsApp.kicker')}</span>
            <h2 className="text-2xl lg:text-3xl font-bold text-foreground mt-1">{t('vsApp.heading')}</h2>
            <p className="text-sm text-muted-foreground mt-1">{t('vsApp.subtitle')}</p>
          </div>

          <div className="flex-1 min-h-0 flex items-center justify-center">
            <motion.div
              initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}
              className="w-full max-w-4xl rounded-2xl border border-border bg-card overflow-hidden shadow-sm"
            >
              <div className="grid grid-cols-[1.15fr_1fr_1fr]">
                <div className="p-3.5 text-[11px] font-black uppercase tracking-widest text-muted-foreground bg-muted">{t('vsApp.propertyLabel')}</div>
                <div className="p-3.5 text-center text-sm font-black text-[#ED1C24] bg-[#ED1C24]/10 border-l border-border">{t('vsApp.colA')}</div>
                <div className="p-3.5 text-center text-sm font-black text-[#39B54A] bg-[#39B54A]/10 border-l border-border">{t('vsApp.colB')}</div>
              </div>
              {vsAppRows.map((r, i) => (
                <div key={r.prop} className={`grid grid-cols-[1.15fr_1fr_1fr] border-t border-border ${i % 2 ? 'bg-muted/30' : ''}`}>
                  <div className="px-3.5 py-3 font-semibold text-sm text-foreground">{r.prop}</div>
                  <div className="px-3.5 py-3 text-sm text-muted-foreground text-center border-l border-border">{r.a}</div>
                  <div className="px-3.5 py-3 text-sm text-foreground font-medium text-center border-l border-border bg-[#39B54A]/06" style={{ backgroundColor: 'rgba(57,181,74,0.05)' }}>{r.b}</div>
                </div>
              ))}
            </motion.div>
          </div>

          <div className="shrink-0 mt-4 rounded-xl border border-[#39B54A]/30 px-4 py-2.5 text-center text-sm" style={{ backgroundColor: 'rgba(57,181,74,0.07)' }}>
            <span className="font-bold text-[#39B54A]">{t('vsApp.takeawayLabel')}</span>
            <span className="text-muted-foreground">{t('vsApp.takeaway')}</span>
          </div>
        </div>

        {/* ═══════ TRADITIONAL vs SMART CONTRACTS ═══════ */}
        <div id="s2-vs-2" className="h-full flex flex-col p-6 lg:p-10">
          <div className="shrink-0 mb-5">
            <span className="text-xs font-black uppercase tracking-widest text-[#6366f1]">{t('vsContract.kicker')}</span>
            <h2 className="text-2xl lg:text-3xl font-bold text-foreground mt-1">{t('vsContract.heading')}</h2>
            <p className="text-sm text-muted-foreground mt-1">{t('vsContract.subtitle')}</p>
          </div>

          <div className="flex-1 min-h-0 flex items-center justify-center">
            <motion.div
              initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}
              className="w-full max-w-4xl rounded-2xl border border-border bg-card overflow-hidden shadow-sm"
            >
              <div className="grid grid-cols-[1.15fr_1fr_1fr]">
                <div className="p-3.5 text-[11px] font-black uppercase tracking-widest text-muted-foreground bg-muted">{t('vsContract.propertyLabel')}</div>
                <div className="p-3.5 text-center text-sm font-black text-[#ED1C24] bg-[#ED1C24]/10 border-l border-border">{t('vsContract.colA')}</div>
                <div className="p-3.5 text-center text-sm font-black text-[#6366f1] bg-[#6366f1]/10 border-l border-border">{t('vsContract.colB')}</div>
              </div>
              {vsContractRows.map((r, i) => (
                <div key={r.prop} className={`grid grid-cols-[1.15fr_1fr_1fr] border-t border-border ${i % 2 ? 'bg-muted/30' : ''}`}>
                  <div className="px-3.5 py-3 font-semibold text-sm text-foreground">{r.prop}</div>
                  <div className="px-3.5 py-3 text-sm text-muted-foreground text-center border-l border-border">{r.a}</div>
                  <div className="px-3.5 py-3 text-sm text-foreground font-medium text-center border-l border-border" style={{ backgroundColor: 'rgba(99,102,241,0.05)' }}>{r.b}</div>
                </div>
              ))}
            </motion.div>
          </div>

          <div className="shrink-0 mt-4 rounded-xl border border-[#6366f1]/30 px-4 py-2.5 text-center text-sm" style={{ backgroundColor: 'rgba(99,102,241,0.07)' }}>
            <span className="font-bold text-[#6366f1]">{t('vsContract.takeawayLabel')}</span>
            <span className="text-muted-foreground">{t('vsContract.takeaway')}</span>
          </div>
        </div>

        {/* ═══════ TOKEN STANDARDS ═══════ */}
        <div id="s2-standards" className="h-full flex flex-col p-6 lg:p-10">
          <div className="shrink-0 mb-5">
            <span className="text-xs font-black uppercase tracking-widest text-[#6366f1]">{t('standards.kicker')}</span>
            <h2 className="text-2xl lg:text-3xl font-bold text-foreground mt-1">{t('standards.heading')}</h2>
            <p className="text-sm text-muted-foreground mt-1">
              {t('standards.subtitleA')}<span className="font-semibold text-foreground">{t('standards.subtitleStrong')}</span>{t('standards.subtitleB')}
            </p>
          </div>

          <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-3 gap-5 content-center">

            {/* ERC-20 */}
            <motion.div
              initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}
              className="flex flex-col rounded-2xl border-2 bg-card overflow-hidden" style={{ borderColor: '#6366f140' }}
            >
              <div className="h-1.5" style={{ backgroundColor: '#6366f1' }} />
              <div className="flex-1 flex flex-col gap-3 p-5">
                <div className="flex items-center gap-3">
                  <span className="text-3xl">🪙</span>
                  <div>
                    <div className="font-black text-lg text-[#6366f1]">ERC-20</div>
                    <div className="text-xs font-semibold text-muted-foreground">{t('standards.erc20.title')}</div>
                  </div>
                </div>
                <div className="flex items-center justify-center gap-1.5 py-3 rounded-xl" style={{ backgroundColor: '#6366f10f' }}>
                  {[0,1,2,3,4].map(k => (
                    <div key={k} className="size-8 rounded-full bg-[#6366f1] text-white text-[10px] font-black flex items-center justify-center">1</div>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground">{t('standards.erc20.desc')}</p>
                <div className="rounded-lg bg-[#0d1117] p-2.5 flex-1 min-h-0">
                  <div className="text-[9px] font-black uppercase tracking-widest text-muted-foreground mb-1">{t('standards.coreFunctions')}</div>
                  <div className="font-mono text-[10px] leading-relaxed space-y-0.5" style={{ color: '#6366f1' }}>
                    <div>transfer(to, amount)</div>
                    <div>approve(spender, amount)</div>
                    <div>transferFrom(from, to, amount)</div>
                    <div>balanceOf(account)</div>
                    <div>totalSupply()</div>
                  </div>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {['USDC','DAI','UNI','WETH'].map(t => <span key={t} className="text-[11px] font-semibold px-2 py-0.5 rounded-full" style={{ backgroundColor: '#6366f115', color: '#6366f1' }}>{t}</span>)}
                </div>
              </div>
            </motion.div>

            {/* ERC-721 */}
            <motion.div
              initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: 0.1 }}
              className="flex flex-col rounded-2xl border-2 bg-card overflow-hidden" style={{ borderColor: '#f9731640' }}
            >
              <div className="h-1.5" style={{ backgroundColor: '#f97316' }} />
              <div className="flex-1 flex flex-col gap-3 p-5">
                <div className="flex items-center gap-3">
                  <span className="text-3xl">🖼️</span>
                  <div>
                    <div className="font-black text-lg text-[#f97316]">ERC-721</div>
                    <div className="text-xs font-semibold text-muted-foreground">{t('standards.erc721.title')}</div>
                  </div>
                </div>
                <div className="flex items-center justify-center gap-2 py-3 rounded-xl" style={{ backgroundColor: '#f973160f' }}>
                  {[{n:'#1',c:'#f97316'},{n:'#2',c:'#8b5cf6'},{n:'#3',c:'#39B54A'}].map(b => (
                    <div key={b.n} className="size-10 rounded-lg text-white text-xs font-black flex items-center justify-center" style={{ backgroundColor: b.c }}>{b.n}</div>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground">{t('standards.erc721.desc')}</p>
                <div className="rounded-lg bg-[#0d1117] p-2.5 flex-1 min-h-0">
                  <div className="text-[9px] font-black uppercase tracking-widest text-muted-foreground mb-1">{t('standards.coreFunctions')}</div>
                  <div className="font-mono text-[10px] leading-relaxed space-y-0.5" style={{ color: '#f97316' }}>
                    <div>ownerOf(tokenId)</div>
                    <div>transferFrom(from, to, tokenId)</div>
                    <div>approve(to, tokenId)</div>
                    <div>setApprovalForAll(op, bool)</div>
                    <div>tokenURI(tokenId)</div>
                  </div>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {['CryptoPunks','ENS',t('standards.erc721.tagTitleDeeds')].map(tag => <span key={tag} className="text-[11px] font-semibold px-2 py-0.5 rounded-full" style={{ backgroundColor: '#f9731615', color: '#f97316' }}>{tag}</span>)}
                </div>
              </div>
            </motion.div>

            {/* ERC-1155 */}
            <motion.div
              initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: 0.2 }}
              className="flex flex-col rounded-2xl border-2 bg-card overflow-hidden" style={{ borderColor: '#39B54A40' }}
            >
              <div className="h-1.5" style={{ backgroundColor: '#39B54A' }} />
              <div className="flex-1 flex flex-col gap-3 p-5">
                <div className="flex items-center gap-3">
                  <span className="text-3xl">🎮</span>
                  <div>
                    <div className="font-black text-lg text-[#39B54A]">ERC-1155</div>
                    <div className="text-xs font-semibold text-muted-foreground">{t('standards.erc1155.title')}</div>
                  </div>
                </div>
                <div className="flex items-center justify-center gap-2 py-3 rounded-xl" style={{ backgroundColor: '#39B54A0f' }}>
                  {[0,1,2].map(k => <div key={k} className="size-7 rounded-full bg-[#39B54A] text-white text-[9px] font-black flex items-center justify-center">x99</div>)}
                  <div className="size-9 rounded-lg bg-[#f97316] text-white text-sm font-black flex items-center justify-center">★</div>
                </div>
                <p className="text-xs text-muted-foreground">{t('standards.erc1155.descA')}<em>{t('standards.erc1155.descEm')}</em>{t('standards.erc1155.descB')}</p>
                <div className="rounded-lg bg-[#0d1117] p-2.5 flex-1 min-h-0">
                  <div className="text-[9px] font-black uppercase tracking-widest text-muted-foreground mb-1">{t('standards.coreFunctions')}</div>
                  <div className="font-mono text-[10px] leading-relaxed space-y-0.5" style={{ color: '#39B54A' }}>
                    <div>balanceOf(account, id)</div>
                    <div>balanceOfBatch(accounts, ids)</div>
                    <div>safeTransferFrom(from, to, id, amt)</div>
                    <div>safeBatchTransferFrom(…)</div>
                    <div>setApprovalForAll(op, bool)</div>
                  </div>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {[t('standards.erc1155.tagGameItems'),t('standards.erc1155.tagTickets'),t('standards.erc1155.tagEditions')].map(tag => <span key={tag} className="text-[11px] font-semibold px-2 py-0.5 rounded-full" style={{ backgroundColor: '#39B54A15', color: '#39B54A' }}>{tag}</span>)}
                </div>
              </div>
            </motion.div>

          </div>

          <div className="shrink-0 mt-4 p-3 rounded-xl border border-[#6366f1]/30 text-center text-sm" style={{ backgroundColor: '#6366f10f' }}>
            <span className="font-bold text-[#6366f1]">{t('standards.footerLabel')}</span>
            <span className="text-muted-foreground">{t('standards.footerA')}<em>{t('standards.footerEm')}</em>{t('standards.footerB')}</span>
          </div>
        </div>

        {/* ═══════ ANATOMY ═══════ */}
        <div id="s2-components" className="h-full flex flex-col p-6 lg:p-10">
          <div className="shrink-0 mb-6">
            <h2 className="text-2xl lg:text-3xl font-bold text-foreground">{t('components.heading')}</h2>
            <p className="text-muted-foreground text-sm mt-1">{t('components.subtitle')}</p>
          </div>

          <div className="flex-1 min-h-0 grid grid-cols-2 gap-5 content-center">

            {/* Left: component cards */}
            <div className="flex flex-col gap-3">
              {componentCards.map((c, i) => (
                <div key={c.title} className="flex items-start gap-3 p-3 bg-card border border-border rounded-xl flex-1" style={{ borderColor: componentCardMeta[i].color + '30' }}>
                  <div className="size-8 rounded-lg flex items-center justify-center shrink-0 text-base" style={{ backgroundColor: componentCardMeta[i].color + '20' }}>{componentCardMeta[i].emoji}</div>
                  <div>
                    <div className="font-bold text-sm mb-0.5" style={{ color: componentCardMeta[i].color }}>{c.title}</div>
                    <div className="text-xs text-muted-foreground leading-relaxed">{c.desc}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Right: annotated code */}
            <div className="flex flex-col gap-3">
              <div className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">{t('components.annotatedLabel')}</div>
              <div className="flex-1 p-4 bg-card border border-border rounded-xl font-mono text-[11px] leading-relaxed">
                <div className="space-y-1">
                  <div className="text-muted-foreground">{'// SPDX-License-Identifier: MIT'}</div>
                  <div><span className="text-[#8b5cf6]">pragma solidity</span> ^0.8.0;</div>
                  <div className="mt-2"><span className="text-[#8b5cf6]">contract</span> <span className="text-[#6366f1]">Voting</span> {'{'}</div>

                  <div className="mt-2 pl-4 flex items-start gap-2">
                    <div className="flex-1">
                      <div className="text-muted-foreground">{t('components.codeComments.state')}</div>
                      <div><span className="text-[#8b5cf6]">mapping</span>(<span className="text-[#f59e0b]">address</span> =&gt; <span className="text-[#f59e0b]">bool</span>) <span className="text-muted-foreground">public</span> hasVoted;</div>
                      <div><span className="text-[#f59e0b]">uint</span> <span className="text-muted-foreground">public</span> yesCount;</div>
                    </div>
                    <div className="shrink-0 text-[10px] px-2 py-0.5 rounded bg-[#8b5cf6]/20 text-[#8b5cf6] font-bold whitespace-nowrap self-start">{t('components.tags.state')}</div>
                  </div>

                  <div className="mt-2 pl-4 flex items-start gap-2">
                    <div className="flex-1">
                      <div className="text-muted-foreground">{t('components.codeComments.event')}</div>
                      <div><span className="text-[#39B54A]">event</span> <span className="text-[#6366f1]">Voted</span>(<span className="text-[#f59e0b]">address</span> voter, <span className="text-[#f59e0b]">bool</span> vote);</div>
                    </div>
                    <div className="shrink-0 text-[10px] px-2 py-0.5 rounded bg-[#f59e0b]/20 text-[#f59e0b] font-bold whitespace-nowrap self-start">{t('components.tags.event')}</div>
                  </div>

                  <div className="mt-2 pl-4 flex items-start gap-2">
                    <div className="flex-1">
                      <div className="text-muted-foreground">{t('components.codeComments.function')}</div>
                      <div><span className="text-[#8b5cf6]">function</span> <span className="text-[#6366f1]">vote</span>(<span className="text-[#f59e0b]">bool</span> inFavor) <span className="text-muted-foreground">external</span> {'{'}</div>
                      <div className="pl-4"><span className="text-[#ED1C24]">require</span>(!hasVoted[msg.sender]);</div>
                      <div className="pl-4">hasVoted[msg.sender] = <span className="text-[#39B54A]">true</span>;</div>
                      <div className="pl-4"><span className="text-[#8b5cf6]">if</span> (inFavor) yesCount++;</div>
                      <div className="pl-4"><span className="text-[#ED1C24]">emit</span> Voted(msg.sender, inFavor);</div>
                      <div>{'}'}</div>
                    </div>
                    <div className="shrink-0 text-[10px] px-2 py-0.5 rounded bg-[#39B54A]/20 text-[#39B54A] font-bold whitespace-nowrap self-start">{t('components.tags.function')}</div>
                  </div>

                  <div>{'}'}</div>
                </div>
              </div>

              <div className="p-3 bg-[#6366f1]/10 border border-[#6366f1]/30 rounded-xl text-xs text-muted-foreground">
                <span className="font-semibold text-foreground">{t('components.platformLabel')}</span>{t('components.platformBody')}
              </div>
            </div>

          </div>
        </div>

        {/* ═══════ WORKFLOW ═══════ */}
        <div id="s2-workflow" className="h-full flex flex-col p-6 lg:p-10">
          <div className="shrink-0 mb-6">
            <h2 className="text-2xl lg:text-3xl font-bold text-foreground">{t('workflow.heading')}</h2>
            <p className="text-muted-foreground text-sm mt-1">{t('workflow.subtitle')}</p>
          </div>

          <div className="flex-1 min-h-0 flex items-center justify-center">
            <div className="w-full max-w-4xl">
              {/* Steps row */}
              <div className="flex items-stretch gap-0 mb-6">
                {workflowSteps.map((s, i) => (
                  <div key={workflowStepMeta[i].step} className="flex items-stretch flex-1">
                    <div
                      className="flex-1 p-4 rounded-xl border-2 flex flex-col gap-2"
                      style={{ borderColor: workflowStepMeta[i].color + '50', backgroundColor: workflowStepMeta[i].color + '0d' }}
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-xl">{workflowStepMeta[i].emoji}</span>
                        <span className="text-[10px] font-black uppercase tracking-widest" style={{ color: workflowStepMeta[i].color }}>{workflowStepMeta[i].step}</span>
                      </div>
                      <div className="font-black text-base text-foreground">{s.label}</div>
                      <p className="text-xs text-muted-foreground leading-relaxed flex-1">{s.desc}</p>
                    </div>
                    {i < 4 && (
                      <div className="flex items-center px-1 text-muted-foreground text-lg shrink-0">→</div>
                    )}
                  </div>
                ))}
              </div>

              {/* Code illustration */}
              <div className="p-4 bg-card border border-border rounded-xl font-mono text-xs">
                <div className="flex items-center gap-2 mb-3">
                  <div className="flex gap-1.5">
                    <div className="size-2.5 rounded-full bg-[#ED1C24]" />
                    <div className="size-2.5 rounded-full bg-[#f59e0b]" />
                    <div className="size-2.5 rounded-full bg-[#39B54A]" />
                  </div>
                  <span className="text-muted-foreground text-[10px]">SimpleEscrow.sol</span>
                </div>
                <div className="space-y-0.5 text-[11px]">
                  <div><span className="text-[#8b5cf6]">contract</span> <span className="text-[#6366f1]">SimpleEscrow</span> {'{'}</div>
                  <div className="pl-4"><span className="text-[#f59e0b]">address</span> <span className="text-muted-foreground">public</span> buyer, seller;</div>
                  <div className="pl-4"><span className="text-[#f59e0b]">uint</span> <span className="text-muted-foreground">public</span> amount;</div>
                  <div className="pl-4 text-muted-foreground">{t('workflow.code.cState')}</div>
                  <div className="mt-1 pl-4"><span className="text-[#39B54A]">event</span> <span className="text-[#6366f1]">Released</span>(address to, uint value); <span className="text-muted-foreground">{t('workflow.code.cEmit')}</span></div>
                  <div className="mt-1 pl-4"><span className="text-[#8b5cf6]">function</span> <span className="text-[#6366f1]">release</span>() <span className="text-muted-foreground">external</span> {'{'}</div>
                  <div className="pl-8 text-muted-foreground">{t('workflow.code.cExecute')}</div>
                  <div className="pl-8"><span className="text-[#ED1C24]">require</span>(msg.sender == buyer);</div>
                  <div className="pl-8">seller.transfer(amount); <span className="text-muted-foreground">{t('workflow.code.cUpdate')}</span></div>
                  <div className="pl-8"><span className="text-[#ED1C24]">emit</span> Released(seller, amount);</div>
                  <div className="pl-4">{'}'}</div>
                  <div>{'}'}</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ═══════ READING SOLIDITY ═══════ */}
        <div id="s2-solidity" className="h-full flex flex-col p-5 lg:p-8">
          <div className="shrink-0 mb-4">
            <span className="text-xs font-black uppercase tracking-widest text-[#6366f1]">{t('solidity.kicker')}</span>
            <h2 className="text-2xl lg:text-3xl font-bold text-foreground mt-1 mb-1">{t('solidity.heading')}</h2>
            <p className="text-sm text-muted-foreground">{t('solidity.subtitle')}</p>
          </div>
          <div className="flex-1 min-h-0 grid grid-cols-2 gap-5 content-center">
            {/* Code block */}
            <div className="bg-[#0d1117] rounded-xl overflow-auto p-4 font-mono text-sm leading-relaxed border border-border">
              {[
                { line: '// SPDX-License-Identifier: MIT',               color: '#6a737d', note: null },
                { line: 'pragma solidity ^0.8.20;',                        color: '#6a737d', note: null },
                { line: '',                                                color: '',        note: null },
                { line: 'contract SimpleToken {',                          color: '#f0f4f8', note: 'A' },
                { line: '  string public name;',                           color: '#79c0ff', note: 'B' },
                { line: '  string public symbol;',                         color: '#79c0ff', note: 'B' },
                { line: '  uint256 public totalSupply;',                   color: '#79c0ff', note: 'B' },
                { line: '',                                                color: '',        note: null },
                { line: '  mapping(address => uint256) public balances;',  color: '#ffa657', note: 'C' },
                { line: '',                                                color: '',        note: null },
                { line: '  event Transfer(',                               color: '#d2a8ff', note: 'D' },
                { line: '    address indexed from,',                       color: '#d2a8ff', note: null },
                { line: '    address indexed to,',                         color: '#d2a8ff', note: null },
                { line: '    uint256 amount',                              color: '#d2a8ff', note: null },
                { line: '  );',                                            color: '#d2a8ff', note: null },
                { line: '',                                                color: '',        note: null },
                { line: '  constructor(string memory _name,',              color: '#f0f4f8', note: 'E' },
                { line: '    string memory _symbol, uint256 _supply) {',  color: '#f0f4f8', note: null },
                { line: '    name = _name; symbol = _symbol;',            color: '#f0f4f8', note: null },
                { line: '    totalSupply = _supply;',                     color: '#f0f4f8', note: null },
                { line: '    balances[msg.sender] = _supply;',            color: '#39B54A', note: 'F' },
                { line: '  }',                                            color: '#f0f4f8', note: null },
                { line: '',                                               color: '',        note: null },
                { line: '  function transfer(address to,',                color: '#f0f4f8', note: 'G' },
                { line: '    uint256 amount) external {',                 color: '#f0f4f8', note: null },
                { line: '    require(balances[msg.sender] >= amount);',   color: '#ED1C24', note: 'H' },
                { line: '    balances[msg.sender] -= amount;',            color: '#f0f4f8', note: null },
                { line: '    balances[to] += amount;',                    color: '#f0f4f8', note: null },
                { line: '    emit Transfer(msg.sender, to, amount);',     color: '#d2a8ff', note: null },
                { line: '  }',                                            color: '#f0f4f8', note: null },
                { line: '}',                                              color: '#f0f4f8', note: null },
              ].map((l, i) => (
                <div key={i} className="flex items-start gap-2">
                  <span className="text-[#444d56] text-xs w-5 shrink-0 select-none">{l.line ? i + 1 : ''}</span>
                  <span style={{ color: l.color || 'transparent' }} className="flex-1 whitespace-pre">{l.line || ' '}</span>
                  {l.note && (
                    <span className="shrink-0 size-4 rounded-full bg-[#6366f1] text-white text-[9px] font-black flex items-center justify-center">{l.note}</span>
                  )}
                </div>
              ))}
            </div>
            {/* Annotations */}
            <div className="flex flex-col gap-2.5">
              {solidityAnnotations.map((a, i) => (
                <div key={solidityAnnotationMeta[i].key} className="flex gap-2.5 items-start">
                  <span className="shrink-0 size-5 rounded-full flex items-center justify-center text-white text-[10px] font-black mt-0.5" style={{ backgroundColor: solidityAnnotationMeta[i].color }}>{solidityAnnotationMeta[i].key}</span>
                  <div>
                    <span className="font-bold text-xs text-foreground">{a.title} — </span>
                    <span className="text-xs text-muted-foreground">{a.desc}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ═══════ EXECUTION ENVIRONMENT ═══════ */}
        <div id="s2-execution" className="h-full flex flex-col p-6 lg:p-10">
          <div className="shrink-0 mb-6">
            <h2 className="text-2xl lg:text-3xl font-bold text-foreground">{t('execution.heading')}</h2>
            <p className="text-muted-foreground text-sm mt-1">{t('execution.subtitle')}</p>
          </div>

          <div className="flex-1 min-h-0 grid grid-cols-2 gap-5 content-center">

            {/* Left: four properties */}
            <div className="flex flex-col gap-3">
              {executionProps.map((p, i) => (
                <div key={p.title} className="flex-1 p-4 bg-card border border-border rounded-xl flex gap-3" style={{ borderColor: executionPropMeta[i].color + '30' }}>
                  <div className="size-10 rounded-xl flex items-center justify-center text-xl shrink-0" style={{ backgroundColor: executionPropMeta[i].color + '15' }}>{executionPropMeta[i].emoji}</div>
                  <div className="flex-1 min-w-0">
                    <div className="font-black text-sm text-foreground">{p.title}</div>
                    <div className="text-xs font-semibold mb-1" style={{ color: executionPropMeta[i].color }}>{p.subtitle}</div>
                    <p className="text-xs text-muted-foreground leading-relaxed">{p.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Right: EVM landscape diagram */}
            <div className="flex flex-col gap-3">
              <div className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">{t('execution.ecosystemLabel')}</div>

              <div className="flex-1 flex flex-col gap-2 p-4 bg-card border border-border rounded-xl">
                {/* Core EVM */}
                <div className="text-center p-3 rounded-xl bg-gradient-to-br from-[#6366f1]/20 to-[#8b5cf6]/10 border-2 border-[#6366f1]/50">
                  <div className="text-xs font-bold text-[#6366f1] uppercase tracking-widest mb-1">{t('execution.evmCore.title')}</div>
                  <div className="text-xs text-muted-foreground">{t('execution.evmCore.desc')}</div>
                </div>

                <div className="text-center text-muted-foreground text-sm">{t('execution.compatibleWith')}</div>

                {/* L1 EVM chains */}
                <div>
                  <div className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest mb-1.5">{t('execution.l1Label')}</div>
                  <div className="grid grid-cols-3 gap-1.5">
                    {['BNB Chain', 'Avalanche C-Chain', 'Fantom', 'Cronos', 'Celo', 'Gnosis'].map(c => (
                      <div key={c} className="text-center py-1.5 px-2 bg-[#6366f1]/08 border border-[#6366f1]/20 rounded-lg text-[11px] text-muted-foreground">{c}</div>
                    ))}
                  </div>
                </div>

                {/* L2 */}
                <div>
                  <div className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest mb-1.5">{t('execution.l2Label')}</div>
                  <div className="grid grid-cols-3 gap-1.5">
                    {['Arbitrum', 'Optimism', 'Base', 'Polygon', 'zkSync', 'Scroll'].map(c => (
                      <div key={c} className="text-center py-1.5 px-2 bg-[#39B54A]/08 border border-[#39B54A]/20 rounded-lg text-[11px] text-muted-foreground">{c}</div>
                    ))}
                  </div>
                </div>

                {/* Non-EVM */}
                <div>
                  <div className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest mb-1.5">{t('execution.nonEvmLabel')}</div>
                  <div className="grid grid-cols-2 gap-1.5">
                    {[
                      { name: 'SVM', chain: 'Solana', color: '#9945FF' },
                      { name: 'MoveVM', chain: 'Aptos / Sui', color: '#00D4AA' },
                      { name: 'CosmWasm', chain: 'Cosmos chains', color: '#6366f1' },
                      { name: 'Ink! / WASM', chain: 'Polkadot', color: '#E6007A' },
                    ].map(v => (
                      <div key={v.name} className="py-1.5 px-2 bg-muted border border-border rounded-lg flex items-center gap-1.5">
                        <div className="size-2 rounded-full shrink-0" style={{ backgroundColor: v.color }} />
                        <span className="text-[11px] font-bold text-foreground">{v.name}</span>
                        <span className="text-[10px] text-muted-foreground ml-auto">{v.chain}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-auto p-2 bg-[#6366f1]/08 border border-[#6366f1]/20 rounded-lg text-xs text-muted-foreground text-center">
                  <span className="font-semibold text-foreground">{t('execution.deployLabel')}</span>{t('execution.deployBody')}
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* ═══════ NEW CAPABILITIES ═══════ */}
        <div id="s2-capabilities" className="h-full flex flex-col p-6 lg:p-10">
          <div className="shrink-0 mb-5">
            <h2 className="text-2xl lg:text-3xl font-bold text-foreground">{t('capabilities.heading')}</h2>
            <p className="text-muted-foreground text-sm mt-1">{t('capabilities.subtitle')}</p>
          </div>

          <div className="flex-1 min-h-0 flex flex-col gap-3">
            {capabilityItems.map((c, i) => (
              <motion.div
                key={c.title}
                initial={{ opacity: 0, x: -12 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.25 }}
                className="flex-1 flex items-center gap-4 p-4 rounded-xl border-2 bg-card"
                style={{ borderColor: capabilityMeta[i].color + '40' }}
              >
                <div className="size-12 rounded-xl flex items-center justify-center text-2xl shrink-0" style={{ backgroundColor: capabilityMeta[i].color + '18' }}>{capabilityMeta[i].emoji}</div>
                <div className="flex-1 min-w-0">
                  <div className="font-black text-base text-foreground">{c.title}</div>
                  <div className="text-sm font-semibold mt-0.5" style={{ color: capabilityMeta[i].color }}>{c.tagline}</div>
                </div>
                <div className="hidden lg:block w-[34%] shrink-0">
                  <div className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1">{t('capabilities.realExample')}</div>
                  <div className="text-sm text-muted-foreground italic leading-snug p-2.5 rounded-lg" style={{ backgroundColor: capabilityMeta[i].color + '0d' }}>{c.example}</div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* ═══════ WHY BUILD WITH SMART CONTRACTS? ═══════ */}
        <div id="s2-why" className="h-full flex flex-col p-6 lg:p-10">
          <div className="shrink-0 mb-5">
            <h2 className="text-2xl lg:text-3xl font-bold text-foreground">{t('why.heading')}</h2>
            <p className="text-muted-foreground text-sm mt-1">{t('why.subtitle')}</p>
          </div>

          <div className="flex-1 min-h-0 grid grid-cols-2 gap-5 content-center">

            {/* Column 1: Core reasons */}
            <div className="flex flex-col gap-3">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">{t('why.coreLabel')}</p>
              {whyCore.map((r, i) => (
                <div key={r.title} className="flex-1 flex gap-2.5 p-3 bg-card border border-border rounded-xl" style={{ borderColor: whyCoreMeta[i].color + '30' }}>
                  <div className="size-8 rounded-lg flex items-center justify-center text-base shrink-0" style={{ backgroundColor: whyCoreMeta[i].color + '18' }}>{whyCoreMeta[i].emoji}</div>
                  <div>
                    <div className="font-bold text-xs mb-0.5" style={{ color: whyCoreMeta[i].color }}>{r.title}</div>
                    <div className="text-xs text-muted-foreground leading-snug">{r.desc}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Column 2: Business impact */}
            <div className="flex flex-col gap-3">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">{t('why.impactLabel')}</p>
              {whyImpact.map((r, i) => (
                <div key={r.title} className="flex-1 flex gap-2.5 p-3 bg-card border border-border rounded-xl" style={{ borderColor: whyImpactMeta[i].color + '30' }}>
                  <div className="size-8 rounded-lg flex items-center justify-center text-base shrink-0" style={{ backgroundColor: whyImpactMeta[i].color + '18' }}>{whyImpactMeta[i].emoji}</div>
                  <div>
                    <div className="font-bold text-xs mb-0.5" style={{ color: whyImpactMeta[i].color }}>{r.title}</div>
                    <div className="text-xs text-muted-foreground leading-snug">{r.desc}</div>
                  </div>
                </div>
              ))}
            </div>

          </div>
        </div>

        {/* ═══════ GAS FUNDAMENTALS ═══════ */}
        <div id="s2-gas" className="h-full flex flex-col p-6 lg:p-10">
          <div className="shrink-0 mb-5">
            <h2 className="text-2xl lg:text-3xl font-bold text-foreground">{t('gas.heading')}</h2>
            <p className="text-muted-foreground text-sm mt-1">{t('gas.subtitle')}</p>
          </div>

          <div className="flex-1 min-h-0 grid grid-cols-2 gap-5 content-center">

            {/* Left: fundamentals */}
            <div className="flex flex-col gap-3">
              <div className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">{t('gas.fundamentalsLabel')}</div>

              {gasFundamentals.map((g, i) => (
                <div key={g.term} className="flex gap-3 p-3 bg-card border border-border rounded-xl flex-1" style={{ borderColor: gasFundamentalMeta[i].color + '30' }}>
                  <div className="size-9 rounded-lg flex items-center justify-center text-lg shrink-0" style={{ backgroundColor: gasFundamentalMeta[i].color + '18' }}>{gasFundamentalMeta[i].emoji}</div>
                  <div>
                    <div className="font-black text-sm mb-0.5" style={{ color: gasFundamentalMeta[i].color }}>{g.term}</div>
                    <div className="text-xs text-muted-foreground leading-relaxed">{g.def}</div>
                  </div>
                </div>
              ))}

              {/* Formula */}
              <div className="p-3 bg-gradient-to-r from-[#6366f1]/15 to-[#8b5cf6]/10 border border-[#6366f1]/30 rounded-xl text-center">
                <div className="text-xs text-muted-foreground mb-1">{t('gas.formulaLabel')}</div>
                <div className="font-mono font-black text-sm text-foreground">
                  <span className="text-[#f59e0b]">{t('gas.formulaGasUsed')}</span> × <span className="text-[#6366f1]">{t('gas.formulaGasPrice')}</span> = <span className="text-[#ED1C24]">{t('gas.formulaFee')}</span>
                </div>
                <div className="text-xs text-muted-foreground mt-1">{t('gas.formulaExample')}</div>
              </div>
            </div>

            {/* Right: why gas + economics */}
            <div className="flex flex-col gap-3">
              <div className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">{t('gas.incentivesLabel')}</div>

              <div className="grid grid-cols-2 gap-2">
                {gasIncentives.map((e, i) => (
                  <div key={e.who} className="p-3 bg-card border border-border rounded-xl" style={{ borderColor: gasIncentiveMeta[i].color + '30' }}>
                    <div className="flex items-center gap-1.5 mb-1">
                      <span>{gasIncentiveMeta[i].emoji}</span>
                      <span className="font-bold text-xs" style={{ color: gasIncentiveMeta[i].color }}>{e.who}</span>
                    </div>
                    <div className="text-xs text-muted-foreground leading-relaxed">{e.why}</div>
                  </div>
                ))}
              </div>

              <div className="flex-1 flex flex-col gap-2">
                <div className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">{t('gas.impactLabel')}</div>
                {gasImpact.map((r, i) => (
                  <div key={r.label} className="flex gap-3 p-3 bg-card border border-border rounded-xl flex-1" style={{ borderColor: gasImpactMeta[i].color + '20' }}>
                    <span className="text-lg shrink-0">{gasImpactMeta[i].emoji}</span>
                    <div>
                      <div className="font-bold text-xs mb-0.5" style={{ color: gasImpactMeta[i].color }}>{r.label}</div>
                      <div className="text-xs text-muted-foreground">{r.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>

        {/* ═══════ EXERCISE: GAS RANKING ═══════ */}
        <div id="s2-ex-gas" className="h-full">
          <GasRankingExercise />
        </div>

        {/* ═══════ RESHAPE BUSINESS ═══════ */}
        <div id="s2-reshape" className="h-full flex flex-col p-6 lg:p-10">
          <div className="shrink-0 mb-5 flex items-start gap-4">
            <img src={imgDisintermediation} alt={t('reshape.imgAlt')} className="hidden lg:block h-20 object-contain shrink-0" />
            <div>
              <h2 className="text-2xl lg:text-3xl font-bold text-foreground">{t('reshape.heading')}</h2>
              <p className="text-muted-foreground text-sm mt-1">{t('reshape.subtitle')}</p>
            </div>
          </div>
          <div className="flex-1 min-h-0 grid grid-cols-5 gap-3 content-center">
            {reshapeCards.map((c, i) => (
              <div key={reshapeCardMeta[i].num} className="p-4 bg-card border rounded-xl flex flex-col gap-2"
                style={{ borderColor: reshapeCardMeta[i].color + '40' }}>
                <div className="flex items-center gap-2">
                  <div className="size-8 rounded-lg flex items-center justify-center text-white text-xs font-black" style={{ backgroundColor: reshapeCardMeta[i].color }}>{reshapeCardMeta[i].num}</div>
                  <div className="text-2xl">{reshapeCardMeta[i].emoji}</div>
                </div>
                <div className="font-bold text-sm text-foreground">{c.title}</div>
                <div className="text-xs text-muted-foreground leading-snug flex-1">{c.desc}</div>
                <div className="text-[10px] italic text-muted-foreground">{reshapeCardMeta[i].src}</div>
              </div>
            ))}
          </div>
          <div className="shrink-0 mt-4 p-3 rounded-xl border border-border bg-muted/30 text-xs text-muted-foreground">
            <span className="font-semibold text-foreground">{t('reshape.patternLabel')}</span>{t('reshape.patternBody')}
          </div>
        </div>

        {/* Quiz 1: Workflow */}
        <div id="s2-quiz" className="h-full">
          <QuizSlide
            question={t('quiz.question')}
            options={quizOptions}
            explanation={t('quiz.explanation')}
          />
        </div>

        <div id="s2-takeaways" className="h-full">
          <TakeawaySlide
            title={t('takeaways.title')}
            takeaways={takeawayItems}
          />
        </div>

        {/* ═══════ SUMMARY ═══════ */}
        <div id="s2-summary" className="h-full flex flex-col p-6 lg:p-10">
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
                <div className="text-3xl">{summaryCardMeta[i]}</div>
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
