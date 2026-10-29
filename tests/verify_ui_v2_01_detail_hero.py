import re
import sys

path = "apps/web/src/App.tsx"
with open(path, "r", encoding="utf-8") as f:
    content = f.read()

# Check that hero is wrapped in {!activeDetailSlug && ( ... )}
pattern = r'\{!activeDetailSlug\s*&&\s*\(\s*<section className="hero">.*?</section>\s*\)\}'
match = re.search(pattern, content, re.DOTALL)

if not match:
    print("[FAIL] Hero banner is not conditionally wrapped with !activeDetailSlug")
    sys.exit(1)

print("[PASS] Hero banner is correctly hidden when activeDetailSlug is active!")
print("TASK-01 VERIFIED SUCCESSFULLY!")
