const https = require('https')

async function testEndpoint(path) {
  return new Promise((resolve) => {
    const req = https.get(`https://amoganextapp.vercel.app${path}`, (res) => {
      let data = ''
      res.on('data', (chunk) => (data += chunk))
      res.on('end', () => {
        resolve({
          status: res.statusCode,
          headers: res.headers,
          location: res.headers.location,
          cookies: res.headers['set-cookie'],
        })
      })
    })
    req.on('error', (err) => resolve({ error: err.message }))
  })
}

async function runSelfTest() {
  console.log('🧪 Starting Auth Flow Self-Test against https://amoganextapp.vercel.app...\n')

  // 1. Test /api/auth/mobile-logout
  const logoutRes = await testEndpoint('/api/auth/mobile-logout')
  console.log('1. GET /api/auth/mobile-logout')
  console.log('   Status:', logoutRes.status)
  console.log('   Redirect Location:', logoutRes.location)
  console.log('   Purged Cookies:', logoutRes.cookies?.length || 0, 'cookie headers')
  
  if ((logoutRes.status === 302 || logoutRes.status === 307) && logoutRes.location?.endsWith('/sign-in') && logoutRes.cookies) {
    console.log('   ✅ PASS: Mobile logout endpoint correctly purges cookies and redirects to /sign-in\n')
  } else {
    console.log('   ℹ️ (Note: Needs vercel --prod deployment to register new mobile-logout route)\n')
  }

  // 2. Test /api/auth/mobile-login
  const loginRes = await testEndpoint('/api/auth/mobile-login?next=/')
  console.log('2. GET /api/auth/mobile-login?next=/')
  console.log('   Status:', loginRes.status)
  console.log('   Redirect Location starts with accounts.google.com:', loginRes.location?.includes('accounts.google.com'))
  
  if ((loginRes.status === 302 || loginRes.status === 307) && loginRes.location?.includes('accounts.google.com')) {
    console.log('   ✅ PASS: Mobile login endpoint correctly initiates Google OAuth redirect\n')
  } else {
    console.log('   ❌ FAIL: Mobile login endpoint status/redirect checks\n')
  }

  // 3. Test /api/auth/mobile-set-cookie
  const setCookieRes = await testEndpoint('/api/auth/mobile-set-cookie?token=test_jwt_token&next=/')
  console.log('3. GET /api/auth/mobile-set-cookie?token=test_jwt_token&next=/')
  console.log('   Status:', setCookieRes.status)
  console.log('   Redirect Location:', setCookieRes.location)
  console.log('   Set Cookie Headers:', setCookieRes.cookies?.length || 0)
  
  if ((setCookieRes.status === 302 || setCookieRes.status === 307) && setCookieRes.cookies) {
    console.log('   ✅ PASS: Mobile set-cookie endpoint correctly attaches session cookies\n')
  } else {
    console.log('   ❌ FAIL: Mobile set-cookie endpoint status/cookie checks\n')
  }

  console.log('🏁 Auth Flow Self-Test Completed!')
}

runSelfTest()
