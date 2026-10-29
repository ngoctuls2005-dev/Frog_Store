path = "apps/web/src/FrogDetailPage.tsx"
with open(path, "r", encoding="utf-8") as f:
    content = f.read()

target_gauge = """            {/* Temperature Gauge */}
            <div className="gauge-item">
              <div className="gauge-top-label">
                <span>Nhiệt Độ Ban Ngày: <strong>{d.temp_day_min}°C - {d.temp_day_max}°C</strong></span>
                <span>Ban Đêm: <strong>{d.temp_night_min}°C - {d.temp_night_max}°C</strong></span>
              </div>
              <div className="progress-track temp-track">
                <div
                  className="progress-safe-zone"
                  style={{
                    left: `${Math.max(0, ((d.temp_day_min - 15) / 25) * 100)}%`,
                    width: `${Math.min(100, ((d.temp_day_max - d.temp_day_min) / 25) * 100)}%`
                  }}
                >
                  <span className="safe-badge">Dải An Toàn</span>
                </div>
              </div>
              <div className="gauge-scale">
                <span>15°C (Lạnh)</span>
                <span>25°C (Lý tưởng)</span>
                <span>40°C (Nguy hiểm)</span>
              </div>
            </div>

            {/* Humidity Gauge */}
            <div className="gauge-item">
              <div className="gauge-top-label">
                <span>Độ Ẩm Không Khí: <strong>{d.humidity_min}% - {d.humidity_max}%</strong></span>
                <span>Khuyến nghị: <strong>Xịt ẩm 1-2 lần/ngày</strong></span>
              </div>
              <div className="progress-track humid-track">
                <div
                  className="progress-safe-zone humid-safe"
                  style={{
                    left: `${d.humidity_min}%`,
                    width: `${d.humidity_max - d.humidity_min}%`
                  }}
                >
                  <span className="safe-badge">Ẩm Chuẩn</span>
                </div>
              </div>
              <div className="gauge-scale">
                <span>0% (Khô hạn)</span>
                <span>50%</span>
                <span>100% (Bão hòa)</span>
              </div>
            </div>"""

replacement_gauge = """            {/* Temperature Gauge */}
            <div className="gauge-item">
              <div className="gauge-top-label">
                <span className="gauge-main-title">🌡️ Nhiệt Độ Ban Ngày: <strong>{d.temp_day_min}°C - {d.temp_day_max}°C</strong></span>
                <span className="gauge-sub-pill">Ban đêm: {d.temp_night_min}°C - {d.temp_night_max}°C</span>
              </div>
              <div className="progress-track temp-track">
                <div
                  className="progress-safe-zone"
                  style={{
                    left: `${Math.max(0, ((d.temp_day_min - 15) / 25) * 100)}%`,
                    width: `${Math.min(100, ((d.temp_day_max - d.temp_day_min) / 25) * 100)}%`
                  }}
                  title={`Dải nhiệt an toàn: ${d.temp_day_min}°C - ${d.temp_day_max}°C`}
                >
                  <div className="safe-zone-glow"></div>
                </div>
              </div>
              <div className="gauge-scale">
                <span>15°C (Lạnh)</span>
                <span className="gauge-ideal-mark">25°C (Lý tưởng)</span>
                <span>40°C (Nguy hiểm)</span>
              </div>
            </div>

            {/* Humidity Gauge */}
            <div className="gauge-item">
              <div className="gauge-top-label">
                <span className="gauge-main-title">💧 Độ Ẩm Không Khí: <strong>{d.humidity_min}% - {d.humidity_max}%</strong></span>
                <span className="gauge-sub-pill">Xịt ẩm 1-2 lần/ngày</span>
              </div>
              <div className="progress-track humid-track">
                <div
                  className="progress-safe-zone humid-safe"
                  style={{
                    left: `${d.humidity_min}%`,
                    width: `${d.humidity_max - d.humidity_min}%`
                  }}
                  title={`Độ ẩm chuẩn: ${d.humidity_min}% - ${d.humidity_max}%`}
                >
                  <div className="safe-zone-glow"></div>
                </div>
              </div>
              <div className="gauge-scale">
                <span>0% (Khô hạn)</span>
                <span className="gauge-ideal-mark">50%</span>
                <span>100% (Bão hòa)</span>
              </div>
            </div>"""

norm_content = content.replace("\r\n", "\n")
norm_target = target_gauge.replace("\r\n", "\n")

assert norm_target in norm_content, "target_gauge not found!"
norm_content = norm_content.replace(norm_target, replacement_gauge.replace("\r\n", "\n"))

with open(path, "w", encoding="utf-8") as f:
    f.write(norm_content)

print("SUCCESS: Updated climate gauge in FrogDetailPage.tsx!")

