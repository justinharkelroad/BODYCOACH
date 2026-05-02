import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft } from 'lucide-react';
import { NotificationSettings } from './notification-settings';
import { CommitmentManager } from './commitment-manager';
import type { Profile, Commitment } from '@/types/database';
import { isNewUI } from '@/lib/feature-flags';
import { PageHeader } from '@/components/v2';

export const dynamic = 'force-dynamic';

export default async function NotificationsSettingsPage() {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    redirect('/login');
  }

  const [profileResult, commitmentsResult] = await Promise.all([
    supabase.from('profiles').select('*').eq('id', user.id).single(),
    supabase.from('commitments').select('*').eq('user_id', user.id).eq('active', true),
  ]);

  const profile = profileResult.data as Profile | null;
  const commitments = (commitmentsResult.data || []) as Commitment[];

  if (isNewUI()) {
    return (
      <div className="mx-auto max-w-2xl space-y-6">
        <Link
          href="/settings"
          className="inline-flex items-center gap-1 text-[13px] font-medium text-[#3B9DFF] hover:underline"
        >
          <ArrowLeft className="h-4 w-4" />
          Settings
        </Link>
        <PageHeader
          title="Notifications & Reminders"
          subtitle="Set up your check-in schedule and how you want to be reminded"
        />
        <div className="rounded-3xl bg-white/95 p-5 shadow-[0_8px_24px_rgba(120,120,180,0.10)] backdrop-blur sm:p-6">
          <h2 className="mb-4 text-[15px] font-semibold text-[#1d1d1f]">
            Notification Channels
          </h2>
          <NotificationSettings
            initialPreferences={
              profile?.notification_preferences || { email: true, sms: false, push: true }
            }
            phone={profile?.phone || null}
          />
        </div>
        <div className="rounded-3xl bg-white/95 p-5 shadow-[0_8px_24px_rgba(120,120,180,0.10)] backdrop-blur sm:p-6">
          <h2 className="mb-4 text-[15px] font-semibold text-[#1d1d1f]">
            Your Commitments
          </h2>
          <CommitmentManager initialCommitments={commitments} />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      {/* Back Link */}
      <Link
        href="/settings"
        className="inline-flex items-center gap-2 text-[var(--neutral-gray)] hover:text-[var(--neutral-dark)] transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Settings
      </Link>

      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-[var(--neutral-dark)]">
          Notifications & Reminders
        </h1>
        <p className="text-[var(--neutral-gray)] mt-1">
          Set up your check-in schedule and how you want to be reminded
        </p>
      </div>

      {/* Notification Preferences */}
      <Card>
        <CardHeader>
          <CardTitle className="text-[var(--neutral-dark)]">Notification Channels</CardTitle>
        </CardHeader>
        <CardContent>
          <NotificationSettings
            initialPreferences={profile?.notification_preferences || { email: true, sms: false, push: true }}
            phone={profile?.phone || null}
          />
        </CardContent>
      </Card>

      {/* Commitments / Schedule */}
      <Card>
        <CardHeader>
          <CardTitle className="text-[var(--neutral-dark)]">Your Commitments</CardTitle>
        </CardHeader>
        <CardContent>
          <CommitmentManager initialCommitments={commitments} />
        </CardContent>
      </Card>
    </div>
  );
}
