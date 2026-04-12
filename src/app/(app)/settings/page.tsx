import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Bell, User, Shield, ChevronRight } from 'lucide-react';

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

  const settingsLinks = [
    {
      href: '/settings/notifications',
      icon: Bell,
      title: 'Notifications & Reminders',
      description: 'Manage your check-in schedule and notification preferences',
    },
    {
      href: '/settings/profile',
      icon: User,
      title: 'Profile',
      description: 'Update your personal information and goals',
      disabled: true,
    },
    {
      href: '/settings/account',
      icon: Shield,
      title: 'Account & Privacy',
      description: 'Manage your account settings and data',
      disabled: true,
    },
  ];

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-[var(--neutral-dark)]">Settings</h1>
        <p className="text-[var(--neutral-gray)] mt-1">
          Manage your account and preferences
        </p>
      </div>

      {/* User Info */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 rounded-full bg-[var(--primary-light)] flex items-center justify-center">
              <span className="text-2xl font-semibold text-[var(--primary-deep)]">
                {(profile?.full_name || user.email || '?')[0].toUpperCase()}
              </span>
            </div>
            <div>
              <h2 className="text-lg font-semibold text-[var(--neutral-dark)]">
                {profile?.full_name || 'User'}
              </h2>
              <p className="text-[var(--neutral-gray)]">{user.email}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Settings Links */}
      <div className="space-y-3">
        {settingsLinks.map((link) => {
          const Icon = link.icon;
          const content = (
            <Card className={link.disabled ? 'opacity-50' : 'hover:shadow-md transition-shadow cursor-pointer'}>
              <CardContent className="p-4">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-[var(--primary-light)] rounded-xl">
                    <Icon className="h-5 w-5 text-[var(--primary-deep)]" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium text-[var(--neutral-dark)]">{link.title}</h3>
                    <p className="text-sm text-[var(--neutral-gray)]">{link.description}</p>
                  </div>
                  <ChevronRight className="h-5 w-5 text-[var(--neutral-gray)]" />
                </div>
              </CardContent>
            </Card>
          );

          if (link.disabled) {
            return <div key={link.href}>{content}</div>;
          }

          return (
            <Link key={link.href} href={link.href}>
              {content}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
