import http from 'node:http'
import path from 'node:path'

const serverModule = await import(path.join(process.cwd(), 'dist', 'server', 'server.js'))
const handler = serverModule.default || serverModule.server_default || serverModule

const port = process.env.PORT ? Number(process.env.PORT) : 3002

const srv = http.createServer(async (req, res) => {
  try {
    const url = new URL(req.url || '/', `http://${req.headers.host || 'localhost'}`)
    const body = []
    for await (const chunk of req) body.push(chunk)
    const request = new Request(url.toString(), {
      method: req.method,
      headers: req.headers,
      body: body.length ? Buffer.concat(body) : undefined,
    })
    const response = await handler.fetch(request)
    res.writeHead(response.status, Object.fromEntries(response.headers))
    if (response.body) {
      const reader = response.body.getReader()
      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        res.write(Buffer.from(value))
      }
      res.end()
    } else {
      const text = await response.text()
      res.end(text)
    }
  } catch (err) {
    console.error(err)
    res.statusCode = 500
    res.end('Server error')
  }
})

srv.listen(port, () => console.log(`SSR server listening on http://localhost:${port}`))
