// خادم محلي بسيط للمعاينة فقط (بدون أي مكتبات). الموقع نفسه ملفات ثابتة لا تحتاج بناء.
import { createServer } from 'node:http'
import { readFile, stat } from 'node:fs/promises'
import { extname, join, normalize } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = fileURLToPath(new URL('.', import.meta.url))
const port = Number(process.env.PORT) || 3000
const types = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.webp': 'image/webp',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
}

createServer(async (req, res) => {
  const pathname = decodeURIComponent(new URL(req.url, 'http://localhost').pathname)
  let file = normalize(join(root, pathname))
  if (!file.startsWith(root) || file.includes('node_modules')) file = join(root, 'index.html')
  try {
    if ((await stat(file)).isDirectory()) file = join(file, 'index.html')
  } catch {
    file = join(root, 'index.html')
  }
  try {
    const body = await readFile(file)
    res.writeHead(200, { 'Content-Type': types[extname(file)] || 'application/octet-stream', 'Cache-Control': 'no-cache' })
    res.end(body)
  } catch {
    res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' })
    res.end('الصفحة غير موجودة')
  }
}).listen(port, '0.0.0.0', () => console.log(`On Fire Academy: http://localhost:${port}`))
