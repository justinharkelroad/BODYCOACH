'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Trash2, Scale, Dumbbell, Camera, Utensils, Loader2 } from 'lucide-react';
import type { Commitment } from '@/types/database';

interface CommitmentManagerProps {
  initialCommitments: Commitment[];
}

const COMMITMENT_TYPES = [
  { value: 'weigh_in', label: 'Daily Weigh-in', icon: Scale, defaultFreq: 'daily' },
  { value: 'workout', label: 'Workout', icon: Dumbbell, defaultFreq: 'weekly' },
  { value: 'photo', label: 'Progress Photo', icon: Camera, defaultFreq: 'weekly' },
  { value: 'nutrition', label: 'Nutrition Check', icon: Utensils, defaultFreq: 'daily' },
];

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export function CommitmentManager({ initialCommitments }: CommitmentManagerProps) {
  const router = useRouter();
  const [commitments, setCommitments] = useState<Commitment[]>(initialCommitments);
  const [isAdding, setIsAdding] = useState(false);
  const [newCommitment, setNewCommitment] = useState({
    commitment_type: 'weigh_in',
    description: '',
    frequency: 'daily',
    days_of_week: [] as number[],
    time_of_day: '08:00',
  });
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleAddCommitment = async () => {
    if (!newCommitment.description) {
      const typeInfo = COMMITMENT_TYPES.find((t) => t.value === newCommitment.commitment_type);
      newCommitment.description = typeInfo?.label || newCommitment.commitment_type;
    }

    setSaving(true);
    try {
      const response = await fetch('/api/commitments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newCommitment),
      });

      if (response.ok) {
        const { commitment } = await response.json();
        setCommitments((prev) => [...prev, commitment]);
        setIsAdding(false);
        setNewCommitment({
          commitment_type: 'weigh_in',
          description: '',
          frequency: 'daily',
          days_of_week: [],
          time_of_day: '08:00',
        });
        router.refresh();
      }
    } catch (error) {
      console.error('Failed to add commitment:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteCommitment = async (id: string) => {
    setDeletingId(id);
    try {
      const response = await fetch(`/api/commitments?id=${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setCommitments((prev) => prev.filter((c) => c.id !== id));
        router.refresh();
      }
    } catch (error) {
      console.error('Failed to delete commitment:', error);
    } finally {
      setDeletingId(null);
    }
  };

  const toggleDay = (day: number) => {
    setNewCommitment((prev) => ({
      ...prev,
      days_of_week: prev.days_of_week.includes(day)
        ? prev.days_of_week.filter((d) => d !== day)
        : [...prev.days_of_week, day].sort(),
    }));
  };

  const getCommitmentIcon = (type: string) => {
    const typeInfo = COMMITMENT_TYPES.find((t) => t.value === type);
    return typeInfo?.icon || Scale;
  };

  return (
    <div className="space-y-6">
      {/* Existing Commitments */}
      {commitments.length > 0 ? (
        <div className="space-y-3">
          {commitments.map((commitment) => {
            const Icon = getCommitmentIcon(commitment.commitment_type);
            return (
              <div
                key={commitment.id}
                className="flex items-center justify-between p-4 bg-[var(--neutral-gray-light)] rounded-xl"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-[var(--theme-surface)] rounded-lg">
                    <Icon className="h-5 w-5 text-[var(--primary-deep)]" />
                  </div>
                  <div>
                    <p className="font-medium text-[var(--neutral-dark)]">{commitment.description}</p>
                    <p className="text-sm text-[var(--neutral-gray)]">
                      {commitment.frequency === 'daily' ? 'Every day' :
                       commitment.frequency === 'weekly' && commitment.days_of_week?.length
                        ? commitment.days_of_week.map((d) => DAYS[d]).join(', ')
                        : commitment.frequency}
                      {commitment.time_of_day && ` at ${commitment.time_of_day}`}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => handleDeleteCommitment(commitment.id)}
                  disabled={deletingId === commitment.id}
                  className="p-2 text-[var(--neutral-gray)] hover:text-[var(--accent-coral)] hover:bg-[var(--theme-surface)] rounded-lg transition-colors"
                >
                  {deletingId === commitment.id ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Trash2 className="h-4 w-4" />
                  )}
                </button>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-8 text-[var(--neutral-gray)]">
          <p>No commitments set up yet.</p>
          <p className="text-sm">Add commitments to receive reminders.</p>
        </div>
      )}

      {/* Add New Commitment */}
      {isAdding ? (
        <div className="p-4 border border-[rgba(184,169,232,0.2)] rounded-xl space-y-4">
          <p className="font-medium text-[var(--neutral-dark)]">New Commitment</p>

          {/* Type Selection */}
          <div className="grid grid-cols-2 gap-2">
            {COMMITMENT_TYPES.map((type) => {
              const Icon = type.icon;
              const isSelected = newCommitment.commitment_type === type.value;
              return (
                <button
                  key={type.value}
                  onClick={() => setNewCommitment((prev) => ({
                    ...prev,
                    commitment_type: type.value,
                    frequency: type.defaultFreq,
                    description: type.label,
                  }))}
                  className={`flex items-center gap-2 p-3 rounded-lg border transition-colors ${
                    isSelected
                      ? 'border-[var(--primary-deep)] bg-[var(--primary-light)]'
                      : 'border-[rgba(184,169,232,0.2)] hover:border-[rgba(184,169,232,0.4)]'
                  }`}
                >
                  <Icon className={`h-4 w-4 ${isSelected ? 'text-[var(--primary-deep)]' : 'text-[var(--neutral-gray)]'}`} />
                  <span className={`text-sm ${isSelected ? 'text-[var(--primary-deep)]' : 'text-[var(--neutral-dark)]'}`}>
                    {type.label}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Frequency */}
          <div>
            <label className="block text-sm font-medium text-[var(--neutral-dark)] mb-2">
              Frequency
            </label>
            <div className="flex gap-2">
              {['daily', 'weekly'].map((freq) => (
                <button
                  key={freq}
                  onClick={() => setNewCommitment((prev) => ({ ...prev, frequency: freq }))}
                  className={`px-4 py-2 rounded-lg text-sm capitalize transition-colors ${
                    newCommitment.frequency === freq
                      ? 'bg-[var(--primary-deep)] text-white'
                      : 'bg-[var(--neutral-gray-light)] text-[var(--neutral-gray)] hover:bg-[var(--primary-light)]'
                  }`}
                >
                  {freq}
                </button>
              ))}
            </div>
          </div>

          {/* Days of Week (for weekly) */}
          {newCommitment.frequency === 'weekly' && (
            <div>
              <label className="block text-sm font-medium text-[var(--neutral-dark)] mb-2">
                Which days?
              </label>
              <div className="flex gap-1">
                {DAYS.map((day, index) => (
                  <button
                    key={day}
                    onClick={() => toggleDay(index)}
                    className={`w-10 h-10 rounded-lg text-xs font-medium transition-colors ${
                      newCommitment.days_of_week.includes(index)
                        ? 'bg-[var(--primary-deep)] text-white'
                        : 'bg-[var(--neutral-gray-light)] text-[var(--neutral-gray)] hover:bg-[var(--primary-light)]'
                    }`}
                  >
                    {day}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Time */}
          <div>
            <label className="block text-sm font-medium text-[var(--neutral-dark)] mb-2">
              Reminder Time
            </label>
            <Input
              type="time"
              value={newCommitment.time_of_day}
              onChange={(e) => setNewCommitment((prev) => ({ ...prev, time_of_day: e.target.value }))}
              className="max-w-[150px]"
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <Button onClick={handleAddCommitment} disabled={saving} className="flex-1">
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Add Commitment'}
            </Button>
            <Button variant="secondary" onClick={() => setIsAdding(false)}>
              Cancel
            </Button>
          </div>
        </div>
      ) : (
        <Button variant="secondary" onClick={() => setIsAdding(true)} className="w-full">
          <Plus className="h-4 w-4 mr-2" />
          Add Commitment
        </Button>
      )}
    </div>
  );
}
