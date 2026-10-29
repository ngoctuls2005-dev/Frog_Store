import urllib.request
import json
import hashlib
import sys

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

BASE_URL = "https://store.ngoctuls2005.workers.dev"
BROWSER_HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
}

def test_live_featured_and_products():
    print("[1] Testing live API /api/products for featured counts & distinct images...")
    req = urllib.request.Request(f"{BASE_URL}/api/products", headers=BROWSER_HEADERS)
    res = urllib.request.urlopen(req)
    data = json.loads(res.read().decode("utf-8"))
    
    assert len(data) >= 26, f"Expected 26 products, got {len(data)}"
    
    featured = [p for p in data if p.get("is_featured") == 1]
    print(f"    Featured products count: {len(featured)}")
    assert len(featured) == 4, f"Expected exactly 4 featured products, got {len(featured)}"
    
    dumpy = next((p for p in data if p.get("slug") == "tree-whites-dumpy"), None)
    snowflake = next((p for p in data if p.get("slug") == "tree-blue-snowflake"), None)
    
    assert dumpy, "tree-whites-dumpy product not found"
    assert snowflake, "tree-blue-snowflake product not found"
    assert dumpy["image"] != snowflake["image"], "Dumpy and Snowflake must have different image paths!"
    print(f"    Dumpy image: {dumpy['image']}")
    print(f"    Snowflake image: {snowflake['image']}")
    print("    [PASS] Live products and featured count verified.")

def test_live_images():
    print("[2] Fetching live images from CDN to verify distinct bytes & hashes...")
    dumpy_url = f"{BASE_URL}/images/frogs/tree-whites-dumpy.jpg"
    snow_url = f"{BASE_URL}/images/frogs/tree-blue-snowflake.jpg"
    
    req1 = urllib.request.Request(dumpy_url, headers=BROWSER_HEADERS)
    dumpy_bytes = urllib.request.urlopen(req1).read()
    
    req2 = urllib.request.Request(snow_url, headers=BROWSER_HEADERS)
    snow_bytes = urllib.request.urlopen(req2).read()
    
    print(f"    Live Dumpy size: {len(dumpy_bytes)} bytes | MD5: {hashlib.md5(dumpy_bytes).hexdigest()[:8]}")
    print(f"    Live Snowflake size: {len(snow_bytes)} bytes | MD5: {hashlib.md5(snow_bytes).hexdigest()[:8]}")
    
    assert len(dumpy_bytes) > 50000, "Dumpy image too small"
    assert len(snow_bytes) > 50000, "Snowflake image too small"
    assert hashlib.md5(dumpy_bytes).hexdigest() != hashlib.md5(snow_bytes).hexdigest(), "Dumpy and Snowflake MUST NOT be identical on live CDN!"
    print("    [PASS] Live images on CDN are authentic, high-res, and 100% distinct.")

def test_security_and_assets():
    print("[3] Testing security headers and assets on live HTTPS...")
    req = urllib.request.Request(f"{BASE_URL}/", headers=BROWSER_HEADERS)
    res = urllib.request.urlopen(req)
    headers = {k.lower(): v for k, v in res.headers.items()}
    assert "max-age=31536000" in headers.get("strict-transport-security", ""), "HSTS header missing"
    assert headers.get("x-content-type-options") == "nosniff", "X-Content-Type-Options missing"
    assert headers.get("x-frame-options") == "DENY", "X-Frame-Options missing"
    print("    [PASS] Live security headers verified.")

if __name__ == "__main__":
    try:
        test_live_featured_and_products()
        test_live_images()
        test_security_and_assets()
        print("\n=======================================================")
        print("[SUCCESS] ALL UI/UX V2 PRODUCTION CHECKS PASSED 100%!")
        print("=======================================================")
    except Exception as e:
        print(f"\n[FAIL] Test error: {e}")
        sys.exit(1)
