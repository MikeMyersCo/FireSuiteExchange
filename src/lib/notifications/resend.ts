import { Resend } from 'resend';

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

export interface ResendEmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export async function sendEmailViaResend(options: ResendEmailOptions): Promise<void> {
  if (!resend) {
    throw new Error('Resend API key not configured');
  }

  try {
    // Use onboarding@resend.dev for testing if no custom domain is set up
    // This works without domain verification
    const fromEmail = process.env.RESEND_FROM_EMAIL || 'Fire Suite Exchange <onboarding@resend.dev>';

    const { data, error } = await resend.emails.send({
      from: fromEmail,
      to: options.to,
      subject: options.subject,
      html: options.html,
      text: options.text,
    });

    if (error) {
      console.error('Resend error:', error);
      throw new Error(`Resend failed: ${error.message}`);
    }

    console.log(`✅ Email sent via Resend: ${data?.id}`);
  } catch (error: any) {
    console.error('Failed to send email via Resend:', error);
    throw error;
  }
}
