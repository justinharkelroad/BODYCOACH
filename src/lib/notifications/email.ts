import { Resend } from 'resend';

let _resend: Resend | null = null;
function getResend() {
  if (!_resend) {
    _resend = new Resend(process.env.RESEND_API_KEY || '');
  }
  return _resend;
}
const DEFAULT_FROM_EMAIL = 'Corina | Standard Nutrition <corina@standardnutrition.app>';
const FROM_EMAIL = process.env.NOTIFICATION_FROM_EMAIL || DEFAULT_FROM_EMAIL;
const REPLY_TO = 'corinahark@gmail.com';
const APP_URL = (process.env.NEXT_PUBLIC_APP_URL || 'https://standardnutrition.app').replace(/\/$/, '');

export interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export async function sendEmail({ to, subject, html, text }: EmailOptions) {
  if (!process.env.RESEND_API_KEY) {
    console.log('[Email] Resend not configured, skipping email to:', to);
    return { success: false, error: 'Resend not configured' };
  }

  try {
    const { data, error } = await getResend().emails.send({
      from: FROM_EMAIL,
      replyTo: REPLY_TO,
      to,
      subject,
      html,
      text: text || html.replace(/<[^>]*>/g, ''),
    });

    if (error) {
      console.error('[Email] Failed to send:', error);
      return { success: false, error: error.message };
    }

    return { success: true, id: data?.id };
  } catch (error) {
    console.error('[Email] Error:', error);
    return { success: false, error: 'Failed to send email' };
  }
}

// Email templates
export function weighInReminderEmail(name: string) {
  return {
    subject: "Time to weigh in!",
    html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 500px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #1a1a2e; margin-bottom: 16px;">Hey ${name}!</h2>
        <p style="color: #4a4a68; line-height: 1.6;">
          It's time for your daily weigh-in. Consistent tracking is key to reaching your goals!
        </p>
        <a href="${APP_URL}/check-in"
           style="display: inline-block; background: #0071e3; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; margin-top: 16px;">
          Log Your Weight
        </a>
        <p style="color: #8a8aa3; font-size: 14px; margin-top: 24px;">
          - Your Standard Nutrition Team
        </p>
      </div>
    `,
  };
}

export function workoutReminderEmail(name: string) {
  return {
    subject: "Workout reminder",
    html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 500px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #1a1a2e; margin-bottom: 16px;">Ready to crush it, ${name}?</h2>
        <p style="color: #4a4a68; line-height: 1.6;">
          You scheduled a workout for today. Let's make it happen!
        </p>
        <a href="${APP_URL}/workouts/new"
           style="display: inline-block; background: #0071e3; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; margin-top: 16px;">
          Log Your Workout
        </a>
        <p style="color: #8a8aa3; font-size: 14px; margin-top: 24px;">
          - Your Standard Nutrition Team
        </p>
      </div>
    `,
  };
}

export function missedCheckInEmail(name: string, checkInType: string) {
  return {
    subject: "We missed you today",
    html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 500px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #1a1a2e; margin-bottom: 16px;">Hey ${name},</h2>
        <p style="color: #4a4a68; line-height: 1.6;">
          We noticed you missed your ${checkInType} check-in today. No worries - life happens!
          But consistency is important for reaching your goals.
        </p>
        <p style="color: #4a4a68; line-height: 1.6;">
          Can you take a moment to log it now?
        </p>
        <a href="${APP_URL}/check-in"
           style="display: inline-block; background: #0071e3; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; margin-top: 16px;">
          Complete Check-in
        </a>
        <p style="color: #8a8aa3; font-size: 14px; margin-top: 24px;">
          - Your Standard Nutrition Team
        </p>
      </div>
    `,
  };
}

export function photoReminderEmail(name: string) {
  return {
    subject: "Time for your progress photo!",
    html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 500px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #1a1a2e; margin-bottom: 16px;">Progress photo time, ${name}!</h2>
        <p style="color: #4a4a68; line-height: 1.6;">
          It's been a week - time to capture your progress! Photos are one of the best ways to see
          your transformation over time.
        </p>
        <a href="${APP_URL}/photos/upload"
           style="display: inline-block; background: #0071e3; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; margin-top: 16px;">
          Upload Photos
        </a>
        <p style="color: #8a8aa3; font-size: 14px; margin-top: 24px;">
          - Your Standard Nutrition Team
        </p>
      </div>
    `,
  };
}

export function weeklySummaryEmail(name: string, stats: {
  workoutsCompleted: number;
  weighInsLogged: number;
  weightChange: number | null;
}) {
  const weightChangeText = stats.weightChange !== null
    ? `${stats.weightChange > 0 ? '+' : ''}${stats.weightChange.toFixed(1)} lbs`
    : 'No data';

  return {
    subject: "Your weekly progress summary",
    html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 500px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #1a1a2e; margin-bottom: 16px;">Weekly Recap, ${name}</h2>
        <p style="color: #4a4a68; line-height: 1.6;">
          Here's how you did this week:
        </p>
        <div style="background: #f8f7ff; border-radius: 12px; padding: 20px; margin: 20px 0;">
          <div style="display: flex; justify-content: space-between; margin-bottom: 12px;">
            <span style="color: #8a8aa3;">Workouts</span>
            <strong style="color: #1a1a2e;">${stats.workoutsCompleted}</strong>
          </div>
          <div style="display: flex; justify-content: space-between; margin-bottom: 12px;">
            <span style="color: #8a8aa3;">Weigh-ins</span>
            <strong style="color: #1a1a2e;">${stats.weighInsLogged}</strong>
          </div>
          <div style="display: flex; justify-content: space-between;">
            <span style="color: #8a8aa3;">Weight Change</span>
            <strong style="color: #1a1a2e;">${weightChangeText}</strong>
          </div>
        </div>
        <a href="${APP_URL}/dashboard"
           style="display: inline-block; background: #0071e3; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; margin-top: 16px;">
          View Dashboard
        </a>
        <p style="color: #8a8aa3; font-size: 14px; margin-top: 24px;">
          Keep up the great work!<br/>- Your Standard Nutrition Team
        </p>
      </div>
    `,
  };
}

export function weeklyCheckinFormEmail(name: string) {
  const formUrl = 'https://form.jotform.com/242795367780168';

  return {
    subject: "Time for your weekly check-in!",
    html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 500px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #1a1a2e; margin-bottom: 16px;">Hey ${name}!</h2>
        <p style="color: #4a4a68; line-height: 1.6;">
          It's time for your weekly check-in. Take a few minutes to fill out your progress update so your coach can review and adjust your plan.
        </p>
        <a href="${formUrl}"
           style="display: inline-block; background: #0071e3; color: white; padding: 14px 28px; border-radius: 10px; text-decoration: none; margin-top: 20px; font-weight: 600; font-size: 16px;">
          Complete Check-in
        </a>
        <p style="color: #8a8aa3; font-size: 14px; margin-top: 24px;">
          This should only take a couple of minutes.<br/>- Your Standard Nutrition Team
        </p>
      </div>
    `,
  };
}
