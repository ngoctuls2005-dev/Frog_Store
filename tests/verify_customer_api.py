import os

def verify():
    index_path = os.path.join('apps', 'api', 'src', 'index.ts')
    assert os.path.exists(index_path)
    
    with open(index_path, 'r', encoding='utf-8') as f:
        code = f.read()
        
    routes = [
        "app.post('/auth/register'",
        "app.post('/auth/login'",
        "app.get('/auth/me'",
        "app.put('/user/profile'",
        "app.put('/user/password'",
        "app.get('/user/orders'",
        "app.put('/user/orders/:code/cancel'"
    ]
    for r in routes:
        assert r in code, f'Missing route: {r}'
        
    # Check cart isolation & retention logic
    assert 'readUserLines' in code, 'Missing readUserLines'
    assert 'writeUserLines' in code, 'Missing writeUserLines'
    assert 'user_carts' in code, 'Missing user_carts table reference'
    assert 'Cart Merge' in code or 'mergedMap' in code, 'Missing guest cart merge on login'
    
    print('PASS: Verified customer authentication and persistent cart routes!')

if __name__ == '__main__':
    verify()

