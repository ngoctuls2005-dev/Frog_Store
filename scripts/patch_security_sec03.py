import re

index_path = 'apps/api/src/index.ts'
with open(index_path, 'r', encoding='utf-8') as f:
    code = f.read()

# 1. Insert checkRateLimit
rate_limit_helper = """// Rate Limiting Helper (Cloudflare KV)
const checkRateLimit = async (c: Context<Env>, action: string, limit: number, windowSec: number): Promise<boolean> => {
  const ip = c.req.header('cf-connecting-ip') || c.req.header('x-real-ip') || '127.0.0.1'
  const key = `ratelimit:${action}:${ip}`
  try {
    const current = Number((await c.env.CART.get(key)) || '0')
    if (current >= limit) return false
    await c.env.CART.put(key, String(current + 1), { expirationTtl: windowSec })
  } catch {
    // If KV fails, allow request
  }
  return true
}
"""

if "const checkRateLimit =" not in code:
    code = code.replace(
        "const writeGuestLines = (c: Context<Env>, key: string, lines: Line[]) =>\n  c.env.CART.put(key, JSON.stringify(lines), { expirationTtl: CART_TTL })",
        "const writeGuestLines = (c: Context<Env>, key: string, lines: Line[]) =>\n  c.env.CART.put(key, JSON.stringify(lines), { expirationTtl: CART_TTL })\n\n" + rate_limit_helper
    )

# 2. Add rate limiting to /auth/login
login_pattern = r"(app\.post\('/auth/login', async \(c\) => \{\n)"
login_rate_limit_check = r"""\1  const allowed = await checkRateLimit(c, 'login', 5, 600)
  if (!allowed) {
    return c.json({ error: 'Quá nhiều lần thử đăng nhập. Vui lòng thử lại sau 10 phút để đảm bảo an toàn!' }, 429)
  }

"""
code = re.sub(login_pattern, login_rate_limit_check, code)

# 3. Replace app.get('/orders/:code', ...) with masked PII and hidden GPS for unauthenticated users
order_track_code = """app.get('/orders/:code', async (c) => {
  const allowed = await checkRateLimit(c, 'track', 10, 300)
  if (!allowed) {
    return c.json({ error: 'Bạn đã tra cứu đơn quá nhiều lần. Vui lòng thử lại sau 5 phút!' }, 429)
  }

  const code = c.req.param('code')
  const order = await c.env.DB.prepare('SELECT * FROM orders WHERE order_code = ?')
    .bind(code)
    .first<any>()

  if (!order) return c.json({ error: 'Không tìm thấy đơn hàng này' }, 404)

  const { results: items } = await c.env.DB.prepare(
    `SELECT oi.*, p.image 
     FROM order_items oi 
     LEFT JOIN products p ON oi.product_id = p.id 
     WHERE oi.order_id = ?`
  )
    .bind(order.id)
    .all()

  // Kiểm tra quyền sở hữu: Chủ đơn hàng hoặc Admin được xem đầy đủ
  const authUser = await getAuthUser(c)
  const isOwnerOrAdmin = authUser && (authUser.sub === order.user_id || authUser.role === 'admin')

  if (isOwnerOrAdmin) {
    return c.json({ ...order, items })
  }

  // Khách vãng lai tra cứu: Che giấu thông tin định danh (PII) và ẩn hoàn toàn tọa độ GPS
  const maskedPhone = order.customer_phone
    ? (order.customer_phone.length >= 7
        ? order.customer_phone.slice(0, 4) + '***' + order.customer_phone.slice(-3)
        : '***')
    : '***'

  const maskName = (name: string) => {
    if (!name) return 'Khách hàng'
    const parts = name.trim().split(' ')
    if (parts.length === 1) return parts[0][0] + '***'
    return parts[0] + ' ' + parts.slice(1).map((p: string) => p[0] + '*').join(' ')
  }

  const maskAddress = (address: string, city: string) => {
    if (!address) return city || 'Việt Nam'
    const parts = address.split(',').map((s: string) => s.trim())
    if (parts.length > 2) {
      return '***, ' + parts.slice(-2).join(', ')
    }
    return '***, ' + (city || 'Việt Nam')
  }

  const safeOrder = {
    ...order,
    customer_name: maskName(order.customer_name),
    customer_phone: maskedPhone,
    customer_address: maskAddress(order.customer_address, order.city),
    latitude: null, // Ẩn GPS hoàn toàn
    longitude: null, // Ẩn GPS hoàn toàn
    items,
  }

  return c.json(safeOrder)
})"""

old_track_pattern = r"app\.get\('/orders/:code', async \(c\) => \{[\s\S]*?return c\.json\(\{ \.\.\.order, items \}\)\n\}\)"
code = re.sub(old_track_pattern, order_track_code, code)

with open(index_path, 'w', encoding='utf-8') as f:
    f.write(code)

print("SUCCESS: index.ts patched with Rate Limiting & Order Masking!")

