/// <reference types="vitest/config" />
import path from 'path'
import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { tanstackRouter } from '@tanstack/router-plugin/vite'
import { playwright } from '@vitest/browser-playwright'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // Load local env variables into process.env so they are available in API handlers
  const env = loadEnv(mode, process.cwd(), '')
  Object.assign(process.env, env)

  return {
    server: {
      host: true, // Expose dev server to local network (useful for mobile view testing)
    },
    plugins: [
      tanstackRouter({
        target: 'react',
        autoCodeSplitting: true,
      }),
      react(),
      tailwindcss(),
      {
        name: 'api-routes',
        configureServer(server) {
          server.middlewares.use(async (req, res, next) => {
            if (req.url?.startsWith('/api/chat')) {
              let body = ''
              req.on('data', (chunk) => {
                body += chunk
              })
              await new Promise((resolve) => req.on('end', resolve))

              const parsedBody = body ? JSON.parse(body) : {}

              const mockRes = {
                statusCode: 200,
                headers: {} as Record<string, string>,
                status(code: number) {
                  this.statusCode = code
                  return this
                },
                setHeader(name: string, value: string) {
                  this.headers[name] = value
                  return this
                },
                json(data: any) {
                  res.writeHead(this.statusCode, {
                    'Content-Type': 'application/json',
                    ...this.headers,
                  })
                  res.end(JSON.stringify(data))
                },
                send(data: any) {
                  res.writeHead(this.statusCode, this.headers)
                  res.end(data)
                },
              }

              const mockReq = Object.assign(req, { body: parsedBody })

              try {
                // Dynamically load the API handler in the Vite/Node environment
                const module = await server.ssrLoadModule(
                  path.resolve(__dirname, './api/chat.js')
                )
                const handler = module.default
                await handler(mockReq, mockRes)
              } catch (err: any) {
                console.error('Error in local API handler:', err)
                res.writeHead(500, { 'Content-Type': 'application/json' })
                res.end(
                  JSON.stringify({
                    error: err.message || 'Internal Server Error',
                  })
                )
              }
              return
            }
            next()
          })
        },
      },
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
  test: {
    silent: 'passed-only',
    unstubEnvs: true,
    browser: {
      enabled: true,
      provider: playwright(),
      instances: [{ browser: 'chromium' }],
    },
    coverage: {
      // include: ['src/**/*.{js,jsx,ts,tsx}'], // Uncomment to expand the report to all src/**/* so untested modules appear as 0% coverage.
      exclude: [
        'src/components/ui/**',
        'src/assets/**',
        'src/tanstack-table.d.ts',
        'src/routeTree.gen.ts',
        'src/test-utils/**',
        'src/routes/**',
      ],
    },
  },
  }
})
