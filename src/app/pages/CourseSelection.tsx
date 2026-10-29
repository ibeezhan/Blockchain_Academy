import { useState } from 'react';
import { Link } from 'react-router';
import { useTranslation } from 'react-i18next';
import { ArrowRight, Lock, Sparkles, Heart } from 'lucide-react';
import { useLang } from '../../i18n/useLang';
import { LanguageSwitcher } from '../components/navigation/LanguageSwitcher';
import { BrandLogo } from '../components/shared/BrandLogo';
import { SiteFooter } from '../components/shared/SiteFooter';
import { BlockchainCheckGame } from '../components/blockchain/BlockchainCheckGame';
import { useFitToViewport } from '../hooks/useFitToViewport';

interface Course {
  number: string;
  /** i18n key under `courses.<key>` in common.json. Empty string means the
   *  card uses hardcoded English (Course 4 is intentionally not translated). */
  i18nKey: string;
  /** Hardcoded fallback used when i18nKey is empty (Course 4). */
  staticTitle?: string;
  staticDescription?: string;
  staticTopics?: string[];
  gradient: string;
  accentColor: string;
  slug: string;
  available: boolean;
}

const courses: Course[] = [
  {
    number: '01',
    i18nKey: 'blockchainFundamentals',
    gradient: 'from-[#ED1C24] to-[#f59e0b]',
    accentColor: '#ED1C24',
    slug: 'blockchain-fundamentals',
    available: true,
  },
  {
    number: '02',
    i18nKey: 'blockchainPlatforms',
    gradient: 'from-[#39B54A] to-[#22d3ee]',
    accentColor: '#39B54A',
    slug: 'blockchain-platforms',
    available: true,
  },
  {
    number: '03',
    i18nKey: 'smartContracts',
    gradient: 'from-[#6366f1] to-[#8b5cf6]',
    accentColor: '#6366f1',
    slug: 'smart-contracts',
    available: true,
  },
  {
    number: '04',
    i18nKey: 'projectManagement',
    gradient: 'from-[#f97316] to-[#eab308]',
    accentColor: '#f97316',
    slug: 'project-management',
    available: true,
  },
];

