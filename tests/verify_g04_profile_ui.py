import os

def verify():
    profile_modal_path = os.path.join('apps', 'web', 'src', 'ProfileModal.tsx')
    app_path = os.path.join('apps', 'web', 'src', 'App.tsx')
    api_path = os.path.join('apps', 'web', 'src', 'api.ts')
    
    assert os.path.exists(profile_modal_path), 'Missing ProfileModal.tsx'
    assert os.path.exists(app_path), 'Missing App.tsx'
    assert os.path.exists(api_path), 'Missing api.ts'
    
    with open(profile_modal_path, 'r', encoding='utf-8') as f:
        profile_code = f.read()
        
    assert 'handleLinkGoogle' in profile_code, 'ProfileModal missing handleLinkGoogle'
    assert 'handleUnlinkGoogle' in profile_code, 'ProfileModal missing handleUnlinkGoogle'
    assert 'handleChangePassword' in profile_code, 'ProfileModal missing handleChangePassword'
    assert 'handleSaveProfile' in profile_code, 'ProfileModal missing handleSaveProfile'
    assert 'Liên kết tài khoản Google' in profile_code, 'ProfileModal missing Google link UI'
    
    with open(api_path, 'r', encoding='utf-8') as f:
        api_code = f.read()
        
    for m in ['loginGoogle', 'linkGoogle', 'unlinkGoogle', 'updateProfile']:
        assert m in api_code, f'Missing method {m} in api.ts'
        
    with open(app_path, 'r', encoding='utf-8') as f:
        app_code = f.read()
        
    assert 'ProfileModal' in app_code, 'App.tsx must import ProfileModal'
    assert 'handleGoogleLogin' in app_code, 'App.tsx must have handleGoogleLogin'
    assert 'btn-google-login' in app_code, 'App.tsx must have Google sign-in button'
    assert 'profileOpen' in app_code, 'App.tsx must manage profileOpen state'
    
    print('PASS: Verified customer profile modal, Google Sign-In and account linking integration!')

if __name__ == '__main__':
    verify()

