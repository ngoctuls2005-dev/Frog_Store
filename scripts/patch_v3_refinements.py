import sys
import os

sys.stdout.reconfigure(encoding='utf-8')
print("Starting UI/UX V3 refinements...")

# 1. Patch App.tsx: Gỡ bỏ thanh tìm kiếm trùng lặp & rút gọn Hero banner
with open('apps/web/src/App.tsx', 'r', encoding='utf-8') as f:
    app_code = f.read()

# Remove duplicate search-result-banner
old_dup_search = '''            {/* Search Result Banner */}
            {search && (
              <div className="search-result-banner">
                <span>
                  🔍 Tìm thấy <strong>{products.length}</strong> loài ếch khớp với từ khóa "<em>{search}</em>"
                </span>
                <button
                  type="button"
                  className="btn-clear-search-pill"
                  onClick={() => handleSearchChange('')}
                >
                  ✕ Xóa tìm kiếm
                </button>
              </div>
            )}'''

if old_dup_search in app_code:
    app_code = app_code.replace(old_dup_search, '{/* Single search feedback bar rendered above grid */}')
    print("✓ Removed duplicate search banner from App.tsx")
else:
    print("! Could not find old_dup_search in App.tsx")

# Compact Hero Banner in App.tsx
old_hero = '''      {/* 3. Hero Banner (Chỉ hiển thị tại trang chủ, không lặp lại ở trang chi tiết) */}
      {!activeDetailSlug && (
        <section className="hero">
          <div className="hero-content">
            <div className="hero-pill">
              <Sparkles size={16} />
              <span>Thế Giới Lưỡng Cư Nhập Khẩu & Nhân Giống Thuần</span>
            </div>
            <h2>THẾ GIỚI ẾCH CẢNH SỐNG ĐẲNG CẤP</h2>
            <p>
              Chuyên cung cấp các dòng ếch cảnh Pacman, Ếch Cây, Ếch Phi Tiêu Độc và các loài lưỡng cư
              quý hiếm. Chuẩn giống 100%, thuần ăn mồi, giá thị trường chuẩn và tư vấn trọn đời.
            </p>

            <div className="hero-features">
              <div className="feature-tag">
                <ShieldCheck size={18} color="#4ade80" />
                <span>Bảo hành sống 100% khi nhận hàng</span>
              </div>
              <div className="feature-tag">
                <Truck size={18} color="#60a5fa" />
                <span>Thùng xốp giữ ẩm giao hỏa tốc toàn quốc</span>
              </div>
              <div className="feature-tag">
                <HeartPulse size={18} color="#f472b6" />
                <span>Đã thuần cám & mồi, ăn khỏe không tật lỗi</span>
              </div>
            </div>

            <div style={{ marginTop: 20 }}>
              <button className="btn-hero-quiz" onClick={handleStartQuiz}>
                <Sparkles size={18} />
                <span>🎯 Trợ Thủ Tìm Ếch Phù Hợp (Quiz 30 Giây)</span>
              </button>
            </div>
          </div>
        </section>
      )}'''

new_hero = '''      {/* 3. Compact Hero Banner (Tối ưu chiều cao ~190px giúp hiển thị sản phẩm ngay màn hình đầu) */}
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
      )}'''

if old_hero in app_code:
    app_code = app_code.replace(old_hero, new_hero)
    print("✓ Replaced hero with compact high-density layout in App.tsx")
else:
    print("! Could not find old_hero in App.tsx")

with open('apps/web/src/App.tsx', 'w', encoding='utf-8') as f:
    f.write(app_code)

# 2. Patch styles.css: Category wrap, Compact hero, Calm FAB, and Safe padding
with open('apps/web/src/styles.css', 'r', encoding='utf-8') as f:
    css_code = f.read()

# Make .category-tabs wrap on desktop
old_cat_tabs = '''.category-tabs {
  display: flex;
  gap: 10px;
  overflow-x: auto;
  padding-bottom: 8px;
  padding-top: 2px;
  scrollbar-width: none;
  -ms-overflow-style: none;
}'''

