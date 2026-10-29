import os

path = r"apps/api/src/index.ts"
with open(path, "r", encoding="utf-8") as f:
    content = f.read()

# We replace the header setting logic to safely clone headers
old_code = """// 2. Toàn bộ Security Headers tiêu chuẩn cho mọi phản hồi
root.use('*', async (c, next) => {
  await next()
  c.res.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload')
  c.res.headers.set('X-Content-Type-Options', 'nosniff')
  c.res.headers.set('X-Frame-Options', 'DENY')
  c.res.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  c.res.headers.set('Permissions-Policy', 'geolocation=(self)')
  c.res.headers.set(
    'Content-Security-Policy',
    "default-src 'self'; script-src 'self' 'unsafe-inline' https:; style-src 'self' 'unsafe-inline' https:; img-src 'self' data: https:; connect-src 'self' https: https://nominatim.openstreetmap.org; font-src 'self' https: data:;"
  )
})"""

new_code = """// 2. Toàn bộ Security Headers tiêu chuẩn cho mọi phản hồi
root.use('*', async (c, next) => {
  await next()
  const headers = new Headers(c.res.headers)
  headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload')
  headers.set('X-Content-Type-Options', 'nosniff')
  headers.set('X-Frame-Options', 'DENY')
  headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  headers.set('Permissions-Policy', 'geolocation=(self)')
  headers.set(
    'Content-Security-Policy',
    "default-src 'self'; script-src 'self' 'unsafe-inline' https:; style-src 'self' 'unsafe-inline' https:; img-src 'self' data: https:; connect-src 'self' https: https://nominatim.openstreetmap.org; font-src 'self' https: data:;"
  )
  c.res = new Response(c.res.body, {
    status: c.res.status,
    statusText: c.res.statusText,
    headers,
  })
})"""

# Also ensure fallback asset handler works smoothly
# If ASSETS is not bound in local dev or error, return 404 cleanly
old_fallback = """// 4. Fallback phục vụ Static Assets & SPA frontend
root.all('*', async (c) => {
  if (c.env.ASSETS) {
    return c.env.ASSETS.fetch(c.req.raw)
  }
  return c.text('Not Found', 404)
})"""

new_fallback = """// 4. Fallback phục vụ Static Assets & SPA frontend
root.all('*', async (c) => {
  if (c.env.ASSETS) {
    try {
      const res = await c.env.ASSETS.fetch(c.req.raw)
      if (res.status === 404 && !c.req.path.startsWith('/api')) {
        // SPA Fallback: serve /index.html if route not found
        const indexReq = new Request(new URL('/', c.req.url).toString(), c.req.raw)
        return await c.env.ASSETS.fetch(indexReq)
      }
      return res
    } catch (e: any) {
      return c.text(`Asset fetch error: ${e?.message || e}`, 500)
    }
  }
  return c.text('Not Found', 404)
})"""

norm_content = content.replace("\r\n", "\n")
norm_old_code = old_code.replace("\r\n", "\n")
norm_old_fallback = old_fallback.replace("\r\n", "\n")

if norm_old_code in norm_content:
    norm_content = norm_content.replace(norm_old_code, new_code.replace("\r\n", "\n"))
    print("Replaced security headers middleware!")
else:
    print("WARNING: norm_old_code not found")

if norm_old_fallback in norm_content:
    norm_content = norm_content.replace(norm_old_fallback, new_fallback.replace("\r\n", "\n"))
    print("Replaced fallback handler!")
else:
    print("WARNING: norm_old_fallback not found")

with open(path, "w", encoding="utf-8") as f:
    f.write(norm_content)

print("Updated apps/api/src/index.ts successfully!")
