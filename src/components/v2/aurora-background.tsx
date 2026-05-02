import type { ReactNode } from 'react';

export function AuroraBackground({ children }: { children: ReactNode }) {
  return (
    <div className="relative min-h-screen overflow-hidden bg-[#F4F6FB]">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-[70vh] blur-3xl"
        style={{
          background:
            'radial-gradient(60% 80% at 20% 20%, #FFD9C2 0%, transparent 60%),' +
            'radial-gradient(50% 70% at 80% 10%, #D9C8FF 0%, transparent 60%),' +
            'radial-gradient(70% 60% at 50% 70%, #FFE7B3 0%, transparent 60%),' +
            'radial-gradient(60% 60% at 90% 60%, #BEE3FF 0%, transparent 60%)',
        }}
      />
      <div className="relative z-10">{children}</div>
    </div>
  );
}
