path = "apps/web/src/styles.css"
with open(path, "r", encoding="utf-8") as f:
    css_content = f.read()

old_progress_css = """.progress-track {
  position: relative;
  width: 100%;
  height: 20px;
  background: #e2e8f0;
  border-radius: 10px;
  overflow: hidden;
}

.temp-track {
  background: linear-gradient(to right, #93c5fd, #86efac, #fcd34d, #fca5a5);
}

.humid-track {
  background: linear-gradient(to right, #fed7aa, #86efac, #67e8f9);
}

.progress-safe-zone {
  position: absolute;
  top: 0;
  bottom: 0;
  background: rgba(5, 150, 105, 0.85);
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 0 8px rgba(5, 150, 105, 0.4);
}

.safe-badge {
  font-size: 0.675rem;
  font-weight: 800;
  color: #ffffff;
  letter-spacing: 0.5px;
  text-transform: uppercase;
}"""

new_progress_css = """/* Scientific Climate Progress Track */
.progress-track {
  position: relative;
  width: 100%;
  height: 14px;
  background: #e2e8f0;
  border-radius: 9999px;
  overflow: hidden;
  box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.12);
}

.temp-track {
  background: linear-gradient(to right, #93c5fd 0%, #86efac 35%, #fcd34d 70%, #f87171 100%);
}

.humid-track {
  background: linear-gradient(to right, #fdba74 0%, #86efac 40%, #38bdf8 100%);
}

.progress-safe-zone {
  position: absolute;
  top: 0;
  bottom: 0;
  background: #059669;
  border-radius: 9999px;
  border: 2px solid #ffffff;
  box-shadow: 0 0 12px rgba(5, 150, 105, 0.7);
  transition: all 0.3s ease;
}

.safe-zone-glow {
  width: 100%;
  height: 100%;
  border-radius: 9999px;
  background: linear-gradient(to bottom, rgba(255,255,255,0.4), transparent);
}

.gauge-main-title {
  font-size: 0.88rem;
  color: #334155;
}

.gauge-sub-pill {
  display: inline-flex;
  align-items: center;
  padding: 3px 10px;
  background: #ecfdf5;
  border: 1px solid #a7f3d0;
  color: #065f46;
  font-size: 0.78rem;
  font-weight: 700;
  border-radius: 9999px;
}

.gauge-ideal-mark {
  color: #059669;
  font-weight: 700;
}"""

norm_css = css_content.replace("\r\n", "\n")
norm_old = old_progress_css.replace("\r\n", "\n")

assert norm_old in norm_css, "old_progress_css not found!"
norm_css = norm_css.replace(norm_old, new_progress_css.replace("\r\n", "\n"))

