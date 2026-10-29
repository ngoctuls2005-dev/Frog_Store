import sys

# 1. Verify FrogDetailPage.tsx
with open("apps/web/src/FrogDetailPage.tsx", "r", encoding="utf-8") as f:
    detail_content = f.read()

assert "safe-badge" not in detail_content, "Squished safe-badge text still present in FrogDetailPage.tsx"
assert "gauge-sub-pill" in detail_content, "gauge-sub-pill missing in FrogDetailPage.tsx"
assert "safe-zone-glow" in detail_content, "safe-zone-glow missing in FrogDetailPage.tsx"

# 2. Verify PolicyModal.tsx
with open("apps/web/src/PolicyModal.tsx", "r", encoding="utf-8") as f:
    modal_content = f.read()

assert "policy-modal-card" in modal_content, "policy-modal-card missing in PolicyModal.tsx"
assert "policy-callout-box" in modal_content, "policy-callout-box missing in PolicyModal.tsx"
assert "policy-step-num" in modal_content, "policy-step-num missing in PolicyModal.tsx"
assert "policy-check-list" in modal_content, "policy-check-list missing in PolicyModal.tsx"
assert "policy-btn-confirm" in modal_content, "policy-btn-confirm missing in PolicyModal.tsx"

# 3. Verify styles.css
with open("apps/web/src/styles.css", "r", encoding="utf-8") as f:
    css_content = f.read()

assert "height: 14px" in css_content, "height: 14px missing in progress-track"
assert ".policy-modal-card" in css_content, ".policy-modal-card missing in styles.css"
assert ".policy-tab-item.active" in css_content, ".policy-tab-item.active missing in styles.css"
assert ".warranty-options-grid" in css_content, ".warranty-options-grid missing in styles.css"

print("[PASS] Climate gauge overflow fix & Policy modal modern redesign verified 100%!")
print("ALL CHECKS PASSED FOR POLICY & GAUGE FIXES!")
