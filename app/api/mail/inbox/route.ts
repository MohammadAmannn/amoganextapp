import { handleMailInboxGet } from '@amogads/ui/server'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  return handleMailInboxGet(request)
}
