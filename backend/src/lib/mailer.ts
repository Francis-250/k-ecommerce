import "dotenv/config";

interface EmailOptions {
  to: string;
  subject: string;
  text: string;
  html?: string;
}

export function generateOtpEmailHtml(otp: string, title = "Verification Code") {
  return `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title}</title>
  </head>
  <body style="margin: 0; padding: 0; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #f4f6f8; color: #333333;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #f4f6f8; padding: 40px 20px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" style="max-width: 500px; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 15px rgba(0,0,0,0.08);">
            <!-- Header -->
            <tr>
              <td style="background-color: #111827; padding: 30px; text-align: center;">
                <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 700; letter-spacing: 1px;">I-RAS STORE</h1>
              </td>
            </tr>
            <!-- Content -->
            <tr>
              <td style="padding: 40px 30px; text-align: center;">
                <h2 style="margin: 0 0 16px 0; color: #111827; font-size: 20px;">${title}</h2>
                <p style="margin: 0 0 24px 0; color: #6b7280; font-size: 15px; line-height: 1.5;">
                  Use the verification code below to complete your authentication. This code will expire shortly.
                </p>
                <!-- OTP Box -->
                <div style="background-color: #f8fafc; border: 2px dashed #cbd5e1; border-radius: 8px; padding: 20px; margin: 0 auto 24px auto; display: inline-block;">
                  <span style="font-family: 'Courier New', Courier, monospace; font-size: 36px; font-weight: 800; letter-spacing: 8px; color: #0f172a;">${otp}</span>
                </div>
                <p style="margin: 0; color: #9ca3af; font-size: 13px;">
                  If you did not request this email, please ignore it or contact support.
                </p>
              </td>
            </tr>
            <!-- Footer -->
            <tr>
              <td style="background-color: #f9fafb; padding: 20px; text-align: center; border-top: 1px solid #f3f4f6;">
                <p style="margin: 0; color: #9ca3af; font-size: 12px;">
                  &copy; ${new Date().getFullYear()} I-RAS Store. All rights reserved.
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

export const sendEmail = async ({ to, subject, text, html }: EmailOptions) => {
  try {
    const senderEmail = process.env.SMTP_FROM || process.env.SMTP_USER || "munyankindif0@gmail.com";
    const senderName = process.env.SMTP_FROM_NAME || "I-RAS Store";
    const apiKey = process.env.BREVO_API_KEY;

    if (!apiKey) {
      throw new Error("BREVO_API_KEY is missing from environment variables");
    }

    const payload: Record<string, any> = {
      sender: { name: senderName, email: senderEmail },
      replyTo: { name: senderName, email: senderEmail },
      to: [{ email: to }],
      subject,
      textContent: text,
    };

    if (html) {
      payload.htmlContent = html;
    }

    const response = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        accept: "application/json",
        "api-key": apiKey,
        "content-type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const data = (await response.json()) as { messageId?: string; message?: string; code?: string };

    if (!response.ok) {
      throw new Error(data.message || `Brevo API returned status ${response.status}`);
    }

    console.log("Email sent successfully via Brevo API:", data.messageId);
    return data;
  } catch (error) {
    console.error("Error sending email via Brevo:", error);
    throw error;
  }
};

