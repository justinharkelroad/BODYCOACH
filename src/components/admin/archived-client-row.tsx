'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { RotateCcw } from 'lucide-react';

interface ArchivedClientRowProps {
  clientId: string;
  name: string;
  email: string;
}

export function ArchivedClientRow({ clientId, name, email }: ArchivedClientRowProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  async function handleReactivate() {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/admin/clients/${clientId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'reactivate' }),
      });
      if (res.ok) {
        router.refresh();
      }
    } catch (error) {
      console.error('Failed to reactivate client:', error);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="flex items-center justify-between py-3">
      <div className="min-w-0">
        <p className="text-sm font-medium text-[var(--theme-text-secondary)]">{name}</p>
        <p className="text-xs text-[var(--theme-text-muted)]">{email}</p>
      </div>
      <Button size="sm" variant="secondary" onClick={handleReactivate} isLoading={isLoading}>
        <RotateCcw className="h-3.5 w-3.5 mr-1.5" />
        Reactivate
      </Button>
    </div>
  );
}
