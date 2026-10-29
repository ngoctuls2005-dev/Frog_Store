import urllib.request
import urllib.parse
import json
import os
import sys

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

SEARCH_SPECIES = {
    'pacman-fantasy.jpg': 'Ceratophrys cranwelli',
    'tree-amazon-milk.jpg': 'Trachycephalus resinifictrix',
    'tree-clown.jpg': 'Dendropsophus leucophyllatus',
    'tree-tiger-leg.jpg': 'Pithecopus hypochondrialis',
    'tree-lemur-leaf.jpg': 'Agalychnis lemur',
    'dart-tinctorius-cobalt.jpg': 'Dendrobates tinctorius',
    'dart-golden-terribilis.jpg': 'Phyllobates terribilis',
    'dart-auratus-green-black.jpg': 'Dendrobates auratus',
    'bullfrog-budgetts.jpg': 'Lepidobatrachus laevis',
    'aquatic-african-clawed.jpg': 'Xenopus laevis'
}

dest_dir = os.path.join(os.path.dirname(__file__), '..', 'apps', 'web', 'public', 'images', 'frogs')
os.makedirs(dest_dir, exist_ok=True)

headers = {'User-Agent': 'FrogStoreBioBot/1.0 (contact@frogstore.vn)'}

for filename, query in SEARCH_SPECIES.items():
    filepath = os.path.join(dest_dir, filename)
    if os.path.exists(filepath) and os.path.getsize(filepath) > 5000:
        print(f"File {filename} đã có sẵn ({os.path.getsize(filepath)} bytes).")
        continue

    print(f"Đang tìm ảnh cho: {query} -> {filename}...")
    encoded_query = urllib.parse.quote(query)
    api_url = f"https://commons.wikimedia.org/w/api.php?action=query&generator=search&gsrsearch={encoded_query}&gsrnamespace=6&prop=imageinfo&iiprop=url&format=json&gsrlimit=3"

    try:
        req = urllib.request.Request(api_url, headers=headers)
        with urllib.request.urlopen(req, timeout=15) as resp:
            data = json.loads(resp.read().decode('utf-8'))
        
        pages = data.get('query', {}).get('pages', {})
        target_url = None
        for page in pages.values():
            infos = page.get('imageinfo', [])
            if infos and 'url' in infos[0]:
                u = infos[0]['url']
                clean_u = u.split('?')[0]
                if clean_u.lower().endswith(('.jpg', '.jpeg', '.png')):
                    target_url = clean_u
                    break
        
        if not target_url:
            print(f"   -> Không tìm thấy ảnh phù hợp cho {query}")
            continue

        print(f"   Tải từ: {target_url}...")
        img_req = urllib.request.Request(target_url, headers=headers)
        with urllib.request.urlopen(img_req, timeout=25) as img_resp:
            img_data = img_resp.read()
            with open(filepath, 'wb') as f:
                f.write(img_data)
            print(f"   -> Thành công {filename}: {len(img_data)} bytes!")
    except Exception as e:
        print(f"   -> Lỗi khi tải {filename}: {e}")

print("\nHoàn tất tải ảnh ếch thật không watermark!")
