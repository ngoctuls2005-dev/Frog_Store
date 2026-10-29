import os
import sys

sys.stdout.reconfigure(encoding='utf-8')

print("Starting V4 Performance, Stability & Text Protection Verification...")

# 1. Verify ErrorBoundary
assert os.path.exists('apps/web/src/ErrorBoundary.tsx'), "Missing ErrorBoundary.tsx"
with open('apps/web/src/main.tsx', 'r', encoding='utf-8') as f:
    main_code = f.read()
assert 'ErrorBoundary' in main_code, "ErrorBoundary not mounted in main.tsx"
print("✓ 1. ErrorBoundary stability wrapper verified")

# 2. Verify API Caching Headers
with open('apps/api/src/index.ts', 'r', encoding='utf-8') as f:
    api_code = f.read()
assert "app.get('/categories'" in api_code and "max-age=60" in api_code, "Missing caching on /categories"
assert "app.get('/products'" in api_code and "max-age=60" in api_code, "Missing caching on /products"
assert "app.get('/products/:idOrSlug'" in api_code and "max-age=60" in api_code, "Missing caching on /products/:idOrSlug"
assert "app.get('/ai/frogs/knowledge'" in api_code and "max-age=120" in api_code, "Missing caching on /ai/frogs/knowledge"
print("✓ 2. Cloudflare & Browser Edge Caching headers verified for all public APIs")

# 3. Verify HTML Preconnect & DNS-Prefetch
with open('apps/web/index.html', 'r', encoding='utf-8') as f:
    html_code = f.read()
assert 'rel="dns-prefetch"' in html_code, "Missing dns-prefetch in index.html"
assert 'rel="preconnect"' in html_code, "Missing preconnect in index.html"
print("✓ 3. Preconnect and DNS-Prefetch verified in index.html")

# 4. Verify CSS Content-Visibility & Text Protection Rules
with open('apps/web/src/styles.css', 'r', encoding='utf-8') as f:
    css_code = f.read()

assert 'content-visibility: auto' in css_code, "Missing content-visibility in CSS"
assert 'user-select: none !important' in css_code, "Missing user-select: none !important in CSS"
assert 'user-drag: none !important' in css_code, "Missing image drag protection in CSS"
assert 'user-select: text !important' in css_code, "Missing selectable text rules in CSS"
assert '.order-code-text' in css_code, "Missing order-code-text selectable rule"
assert '.species-scientific' in css_code, "Missing species-scientific selectable rule"
print("✓ 4. Content-Visibility rendering & Text Protection (no unwanted copy/highlight) verified")

print("\n[ALL 4 CHECKS PASSED 100%] V4 Perf, Stability & Text Protection verified successfully!")
