import os
import sys
import subprocess

ROOT_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
API_SRC = os.path.join(ROOT_DIR, "apps", "api", "src")
INDEX_FILE = os.path.join(API_SRC, "index.ts")
WRANGLER_FILE = os.path.join(ROOT_DIR, "apps", "api", "wrangler.toml")

def test_code_redirect_and_headers():
    print("[1/3] Checking apps/api/src/index.ts for HTTPS redirect & security headers...")
    with open(INDEX_FILE, "r", encoding="utf-8") as f:
        content = f.read()

    assert "x-forwarded-proto" in content, "Missing x-forwarded-proto check"
    assert "c.redirect(url.toString(), 301)" in content, "Missing 301 permanent redirect to HTTPS"
    assert "Strict-Transport-Security" in content, "Missing Strict-Transport-Security header"
    assert "max-age=31536000" in content, "HSTS max-age should be at least 1 year (31536000)"
    assert "X-Content-Type-Options" in content, "Missing X-Content-Type-Options header"
    assert "X-Frame-Options" in content, "Missing X-Frame-Options header"
    assert "Referrer-Policy" in content, "Missing Referrer-Policy header"
    assert "Content-Security-Policy" in content, "Missing Content-Security-Policy header"
    print(" -> Index.ts HTTPS redirect & Security Headers verified!")

def test_wrangler_config():
    print("[2/3] Checking wrangler.toml for run_worker_first = true...")
    with open(WRANGLER_FILE, "r", encoding="utf-8") as f:
        content = f.read()

    assert "run_worker_first = true" in content, "wrangler.toml must have run_worker_first = true to intercept root HTTP requests"
    print(" -> wrangler.toml configuration verified!")

def test_typecheck():
    print("[3/3] Running TypeScript typecheck on apps/api...")
    res = subprocess.run(
        ["npm", "run", "typecheck", "-w", "apps/api"],
        cwd=ROOT_DIR,
        shell=True,
        capture_output=True,
        text=True
    )
    if res.returncode != 0:
        print("ERROR: Typecheck failed!")
        print(res.stdout)
        print(res.stderr)
        sys.exit(1)
    print(" -> Typecheck passed with 0 errors!")

def main():
    print("=== VERIFYING SEC-01: HTTPS REDIRECT & SECURITY HEADERS ===")
    test_code_redirect_and_headers()
    test_wrangler_config()
    test_typecheck()
    print(">>> SEC-01 ALL CHECKS PASSED 100%! READY TO VERIFY. <<<")

if __name__ == "__main__":
    main()

