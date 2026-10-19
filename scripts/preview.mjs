// Tiny static server for ./dist (no dependencies). Mimics GitHub Pages: folders serve index.html, unknown paths → 404.html
import { createServer } from 'node:http'
import { readFile, stat } from 'node:fs/promises'
import { extname, join, normalize, sep } from 'node:path'

const root = join(import.meta.dirname, '..', 'dist')
const port = Number(process.env.PORT || 4321)
const types = {
  '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.js': 'text/javascript', '.svg': 'image/svg+xml',
  '.png': 'image/png', '.jpg': 'image/jpeg', '.webp': 'image/webp', '.avif': 'image/avif', '.ico': 'image/x-icon',
  '.woff2': 'font/woff2', '.xml': 'application/xml', '.txt': 'text/plain', '.webmanifest': 'application/manifest+json',
}

export function serve() {
  return createServer(async (req, res) => {
    let url
    try {
      url = decodeURIComponent(new URL(req.url, 'http://x').pathname)
    } catch {
      return res.writeHead(400).end('Bad request')
    }
    let file = normalize(join(root, url))
    if (file !== root && !file.startsWith(root + sep)) return res.writeHead(403).end()
    try {
      if ((await stat(file)).isDirectory()) {
        if (!url.endsWith('/')) return res.writeHead(301, { Location: url + '/' }).end()
        file = join(file, 'index.html')
      }
      const body = await readFile(file)
      res.writeHead(200, { 'Content-Type': types[extname(file)] || 'application/octet-stream' }).end(body)
    } catch {
      res.writeHead(404, { 'Content-Type': types['.html'] }).end(await readFile(join(root, '404.html')).catch(() => 'Not found'))
    }
  }).listen(port, '127.0.0.1', () => console.log(`Preview: http://localhost:${port}/`))
}

if (process.argv[1] && import.meta.filename === process.argv[1]) serve()
