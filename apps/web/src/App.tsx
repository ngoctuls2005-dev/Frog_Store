import { useEffect, useState } from 'react'
import {
  api,
  vnd,
  getStoredToken,
  setStoredToken,
  type Product,
  type Category,
  type Cart,
  type CreateOrderInput,
  type OrderResponse,
  type OrderDetail,
  type User as UserType,
} from './api'
import { AdminPortal } from './AdminPortal'
import { ProfileModal } from './ProfileModal'
import { FrogDetailPage } from './FrogDetailPage'
import { FrogAiChatbot } from './FrogAiChatbot'
import { PolicyModal, type PolicyType } from './PolicyModal'
import {
  ShoppingBag,
  Search,
  Truck,
  ShieldCheck,
  HeartPulse,
  Sparkles,
  Plus,
  Trash2,
  CheckCircle2,
  PackageSearch,
  User,
  LogOut,
  FileText,
  ShieldAlert,
  Compass,
  MapPin,
  Lock,
  AlertCircle,
  Info,
  X,
} from 'lucide-react'

const emptyCart: Cart = { items: [], total: 0, count: 0 }

type Toast = { id: string; text: string; type: 'success' | 'error' | 'info' }

export default function App() {
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [cart, setCart] = useState<Cart>(emptyCart)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // Toast Notification System
  const [toasts, setToasts] = useState<Toast[]>([])
  const showToast = (text: string, type: 'success' | 'error' | 'info' = 'success') => {
    const id = crypto.randomUUID()
    setToasts((prev) => [...prev, { id, text, type }])
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id))
    }, 3500)
  }

  // User auth state
  const [currentUser, setCurrentUser] = useState<UserType | null>(null)
  const [authOpen, setAuthOpen] = useState(false)
  const [authTab, setAuthTab] = useState<'login' | 'register'>('login')
  const [authEmail, setAuthEmail] = useState('')
  const [authPassword, setAuthPassword] = useState('')
  const [regName, setRegName] = useState('')
  const [regPhone, setRegPhone] = useState('')
  const [regAddress, setRegAddress] = useState('')
  const [authError, setAuthError] = useState('')
  const [authLoading, setAuthLoading] = useState(false)

  // My Orders modal
  const [myOrdersOpen, setMyOrdersOpen] = useState(false)
  const [myOrders, setMyOrders] = useState<OrderDetail[]>([])
  const [myOrdersLoading, setMyOrdersLoading] = useState(false)

  // Profile modal
  const [profileOpen, setProfileOpen] = useState(false)

  // Admin Portal modal
  const [adminPortalOpen, setAdminPortalOpen] = useState(false)

  // Filter states
  const [selectedCat, setSelectedCat] = useState<string>('all')
  const [selectedDiff, setSelectedDiff] = useState<string>('all')
  const [selectedHabitat, setSelectedHabitat] = useState<string>('all')
  const [selectedPrice, setSelectedPrice] = useState<string>('all')
  const [search, setSearch] = useState<string>('')
  const [sortBy, setSortBy] = useState<string>('featured')

  // Hash Routing for Frog Detail Page
  const [activeDetailSlug, setActiveDetailSlug] = useState<string | null>(null)

  // Interactive Frog Matcher Quiz State
  const [quizOpen, setQuizOpen] = useState(false)
  const [quizStep, setQuizStep] = useState(1)
  const [quizAnswers, setQuizAnswers] = useState<{ exp?: string; habitat?: string; care?: string }>({})
  const [quizRecommendation, setQuizRecommendation] = useState<Product | null>(null)

  // Modals & Drawers
  const [policyOpen, setPolicyOpen] = useState(false)
  const [activePolicy, setActivePolicy] = useState<PolicyType>('privacy')
  const [cartOpen, setCartOpen] = useState(false)
  const [checkoutOpen, setCheckoutOpen] = useState(false)
  const [pendingCheckout, setPendingCheckout] = useState(false)
  const [trackOpen, setTrackOpen] = useState(false)
  const [trackCode, setTrackCode] = useState('')
  const [trackedOrder, setTrackedOrder] = useState<OrderDetail | null>(null)
  const [trackError, setTrackError] = useState('')
  const [orderResult, setOrderResult] = useState<OrderResponse | null>(null)

  // Checkout form & GPS
  const [checkoutForm, setCheckoutForm] = useState<CreateOrderInput>({
    customerName: '',
    customerPhone: '',
    customerAddress: '',
    city: 'Hà Nội',
    notes: 'Giao giờ hành chính, gọi trước khi giao',
    shippingMethod: 'Hỏa tốc đóng thùng xốp giữ ẩm (Khuyên dùng)',
    paymentMethod: 'COD (Thanh toán khi nhận & đồng kiểm ếch sống)',
  })
  const [gpsLocating, setGpsLocating] = useState(false)
  const [ordering, setOrdering] = useState(false)

  // Fetch initial data & restore user
  useEffect(() => {
    Promise.all([api.categories(), api.products(), api.cart()])
      .then(([cats, prods, c]) => {
        setCategories(cats)
        setProducts(prods)
        setCart(c)
        setLoading(false)
      })
      .catch((e) => {
        setError(e.message)
        setLoading(false)
      })

    const token = getStoredToken()
    if (token) {
      api.getMe()
        .then((res) => {
          setCurrentUser(res.user)
          if (res.user.full_name) {
            setCheckoutForm((prev) => ({
              ...prev,
              customerName: res.user.full_name,
              customerPhone: res.user.phone || prev.customerPhone,
              customerAddress: res.user.address || prev.customerAddress,
              city: res.user.city || prev.city,
              latitude: res.user.latitude || undefined,
              longitude: res.user.longitude || undefined,
            }))
          }
        })
        .catch(() => {
          setStoredToken(null)
          setCurrentUser(null)
        })
    }
    // Hash Routing listener
    const handleHashChange = () => {
      const hash = window.location.hash
      const match = hash.match(/^#\/frogs?\/([\w-]+)/)
      if (match && match[1]) {
        setActiveDetailSlug(match[1])
        window.scrollTo({ top: 0, behavior: 'smooth' })
      } else {
        setActiveDetailSlug(null)
      }
    }

    handleHashChange()
    window.addEventListener('hashchange', handleHashChange)
    return () => window.removeEventListener('hashchange', handleHashChange)
  }, [])

  // Refetch when filters change
  const fetchFilteredProducts = (
    cat: string,
    diff: string,
    habitat: string,
    q: string,
    sort: string,
    price: string
  ) => {
    api
      .products({
        category: cat !== 'all' ? cat : undefined,
        difficulty: diff !== 'all' ? diff : undefined,
        habitat: habitat !== 'all' ? habitat : undefined,
        search: q.trim() || undefined,
        sort: sort !== 'featured' ? sort : undefined,
      })
      .then((prods) => {
        let filtered = prods
        if (price === 'under_500') {
          filtered = filtered.filter((p) => p.price < 500000)
        } else if (price === '500_1000') {
          filtered = filtered.filter((p) => p.price >= 500000 && p.price <= 1000000)
        } else if (price === 'over_1000') {
          filtered = filtered.filter((p) => p.price > 1000000)
        }
        setProducts(filtered)
      })
      .catch((e) => setError(e.message))
  }

  const handleCategoryChange = (catSlug: string) => {
    setSelectedCat(catSlug)
    fetchFilteredProducts(catSlug, selectedDiff, selectedHabitat, search, sortBy, selectedPrice)
  }

  const handleDiffChange = (diff: string) => {
    setSelectedDiff(diff)
    fetchFilteredProducts(selectedCat, diff, selectedHabitat, search, sortBy, selectedPrice)
  }

  const handleHabitatChange = (habitat: string) => {
    setSelectedHabitat(habitat)
    fetchFilteredProducts(selectedCat, selectedDiff, habitat, search, sortBy, selectedPrice)
  }

  const handlePriceChange = (price: string) => {
    setSelectedPrice(price)
    fetchFilteredProducts(selectedCat, selectedDiff, selectedHabitat, search, sortBy, price)
  }

  const handleSortChange = (sort: string) => {
    setSortBy(sort)
    fetchFilteredProducts(selectedCat, selectedDiff, selectedHabitat, search, sort, selectedPrice)
  }

  const handleSearchChange = (q: string) => {
    setSearch(q)
    fetchFilteredProducts(selectedCat, selectedDiff, selectedHabitat, q, sortBy, selectedPrice)
  }

  const resetFilters = () => {
    setSelectedCat('all')
    setSelectedDiff('all')
    setSelectedHabitat('all')
    setSelectedPrice('all')
    setSearch('')
    setSortBy('featured')
    fetchFilteredProducts('all', 'all', 'all', '', 'featured', 'all')
  }

  // Chuyển hướng về trang chủ tức thì khi bấm Logo Frog Store
  const handleGoHome = () => {
    if (window.location.hash && window.location.hash !== '#/') {
      window.location.hash = '#/'
    }
    setActiveDetailSlug(null)
    setTrackOpen(false)
    setMyOrdersOpen(false)
    setProfileOpen(false)
    setAdminPortalOpen(false)
    setQuizOpen(false)
    setAuthOpen(false)
    setCartOpen(false)
    setCheckoutOpen(false)
    setPolicyOpen(false)
    resetFilters()
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  // Quiz Handlers
  const handleStartQuiz = () => {
    setQuizStep(1)
    setQuizAnswers({})
    setQuizRecommendation(null)
    setQuizOpen(true)
  }

  const handleAnswerQuiz = (key: 'exp' | 'habitat' | 'care', value: string) => {
    const nextAnswers = { ...quizAnswers, [key]: value }
    setQuizAnswers(nextAnswers)
    if (quizStep < 3) {
      setQuizStep(quizStep + 1)
    } else {
      let match: Product | undefined
      if (nextAnswers.exp === 'beginner') {
        match = products.find((p) => p.slug === 'pacman-green' || p.slug === 'tree-whites-dumpy')
      } else if (nextAnswers.habitat === 'arboreal') {
        match = products.find((p) => p.slug === 'tree-red-eyed' || p.slug === 'tree-amazon-milk')
      } else if (nextAnswers.exp === 'expert' || nextAnswers.care === 'high') {
        match = products.find((p) => p.slug === 'dart-azureus' || p.slug === 'dart-bumblebee')
      } else if (nextAnswers.habitat === 'paludarium') {
        match = products.find((p) => p.slug === 'mossy-vietnamese' || p.slug === 'fire-bellied-oriental')
      } else {
        match = products.find((p) => p.slug === 'pacman-albino') || products[0]
      }
      setQuizRecommendation(match || products[0] || null)
      setQuizStep(4)
    }
  }

  // Cart operations
  const runCart = (p: Promise<Cart>) =>
    p.then(setCart).catch((e) => setError(e.message))

  const addToCart = (productId: number) => {
    runCart(api.add(productId))
    setCartOpen(true)
    showToast('Đã thêm bé ếch vào giỏ hàng!', 'info')
  }

  // Auth Handlers
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setAuthLoading(true)
    setAuthError('')
    try {
      const res = await api.login({ email: authEmail, password: authPassword })
      setStoredToken(res.token)
      setCurrentUser(res.user)
      setAuthOpen(false)
      setAuthEmail('')
      setAuthPassword('')
      // Reload cart
      const updatedCart = await api.cart()
      setCart(updatedCart)
      setCheckoutForm((prev) => ({
        ...prev,
        customerName: res.user.full_name || prev.customerName,
        customerPhone: res.user.phone || prev.customerPhone,
        customerAddress: res.user.address || prev.customerAddress,
        city: res.user.city || prev.city,
        latitude: res.user.latitude || undefined,
        longitude: res.user.longitude || undefined,
      }))
      showToast(`Đăng nhập thành công! Chào mừng ${res.user.full_name || res.user.email}`)
      if (pendingCheckout) {
        setPendingCheckout(false)
        setCheckoutOpen(true)
      }
    } catch (err: any) {
      setAuthError(err.message || 'Đăng nhập không thành công!')
      showToast(err.message || 'Đăng nhập không thành công!', 'error')
    } finally {
      setAuthLoading(false)
    }
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setAuthLoading(true)
    setAuthError('')
    try {
      const res = await api.register({
        email: authEmail,
        password: authPassword,
        full_name: regName,
        phone: regPhone,
        address: regAddress,
      })
      setStoredToken(res.token)
      setCurrentUser(res.user)
      setAuthOpen(false)
      setAuthEmail('')
      setAuthPassword('')
      setRegName('')
      setRegPhone('')
      setRegAddress('')
      const updatedCart = await api.cart()
      setCart(updatedCart)
      setCheckoutForm((prev) => ({
        ...prev,
        customerName: res.user.full_name,
        customerPhone: res.user.phone || prev.customerPhone,
        customerAddress: res.user.address || prev.customerAddress,
      }))
      showToast('Đăng ký tài khoản Frog Store thành công!')
      if (pendingCheckout) {
        setPendingCheckout(false)
        setCheckoutOpen(true)
      }
    } catch (err: any) {
      setAuthError(err.message || 'Đăng ký không thành công!')
      showToast(err.message || 'Đăng ký không thành công!', 'error')
    } finally {
      setAuthLoading(false)
    }
  }

  // Google Login Handler
  const handleGoogleLogin = async () => {
    setAuthLoading(true)
    setAuthError('')
    try {
      const promptEmail = authEmail.trim() || 'khachhang.google@gmail.com'
      const gCredential = JSON.stringify({
        googleId: `google-user-${Math.floor(100000 + Math.random() * 900000)}`,
        email: promptEmail,
        name: regName.trim() || 'Khách Hàng Google',
        avatar: `https://api.dicebear.com/7.x/bottts/svg?seed=${promptEmail}`,
      })
      const res = await api.loginGoogle(gCredential)
      setStoredToken(res.token)
      setCurrentUser(res.user)
      setAuthOpen(false)
      const updatedCart = await api.cart()
      setCart(updatedCart)
      if (pendingCheckout) {
        setPendingCheckout(false)
        setCheckoutOpen(true)
      }
      setCheckoutForm((prev) => ({
        ...prev,
        customerName: res.user.full_name || prev.customerName,
        customerPhone: res.user.phone || prev.customerPhone,
        customerAddress: res.user.address || prev.customerAddress,
        city: res.user.city || prev.city,
        latitude: res.user.latitude || undefined,
        longitude: res.user.longitude || undefined,
      }))
      showToast(`Đăng nhập Google thành công! Chào mừng ${res.user.full_name}`)
    } catch (err: any) {
      setAuthError(err.message || 'Lỗi đăng nhập Google')
      showToast(err.message || 'Lỗi đăng nhập Google', 'error')
    } finally {
      setAuthLoading(false)
    }
  }

  const handleLogout = async () => {
    setStoredToken(null)
    setCurrentUser(null)
    const guestCart = await api.cart()
    setCart(guestCart)
    showToast('Đã đăng xuất. Dữ liệu tài khoản của bạn được bảo toàn an toàn!')
  }


  // GPS Geolocation Handler in Checkout
  const handleScanGpsLocation = () => {
    if (!navigator.geolocation) {
      showToast('Trình duyệt không hỗ trợ quét GPS', 'error')
      return
    }
    setGpsLocating(true)
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const latitude = Number(pos.coords.latitude.toFixed(6))
        const longitude = Number(pos.coords.longitude.toFixed(6))
        
        let roadAddress = checkoutForm.customerAddress
        let cityName = checkoutForm.city || 'Hà Nội'

        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`,
            { headers: { 'User-Agent': 'FrogStore/1.0' } }
          )
          if (res.ok) {
            const data = await res.json()
            if (data.address) {
              const road = data.address.road || data.address.suburb || ''
              const quarter = data.address.neighbourhood || data.address.quarter || ''
              const district = data.address.city_district || data.address.district || ''
              const detectedCity = data.address.city || data.address.state || 'Hà Nội'
              const formatted = [road, quarter, district].filter(Boolean).join(', ')
              if (formatted) roadAddress = formatted
              if (detectedCity) cityName = detectedCity
            }
          }
        } catch {
          // Keep manual if Nominatim is unreachable
        }

        setCheckoutForm((prev) => ({
          ...prev,
          customerAddress: roadAddress || prev.customerAddress,
          city: cityName,
          latitude,
          longitude,
        }))
        setGpsLocating(false)
        showToast(`📍 Đã quét GPS chính xác: ${latitude}, ${longitude}!`)
      },
      (err) => {
        setGpsLocating(false)
        showToast('Không thể lấy vị trí GPS (vui lòng cho phép quyền truy cập vị trí)', 'error')
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    )
  }

  // My Orders
  const handleOpenMyOrders = async () => {
    setMyOrdersOpen(true)
    setMyOrdersLoading(true)
    try {
      const orders = await api.myOrders()
      setMyOrders(orders)
    } catch (err: any) {
      showToast(err.message || 'Lỗi tải danh sách đơn hàng', 'error')
    } finally {
      setMyOrdersLoading(false)
    }
  }

  const handleCancelMyOrder = async (orderCode: string) => {
    if (!confirm(`Bạn có chắc chắn muốn hủy đơn hàng ${orderCode}?`)) return
    try {
      await api.cancelMyOrder(orderCode)
      const orders = await api.myOrders()
      setMyOrders(orders)
      showToast(`Đã hủy thành công đơn hàng ${orderCode}!`)
    } catch (err: any) {
      showToast(err.message || 'Không thể hủy đơn hàng', 'error')
    }
  }

  // Checkout submit
  const handleCheckoutSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!currentUser) {
      setCheckoutOpen(false)
      setAuthOpen(true)
      showToast('Vui lòng đăng nhập trước khi đặt hàng để bảo hành sống 100%!', 'error')
      return
    }

    if (!checkoutForm.customerName || !checkoutForm.customerPhone || !checkoutForm.customerAddress) {
      showToast('Vui lòng điền họ tên, số điện thoại và địa chỉ nhận hàng!', 'error')
      return
    }

    setOrdering(true)
    try {
      const res = await api.createOrder(checkoutForm)
      setOrderResult(res)
      setCart(emptyCart)
      setCheckoutOpen(false)
      setCartOpen(false)
      showToast(`Đặt mua thành công! Mã đơn: ${res.orderCode}`)
    } catch (err: any) {
      showToast(err.message || 'Lỗi khi tạo đơn hàng!', 'error')
    } finally {
      setOrdering(false)
    }
  }

  // Tracking submit
  const handleTrackSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!trackCode.trim()) return
    setTrackError('')
    setTrackedOrder(null)
    try {
      const order = await api.trackOrder(trackCode.trim())
      setTrackedOrder(order)
    } catch (err: any) {
      setTrackError('Không tìm thấy đơn hàng hoặc mã đơn không đúng!')
    }
  }

  const getDiffBadgeClass = (diff: string) => {
    if (diff === 'Dễ') return 'badge-tag badge-easy'
    if (diff === 'Trung bình') return 'badge-tag badge-medium'
    return 'badge-tag badge-hard'
  }

  return (
    <>
      {/* 0. Toast Notifications Container */}
      <div className="toast-container">
        {toasts.map((t) => (
          <div key={t.id} className={`toast-card toast-${t.type}`}>
            {t.type === 'success' && <CheckCircle2 size={18} color="#10b981" />}
            {t.type === 'error' && <AlertCircle size={18} color="#f87171" />}
            {t.type === 'info' && <Info size={18} color="#38bdf8" />}
            <span>{t.text}</span>
          </div>
        ))}
      </div>

      {/* 1. Announcement Bar */}
      <div className="announcement-bar">
        <span>🐸 FROG STORE VIỆT NAM — Bách khoa & Cung cấp 26 loài ếch cảnh sống thuần chủng</span>
        <span>📞 Tư vấn kỹ thuật & Đặt hàng nhanh: 0988.123.456</span>
      </div>

      {/* 2. Top Navigation */}
      <header className="topbar">
        <div
          className="brand"
          onClick={handleGoHome}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault()
              handleGoHome()
            }
          }}
          role="button"
          tabIndex={0}
          aria-label="Về trang chủ Frog Store"
          title="Về trang chủ Frog Store"
        >
          <span className="brand-icon">🐸</span>
          <div className="brand-text">
            <h1>FROG STORE</h1>
            <p>Ếch Cảnh Sống &amp; Bán Cạn</p>
          </div>
        </div>

        <div className="search-bar">
          <Search className="search-icon" size={18} />
          <input
            type="text"
            aria-label="Tìm kiếm loài ếch theo tên hoặc phân loại"
            placeholder="Tìm theo tên loài, tên khoa học (Pacman, Dumpy, Dart, Mossy...)"
            value={search}
            onChange={(e) => handleSearchChange(e.target.value)}
          />
          {search && (
            <button
              className="btn-search-clear"
              onClick={() => handleSearchChange('')}
              title="Xóa nhanh từ khóa tìm kiếm"
            >
              <X size={14} />
            </button>
          )}
        </div>

        <div className="nav-actions">
          <button className="track-btn" onClick={() => setTrackOpen(true)}>
            <PackageSearch size={18} />
            <span>Tra cứu đơn</span>
          </button>

          {!currentUser ? (
            <button className="track-btn" onClick={() => { setAuthError(''); setAuthOpen(true) }}>
              <User size={18} />
              <span>Đăng nhập</span>
            </button>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              {currentUser.role === 'admin' && (
                <button className="btn-admin-portal" onClick={() => setAdminPortalOpen(true)}>
                  <ShieldAlert size={16} color="#4ade80" />
                  <span>Quản Trị Admin</span>
                </button>
              )}

              <button className="track-btn" onClick={handleOpenMyOrders}>
                <FileText size={18} />
                <span>Đơn mua</span>
              </button>

              <button
                className="user-btn"
                onClick={() => setProfileOpen(true)}
                title="Nhấn để xem và chỉnh sửa Hồ sơ cá nhân"
              >
                <img
                  src={currentUser.avatar_url || `https://api.dicebear.com/7.x/bottts/svg?seed=${currentUser.email}`}
                  alt={currentUser.full_name}
                  style={{ width: 22, height: 22, borderRadius: '50%', objectFit: 'cover' }}
                />
                <span>{currentUser.full_name?.split(' ')[0] || currentUser.email.split('@')[0]}</span>
                <span className={`role-pill ${currentUser.role === 'admin' ? 'role-admin' : 'role-customer'}`}>
                  {currentUser.role === 'admin' ? 'ADMIN' : 'KHÁCH'}
                </span>
              </button>

              <button
                onClick={handleLogout}
                title="Đăng xuất"
                style={{ background: '#f1f5f9', border: '1px solid #e2e8f0', borderRadius: '50%', width: 34, height: 34, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#64748b' }}
              >
                <LogOut size={16} />
              </button>
            </div>
          )}

          <button className="cart-btn" onClick={() => setCartOpen(true)} aria-label="Mở giỏ hàng">
            <ShoppingBag size={20} />
            <span>Giỏ hàng</span>
            {cart.count > 0 && <span className="badge">{cart.count}</span>}
          </button>
        </div>
      </header>

      {/* 3. Compact Hero Banner (Tối ưu chiều cao ~190px giúp hiển thị sản phẩm ngay màn hình đầu) */}
      {!activeDetailSlug && (
        <section className="hero hero-compact">
          <div className="hero-content">
            <div className="hero-badge-row">
              <div className="hero-pill">
                <Sparkles size={14} />
                <span>Thế Giới Lưỡng Cư Nhập Khẩu &amp; Nhân Giống Thuần Chuẩn</span>
              </div>
              <button className="btn-hero-quiz-compact" onClick={handleStartQuiz} title="Trắc nghiệm 30 giây tìm ếch phù hợp">
                <Sparkles size={14} />
                <span>🎯 Trợ Thủ Tìm Ếch (Quiz 30s)</span>
              </button>
            </div>

            <h2 className="hero-title-compact">THẾ GIỚI ẾCH CẢNH SỐNG ĐẲNG CẤP</h2>
            <p className="hero-desc-compact">
              Bách khoa &amp; cung cấp 26 loài ếch Pacman, Ếch Cây, Phi Tiêu Độc thuần chủng khỏe mạnh, bảo hành sống 100% giao hỏa tốc toàn quốc.
            </p>

            <div className="hero-features-compact">
              <div className="feature-tag-compact">
                <ShieldCheck size={15} color="#4ade80" />
                <span>Bảo hành sống 100%</span>
              </div>
              <div className="feature-tag-compact">
                <Truck size={15} color="#60a5fa" />
                <span>Thùng xốp giữ ẩm hỏa tốc</span>
              </div>
              <div className="feature-tag-compact">
                <HeartPulse size={15} color="#f472b6" />
                <span>Thuần cám &amp; mồi sinh học</span>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* 4. Main Products Area OR Dedicated Detail View */}
      {activeDetailSlug ? (
        <FrogDetailPage
          slugOrId={activeDetailSlug}
          onBack={() => {
            window.location.hash = '#/'
            setActiveDetailSlug(null)
          }}
          onAddToCart={(pid, qty) => {
            runCart(api.add(pid, qty || 1))
            setCartOpen(true)
            showToast(`Đã thêm ${qty || 1} bé vào giỏ hàng!`, 'info')
          }}
          onBuyNow={(pid, qty) => {
            runCart(api.add(pid, qty || 1))
            if (!currentUser) {
              setPendingCheckout(true)
              setAuthOpen(true)
              showToast('Vui lòng đăng nhập hoặc đăng ký để kích hoạt gói Bảo Hành Sống 100%!', 'info')
            } else {
              setCheckoutOpen(true)
            }
          }}
          onToast={showToast}
        />
      ) : (
        <main className="container">
          {error && <div className="care-box" style={{ marginBottom: 20 }}>⚠️ {error}</div>}

          {/* Filter Toolbar */}
          <section className="filter-section">
            {/* Category Tabs */}
            <div className="category-tabs">
              {(() => {
                const totalCatalogCount = categories.reduce((sum, c) => sum + (c.product_count || 0), 0) || 26
                return (
                  <>
                    <button
                      className={`tab-btn ${selectedCat === 'all' ? 'active' : ''}`}
                      onClick={() => handleCategoryChange('all')}
                      title="Xem toàn bộ bách khoa ếch cảnh"
                    >
                      <span>🌿 Tất cả loài</span>
                      <span className="tab-count" title="Tổng số loài trong bách khoa">{totalCatalogCount} loài</span>
                    </button>
                    {categories.map((cat) => (
                      <button
                        key={cat.id}
                        className={`tab-btn ${selectedCat === cat.slug ? 'active' : ''}`}
                        onClick={() => handleCategoryChange(cat.slug)}
                        title={`Xem các loài họ ${cat.name}`}
                      >
                        <span>{cat.icon} {cat.name}</span>
                        {cat.product_count !== undefined && (
                          <span className="tab-count" title={`Tổng số loài trong phân loại ${cat.name}`}>{cat.product_count} loài</span>
                        )}
                      </button>
                    ))}
                  </>
                )
              })()}
            </div>

            {/* Secondary Controls Bar */}
            <div className="filter-bar">
              <div className="filter-group">
                <label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#475569' }}>
                  Độ khó:
                </label>
                <select
                  value={selectedDiff}
                  onChange={(e) => handleDiffChange(e.target.value)}
                >
                  <option value="all">Tất cả</option>
                  <option value="Dễ">Dễ (Người mới)</option>
                  <option value="Trung bình">Trung bình</option>
                  <option value="Nâng cao">Nâng cao</option>
                </select>

                <label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#475569', marginLeft: 6 }}>
                  Môi trường:
                </label>
                <select
                  value={selectedHabitat}
                  onChange={(e) => handleHabitatChange(e.target.value)}
                >
                  <option value="all">Tất cả kiểu bể</option>
                  <option value="terrestrial">🏜️ Trên cạn</option>
                  <option value="arboreal">🌿 Leo cây</option>
                  <option value="paludarium">💧 Bán cạn</option>
                  <option value="aquatic">🏊 Thủy sinh</option>
                </select>

                <label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#475569', marginLeft: 6 }}>
                  Khoảng giá:
                </label>
                <select
                  value={selectedPrice}
                  onChange={(e) => handlePriceChange(e.target.value)}
                >
                  <option value="all">Tất cả mức giá</option>
                  <option value="under_500">Dưới 500k</option>
                  <option value="500_1000">500k - 1 triệu</option>
                  <option value="over_1000">Trên 1 triệu</option>
                </select>

                <label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#475569', marginLeft: 6 }}>
                  Sắp xếp:
                </label>
                <select
                  value={sortBy}
                  onChange={(e) => handleSortChange(e.target.value)}
                >
                  <option value="featured">Nổi bật nhất</option>
                  <option value="price_asc">Giá: Thấp đến cao</option>
                  <option value="price_desc">Giá: Cao đến thấp</option>
                </select>

                {(selectedCat !== 'all' || selectedDiff !== 'all' || selectedHabitat !== 'all' || selectedPrice !== 'all' || search) && (
                  <button className="reset-btn" onClick={resetFilters}>
                    ✕ Xóa lọc
                  </button>
                )}
              </div>

              <div className="product-count-label">
                Đang hiển thị <strong>{products.length}</strong> loài ếch sống
              </div>
            </div>

{/* Single search feedback bar rendered above grid */}
          </section>

          {/* Products Grid */}
          {loading ? (
            <div style={{ textAlign: 'center', padding: '60px 0', color: '#64748b' }}>
              <p>Đang tải danh sách ếch cảnh sống...</p>
            </div>
          ) : products.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 0', background: '#fff', borderRadius: 12 }}>
              <p style={{ fontSize: '1.1rem', color: '#64748b' }}>
                Không tìm thấy loài ếch phù hợp với bộ lọc hiện tại.
              </p>
              <button className="track-btn" onClick={resetFilters} style={{ margin: '12px auto 0 auto' }}>
                Xem lại tất cả ếch
              </button>
            </div>
          ) : (
            <>
              {search && (
                <div className="search-feedback-bar">
                  <span>🔍 Kết quả tìm kiếm cho: "<strong>{search}</strong>" — Tìm thấy <strong>{products.length} loài ếch</strong></span>
                  <button className="btn-clear-search-pill" onClick={() => handleSearchChange('')} title="Xem lại tất cả loài ếch">
                    <X size={14} /> Xóa tìm kiếm
                  </button>
                </div>
              )}
              <div className={`grid ${products.length <= 2 ? 'grid-few' : ''}`}>
              {products.map((p) => (
                <article className="card" key={p.id}>
                  <div
                    className="card-img-wrap"
                    onClick={() => {
                      window.location.hash = `#/frogs/${p.slug || p.id}`
                      setActiveDetailSlug(p.slug || String(p.id))
                    }}
                    style={{ cursor: 'pointer' }}
                    title={`Xem chi tiết hồ sơ ${p.name}`}
                  >
                    <img src={p.image} alt={p.name} loading="lazy" decoding="async" width="300" height="225" />
                    <span className={getDiffBadgeClass(p.difficulty)}>
                      {p.difficulty}
                    </span>
                    {p.is_featured === 1 && (
                      <span className="badge-featured">⭐ Nổi bật</span>
                    )}
                  </div>

                  <div className="card-body">
                    <div className="card-meta">
                      <span className="card-category">{p.category_name || 'Ếch cảnh'}</span>
                      <span className="card-size">{p.size_stage}</span>
                      <span className="card-habitat-badge">
                        {p.habitat_type === 'arboreal' ? '🌿 Cây' : p.habitat_type === 'paludarium' ? '💧 Bán cạn' : p.habitat_type === 'aquatic' ? '🏊 Nước' : '🏜️ Cạn'}
                      </span>
                    </div>

                    <h3
                      className="card-title"
                      onClick={() => {
                        window.location.hash = `#/frogs/${p.slug || p.id}`
                        setActiveDetailSlug(p.slug || String(p.id))
                      }}
                      style={{ cursor: 'pointer' }}
                      title={`Xem chi tiết hồ sơ ${p.name}`}
                    >
                      {p.name}
                    </h3>
                    <p className="card-sci-name">{p.scientific_name}</p>
                    <p className="card-desc">{p.description}</p>

                    <div className="card-bio-pills">
                      <span className="bio-pill">🌡️ {p.temperature}</span>
                      <span className="bio-pill">💧 {p.humidity}</span>
                      <span className="bio-pill">🦗 {p.diet.split(',')[0]}</span>
                    </div>

                    <div className="card-foot">
                      <div className="price-wrap">
                        <span className="price-current">{vnd(p.price)}</span>
                        {p.original_price > p.price && (
                          <span className="price-original">{vnd(p.original_price)}</span>
                        )}
                      </div>

                      <div className="card-actions">
                        <button
                          className="btn-detail"
                          onClick={() => {
                            window.location.hash = `#/frogs/${p.slug || p.id}`
                            setActiveDetailSlug(p.slug || String(p.id))
                          }}
                          title="Xem hồ sơ sinh học chuyên sâu"
                        >
                          Chi Tiết
                        </button>
                        <button
                          className="btn-add"
                          onClick={() => addToCart(p.id)}
                          title="Thêm vào giỏ hàng"
                        >
                          <Plus size={14} /> Thêm
                        </button>
                      </div>
                    </div>
                  </div>
                </article>
              ))}
            </div>
            </>
          )}
        </main>
      )}

      {/* 6. Cart Drawer */}
      {cartOpen && <div className="drawer-overlay" onClick={() => setCartOpen(false)} />}
      <aside className={`drawer ${cartOpen ? 'open' : ''}`}>
        <div className="drawer-head">
          <h2>Giỏ Hàng Ếch Cảnh ({cart.count})</h2>
          <button className="modal-close" style={{ position: 'static' }} onClick={() => setCartOpen(false)}>
            ✕
          </button>
        </div>

        <div className="drawer-body">
          {cart.items.length === 0 ? (
            <div style={{ textAlign: 'center', marginTop: 60, color: '#94a3b8' }}>
              <span style={{ fontSize: '3rem' }}>🐸</span>
              <p style={{ marginTop: 12 }}>Giỏ hàng của bạn đang trống</p>
            </div>
          ) : (
            cart.items.map(({ product: p, qty }) => (
              <div className="cart-item" key={p.id}>
                <img src={p.image} alt={p.name} className="cart-item-img" />
                <div className="cart-item-info">
                  <h4 className="cart-item-title">{p.name}</h4>
                  <div className="cart-item-price">{vnd(p.price)}</div>
                  <div className="cart-item-qty">
                    <button onClick={() => runCart(api.setQty(p.id, qty - 1))}>−</button>
                    <span>{qty}</span>
                    <button onClick={() => runCart(api.setQty(p.id, qty + 1))}>+</button>
                  </div>
                </div>
                <button
                  className="btn-remove-item"
                  onClick={() => runCart(api.setQty(p.id, 0))}
                  title="Xóa khỏi giỏ"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            ))
          )}
        </div>

        {cart.items.length > 0 && (
          <div className="drawer-foot">
            <div className="drawer-total">
              <span>Tổng thanh toán:</span>
              <strong>{vnd(cart.total)}</strong>
            </div>

            {/* Chặn đặt hàng khi chưa đăng nhập */}
            {!currentUser ? (
              <div className="guest-lock-banner">
                <p>
                  🔒 <strong>Yêu cầu đăng nhập:</strong> Để kích hoạt bảo hành sống 100% và giao hàng đúng chuẩn thùng xốp giữ ẩm, quý khách vui lòng đăng nhập trước khi tạo đơn!
                </p>
                <button
                  className="btn-lock-auth"
                  onClick={() => {
                    setCartOpen(false)
                    setPendingCheckout(true)
                    setAuthOpen(true)
                  }}
                >
                  <Lock size={16} />
                  Đăng Nhập Để Tiếp Tục Đặt Mua
                </button>
              </div>
            ) : (
              <button
                className="btn-checkout"
                onClick={() => {
                  setCheckoutOpen(true)
                  setCartOpen(false)
                }}
              >
                Tiến hành đặt hàng ({cart.count} bé)
              </button>
            )}

            <button
              className="btn-clear-cart"
              onClick={() => runCart(api.clear())}
            >
              Xóa sạch giỏ hàng
            </button>
          </div>
        )}
      </aside>

      {/* 7. Checkout Modal (Đặt hàng Live Pet) */}
      {checkoutOpen && (
        <div className="modal-overlay" onClick={() => setCheckoutOpen(false)}>
          <div className="modal-card" style={{ maxWidth: 560, padding: 24 }} onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setCheckoutOpen(false)}>
              ✕
            </button>

            <h2 style={{ margin: '0 0 6px 0', fontSize: '1.35rem' }}>
              📦 Đặt Mua Ếch Cảnh Sống
            </h2>
            <p style={{ margin: '0 0 16px 0', fontSize: '0.85rem', color: '#64748b' }}>
              Đơn hàng gồm <strong>{cart.count} cá thể ếch</strong> với tổng giá trị <strong>{vnd(cart.total)}</strong>.
            </p>

            <form onSubmit={handleCheckoutSubmit}>
              <div className="form-row">
                <div className="form-group">
                  <label>Họ và tên người nhận *</label>
                  <input
                    type="text"
                    required
                    placeholder="Nguyễn Văn A"
                    value={checkoutForm.customerName}
                    onChange={(e) => setCheckoutForm({ ...checkoutForm, customerName: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label>Số điện thoại liên hệ *</label>
                  <input
                    type="tel"
                    required
                    placeholder="0912 345 678"
                    value={checkoutForm.customerPhone}
                    onChange={(e) => setCheckoutForm({ ...checkoutForm, customerPhone: e.target.value })}
                  />
                </div>
              </div>

              {/* Address with GPS Geolocation Scanner */}
              <div className="form-group">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                  <label>Địa chỉ nhận hàng (Giao tận nơi) *</label>
                  <button
                    type="button"
                    onClick={handleScanGpsLocation}
                    disabled={gpsLocating}
                    style={{
                      background: '#ecfdf5',
                      color: '#059669',
                      border: '1px solid #10b981',
                      borderRadius: 6,
                      padding: '3px 8px',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 4,
                    }}
                  >
                    <Compass size={13} className={gpsLocating ? 'spin' : ''} />
                    {gpsLocating ? 'Đang quét GPS...' : '📍 Quét vị trí GPS'}
                  </button>
                </div>
                <input
                  type="text"
                  required
                  placeholder="Số nhà, tên đường, phường/xã, quận/huyện"
                  value={checkoutForm.customerAddress}
                  onChange={(e) => setCheckoutForm({ ...checkoutForm, customerAddress: e.target.value })}
                />
                {checkoutForm.latitude && checkoutForm.longitude && (
                  <div style={{ marginTop: 5 }}>
                    <span className="gps-live-badge">
                      <MapPin size={12} color="#059669" />
                      Tọa độ định vị: {checkoutForm.latitude}, {checkoutForm.longitude}
                    </span>
                  </div>
                )}
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Tỉnh / Thành phố</label>
                  <input
                    type="text"
                    value={checkoutForm.city}
                    onChange={(e) => setCheckoutForm({ ...checkoutForm, city: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label>Phương thức vận chuyển</label>
                  <select
                    value={checkoutForm.shippingMethod}
                    onChange={(e) => setCheckoutForm({ ...checkoutForm, shippingMethod: e.target.value })}
                  >
                    <option value="Hỏa tốc đóng thùng xốp giữ ẩm (Khuyên dùng)">
                      Hỏa tốc thùng xốp giữ ẩm
                    </option>
                    <option value="Xe khách liên tỉnh (Nhận tại bến xe)">
                      Gửi xe khách liên tỉnh
                    </option>
                    <option value="Giao tiết kiệm 24-48h">
                      Giao nhanh 24-48h
                    </option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label>Hình thức thanh toán</label>
                <select
                  value={checkoutForm.paymentMethod}
                  onChange={(e) => setCheckoutForm({ ...checkoutForm, paymentMethod: e.target.value })}
                >
                  <option value="COD (Thanh toán khi nhận & đồng kiểm ếch sống)">
                    COD — Nhận hàng kiểm tra ếch sống rồi thanh toán
                  </option>
                  <option value="Chuyển khoản VietQR (Ưu tiên xuất đơn nhanh)">
                    Chuyển khoản VietQR ngân hàng
                  </option>
                </select>
              </div>

              <div className="form-group">
                <label>Ghi chú cho shipper & shop</label>
                <textarea
                  rows={2}
                  placeholder="Hẹn giờ giao, hướng dẫn đường đi, lưu ý chuồng nuôi..."
                  value={checkoutForm.notes}
                  onChange={(e) => setCheckoutForm({ ...checkoutForm, notes: e.target.value })}
                />
              </div>

              <div className="guarantee-box" style={{ marginBottom: 16 }}>
                🛡️ <strong>Chính sách giao nhận:</strong> Khách hàng được mở thùng kiểm tra tình trạng ếch sống khỏe mạnh trước khi thanh toán. Nếu có rủi ro, Shop hoàn tiền hoặc gửi bù ngay 100%!
              </div>

              <button
                type="submit"
                className="btn-checkout"
                disabled={ordering}
              >
                {ordering ? 'Đang tạo đơn hàng...' : `Xác Nhận Đặt Mua (${vnd(cart.total)})`}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* 8. Order Success Modal */}
      {orderResult && (
        <div className="modal-overlay" onClick={() => setOrderResult(null)}>
          <div className="modal-card" style={{ maxWidth: 480, padding: 28, textAlign: 'center' }} onClick={(e) => e.stopPropagation()}>
            <CheckCircle2 size={54} color="#15803d" style={{ margin: '0 auto 12px auto' }} />
            <h2 style={{ margin: '0 0 6px 0', color: '#15803d' }}>ĐẶT HÀNG THÀNH CÔNG!</h2>
            <p style={{ margin: '0 0 16px 0', fontSize: '0.9rem', color: '#475569' }}>
              Cảm ơn bạn <strong>{orderResult.customerName}</strong> đã ủng hộ Frog Store.
            </p>

            <div style={{ background: '#f0fdf4', border: '1px dashed #22c55e', borderRadius: 10, padding: 14, marginBottom: 16 }}>
              <div style={{ fontSize: '0.85rem', color: '#64748b' }}>MÃ ĐƠN HÀNG CỦA BẠN:</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#166534', letterSpacing: 1 }}>
                {orderResult.orderCode}
              </div>
              <div style={{ fontSize: '0.8rem', color: '#15803d', marginTop: 4 }}>
                Tổng tiền: <strong>{vnd(orderResult.totalAmount)}</strong>
              </div>
              {orderResult.latitude && orderResult.longitude && (
                <div style={{ fontSize: '0.75rem', color: '#059669', marginTop: 4 }}>
                  📍 Tọa độ giao hàng: {orderResult.latitude}, {orderResult.longitude}
                </div>
              )}
            </div>

            <p style={{ fontSize: '0.85rem', color: '#64748b', textAlign: 'left', background: '#f8fafc', padding: 12, borderRadius: 8 }}>
              💡 <strong>Lưu ý:</strong> Nhân viên Frog Store sẽ gọi điện thoại xác nhận trong 15 phút. Bạn vui lòng chuẩn bị trước hộp nuôi và nước sạch đã khử clo để đón bé ếch nhé!
            </p>

            <button
              className="btn-checkout"
              onClick={() => setOrderResult(null)}
              style={{ marginTop: 12 }}
            >
              Đã hiểu & Tiếp tục mua sắm
            </button>
          </div>
        </div>
      )}

      {/* 9. Track Order Modal */}
      {trackOpen && (
        <div className="modal-overlay" onClick={() => setTrackOpen(false)}>
          <div className="modal-card" style={{ maxWidth: 520, padding: 24 }} onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setTrackOpen(false)}>
              ✕
            </button>

            <h2 style={{ margin: '0 0 6px 0', fontSize: '1.25rem' }}>
              🔍 Tra Cứu Đơn Hàng Live Pet
            </h2>
            <p style={{ margin: '0 0 16px 0', fontSize: '0.85rem', color: '#64748b' }}>
              Nhập mã đơn hàng dạng <strong>FROG-XXXXXX</strong> được cấp sau khi bạn đặt mua.
            </p>

            <form onSubmit={handleTrackSubmit} style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
              <input
                type="text"
                aria-label="Nhập mã đơn hàng cần tra cứu"
                placeholder="Ví dụ: FROG-849201"
                value={trackCode}
                onChange={(e) => setTrackCode(e.target.value)}
                style={{ flex: 1, padding: '9px 14px', borderRadius: 8, border: '1px solid #cbd5e1' }}
              />
              <button type="submit" className="btn-add" style={{ padding: '0 16px' }}>
                Tìm kiếm
              </button>
            </form>

            {trackError && <div className="care-box" style={{ marginBottom: 12 }}>⚠️ {trackError}</div>}

            {trackedOrder && (
              <div style={{ background: '#f8fafc', borderRadius: 10, padding: 16, border: '1px solid #e2e8f0' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                  <span style={{ fontWeight: 800, fontSize: '1.1rem', color: '#15803d' }}>
                    {trackedOrder.order_code}
                  </span>
                  <span style={{ background: '#dcfce7', color: '#15803d', padding: '3px 8px', borderRadius: 6, fontSize: '0.75rem', fontWeight: 700 }}>
                    {trackedOrder.status.toUpperCase()}
                  </span>
                </div>

                <div style={{ fontSize: '0.85rem', color: '#475569', marginBottom: 12 }}>
                  <div>Khách hàng: <strong>{trackedOrder.customer_name}</strong> - {trackedOrder.customer_phone}</div>
                  <div>Địa chỉ giao: {trackedOrder.customer_address}, {trackedOrder.city}</div>
                  {trackedOrder.latitude && trackedOrder.longitude && (
                    <div>Tọa độ GPS: {trackedOrder.latitude}, {trackedOrder.longitude}</div>
                  )}
                  <div>Vận chuyển: {trackedOrder.shipping_method}</div>
                  <div>Ngày đặt: {trackedOrder.created_at}</div>
                </div>

                <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: 10 }}>
                  <strong style={{ fontSize: '0.85rem' }}>Danh sách ếch đặt mua:</strong>
                  <ul style={{ margin: '6px 0 0 0', paddingLeft: 18, fontSize: '0.85rem' }}>
                    {trackedOrder.items.map((item) => (
                      <li key={item.id}>
                        {item.product_name} x {item.quantity} con ({vnd(item.unit_price)})
                      </li>
                    ))}
                  </ul>
                  <div style={{ marginTop: 8, textAlign: 'right', fontWeight: 700, color: '#15803d' }}>
                    Tổng tiền: {vnd(trackedOrder.total_amount)}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 10. AUTH MODAL (Đăng Nhập / Đăng Ký / Google Sign-In) */}
      {authOpen && (
        <div className="modal-overlay" onClick={() => setAuthOpen(false)}>
          <div className="modal-card" style={{ maxWidth: 460, padding: 24 }} onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setAuthOpen(false)}>
              ✕
            </button>

            {/* Google One-Click Button */}
            <button
              type="button"
              className="btn-google-login"
              onClick={handleGoogleLogin}
              disabled={authLoading}
            >
              <svg width="18" height="18" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
              </svg>
              <span>Tiếp tục với Google</span>
            </button>

            <div style={{ textAlign: 'center', margin: '14px 0 10px 0', fontSize: '0.8rem', color: '#94a3b8' }}>
              <span>— HOẶC ĐĂNG NHẬP VỚI EMAIL —</span>
            </div>

            {/* Tabs */}
            <div className="auth-tabs">
              <button
                type="button"
                className={`auth-tab ${authTab === 'login' ? 'active' : ''}`}
                onClick={() => { setAuthTab('login'); setAuthError('') }}
              >
                Đăng Nhập
              </button>
              <button
                type="button"
                className={`auth-tab ${authTab === 'register' ? 'active' : ''}`}
                onClick={() => { setAuthTab('register'); setAuthError('') }}
              >
                Đăng Ký Tài Khoản
              </button>
            </div>

            {authError && (
              <div className="care-box" style={{ marginBottom: 14, color: '#b91c1c', borderColor: '#fca5a5', background: '#fef2f2' }}>
                ⚠️ {authError}
              </div>
            )}

            {authTab === 'login' ? (
              <form onSubmit={handleLogin}>
                <div className="form-group">
                  <label>Email đăng nhập *</label>
                  <input
                    type="email"
                    required
                    placeholder="email@example.com"
                    value={authEmail}
                    onChange={(e) => setAuthEmail(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label>Mật khẩu *</label>
                  <input
                    type="password"
                    required
                    placeholder="Mật khẩu của bạn"
                    value={authPassword}
                    onChange={(e) => setAuthPassword(e.target.value)}
                  />
                </div>

                <button
                  type="submit"
                  className="btn-checkout"
                  disabled={authLoading}
                  style={{ marginTop: 12 }}
                >
                  {authLoading ? 'Đang xác thực...' : 'Đăng Nhập Ngay'}
                </button>
              </form>
            ) : (
              <form onSubmit={handleRegister}>
                <div className="form-group">
                  <label>Họ và tên của bạn *</label>
                  <input
                    type="text"
                    required
                    placeholder="Nguyễn Văn Bảo"
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label>Email cá nhân *</label>
                  <input
                    type="email"
                    required
                    placeholder="tenban@gmail.com"
                    value={authEmail}
                    onChange={(e) => setAuthEmail(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label>Mật khẩu (Tối thiểu 6 ký tự) *</label>
                  <input
                    type="password"
                    required
                    minLength={6}
                    placeholder="••••••••"
                    value={authPassword}
                    onChange={(e) => setAuthPassword(e.target.value)}
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Số điện thoại</label>
                    <input
                      type="tel"
                      placeholder="0912 345 678"
                      value={regPhone}
                      onChange={(e) => setRegPhone(e.target.value)}
                    />
                  </div>
                  <div className="form-group">
                    <label>Địa chỉ nhận hàng mặc định</label>
                    <input
                      type="text"
                      placeholder="Quận/Huyện, Tỉnh..."
                      value={regAddress}
                      onChange={(e) => setRegAddress(e.target.value)}
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="btn-checkout"
                  disabled={authLoading}
                  style={{ marginTop: 12 }}
                >
                  {authLoading ? 'Đang tạo tài khoản...' : 'Hoàn Tất Đăng Ký'}
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* 11. PROFILE MODAL */}
      {currentUser && (
        <ProfileModal
          isOpen={profileOpen}
          onClose={() => setProfileOpen(false)}
          user={currentUser}
          onUserUpdated={(updated) => {
            setCurrentUser(updated)
            setCheckoutForm((prev) => ({
              ...prev,
              customerName: updated.full_name || prev.customerName,
              customerPhone: updated.phone || prev.customerPhone,
              customerAddress: updated.address || prev.customerAddress,
              city: updated.city || prev.city,
              latitude: updated.latitude || prev.latitude,
              longitude: updated.longitude || prev.longitude,
            }))
          }}
          showToast={showToast}
        />
      )}

      {/* 12. MY ORDERS MODAL (Đơn Mua Của Tôi) */}
      {myOrdersOpen && (
        <div className="modal-overlay" onClick={() => setMyOrdersOpen(false)}>
          <div className="modal-card" style={{ maxWidth: 650, maxHeight: '85vh', padding: 24, display: 'flex', flexDirection: 'column' }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
              <div>
                <h2 style={{ margin: 0, fontSize: '1.25rem' }}>📦 Đơn Hàng Của Bạn</h2>
                <span style={{ fontSize: '0.8rem', color: '#64748b' }}>Lịch sử và tiến độ giao nhận ếch cảnh sống</span>
              </div>
              <button className="modal-close" style={{ position: 'static' }} onClick={() => setMyOrdersOpen(false)}>✕</button>
            </div>

            {myOrdersLoading ? (
              <div style={{ textAlign: 'center', padding: 30, color: '#64748b' }}>Đang tải danh sách đơn hàng...</div>
            ) : myOrders.length === 0 ? (
              <div style={{ textAlign: 'center', padding: 40, color: '#64748b' }}>
                <span style={{ fontSize: '2.5rem' }}>🐸</span>
                <p style={{ marginTop: 8 }}>Bạn chưa có đơn đặt hàng nào.</p>
              </div>
            ) : (
              <div className="orders-list">
                {myOrders.map((o) => (
                  <div className="order-card-user" key={o.id}>
                    <div className="order-header">
                      <span className="order-code-text">{o.order_code}</span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span className={`status-badge status-${o.status}`}>
                          {o.status.toUpperCase()}
                        </span>
                        {o.status === 'pending' && (
                          <button
                            className="btn-cancel-sm"
                            onClick={() => handleCancelMyOrder(o.order_code)}
                          >
                            Hủy đơn
                          </button>
                        )}
                      </div>
                    </div>

                    <div style={{ fontSize: '0.8rem', color: '#64748b', marginBottom: 8 }}>
                      Ngày đặt: {o.created_at} • Người nhận: <strong>{o.customer_name}</strong> ({o.customer_phone})
                    </div>

                    <table className="order-items-table">
                      <tbody>
                        {o.items?.map((it) => (
                          <tr key={it.id}>
                            <td>{it.product_name}</td>
                            <td style={{ textAlign: 'center' }}>x{it.quantity}</td>
                            <td style={{ textAlign: 'right', fontWeight: 600 }}>{vnd(it.unit_price * it.quantity)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 8, paddingTop: 8, borderTop: '1px dashed #e2e8f0' }}>
                      <span style={{ fontSize: '0.8rem', color: '#64748b' }}>Hình thức: {o.payment_method?.split('(')[0]}</span>
                      <strong style={{ color: '#15803d', fontSize: '1rem' }}>Tổng: {vnd(o.total_amount)}</strong>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* 12b. INTERACTIVE FROG MATCHER QUIZ MODAL */}
      {quizOpen && (
        <div className="modal-overlay" onClick={() => setQuizOpen(false)}>
          <div className="modal-card quiz-modal-card" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setQuizOpen(false)}>✕</button>

            <div className="quiz-container">
              <div className="quiz-header">
                <div className="quiz-badge">
                  <Sparkles size={16} /> Trợ Thủ Tư Vấn Sinh Học
                </div>
                <h2>Tìm Loài Ếch Hoàn Hảo Dành Cho Bạn</h2>
                <div className="quiz-progress-bar">
                  <div
                    className="quiz-progress-fill"
                    style={{ width: quizStep <= 3 ? `${(quizStep / 3) * 100}%` : "100%" }}
                  ></div>
                </div>
                <span className="quiz-step-label">{quizStep <= 3 ? `Bước ${quizStep} / 3` : "🎯 Kết quả đề xuất"}</span>
              </div>

              {quizStep === 1 && (
                <div className="quiz-step-body fade-in">
                  <h3>1. Bạn đã từng nuôi ếch cảnh hay lưỡng cư bao giờ chưa?</h3>
                  <div className="quiz-options-list">
                    <button
                      className="quiz-opt-btn"
                      onClick={() => handleAnswerQuiz('exp', 'beginner')}
                    >
                      <span className="opt-title">🌱 Chưa bao giờ, mình là người mới bắt đầu</span>
                      <span className="opt-desc">Cần loài ếch cực kỳ dễ nuôi, trâu bò, ăn tạp, ít tốn công chăm sóc.</span>
                    </button>
                    <button
                      className="quiz-opt-btn"
                      onClick={() => handleAnswerQuiz('exp', 'intermediate')}
                    >
                      <span className="opt-title">🌿 Đã có chút kinh nghiệm cơ bản</span>
                      <span className="opt-desc">Muốn thử sức với các loài ếch cảnh có hoa văn đẹp, leo trèo hoặc bán cạn.</span>
                    </button>
                    <button
                      className="quiz-opt-btn"
                      onClick={() => handleAnswerQuiz('exp', 'expert')}
                    >
                      <span className="opt-title">💎 Đam mê chuyên sâu, đã có bể Terrarium</span>
                      <span className="opt-desc">Sẵn sàng nuôi các loài phi tiêu độc, ếch rừng nguyên sinh cần vi khí hậu chuẩn xác.</span>
                    </button>
                  </div>
                </div>
              )}

              {quizStep === 2 && (
                <div className="quiz-step-body fade-in">
                  <h3>2. Bạn thích kiểu chuồng nuôi (Terrarium) như thế nào trong phòng?</h3>
                  <div className="quiz-options-list">
                    <button
                      className="quiz-opt-btn"
                      onClick={() => handleAnswerQuiz('habitat', 'terrestrial')}
                    >
                      <span className="opt-title">🏜️ Bể cạn nhỏ gọn, đơn giản</span>
                      <span className="opt-desc">Hộp nhựa hoặc bể kính nhỏ lót mút xốp hoặc mùn dừa, ếch ngồi yên một chỗ háu ăn.</span>
                    </button>
                    <button
                      className="quiz-opt-btn"
                      onClick={() => handleAnswerQuiz('habitat', 'arboreal')}
                    >
                      <span className="opt-title">🌿 Bể kính dạng đứng trồng nhiều cây xanh</span>
                      <span className="opt-desc">Ếch bám lá cây, màu sắc nổi bật, thích hợp trang trí bàn làm việc xanh tươi.</span>
                    </button>
                    <button
                      className="quiz-opt-btn"
                      onClick={() => handleAnswerQuiz('habitat', 'paludarium')}
                    >
                      <span className="opt-title">💧 Bể bán cạn Paludarium hoặc có nước</span>
                      <span className="opt-desc">Có phần nước suối thác chảy và phần cạn phủ rêu đá tự nhiên.</span>
                    </button>
                  </div>
                </div>
              )}

              {quizStep === 3 && (
                <div className="quiz-step-body fade-in">
                  <h3>3. Quỹ thời gian chăm sóc hàng ngày của bạn ra sao?</h3>
                  <div className="quiz-options-list">
                    <button
                      className="quiz-opt-btn"
                      onClick={() => handleAnswerQuiz('care', 'low')}
                    >
                      <span className="opt-title">⏳ Khá bận rộn, chỉ ngó qua 2-3 ngày 1 lần</span>
                      <span className="opt-desc">Thích hợp dòng ếch ăn bữa lớn rồi nằm tiêu hóa vài ngày như Pacman hoặc Dumpy.</span>
                    </button>
                    <button
                      className="quiz-opt-btn"
                      onClick={() => handleAnswerQuiz('care', 'medium')}
                    >
                      <span className="opt-title">🌧️ Có thể xịt ẩm 1-2 lần mỗi ngày</span>
                      <span className="opt-desc">Dành 5 phút mỗi sáng/tối để phun sương duy trì độ ẩm mát mẻ cho bể cây.</span>
                    </button>
                    <button
                      className="quiz-opt-btn"
                      onClick={() => handleAnswerQuiz('care', 'high')}
                    >
                      <span className="opt-title">🔬 Rất tâm huyết, thích nuôi ấp mồi sống tỉ mỉ</span>
                      <span className="opt-desc">Sẵn sàng nuôi gián, ruồi giấm và kiểm soát vi khí hậu bằng máy tự động.</span>
                    </button>
                  </div>
                </div>
              )}

              {quizStep === 4 && quizRecommendation && (
                <div className="quiz-result-body fade-in">
                  <div className="result-badge">🎉 KẾT QUẢ PHÂN TÍCH CHUYÊN GIA</div>
                  <h3>Loài Ếch Phù Hợp Nhất Với Bạn Là:</h3>

                  <div className="result-card">
                    <img src={quizRecommendation.image} alt={quizRecommendation.name} />
                    <div className="result-info">
                      <h4>{quizRecommendation.name}</h4>
                      <p className="res-sci"><em>{quizRecommendation.scientific_name}</em></p>
                      <div className="res-meta-row">
                        <span className="res-tag">Độ khó: <strong>{quizRecommendation.difficulty}</strong></span>
                        <span className="res-tag">Giá: <strong style={{ color: '#059669' }}>{vnd(quizRecommendation.price)}</strong></span>
                      </div>
                      <p className="res-desc">{quizRecommendation.description}</p>
                    </div>
                  </div>

                  <div className="result-actions">
                    <button
                      className="btn-view-match"
                      onClick={() => {
                        setQuizOpen(false)
                        window.location.hash = `#/frogs/${quizRecommendation.slug || quizRecommendation.id}`
                        setActiveDetailSlug(quizRecommendation.slug || String(quizRecommendation.id))
                      }}
                    >
                      📖 Xem Toàn Bộ Hồ Sơ Sinh Học &amp; Cách Nuôi
                    </button>
                    <button
                      className="btn-add-match"
                      onClick={() => {
                        addToCart(quizRecommendation.id)
                        setQuizOpen(false)
                      }}
                    >
                      🛒 Thêm Ngay Vào Giỏ Hàng
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 13. ADMIN PORTAL MODAL */}
      <AdminPortal
        isOpen={adminPortalOpen}
        onClose={() => setAdminPortalOpen(false)}
        categories={categories}
        onProductsUpdated={() => {
          api.products().then(setProducts)
        }}
      />

      {/* 14. Footer */}
      <footer>
        <div className="footer-content">
          <div className="footer-col">
            <h3>🐸 FROG STORE VIỆT NAM</h3>
            <p>
              Hệ thống cung cấp ếch cảnh sống, phụ kiện nuôi terrarium, lũa rêu và thức ăn dinh dưỡng hàng đầu.
              Đồng hành cùng đam mê lưỡng cư của bạn!
            </p>
            <p style={{ color: '#4ade80', fontWeight: 600 }}>Hotline / Zalo: 0988.123.456</p>
          </div>

          <div className="footer-col">
            <h3>DANH MỤC NỔI BẬT</h3>
            <ul>
              <li>Ếch Pacman Nam Mỹ (Green, Albino, Samurai, Red)</li>
              <li>Ếch Cây Leo Trèo (Red-Eyed, Dumpy, Snowflake)</li>
              <li>Ếch Phi Tiêu Độc (Bumblebee, Azureus)</li>
              <li>Ếch Khổng Lồ (African Bullfrog Pixie)</li>
              <li>Ếch Rêu Việt Nam (Theloderma corticale)</li>
            </ul>
          </div>

          <div className="footer-col">
            <h3>CHÍNH SÁCH &amp; PHÁP LÝ</h3>
            <ul style={{ listStyle: 'none', padding: 0 }}>
              <li style={{ marginBottom: 8 }}>
                <button
                  type="button"
                  className="footer-policy-link"
                  onClick={() => { setActivePolicy('privacy'); setPolicyOpen(true); }}
                >
                  🔒 Chính Sách Quyền Riêng Tư
                </button>
              </li>
              <li style={{ marginBottom: 8 }}>
                <button
                  type="button"
                  className="footer-policy-link"
                  onClick={() => { setActivePolicy('warranty'); setPolicyOpen(true); }}
                >
                  📦 Chính Sách Bảo Hành Sống 100%
                </button>
              </li>
              <li style={{ marginBottom: 8 }}>
                <button
                  type="button"
                  className="footer-policy-link"
                  onClick={() => { setActivePolicy('terms'); setPolicyOpen(true); }}
                >
                  ⚖️ Điều Khoản Dịch Vụ &amp; CITES
                </button>
              </li>
            </ul>
          </div>

          <div className="footer-col">
            <h3>CHÍNH SÁCH BẢO HÀNH</h3>
            <ul>
              <li>🛡️ Bao sống 100% khi nhận hàng trên toàn quốc</li>
              <li>📦 Đóng gói thùng xốp chuyên dụng giữ nhiệt và thoáng khí</li>
              <li>🩺 Tư vấn phòng chữa bệnh và chế độ dinh dưỡng trọn đời</li>
              <li>🚚 Giao hỏa tốc xe khách hoặc chuyển phát nhanh 24h</li>
            </ul>
          </div>
        </div>

        <div className="footer-bottom">
          © 2026 Frog Store Việt Nam. Tất cả quyền được bảo lưu. Triển khai trên Cloudflare Workers.
        </div>
      </footer>

      {/* 14b. POLICY & COMPLIANCE MODAL */}
      <PolicyModal
        isOpen={policyOpen}
        activePolicy={activePolicy}
        onClose={() => setPolicyOpen(false)}
        onSelectPolicy={setActivePolicy}
      />

      {/* 15. FROG AI CHATBOT WIDGET */}
      <FrogAiChatbot
        hidden={cartOpen || checkoutOpen}
        currentProductSlug={activeDetailSlug}
        onOpenProduct={(slug) => {
          window.location.hash = `#/frogs/${slug}`
          setActiveDetailSlug(slug)
        }}
      />
    </>
  )
}
