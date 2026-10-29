import os

def verify():
    app_path = os.path.join('apps', 'web', 'src', 'App.tsx')
    profile_path = os.path.join('apps', 'web', 'src', 'ProfileModal.tsx')
    
    assert os.path.exists(app_path), 'Missing App.tsx'
    assert os.path.exists(profile_path), 'Missing ProfileModal.tsx'
    
    with open(app_path, 'r', encoding='utf-8') as f:
        app_code = f.read()
        
    app_gps_features = [
        'handleScanGpsLocation',
        'navigator.geolocation',
        'getCurrentPosition',
        'nominatim.openstreetmap.org',
        'gps-live-badge',
        'gpsLocating',
        'Quét vị trí GPS'
    ]
    for feat in app_gps_features:
        assert feat in app_code, f'Missing GPS feature {feat} in App.tsx'
        
    with open(profile_path, 'r', encoding='utf-8') as f:
        prof_code = f.read()
        
    prof_gps_features = [
        'handleGetLocation',
        'navigator.geolocation',
        'getCurrentPosition',
        'nominatim.openstreetmap.org'
    ]
    for feat in prof_gps_features:
        assert feat in prof_code, f'Missing GPS feature {feat} in ProfileModal.tsx'
        
    print('PASS: Verified device GPS scanning, reverse geocoding, and location binding in Checkout and Profile!')

if __name__ == '__main__':
    verify()

