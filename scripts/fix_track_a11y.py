app_path = 'apps/web/src/App.tsx'
with open(app_path, 'r', encoding='utf-8') as f:
    text = f.read()

text = text.replace(
    'placeholder="Ví dụ: FROG-849201"',
    'aria-label="Nhập mã đơn hàng cần tra cứu"\n                placeholder="Ví dụ: FROG-849201"'
)

with open(app_path, 'w', encoding='utf-8') as f:
    f.write(text)

print("SUCCESS: Track input aria-label added!")

