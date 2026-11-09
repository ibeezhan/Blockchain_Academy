import { MessageCircle } from 'lucide-react';

interface ClassDiscussionProps {
  /** e.g. "💬 Class discussion" — rendered as a small badge. */
  badge: string;
  /** e.g. "5 min" */
  duration: string;
  title: string;
  lead: string;
  questions: string[];
  /** Optional closing line, e.g. a pointer to the assignment this warms up. */
  note?: string;
  accent?: string;
}

/** Plain in-class discussion slide: a prompt, 3 guiding questions, no team scaffolding and no deliverable. */
export function ClassDiscussion({ badge, duration, title, lead, questions, note, accent = '#6366f1' }: ClassDiscussionProps) {
  return (
    <div className="h-full flex flex-col items-center justify-center p-6 lg:p-10">
      <div className="w-full max-w-4xl flex flex-col gap-5">
        <div className="flex items-center gap-3">
          <div className="size-12 rounded-2xl flex items-center justify-center shrink-0" style={{ backgroundColor: accent + '20' }}>
            <MessageCircle className="size-6" style={{ color: accent }} strokeWidth={2.2} />
          </div>
          <span className="px-2.5 py-0.5 rounded-full text-xs font-bold border" style={{ color: accent, borderColor: accent + '60', backgroundColor: accent + '14' }}>{badge}</span>
          <span className="ml-auto px-2.5 py-0.5 rounded-full bg-muted text-xs font-bold text-muted-foreground">⏱ {duration}</span>
        </div>

        <div className="p-5 lg:p-6 rounded-2xl border-2 bg-card" style={{ borderColor: accent + '60' }}>
          <h2 className="text-2xl lg:text-3xl font-black text-foreground leading-tight">{title}</h2>
          <p className="text-sm lg:text-base text-muted-foreground mt-2 leading-relaxed">{lead}</p>
        </div>

        <div className="grid gap-3">
          {questions.map((q, i) => (
            <div key={i} className="flex items-start gap-3 p-3.5 rounded-xl border border-border bg-card/60">
              <div className="size-7 rounded-full flex items-center justify-center shrink-0 text-xs font-black text-white" style={{ backgroundColor: accent }}>{i + 1}</div>
              <p className="text-sm lg:text-base text-foreground leading-snug">{q}</p>
            </div>
          ))}
        </div>

        {note && (
          <div className="p-3 rounded-xl border text-xs lg:text-sm text-muted-foreground text-center" style={{ borderColor: accent + '40', backgroundColor: accent + '0c' }}>
            {note}
          </div>
        )}
      </div>
    </div>
  );
}
