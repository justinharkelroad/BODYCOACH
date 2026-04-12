'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Archive, RotateCcw, Trash2 } from 'lucide-react';

interface ArchiveButtonProps {
  clientId: string;
  clientName: string;
  isArchived?: boolean;
}

export function ArchiveButton({ clientId, clientName, isArchived = false }: ArchiveButtonProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [confirmAction, setConfirmAction] = useState<'archive' | 'reactivate' | 'delete' | null>(null);

  async function handleArchiveAction() {
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
      setConfirmAction(null);
    }
  }

  async function handleDelete() {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/admin/clients/${clientId}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        router.push('/admin');
        router.refresh();
      }
    } catch (error) {
      console.error('Failed to delete client:', error);
    } finally {
      setIsLoading(false);
      setConfirmAction(null);
    }
  }

  if (confirmAction) {
    const isDelete = confirmAction === 'delete';
    return (
      <div className="flex flex-col items-end gap-2">
        <span className="text-sm text-[var(--theme-text-secondary)]">
          {isDelete
            ? `Permanently delete ${clientName}? This cannot be undone.`
            : `${isArchived ? 'Reactivate' : 'Archive'} ${clientName}?`
          }
        </span>
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="primary"
            onClick={isDelete ? handleDelete : handleArchiveAction}
            isLoading={isLoading}
            className={isDelete ? 'bg-[var(--theme-error)] hover:bg-[#E0352B]' : ''}
          >
            {isDelete ? 'Delete Forever' : 'Confirm'}
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setConfirmAction(null)}
          >
            Cancel
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <Button
        size="sm"
        variant={isArchived ? 'secondary' : 'ghost'}
        onClick={() => setConfirmAction(isArchived ? 'reactivate' : 'archive')}
      >
        {isArchived ? (
          <><RotateCcw className="h-4 w-4 mr-2" /> Reactivate</>
        ) : (
          <><Archive className="h-4 w-4 mr-2" /> Archive</>
        )}
      </Button>
      <Button
        size="sm"
        variant="ghost"
        onClick={() => setConfirmAction('delete')}
        className="text-[var(--theme-error)] hover:bg-[rgba(255,59,48,0.06)]"
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  );
}
