import os
import sys
import subprocess

ROOT_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
WEB_SRC = os.path.join(ROOT_DIR, "apps", "web", "src")
CHATBOT_FILE = os.path.join(WEB_SRC, "FrogAiChatbot.tsx")
DETAIL_FILE = os.path.join(WEB_SRC, "FrogDetailPage.tsx")

def test_chatbot_toxicity_and_cites():
    print("[1/3] Checking FrogAiChatbot.tsx for scientific accuracy & CITES compliance...")
    with open(CHATBOT_FILE, "r", encoding="utf-8") as f:
        content = f.read()

    assert "vô hại tuyệt đối" not in content, "Found absolute statement 'vô hại tuyệt đối' in Chatbot!"
    assert "HOÀN TOÀN KHÔNG CÓ ĐỘC TỐ" not in content, "Found absolute statement 'HOÀN TOÀN KHÔNG CÓ ĐỘC TỐ' in Chatbot!"
    assert "alkaloid" in content, "Missing biological explanation regarding alkaloid diet in Chatbot"
    assert "CITES Phụ lục II" in content or "CITES" in content, "Missing CITES compliance mention in Chatbot"
    assert "rửa tay" in content or "tiếp xúc" in content, "Missing safe handling guidance in Chatbot"
    print(" -> FrogAiChatbot.tsx verified with herpetology science & CITES!")

def test_detail_toxicity_and_cites():
    print("[2/3] Checking FrogDetailPage.tsx for CITES compliance & safe handling...")
    with open(DETAIL_FILE, "r", encoding="utf-8") as f:
        content = f.read()

    assert "vô hại tuyệt đối" not in content, "Found absolute statement in FrogDetailPage!"
    assert "CITES" in content, "Missing CITES mention in FrogDetailPage"
    assert "rửa tay" in content, "Missing hand washing / handling safety in FrogDetailPage"
    print(" -> FrogDetailPage.tsx verified!")

def test_vite_build():
    print("[3/3] Running Vite build...")
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
    print("=== VERIFYING COMP-02: SCIENTIFIC ACCURACY & CITES COMPLIANCE ===")
    test_chatbot_toxicity_and_cites()
    test_detail_toxicity_and_cites()
    test_vite_build()
    print(">>> ALL CHECKS PASSED FOR COMP-02! READY TO VERIFY. <<<")

if __name__ == "__main__":
    main()
