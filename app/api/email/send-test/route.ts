import { NextRequest, NextResponse } from 'next/server'
import nodemailer from 'nodemailer'

export const runtime = 'nodejs'

export async function POST(request: NextRequest) {
  try {
    const { to, subject, html } = await request.json()
    if (!to || !subject || !html) {
      return NextResponse.json({ error: 'Missing parameters (to, subject, html)' }, { status: 400 })
    }

    const host = process.env.SMTP_HOST
    const port = process.env.SMTP_PORT
    const user = process.env.SMTP_USER
    const pass = process.env.SMTP_PASS
    const from = process.env.SMTP_FROM || 'MailMind <test@mailmind.com>'

    // Fallback: If no SMTP details are configured, simulate sending
    if (!host || !user || !pass) {
      console.warn('⚠️ SMTP settings are missing. Simulating sending email to:', to)
      // Wait a tiny bit to mock dispatch latency
      await new Promise(resolve => setTimeout(resolve, 800))
      return NextResponse.json({
        success: true,
        message: `Test email simulated successfully! (To send real emails, define SMTP_HOST, SMTP_USER, and SMTP_PASS in your .env file).`,
        mocked: true,
      })
    }

    // Initialize SMTP Transporter
    const transporter = nodemailer.createTransport({
      host,
      port: parseInt(port || '587', 10),
      secure: port === '465',
      auth: {
        user,
        pass,
      },
    })

    // Send email
    const info = await transporter.sendMail({
      from,
      to,
      subject,
      html,
    })

    return NextResponse.json({
      success: true,
      message: `Test email sent successfully to ${to}! Message ID: ${info.messageId}`,
      mocked: false,
    })
  } catch (err) {
    console.error('Test email sending exception:', err)
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Internal Server Error' },
      { status: 500 }
    )
  }
}
