import re

app_path = 'apps/web/src/App.tsx'
with open(app_path, 'r', encoding='utf-8') as f:
    text = f.read()

# 1. Remove fillDemoCreds function
text = re.sub(r'  const fillDemoCreds = \(role: \'admin\' \| \'user\'\) => \{[\s\S]*?\}\n\n', '\n', text)

# 2. Remove Quick Demo Creds box in JSX
text = re.sub(r'\s*\{/\* Quick Demo Creds \*/\}[\s\S]*?</div>\s*</div>\n', '\n', text)

# 3. Replace placeholder
text = re.sub(r'placeholder="admin@frogstore\.vn[^"]*"', 'placeholder="email@example.com"', text)

with open(app_path, 'w', encoding='utf-8') as f:
    f.write(text)

print("SUCCESS: App.tsx cleaned of demo creds!")