export function CourseSelection() {
  const { t } = useTranslation();
  const { t: tg } = useTranslation('blockchain-check');
  const lang = useLang();
  const [gameOpen, setGameOpen] = useState(false);
  // Scale the hero content so the title, course cards and mini-game always fit
  // within one viewport height — the footer is the only thing below the fold.
  const { ref: fitRef, scale } = useFitToViewport(48);

  return (
    <div className="size-full overflow-y-auto">
      {/* Hero — pinned to one viewport height on lg+; flows naturally below lg */}
      <div className="h-[100dvh] max-lg:h-auto max-lg:min-h-[100dvh] flex flex-col items-center justify-center p-4 sm:p-6 relative overflow-hidden">
        {/* Background grid */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(237,28,36,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(237,28,36,0.04)_1px,transparent_1px)] bg-[size:50px_50px]" />
        <div className="absolute top-1/4 right-1/4 size-96 bg-gradient-to-br from-[#ED1C24] to-[#6366f1] opacity-10 blur-3xl rounded-full" />
        <div className="absolute bottom-1/4 left-1/4 size-96 bg-gradient-to-br from-[#39B54A] to-[#f59e0b] opacity-10 blur-3xl rounded-full" />

        {/* Floating language switcher — top-right of the hero */}
        <div className="absolute top-6 right-6 z-20">
          <LanguageSwitcher variant="floating" />
        </div>

        <div
          ref={fitRef}
          className="relative z-10 w-full max-w-5xl origin-center will-change-transform"
          style={{ transform: `scale(${scale})` }}
        >
          {/* Logo + Academy title */}
          <div className="text-center mb-8 lg:mb-10">
            <div className="flex justify-center mb-6">
              <BrandLogo alt={t('academy.logoAlt')} className="h-24" />
            </div>
            <h1 className="text-5xl lg:text-6xl font-black text-foreground mb-4">
              {t('academy.title')}
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              {t('academy.subtitle')}
            </p>
          </div>

          {/* Course cards */}
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-6">
            {courses.map((course) => {
              // Pull translated content where available; fall back to static
              // English (used for Course 4).
              const title = course.i18nKey
                ? t(`courses.${course.i18nKey}.title`)
                : course.staticTitle ?? '';
              const description = course.i18nKey
                ? t(`courses.${course.i18nKey}.description`)
                : course.staticDescription ?? '';
              const topics = course.i18nKey
                ? (t(`courses.${course.i18nKey}.topics`, { returnObjects: true }) as string[])
                : course.staticTopics ?? [];
              const path = `/${lang}/${course.slug}`;

              return course.available ? (
                <Link
                  key={course.number}
                  to={path}
                  className="group relative bg-card border border-border rounded-2xl p-6 flex flex-col hover:shadow-xl transition-all hover:-translate-y-1"
                  style={{ '--accent': course.accentColor } as React.CSSProperties}
                >
                  {/* Number badge */}
                  <div className={`size-12 rounded-xl bg-gradient-to-br ${course.gradient} flex items-center justify-center mb-4 shadow-lg`}>
                    <span className="text-white font-black text-lg">{course.number}</span>
                  </div>

                  <h2 className="text-xl font-bold text-foreground mb-2 group-hover:text-[--accent] transition-colors">
                    {title}
                  </h2>
                  <p className="text-sm text-muted-foreground mb-5 flex-1">
                    {description}
                  </p>

                  {/* Topics */}
                  <div className="flex flex-wrap gap-1.5 mb-5">
                    {topics.map(topic => (
                      <span
                        key={topic}
                        className="text-[10px] font-semibold px-2 py-0.5 rounded-full border"
                        style={{ color: course.accentColor, borderColor: course.accentColor + '40', backgroundColor: course.accentColor + '10' }}
                      >
                        {topic}
                      </span>
                    ))}
                  </div>

                  <div className="flex items-center gap-2 font-bold text-sm" style={{ color: course.accentColor }}>
                    {t('common.startCourse')}
                    <ArrowRight className="size-4 group-hover:translate-x-1 transition-transform" />
                  </div>

                  {/* Active glow border on hover */}
                  <div
                    className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"
                    style={{ boxShadow: `inset 0 0 0 1.5px ${course.accentColor}60` }}
                  />
                </Link>
              ) : (
                <div
                  key={course.number}
                  className="group relative bg-card border border-border rounded-2xl p-6 flex flex-col select-none cursor-not-allowed"
                  style={{ '--accent': course.accentColor } as React.CSSProperties}
                  aria-disabled="true"
                >
                  {/* Number badge */}
                  <div className={`size-12 rounded-xl bg-gradient-to-br ${course.gradient} flex items-center justify-center mb-4 shadow-lg`}>
                    <span className="text-white font-black text-lg">{course.number}</span>
                  </div>

                  <h2 className="text-xl font-bold text-foreground mb-2">{title}</h2>
                  <p className="text-sm text-muted-foreground mb-5 flex-1">{description}</p>

                  {/* Topics */}
                  <div className="flex flex-wrap gap-1.5 mb-5">
                    {topics.map(topic => (
                      <span
                        key={topic}
                        className="text-[10px] font-semibold px-2 py-0.5 rounded-full border"
                        style={{ color: course.accentColor, borderColor: course.accentColor + '40', backgroundColor: course.accentColor + '10' }}
                      >
                        {topic}
                      </span>
                    ))}
                  </div>

                  <div className="flex items-center gap-2 font-bold text-sm" style={{ color: course.accentColor }}>
                    {t('common.startCourse')}
                    <ArrowRight className="size-4" />
                  </div>

                  {/* Transparent lock overlay — appears on hover */}
                  <div className="absolute inset-0 rounded-2xl bg-background/40 backdrop-blur-[2px] flex flex-col items-center justify-center gap-3 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    <div className="size-14 rounded-full bg-background/80 border border-border flex items-center justify-center shadow-lg">
                      <Lock className="size-6 text-foreground" />
                    </div>
                    <span className="px-3 py-1 rounded-full bg-background/80 border border-border text-xs font-semibold text-foreground">
                      {t('common.comingSoon')}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Mini-game launcher — "Is blockchain right for you?" */}
          <button
            type="button"
            onClick={() => setGameOpen(true)}
            className="group relative mt-6 w-full overflow-hidden rounded-2xl border border-border bg-card p-6 text-left transition-all hover:-translate-y-1 hover:shadow-xl"
          >
            {/* Gradient wash */}
            <div className="absolute inset-0 bg-gradient-to-r from-[#ED1C24]/10 via-[#6366f1]/10 to-[#39B54A]/10 opacity-80" />
            <div className="absolute -right-12 -top-12 size-48 rounded-full bg-gradient-to-br from-[#ED1C24] to-[#6366f1] opacity-10 blur-3xl" />

            <div className="relative z-10 flex flex-col items-center gap-4 sm:flex-row sm:gap-5">
              {/* Animated heart/spark icon */}
              <div className="relative shrink-0">
                <div className="size-14 rounded-2xl bg-gradient-to-br from-[#ED1C24] to-[#6366f1] flex items-center justify-center shadow-lg transition-transform group-hover:scale-105">
                  <Heart className="size-7 text-white transition-transform group-hover:scale-110" fill="currentColor" />
                </div>
                <span className="absolute -right-1.5 -top-1.5 flex size-6 items-center justify-center rounded-full bg-[#39B54A] shadow">
                  <Sparkles className="size-3.5 text-white" />
                </span>
              </div>

              <div className="flex-1 text-center sm:text-left">
                <span className="inline-block rounded-full bg-primary/10 px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider text-primary">
                  {tg('launch.badge')}
                </span>
                <h2 className="mt-1.5 text-xl font-bold text-foreground">
                  {tg('launch.title')}
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  {tg('launch.subtitle')}
                </p>
              </div>

              <div className="flex shrink-0 items-center gap-2 rounded-xl bg-foreground px-5 py-3 font-bold text-background shadow-lg transition-transform group-hover:scale-105">
                {tg('launch.cta')}
                <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
              </div>
            </div>
          </button>
        </div>
      </div>

      <BlockchainCheckGame open={gameOpen} onClose={() => setGameOpen(false)} />

      <SiteFooter />
    </div>
  );
}
