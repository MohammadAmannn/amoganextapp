import { ImapFlow } from "imapflow";
import mailConfig from "../../../config/mail.json";

/**
 * IMAP (Internet Message Access Protocol) is used to access and read emails stored on a mail server.
 * Unlike SMTP, which is purely for sending emails, IMAP allows us to fetch, search, and manage messages in the inbox.
 *
 * ImapFlow is a modern, high-performance library for Node.js to communicate with IMAP servers.
 *
 * secure: true ensures that our connection to the Hostinger IMAP server on port 993 is encrypted
 * using SSL/TLS, keeping the email content and access credentials secure.
 *
 * SMTP = sending emails
 * IMAP = reading/receiving emails
 */
export function createImapClient() {
  return new ImapFlow({
    host: mailConfig.imap.host,
    port: mailConfig.imap.port,
    secure: mailConfig.imap.secure,
    auth: {
      user: mailConfig.email,
      pass: mailConfig.password,
    },
    // Hostinger and some other providers benefit from lower concurrency/logger configurations
    logger: false,
  });
}
