import os
import sys

sys.stdout.reconfigure(encoding='utf-8')

def test_logo_navigation():
    print("Testing Logo Home Navigation...")
    with open('apps/web/src/App.tsx', 'r', encoding='utf-8') as f:
        app_content = f.read()
        
    assert 'handleGoHome' in app_content, "App.tsx missing handleGoHome function"
    assert 'setActiveDetailSlug(null)' in app_content, "handleGoHome must reset activeDetailSlug"
    assert "window.location.hash = '#/'" in app_content, "handleGoHome must reset location.hash"
    assert 'onClick={handleGoHome}' in app_content, "Brand header missing onClick={handleGoHome}"
    assert 'role="button"' in app_content, "Brand header missing role='button' for a11y"
    assert 'aria-label="Về trang chủ Frog Store"' in app_content, "Brand header missing aria-label"
    print("✓ Logo Home Navigation verification passed!")

def test_performance_optimizations():
    print("\nTesting Performance Optimizations...")
    
    # 1. Check Image Sizes
    frogs_dir = r'apps/web/public/images/frogs'
    files = [f for f in os.listdir(frogs_dir) if f.endswith('.jpg')]
    assert len(files) == 26, f"Expected 26 frog images, found {len(files)}"
    total_mb = sum(os.path.getsize(os.path.join(frogs_dir, f)) for f in files) / (1024 * 1024)
    print(f"Total frog images size: {total_mb:.2f} MB")
    assert total_mb < 3.0, f"Expected total image size < 3MB, but got {total_mb:.2f} MB"
    
    # 2. Check React Image Performance Attributes
    with open('apps/web/src/App.tsx', 'r', encoding='utf-8') as f:
        app_content = f.read()
    assert 'decoding="async"' in app_content, "App.tsx images missing decoding='async'"
    assert 'loading="lazy"' in app_content, "App.tsx images missing loading='lazy'"
    
    with open('apps/web/src/FrogDetailPage.tsx', 'r', encoding='utf-8') as f:
        detail_content = f.read()
    assert 'fetchPriority="high"' in detail_content, "FrogDetailPage hero missing fetchPriority='high'"
    assert 'decoding="async"' in detail_content, "FrogDetailPage hero missing decoding='async'"
    
    # 3. Check Caching Headers in API
    with open('apps/api/src/index.ts', 'r', encoding='utf-8') as f:
        api_content = f.read()
    assert 'max-age=31536000, immutable' in api_content, "API missing immutable cache for assets"
    assert 'max-age=2592000' in api_content, "API missing 30-day cache for images"
    assert 'max-age=0, must-revalidate' in api_content, "API missing revalidation for index.html"
    print("✓ Performance and Caching attributes verification passed!")

if __name__ == '__main__':
    test_logo_navigation()
    test_performance_optimizations()
    print("\n[ALL CHECKS PASSED 100%] Logo navigation & Speed optimizations verified successfully!")
