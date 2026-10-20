import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { TitleSlide } from '../components/templates/TitleSlide';
import { ConceptSlide } from '../components/templates/ConceptSlide';
import { ComparisonSlide } from '../components/templates/ComparisonSlide';
import { DiscussionSlide } from '../components/templates/DiscussionSlide';
import { TakeawaySlide } from '../components/templates/TakeawaySlide';
import { QuizSlide } from '../components/templates/QuizSlide';
import { CalloutBox } from '../components/shared/CalloutBox';
import { Rocket, ExternalLink } from 'lucide-react';
import { SectionNav } from '../components/navigation/SectionNav';
import { SiteFooter } from '../components/shared/SiteFooter';
import { TeamCheckpoint } from '../components/TeamCheckpoint';
import ethereumLogo from '../../ethereum-eth-logo.svg';
import vitalikPhoto from '../../vitalik-buterin.jpg';
import amazonLogo from '../../amazon.png';
import msnLogo from '../../msn.png';
import netscapeLogo from '../../netscape.png';
import tiktokLogo from '../../tiktok.jpg';
import youtubeLogo from '../../youtube.png';
import xLogo from '../../x-logo.jpg';
import bitcoinLogo from '../../bitcoin-btc-logo.svg';
import uniswapLogo from '../../uniswap-uni-logo.svg';
import usdcLogo from '../../usd-coin-usdc-logo.svg';

/** Sidebar shape — labels resolved at render time via i18n */
const section3ChaptersShape: ReadonlyArray<{ id: string; kind?: 'group' }> = [
  { kind: 'group', id: 'g-s3-eth' },
  { id: 's3-ethereum' },
  { id: 's3-eth-accounts' },
  { id: 's3-eth-apps' },

  { kind: 'group', id: 'g-s3-world' },
  { id: 's3-usecases' },
  { id: 's3-ecosystem' },

  { kind: 'group', id: 'g-s3-evol' },
  { id: 's3-web3' },
  { id: 's3-dapp' },

  { kind: 'group', id: 'g-s3-reflect' },
  { id: 's3-ethics' },
  { id: 's3-future' },
  { id: 's3-discussion' },

  { kind: 'group', id: 'g-s3-wrap' },
  { id: 's3-quiz' },
  { id: 's3-takeaways' },
  { id: 's3-recap' },
  { id: 's3-team-checkpoint' },
];

// ─── Knowledge Wall — recap of all Course 1 vocabulary ──────────────────────

interface Brick { term: string; defn: string; section: 1 | 2 | 3 }

/** Theme-level visual + section assignments — language-neutral. The actual
 *  term + defn text comes from the locale JSON keyed by themeId + brick index. */
interface ThemeShape { id: string; color: string; sections: (1 | 2 | 3)[] }

const KNOWLEDGE_WALL_SHAPE: ThemeShape[] = [
  { id: 'foundations', color: '#ED1C24', sections: [1, 1, 1, 1, 2, 2, 1] },
  { id: 'structure',   color: '#f59e0b', sections: [1, 1, 1, 2, 2, 2, 2, 2, 2] },
  { id: 'identity',    color: '#39B54A', sections: [2, 2, 2, 2, 2, 2] },
  { id: 'network',     color: '#6366f1', sections: [1, 1, 1, 2, 3, 2, 1, 2, 2, 2] },
  { id: 'bitcoin',     color: '#f7931a', sections: [2, 2, 2, 2, 2, 2, 2, 2] },
  { id: 'ethereum',    color: '#627EEA', sections: [3, 3, 3, 3, 3, 3, 3, 3, 3] },
  { id: 'web3',        color: '#8b5cf6', sections: [3, 3, 3, 3, 3, 3, 3, 3, 3] },
  { id: 'future',      color: '#22d3ee', sections: [3, 3, 3, 3, 3, 3, 3, 3] },
];

function sectionColor(s: 1 | 2 | 3): string {
  return s === 1 ? '#ED1C24' : s === 2 ? '#f59e0b' : '#39B54A';
}

