import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';

/**
 * Scales a content block down so it always fits within the current viewport
 * height. Returns a ref to attach to the content and the computed scale factor
 * (a transform: scale() value, capped at 1 so content never grows above its
 * natural size — only shrinks on shorter screens).
 *
 * Because `transform: scale()` does not affect layout size, the element's
 * natural (unscaled) height is always measurable via `scrollHeight`, so the
 * computation is stable and does not feedback-loop with the ResizeObserver.
 *
 * @param verticalMargin px of breathing room to subtract from the viewport
 *        height before fitting (top + bottom combined).
 */
export function useFitToViewport(verticalMargin = 32) {
  const ref = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);

  const recompute = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    // Below lg (<1024px) the page flows and scrolls naturally; no scale-to-fit.
    if (window.innerWidth < 1024) { setScale(1); return; }
    const natural = el.scrollHeight;
    if (!natural) return;
    const available = window.innerHeight - verticalMargin;
    const next = Math.min(1, available / natural);
    // Round to avoid sub-pixel thrashing.
    setScale(Math.round(next * 1000) / 1000);
  }, [verticalMargin]);

  useLayoutEffect(() => {
    recompute();
  }, [recompute]);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const ro = new ResizeObserver(() => recompute());
    ro.observe(el);
    window.addEventListener('resize', recompute);

    // Re-measure once webfonts have settled (logo/title can reflow).
    const fonts = (document as Document & { fonts?: { ready?: Promise<unknown> } }).fonts;
    fonts?.ready?.then(() => recompute());
    const raf = requestAnimationFrame(recompute);

    return () => {
      ro.disconnect();
      window.removeEventListener('resize', recompute);
      cancelAnimationFrame(raf);
    };
  }, [recompute]);

  return { ref, scale };
}
