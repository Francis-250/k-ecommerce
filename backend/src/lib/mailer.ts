import "dotenv/config";

interface EmailOptions {
  to: string;
  subject: string;
  text: string;
  html?: string;
}

export const sendEmail = async ({ to, subject, text, html }: EmailOptions) => {
  try {
    const senderEmail = process.env.SMTP_FROM || process.env.SMTP_USER || "munyankindifrancois34@gmail.com";
    const apiKey = process.env.BREVO_API_KEY;

    if (!apiKey) {
      throw new Error("BREVO_API_KEY is missing from environment variables");
    }

    const payload: Record<string, any> = {
      sender: { email: senderEmail },
      to: [{ email: to }],
      subject,
    };

    if (text) {
      payload.textContent = text;
    }
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
