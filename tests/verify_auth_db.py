import sqlite3
import os

def verify():
    schema_path = os.path.join('apps', 'api', 'schema.sql')
    seed_path = os.path.join('apps', 'api', 'seed.sql')
    
    assert os.path.exists(schema_path) and os.path.exists(seed_path)
    
    with open(schema_path, 'r', encoding='utf-8') as f:
        schema = f.read()
    with open(seed_path, 'r', encoding='utf-8') as f:
        seed = f.read()
        
    conn = sqlite3.connect(':memory:')
    cursor = conn.cursor()
    cursor.executescript(schema)
    cursor.executescript(seed)
    
    # 1. Verify users table
    cursor.execute("SELECT email, role, status FROM users WHERE role = 'admin'")
    admin = cursor.fetchone()
    assert admin is not None, 'Missing admin user in seed'
    assert admin[0] == 'admin@frogstore.vn', f'Unexpected admin email: {admin[0]}'
    
    cursor.execute("SELECT email, role FROM users WHERE role = 'customer'")
    customer = cursor.fetchone()
    assert customer is not None, 'Missing customer user in seed'
    
    # 2. Verify user_carts table
    cursor.execute("SELECT user_id, product_id, quantity FROM user_carts")
    carts = cursor.fetchall()
    assert len(carts) >= 1, 'Missing sample user cart'
    
    # 3. Verify orders has user_id
    cursor.execute("SELECT order_code, user_id, status FROM orders WHERE user_id IS NOT NULL")
    order = cursor.fetchone()
    assert order is not None, 'Missing order linked to user_id'
    
    print('PASS: Verified schema and seed with users, user_carts, and orders user_id!')

if __name__ == '__main__':
    verify()

