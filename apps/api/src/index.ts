import { Hono } from 'hono'
import type { Context } from 'hono'
import {
  generateSalt,
  hashPassword,
  verifyPassword,
  signJwt,
  verifyJwt,
  getAuthUser,
  parseGoogleToken,
  type User,
  type JwtPayload,
} from './auth'

type Env = { Bindings: { DB: D1Database; CART: KVNamespace } }

export type Category = {
  id: number
  name: string
  slug: string
  description: string
  icon: string
  product_count?: number
}

export type FrogSpeciesDetails = {
  id: number
  product_id: number
  family: string
  genus: string
  species: string
  origin_region: string
  natural_habitat: string
  adult_size_male_cm: number
  adult_size_female_cm: number
  lifespan_years: string
  activity_period: string
  temperament: string
  social_cohabitation: string
  enclosure_type: string
  min_tank_size: string
  temp_day_min: number
  temp_day_max: number
  temp_night_min: number
  temp_night_max: number
  humidity_min: number
  humidity_max: number
  lighting_uvb: string
  substrate_recommended: string
  water_requirements: string
  primary_diet_json: string
  primary_diet?: string[]
  feeding_frequency: string
  supplements_guide: string
  handling_safety: string
  toxicity_warning: string
  common_health_issues: string
  critical_warnings_json: string
  critical_warnings?: string[]
  ai_knowledge_snippet: string
  ai_facts_json: string
  ai_facts?: any
}

export type Product = {
  id: number
  category_id: number
  category_name?: string
  category_slug?: string
  slug: string
  name: string
  scientific_name: string
  morph: string
  price: number
  original_price: number
  size_stage: string
  lifespan: string
  difficulty: string
  habitat_type: string
  temperature: string
  humidity: string
  diet: string
  description: string
  care_guide: string
  health_status: string
  image: string
  gallery_images_json?: string
  gallery_images?: string[]
  stock: number
  is_featured: number
  details?: FrogSpeciesDetails
}

type Line = { productId: number; qty: number }

type CartItem = {
  product: Product
  qty: number
}

type CartResponse = {
  items: CartItem[]
  total: number
  count: number
}

const app = new Hono<Env>().basePath('/api')

const CART_TTL = 60 * 60 * 24 * 30 // 30 ngày

// Giỏ hàng gắn với cart id do client sinh (lưu ở localStorage cho khách vãng lai)
const guestCartKey = (c: Context<Env>) => {
  const id = c.req.header('x-cart-id')
  return id && /^[\w-]{8,64}$/.test(id) ? `cart:${id}` : null
}

const readGuestLines = async (c: Context<Env>, key: string): Promise<Line[]> =>
  (await c.env.CART.get<Line[]>(key, 'json')) ?? []

const writeGuestLines = (c: Context<Env>, key: string, lines: Line[]) =>
  c.env.CART.put(key, JSON.stringify(lines), { expirationTtl: CART_TTL })

// Đọc giỏ hàng của user từ D1 (bảo đảm không mất khi đăng xuất)
const readUserLines = async (c: Context<Env>, userId: number): Promise<Line[]> => {
  const { results } = await c.env.DB.prepare(
    'SELECT product_id as productId, quantity as qty FROM user_carts WHERE user_id = ?'
  )
    .bind(userId)
    .all<Line>()
  return results || []
}

// Ghi giỏ hàng của user vào D1
const writeUserLines = async (c: Context<Env>, userId: number, lines: Line[]) => {
  await c.env.DB.prepare('DELETE FROM user_carts WHERE user_id = ?').bind(userId).run()
  if (lines.length > 0) {
    const stmts = lines.map((l) =>
      c.env.DB.prepare(
        'INSERT INTO user_carts (user_id, product_id, quantity) VALUES (?, ?, ?)'
      ).bind(userId, l.productId, l.qty)
    )
    await c.env.DB.batch(stmts)
  }
}

// Ghép dòng giỏ hàng với thông tin sản phẩm từ D1
const hydrate = async (c: Context<Env>, lines: Line[]): Promise<CartResponse> => {
  if (!lines.length) return { items: [], total: 0, count: 0 }
  const marks = lines.map(() => '?').join(',')
  const { results } = await c.env.DB.prepare(
    `SELECT p.*, c.name as category_name, c.slug as category_slug 
     FROM products p 
     LEFT JOIN categories c ON p.category_id = c.id 
     WHERE p.id IN (${marks})`
  )
    .bind(...lines.map((l) => l.productId))
    .all<Product>()
  const byId = new Map(results.map((p) => [p.id, p]))
  const items = lines.flatMap((l) => {
    const product = byId.get(l.productId)
    return product ? [{ product, qty: l.qty }] : []
  })
  return {
    items,
    total: items.reduce((s, i) => s + i.product.price * i.qty, 0),
    count: items.reduce((s, i) => s + i.qty, 0),
  }
}

// ==========================================
// 1. PUBLIC APIS: CATEGORIES & PRODUCTS
// ==========================================

app.get('/categories', async (c) => {
  const { results } = await c.env.DB.prepare(
    `SELECT c.*, COUNT(p.id) as product_count 
     FROM categories c 
     LEFT JOIN products p ON p.category_id = c.id 
     GROUP BY c.id 
     ORDER BY c.id`
  ).all<Category>()
  return c.json(results)
})

app.get('/products', async (c) => {
  const category = c.req.query('category')
  const difficulty = c.req.query('difficulty')
  const habitat = c.req.query('habitat')
  const search = c.req.query('search')
  const featured = c.req.query('featured')
  const sort = c.req.query('sort')

  let sql = `
    SELECT p.*, c.name as category_name, c.slug as category_slug 
    FROM products p 
    LEFT JOIN categories c ON p.category_id = c.id 
    WHERE 1=1
  `
  const params: (string | number)[] = []

  if (category) {
    if (/^\d+$/.test(category)) {
      sql += ' AND p.category_id = ?'
      params.push(Number(category))
    } else {
      sql += ' AND c.slug = ?'
      params.push(category)
    }
  }

  if (difficulty && difficulty !== 'all') {
    sql += ' AND p.difficulty = ?'
    params.push(difficulty)
  }

  if (habitat && habitat !== 'all') {
    sql += ' AND p.habitat_type = ?'
    params.push(habitat)
  }

  if (featured === '1' || featured === 'true') {
    sql += ' AND p.is_featured = 1'
  }

  if (search && search.trim()) {
    sql += ' AND (p.name LIKE ? OR p.scientific_name LIKE ? OR p.morph LIKE ? OR p.description LIKE ?)'
    const pattern = `%${search.trim()}%`
    params.push(pattern, pattern, pattern, pattern)
  }

  if (sort === 'price_asc') {
    sql += ' ORDER BY p.price ASC'
  } else if (sort === 'price_desc') {
    sql += ' ORDER BY p.price DESC'
  } else {
    sql += ' ORDER BY p.is_featured DESC, p.id ASC'
  }

  const stmt = c.env.DB.prepare(sql)
  const { results } = params.length ? await stmt.bind(...params).all<Product>() : await stmt.all<Product>()
  
  const parsed = (results || []).map((p) => {
    try {
      p.gallery_images = p.gallery_images_json ? JSON.parse(p.gallery_images_json) : [p.image]
    } catch {
      p.gallery_images = [p.image]
    }
    return p
  })
  return c.json(parsed)
})

