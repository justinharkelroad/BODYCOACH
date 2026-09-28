import type { createClient } from '@/lib/supabase/server';
import type { BodyStat } from '@/types/database';

const PAGE_SIZE = 500;

// Supabase limits rows per response. Page through the full history so long-running
// programs never silently lose older weigh-ins.
export async function getAllBodyStats(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
): Promise<BodyStat[]> {
  const stats: BodyStat[] = [];

  for (let from = 0; ;) {
    const { data, error, count } = await supabase
      .from('body_stats')
      .select('*', { count: 'exact' })
      .eq('user_id', userId)
      .order('recorded_at', { ascending: false })
      .range(from, from + PAGE_SIZE - 1);

    if (error) throw error;
    const page = (data ?? []) as BodyStat[];
    stats.push(...page);
    if (page.length === 0 || (count !== null && stats.length >= count)) return stats;
    // Advance by rows actually returned; a project's API cap can be below PAGE_SIZE.
    from += page.length;
  }
}
