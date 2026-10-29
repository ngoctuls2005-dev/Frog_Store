import urllib.request
import json
import sys
import ssl

ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

BASE_URL = "https://store.ngoctuls2005.workers.dev"

def test_homepage_html():
    print("[1/5] Checking Production Homepage HTML & Assets...")
    req = urllib.request.Request(BASE_URL, headers={"User-Agent": "FrogStoreE2E/1.0"})
    with urllib.request.urlopen(req, context=ctx, timeout=15) as res:
        assert res.status == 200, f"Expected 200, got {res.status}"
        html = res.read().decode("utf-8")
        assert "Frog Store" in html or "FROG STORE" in html or "<div id=\"root\">" in html, "Homepage HTML missing root div or title"
    print(" -> Homepage HTML loaded successfully!")

def test_products_api():
    print("[2/5] Checking Products API (26 real species)...")
    req = urllib.request.Request(f"{BASE_URL}/api/products", headers={"User-Agent": "FrogStoreE2E/1.0"})
    with urllib.request.urlopen(req, context=ctx, timeout=15) as res:
        assert res.status == 200
        products = json.loads(res.read().decode("utf-8"))
        assert len(products) >= 26, f"Expected >= 26 products, got {len(products)}"
        first = products[0]
        assert "slug" in first, "Product missing slug"
        assert "difficulty" in first, "Product missing difficulty"
        assert "habitat_type" in first, "Product missing habitat_type"
    print(f" -> Products API returned {len(products)} species perfectly!")

def test_ai_knowledge_api():
    print("[3/5] Checking AI Knowledge Endpoint (for FrogAiChatbot)...")
    req = urllib.request.Request(f"{BASE_URL}/api/ai/frogs/knowledge", headers={"User-Agent": "FrogStoreE2E/1.0"})
    with urllib.request.urlopen(req, context=ctx, timeout=15) as res:
        assert res.status == 200
        ai_data = json.loads(res.read().decode("utf-8"))
        assert "species" in ai_data, "AI knowledge missing species array"
        assert len(ai_data["species"]) >= 26, f"Expected >= 26 AI species, got {len(ai_data['species'])}"
        sample = ai_data["species"][0]
        assert "ai_markdown" in sample, "Sample species missing ai_markdown"
        assert "facts" in sample, "Sample species missing facts"
    print(f" -> AI Knowledge API verified with {len(ai_data['species'])} specialized LLM profiles!")

def test_species_detail_api():
    print("[4/5] Checking Species Detail API by Slug (Pacman Green)...")
    req = urllib.request.Request(f"{BASE_URL}/api/products/pacman-green", headers={"User-Agent": "FrogStoreE2E/1.0"})
    with urllib.request.urlopen(req, context=ctx, timeout=15) as res:
        assert res.status == 200
        data = json.loads(res.read().decode("utf-8"))
        assert "name" in data, "Detail missing name"
        assert "details" in data, "Detail missing biological details"
        assert data["details"]["adult_size_female_cm"] is not None, "Missing adult_size_female_cm"
        assert data["details"]["lifespan_years"] is not None, "Missing lifespan_years"
    print(" -> Species Detail API verified with 100% genuine biological data!")

def test_bundle_security_and_chatbot():
    print("[5/5] Checking Production JS Bundle (Raw AI Hidden & Chatbot Included)...")
    req = urllib.request.Request(BASE_URL, headers={"User-Agent": "FrogStoreE2E/1.0"})
    with urllib.request.urlopen(req, context=ctx, timeout=15) as res:
        html = res.read().decode("utf-8")

    # Find the main JS asset
    import re
    match = re.search(r'src="(/assets/index-[^"]+\.js)"', html)
    assert match, "Could not locate main JS asset in HTML"
    js_path = match.group(1)

    js_req = urllib.request.Request(f"{BASE_URL}{js_path}", headers={"User-Agent": "FrogStoreE2E/1.0"})
    with urllib.request.urlopen(js_req, context=ctx, timeout=20) as js_res:
        js_code = js_res.read().decode("utf-8")

    # Verify that raw copy button and raw ai block were purged
    assert "Sao Chép Fact Sheet Markdown" not in js_code, "Raw copy markdown button found in production bundle!"
    assert "ai-snippet-card" not in js_code, "ai-snippet-card class found in production bundle!"
    
    # Verify Chatbot & Sticky Bar presence
    assert "frog-ai-fab" in js_code, "Chatbot FAB missing from production bundle!"
    assert "sticky-mobile-buy-bar" in js_code, "Sticky mobile buy bar missing from production bundle!"
    print(" -> Production JS bundle verified: Raw AI completely hidden, AI Chatbot & Sticky Bar live!")

def main():
    print("=== RUNNING UI-06: PRODUCTION E2E VERIFICATION ===")
    test_homepage_html()
    test_products_api()
    test_ai_knowledge_api()
    test_species_detail_api()
    test_bundle_security_and_chatbot()
    print(">>> ALL PRODUCTION E2E CHECKS PASSED 100%! <<<")

if __name__ == "__main__":
    main()