app.get('/products/:idOrSlug', async (c) => {
  const idOrSlug = c.req.param('idOrSlug')
  const isId = /^\d+$/.test(idOrSlug)

  const sql = `
    SELECT p.*, c.name as category_name, c.slug as category_slug,
           d.family, d.genus, d.species, d.origin_region, d.natural_habitat,
           d.adult_size_male_cm, d.adult_size_female_cm, d.lifespan_years,
           d.activity_period, d.temperament, d.social_cohabitation,
           d.enclosure_type, d.min_tank_size,
           d.temp_day_min, d.temp_day_max, d.temp_night_min, d.temp_night_max,
           d.humidity_min, d.humidity_max, d.lighting_uvb, d.substrate_recommended,
           d.water_requirements, d.primary_diet_json, d.feeding_frequency,
           d.supplements_guide, d.handling_safety, d.toxicity_warning,
           d.common_health_issues, d.critical_warnings_json,
           d.ai_knowledge_snippet, d.ai_facts_json
    FROM products p
    LEFT JOIN categories c ON p.category_id = c.id
    LEFT JOIN frog_species_details d ON p.id = d.product_id
    WHERE ${isId ? 'p.id = ?' : 'p.slug = ?'}
  `
  const product = await c.env.DB.prepare(sql)
    .bind(isId ? Number(idOrSlug) : idOrSlug)
    .first<any>()

  if (!product) return c.json({ error: 'Không tìm thấy loài ếch này' }, 404)

  try {
    product.gallery_images = product.gallery_images_json ? JSON.parse(product.gallery_images_json) : [product.image]
  } catch {
    product.gallery_images = [product.image]
  }

  if (product.family) {
    product.details = {
      id: product.id,
      product_id: product.id,
      family: product.family,
      genus: product.genus,
      species: product.species,
      origin_region: product.origin_region,
      natural_habitat: product.natural_habitat,
      adult_size_male_cm: product.adult_size_male_cm,
      adult_size_female_cm: product.adult_size_female_cm,
      lifespan_years: product.lifespan_years,
      activity_period: product.activity_period,
      temperament: product.temperament,
      social_cohabitation: product.social_cohabitation,
      enclosure_type: product.enclosure_type,
      min_tank_size: product.min_tank_size,
      temp_day_min: product.temp_day_min,
      temp_day_max: product.temp_day_max,
      temp_night_min: product.temp_night_min,
      temp_night_max: product.temp_night_max,
      humidity_min: product.humidity_min,
      humidity_max: product.humidity_max,
      lighting_uvb: product.lighting_uvb,
      substrate_recommended: product.substrate_recommended,
      water_requirements: product.water_requirements,
      primary_diet_json: product.primary_diet_json,
      primary_diet: product.primary_diet_json ? JSON.parse(product.primary_diet_json) : [],
      feeding_frequency: product.feeding_frequency,
      supplements_guide: product.supplements_guide,
      handling_safety: product.handling_safety,
      toxicity_warning: product.toxicity_warning,
      common_health_issues: product.common_health_issues,
      critical_warnings_json: product.critical_warnings_json,
      critical_warnings: product.critical_warnings_json ? JSON.parse(product.critical_warnings_json) : [],
      ai_knowledge_snippet: product.ai_knowledge_snippet,
      ai_facts_json: product.ai_facts_json,
      ai_facts: product.ai_facts_json ? JSON.parse(product.ai_facts_json) : {}
    }
  }

  return c.json(product)
})

// ==========================================
// AI KNOWLEDGE RETRIEVAL ENDPOINTS (LLM / RAG)
// ==========================================
app.get('/ai/frogs/knowledge', async (c) => {
  const { results } = await c.env.DB.prepare(`
    SELECT p.id, p.slug, p.name, p.scientific_name, p.price, p.difficulty, p.habitat_type,
           d.family, d.origin_region, d.ai_knowledge_snippet, d.ai_facts_json
    FROM products p
    LEFT JOIN frog_species_details d ON p.id = d.product_id
    ORDER BY p.id ASC
  `).all<any>()

  const species = (results || []).map((r) => {
    let facts = {}
    try { facts = r.ai_facts_json ? JSON.parse(r.ai_facts_json) : {} } catch {}
    return {
      id: r.id,
      slug: r.slug,
      name: r.name,
      scientific_name: r.scientific_name,
      family: r.family,
      price: r.price,
      difficulty: r.difficulty,
      habitat_type: r.habitat_type,
      origin_region: r.origin_region,
      facts,
      ai_markdown: r.ai_knowledge_snippet
    }
  })

  return c.json({
    title: 'Frog Store Herpetology AI Knowledge Base',
    total_species: species.length,
    license: 'Captive-bred Live Pets & Open Educational Science',
    species
  })
})

