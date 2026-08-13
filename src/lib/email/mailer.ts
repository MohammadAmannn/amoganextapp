import nodemailer from "nodemailer";
import mailConfig from "../../../config/mail.json";

/**
 * Nodemailer is a popular Node.js library that allows server-side code to send emails.
 * It abstracts the complex network protocols and headers required to interact with email servers.
 *
 * SMTP (Simple Mail Transfer Protocol) is the standard protocol used for sending emails across the internet.
 * We connect to Hostinger's SMTP server to relay our emails to their destination.
 *
 * secure: true means we are establishing an encrypted SSL/TLS connection immediately on port 465.
 * This is crucial for protecting the email account credentials and content during transmission.
 *
 * Security: These credentials and SMTP connection logic must remain strictly on the server-side.
 * Exposing mailConfig or the transporter configuration to the client would allow malicious users
 * to extract the password and hijack our Hostinger email account to send spam.
 */
export const transporter = nodemailer.createTransport({
  host: mailConfig.smtp.host,
  port: mailConfig.smtp.port,
  secure: mailConfig.smtp.secure,
  requireTLS: mailConfig.smtp.requireTLS,

  auth: {
    user: mailConfig.email,
    pass: mailConfig.password,
  },
});
