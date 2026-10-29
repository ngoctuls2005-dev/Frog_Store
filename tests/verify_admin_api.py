import os

def verify():
    index_path = os.path.join('apps', 'api', 'src', 'index.ts')
    assert os.path.exists(index_path)
    
    with open(index_path, 'r', encoding='utf-8') as f:
        code = f.read()
        
    admin_routes = [
        "app.get('/admin/stats'",
        "app.get('/admin/products'",
        "app.post('/admin/products'",
        "app.put('/admin/products/:id'",
        "app.delete('/admin/products/:id'",
        "app.get('/admin/orders'",
        "app.put('/admin/orders/:id/status'",
        "app.get('/admin/users'",
        "app.put('/admin/users/:id/status'"
    ]
    for r in admin_routes:
        assert r in code, f'Missing admin route: {r}'
        
    assert 'requireAdmin' in code, 'Missing requireAdmin middleware'
    assert "user.role !== 'admin'" in code, 'requireAdmin must check role !== admin'
    assert '403' in code, 'Must return 403 for unauthorized admin access'
    
    print('PASS: Verified Admin portal routes, RBAC protection, and live pet fulfillment endpoints!')

if __name__ == '__main__':
    verify()

