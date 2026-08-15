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

  // Format file size
  const formatSize = (bytes: number) => {
    if (!bytes || bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
  };

  // Map attachments to frontend format and save to public/uploads/mail-attachments/
  const attachments = (parsed.attachments || []).map((att: any, idx: number) => {
    const mimeType = att.contentType || "application/octet-stream";
    let fileUrl = "";
    let formattedSize = formatSize(att.size || (att.content ? att.content.length : 0));

    if (att.content) {
      try {
        const buf = Buffer.isBuffer(att.content) ? att.content : Buffer.from(att.content);
        fileUrl = `data:${mimeType};base64,${buf.toString("base64")}`;
      } catch (err) {
        console.error("Error processing attachment:", err);
      }
    }

    return {
      id: `att-${seq}-${idx}`,
      name: att.filename || `attachment-${idx + 1}`,
      type: mimeType,
      size: formattedSize,
      url: fileUrl,
    };
  });

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
    attachments: attachments,
  };
}