app.get('/ai/frogs/:slug', async (c) => {
  const slug = c.req.param('slug')
  const format = c.req.query('format')

  const row = await c.env.DB.prepare(`
    SELECT p.id, p.slug, p.name, p.scientific_name, p.price, p.image,
           d.*
    FROM products p
    LEFT JOIN frog_species_details d ON p.id = d.product_id
    WHERE p.slug = ? OR p.id = ?
  `).bind(slug, /^\d+$/.test(slug) ? Number(slug) : -1).first<any>()

  if (!row) return c.json({ error: 'Species not found in AI knowledge base' }, 404)

  if (format === 'markdown' || format === 'md') {
    return c.text(row.ai_knowledge_snippet || '# No biological fact sheet available')
  }

  let facts = {}
  let diet = []
  let warnings = []
  try { facts = row.ai_facts_json ? JSON.parse(row.ai_facts_json) : {} } catch {}
  try { diet = row.primary_diet_json ? JSON.parse(row.primary_diet_json) : [] } catch {}
  try { warnings = row.critical_warnings_json ? JSON.parse(row.critical_warnings_json) : [] } catch {}

  return c.json({
    species_code: row.slug,
    name: row.name,
    scientific_name: row.scientific_name,
    price: row.price,
    facts,
    primary_diet: diet,
    critical_rules: warnings,
    ai_knowledge_markdown: row.ai_knowledge_snippet
  })
})

// ==========================================
// 2. AUTHENTICATION (REGISTER / LOGIN / ME)
// ==========================================

app.post('/auth/register', async (c) => {
  const body = await c.req.json<{
    email?: string
    password?: string
    fullName?: string
    full_name?: string
    phone?: string
    address?: string
    city?: string
  }>()

  const fullNameVal = body.fullName?.trim() || body.full_name?.trim() || ''

  if (!body.email || !body.password || !fullNameVal) {
    return c.json({ error: 'Vui lòng điền đầy đủ Email, Mật khẩu và Họ tên' }, 400)
  }

  const email = body.email.trim().toLowerCase()
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return c.json({ error: 'Định dạng email không hợp lệ' }, 400)
  }
  if (body.password.length < 6) {
    return c.json({ error: 'Mật khẩu phải từ 6 ký tự trở lên' }, 400)
  }

  // Kiểm tra email trùng
  const existing = await c.env.DB.prepare('SELECT id FROM users WHERE email = ?').bind(email).first()
  if (existing) {
    return c.json({ error: 'Email này đã được đăng ký trên hệ thống' }, 409)
  }

  // Hash mật khẩu
  const salt = generateSalt()
  const hash = await hashPassword(body.password, salt)

  const result = await c.env.DB.prepare(
    `INSERT INTO users (email, password_hash, password_salt, full_name, phone, address, city, role, status)
     VALUES (?, ?, ?, ?, ?, ?, ?, 'customer', 'active')`
  )
    .bind(
      email,
      hash,
      salt,
      fullNameVal,
      body.phone?.trim() || '',
      body.address?.trim() || '',
      body.city?.trim() || 'Hà Nội'
    )
    .run()

  const userId = result.meta.last_row_id as number
  const user: User = {
    id: userId,
    email,
    full_name: fullNameVal,
    phone: body.phone?.trim() || '',
    address: body.address?.trim() || '',
    city: body.city?.trim() || 'Hà Nội',
    role: 'customer',
    status: 'active',
    created_at: new Date().toISOString(),
  }

  const token = await signJwt({
    sub: userId,
    email,
    name: user.full_name,
    role: 'customer',
  })

  // Nếu có giỏ hàng vãng lai, chuyển vào giỏ user
  const guestKey = guestCartKey(c)
  if (guestKey) {
    const guestLines = await readGuestLines(c, guestKey)
    if (guestLines.length > 0) {
      await writeUserLines(c, userId, guestLines)
      await c.env.CART.delete(guestKey)
    }
  }

  return c.json({ success: true, token, user })
})

app.post('/auth/login', async (c) => {
  const { email, password } = await c.req.json<{ email?: string; password?: string }>()
  if (!email || !password) {
    return c.json({ error: 'Vui lòng nhập email và mật khẩu' }, 400)
  }

  const userRecord = await c.env.DB.prepare(
    'SELECT * FROM users WHERE email = ?'
  )
    .bind(email.trim().toLowerCase())
    .first<any>()

  if (!userRecord) {
    return c.json({ error: 'Email hoặc mật khẩu không chính xác' }, 401)
  }

  if (userRecord.status === 'blocked') {
    return c.json({ error: 'Tài khoản của bạn đã bị khóa. Vui lòng liên hệ ban quản trị.' }, 403)
  }

  const isValid = await verifyPassword(password, userRecord.password_salt, userRecord.password_hash)
  if (!isValid) {
    return c.json({ error: 'Email hoặc mật khẩu không chính xác' }, 401)
  }

  const user: User = {
    id: userRecord.id,
    email: userRecord.email,
    full_name: userRecord.full_name,
    phone: userRecord.phone,
    address: userRecord.address,
    city: userRecord.city,
    role: userRecord.role,
    status: userRecord.status,
    created_at: userRecord.created_at,
  }

  const token = await signJwt({
    sub: user.id,
    email: user.email,
    name: user.full_name,
    role: user.role,
  })

  // Hợp nhất giỏ hàng (Cart Merge): Nếu khách vãng lai đã thêm hàng, gộp vào giỏ user
  const guestKey = guestCartKey(c)
  if (guestKey) {
    const guestLines = await readGuestLines(c, guestKey)
    if (guestLines.length > 0) {
      const userLines = await readUserLines(c, user.id)
      const mergedMap = new Map<number, number>()
      userLines.forEach((l) => mergedMap.set(l.productId, l.qty))
      guestLines.forEach((l) => {
        mergedMap.set(l.productId, (mergedMap.get(l.productId) || 0) + l.qty)
      })
      const mergedLines: Line[] = Array.from(mergedMap.entries()).map(([productId, qty]) => ({
        productId,
        qty: Math.min(qty, 99),
      }))
      await writeUserLines(c, user.id, mergedLines)
      await c.env.CART.delete(guestKey)
    }
  }

  return c.json({ success: true, token, user })
})

