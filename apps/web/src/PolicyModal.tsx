import React from 'react'
import { ShieldCheck, Truck, FileText, X, Lock, CheckCircle2 } from 'lucide-react'

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
    <div className="modal-overlay" onClick={onClose} style={{ zIndex: 10001 }}>
      <div
        className="modal-card"
        style={{ maxWidth: 680, maxHeight: '85vh', display: 'flex', flexDirection: 'column' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {activePolicy === 'privacy' && <Lock size={22} color="#059669" />}
            {activePolicy === 'warranty' && <ShieldCheck size={22} color="#059669" />}
            {activePolicy === 'terms' && <FileText size={22} color="#059669" />}
            <h2 style={{ margin: 0, fontSize: '1.25rem', color: '#1e293b' }}>
              {activePolicy === 'privacy' && 'Chính Sách Quyền Riêng Tư & Bảo Mật Dữ Liệu'}
              {activePolicy === 'warranty' && 'Chính Sách Vận Chuyển & Bảo Hành Sống 100%'}
              {activePolicy === 'terms' && 'Điều Khoản Dịch Vụ & Pháp Lý Vật Nuôi'}
            </h2>
          </div>
          <button className="modal-close" style={{ position: 'static' }} onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        {/* Policy Navigation Tabs */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 16, borderBottom: '1px solid #e2e8f0', paddingBottom: 8 }}>
          <button
            type="button"
            className={`tab-btn ${activePolicy === 'privacy' ? 'active' : ''}`}
            onClick={() => onSelectPolicy('privacy')}
            style={{ fontSize: '0.82rem', padding: '6px 14px' }}
          >
            🔒 Quyền Riêng Tư
          </button>
          <button
            type="button"
            className={`tab-btn ${activePolicy === 'warranty' ? 'active' : ''}`}
            onClick={() => onSelectPolicy('warranty')}
            style={{ fontSize: '0.82rem', padding: '6px 14px' }}
          >
            📦 Vận Chuyển &amp; Bảo Hành
          </button>
          <button
            type="button"
            className={`tab-btn ${activePolicy === 'terms' ? 'active' : ''}`}
            onClick={() => onSelectPolicy('terms')}
            style={{ fontSize: '0.82rem', padding: '6px 14px' }}
          >
            ⚖️ Điều Khoản &amp; CITES
          </button>
        </div>

        {/* Content Body */}
        <div style={{ flex: 1, overflowY: 'auto', paddingRight: 6, fontSize: '0.88rem', lineHeight: 1.6, color: '#334155' }}>
          {activePolicy === 'privacy' && (
            <div>
              <h4 style={{ color: '#047857', marginTop: 0 }}>1. Dữ liệu cá nhân chúng tôi thu thập</h4>
              <p>
                Để phục vụ việc tư vấn, vận chuyển cá thể sống giữ nhiệt và thực hiện bảo hành, Frog Store thu thập:
              </p>
              <ul>
                <li><strong>Họ tên và số điện thoại</strong>: Dùng để liên hệ xác nhận đơn hàng và điều phối người giao hàng hỏa tốc.</li>
                <li><strong>Địa chỉ nhận hàng và thành phố</strong>: Dùng để định tuyến vận chuyển thùng xốp giữ ẩm.</li>
                <li><strong>Tọa độ GPS (Vĩ độ / Kinh độ)</strong>: Chỉ thu thập khi quý khách <em>chủ động</em> nhấn nút "Quét Vị Trí Của Tôi" trong form thanh toán; không tự ý theo dõi vị trí ngầm.</li>
                <li><strong>Email và mật khẩu</strong>: Mật khẩu được băm một chiều an toàn bằng PBKDF2-SHA256 (100,000 vòng) và muối bảo mật 16 bytes; không ai có thể giải mã ngược.</li>
              </ul>

              <h4 style={{ color: '#047857' }}>2. Mục đích sử dụng dữ liệu</h4>
              <ul>
                <li>Xử lý giỏ hàng, lập phiếu giao hàng hỏa tốc thú cưng sống.</li>
                <li>Kích hoạt chính sách <strong>Bảo Hành Sống 100%</strong> khi nhận hàng.</li>
                <li>Tra cứu tiến độ giao hàng và hỗ trợ kỹ thuật nuôi trọn đời.</li>
              </ul>

              <h4 style={{ color: '#047857' }}>3. Cam kết chia sẻ bên thứ ba</h4>
              <p>
                Frog Store <strong>tuyệt đối không bán, trao đổi hoặc chia sẻ thông tin cá nhân của bạn</strong> cho các mạng lưới quảng cáo hoặc đơn vị tiếp thị bên ngoài. Dữ liệu địa chỉ chỉ được gửi đến đơn vị vận chuyển đối tác để giao thùng xốp và hệ thống OpenStreetMap Nominatim nhằm xác định địa danh hành chính.
              </p>

              <h4 style={{ color: '#047857' }}>4. Thời hạn lưu trữ &amp; Quyền xóa dữ liệu</h4>
              <p>
                Thông tin được lưu trữ an toàn trên hạ tầng mã hóa Cloudflare D1/KV. Quý khách có quyền xem, chỉnh sửa thông tin trong phần Hồ sơ cá nhân hoặc yêu cầu xóa toàn bộ tài khoản bất cứ lúc nào qua Hotline: <strong>0988.123.456</strong>.
              </p>
            </div>
          )}

          {activePolicy === 'warranty' && (
            <div>
              <h4 style={{ color: '#047857', marginTop: 0 }}>1. Quy cách đóng gói chuyên dụng hàng sống</h4>
              <p>
                Mọi cá thể ếch cảnh trước khi gửi đều được kiểm tra sức khỏe, phản xạ đớp mồi và nhịn ăn 24h để đảm bảo đường tiêu hóa sạch sẽ:
              </p>
              <ul>
                <li>Đựng trong hộp nhựa thoáng khí có lót mút xốp ngậm nước hoặc dớn rêu tiệt trùng.</li>
                <li>Đóng hộp xốp cách nhiệt tiêu chuẩn, có dán băng dính cảnh báo <em>"Động Vật Sống - Xin Nhẹ Tay"</em>.</li>
                <li>Vào mùa hè bổ sung túi giữ lạnh sinh học (ice gel pack); mùa đông có túi sưởi ấm chuyên dụng.</li>
              </ul>

              <h4 style={{ color: '#047857' }}>2. Điều kiện áp dụng Bảo Hành Sống 100%</h4>
              <ul>
                <li>Khách hàng nhận hàng đúng giờ hẹn với shipper (không hoãn lịch giao hàng sống quá 2 giờ).</li>
                <li>
                  <strong>Bắt buộc quay video mở thùng (Unboxing)</strong>: Video quay liền mạch, không cắt ghép, từ lúc tem niêm phong còn nguyên đến khi kiểm tra tình trạng cá thể bên trong.
                </li>
                <li>Thông báo ngay cho Frog Store trong vòng <strong>30 phút</strong> kể từ khi ký nhận bưu kiện.</li>
              </ul>

              <h4 style={{ color: '#047857' }}>3. Chính sách giải quyết rủi ro</h4>
              <p>
                Trong trường hợp đáng tiếc cá thể bị sốc nhiệt hoặc tử vong trong quá trình vận chuyển:
              </p>
              <ul>
                <li><strong>Lựa chọn 1</strong>: Frog Store gửi bù ngay 1 cá thể cùng loại hoàn toàn miễn phí (bao gồm miễn phí cước vận chuyển lần 2).</li>
                <li><strong>Lựa chọn 2</strong>: Hoàn trả 100% số tiền đơn hàng qua chuyển khoản ngân hàng trong vòng 2 giờ làm việc.</li>
              </ul>
            </div>
          )}

          {activePolicy === 'terms' && (
            <div>
              <h4 style={{ color: '#047857', marginTop: 0 }}>1. Nguồn gốc sinh sản nhân tạo (Captive-Bred - CB)</h4>
              <p>
                Frog Store cam kết <strong>100% cá thể ếch cảnh cung cấp đều là dòng sinh sản nhân tạo (Captive-Bred - CB)</strong> qua nhiều thế hệ từ các trang trại lưỡng cư uy tín, được thuần hóa với môi trường nhân tạo và quen ăn mồi nhân tạo (cám cá hồi, dế nuôi, sâu canxi, gián Dubia).
              </p>
              <p>
                Chúng tôi tuyệt đối <strong>nói không với việc săn bắt, khai thác trái phép động vật hoang dã tự nhiên (Wild-Caught)</strong> nhằm bảo tồn hệ sinh thái nguyên sinh.
              </p>

              <h4 style={{ color: '#047857' }}>2. Tuân thủ Công ước CITES &amp; Quy định pháp luật</h4>
              <p>
                Đối với các chi thuộc danh mục kiểm soát theo Công ước CITES (như <em>Dendrobates</em>, <em>Phyllobates</em> - CITES Phụ lục II):
              </p>
              <ul>
                <li>Mọi mẫu vật nhập khẩu và nhân giống đều tuân thủ hệ thống kiểm soát nguồn gốc và giấy kiểm dịch thú y hợp lệ.</li>
                <li>Vật nuôi cảnh được phân phối nội địa phục vụ đam mê Terrarium sinh thái và giáo dục khoa học, không dùng vào mục đích khai thác trái phép.</li>
                <li>Phạm vi giao hàng: Toàn quốc qua xe khách chuyên tuyến hoặc chuyển phát nhanh hỏa tốc.</li>
              </ul>

              <h4 style={{ color: '#047857' }}>3. Khuyến nghị an toàn sinh học</h4>
              <p>
                Lưỡng cư có làn da thẩm thấu màng mỏng rất nhạy cảm. Người nuôi cần rửa tay sạch bằng nước không chứa clo hoặc xà phòng trước và sau khi chạm vào chuồng nuôi. Tránh chạm vào mắt, miệng hoặc vết thương hở sau khi chăm sóc bất kỳ loài vật nuôi nào.
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{ marginTop: 16, paddingTop: 12, borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'flex-end' }}>
          <button className="btn-detail" onClick={onClose} style={{ padding: '8px 20px' }}>
            Đã Hiểu &amp; Đóng
          </button>
        </div>
      </div>
    </div>
  )
}
