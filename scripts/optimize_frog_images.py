import os
import sys
from PIL import Image

sys.stdout.reconfigure(encoding='utf-8')

FROGS_DIR = os.path.abspath(r'apps/web/public/images/frogs')
DIST_DIR = os.path.abspath(r'apps/web/dist/images/frogs')

def optimize_images():
    print(f"Scanning images in: {FROGS_DIR}")
    files = [f for f in os.listdir(FROGS_DIR) if f.lower().endswith(('.jpg', '.jpeg', '.png'))]
    
    total_before = 0
    total_after = 0
    
    os.makedirs(FROGS_DIR, exist_ok=True)
    if os.path.exists(DIST_DIR):
        os.makedirs(DIST_DIR, exist_ok=True)
        
    for fname in sorted(files):
        fpath = os.path.join(FROGS_DIR, fname)
        size_before = os.path.getsize(fpath)
        total_before += size_before
        
        with Image.open(fpath) as img:
            # Convert RGBA/P to RGB for clean JPEG
            if img.mode in ('RGBA', 'P', 'LA'):
                img = img.convert('RGB')
            elif img.mode != 'RGB':
                img = img.convert('RGB')
                
            w, h = img.size
            max_dim = 1000
            if max(w, h) > max_dim:
                if w > h:
                    new_w = max_dim
                    new_h = int(h * (max_dim / w))
                else:
                    new_h = max_dim
                    new_w = int(w * (max_dim / h))
                img = img.resize((new_w, new_h), Image.Resampling.LANCZOS)
                
            # Save optimized progressive JPEG
            img.save(fpath, format='JPEG', quality=83, optimize=True, progressive=True)
            
        size_after = os.path.getsize(fpath)
        total_after += size_after
        reduction = (1 - size_after / size_before) * 100
        print(f"✓ {fname:<30}: {size_before/1024:>7.1f} KB -> {size_after/1024:>6.1f} KB (-{reduction:>4.1f}%)")
        
        # Also copy to dist if dist exists
        if os.path.exists(DIST_DIR):
            dist_path = os.path.join(DIST_DIR, fname)
            with open(fpath, 'rb') as src, open(dist_path, 'wb') as dst:
                dst.write(src.read())

    print("=" * 65)
    print(f"TOTAL BEFORE: {total_before / (1024*1024):.2f} MB")
    print(f"TOTAL AFTER : {total_after / (1024*1024):.2f} MB")
    saved_mb = (total_before - total_after) / (1024*1024)
    pct = (1 - total_after / total_before) * 100
    print(f"SAVED       : {saved_mb:.2f} MB ({pct:.1f}% reduction!)")

if __name__ == '__main__':
    optimize_images()
