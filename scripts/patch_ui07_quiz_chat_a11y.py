chatbot_path = 'apps/web/src/FrogAiChatbot.tsx'
with open(chatbot_path, 'r', encoding='utf-8') as f:
    chat_code = f.read()

# 1. Update FrogAiChatbotProps with hidden?: boolean
old_props = """interface FrogAiChatbotProps {
  currentProductSlug?: string | null
  onOpenProduct?: (slug: string) => void
}"""

new_props = """interface FrogAiChatbotProps {
  currentProductSlug?: string | null
  onOpenProduct?: (slug: string) => void
  hidden?: boolean
}"""

if old_props in chat_code:
    chat_code = chat_code.replace(old_props, new_props)

old_fc = """export const FrogAiChatbot: React.FC<FrogAiChatbotProps> = ({
  currentProductSlug,
  onOpenProduct
}) => {"""

new_fc = """export const FrogAiChatbot: React.FC<FrogAiChatbotProps> = ({
  currentProductSlug,
  onOpenProduct,
  hidden
}) => {
  if (hidden) return null"""

if old_fc in chat_code:
    chat_code = chat_code.replace(old_fc, new_fc)

# Add aria-labels in Chatbot
chat_code = chat_code.replace(
    'className="frog-ai-fab"',
    'className="frog-ai-fab" aria-label="Mở Trợ Lý Ếch AI tư vấn sinh học"'
)
chat_code = chat_code.replace(
    'className="chat-text-input"',
    'className="chat-text-input" aria-label="Nhập câu hỏi tư vấn về ếch cảnh"'
)

with open(chatbot_path, 'w', encoding='utf-8') as f:
    f.write(chat_code)

print("FrogAiChatbot.tsx patched with hidden prop & aria-labels!")

# 2. Update App.tsx for Quiz step 4/3 and A11y
app_path = 'apps/web/src/App.tsx'
with open(app_path, 'r', encoding='utf-8') as f:
    app_code = f.read()

# Fix Quiz step indicator
old_quiz_label = """                <div className="quiz-progress-track">
                  <div
                    className="quiz-progress-fill"
                    style={{ width: `${(quizStep / 4) * 100}%` }}
                  ></div>
                </div>
                <span className="quiz-step-label">Bước {quizStep} / 3</span>"""

new_quiz_label = """                <div className="quiz-progress-track">
                  <div
                    className="quiz-progress-fill"
                    style={{ width: quizStep <= 3 ? `${(quizStep / 3) * 100}%` : '100%' }}
                  ></div>
                </div>
                <span className="quiz-step-label">
                  {quizStep <= 3 ? `Bước ${quizStep} / 3` : '🎯 Kết quả đề xuất'}
                </span>"""

if old_quiz_label in app_code:
    app_code = app_code.replace(old_quiz_label, new_quiz_label)
    print("Quiz step 4/3 fixed to '🎯 Kết quả đề xuất'!")
else:
    print("WARNING: old_quiz_label not found in App.tsx")

# Add hidden prop to <FrogAiChatbot /> in App.tsx
old_render_chatbot = """      {/* 15. FROG AI CHATBOT WIDGET */}
      <FrogAiChatbot
        currentProductSlug={activeDetailSlug}"""

new_render_chatbot = """      {/* 15. FROG AI CHATBOT WIDGET */}
      <FrogAiChatbot
        hidden={cartOpen || checkoutOpen}
        currentProductSlug={activeDetailSlug}"""

if old_render_chatbot in app_code:
    app_code = app_code.replace(old_render_chatbot, new_render_chatbot)
    print("FrogAiChatbot rendered with hidden={cartOpen || checkoutOpen}!")
else:
    print("WARNING: old_render_chatbot not found in App.tsx")

# Add aria-label to search bar input
app_code = app_code.replace(
    'placeholder="Tìm theo tên loài, tên khoa học (Pacman, Dumpy, Dart, Mossy...)"\n            value={search}',
    'aria-label="Tìm kiếm loài ếch theo tên hoặc phân loại"\n            placeholder="Tìm theo tên loài, tên khoa học (Pacman, Dumpy, Dart, Mossy...)"\n            value={search}'
)

# Add aria-label to track order input
app_code = app_code.replace(
    'placeholder="Nhập mã đơn hàng ví dụ: FROG-123456"\n                value={trackCode}',
    'aria-label="Nhập mã đơn hàng cần tra cứu"\n                placeholder="Nhập mã đơn hàng ví dụ: FROG-123456"\n                value={trackCode}'
)

with open(app_path, 'w', encoding='utf-8') as f:
    f.write(app_code)

print("App.tsx patched with Quiz fix & A11y aria-labels!")
