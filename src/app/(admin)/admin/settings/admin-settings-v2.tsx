import { Mail, Palette, User, Users } from 'lucide-react';
import { PageHeader } from '@/components/v2';
import { SendCheckinEmail } from './send-checkin-email';
import { AppearanceForm } from '@/app/(app)/settings/appearance/appearance-form';

interface AdminSettingsV2Props {
  profileName: string | null;
  profileEmail: string;
  clientCount: number;
}

export function AdminSettingsV2({
  profileName,
  profileEmail,
  clientCount,
}: AdminSettingsV2Props) {
  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <PageHeader title="Settings" subtitle="Manage your coach account" />

      <Section title="Account" icon={<User className="h-5 w-5" />} tone="blue">
        <div className="space-y-3">
          <Field label="Name" value={profileName || 'Not set'} />
          <Field label="Email" value={profileEmail} />
          <div>
            <p className="text-[12px] uppercase tracking-wide text-[#6e6e73]">Role</p>
            <span className="mt-1 inline-block rounded-full bg-gradient-to-r from-[#FF6FA8] via-[#FF9966] to-[#FFD36F] px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-white">
              Coach
            </span>
          </div>
        </div>
      </Section>

      <Section title="Clients" icon={<Users className="h-5 w-5" />} tone="pink">
        <p className="text-[12px] uppercase tracking-wide text-[#6e6e73]">
          Active Clients
        </p>
        <p className="mt-1 text-[28px] font-light text-[#1d1d1f]">{clientCount}</p>
        <p className="mt-3 text-[13px] text-[#6e6e73]">
          New users are automatically assigned to you when they sign up.
        </p>
      </Section>

      <Section
        title="Weekly Check-in Email"
        icon={<Mail className="h-5 w-5" />}
        tone="gold"
      >
        <p className="mb-3 text-[13px] text-[#6e6e73]">
          Send a weekly check-in email to all active clients. The email contains a
          link to your check-in form.
        </p>
        <SendCheckinEmail clientCount={clientCount} />
      </Section>

      <Section
        title="Appearance"
        icon={<Palette className="h-5 w-5" />}
        tone="green"
      >
        <p className="mb-3 text-[13px] text-[#6e6e73]">
          Choose how the coach dashboard looks on this device.
        </p>
        <AppearanceForm />
      </Section>
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[12px] uppercase tracking-wide text-[#6e6e73]">{label}</p>
      <p className="text-[14px] font-medium text-[#1d1d1f]">{value}</p>
    </div>
  );
}

function Section({
  title,
  icon,
  tone,
  children,
}: {
  title: string;
  icon: React.ReactNode;
  tone: 'blue' | 'pink' | 'coral' | 'gold' | 'green';
  children: React.ReactNode;
}) {
  const map: Record<string, { bg: string; fg: string }> = {
    blue: { bg: 'bg-[#E5F2FF]', fg: 'text-[#3B9DFF]' },
    pink: { bg: 'bg-[#FCE5F2]', fg: 'text-[#E94BA8]' },
    coral: { bg: 'bg-[#FFE6E0]', fg: 'text-[#FF6F4D]' },
    gold: { bg: 'bg-[#FFF4D6]', fg: 'text-[#E5A92B]' },
    green: { bg: 'bg-[#DDF6E2]', fg: 'text-[#2EBA62]' },
  };
  const { bg, fg } = map[tone];
  return (
    <div className="rounded-3xl bg-white/95 p-5 shadow-[0_8px_24px_rgba(120,120,180,0.10)] backdrop-blur sm:p-6">
      <div className="mb-4 flex items-center gap-3">
        <div className={`flex h-10 w-10 items-center justify-center rounded-2xl ${bg}`}>
          <span className={fg}>{icon}</span>
        </div>
        <h2 className="text-[15px] font-semibold text-[#1d1d1f]">{title}</h2>
      </div>
      {children}
    </div>
  );
}
