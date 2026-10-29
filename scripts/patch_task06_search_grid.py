# 1. Patch App.tsx
path_app = "apps/web/src/App.tsx"
with open(path_app, "r", encoding="utf-8") as f:
    app_text = f.read()

# Replace category count logic
old_cat_tab = """              <button
                className={`tab-btn ${selectedCat === 'all' ? 'active' : ''}`}
                onClick={() => handleCategoryChange('all')}
              >
                <span>🌿 Tất cả loài</span>
                <span className="tab-count">{products.length}</span>
              </button>
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  className={`tab-btn ${selectedCat === cat.slug ? 'active' : ''}`}
                  onClick={() => handleCategoryChange(cat.slug)}
                >
                  <span>{cat.icon} {cat.name}</span>
                  {cat.product_count !== undefined && (
                    <span className="tab-count">{cat.product_count}</span>
                  )}
                </button>
              ))}"""

new_cat_tab = """              {(() => {
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
              })()}"""

# Add search feedback bar and grid-few class
old_grid_block = """          ) : (
            <div className="grid">"""

new_grid_block = """          ) : (
            <>
              {search && (
                <div className="search-feedback-bar">
                  <span>🔍 Kết quả tìm kiếm cho: "<strong>{search}</strong>" — Tìm thấy <strong>{products.length} loài ếch</strong></span>
                  <button className="btn-clear-search-pill" onClick={() => handleSearchChange('')} title="Xem lại tất cả loài ếch">
                    <X size={14} /> Xóa tìm kiếm
                  </button>
                </div>
              )}
              <div className={`grid ${products.length <= 2 ? 'grid-few' : ''}`}>"""

old_grid_close = """              {products.map((p) => (
                <article className="card" key={p.id}>"""

new_grid_close = """              {products.map((p) => (
                <article className="card" key={p.id}>"""

# Also close <> in App.tsx
old_section_close = """            </div>
          )}
        </main>
      )}"""

new_section_close = """            </div>
            </>
          )}
        </main>
      )}"""

norm_app = app_text.replace("\r\n", "\n")
assert old_cat_tab.replace("\r\n", "\n") in norm_app, "old_cat_tab not found!"
norm_app = norm_app.replace(old_cat_tab.replace("\r\n", "\n"), new_cat_tab.replace("\r\n", "\n"))

assert old_grid_block.replace("\r\n", "\n") in norm_app, "old_grid_block not found!"
norm_app = norm_app.replace(old_grid_block.replace("\r\n", "\n"), new_grid_block.replace("\r\n", "\n"))

assert old_section_close.replace("\r\n", "\n") in norm_app, "old_section_close not found!"
norm_app = norm_app.replace(old_section_close.replace("\r\n", "\n"), new_section_close.replace("\r\n", "\n"))

with open(path_app, "w", encoding="utf-8") as f:
    f.write(norm_app)
print("SUCCESS: Patched App.tsx with clear catalog counts and search-feedback-bar!")

# 2. Patch styles.css
path_css = "apps/web/src/styles.css"
with open(path_css, "r", encoding="utf-8") as f:
    css_text = f.read()

old_grid_css = """/* Product Grid */
.grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(270px, 1fr));
  gap: 24px;
}"""

new_grid_css = """/* Product Grid */
.grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 24px;
}

/* Center when results are few (e.g. 1-2 products like searching 'Dumpy') */
.grid.grid-few {
  max-width: 720px;
  margin: 0 auto;
  grid-template-columns: repeat(auto-fit, minmax(280px, 340px));
  justify-content: center;
}

.search-feedback-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #f1f5f9;
  border: 1px solid #cbd5e1;
  border-radius: 10px;
  padding: 10px 16px;
  margin-bottom: 24px;
  font-size: 0.92rem;
  color: #334155;
  box-shadow: 0 1px 3px rgba(0,0,0,0.05);
}

.btn-clear-search-pill {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: #ffffff;
  border: 1px solid #94a3b8;
  color: #475569;
  border-radius: 6px;
  padding: 4px 10px;
  font-size: 0.8rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-clear-search-pill:hover {
  background: #fee2e2;
  border-color: #f87171;
  color: #dc2626;
}"""

norm_css = css_text.replace("\r\n", "\n")
assert old_grid_css.replace("\r\n", "\n") in norm_css, "old_grid_css not found!"
norm_css = norm_css.replace(old_grid_css.replace("\r\n", "\n"), new_grid_css.replace("\r\n", "\n"))

with open(path_css, "w", encoding="utf-8") as f:
    f.write(norm_css)
print("SUCCESS: Patched styles.css with .grid-few and .search-feedback-bar styles!")

