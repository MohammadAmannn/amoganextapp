import { NextResponse } from "next/server";
import { createImapClient } from "@/lib/email/imap";
import { parseEmail } from "@/lib/email/email-parser";

export const dynamic = "force-dynamic";

/**
 * GET /api/mail/sent
 * Connects to Hostinger IMAP server using ImapFlow to fetch the latest sent emails from INBOX.Sent folder.
 * Uses mailparser to parse individual email bodies and returns them in a unified format.
 */
export async function GET(request: Request) {
  const url = new URL(request.url);
  const page = Math.max(1, parseInt(url.searchParams.get("page") || "1", 10));
  const limit = Math.max(1, parseInt(url.searchParams.get("limit") || "20", 10));

  const client = createImapClient();
  let hasMore = false;
  let totalMessages = 0;

  try {
    await client.connect();

    let mailboxName = "INBOX.Sent";
    let lock;

    try {
      lock = await client.getMailboxLock(mailboxName);
    } catch (_) {
      // Fallback if folder is named "Sent"
      mailboxName = "Sent";
      lock = await client.getMailboxLock(mailboxName);
    }

    const emailsList: any[] = [];

    try {
      const status = await client.status(mailboxName, { messages: true });
      totalMessages = status.messages || 0;

      if (totalMessages > 0) {
        const offset = (page - 1) * limit;
        const endSeq = Math.max(0, totalMessages - offset);
        const startSeq = Math.max(1, endSeq - limit + 1);

        if (endSeq >= 1) {
          const range = `${startSeq}:${endSeq}`;
          hasMore = startSeq > 1;

          for await (const message of client.fetch(range, { source: true, flags: true })) {
            const isRead = message.flags && message.flags.has("\\Seen");

            try {
              const parsed = await parseEmail(message.source as Buffer, message.seq, true);
              // Ensure email recipient details are mapped for sent view
              emailsList.push({
                ...parsed,
                isSent: true,
              });
            } catch (parseErr) {
              console.error(`Failed to parse sent email sequence ${message.seq}:`, parseErr);
            }
          }

          emailsList.reverse();
        }
      }
    } finally {
      if (lock) {
        lock.release();
      }
    }

    await client.logout();

    return NextResponse.json({
      success: true,
      emails: emailsList,
      hasMore,
      total: totalMessages,
      page,
      limit,
    });
  } catch (error: any) {
    console.error("Error reading sent mailbox via IMAP:", error);

    try {
      await client.logout();
    } catch (_) {}

    return NextResponse.json(
      {
        success: false,
        message: `Failed to load sent emails: ${error.message || error}`,
      },
      { status: 500 }
    );
  }
}
