import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { TitleSlide } from '../../components/templates/TitleSlide';
import { ComparisonSlide } from '../../components/templates/ComparisonSlide';
import { TakeawaySlide } from '../../components/templates/TakeawaySlide';
import { SectionNav } from '../../components/navigation/SectionNav';
import { SiteFooter } from '../../components/shared/SiteFooter';
import { UnderTheHood } from '../../components/shared/UnderTheHood';
import { RefreshCw } from 'lucide-react';

// Language-neutral shape — only IDs. Labels come from t() at render time.
const chapterIds = [
  's0-centralization',
  's0-types',
  's0-spectrum',
  's0-usecases',
  's0-takeaways',
  's0-team-reminder',
] as const;

interface ComparisonRow {
  feature: string;
  option1: string;
  option2: string;
  option3?: string;
}

interface UsecaseDriver {
  label: string;
  text: string;
}

interface DecisionItem {
  q: string;
  lean: string;
}

// ─── Topology mini-diagrams (language-neutral) ───────────────────────────────

function CentralizedDiagram() {
  const spokes = [[22, 16], [90, 16], [22, 64], [90, 64]];
  return (
    <svg viewBox="0 0 112 80" className="w-28 h-20">
      {spokes.map(([x, y], i) => (
        <line key={i} x1="56" y1="40" x2={x} y2={y} stroke="#ED1C24" strokeWidth="1.5" strokeOpacity="0.5" />
      ))}
      {spokes.map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r="7" fill="none" stroke="#ED1C24" strokeWidth="1.5" opacity="0.6" />
      ))}
      <circle cx="56" cy="40" r="11" fill="#ED1C2430" stroke="#ED1C24" strokeWidth="2" />
      <text x="56" y="44" textAnchor="middle" fontSize="10" fontWeight="900" fill="#ED1C24">C</text>
    </svg>
  );
}

function DecentralizedDiagram() {
  const hubs: [number, number][] = [[56, 22], [26, 58], [86, 58]];
  const leaves: [number, number, number, number][] = [[56, 22, 40, 8], [56, 22, 72, 8], [26, 58, 10, 72], [86, 58, 102, 72]];
  return (
    <svg viewBox="0 0 112 80" className="w-28 h-20">
      <line x1="56" y1="22" x2="26" y2="58" stroke="#f59e0b" strokeWidth="1.5" strokeOpacity="0.4" />
      <line x1="56" y1="22" x2="86" y2="58" stroke="#f59e0b" strokeWidth="1.5" strokeOpacity="0.4" />
      <line x1="26" y1="58" x2="86" y2="58" stroke="#f59e0b" strokeWidth="1.5" strokeOpacity="0.4" />
      {leaves.map(([x1, y1, x2, y2], i) => (
        <g key={i}>
          <line x1={x1} y1={y1} x2={x2} y2={y2} stroke="#f59e0b" strokeWidth="1.2" strokeOpacity="0.4" />
          <circle cx={x2} cy={y2} r="4" fill="none" stroke="#f59e0b" strokeWidth="1.5" opacity="0.6" />
        </g>
      ))}
      {hubs.map(([cx, cy], i) => (
        <circle key={i} cx={cx} cy={cy} r="8" fill="#f59e0b25" stroke="#f59e0b" strokeWidth="2" opacity="0.8" />
      ))}
    </svg>
  );
}

function DistributedDiagram() {
  const nodes: [number, number][] = [[56, 20], [28, 40], [84, 40], [42, 64], [70, 64], [14, 60], [98, 60]];
  const edges: [number, number, number, number][] = [[56, 20, 28, 40], [56, 20, 84, 40], [28, 40, 42, 64], [84, 40, 70, 64], [28, 40, 14, 60], [84, 40, 98, 60], [42, 64, 70, 64], [28, 40, 84, 40]];
  return (
    <svg viewBox="0 0 112 80" className="w-28 h-20">
      {edges.map(([x1, y1, x2, y2], i) => (
        <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#39B54A" strokeWidth="1.5" strokeOpacity="0.35" />
      ))}
      {nodes.map(([cx, cy], i) => (
        <circle key={i} cx={cx} cy={cy} r="7" fill="#39B54A20" stroke="#39B54A" strokeWidth="2" opacity="0.8" />
      ))}
    </svg>
  );
}

// ─── Spectrum slide ──────────────────────────────────────────────────────────

