const http = require('http')

const PORT = process.env.PORT || 3000
const BASE_URL = `http://localhost:${PORT}`

function testRequest(path) {
  return new Promise((resolve) => {
    const url = new URL(path, BASE_URL)
    const req = http.get(
      url,
      {
        headers: {
          Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          'User-Agent': 'Mozilla/5.0 (Mobile; Capacitor; Android)',
        },
      },
      (res) => {
        let body = ''
        res.on('data', (chunk) => (body += chunk))
        res.on('end', () => {
          resolve({
            status: res.statusCode,
            headers: res.headers,
            location: res.headers.location,
            cookies: res.headers['set-cookie'],
            body,
          })
        })
      }
    )
    req.on('error', (err) => resolve({ error: err.message }))
  })
}

async function runTests() {
  console.log(`🧪 Starting Google OAuth & Capacitor Callback Integration Tests against ${BASE_URL}...\n`)

  let passed = 0
  let failed = 0

  // Test 1: GET /api/auth/mobile-login
  console.log('1. Testing GET /api/auth/mobile-login?next=/...')
  const mobileLoginRes = await testRequest('/api/auth/mobile-login?next=/')
  if (
    (mobileLoginRes.status === 302 || mobileLoginRes.status === 307) &&
    mobileLoginRes.location &&
    mobileLoginRes.location.includes('accounts.google.com')
  ) {
    console.log('   ✅ PASS: Returns 302 Redirect to Google OAuth URL')
    console.log('   Redirect Target:', mobileLoginRes.location.substring(0, 75) + '...')
    passed++
  } else {
    console.log('   ❌ FAIL: Status:', mobileLoginRes.status, 'Error:', mobileLoginRes.error)
    failed++
  }

  // Test 2: GET /api/auth/callback/google
  console.log('\n2. Testing GET /api/auth/callback/google...')
  const googleCallbackRes = await testRequest('/api/auth/callback/google')
  if (googleCallbackRes.status !== 404) {
    console.log(`   ✅ PASS: Route handled cleanly by server (Status: ${googleCallbackRes.status}, NOT 404)`)
    if (googleCallbackRes.location) {
      console.log('   Redirect Target:', googleCallbackRes.location)
    }
    passed++
  } else {
    console.log('   ❌ FAIL: Route returned 404 status code')
    failed++
  }

  // Test 3: GET /auth/callback?is_mobile=true
  console.log('\n3. Testing GET /auth/callback?is_mobile=true...')
  const mobileCallbackRes = await testRequest('/auth/callback?is_mobile=true&next=/')
  if (
    mobileCallbackRes.status === 200 &&
    mobileCallbackRes.body &&
    mobileCallbackRes.body.includes('com.aman.amoganextapp://') &&
    mobileCallbackRes.body.includes('intent://')
  ) {
    console.log('   ✅ PASS: Returns 200 HTML with Capacitor Deep Link & Intent scheme')
    passed++
  } else {
    console.log('   ❌ FAIL: Mobile callback status or HTML content check failed (Status:', mobileCallbackRes.status, ')')
    failed++
  }

  // Test 4: GET /api/auth/mobile-set-cookie
  console.log('\n4. Testing GET /api/auth/mobile-set-cookie...')
  const setCookieRes = await testRequest('/api/auth/mobile-set-cookie?token=test_jwt_session_token&next=/')
  if (
    (setCookieRes.status === 302 || setCookieRes.status === 307) &&
    setCookieRes.cookies &&
    setCookieRes.cookies.length > 0
  ) {
    console.log('   ✅ PASS: Sets session cookies and redirects to destination')
    console.log('   Cookies set:', setCookieRes.cookies.length)
    passed++
  } else {
    console.log('   ❌ FAIL: Cookie setup test failed (Status:', setCookieRes.status, ')')
    failed++
  }

  console.log(`\n==============================================`)
  console.log(`📊 TEST RESULTS: ${passed} PASSED, ${failed} FAILED`)
  console.log(`==============================================\n`)

  if (failed > 0) {
    process.exit(1)
  }
}

runTests()
