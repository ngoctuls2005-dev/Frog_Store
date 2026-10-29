import sqlite3
import os
import sys

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

def test_schema():
    schema_path = os.path.join(os.path.dirname(__file__), '..', 'apps', 'api', 'schema.sql')
    with open(schema_path, 'r', encoding='utf-8') as f:
        sql = f.read()

    # Create in-memory database to verify valid SQLite DDL
    conn = sqlite3.connect(':memory:')
    cursor = conn.cursor()
    cursor.executescript(sql)

    # 1. Verify products columns
    prod_cols = [col[1] for col in cursor.execute('PRAGMA table_info(products)').fetchall()]
    assert 'slug' in prod_cols, "products table must contain 'slug'"
    assert 'habitat_type' in prod_cols, "products table must contain 'habitat_type'"
    assert 'gallery_images_json' in prod_cols, "products table must contain 'gallery_images_json'"
    print("   -> OK: Bang products co du cac cot 'slug', 'habitat_type', 'gallery_images_json'")

    # 2. Verify frog_species_details table & columns
    details_cols = [col[1] for col in cursor.execute('PRAGMA table_info(frog_species_details)').fetchall()]
    assert len(details_cols) > 0, "frog_species_details table must exist"
    
    required_cols = [
        'product_id', 'family', 'genus', 'species', 'origin_region', 'natural_habitat',
        'adult_size_male_cm', 'adult_size_female_cm', 'lifespan_years',
        'activity_period', 'temperament', 'social_cohabitation', 'enclosure_type',
        'min_tank_size', 'temp_day_min', 'temp_day_max', 'temp_night_min', 'temp_night_max',
        'humidity_min', 'humidity_max', 'lighting_uvb', 'substrate_recommended',
        'water_requirements', 'primary_diet_json', 'feeding_frequency', 'supplements_guide',
        'handling_safety', 'toxicity_warning', 'common_health_issues', 'critical_warnings_json',
        'ai_knowledge_snippet', 'ai_facts_json'
    ]
    for col in required_cols:
        assert col in details_cols, f"frog_species_details must contain column '{col}'"
    print(f"   -> OK: Bang frog_species_details co day du {len(required_cols)} cot thong so sinh hoc & AI facts")

    # 3. Verify indexes
    indexes = [idx[1] for idx in cursor.execute("SELECT * FROM sqlite_master WHERE type = 'index'").fetchall()]
    assert 'idx_products_slug' in indexes, "idx_products_slug index must exist"
    assert 'idx_frog_details_product_id' in indexes, "idx_frog_details_product_id index must exist"
    print("   -> OK: Cac index idx_products_slug va idx_frog_details_product_id ton tai hop le")

    conn.close()
    print("Kiểm chứng Task DETAIL-01 hoàn tất thành công 100%!")

if __name__ == '__main__':
    test_schema()