new_cat_tabs = '''.category-tabs {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  padding-bottom: 4px;
  padding-top: 2px;
}'''

if old_cat_tabs in css_code:
    css_code = css_code.replace(old_cat_tabs, new_cat_tabs)
    print("✓ Enabled flex-wrap for .category-tabs on desktop")
else:
    print("! Could not find old_cat_tabs in styles.css")

# CSS for compact hero, calm chat FAB, and safe detail padding
v3_css = '''
/* ========================================================
   UI/UX V3 REFINEMENTS (COMPACT HERO, CALM FAB, SAFE LAYOUT)
   ======================================================== */
.hero.hero-compact {
  padding: 24px 20px 20px 20px;
  background: linear-gradient(135deg, #052e16 0%, #14532d 60%, #15803d 100%);
  min-height: auto;
}

.hero-badge-row {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  margin-bottom: 8px;
  flex-wrap: wrap;
}

.hero-title-compact {
  font-size: 1.65rem;
  font-weight: 800;
  margin: 0 0 6px 0;
  letter-spacing: -0.02em;
  line-height: 1.25;
  color: #ffffff;
}

.hero-desc-compact {
  font-size: 0.92rem;
  color: #dcfce7;
  margin: 0 0 14px 0;
  max-width: 680px;
  margin-left: auto;
  margin-right: auto;
  line-height: 1.45;
}

.hero-features-compact {
  display: flex;
  justify-content: center;
  gap: 16px;
  flex-wrap: wrap;
}

.feature-tag-compact {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 0.82rem;
  color: #f0fdf4;
  background: rgba(255, 255, 255, 0.08);
  padding: 4px 12px;
  border-radius: 9999px;
  border: 1px solid rgba(255, 255, 255, 0.12);
}

.btn-hero-quiz-compact {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: #f59e0b;
  color: #1c1917;
  font-weight: 700;
  font-size: 0.8rem;
  padding: 4px 14px;
  border-radius: 9999px;
  border: none;
  cursor: pointer;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
  transition: all 0.2s;
}

.btn-hero-quiz-compact:hover {
  background: #fbbf24;
  transform: translateY(-1px);
}

/* Calm, Elegant Chat FAB (No intrusive glowing, natural shadow) */
.frog-ai-fab {
  position: fixed;
  bottom: 24px;
  right: 24px;
  z-index: 9998;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 18px;
  background: #065f46;
  color: #ffffff;
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 9999px;
  box-shadow: 0 4px 14px rgba(0, 0, 0, 0.16);
  font-weight: 600;
  font-size: 0.88rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.frog-ai-fab:hover,
.frog-ai-fab:focus-visible {
  background: #047857;
  transform: translateY(-1px);
  box-shadow: 0 6px 18px rgba(0, 0, 0, 0.22);
  outline: none;
}

.fab-online-dot {
  width: 7px;
  height: 7px;
  background: #34d399;
  border-radius: 50%;
  box-shadow: none !important;
}

/* Safe layout on Frog Detail View to prevent chatbot overlapping */
.detail-container {
  padding-bottom: 96px !important;
}

.climate-gauge-card {
  margin-bottom: 28px !important;
}

@media (min-width: 1024px) {
  .climate-gauge-card {
    margin-right: 0;
  }
}

/* Responsive adjustment for Category Tabs */
@media (max-width: 640px) {
  .category-tabs {
    flex-wrap: nowrap !important;
    overflow-x: auto !important;
    -webkit-overflow-scrolling: touch;
    scrollbar-width: thin;
    scrollbar-color: #cbd5e1 transparent;
  }
}
'''

if '/* UI/UX V3 REFINEMENTS' not in css_code:
    css_code += v3_css
    with open('apps/web/src/styles.css', 'w', encoding='utf-8') as f:
        f.write(css_code)
    print("✓ Appended UI/UX V3 styling to styles.css")

print("All code patches applied successfully!")
