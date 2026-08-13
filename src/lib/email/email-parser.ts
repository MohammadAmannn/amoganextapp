import { simpleParser } from "mailparser";

/**
 * Parses a raw email buffer/stream using the mailparser library.
 * mailparser extracts headers, plain text, HTML, and other metadata from MIME messages.
 *
 * @param source Raw email MIME content (Buffer or Stream)
 * @param seq Sequence number or UID of the message on the IMAP server
 * @param isRead Flag indicating if the message has been marked as read (\Seen flag)
 */
export async function parseEmail(source: Buffer, seq: number, isRead: boolean) {
  const parsed = await simpleParser(source);

  // Extract from address
  let fromAddress = "";
  const fromObj = parsed.from as any;
  if (fromObj && fromObj.value && fromObj.value.length > 0) {
    const fromVal = fromObj.value[0];
    fromAddress = fromVal.address || fromVal.name || "";
  }

  // Extract to address
  let toAddress = "";
  const toObj = parsed.to as any;
  if (toObj && toObj.value && toObj.value.length > 0) {
    const toVal = toObj.value[0];
    toAddress = toVal.address || toVal.name || "";
  }

  return {
    id: String(seq),
    from: fromAddress,
    fromName: parsed.from?.text || fromAddress,
    to: toAddress,
    subject: parsed.subject || "(No Subject)",
    date: parsed.date ? parsed.date.toISOString() : new Date().toISOString(),
    text: parsed.text || "",
    html: parsed.html || parsed.textAsHtml || "",
    isRead: isRead,
  };
}