# Append PolicyModal modern styling at the end
policy_modal_styles = """
/* ========================================================
   MODERN POLICY MODAL STYLES (ENHANCED DESIGN)
   ======================================================== */
.policy-modal-card {
  max-width: 740px !important;
  max-height: 88vh !important;
  border-radius: 20px !important;
  display: flex !important;
  flex-direction: column !important;
  overflow: hidden !important;
  box-shadow: 0 25px 60px -15px rgba(0, 0, 0, 0.3) !important;
  border: 1px solid rgba(0, 0, 0, 0.08) !important;
}

.policy-modal-header {
  padding: 18px 24px;
  background: linear-gradient(135deg, #f0fdf4 0%, #ecfdf5 100%);
  border-bottom: 1px solid #d1fae5;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.policy-header-left {
  display: flex;
  align-items: center;
  gap: 14px;
}

.policy-icon-badge {
  width: 44px;
  height: 44px;
  border-radius: 12px;
  background: #ffffff;
  border: 1px solid #a7f3d0;
  box-shadow: 0 2px 8px rgba(5, 150, 105, 0.15);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.policy-modal-title {
  margin: 0;
  font-size: 1.15rem;
  font-weight: 800;
  color: #064e3b;
  letter-spacing: -0.01em;
}

.policy-modal-subtitle {
  margin: 2px 0 0 0;
  font-size: 0.78rem;
  color: #047857;
  font-weight: 500;
}

.policy-close-btn {
  background: #ffffff;
  border: 1px solid #e2e8f0;
  width: 34px;
  height: 34px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #64748b;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.policy-close-btn:hover {
  background: #fee2e2;
  border-color: #fca5a5;
  color: #dc2626;
  transform: rotate(90deg);
}

.policy-tab-bar {
  display: flex;
  gap: 6px;
  padding: 10px 20px;
  background: #f8fafc;
  border-bottom: 1px solid #e2e8f0;
  overflow-x: auto;
}

.policy-tab-item {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  border-radius: 10px;
  border: 1px solid transparent;
  background: transparent;
  color: #64748b;
  font-size: 0.84rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;
}

.policy-tab-item:hover {
  color: #1e293b;
  background: rgba(255, 255, 255, 0.6);
}

.policy-tab-item.active {
  background: #ffffff;
  color: #047857;
  border-color: #cbd5e1;
  font-weight: 700;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.policy-scroll-body {
  flex: 1;
  overflow-y: auto;
  padding: 20px 24px;
  background: #f8fafc;
}

.policy-content-stack {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.policy-callout-box {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 14px 16px;
  border-radius: 12px;
  font-size: 0.86rem;
  line-height: 1.5;
}

.policy-callout-box .callout-icon {
  flex-shrink: 0;
  margin-top: 2px;
}

.policy-callout-box.emerald-box {
  background: #ecfdf5;
  border: 1px solid #a7f3d0;
  color: #065f46;
}

.policy-callout-box.amber-box {
  background: #fffbeb;
  border: 1px solid #fde68a;
  color: #92400e;
}

.policy-callout-box.blue-box {
  background: #eff6ff;
  border: 1px solid #bfdbfe;
  color: #1e40af;
}

.policy-card {
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 14px;
  padding: 16px 20px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.03);
}

.policy-card-head {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 12px;
}

.policy-step-num {
  width: 26px;
  height: 26px;
  border-radius: 8px;
  background: #ecfdf5;
  color: #059669;
  font-weight: 800;
  font-size: 0.75rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid #a7f3d0;
}

.policy-card-head h4 {
  margin: 0;
  font-size: 0.96rem;
  font-weight: 700;
  color: #1e293b;
}

.policy-p {
  margin: 0 0 10px 0;
  font-size: 0.88rem;
  color: #475569;
  line-height: 1.55;
}

.policy-check-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.policy-check-list li {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  font-size: 0.86rem;
  line-height: 1.5;
  color: #334155;
}

.policy-check-list .check-ico {
  flex-shrink: 0;
  margin-top: 3px;
  color: #059669;
}

.warranty-options-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  margin-top: 10px;
}

.warranty-option-card {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 14px;
  transition: border-color 0.2s;
}

.warranty-option-card:hover {
  border-color: #34d399;
}

.warranty-option-card .option-badge {
  display: inline-block;
  font-size: 0.7rem;
  font-weight: 800;
  padding: 2px 8px;
  border-radius: 6px;
  background: #ecfdf5;
  color: #047857;
  border: 1px solid #a7f3d0;
  margin-bottom: 8px;
}

.warranty-option-card h5 {
  margin: 0 0 6px 0;
  font-size: 0.92rem;
  font-weight: 700;
  color: #065f46;
}

.warranty-option-card p {
  margin: 0;
  font-size: 0.82rem;
  color: #64748b;
  line-height: 1.45;
}

.policy-modal-footer {
  padding: 16px 24px;
  background: #ffffff;
  border-top: 1px solid #e2e8f0;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.policy-footer-badge {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.8rem;
  color: #64748b;
  font-weight: 500;
}

.policy-btn-confirm {
  background: linear-gradient(135deg, #059669 0%, #047857 100%);
  color: #ffffff;
  border: none;
  border-radius: 10px;
  padding: 10px 24px;
  font-weight: 700;
  font-size: 0.88rem;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(5, 150, 105, 0.3);
  transition: all 0.2s;
}

.policy-btn-confirm:hover {
  transform: translateY(-1px);
  box-shadow: 0 6px 16px rgba(5, 150, 105, 0.4);
}

@media (max-width: 640px) {
  .warranty-options-grid {
    grid-template-columns: 1fr;
  }
  .policy-modal-footer {
    flex-direction: column;
    gap: 12px;
    align-items: stretch;
  }
  .policy-btn-confirm {
    width: 100%;
    text-align: center;
  }
}
"""

norm_css += policy_modal_styles

with open(path, "w", encoding="utf-8") as f:
    f.write(norm_css)

print("SUCCESS: Patched styles.css with modern PolicyModal and Climate Gauge styles!")
