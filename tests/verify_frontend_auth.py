import os

def verify():
    api_path = os.path.join('apps', 'web', 'src', 'api.ts')
    app_path = os.path.join('apps', 'web', 'src', 'App.tsx')
    
    assert os.path.exists(api_path), 'Missing apps/web/src/api.ts'
    assert os.path.exists(app_path), 'Missing apps/web/src/App.tsx'
    
    with open(api_path, 'r', encoding='utf-8') as f:
        api_code = f.read()
        
    api_methods = ['login', 'register', 'getMe', 'myOrders', 'cancelMyOrder', 'getStoredToken', 'setStoredToken']
    for m in api_methods:
        assert m in api_code, f'Missing method {m} in api.ts'
        
    with open(app_path, 'r', encoding='utf-8') as f:
        app_code = f.read()
        
    ui_elements = [
        'authOpen',
        'authTab',
        'myOrdersOpen',
        'currentUser',
        'handleLogin',
        'handleRegister',
        'handleLogout',
        'Đăng nhập',
        'Đăng ký',
        'Đơn mua của tôi'
    ]
    for el in ui_elements:
        assert el in app_code, f'Missing UI element/logic {el} in App.tsx'
        
    print('PASS: Verified customer frontend authentication, profile and order management!')

if __name__ == '__main__':
    verify()

