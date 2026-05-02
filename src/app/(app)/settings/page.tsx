import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Bell, User, ChevronRight, Palette } from 'lucide-react';
import { isNewUI } from '@/lib/feature-flags';
import { SettingsV2 } from './settings-v2';

export const dynamic = 'force-dynamic';

export default async function SettingsPage() {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    redirect('/login');
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  if (isNewUI()) {
    return (
      <SettingsV2
        fullName={profile?.full_name ?? null}
        email={user.email ?? ''}
      />
    );
  }

  const settingsLinks = [
    {
      href: '/settings/profile',
      icon: User,
      title: 'Profile',
      description: 'Update your personal information',
    },
    {
      href: '/settings/notifications',
      icon: Bell,
      title: 'Notifications & Reminders',
      description: 'Manage your check-in schedule and notification preferences',
    },
    {
      href: '/settings/appearance',
      icon: Palette,
      title: 'Appearance',
      description: 'Switch between light, dark, and system themes',
    },
  ];

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-[var(--theme-text)]">Settings</h1>
        <p className="text-[var(--theme-text-secondary)] mt-1">
          Manage your account and preferences
        </p>
      </div>

      {/* User Info */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 rounded-full bg-[var(--theme-accent-light)] flex items-center justify-center">
              <span className="text-2xl font-semibold text-[var(--theme-primary-dark)]">
                {(profile?.full_name || user.email || '?')[0].toUpperCase()}
              </span>
            </div>
            <div>
              <h2 className="text-lg font-semibold text-[var(--theme-text)]">
                {profile?.full_name || 'User'}
              </h2>
              <p className="text-[var(--theme-text-secondary)]">{user.email}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Settings Links */}
      <div className="space-y-3">
        {settingsLinks.map((link) => {
          const Icon = link.icon;
          return (
            <Link key={link.href} href={link.href}>
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-[var(--theme-accent-light)] rounded-xl">
                      <Icon className="h-5 w-5 text-[var(--theme-primary)]" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium text-[var(--theme-text)]">{link.title}</h3>
                      <p className="text-[14px] text-[var(--theme-text-secondary)]">{link.description}</p>
                    </div>
                    <ChevronRight className="h-5 w-5 text-[var(--theme-text-muted)]" />
                  </div>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