function KnowledgeWall() {
  const { t } = useTranslation('blockchain-fundamentals/section-3');

  /** Build the runtime themed bricks: pull translated term + defn for each shape entry. */
  const themes = useMemo(() => KNOWLEDGE_WALL_SHAPE.map(shape => {
    const themeName = t(`knowledgeWall.themes.${shape.id}.name`);
    const bricks = shape.sections.map((section, i) => {
      const term = t(`knowledgeWall.themes.${shape.id}.bricks.${i}.term`);
      const defn = t(`knowledgeWall.themes.${shape.id}.bricks.${i}.defn`);
      return { term, defn, section } as Brick;
    });
    return { id: shape.id, name: themeName, color: shape.color, bricks };
  }), [t]);

  const totalBricks = themes.reduce((n, g) => n + g.bricks.length, 0);
  const [selected, setSelected] = useState<Brick | null>(themes[0].bricks[0]);

  return (
    <div className="h-full flex flex-col p-5 lg:p-8">
      {/* Header */}
      <div className="shrink-0 mb-3 flex items-start justify-between gap-4">
        <div>
          <span className="px-2.5 py-0.5 rounded-full bg-[#39B54A]/15 border border-[#39B54A]/40 text-[#39B54A] text-xs font-bold">{t('knowledgeWall.recapBadge')}</span>
          <h2 className="text-2xl lg:text-3xl font-bold text-foreground mt-1">{t('knowledgeWall.heading')}</h2>
          <p className="text-sm text-muted-foreground max-w-3xl">
            {t('knowledgeWall.leadA')} <span className="text-foreground font-semibold">{t('knowledgeWall.leadStrong', { count: totalBricks })}</span>
          </p>
        </div>
        {/* Legend */}
        <div className="shrink-0 flex flex-col gap-1 text-[10px]">
          <div className="font-bold uppercase tracking-widest text-muted-foreground mb-0.5">{t('knowledgeWall.firstMet')}</div>
          {[1, 2, 3].map(s => (
            <div key={s} className="flex items-center gap-1.5 text-muted-foreground">
              <span className="size-2 rounded-full" style={{ background: sectionColor(s as 1|2|3) }}></span>
              <span>§{s} — {t(`knowledgeWall.sectionNames.${s}`)}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Definition tray */}
      <div
        className="shrink-0 mb-3 p-4 bg-card border-2 rounded-xl transition-colors min-h-[88px]"
        style={{ borderColor: selected ? sectionColor(selected.section) + 'AA' : 'var(--border)' }}
      >
        {selected ? (
          <>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-lg lg:text-xl font-black" style={{ color: sectionColor(selected.section) }}>
                {selected.term}
              </span>
              <span
                className="text-[10px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded"
                style={{ color: sectionColor(selected.section), backgroundColor: sectionColor(selected.section) + '20' }}
              >
                §{selected.section}
              </span>
            </div>
            <p className="text-sm text-foreground leading-snug">{selected.defn}</p>
          </>
        ) : (
          <p className="text-sm text-muted-foreground italic">{t('knowledgeWall.hoverHint')}</p>
        )}
      </div>

      {/* Themed brick groups */}
      <div className="flex-1 min-h-0 overflow-y-auto pr-1 flex flex-col gap-3">
        {themes.map(group => (
          <div key={group.id}>
            <div className="flex items-baseline gap-2 mb-1.5 sticky top-0 bg-background/95 backdrop-blur-sm py-1 z-10">
              <span className="size-2 rounded-full shrink-0" style={{ background: group.color }}></span>
              <span className="text-[10px] font-black uppercase tracking-widest" style={{ color: group.color }}>
                {group.name}
              </span>
              <span className="text-[10px] text-muted-foreground">· {group.bricks.length}</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {group.bricks.map((b, i) => {
                const isSelected = selected?.term === b.term;
                return (
                  <button
                    key={`${group.id}-${i}`}
                    type="button"
                    onClick={() => setSelected(b)}
                    onMouseEnter={() => setSelected(b)}
                    onFocus={() => setSelected(b)}
                    className="relative px-2.5 py-1 rounded-md text-xs font-mono font-bold border transition-all hover:-translate-y-0.5"
                    style={{
                      color: isSelected ? '#fff' : group.color,
                      backgroundColor: isSelected ? group.color : group.color + '12',
                      borderColor: isSelected ? group.color : group.color + '45',
                      boxShadow: isSelected ? `0 2px 8px ${group.color}55` : undefined,
                    }}
                  >
                    {b.term}
                    {/* tiny source-section dot */}
                    <span
                      className="absolute -top-0.5 -right-0.5 size-1.5 rounded-full ring-1 ring-background"
                      style={{ background: sectionColor(b.section) }}
                      aria-hidden
                    />
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function Section3() {
  const { t } = useTranslation('blockchain-fundamentals/section-3');
  const section3Chapters = useMemo(
    () =>
      section3ChaptersShape.map((ch) =>
        ch.kind === 'group'
          ? { kind: 'group' as const, id: ch.id, label: t(`groups.${ch.id}`) }
          : { id: ch.id, label: t(`chapters.${ch.id}`) },
      ),
    [t],
  );
  return (
    <div className="h-full w-full flex overflow-hidden">
      <SectionNav chapters={section3Chapters} />
      <div id="section-scroll" className="flex-1 overflow-y-auto snap-y snap-mandatory">
        <div className="slide-flow">

        {/* ═══════ TITLE ═══════ */}
        <div className="h-full">
          <TitleSlide
            sectionNumber={t('title.sectionNumber')}
            title={t('title.title')}
            subtitle={t('title.subtitle')}
            icon={<Rocket className="size-20 text-[#39B54A]" />}
            gradient="from-[#39B54A] to-[#22d3ee]"
          />
        </div>

        {/* ═══════ 1. ETHEREUM & VITALIK BUTERIN ═══════ */}
        <div id="s3-ethereum" className="h-full flex flex-col p-5 lg:p-8">

          <div className="shrink-0 mb-4">
            <div className="flex items-center gap-2 mb-1.5 text-[10px] text-muted-foreground">
              <span className="px-1.5 py-0.5 rounded bg-[#f59e0b]/15 text-[#f59e0b] font-bold">{t('ethereum.recapBadge')}</span>
              <span>{t('ethereum.recapA')} <strong className="text-foreground">{t('ethereum.recapStrong')}</strong>{t('ethereum.recapTail')}</span>
            </div>
            <div className="flex items-center gap-3 mb-1">
              <img src={ethereumLogo} alt="Ethereum" className="h-8 object-contain" />
              <h2 className="text-2xl lg:text-3xl font-bold text-foreground">{t('ethereum.heading')}</h2>
            </div>
            <p className="text-sm text-muted-foreground">{t('ethereum.lead')}</p>
          </div>

          <div className="flex-1 min-h-0 grid grid-cols-3 gap-4">

            {/* Vitalik card */}
            <div className="bg-card border border-border rounded-xl overflow-hidden flex flex-col">
              <img src={vitalikPhoto} alt={t('ethereum.vitalikName')} className="w-full object-cover object-top flex-1 min-h-0" />
              <div className="p-4 shrink-0">
                <div className="font-black text-foreground text-lg leading-tight">{t('ethereum.vitalikName')}</div>
                <div className="text-xs text-[#627EEA] font-medium mt-0.5">{t('ethereum.vitalikRole')}</div>
                <div className="text-xs text-muted-foreground mt-2">{t('ethereum.vitalikBio')} <span className="text-foreground font-bold">{t('ethereum.vitalikAge')}</span>.</div>
              </div>
            </div>

            {/* Timeline + why */}
            <div className="col-span-2 flex flex-col gap-3 min-h-0">

              <div className="bg-card border border-border rounded-xl p-4 flex flex-col gap-3">
                <h3 className="font-bold text-foreground text-sm">{t('ethereum.whyTitle')}</h3>
                <p className="text-sm text-muted-foreground">
                  {t('ethereum.whyP1A')} <span className="text-foreground font-medium">{t('ethereum.whyP1Strong')}</span> {t('ethereum.whyP1Tail')}
                </p>
                <p className="text-sm text-muted-foreground">
                  {t('ethereum.whyP2A')} <span className="text-foreground font-medium">{t('ethereum.whyP2Strong1')}</span> {t('ethereum.whyP2Mid')} <span className="text-foreground font-medium">{t('ethereum.whyP2Strong2')}</span>{t('ethereum.whyP2Tail')}
                </p>
              </div>

              <div className="flex gap-3 flex-1 min-h-0">

                <div className="flex flex-col gap-2 flex-1">
                  {(['#627EEA','#627EEA','#39B54A','#ED1C24','#8b5cf6','#8b5cf6','#22d3ee']).map((color, i) => {
                    const events = t('ethereum.events', { returnObjects: true }) as Array<{ year: string; label: string }>;
                    const ev = events[i];
                    const soon = i === 6;
                    return (
                      <div key={i} className={`flex items-center gap-3 rounded-lg px-3 py-2 ${soon ? 'bg-[#22d3ee]/10 border border-dashed border-[#22d3ee]/50' : 'bg-card border border-border'}`}>
                        <span className="font-black text-sm shrink-0" style={{ color }}>{ev.year}</span>
                        <span className="text-sm text-muted-foreground flex-1">{ev.label}</span>
                        {soon && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#22d3ee]/20 text-[#22d3ee] shrink-0">{t('ethereum.soonBadge')}</span>
                        )}
                      </div>
                    );
                  })}
                  <a
                    href="https://rabby.io"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 px-3 py-2.5 bg-[#7084ff]/10 border border-[#7084ff]/40 rounded-lg hover:bg-[#7084ff]/20 hover:border-[#7084ff]/70 transition-all group mt-1"
                  >
                    <span className="text-xl shrink-0">🐰</span>
                    <div className="flex-1">
                      <div className="text-sm font-bold text-[#7084ff]">{t('ethereum.walletCta')}</div>
                      <div className="text-xs text-muted-foreground">rabby.io</div>
                    </div>
                    <ExternalLink className="size-4 text-[#7084ff]/60 group-hover:text-[#7084ff] transition-colors shrink-0" />
                  </a>
                </div>

                <div className="w-40 shrink-0 flex flex-col gap-2">
                  <div className="bg-gradient-to-br from-[#627EEA]/20 to-transparent border border-[#627EEA]/40 rounded-xl p-3 flex flex-col items-center text-center flex-1">
                    <img src={ethereumLogo} alt="ETH" className="h-10 object-contain mb-2" />
                    <div className="text-xl font-black text-[#627EEA]">{t('ethereum.rank')}</div>
                    <div className="text-xs text-muted-foreground mt-1">{t('ethereum.rankNote')}</div>
                  </div>
                  <div className="bg-card border border-border rounded-xl p-3 text-center">
                    <div className="text-lg font-black text-foreground">{t('ethereum.dappCount')}</div>
                    <div className="text-xs text-muted-foreground">{t('ethereum.dappCountNote')}</div>
                  </div>
                </div>

              </div>

            </div>

          </div>
        </div>

        {/* ═══════ ETH ACCOUNTS & GAS ═══════ */}
        <div id="s3-eth-accounts" className="h-full flex flex-col p-5 lg:p-8">
          <div className="shrink-0 mb-4">
            <div className="flex items-center gap-2 mb-1.5 text-[10px] text-muted-foreground">
              <span className="px-1.5 py-0.5 rounded bg-[#f59e0b]/15 text-[#f59e0b] font-bold">{t('ethAccounts.recapBadge')}</span>
              <span>{t('ethAccounts.recapA')} <strong className="text-foreground">{t('ethAccounts.recapStrong')}</strong> {t('ethAccounts.recapTail')}</span>
            </div>
            <div className="flex items-center gap-3 mb-1">
              <img src={ethereumLogo} alt="Ethereum" className="h-7 object-contain" />
              <h2 className="text-2xl lg:text-3xl font-bold text-foreground">{t('ethAccounts.heading')}</h2>
            </div>
            <p className="text-sm text-muted-foreground">{t('ethAccounts.lead')}</p>
          </div>
          <div className="flex-1 min-h-0 grid grid-cols-2 gap-5">
            {/* Accounts */}
            <div className="flex flex-col gap-3">
              <div className="font-bold text-sm text-foreground">{t('ethAccounts.accountsHeader')}</div>
              <div className="flex-1 grid grid-rows-2 gap-3">
                <div className="p-4 bg-[#627EEA]/8 border border-[#627EEA]/30 rounded-xl flex flex-col gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">🧑</span>
                    <div className="font-bold text-[#627EEA]">{t('ethAccounts.eoaTitle')}</div>
                  </div>
                  <ul className="text-sm text-muted-foreground space-y-1.5">
                    {(t('ethAccounts.eoaPoints', { returnObjects: true }) as Array<{ leadA: string; strong: string; tail: string }>).map((p, i) => (
                      <li key={i} className="flex gap-2"><span className="text-[#627EEA] shrink-0">•</span>{p.leadA}{p.strong && <span className="font-semibold text-foreground">{p.strong}</span>}{p.tail}</li>
                    ))}
                  </ul>
                </div>
                <div className="p-4 bg-[#39B54A]/8 border border-[#39B54A]/30 rounded-xl flex flex-col gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">📄</span>
                    <div className="font-bold text-[#39B54A]">{t('ethAccounts.contractTitle')}</div>
                  </div>
                  <ul className="text-sm text-muted-foreground space-y-1.5">
                    {(t('ethAccounts.contractPoints', { returnObjects: true }) as Array<{ leadA: string; strong: string; tail: string }>).map((p, i) => (
                      <li key={i} className="flex gap-2"><span className="text-[#39B54A] shrink-0">•</span>{p.leadA}{p.strong && <span className="font-semibold text-foreground">{p.strong}</span>}{p.tail}</li>
                    ))}
                  </ul>
                </div>
              </div>
              <div className="p-3 bg-[#f59e0b]/10 border border-[#f59e0b]/30 rounded-lg text-xs text-muted-foreground">
                <span className="font-bold text-[#f59e0b]">{t('ethAccounts.keyRuleStrong')}</span> {t('ethAccounts.keyRuleBody')}
              </div>
            </div>
            {/* Gas */}
            <div className="flex flex-col gap-3">
              <div className="font-bold text-sm text-foreground">{t('ethAccounts.gasHeader')}</div>
              <div className="p-4 bg-card border border-border rounded-xl text-sm text-muted-foreground leading-relaxed">
                {t('ethAccounts.gasIntroA')} <span className="font-semibold text-foreground">{t('ethAccounts.gasIntroStrong')}</span> {t('ethAccounts.gasIntroTail')}
              </div>
              <div className="flex-1 grid grid-rows-2 gap-3">
                <div className="p-4 bg-card border border-border rounded-xl">
                  <div className="font-bold text-sm text-foreground mb-2">{t('ethAccounts.gasExamplesTitle')}</div>
                  {(['#39B54A','#6366f1','#f59e0b','#ED1C24','#8b5cf6']).map((color, i) => {
                    const rows = t('ethAccounts.gasRows', { returnObjects: true }) as Array<{ op: string; gas: string; note: string }>;
                    const r = rows[i];
                    return (
                      <div key={i} className="flex items-center gap-2 py-1 border-b border-border/50 last:border-0">
                        <span className="text-xs text-muted-foreground flex-1">{r.op}</span>
                        <span className="text-xs font-black shrink-0" style={{ color }}>{r.gas}</span>
                      </div>
                    );
                  })}
                </div>
                <div className="p-4 bg-[#627EEA]/8 border border-[#627EEA]/30 rounded-xl">
                  <div className="font-bold text-sm text-[#627EEA] mb-2">{t('ethAccounts.gasFormulaTitle')}</div>
                  <ul className="text-sm text-muted-foreground space-y-1.5">
                    {(t('ethAccounts.gasFormulaPoints', { returnObjects: true }) as Array<{ strong: string; tail: string }>).map((p, i) => (
                      <li key={i} className="flex gap-2"><span className="text-[#627EEA] shrink-0">•</span>{p.strong && <span className="font-semibold text-foreground">{p.strong}</span>}<span dangerouslySetInnerHTML={{ __html: p.tail }} /></li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ═══════ ETH APPLICATIONS: DeFi · NFTs · DAOs ═══════ */}
        <div id="s3-eth-apps" className="h-full flex flex-col p-5 lg:p-8">
          <div className="shrink-0 mb-4">
            <div className="flex items-center gap-2 mb-1.5 text-[10px] text-muted-foreground">
              <span className="px-1.5 py-0.5 rounded bg-[#627EEA]/15 text-[#627EEA] font-bold">{t('ethApps.recapBadge')}</span>
              <span>{t('ethApps.recapBody')}</span>
            </div>
            <div className="flex items-center gap-3 mb-1">
              <img src={ethereumLogo} alt="Ethereum" className="h-7 object-contain" />
              <h2 className="text-2xl lg:text-3xl font-bold text-foreground">{t('ethApps.heading')}</h2>
            </div>
            <p className="text-sm text-muted-foreground">{t('ethApps.lead')}</p>
          </div>
          <div className="flex-1 min-h-0 flex gap-4">
            {([
              { icon: '🏦', color: '#39B54A' },
              { icon: '🖼️', color: '#f97316' },
              { icon: '🏛️', color: '#6366f1' },
            ]).map((cfg, i) => {
              const apps = t('ethApps.apps', { returnObjects: true }) as Array<{ title: string; subtitle: string; replaces: string; description: string; examples: Array<{ name: string; desc: string }>; risk: string; stat: string }>;
              const app = apps[i];
              return (
                <div key={i} className="flex-1 flex flex-col rounded-xl border-2 bg-card overflow-hidden" style={{ borderColor: cfg.color + '40' }}>
                  <div className="h-1.5 shrink-0" style={{ backgroundColor: cfg.color }} />
                  <div className="flex flex-col flex-1 p-4 gap-3 min-h-0">
                    <div className="shrink-0 flex items-center gap-2">
                      <span className="text-2xl">{cfg.icon}</span>
                      <div>
                        <div className="font-black text-lg leading-none" style={{ color: cfg.color }}>{app.title}</div>
                        <div className="text-xs font-semibold text-foreground">{app.subtitle}</div>
                      </div>
                      <div className="ml-auto text-xs text-muted-foreground italic">{t('ethApps.replacesLabel')} {app.replaces}</div>
                    </div>
                    <p className="text-sm text-muted-foreground shrink-0">{app.description}</p>
                    <div className="flex-1 min-h-0 space-y-2">
                      {app.examples.map((ex, j) => (
                        <div key={j} className="p-2.5 rounded-lg bg-muted/40 border border-border">
                          <div className="font-bold text-xs text-foreground mb-0.5">{ex.name}</div>
                          <div className="text-xs text-muted-foreground">{ex.desc}</div>
                        </div>
                      ))}
                    </div>
                    <div className="shrink-0 pt-3 border-t border-border space-y-1.5">
                      <div className="text-xs text-muted-foreground"><span className="font-semibold text-[#ef4444]">{t('ethApps.riskLabel')} </span>{app.risk}</div>
                      <div className="text-xs font-semibold" style={{ color: cfg.color }}>{app.stat}</div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ═══════ 2. BLOCKCHAIN USE CASES — GROUPED BY PATTERN ═══════ */}
        <div id="s3-usecases" className="h-full flex flex-col p-5 lg:p-8">

          <div className="shrink-0 mb-3">
            <div className="flex items-center gap-2 mb-1.5 text-[10px] text-muted-foreground">
              <span className="px-1.5 py-0.5 rounded bg-[#ED1C24]/15 text-[#ED1C24] font-bold">{t('useCases.recapBadge')}</span>
              <span>{t('useCases.recapBody')}</span>
            </div>
            <h2 className="text-2xl lg:text-3xl font-bold text-foreground mb-1">{t('useCases.heading')}</h2>
            <p className="text-sm text-muted-foreground max-w-3xl">
              {t('useCases.leadA')} <strong className="text-foreground">{t('useCases.leadStrong')}</strong> {t('useCases.leadTail')}
            </p>
          </div>

          <div className="flex-1 min-h-0 grid grid-cols-3 gap-3">
            {([
              { emoji: '🤝', color: '#f59e0b', industryEmojis: ['💰','📈','🏦','🪙'] },
              { emoji: '🔗', color: '#39B54A', industryEmojis: ['🚚','🌐','🏥','🎬'] },
              { emoji: '🌐', color: '#6366f1', industryEmojis: ['🪪','🗳️','🌍','⚖️'] },
            ]).map((cfg, i) => {
              const groups = t('useCases.groups', { returnObjects: true }) as Array<{ pattern: string; tagline: string; industries: Array<{ name: string; hook: string }> }>;
              const group = groups[i];
              return (
                <div key={i} className="flex flex-col rounded-xl border-2 bg-card overflow-hidden" style={{ borderColor: cfg.color + '55' }}>
                  <div className="h-1.5 shrink-0" style={{ backgroundColor: cfg.color }} />
                  <div className="flex flex-col flex-1 p-4 gap-3 min-h-0">
                    <div className="shrink-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-2xl">{cfg.emoji}</span>
                        <div className="text-[10px] font-black uppercase tracking-widest" style={{ color: cfg.color }}>{t('useCases.patternLabel')}</div>
                      </div>
                      <h3 className="font-black text-base lg:text-lg leading-tight text-foreground">{group.pattern}</h3>
                      <p className="text-xs text-muted-foreground mt-1 leading-snug">{group.tagline}</p>
                    </div>
                    <div className="flex-1 min-h-0 flex flex-col gap-1.5">
                      <div className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">{t('useCases.showsUpIn')}</div>
                      {group.industries.map((ind, j) => (
                        <div key={j} className="rounded-lg border bg-card/60 p-2" style={{ borderColor: cfg.color + '30' }}>
                          <div className="flex items-center gap-2">
                            <span className="text-base shrink-0">{cfg.industryEmojis[j]}</span>
                            <span className="font-bold text-xs text-foreground">{ind.name}</span>
                          </div>
                          <div className="text-[11px] text-muted-foreground leading-snug mt-0.5">{ind.hook}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="shrink-0 mt-3 p-2.5 bg-muted/40 border border-border rounded-lg text-[11px] text-muted-foreground">
            <strong className="text-foreground">{t('useCases.noticeStrong')}</strong> {t('useCases.noticeBodyA')} <em>{t('useCases.noticeBodyEm')}</em>{t('useCases.noticeBodyTail')}
          </div>
        </div>

        {/* ═══════ 2. BLOCKCHAIN & WEB3 ECOSYSTEM MAP ═══════ */}
        <div id="s3-ecosystem" className="h-full flex items-center justify-center p-8">
          <div className="max-w-4xl w-full">
            <div className="flex items-center justify-center gap-2 mb-2 text-[10px] text-muted-foreground">
              <span className="px-1.5 py-0.5 rounded bg-[#6366f1]/15 text-[#6366f1] font-bold">{t('ecosystem.recapBadge')}</span>
              <span>{t('ecosystem.recapBody')}</span>
            </div>
            <h2 className="text-3xl font-bold text-foreground mb-1 text-center">{t('ecosystem.heading')}</h2>
            <p className="text-sm text-muted-foreground text-center mb-6">
              {t('ecosystem.lead')}
            </p>

            <div className="space-y-2">

              {/* Layer: Users */}
              <div className="p-4 rounded-xl bg-gradient-to-r from-[#39B54A]/20 to-transparent border border-[#39B54A]/40">
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-base">👤</span>
                  <span className="font-bold text-[#39B54A] text-xs uppercase tracking-widest">{t('ecosystem.users')}</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {(t('ecosystem.userTags', { returnObjects: true }) as string[]).map((u, i) => (
                    <span key={i} className="px-3 py-1 bg-[#39B54A]/10 border border-[#39B54A]/30 rounded-full text-xs text-foreground">{u}</span>
                  ))}
                </div>
              </div>

              {/* Layer: Interfaces */}
              <div className="p-4 rounded-xl bg-gradient-to-r from-[#6366f1]/20 to-transparent border border-[#6366f1]/40">
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-base">🖥️</span>
                  <span className="font-bold text-[#6366f1] text-xs uppercase tracking-widest">{t('ecosystem.interfaces')}</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {(t('ecosystem.interfaceTags', { returnObjects: true }) as string[]).map((u, i) => (
                    <span key={i} className="px-3 py-1 bg-[#6366f1]/10 border border-[#6366f1]/30 rounded-full text-xs text-foreground">{u}</span>
                  ))}
                </div>
              </div>

              {/* Layer: Applications */}
              <div className="p-4 rounded-xl bg-gradient-to-r from-[#f59e0b]/20 to-transparent border border-[#f59e0b]/40">
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-base">⚙️</span>
                  <span className="font-bold text-[#f59e0b] text-xs uppercase tracking-widest">{t('ecosystem.applications')}</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {(t('ecosystem.appTags', { returnObjects: true }) as string[]).map((u, i) => (
                    <span key={i} className="px-3 py-1 bg-[#f59e0b]/10 border border-[#f59e0b]/30 rounded-full text-xs text-foreground">{u}</span>
                  ))}
                </div>
              </div>

              {/* Layer: Blockchains */}
              <div className="p-4 rounded-xl bg-gradient-to-r from-[#ED1C24]/20 to-transparent border border-[#ED1C24]/40">
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-base">⛓️</span>
                  <span className="font-bold text-[#ED1C24] text-xs uppercase tracking-widest">{t('ecosystem.blockchainLayer')}</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {(t('ecosystem.chainTags', { returnObjects: true }) as string[]).map((u, i) => (
                    <span key={i} className="px-3 py-1 bg-[#ED1C24]/10 border border-[#ED1C24]/30 rounded-full text-xs text-foreground">{u}</span>
                  ))}
                </div>
              </div>

              {/* Layer: Infrastructure */}
              <div className="p-4 rounded-xl bg-gradient-to-r from-[#9ca3af]/10 to-transparent border border-[#9ca3af]/30">
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-base">🖧</span>
                  <span className="font-bold text-muted-foreground text-xs uppercase tracking-widest">{t('ecosystem.infrastructure')}</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {(t('ecosystem.infraTags', { returnObjects: true }) as string[]).map((u, i) => (
                    <span key={i} className="px-3 py-1 bg-muted border border-border rounded-full text-xs text-foreground">{u}</span>
                  ))}
                </div>
              </div>

            </div>
          </div>
        </div>

        {/* ═══════ 3. EVOLUTION OF THE INTERNET — WEB1 / WEB2 / WEB3 ═══════ */}
        <div id="s3-web3" className="h-full flex flex-col items-center p-8">
          <div className="max-w-5xl w-full flex-1 flex flex-col min-h-0">
            <div className="flex items-center justify-center gap-2 mb-2 text-[10px] text-muted-foreground shrink-0">
              <span className="px-1.5 py-0.5 rounded bg-[#39B54A]/15 text-[#39B54A] font-bold">{t('web3.kickerBadge')}</span>
              <span>{t('web3.kickerBodyA')} <strong className="text-foreground">{t('web3.kickerStrong')}</strong> {t('web3.kickerTail')}</span>
            </div>
            <h2 className="text-3xl font-bold text-foreground mb-1 text-center shrink-0">{t('web3.heading')}</h2>
            <p className="text-sm text-muted-foreground text-center mb-4 shrink-0">
              {t('web3.lead')}
            </p>

            <div className="grid grid-cols-3 gap-5 flex-1 min-h-0">

              {/* Web1 */}
              <div className="p-6 bg-card rounded-2xl border-2 border-[#9ca3af]/40 flex flex-col gap-3 h-full overflow-y-auto">
                <div className="flex items-center gap-3">
                  <div className="size-10 rounded-full bg-[#9ca3af]/20 border border-[#9ca3af]/40 flex items-center justify-center text-lg">🌐</div>
                  <div>
                    <div className="font-black text-foreground text-lg">{t('web3.web1.label')}</div>
                    <div className="text-xs text-muted-foreground">{t('web3.web1.period')}</div>
                  </div>
                </div>
                <div className="flex items-center justify-around gap-2 py-2 px-3 bg-[#9ca3af]/10 rounded-xl">
                  <img src={amazonLogo} alt="Amazon" className="h-7 object-contain" />
                  <img src={msnLogo} alt="MSN" className="h-7 object-contain" />
                  <img src={netscapeLogo} alt="Netscape" className="h-7 object-contain" />
                </div>
                <div className="px-3 py-1.5 bg-[#9ca3af]/20 rounded-full text-center text-xs font-bold text-muted-foreground tracking-widest">{t('web3.web1.tagline')}</div>
                <ul className="space-y-1.5 text-sm text-muted-foreground flex-1">
                  {(t('web3.web1.bullets', { returnObjects: true }) as string[]).map((b, i) => (
                    <li key={i} className="flex gap-2"><span className="text-[#9ca3af] shrink-0">•</span>{b}</li>
                  ))}
                </ul>
                <div className="mt-auto p-3 bg-muted rounded-lg text-xs text-muted-foreground italic">
                  {t('web3.web1.quote')}
                </div>
              </div>

              {/* Web2 */}
              <div className="p-6 bg-card rounded-2xl border-2 border-[#6366f1]/50 flex flex-col gap-3 h-full overflow-y-auto">
                <div className="flex items-center gap-3">
                  <div className="size-10 rounded-full bg-[#6366f1]/20 border border-[#6366f1]/40 flex items-center justify-center text-lg">📱</div>
                  <div>
                    <div className="font-black text-foreground text-lg">{t('web3.web2.label')}</div>
                    <div className="text-xs text-muted-foreground">{t('web3.web2.period')}</div>
                  </div>
                </div>
                <div className="flex items-center justify-around gap-2 py-2 px-3 bg-[#6366f1]/10 rounded-xl">
                  <img src={tiktokLogo} alt="TikTok" className="h-7 object-contain" />
                  <img src={youtubeLogo} alt="YouTube" className="h-7 object-contain" />
                  <img src={xLogo} alt="X" className="h-7 object-contain rounded" />
                </div>
                <div className="px-3 py-1.5 bg-[#6366f1]/20 rounded-full text-center text-xs font-bold text-[#6366f1] tracking-widest">{t('web3.web2.tagline')}</div>
                <ul className="space-y-1.5 text-sm text-muted-foreground flex-1">
                  {(t('web3.web2.bullets', { returnObjects: true }) as string[]).map((b, i) => (
                    <li key={i} className="flex gap-2"><span className="text-[#6366f1] shrink-0">•</span>{b}</li>
                  ))}
                </ul>
                <div className="mt-auto p-3 bg-muted rounded-lg text-xs text-muted-foreground italic">
                  {t('web3.web2.quote')}
                </div>
              </div>

              {/* Web3 */}
              <div className="p-6 bg-card rounded-2xl border-2 border-[#39B54A]/60 flex flex-col gap-3 shadow-[0_0_20px_rgba(57,181,74,0.1)] h-full overflow-y-auto">
                <div className="flex items-center gap-3">
                  <div className="size-10 rounded-full bg-[#39B54A]/20 border border-[#39B54A]/50 flex items-center justify-center text-lg">🔐</div>
                  <div>
                    <div className="font-black text-foreground text-lg">{t('web3.web3.label')}</div>
                    <div className="text-xs text-[#39B54A]">{t('web3.web3.period')}</div>
                  </div>
                </div>
                <div className="flex items-center justify-around gap-2 py-2 px-3 bg-[#39B54A]/10 rounded-xl">
                  <img src={bitcoinLogo} alt="Bitcoin" className="h-7 object-contain" />
                  <img src={uniswapLogo} alt="Uniswap" className="h-7 object-contain" />
                  <img src={usdcLogo} alt="USDC" className="h-7 object-contain" />
                </div>
                <div className="px-3 py-1.5 bg-[#39B54A]/20 rounded-full text-center text-xs font-bold text-[#39B54A] tracking-widest">{t('web3.web3.tagline')}</div>
                <ul className="space-y-1.5 text-sm text-muted-foreground flex-1">
                  {(t('web3.web3.bullets', { returnObjects: true }) as string[]).map((b, i) => (
                    <li key={i} className="flex gap-2"><span className="text-[#39B54A] shrink-0">•</span>{b}</li>
                  ))}
                </ul>
                <div className="mt-auto p-3 bg-[#39B54A]/10 rounded-lg border border-[#39B54A]/20 text-xs text-muted-foreground italic">
                  {t('web3.web3.quote')}
                </div>
              </div>

            </div>
          </div>
        </div>

        {/* ═══════ 4. TODAY'S APP vs DAPP ═══════ */}
        <div id="s3-dapp" className="h-full">
          <ComparisonSlide
            title={t('dappComparison.title')}
            option1Label={t('dappComparison.option1Label')}
            option2Label={t('dappComparison.option2Label')}
            items={t('dappComparison.items', { returnObjects: true }) as Array<{ feature: string; option1: string; option2: string }>}
          />
        </div>

        {/* ═══════ 5. ETHICAL CONSIDERATIONS ═══════ */}
        <div id="s3-ethics" className="h-full flex flex-col p-5 lg:p-8">

          {/* Header */}
          <div className="shrink-0 mb-3">
            <div className="flex items-center gap-2 mb-1.5 text-[10px] text-muted-foreground">
              <span className="px-1.5 py-0.5 rounded bg-[#ED1C24]/15 text-[#ED1C24] font-bold">{t('ethics.recapBadge')}</span>
              <span>{t('ethics.recapA')} <strong className="text-foreground">{t('ethics.recapStrong')}</strong> {t('ethics.recapTail')}</span>
            </div>
            <h2 className="text-2xl lg:text-3xl font-bold text-foreground mb-1">{t('ethics.heading')}</h2>
            <p className="text-sm text-muted-foreground">{t('ethics.lead')}</p>
          </div>

          {/* Top row — 4 compact ethical themes */}
          <div className="grid grid-cols-4 gap-3 shrink-0 mb-3">
            {(['#ED1C24','#8b5cf6','#f59e0b','#39B54A']).map((color, i) => {
              const themes = t('ethics.themes', { returnObjects: true }) as Array<{ title: string; desc: string }>;
              const th = themes[i];
              return (
                <div key={i} className="p-5 rounded-xl border" style={{ borderColor: color + '4D', background: `linear-gradient(to bottom right, ${color}26, transparent)` }}>
                  <div className="font-bold text-sm mb-2" style={{ color }}>{th.title}</div>
                  <p className="text-sm text-muted-foreground">{th.desc}</p>
                </div>
              );
            })}
          </div>

          {/* Bottom row — Promise vs Peril with real projects */}
          <div className="flex-1 min-h-0 grid grid-cols-2 gap-4">

            {/* Positive projects */}
            <div className="flex flex-col min-h-0">
              <div className="flex items-center gap-2 mb-2 shrink-0">
                <div className="size-5 rounded-full bg-[#39B54A] flex items-center justify-center text-white text-xs font-black">+</div>
                <h3 className="font-bold text-[#39B54A] text-sm tracking-wide">{t('ethics.goodHeader')}</h3>
              </div>

              <div className="bg-card border border-[#39B54A]/40 rounded-xl p-4 flex flex-col flex-1 min-h-0 gap-0">
                {(['🌍','🤝']).map((emoji, idx) => {
                  const good = t('ethics.good', { returnObjects: true }) as Array<{ title: string; points: string[] }>;
                  const proj = good[idx];
                  return (
                    <div key={idx} className={`flex-1 flex flex-col min-h-0 ${idx === 0 ? 'pb-3' : 'border-t border-border pt-3'}`}>
                      <div className="flex items-center gap-2 mb-2 shrink-0">
                        <span className="text-xl shrink-0">{emoji}</span>
                        <div className="font-bold text-foreground text-sm">{proj.title}</div>
                      </div>
                      <ul className="text-xs text-muted-foreground space-y-1.5">
                        {proj.points.map((p, i) => (
                          <li key={i} className="flex gap-2"><span className="text-[#39B54A] shrink-0">•</span>{p}</li>
                        ))}
                      </ul>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Negative / concerning projects */}
            <div className="flex flex-col min-h-0">
              <div className="flex items-center gap-2 mb-2 shrink-0">
                <div className="size-5 rounded-full bg-[#ED1C24] flex items-center justify-center text-white text-xs font-black">!</div>
                <h3 className="font-bold text-[#ED1C24] text-sm tracking-wide">{t('ethics.controlHeader')}</h3>
              </div>

              <div className="bg-card border border-[#ED1C24]/40 rounded-xl p-4 flex flex-col flex-1 min-h-0 gap-0">
                {(['🇨🇳','🇪🇺']).map((emoji, idx) => {
                  const control = t('ethics.control', { returnObjects: true }) as Array<{ title: string; points: string[] }>;
                  const proj = control[idx];
                  return (
                    <div key={idx} className={`flex-1 flex flex-col min-h-0 ${idx === 0 ? 'pb-3' : 'border-t border-border pt-3'}`}>
                      <div className="flex items-center gap-2 mb-2 shrink-0">
                        <span className="text-xl shrink-0">{emoji}</span>
                        <div className="font-bold text-foreground text-sm">{proj.title}</div>
                      </div>
                      <ul className="text-xs text-muted-foreground space-y-1.5">
                        {proj.points.map((p, i) => (
                          <li key={i} className="flex gap-2"><span className="text-[#ED1C24] shrink-0">•</span>{p}</li>
                        ))}
                      </ul>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>
        </div>

        {/* ═══════ 6. FUTURE TRENDS ═══════ */}
        <div id="s3-future" className="h-full">
          <ConceptSlide
            title={t('future.title')}
            description={t('future.description')}
            visual={
              <div className="grid grid-cols-2 gap-4">
                {(['#ED1C24','#6366f1','#39B54A','#f59e0b','#8b5cf6','#22d3ee']).map((color, i) => {
                  const trends = t('future.trends', { returnObjects: true }) as Array<{ title: string; desc: string }>;
                  const trend = trends[i];
                  return (
                    <div key={i} className="p-5 rounded-xl border" style={{ borderColor: color + '4D', background: `linear-gradient(to bottom right, ${color}33, transparent)` }}>
                      <h4 className="font-bold mb-2" style={{ color }}>{trend.title}</h4>
                      <p className="text-sm text-muted-foreground">{trend.desc}</p>
                    </div>
                  );
                })}
              </div>
            }
            keyPoints={t('future.keyPoints', { returnObjects: true }) as string[]}
          />
        </div>

        {/* ═══════ DISCUSSION ═══════ */}
        <div id="s3-discussion" className="h-full">
          <DiscussionSlide
            prompt={t('discussion.prompt')}
            guidingQuestions={t('discussion.guidingQuestions', { returnObjects: true }) as string[]}
          />
        </div>

        {/* ═══════ QUIZZES ═══════ */}
        <div id="s3-quiz" className="h-full">
          <QuizSlide
            question={t('quizWeb3.question')}
            options={(t('quizWeb3.options', { returnObjects: true }) as string[]).map((text, i) => ({ text, correct: i === 1 }))}
            explanation={t('quizWeb3.explanation')}
          />
        </div>

        <div className="h-full">
          <QuizSlide
            question={t('quizDapp.question')}
            options={(t('quizDapp.options', { returnObjects: true }) as string[]).map((text, i) => ({ text, correct: i === 1 }))}
            explanation={t('quizDapp.explanation')}
          />
        </div>

        <div className="h-full">
          <QuizSlide
            question={t('quizLayers.question')}
            options={(t('quizLayers.options', { returnObjects: true }) as string[]).map((text, i) => ({ text, correct: i === 2 }))}
            explanation={t('quizLayers.explanation')}
          />
        </div>

        {/* ═══════ TAKEAWAYS ═══════ */}
        <div id="s3-takeaways" className="h-full">
          <TakeawaySlide
            title={t('takeaways.title')}
            takeaways={t('takeaways.items', { returnObjects: true }) as string[]}
          />
        </div>

        {/* ═══════ KNOWLEDGE WALL — RECAP OF EVERYTHING ═══════ */}
        <div id="s3-recap" className="h-full">
          <KnowledgeWall />
        </div>

        {/* ═══════ TEAM CHECKPOINT — DAY 1 WRAP ═══════ */}
        <div id="s3-team-checkpoint" className="h-full">
          <TeamCheckpoint
            contextLabel={t('teamCheckpoint.contextLabel')}
            title={t('teamCheckpoint.title')}
            subtitle={t('teamCheckpoint.subtitle')}
            duration={t('teamCheckpoint.duration')}
            sections={[
              {
                label: t('teamCheckpoint.doNowLabel'),
                color: '#39B54A',
                items: (t('teamCheckpoint.doNow', { returnObjects: true }) as Array<{ leadA: string; strong: string; tail: string }>).map((p, i) => (
                  <span key={i}>{p.leadA}{p.strong && <strong>{p.strong}</strong>}{p.tail}</span>
                )),
              },
              {
                label: t('teamCheckpoint.discussLabel'),
                color: '#6366f1',
                items: (t('teamCheckpoint.discuss', { returnObjects: true }) as Array<{ leadA: string; strong: string; tail: string }>).map((p, i) => (
                  <span key={i}>{p.leadA}{p.strong && <strong>{p.strong}</strong>}{p.tail}</span>
                )),
              },
              {
                label: t('teamCheckpoint.bringLabel'),
                color: '#8b5cf6',
                items: (t('teamCheckpoint.bring', { returnObjects: true }) as Array<{ leadA: string; strong: string; tail: string }>).map((p, i) => (
                  <span key={i}>{p.leadA}{p.strong && <strong>{p.strong}</strong>}{p.tail}</span>
                )),
              },
            ]}
            footnote={
              <span className="text-muted-foreground">
                <strong className="text-foreground">{t('teamCheckpoint.footnoteStrong')}</strong> {t('teamCheckpoint.footnoteBody')}
              </span>
            }
          />
        </div>

      </div>
        <SiteFooter className="snap-start" />
      </div>
    </div>
  );
}
