import type { ReactNode } from 'react';

interface ComparisonItem {
  feature: string;
  option1: string;
  option2: string;
  option3?: string;
}

interface ComparisonSlideProps {
  title: string;
  featureLabel?: string;
  option1Label: string;
  option2Label: string;
  option3Label?: string;
  items: ComparisonItem[];
  /** Optional strip rendered under the table (e.g. a key-point footer). */
  footer?: ReactNode;
}

export function ComparisonSlide({ title, featureLabel = 'Feature', option1Label, option2Label, option3Label, items, footer }: ComparisonSlideProps) {
  const hasThreeOptions = !!option3Label;
  const cols = hasThreeOptions ? 'grid-cols-4' : 'grid-cols-3';

  return (
    <div className="w-full h-full flex flex-col p-5 lg:p-8">
      <h2 className="text-2xl lg:text-3xl font-bold text-foreground mb-3 shrink-0">{title}</h2>

      <div className="flex-1 min-h-0 flex flex-col w-full max-w-6xl mx-auto">
        {/* Table Header */}
        <div className={`grid ${cols} gap-2 mb-2 shrink-0`}>
          <div className="p-2 lg:p-3 bg-muted rounded-lg flex items-center">
            <h3 className="font-bold text-sm lg:text-base text-foreground">{featureLabel}</h3>
          </div>
          <div className="p-2 lg:p-3 bg-gradient-to-br from-[#ED1C24] to-[#39B54A] rounded-lg flex items-center">
            <h3 className="font-bold text-sm lg:text-base text-white">{option1Label}</h3>
          </div>
          <div className="p-2 lg:p-3 bg-gradient-to-br from-[#39B54A] to-[#ED1C24] rounded-lg flex items-center">
            <h3 className="font-bold text-sm lg:text-base text-white">{option2Label}</h3>
          </div>
          {hasThreeOptions && (
            <div className="p-2 lg:p-3 bg-gradient-to-br from-[#f59e0b] to-[#39B54A] rounded-lg flex items-center">
              <h3 className="font-bold text-sm lg:text-base text-white">{option3Label}</h3>
            </div>
          )}
        </div>

        {/* Table Rows — flex-1 so they fill all remaining height equally */}
        <div className="flex-1 min-h-0 flex flex-col gap-1.5">
          {items.map((item, index) => (
            <div
              key={index}
              className={`grid ${cols} gap-2 flex-1 bg-card border border-border rounded-lg overflow-hidden hover:border-[#ED1C24]/50 transition-colors`}
            >
              <div className="p-2 lg:p-3 font-bold text-xs lg:text-sm text-foreground border-r border-border flex items-center">
                {item.feature}
              </div>
              <div className="p-2 lg:p-3 text-xs lg:text-sm text-muted-foreground border-r border-border flex items-center">
                {item.option1}
              </div>
              <div className={`p-2 lg:p-3 text-xs lg:text-sm text-muted-foreground flex items-center${hasThreeOptions ? ' border-r border-border' : ''}`}>
                {item.option2}
              </div>
              {hasThreeOptions && (
                <div className="p-2 lg:p-3 text-xs lg:text-sm text-muted-foreground flex items-center">
                  {item.option3}
                </div>
              )}
            </div>
          ))}
        </div>
        {footer && <div className="shrink-0 mt-3">{footer}</div>}
      </div>
    </div>
  );
}