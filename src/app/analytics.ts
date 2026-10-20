import { useEffect } from 'react';
import { useLocation } from 'react-router';

/* ------------------------------------------------------------------ */
/*  Google Analytics 4 helpers (gtag.js)                               */
/*                                                                     */
/*  The gtag snippet in index.html is configured with                  */
/*  `send_page_view: false` because the app uses a hash router:        */
/*  client-side navigations never reload the page, so GA would only    */
/*  ever see the first load. Page views are therefore sent manually    */
/*  from `usePageTracking()` (mounted in AcademyRoot) on every route    */
/*  change — including the initial mount — so nothing is double-counted. */
/* ------------------------------------------------------------------ */

const GA_MEASUREMENT_ID = 'G-BQFGRPZCSZ';

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

function hasGtag(): boolean {
  return typeof window !== 'undefined' && typeof window.gtag === 'function';
}

/** Send a GA4 `page_view` for a client-side (hash) route. */
export function trackPageView(path: string, title?: string): void {
  if (!hasGtag()) return;
  window.gtag!('event', 'page_view', {
    page_path: path,
    page_title: title ?? document.title,
    page_location: window.location.href,
    send_to: GA_MEASUREMENT_ID,
  });
}

/** Send an arbitrary GA4 event (quiz answers, slide navigation, …). */
export function trackEvent(name: string, params?: Record<string, any>): void {
  if (!hasGtag()) return;
  window.gtag!('event', name, params ?? {});
}

/**
 * Fires `page_view` on initial mount and on every subsequent navigation.
 * Must be called inside the RouterProvider tree (e.g. the root layout).
 */
export function usePageTracking(): void {
  const location = useLocation();

  useEffect(() => {
    trackPageView(location.pathname + location.search, document.title);
  }, [location.pathname, location.search]);
}
