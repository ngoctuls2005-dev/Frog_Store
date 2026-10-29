import os
import hashlib
import glob

img_dir = "apps/web/public/images/frogs"
files = glob.glob(os.path.join(img_dir, "*.jpg")) + glob.glob(os.path.join(img_dir, "*.png"))

print(f"Total image files found: {len(files)}")
hashes = {}
duplicates = []

for f in files:
    name = os.path.basename(f)
    size = os.path.getsize(f)
    with open(f, "rb") as fp:
        md5 = hashlib.md5(fp.read()).hexdigest()
    
    print(f"  {name:30s} : {size:>8d} bytes | MD5: {md5[:8]}")
    if md5 in hashes:
        duplicates.append((name, hashes[md5]))
    else:
        hashes[md5] = name

print("\n--- AUDIT RESULTS ---")
if duplicates:
    print(f"[FAIL] Found duplicate images:")
    for a, b in duplicates:
        print(f"  {a} is DUPLICATE of {b}")
else:
    print("[PASS] 0 duplicate images! All images are distinct, genuine files.")

# Check Dumpy vs Snowflake specifically
dumpy = os.path.join(img_dir, "tree-whites-dumpy.jpg")
snowflake = os.path.join(img_dir, "tree-blue-snowflake.jpg")

assert os.path.exists(dumpy) and os.path.exists(snowflake)
with open(dumpy, "rb") as f1, open(snowflake, "rb") as f2:
    assert f1.read() != f2.read(), "tree-whites-dumpy.jpg and tree-blue-snowflake.jpg MUST NOT be identical!"

print("[PASS] Dumpy and Snowflake verified distinct!")

