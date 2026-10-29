app_path = 'apps/web/src/App.tsx'
with open(app_path, 'r', encoding='utf-8') as f:
    c = f.read()

c = c.replace(
    'style={{ width: `${(quizStep / 4) * 100}%` }}',
    'style={{ width: quizStep <= 3 ? `${(quizStep / 3) * 100}%` : "100%" }}'
)
c = c.replace(
    '<span className="quiz-step-label">Bước {quizStep} / 3</span>',
    '<span className="quiz-step-label">{quizStep <= 3 ? `Bước ${quizStep} / 3` : "🎯 Kết quả đề xuất"}</span>'
)

with open(app_path, 'w', encoding='utf-8') as f:
    f.write(c)

print("SUCCESS: Quiz step fixed!")

