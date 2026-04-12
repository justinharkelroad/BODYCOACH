'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Archive, RotateCcw } from 'lucide-react';

interface ArchiveButtonProps {
  clientId: string;
  clientName: string;
  isArchived?: boolean;
}

export function ArchiveButton({ clientId, clientName, isArchived = false }: ArchiveButtonProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  async function handleAction() {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/admin/clients/${clientId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: isArchived ? 'reactivate' : 'archive' }),
      });

      if (res.ok) {
        router.push('/admin');
        router.refresh();
      }
    } catch (error) {
      console.error('Failed to update client status:', error);
    } finally {
      setIsLoading(false);
      setShowConfirm(false);
    }
  }

  if (showConfirm) {
    return (
      <div className="flex items-center gap-2">
        <span className="text-sm text-[var(--theme-text-secondary)]">
          {isArchived ? 'Reactivate' : 'Archive'} {clientName}?
        </span>
        <Button
          size="sm"
          variant="primary"
          onClick={handleAction}
          isLoading={isLoading}
        >
          Confirm
        </Button>
        <Button
          size="sm"
          variant="ghost"
          onClick={() => setShowConfirm(false)}
        >
          Cancel
        </Button>
      </div>
    );
  }

  return (
    <Button
      size="sm"
      variant={isArchived ? 'secondary' : 'ghost'}
      onClick={() => setShowConfirm(true)}
    >
      {isArchived ? (
        <>
          <RotateCcw className="h-4 w-4 mr-2" />
          Reactivate
        </>
      ) : (
        <>
          <Archive className="h-4 w-4 mr-2" />
          Archive
        </>
      )}
    </Button>
  );
}
