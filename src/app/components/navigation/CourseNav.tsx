import { Link, useLocation } from 'react-router';
import { useTranslation } from 'react-i18next';
import { Sun, Moon, ChevronLeft, Menu, X } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useLang } from '../../../i18n/useLang';
import { LanguageSwitcher } from './LanguageSwitcher';
import { BrandLogo } from '../shared/BrandLogo';

interface Section {
  id: string;
  number: string;
  label: string;
  path: string;
}

interface CourseNavProps {
  /** Base path WITHOUT the locale prefix (e.g. `/blockchain-fundamentals`).
   *  CourseNav handles the `/<lang>` prefix internally. */
  base?: string;
  sections?: Section[];
  accentColor?: string;
}

export function CourseNav({ base, sections = [], accentColor = '#ED1C24' }: CourseNavProps) {
  const location = useLocation();
  const lang = useLang();
  const { t } = useTranslation();

  // The four course Roots all pass `base` already prefixed with `/{lang}` —
  // if for some reason that's not the case, fall back to BF + prefix here.
  const effectiveBase = base ?? `/${lang}/blockchain-fundamentals`;

  const [isDark, setIsDark] = useState(() =>
    document.documentElement.classList.contains('dark')
  );

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDark);
  }, [isDark]);

  // Mobile (<lg) hamburger menu: closes on navigation and on Escape
  const [menuOpen, setMenuOpen] = useState(false);
  useEffect(() => { setMenuOpen(false); }, [location.pathname]);
  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setMenuOpen(false); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [menuOpen]);

  const isSectionActive = (section: Section) =>
    section.path === effectiveBase
      ? location.pathname === effectiveBase || location.pathname === `${effectiveBase}/`
      : location.pathname.startsWith(section.path);

  return (
    <nav className="w-full bg-sidebar border-b border-sidebar-border flex items-center px-3 py-2 gap-2 shrink-0">

      {/* ── LEFT cluster (pinned, never scrolls) ── */}
      <Link
        to={`/${lang}`}
        title={t('nav.coursesTitle')}
        className="flex-shrink-0 flex items-center gap-1 px-2 py-1.5 rounded-lg border border-transparent text-muted-foreground hover:text-foreground hover:border-border hover:bg-sidebar-accent transition-all"
      >
        <ChevronLeft className="size-3.5" />
        <span className="text-[10px] font-semibold hidden sm:block">{t('nav.courses')}</span>
      </Link>

      <div className="h-6 w-px bg-border flex-shrink-0" />

      <Link to={effectiveBase} className="flex-shrink-0 mr-1 group">
        <BrandLogo className="h-8 group-hover:scale-105 transition-transform" />
      </Link>

      {/* ── MIDDLE: section squares share all available width equally.
              flex-1 + min-w-0 on each link lets them distribute evenly,
              while the right cluster's flex-shrink-0 keeps the language
              switcher pinned upfront. ── */}
      <div className="flex-1 min-w-0 hidden lg:flex items-center gap-1">
        {sections.map((section) => {
          const isActive = isSectionActive(section);

          return (
            <Link
              key={section.id}
              to={section.path}
              title={section.label}
              style={isActive ? {
                backgroundColor: accentColor + '18',
                borderColor: accentColor + '90',
                boxShadow: `0 1px 3px ${accentColor}18`,
              } : undefined}
              className={`flex-1 min-w-0 flex flex-col items-center justify-center px-2 py-1.5 rounded-lg transition-all text-center group border ${isActive ? '' : 'border-transparent hover:bg-sidebar-accent/60'}`}
            >
              <span
                className="text-sm font-bold leading-none mb-0.5"
                style={{ color: isActive ? accentColor : undefined }}
              >
                {section.number}
              </span>
              <span className={`text-[10px] leading-tight truncate w-full text-center ${isActive ? 'text-foreground font-semibold' : 'text-muted-foreground'}`}>
                {section.label}
              </span>
            </Link>
          );
        })}
      </div>

      {/* ── RIGHT cluster (pinned, never scrolls) — language switcher upfront ── */}
      <div className="hidden lg:flex items-center gap-2 shrink-0">
        <div className="h-6 w-px bg-border flex-shrink-0 ml-1" />
        <LanguageSwitcher variant="nav" />
        <button
          onClick={() => setIsDark(d => !d)}
          className="flex-shrink-0 size-9 flex items-center justify-center rounded-lg border border-border text-foreground hover:bg-sidebar-accent transition-all"
          title={isDark ? t('nav.lightMode') : t('nav.darkMode')}
        >
          {isDark ? <Sun className="size-4" /> : <Moon className="size-4" />}
        </button>
      </div>

      {/* ── Mobile (<lg) only: hamburger + sheet with sections, language, theme ── */}
      <button
        type="button"
        onClick={() => setMenuOpen(o => !o)}
        aria-label={t('nav.menu')}
        aria-expanded={menuOpen}
        className="lg:hidden ml-auto flex-shrink-0 size-9 flex items-center justify-center rounded-lg border border-border text-foreground hover:bg-sidebar-accent transition-all"
      >
        {menuOpen ? <X className="size-5" /> : <Menu className="size-5" />}
      </button>
      {menuOpen && (
        <div className="lg:hidden fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/50" onClick={() => setMenuOpen(false)} aria-hidden />
          <div
            role="dialog"
            aria-label={t('nav.menu')}
            className="absolute inset-y-0 right-0 w-80 max-w-[88vw] bg-background border-l border-border shadow-2xl flex flex-col"
          >
            <div className="shrink-0 flex items-center justify-between px-4 py-3 border-b border-border">
              <span className="text-sm font-bold text-foreground">{t('nav.menu')}</span>
              <button
                type="button"
                onClick={() => setMenuOpen(false)}
                aria-label={t('nav.menu')}
                className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted/60"
              >
                <X className="size-5" />
              </button>
            </div>
            <div className="shrink-0 flex items-center justify-between gap-2 px-4 py-3 border-b border-border">
              <button
                type="button"
                onClick={() => setIsDark(d => !d)}
                className="h-9 px-3 flex items-center gap-2 rounded-lg border border-border text-foreground text-xs font-semibold hover:bg-sidebar-accent transition-all"
              >
                {isDark ? <Sun className="size-4" /> : <Moon className="size-4" />}
                {isDark ? t('nav.lightMode') : t('nav.darkMode')}
              </button>
              <LanguageSwitcher variant="nav" />
            </div>
            <nav className="flex-1 min-h-0 overflow-y-auto flex flex-col px-2 py-2 gap-1">
              {sections.map((section) => {
                const isActive = isSectionActive(section);
                return (
                  <Link
                    key={`m-${section.id}`}
                    to={section.path}
                    onClick={() => setMenuOpen(false)}
                    style={isActive ? { backgroundColor: accentColor + '18', borderColor: accentColor + '90' } : undefined}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg border transition-colors ${isActive ? '' : 'border-transparent hover:bg-sidebar-accent/60'}`}
                  >
                    <span className="text-base font-bold leading-none w-7 shrink-0" style={{ color: isActive ? accentColor : undefined }}>
                      {section.number}
                    </span>
                    <span className={`text-sm leading-tight ${isActive ? 'text-foreground font-semibold' : 'text-muted-foreground'}`}>
                      {section.label}
                    </span>
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>
      )}
    </nav>
  );
}
