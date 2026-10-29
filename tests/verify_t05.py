import urllib.request
import json

def verify():
    base = 'https://store.ngoctuls2005.workers.dev'
    headers = {'User-Agent': 'Mozilla/5.0'}
    
    # 1. Verify homepage responds 200 OK
    req_home = urllib.request.Request(base, headers=headers)
    with urllib.request.urlopen(req_home) as res:
        assert res.status == 200, f'Homepage status {res.status}'
        html = res.read().decode('utf-8', errors='ignore')
        assert 'Frog Store' in html, 'Homepage HTML does not contain Frog Store'
        
    # 2. Verify /api/categories returns 5 categories
    req_cats = urllib.request.Request(f'{base}/api/categories', headers=headers)
    with urllib.request.urlopen(req_cats) as res:
        assert res.status == 200
        cats = json.loads(res.read().decode())
        assert len(cats) >= 5, f'Expected at least 5 categories, got {len(cats)}'
        
    # 3. Verify /api/products returns 16 frog species
    req_prods = urllib.request.Request(f'{base}/api/products', headers=headers)
    with urllib.request.urlopen(req_prods) as res:
        assert res.status == 200
        prods = json.loads(res.read().decode())
        assert len(prods) == 16, f'Expected 16 products, got {len(prods)}'
        
    # 4. Verify frog image is served properly from worker assets
    img_url = f'{base}/images/frogs/pacman-green.jpg'
    req_img = urllib.request.Request(img_url, headers=headers)
    with urllib.request.urlopen(req_img) as res:
        assert res.status == 200
        data = res.read()
        assert len(data) > 5000, f'Image length too small: {len(data)}'
        
    print('PASS: All production endpoints, database records, and asset hosting verified!')

if __name__ == '__main__':
    verify()

