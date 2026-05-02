export const dynamic = 'force-dynamic';

import { AdminSidebar } from '@/components/layout/admin-sidebar';
import { V2AdminShell } from '@/components/v2';
import { isNewUI } from '@/lib/feature-flags';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  if (isNewUI()) {
    return <V2AdminShell>{children}</V2AdminShell>;
  }

  return (
    <div className="min-h-screen bg-[var(--neutral-off-white)]">
      <AdminSidebar />
      <main className="lg:pl-72 pt-[calc(4rem+env(safe-area-inset-top))] pb-20 lg:pt-0 lg:pb-0">
        <div className="p-4 sm:p-6 lg:p-10">
          {children}
        </div>
      </main>
    </div>
  );
}
