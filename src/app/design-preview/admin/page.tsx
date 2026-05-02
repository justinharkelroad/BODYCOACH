import { AlertTriangle, CheckCircle2, Search, Users } from 'lucide-react';
import {
  AdminBottomNav,
  AuroraBackground,
  ClientListCard,
  DateHero,
  FilterChips,
  HeaderBar,
  KPICard,
} from '@/components/v2';
import type { ClientListCardProps } from '@/components/v2';

export const dynamic = 'force-static';

const clients: ClientListCardProps[] = [
  {
    href: '/design-preview/admin/client',
    initials: 'SM',
    name: 'Sarah Martinez',
    goal: 'lose_fat',
    currentWeight: 168.4,
    weeklyChange: -1.2,
    lastActiveLabel: 'today',
    checkinsThisWeek: 6,
    status: 'on_track',
  },
  {
    href: '#',
    initials: 'JT',
    name: 'James Thompson',
    goal: 'gain_muscle',
    currentWeight: 192.0,
    weeklyChange: 0.6,
    lastActiveLabel: 'today',
    checkinsThisWeek: 5,
    status: 'on_track',
  },
  {
    href: '#',
    initials: 'EC',
    name: 'Emma Chen',
    goal: 'lose_fat',
    currentWeight: 142.8,
    weeklyChange: 0.8,
    lastActiveLabel: '4 days ago',
    checkinsThisWeek: 2,
    status: 'needs_attention',
  },
  {
    href: '#',
    initials: 'DR',
    name: 'David Rodriguez',
    goal: 'maintain',
    currentWeight: 178.5,
    weeklyChange: -0.2,
    lastActiveLabel: 'yesterday',
    checkinsThisWeek: 4,
    status: 'on_track',
  },
  {
    href: '#',
    initials: 'PK',
    name: 'Priya Kapoor',
    goal: 'gain_muscle',
    currentWeight: 134.2,
    weeklyChange: null,
    lastActiveLabel: '12 days ago',
    checkinsThisWeek: 0,
    status: 'inactive',
  },
  {
    href: '#',
    initials: 'AL',
    name: 'Alex Liu',
    goal: 'lose_fat',
    currentWeight: 205.6,
    weeklyChange: -2.1,
    lastActiveLabel: 'today',
    checkinsThisWeek: 7,
    status: 'on_track',
  },
];

const needsAttention = clients.filter((c) => c.status === 'needs_attention').length;
const onTrack = clients.filter((c) => c.status === 'on_track').length;
const inactive = clients.filter((c) => c.status === 'inactive').length;
const totalCheckins = clients.reduce((sum, c) => sum + c.checkinsThisWeek, 0);

export default function AdminDesignPreviewPage() {
  return (
    <AuroraBackground>
      <div className="mx-auto max-w-md pb-32">
        <HeaderBar
          initials="KA"
          notificationCount={2}
          deviceName="Coach Mode"
          deviceStatus={`${clients.length} clients`}
        />
        <DateHero date={new Date('2026-05-02')} />

        <div className="mt-2 px-5">
          <p className="text-[14px] text-[#6e6e73]">
            Welcome back, <span className="font-semibold text-[#1d1d1f]">Karina</span>
          </p>
        </div>

        {/* Coach KPI grid */}
        <div className="mt-5 grid grid-cols-2 gap-3 px-5">
          <KPICard
            label="Active Clients"
            icon={<Users className="h-4 w-4" />}
            tone="blue"
            value={String(clients.length - inactive)}
            unit="active"
          />
          <KPICard
            label="Need Attention"
            icon={<AlertTriangle className="h-4 w-4" />}
            tone="coral"
            value={String(needsAttention)}
            unit="clients"
          />
          <KPICard
            label="On Track"
            icon={<CheckCircle2 className="h-4 w-4" />}
            tone="green"
            value={String(onTrack)}
            unit="clients"
          />
          <KPICard
            label="Check-ins This Wk"
            icon={<CheckCircle2 className="h-4 w-4" />}
            tone="gold"
            value={String(totalCheckins)}
            unit="logged"
          />
        </div>

        {/* Search */}
        <div className="mt-5 px-5">
          <div className="flex items-center gap-2 rounded-full bg-white/95 px-4 py-3 shadow-[0_4px_12px_rgba(120,120,180,0.08)] backdrop-blur">
            <Search className="h-4 w-4 text-[#9BA3A9]" />
            <input
              placeholder="Search clients"
              className="flex-1 bg-transparent text-[14px] text-[#1d1d1f] placeholder-[#9BA3A9] outline-none"
            />
          </div>
        </div>

        {/* Filters */}
        <div className="mt-3 px-5">
          <FilterChips
            options={[
              { key: 'all', label: 'All', count: clients.length },
              { key: 'attention', label: 'Needs attention', count: needsAttention },
              { key: 'on_track', label: 'On track', count: onTrack },
              { key: 'inactive', label: 'Inactive', count: inactive },
            ]}
          />
        </div>

        {/* Client list */}
        <div className="mt-4 flex flex-col gap-3 px-5">
          {clients.map((c) => (
            <ClientListCard key={c.name} {...c} />
          ))}
        </div>

        <AdminBottomNav />
      </div>
    </AuroraBackground>
  );
}
