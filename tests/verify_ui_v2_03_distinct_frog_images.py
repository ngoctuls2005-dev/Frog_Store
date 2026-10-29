import os
import hashlib
import sys

img_dir = "apps/web/public/images/frogs"
dumpy = os.path.join(img_dir, "tree-whites-dumpy.jpg")
snowflake = os.path.join(img_dir, "tree-blue-snowflake.jpg")
redeyed = os.path.join(img_dir, "tree-red-eyed.jpg")
pacman = os.path.join(img_dir, "pacman-green.jpg")

for p in [dumpy, snowflake, redeyed, pacman]:
    assert os.path.exists(p), f"Missing image: {p}"
    assert os.path.getsize(p) > 50000, f"Image too small/blurry: {p} ({os.path.getsize(p)} bytes)"

with open(dumpy, "rb") as f1, open(snowflake, "rb") as f2:
    h1 = hashlib.md5(f1.read()).hexdigest()
    h2 = hashlib.md5(f2.read()).hexdigest()
    assert h1 != h2, "Dumpy and Snowflake must not have identical hash!"

print(f"[PASS] Distinct images verified! Dumpy MD5={h1[:8]}, Snowflake MD5={h2[:8]}")
print("TASK-03 VERIFIED SUCCESSFULLY!")

