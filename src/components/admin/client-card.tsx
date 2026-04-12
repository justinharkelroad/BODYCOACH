import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Scale, Camera, Calendar, ChevronRight } from 'lucide-react';

interface ClientCardProps {
  clientId: string;
  name: string;
  email: string;
  goal: string | null;
  latestWeight: number | null;
  photoCount: number;
  lastActivity: string | null;
}

const goalLabels: Record<string, string> = {
  lose_fat: 'Lose fat',
  maintain: 'Maintain',
  gain_muscle: 'Gain muscle',
  lose_weight: 'Lose weight',
  gain_weight: 'Gain weight',
};

export function ClientCard({
  clientId,
  name,
  email,
  goal,
  latestWeight,
  photoCount,
  lastActivity,
}: ClientCardProps) {
  const displayName = name || email.split('@')[0];
  const goalLabel = goal ? goalLabels[goal] || goal : null;

  const lastActiveDate = lastActivity
    ? new Date(lastActivity).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      })
    : null;

  return (
    <Link href={`/admin/clients/${clientId}`}>
      <Card hover className="h-full">
        <CardContent>
          <div className="flex items-start justify-between mb-4">
            <div className="min-w-0 flex-1">
              <h3 className="font-semibold text-[var(--theme-text)] truncate">
                {displayName}
              </h3>
              <p className="text-sm text-[var(--theme-text-muted)] truncate">
                {email}
              </p>
            </div>
            <ChevronRight className="h-5 w-5 text-[var(--theme-text-muted)] flex-shrink-0 mt-1" aria-hidden="true" />
          </div>

          {goalLabel && (
            <span className="inline-block text-xs font-medium px-2.5 py-1 rounded-full bg-[color-mix(in_srgb,var(--theme-primary)_12%,transparent)] text-[var(--theme-primary-dark)] mb-4">
              {goalLabel}
            </span>
          )}

          <div className="grid grid-cols-3 gap-3 text-center">
            <div>
              <Scale className="h-4 w-4 mx-auto mb-1 text-[var(--theme-text-muted)]" aria-hidden="true" />
              <p className="text-sm font-medium text-[var(--theme-text)]">
                {latestWeight ? `${latestWeight}` : '—'}
              </p>
              <p className="text-[10px] text-[var(--theme-text-muted)]">lbs</p>
            </div>
            <div>
              <Camera className="h-4 w-4 mx-auto mb-1 text-[var(--theme-text-muted)]" aria-hidden="true" />
              <p className="text-sm font-medium text-[var(--theme-text)]">
                {photoCount}
              </p>
              <p className="text-[10px] text-[var(--theme-text-muted)]">photos</p>
            </div>
            <div>
              <Calendar className="h-4 w-4 mx-auto mb-1 text-[var(--theme-text-muted)]" aria-hidden="true" />
              <p className="text-sm font-medium text-[var(--theme-text)]">
                {lastActiveDate || '—'}
              </p>
              <p className="text-[10px] text-[var(--theme-text-muted)]">last active</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
