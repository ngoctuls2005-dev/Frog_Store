import os

def verify():
    css_path = os.path.join('apps', 'web', 'src', 'styles.css')
    admin_path = os.path.join('apps', 'web', 'src', 'AdminPortal.tsx')
    app_path = os.path.join('apps', 'web', 'src', 'App.tsx')
    
    assert os.path.exists(css_path), 'Missing styles.css'
    assert os.path.exists(admin_path), 'Missing AdminPortal.tsx'
    assert os.path.exists(app_path), 'Missing App.tsx'
    
    with open(css_path, 'r', encoding='utf-8') as f:
        css = f.read()
        
    css_classes = [
        'btn-google-login',
        'toast-container',
        'toast-card',
        'guest-lock-banner',
        'btn-lock-auth',
        'btn-maps-link',
        'gps-live-badge'
    ]
    for cls in css_classes:
        assert cls in css, f'Missing CSS class {cls} in styles.css'
        
    with open(admin_path, 'r', encoding='utf-8') as f:
        admin_code = f.read()
        
    assert 'google.com/maps' in admin_code, 'AdminPortal missing Google Maps URL link'
    assert 'btn-maps-link' in admin_code, 'AdminPortal missing btn-maps-link class'
    
    with open(app_path, 'r', encoding='utf-8') as f:
        app_code = f.read()
        
    assert 'guest-lock-banner' in app_code, 'App.tsx missing guest-lock-banner for unauthenticated orders'
    assert 'toasts' in app_code, 'App.tsx missing toasts state'
    assert 'showToast' in app_code, 'App.tsx missing showToast function'
    
    print('PASS: Verified UI/UX enhancements, toast alerts, order lock banner, and Google Maps integration in Admin Portal!')

if __name__ == '__main__':
    verify()

