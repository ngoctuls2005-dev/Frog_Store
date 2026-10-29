import os
import subprocess

def verify():
    wrangler_path = os.path.join('apps', 'api', 'wrangler.toml')
    assert os.path.exists(wrangler_path), f'Missing {wrangler_path}'
    
    with open(wrangler_path, 'r', encoding='utf-8') as f:
        content = f.read()
        
    assert '691b9a4c-273f-41c1-ab89-bc4162699b20' in content, 'database_id incorrect in wrangler.toml'
    assert '26c77d60e71c40f491909c57983215d8' in content, 'kv namespace id incorrect in wrangler.toml'
    
    # Query D1 remote table count
    cmd = ['npx', 'wrangler', 'd1', 'execute', 'store-db', '--remote', '--command=SELECT COUNT(*) as count FROM products;']
    res = subprocess.run(cmd, capture_output=True, text=True, encoding='utf-8', errors='ignore', shell=True)
    assert res.returncode == 0, f'D1 remote query failed: {res.stderr}'
    
    out = res.stdout
    assert '"count": 16' in out or '"count":16' in out, f'Expected 16 products in remote D1, got: {out}'
    
    print('PASS: Verified wrangler.toml IDs and 16 frog products in remote Cloudflare D1!')

if __name__ == '__main__':
    verify()
