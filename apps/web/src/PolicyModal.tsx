import React from 'react'
import {
  ShieldCheck,
  Truck,
  FileText,
  X,
  Lock,
  CheckCircle2,
  AlertTriangle,
  HeartHandshake,
  Clock,
  Sparkles,
  ExternalLink
} from 'lucide-react'

export type PolicyType = 'privacy' | 'warranty' | 'terms'

interface PolicyModalProps {
  isOpen: boolean
  activePolicy: PolicyType
  onClose: () => void
  onSelectPolicy: (policy: PolicyType) => void
}

export const PolicyModal: React.FC<PolicyModalProps> = ({
  isOpen,
  activePolicy,
  onClose,
  onSelectPolicy,
}) => {
  if (!isOpen) return null

  return (
    <div className="modal-overlay policy-modal-overlay" onClick={onClose} style={{ zIndex: 10001 }}>
      <div
        className="modal-card policy-modal-card"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modern Header Banner */}
        <div className="policy-modal-header">
          <div className="policy-header-left">
            <div className="policy-icon-badge">
              {activePolicy === 'privacy' && <Lock size={22} color="#059669" />}
              {activePolicy === 'warranty' && <ShieldCheck size={22} color="#059669" />}
              {activePolicy === 'terms' && <FileText size={22} color="#059669" />}
            </div>
            <div>
              <h2 className="policy-modal-title">
                {activePolicy === 'privacy' && 'Chính Sách Quyền Riêng Tư & Bảo Mật Dữ Liệu'}
                {activePolicy === 'warranty' && 'Chính Sách Vận Chuyển & Bảo Hành Sống 100%'}
                {activePolicy === 'terms' && 'Điều Khoản Dịch Vụ & Pháp Lý Vật Nuôi (CITES)'}
              </h2>
              <p className="policy-modal-subtitle">
                Cam kết minh bạch thông tin &amp; bảo trợ toàn diện từ Frog Store Việt Nam
              </p>
            </div>
          </div>
          <button className="policy-close-btn" onClick={onClose} aria-label="Đóng cửa sổ chính sách" title="Đóng">
            <X size={20} />
          </button>
        </div>

        {/* Segmented Pill Tabs Navigation */}
        <div className="policy-tab-bar">
          <button
            type="button"
            className={`policy-tab-item ${activePolicy === 'privacy' ? 'active' : ''}`}
            onClick={() => onSelectPolicy('privacy')}
          >
            <Lock size={15} />
            <span>Quyền Riêng Tư</span>
          </button>
          <button
            type="button"
            className={`policy-tab-item ${activePolicy === 'warranty' ? 'active' : ''}`}
            onClick={() => onSelectPolicy('warranty')}
          >
            <Truck size={15} />
            <span>Vận Chuyển &amp; Bảo Hành</span>
          </button>
          <button
            type="button"
            className={`policy-tab-item ${activePolicy === 'terms' ? 'active' : ''}`}
            onClick={() => onSelectPolicy('terms')}
          >
            <FileText size={15} />
            <span>Điều Khoản &amp; CITES</span>
          </button>
        </div>

        {/* Scrollable Content Body with Structured Cards */}
        <div className="policy-scroll-body">
          {/* TAB 1: PRIVACY POLICY */}
          {activePolicy === 'privacy' && (
            <div className="policy-content-stack">
              <div className="policy-callout-box emerald-box">
                <ShieldCheck size={20} className="callout-icon" />
                <div>
                  <strong>Cam kết bảo mật tuyệt đối:</strong> Frog Store không bán, trao đổi hoặc thương mại hóa thông tin khách hàng cho bất kỳ bên thứ ba quảng cáo nào. Dữ liệu được mã hóa đa tầng trên Cloudflare D1/KV.
                </div>
              </div>

              <div className="policy-card">
                <div className="policy-card-head">
                  <span className="policy-step-num">01</span>
                  <h4>Dữ liệu cá nhân chúng tôi thu thập</h4>
                </div>
                <div className="policy-card-content">
                  <p className="policy-p">Để xử lý đơn hàng thú cưng sống và kích hoạt chế độ bảo hành chuyên biệt, chúng tôi thu thập:</p>
                  <ul className="policy-check-list">
                    <li>
                      <CheckCircle2 size={16} className="check-ico" />
                      <span><strong>Họ tên &amp; Số điện thoại:</strong> Dùng để liên hệ xác nhận đơn và điều phối shipper giao thùng xốp giữ ẩm hỏa tốc.</span>
                    </li>
                    <li>
                      <CheckCircle2 size={16} className="check-ico" />
                      <span><strong>Địa chỉ nhận hàng &amp; Tỉnh/Thành:</strong> Dùng định tuyến quãng đường vận chuyển nhanh nhất tránh làm sốc nhiệt thú cưng.</span>
                    </li>
                    <li>
                      <CheckCircle2 size={16} className="check-ico" />
                      <span><strong>Tọa độ GPS (Vĩ độ / Kinh độ):</strong> Chỉ lưu khi quý khách <em>chủ động nhấn nút quét GPS</em> trong trang thanh toán; không theo dõi ngầm.</span>
                    </li>
                    <li>
                      <CheckCircle2 size={16} className="check-ico" />
                      <span><strong>Mật khẩu tài khoản:</strong> Băm một chiều bằng PBKDF2-SHA256 (100,000 vòng lặp) kèm muối 16-byte an toàn tuyệt đối.</span>
                    </li>
                  </ul>
                </div>
              </div>

              <div className="policy-card">
                <div className="policy-card-head">
                  <span className="policy-step-num">02</span>
                  <h4>Mục đích sử dụng dữ liệu</h4>
                </div>
                <div className="policy-card-content">
                  <ul className="policy-check-list">
                    <li>
                      <CheckCircle2 size={16} className="check-ico" />
                      <span>Xử lý giỏ hàng, đóng gói hộp xốp và lập phiếu giao nhận hỏa tốc chuyên tuyến.</span>
                    </li>
                    <li>
                      <CheckCircle2 size={16} className="check-ico" />
                      <span>Kích hoạt gói <strong>Bảo Hành Sống 100%</strong> và liên kết lịch sử tiêm phòng / theo dõi sức khỏe vật nuôi.</span>
                    </li>
                    <li>
                      <CheckCircle2 size={16} className="check-ico" />
                      <span>Hỗ trợ tư vấn kỹ thuật nuôi trọn đời qua Trợ Lý AI và đội ngũ chuyên gia Frog Store.</span>
                    </li>
                  </ul>
                </div>
              </div>

              <div className="policy-card">
                <div className="policy-card-head">
                  <span className="policy-step-num">03</span>
                  <h4>Thời hạn lưu trữ &amp; Quyền riêng tư của bạn</h4>
                </div>
                <div className="policy-card-content">
                  <p className="policy-p">
                    Quý khách có toàn quyền xem, chỉnh sửa thông tin trong mục <strong>Hồ Sơ Cá Nhân</strong> hoặc yêu cầu xóa toàn bộ dữ liệu tài khoản bất kỳ lúc nào qua Hotline kỹ thuật: <strong>0988.123.456</strong>.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: SHIPPING & 100% LIVE ARRIVAL WARRANTY */}
          {activePolicy === 'warranty' && (
            <div className="policy-content-stack">
              <div className="policy-callout-box amber-box">
                <AlertTriangle size={20} className="callout-icon" />
                <div>
                  <strong>Quy định kích hoạt bảo hành sống:</strong> Quý khách vui lòng quay video mở thùng (Unboxing) liền mạch từ lúc còn nguyên tem niêm phong và thông báo trong vòng <strong>30 phút</strong> kể từ khi nhận hàng.
                </div>
              </div>

              <div className="policy-card">
                <div className="policy-card-head">
                  <span className="policy-step-num">01</span>
                  <h4>Quy chuẩn đóng thùng giữ ẩm chuyên dụng</h4>
                </div>
                <div className="policy-card-content">
                  <p className="policy-p">Để bảo đảm 100% các bé ếch đến nơi khỏe mạnh, Frog Store áp dụng quy trình đóng gói tiêu chuẩn quốc tế:</p>
                  <ul className="policy-check-list">
                    <li>
                      <CheckCircle2 size={16} className="check-ico" />
                      <span>Ếch được dưỡng khỏe, nhịn ăn 24 giờ trước khi giao để đường tiêu hóa sạch sẽ, không say xe.</span>
                    </li>
                    <li>
                      <CheckCircle2 size={16} className="check-ico" />
                      <span>Hộp nhựa đục lỗ thoáng khí vi điểm, lót mút xốp ngậm nước sạch hoặc dớn rêu tiệt trùng giữ ẩm cao.</span>
                    </li>
                    <li>
                      <CheckCircle2 size={16} className="check-ico" />
                      <span>Thùng xốp dày cách nhiệt, dán tem cảnh báo <em>"Động Vật Sống - Xin Nhẹ Tay"</em>. Mùa hè kèm gel đá khô sinh học; mùa đông kèm túi sưởi ấm chuyên dụng.</span>
                    </li>
                  </ul>
                </div>
              </div>

              <div className="policy-card">
                <div className="policy-card-head">
                  <span className="policy-step-num">02</span>
                  <h4>Điều kiện bảo hành sống 100%</h4>
                </div>
                <div className="policy-card-content">
                  <ul className="policy-check-list">
                    <li>
                      <CheckCircle2 size={16} className="check-ico" />
                      <span>Khách hàng nhận hàng đúng giờ hẹn với shipper (không hoãn lịch giao hàng sống quá 2 giờ).</span>
                    </li>
                    <li>
                      <CheckCircle2 size={16} className="check-ico" />
                      <span><strong>Quay video unboxing:</strong> Video rõ nét, liền mạch, không cắt ghép từ lúc thùng còn nguyên băng dính niêm phong.</span>
                    </li>
                    <li>
                      <CheckCircle2 size={16} className="check-ico" />
                      <span>Gửi video qua Zalo Hotline <strong>0988.123.456</strong> trong vòng 30 phút sau khi ký nhận.</span>
                    </li>
                  </ul>
                </div>
              </div>

              <div className="policy-card">
                <div className="policy-card-head">
                  <span className="policy-step-num">03</span>
                  <h4>Chính sách giải quyết rủi ro</h4>
                </div>
                <div className="policy-card-content">
                  <p className="policy-p">Nếu không may cá thể bị sốc nhiệt hoặc tử vong trong quá trình vận chuyển, quý khách được chọn 1 trong 2 phương án ngay lập tức:</p>
                  <div className="warranty-options-grid">
                    <div className="warranty-option-card">
                      <div className="option-badge">Lựa chọn 1</div>
                      <h5>Gửi Bù Bé Mới Miễn Phí</h5>
                      <p>Shop gửi ngay 1 cá thể cùng loại tuyển chọn, miễn phí 100% cước xe hỏa tốc lần 2.</p>
                    </div>
                    <div className="warranty-option-card">
                      <div className="option-badge">Lựa chọn 2</div>
                      <h5>Hoàn Tiền 100%</h5>
                      <p>Hoàn trả 100% số tiền đơn hàng qua chuyển khoản ngân hàng ngay trong 2 giờ làm việc.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: TERMS & CITES COMPLIANCE */}
          {activePolicy === 'terms' && (
            <div className="policy-content-stack">
              <div className="policy-callout-box blue-box">
                <FileText size={20} className="callout-icon" />
                <div>
                  <strong>Tuân thủ Công ước CITES Phụ lục II:</strong> 100% cá thể tại Frog Store thuộc dòng sinh sản nhân tạo (Captive-Bred - CB), có giấy chứng nhận nguồn gốc và xuất hóa đơn vật nuôi cảnh hợp pháp.
                </div>
              </div>

              <div className="policy-card">
                <div className="policy-card-head">
                  <span className="policy-step-num">01</span>
                  <h4>Nguồn gốc sinh sản nhân tạo (Captive-Bred - CB)</h4>
                </div>
                <div className="policy-card-content">
                  <p className="policy-p">
                    Frog Store cam kết tuyệt đối <strong>nói không với việc săn bắt, khai thác trái phép động vật hoang dã tự nhiên (Wild-Caught)</strong>.
                  </p>
                  <ul className="policy-check-list">
                    <li>
                      <CheckCircle2 size={16} className="check-ico" />
                      <span>100% ếch cảnh là dòng F nhân giống trong môi trường nuôi nhốt kiểm soát từ các trại lưỡng cư uy tín.</span>
                    </li>
                    <li>
                      <CheckCircle2 size={16} className="check-ico" />
                      <span>Đã thuần hóa quen ăn thức ăn nhân tạo: cám viên dinh dưỡng, dế nuôi sinh học, ruồi giấm không cánh, gián Dubia.</span>
                    </li>
                  </ul>
                </div>
              </div>

              <div className="policy-card">
                <div className="policy-card-head">
                  <span className="policy-step-num">02</span>
                  <h4>Cơ sở khoa học về độc tố &amp; An toàn sinh học (L.A. Zoo)</h4>
                </div>
                <div className="policy-card-content">
                  <ul className="policy-check-list">
                    <li>
                      <CheckCircle2 size={16} className="check-ico" />
                      <span>
                        <strong>Cơ chế độc tố:</strong> Theo Hiệp hội Vườn thú &amp; Thủy cung Los Angeles (L.A. Zoo), ếch phi tiêu ngoài tự nhiên tích lũy alkaloid qua nguồn mồi kiến rừng bản địa. Khi nuôi sinh sản nhân tạo ăn mồi nuôi thiếu hụt alkaloid, cá thể <strong>không tự tổng hợp được độc tố</strong>.
                      </span>
                    </li>
                    <li>
                      <CheckCircle2 size={16} className="check-ico" />
                      <span>
                        <strong>Tiếp xúc an toàn:</strong> Dù không có độc, người nuôi vẫn cần đeo găng tay hoặc rửa tay sạch bằng nước không chứa clo trước và sau khi chạm chuồng nuôi để bảo vệ màng da thẩm thấu mỏng manh của ếch.
                      </span>
                    </li>
                  </ul>
                </div>
              </div>

              <div className="policy-card">
                <div className="policy-card-head">
                  <span className="policy-step-num">03</span>
                  <h4>Phạm vi phân phối &amp; Pháp lý nội địa</h4>
                </div>
                <div className="policy-card-content">
                  <p className="policy-p">
                    Vật nuôi cảnh được phân phối toàn quốc phục vụ đam mê Terrarium sinh thái, bán cạn và nghiên cứu giáo dục khoa học lưỡng cư học, tuân thủ đầy đủ quy định kiểm dịch thú y Việt Nam.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Polished Bottom Bar */}
        <div className="policy-modal-footer">
          <div className="policy-footer-badge">
            <ShieldCheck size={16} color="#059669" />
            <span>Bảo chứng bởi Frog Store Việt Nam • Hotline: 0988.123.456</span>
          </div>
          <button className="policy-btn-confirm" onClick={onClose}>
            Đã Hiểu &amp; Đóng
          </button>
        </div>
      </div>
    </div>
  )
}
