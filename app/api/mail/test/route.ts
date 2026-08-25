import { handleMailTestGet } from '@amogads/ui/server'

export const dynamic = 'force-dynamic'

export async function GET() {
  return handleMailTestGet()
}
