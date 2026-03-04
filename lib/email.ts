import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

const FROM_EMAIL = 'Free Church Texting <noreply@free.churchposting.com>';

export interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export async function sendEmail(options: EmailOptions) {
  try {
    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: options.to,
      subject: options.subject,
      html: options.html,
      text: options.text,
    });

    if (error) {
      console.error('Email send error:', error);
      return { success: false, error: error.message };
    }

    return { success: true, data };
  } catch (error) {
    console.error('Email send exception:', error);
    return { success: false, error: 'Failed to send email' };
  }
}

export function getWelcomeEmailHtml(name: string, churchName: string): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Welcome to Free Church Texting</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f8fafc;">
      <table role="presentation" style="width: 100%; border-collapse: collapse;">
        <tr>
          <td style="padding: 40px 20px;">
            <table role="presentation" style="max-width: 560px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);">
              <tr>
                <td style="padding: 40px;">
                  <div style="text-align: center; margin-bottom: 32px;">
                    <h1 style="margin: 0; font-size: 24px; font-weight: 600; color: #111827;">Welcome to Free Church Texting!</h1>
                  </div>
                  
                  <p style="margin: 0 0 16px; font-size: 16px; line-height: 24px; color: #4b5563;">
                    Hi ${name},
                  </p>
                  
                  <p style="margin: 0 0 16px; font-size: 16px; line-height: 24px; color: #4b5563;">
                    Thank you for signing up <strong>${churchName}</strong> with Free Church Texting. We're excited to help you connect with your congregation!
                  </p>
                  
                  <p style="margin: 0 0 24px; font-size: 16px; line-height: 24px; color: #4b5563;">
                    Here's what you can do now:
                  </p>
                  
                  <ul style="margin: 0 0 24px; padding-left: 24px; font-size: 16px; line-height: 28px; color: #4b5563;">
                    <li>Connect your Twilio account</li>
                    <li>Choose a phone number for your church</li>
                    <li>Import your contacts</li>
                    <li>Start texting your congregation</li>
                  </ul>
                  
                  <div style="text-align: center; margin: 32px 0;">
                    <a href="https://freechurchtexting.com/login" style="display: inline-block; padding: 14px 32px; background-color: #111827; color: #ffffff; text-decoration: none; border-radius: 8px; font-weight: 500; font-size: 16px;">Get Started</a>
                  </div>
                  
                  <p style="margin: 0; font-size: 14px; line-height: 22px; color: #6b7280;">
                    Questions? Just reply to this email or visit <a href="https://churchposting.com" style="color: #C28C88; text-decoration: none;">churchposting.com</a>.
                  </p>
                </td>
              </tr>
              <tr>
                <td style="padding: 24px 40px; background-color: #f9fafb; border-radius: 0 0 16px 16px;">
                  <p style="margin: 0; font-size: 12px; color: #9ca3af; text-align: center;">
                    Free Church Texting by Church Posting<br>
                    <a href="https://freechurchtexting.com" style="color: #6b7280; text-decoration: none;">freechurchtexting.com</a>
                  </p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;
}

export function getPasswordResetEmailHtml(name: string, resetLink: string): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Reset Your Password</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f8fafc;">
      <table role="presentation" style="width: 100%; border-collapse: collapse;">
        <tr>
          <td style="padding: 40px 20px;">
            <table role="presentation" style="max-width: 560px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);">
              <tr>
                <td style="padding: 40px;">
                  <div style="text-align: center; margin-bottom: 32px;">
                    <h1 style="margin: 0; font-size: 24px; font-weight: 600; color: #111827;">Reset Your Password</h1>
                  </div>
                  
                  <p style="margin: 0 0 16px; font-size: 16px; line-height: 24px; color: #4b5563;">
                    Hi ${name},
                  </p>
                  
                  <p style="margin: 0 0 24px; font-size: 16px; line-height: 24px; color: #4b5563;">
                    We received a request to reset your password for Free Church Texting. Click the button below to create a new password:
                  </p>
                  
                  <div style="text-align: center; margin: 32px 0;">
                    <a href="${resetLink}" style="display: inline-block; padding: 14px 32px; background-color: #111827; color: #ffffff; text-decoration: none; border-radius: 8px; font-weight: 500; font-size: 16px;">Reset Password</a>
                  </div>
                  
                  <p style="margin: 0 0 16px; font-size: 14px; line-height: 22px; color: #6b7280;">
                    This link will expire in 1 hour for security reasons.
                  </p>
                  
                  <p style="margin: 0; font-size: 14px; line-height: 22px; color: #6b7280;">
                    If you didn't request a password reset, you can safely ignore this email. Your password will remain unchanged.
                  </p>
                </td>
              </tr>
              <tr>
                <td style="padding: 24px 40px; background-color: #f9fafb; border-radius: 0 0 16px 16px;">
                  <p style="margin: 0; font-size: 12px; color: #9ca3af; text-align: center;">
                    Free Church Texting by Church Posting<br>
                    <a href="https://freechurchtexting.com" style="color: #6b7280; text-decoration: none;">freechurchtexting.com</a>
                  </p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;
}

