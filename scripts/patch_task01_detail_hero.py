path = r"apps/web/src/App.tsx"
with open(path, "r", encoding="utf-8") as f:
    content = f.read()

target = """      {/* 3. Hero Banner */}
      <section className="hero">
        <div className="hero-content">
          <div className="hero-pill">
            <Sparkles size={16} />
            <span>Thế Giới Lưỡng Cư Nhập Khẩu & Nhân Giống Thuần</span>
          </div>
          <h2>THẾ GIỚI ẾCH CẢNH SỐNG ĐẲNG CẤP</h2>
          <p>
            Chuyên cung cấp các dòng ếch cảnh Pacman, Ếch Cây, Ếch Phi Tiêu Độc và các loài lưỡng cư
            quý hiếm. Chuẩn giống 100%, thuần ăn mồi, giá thị trường chuẩn và tư vấn trọn đời.
          </p>

          <div className="hero-features">
            <div className="feature-tag">
              <ShieldCheck size={18} color="#4ade80" />
              <span>Bảo hành sống 100% khi nhận hàng</span>
            </div>
            <div className="feature-tag">
              <Truck size={18} color="#60a5fa" />
              <span>Thùng xốp giữ ẩm giao hỏa tốc toàn quốc</span>
            </div>
            <div className="feature-tag">
              <HeartPulse size={18} color="#f472b6" />
              <span>Đã thuần cám & mồi, ăn khỏe không tật lỗi</span>
            </div>
          </div>

          <div style={{ marginTop: 20 }}>
            <button className="btn-hero-quiz" onClick={handleStartQuiz}>
              <Sparkles size={18} />
              <span>🎯 Trợ Thủ Tìm Ếch Phù Hợp (Quiz 30 Giây)</span>
            </button>
          </div>
        </div>
      </section>"""

replacement = """      {/* 3. Hero Banner (Chỉ hiển thị tại trang chủ, không lặp lại ở trang chi tiết) */}
      {!activeDetailSlug && (
        <section className="hero">
          <div className="hero-content">
            <div className="hero-pill">
              <Sparkles size={16} />
              <span>Thế Giới Lưỡng Cư Nhập Khẩu & Nhân Giống Thuần</span>
            </div>
            <h2>THẾ GIỚI ẾCH CẢNH SỐNG ĐẲNG CẤP</h2>
            <p>
              Chuyên cung cấp các dòng ếch cảnh Pacman, Ếch Cây, Ếch Phi Tiêu Độc và các loài lưỡng cư
              quý hiếm. Chuẩn giống 100%, thuần ăn mồi, giá thị trường chuẩn và tư vấn trọn đời.
            </p>

            <div className="hero-features">
              <div className="feature-tag">
                <ShieldCheck size={18} color="#4ade80" />
                <span>Bảo hành sống 100% khi nhận hàng</span>
              </div>
              <div className="feature-tag">
                <Truck size={18} color="#60a5fa" />
                <span>Thùng xốp giữ ẩm giao hỏa tốc toàn quốc</span>
              </div>
              <div className="feature-tag">
                <HeartPulse size={18} color="#f472b6" />
                <span>Đã thuần cám & mồi, ăn khỏe không tật lỗi</span>
              </div>
            </div>

            <div style={{ marginTop: 20 }}>
              <button className="btn-hero-quiz" onClick={handleStartQuiz}>
                <Sparkles size={18} />
                <span>🎯 Trợ Thủ Tìm Ếch Phù Hợp (Quiz 30 Giây)</span>
              </button>
            </div>
          </div>
        </section>
      )}"""

norm_content = content.replace("\r\n", "\n")
norm_target = target.replace("\r\n", "\n")

assert norm_target in norm_content, "target not found!"
norm_content = norm_content.replace(norm_target, replacement.replace("\r\n", "\n"))

with open(path, "w", encoding="utf-8") as f:
    f.write(norm_content)

print("SUCCESS: Patched App.tsx to hide Hero Banner on detail page!")
