import twilio from 'twilio';

const client = process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN
  ? twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN)
  : null;

const FROM_NUMBER = process.env.TWILIO_PHONE_NUMBER;

export interface SMSOptions {
  to: string;
  body: string;
}

export async function sendSMS({ to, body }: SMSOptions) {
  if (!client || !FROM_NUMBER) {
    console.log('[SMS] Twilio not configured, skipping SMS to:', to);
    return { success: false, error: 'Twilio not configured' };
  }

  // Format phone number (ensure it has country code)
  const formattedTo = to.startsWith('+') ? to : `+1${to.replace(/\D/g, '')}`;

  try {
    const message = await client.messages.create({
      body,
      from: FROM_NUMBER,
      to: formattedTo,
    });

    return { success: true, sid: message.sid };
  } catch (error) {
    console.error('[SMS] Error:', error);
    return { success: false, error: 'Failed to send SMS' };
  }
}

// SMS templates (kept short for SMS)
export function weighInReminderSMS(name: string) {
  return `Hey ${name}! Time for your daily weigh-in. Log it now: ${process.env.NEXT_PUBLIC_APP_URL}/check-in`;
}

export function workoutReminderSMS(name: string) {
  return `${name}, you have a workout scheduled today! Log it: ${process.env.NEXT_PUBLIC_APP_URL}/workouts/new`;
}

export function missedCheckInSMS(name: string, checkInType: string) {
  return `${name}, you missed your ${checkInType} check-in. Take a sec to log it: ${process.env.NEXT_PUBLIC_APP_URL}/check-in`;
}

export function photoReminderSMS(name: string) {
  return `${name}, time for your weekly progress photo! Upload here: ${process.env.NEXT_PUBLIC_APP_URL}/photos/upload`;
}
