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

    // Parse attachments if any were included and save locally
    const { saveAttachmentLocally } = await import("@/lib/email/attachment-storage");

    const attachments = (body.attachments || []).map((att: any) => {
      let rawContent = att.content || att.url || "";
      const filename = att.filename || att.name || "attachment";
      const contentType = att.contentType || att.type || "application/octet-stream";

      const saved = saveAttachmentLocally(filename, rawContent);

      if (rawContent.includes(";base64,")) {
        rawContent = rawContent.split(";base64,").pop() || "";
      }

      return {
        filename,
        contentType,
        content: Buffer.from(rawContent, "base64"),
        url: saved.url,
        size: saved.size,
      };
    });

    // Configure the mail options
    const mailOptions: any = {
      from: body.from || `"${mailConfig.email.split("@")[0]}" <${mailConfig.email}>`,
      to: Array.isArray(to) ? to.join(", ") : to,
      subject: subject,
      html: html,
    };

    if (attachments.length > 0) {
      mailOptions.attachments = attachments;
    }

    // Send email using SMTP
    const info = await transporter.sendMail(mailOptions);

    console.log("Email sent successfully: %s", info.messageId);

    // Save copy to Hostinger IMAP INBOX.Sent folder with full attachments
    try {
      const MailComposer = require("nodemailer/lib/mail-composer");
      const composer = new MailComposer(mailOptions);
      const rawMimeBuffer = await composer.compile().build();

      const { createImapClient } = await import("@/lib/email/imap");
      const client = createImapClient();
      await client.connect();
      await client.append("INBOX.Sent", rawMimeBuffer, ["\\Seen"]);
      await client.logout();
      console.log("Appended sent email with attachments to Hostinger INBOX.Sent folder.");
    } catch (imapErr) {
      console.warn("Could not save to IMAP INBOX.Sent:", imapErr);
    }

    const returnedAttachments = attachments.map((att: any, idx: number) => ({
      id: `sent-att-${Date.now()}-${idx}`,
      name: att.filename,
      type: att.contentType,
      size: att.size,
      url: att.url,
    }));

    return NextResponse.json({
      success: true,
      message: "Email sent successfully",
      messageId: info.messageId,
      attachments: returnedAttachments,
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
