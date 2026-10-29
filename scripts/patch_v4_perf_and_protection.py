import sys
import os

sys.stdout.reconfigure(encoding='utf-8')
print("Starting UI/UX V4 Perf & Text Protection Patches...")

# 1. Patch apps/api/src/index.ts for API Caching Headers
with open('apps/api/src/index.ts', 'r', encoding='utf-8') as f:
    api_code = f.read()

# Categories cache header
old_cat_api = """app.get('/categories', async (c) => {
  const { results } = await c.env.DB.prepare(
    `SELECT c.*, COUNT(p.id) as product_count 
     FROM categories c 
     LEFT JOIN products p ON p.category_id = c.id 
     GROUP BY c.id 
     ORDER BY c.id`
  ).all<Category>()
  return c.json(results)
})"""

new_cat_api = """app.get('/categories', async (c) => {
  const { results } = await c.env.DB.prepare(
    `SELECT c.*, COUNT(p.id) as product_count 
     FROM categories c 
     LEFT JOIN products p ON p.category_id = c.id 
     GROUP BY c.id 
     ORDER BY c.id`
  ).all<Category>()
  c.header('Cache-Control', 'public, max-age=60, s-maxage=300, stale-while-revalidate=600')
  return c.json(results)
})"""

if old_cat_api in api_code:
    api_code = api_code.replace(old_cat_api, new_cat_api)
    print("✓ Added Cache-Control to /api/categories")

# Products list cache header
old_prod_ret = "  return c.json(parsed)\n})"
new_prod_ret = "  c.header('Cache-Control', 'public, max-age=60, s-maxage=300, stale-while-revalidate=600')\n  return c.json(parsed)\n})"

if old_prod_ret in api_code:
    api_code = api_code.replace(old_prod_ret, new_prod_ret, 1)
    print("✓ Added Cache-Control to /api/products")

# Single product detail cache header
old_single_ret = "  return c.json(product)\n})"
new_single_ret = "  c.header('Cache-Control', 'public, max-age=60, s-maxage=300, stale-while-revalidate=600')\n  return c.json(product)\n})"

if old_single_ret in api_code:
    api_code = api_code.replace(old_single_ret, new_single_ret, 1)
    print("✓ Added Cache-Control to /api/products/:idOrSlug")

# AI knowledge cache header
old_ai_ret = "  return c.json({\n    title: 'Frog Store Herpetology AI Knowledge Base',"
new_ai_ret = "  c.header('Cache-Control', 'public, max-age=120, s-maxage=600, stale-while-revalidate=1200')\n  return c.json({\n    title: 'Frog Store Herpetology AI Knowledge Base',"

if old_ai_ret in api_code:
    api_code = api_code.replace(old_ai_ret, new_ai_ret, 1)
    print("✓ Added Cache-Control to /api/ai/frogs/knowledge")

with open('apps/api/src/index.ts', 'w', encoding='utf-8') as f:
    f.write(api_code)

# 2. Patch apps/web/index.html with preconnect & dns-prefetch
with open('apps/web/index.html', 'r', encoding='utf-8') as f:
    html_code = f.read()

new_meta = """    <meta name="description" content="Frog Store chuyên cung cấp ếch cảnh sống (Pacman, Ếch Cây, Phi Tiêu Độc, Ếch Rêu Việt Nam). Giá chuẩn thị trường, thuần ăn mồi, bảo hành sống 100% khi nhận hàng." />
    <meta name="theme-color" content="#065f46" />
    <meta http-equiv="x-dns-prefetch-control" content="on" />
    <link rel="dns-prefetch" href="https://store.ngoctuls2005.workers.dev" />
    <link rel="preconnect" href="https://store.ngoctuls2005.workers.dev" crossorigin />"""

old_meta = """    <meta name="description" content="Frog Store chuyên cung cấp ếch cảnh sống (Pacman, Ếch Cây, Phi Tiêu Độc, Ếch Rêu Việt Nam). Giá chuẩn thị trường, thuần ăn mồi, bảo hành sống 100% khi nhận hàng." />"""

if old_meta in html_code:
    html_code = html_code.replace(old_meta, new_meta)
    with open('apps/web/index.html', 'w', encoding='utf-8') as f:
        f.write(html_code)
    print("✓ Added preconnect & dns-prefetch to index.html")

