import fs from 'fs'

function printUrlLine() {
  if (fs.existsSync('.env.local')) {
    const lines = fs.readFileSync('.env.local', 'utf8').split('\n')
    const line = lines.find(l => l.includes('NEXT_PUBLIC_SUPABASE_URL'))
    console.log('Raw URL Line in .env.local:', line)
  }
}

printUrlLine()
