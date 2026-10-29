import urllib.request
import json
import re
import subprocess
import sys

BASE_URL = "https://store.ngoctuls2005.workers.dev"
HTTP_BASE_URL = "http://store.ngoctuls2005.workers.dev"

BROWSER_HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
    "Accept-Language": "en-US,en;q=0.5",
}

def test_http_redirect():
    print("[1] Testing HTTP -> HTTPS 301 Permanent Redirect...")
    class NoRedirect(urllib.request.HTTPRedirectHandler):
        def http_error_301(self, req, fp, code, msg, headers):
            return fp
        def http_error_302(self, req, fp, code, msg, headers):
            return fp

    opener = urllib.request.build_opener(NoRedirect)
    req = urllib.request.Request(f"{HTTP_BASE_URL}/", headers={"User-Agent": "Mozilla/5.0"})
    res = opener.open(req)
    status = getattr(res, "status", getattr(res, "code", None))
    headers = dict(res.headers)
    print(f"    Redirect status: {status}")
    print(f"    Location: {headers.get('Location')}")
    assert status == 301, f"Expected 301 redirect, got {status}"
    assert headers.get("Location") == f"{BASE_URL}/", f"Expected Location: {BASE_URL}/, got {headers.get('Location')}"
    print("    [PASS] Plain HTTP request redirects with 301 to HTTPS.")

def test_security_headers():
    print("[2] Testing Security Headers on live HTTPS...")
    req = urllib.request.Request(f"{BASE_URL}/", headers=BROWSER_HEADERS)
    res = urllib.request.urlopen(req)
    headers = {k.lower(): v for k, v in res.headers.items()}
    
    hsts = headers.get("strict-transport-security", "")
    nosniff = headers.get("x-content-type-options", "")
    xframe = headers.get("x-frame-options", "")
    referrer = headers.get("referrer-policy", "")
    csp = headers.get("content-security-policy", "")
    
    print(f"    Strict-Transport-Security: {hsts}")
    print(f"    X-Content-Type-Options: {nosniff}")
    print(f"    X-Frame-Options: {xframe}")
    print(f"    Referrer-Policy: {referrer}")
    print(f"    Content-Security-Policy: {csp[:80]}...")
    
    assert "max-age=31536000" in hsts, "HSTS max-age=31536000 required"
    assert nosniff == "nosniff", "X-Content-Type-Options must be nosniff"
    assert xframe == "DENY", "X-Frame-Options must be DENY"
    assert "strict-origin-when-cross-origin" in referrer, "Referrer-Policy missing"
    assert "default-src 'self'" in csp, "CSP must have default-src 'self'"
    print("    [PASS] All security headers verified on live HTTPS.")

def test_api_products():
    print("[3] Testing API Products endpoint...")
    req = urllib.request.Request(f"{BASE_URL}/api/products", headers=BROWSER_HEADERS)
    res = urllib.request.urlopen(req)
    data = json.loads(res.read().decode("utf-8"))
    assert len(data) >= 26, f"Expected at least 26 products, got {len(data)}"
    print(f"    [PASS] Found {len(data)} authentic frog products in live DB.")

def test_live_js_bundle():
    print("[4] Testing Live JS bundle for credentials elimination & compliance...")
    req = urllib.request.Request(f"{BASE_URL}/", headers=BROWSER_HEADERS)
    html = urllib.request.urlopen(req).read().decode("utf-8")
    
    script_matches = re.findall(r'<script[^>]+src=["\']([^"\']+)["\']', html)
    print(f"    Discovered scripts in HTML: {script_matches}")
    assert script_matches, "No scripts found in live HTML"
    
    for script_src in script_matches:
        url = f"{BASE_URL}{script_src}" if script_src.startswith("/") else script_src
        print(f"    Auditing bundle: {url}")
        js_req = urllib.request.Request(url, headers=BROWSER_HEADERS)
        js_content = urllib.request.urlopen(js_req).read().decode("utf-8")
        
        # Verify complete absence of demo credentials
        assert "Admin@123" not in js_content, "SECURITY RISK: Admin@123 found in bundle!"
        assert "fillDemoCreds" not in js_content, "SECURITY RISK: fillDemoCreds found in bundle!"
        assert "demo-admin-button" not in js_content, "SECURITY RISK: demo button found in bundle!"
        
        # Verify compliance content present
        assert "CITES" in js_content, "CITES compliance notice not found in frontend bundle!"
        assert "alkaloid" in js_content or "Alkaloid" in js_content, "Alkaloid scientific explanation not found!"
        
    print("    [PASS] Frontend bundle has 0 credentials and 100% compliance content.")

def test_git_repo():
    print("[5] Testing Git remote repository configuration...")
    out = subprocess.check_output(["git", "remote", "-v"], text=True)
    assert "ngoctuls2005-dev/Frog_Store.git" in out, "GitHub remote incorrect"
    print("    [PASS] GitHub remote origin is https://github.com/ngoctuls2005-dev/Frog_Store.git.")

if __name__ == "__main__":
    try:
        test_http_redirect()
        test_security_headers()
        test_api_products()
        test_live_js_bundle()
        test_git_repo()
        print("\n=======================================================")
        print("[SUCCESS] ALL PRODUCTION & SECURITY CHECKS PASSED 100%!")
        print("=======================================================")
    except Exception as e:
        print(f"\n[FAIL] Test error: {e}")
        sys.exit(1)
