import os
import sys
import subprocess

ROOT_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
API_SRC = os.path.join(ROOT_DIR, "apps", "api", "src")
INDEX_FILE = os.path.join(API_SRC, "index.ts")

def test_code_security_masking():
    print("[1/3] Checking index.ts for PII masking & GPS hiding...")
    with open(INDEX_FILE, "r", encoding="utf-8") as f:
        content = f.read()

    assert "const checkRateLimit" in content, "Missing checkRateLimit function in index.ts"
    assert "checkRateLimit(c, 'login', 5, 600)" in content, "Missing login rate limit"
    assert "checkRateLimit(c, 'track', 10, 300)" in content, "Missing order tracking rate limit"
    assert "maskName" in content, "Missing maskName in order tracking"
    assert "maskAddress" in content, "Missing maskAddress in order tracking"
    assert "maskedPhone" in content, "Missing maskedPhone in order tracking"
    assert "latitude: null" in content, "GPS latitude must be null for unauthenticated tracking"
    assert "longitude: null" in content, "GPS longitude must be null for unauthenticated tracking"
    assert "isOwnerOrAdmin" in content, "Missing isOwnerOrAdmin check"
    print(" -> Order tracking PII masking & GPS concealment verified!")

def test_typecheck():
    print("[2/3] Running TypeScript typecheck on apps/api...")
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
    print("=== VERIFYING SEC-03: ORDER TRACKING PII & RATE LIMITING ===")
    test_code_security_masking()
    test_typecheck()
    print("[3/3] ALL CHECKS PASSED FOR SEC-03! READY TO VERIFY.")

if __name__ == "__main__":
    main()

