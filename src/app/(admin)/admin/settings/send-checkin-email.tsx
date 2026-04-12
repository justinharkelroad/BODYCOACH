'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Send, CheckCircle2 } from 'lucide-react';

interface SendCheckinEmailProps {
  clientCount: number;
}

export function SendCheckinEmail({ clientCount }: SendCheckinEmailProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<{ sent: number; failed: number } | null>(null);

  async function handleSend() {
    if (!confirm(`Send weekly check-in email to ${clientCount} client${clientCount !== 1 ? 's' : ''}?`)) return;

    setIsLoading(true);
    setResult(null);

    try {
      const res = await fetch('/api/admin/send-checkin-email', {
        method: 'POST',
      });

      if (res.ok) {
        const data = await res.json();
        setResult({ sent: data.sent, failed: data.failed });
      }
    } catch (error) {
      console.error('Failed to send emails:', error);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div>
      <Button
        onClick={handleSend}
        disabled={clientCount === 0 || isLoading}
        isLoading={isLoading}
      >
        <Send className="h-4 w-4 mr-2" />
        Send to {clientCount} Client{clientCount !== 1 ? 's' : ''}
      </Button>

      {result && (
        <div className="mt-3 flex items-center gap-2 text-sm">
          <CheckCircle2 className="h-4 w-4 text-[var(--theme-success)]" />
          <span className="text-[var(--theme-text-secondary)]">
            Sent to {result.sent} client{result.sent !== 1 ? 's' : ''}
            {result.failed > 0 && ` (${result.failed} failed)`}
          </span>
        </div>
      )}
    </div>
  );
}
