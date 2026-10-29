import re
import sys

# 1. Verify announcement bar
with open("apps/web/src/App.tsx", "r", encoding="utf-8") as f:
    app_content = f.read()

assert "Bách khoa & Cung cấp 26 loài ếch cảnh sống thuần chủng" in app_content, "Announcement bar not streamlined"
assert "Đóng thùng xốp lót rêu giữ ẩm" not in app_content, "Repetitive warranty text still in announcement bar"

# 2. Verify products section in seed.sql has exactly 4 featured products
with open("apps/api/seed.sql", "r", encoding="utf-8") as f:
    lines = f.readlines()

featured_ids = []
in_prod = False
for line in lines:
    line = line.strip()
    if "INSERT INTO products" in line:
        in_prod = True
        continue
    if in_prod:
        if line.endswith(";") or "INSERT INTO" in line:
            in_prod = False
        m = re.match(r'^\((\d+),.*,\s*([01])\)[,;]?$', line)
        if m:
            pid, is_feat = m.groups()
            if is_feat == '1':
                featured_ids.append(pid)

print(f"Featured IDs in products block of seed.sql: {featured_ids}")
assert set(featured_ids) == {'1', '8', '16', '23'}, f"Expected exactly {{'1', '8', '16', '23'}}, got {featured_ids}"

print("[PASS] Streamlined announcement and exactly 4 signature featured products verified!")
print("TASK-04 VERIFIED SUCCESSFULLY!")
