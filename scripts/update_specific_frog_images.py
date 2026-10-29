import urllib.request
import os

images = {
    'tree-whites-dumpy.jpg': 'https://upload.wikimedia.org/wikipedia/commons/8/8b/Australia_green_tree_frog_%28Litoria_caerulea%29_crop.jpg',
    'tree-blue-snowflake.jpg': 'https://upload.wikimedia.org/wikipedia/commons/b/ba/Ranoidea_caerulea_-_Wilhelma_01.jpg',
    'tree-red-eyed.jpg': 'https://upload.wikimedia.org/wikipedia/commons/b/be/Red_eyed_tree_frog_edit2.jpg',
    'pacman-green.jpg': 'https://upload.wikimedia.org/wikipedia/commons/2/27/Cranwell%27s_horned_frog_%28Ceratophrys_cranwelli%29%2C_Entomica.jpg'
}

dest_dir = r"apps/web/public/images/frogs"
headers = {'User-Agent': 'FrogStoreBioBot/1.0 (contact@frogstore.vn)'}

for fname, url in images.items():
    clean_url = url.split('?')[0]
    filepath = os.path.join(dest_dir, fname)
    print(f"Downloading {fname} from {clean_url}...")
    req = urllib.request.Request(clean_url, headers=headers)
    with urllib.request.urlopen(req) as resp:
        data = resp.read()
    with open(filepath, 'wb') as f:
        f.write(data)
    print(f"Saved {fname}: {len(data)} bytes")

