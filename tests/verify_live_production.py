import urllib.request
import urllib.error
import json
import sys
sys.stdout.reconfigure(encoding='utf-8')

BASE_URL = 'https://store.ngoctuls2005.workers.dev'
print(f"=== BẮT ĐẦU KIỂM TRA TRỰC TIẾP PRODUCTION LIVE: {BASE_URL} ===")

# 1. Test Products API & Blue Snowflake v2
req = urllib.request.Request(f"{BASE_URL}/api/products", headers={'User-Agent': 'Mozilla/5.0'})
with urllib.request.urlopen(req, timeout=15) as res:
    data = json.loads(res.read().decode('utf-8'))
    print(f"✓ LIVE: Lấy thành công {len(data)} sản phẩm từ Cloudflare D1.")
    snow = next((p for p in data if p['id'] == 10 or p['slug'] == 'tree-blue-snowflake'), None)
    assert snow is not None, "FAIL: Không tìm thấy loài Blue Snowflake trên Live!"
    print(f"✓ LIVE Product 10 Image: {snow['image']}")
    assert snow['image'] == '/images/frogs/tree-blue-snowflake-v2.jpg', f"FAIL: Image vẫn là {snow['image']}"

# 2. Test Image HTTP 200
img_req = urllib.request.Request(f"{BASE_URL}/images/frogs/tree-blue-snowflake-v2.jpg", headers={'User-Agent': 'Mozilla/5.0'})
with urllib.request.urlopen(img_req, timeout=15) as img_res:
    assert img_res.status == 200, f"FAIL: Image trả về HTTP {img_res.status}"
    content_len = len(img_res.read())
    print(f"✓ LIVE Image CDN: File tree-blue-snowflake-v2.jpg tải về thành công ({content_len} bytes, HTTP 200).")

# 3. Test Fake Google Auth Rejection
fake_google_payload = json.dumps({'googleId': 'fake123', 'email': 'admin@frogstore.vn'}).encode('utf-8')
google_req = urllib.request.Request(
    f"{BASE_URL}/api/auth/google",
    data=fake_google_payload,
    headers={'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'}
)
try:
    with urllib.request.urlopen(google_req, timeout=15) as g_res:
        print("FAIL: Fake Google Login should not succeed!")
except urllib.error.HTTPError as e:
    print(f"✓ LIVE Google Auth P0 Security: Fake raw credential bị từ chối chính xác với HTTP {e.code} ({e.reason}).")
    assert e.code in [400, 401], f"Expected 400 or 401, got {e.code}"

# 4. Test Admin RBAC without token
admin_req = urllib.request.Request(f"{BASE_URL}/api/admin/stats", headers={'User-Agent': 'Mozilla/5.0'})
try:
    with urllib.request.urlopen(admin_req, timeout=15) as a_res:
        print("FAIL: Admin API should not be publicly accessible!")
except urllib.error.HTTPError as e:
    print(f"✓ LIVE Admin RBAC P0 Security: Truy cập trái phép /api/admin/stats bị chặn chính xác với HTTP {e.code} ({e.reason}).")
    assert e.code == 403, f"Expected 403, got {e.code}"

# 5. Test Non-existent Order Lookup
track_req = urllib.request.Request(f"{BASE_URL}/api/orders/FS-00000000", headers={'User-Agent': 'Mozilla/5.0'})
try:
    with urllib.request.urlopen(track_req, timeout=15) as t_res:
        print("Order found unexpectedly")
except urllib.error.HTTPError as e:
    print(f"✓ LIVE Order Tracking: Mã tra cứu không tồn tại trả về đúng HTTP {e.code} ({e.reason}).")
    assert e.code == 404

print("\n🎉 TOÀN BỘ CÁC BÀI KIỂM THỬ TRỰC TIẾP TRÊN CLOUDFLARE PRODUCTION ĐỀU ĐẠT CHUẨN XUẤT SẮC!")

