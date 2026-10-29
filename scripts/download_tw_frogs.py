import urllib.request
import os
import urllib.parse
from PIL import Image

headers = {'User-Agent': 'Mozilla/5.0'}
base = 'https://www.tw-frogs.com'

img_paths = [
    '/upload-files/Products/Amphibians/2.tree frog/AM09-SB/IMG_4567.jpg',
    '/upload-files/Products/Amphibians/2.tree frog/AM09-SB/IMG_4554.jpg',
    '/upload-files/Products/Amphibians/2.tree frog/AM09-BL/IMG_4544.jpg'
]

os.makedirs('temp_frogs', exist_ok=True)

for p in img_paths:
    encoded_url = base + urllib.parse.quote(p)
    fname = os.path.basename(p)
    local_path = os.path.join('temp_frogs', fname)
    try:
        req = urllib.request.Request(encoded_url, headers=headers)
        with urllib.request.urlopen(req, timeout=10) as res:
            with open(local_path, 'wb') as f:
                f.write(res.read())
        img = Image.open(local_path)
        print(f"Downloaded {fname}: size={img.size}, bytes={os.path.getsize(local_path)}")
    except Exception as e:
        print(f"Failed {p}: {e}")

