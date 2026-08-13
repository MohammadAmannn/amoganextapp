import { NextResponse } from "next/server";
import { createImapClient } from "@/lib/email/imap";
import { parseEmail } from "@/lib/email/email-parser";

export const dynamic = "force-dynamic";

/**
 * GET /api/mail/inbox
 * Connects to Hostinger IMAP server using ImapFlow to fetch the latest 20 emails.
 * Uses mailparser to parse individual email bodies and returns them in a unified format.
 */
export async function GET() {
  const client = createImapClient();

  try {
    // 1. Establish connection to Hostinger IMAP server
    await client.connect();
    console.log("IMAP connection established successfully.");

    // 2. Lock the inbox to safely read the messages list
    const lock = await client.getMailboxLock("INBOX");
    const emailsList: any[] = [];

    try {
      // 3. Query the status to find the total message count
      const status = await client.status("INBOX", { messages: true });
      const totalMessages = status.messages || 0;
      console.log(`Inbox contains ${totalMessages} total messages.`);

      if (totalMessages > 0) {
        // Fetch up to the last 20 emails (messages are 1-indexed)
        const fetchLimit = 20;
        const startSeq = Math.max(1, totalMessages - fetchLimit + 1);
        const endSeq = totalMessages;
        const range = `${startSeq}:${endSeq}`;

        console.log(`Fetching messages in range: ${range}`);

        // Fetch message source (raw MIME contents) and system flags
        for await (const message of client.fetch(range, { source: true, flags: true })) {
          const isRead = message.flags && message.flags.has("\\Seen");
          
          try {
            const parsed = await parseEmail(message.source as Buffer, message.seq, !!isRead);
            emailsList.push(parsed);
          } catch (parseErr) {
            console.error(`Failed to parse email sequence ${message.seq}:`, parseErr);
            // Append a fallback placeholder if parsing fails so the inbox doesn't completely fail
            emailsList.push({
              id: String(message.seq),
              from: "unknown@example.com",
              fromName: "Parsing Error",
              to: "",
              subject: "Failed to parse email content",
              date: new Date().toISOString(),
              text: "Could not parse this message.",
              html: "<p>Could not parse this message.</p>",
              isRead: !!isRead,
            });
          }
        }

        // Sort messages newest first (since IMAP fetch range returns them ascending)
        emailsList.reverse();
      }
    } finally {
      // 4. Ensure lock is released even if fetch errors occur
      lock.release();
    }

    // 5. Safely close connection
    await client.logout();
    console.log("IMAP logged out cleanly.");

    return NextResponse.json({
      success: true,
      emails: emailsList,
    });
  } catch (error: any) {
    console.error("Error reading mailbox via IMAP:", error);
    
    // Always attempt clean logout if client is connected or errored mid-session
    try {
      await client.logout();
    } catch (_) {}

    return NextResponse.json(
      {
        success: false,
        message: `Failed to load inbox emails: ${error.message || error}`,
      },
      { status: 500 }
    );
  }
}
