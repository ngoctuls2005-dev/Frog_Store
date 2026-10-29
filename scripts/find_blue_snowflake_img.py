import urllib.request
import re
import sys

sys.stdout.reconfigure(encoding='utf-8')
headers = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'}

urls = [
    'https://grimoireexotics.com/products/blue-eyed-snowflake-whites-tree-frog',
    'https://www.ridgewayfrozen.co.uk/products/whites-tree-frog-blue-phase',
    'https://bigappleherp.com/products/super-snowflake-whites-tree-frogs'
]

for u in urls:
    try:
        req = urllib.request.Request(u, headers=headers)
        with urllib.request.urlopen(req, timeout=10) as res:
            html = res.read().decode('utf-8', errors='ignore')
            imgs = re.findall(r'(https?://[^\s"\'<>]+\.(?:jpg|jpeg|png|webp))', html)
            print(f"=== {u} ({len(imgs)} imgs) ===")
            for img in imgs[:8]:
                print(" ", img)
    except Exception as e:
        print(f"Error {u}: {e}")
