import { NextResponse } from "next/server";
import { transporter } from "@/lib/email/mailer";
import mailConfig from "../../../../config/mail.json";

/**
 * POST /api/mail/send
 * Sends an email using Nodemailer transporter configured with Hostinger SMTP server credentials.
 * Expects a JSON request body with: to, subject, html.
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { to, subject, html } = body;

    // Simple validation of inputs
    if (!to || !subject || !html) {
      return NextResponse.json(
        {
          success: false,
          message: "Validation failed: 'to', 'subject', and 'html' are required fields.",
        },
        { status: 400 }
      );
    }

    // Configure the mail options
    const mailOptions = {
      from: body.from || `"${mailConfig.email.split("@")[0]}" <${mailConfig.email}>`, // e.g., "admin" <admin@yourdomain.com>
      to: Array.isArray(to) ? to.join(", ") : to, // Handle string or array of recipients
      subject: subject,
      html: html,
    };

    // Send email using SMTP
    const info = await transporter.sendMail(mailOptions);

    console.log("Email sent successfully: %s", info.messageId);

    return NextResponse.json({
      success: true,
      message: "Email sent successfully",
      messageId: info.messageId,
    });
  } catch (error: any) {
    console.error("Error sending email via Nodemailer:", error);

    return NextResponse.json(
      {
        success: false,
        message: `Failed to send email: ${error.message || error}`,
      },
      { status: 500 }
    );
  }
}
