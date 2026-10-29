import sys

path = "apps/web/src/styles.css"
with open(path, "r", encoding="utf-8") as f:
    content = f.read()

# Verify fab-pulse animation removed
assert "animation: fab-pulse" not in content, "fab-pulse animation still present in styles.css"
assert "animation: fab-bob" not in content, "fab-bob animation still present in styles.css"
assert "display: none" in content and ".fab-pulse-ring" in content, "fab-pulse-ring not hidden"
assert "prefers-reduced-motion: reduce" in content, "prefers-reduced-motion media query missing"

print("[PASS] Endless pulse & bobbing removed, prefers-reduced-motion added successfully!")
print("TASK-05 VERIFIED SUCCESSFULLY!")

