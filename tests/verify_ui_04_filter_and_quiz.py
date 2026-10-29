import os
import sys
import subprocess

ROOT_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
WEB_SRC = os.path.join(ROOT_DIR, "apps", "web", "src")
APP_FILE = os.path.join(WEB_SRC, "App.tsx")
CSS_FILE = os.path.join(WEB_SRC, "styles.css")

def test_search_and_filters_app():
    print("[1/4] Checking App.tsx for quick search clear & result banner...")
    with open(APP_FILE, "r", encoding="utf-8") as f:
        content = f.read()

    assert "btn-search-clear" in content, "Missing btn-search-clear in App.tsx"
    assert "search-result-banner" in content, "Missing search-result-banner in App.tsx"
    assert "btn-clear-search-pill" in content, "Missing btn-clear-search-pill in App.tsx"
    assert "btn-hero-quiz" in content, "Missing btn-hero-quiz in App.tsx"
    assert "category-tabs" in content, "Missing category-tabs in App.tsx"
    print(" -> App.tsx filter toolbar & search banner verified!")

def test_styles_filter_and_quiz():
    print("[2/4] Checking styles.css for clear search & capsule tabs...")
    with open(CSS_FILE, "r", encoding="utf-8") as f:
        css = f.read()

    assert ".btn-search-clear" in css, "Missing .btn-search-clear in styles.css"
    assert ".search-result-banner" in css, "Missing .search-result-banner in styles.css"
    assert "scrollbar-width: none;" in css, "Missing scrollbar-width: none on capsule tabs"
    assert ".btn-hero-quiz" in css, "Missing .btn-hero-quiz in styles.css"
    print(" -> styles.css verified!")

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
    print(" -> Vite build succeeded 100%!")

def main():
    print("=== VERIFYING UI-04: FILTER BAR & HERO QUIZ BANNER ===")
    test_search_and_filters_app()
    test_styles_filter_and_quiz()
    test_vite_build()
    print("[4/4] ALL CHECKS PASSED FOR UI-04! READY TO VERIFY.")

if __name__ == "__main__":
    main()

