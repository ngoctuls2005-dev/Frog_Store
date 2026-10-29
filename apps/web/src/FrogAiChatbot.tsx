import React, { useState, useEffect, useRef } from 'react'
import {
  Bot,
  X,
  Send,
  Sparkles,
  HelpCircle,
  ExternalLink,
  ChevronDown
} from 'lucide-react'
import { api } from './api'

interface Message {
  id: string
  sender: 'bot' | 'user'
  text: string
  time: string
  suggestedSlug?: string
  suggestedName?: string
}

interface FrogAiChatbotProps {
  currentProductSlug?: string | null
  onOpenProduct?: (slug: string) => void
  hidden?: boolean
}

export const FrogAiChatbot: React.FC<FrogAiChatbotProps> = ({
  currentProductSlug,
  onOpenProduct,
  hidden
}) => {
  if (hidden) return null
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      sender: 'bot',
      text: 'Xin chào! 🐸 Mình là Trợ Lý Ếch AI của Frog Store. Mình nắm vững tập tính, vi khí hậu, chế độ dinh dưỡng và bệnh học của 26 loài ếch cảnh sống. Bạn cần tư vấn điều gì hôm nay?',
      time: 'Vừa xong'
    }
  ])
  const [inputText, setInputText] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [knowledgeBase, setKnowledgeBase] = useState<any[]>([])
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Fetch AI Knowledge Base once on mount
  useEffect(() => {
    api.aiKnowledge()
      .then((res) => {
        if (res?.species) {
          setKnowledgeBase(res.species)
        }
      })
      .catch(() => {})
  }, [])

  // Auto scroll to bottom of chat
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages, isOpen, isTyping])

  const quickPrompts = [
    { label: '🐛 Pacman ăn gì & mấy ngày ăn?', query: 'Ếch Pacman ăn gì và mấy ngày cho ăn 1 lần?' },
    { label: '🌱 Người mới nên nuôi loài nào?', query: 'Tôi là người mới bắt đầu, nên chọn loài ếch nào dễ nuôi nhất?' },
    { label: '🧪 Ếch phi tiêu có độc không?', query: 'Ếch phi tiêu nuôi cảnh có độc nguy hiểm không?' },
    { label: '🌿 Bể nuôi ếch cây cần gì?', query: 'Chuồng nuôi ếch cây cần chuẩn bị những phụ kiện và vi khí hậu gì?' }
  ]

  const handleSend = (textToSend?: string) => {
    const query = (textToSend || inputText).trim()
    if (!query) return

    const userMsg: Message = {
      id: String(Date.now()),
      sender: 'user',
      text: query,
      time: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
    }

    setMessages((prev) => [...prev, userMsg])
    if (!textToSend) setInputText('')
    setIsTyping(true)

    // AI Knowledge Retrieval Logic
    setTimeout(() => {
      const qLower = query.toLowerCase()
      let reply = ''
      let matchSlug: string | undefined
      let matchName: string | undefined

      if (qLower.includes('pacman') || qLower.includes('sừng')) {
        reply = '🐸 Về dòng Ếch Pacman (Ceratophrys cranwelli):\n' +
          '• Thức ăn: Cá trâm, cá chép mồi, dế mèn, gián Dubia, sâu canxi, cám Pac Attack.\n' +
          '• Lịch ăn: Ếch baby (3-5cm) ăn 2 ngày/lần (1-2 con dế); ếch lớn ăn 5-7 ngày/lần.\n' +
          '• Môi trường: Bể cạn lót mút xốp ngập 1/3 nước sạch hoặc dớn ẩm, nhiệt độ 24-28°C, độ ẩm 70-80%.\n' +
          '⚠️ LƯU Ý CỐT LÕI: Tuyệt đối nuôi riêng từng con vì chúng sẽ đớp nuốt đồng loại; không dùng sỏi dăm nhỏ lót nền.'
        matchSlug = 'pacman-green'
        matchName = 'Ếch Pacman Xanh'
      } else if (qLower.includes('mới') || qLower.includes('dễ') || qLower.includes('bắt đầu')) {
        reply = '🌱 Đối với người mới nuôi lần đầu, Frog Store khuyên bạn nên chọn 3 loài "trâu bò" và dễ chăm nhất:\n' +
          '1. Ếch Pacman (Green/Albino): Háu ăn, ngồi một chỗ, hộp nuôi nhỏ gọn tiết kiệm diện tích.\n' +
          '2. Ếch Cây Lùn Úc (White\'s Tree / Dumpy): Cực kỳ dạn dĩ, có thể ngồi chơi ngoan trên tay, ăn khỏe.\n' +
          '3. Cóc Tía Rừng Bụng Đỏ: Thích bơi lội, thích nghi khí hậu Việt Nam cực tốt, nuôi được theo bầy đàn đông vui.'
        matchSlug = 'tree-whites-dumpy'
        matchName = 'Ếch Cây Lùn Úc (Dumpy)'
      } else if (qLower.includes('phi tiêu') || qLower.includes('độc') || qLower.includes('nguy hiểm')) {
        reply = '💎 Về Độc Tính Sinh Học & Pháp Lý Ếch Phi Tiêu (Dendrobatidae / Phyllobates):\n' +
          '• Cơ chế độc tính: Theo nghiên cứu sinh học lưỡng cư (L.A. Zoo), ếch phi tiêu ngoài tự nhiên tích tụ độc tố alkaloid qua khẩu phần kiến rừng và bọ cánh cứng bản địa. Khi nuôi sinh sản nhân tạo (Captive-Bred - CB), do thức ăn chỉ là ruồi giấm nuôi và dế mèn không chứa alkaloid, cá thể không tự tổng hợp được độc tố.\n' +
          '• Nguồn gốc & CITES: Các loài thuộc chi Dendrobates, Phyllobates được kiểm soát theo CITES Phụ lục II. 100% cá thể tại Frog Store có nguồn gốc trại nuôi nhân tạo CB hợp pháp, có giấy tờ kiểm dịch và tuân thủ quy định pháp luật.\n' +
          '• An toàn tiếp xúc: Dù lượng độc tố được triệt tiêu ở môi trường nuôi nhốt, bạn vẫn cần đeo găng hoặc rửa tay sạch trước và sau khi chăm sóc, tránh chạm vào niêm mạc mắt/miệng để bảo vệ cả bản thân lẫn màng da thẩm thấu của ếch.'
        matchSlug = 'dart-azureus'
        matchName = 'Ếch Phi Tiêu Xanh Azureus'
      } else if (qLower.includes('cây') || qLower.includes('leo') || qLower.includes('mắt đỏ')) {
        reply = '🌿 Chuồng nuôi Ếch Cây (Red-Eyed, Dumpy, Snowflake, Amazon Milk):\n' +
          '• Kiểu bể: Bắt buộc bể đứng (chiều cao tối thiểu 45-60cm), có nhiều cành lũa và cây lá bản rộng để bám ngủ.\n' +
          '• Vi khí hậu: Nhiệt độ 24-27°C, độ ẩm 75-90%, xịt sương ẩm sáng tối.\n' +
          '• Ánh sáng: Đèn UVB 2.0 nhẹ nhàng giúp tổng hợp canxi D3 và giữ màu da tươi sáng.'
        matchSlug = 'tree-red-eyed'
        matchName = 'Ếch Cây Mắt Đỏ'
      } else if (qLower.includes('rêu') || qLower.includes('việt nam') || qLower.includes('tam đảo')) {
        reply = '✨ Ếch Rêu Việt Nam (Theloderma corticale) - Báu vật lưỡng cư Tam Đảo:\n' +
          '• Ngụy trang hoàn hảo như một tảng rêu đá ẩm ướt nguyên sinh.\n' +
          '• Yêu cầu: Bể bán cạn (Paludarium) có nước mát (20-25°C), không để nước quá 26°C vào mùa hè.\n' +
          '• Thức ăn: Dế nhỏ, sâu canxi, gián red runner vào ban đêm.'
        matchSlug = 'mossy-vietnamese'
        matchName = 'Ếch Rêu Việt Nam'
      } else if (qLower.includes('canxi') || qLower.includes('mbd') || qLower.includes('bệnh') || qLower.includes('sức khỏe')) {
        reply = '🩺 Cẩm nang sức khỏe & Dinh dưỡng vi lượng:\n' +
          '• Bệnh mềm xương MBD: Do thiếu Canxi và Vitamin D3. Khắc phục bằng cách rắc bột Canxi + D3 lên mồi sống 1-2 lần/tuần.\n' +
          '• Tắc ruột (Impaction): Cấm tuyệt đối lót sỏi dăm nhỏ hoặc cát hạt thô.\n' +
          '• Da thẩm thấu: Cấm chạm tay trần dính xà phòng hoặc muối mồ hôi vào da ếch.'
      } else {
        // Search knowledgeBase
        const found = knowledgeBase.find((k) =>
          k.name.toLowerCase().includes(qLower) ||
          k.scientific_name.toLowerCase().includes(qLower) ||
          k.family.toLowerCase().includes(qLower)
        )
        if (found) {
          reply = `🐸 Thông tin sinh học về ${found.name} (${found.scientific_name}):\n` +
            `• Phân loại: Họ ${found.family} | Xuất xứ: ${found.origin_region}\n` +
            `• Môi trường: ${found.habitat_type} | Mức độ nuôi: ${found.difficulty}\n` +
            `• Giá thị trường: ${new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(found.price)}\n` +
            `Bạn có thể bấm vào liên kết bên dưới để xem chi tiết cẩm nang chuồng nuôi!`
          matchSlug = found.slug
          matchName = found.name
        } else {
          reply = 'Cảm ơn câu hỏi của bạn! Frog Store cung cấp 26 loài ếch cảnh sống thuần chủng, bảo hành sống 100% khi nhận hàng. Nếu bạn cần hỏi về cách phối trộn thức ăn, kỹ thuật setup bể hoặc hỗ trợ bệnh học khẩn cấp, đừng ngần ngại gọi Hotline / Zalo: 0988.123.456 để được chuyên gia hỗ trợ ngay nhé!'
        }
      }

      const botMsg: Message = {
        id: String(Date.now() + 1),
        sender: 'bot',
        text: reply,
        time: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
        suggestedSlug: matchSlug,
        suggestedName: matchName
      }

      setMessages((prev) => [...prev, botMsg])
      setIsTyping(false)
    }, 600)
  }

  return (
    <>
      {/* Floating Action Button (FAB) */}
      {!isOpen && (
        <button
          className="frog-ai-fab" aria-label="Mở Trợ Lý Ếch AI tư vấn sinh học"
          onClick={() => setIsOpen(true)}
          title="Mở Trợ Lý Ếch AI tư vấn sinh học"
        >
          <div className="fab-pulse-ring"></div>
          <Bot size={22} className="fab-bot-icon" />
          <span className="fab-label">Hỏi Trợ Lý Ếch AI</span>
          <span className="fab-online-dot"></span>
        </button>
      )}

      {/* Chat Window Panel */}
      {isOpen && (
        <div className="frog-ai-chat-panel fade-in-up">
          {/* Header */}
          <div className="chat-panel-header">
            <div className="header-bot-info">
              <div className="bot-avatar-wrap">
                <Bot size={20} color="#059669" />
                <span className="bot-status-indicator"></span>
              </div>
              <div>
                <h4 className="bot-name">Trợ Lý Ếch AI</h4>
                <p className="bot-status-text">Online • Bách khoa 26 loài ếch</p>
              </div>
            </div>
            <div className="header-actions">
              <button
                className="btn-chat-icon"
                onClick={() => setIsOpen(false)}
                title="Thu nhỏ chatbox"
              >
                <ChevronDown size={18} />
              </button>
              <button
                className="btn-chat-icon"
                onClick={() => setIsOpen(false)}
                title="Đóng chatbox"
              >
                <X size={18} />
              </button>
            </div>
          </div>

          {/* Messages Body */}
          <div className="chat-messages-body">
            {messages.map((m) => (
              <div
                key={m.id}
                className={`chat-bubble-row ${m.sender === 'user' ? 'user-row' : 'bot-row'}`}
              >
                {m.sender === 'bot' && (
                  <div className="bot-mini-avatar">
                    <Bot size={14} color="#059669" />
                  </div>
                )}
                <div className={`chat-bubble ${m.sender === 'user' ? 'user-bubble' : 'bot-bubble'}`}>
                  <p style={{ margin: 0, whiteSpace: 'pre-wrap' }}>{m.text}</p>
                  {m.suggestedSlug && onOpenProduct && (
                    <button
                      className="btn-chat-product-link"
                      onClick={() => {
                        onOpenProduct(m.suggestedSlug!)
                      }}
                    >
                      <ExternalLink size={13} />
                      <span>Xem hồ sơ {m.suggestedName || 'loài ếch này'}</span>
                    </button>
                  )}
                  <span className="bubble-time">{m.time}</span>
                </div>
              </div>
            ))}

            {isTyping && (
              <div className="chat-bubble-row bot-row">
                <div className="bot-mini-avatar">
                  <Bot size={14} color="#059669" />
                </div>
                <div className="chat-bubble bot-bubble typing-bubble">
                  <span className="typing-dot"></span>
                  <span className="typing-dot"></span>
                  <span className="typing-dot"></span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Prompts Carousel */}
          <div className="chat-quick-prompts">
            <div className="prompts-scroll-row">
              {quickPrompts.map((p, idx) => (
                <button
                  key={idx}
                  className="quick-prompt-chip"
                  onClick={() => handleSend(p.query)}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* Input Footer */}
          <form
            className="chat-input-bar"
            onSubmit={(e) => {
              e.preventDefault()
              handleSend()
            }}
          >
            <input
              type="text"
              placeholder="Hỏi về thức ăn, nhiệt độ, cách nuôi..."
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              className="chat-text-input" aria-label="Nhập câu hỏi tư vấn về ếch cảnh"
            />
            <button
              type="submit"
              className="btn-chat-send"
              disabled={!inputText.trim() || isTyping}
              title="Gửi câu hỏi"
            >
              <Send size={16} />
            </button>
          </form>
        </div>
      )}
    </>
  )
}

