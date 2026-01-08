import { NextResponse } from 'next/server';
import { sendEmailViaBrevo } from '@/app/server/utils/brevoEmailService';

/**
 * Test email sending
 * POST /api/admin/test-email
 * 
 * Body: {
 *   email: "recipient@example.com",
 *   subject: "Test Email"
 * }
 */
export async function POST(req) {
  try {
    const { email, subject = 'Test Email from Modest Cargo' } = await req.json();

    if (!email) {
      return NextResponse.json(
        { success: false, error: 'Email address required' },
        { status: 400 }
      );
    }

    console.log('🧪 Testing email send to:', email);

    const testContent = `
      <p>Hello,</p>
      <p>This is a test email from Modest Cargo email service.</p>
      <p><strong>Sent at:</strong> ${new Date().toLocaleString()}</p>
      <p>If you received this email, the email service is working correctly.</p>
      <p>Best regards,<br>Modest Cargo Team</p>
    `;

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; background: #f5f5f5; }
          .content { background: white; padding: 20px; border-radius: 8px; }
          .header { color: #dc6420; font-size: 24px; font-weight: bold; margin-bottom: 20px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="content">
            <div class="header">✓ Email Service Test</div>
            ${testContent}
          </div>
        </div>
      </body>
      </html>
    `;

    const result = await sendEmailViaBrevo({
      to: email,
      subject: subject,
      htmlContent: htmlContent,
      senderEmail: process.env.BREVO_SENDER_EMAIL,
      senderName: process.env.BREVO_SENDER_NAME || 'Modest Cargo',
    });

    console.log('✓ Test email result:', result);

    if (result.success) {
      return NextResponse.json(
        {
          success: true,
          message: `Test email sent successfully to ${email}`,
          messageId: result.messageId,
        },
        { status: 200 }
      );
    } else {
      return NextResponse.json(
        {
          success: false,
          error: result.error || 'Failed to send test email',
          details: result.details,
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('❌ Test email error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message,
      },
      { status: 500 }
    );
  }
}

/**
 * GET method to check email configuration
 */
export async function GET(req) {
  try {
    const apiKey = process.env.BREVO_API_KEY;
    const senderEmail = process.env.BREVO_SENDER_EMAIL;
    const adminEmail = process.env.ADMIN_EMAIL || process.env.ADMIN_NOTIFICATION_EMAIL;

    return NextResponse.json(
      {
        success: true,
        config: {
          brevoConfigured: !!apiKey,
          brevoApiKeySet: !!apiKey,
          senderEmailConfigured: !!senderEmail,
          senderEmail: senderEmail,
          adminEmailConfigured: !!adminEmail,
          adminEmail: adminEmail,
          appUrl: process.env.NEXT_PUBLIC_APP_URL,
        },
        message: 'Email configuration status',
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('❌ Config check error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message,
      },
      { status: 500 }
    );
  }
}
