import { NextRequest, NextResponse } from 'next/server'
import { getContacts, saveContact } from '@/lib/contact-group-store'

export const runtime = 'nodejs'

export async function GET() {
  try {
    const contacts = await getContacts()
    return NextResponse.json(contacts)
  } catch (err) {
    console.error('GET contacts error:', err)
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Failed to fetch contacts' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    if (!body.fullName || !body.email || !body.mobile || !body.status) {
      return NextResponse.json(
        { error: 'fullName, email, mobile, and status are required fields' },
        { status: 400 }
      )
    }

    const saved = await saveContact(body)
    if (!saved) {
      return NextResponse.json({ error: 'Failed to save contact' }, { status: 500 })
    }

    return NextResponse.json(saved, { status: 201 })
  } catch (err) {
    console.error('POST contact error:', err)
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Internal Server Error' },
      { status: 500 }
    )
  }
}
