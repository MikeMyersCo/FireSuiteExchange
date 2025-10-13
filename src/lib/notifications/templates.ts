import { sendEmail, getEmailTemplate } from './email';
import { APP_URL } from '../constants';

export async function sendWelcomeEmail(email: string, name: string) {
  const content = `
    <p>Welcome to Fire Suite Exchange, ${name}!</p>
    <p>Your account has been successfully created. You can now browse tickets from verified Fire Suite owners at Ford Amphitheater.</p>
    <p>If you own a Fire Suite and want to list tickets, you can apply to become a verified seller.</p>
  `;

  await sendEmail({
    to: email,
    subject: 'Welcome to Fire Suite Exchange',
    html: getEmailTemplate(
      'Welcome to Fire Suite Exchange',
      content,
      `${APP_URL}/browse`,
      'Browse Listings'
    ),
  });
}

export async function sendApplicationReceivedEmail(email: string, name: string) {
  const content = `
    <p>Hi ${name},</p>
    <p>We've received your application to become a verified seller on Fire Suite Exchange.</p>
    <p>Our admin team will review your application and supporting documents. You'll receive an email once a decision has been made, typically within 1-2 business days.</p>
    <p>Thank you for your patience!</p>
  `;

  await sendEmail({
    to: email,
    subject: 'Seller Application Received',
    html: getEmailTemplate('Application Received', content),
  });
}

export async function sendApplicationApprovedEmail(
  email: string,
  name: string,
  suiteArea: string,
  suiteNumber: number
) {
  const content = `
    <p>Great news, ${name}!</p>
    <p>Your application to become a verified seller has been approved for <strong>${suiteArea} Suite ${suiteNumber}</strong>.</p>
    <p>You can now create and manage ticket listings for your suite.</p>
  `;

  await sendEmail({
    to: email,
    subject: 'Seller Application Approved!',
    html: getEmailTemplate(
      'Application Approved',
      content,
      `${APP_URL}/sell/new`,
      'Create Your First Listing'
    ),
  });
}

export async function sendApplicationDeniedEmail(
  email: string,
  name: string,
  reason?: string
) {
  const content = `
    <p>Hi ${name},</p>
    <p>After reviewing your application, we're unable to approve your seller account at this time.</p>
    ${reason ? `<p><strong>Reason:</strong> ${reason}</p>` : ''}
    <p>If you believe this is an error or have additional documentation, please reply to this email.</p>
  `;

  await sendEmail({
    to: email,
    subject: 'Seller Application Update',
    html: getEmailTemplate('Application Update', content),
  });
}

export async function sendListingPublishedEmail(
  email: string,
  name: string,
  eventTitle: string,
  listingSlug: string
) {
  const content = `
    <p>Hi ${name},</p>
    <p>Your listing for <strong>${eventTitle}</strong> has been published and is now visible to buyers.</p>
    <p>You can manage your listing, update details, or mark it as sold from your seller dashboard.</p>
  `;

  await sendEmail({
    to: email,
    subject: 'Your Listing is Live',
    html: getEmailTemplate(
      'Listing Published',
      content,
      `${APP_URL}/listings/${listingSlug}`,
      'View Listing'
    ),
  });
}

export async function sendListingExpiringSoonEmail(
  email: string,
  name: string,
  eventTitle: string,
  eventDate: Date,
  listingId: string
) {
  const content = `
    <p>Hi ${name},</p>
    <p>This is a reminder that your event <strong>${eventTitle}</strong> is coming up on ${eventDate.toLocaleDateString()}.</p>
    <p>If your tickets are still available, make sure your listing is up to date. If they've been sold, please mark your listing as sold.</p>
  `;

  await sendEmail({
    to: email,
    subject: `Reminder: ${eventTitle} is Coming Soon`,
    html: getEmailTemplate(
      'Event Reminder',
      content,
      `${APP_URL}/sell/my-listings`,
      'Manage Listings'
    ),
  });
}

export async function sendPasswordResetEmail(email: string, name: string, token: string) {
  const resetUrl = `${APP_URL}/reset-password?token=${token}`;

  const content = `
    <p>Hi ${name},</p>
    <p>We received a request to reset your password. Click the button below to create a new password:</p>
    <p style="color: #6b7280; font-size: 14px; margin-top: 20px;">
      This link will expire in 1 hour. If you didn't request a password reset, you can safely ignore this email.
    </p>
  `;

  await sendEmail({
    to: email,
    subject: 'Reset Your Password',
    html: getEmailTemplate('Reset Your Password', content, resetUrl, 'Reset Password'),
  });
}

export async function sendNewMessageNotification(
  email: string,
  name: string,
  senderName: string,
  eventTitle: string,
  listingSlug: string
) {
  const content = `
    <p>Hi ${name},</p>
    <p>You have a new message from <strong>${senderName}</strong> about your listing for <strong>${eventTitle}</strong>.</p>
    <p>Log in to view and respond to the message.</p>
  `;

  await sendEmail({
    to: email,
    subject: `New Message About Your ${eventTitle} Listing`,
    html: getEmailTemplate(
      'New Message',
      content,
      `${APP_URL}/listings/${listingSlug}`,
      'View Message'
    ),
  });
}
