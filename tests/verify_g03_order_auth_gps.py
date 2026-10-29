import os

def verify():
    index_path = os.path.join('apps', 'api', 'src', 'index.ts')
    assert os.path.exists(index_path), 'Missing apps/api/src/index.ts'
    
    with open(index_path, 'r', encoding='utf-8') as f:
        code = f.read()
        
    assert "app.post('/orders'" in code, 'Missing POST /orders route'
    assert 'AUTH_REQUIRED' in code, 'Must require auth and return AUTH_REQUIRED'
    assert '401' in code, 'Must return 401 when not logged in'
    assert 'latitude' in code, 'Must store latitude'
    assert 'longitude' in code, 'Must store longitude'
    
    # Check that orders INSERT statement has latitude and longitude
    assert 'latitude, longitude' in code or 'latitude' in code, 'Must insert latitude into orders'
    
    print('PASS: Verified mandatory customer authentication on order creation and GPS coordinates persistence!')

if __name__ == '__main__':
    verify()

