'use client';

import { useEffect, useRef, ReactNode } from 'react';

export function ScrollContainer({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = ref.current;
    if (!container) return;

    // Create intersection observer
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
          }
        });
      },
      {
        threshold: 0.05,
        rootMargin: '50px 0px',
      }
    );

    // Observe all elements with animate-on-scroll class
    const elements = container.querySelectorAll('.animate-on-scroll');
    elements.forEach((el) => observer.observe(el));

    // Also immediately trigger visibility for elements already in viewport
    elements.forEach((el) => {
      const rect = el.getBoundingClientRect();
      if (rect.top < window.innerHeight && rect.bottom > 0) {
        el.classList.add('is-visible');
      }
    });

    return () => observer.disconnect();
  }, []);

  return <div ref={ref}>{children}</div>;
}
