import fs from "fs";
import path from "path";

const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads", "mail-attachments");

function ensureDirectoryExists() {
  if (!fs.existsSync(UPLOAD_DIR)) {
    fs.mkdirSync(UPLOAD_DIR, { recursive: true });
  }
}

function formatSize(bytes: number): string {
  if (!bytes || bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
}

/**
 * Saves attachment file buffer to public/uploads/mail-attachments/
 * and returns the relative public URL and formatted size.
 */
export function saveAttachmentLocally(
  originalFilename: string,
  content: Buffer | Uint8Array | string
): { url: string; size: string } {
  try {
    ensureDirectoryExists();

    const sanitizeName = (originalFilename || "attachment")
      .replace(/[^a-zA-Z0-9._-]/g, "_")
      .substring(0, 100);

    const timestamp = Date.now();
    const safeFilename = `${timestamp}_${sanitizeName}`;
    const filePath = path.join(UPLOAD_DIR, safeFilename);

    let buffer: Buffer;
    if (Buffer.isBuffer(content)) {
      buffer = content;
    } else if (typeof content === "string") {
      let raw = content;
      if (raw.includes(";base64,")) {
        raw = raw.split(";base64,").pop() || "";
      }
      buffer = Buffer.from(raw, "base64");
    } else {
      buffer = Buffer.from(content);
    }

    fs.writeFileSync(filePath, buffer);

    const publicUrl = `/uploads/mail-attachments/${safeFilename}`;
    const formattedSize = formatSize(buffer.length);

    return {
      url: publicUrl,
      size: formattedSize,
    };
  } catch (err) {
    console.error("Failed to save attachment locally:", err);
    return {
      url: "",
      size: "0 B",
    };
  }
}
