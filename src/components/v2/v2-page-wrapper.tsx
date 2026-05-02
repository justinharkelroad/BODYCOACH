import type { ReactNode } from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { PageHeader } from './page-header';

interface V2PageWrapperProps {
  title: string;
  subtitle?: string;
  backHref?: string;
  action?: ReactNode;
  children: ReactNode;
  /**
   * If true, wraps children in a frosted white card. Default true.
   * Set false when the inner content already has its own card-style surfaces
   * (so we don't double-card it).
   */
  card?: boolean;
}

/**
 * Standard wrapper for v2 page content that doesn't have a fully redesigned
 * inner UI yet. Provides the v2 page header treatment and an optional white
 * frosted card so existing forms / dashboards look reasonable inside the
 * aurora shell while we incrementally redesign their internals.
 */
export function V2PageWrapper({
  title,
  subtitle,
  backHref,
  action,
  children,
  card = true,
}: V2PageWrapperProps) {
  return (
    <div className="space-y-6">
      {backHref && (
        <Link
          href={backHref}
          className="inline-flex items-center gap-1 text-[13px] font-medium text-[#3B9DFF] hover:underline"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Link>
      )}
      <PageHeader title={title} subtitle={subtitle} action={action} />
      {card ? (
        <div className="rounded-3xl bg-white/95 p-5 shadow-[0_8px_24px_rgba(120,120,180,0.10)] backdrop-blur sm:p-6">
          {children}
        </div>
      ) : (
        <div>{children}</div>
      )}
    </div>
  );
}
