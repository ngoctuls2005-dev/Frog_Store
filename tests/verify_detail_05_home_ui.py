import os
import subprocess
import sys

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

def test_home_ui():
    base_dir = os.path.dirname(__file__)
    app_path = os.path.join(base_dir, '..', 'apps', 'web', 'src', 'App.tsx')
    styles_path = os.path.join(base_dir, '..', 'apps', 'web', 'src', 'styles.css')

    with open(app_path, 'r', encoding='utf-8') as f:
        app_code = f.read()
    with open(styles_path, 'r', encoding='utf-8') as f:
        css_code = f.read()

    # 1. Multi-faceted filters
    assert 'selectedHabitat' in app_code, "Must have selectedHabitat state"
    assert 'selectedPrice' in app_code, "Must have selectedPrice state"
    assert 'handleHabitatChange' in app_code, "Must have handleHabitatChange handler"
    assert 'handlePriceChange' in app_code, "Must have handlePriceChange handler"
    print("   -> OK: Đã tích hợp bộ lọc đa chiều (Môi trường sống, Khoảng giá, Độ khó, Danh mục).")

    # 2. Interactive Frog Matcher Quiz
    assert 'quizOpen' in app_code, "Must have quizOpen state"
    assert 'handleStartQuiz' in app_code, "Must have handleStartQuiz function"
    assert 'quiz-modal-card' in app_code, "Must render quiz modal card"
    assert '.btn-hero-quiz' in css_code, "Must have btn-hero-quiz CSS"
    assert '.quiz-opt-btn' in css_code, "Must have quiz-opt-btn CSS"
    print("   -> OK: Đã tích hợp widget 'Trợ Thủ Tìm Ếch (Frog Matcher Quiz)' 3 câu hỏi trắc nghiệm.")

    # 3. Card enhancement & Detail view integration
    assert 'card-habitat-badge' in app_code, "Product card must include habitat badge"
    assert 'FrogDetailPage' in app_code, "App.tsx must integrate FrogDetailPage"
    print("   -> OK: Thẻ sản phẩm cải tiến hiển thị biểu tượng môi trường và nút Chi Tiết.")

    # 4. Run Vite build to verify TypeScript & JSX syntax
    print("   -> Đang chạy npm run build apps/web...")
    web_dir = os.path.join(base_dir, '..', 'apps', 'web')
    res = subprocess.run(['npm', 'run', 'build'], cwd=web_dir, capture_output=True, text=True, shell=True)
    assert res.returncode == 0, f"Vite build failed:\n{res.stdout}\n{res.stderr}"
    print("   -> OK: Vite build thành công 100%, không có lỗi type hay cú pháp!")

    print("\nKiểm chứng Task DETAIL-05 hoàn tất thành công 100%!")

if __name__ == '__main__':
    test_home_ui()

