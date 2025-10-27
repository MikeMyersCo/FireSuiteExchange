import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { sendEmail } from '@/lib/notifications/email';

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    const body = await request.json();

    const { title, description, steps, userEmail, url, userAgent } = body;

    if (!title || !description) {
      return NextResponse.json(
        { error: 'Title and description are required' },
        { status: 400 }
      );
    }

    // Use session email if available, otherwise require userEmail
    const reporterEmail = session?.user?.email || userEmail;
    if (!reporterEmail) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    // Prepare email content
    const emailHtml = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Bug Report</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 700px;
      margin: 0 auto;
      padding: 20px;
      background-color: #f4f4f4;
    }
    .container {
      background-color: #ffffff;
      border-radius: 8px;
      padding: 30px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    .header {
      background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
      color: white;
      padding: 20px;
      border-radius: 8px 8px 0 0;
      margin: -30px -30px 20px -30px;
    }
    .header h1 {
      margin: 0;
      font-size: 24px;
      display: flex;
      align-items: center;
      gap: 10px;
    }
    .section {
      margin-bottom: 25px;
      padding-bottom: 20px;
      border-bottom: 1px solid #e5e7eb;
    }
    .section:last-child {
      border-bottom: none;
    }
    .label {
      font-weight: bold;
      color: #6b7280;
      font-size: 12px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin-bottom: 8px;
    }
    .content {
      color: #1f2937;
      background: #f9fafb;
      padding: 12px;
      border-radius: 6px;
      border-left: 3px solid #ef4444;
    }
    .metadata {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 15px;
      background: #f9fafb;
      padding: 15px;
      border-radius: 6px;
    }
    .metadata-item {
      display: flex;
      flex-direction: column;
    }
    .metadata-label {
      font-size: 11px;
      color: #6b7280;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin-bottom: 4px;
    }
    .metadata-value {
      color: #1f2937;
      font-size: 14px;
      word-break: break-all;
    }
    .footer {
      text-align: center;
      margin-top: 30px;
      padding-top: 20px;
      border-top: 2px solid #e5e7eb;
      font-size: 12px;
      color: #6b7280;
    }
    pre {
      background: #1f2937;
      color: #f3f4f6;
      padding: 15px;
      border-radius: 6px;
      overflow-x: auto;
      font-size: 13px;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🐛 New Bug Report</h1>
    </div>

    <div class="section">
      <div class="label">Bug Title</div>
      <div class="content">
        <strong>${title}</strong>
      </div>
    </div>

    <div class="section">
      <div class="label">Description</div>
      <div class="content">
        ${description.replace(/\n/g, '<br>')}
      </div>
    </div>

    ${steps ? `
    <div class="section">
      <div class="label">Steps to Reproduce</div>
      <div class="content">
        ${steps.replace(/\n/g, '<br>')}
      </div>
    </div>
    ` : ''}

    <div class="section">
      <div class="label">Reporter & Environment</div>
      <div class="metadata">
        <div class="metadata-item">
          <div class="metadata-label">Reported By</div>
          <div class="metadata-value">${reporterEmail}</div>
        </div>
        <div class="metadata-item">
          <div class="metadata-label">User Status</div>
          <div class="metadata-value">${session ? `Logged in as ${session.user?.role}` : 'Not logged in'}</div>
        </div>
        <div class="metadata-item">
          <div class="metadata-label">Page URL</div>
          <div class="metadata-value">${url || 'Not provided'}</div>
        </div>
        <div class="metadata-item">
          <div class="metadata-label">Timestamp</div>
          <div class="metadata-value">${new Date().toLocaleString()}</div>
        </div>
      </div>
    </div>

    ${userAgent ? `
    <div class="section">
      <div class="label">User Agent</div>
      <pre>${userAgent}</pre>
    </div>
    ` : ''}

    <div class="footer">
      <p><strong>Fire Suite Exchange - Bug Tracking System</strong></p>
      <p>This bug report was automatically generated and sent to suitekeep25@gmail.com</p>
    </div>
  </div>
</body>
</html>
    `.trim();

    const emailText = `
BUG REPORT

Title: ${title}

Description:
${description}

${steps ? `Steps to Reproduce:\n${steps}\n` : ''}

Reporter: ${reporterEmail}
User Status: ${session ? `Logged in as ${session.user?.role}` : 'Not logged in'}
Page URL: ${url || 'Not provided'}
Timestamp: ${new Date().toLocaleString()}

${userAgent ? `User Agent: ${userAgent}` : ''}
    `.trim();

    // Send email to suitekeep25@gmail.com
    await sendEmail({
      to: 'suitekeep25@gmail.com',
      subject: `🐛 Bug Report: ${title}`,
      html: emailHtml,
      text: emailText,
    });

    return NextResponse.json({
      success: true,
      message: 'Bug report submitted successfully',
    });
  } catch (error) {
    console.error('Error submitting bug report:', error);
    return NextResponse.json(
      { error: 'Failed to submit bug report' },
      { status: 500 }
    );
  }
}
