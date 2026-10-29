path = r"apps/web/src/styles.css"
with open(path, "r", encoding="utf-8") as f:
    content = f.read()

target_panel = """/* Chat Panel Window */
.frog-ai-chat-panel {
  position: fixed;
  bottom: 24px;
  right: 24px;
  width: 380px;
  max-width: calc(100vw - 32px);
  height: 540px;
  max-height: calc(100vh - 48px);"""

replacement_panel = """/* Chat Panel Window */
.frog-ai-chat-panel {
  position: fixed;
  bottom: 24px;
  right: 24px;
  width: 350px;
  max-width: calc(100vw - 32px);
  height: 480px;
  max-height: min(480px, calc(100vh - 100px));"""

target_prompts = """/* Quick Prompts Carousel */
.chat-quick-prompts {
  padding: 10px 14px;
  background: #f1f5f9;
  border-top: 1px solid #e2e8f0;
  overflow-x: auto;
}

.prompts-scroll-row {
  display: flex;
  gap: 8px;
  white-space: nowrap;
}

.quick-prompt-chip {
  padding: 6px 12px;
  background: #ffffff;
  border: 1px solid #cbd5e1;
  border-radius: 9999px;
  font-size: 0.78rem;
  font-weight: 600;
  color: #334155;
  cursor: pointer;
  transition: all 0.2s;
  flex-shrink: 0;
}"""

replacement_prompts = """/* Quick Prompts Multiline Wrap */
.chat-quick-prompts {
  padding: 8px 12px;
  background: #f8fafc;
  border-top: 1px solid #e2e8f0;
  max-height: 130px;
  overflow-y: auto;
}

.prompts-scroll-row {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  white-space: normal;
}

.quick-prompt-chip {
  padding: 5px 10px;
  background: #ffffff;
  border: 1px solid #cbd5e1;
  border-radius: 8px;
  font-size: 0.76rem;
  font-weight: 600;
  color: #334155;
  cursor: pointer;
  transition: all 0.2s;
  white-space: normal;
  text-align: left;
  line-height: 1.3;
}"""

norm_content = content.replace("\r\n", "\n")
norm_target_panel = target_panel.replace("\r\n", "\n")
norm_target_prompts = target_prompts.replace("\r\n", "\n")

assert norm_target_panel in norm_content, "target_panel not found!"
norm_content = norm_content.replace(norm_target_panel, replacement_panel.replace("\r\n", "\n"))

assert norm_target_prompts in norm_content, "target_prompts not found!"
norm_content = norm_content.replace(norm_target_prompts, replacement_prompts.replace("\r\n", "\n"))

with open(path, "w", encoding="utf-8") as f:
    f.write(norm_content)

print("SUCCESS: Patched styles.css for Chatbot panel and flex-wrap prompts!")
