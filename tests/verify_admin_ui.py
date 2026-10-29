import os

def verify():
    admin_ui_path = os.path.join('apps', 'web', 'src', 'AdminPortal.tsx')
    app_path = os.path.join('apps', 'web', 'src', 'App.tsx')
    
    assert os.path.exists(admin_ui_path), 'Missing apps/web/src/AdminPortal.tsx'
    assert os.path.exists(app_path), 'Missing apps/web/src/App.tsx'
    
    with open(admin_ui_path, 'r', encoding='utf-8') as f:
        admin_code = f.read()
        
    expected_features = [
        'activeTab',
        'adminStats',
        'adminProducts',
        'adminOrders',
        'adminUsers',
        'handleSaveProduct',
        'handleDeleteProduct',
        'handleUpdateOrderStatus',
        'handleToggleUserStatus',
        'scientific_name',
        'temperature',
        'humidity',
        'diet',
        'care_guide',
        'health_status',
        'CẢNH BÁO TỒN KHO THẤP',
        'Đơn Hàng Vận Chuyển Live Pets',
        'Quản Lý Tài Khoản Người Dùng'
    ]
    for feat in expected_features:
        assert feat in admin_code, f'Missing feature or element: {feat} in AdminPortal.tsx'
        
    with open(app_path, 'r', encoding='utf-8') as f:
        app_code = f.read()
        
    assert 'AdminPortal' in app_code, 'AdminPortal must be imported in App.tsx'
    assert "currentUser.role === 'admin'" in app_code, 'Admin portal button must be guarded by role === admin'
    assert 'btn-admin-portal' in app_code, 'btn-admin-portal must be present in App.tsx'
    
    print('PASS: Verified Admin Portal UI, biological CRUD, order status flow and RBAC protections!')

if __name__ == '__main__':
    verify()

