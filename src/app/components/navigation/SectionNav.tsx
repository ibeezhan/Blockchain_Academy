import { useState, useEffect } from 'react';
import { PanelLeftClose, PanelLeftOpen, List, X } from 'lucide-react';

const STORAGE_KEY = 'section-nav-collapsed';

export interface SubChapter {
  id: string;
  label: string;
  /** "group" renders as a small section heading, not a clickable button. Other items default to clickable. */
  kind?: 'group';
}

interface SectionNavProps {
  chapters: SubChapter[];
  /** Optional course-accent for the active chapter highlight. Defaults to BF red. */
  accentColor?: string;
}

/**
 * Sidebar navigation for a section's chapter list. Below the `lg:` breakpoint
 * (1024px) the sidebar is hidden entirely — slides take the full width on
 * tablets and phones. On `lg:` and above, the user can collapse it to a thin
 * strip via the toggle button at the top. Choice persists in localStorage.
 */
export function SectionNav({ chapters, accentColor = '#ED1C24' }: SectionNavProps) {
  const buttons = chapters.filter(c => c.kind !== 'group');
  const [activeId, setActiveId] = useState<string>(buttons[0]?.id ?? '');
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    return localStorage.getItem(STORAGE_KEY) === '1';
  });

  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, collapsed ? '1' : '0'); } catch { /* ignore */ }
  }, [collapsed]);

  // Mobile drawer: close on Escape
  useEffect(() => {
    if (!mobileOpen) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setMobileOpen(false); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [mobileOpen]);

  useEffect(() => {
    const container = document.getElementById('section-scroll');
    if (!container) return;

    const handleScroll = () => {
      const threshold = container.clientHeight / 3;
      let current = buttons[0]?.id ?? '';
      for (const ch of buttons) {
        const el = document.getElementById(ch.id);
        if (el) {
          const top = el.getBoundingClientRect().top - container.getBoundingClientRect().top;
          if (top <= threshold) current = ch.id;
        }
      }
      setActiveId(current);
    };

    container.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => container.removeEventListener('scroll', handleScroll);
  }, [chapters]);

  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (!el) return;
    el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <>
    <aside
      className={`shrink-0 h-full hidden lg:flex flex-col border-r border-border transition-[width] duration-200 ease-out ${
        collapsed ? 'w-9' : 'w-44'
      }`}
    >
      {/* Toggle */}
      <div className={`shrink-0 flex ${collapsed ? 'justify-center' : 'justify-end'} px-1 pt-2 pb-1`}>
        <button
          type="button"
          onClick={() => setCollapsed(c => !c)}
          aria-label={collapsed ? 'Expand chapter sidebar' : 'Collapse chapter sidebar'}
          title={collapsed ? 'Expand chapter sidebar' : 'Collapse chapter sidebar'}
          className="p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors"
        >
          {collapsed
            ? <PanelLeftOpen className="size-4" />
            : <PanelLeftClose className="size-4" />}
        </button>
      </div>

      {/* Chapter list */}
      {!collapsed && (
        <nav className="flex-1 min-h-0 flex flex-col pl-2 pr-1 pb-2 overflow-y-auto gap-0.5">
          {chapters.map((ch, i) => {
            if (ch.kind === 'group') {
              return (
                <div
                  key={`group-${i}-${ch.label}`}
                  className="px-3 pt-3 pb-1 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/70"
                >
                  {ch.label}
                </div>
              );
            }
            const active = activeId === ch.id;
            return (
              <button
                key={ch.id}
                onClick={() => scrollTo(ch.id)}
                className="min-w-0 text-left text-xs leading-snug px-3 py-1 rounded-md transition-all cursor-pointer flex items-center"
                style={
                  active
                    ? { backgroundColor: accentColor + '26', color: accentColor, fontWeight: 700 }
                    : undefined
                }
              >
                <span
                  className={`truncate block w-full ${active ? '' : 'text-muted-foreground hover:text-foreground'}`}
                >
                  {ch.label}
                </span>
              </button>
            );
          })}
        </nav>
      )}

      {/* Collapsed state — current-chapter indicator dot */}
      {collapsed && buttons.length > 0 && (
        <div
          className="shrink-0 mx-auto mt-1 size-2 rounded-full"
          style={{ backgroundColor: accentColor }}
          aria-hidden
        />
      )}
    </aside>

    {/* Mobile-only (<lg) chapter menu: floating button + slide-over drawer. Renders nothing on lg+. */}
    <div className="lg:hidden">
      <button
        type="button"
        onClick={() => setMobileOpen(true)}
        aria-label="Open chapter menu"
        className="fixed bottom-5 right-5 z-40 flex items-center gap-2 px-4 py-2.5 rounded-full text-white text-sm font-semibold shadow-lg active:scale-95 transition-transform"
        style={{ backgroundColor: accentColor }}
      >
        <List className="size-4" />
        Chapters
      </button>

      {mobileOpen && (
        <div className="fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/50" onClick={() => setMobileOpen(false)} aria-hidden />
          <div
            role="dialog"
            aria-label="Chapters"
            className="absolute inset-y-0 right-0 w-72 max-w-[85vw] bg-background border-l border-border shadow-2xl flex flex-col"
          >
            <div className="shrink-0 flex items-center justify-between px-4 py-3 border-b border-border">
              <span className="text-sm font-bold text-foreground">Chapters</span>
              <button
                type="button"
                onClick={() => setMobileOpen(false)}
                aria-label="Close chapter menu"
                className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted/60"
              >
                <X className="size-5" />
              </button>
            </div>
            <nav className="flex-1 min-h-0 overflow-y-auto flex flex-col px-2 py-2 gap-0.5">
              {chapters.map((ch, i) => {
                if (ch.kind === 'group') {
                  return (
                    <div
                      key={`m-group-${i}-${ch.label}`}
                      className="px-3 pt-4 pb-1 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/70"
                    >
                      {ch.label}
                    </div>
                  );
                }
                const active = activeId === ch.id;
                return (
                  <button
                    key={`m-${ch.id}`}
                    onClick={() => { scrollTo(ch.id); setMobileOpen(false); }}
                    className={`text-left text-sm leading-snug px-3 py-2.5 rounded-md transition-colors ${
                      active ? '' : 'text-muted-foreground hover:text-foreground'
                    }`}
                    style={
                      active
                        ? { backgroundColor: accentColor + '26', color: accentColor, fontWeight: 700 }
                        : undefined
                    }
                  >
                    {ch.label}
                  </button>
                );
              })}
            </nav>
          </div>
        </div>
      )}
    </div>
    </>
  );
}