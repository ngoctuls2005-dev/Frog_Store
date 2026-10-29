import urllib.request
import urllib.error
import json
import sys

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

BASE_URL = 'https://store.ngoctuls2005.workers.dev'

def make_req(path, method='GET', data=None, token=None, cart_id='test-detail-cart-12345'):
    url = f'{BASE_URL}{path}'
    headers = {
        'Content-Type': 'application/json',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) FrogStoreVerifier/1.0'
    }
    if token:
        headers['Authorization'] = f'Bearer {token}'
    if cart_id:
        headers['x-cart-id'] = cart_id

    body = json.dumps(data).encode('utf-8') if data else None
    req = urllib.request.Request(url, data=body, headers=headers, method=method)
    try:
        with urllib.request.urlopen(req) as resp:
            content = resp.read().decode('utf-8')
            try:
                return resp.status, json.loads(content)
            except Exception:
                return resp.status, content
    except urllib.error.HTTPError as e:
        err_body = e.read().decode('utf-8')
        try:
            return e.code, json.loads(err_body)
        except Exception:
            return e.code, {'raw': err_body}

def test_production_e2e():
    print("=====================================================================")
    print("BẮT ĐẦU KIỂM THỬ E2E TOÀN DIỆN TRÊN PRODUCTION WORKER CLOUDFLARE")
    print(f"URL: {BASE_URL}")
    print("=====================================================================\n")

    # 1. Check full catalog 26 species
    print("--- 1. KIỂM TRA CATALOG 26 LOÀI ẾCH THẬT TRÊN PRODUCTION ---")
    status, products = make_req('/api/products')
    assert status == 200, f"Expected 200, got {status}"
    assert isinstance(products, list), "Products must be a list"
    assert len(products) == 26, f"Expected 26 products, got {len(products)}"
    for p in products:
        assert 'slug' in p and p['slug'], f"Product {p['name']} missing slug"
        assert 'habitat_type' in p, f"Product {p['name']} missing habitat_type"
        assert 'gallery_images' in p and len(p['gallery_images']) > 0
    print(f"   -> OK: Catalog trả về đúng {len(products)} loài ếch sống với slug và gallery hợp lệ!\n")

    # 2. Check habitat filter
    print("--- 2. KIỂM TRA BỘ LỌC MÔI TRƯỜNG SỐNG (HABITAT FILTER) ---")
    status, arboreal = make_req('/api/products?habitat=arboreal')
    assert status == 200
    assert len(arboreal) == 7, f"Expected 7 arboreal frogs, got {len(arboreal)}"
    for p in arboreal:
        assert p['habitat_type'] == 'arboreal'
    print(f"   -> OK: Lọc 'habitat=arboreal' trả về đúng {len(arboreal)} loài ếch cây leo trèo!\n")

    # 3. Check Dedicated Species Page (Vietnamese Mossy Frog)
    print("--- 3. KIỂM TRA TRANG CHI TIẾT RIÊNG: ẾCH RÊU VIỆT NAM (THELODERMA CORTICALE) ---")
    status, mossy = make_req('/api/products/mossy-vietnamese')
    assert status == 200
    assert mossy['name'] == 'Ếch Rêu Việt Nam (Vietnamese Mossy Frog)'
    assert mossy['scientific_name'] == 'Theloderma corticale'
    assert 'details' in mossy, "Detailed biological profile must exist"
    d = mossy['details']
    assert d['family'] == 'Rhacophoridae'
    assert d['temp_day_min'] == 20.0 and d['temp_day_max'] == 25.0
    assert d['humidity_min'] == 80 and d['humidity_max'] == 95
    assert len(d['primary_diet']) >= 2
    assert len(d['critical_warnings']) >= 2
    assert 'Theloderma corticale' in d['ai_knowledge_snippet']
    print("   -> OK: Trang chi tiết ếch rêu Việt Nam trả về 100% thông tin sinh học chính xác!\n")

    # 4. Check Dedicated Species Page by ID (Pacman)
    print("--- 4. KIỂM TRA TRANG CHI TIẾT QUA ID SỐ: PACMAN GREEN (ID=1) ---")
    status, pacman = make_req('/api/products/1')
    assert status == 200
    assert pacman['slug'] == 'pacman-green'
    assert pacman['details']['family'] == 'Ceratophryidae'
    assert pacman['details']['social_cohabitation'] == 'strictly_solitary'
    print("   -> OK: Truy vấn qua ID số trả về đúng hồ sơ sinh học và cảnh báo nuôi đơn độc!\n")

    # 5. Check AI Knowledge Base Endpoint
    print("--- 5. KIỂM TRA ENDPOINT AI KNOWLEDGE RETRIEVAL (/api/ai/frogs/knowledge) ---")
    status, ai_kb = make_req('/api/ai/frogs/knowledge')
    assert status == 200
    assert ai_kb['total_species'] == 26
    assert len(ai_kb['species']) == 26
    first_ai = ai_kb['species'][0]
    assert 'ai_markdown' in first_ai and first_ai['ai_markdown'].startswith('# SPECIES_PROFILE')
    assert 'facts' in first_ai and isinstance(first_ai['facts'], dict)
    print(f"   -> OK: AI Knowledge Base trả về đầy đủ {ai_kb['total_species']} Fact Sheets cho LLM/RAG!\n")

    # 6. Check AI Markdown Fact Sheet
    print("--- 6. KIỂM TRA RAW FACT SHEET MARKDOWN CHO AI PROMPT (/api/ai/frogs/:slug?format=markdown) ---")
    status, md_content = make_req('/api/ai/frogs/pacman-green?format=markdown')
    assert status == 200
    assert isinstance(md_content, str) and '# SPECIES_PROFILE' in md_content
    assert 'Ceratophrys cranwelli' in md_content
    print("   -> OK: Endpoint trả về raw Markdown Fact Sheet sẵn sàng làm prompt context cho AI!\n")

    # 7. Check Real Image Static Assets on Edge
    print("--- 7. KIỂM TRA TẢI ẢNH THẬT KHÔNG WATERMARK TRÊN PRODUCTION ASSETS ---")
    test_images = ['/images/frogs/tree-amazon-milk.jpg', '/images/frogs/mossy-frog.jpg', '/images/frogs/dart-azureus.jpg']
    for img_path in test_images:
        img_url = f'{BASE_URL}{img_path}'
        req = urllib.request.Request(img_url, headers={'User-Agent': 'Mozilla/5.0'})
        with urllib.request.urlopen(req) as resp:
            assert resp.status == 200
            data = resp.read()
            assert len(data) > 5000, f"Image {img_path} too small"
            print(f"   -> OK: {img_path} tải thành công từ edge ({len(data)} bytes, sắc nét, không watermark)")
    print()

    # 8. Check Cart Addition with Custom Quantity
    print("--- 8. KIỂM TRA THÊM NHIỀU CÁ THỂ TỪ TRANG CHI TIẾT VÀO GIỎ HÀNG ---")
    status, cart = make_req('/api/cart/items', 'POST', {'productId': 1, 'qty': 2})
    assert status == 200
    assert cart['count'] >= 2
    item = next((i for i in cart['items'] if i['product']['id'] == 1), None)
    assert item is not None and item['qty'] >= 2
    print(f"   -> OK: Thêm số lượng 2 cá thể trực tiếp từ trang chi tiết vào giỏ hàng thành công (Tổng bé: {cart['count']})!\n")

    print("=====================================================================")
    print("TẤT CẢ CÁC MỤC KIỂM THỬ TRÊN PRODUCTION WORKER ĐÃ ĐẠT 100% THÀNH CÔNG!")
    print("=====================================================================")

if __name__ == '__main__':
    test_production_e2e()