// 2.3. Đăng nhập / Đăng ký qua Google
app.post('/auth/google', async (c) => {
  const body = await c.req.json<{ credential?: string; idToken?: string; googleId?: string; email?: string; name?: string; avatar?: string }>()
  const raw = body.credential || body.idToken || (body.googleId && body.email ? JSON.stringify(body) : '')
  const gUser = parseGoogleToken(raw)

  if (!gUser || !gUser.googleId || !gUser.email) {
    return c.json({ error: 'Thông tin xác thực Google không hợp lệ hoặc thiếu thông tin' }, 400)
  }

  // 1. Tìm user theo google_id
  let userRecord = await c.env.DB.prepare(
    'SELECT * FROM users WHERE google_id = ?'
  ).bind(gUser.googleId).first<any>()

  if (userRecord) {
    if (userRecord.status === 'suspended' || userRecord.status === 'blocked') {
      return c.json({ error: 'Tài khoản của bạn đã bị khóa. Vui lòng liên hệ ban quản trị.' }, 403)
    }
  } else {
    // 2. Chưa có google_id, tìm xem có email trùng không
    const userByEmail = await c.env.DB.prepare(
      'SELECT * FROM users WHERE email = ?'
    ).bind(gUser.email).first<any>()

    if (userByEmail) {
      // Nếu user đã liên kết với Google ID khác -> Báo lỗi xung đột 409
      if (userByEmail.google_id && userByEmail.google_id !== gUser.googleId) {
        return c.json({ error: 'Email này đã được liên kết với một tài khoản Google khác!' }, 409)
      }
      // Tự động liên kết
      await c.env.DB.prepare(
        `UPDATE users 
         SET google_id = ?, 
             avatar_url = CASE WHEN avatar_url = '' OR avatar_url IS NULL THEN ? ELSE avatar_url END,
             updated_at = datetime('now', 'localtime') 
         WHERE id = ?`
      ).bind(gUser.googleId, gUser.avatar, userByEmail.id).run()

      userRecord = await c.env.DB.prepare('SELECT * FROM users WHERE id = ?').bind(userByEmail.id).first<any>()
    } else {
      // 3. Chưa có tài khoản -> Đăng ký mới bằng Google
      const insertRes = await c.env.DB.prepare(
        `INSERT INTO users (email, full_name, google_id, avatar_url, role, status) 
         VALUES (?, ?, ?, ?, 'customer', 'active')`
      ).bind(gUser.email, gUser.name, gUser.googleId, gUser.avatar).run()

      const newUserId = insertRes.meta.last_row_id || (await c.env.DB.prepare('SELECT id FROM users WHERE google_id = ?').bind(gUser.googleId).first<any>())?.id
      userRecord = await c.env.DB.prepare('SELECT * FROM users WHERE id = ?').bind(newUserId).first<any>()
    }
  }

  const user: User = {
    id: userRecord.id,
    email: userRecord.email,
    full_name: userRecord.full_name,
    phone: userRecord.phone || '',
    address: userRecord.address || '',
    city: userRecord.city || 'Hà Nội',
    google_id: userRecord.google_id,
    avatar_url: userRecord.avatar_url || '',
    latitude: userRecord.latitude,
    longitude: userRecord.longitude,
    role: userRecord.role,
    status: userRecord.status,
    created_at: userRecord.created_at,
  }

  const token = await signJwt({
    sub: user.id,
    email: user.email,
    name: user.full_name,
    role: user.role,
  })

  // Hợp nhất giỏ hàng nếu có
  const guestKey = guestCartKey(c)
  if (guestKey) {
    const guestLines = await readGuestLines(c, guestKey)
    if (guestLines.length > 0) {
      const userLines = await readUserLines(c, user.id)
      const mergedMap = new Map<number, number>()
      userLines.forEach((l) => mergedMap.set(l.productId, l.qty))
      guestLines.forEach((l) => mergedMap.set(l.productId, (mergedMap.get(l.productId) || 0) + l.qty))
      const mergedLines: Line[] = Array.from(mergedMap.entries()).map(([productId, qty]) => ({
        productId,
        qty: Math.min(qty, 99),
      }))
      await writeUserLines(c, user.id, mergedLines)
      await c.env.CART.delete(guestKey)
    }
  }

  return c.json({ success: true, token, user })
})

app.get('/auth/me', async (c) => {
  const authUser = await getAuthUser(c)
  if (!authUser) return c.json({ error: 'Chưa đăng nhập' }, 401)

  const user = await c.env.DB.prepare(
    'SELECT id, email, full_name, phone, address, city, google_id, avatar_url, latitude, longitude, role, status, created_at, (password_hash IS NOT NULL AND password_hash != "") as has_password FROM users WHERE id = ?'
  )
    .bind(authUser.sub)
    .first<any>()

  if (!user) return c.json({ error: 'Tài khoản không tồn tại' }, 404)
  return c.json({
    user: {
      ...user,
      has_password: Boolean(user.has_password),
    }
  })
})

// ==========================================
// 3. USER PROFILE, ORDERS & GOOGLE LINKING
// ==========================================

// Liên kết tài khoản hiện tại với Google
app.post('/user/link-google', async (c) => {
  const authUser = await getAuthUser(c)
  if (!authUser) return c.json({ error: 'Chưa đăng nhập' }, 401)

  const body = await c.req.json<{ credential?: string; idToken?: string; googleId?: string; email?: string; name?: string; avatar?: string }>()
  const raw = body.credential || body.idToken || (body.googleId && body.email ? JSON.stringify(body) : '')
  const gUser = parseGoogleToken(raw)

  if (!gUser || !gUser.googleId) {
    return c.json({ error: 'Thông tin xác thực Google không hợp lệ' }, 400)
  }

  // 1. Kiểm tra tài khoản hiện tại đã có google_id chưa
  const currentUser = await c.env.DB.prepare('SELECT id, google_id FROM users WHERE id = ?')
    .bind(authUser.sub)
    .first<any>()

  if (currentUser?.google_id) {
    return c.json({ error: 'Tài khoản của bạn đã được liên kết với một tài khoản Google rồi!' }, 400)
  }

  // 2. RÀNG BUỘC DUY NHẤT 1-1: Kiểm tra xem googleId này đã bị user KHÁC liên kết chưa
  const existingGoogleUser = await c.env.DB.prepare('SELECT id, email FROM users WHERE google_id = ?')
    .bind(gUser.googleId)
    .first<any>()

  if (existingGoogleUser) {
    return c.json({
      error: 'Tài khoản Google này đã được liên kết với một tài khoản Frog Store khác! Không cho phép liên kết 1 tài khoản Google cho nhiều tài khoản.',
    }, 409)
  }

  // 3. Tiến hành liên kết
  await c.env.DB.prepare(
    `UPDATE users 
     SET google_id = ?, 
         avatar_url = CASE WHEN avatar_url = '' OR avatar_url IS NULL THEN ? ELSE avatar_url END,
         updated_at = datetime('now', 'localtime') 
     WHERE id = ?`
  ).bind(gUser.googleId, gUser.avatar, authUser.sub).run()

  const updatedUser = await c.env.DB.prepare(
    'SELECT id, email, full_name, phone, address, city, google_id, avatar_url, latitude, longitude, role, status FROM users WHERE id = ?'
  ).bind(authUser.sub).first<User>()

  return c.json({
    success: true,
    message: 'Liên kết tài khoản Google thành công! Từ nay bạn có thể đăng nhập bằng Google.',
    user: updatedUser,
  })
})

