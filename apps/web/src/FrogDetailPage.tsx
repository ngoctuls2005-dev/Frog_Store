import React, { useState, useEffect } from 'react'
import type { Product } from './api'
import { api } from './api'
import {
  ChevronLeft,
  Share2,
  ShieldCheck,
  Thermometer,
  Droplets,
  Sparkles,
  Info,
  Home,
  Utensils,
  AlertTriangle,
  Check,
  ShoppingCart,
  Zap,
  Compass,
  Layers,
  HeartPulse
} from 'lucide-react'

interface FrogDetailPageProps {
  slugOrId: string | number
  onBack: () => void
  onAddToCart: (productId: number, qty?: number) => void
  onBuyNow?: (productId: number, qty?: number) => void
  onToast: (msg: string, type?: 'success' | 'info' | 'error') => void
}

export const FrogDetailPage: React.FC<FrogDetailPageProps> = ({
  slugOrId,
  onBack,
  onAddToCart,
  onBuyNow,
  onToast
}) => {
  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [activeImage, setActiveImage] = useState<string>('')
  const [activeTab, setActiveTab] = useState<'overview' | 'enclosure' | 'diet' | 'health'>('overview')
  const [qty, setQty] = useState(1)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    setLoading(true)
    setError('')
    api.productDetail(slugOrId)
      .then((p) => {
        setProduct(p)
        setActiveImage(p.image)
        setLoading(false)
      })
      .catch((err) => {
        setError(err.message || 'Không thể tải thông tin loài ếch')
        setLoading(false)
      })
  }, [slugOrId])

  const vnd = (n: number) =>
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(n)

  const handleShare = () => {
    if (!product) return
    const url = `${window.location.origin}${window.location.pathname}#/frogs/${product.slug || product.id}`
    navigator.clipboard.writeText(url)
    setCopied(true)
    onToast('Đã sao chép liên kết loài ếch vào bộ nhớ tạm!', 'success')
    setTimeout(() => setCopied(false), 2500)
  }

  const getDiffColor = (diff?: string) => {
    if (diff === 'Dễ') return '#16a34a'
    if (diff === 'Trung bình') return '#d97706'
    return '#dc2626'
  }

  const getHabitatLabel = (hab?: string) => {
    switch (hab) {
      case 'arboreal': return '🌿 Leo cây (Arboreal)'
      case 'paludarium': return '💧 Bán cạn (Paludarium)'
      case 'aquatic': return '🏊 Thủy sinh (Aquatic)'
      default: return '🏜️ Trên cạn (Terrestrial)'
    }
  }

  if (loading) {
    return (
      <div className="detail-container loading-box">
        <div className="loading-spinner"></div>
        <p>Đang tải bách khoa toàn thư sinh học ếch...</p>
      </div>
    )
  }

  if (error || !product) {
    return (
      <div className="detail-container error-box">
        <AlertTriangle size={48} color="#dc2626" />
        <h2>Không tìm thấy cá thể ếch</h2>
        <p>{error || 'Dữ liệu không tồn tại hoặc đã ngừng kinh doanh.'}</p>
        <button className="btn-secondary" onClick={onBack}>
          <ChevronLeft size={18} /> Quay lại danh mục
        </button>
      </div>
    )
  }

  const d = product.details
  const gallery = product.gallery_images && product.gallery_images.length > 0
    ? product.gallery_images
    : [product.image]

  return (
    <div className="frog-detail-page">
      {/* 1. TOP BREADCRUMB & ACTION BAR */}
      <div className="detail-nav-bar">
        <button className="btn-back-pill" onClick={onBack} title="Quay lại danh mục">
          <ChevronLeft size={18} /> Quay Lại
        </button>
        <div className="breadcrumb-trail">
          <span>Frog Store</span> &gt;{' '}
          <span>{product.category_name || 'Ếch Cảnh'}</span> &gt;{' '}
          <span className="current-crumb">{product.name}</span>
        </div>
        <button className="btn-share-pill" onClick={handleShare}>
          {copied ? <Check size={16} color="#16a34a" /> : <Share2 size={16} />}
          <span>{copied ? 'Đã chép link' : 'Chia sẻ'}</span>
        </button>
      </div>

      {/* 2. MAIN HERO SECTION (GALLERY & QUICK BUY) */}
      <div className="detail-hero-grid">
        {/* Left: Interactive Image Gallery */}
        <div className="detail-gallery-card">
          <div className="main-image-viewport">
            <img src={activeImage || product.image} alt={product.name} className="hero-frog-img" />
            <div className="guarantee-float-badge">
              <ShieldCheck size={16} /> Bảo Hành Sống 100%
            </div>
            {product.is_featured === 1 && (
              <div className="featured-float-badge">
                <Sparkles size={14} /> Nổi Bật
              </div>
            )}
          </div>
          {gallery.length > 1 && (
            <div className="gallery-thumbnails">
              {gallery.map((imgUrl, idx) => (
                <button
                  key={idx}
                  className={`thumb-btn ${activeImage === imgUrl ? 'active' : ''}`}
                  onClick={() => setActiveImage(imgUrl)}
                >
                  <img src={imgUrl} alt={`${product.name} góc ${idx + 1}`} />
                </button>
              ))}
            </div>
          )}
          <div className="gallery-caption-bar">
            <span>📷 Ảnh thật 100% không watermark</span>
            <span>Morph: <strong>{product.morph}</strong></span>
          </div>
        </div>

        {/* Right: Biological Summary & Purchase Box */}
        <div className="detail-buy-card">
          <div className="species-header">
            <div className="species-tags-row">
              <span className="habitat-tag">{getHabitatLabel(product.habitat_type)}</span>
              <span
                className="difficulty-tag"
                style={{ backgroundColor: `${getDiffColor(product.difficulty)}15`, color: getDiffColor(product.difficulty) }}
              >
                Mức độ: {product.difficulty}
              </span>
              <span className="size-stage-tag">{product.size_stage}</span>
            </div>
            <h1 className="species-title">{product.name}</h1>
            <p className="species-scientific">
              Tên khoa học: <em>{product.scientific_name}</em>
              {d?.family && <span className="family-badge"> (Họ {d.family})</span>}
            </p>
          </div>

          <p className="species-short-desc">{product.description}</p>

          <div className="pricing-box">
            <div className="price-main">
              <span className="current-price">{vnd(product.price)}</span>
              {product.original_price > product.price && (
                <span className="original-price">{vnd(product.original_price)}</span>
              )}
            </div>
            <div className="stock-indicator">
              <span className="stock-dot"></span>
              <span>Cá thể khỏe mạnh trong kho: <strong>{product.stock} bé</strong></span>
            </div>
          </div>

          {/* Quantity and Actions */}
          <div className="action-row">
            <div className="qty-picker">
              <button onClick={() => setQty(Math.max(1, qty - 1))}>-</button>
              <span>{qty}</span>
              <button onClick={() => setQty(Math.min(product.stock, qty + 1))}>+</button>
            </div>
            <button
              className="btn-add-cart-large"
              onClick={() => onAddToCart(product.id, qty)}
            >
              <ShoppingCart size={18} /> Thêm Vào Giỏ ({qty})
            </button>
            {onBuyNow && (
              <button
                className="btn-buy-now-large"
                onClick={() => onBuyNow(product.id, qty)}
              >
                <Zap size={18} /> Đặt Ngay
              </button>
            )}
          </div>

          {/* Quick biological badges */}
          <div className="quick-spec-grid">
            <div className="spec-badge-card">
              <Compass size={18} className="spec-icon" />
              <div>
                <span className="label">Tuổi Thọ</span>
                <span className="val">{product.lifespan}</span>
              </div>
            </div>
            <div className="spec-badge-card">
              <Thermometer size={18} className="spec-icon" />
              <div>
                <span className="label">Nhiệt Độ</span>
                <span className="val">{product.temperature}</span>
              </div>
            </div>
            <div className="spec-badge-card">
              <Droplets size={18} className="spec-icon" />
              <div>
                <span className="label">Độ Ẩm</span>
                <span className="val">{product.humidity}</span>
              </div>
            </div>
            <div className="spec-badge-card">
              <Layers size={18} className="spec-icon" />
              <div>
                <span className="label">Kích Thước</span>
                <span className="val">{product.size_stage}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 3. INTERACTIVE CLIMATE GAUGE (THƯỚC ĐO VI KHÍ HẬU) */}
      {d && (
        <div className="climate-gauge-card">
          <div className="climate-header">
            <h3><Thermometer size={20} color="#059669" /> Thước Đo Vi Khí Hậu Sinh Học Tối Ưu</h3>
            <span className="climate-sub">Chuẩn khoa học bảo đảm ếch ăn khỏe, tiêu hóa tốt và lên màu sáng đẹp</span>
          </div>
          <div className="gauge-grid">
            {/* Temperature Gauge */}
            <div className="gauge-item">
              <div className="gauge-top-label">
                <span>Nhiệt Độ Ban Ngày: <strong>{d.temp_day_min}°C - {d.temp_day_max}°C</strong></span>
                <span>Ban Đêm: <strong>{d.temp_night_min}°C - {d.temp_night_max}°C</strong></span>
              </div>
              <div className="progress-track temp-track">
                <div
                  className="progress-safe-zone"
                  style={{
                    left: `${Math.max(0, ((d.temp_day_min - 15) / 25) * 100)}%`,
                    width: `${Math.min(100, ((d.temp_day_max - d.temp_day_min) / 25) * 100)}%`
                  }}
                >
                  <span className="safe-badge">Dải An Toàn</span>
                </div>
              </div>
              <div className="gauge-scale">
                <span>15°C (Lạnh)</span>
                <span>25°C (Lý tưởng)</span>
                <span>40°C (Nguy hiểm)</span>
              </div>
            </div>

            {/* Humidity Gauge */}
            <div className="gauge-item">
              <div className="gauge-top-label">
                <span>Độ Ẩm Không Khí: <strong>{d.humidity_min}% - {d.humidity_max}%</strong></span>
                <span>Khuyến nghị: <strong>Xịt ẩm 1-2 lần/ngày</strong></span>
              </div>
              <div className="progress-track humid-track">
                <div
                  className="progress-safe-zone humid-safe"
                  style={{
                    left: `${d.humidity_min}%`,
                    width: `${d.humidity_max - d.humidity_min}%`
                  }}
                >
                  <span className="safe-badge">Ẩm Chuẩn</span>
                </div>
              </div>
              <div className="gauge-scale">
                <span>0% (Khô hạn)</span>
                <span>50%</span>
                <span>100% (Bão hòa)</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 4. DEEP SCIENTIFIC TABS (100% REAL HERPETOLOGY) */}
      <div className="detail-tabs-section">
        <div className="tabs-header-bar">
          <button
            className={`tab-item-btn ${activeTab === 'overview' ? 'active' : ''}`}
            onClick={() => setActiveTab('overview')}
          >
            <Info size={17} /> 1. Tổng Quan &amp; Tập Tính
          </button>
          <button
            className={`tab-item-btn ${activeTab === 'enclosure' ? 'active' : ''}`}
            onClick={() => setActiveTab('enclosure')}
          >
            <Home size={17} /> 2. Cẩm Nang Chuồng Nuôi
          </button>
          <button
            className={`tab-item-btn ${activeTab === 'diet' ? 'active' : ''}`}
            onClick={() => setActiveTab('diet')}
          >
            <Utensils size={17} /> 3. Chế Độ Dinh Dưỡng
          </button>
          <button
            className={`tab-item-btn ${activeTab === 'health' ? 'active' : ''}`}
            onClick={() => setActiveTab('health')}
          >
            <HeartPulse size={17} /> 4. Cảnh Báo Y Tế &amp; Chú Ý
          </button>
        </div>

        <div className="tabs-content-body">
          {/* TAB 1: OVERVIEW & BEHAVIOR */}
          {activeTab === 'overview' && (
            <div className="tab-pane fade-in">
              <h3>Đặc Điểm Sinh Học &amp; Tập Tính Tự Nhiên</h3>
              <div className="overview-spec-table">
                <div className="table-row">
                  <span className="cell-th">Phân loại học (Taxonomy):</span>
                  <span className="cell-td">
                    Họ <strong>{d?.family || 'N/A'}</strong> | Chi <strong>{d?.genus || 'N/A'}</strong> | Loài <em>{d?.species || product.scientific_name}</em>
                  </span>
                </div>
                <div className="table-row">
                  <span className="cell-th">Xuất xứ tự nhiên:</span>
                  <span className="cell-td">{d?.origin_region || 'Chưa cập nhật'}</span>
                </div>
                <div className="table-row">
                  <span className="cell-th">Sinh cảnh sống:</span>
                  <span className="cell-td">{d?.natural_habitat || 'Rừng nhiệt đới ẩm'}</span>
                </div>
                <div className="table-row">
                  <span className="cell-th">Kích thước trưởng thành:</span>
                  <span className="cell-td">
                    Đực: <strong>{d?.adult_size_male_cm || 0} cm</strong> | Cái: <strong>{d?.adult_size_female_cm || 0} cm</strong>
                  </span>
                </div>
                <div className="table-row">
                  <span className="cell-th">Thời gian hoạt động:</span>
                  <span className="cell-td">
                    {d?.activity_period === 'nocturnal' ? 'Ban đêm (Nocturnal)' : d?.activity_period === 'diurnal' ? 'Ban ngày (Diurnal)' : 'Hoàng hôn / Bình minh (Crepuscular)'}
                  </span>
                </div>
                <div className="table-row">
                  <span className="cell-th">Tính cách (Temperament):</span>
                  <span className="cell-td">
                    {d?.temperament === 'aggressive' ? 'Háu ăn, bảo vệ lãnh thổ mạnh mẽ' : d?.temperament === 'bold' ? 'Dạn dĩ, thường xuyên đi dạo trước mặt người' : d?.temperament === 'shy' ? 'Nhút nhát, thích nấp dưới lá cây' : 'Hiền lành, điềm tĩnh'}
                  </span>
                </div>
                <div className="table-row">
                  <span className="cell-th">Khả năng nuôi chung:</span>
                  <span className="cell-td">
                    {d?.social_cohabitation === 'strictly_solitary'
                      ? '⚠️ ĐƠN ĐỘC TUYỆT ĐỐI (Cấm nuôi chung vì sẽ ăn thịt đồng loại)'
                      : d?.social_cohabitation === 'pairs_only'
                      ? 'Chỉ nuôi theo cặp đực - cái trưởng thành'
                      : '✅ Có thể nuôi theo nhóm bầy đàn cùng kích thước'}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: ENCLOSURE SETUP */}
          {activeTab === 'enclosure' && (
            <div className="tab-pane fade-in">
              <h3>Thiết Kế Chuồng Nuôi &amp; Môi Trường Sống (Terrarium)</h3>
              <div className="enclosure-cards-grid">
                <div className="enc-card">
                  <h4>📏 Kích Thước Bể Khuyến Nghị</h4>
                  <p className="highlight-text">{d?.min_tank_size || 'Hộp tiêu chuẩn 30x30cm'}</p>
                  <p className="sub-desc">Kiểu chuồng: <strong>{getHabitatLabel(d?.enclosure_type || product.habitat_type)}</strong></p>
                </div>
                <div className="enc-card">
                  <h4>🌿 Chất Nền Lót Chuồng Tối Ưu</h4>
                  <p className="highlight-text">{d?.substrate_recommended || 'Mùn xơ dừa ẩm hoặc dớn trắng'}</p>
                  <p className="sub-desc">Giữ ẩm tốt, dễ đào bới hoặc bề mặt êm ái bảo vệ da bụng</p>
                </div>
                <div className="enc-card">
                  <h4>☀️ Ánh Sáng &amp; Đèn UVB</h4>
                  <p className="highlight-text">{d?.lighting_uvb || 'Khuyến khích đèn UVB 2.0 nhẹ nhàng'}</p>
                  <p className="sub-desc">Giúp tổng hợp Vitamin D3 tự nhiên chống bệnh xương mềm MBD</p>
                </div>
                <div className="enc-card">
                  <h4>💧 Nguồn Nước &amp; Khay Nước</h4>
                  <p className="highlight-text">{d?.water_requirements || 'Nước sạch khử clo hoàn toàn 100%'}</p>
                  <p className="sub-desc">Thay nước thường xuyên; tuyệt đối không dùng nước máy chứa clo</p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: DIET & FEEDING */}
          {activeTab === 'diet' && (
            <div className="tab-pane fade-in">
              <h3>Chế Độ Dinh Dưỡng &amp; Lịch Cho Ăn</h3>
              <div className="diet-section">
                <h4>🍽️ Các Món Ăn Khoái Khẩu</h4>
                <div className="food-tags-cloud">
                  {(d?.primary_diet && d.primary_diet.length > 0 ? d.primary_diet : [product.diet]).map((food, idx) => (
                    <span key={idx} className="food-pill">🐛 {food}</span>
                  ))}
                </div>

                <div className="diet-guidelines-grid">
                  <div className="guideline-card">
                    <h5>🕒 Tần Suất Cho Ăn</h5>
                    <p>{d?.feeding_frequency || product.care_guide}</p>
                  </div>
                  <div className="guideline-card">
                    <h5>💊 Hướng Dẫn Bổ Sung Canxi &amp; Vitamin D3</h5>
                    <p>{d?.supplements_guide || 'Rắc bột canxi D3 lên thức ăn 1-2 lần mỗi tuần'}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: CRITICAL HEALTH WARNINGS */}
          {activeTab === 'health' && (
            <div className="tab-pane fade-in">
              <div className="warnings-alert-box">
                <div className="alert-title-row">
                  <AlertTriangle size={24} color="#dc2626" />
                  <h4>NHỮNG ĐIỀU TỐI QUAN TRỌNG CẦN CHÚ Ý KHI NUÔI</h4>
                </div>
                <ul className="critical-rules-list">
                  {(d?.critical_warnings && d.critical_warnings.length > 0 ? d.critical_warnings : [
                    'Không cầm nắm bằng tay trần có dính xà phòng hoặc muối mồ hôi',
                    'Tuyệt đối không dùng sỏi dăm nhỏ lót chuồng dễ gây tắc ruột tử vong',
                    'Duy trì dải nhiệt độ và độ ẩm ổn định, tránh gió điều hòa phả trực tiếp'
                  ]).map((rule, idx) => (
                    <li key={idx} className="rule-item">
                      <span className="rule-num">{idx + 1}</span>
                      <span>{rule}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="health-detail-grid">
                <div className="health-card">
                  <h5>🛡️ An Toàn Tiếp Xúc (Handling Safety)</h5>
                  <p>{d?.handling_safety || 'Lưỡng cư có làn da thẩm thấu màng mỏng, chỉ quan sát là chính'}</p>
                </div>
                <div className="health-card">
                  <h5>🧪 Cảnh Báo Độc Tính Da</h5>
                  <p>{d?.toxicity_warning || 'Hoàn toàn không có độc tố ở cá thể sinh sản nhân tạo'}</p>
                </div>
                <div className="health-card full-span">
                  <h5>🩺 Các Bệnh Lý Phổ Biến &amp; Cách Phòng Tránh</h5>
                  <p>{d?.common_health_issues || 'Bệnh mềm xương (MBD) do thiếu canxi; Tắc nghẽn ruột do nuốt sỏi; Nấm da do nước bẩn'}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 5. Sticky Bottom Mobile Bar */}
      <div className="sticky-mobile-buy-bar">
        <div className="sticky-bar-left">
          <img src={product.image} alt={product.name} className="sticky-bar-thumb" />
          <div className="sticky-bar-text">
            <span className="sticky-bar-name">{product.name}</span>
            <span className="sticky-bar-price">{vnd(product.price)}</span>
          </div>
        </div>
        <div className="sticky-bar-actions">
          <button
            className="btn-sticky-cart"
            onClick={() => onAddToCart(product.id, qty)}
            title="Thêm vào giỏ hàng"
          >
            <ShoppingCart size={18} />
          </button>
          <button
            className="btn-sticky-buy"
            onClick={() => {
              if (onBuyNow) {
                onBuyNow(product.id, qty)
              } else {
                onAddToCart(product.id, qty)
              }
            }}
          >
            Mua Ngay
          </button>
        </div>
      </div>
    </div>
  )
}

