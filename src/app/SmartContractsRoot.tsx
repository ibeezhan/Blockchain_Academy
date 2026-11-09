import { Outlet, useLocation } from 'react-router';
import { useTranslation } from 'react-i18next';
import { CourseNav } from './components/navigation/CourseNav';
import { ScrollProgressBar } from './components/navigation/ScrollProgressBar';
import { SlideNavButtons } from './components/navigation/SlideNavButtons';
import { useLang } from '../i18n/useLang';

export function SmartContractsRoot() {
  const location = useLocation();
  const lang = useLang();
  const { t } = useTranslation();

  const BASE = `/${lang}/smart-contracts`;
  const sections = [
    { id: 'home', number: '🏠', label: t('sections.home'),               path: BASE },
    { id: 'lo',   number: '🎯', label: t('sections.objectives'),         path: `${BASE}/learning-objectives` },
    { id: '1',    number: '01', label: t('sections.intro'),              path: `${BASE}/section-1` },
    { id: '2',    number: '02', label: t('sections.howItWorks'),         path: `${BASE}/section-2` },
    { id: '3',    number: '03', label: t('sections.industriesAndCases'), path: `${BASE}/section-3` },
    { id: '4',    number: '04', label: t('sections.criticalThinking'),   path: `${BASE}/section-4` },
    { id: '5',    number: '05', label: t('sections.limitations'),        path: `${BASE}/section-5` },
    { id: '6',    number: '06', label: t('sections.build'),              path: `${BASE}/section-6` },
    { id: '7',    number: '07', label: t('sections.inClassAssignment'),        path: `${BASE}/section-7` },
    { id: 'end',  number: '🏁', label: t('sections.conclusion'),         path: `${BASE}/conclusion` },
    { id: 'bib',  number: '📖', label: t('sections.bibliography'),       path: `${BASE}/bibliography` },
  ];

  const normalizedPath = location.pathname.replace(/\/$/, '');
  const currentIdx = sections.findIndex(s => s.path === normalizedPath);
  const nextChapterPath = currentIdx >= 0 && currentIdx < sections.length - 1
    ? sections[currentIdx + 1].path : undefined;

  return (
    <div className="h-full w-full flex flex-col">
      <CourseNav base={BASE} sections={sections} accentColor="#6366f1" />
      <ScrollProgressBar accentColor="#6366f1" />
      <main className="flex-1 overflow-hidden">
        <Outlet />
      </main>
      <SlideNavButtons nextChapterPath={nextChapterPath} />
    </div>
  );
}
