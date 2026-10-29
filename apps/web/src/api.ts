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
  primary_diet_json?: string
  primary_diet?: string[]
  feeding_frequency: string
  supplements_guide: string
  handling_safety: string
  toxicity_warning: string
  common_health_issues: string
  critical_warnings_json?: string
  critical_warnings?: string[]
  ai_knowledge_snippet: string
  ai_facts_json?: string
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

export type CartItem = {
  product: Product
  qty: number
}

export type Cart = {
  items: CartItem[]
  total: number
  count: number
}

export type CreateOrderInput = {
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

export type OrderResponse = {
  success: boolean
  orderCode: string
  orderId: number
  totalAmount: number
  itemCount: number
  customerName: string
  latitude?: number
  longitude?: number
  message: string
}

export type OrderDetail = {
  id: number
  user_id?: number | null
  order_code: string
  customer_name: string
  customer_phone: string
  customer_address: string
  city: string
  latitude?: number | null
  longitude?: number | null
  notes: string
  shipping_method: string
  payment_method: string
  total_amount: number
  status: string
  created_at: string
  user_email?: string
  user_full_name?: string
  items: {
    id: number
    product_id: number
    product_name: string
    quantity: number
    unit_price: number
  }[]
}

export type User = {
  id: number
  email: string
  full_name: string
  phone: string
  address: string
  city: string
  google_id?: string | null
  avatar_url?: string
  latitude?: number | null
  longitude?: number | null
  has_password?: boolean
  role: 'admin' | 'customer'
  status: 'active' | 'suspended'
  created_at: string
  orders_count?: number
  total_spent?: number
}

export type AuthResponse = {
  user: User
  token: string
}

export type AdminStats = {
  totalRevenue: number
  totalStock: number
  totalProducts: number
  totalUsers: number
  ordersCount: number
  orderStats: { status: string; count: number }[]
  lowStock: any[]
  recentOrders: OrderDetail[]
  revenue?: number
  productsCount?: number
  usersCount?: number
  lowStockProducts?: Product[]
}

const TOKEN_KEY = 'frog-token'
export const getStoredToken = () => {
  try {
    return localStorage.getItem(TOKEN_KEY)
  } catch {
    return null
  }
}

export const setStoredToken = (token: string | null) => {
  try {
    if (token) localStorage.setItem(TOKEN_KEY, token)
    else localStorage.removeItem(TOKEN_KEY)
  } catch {
    // Ignore localStorage errors
  }
}

const cartId = (() => {
  try {
    let id = localStorage.getItem('frog-cart-id')
    if (!id) localStorage.setItem('frog-cart-id', (id = crypto.randomUUID()))
    return id
  } catch {
    return crypto.randomUUID()
  }
})()

async function req<T>(path: string, init: RequestInit = {}): Promise<T> {
  const token = getStoredToken()
  const headers: Record<string, string> = {
    'content-type': 'application/json',
    'x-cart-id': cartId,
    ...(init.headers as Record<string, string> || {}),
  }
  if (token) {
    headers['authorization'] = `Bearer ${token}`
  }

  const res = await fetch(`/api${path}`, {
    ...init,
    headers,
  })
  if (!res.ok) {
    const errorData = await res.json().catch(() => null)
    const msg = errorData?.error || `${res.status} ${res.statusText}`
    throw new Error(msg)
  }
  return res.json()
}

export const api = {
  // Public catalog
  categories: () => req<Category[]>('/categories'),
  products: (params: { category?: string | number; difficulty?: string; habitat?: string; search?: string; sort?: string } = {}) => {
    const query = new URLSearchParams()
    if (params.category) query.set('category', String(params.category))
    if (params.difficulty) query.set('difficulty', params.difficulty)
    if (params.habitat) query.set('habitat', params.habitat)
    if (params.search) query.set('search', params.search)
    if (params.sort) query.set('sort', params.sort)
    const qs = query.toString()
    return req<Product[]>(`/products${qs ? `?${qs}` : ''}`)
  },
  product: (id: number) => req<Product>(`/products/${id}`),
  productDetail: (idOrSlug: string | number) => req<Product>(`/products/${idOrSlug}`),
  aiKnowledge: () => req<any>('/ai/frogs/knowledge'),
  aiFrogDetail: (slug: string, format?: string) => req<any>(`/ai/frogs/${slug}${format ? `?format=${format}` : ''}`),

  // Cart (Persistent when logged in, KV when guest)
  cart: () => req<Cart>('/cart'),
  add: (productId: number, qty?: number) =>
    req<Cart>('/cart/items', { method: 'POST', body: JSON.stringify({ productId, qty: qty || 1 }) }),
  setQty: (productId: number, qty: number) =>
    req<Cart>(`/cart/items/${productId}`, { method: 'PUT', body: JSON.stringify({ qty }) }),
  clear: () => req<Cart>('/cart', { method: 'DELETE' }),

  // Orders
  createOrder: (data: CreateOrderInput) =>
    req<OrderResponse>('/orders', { method: 'POST', body: JSON.stringify(data) }),
  trackOrder: (code: string) => req<OrderDetail>(`/orders/${encodeURIComponent(code)}`),

  // Auth
  register: (data: { email: string; password: string; full_name: string; phone?: string; address?: string }) =>
    req<AuthResponse>('/auth/register', { method: 'POST', body: JSON.stringify(data) }),
  login: (data: { email: string; password: string }) =>
    req<AuthResponse>('/auth/login', { method: 'POST', body: JSON.stringify(data) }),
  loginGoogle: (credential: string) =>
    req<AuthResponse>('/auth/google', { method: 'POST', body: JSON.stringify({ credential }) }),
  getMe: () => req<{ user: User }>('/auth/me'),

  // Customer Profile, Google Linking & Orders
  linkGoogle: (credential: string) =>
    req<{ success: boolean; message: string; user: User }>('/user/link-google', { method: 'POST', body: JSON.stringify({ credential }) }),
  unlinkGoogle: () =>
    req<{ success: boolean; message: string }>('/user/unlink-google', { method: 'POST' }),
  updateProfile: (data: { fullName?: string; phone?: string; address?: string; city?: string; avatarUrl?: string; latitude?: number; longitude?: number }) =>
    req<{ success: boolean; user: User }>('/user/profile', { method: 'PUT', body: JSON.stringify(data) }),
  changePassword: (data: { oldPassword: string; newPassword: string }) =>
    req<{ success: boolean; message: string }>('/user/password', { method: 'PUT', body: JSON.stringify(data) }),
  myOrders: () => req<OrderDetail[]>('/user/orders'),
  cancelMyOrder: (code: string) =>
    req<{ success: boolean; message: string }>(`/user/orders/${encodeURIComponent(code)}/cancel`, { method: 'POST' }),

  // Admin Portal (Protected by requireAdmin)
  adminStats: () => req<AdminStats>('/admin/stats'),
  adminProducts: () => req<Product[]>('/admin/products'),
  adminCreateProduct: (data: Partial<Product>) =>
    req<{ success: boolean; id: number }>('/admin/products', { method: 'POST', body: JSON.stringify(data) }),
  adminUpdateProduct: (id: number, data: Partial<Product>) =>
    req<{ success: boolean }>('/admin/products/' + id, { method: 'PUT', body: JSON.stringify(data) }),
  adminDeleteProduct: (id: number) =>
    req<{ success: boolean }>('/admin/products/' + id, { method: 'DELETE' }),
  adminOrders: (status?: string) =>
    req<OrderDetail[]>('/admin/orders' + (status ? `?status=${status}` : '')),
  adminUpdateOrderStatus: (id: number, status: string) =>
    req<{ success: boolean }>('/admin/orders/' + id + '/status', { method: 'PUT', body: JSON.stringify({ status }) }),
  adminUsers: () => req<User[]>('/admin/users'),
  adminUpdateUserStatus: (id: number, status: 'active' | 'suspended') =>
    req<{ success: boolean }>('/admin/users/' + id + '/status', { method: 'PUT', body: JSON.stringify({ status }) }),
}

export const vnd = (n: number) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(n)
