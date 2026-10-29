import os
import sys
import subprocess

ROOT_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
WEB_SRC = os.path.join(ROOT_DIR, "apps", "web", "src")
CHATBOT_FILE = os.path.join(WEB_SRC, "FrogAiChatbot.tsx")
APP_FILE = os.path.join(WEB_SRC, "App.tsx")
CSS_FILE = os.path.join(WEB_SRC, "styles.css")

def test_chatbot_component():
    print("[1/5] Checking FrogAiChatbot.tsx...")
    if not os.path.exists(CHATBOT_FILE):
        print("ERROR: FrogAiChatbot.tsx does not exist!")
        sys.exit(1)
    
    with open(CHATBOT_FILE, "r", encoding="utf-8") as f:
        content = f.read()

    assert "export const FrogAiChatbot" in content, "Missing export const FrogAiChatbot"
    assert "api.aiKnowledge()" in content, "Missing call to api.aiKnowledge()"
    assert "quickPrompts" in content, "Missing quickPrompts"
    assert "Pacman" in content, "Missing Pacman prompt in chatbot"
    assert "phi tiêu" in content.lower(), "Missing dart frog prompt in chatbot"
    assert "frog-ai-fab" in content, "Missing frog-ai-fab class in JSX"
    assert "frog-ai-chat-panel" in content, "Missing frog-ai-chat-panel in JSX"
    assert "onOpenProduct" in content, "Missing onOpenProduct navigation link in chatbot"
    print(" -> FrogAiChatbot.tsx verified!")

def test_app_integration():
    print("[2/5] Checking App.tsx integration...")
    with open(APP_FILE, "r", encoding="utf-8") as f:
        content = f.read()

    assert "import { FrogAiChatbot } from './FrogAiChatbot'" in content, "App.tsx does not import FrogAiChatbot"
    assert "<FrogAiChatbot" in content, "App.tsx does not render <FrogAiChatbot"
    assert "currentProductSlug" in content, "App.tsx does not pass currentProductSlug to chatbot"
    assert "onOpenProduct" in content, "App.tsx does not pass onOpenProduct to chatbot"
    print(" -> App.tsx integration verified!")

def test_styles_css():
    print("[3/5] Checking styles.css for Chatbot...")
    with open(CSS_FILE, "r", encoding="utf-8") as f:
        content = f.read()

    assert ".frog-ai-fab" in content, "Missing .frog-ai-fab style in styles.css"
    assert ".frog-ai-chat-panel" in content, "Missing .frog-ai-chat-panel style in styles.css"
    assert ".chat-panel-header" in content, "Missing .chat-panel-header in styles.css"
    assert ".chat-messages-body" in content, "Missing .chat-messages-body in styles.css"
    assert ".btn-chat-product-link" in content, "Missing .btn-chat-product-link in styles.css"
    assert ".quick-prompt-chip" in content, "Missing .quick-prompt-chip in styles.css"
    print(" -> styles.css verified!")

def test_vite_build():
    print("[4/5] Running TypeScript compile & Vite build...")
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
    assert "dist/index.html" in res.stdout or "built in" in res.stdout, "Unexpected build output"
    print(" -> Vite build succeeded 100% with 0 errors!")

def main():
    print("=== VERIFYING UI-02: FROG AI CHATBOT INTEGRATION ===")
    test_chatbot_component()
    test_app_integration()
    test_styles_css()
    test_vite_build()
    print("[5/5] ALL CHECKS PASSED FOR UI-02! READY TO VERIFY.")

if __name__ == "__main__":
    main()