// Hủy liên kết Google
app.post('/user/unlink-google', async (c) => {
  const authUser = await getAuthUser(c)
  if (!authUser) return c.json({ error: 'Chưa đăng nhập' }, 401)

  const currentUser = await c.env.DB.prepare('SELECT id, password_hash, google_id FROM users WHERE id = ?')
    .bind(authUser.sub)
    .first<any>()

  if (!currentUser?.google_id) {
    return c.json({ error: 'Tài khoản chưa liên kết với Google' }, 400)
  }

  if (!currentUser.password_hash || currentUser.password_hash === '') {
    return c.json({ error: 'Vui lòng thiết lập mật khẩu trước khi hủy liên kết Google để có thể đăng nhập!' }, 400)
  }

  await c.env.DB.prepare(
    "UPDATE users SET google_id = NULL, updated_at = datetime('now', 'localtime') WHERE id = ?"
  ).bind(authUser.sub).run()

  return c.json({ success: true, message: 'Đã hủy liên kết tài khoản Google' })
})

app.put('/user/profile', async (c) => {
  const authUser = await getAuthUser(c)
  if (!authUser) return c.json({ error: 'Chưa đăng nhập' }, 401)

  const body = await c.req.json<{
    fullName?: string
    full_name?: string
    phone?: string
    address?: string
    city?: string
    avatarUrl?: string
    avatar_url?: string
    latitude?: number
    longitude?: number
  }>()

  const name = body.fullName?.trim() || body.full_name?.trim() || null
  const avatar = body.avatarUrl?.trim() || body.avatar_url?.trim() || null

  await c.env.DB.prepare(
    `UPDATE users 
     SET full_name = COALESCE(?, full_name), 
         phone = COALESCE(?, phone), 
         address = COALESCE(?, address), 
         city = COALESCE(?, city),
         avatar_url = COALESCE(?, avatar_url),
         latitude = COALESCE(?, latitude),
         longitude = COALESCE(?, longitude),
         updated_at = datetime('now', 'localtime')
     WHERE id = ?`
  )
    .bind(
      name,
      body.phone?.trim() || null,
      body.address?.trim() || null,
      body.city?.trim() || null,
      avatar,
      body.latitude !== undefined ? body.latitude : null,
      body.longitude !== undefined ? body.longitude : null,
      authUser.sub
    )
    .run()

  const updated = await c.env.DB.prepare(
    'SELECT id, email, full_name, phone, address, city, google_id, avatar_url, latitude, longitude, role, status FROM users WHERE id = ?'
  )
    .bind(authUser.sub)
    .first<User>()

  return c.json({ success: true, user: updated })
})

app.put('/user/password', async (c) => {
  const authUser = await getAuthUser(c)
  if (!authUser) return c.json({ error: 'Chưa đăng nhập' }, 401)

  const { oldPassword, newPassword } = await c.req.json<{ oldPassword?: string; newPassword?: string }>()
  if (!oldPassword || !newPassword || newPassword.length < 6) {
    return c.json({ error: 'Mật khẩu mới phải từ 6 ký tự trở lên' }, 400)
  }

  const userRecord = await c.env.DB.prepare('SELECT password_hash, password_salt FROM users WHERE id = ?')
    .bind(authUser.sub)
    .first<any>()

  const isValid = await verifyPassword(oldPassword, userRecord.password_salt, userRecord.password_hash)
  if (!isValid) {
    return c.json({ error: 'Mật khẩu hiện tại không chính xác' }, 400)
  }

  const newSalt = generateSalt()
  const newHash = await hashPassword(newPassword, newSalt)

  await c.env.DB.prepare(
    `UPDATE users 
     SET password_hash = ?, password_salt = ?, updated_at = datetime('now', 'localtime') 
     WHERE id = ?`
  )
    .bind(newHash, newSalt, authUser.sub)
    .run()

  return c.json({ success: true, message: 'Đổi mật khẩu thành công' })
})

app.get('/user/orders', async (c) => {
  const authUser = await getAuthUser(c)
  if (!authUser) return c.json({ error: 'Chưa đăng nhập' }, 401)

  const { results: orders } = await c.env.DB.prepare(
    'SELECT * FROM orders WHERE user_id = ? ORDER BY id DESC'
  )
    .bind(authUser.sub)
    .all<any>()

  if (!orders || !orders.length) return c.json([])

  // Gắn kèm danh sách sản phẩm trong từng đơn
  const orderIds = orders.map((o) => o.id)
  const marks = orderIds.map(() => '?').join(',')
  const { results: items } = await c.env.DB.prepare(
    `SELECT oi.*, p.image 
     FROM order_items oi 
     LEFT JOIN products p ON oi.product_id = p.id 
     WHERE oi.order_id IN (${marks})`
  )
    .bind(...orderIds)
    .all<any>()

  const itemsByOrder = new Map<number, any[]>()
  items.forEach((item) => {
    const arr = itemsByOrder.get(item.order_id) || []
    arr.push(item)
    itemsByOrder.set(item.order_id, arr)
  })

  const fullOrders = orders.map((o) => ({
    ...o,
    items: itemsByOrder.get(o.id) || [],
  }))

  return c.json(fullOrders)
})

app.put('/user/orders/:code/cancel', async (c) => {
  const authUser = await getAuthUser(c)
  if (!authUser) return c.json({ error: 'Chưa đăng nhập' }, 401)
  const code = c.req.param('code')

  const order = await c.env.DB.prepare(
    'SELECT id, status, user_id FROM orders WHERE order_code = ?'
  )
    .bind(code)
    .first<any>()

  if (!order || order.user_id !== authUser.sub) {
    return c.json({ error: 'Không tìm thấy đơn hàng của bạn' }, 404)
  }

  if (order.status !== 'pending') {
    return c.json({ error: 'Chỉ có thể hủy đơn hàng khi shop chưa tiến hành đóng gói thùng xốp' }, 400)
  }

  await c.env.DB.prepare(
    "UPDATE orders SET status = 'cancelled' WHERE id = ?"
  ).bind(order.id).run()

  return c.json({ success: true, message: 'Đã hủy đơn hàng thành công' })
})

