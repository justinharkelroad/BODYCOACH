'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Card, CardContent } from '@/components/ui/card';

interface ProfileFormProps {
  email: string;
  initialFullName: string;
  initialPhone: string;
}

export function ProfileForm({ email, initialFullName, initialPhone }: ProfileFormProps) {
  const router = useRouter();
  const supabase = createClient();

  const [fullName, setFullName] = useState(initialFullName);
  const [phone, setPhone] = useState(initialPhone);
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setSaved(false);
    setIsSaving(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setError('Not authenticated');
        return;
      }

      const { error: updateError } = await supabase
        .from('profiles')
        .update({ full_name: fullName || null, phone: phone || null })
        .eq('id', user.id);

      if (updateError) {
        setError(updateError.message);
        return;
      }

      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
      router.refresh();
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <Card>
      <CardContent className="p-6">
        <form onSubmit={handleSave} className="space-y-5">
          <div>
            <label className="block text-[12px] font-semibold text-[#86868b] uppercase tracking-wider mb-1.5">
              Full name
            </label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Jane Doe"
              className="block w-full rounded-[8px] border border-[rgba(0,0,0,0.12)] bg-white px-4 py-3 text-[17px] text-[#1d1d1f] placeholder-[#aeaeb2] focus:outline-none focus:border-[#0071e3] focus:ring-2 focus:ring-[rgba(0,113,227,0.2)]"
            />
          </div>

          <div>
            <label className="block text-[12px] font-semibold text-[#86868b] uppercase tracking-wider mb-1.5">
              Email
            </label>
            <input
              type="email"
              value={email}
              disabled
              className="block w-full rounded-[8px] border border-[rgba(0,0,0,0.12)] bg-[#f5f5f7] px-4 py-3 text-[17px] text-[#86868b] cursor-not-allowed"
            />
            <p className="text-[12px] text-[#86868b] mt-1.5">Contact support to change your email.</p>
          </div>

          <div>
            <label className="block text-[12px] font-semibold text-[#86868b] uppercase tracking-wider mb-1.5">
              Phone <span className="font-normal normal-case tracking-normal">(optional)</span>
            </label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="(555) 123-4567"
              className="block w-full rounded-[8px] border border-[rgba(0,0,0,0.12)] bg-white px-4 py-3 text-[17px] text-[#1d1d1f] placeholder-[#aeaeb2] focus:outline-none focus:border-[#0071e3] focus:ring-2 focus:ring-[rgba(0,113,227,0.2)]"
            />
          </div>

          {error && <p className="text-[14px] text-[#FF3B30]">{error}</p>}

          {saved && (
            <div className="flex items-center justify-center gap-2 py-3 rounded-[8px] bg-[rgba(52,199,89,0.08)] text-[#34C759] text-[14px] font-medium">
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
              Profile saved
            </div>
          )}

          <button
            type="submit"
            disabled={isSaving}
            className="w-full py-3 rounded-[8px] text-[17px] font-normal text-white bg-[#0071e3] hover:bg-[#0077ED] transition-colors disabled:opacity-50"
          >
            {isSaving ? 'Saving...' : 'Save changes'}
          </button>
        </form>
      </CardContent>
    </Card>
  );
}
