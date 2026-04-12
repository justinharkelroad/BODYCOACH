import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { Users, Archive } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { ClientCard } from '@/components/admin/client-card';
import { ArchivedClientRow } from '@/components/admin/archived-client-row';
import type { Profile, BodyStat, ProgressPhoto } from '@/types/database';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Clients | Coach Dashboard',
};

export default async function AdminDashboardPage() {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  // Fetch active and archived clients
  const [activeRes, archivedRes] = await Promise.all([
    supabase
      .from('coach_clients')
      .select('client_id')
      .eq('coach_id', user.id)
      .eq('status', 'active'),
    supabase
      .from('coach_clients')
      .select('client_id')
      .eq('coach_id', user.id)
      .eq('status', 'removed'),
  ]);

  const activeIds = (activeRes.data || []).map(r => r.client_id);
  const archivedIds = (archivedRes.data || []).map(r => r.client_id);
  const allIds = [...activeIds, ...archivedIds];

  if (allIds.length === 0) {
    return (
      <div className="space-y-8">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Users className="h-6 w-6 text-[var(--theme-primary)]" />
            <h1 className="text-2xl font-semibold text-[var(--theme-text)]">Clients</h1>
          </div>
          <p className="text-[var(--theme-text-secondary)]">Manage and track your clients' progress</p>
        </div>
        <Card>
          <CardContent className="py-16 text-center">
            <Users className="h-12 w-12 mx-auto mb-4 text-[var(--theme-text-muted)]" />
            <h2 className="text-lg font-semibold text-[var(--theme-text)] mb-2">No clients yet</h2>
            <p className="text-[var(--theme-text-secondary)]">
              When new users sign up, they'll automatically appear here.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Fetch all client profiles (active + archived)
  const { data: allProfiles } = await supabase
    .from('profiles')
    .select('id, full_name, email, goal, created_at')
    .in('id', allIds) as { data: Pick<Profile, 'id' | 'full_name' | 'email' | 'goal' | 'created_at'>[] | null };

  // Fetch latest weight + photo counts only for active clients
  let latestWeightByUser = new Map<string, number>();
  let lastActivityByUser = new Map<string, string>();
  let photoCountByUser = new Map<string, number>();

  if (activeIds.length > 0) {
    const [statsRes, photosRes] = await Promise.all([
      supabase
        .from('body_stats')
        .select('user_id, weight_lbs, recorded_at')
        .in('user_id', activeIds)
        .order('recorded_at', { ascending: false }),
      supabase
        .from('progress_photos')
        .select('user_id')
        .in('user_id', activeIds),
    ]);

    for (const stat of statsRes.data || []) {
      if (!latestWeightByUser.has(stat.user_id) && stat.weight_lbs) {
        latestWeightByUser.set(stat.user_id, stat.weight_lbs);
      }
      if (!lastActivityByUser.has(stat.user_id)) {
        lastActivityByUser.set(stat.user_id, stat.recorded_at);
      }
    }

    for (const photo of photosRes.data || []) {
      photoCountByUser.set(photo.user_id, (photoCountByUser.get(photo.user_id) || 0) + 1);
    }
  }

  const activeClients = (allProfiles || []).filter(p => activeIds.includes(p.id));
  const archivedClients = (allProfiles || []).filter(p => archivedIds.includes(p.id));

  return (
    <div className="space-y-8">
      <div>
        <div className="flex items-center gap-2 mb-2">
          <Users className="h-6 w-6 text-[var(--theme-primary)]" />
          <h1 className="text-2xl font-semibold text-[var(--theme-text)]">Clients</h1>
        </div>
        <p className="text-[var(--theme-text-secondary)]">
          {activeIds.length} active client{activeIds.length !== 1 ? 's' : ''}
          {archivedIds.length > 0 && ` · ${archivedIds.length} archived`}
        </p>
      </div>

      {activeClients.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {activeClients.map(client => (
            <ClientCard
              key={client.id}
              clientId={client.id}
              name={client.full_name || ''}
              email={client.email}
              goal={client.goal}
              latestWeight={latestWeightByUser.get(client.id) || null}
              photoCount={photoCountByUser.get(client.id) || 0}
              lastActivity={lastActivityByUser.get(client.id) || null}
            />
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="py-8 text-center">
            <p className="text-[var(--theme-text-secondary)]">No active clients. Reactivate an archived client below.</p>
          </CardContent>
        </Card>
      )}

      {/* Archived clients */}
      {archivedClients.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-4">
            <Archive className="h-5 w-5 text-[var(--theme-text-muted)]" />
            <h2 className="text-lg font-medium text-[var(--theme-text-secondary)]">Archived</h2>
          </div>
          <Card>
            <CardContent className="divide-y divide-[var(--theme-divider)]">
              {archivedClients.map(client => (
                <ArchivedClientRow
                  key={client.id}
                  clientId={client.id}
                  name={client.full_name || client.email.split('@')[0]}
                  email={client.email}
                />
              ))}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
