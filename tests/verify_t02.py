import os
import re

def verify():
    index_path = os.path.join('apps', 'api', 'src', 'index.ts')
    assert os.path.exists(index_path), f'{index_path} not found'
    
    with open(index_path, 'r', encoding='utf-8') as f:
        code = f.read()
        
    # Check endpoints
    required_routes = [
        "app.get('/categories'",
        "app.get('/products'",
        "app.get('/products/:id'",
        "app.get('/cart'",
        "app.post('/cart/items'",
        "app.put('/cart/items/:id'",
        "app.delete('/cart'",
        "app.post('/orders'",
        "app.get('/orders/:code'"
    ]
    for route in required_routes:
        assert route in code, f'Missing route: {route}'
        
    # Check filter and search logic
    assert 'difficulty' in code, 'Missing difficulty filter'
    assert 'category' in code, 'Missing category filter'
    assert 'search' in code, 'Missing search logic'
    assert 'orderCode' in code or 'order_code' in code, 'Missing order code generation'
    assert 'FROG-' in code, 'Missing FROG- prefix for order codes'
    
    print('PASS: Verified backend API routes and features in index.ts!')

if __name__ == '__main__':
    verify()

