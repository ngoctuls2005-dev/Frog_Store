with open('apps/api/src/index.ts', 'r', encoding='utf-8') as f:
    code = f.read()

target = "return c.text(Asset fetch error: , 500)"
replacement = "return c.text(`Asset fetch error: ${e?.message || e}`, 500)"

if target in code:
    code = code.replace(target, replacement)
    with open('apps/api/src/index.ts', 'w', encoding='utf-8') as f:
        f.write(code)
    print("Fixed syntax in index.ts successfully!")
else:
    print("Target not found")
