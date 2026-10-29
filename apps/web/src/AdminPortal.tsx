import React, { useState, useEffect } from 'react'
import {
  api,
  vnd,
  type Product,
  type Category,
  type OrderDetail,
  type User,
  type AdminStats,
} from './api'
import {
  LayoutDashboard,
  Layers,
  ShoppingBag,
  Users,
  X,
  Plus,
  Edit2,
  Trash2,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  Truck,
  Package,
} from 'lucide-react'

type AdminPortalProps = {
  isOpen: boolean
  onClose: () => void
  categories: Category[]
  onProductsUpdated?: () => void
}

export function AdminPortal({ isOpen, onClose, categories, onProductsUpdated }: AdminPortalProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'products' | 'orders' | 'users'>('overview')
  const [stats, setStats] = useState<AdminStats | null>(null)
  const [products, setProducts] = useState<Product[]>([])
  const [orders, setOrders] = useState<OrderDetail[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(false)
  const [msg, setMsg] = useState<{ text: string; type: 'success' | 'error' } | null>(null)

  // Order filter
  const [orderFilter, setOrderFilter] = useState<string>('all')

  // Product modal
  const [productModalOpen, setProductModalOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Partial<Product> | null>(null)

  const showToast = (text: string, type: 'success' | 'error' = 'success') => {
    setMsg({ text, type })
    setTimeout(() => setMsg(null), 3500)
  }

  const loadData = async () => {
    if (!isOpen) return
    setLoading(true)
    try {
      const [s, p, o, u] = await Promise.all([
        api.adminStats(),
        api.adminProducts(),
        api.adminOrders(orderFilter !== 'all' ? orderFilter : undefined),
        api.adminUsers(),
      ])
      setStats(s)
      setProducts(p)
      setOrders(o)
      setUsers(u)
    } catch (e: any) {
      showToast(e.message || 'Lỗi tải dữ liệu quản trị', 'error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (isOpen) {
      loadData()
    }
  }, [isOpen, orderFilter])

  if (!isOpen) return null

  // Save product
  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingProduct) return
    try {
      if (editingProduct.id) {
        await api.adminUpdateProduct(editingProduct.id, editingProduct)
        showToast('Đã cập nhật thông tin loài ếch!')
      } else {
        await api.adminCreateProduct(editingProduct)
        showToast('Đã tạo loài ếch mới thành công!')
      }
      setProductModalOpen(false)
      setEditingProduct(null)
      loadData()
      if (onProductsUpdated) onProductsUpdated()
    } catch (err: any) {
      showToast(err.message || 'Lỗi lưu loài ếch', 'error')
    }
  }

  // Delete product
  const handleDeleteProduct = async (id: number, name: string) => {
    if (!confirm(`Bạn có chắc chắn muốn xóa "${name}" khỏi danh mục không?`)) return
    try {
      await api.adminDeleteProduct(id)
      showToast(`Đã xóa ${name}`)
      loadData()
      if (onProductsUpdated) onProductsUpdated()
    } catch (err: any) {
      showToast(err.message || 'Lỗi khi xóa sản phẩm', 'error')
    }
  }

  // Update order status
  const handleUpdateOrderStatus = async (orderId: number, newStatus: string) => {
    try {
      await api.adminUpdateOrderStatus(orderId, newStatus)
      showToast(`Đã chuyển trạng thái đơn hàng sang ${newStatus.toUpperCase()}`)
      loadData()
    } catch (err: any) {
      showToast(err.message || 'Lỗi cập nhật trạng thái đơn', 'error')
    }
  }

  // Toggle user status
  const handleToggleUserStatus = async (user: User) => {
    const nextStatus = user.status === 'active' ? 'suspended' : 'active'
    if (user.role === 'admin') {
      alert('Không thể khóa tài khoản Quản Trị Viên (Admin)!')
      return
    }
    try {
      await api.adminUpdateUserStatus(user.id, nextStatus)
      showToast(`Đã đổi trạng thái tài khoản ${user.email} sang ${nextStatus}`)
      loadData()
    } catch (err: any) {
      showToast(err.message || 'Lỗi cập nhật trạng thái người dùng', 'error')
    }
  }

  const getStatusBadge = (status: string) => {
    const s = status.toLowerCase()
    let text = s
    let cls = 'status-badge '
    if (s === 'pending') { text = 'Chờ xử lý'; cls += 'status-pending' }
    else if (s === 'confirmed') { text = 'Đã xác nhận'; cls += 'status-confirmed' }
    else if (s === 'packing') { text = 'Đang đóng thùng'; cls += 'status-packing' }
    else if (s === 'shipping') { text = 'Đang giao hỏa tốc'; cls += 'status-shipping' }
    else if (s === 'completed') { text = 'Giao thành công'; cls += 'status-completed' }
    else if (s === 'cancelled') { text = 'Đã hủy'; cls += 'status-cancelled' }
    return <span className={cls}>{text}</span>
  }

  return (
    <div className="modal-overlay" style={{ zIndex: 100 }} onClick={onClose}>
      <div className="admin-modal-wrap" onClick={(e) => e.stopPropagation()}>
        {/* Top Header */}
        <div className="admin-top-bar">
          <div className="admin-title">
            <span style={{ fontSize: '1.6rem' }}>🐸</span>
            <div>
              <h2>FROG STORE — HỆ THỐNG QUẢN TRỊ ADMIN</h2>
              <span>Bảo mật RBAC Role-Based Access Control • Quản lý Live Pets</span>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <button
              onClick={loadData}
              title="Làm mới dữ liệu"
              style={{ background: '#334155', border: 'none', color: '#fff', padding: '6px 12px', borderRadius: 6, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.8rem' }}
            >
              <RefreshCw size={14} className={loading ? 'spin' : ''} />
              Làm mới
            </button>
            <button
              onClick={onClose}
              style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer', fontSize: '1.4rem' }}
            >
              <X size={24} />
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="admin-tab-nav">
          <button
            className={`admin-tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
            onClick={() => setActiveTab('overview')}
          >
            <LayoutDashboard size={18} />
            Tổng Quan & Chỉ Số
          </button>
          <button
            className={`admin-tab-btn ${activeTab === 'products' ? 'active' : ''}`}
            onClick={() => setActiveTab('products')}
          >
            <Layers size={18} />
            Quản Lý Ếch Cảnh ({products.length})
          </button>
          <button
            className={`admin-tab-btn ${activeTab === 'orders' ? 'active' : ''}`}
            onClick={() => setActiveTab('orders')}
          >
            <ShoppingBag size={18} />
            Đơn Hàng Live Pets ({orders.length})
          </button>
          <button
            className={`admin-tab-btn ${activeTab === 'users' ? 'active' : ''}`}
            onClick={() => setActiveTab('users')}
          >
            <Users size={18} />
            Khách Hàng & Phân Quyền ({users.length})
          </button>
        </div>

        {/* Alert Toast */}
        {msg && (
          <div style={{
            background: msg.type === 'success' ? '#dcfce7' : '#fee2e2',
            color: msg.type === 'success' ? '#15803d' : '#991b1b',
            borderBottom: `1px solid ${msg.type === 'success' ? '#86efac' : '#fca5a5'}`,
            padding: '8px 24px',
            fontSize: '0.875rem',
            fontWeight: 600,
          }}>
            {msg.type === 'success' ? '✓ ' : '⚠️ '} {msg.text}
          </div>
        )}

        {/* Content Body */}
        <div className="admin-body">
          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div>
              <div className="admin-stats-grid">
                <div className="admin-stat-card">
                  <span className="stat-label">TỔNG DOANH THU ĐƠN HÀNG</span>
                  <span className="stat-value" style={{ color: '#15803d' }}>
                    {vnd(stats?.revenue || 0)}
                  </span>
                  <span className="stat-desc">Đơn thanh toán thành công & COD</span>
                </div>
                <div className="admin-stat-card">
                  <span className="stat-label">TỔNG ĐƠN ĐÃ TIẾP NHẬN</span>
                  <span className="stat-value">{stats?.ordersCount || 0}</span>
                  <span className="stat-desc">Giao nhận hỏa tốc chuyên nghiệp</span>
                </div>
                <div className="admin-stat-card">
                  <span className="stat-label">SỐ LƯỢNG LOÀI ẾCH ĐANG BÁN</span>
                  <span className="stat-value">{stats?.productsCount || 0}</span>
                  <span className="stat-desc">100% loài thuần ăn mồi</span>
                </div>
                <div className="admin-stat-card">
                  <span className="stat-label">TÀI KHOẢN KHÁCH HÀNG</span>
                  <span className="stat-value">{stats?.usersCount || 0}</span>
                  <span className="stat-desc">Bảo mật PBKDF2 & JWT</span>
                </div>
              </div>

              {/* Low stock warning */}
              {stats?.lowStockProducts && stats.lowStockProducts.length > 0 && (
                <div style={{ background: '#fffbeb', border: '1px solid #fef08a', borderRadius: 12, padding: 16, marginBottom: 20 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#854d0e', fontWeight: 700, marginBottom: 8 }}>
                    <AlertTriangle size={18} />
                    <span>CẢNH BÁO TỒN KHO THẤP (Còn dưới 5 cá thể)</span>
                  </div>
                  <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                    {stats.lowStockProducts.map((p) => (
                      <span key={p.id} style={{ background: '#fff', border: '1px solid #fde047', padding: '4px 10px', borderRadius: 6, fontSize: '0.85rem' }}>
                        🐸 {p.name}: còn <strong>{p.stock}</strong> con
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Recent Orders table */}
              <div style={{ marginTop: 20 }}>
                <h3 style={{ margin: '0 0 12px 0', fontSize: '1.05rem', color: '#1e293b' }}>
                  📦 Đơn Hàng Live Pets Mới Nhất
                </h3>
                <div className="admin-table-container">
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>Mã Đơn</th>
                        <th>Khách Hàng</th>
                        <th>Địa Chỉ Nhận</th>
                        <th>Tổng Tiền</th>
                        <th>Trạng Thái</th>
                        <th>Ngày Đặt</th>
                      </tr>
                    </thead>
                    <tbody>
                      {stats?.recentOrders && stats.recentOrders.length > 0 ? (
                        stats.recentOrders.map((o) => (
                          <tr key={o.id}>
                            <td style={{ fontWeight: 700, color: '#15803d' }}>{o.order_code}</td>
                            <td>
                              <div><strong>{o.customer_name}</strong></div>
                              <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{o.customer_phone}</div>
                            </td>
                            <td>{o.customer_address}, {o.city}</td>
                            <td style={{ fontWeight: 700 }}>{vnd(o.total_amount)}</td>
                            <td>{getStatusBadge(o.status)}</td>
                            <td style={{ fontSize: '0.8rem', color: '#64748b' }}>{o.created_at}</td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={6} style={{ textAlign: 'center', padding: 20, color: '#64748b' }}>
                            Chưa có đơn hàng nào
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: PRODUCTS */}
          {activeTab === 'products' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.1rem' }}>Danh Sách Ếch Cảnh Sinh Học</h3>
                  <span style={{ fontSize: '0.8rem', color: '#64748b' }}>Đầy đủ thông số môi trường, độ ẩm, nhiệt độ, chế độ ăn</span>
                </div>
                <button
                  className="btn-checkout"
                  style={{ width: 'auto', padding: '8px 18px', display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.875rem' }}
                  onClick={() => {
                    setEditingProduct({
                      category_id: categories[0]?.id || 1,
                      name: '',
                      scientific_name: '',
                      morph: 'Normal',
                      price: 250000,
                      original_price: 300000,
                      size_stage: 'Baby 3 - 4cm',
                      lifespan: '7 - 10 năm',
                      difficulty: 'Dễ',
                      temperature: '24°C - 28°C',
                      humidity: '70% - 80%',
                      diet: 'Côn trùng, cá nhỏ, cám chuyên dụng',
                      description: '',
                      care_guide: 'Setup chuồng lót rêu giữ ẩm, thay nước sạch định kỳ.',
                      health_status: 'Khỏe mạnh 100%, thuần ăn mồi',
                      image: '/images/frogs/pacman_green.webp',
                      stock: 10,
                      is_featured: 1,
                    })
                    setProductModalOpen(true)
                  }}
                >
                  <Plus size={16} />
                  Thêm Loài Ếch Mới
                </button>
              </div>

              <div className="admin-table-container">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Ảnh</th>
                      <th>Tên Loài & Khoa Học</th>
                      <th>Danh Mục</th>
                      <th>Giá Bán</th>
                      <th>Tồn Kho</th>
                      <th>Độ Khó</th>
                      <th>Nhiệt Độ / Độ Ẩm</th>
                      <th>Hành Động</th>
                    </tr>
                  </thead>
                  <tbody>
                    {products.map((p) => (
                      <tr key={p.id}>
                        <td>
                          <img
                            src={p.image}
                            alt={p.name}
                            style={{ width: 48, height: 48, objectFit: 'cover', borderRadius: 8, border: '1px solid #e2e8f0' }}
                          />
                        </td>
                        <td>
                          <div style={{ fontWeight: 700, color: '#0f172a' }}>{p.name}</div>
                          <div style={{ fontSize: '0.75rem', fontStyle: 'italic', color: '#64748b' }}>{p.scientific_name} ({p.morph})</div>
                        </td>
                        <td>
                          <span style={{ background: '#f1f5f9', padding: '3px 8px', borderRadius: 6, fontSize: '0.8rem' }}>
                            {p.category_name || categories.find((c) => c.id === p.category_id)?.name}
                          </span>
                        </td>
                        <td>
                          <div style={{ fontWeight: 700, color: '#15803d' }}>{vnd(p.price)}</div>
                          {p.original_price > p.price && (
                            <div style={{ fontSize: '0.75rem', textDecoration: 'line-through', color: '#94a3b8' }}>
                              {vnd(p.original_price)}
                            </div>
                          )}
                        </td>
                        <td>
                          <span style={{
                            fontWeight: 700,
                            color: p.stock < 5 ? '#dc2626' : '#15803d',
                            background: p.stock < 5 ? '#fee2e2' : '#dcfce7',
                            padding: '3px 8px',
                            borderRadius: 6,
                            fontSize: '0.8rem'
                          }}>
                            {p.stock} con
                          </span>
                        </td>
                        <td>
                          <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>{p.difficulty}</span>
                        </td>
                        <td style={{ fontSize: '0.8rem', color: '#64748b' }}>
                          <div>🌡️ {p.temperature}</div>
                          <div>💧 {p.humidity}</div>
                        </td>
                        <td>
                          <div style={{ display: 'flex', gap: 6 }}>
                            <button
                              className="btn-action-sm btn-action-edit"
                              onClick={() => {
                                setEditingProduct(p)
                                setProductModalOpen(true)
                              }}
                            >
                              <Edit2 size={13} /> Sửa
                            </button>
                            <button
                              className="btn-action-sm btn-action-del"
                              onClick={() => handleDeleteProduct(p.id, p.name)}
                            >
                              <Trash2 size={13} /> Xóa
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 3: ORDERS */}
          {activeTab === 'orders' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.1rem' }}>Đơn Hàng Vận Chuyển Live Pets</h3>
                  <span style={{ fontSize: '0.8rem', color: '#64748b' }}>Bao sống 100%, quy trình đóng thùng xốp giữ ẩm hỏa tốc</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <label style={{ fontSize: '0.85rem', fontWeight: 600 }}>Lọc trạng thái:</label>
                  <select
                    value={orderFilter}
                    onChange={(e) => setOrderFilter(e.target.value)}
                    className="status-select"
                  >
                    <option value="all">Tất cả ({orders.length})</option>
                    <option value="pending">Chờ xử lý</option>
                    <option value="confirmed">Đã xác nhận</option>
                    <option value="packing">Đang đóng thùng</option>
                    <option value="shipping">Đang giao hỏa tốc</option>
                    <option value="completed">Giao thành công</option>
                    <option value="cancelled">Đã hủy</option>
                  </select>
                </div>
              </div>

              <div className="admin-table-container">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Mã Đơn</th>
                      <th>Khách Hàng & Liên Hệ</th>
                      <th>Địa Chỉ & Ghi Chú</th>
                      <th>Chi Tiết Ếch Đặt Mua</th>
                      <th>Tổng Tiền</th>
                      <th>Trạng Thái Hiện Tại</th>
                      <th>Cập Nhật Trạng Thái</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map((o) => (
                      <tr key={o.id}>
                        <td style={{ fontWeight: 800, color: '#15803d' }}>
                          <div>{o.order_code}</div>
                          <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 400 }}>{o.created_at}</div>
                        </td>
                        <td>
                          <div style={{ fontWeight: 700 }}>{o.customer_name}</div>
                          <div style={{ fontSize: '0.8rem', color: '#475569' }}>📞 {o.customer_phone}</div>
                          {o.user_email && (
                            <div style={{ fontSize: '0.75rem', color: '#2563eb' }}>👤 {o.user_email}</div>
                          )}
                        </td>
                        <td style={{ maxWidth: 220, fontSize: '0.825rem' }}>
                          <div>{o.customer_address}, {o.city}</div>
                          {o.latitude && o.longitude && (
                            <div style={{ marginTop: 5 }}>
                              <a
                                href={`https://www.google.com/maps?q=${o.latitude},${o.longitude}`}
                                target="_blank"
                                rel="noreferrer"
                                className="btn-maps-link"
                                title="Mở chỉ đường Google Maps cho shipper"
                              >
                                🗺️ Google Maps ({o.latitude}, {o.longitude})
                              </a>
                            </div>
                          )}
                          {o.notes && (
                            <div style={{ color: '#d97706', fontSize: '0.75rem', marginTop: 4 }}>
                              📝 {o.notes}
                            </div>
                          )}
                        </td>
                        <td>
                          <ul style={{ margin: 0, paddingLeft: 16, fontSize: '0.8rem' }}>
                            {o.items?.map((it) => (
                              <li key={it.id}>
                                <strong>{it.product_name}</strong> x{it.quantity} ({vnd(it.unit_price)})
                              </li>
                            ))}
                          </ul>
                        </td>
                        <td style={{ fontWeight: 800, color: '#15803d' }}>
                          {vnd(o.total_amount)}
                        </td>
                        <td>
                          {getStatusBadge(o.status)}
                        </td>
                        <td>
                          <select
                            value={o.status}
                            onChange={(e) => handleUpdateOrderStatus(o.id, e.target.value)}
                            className="status-select"
                            style={{ fontWeight: 600 }}
                          >
                            <option value="pending">Chờ xử lý (pending)</option>
                            <option value="confirmed">Đã gọi xác nhận (confirmed)</option>
                            <option value="packing">Đang đóng thùng xốp (packing)</option>
                            <option value="shipping">Bàn giao hỏa tốc (shipping)</option>
                            <option value="completed">Giao thành công (completed)</option>
                            <option value="cancelled">Hủy đơn (cancelled)</option>
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 4: USERS */}
          {activeTab === 'users' && (
            <div>
              <div style={{ marginBottom: 16 }}>
                <h3 style={{ margin: 0, fontSize: '1.1rem' }}>Quản Lý Tài Khoản Người Dùng & Phân Quyền</h3>
                <span style={{ fontSize: '0.8rem', color: '#64748b' }}>Phân quyền RBAC, bảo mật mật khẩu PBKDF2 100,000 vòng lặp & Salt ngẫu nhiên</span>
              </div>

              <div className="admin-table-container">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Người Dùng</th>
                      <th>Email</th>
                      <th>Số Điện Thoại</th>
                      <th>Địa Chỉ Mặc Định</th>
                      <th>Vai Trò (Role)</th>
                      <th>Trạng Thái</th>
                      <th>Đơn / Chi Tiêu</th>
                      <th>Hành Động</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((u) => (
                      <tr key={u.id}>
                        <td style={{ fontWeight: 700, color: '#64748b' }}>#{u.id}</td>
                        <td style={{ fontWeight: 700 }}>{u.full_name}</td>
                        <td>{u.email}</td>
                        <td>{u.phone || '—'}</td>
                        <td style={{ maxWidth: 200, fontSize: '0.8rem' }}>{u.address || '—'}</td>
                        <td>
                          <span className={`role-pill ${u.role === 'admin' ? 'role-admin' : 'role-customer'}`}>
                            {u.role.toUpperCase()}
                          </span>
                        </td>
                        <td>
                          <span style={{
                            padding: '3px 8px',
                            borderRadius: 6,
                            fontSize: '0.75rem',
                            fontWeight: 700,
                            background: u.status === 'active' ? '#dcfce7' : '#fee2e2',
                            color: u.status === 'active' ? '#15803d' : '#991b1b',
                          }}>
                            {u.status === 'active' ? 'HOẠT ĐỘNG' : 'BỊ KHÓA'}
                          </span>
                        </td>
                        <td style={{ fontSize: '0.8rem' }}>
                          <div>Đơn: <strong>{u.orders_count || 0}</strong></div>
                          <div style={{ color: '#15803d', fontWeight: 600 }}>{vnd(u.total_spent || 0)}</div>
                        </td>
                        <td>
                          {u.role !== 'admin' && (
                            <button
                              onClick={() => handleToggleUserStatus(u)}
                              style={{
                                background: u.status === 'active' ? '#fee2e2' : '#dcfce7',
                                color: u.status === 'active' ? '#dc2626' : '#15803d',
                                border: '1px solid currentColor',
                                padding: '4px 10px',
                                borderRadius: 6,
                                fontSize: '0.75rem',
                                fontWeight: 700,
                                cursor: 'pointer',
                              }}
                            >
                              {u.status === 'active' ? 'Khóa tài khoản' : 'Mở khóa'}
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Modal Thêm / Chỉnh sửa Sản phẩm */}
        {productModalOpen && editingProduct && (
          <div className="modal-overlay" style={{ zIndex: 110 }} onClick={() => setProductModalOpen(false)}>
            <div className="modal-card" style={{ maxWidth: 680, maxHeight: '90vh', overflowY: 'auto', padding: 24 }} onClick={(e) => e.stopPropagation()}>
              <button className="modal-close" onClick={() => setProductModalOpen(false)}>✕</button>

              <h3 style={{ margin: '0 0 16px 0', fontSize: '1.2rem', color: '#15803d' }}>
                {editingProduct.id ? '✏️ Chỉnh Sửa Thông Tin Loài Ếch' : '➕ Thêm Loài Ếch Cảnh Mới'}
              </h3>

              <form onSubmit={handleSaveProduct}>
                <div className="form-row">
                  <div className="form-group">
                    <label>Tên loài ếch *</label>
                    <input
                      required
                      value={editingProduct.name || ''}
                      onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })}
                      placeholder="Ví dụ: Ếch Pacman Red Horned"
                    />
                  </div>
                  <div className="form-group">
                    <label>Tên khoa học (In nghiêng) *</label>
                    <input
                      required
                      value={editingProduct.scientific_name || ''}
                      onChange={(e) => setEditingProduct({ ...editingProduct, scientific_name: e.target.value })}
                      placeholder="Ví dụ: Ceratophrys cornuta"
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Danh mục loài *</label>
                    <select
                      value={editingProduct.category_id}
                      onChange={(e) => setEditingProduct({ ...editingProduct, category_id: Number(e.target.value) })}
                    >
                      {categories.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.icon} {c.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Biến thể màu (Morph)</label>
                    <input
                      value={editingProduct.morph || ''}
                      onChange={(e) => setEditingProduct({ ...editingProduct, morph: e.target.value })}
                      placeholder="Ví dụ: High Red, Albino, Snowflake..."
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Giá bán thị trường (VND) *</label>
                    <input
                      type="number"
                      required
                      value={editingProduct.price || 0}
                      onChange={(e) => setEditingProduct({ ...editingProduct, price: Number(e.target.value) })}
                    />
                  </div>
                  <div className="form-group">
                    <label>Giá gốc niêm yết (VND)</label>
                    <input
                      type="number"
                      value={editingProduct.original_price || 0}
                      onChange={(e) => setEditingProduct({ ...editingProduct, original_price: Number(e.target.value) })}
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Số lượng tồn kho (con) *</label>
                    <input
                      type="number"
                      required
                      value={editingProduct.stock || 0}
                      onChange={(e) => setEditingProduct({ ...editingProduct, stock: Number(e.target.value) })}
                    />
                  </div>
                  <div className="form-group">
                    <label>Độ khó nuôi *</label>
                    <select
                      value={editingProduct.difficulty || 'Dễ'}
                      onChange={(e) => setEditingProduct({ ...editingProduct, difficulty: e.target.value })}
                    >
                      <option value="Dễ">Dễ (Người mới)</option>
                      <option value="Trung bình">Trung bình</option>
                      <option value="Nâng cao">Nâng cao</option>
                    </select>
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Nhiệt độ thích hợp</label>
                    <input
                      value={editingProduct.temperature || ''}
                      onChange={(e) => setEditingProduct({ ...editingProduct, temperature: e.target.value })}
                      placeholder="24°C - 28°C"
                    />
                  </div>
                  <div className="form-group">
                    <label>Độ ẩm thích hợp</label>
                    <input
                      value={editingProduct.humidity || ''}
                      onChange={(e) => setEditingProduct({ ...editingProduct, humidity: e.target.value })}
                      placeholder="70% - 85%"
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Kích thước / Giai đoạn</label>
                    <input
                      value={editingProduct.size_stage || ''}
                      onChange={(e) => setEditingProduct({ ...editingProduct, size_stage: e.target.value })}
                      placeholder="Baby 3 - 4cm"
                    />
                  </div>
                  <div className="form-group">
                    <label>Tuổi thọ trung bình</label>
                    <input
                      value={editingProduct.lifespan || ''}
                      onChange={(e) => setEditingProduct({ ...editingProduct, lifespan: e.target.value })}
                      placeholder="7 - 12 năm"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Đường dẫn ảnh (URL hoặc /images/frogs/...) *</label>
                  <input
                    required
                    value={editingProduct.image || ''}
                    onChange={(e) => setEditingProduct({ ...editingProduct, image: e.target.value })}
                    placeholder="/images/frogs/pacman_green.webp"
                  />
                </div>

                <div className="form-group">
                  <label>Chế độ ăn uống dinh dưỡng</label>
                  <input
                    value={editingProduct.diet || ''}
                    onChange={(e) => setEditingProduct({ ...editingProduct, diet: e.target.value })}
                    placeholder="Gián Dubia, dế mèn, cá chép mồi, cám viên dinh dưỡng Pacman"
                  />
                </div>

                <div className="form-group">
                  <label>Mô tả chi tiết đặc tính sinh học</label>
                  <textarea
                    rows={3}
                    value={editingProduct.description || ''}
                    onChange={(e) => setEditingProduct({ ...editingProduct, description: e.target.value })}
                    placeholder="Mô tả màu sắc, tính cách, nguồn gốc tự nhiên..."
                  />
                </div>

                <div className="form-group">
                  <label>Hướng dẫn setup chuồng nuôi (Care Guide)</label>
                  <textarea
                    rows={3}
                    value={editingProduct.care_guide || ''}
                    onChange={(e) => setEditingProduct({ ...editingProduct, care_guide: e.target.value })}
                    placeholder="Hướng dẫn lót nền mút/rêu, khay nước nông, xịt ẩm..."
                  />
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 16 }}>
                  <button
                    type="button"
                    className="btn-clear-cart"
                    onClick={() => setProductModalOpen(false)}
                  >
                    Hủy bỏ
                  </button>
                  <button type="submit" className="btn-checkout" style={{ width: 'auto', padding: '10px 24px' }}>
                    {editingProduct.id ? 'Cập Nhật Thay Đổi' : 'Lưu Loài Ếch Mới'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