// Language-neutral marker positions (% along the bar) + colours. Names from t().
const SPECTRUM_MARKERS = [
  { pos: 5,  color: '#f59e0b', above: true },
  { pos: 15, color: '#6366f1', above: false },
  { pos: 27, color: '#ED1C24', above: true },
  { pos: 66, color: '#8b5cf6', above: false },
  { pos: 90, color: '#39B54A', above: true },
];

function SpectrumSlide() {
  const { t } = useTranslation('blockchain-platforms/section-0');
  const markerNames = t('spectrum.markers', { returnObjects: true }) as string[];
  const gainRight = t('spectrum.gainRight.items', { returnObjects: true }) as string[];
  const gainLeft = t('spectrum.gainLeft.items', { returnObjects: true }) as string[];
  const decision = t('spectrum.decision.items', { returnObjects: true }) as DecisionItem[];
  const hood = t('spectrum.hood', { returnObjects: true }) as string[];

  return (
    <div className="h-full flex flex-col p-5 lg:p-8">
      <div className="shrink-0 mb-3">
        <h2 className="text-2xl lg:text-3xl font-bold text-foreground">{t('spectrum.heading')}</h2>
        <p className="text-sm text-muted-foreground mt-1 max-w-4xl">{t('spectrum.subtitle')}</p>
      </div>

      {/* End labels, then the spectrum bar with platform markers */}
      <div className="shrink-0 flex items-end justify-between text-xs mb-1 px-1">
        <div>
          <div className="font-black uppercase tracking-widest text-[#39B54A]">← {t('spectrum.leftLabel')}</div>
          <div className="text-muted-foreground">{t('spectrum.leftSub')}</div>
        </div>
        <div className="text-right">
          <div className="font-black uppercase tracking-widest text-[#6366f1]">{t('spectrum.rightLabel')} →</div>
          <div className="text-muted-foreground">{t('spectrum.rightSub')}</div>
        </div>
      </div>
      <div className="shrink-0 rounded-2xl border border-border bg-card/50 px-12 pt-11 pb-11 mb-4 relative">
        <div className="relative h-3 rounded-full" style={{ background: 'linear-gradient(90deg, #39B54A, #f59e0b 50%, #6366f1)' }}>
          {SPECTRUM_MARKERS.map((m, i) => (
            <div key={i} className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2" style={{ left: `${m.pos}%` }}>
              <div className="size-4 rounded-full border-2 border-background shadow" style={{ backgroundColor: m.color }} />
              <div
                className={`absolute left-1/2 -translate-x-1/2 whitespace-nowrap text-[11px] font-bold px-2 py-0.5 rounded-full border bg-card ${m.above ? 'bottom-6' : 'top-6'}`}
                style={{ color: m.color, borderColor: m.color + '60' }}
              >
                {markerNames[i]}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Gains + decision */}
      <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="rounded-xl border p-4 flex flex-col gap-2" style={{ borderColor: '#39B54A50', backgroundColor: '#39B54A0a' }}>
          <div className="text-xs font-black uppercase tracking-widest text-[#39B54A]">← {t('spectrum.gainLeft.title')}</div>
          <ul className="space-y-2 text-sm text-muted-foreground">
            {gainLeft.map((item, i) => (
              <li key={i} className="flex gap-2"><span className="text-[#39B54A] shrink-0">•</span>{item}</li>
            ))}
          </ul>
        </div>

        <div className="rounded-xl border-2 p-4 flex flex-col gap-2 bg-card" style={{ borderColor: '#f59e0b60' }}>
          <div className="text-xs font-black uppercase tracking-widest text-[#f59e0b]">{t('spectrum.decision.title')}</div>
          <div className="flex-1 flex flex-col justify-center gap-2">
            {decision.map((d, i) => (
              <div key={i} className="rounded-lg border border-border p-2.5">
                <div className="text-sm text-foreground font-medium">{i + 1}. {d.q}</div>
                <div className="text-xs font-bold mt-1" style={{ color: i === 2 ? '#39B54A' : '#6366f1' }}>{d.lean}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-xl border p-4 flex flex-col gap-2" style={{ borderColor: '#6366f150', backgroundColor: '#6366f10a' }}>
          <div className="text-xs font-black uppercase tracking-widest text-[#6366f1]">{t('spectrum.gainRight.title')} →</div>
          <ul className="space-y-2 text-sm text-muted-foreground">
            {gainRight.map((item, i) => (
              <li key={i} className="flex gap-2"><span className="text-[#6366f1] shrink-0">•</span>{item}</li>
            ))}
          </ul>
        </div>
      </div>

      <div className="shrink-0 mt-3 flex flex-col gap-2 lg:pr-20">
        <p className="text-xs text-muted-foreground italic">{t('spectrum.footer')}</p>
        <UnderTheHood items={hood} />
      </div>
    </div>
  );
}

export function Section0() {
  const { t } = useTranslation('blockchain-platforms/section-0');

  const chapters = useMemo(
    () => chapterIds.map((id) => ({ id, label: t(`chapters.${id}`) })),
    [t]
  );

  const centralizedPoints = t('centralization.centralized.points', { returnObjects: true }) as string[];
  const decentralizedPoints = t('centralization.decentralized.points', { returnObjects: true }) as string[];
  const distributedPoints = t('centralization.distributed.points', { returnObjects: true }) as string[];
  const centralizationHood = t('centralization.hood', { returnObjects: true }) as string[];

  const typesItems = t('types.items', { returnObjects: true }) as ComparisonRow[];

  const useItems = t('usecases.use.items', { returnObjects: true }) as string[];
  const dontUseItems = t('usecases.dontUse.items', { returnObjects: true }) as string[];
  const driverItems = t('usecases.drivers.items', { returnObjects: true }) as UsecaseDriver[];

  const takeawayItems = t('takeaways.items', { returnObjects: true }) as string[];

  const topologies = [
    { key: 'centralized', color: '#ED1C24', emoji: '🏛️', points: centralizedPoints, diagram: <CentralizedDiagram /> },
    { key: 'decentralized', color: '#f59e0b', emoji: '🕸️', points: decentralizedPoints, diagram: <DecentralizedDiagram /> },
    { key: 'distributed', color: '#39B54A', emoji: '🌐', points: distributedPoints, diagram: <DistributedDiagram /> },
  ];

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
            icon={<RefreshCw className="size-20 text-[#6366f1]" />}
            gradient="from-[#6366f1] to-[#8b5cf6]"
          />
        </div>

        {/* ═══════ CENTRALIZATION ═══════ */}
        <div id="s0-centralization" className="h-full flex flex-col p-5 lg:p-8">
          <div className="shrink-0 mb-4">
            <span className="inline-flex px-2.5 py-0.5 rounded-full bg-[#6366f1]/15 border border-[#6366f1]/40 text-[#6366f1] text-[10px] font-black uppercase tracking-widest mb-2">
              {t('recapBadge')}
            </span>
            <h2 className="text-2xl lg:text-3xl font-bold text-foreground mb-1">{t('centralization.heading')}</h2>
            <p className="text-sm text-muted-foreground max-w-4xl">{t('centralization.subtitle')}</p>
          </div>
          <div className="flex-1 min-h-0 grid grid-cols-3 gap-4">
            {topologies.map((tp) => (
              <div
                key={tp.key}
                className="bg-card border rounded-xl p-5 flex flex-col items-center text-center gap-3"
                style={{ borderColor: tp.color + '60' }}
              >
                <div className="text-4xl">{tp.emoji}</div>
                <h3 className="font-bold text-base" style={{ color: tp.color }}>{t(`centralization.${tp.key}.title`)}</h3>
                <div className="shrink-0">{tp.diagram}</div>
                <ul className="flex flex-col justify-between flex-1 text-sm text-muted-foreground text-center space-y-2">
                  {tp.points.map((point, i) => (
                    <li key={i} className={i === tp.points.length - 1 ? 'font-medium text-foreground' : undefined}>{point}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <UnderTheHood items={centralizationHood} className="shrink-0 mt-3" />
        </div>

        {/* ═══════ BLOCKCHAIN TYPES ═══════ */}
        <div id="s0-types" className="h-full">
          <ComparisonSlide
            title={t('types.title')}
            featureLabel={t('types.featureLabel')}
            option1Label={t('types.option1Label')}
            option2Label={t('types.option2Label')}
            option3Label={t('types.option3Label')}
            items={typesItems}
          />
        </div>

        {/* ═══════ THE SPECTRUM ═══════ */}
        <div id="s0-spectrum" className="h-full">
          <SpectrumSlide />
        </div>

        {/* ═══════ USE OF BLOCKCHAIN ═══════ */}
        <div id="s0-usecases" className="h-full flex items-center justify-center p-5 lg:p-8">
          <div className="w-full max-w-6xl">
            <h2 className="text-2xl lg:text-3xl font-bold text-foreground mb-1 text-center">{t('usecases.heading')}</h2>
            <p className="text-sm text-muted-foreground text-center mb-6">{t('usecases.subtitle')}</p>

            <div className="grid grid-cols-3 gap-5">
              <div className="bg-card border border-[#39B54A]/40 rounded-xl p-7">
                <div className="font-bold text-[#39B54A] text-base mb-5">{t('usecases.use.title')}</div>
                <ul className="space-y-4 text-sm text-muted-foreground">
                  {useItems.map((item, i) => (
                    <li key={i} className="flex gap-2"><span className="text-[#39B54A] shrink-0">•</span>{item}</li>
                  ))}
                </ul>
              </div>

              <div className="bg-card border border-[#ED1C24]/40 rounded-xl p-7">
                <div className="font-bold text-[#ED1C24] text-base mb-5">{t('usecases.dontUse.title')}</div>
                <ul className="space-y-4 text-sm text-muted-foreground">
                  {dontUseItems.map((item, i) => (
                    <li key={i} className="flex gap-2"><span className="text-[#ED1C24] shrink-0">•</span>{item}</li>
                  ))}
                </ul>
              </div>

              <div className="bg-card border border-[#f59e0b]/40 rounded-xl p-7">
                <div className="font-bold text-[#f59e0b] text-base mb-5">{t('usecases.drivers.title')}</div>
                <ul className="space-y-4 text-sm text-muted-foreground">
                  {driverItems.map((driver, i) => (
                    <li key={i} className="flex gap-2">
                      <span className="text-[#f59e0b] shrink-0">•</span>
                      <span><span className="font-medium text-foreground">{driver.label}</span>{driver.text}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* ═══════ TAKEAWAYS ═══════ */}
        <div id="s0-takeaways" className="h-full">
          <TakeawaySlide
            title={t('takeaways.title')}
            takeaways={takeawayItems}
          />
        </div>

        {/* ═══════ TEAM REMINDER (Course 03 starts) ═══════ */}
        <div id="s0-team-reminder" className="h-full flex items-center justify-center p-8 relative overflow-hidden">
          <div className="absolute inset-0 pointer-events-none opacity-50" style={{ background: 'radial-gradient(circle at 30% 20%, #6366f124, transparent 60%), radial-gradient(circle at 70% 80%, #8b5cf624, transparent 60%)' }} />
          <div className="relative z-10 max-w-3xl w-full p-8 bg-card border-2 rounded-2xl text-center" style={{ borderColor: '#6366f160' }}>
            <div className="inline-flex px-3 py-1.5 rounded-full text-xs font-black uppercase tracking-widest text-white shadow-md mb-4"
              style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}>
              {t('teamReminder.badge')}
            </div>
            <h2 className="text-2xl lg:text-3xl font-bold text-foreground mb-3">{t('teamReminder.heading')}</h2>
            <p className="text-muted-foreground text-sm leading-relaxed mb-5 max-w-2xl mx-auto">
              {t('teamReminder.leadA')}<strong className="text-foreground">{t('teamReminder.leadStrong1')}</strong>{t('teamReminder.leadB')}<strong className="text-foreground">{t('teamReminder.leadStrong2')}</strong>{t('teamReminder.leadC')}<strong className="text-foreground">{t('teamReminder.leadStrong3')}</strong>{t('teamReminder.leadD')}
            </p>
            <div className="grid grid-cols-3 gap-3 text-left mt-6">
              <div className="p-3 rounded-xl border" style={{ borderColor: '#39B54A40', backgroundColor: '#39B54A0c' }}>
                <div className="text-[10px] font-bold uppercase tracking-widest text-[#39B54A] mb-1">{t('teamReminder.ifYes.label')}</div>
                <div className="text-xs text-muted-foreground">{t('teamReminder.ifYes.body')}</div>
              </div>
              <div className="p-3 rounded-xl border" style={{ borderColor: '#f59e0b40', backgroundColor: '#f59e0b0c' }}>
                <div className="text-[10px] font-bold uppercase tracking-widest text-[#f59e0b] mb-1">{t('teamReminder.ifNotYet.label')}</div>
                <div className="text-xs text-muted-foreground">{t('teamReminder.ifNotYet.body')}</div>
              </div>
              <div className="p-3 rounded-xl border" style={{ borderColor: '#6366f140', backgroundColor: '#6366f10c' }}>
                <div className="text-[10px] font-bold uppercase tracking-widest text-[#6366f1] mb-1">{t('teamReminder.todaysLink.label')}</div>
                <div className="text-xs text-muted-foreground">{t('teamReminder.todaysLink.body')}</div>
              </div>
            </div>
          </div>
        </div>

        </div>
        <SiteFooter className="snap-start" />
      </div>
    </div>
  );
}
