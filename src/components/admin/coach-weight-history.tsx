'use client';

import { useState } from 'react';
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
  const [stats, setStats] = useState<BodyStat[]>(initialStats);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editWeight, setEditWeight] = useState('');
  const [editDate, setEditDate] = useState('');
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

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

  if (stats.length === 0) return null;

  return (
    <div className="mt-6 border-t border-[var(--theme-divider)] pt-4">
      <h4 className="text-sm font-medium text-[var(--theme-text-secondary)] mb-3">Recent Entries</h4>
      {error && (
        <p className="text-sm text-[var(--theme-error)] mb-2">{error}</p>
      )}
      <div className="space-y-2">
        {stats.slice(0, 10).map(stat => (
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
                    {new Date(stat.recorded_at).toLocaleDateString('en-US', {
                      weekday: 'short',
                      month: 'short',
                      day: 'numeric',
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
    </div>
  );
}
