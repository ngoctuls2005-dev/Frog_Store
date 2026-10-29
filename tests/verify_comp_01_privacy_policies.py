import os
import sys
import subprocess

ROOT_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
WEB_SRC = os.path.join(ROOT_DIR, "apps", "web", "src")
POLICY_FILE = os.path.join(WEB_SRC, "PolicyModal.tsx")
APP_FILE = os.path.join(WEB_SRC, "App.tsx")
CSS_FILE = os.path.join(WEB_SRC, "styles.css")

def test_policy_component():
    print("[1/4] Checking PolicyModal.tsx for comprehensive privacy & warranty details...")
    assert os.path.exists(POLICY_FILE), "PolicyModal.tsx does not exist!"

    with open(POLICY_FILE, "r", encoding="utf-8") as f:
        content = f.read()

    assert "Chính Sách Quyền Riêng Tư" in content, "Missing privacy policy content"
    assert "Chính Sách Vận Chuyển & Bảo Hành Sống 100%" in content or "Bảo Hành Sống 100%" in content, "Missing warranty policy"
    assert "Điều Khoản Dịch Vụ" in content or "Điều Khoản & CITES" in content, "Missing terms & CITES content"
    assert "PBKDF2-SHA256" in content, "Missing mention of PBKDF2 password encryption in privacy policy"
    assert "Unboxing" in content, "Missing unboxing video requirement in warranty policy"
    assert "Captive-Bred" in content or "sinh sản nhân tạo" in content, "Missing captive bred statement"
    print(" -> PolicyModal.tsx verified!")

def test_app_integration():
    print("[2/4] Checking App.tsx for PolicyModal integration & footer links...")
    with open(APP_FILE, "r", encoding="utf-8") as f:
        content = f.read()

    assert "import { PolicyModal" in content, "App.tsx does not import PolicyModal"
    assert "<PolicyModal" in content, "App.tsx does not render PolicyModal"
    assert "footer-policy-link" in content, "App.tsx missing footer policy links"
    print(" -> App.tsx integration verified!")

def test_styles():
    print("[3/4] Checking styles.css for footer policy links...")
    with open(CSS_FILE, "r", encoding="utf-8") as f:
        css = f.read()

    assert ".footer-policy-link" in css, "styles.css missing .footer-policy-link"
    print(" -> styles.css verified!")

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
    print("=== VERIFYING COMP-01: PRIVACY, WARRANTY & TERMS POLICIES ===")
    test_policy_component()
    test_app_integration()
    test_styles()
    test_vite_build()
    print(">>> ALL CHECKS PASSED FOR COMP-01! READY TO VERIFY. <<<")

if __name__ == "__main__":
    main()

