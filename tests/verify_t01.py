import sqlite3
import os
import re

def verify():
    schema_path = os.path.join('apps', 'api', 'schema.sql')
    seed_path = os.path.join('apps', 'api', 'seed.sql')
    
    assert os.path.exists(schema_path), f'{schema_path} does not exist'
    assert os.path.exists(seed_path), f'{seed_path} does not exist'
    
    with open(schema_path, 'r', encoding='utf-8') as f:
        schema_sql = f.read()
    
    with open(seed_path, 'r', encoding='utf-8') as f:
        seed_sql = f.read()
        
    for table in ['categories', 'products', 'orders', 'order_items']:
        assert f'CREATE TABLE {table}' in schema_sql or f'CREATE TABLE IF NOT EXISTS {table}' in schema_sql, f'Missing table {table}'

    # Test executing in an in-memory sqlite db
    conn = sqlite3.connect(':memory:')
    cursor = conn.cursor()
    cursor.executescript(schema_sql)
    cursor.executescript(seed_sql)
    
    cursor.execute('SELECT COUNT(*) FROM categories')
    cat_count = cursor.fetchone()[0]
    assert cat_count >= 4, f'Categories count {cat_count} < 4'
    
    cursor.execute('SELECT COUNT(*) FROM products')
    prod_count = cursor.fetchone()[0]
    assert prod_count >= 16, f'Products count {prod_count} < 16'
    
    # Verify product columns
    cursor.execute('SELECT name, scientific_name, price, image, diet, temperature, humidity, care_guide, health_status FROM products')
    rows = cursor.fetchall()
    for row in rows:
        name, sci_name, price, img, diet, temp, hum, care, health = row
        assert name and len(name) > 3, f'Invalid name {name}'
        assert price > 50000, f'Unrealistic price {price} for {name}'
        assert diet and temp and hum, f'Missing bio params for {name}'
        
        # Check image exists in apps/web/public
        img_rel = img.lstrip('/')
        full_img_path = os.path.join('apps', 'web', 'public', img_rel)
        assert os.path.exists(full_img_path), f'Image file missing: {full_img_path} for {name}'
        assert os.path.getsize(full_img_path) > 3000, f'Image file too small/corrupted: {full_img_path}'
        
    print(f'PASS: Verified {cat_count} categories, {prod_count} frog products, all schema & images valid!')

if __name__ == '__main__':
    verify()

