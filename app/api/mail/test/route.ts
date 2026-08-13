import { NextResponse } from "next/server";
import { transporter } from "@/lib/email/mailer";

// Force Next.js App Router to evaluate this route dynamically (not static optimization)
export const dynamic = "force-dynamic";

/**
 * GET /api/mail/test
 * Verifies the SMTP connection parameters with Hostinger SMTP server using transporter.verify().
 * This endpoint is only for development/testing and should be removed or secured in production.
 */
export async function GET() {
  try {
    // transporter.verify() checks if our host, port, and auth credentials can successfully log in.
    await transporter.verify();
    
    return NextResponse.json({
      success: true,
      message: "SMTP connection successful",
    });
  } catch (error: any) {
    console.error("SMTP verification error:", error);
    
    return NextResponse.json(
      {
        success: false,
        message: `SMTP connection failed: ${error.message || error}`,
      },
      { status: 500 }
    );
  }
}
