import { NextRequest } from 'next/server';
import { sendEmail } from '@/lib/notifications/email';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const { firstName, lastName, email, phone, message } = await request.json();

    if (!firstName || !lastName || !email) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Email Corina with the lead
    const html = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 560px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #1d1d1f; margin-bottom: 16px;">New Lead from Standard Nutrition</h2>
        <div style="background: #f5f5f7; border-radius: 12px; padding: 20px; margin: 20px 0;">
          <p style="color: #1d1d1f; margin: 0 0 10px 0;"><strong>Name:</strong> ${firstName} ${lastName}</p>
          <p style="color: #1d1d1f; margin: 0 0 10px 0;"><strong>Email:</strong> <a href="mailto:${email}" style="color: #0066cc;">${email}</a></p>
          ${phone ? `<p style="color: #1d1d1f; margin: 0 0 10px 0;"><strong>Phone:</strong> <a href="tel:${phone}" style="color: #0066cc;">${phone}</a></p>` : ''}
          ${message ? `<div style="margin-top: 16px;"><p style="color: #1d1d1f; margin: 0 0 8px 0;"><strong>Message:</strong></p><p style="color: #6e6e73; line-height: 1.6; margin: 0;">${message.replace(/</g, '&lt;').replace(/\n/g, '<br/>')}</p></div>` : ''}
        </div>
        <p style="color: #86868b; font-size: 14px;">Reply directly to this email to respond to ${firstName}.</p>
      </div>
    `;

    const result = await sendEmail({
      to: 'corinahark@gmail.com',
      subject: `New lead: ${firstName} ${lastName}`,
      html,
      replyTo: email,
    });

    if (!result.success) {
      return Response.json({ error: 'Failed to send' }, { status: 500 });
    }

    return Response.json({ success: true });
  } catch (error) {
    console.error('Lead submission error:', error);
    return Response.json({ error: 'Server error' }, { status: 500 });
  }
}