export function getTeamInviteEmailHtml(inviterName: string, churchName: string, inviteLink: string): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>You've Been Invited</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f8fafc;">
      <table role="presentation" style="width: 100%; border-collapse: collapse;">
        <tr>
          <td style="padding: 40px 20px;">
            <table role="presentation" style="max-width: 560px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);">
              <tr>
                <td style="padding: 40px;">
                  <div style="text-align: center; margin-bottom: 32px;">
                    <h1 style="margin: 0; font-size: 24px; font-weight: 600; color: #111827;">You've Been Invited!</h1>
                  </div>
                  
                  <p style="margin: 0 0 16px; font-size: 16px; line-height: 24px; color: #4b5563;">
                    <strong>${inviterName}</strong> has invited you to join <strong>${churchName}</strong> on Free Church Texting.
                  </p>
                  
                  <p style="margin: 0 0 24px; font-size: 16px; line-height: 24px; color: #4b5563;">
                    Accept the invitation to start helping manage your church's text messaging.
                  </p>
                  
                  <div style="text-align: center; margin: 32px 0;">
                    <a href="${inviteLink}" style="display: inline-block; padding: 14px 32px; background-color: #111827; color: #ffffff; text-decoration: none; border-radius: 8px; font-weight: 500; font-size: 16px;">Accept Invitation</a>
                  </div>
                  
                  <p style="margin: 0; font-size: 14px; line-height: 22px; color: #6b7280;">
                    This invitation will expire in 7 days.
                  </p>
                </td>
              </tr>
              <tr>
                <td style="padding: 24px 40px; background-color: #f9fafb; border-radius: 0 0 16px 16px;">
                  <p style="margin: 0; font-size: 12px; color: #9ca3af; text-align: center;">
                    Free Church Texting by Church Posting<br>
                    <a href="https://freechurchtexting.com" style="color: #6b7280; text-decoration: none;">freechurchtexting.com</a>
                  </p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;
}

const ADMIN_EMAILS = ['willbham16@gmail.com', 'admin@churchposting.com'];

export async function sendAdminNotification(subject: string, html: string) {
  try {
    await Promise.all(
      ADMIN_EMAILS.map((email) =>
        sendEmail({ to: email, subject, html })
      )
    );
  } catch (error) {
    console.error('Failed to send admin notification:', error);
  }
}

export function getScheduledMessageReminderHtml(churchName: string, messagePreview: string, recipientCount: number, scheduledTime: string): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Scheduled Message Sent</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f8fafc;">
      <table role="presentation" style="width: 100%; border-collapse: collapse;">
        <tr>
          <td style="padding: 40px 20px;">
            <table role="presentation" style="max-width: 560px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);">
              <tr>
                <td style="padding: 40px;">
                  <div style="text-align: center; margin-bottom: 32px;">
                    <div style="display: inline-block; width: 48px; height: 48px; background-color: #d1fae5; border-radius: 50%; line-height: 48px; margin-bottom: 16px;">
                      <span style="font-size: 24px;">✓</span>
                    </div>
                    <h1 style="margin: 0; font-size: 24px; font-weight: 600; color: #111827;">Scheduled Message Sent!</h1>
                  </div>
                  
                  <p style="margin: 0 0 16px; font-size: 16px; line-height: 24px; color: #4b5563;">
                    Your scheduled message for <strong>${churchName}</strong> has been sent successfully.
                  </p>
                  
                  <div style="margin: 24px 0; padding: 16px; background-color: #f3f4f6; border-radius: 8px;">
                    <p style="margin: 0 0 8px; font-size: 12px; font-weight: 600; color: #6b7280; text-transform: uppercase;">Message Preview</p>
                    <p style="margin: 0; font-size: 14px; line-height: 22px; color: #374151;">${messagePreview}</p>
                  </div>
                  
                  <div style="display: flex; justify-content: space-between; margin: 24px 0;">
                    <div>
                      <p style="margin: 0; font-size: 12px; color: #6b7280;">Recipients</p>
                      <p style="margin: 0; font-size: 18px; font-weight: 600; color: #111827;">${recipientCount}</p>
                    </div>
                    <div>
                      <p style="margin: 0; font-size: 12px; color: #6b7280;">Sent At</p>
                      <p style="margin: 0; font-size: 18px; font-weight: 600; color: #111827;">${scheduledTime}</p>
                    </div>
                  </div>
                  
                  <div style="text-align: center; margin-top: 32px;">
                    <a href="https://freechurchtexting.com/messages" style="display: inline-block; padding: 14px 32px; background-color: #111827; color: #ffffff; text-decoration: none; border-radius: 8px; font-weight: 500; font-size: 16px;">View Message History</a>
                  </div>
                </td>
              </tr>
              <tr>
                <td style="padding: 24px 40px; background-color: #f9fafb; border-radius: 0 0 16px 16px;">
                  <p style="margin: 0; font-size: 12px; color: #9ca3af; text-align: center;">
                    Free Church Texting by Church Posting<br>
                    <a href="https://freechurchtexting.com" style="color: #6b7280; text-decoration: none;">freechurchtexting.com</a>
                  </p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;
}
