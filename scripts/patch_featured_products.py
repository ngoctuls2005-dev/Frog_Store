import re

path = "apps/api/seed.sql"
with open(path, "r", encoding="utf-8") as f:
    sql = f.read()

# Target featured IDs: 1, 8, 16, 23
featured_ids = {'1', '8', '16', '23'}

lines = sql.splitlines()
new_lines = []
in_prod = False

for line in lines:
    if "INSERT INTO products" in line:
        in_prod = True
        new_lines.append(line)
        continue
    if in_prod:
        if line.strip().endswith(";") or "INSERT INTO" in line:
            in_prod = False
        
        # Check if this line is a product row: starts with (id,
        m = re.match(r'^(\s*\()(\d+)(,.*,)\s*([01])(\)[,;]?)$', line)
        if m:
            prefix, pid, middle, feat, suffix = m.groups()
            new_feat = '1' if pid in featured_ids else '0'
            line = f"{prefix}{pid}{middle} {new_feat}{suffix}"
            if new_feat == '1':
                print(f"Set featured=1 for product ID {pid}")
            else:
                if feat == '1':
                    print(f"Removed featured from product ID {pid}")
        new_lines.append(line)
    else:
        new_lines.append(line)

with open(path, "w", encoding="utf-8") as f:
    f.write("\n".join(new_lines) + "\n")

print("SUCCESS: Updated apps/api/seed.sql for featured products!")
