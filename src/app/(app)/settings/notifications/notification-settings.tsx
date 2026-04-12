'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Mail, MessageSquare, Bell, Loader2 } from 'lucide-react';

interface NotificationPreferences {
  email: boolean;
  sms: boolean;
  push: boolean;
}

interface NotificationSettingsProps {
  initialPreferences: NotificationPreferences;
  phone: string | null;
}

export function NotificationSettings({ initialPreferences, phone }: NotificationSettingsProps) {
  const router = useRouter();
  const [preferences, setPreferences] = useState(initialPreferences);
  const [phoneNumber, setPhoneNumber] = useState(phone || '');
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const toggleChannel = (channel: keyof NotificationPreferences) => {
    setPreferences((prev) => ({ ...prev, [channel]: !prev[channel] }));
    setSaved(false);
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const response = await fetch('/api/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          notification_preferences: preferences,
          phone: phoneNumber || null,
        }),
      });

      if (response.ok) {
        setSaved(true);
        router.refresh();
      }
    } catch (error) {
      console.error('Failed to save:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const channels = [
    {
      key: 'email' as const,
      icon: Mail,
      title: 'Email',
      description: 'Receive reminders and summaries via email',
    },
    {
      key: 'sms' as const,
      icon: MessageSquare,
      title: 'SMS',
      description: 'Get text message reminders',
      requiresPhone: true,
    },
    {
      key: 'push' as const,
      icon: Bell,
      title: 'Push Notifications',
      description: 'Browser notifications (coming soon)',
      disabled: true,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Channel Toggles */}
      <div className="space-y-4">
        {channels.map((channel) => {
          const Icon = channel.icon;
          const isEnabled = preferences[channel.key];

          return (
            <div
              key={channel.key}
              className={`flex items-center justify-between p-4 rounded-xl border transition-colors ${
                channel.disabled
                  ? 'opacity-50 border-[rgba(184,169,232,0.1)]'
                  : isEnabled
                  ? 'border-[var(--primary-deep)] bg-[var(--primary-light)]'
                  : 'border-[rgba(184,169,232,0.2)] hover:border-[rgba(184,169,232,0.4)]'
              }`}
            >
              <div className="flex items-center gap-4">
                <div className={`p-2 rounded-lg ${isEnabled ? 'bg-[var(--primary-deep)]' : 'bg-[var(--neutral-gray-light)]'}`}>
                  <Icon className={`h-5 w-5 ${isEnabled ? 'text-white' : 'text-[var(--neutral-gray)]'}`} />
                </div>
                <div>
                  <p className="font-medium text-[var(--neutral-dark)]">{channel.title}</p>
                  <p className="text-sm text-[var(--neutral-gray)]">{channel.description}</p>
                </div>
              </div>
              <button
                onClick={() => !channel.disabled && toggleChannel(channel.key)}
                disabled={channel.disabled}
                className={`relative w-12 h-7 rounded-full transition-colors ${
                  isEnabled ? 'bg-[var(--primary-deep)]' : 'bg-[var(--neutral-gray-light)]'
                } ${channel.disabled ? 'cursor-not-allowed' : 'cursor-pointer'}`}
              >
                <span
                  className={`absolute top-1 left-1 w-5 h-5 rounded-full bg-white transition-transform ${
                    isEnabled ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          );
        })}
      </div>

      {/* Phone Number Input (shown when SMS is enabled) */}
      {preferences.sms && (
        <div className="p-4 bg-[var(--neutral-gray-light)] rounded-xl space-y-3">
          <label className="block text-sm font-medium text-[var(--neutral-dark)]">
            Phone Number for SMS
          </label>
          <Input
            type="tel"
            value={phoneNumber}
            onChange={(e) => {
              setPhoneNumber(e.target.value);
              setSaved(false);
            }}
            placeholder="(555) 123-4567"
          />
          <p className="text-xs text-[var(--neutral-gray)]">
            Standard message rates may apply
          </p>
        </div>
      )}

      {/* Save Button */}
      <Button onClick={handleSave} disabled={isSaving} className="w-full">
        {isSaving ? (
          <>
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            Saving...
          </>
        ) : saved ? (
          'Saved!'
        ) : (
          'Save Preferences'
        )}
      </Button>
    </div>
  );
}
