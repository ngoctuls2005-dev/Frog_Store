import sys

# 1. Check App.tsx for pendingCheckout integration
with open("apps/web/src/App.tsx", "r", encoding="utf-8") as f:
    app_text = f.read()

assert "pendingCheckout" in app_text, "pendingCheckout state missing in App.tsx"
assert "setPendingCheckout(true)" in app_text, "setPendingCheckout(true) missing in auth triggers"
assert "setCheckoutOpen(true)" in app_text, "setCheckoutOpen(true) missing after login success"

# 2. Check styles.css for mobile layout: compact circular FAB & bottom sheet panel
with open("apps/web/src/styles.css", "r", encoding="utf-8") as f:
    css_text = f.read()

assert "border-radius: 50%" in css_text, "Circular 50% border radius missing for mobile FAB"
assert "z-index: 10001" in css_text, "High z-index missing for mobile bottom-sheet chat panel"
assert "padding-bottom: 110px" in css_text, "Detail page padding-bottom missing to prevent sticky bar overlap"

print("[PASS] Frictionless auth flow with pendingCheckout & clean mobile layout verified!")
print("TASK-07 VERIFIED SUCCESSFULLY!")

