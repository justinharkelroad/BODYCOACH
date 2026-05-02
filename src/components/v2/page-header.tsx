import type { ReactNode } from 'react';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  action?: ReactNode;
}

export function PageHeader({ title, subtitle, action }: PageHeaderProps) {
  return (
    <div className="flex items-start justify-between gap-3">
      <div className="min-w-0 flex-1">
        <h1 className="text-[28px] font-bold tracking-tight text-[#1d1d1f] sm:text-[32px]">
          {title}
        </h1>
        {subtitle && (
          <p className="mt-1 text-[14px] text-[#6e6e73]">{subtitle}</p>
        )}
      </div>
      {action && <div className="flex-shrink-0">{action}</div>}
    </div>
  );
}
