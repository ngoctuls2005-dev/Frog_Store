import os
import sys
import subprocess

ROOT_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
WEB_SRC = os.path.join(ROOT_DIR, "apps", "web", "src")
APP_FILE = os.path.join(WEB_SRC, "App.tsx")
CHATBOT_FILE = os.path.join(WEB_SRC, "FrogAiChatbot.tsx")

def test_quiz_step_fix():
    print("[1/4] Checking App.tsx for Quiz step fix...")
    with open(APP_FILE, "r", encoding="utf-8") as f:
        content = f.read()

    assert "🎯 Kết quả đề xuất" in content, "Missing '🎯 Kết quả đề xuất' label in quiz"
    assert "quizStep <= 3" in content, "Missing condition for quiz step"
    print(" -> Quiz step 4/3 fixed verified!")

def test_chatfab_hidden_on_cart():
    print("[2/4] Checking hidden prop for FrogAiChatbot when cart/checkout is open...")
    with open(APP_FILE, "r", encoding="utf-8") as f:
        app_content = f.read()
    with open(CHATBOT_FILE, "r", encoding="utf-8") as f:
        chat_content = f.read()

    assert "hidden={cartOpen || checkoutOpen}" in app_content, "Missing hidden prop on FrogAiChatbot in App.tsx"
    assert "hidden?: boolean" in chat_content, "Missing hidden prop definition in FrogAiChatbot.tsx"
    assert "if (hidden) return null" in chat_content, "Missing if (hidden) return null in FrogAiChatbot"
    print(" -> FrogAiChatbot hidden on cart/checkout verified!")

def test_a11y_labels():
    print("[3/4] Checking Accessibility aria-labels on inputs...")
    with open(APP_FILE, "r", encoding="utf-8") as f:
        app_content = f.read()
    with open(CHATBOT_FILE, "r", encoding="utf-8") as f:
        chat_content = f.read()

    assert 'aria-label="Tìm kiếm loài ếch theo tên hoặc phân loại"' in app_content, "Missing aria-label on search input"
    assert 'aria-label="Nhập mã đơn hàng cần tra cứu"' in app_content, "Missing aria-label on track input"
    assert 'aria-label="Nhập câu hỏi tư vấn về ếch cảnh"' in chat_content, "Missing aria-label on chatbot input"
    print(" -> Accessibility aria-labels verified!")

def test_vite_build():
    print("[4/4] Verifying Vite build...")
    res = subprocess.run(
        ["npm", "run", "build"],
        cwd=os.path.join(ROOT_DIR, "apps", "web"),
        shell=True,
        capture_output=True,
        text=True
    )
    if res.returncode != 0:
        print("ERROR: Vite build failed!")
        sys.exit(1)
    print(" -> Vite build succeeded 100%!")

def main():
    print("=== VERIFYING UI-07: QUIZ STEP, CHATBOT HIDING & ACCESSIBILITY ===")
    test_quiz_step_fix()
    test_chatfab_hidden_on_cart()
    test_a11y_labels()
    test_vite_build()
    print(">>> ALL CHECKS PASSED FOR UI-07! READY TO VERIFY. <<<")

if __name__ == "__main__":
    main()
