import sys

sys.stdout.reconfigure(encoding='utf-8')
print("Adding click-outside and safe positioning to FrogAiChatbot.tsx...")

with open('apps/web/src/FrogAiChatbot.tsx', 'r', encoding='utf-8') as f:
    code = f.read()

# Add chatPanelRef
old_ref = "  const messagesEndRef = useRef<HTMLDivElement>(null)"
new_ref = """  const messagesEndRef = useRef<HTMLDivElement>(null)
  const chatPanelRef = useRef<HTMLDivElement>(null)

  // Click outside to collapse chat and prevent blocking buttons/details
  useEffect(() => {
    if (!isOpen) return
    const handleClickOutside = (e: MouseEvent) => {
      if (chatPanelRef.current && !chatPanelRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isOpen])"""

if old_ref in code:
    code = code.replace(old_ref, new_ref)
    print("✓ Added click-outside hook in FrogAiChatbot.tsx")

# Attach ref to frog-ai-chat-panel
old_panel = '<div className="frog-ai-chat-panel fade-in-up">'
new_panel = '<div className="frog-ai-chat-panel fade-in-up" ref={chatPanelRef}>'

if old_panel in code:
    code = code.replace(old_panel, new_panel)
    print("✓ Attached chatPanelRef to .frog-ai-chat-panel")

with open('apps/web/src/FrogAiChatbot.tsx', 'w', encoding='utf-8') as f:
    f.write(code)

# Now update styles.css to refine chat panel dimensions and safe paddings
with open('apps/web/src/styles.css', 'r', encoding='utf-8') as f:
    css = f.read()

chat_safe_css = """
/* Non-blocking Chat Panel on Desktop */
.frog-ai-chat-panel {
  width: 330px !important;
  height: 420px !important;
  max-height: calc(100vh - 120px) !important;
  bottom: 18px !important;
  right: 18px !important;
  box-shadow: 0 16px 36px -8px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(0, 0, 0, 0.08) !important;
}

/* Detail page safe spacing so FAB never blocks humidity gauge */
.frog-detail-view {
  padding-bottom: 110px !important;
}

.climate-gauge-card {
  margin-bottom: 36px !important;
}

@media (min-width: 1024px) {
  .gauge-grid {
    padding-right: 16px;
  }
}
"""

if '/* Non-blocking Chat Panel on Desktop */' not in css:
    css += chat_safe_css
    with open('apps/web/src/styles.css', 'w', encoding='utf-8') as f:
        f.write(css)
    print("✓ Added non-blocking chat panel styles to styles.css")

print("FrogAiChatbot non-blocking patch completed!")
