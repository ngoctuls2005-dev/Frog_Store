path = "apps/web/src/App.tsx"
with open(path, "r", encoding="utf-8") as f:
    content = f.read()

target = """      {/* 1. Announcement Bar */}
      <div className="announcement-bar">
        <span>🐸 FROG STORE VIỆT NAM — Shop ếch cảnh sống chuyên nghiệp & uy tín</span>
        <span>📦 Bảo hành sống 100% khi nhận hàng — Đóng thùng xốp lót rêu giữ ẩm</span>
        <span>📞 Hotline Zalo kỹ thuật: 0988.123.456</span>
      </div>"""

replacement = """      {/* 1. Announcement Bar */}
      <div className="announcement-bar">
        <span>🐸 FROG STORE VIỆT NAM — Bách khoa & Cung cấp 26 loài ếch cảnh sống thuần chủng</span>
        <span>📞 Tư vấn kỹ thuật & Đặt hàng nhanh: 0988.123.456</span>
      </div>"""

norm_content = content.replace("\r\n", "\n")
norm_target = target.replace("\r\n", "\n")

assert norm_target in norm_content, "target not found!"
norm_content = norm_content.replace(norm_target, replacement.replace("\r\n", "\n"))

with open(path, "w", encoding="utf-8") as f:
    f.write(norm_content)

print("SUCCESS: Streamlined announcement bar in App.tsx!")