// ==========================================
// 4. SMART CART (PERSISTENT ON LOGOUT)
// ==========================================

app.get('/cart', async (c) => {
  const authUser = await getAuthUser(c)
  if (authUser) {
    const lines = await readUserLines(c, authUser.sub)
    return c.json(await hydrate(c, lines))
  }
  const key = guestCartKey(c)
  if (!key) return c.json({ items: [], total: 0, count: 0 })
  return c.json(await hydrate(c, await readGuestLines(c, key)))
})

app.post('/cart/items', async (c) => {
  const { productId, qty } = await c.req.json<{ productId: number; qty?: number }>()
  const addQty = Math.max(1, Number(qty) || 1)
  const exists = await c.env.DB.prepare('SELECT 1 FROM products WHERE id = ?').bind(productId).first()
  if (!exists) return c.json({ error: 'Sản phẩm không tồn tại' }, 404)

  const authUser = await getAuthUser(c)
  if (authUser) {
    let lines = await readUserLines(c, authUser.sub)
    const line = lines.find((l) => l.productId === productId)
    if (line) line.qty = Math.min(99, line.qty + addQty)
    else lines.push({ productId, qty: Math.min(99, addQty) })
    await writeUserLines(c, authUser.sub, lines)
    return c.json(await hydrate(c, lines))
  }

  const key = guestCartKey(c)
  if (!key) return c.json({ error: 'missing x-cart-id' }, 400)
  const lines = await readGuestLines(c, key)
  const line = lines.find((l) => l.productId === productId)
  if (line) line.qty = Math.min(99, line.qty + addQty)
  else lines.push({ productId, qty: Math.min(99, addQty) })
  await writeGuestLines(c, key, lines)
  return c.json(await hydrate(c, lines))
})

app.put('/cart/items/:id', async (c) => {
  const productId = Number(c.req.param('id'))
  const { qty } = await c.req.json<{ qty: number }>()

  const authUser = await getAuthUser(c)
  if (authUser) {
    let lines = await readUserLines(c, authUser.sub)
    lines = qty > 0
      ? lines.map((l) => (l.productId === productId ? { ...l, qty: Math.min(qty, 99) } : l))
      : lines.filter((l) => l.productId !== productId)
    await writeUserLines(c, authUser.sub, lines)
    return c.json(await hydrate(c, lines))
  }

  const key = guestCartKey(c)
  if (!key) return c.json({ error: 'missing x-cart-id' }, 400)
  let lines = await readGuestLines(c, key)
  lines = qty > 0
    ? lines.map((l) => (l.productId === productId ? { ...l, qty: Math.min(qty, 99) } : l))
    : lines.filter((l) => l.productId !== productId)
  await writeGuestLines(c, key, lines)
  return c.json(await hydrate(c, lines))
})

app.delete('/cart', async (c) => {
  const authUser = await getAuthUser(c)
  if (authUser) {
    await c.env.DB.prepare('DELETE FROM user_carts WHERE user_id = ?').bind(authUser.sub).run()
    return c.json({ items: [], total: 0, count: 0 })
  }
  const key = guestCartKey(c)
  if (key) await c.env.CART.delete(key)
  return c.json({ items: [], total: 0, count: 0 })
})

// ==========================================
// 5. ORDER PLACEMENT & PUBLIC TRACKING
// ==========================================

type CreateOrderBody = {
  customerName: string
  customerPhone: string
  customerAddress: string
  city?: string
  latitude?: number
  longitude?: number
  notes?: string
  shippingMethod?: string
  paymentMethod?: string
}

app.post('/orders', async (c) => {
  const authUser = await getAuthUser(c)
  if (!authUser) {
    return c.json({
      error: 'Bạn cần đăng nhập tài khoản trước khi đặt hàng live pet để kích hoạt bảo hành sống 100%!',
      code: 'AUTH_REQUIRED',
    }, 401)
  }

  const body = await c.req.json<CreateOrderBody>()

  if (!body.customerName || !body.customerPhone || !body.customerAddress) {
    return c.json({ error: 'Vui lòng điền đầy đủ họ tên, số điện thoại và địa chỉ nhận hàng' }, 400)
  }

  const lines = await readUserLines(c, authUser.sub)
  if (!lines.length) {
    return c.json({ error: 'Giỏ hàng đang trống, không thể tạo đơn' }, 400)
  }

  const cart = await hydrate(c, lines)
  if (!cart.items.length) {
    return c.json({ error: 'Không tìm thấy sản phẩm trong giỏ' }, 400)
  }

  const rand = Math.floor(100000 + Math.random() * 900000)
  const orderCode = `FROG-${rand}`

  const orderResult = await c.env.DB.prepare(
    `INSERT INTO orders (
      order_code, user_id, customer_name, customer_phone, customer_address, city,
      latitude, longitude, notes, shipping_method, payment_method, total_amount, status
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending')`
  )
    .bind(
      orderCode,
      authUser.sub,
      body.customerName.trim(),
      body.customerPhone.trim(),
      body.customerAddress.trim(),
      body.city || 'Hà Nội',
      body.latitude !== undefined ? body.latitude : null,
      body.longitude !== undefined ? body.longitude : null,
      body.notes || 'Hàng ếch sống - xin nhẹ tay và giao nhanh',
      body.shippingMethod || 'Hỏa tốc đóng thùng xốp giữ ẩm',
      body.paymentMethod || 'COD',
      cart.total
    )
    .run()

  const orderId = orderResult.meta.last_row_id as number

  const itemInserts = cart.items.map((item) =>
    c.env.DB.prepare(
      `INSERT INTO order_items (order_id, product_id, product_name, quantity, unit_price)
       VALUES (?, ?, ?, ?, ?)`
    ).bind(orderId, item.product.id, item.product.name, item.qty, item.product.price)
  )
  await c.env.DB.batch(itemInserts)

  // Trừ tồn kho sản phẩm tương ứng
  const stockUpdates = cart.items.map((item) =>
    c.env.DB.prepare(
      'UPDATE products SET stock = MAX(0, stock - ?) WHERE id = ?'
    ).bind(item.qty, item.product.id)
  )
  await c.env.DB.batch(stockUpdates)

  // Xóa giỏ hàng sau khi đặt thành công
  await c.env.DB.prepare('DELETE FROM user_carts WHERE user_id = ?').bind(authUser.sub).run()

  // Cập nhật vị trí và thông tin mặc định cho user nếu chưa có
  if (body.latitude !== undefined && body.longitude !== undefined) {
    await c.env.DB.prepare(
      `UPDATE users 
       SET latitude = COALESCE(latitude, ?), 
           longitude = COALESCE(longitude, ?),
           address = CASE WHEN address = '' OR address IS NULL THEN ? ELSE address END,
           city = CASE WHEN city = '' OR city IS NULL THEN ? ELSE city END
       WHERE id = ?`
    ).bind(body.latitude, body.longitude, body.customerAddress.trim(), body.city || 'Hà Nội', authUser.sub).run()
  }

  return c.json({
    success: true,
    orderCode,
    orderId,
    totalAmount: cart.total,
    itemCount: cart.count,
    customerName: body.customerName,
    latitude: body.latitude,
    longitude: body.longitude,
    message: 'Đơn hàng ếch cảnh đã được tiếp nhận thành công! Shop sẽ liên hệ xác nhận và chuẩn bị thùng xốp bảo hành sống.',
  })
})