# 3. Patch apps/web/src/styles.css with Content-Visibility and Text-Selection Protection
with open('apps/web/src/styles.css', 'r', encoding='utf-8') as f:
    css_code = f.read()

perf_and_protection_css = """
/* ========================================================
   UI/UX V4: PERFORMANCE (CONTENT-VISIBILITY) & TEXT SELECTION PROTECTION
   Chặn bôi đen/copy các phần tử UI, nút bấm, nhãn mác, hình ảnh
   Chỉ cho phép bôi đen copy nội dung thiết yếu (mã đơn, hotline, tên khoa học, mô tả)
   ======================================================== */

/* Content visibility auto for catalog cards to accelerate rendering & scroll fps */
.card {
  content-visibility: auto;
  contain-intrinsic-size: 300px 380px;
}

/* Chặn bôi đen toàn bộ các nút bấm, navigation, controls, headers, badges, tabs, cards, tables */
.topbar,
.announcement-bar,
.hero,
.category-tabs,
.tab-btn,
.filter-bar,
.search-bar .search-icon,
.btn-search-clear,
.btn-clear-search-pill,
.card-img-wrap,
.card-meta,
.card-category,
.card-size,
.card-habitat-badge,
.card-btn,
.badge-featured,
.badge,
.tag,
.species-tags-row,
.habitat-tag,
.difficulty-tag,
.size-stage-tag,
.pricing-box,
.stock-indicator,
.action-row,
.qty-picker,
.btn-add-cart-large,
.btn-buy-now-large,
.spec-badge-card,
.quick-spec-grid,
.climate-gauge-card,
.climate-header,
.gauge-top-label,
.gauge-scale,
.gauge-sub-pill,
.detail-gallery-card,
.gallery-caption-bar,
.tabs-header-bar,
.tab-item-btn,
.overview-spec-table .cell-th,
.enclosure-cards-grid .enc-card h4,
.diet-guidelines-grid .guideline-card h5,
.food-tags-cloud,
.sticky-mobile-buy-bar,
.btn-back-pill,
.btn-share-pill,
.breadcrumb-trail,
.footer,
.footer-col h3,
.footer-bottom,
.frog-ai-fab,
.chat-panel-header,
.chat-quick-prompts,
.btn-quick-prompt,
.btn-chat-send,
.quiz-container,
.quiz-header,
.quiz-option-card,
.quiz-progress-bar,
.policy-modal-header,
.policy-tab-bar,
.policy-tab-item,
.policy-modal-footer,
.policy-btn-confirm,
.policy-step-num,
.policy-footer-badge,
.order-header .status-badge,
.modal-header,
.modal-close,
button,
.btn {
  -webkit-user-select: none !important;
  -moz-user-select: none !important;
  -ms-user-select: none !important;
  user-select: none !important;
}

/* Chặn kéo thả hình ảnh (Ghost drag image) và chặn bôi đen ảnh trên toàn trang */
img {
  -webkit-user-drag: none !important;
  -khtml-user-drag: none !important;
  -moz-user-drag: none !important;
  -o-user-drag: none !important;
  user-drag: none !important;
  -webkit-user-select: none !important;
  user-select: none !important;
}

/* Các vùng THỰC SỰ CẦN THIẾT được phép bôi đen và sao chép dễ dàng */
input,
textarea,
[contenteditable="true"],
.selectable-text,
.order-code-text,
.order-code-box,
.order-code,
.species-scientific,
.species-scientific em,
.species-title,
.species-short-desc,
.tab-pane,
.cell-td,
.enc-card .highlight-text,
.enc-card .sub-desc,
.policy-card-content,
.policy-p,
.chat-bubble,
.copyable-hotline {
  -webkit-user-select: text !important;
  -moz-user-select: text !important;
  -ms-user-select: text !important;
  user-select: text !important;
}
"""

if '/* UI/UX V4: PERFORMANCE' not in css_code:
    css_code += perf_and_protection_css
    with open('apps/web/src/styles.css', 'w', encoding='utf-8') as f:
        f.write(css_code)
    print("✓ Appended Content-Visibility & Text Protection to styles.css")

print("All V4 patches applied successfully!")

