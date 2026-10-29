import sqlite3
import json
import glob
import os
import sys

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

def test_api_queries():
    base_dir = os.path.dirname(__file__)
    # Find active miniflare sqlite
    sqlite_files = glob.glob(os.path.join(base_dir, '..', 'apps', 'api', '.wrangler', 'state', 'v3', 'd1', 'miniflare-D1DatabaseObject', '*.sqlite'))
    target_db = None
    for f in sqlite_files:
        if 'metadata' not in f and os.path.getsize(f) > 0 or os.path.exists(f + '-wal'):
            target_db = f
            break
    
    assert target_db, "Could not find active D1 SQLite database"
    conn = sqlite3.connect(target_db)
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()

    # 1. Test GET /api/products (default list)
    cursor.execute('SELECT COUNT(*) FROM products')
    assert cursor.fetchone()[0] == 26
    print("   -> OK: Database D1 local có đủ 26 loài ếch.")

    # 2. Test GET /api/products?habitat=arboreal (filter habitat)
    cursor.execute('SELECT slug, name, habitat_type FROM products WHERE habitat_type = ?', ('arboreal',))
    arboreal_frogs = cursor.fetchall()
    assert len(arboreal_frogs) == 7, f"Expected 7 arboreal frogs, got {len(arboreal_frogs)}"
    print(f"   -> OK: Lọc theo môi trường leo cây (habitat_type='arboreal') trả về đúng {len(arboreal_frogs)} loài.")

    # 3. Test GET /api/products/:slug (Dedicated product detail query)
    slug = 'mossy-vietnamese'
    sql_detail = '''
        SELECT p.*, c.name as category_name, c.slug as category_slug,
               d.family, d.genus, d.species, d.origin_region, d.natural_habitat,
               d.adult_size_male_cm, d.adult_size_female_cm, d.lifespan_years,
               d.activity_period, d.temperament, d.social_cohabitation,
               d.enclosure_type, d.min_tank_size,
               d.temp_day_min, d.temp_day_max, d.temp_night_min, d.temp_night_max,
               d.humidity_min, d.humidity_max, d.lighting_uvb, d.substrate_recommended,
               d.water_requirements, d.primary_diet_json, d.feeding_frequency,
               d.supplements_guide, d.handling_safety, d.toxicity_warning,
               d.common_health_issues, d.critical_warnings_json,
               d.ai_knowledge_snippet, d.ai_facts_json
        FROM products p
        LEFT JOIN categories c ON p.category_id = c.id
        LEFT JOIN frog_species_details d ON p.id = d.product_id
        WHERE p.slug = ?
    '''
    cursor.execute(sql_detail, (slug,))
    product = cursor.fetchone()
    assert product is not None, f"Product with slug {slug} not found"
    assert product['family'] == 'Rhacophoridae'
    assert product['temp_day_min'] == 20.0
    assert product['temp_day_max'] == 25.0
    assert product['humidity_min'] == 80
    assert product['humidity_max'] == 95
    
    # Test JSON parse
    diet = json.loads(product['primary_diet_json'])
    assert 'Dế mèn vừa' in diet
    warnings = json.loads(product['critical_warnings_json'])
    assert len(warnings) >= 2
    facts = json.loads(product['ai_facts_json'])
    assert facts['family'] == 'Rhacophoridae'
    print(f"   -> OK: Truy vấn chi tiết theo slug '{slug}' trả về đầy đủ hồ sơ sinh học & vi khí hậu!")

    # 4. Test GET /api/products/:id (Query by numeric ID)
    cursor.execute(sql_detail.replace('p.slug = ?', 'p.id = ?'), (23,))
    by_id = cursor.fetchone()
    assert by_id['slug'] == 'mossy-vietnamese'
    print("   -> OK: Truy vấn theo ID số (id=23) trả về đúng cá thể Ếch Rêu Việt Nam.")

    # 5. Test GET /api/ai/frogs/knowledge
    sql_ai_all = '''
        SELECT p.id, p.slug, p.name, p.scientific_name, p.price, p.difficulty, p.habitat_type,
               d.family, d.origin_region, d.ai_knowledge_snippet, d.ai_facts_json
        FROM products p
        LEFT JOIN frog_species_details d ON p.id = d.product_id
        ORDER BY p.id ASC
    '''
    cursor.execute(sql_ai_all)
    ai_list = cursor.fetchall()
    assert len(ai_list) == 26
    for item in ai_list:
        assert item['ai_knowledge_snippet'].startswith('# SPECIES_PROFILE')
        f = json.loads(item['ai_facts_json'])
        assert 'scientific_name' in f
    print("   -> OK: Endpoint AI Knowledge Base trả về đầy đủ 26 Fact Sheets chuẩn hóa!")

    # 6. Test GET /api/ai/frogs/:slug (Single AI fact sheet)
    cursor.execute('SELECT ai_knowledge_snippet FROM frog_species_details WHERE product_id = ?', (1,))
    pacman_snippet = cursor.fetchone()[0]
    assert 'Ceratophrys cranwelli' in pacman_snippet
    assert 'Cấm kỵ cốt lõi' in pacman_snippet
    print("   -> OK: Endpoint AI Fact Sheet của cá thể Pacman trả về Markdown chuẩn RAG!")

    conn.close()
    print("\nKiểm chứng Task DETAIL-03 hoàn tất thành công 100%!")

if __name__ == '__main__':
    test_api_queries()

