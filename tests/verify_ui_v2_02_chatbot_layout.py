import sys

path = "apps/web/src/styles.css"
with open(path, "r", encoding="utf-8") as f:
    content = f.read()

assert "flex-wrap: wrap" in content, "flex-wrap: wrap missing in prompts-scroll-row"
assert "width: 350px" in content, "width: 350px missing for frog-ai-chat-panel"
assert "white-space: normal" in content, "white-space: normal missing in prompts"

print("[PASS] Chatbot panel and flex-wrap multiline quick prompts verified!")
print("TASK-02 VERIFIED SUCCESSFULLY!")