app.get('/orders/:code', async (c) => {
  const code = c.req.param('code')
  const order = await c.env.DB.prepare('SELECT * FROM orders WHERE order_code = ?')
    .bind(code)
    .first()

  if (!order) return c.json({ error: 'Không tìm thấy đơn hàng này' }, 404)

  const { results: items } = await c.env.DB.prepare(
    `SELECT oi.*, p.image 
     FROM order_items oi 
     LEFT JOIN products p ON oi.product_id = p.id 
     WHERE oi.order_id = ?`
  )
    .bind(order.id)
    .all()

  return c.json({ ...order, items })
})

// ==========================================
// 6. ADMIN PORTAL APIS (RBAC PROTECTED)
// ==========================================

const requireAdmin = async (c: Context): Promise<JwtPayload | null> => {
  const user = await getAuthUser(c)
  if (!user) return null
  if (user.role !== 'admin') return null
  return user
}

// 6.1. Thống kê tổng quan Dashboard
app.get('/admin/stats', async (c) => {
  const admin = await requireAdmin(c)
  if (!admin) return c.json({ error: 'Truy cập bị từ chối: Yêu cầu quyền Quản trị viên' }, 403)

  // Tổng doanh thu (không tính đơn hủy)
  const revenueRow = await c.env.DB.prepare(
    "SELECT COALESCE(SUM(total_amount), 0) as totalRevenue FROM orders WHERE status != 'cancelled'"
  ).first<{ totalRevenue: number }>()

  // Thống kê đơn theo trạng thái
  const { results: orderStats } = await c.env.DB.prepare(
    'SELECT status, COUNT(*) as count FROM orders GROUP BY status'
  ).all<{ status: string; count: number }>()

  // Tổng cá thể ếch trong kho
  const stockRow = await c.env.DB.prepare(
    'SELECT COALESCE(SUM(stock), 0) as totalStock, COUNT(*) as totalProducts FROM products'
  ).first<{ totalStock: number; totalProducts: number }>()

  // Tổng khách hàng
  const userRow = await c.env.DB.prepare(
    "SELECT COUNT(*) as totalUsers FROM users WHERE role = 'customer'"
  ).first<{ totalUsers: number }>()

  // Ếch sắp hết hàng (tồn kho <= 5)
  const { results: lowStock } = await c.env.DB.prepare(
    'SELECT id, name, stock, image FROM products WHERE stock <= 5 ORDER BY stock ASC LIMIT 6'
  ).all<any>()

  // Đơn hàng mới nhất
  const { results: recentOrders } = await c.env.DB.prepare(
    'SELECT id, order_code, customer_name, customer_phone, total_amount, status, created_at FROM orders ORDER BY id DESC LIMIT 6'
  ).all<any>()

  const ordersTotal = (orderStats || []).reduce((acc, curr) => acc + (curr.count || 0), 0)

  return c.json({
    totalRevenue: revenueRow?.totalRevenue || 0,
    revenue: revenueRow?.totalRevenue || 0,
    totalStock: stockRow?.totalStock || 0,
    totalProducts: stockRow?.totalProducts || 0,
    productsCount: stockRow?.totalProducts || 0,
    totalUsers: userRow?.totalUsers || 0,
    usersCount: userRow?.totalUsers || 0,
    ordersCount: ordersTotal,
    orderStats: orderStats || [],
    lowStock: lowStock || [],
    lowStockProducts: lowStock || [],
    recentOrders: recentOrders || [],
  })
})

// 6.2. Quản lý ếch cảnh (CRUD)
app.get('/admin/products', async (c) => {
  const admin = await requireAdmin(c)
  if (!admin) return c.json({ error: 'Truy cập bị từ chối' }, 403)

  const { results } = await c.env.DB.prepare(
    `SELECT p.*, c.name as category_name 
     FROM products p 
     LEFT JOIN categories c ON p.category_id = c.id 
     ORDER BY p.id DESC`
  ).all<Product>()
  return c.json(results)
})

