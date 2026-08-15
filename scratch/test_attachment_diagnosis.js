async function diagnose() {
  console.log("=== DIAGNOSING INBOX ATTACHMENTS ===");
  try {
    const resInbox = await fetch("http://localhost:3000/api/mail/inbox?page=1&limit=5");
    const dataInbox = await resInbox.json();
    console.log("Inbox Success:", dataInbox.success);
    if (dataInbox.emails) {
      dataInbox.emails.forEach((email, idx) => {
        console.log(`\nEmail #${idx + 1}: ${email.subject} (ID: ${email.id})`);
        console.log(`From: ${email.from}, Attachments Count: ${email.attachments ? email.attachments.length : 0}`);
        if (email.attachments && email.attachments.length > 0) {
          email.attachments.forEach((att, aIdx) => {
            console.log(`  Attachment #${aIdx + 1}:`, {
              id: att.id,
              name: att.name,
              type: att.type,
              size: att.size,
              urlLength: att.url ? att.url.length : 0,
              urlPreview: att.url ? att.url.substring(0, 80) : "EMPTY",
            });
          });
        }
      });
    }
  } catch (err) {
    console.error("Inbox test failed:", err);
  }

  console.log("\n=== DIAGNOSING SENT ATTACHMENTS ===");
  try {
    const resSent = await fetch("http://localhost:3000/api/mail/sent?page=1&limit=5");
    const dataSent = await resSent.json();
    console.log("Sent Success:", dataSent.success);
    if (dataSent.emails) {
      dataSent.emails.forEach((email, idx) => {
        console.log(`\nSent Email #${idx + 1}: ${email.subject} (ID: ${email.id})`);
        console.log(`To: ${email.to}, Attachments Count: ${email.attachments ? email.attachments.length : 0}`);
        if (email.attachments && email.attachments.length > 0) {
          email.attachments.forEach((att, aIdx) => {
            console.log(`  Attachment #${aIdx + 1}:`, {
              id: att.id,
              name: att.name,
              type: att.type,
              size: att.size,
              urlLength: att.url ? att.url.length : 0,
              urlPreview: att.url ? att.url.substring(0, 80) : "EMPTY",
            });
          });
        }
      });
    }
  } catch (err) {
    console.error("Sent test failed:", err);
  }
}

diagnose();
