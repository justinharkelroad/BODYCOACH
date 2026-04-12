'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import {
  LayoutDashboard,
  Dumbbell,
  Camera,
  Settings,
  LogOut,
  TrendingUp,
  Menu,
  X,
} from 'lucide-react';

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/workouts', label: 'Workouts', icon: Dumbbell },
  { href: '/photos', label: 'Photos', icon: Camera },
  { href: '/stats', label: 'Stats', icon: TrendingUp },
  { href: '/settings', label: 'Settings', icon: Settings },
];

// Bottom nav items for mobile (subset of main nav)
const mobileNavItems = [
  { href: '/dashboard', label: 'Home', icon: LayoutDashboard },
  { href: '/workouts', label: 'Workouts', icon: Dumbbell },
  { href: '/photos', label: 'Photos', icon: Camera },
  { href: '/stats', label: 'Stats', icon: TrendingUp },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  // Prevent scroll when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMobileMenuOpen]);

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push('/login');
    router.refresh();
  }

  return (
    <>
      {/* Desktop Sidebar - Hidden on mobile */}
      <aside className="fixed left-0 top-0 z-40 h-screen w-72 bg-[var(--theme-surface)] border-r border-[var(--theme-border)] hidden lg:block" aria-label="Main navigation">
        <div className="flex h-full flex-col">
          {/* Logo */}
          <div className="flex h-20 items-center px-6 border-b border-[var(--theme-border)]">
            <Link href="/dashboard" className="flex items-center gap-3">
              <img src="/logos/standard-nutrition.png" alt="Standard Nutrition" className="h-8 w-auto" />
            </Link>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-1 px-4 py-6" aria-label="Main">
            {navItems.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
              const Icon = item.icon;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={isActive ? 'page' : undefined}
                  className={`
                    flex items-center gap-4 rounded-[12px] px-4 py-3 text-sm font-medium
                    transition-all duration-200
                    ${isActive
                      ? 'bg-[color-mix(in_srgb,var(--theme-primary)_15%,transparent)] text-[var(--theme-primary-dark)]'
                      : 'text-[var(--theme-text-secondary)] hover:bg-[var(--theme-bg-alt)] hover:text-[var(--theme-text)]'
                    }
                  `}
                >
                  <Icon className="h-5 w-5" aria-hidden="true" />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* Logout */}
          <div className="border-t border-[var(--theme-border)] p-4">
            <button
              onClick={handleLogout}
              className="flex w-full items-center gap-4 rounded-[12px] px-4 py-3 text-sm font-medium text-[var(--theme-text-secondary)] hover:bg-[var(--theme-bg-alt)] hover:text-[var(--theme-text)] transition-all duration-200"
            >
              <LogOut className="h-5 w-5" aria-hidden="true" />
              Sign out
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-[var(--theme-surface)] border-b border-[var(--theme-border)] lg:hidden safe-area-top">
        <div className="flex items-center justify-between h-16 px-4">
          <Link href="/dashboard" className="flex items-center gap-2">
            <img src="/logos/standard-nutrition.png" alt="Standard Nutrition" className="h-6 w-auto" />
          </Link>
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 rounded-lg hover:bg-[var(--theme-bg-alt)] transition-colors"
            aria-label={isMobileMenuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={isMobileMenuOpen}
          >
            {isMobileMenuOpen ? (
              <X className="h-6 w-6 text-[var(--theme-text)]" />
            ) : (
              <Menu className="h-6 w-6 text-[var(--theme-text)]" />
            )}
          </button>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          aria-hidden="true"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Mobile Slide-out Menu */}
      <div
        className={`
          fixed top-0 right-0 z-50 h-full w-72 bg-[var(--theme-surface)] shadow-xl transform transition-transform duration-300 ease-in-out lg:hidden
          ${isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'}
        `}
      >
        <div className="flex h-full flex-col pt-[calc(4rem+env(safe-area-inset-top))]">
          {/* Navigation */}
          <nav className="flex-1 space-y-1 px-4 py-6 overflow-y-auto" aria-label="Mobile menu">
            {navItems.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
              const Icon = item.icon;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={isActive ? 'page' : undefined}
                  className={`
                    flex items-center gap-4 rounded-[12px] px-4 py-3 text-sm font-medium
                    transition-all duration-200
                    ${isActive
                      ? 'bg-[color-mix(in_srgb,var(--theme-primary)_15%,transparent)] text-[var(--theme-primary-dark)]'
                      : 'text-[var(--theme-text-secondary)] hover:bg-[var(--theme-bg-alt)] hover:text-[var(--theme-text)]'
                    }
                  `}
                >
                  <Icon className="h-5 w-5" aria-hidden="true" />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* Logout */}
          <div className="border-t border-[var(--theme-border)] p-4">
            <button
              onClick={handleLogout}
              className="flex w-full items-center gap-4 rounded-[12px] px-4 py-3 text-sm font-medium text-[var(--theme-text-secondary)] hover:bg-[var(--theme-bg-alt)] hover:text-[var(--theme-text)] transition-all duration-200"
            >
              <LogOut className="h-5 w-5" aria-hidden="true" />
              Sign out
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-[var(--theme-surface)] border-t border-[var(--theme-border)] lg:hidden safe-area-bottom" aria-label="Quick navigation">
        <div className="flex items-center justify-around h-16 px-2">
          {mobileNavItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={isActive ? 'page' : undefined}
                className={`
                  flex flex-col items-center justify-center gap-1 px-3 py-2 rounded-lg min-w-0 flex-1
                  transition-all duration-200
                  ${isActive
                    ? 'text-[var(--theme-primary-dark)]'
                    : 'text-[var(--theme-text-muted)]'
                  }
                `}
              >
                <Icon className={`h-5 w-5 ${isActive ? 'scale-110' : ''} transition-transform`} aria-hidden="true" />
                <span className="text-[10px] font-medium truncate">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}