app.post('/admin/products', async (c) => {
  const admin = await requireAdmin(c)
  if (!admin) return c.json({ error: 'Truy cập bị từ chối' }, 403)

  const body = await c.req.json<any>()
  if (!body.name || !body.price || !body.categoryId) {
    return c.json({ error: 'Vui lòng điền tên loài, danh mục và giá bán' }, 400)
  }

  const result = await c.env.DB.prepare(
    `INSERT INTO products (
      category_id, name, scientific_name, morph, price, original_price,
      size_stage, lifespan, difficulty, temperature, humidity, diet,
      description, care_guide, health_status, image, stock, is_featured
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
  )
    .bind(
      body.categoryId,
      body.name.trim(),
      body.scientificName?.trim() || '',
      body.morph?.trim() || '',
      body.price,
      body.originalPrice || body.price,
      body.sizeStage || 'Baby (3-4cm)',
      body.lifespan || '8-12 năm',
      body.difficulty || 'Dễ',
      body.temperature || '24 - 28°C',
      body.humidity || '70 - 85%',
      body.diet || 'Cá mồi, dế, sâu canxi',
      body.description?.trim() || '',
      body.careGuide?.trim() || '',
      body.healthStatus?.trim() || 'Bao sống 100% khi nhận hàng',
      body.image?.trim() || '/images/frogs/pacman-green.jpg',
      body.stock ?? 10,
      body.isFeatured ? 1 : 0
    )
    .run()

  return c.json({ success: true, id: result.meta.last_row_id })
})

app.put('/admin/products/:id', async (c) => {
  const admin = await requireAdmin(c)
  if (!admin) return c.json({ error: 'Truy cập bị từ chối' }, 403)
  const id = Number(c.req.param('id'))

  const body = await c.req.json<any>()
  await c.env.DB.prepare(
    `UPDATE products SET
      category_id = COALESCE(?, category_id),
      name = COALESCE(?, name),
      scientific_name = COALESCE(?, scientific_name),
      morph = COALESCE(?, morph),
      price = COALESCE(?, price),
      original_price = COALESCE(?, original_price),
      size_stage = COALESCE(?, size_stage),
      lifespan = COALESCE(?, lifespan),
      difficulty = COALESCE(?, difficulty),
      temperature = COALESCE(?, temperature),
      humidity = COALESCE(?, humidity),
      diet = COALESCE(?, diet),
      description = COALESCE(?, description),
      care_guide = COALESCE(?, care_guide),
      health_status = COALESCE(?, health_status),
      image = COALESCE(?, image),
      stock = COALESCE(?, stock),
      is_featured = COALESCE(?, is_featured)
    WHERE id = ?`
  )
    .bind(
      body.categoryId ?? null,
      body.name?.trim() ?? null,
      body.scientificName?.trim() ?? null,
      body.morph?.trim() ?? null,
      body.price ?? null,
      body.originalPrice ?? null,
      body.sizeStage ?? null,
      body.lifespan ?? null,
      body.difficulty ?? null,
      body.temperature ?? null,
      body.humidity ?? null,
      body.diet ?? null,
      body.description?.trim() ?? null,
      body.careGuide?.trim() ?? null,
      body.healthStatus?.trim() ?? null,
      body.image?.trim() ?? null,
      body.stock ?? null,
      body.isFeatured !== undefined ? (body.isFeatured ? 1 : 0) : null,
      id
    )
    .run()

  return c.json({ success: true, message: 'Cập nhật loài ếch thành công' })
})

app.delete('/admin/products/:id', async (c) => {
  const admin = await requireAdmin(c)
  if (!admin) return c.json({ error: 'Truy cập bị từ chối' }, 403)
  const id = Number(c.req.param('id'))

  await c.env.DB.prepare('DELETE FROM products WHERE id = ?').bind(id).run()
  return c.json({ success: true, message: 'Đã xóa sản phẩm' })
})

// 6.3. Quản lý Đơn hàng Live Pets
app.get('/admin/orders', async (c) => {
  const admin = await requireAdmin(c)
  if (!admin) return c.json({ error: 'Truy cập bị từ chối' }, 403)

  const status = c.req.query('status')
  let sql = 'SELECT * FROM orders'
  const params: string[] = []
  if (status && status !== 'all') {
    sql += ' WHERE status = ?'
    params.push(status)
  }
  sql += ' ORDER BY id DESC'

  const stmt = c.env.DB.prepare(sql)
  const { results: orders } = params.length ? await stmt.bind(...params).all<any>() : await stmt.all<any>()

  // Lấy chi tiết items cho các đơn
  if (orders && orders.length) {
    const ids = orders.map((o) => o.id)
    const marks = ids.map(() => '?').join(',')
    const { results: items } = await c.env.DB.prepare(
      `SELECT oi.*, p.image 
       FROM order_items oi 
       LEFT JOIN products p ON oi.product_id = p.id 
       WHERE oi.order_id IN (${marks})`
    )
      .bind(...ids)
      .all<any>()

    const map = new Map<number, any[]>()
    items.forEach((i) => {
      const arr = map.get(i.order_id) || []
      arr.push(i)
      map.set(i.order_id, arr)
    })

    return c.json(orders.map((o) => ({ ...o, items: map.get(o.id) || [] })))
  }

  return c.json([])
})

app.put('/admin/orders/:id/status', async (c) => {
  const admin = await requireAdmin(c)
  if (!admin) return c.json({ error: 'Truy cập bị từ chối' }, 403)
  const id = Number(c.req.param('id'))
  const { status } = await c.req.json<{ status: string }>()

  const allowed = ['pending', 'confirmed', 'packing', 'shipping', 'completed', 'cancelled']
  if (!allowed.includes(status)) {
    return c.json({ error: 'Trạng thái đơn hàng không hợp lệ' }, 400)
  }

  await c.env.DB.prepare('UPDATE orders SET status = ? WHERE id = ?').bind(status, id).run()
  return c.json({ success: true, message: `Đã cập nhật trạng thái đơn sang ${status}` })
})

// 6.4. Quản lý Tài khoản người dùng
app.get('/admin/users', async (c) => {
  const admin = await requireAdmin(c)
  if (!admin) return c.json({ error: 'Truy cập bị từ chối' }, 403)

  const { results } = await c.env.DB.prepare(
    `SELECT u.id, u.email, u.full_name, u.phone, u.address, u.city, u.role, u.status, u.created_at,
            COUNT(o.id) as order_count,
            COALESCE(SUM(CASE WHEN o.status != 'cancelled' THEN o.total_amount ELSE 0 END), 0) as total_spent
     FROM users u
     LEFT JOIN orders o ON o.user_id = u.id
     GROUP BY u.id
     ORDER BY u.id ASC`
  ).all<any>()

  return c.json(results)
})

app.put('/admin/users/:id/status', async (c) => {
  const admin = await requireAdmin(c)
  if (!admin) return c.json({ error: 'Truy cập bị từ chối' }, 403)
  const id = Number(c.req.param('id'))
  const { status } = await c.req.json<{ status: string }>()

  if (status !== 'active' && status !== 'blocked') {
    return c.json({ error: 'Trạng thái không hợp lệ' }, 400)
  }

  await c.env.DB.prepare('UPDATE users SET status = ? WHERE id = ?').bind(status, id).run()
  return c.json({ success: true, message: 'Đã cập nhật trạng thái tài khoản' })
})

export default app
