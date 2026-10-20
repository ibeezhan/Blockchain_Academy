import { useCallback, useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router';
import { ChevronUp, ChevronDown, ArrowRight } from 'lucide-react';
import { trackEvent } from '../../analytics';

interface SlideNavButtonsProps {
  nextChapterPath?: string;
}

export function SlideNavButtons({ nextChapterPath }: SlideNavButtonsProps) {
  const [isFirst, setIsFirst] = useState(true);
  const [isLast, setIsLast] = useState(false);
  const [hasScrollEl, setHasScrollEl] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const updatePosition = useCallback(() => {
    const el = document.getElementById('section-scroll');
    if (!el) return;
    const { scrollTop, scrollHeight, clientHeight } = el;
    setIsFirst(scrollTop < 10);
    setIsLast(scrollTop >= scrollHeight - clientHeight - 10);
  }, []);

  useEffect(() => {
    let el: HTMLElement | null = null;
    const frame = requestAnimationFrame(() => {
      el = document.getElementById('section-scroll');
      if (!el) {
        setHasScrollEl(false);
        return;
      }
      setHasScrollEl(true);
      updatePosition();
      el.addEventListener('scroll', updatePosition, { passive: true });
    });
    return () => {
      cancelAnimationFrame(frame);
      el?.removeEventListener('scroll', updatePosition);
    };
  }, [location.pathname, updatePosition]);

  if (!hasScrollEl) return null;

  const scrollPrev = () => {
    const el = document.getElementById('section-scroll');
    if (el) el.scrollBy({ top: -el.clientHeight, behavior: 'smooth' });
    trackEvent('slide_nav', { direction: 'prev', section: location.pathname });
  };

  const scrollNext = () => {
    const el = document.getElementById('section-scroll');
    if (el) el.scrollBy({ top: el.clientHeight, behavior: 'smooth' });
    trackEvent('slide_nav', { direction: 'next', section: location.pathname });
  };

  const goNextChapter = () => {
    trackEvent('slide_nav', { direction: 'next_chapter', section: location.pathname });
    navigate(nextChapterPath!);
  };

  const showPrev = !isFirst;
  const showNextSlide = !isLast;
  const showNextChapter = isLast && !!nextChapterPath;

  if (!showPrev && !showNextSlide && !showNextChapter) return null;

  return (
    <div className="fixed bottom-6 right-6 flex flex-col items-end gap-2 z-40">
      {showPrev && (
        <button
          onClick={scrollPrev}
          className="size-10 rounded-full bg-background/80 backdrop-blur-sm border border-border shadow-lg flex items-center justify-center text-foreground hover:bg-accent transition-all"
          title="Previous slide"
        >
          <ChevronUp className="size-5" />
        </button>
      )}
      {showNextChapter && (
        <button
          onClick={goNextChapter}
          className="flex items-center gap-1.5 px-4 py-2.5 rounded-full bg-primary text-primary-foreground shadow-lg hover:opacity-90 transition-all text-sm font-semibold whitespace-nowrap"
          title="Go to next chapter"
        >
          <span>Next chapter</span>
          <ArrowRight className="size-4" />
        </button>
      )}
      {showNextSlide && (
        <button
          onClick={scrollNext}
          className="size-10 rounded-full bg-background/80 backdrop-blur-sm border border-border shadow-lg flex items-center justify-center text-foreground hover:bg-accent transition-all"
          title="Next slide"
        >
          <ChevronDown className="size-5" />
        </button>
      )}
    </div>
  );
}
