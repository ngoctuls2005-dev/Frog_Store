import os

def verify():
    dist_html = os.path.join('apps', 'web', 'dist', 'index.html')
    dist_images = os.path.join('apps', 'web', 'dist', 'images', 'frogs')
    
    assert os.path.exists(dist_html), f'Missing {dist_html}'
    assert os.path.exists(dist_images), f'Missing {dist_images}'
    
    images = os.listdir(dist_images)
    assert len(images) == 16, f'Expected 16 images in dist, got {len(images)}'
    
    with open(os.path.join('apps', 'web', 'src', 'App.tsx'), 'r', encoding='utf-8') as f:
        app_code = f.read()
        
    for feature in ['FROG STORE', 'quickView', 'cartOpen', 'checkoutOpen', 'trackOpen', 'handleCheckoutSubmit']:
        assert feature in app_code, f'Missing feature {feature} in App.tsx'
        
    print('PASS: Verified Frontend build, 16 dist frog images, and UI components!')

if __name__ == '__main__':
    verify()

