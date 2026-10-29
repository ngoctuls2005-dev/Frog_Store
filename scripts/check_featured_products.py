import re
import sys

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

with open('apps/api/seed.sql', 'r', encoding='utf-8') as f:
    text = f.read()

# Let's inspect products in database
import sqlite3
# Or count from SQL
lines = text.splitlines()
in_prod = False
featured = []
for line in lines:
    if 'INSERT INTO products' in line:
        in_prod = True
        continue
    if in_prod:
        if line.strip().endswith(';') or 'INSERT INTO' in line:
            in_prod = False
        parts = line.strip().rstrip(',;').strip('()').split(',')
        if len(parts) >= 20 and parts[-1].strip() == '1':
            featured.append(parts[0].strip() + ' ' + parts[2].strip())

print(f"Total featured products in seed: {len(featured)}")
for p in featured:
    print(f"  Featured: {p}")
