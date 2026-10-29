import json
import urllib.request
import urllib.error

BASE_URL = 'https://store.ngoctuls2005.workers.dev'

def make_req(path, method='GET', data=None, token=None, cart_id=None):
    url = f'{BASE_URL}{path}'
    headers = {
        'Content-Type': 'application/json',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    }
    if token:
        headers['Authorization'] = f'Bearer {token}'
    if cart_id:
        headers['x-cart-id'] = cart_id
    
    body = json.dumps(data).encode('utf-8') if data else None
    req = urllib.request.Request(url, data=body, headers=headers, method=method)
    try:
        with urllib.request.urlopen(req) as resp:
            return resp.status, json.loads(resp.read().decode('utf-8'))
    except urllib.error.HTTPError as e:
        err_body = e.read().decode('utf-8')
        try:
            return e.code, json.loads(err_body)
        except:
            return e.code, {'raw': err_body}

def test_production():
    print('1. Testing Public Products Catalog...')
    status, prods = make_req('/api/products')
    assert status == 200, f'Expected 200, got {status}'
    assert len(prods) == 16, f'Expected 16 frog species, got {len(prods)}'
    print(f'   -> OK: {len(prods)} species returned.')

    print('2. Testing Customer Login (khachhang@gmail.com)...')
    status, cust_auth = make_req('/api/auth/login', 'POST', {
        'email': 'khachhang@gmail.com',
        'password': 'User@123456'
    })
    assert status == 200, f'Customer login failed: {cust_auth}'
    cust_token = cust_auth['token']
    assert cust_auth['user']['role'] == 'customer', 'User role should be customer'
    print(f'   -> OK: Customer token obtained. Role: {cust_auth["user"]["role"]}')

    print('3. Testing RBAC Protection: Customer accessing Admin endpoint (/api/admin/stats)...')
    status, forbidden_res = make_req('/api/admin/stats', 'GET', token=cust_token)
    assert status == 403, f'Expected 403 Forbidden, got {status}: {forbidden_res}'
    print('   -> OK: Properly blocked with 403 Forbidden!')

    print('4. Testing Admin Login (admin@frogstore.vn)...')
    status, admin_auth = make_req('/api/auth/login', 'POST', {
        'email': 'admin@frogstore.vn',
        'password': 'Admin@123456'
    })
    assert status == 200, f'Admin login failed: {admin_auth}'
    admin_token = admin_auth['token']
    assert admin_auth['user']['role'] == 'admin', 'User role should be admin'
    print(f'   -> OK: Admin token obtained. Role: {admin_auth["user"]["role"]}')

    print('5. Testing Admin Stats Access with Admin Token...')
    status, stats = make_req('/api/admin/stats', 'GET', token=admin_token)
    assert status == 200, f'Admin stats failed: {stats}'
    assert 'revenue' in stats
    assert 'ordersCount' in stats
    assert 'productsCount' in stats
    assert 'usersCount' in stats
    print(f'   -> OK: Admin stats verified! Products: {stats["productsCount"]}, Users: {stats["usersCount"]}')

    print('6. Testing Cart Preservation Across Logout/Login...')
    # User adds item 1 to cart
    status, user_cart1 = make_req('/api/cart/items', 'POST', {'productId': 1}, token=cust_token)
    assert status == 200
    assert any(it['product']['id'] == 1 for it in user_cart1['items'])
    
    # Simulate Logout: Guest cart request with random cart id and no token
    guest_cart_id = 'guest-test-unique-session-99'
    status, guest_cart = make_req('/api/cart', 'GET', cart_id=guest_cart_id)
    assert status == 200
    # Guest cart should not see user's persistent cart
    assert guest_cart['count'] == 0, f'Guest cart should be empty, got {guest_cart["count"]}'
    
    # Simulate Login: Re-query cart with customer token
    status, restored_cart = make_req('/api/cart', 'GET', token=cust_token)
    assert status == 200
    assert any(it['product']['id'] == 1 for it in restored_cart['items']), 'Cart item lost after simulated logout!'
    print('   -> OK: Cart retained in D1 database across logout/login!')

    print('\nALL PRODUCTION VERIFICATIONS PASSED!')

if __name__ == '__main__':
    test_production()
