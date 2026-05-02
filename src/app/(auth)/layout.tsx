export const dynamic = 'force-dynamic';

import { AuroraBackground } from '@/components/v2';
import { isNewUI } from '@/lib/feature-flags';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  if (isNewUI()) {
    return (
      <AuroraBackground>
        <div className="flex min-h-screen items-center justify-center px-6 py-12">
          <div className="w-full max-w-[420px]">{children}</div>
        </div>
      </AuroraBackground>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-6 bg-[var(--theme-bg)]">
      <div className="max-w-[400px] w-full">
        {children}
      </div>
    </div>
  );
}
