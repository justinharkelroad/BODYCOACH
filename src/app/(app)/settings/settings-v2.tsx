import Link from 'next/link';
import { Bell, ChevronRight, Palette, User } from 'lucide-react';
import { PageHeader } from '@/components/v2';

interface SettingsV2Props {
  fullName: string | null;
  email: string;
}

const links = [
  {
    href: '/settings/profile',
    icon: User,
    title: 'Profile',
    description: 'Update your personal information',
    bg: 'bg-[#E5F2FF]',
    fg: 'text-[#3B9DFF]',
  },
  {
    href: '/settings/notifications',
    icon: Bell,
    title: 'Notifications & Reminders',
    description: 'Manage your check-in schedule and notification preferences',
    bg: 'bg-[#FFF4D6]',
    fg: 'text-[#E5A92B]',
  },
  {
    href: '/settings/appearance',
    icon: Palette,
    title: 'Appearance',
    description: 'Switch between light, dark, and system themes',
    bg: 'bg-[#FCE5F2]',
    fg: 'text-[#E94BA8]',
  },
];

export function SettingsV2({ fullName, email }: SettingsV2Props) {
  const initial = (fullName || email || '?')[0].toUpperCase();

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <PageHeader title="Settings" subtitle="Manage your account and preferences" />

      <div className="rounded-3xl bg-white/95 p-5 shadow-[0_8px_24px_rgba(120,120,180,0.10)] backdrop-blur sm:p-6">
        <div className="flex items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-[#FFB8A0] to-[#A8B7FF] text-[24px] font-semibold text-white shadow-md">
            {initial}
          </div>
          <div className="min-w-0">
            <h2 className="truncate text-[16px] font-semibold text-[#1d1d1f]">
              {fullName || 'User'}
            </h2>
            <p className="truncate text-[13px] text-[#6e6e73]">{email}</p>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        {links.map((link) => {
          const Icon = link.icon;
          return (
            <Link
              key={link.href}
              href={link.href}
              className="flex items-center gap-4 rounded-2xl bg-white/95 p-4 shadow-[0_8px_24px_rgba(120,120,180,0.10)] backdrop-blur transition hover:shadow-[0_12px_32px_rgba(120,120,180,0.16)]"
            >
              <div
                className={`flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl ${link.bg}`}
              >
                <Icon className={`h-5 w-5 ${link.fg}`} />
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="text-[14px] font-semibold text-[#1d1d1f]">
                  {link.title}
                </h3>
                <p className="text-[12px] text-[#6e6e73]">{link.description}</p>
              </div>
              <ChevronRight className="h-5 w-5 flex-shrink-0 text-[#9BA3A9]" />
            </Link>
          );
        })}
      </div>
    </div>
  );
}
