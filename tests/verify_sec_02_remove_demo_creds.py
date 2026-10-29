import os
import sys
import glob

ROOT_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
SRC_APP = os.path.join(ROOT_DIR, "apps", "web", "src", "App.tsx")
DIST_DIR = os.path.join(ROOT_DIR, "apps", "web", "dist", "assets")

def test_source_code_cleaned():
    print("[1/3] Checking App.tsx for removal of demo credentials...")
    with open(SRC_APP, "r", encoding="utf-8") as f:
        src = f.read()

    assert "fillDemoCreds" not in src, "Found fillDemoCreds in App.tsx source!"
    assert "Admin@123456" not in src, "Found Admin@123456 hardcoded password in App.tsx!"
    assert "demo-account-box" not in src, "Found demo-account-box in App.tsx!"
    assert "admin@frogstore.vn hoặc khachhang@gmail.com" not in src, "Found demo placeholder in App.tsx!"
    print(" -> App.tsx is completely clean of hardcoded admin credentials!")

def test_dist_bundle_cleaned():
    print("[2/3] Checking production JS bundles in dist/assets...")
    js_files = glob.glob(os.path.join(DIST_DIR, "*.js"))
    assert len(js_files) > 0, "No built JS files found in dist/assets!"

    for js_path in js_files:
        with open(js_path, "r", encoding="utf-8") as f:
            bundle_content = f.read()
        assert "Admin@123456" not in bundle_content, f"Found Admin password in bundle {js_path}!"
        assert "fillDemoCreds" not in bundle_content, f"Found fillDemoCreds in bundle {js_path}!"
    print(" -> All production JS bundles verified free of admin credentials!")

def main():
    print("=== VERIFYING SEC-02: REMOVE ADMIN DEMO CREDENTIALS ===")
    test_source_code_cleaned()
    test_dist_bundle_cleaned()
    print("[3/3] ALL CHECKS PASSED FOR SEC-02! READY TO VERIFY.")

if __name__ == "__main__":
    main()

