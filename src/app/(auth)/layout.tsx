export const dynamic = 'force-dynamic';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-6 bg-[#f5f5f7]">
      <div className="max-w-[400px] w-full">
        {children}
      </div>
    </div>
  );
}
