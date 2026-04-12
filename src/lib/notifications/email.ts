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
  replyTo?: string;
}

export async function sendEmail({ to, subject, html, text, replyTo }: EmailOptions) {
  if (!process.env.RESEND_API_KEY) {
    console.log('[Email] Resend not configured, skipping email to:', to);
    return { success: false, error: 'Resend not configured' };
  }

  try {
    const { data, error } = await getResend().emails.send({
      from: FROM_EMAIL,
      replyTo: replyTo || REPLY_TO,
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

export function purchaseWelcomeEmail(params: { firstName: string; accessCode: string; signupUrl: string }) {
  const { firstName, accessCode, signupUrl } = params;
  const greeting = firstName ? `Hi ${firstName},` : 'Hi there,';
  return {
    subject: "Welcome to Standard Nutrition — here's how to get started",
    html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 520px; margin: 0 auto; padding: 24px; color: #1a1a2e; line-height: 1.55;">
        <p style="font-size: 16px; margin: 0 0 16px;">${greeting}</p>

        <p style="font-size: 16px; margin: 0 0 16px;">
          Welcome to Standard Nutrition — I'm so glad you're here. You just took a real step toward feeling better in your body, and I can't wait to help you get there.
        </p>

        <p style="font-size: 16px; margin: 0 0 16px;">
          To set up your account, head to the app and create your login with the access code below.
        </p>

        <div style="background: #f5f5f7; border-radius: 10px; padding: 20px; margin: 24px 0; text-align: center;">
          <div style="font-size: 12px; color: #6e6e73; letter-spacing: 0.08em; text-transform: uppercase; margin-bottom: 8px;">Your access code</div>
          <div style="font-size: 28px; font-weight: 600; letter-spacing: 0.12em; color: #1a1a2e; font-family: 'SF Mono', Menlo, Consolas, monospace;">${accessCode}</div>
        </div>

        <div style="text-align: center; margin: 24px 0;">
          <a href="${signupUrl}"
             style="display: inline-block; background: #0071e3; color: white; padding: 14px 28px; border-radius: 980px; text-decoration: none; font-size: 16px;">
            Create your account
          </a>
        </div>

        <p style="font-size: 16px; margin: 24px 0 16px;">
          Once you're in, you'll be able to log your weigh-ins, upload progress photos, track your workouts, and see the plan I build for you. I'll be checking in on your progress as you go.
        </p>

        <p style="font-size: 16px; margin: 0 0 8px;">
          Any questions, just reply to this email and it'll come straight to me.
        </p>

        <p style="font-size: 16px; margin: 24px 0 0;">
          — Corina
        </p>
      </div>
    `,
  };
}

export function newSignupNotificationEmail(params: { fullName: string; email: string; signedUpAt: Date }) {
  const { fullName, email, signedUpAt } = params;
  const formattedDate = signedUpAt.toLocaleString('en-US', {
    dateStyle: 'medium',
    timeStyle: 'short',
  });
  return {
    subject: `New client signup: ${fullName || email}`,
    html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 500px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #1a1a2e; margin-bottom: 16px;">New client signup</h2>
        <p style="color: #4a4a68; line-height: 1.6;">
          A new client just created a Standard Nutrition account.
        </p>
        <table style="width: 100%; border-collapse: collapse; margin-top: 16px;">
          <tr>
            <td style="padding: 8px 0; color: #8a8aa3; font-size: 14px;">Name</td>
            <td style="padding: 8px 0; color: #1a1a2e; font-size: 14px;">${fullName || '—'}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #8a8aa3; font-size: 14px;">Email</td>
            <td style="padding: 8px 0; color: #1a1a2e; font-size: 14px;">${email}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #8a8aa3; font-size: 14px;">Signed up</td>
            <td style="padding: 8px 0; color: #1a1a2e; font-size: 14px;">${formattedDate}</td>
          </tr>
        </table>
        <a href="${APP_URL}/admin"
           style="display: inline-block; background: #0071e3; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; margin-top: 20px;">
          Open Admin
        </a>
      </div>
    `,
  };
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
        <h2 style="color: #1d1d1f; margin-bottom: 16px;">Hey ${name}!</h2>
        <p style="color: #6e6e73; line-height: 1.6;">
          It's time for your weekly check-in. Take a few minutes to fill out your progress update so I can review and adjust your plan.
        </p>
        <a href="${formUrl}"
           style="display: inline-block; background: #0071e3; color: white; padding: 14px 28px; border-radius: 8px; text-decoration: none; margin-top: 20px; font-size: 16px;">
          Complete Check-in
        </a>
        <p style="color: #86868b; font-size: 14px; margin-top: 24px;">
          This should only take a couple of minutes.<br/>— Corina
        </p>
      </div>
    `,
  };
}
