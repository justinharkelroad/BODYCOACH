import Link from 'next/link';
import { redirect } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { AppearanceForm } from './appearance-form';
import { isNewUI } from '@/lib/feature-flags';

export const dynamic = 'force-dynamic';

export default function AppearancePage() {
  if (isNewUI()) {
    // v2 design is light-only; the appearance toggle no longer applies.
    // Redirect anyone hitting this route directly back to /settings.
    redirect('/settings');
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <Link
          href="/settings"
          className="inline-flex items-center gap-1 text-[14px] text-[var(--theme-text-secondary)] hover:text-[var(--theme-text)] mb-4 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Settings
        </Link>
        <h1 className="text-[28px] font-semibold text-[var(--theme-text)] tracking-tight">Appearance</h1>
        <p className="text-[14px] text-[var(--theme-text-secondary)] mt-1">
          Choose how Standard Nutrition looks on this device.
        </p>
      </div>

      <AppearanceForm />
    </div>
  );
}
