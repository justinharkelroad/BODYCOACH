import { AlertTriangle, Archive, CheckCircle2, Search, Users } from 'lucide-react';
import {
  ClientListCard,
  FilterChips,
  KPICard,
  PageHeader,
} from '@/components/v2';
import type { ClientListCardProps, ClientStatus } from '@/components/v2';
import { ArchivedClientRow } from '@/components/admin/archived-client-row';

export interface AdminClientRow {
  id: string;
  name: string;
  email: string;
  goal: string | null;
  latestWeight: number | null;
  weeklyChange: number | null;
  lastActivityIso: string | null;
  checkinsThisWeek: number;
  status: ClientStatus;
}

interface AdminV2Props {
  activeClients: AdminClientRow[];
  archivedClients: { id: string; full_name: string | null; email: string }[];
}

function relativeLabel(iso: string | null): string | null {
  if (!iso) return null;
  const d = new Date(iso);
  const days = Math.floor((Date.now() - d.getTime()) / 86400000);
  if (days <= 0) return 'today';
  if (days === 1) return 'yesterday';
  if (days < 7) return `${days} days ago`;
  if (days < 30) return `${Math.floor(days / 7)}w ago`;
  return `${Math.floor(days / 30)}mo ago`;
}

export function AdminV2({ activeClients, archivedClients }: AdminV2Props) {
  const needsAttention = activeClients.filter(
    (c) => c.status === 'needs_attention',
  ).length;
  const onTrack = activeClients.filter((c) => c.status === 'on_track').length;
  const inactive = activeClients.filter((c) => c.status === 'inactive').length;
  const totalCheckins = activeClients.reduce(
    (sum, c) => sum + c.checkinsThisWeek,
    0,
  );

  const cardProps: ClientListCardProps[] = activeClients.map((c) => ({
    href: `/admin/clients/${c.id}`,
    initials: (c.name || c.email).slice(0, 2).toUpperCase(),
    name: c.name || c.email.split('@')[0],
    goal: c.goal,
    currentWeight: c.latestWeight,
    weeklyChange: c.weeklyChange,
    lastActiveLabel: relativeLabel(c.lastActivityIso),
    checkinsThisWeek: c.checkinsThisWeek,
    status: c.status,
  }));

  return (
    <div className="space-y-6">
      <PageHeader
        title="Clients"
        subtitle={`${activeClients.length} active${archivedClients.length > 0 ? ` · ${archivedClients.length} archived` : ''}`}
      />

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <KPICard
          label="Active"
          icon={<Users className="h-4 w-4" />}
          tone="blue"
          value={String(activeClients.length)}
          unit="clients"
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

      <div>
        <div className="flex items-center gap-2 rounded-full bg-white/95 px-4 py-3 shadow-[0_4px_12px_rgba(120,120,180,0.08)] backdrop-blur">
          <Search className="h-4 w-4 text-[#9BA3A9]" />
          <input
            placeholder="Search clients"
            className="flex-1 bg-transparent text-[14px] text-[#1d1d1f] placeholder-[#9BA3A9] outline-none"
          />
        </div>
      </div>

      <FilterChips
        options={[
          { key: 'all', label: 'All', count: activeClients.length },
          { key: 'attention', label: 'Needs attention', count: needsAttention },
          { key: 'on_track', label: 'On track', count: onTrack },
          { key: 'inactive', label: 'Inactive', count: inactive },
        ]}
      />

      {cardProps.length > 0 ? (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {cardProps.map((c) => (
            <ClientListCard key={c.name + c.href} {...c} />
          ))}
        </div>
      ) : (
        <div className="rounded-3xl bg-white/95 p-10 text-center shadow-[0_8px_24px_rgba(120,120,180,0.10)] backdrop-blur">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#E5F2FF]">
            <Users className="h-7 w-7 text-[#3B9DFF]" />
          </div>
          <h2 className="text-[16px] font-semibold text-[#1d1d1f]">
            No active clients
          </h2>
          <p className="mt-1 text-[13px] text-[#6e6e73]">
            New clients will appear here automatically when they sign up.
          </p>
        </div>
      )}

      {archivedClients.length > 0 && (
        <div>
          <div className="mb-3 flex items-center gap-2">
            <Archive className="h-4 w-4 text-[#9BA3A9]" />
            <h2 className="text-[13px] font-semibold uppercase tracking-wide text-[#6e6e73]">
              Archived
            </h2>
          </div>
          <div className="overflow-hidden rounded-3xl bg-white/95 shadow-[0_8px_24px_rgba(120,120,180,0.10)] backdrop-blur">
            <div className="divide-y divide-[#F0F4F9]">
              {archivedClients.map((c) => (
                <ArchivedClientRow
                  key={c.id}
                  clientId={c.id}
                  name={c.full_name || c.email.split('@')[0]}
                  email={c.email}
                />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
