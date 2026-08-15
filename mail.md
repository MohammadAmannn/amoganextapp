# Hostinger Email Integration Documentation

This document explains the architecture, files, configuration, and data flow for the real Hostinger Email integration inside the Messages module. It serves as a guide for developers working on or maintaining this module.

---

## 1. Overview & Architecture

The email integration connects the existing Next.js Messages page with standard **Hostinger Email** services (SMTP for outgoing emails and IMAP for incoming inbox messages).

### Flow Architecture

```
[ Incoming Emails Flow ]
Hostinger IMAP Server (imap.hostinger.com:993 SSL/TLS)
       ↓
src/lib/email/imap.ts (ImapFlow Client)
       ↓
app/api/mail/inbox/route.ts (Next.js API Route)
       ↓
src/lib/email/email-parser.ts (mailparser + DOMParser Sanitizer)
       ↓
src/features/Message/index.tsx (MessageFeature component)
       ↓
EmailList & EmailView Components (UI rendering)

-----------------------------------------------------------

[ Outgoing Emails Flow ]
NewEmail Component (Compose Form: From, To, Cc, Bcc, Subject, Body)
       ↓
POST /api/mail/send
       ↓
src/lib/email/mailer.ts (Nodemailer Transporter)
       ↓
Hostinger SMTP Server (smtp.hostinger.com:587 STARTTLS)
       ↓
Recipient Mailbox
```

---

## 2. File Inventory & Description

Below is the complete list of files created or modified for this feature:

### Backend & Configuration

* [`config/mail.json`](file:///e:/morrai/shadcn-admin-main/config/mail.json)
  * Stores SMTP and IMAP host parameters and mailbox credentials (`ask@morrai.com`).
  * **Note**: Added to `.gitignore` to prevent committing secrets to version control.

* [`src/lib/email/mailer.ts`](file:///e:/morrai/shadcn-admin-main/src/lib/email/mailer.ts)
  * Initializes the Nodemailer transporter using Hostinger SMTP configuration.

* [`src/lib/email/imap.ts`](file:///e:/morrai/shadcn-admin-main/src/lib/email/imap.ts)
  * Configures and creates `ImapFlow` client instances for IMAP mailbox connections.

* [`src/lib/email/email-parser.ts`](file:///e:/morrai/shadcn-admin-main/src/lib/email/email-parser.ts)
  * Uses `mailparser`'s `simpleParser` to convert raw MIME email streams into JSON structures.

* [`app/api/mail/inbox/route.ts`](file:///e:/morrai/shadcn-admin-main/app/api/mail/inbox/route.ts)
  * Next.js API GET route. Connects via IMAP, opens `INBOX`, fetches the 20 most recent messages, parses MIME contents, and returns a JSON payload of emails.

* [`app/api/mail/send/route.ts`](file:///e:/morrai/shadcn-admin-main/app/api/mail/send/route.ts)
  * Next.js API POST route. Accepts recipient details, subject, and HTML body, dispatches outgoing messages via Nodemailer SMTP, and appends a copy to Hostinger IMAP `INBOX.Sent` folder.

* [`app/api/mail/sent/route.ts`](file:///e:/morrai/shadcn-admin-main/app/api/mail/sent/route.ts)
  * Next.js API GET route. Connects via IMAP to Hostinger's `INBOX.Sent` mailbox folder, fetches sent emails, and returns a JSON payload of sent emails.

* [`app/api/mail/test/route.ts`](file:///e:/morrai/shadcn-admin-main/app/api/mail/test/route.ts)
  * Development utility route (`GET /api/mail/test`) to verify SMTP credential validity via `transporter.verify()`.

### Frontend & UI Components

* [`src/features/Message/index.tsx`](file:///e:/morrai/shadcn-admin-main/src/features/Message/index.tsx)
  * Core Messages feature controller.
  * Fetches `/api/mail/inbox` on initial load and populates inbox state.
  * Manages split-pane view, loading states, compose mode toggle, and side panel routing.
  * Displays the normal Messages Inbox page by default on page load.

* [`src/features/Message/components/emails/email-list.tsx`](file:///e:/morrai/shadcn-admin-main/src/features/Message/components/emails/email-list.tsx)
  * Renders the sidebar email list.
  * Includes the **New** compose button adjacent to the search box.
  * Renders inbox loading spinner, error states (`Unable to load emails`), and empty state messages.

* [`src/features/Message/components/emails/new-email.tsx`](file:///e:/morrai/shadcn-admin-main/src/features/Message/components/emails/new-email.tsx)
  * Compose window component.
  * Pre-fills `From` with `ask@morrai.com`.
  * Provides input boxes for `To`, `Cc`, and `Bcc` allowing custom recipient address typing.
  * Manages the Send button loading state (`Sending...`) and triggers success/error notifications using `sonner` toast.

* [`src/features/Message/components/emails/email-view.tsx`](file:///e:/morrai/shadcn-admin-main/src/features/Message/components/emails/email-view.tsx)
  * Displays open email details.
  * Contains a client-side `DOMParser` HTML sanitizer to strip malicious `<script>` tags or event handlers from external email bodies.

---

## 3. Hostinger Email Settings Summary

For `ask@morrai.com`:

| Protocol | Server Host | Port | Security / Encryption |
|---|---|---|---|
| **IMAP (Incoming)** | `imap.hostinger.com` | `993` | SSL / TLS (`secure: true`) |
| **SMTP (Outgoing)** | `smtp.hostinger.com` | `587` | STARTTLS (`secure: false`, `requireTLS: true`) |

---

## 4. How to Test or Maintain

1. **Test Connection API**:
   Open `http://localhost:3000/api/mail/test` in your browser. It returns `{ "success": true, "message": "SMTP connection successful" }`.
2. **Send Email**:
   Navigate to `/message`, click **New**, type recipient email in **To**, add subject & body, and click **Send**.
3. **Receive Email**:
   Send an email to `ask@morrai.com` from an external account. Load `/message` to see the message fetched into the list.
