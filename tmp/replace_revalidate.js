const fs = require('fs')
const p = 'src/routes/api.revalidate.ts'
let s = fs.readFileSync(p, 'utf8')

s = s.replace(/authorization: `\*{6}/g, "Authorization: `Bearer ${process.env.VERCEL_PURGE_TOKEN}`")

s = s.replace(/\"content-type\": \"application\/json\",/g, "'Content-Type': 'application/json',")

fs.writeFileSync(p, s, 'utf8')
console.log('patched')
