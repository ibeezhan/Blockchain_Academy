import { Outlet } from 'react-router';
import { useSlideKeyNav } from './hooks/useSlideKeyNav';
import { usePageTracking } from './analytics';
import { SlideNavTip } from './components/navigation/SlideNavTip';
import { SmallScreenGate } from './components/navigation/SmallScreenGate';

export function AcademyRoot() {
  useSlideKeyNav();
  // GA4: send a page_view on initial mount + every hash-route change.
  usePageTracking();

  return (
    <div className="h-full w-full">
      <Outlet />
      <SlideNavTip />
      <SmallScreenGate />
    </div>
  );
}
