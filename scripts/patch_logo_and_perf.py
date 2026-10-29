import re
import sys

sys.stdout.reconfigure(encoding='utf-8')

print("Starting logo home navigation and performance patch...")

# 1. Patch App.tsx
with open('apps/web/src/App.tsx', 'r', encoding='utf-8') as f:
    app_code = f.read()

# Add handleGoHome right after resetFilters
old_reset = '''  const resetFilters = () => {
    setSelectedCat('all')
    setSelectedDiff('all')
    setSelectedHabitat('all')
    setSelectedPrice('all')
    setSearch('')
    setSortBy('featured')
    fetchFilteredProducts('all', 'all', 'all', '', 'featured', 'all')
  }'''

new_reset_and_gohome = '''  const resetFilters = () => {
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
    setLookupOpen(false)
    setQuizOpen(false)
    setAuthOpen(false)
    setCartOpen(false)
    setPolicyOpen(false)
    resetFilters()
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }'''

if old_reset in app_code:
    app_code = app_code.replace(old_reset, new_reset_and_gohome)
    print("✓ Added handleGoHome to App.tsx")
else:
    print("! Could not find old_reset in App.tsx")

# Patch brand header in App.tsx
old_brand = '''        <div className="brand" onClick={resetFilters}>
          <span className="brand-icon">🐸</span>
          <div className="brand-text">
            <h1>FROG STORE</h1>
            <p>Ếch Cảnh Sống & Bán Cạn</p>
          </div>
        </div>'''

new_brand = '''        <div
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
        </div>'''

if old_brand in app_code:
    app_code = app_code.replace(old_brand, new_brand)
    print("✓ Patched brand onClick to handleGoHome with full a11y")
else:
    print("! Could not find old_brand in App.tsx")

# Optimize product card image rendering in App.tsx
old_card_img = '<img src={p.image} alt={p.name} loading="lazy" />'
new_card_img = '<img src={p.image} alt={p.name} loading="lazy" decoding="async" width="300" height="225" />'

if old_card_img in app_code:
    app_code = app_code.replace(old_card_img, new_card_img)
    print("✓ Added async decoding and explicit dimensions to catalog images")

with open('apps/web/src/App.tsx', 'w', encoding='utf-8') as f:
    f.write(app_code)

# 2. Patch FrogDetailPage.tsx for faster LCP & smooth image loading
with open('apps/web/src/FrogDetailPage.tsx', 'r', encoding='utf-8') as f:
    detail_code = f.read()

old_detail_hero_img = '<img src={activeImage || product.image} alt={product.name} className="hero-frog-img" />'
new_detail_hero_img = '<img src={activeImage || product.image} alt={product.name} className="hero-frog-img" decoding="async" fetchPriority="high" width="600" height="450" />'

if old_detail_hero_img in detail_code:
    detail_code = detail_code.replace(old_detail_hero_img, new_detail_hero_img)
    print("✓ Optimized FrogDetailPage hero image with fetchPriority=high and decoding=async")

old_thumb_img = '<img src={imgUrl} alt={`${product.name} góc ${idx + 1}`} />'
new_thumb_img = '<img src={imgUrl} alt={`${product.name} góc ${idx + 1}`} loading="lazy" decoding="async" width="80" height="60" />'

if old_thumb_img in detail_code:
    detail_code = detail_code.replace(old_thumb_img, new_thumb_img)
    print("✓ Optimized FrogDetailPage thumbnail images")

old_sticky_thumb = '<img src={product.image} alt={product.name} className="sticky-bar-thumb" />'
new_sticky_thumb = '<img src={product.image} alt={product.name} className="sticky-bar-thumb" loading="lazy" decoding="async" width="44" height="44" />'

if old_sticky_thumb in detail_code:
    detail_code = detail_code.replace(old_sticky_thumb, new_sticky_thumb)
    print("✓ Optimized FrogDetailPage sticky bar thumb")

with open('apps/web/src/FrogDetailPage.tsx', 'w', encoding='utf-8') as f:
    detail_code = detail_code.replace(
      '// 3. INTERACTIVE CLIMATE GAUGE',
      '// 3. INTERACTIVE CLIMATE GAUGE'
    )
    f.write(detail_code)

# 3. Patch styles.css for interactive Brand Header
with open('apps/web/src/styles.css', 'r', encoding='utf-8') as f:
    css_code = f.read()

brand_css_addition = '''
/* Interactive Brand Logo Navigation */
.brand {
  cursor: pointer !important;
  user-select: none;
  transition: opacity 0.2s ease, transform 0.15s ease;
  outline-offset: 4px;
}

.brand:hover {
  opacity: 0.94;
}

.brand:hover .brand-icon {
  transform: scale(1.15) rotate(-6deg);
}

.brand:active {
  transform: scale(0.97);
}

.brand-icon {
  display: inline-block;
  transition: transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
}
'''

if '/* Interactive Brand Logo Navigation */' not in css_code:
    css_code += brand_css_addition
    with open('apps/web/src/styles.css', 'w', encoding='utf-8') as f:
        f.write(css_code)
    print("✓ Appended interactive brand logo styling to styles.css")

print("All patches applied successfully!")
