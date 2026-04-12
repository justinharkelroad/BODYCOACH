import { AdminSidebar } from '@/components/layout/admin-sidebar';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[var(--neutral-off-white)]">
      <AdminSidebar />
      <main className="lg:pl-72 pt-16 pb-20 lg:pt-0 lg:pb-0">
        <div className="p-4 sm:p-6 lg:p-10">
          {children}
        </div>
      </main>
    </div>
  );
}
