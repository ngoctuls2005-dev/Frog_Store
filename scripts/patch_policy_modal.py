import re

app_path = 'apps/web/src/App.tsx'
with open(app_path, 'r', encoding='utf-8') as f:
    code = f.read()

# 1. Import PolicyModal
if "import { PolicyModal" not in code:
    code = code.replace(
        "import { FrogAiChatbot } from './FrogAiChatbot'\n",
        "import { FrogAiChatbot } from './FrogAiChatbot'\nimport { PolicyModal, type PolicyType } from './PolicyModal'\n"
    )

# 2. Add state
if "const [policyOpen, setPolicyOpen]" not in code:
    code = code.replace(
        "  // Modals & Drawers\n",
        "  // Modals & Drawers\n  const [policyOpen, setPolicyOpen] = useState(false)\n  const [activePolicy, setActivePolicy] = useState<PolicyType>('privacy')\n"
    )

# 3. Add footer links
footer_policy_section = """          <div className="footer-col">
            <h3>CHÍNH SÁCH &amp; PHÁP LÝ</h3>
            <ul style={{ listStyle: 'none', padding: 0 }}>
              <li style={{ marginBottom: 8 }}>
                <button
                  type="button"
                  className="footer-policy-link"
                  onClick={() => { setActivePolicy('privacy'); setPolicyOpen(true); }}
                >
                  🔒 Chính Sách Quyền Riêng Tư
                </button>
              </li>
              <li style={{ marginBottom: 8 }}>
                <button
                  type="button"
                  className="footer-policy-link"
                  onClick={() => { setActivePolicy('warranty'); setPolicyOpen(true); }}
                >
                  📦 Chính Sách Bảo Hành Sống 100%
                </button>
              </li>
              <li style={{ marginBottom: 8 }}>
                <button
                  type="button"
                  className="footer-policy-link"
                  onClick={() => { setActivePolicy('terms'); setPolicyOpen(true); }}
                >
                  ⚖️ Điều Khoản Dịch Vụ &amp; CITES
                </button>
              </li>
            </ul>
          </div>"""

if "CHÍNH SÁCH &amp; PHÁP LÝ" not in code:
    code = code.replace(
        """          <div className="footer-col">
            <h3>CHÍNH SÁCH BẢO HÀNH</h3>""",
        footer_policy_section + "\n\n          <div className=\"footer-col\">\n            <h3>CHÍNH SÁCH BẢO HÀNH</h3>"
    )

# 4. Render PolicyModal before footer or before closing
if "<PolicyModal" not in code:
    code = code.replace(
        """      {/* 15. FROG AI CHATBOT WIDGET */}""",
        """      {/* 14b. POLICY & COMPLIANCE MODAL */}
      <PolicyModal
        isOpen={policyOpen}
        activePolicy={activePolicy}
        onClose={() => setPolicyOpen(false)}
        onSelectPolicy={setActivePolicy}
      />

      {/* 15. FROG AI CHATBOT WIDGET */}"""
    )

with open(app_path, 'w', encoding='utf-8') as f:
    f.write(code)

print("SUCCESS: App.tsx patched with PolicyModal & Footer links!")

