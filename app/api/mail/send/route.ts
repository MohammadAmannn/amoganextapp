import { handleMailSendPost } from '@amogads/ui/server'

export const dynamic = 'force-dynamic'

export async function POST(request: Request) {
  return handleMailSendPost(request)
}
