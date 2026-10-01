import { createReadStream } from 'node:fs'
import fs from 'node:fs/promises'
import { createServer } from 'node:http'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const staticDir = path.resolve(root, process.env.STATIC_DIR || 'dist')
const port = Number(process.env.PORT || 8080)

const contentTypes = new Map([
  ['.html', 'text/html; charset=utf-8'],
  ['.js', 'text/javascript; charset=utf-8'],
  ['.css', 'text/css; charset=utf-8'],
  ['.json', 'application/json; charset=utf-8'],
  ['.svg', 'image/svg+xml'],
  ['.png', 'image/png'],
  ['.jpg', 'image/jpeg'],
  ['.jpeg', 'image/jpeg'],
  ['.webp', 'image/webp'],
  ['.ico', 'image/x-icon'],
  ['.txt', 'text/plain; charset=utf-8']
])

async function fileExists(filePath) {
  try {
    const stats = await fs.stat(filePath)
    return stats.isFile()
  } catch {
    return false
  }
}

function resolveRequestPath(requestUrl) {
  const url = new URL(requestUrl || '/', 'http://localhost')
  const pathname = decodeURIComponent(url.pathname)
  if (pathname.includes('\0')) return null
  const resolved = path.resolve(staticDir, `.${pathname}`)
  const relative = path.relative(staticDir, resolved)
  if (relative.startsWith('..') || path.isAbsolute(relative)) return null
  return { pathname, resolved }
}

const securityHeaders = {
  'Content-Security-Policy':
    "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self' data:; connect-src 'self'; object-src 'none'; base-uri 'self'; frame-ancestors 'none'; form-action 'self'",
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'Referrer-Policy': 'no-referrer',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()'
}

const server = createServer(async (request, response) => {
  try {
    const resolved = resolveRequestPath(request.url)
    if (!resolved) {
      response.writeHead(403, { 'Content-Type': 'text/plain; charset=utf-8', ...securityHeaders })
      response.end('Forbidden')
      return
    }

    let filePath = resolved.resolved
    if (!(await fileExists(filePath))) {
      if (path.extname(resolved.pathname)) {
        response.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8', ...securityHeaders })
        response.end('Not found')
        return
      }
      filePath = path.join(staticDir, 'index.html')
    }

    const stats = await fs.stat(filePath)
    const headers = {
      'Content-Type': contentTypes.get(path.extname(filePath).toLowerCase()) || 'application/octet-stream',
      'Content-Length': stats.size,
      ...securityHeaders
    }

    if (filePath.endsWith('index.html') || filePath.endsWith('chat-data.json')) {
      headers['Cache-Control'] = 'no-cache'
    } else if (resolved.pathname.startsWith('/assets/')) {
      headers['Cache-Control'] = 'public, max-age=31536000, immutable'
    }

    response.writeHead(200, headers)
    createReadStream(filePath).pipe(response)
  } catch (error) {
    console.error('Request failed:', error)
    response.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8', ...securityHeaders })
    response.end('Server error')
  }
})

server.listen(port, '0.0.0.0', () => {
  console.log(`Dashboard listening on http://0.0.0.0:${port}`)
})
