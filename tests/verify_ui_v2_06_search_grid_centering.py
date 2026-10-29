import sys

# 1. Check App.tsx has search-feedback-bar and grid-few class
with open("apps/web/src/App.tsx", "r", encoding="utf-8") as f:
    app_text = f.read()

assert "search-feedback-bar" in app_text, "search-feedback-bar missing in App.tsx"
assert "grid-few" in app_text, "grid-few class missing in App.tsx"
assert "loài" in app_text, "'loài' unit missing on category counts"

# 2. Check styles.css has grid-few and search-feedback-bar
with open("apps/web/src/styles.css", "r", encoding="utf-8") as f:
    css_text = f.read()

assert ".grid.grid-few" in css_text, ".grid.grid-few CSS missing"
assert "max-width: 720px" in css_text, "max-width: 720px missing in grid-few"
assert ".search-feedback-bar" in css_text, ".search-feedback-bar CSS missing"

print("[PASS] Grid centering for few items and search feedback bar verified!")
print("TASK-06 VERIFIED SUCCESSFULLY!")
