import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Settings, User, Users, Mail, Palette } from 'lucide-react';
import { SendCheckinEmail } from './send-checkin-email';
import { AppearanceForm } from '@/app/(app)/settings/appearance/appearance-form';
import type { Profile } from '@/types/database';
import { isNewUI } from '@/lib/feature-flags';
import { AdminSettingsV2 } from './admin-settings-v2';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Settings | Coach Dashboard',
};

export default async function AdminSettingsPage() {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, email')
    .eq('id', user.id)
    .single() as { data: Pick<Profile, 'full_name' | 'email'> | null };

  const { count: clientCount } = await supabase
    .from('coach_clients')
    .select('id', { count: 'exact', head: true })
    .eq('coach_id', user.id)
    .eq('status', 'active');

  if (isNewUI()) {
    return (
      <AdminSettingsV2
        profileName={profile?.full_name ?? null}
        profileEmail={profile?.email ?? ''}
        clientCount={clientCount || 0}
      />
    );
  }

  return (
    <div className="space-y-8 max-w-2xl">
      <div>
        <div className="flex items-center gap-2 mb-2">
          <Settings className="h-6 w-6 text-[var(--theme-primary)]" />
          <h1 className="text-2xl font-semibold text-[var(--theme-text)]">Settings</h1>
        </div>
        <p className="text-[var(--theme-text-secondary)]">Manage your coach account</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" aria-hidden="true" />
            Account
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="text-sm text-[var(--theme-text-muted)]">Name</p>
            <p className="text-[var(--theme-text)] font-medium">{profile?.full_name || 'Not set'}</p>
          </div>
          <div>
            <p className="text-sm text-[var(--theme-text-muted)]">Email</p>
            <p className="text-[var(--theme-text)] font-medium">{profile?.email}</p>
          </div>
          <div>
            <p className="text-sm text-[var(--theme-text-muted)]">Role</p>
            <span className="inline-block text-xs font-semibold uppercase tracking-wider px-3 py-1 rounded-full bg-[color-mix(in_srgb,var(--theme-primary)_15%,transparent)] text-[var(--theme-primary-dark)]">
              Coach
            </span>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" aria-hidden="true" />
            Clients
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div>
            <p className="text-sm text-[var(--theme-text-muted)]">Active Clients</p>
            <p className="text-2xl font-semibold text-[var(--theme-text)]">{clientCount || 0}</p>
          </div>
          <p className="text-sm text-[var(--theme-text-secondary)] mt-4">
            New users are automatically assigned to you when they sign up.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" aria-hidden="true" />
            Weekly Check-in Email
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-[var(--theme-text-secondary)]">
            Send a weekly check-in email to all active clients. The email contains a link to your check-in form.
          </p>
          <SendCheckinEmail clientCount={clientCount || 0} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Palette className="h-5 w-5" aria-hidden="true" />
            Appearance
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-[var(--theme-text-secondary)]">
            Choose how the coach dashboard looks on this device.
          </p>
          <AppearanceForm />
        </CardContent>
      </Card>
    </div>
  );
}
