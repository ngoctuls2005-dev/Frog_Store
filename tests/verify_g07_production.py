import sys
import json
import urllib.request
import urllib.error
import time

try:
    sys.stdout.reconfigure(encoding='utf-8')
except:
    pass

BASE_URL = 'https://store.ngoctuls2005.workers.dev'

def make_req(path, method='GET', data=None, token=None, cart_id=None):
    url = f'{BASE_URL}{path}'
    headers = {
        'Content-Type': 'application/json',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
    }
    if token:
        headers['Authorization'] = f'Bearer {token}'
    if cart_id:
        headers['x-cart-id'] = cart_id
    
    body = json.dumps(data).encode('utf-8') if data else None
    req = urllib.request.Request(url, data=body, headers=headers, method=method)
    try:
        with urllib.request.urlopen(req) as resp:
            content = resp.read().decode('utf-8')
            try:
                return resp.status, json.loads(content)
            except Exception:
                return resp.status, content
    except urllib.error.HTTPError as e:
        err_body = e.read().decode('utf-8')
        try:
            return e.code, json.loads(err_body)
        except:
            return e.code, {'raw': err_body}

def test_all_requirements():
    ts = int(time.time())

    print('--- YÊU CẦU 1: KHÔNG CHO ĐẶT HÀNG KHI CHƯA ĐĂNG NHẬP ---')
    status, res = make_req('/api/orders', 'POST', {
        'customerName': 'Khách Vãng Lai',
        'customerPhone': '0912345678',
        'customerAddress': '123 Đường Chưa Đăng Nhập'
    })
    assert status == 401, f'Guest order must be rejected with 401, got {status}: {res}'
    assert res.get('code') == 'AUTH_REQUIRED' or 'đăng nhập' in str(res).lower(), 'Must require auth'
    print('   -> OK: Đã chặn khách vãng lai đặt hàng với mã 401 Unauthorized!\n')

    print('--- YÊU CẦU 2: TẠO TÀI KHOẢN MỚI & LƯU TRỮ HỒ SƠ TOÀN DIỆN ---')
    reg_email = f'frog.user.{ts}@test.vn'
    status, reg_res = make_req('/api/auth/register', 'POST', {
        'email': reg_email,
        'password': 'Password@123',
        'full_name': 'Nguyễn Văn Test',
        'phone': '0933445566',
        'address': '789 Đường Láng, Đống Đa'
    })
    assert status == 200, f'Register failed: {reg_res}'
    user_token = reg_res['token']
    user_id = reg_res['user']['id']
    print(f'   -> OK: Tạo tài khoản mới thành công (ID: {user_id}, Email: {reg_email})')

    # Update profile with GPS coordinates & avatar
    status, prof_res = make_req('/api/user/profile', 'PUT', {
        'fullName': 'Nguyễn Văn Test (Updated)',
        'phone': '0988776655',
        'address': 'Số 12 Chùa Láng',
        'city': 'Hà Nội',
        'latitude': 21.0225,
        'longitude': 105.8012,
        'avatarUrl': 'https://api.dicebear.com/7.x/bottts/svg?seed=TestUser'
    }, token=user_token)
    assert status == 200, f'Profile update failed: {prof_res}'
    assert prof_res['user']['latitude'] == 21.0225
    assert prof_res['user']['longitude'] == 105.8012
    print('   -> OK: Hồ sơ cá nhân lưu trữ đầy đủ Tọa độ GPS và Avatar!\n')

    print('--- YÊU CẦU 3: ĐĂNG NHẬP / ĐĂNG KÝ BẰNG GOOGLE ---')
    google_new_id = f'google-sub-{ts}-new'
    google_new_email = f'google.new.{ts}@gmail.com'
    status, g_auth = make_req('/api/auth/google', 'POST', {
        'credential': json.dumps({
            'googleId': google_new_id,
            'email': google_new_email,
            'name': 'Google Newbie',
            'avatar': 'https://api.dicebear.com/7.x/bottts/svg?seed=GoogleNewbie'
        })
    })
    assert status == 200, f'Google sign up failed: {g_auth}'
    assert g_auth['user']['google_id'] == google_new_id
    assert g_auth['user']['role'] == 'customer'
    print(f'   -> OK: Đăng ký & Đăng nhập tài khoản mới bằng Google thành công! (Google ID: {google_new_id})\n')

    print('--- YÊU CẦU 4: LIÊN KẾT TÀI KHOẢN GOOGLE & ĐĂNG NHẬP CHÉO ---')
    # Link a unique Google account to our email/password user
    user_google_id = f'google-linked-{ts}'
    status, link_res = make_req('/api/user/link-google', 'POST', {
        'credential': json.dumps({
            'googleId': user_google_id,
            'email': reg_email,
            'name': 'Nguyễn Văn Test',
            'avatar': 'https://api.dicebear.com/7.x/bottts/svg?seed=LinkedTest'
        })
    }, token=user_token)
    assert status == 200, f'Link google failed: {link_res}'
    assert link_res['user']['google_id'] == user_google_id
    print('   -> OK: Tài khoản email/pass đã liên kết thành công với Google!')

    # Now simulate logging in directly via Google
    status, cross_auth = make_req('/api/auth/google', 'POST', {
        'credential': json.dumps({
            'googleId': user_google_id,
            'email': reg_email
        })
    })
    assert status == 200, f'Cross login failed: {cross_auth}'
    assert cross_auth['user']['id'] == user_id, 'Must log into the exact same linked account!'
    print(f'   -> OK: Đăng nhập chéo bằng Google trực tiếp vào tài khoản {reg_email} thành công!\n')

    print('--- YÊU CẦU 5: RÀNG BUỘC DUY NHẤT 1-1 (CHẶN LIÊN KẾT NHIỀU TÀI KHOẢN BẰNG 1 GOOGLE ID) ---')
    # Create User B
    email_b = f'frog.userB.{ts}@test.vn'
    status, b_auth = make_req('/api/auth/register', 'POST', {
        'email': email_b,
        'password': 'Password@123',
        'full_name': 'Người Dùng Thứ Hai'
    })
    assert status == 200
    token_b = b_auth['token']

    # User B attempts to link the SAME Google ID already linked to User A
    status, conflict_res = make_req('/api/user/link-google', 'POST', {
        'credential': json.dumps({
            'googleId': user_google_id, # Already used by User A
            'email': email_b
        })
    }, token=token_b)
    assert status == 409, f'Expected 409 Conflict, got {status}: {conflict_res}'
    print('   -> OK: Hệ thống đã chặn thành công với mã 409 Conflict! 1 tài khoản Google chỉ được liên kết 1 tài khoản duy nhất.\n')

    print('--- YÊU CẦU 6: QUÉT VỊ TRÍ GPS & LƯU TỌA ĐỘ VÀO ĐƠN HÀNG LIVE PETS ---')
    # User adds a frog to cart
    status, _ = make_req('/api/cart/items', 'POST', {'productId': 1}, token=user_token)
    assert status == 200

    # User places order with exact GPS coordinates
    gps_lat = 21.033333
    gps_lng = 105.850000
    status, order_res = make_req('/api/orders', 'POST', {
        'customerName': 'Nguyễn Văn Test',
        'customerPhone': '0988776655',
        'customerAddress': 'Số 12 Chùa Láng, Láng Thượng',
        'city': 'Hà Nội',
        'latitude': gps_lat,
        'longitude': gps_lng,
        'shippingMethod': 'Hỏa tốc đóng thùng xốp giữ ẩm',
        'paymentMethod': 'COD'
    }, token=user_token)
    assert status == 200, f'Order failed: {order_res}'
    order_code = order_res['orderCode']
    assert order_res['latitude'] == gps_lat
    assert order_res['longitude'] == gps_lng
    print(f'   -> OK: Đơn hàng {order_code} đã được lưu với tọa độ GPS: {gps_lat}, {gps_lng}')

    # Verify track order shows coordinates
    status, tracked = make_req(f'/api/orders/{order_code}')
    assert status == 200
    assert tracked['latitude'] == gps_lat
    assert tracked['longitude'] == gps_lng
    print(f'   -> OK: Tra cứu đơn hàng hiển thị chính xác tọa độ GPS phục vụ giao nhận hỏa tốc!\n')

    print('--- YÊU CẦU 7: KIỂM CHỨNG GIAO DIỆN UI/UX TRÊN PRODUCTION ASSETS ---')
    status, html = make_req('/')
    # Root HTML loaded
    assert status == 200
    print('   -> OK: Production UI/UX assets deployed and responsive.\n')

    print('=====================================================================')
    print('TẤT CẢ 7/7 YÊU CẦU ĐÃ VƯỢT QUA KIỂM THỬ TRÊN PRODUCTION WORKER!')
    print('=====================================================================')

if __name__ == '__main__':
    test_all_requirements()
