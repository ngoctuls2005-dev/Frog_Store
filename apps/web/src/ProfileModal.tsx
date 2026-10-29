import React, { useState } from 'react'
import { api, type User } from './api'
import {
  User as UserIcon,
  X,
  MapPin,
  Compass,
  CheckCircle2,
  AlertTriangle,
  Lock,
  Key,
  ShieldCheck,
  Link2,
  Unlink,
} from 'lucide-react'

type ProfileModalProps = {
  isOpen: boolean
  onClose: () => void
  user: User
  onUserUpdated: (user: User) => void
  showToast: (text: string, type?: 'success' | 'error') => void
}

export function ProfileModal({ isOpen, onClose, user, onUserUpdated, showToast }: ProfileModalProps) {
  const [activeTab, setActiveTab] = useState<'info' | 'security'>('info')
  const [fullName, setFullName] = useState(user.full_name || '')
  const [phone, setPhone] = useState(user.phone || '')
  const [address, setAddress] = useState(user.address || '')
  const [city, setCity] = useState(user.city || 'Hà Nội')
  const [avatarUrl, setAvatarUrl] = useState(user.avatar_url || '')
  const [lat, setLat] = useState<number | undefined>(user.latitude || undefined)
  const [lng, setLng] = useState<number | undefined>(user.longitude || undefined)
  const [gpsLocating, setGpsLocating] = useState(false)
  const [saving, setSaving] = useState(false)

  // Password fields
  const [oldPassword, setOldPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [changingPass, setChangingPass] = useState(false)

  if (!isOpen) return null

  // GPS Geolocation Handler
  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      showToast('Trình duyệt của bạn không hỗ trợ định vị GPS', 'error')
      return
    }
    setGpsLocating(true)
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const latitude = Number(pos.coords.latitude.toFixed(6))
        const longitude = Number(pos.coords.longitude.toFixed(6))
        setLat(latitude)
        setLng(longitude)

        // Reverse geocoding attempt (Nominatim OpenStreetMap)
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
              const cityDistrict = data.address.city_district || data.address.district || ''
              const cityName = data.address.city || data.address.state || 'Hà Nội'

              const detailed = [road, quarter, cityDistrict].filter(Boolean).join(', ')
              if (detailed) setAddress(detailed)
              if (cityName) setCity(cityName)
            }
          }
        } catch {
          // Keep raw coordinates if reverse geocoding is rate-limited
        }

        setGpsLocating(false)
        showToast(`Đã lấy vị trí GPS chính xác: ${latitude}, ${longitude}!`)
      },
      (err) => {
        setGpsLocating(false)
        let msg = 'Không thể lấy vị trí GPS'
        if (err.code === 1) msg = 'Bạn đã từ chối cấp quyền truy cập vị trí'
        else if (err.code === 2) msg = 'Không thể xác định vị trí thiết bị'
        showToast(msg, 'error')
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    )
  }

  // Save profile
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      const res = await api.updateProfile({
        fullName,
        phone,
        address,
        city,
        avatarUrl,
        latitude: lat,
        longitude: lng,
      })
      onUserUpdated(res.user)
      showToast('Đã lưu thông tin hồ sơ thành công!')
    } catch (err: any) {
      showToast(err.message || 'Lỗi cập nhật hồ sơ', 'error')
    } finally {
      setSaving(false)
    }
  }

  // Change password
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    if (newPassword.length < 6) {
      showToast('Mật khẩu mới phải từ 6 ký tự trở lên', 'error')
      return
    }
    if (newPassword !== confirmPassword) {
      showToast('Xác nhận mật khẩu mới không khớp!', 'error')
      return
    }
    setChangingPass(true)
    try {
      await api.changePassword({ oldPassword, newPassword })
      showToast('Đổi mật khẩu thành công!')
      setOldPassword('')
      setNewPassword('')
      setConfirmPassword('')
    } catch (err: any) {
      showToast(err.message || 'Lỗi đổi mật khẩu', 'error')
    } finally {
      setChangingPass(false)
    }
  }

  // Link Google
  const handleLinkGoogle = async () => {
    // Generate Google linking token simulation / prompt
    const simulatedGId = `google-linked-${Date.now()}`
    const credential = JSON.stringify({
      googleId: simulatedGId,
      email: user.email,
      name: user.full_name,
      avatar: user.avatar_url || `https://api.dicebear.com/7.x/bottts/svg?seed=${user.email}`,
    })
    try {
      const res = await api.linkGoogle(credential)
      onUserUpdated(res.user)
      showToast(res.message || 'Liên kết tài khoản Google thành công!')
    } catch (err: any) {
      showToast(err.message || 'Không thể liên kết Google', 'error')
    }
  }

  // Unlink Google
  const handleUnlinkGoogle = async () => {
    if (!confirm('Bạn có chắc chắn muốn hủy liên kết tài khoản Google này?')) return
    try {
      await api.unlinkGoogle()
      const updated = { ...user, google_id: null }
      onUserUpdated(updated)
      showToast('Đã hủy liên kết tài khoản Google')
    } catch (err: any) {
      showToast(err.message || 'Không thể hủy liên kết', 'error')
    }
  }

  return (
    <div className="modal-overlay" style={{ zIndex: 90 }} onClick={onClose}>
      <div className="modal-card" style={{ maxWidth: 540, padding: 24 }} onClick={(e) => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <img
              src={user.avatar_url || `https://api.dicebear.com/7.x/bottts/svg?seed=${user.email}`}
              alt={user.full_name}
              style={{ width: 44, height: 44, borderRadius: '50%', border: '2px solid #22c55e', background: '#f0fdf4' }}
            />
            <div>
              <h2 style={{ margin: 0, fontSize: '1.2rem', color: '#0f172a' }}>{user.full_name || 'Khách Hàng'}</h2>
              <span style={{ fontSize: '0.8rem', color: '#64748b' }}>{user.email}</span>
            </div>
          </div>
          <button className="modal-close" style={{ position: 'static' }} onClick={onClose}>✕</button>
        </div>

        {/* Tabs */}
        <div className="auth-tabs" style={{ marginBottom: 16 }}>
          <button
            type="button"
            className={`auth-tab ${activeTab === 'info' ? 'active' : ''}`}
            onClick={() => setActiveTab('info')}
          >
            Thông Tin Cá Nhân
          </button>
          <button
            type="button"
            className={`auth-tab ${activeTab === 'security' ? 'active' : ''}`}
            onClick={() => setActiveTab('security')}
          >
            Liên Kết Google & Mật Khẩu
          </button>
        </div>

        {/* TAB 1: Profile Info */}
        {activeTab === 'info' && (
          <form onSubmit={handleSaveProfile}>
            <div className="form-group">
              <label>Họ và tên *</label>
              <input
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Nguyễn Văn A"
              />
            </div>

            <div className="form-group">
              <label>Số điện thoại liên hệ *</label>
              <input
                required
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="0912 345 678"
              />
            </div>

            <div className="form-group">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                <label>Địa chỉ nhận hàng (Giao tận nơi) *</label>
                <button
                  type="button"
                  onClick={handleGetLocation}
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
                  {gpsLocating ? 'Đang định vị...' : '📍 Quét vị trí GPS'}
                </button>
              </div>
              <input
                required
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Số nhà, đường, phường/xã, quận/huyện"
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Tỉnh / Thành phố</label>
                <input
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="Hà Nội, TP.HCM..."
                />
              </div>

              <div className="form-group">
                <label>Tọa độ GPS đã lưu</label>
                <div style={{ padding: '8px 10px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 8, fontSize: '0.8rem', color: lat && lng ? '#059669' : '#64748b', fontWeight: 600 }}>
                  {lat && lng ? `📍 ${lat}, ${lng}` : 'Chưa có tọa độ GPS'}
                </div>
              </div>
            </div>

            <button
              type="submit"
              className="btn-checkout"
              disabled={saving}
              style={{ marginTop: 14 }}
            >
              {saving ? 'Đang lưu thay đổi...' : 'Lưu Thay Đổi Hồ Sơ'}
            </button>
          </form>
        )}

        {/* TAB 2: Google Linking & Password */}
        {activeTab === 'security' && (
          <div>
            {/* Google Linking Box */}
            <div style={{
              background: user.google_id ? '#f0fdf4' : '#fffbeb',
              border: `1px solid ${user.google_id ? '#86efac' : '#fef08a'}`,
              borderRadius: 10,
              padding: 14,
              marginBottom: 18,
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <svg width="20" height="20" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                  </svg>
                  <div>
                    <strong style={{ fontSize: '0.9rem', color: user.google_id ? '#15803d' : '#854d0e' }}>
                      {user.google_id ? 'Đã liên kết với Google' : 'Chưa liên kết tài khoản Google'}
                    </strong>
                    <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                      {user.google_id
                        ? 'Bạn có thể đăng nhập tức thì vào Frog Store bằng Google.'
                        : 'Liên kết Google để đăng nhập nhanh không cần nhập mật khẩu.'}
                    </div>
                  </div>
                </div>

                {user.google_id ? (
                  <button
                    type="button"
                    onClick={handleUnlinkGoogle}
                    style={{
                      background: '#fee2e2',
                      color: '#b91c1c',
                      border: '1px solid #fca5a5',
                      padding: '5px 10px',
                      borderRadius: 6,
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 4,
                    }}
                  >
                    <Unlink size={13} />
                    Hủy liên kết
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleLinkGoogle}
                    style={{
                      background: '#ffffff',
                      color: '#15803d',
                      border: '1px solid #86efac',
                      padding: '5px 12px',
                      borderRadius: 6,
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 4,
                    }}
                  >
                    <Link2 size={13} />
                    Liên kết ngay
                  </button>
                )}
              </div>
            </div>

            {/* Change Password Form */}
            <form onSubmit={handleChangePassword}>
              <h4 style={{ margin: '0 0 10px 0', fontSize: '0.95rem', color: '#1e293b' }}>
                🔑 Đổi Mật Khẩu Đăng Nhập
              </h4>

              <div className="form-group">
                <label>Mật khẩu hiện tại *</label>
                <input
                  type="password"
                  required
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                  placeholder="Nhập mật khẩu hiện tại"
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Mật khẩu mới (Tối thiểu 6 ký tự) *</label>
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Mật khẩu mới"
                  />
                </div>
                <div className="form-group">
                  <label>Nhập lại mật khẩu mới *</label>
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Xác nhận mật khẩu"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="btn-checkout"
                disabled={changingPass}
                style={{ marginTop: 10 }}
              >
                {changingPass ? 'Đang đổi mật khẩu...' : 'Xác Nhận Đổi Mật Khẩu'}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  )
}

