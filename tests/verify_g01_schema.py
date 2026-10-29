import os
import subprocess
import json

def verify():
    schema_path = os.path.join('apps', 'api', 'schema.sql')
    seed_path = os.path.join('apps', 'api', 'seed.sql')
    assert os.path.exists(schema_path), 'Missing schema.sql'
    assert os.path.exists(seed_path), 'Missing seed.sql'
    
    with open(schema_path, 'r', encoding='utf-8') as f:
        schema_sql = f.read()
        
    assert 'google_id' in schema_sql, 'schema.sql missing google_id'
    assert 'avatar_url' in schema_sql, 'schema.sql missing avatar_url'
    assert 'latitude' in schema_sql, 'schema.sql missing latitude'
    assert 'longitude' in schema_sql, 'schema.sql missing longitude'
    assert 'idx_users_google_id' in schema_sql, 'schema.sql missing unique index on google_id'
    assert 'UNIQUE INDEX' in schema_sql, 'Index must be UNIQUE'
    
    # Query local D1 database schema
    api_dir = os.path.join(os.getcwd(), 'apps', 'api')
    cmd = 'npx wrangler d1 execute store-db --local --command "PRAGMA table_info(users);"'
    p = subprocess.run(cmd, shell=True, capture_output=True, text=True, encoding='utf-8', errors='ignore', cwd=api_dir)
    assert p.returncode == 0, f'Failed to query local D1: {p.stderr}'
    
    users_info = p.stdout
    assert 'google_id' in users_info, 'users table in local D1 missing google_id column'
    assert 'avatar_url' in users_info, 'users table in local D1 missing avatar_url column'
    assert 'latitude' in users_info, 'users table in local D1 missing latitude column'
    assert 'longitude' in users_info, 'users table in local D1 missing longitude column'

    # Check orders table in local D1
    cmd_orders = 'npx wrangler d1 execute store-db --local --command "PRAGMA table_info(orders);"'
    p_ord = subprocess.run(cmd_orders, shell=True, capture_output=True, text=True, encoding='utf-8', errors='ignore', cwd=api_dir)
    assert p_ord.returncode == 0
    orders_info = p_ord.stdout
    assert 'latitude' in orders_info, 'orders table in local D1 missing latitude column'
    assert 'longitude' in orders_info, 'orders table in local D1 missing longitude column'

    print('PASS: Verified schema and local D1 columns for Google OAuth, Avatar, and GPS location!')

if __name__ == '__main__':
    verify()
