import fs from 'fs'
import path from 'path'

function loadEnv() {
  const envPath = path.resolve(process.cwd(), '.env')
  if (fs.existsSync(envPath)) {
    const content = fs.readFileSync(envPath, 'utf8')
    for (const line of content.split('\n')) {
      const trimmed = line.trim()
      if (trimmed && !trimmed.startsWith('#')) {
        const parts = trimmed.split('=')
        const key = parts[0].trim()
        const value = parts.slice(1).join('=').trim()
        process.env[key] = value.replace(/^"(.*)"$/, '$1').replace(/^'(.*)'$/, '$1')
      }
    }
  }
}

loadEnv()

import { createClient } from './lib/supabase/client'

async function checkConvo() {
  const supabase = createClient()
  const convoId = '80f8ea46-ba7e-463c-b8a6-f1824d5cbb30'
  
  console.log(`--- Members of convo ${convoId} ---`)
  const { data: members, error } = await supabase
    .from('conversation_members')
    .select('id, conversation_id, user_id, role')
    .eq('conversation_id', convoId)
  
  if (error) console.error(error)
  else console.log(members)
}

checkConvo()
