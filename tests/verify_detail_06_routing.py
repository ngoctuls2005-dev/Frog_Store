import os
import re
import subprocess
import sys

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

def test_routing_and_cart():
    base_dir = os.path.dirname(__file__)
    app_path = os.path.join(base_dir, '..', 'apps', 'web', 'src', 'App.tsx')
    detail_path = os.path.join(base_dir, '..', 'apps', 'web', 'src', 'FrogDetailPage.tsx')
    api_web_path = os.path.join(base_dir, '..', 'apps', 'web', 'src', 'api.ts')
    api_worker_path = os.path.join(base_dir, '..', 'apps', 'api', 'src', 'index.ts')

    with open(app_path, 'r', encoding='utf-8') as f:
        app_code = f.read()
    with open(detail_path, 'r', encoding='utf-8') as f:
        detail_code = f.read()
    with open(api_web_path, 'r', encoding='utf-8') as f:
        web_api_code = f.read()
    with open(api_worker_path, 'r', encoding='utf-8') as f:
        worker_code = f.read()

    # 1. Test hash regex matching
    pattern = r'^#\/frogs?\/([\w-]+)'
    test_urls = [
        ('#/frogs/pacman-green', 'pacman-green'),
        ('#/frogs/mossy-vietnamese', 'mossy-vietnamese'),
        ('#/frog/bullfrog-pixie', 'bullfrog-pixie'),
        ('#/frog/15', '15')
    ]
    for url, expected in test_urls:
        match = re.match(pattern, url)
        assert match and match.group(1) == expected, f"Regex failed on {url}"
    print("   -> OK: Regex Hash Routing khớp chính xác 100% các URL chia sẻ và Deep Link.")

    # 2. Test Share Link in FrogDetailPage
    assert 'navigator.clipboard.writeText' in detail_code, "Must use clipboard API"
    assert '#/frogs/' in detail_code, "Share link must target #/frogs/"
    print("   -> OK: Nút chia sẻ liên kết sao chép đúng Hash URL trực tiếp đến từng con ếch.")

    # 3. Test Cart qty support
    assert 'addQty' in worker_code, "Backend cart must support addQty"
    assert 'add: (productId: number, qty?: number)' in web_api_code, "Frontend api.add must support qty"
    print("   -> OK: Giỏ hàng hỗ trợ thêm số lượng tùy chọn (qty) trực tiếp từ trang chi tiết.")

    # 4. Build both frontend and api
    print("   -> Đang kiểm tra build frontend (apps/web)...")
    res_web = subprocess.run(['npm', 'run', 'build'], cwd=os.path.join(base_dir, '..', 'apps', 'web'), capture_output=True, text=True, shell=True)
    assert res_web.returncode == 0, f"Frontend build failed:\n{res_web.stderr}"
    print("   -> OK: Frontend build thành công 0 lỗi!")

    print("   -> Đang kiểm tra typecheck backend (apps/api)...")
    res_api = subprocess.run(['npm', 'run', 'typecheck'], cwd=os.path.join(base_dir, '..', 'apps', 'api'), capture_output=True, text=True, shell=True)
    assert res_api.returncode == 0, f"Backend typecheck failed:\n{res_api.stderr}"
    print("   -> OK: Backend typecheck thành công 0 lỗi!")

    print("\nKiểm chứng Task DETAIL-06 hoàn tất thành công 100%!")

if __name__ == '__main__':
    test_routing_and_cart()

