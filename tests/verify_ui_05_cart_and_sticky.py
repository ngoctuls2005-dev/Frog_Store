import os
import sys
import subprocess

ROOT_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
WEB_SRC = os.path.join(ROOT_DIR, "apps", "web", "src")
APP_FILE = os.path.join(WEB_SRC, "App.tsx")
DETAIL_FILE = os.path.join(WEB_SRC, "FrogDetailPage.tsx")
CSS_FILE = os.path.join(WEB_SRC, "styles.css")

def test_cart_drawer():
    print("[1/4] Checking App.tsx for Cart Drawer +/- quantity controls & guest banner...")
    with open(APP_FILE, "r", encoding="utf-8") as f:
        content = f.read()

    assert "cart-item-qty" in content, "Missing cart-item-qty in App.tsx"
    assert "api.setQty(p.id, qty - 1)" in content, "Missing decrement qty in Cart Drawer"
    assert "api.setQty(p.id, qty + 1)" in content, "Missing increment qty in Cart Drawer"
    assert "btn-remove-item" in content, "Missing btn-remove-item in Cart Drawer"
    assert "guest-lock-banner" in content, "Missing guest-lock-banner in App.tsx"
    print(" -> Cart Drawer interactive controls & auth lock verified!")

def test_sticky_bar_detail():
    print("[2/4] Checking FrogDetailPage.tsx for Sticky Mobile Bar...")
    with open(DETAIL_FILE, "r", encoding="utf-8") as f:
        content = f.read()

    assert "sticky-mobile-buy-bar" in content, "Missing sticky-mobile-buy-bar in FrogDetailPage.tsx"
    assert "sticky-bar-name" in content, "Missing sticky-bar-name in FrogDetailPage.tsx"
    assert "sticky-bar-price" in content, "Missing sticky-bar-price in FrogDetailPage.tsx"
    assert "btn-sticky-cart" in content, "Missing btn-sticky-cart in FrogDetailPage.tsx"
    assert "btn-sticky-buy" in content, "Missing btn-sticky-buy in FrogDetailPage.tsx"
    print(" -> FrogDetailPage.tsx sticky mobile bar verified!")

def test_styles_sticky():
    print("[3/4] Checking styles.css for sticky mobile buy bar & mobile position...")
    with open(CSS_FILE, "r", encoding="utf-8") as f:
        css = f.read()

    assert ".sticky-mobile-buy-bar" in css, "Missing .sticky-mobile-buy-bar in styles.css"
    assert "@media (max-width: 768px)" in css, "Missing mobile media query in styles.css"
    assert "btn-sticky-buy" in css, "Missing btn-sticky-buy in styles.css"
    print(" -> styles.css sticky bar responsive styles verified!")

def test_vite_build():
    print("[4/4] Running TypeScript compile & Vite build...")
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
    print(" -> Vite build succeeded 100%!")

def main():
    print("=== VERIFYING UI-05: CART CONTROLS & STICKY MOBILE BAR ===")
    test_cart_drawer()
    test_sticky_bar_detail()
    test_styles_sticky()
    test_vite_build()
    print("[5/5] ALL CHECKS PASSED FOR UI-05! READY TO VERIFY.")

if __name__ == "__main__":
    main()

