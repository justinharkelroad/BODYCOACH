'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Pencil, Trash2 } from 'lucide-react';
import { getLocalDateString } from '@/lib/date';
import type { BodyStat } from '@/types/database';

interface CoachWeightHistoryProps {
  clientId: string;
  initialStats: BodyStat[];
}

export function CoachWeightHistory({ clientId, initialStats }: CoachWeightHistoryProps) {
  const router = useRouter();
  const [stats, setStats] = useState<BodyStat[]>(initialStats);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editWeight, setEditWeight] = useState('');
  const [editDate, setEditDate] = useState('');
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [visibleCount, setVisibleCount] = useState(20);

  useEffect(() => {
    setStats(initialStats);
  }, [initialStats]);

  function startEdit(stat: BodyStat) {
    setError(null);
    setEditingId(stat.id);
    setEditWeight(stat.weight_lbs?.toString() ?? '');
    setEditDate(stat.recorded_at);
  }

  function cancelEdit() {
    setEditingId(null);
    setError(null);
  }

  async function saveEdit(stat: BodyStat) {
    if (!editWeight) return;
    setBusyId(stat.id);
    setError(null);
    try {
      const res = await fetch(`/api/admin/clients/${clientId}/stats`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          statId: stat.id,
          weight_lbs: editWeight,
          recorded_at: editDate,
        }),
      });
      if (res.ok) {
        const { stat: updated } = (await res.json()) as { stat: BodyStat };
        setStats(prev =>
          prev
            .map(s => (s.id === stat.id ? { ...s, ...updated } : s))
            .sort((a, b) => (a.recorded_at < b.recorded_at ? 1 : -1)),
        );
        setEditingId(null);
        router.refresh();
      } else {
        const body = await res.json().catch(() => ({}));
        setError(body.error || 'Failed to save');
      }
    } catch {
      setError('Network error — try again');
    } finally {
      setBusyId(null);
    }
  }

  async function handleDelete(stat: BodyStat) {
    if (!confirm(`Delete the ${stat.weight_lbs} lbs entry from ${stat.recorded_at}?`)) return;
    setBusyId(stat.id);
    setError(null);
    try {
      const res = await fetch(`/api/admin/clients/${clientId}/stats?statId=${stat.id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        setStats(prev => prev.filter(s => s.id !== stat.id));
        router.refresh();
      } else {
        const body = await res.json().catch(() => ({}));
        setError(body.error || 'Failed to delete');
      }
    } catch {
      setError('Network error — try again');
    } finally {
      setBusyId(null);
    }
  }

  const weighIns = stats.filter((stat) => stat.weight_lbs !== null);

  return (
    <div className="mt-6 border-t border-[var(--theme-divider)] pt-4">
      <div className="mb-3 flex flex-wrap items-baseline justify-between gap-2">
        <h4 className="text-sm font-semibold text-[var(--theme-text)]">Full Weight History</h4>
        <span className="text-xs text-[var(--theme-text-secondary)]">{weighIns.length} weigh-in{weighIns.length === 1 ? '' : 's'} · all time</span>
      </div>
      {error && (
        <p className="text-sm text-[var(--theme-error)] mb-2">{error}</p>
      )}
      {weighIns.length === 0 && (
        <p className="py-3 text-sm text-[var(--theme-text-secondary)]">No weigh-ins logged yet. New entries will appear here.</p>
      )}
      <div className="space-y-2">
        {weighIns.slice(0, visibleCount).map(stat => (
          <div
            key={stat.id}
            className="py-2 border-b border-[var(--theme-divider)] last:border-0"
          >
            {editingId === stat.id ? (
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <Input
                    id={`edit-weight-${stat.id}`}
                    label="Weight"
                    type="number"
                    inputMode="decimal"
                    step="0.1"
                    value={editWeight}
                    onChange={(e) => setEditWeight(e.target.value)}
                    suffix="lbs"
                  />
                  <Input
                    id={`edit-date-${stat.id}`}
                    label="Date"
                    type="date"
                    value={editDate}
                    onChange={(e) => setEditDate(e.target.value)}
                    max={getLocalDateString()}
                  />
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    onClick={() => saveEdit(stat)}
                    disabled={!editWeight || busyId === stat.id}
                    isLoading={busyId === stat.id}
                  >
                    Save
                  </Button>
                  <Button size="sm" variant="ghost" onClick={cancelEdit}>
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-[var(--theme-text)]">
                    {new Date(`${stat.recorded_at}T00:00:00Z`).toLocaleDateString('en-US', {
                      timeZone: 'UTC', weekday: 'short',
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </p>
                  {stat.notes && (
                    <p className="text-xs text-[var(--theme-text-secondary)] mt-0.5 max-w-md">
                      {stat.notes}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <p className="text-sm font-semibold text-[var(--theme-text)]">
                    {stat.weight_lbs ? `${stat.weight_lbs} lbs` : '—'}
                  </p>
                  <div className="flex gap-1">
                    <button
                      onClick={() => startEdit(stat)}
                      disabled={busyId === stat.id}
                      className="p-1.5 rounded hover:bg-[var(--theme-border)] transition-colors disabled:opacity-40"
                      aria-label="Edit weigh-in"
                    >
                      <Pencil className="h-3.5 w-3.5 text-[var(--theme-text-muted)]" />
                    </button>
                    <button
                      onClick={() => handleDelete(stat)}
                      disabled={busyId === stat.id}
                      className="p-1.5 rounded hover:bg-[var(--theme-border)] transition-colors disabled:opacity-40"
                      aria-label="Delete weigh-in"
                    >
                      <Trash2 className="h-3.5 w-3.5 text-[var(--theme-error)]" />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
      {visibleCount < weighIns.length && (
        <button
          type="button"
          onClick={() => setVisibleCount((count) => count + 20)}
          className="mt-4 w-full rounded-xl bg-[#E5F2FF] px-4 py-3 text-sm font-semibold text-[#166DB5] hover:bg-[#D5EAFE] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#166DB5]"
        >
          Show older weigh-ins ({weighIns.length - visibleCount} remaining)
        </button>
      )}
    </div>
  );
}
