export * from './email';
export * from './sms';

import { sendEmail, weighInReminderEmail, workoutReminderEmail, missedCheckInEmail, photoReminderEmail } from './email';
import { sendSMS, weighInReminderSMS, workoutReminderSMS, missedCheckInSMS, photoReminderSMS } from './sms';

export type NotificationChannel = 'email' | 'sms' | 'push';
export type NotificationType = 'weigh_in_reminder' | 'workout_reminder' | 'missed_checkin' | 'photo_reminder' | 'weekly_summary';

interface NotificationPayload {
  userId: string;
  email: string;
  phone?: string | null;
  name: string;
  type: NotificationType;
  channels: NotificationChannel[];
  metadata?: Record<string, unknown>;
}

export async function sendNotification(payload: NotificationPayload) {
  const results: { channel: NotificationChannel; success: boolean; error?: string }[] = [];

  for (const channel of payload.channels) {
    if (channel === 'email') {
      const emailContent = getEmailContent(payload.type, payload.name, payload.metadata);
      if (emailContent) {
        const result = await sendEmail({
          to: payload.email,
          ...emailContent,
        });
        results.push({ channel: 'email', ...result });
      }
    }

    if (channel === 'sms' && payload.phone) {
      const smsContent = getSMSContent(payload.type, payload.name);
      if (smsContent) {
        const result = await sendSMS({
          to: payload.phone,
          body: smsContent,
        });
        results.push({ channel: 'sms', ...result });
      }
    }

    if (channel === 'push') {
      // Push notifications would be implemented with web-push or similar
      console.log('[Push] Push notifications not yet implemented');
      results.push({ channel: 'push', success: false, error: 'Not implemented' });
    }
  }

  return results;
}

function getEmailContent(type: NotificationType, name: string, metadata?: Record<string, unknown>) {
  switch (type) {
    case 'weigh_in_reminder':
      return weighInReminderEmail(name);
    case 'workout_reminder':
      return workoutReminderEmail(name);
    case 'missed_checkin':
      return missedCheckInEmail(name, (metadata?.checkInType as string) || 'daily');
    case 'photo_reminder':
      return photoReminderEmail(name);
    default:
      return null;
  }
}

function getSMSContent(type: NotificationType, name: string) {
  switch (type) {
    case 'weigh_in_reminder':
      return weighInReminderSMS(name);
    case 'workout_reminder':
      return workoutReminderSMS(name);
    case 'missed_checkin':
      return missedCheckInSMS(name, 'daily');
    case 'photo_reminder':
      return photoReminderSMS(name);
    default:
      return null;
  }
}
