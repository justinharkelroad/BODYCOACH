import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { ProfileForm } from './profile-form';
import { isNewUI } from '@/lib/feature-flags';
import { V2PageWrapper } from '@/components/v2';

export const dynamic = 'force-dynamic';

export default async function ProfilePage() {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  if (isNewUI()) {
    return (
      <div className="mx-auto max-w-2xl">
        <V2PageWrapper
          title="Profile"
          subtitle="Update your personal information"
          backHref="/settings"
        >
          <ProfileForm
            email={user.email || ''}
            initialFullName={profile?.full_name || ''}
            initialPhone={profile?.phone || ''}
          />
        </V2PageWrapper>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <Link href="/settings" className="inline-flex items-center gap-1 text-[14px] text-[var(--theme-text-secondary)] hover:text-[var(--theme-text)] mb-4 transition-colors">
          <ArrowLeft className="h-4 w-4" />
          Settings
        </Link>
        <h1 className="text-[28px] font-semibold text-[var(--theme-text)] tracking-tight">Profile</h1>
        <p className="text-[14px] text-[var(--theme-text-secondary)] mt-1">Update your personal information</p>
      </div>

      <ProfileForm
        email={user.email || ''}
        initialFullName={profile?.full_name || ''}
        initialPhone={profile?.phone || ''}
      />
    </div>
  );
}
