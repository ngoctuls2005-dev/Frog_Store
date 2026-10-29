import os
import sys
import subprocess

ROOT_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
WEB_SRC = os.path.join(ROOT_DIR, "apps", "web", "src")
APP_FILE = os.path.join(WEB_SRC, "App.tsx")
CSS_FILE = os.path.join(WEB_SRC, "styles.css")

def test_app_tsx_card_and_no_quickview():
    print("[1/4] Checking App.tsx for card standardization & removed quickView...")
    with open(APP_FILE, "r", encoding="utf-8") as f:
        content = f.read()

    # 1. Ensure quickView state & modal are completely removed
    assert "const [quickView, setQuickView]" not in content, "State quickView still exists in App.tsx"
    assert "quickView &&" not in content, "quickView modal still exists in App.tsx"
    assert "setQuickView" not in content, "setQuickView call still exists in App.tsx"

    # 2. Ensure product card has interactive direct navigation
    assert 'setActiveDetailSlug(p.slug || String(p.id))' in content, "Missing setActiveDetailSlug on product card"
    assert 'window.location.hash = `#/frogs/${p.slug || p.id}`' in content, "Missing hash navigation on product card"
    assert 'className="btn-detail"' in content, "Missing btn-detail on card"
    assert 'className="btn-add"' in content, "Missing btn-add on card"
    print(" -> App.tsx passed: quickView cleanly removed, direct detail navigation verified!")

def test_styles_card_perfection():
    print("[2/4] Checking styles.css for card alignment & line-clamp...")
    with open(CSS_FILE, "r", encoding="utf-8") as f:
        css = f.read()

    assert ".card {" in css, "Missing .card in styles.css"
    assert "height: 100%;" in css, "Missing height: 100% on .card"
    assert ".card-desc {" in css, "Missing .card-desc in styles.css"
    assert "-webkit-line-clamp: 2;" in css, "Missing -webkit-line-clamp: 2 for text truncating"
    assert ".btn-detail {" in css, "Missing .btn-detail in styles.css"
    assert ".card-img-wrap {" in css, "Missing .card-img-wrap in styles.css"
    print(" -> styles.css passed: card flex height & line-clamp verified!")

def test_vite_build():
    print("[3/4] Running TypeScript compile & Vite build...")
    res = subprocess.run(
        ["npm", "run", "build"],
        cwd=os.path.join(ROOT_DIR, "apps", "web"),
        shell=True,
        capture_output=True,
        text=True
    )
    if res.returncode != 0:
        print("ERROR: Vite build failed!")
        print(res.stdout)
        print(res.stderr)
        sys.exit(1)
    print(" -> Vite build passed 100%!")

def main():
    print("=== VERIFYING UI-03: CARD PERFECTION & REMOVE QUICKVIEW ===")
    test_app_tsx_card_and_no_quickview()
    test_styles_card_perfection()
    test_vite_build()
    print("[4/4] ALL CHECKS PASSED FOR UI-03! READY TO VERIFY.")

if __name__ == "__main__":
    main()

