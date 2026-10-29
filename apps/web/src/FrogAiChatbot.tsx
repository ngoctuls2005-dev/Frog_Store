import React, { useState, useEffect, useRef } from 'react'
import {
  Bot,
  X,
  Send,
  Sparkles,
  ExternalLink,
  ChevronDown,
  Minimize2,
  Maximize2
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
  const [isMinimized, setIsMinimized] = useState(false)
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
  const chatPanelRef = useRef<HTMLDivElement>(null)
  const hasLoadedKnowledgeRef = useRef(false)

  // PERF-01: Lazy-load AI Knowledge Base only when chat is opened for the first time
  useEffect(() => {
    if (isOpen && !hasLoadedKnowledgeRef.current) {
      hasLoadedKnowledgeRef.current = true
      api.aiKnowledge()
        .then((res) => {
          if (res?.species) {
            setKnowledgeBase(res.species)
          }
        })
        .catch(() => {
          hasLoadedKnowledgeRef.current = false
        })
    }
  }, [isOpen])

  // Click outside to collapse chat and prevent blocking buttons/details
  useEffect(() => {
    if (!isOpen) return
    const handleClickOutside = (e: MouseEvent) => {
      if (chatPanelRef.current && !chatPanelRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isOpen])

  // Auto scroll to bottom of chat
  useEffect(() => {
    if (isOpen && !isMinimized) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages, isOpen, isTyping, isMinimized])

  const quickPrompts = [
    { label: '🐛 Pacman ăn gì & mấy ngày ăn?', query: 'Ếch Pacman ăn gì và mấy ngày cho ăn 1 lần?' },
    { label: '🌿 Bể nuôi ếch cây cần gì?', query: 'Chuồng nuôi ếch cây cần chuẩn bị những phụ kiện và vi khí hậu gì?' },
    { label: '🧪 Ếch phi tiêu có độc không?', query: 'Ếch phi tiêu độc nuôi cảnh có độc nguy hiểm không?' },
    { label: '👶 Loài nào dễ nuôi cho người mới?', query: 'Tôi là người mới tập nuôi thì nên chọn loài ếch nào dễ nhất?' },
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

    setTimeout(() => {
      const q = query.toLowerCase()
      let reply = ''
      let suggestedSlug: string | undefined
      let suggestedName: string | undefined

      if (q.includes('người mới') || q.includes('dễ nuôi') || q.includes('bắt đầu') || q.includes('tập nuôi')) {
        reply = `🔰 Với người mới bắt đầu (Beginner), Frog Store khuyên nuôi 2 dòng kinh điển sau:\n\n1. 🐸 **Ếch Pacman (Ceratophrys cranwelli):**\n• Cực kỳ dễ chăm, sống cạn, ăn khỏe cám viên hoặc dế/cá mồi.\n• Không cần chuồng lớn, chỉ cần hộp nhựa 30x20cm lót mút xốp hoặc mùn dừa ẩm.\n\n2. 🍃 **Ếch Cây Dumpy (Litoria caerulea):**\n• Tính tình hiền lành, dạn người, có thể leo cành quan sát sinh động.\n• Kháng bệnh rất cao, tuổi thọ lên tới 10-15 năm.`
        suggestedSlug = 'pacman-green'
        suggestedName = 'Ếch Pacman Xanh'
      } else if (q.includes('pacman') || q.includes('thức ăn pacman')) {
        reply = `🍽️ **Chế độ dinh dưỡng cho Ếch Pacman:**\n• Giai đoạn Baby (3-4cm): Cho ăn 2 ngày/lần. Khẩu phần: Cám Pacman ngâm nở vừa miệng, cá mồi nhỏ hoặc dế ngắt càng sau.\n• Giai đoạn Trưởng thành (>7cm): Cho ăn 4-5 ngày/lần. Thêm trạch nhỏ, gián Dubia, chuột pinky (1 lần/tháng).\n• ⚠️ Lưu ý: Bổ sung bột Canxi + D3 1 lần/tuần để tránh bệnh biến dạng xương MBD!`
        suggestedSlug = 'pacman-green'
        suggestedName = 'Ếch Pacman Xanh'
      } else if (q.includes('độc') || q.includes('phi tiêu') || q.includes('nguy hiểm') || q.includes('poison')) {
        reply = `🔬 **Về độc tố của Ếch Phi Tiêu Độc (Dendrobatidae):**\n• 100% ếch phi tiêu tại Frog Store là dòng **sinh sản nhân tạo (Captive-Bred)**, tuyệt đối **KHÔNG CÓ ĐỘC**!\n• Ngoài tự nhiên, chúng tích lũy độc qua việc ăn kiến rừng và bọ cánh cứng bản địa. Khi nuôi sinh sản ăn dế và ruồi giấm không cánh, tuyến độc hoàn toàn vô hại.\n• Tuy nhiên, vì da lưỡng cư rất mỏng manh, bạn nên rửa sạch tay trước và sau khi chăm sóc chuồng trại.`
        suggestedSlug = 'dart-azureus'
        suggestedName = 'Ếch Phi Tiêu Xanh Azureus'
      } else if (q.includes('cây') || q.includes('chuồng') || q.includes('bể') || q.includes('terrarium')) {
        reply = `🌿 **Setup chuồng nuôi ếch cây chuẩn Terrarium:**\n• Kiểu chuồng: Ưu tiên chiều cao (thể tích tối thiểu 45x45x60cm).\n• Phụ kiện: Cành lũa leo trèo, cây lá rộng (Trầu bà, Lan ý, Bromeliad).\n• Vi khí hậu: Nhiệt độ 24-27°C, độ ẩm 75-90%, xịt sương ẩm sáng tối.\n• Khay nước nông sạch đã khử clo để ếch ngâm mình ban đêm.`
        suggestedSlug = 'tree-red-eyed'
        suggestedName = 'Ếch Cây Mắt Đỏ'
      } else if (q.includes('rêu') || q.includes('việt nam')) {
        reply = `🌲 **Ếch Rêu Việt Nam (Theloderma corticale):**\n• Loài lưỡng cư bản địa quý hiếm của vùng núi cao Bắc Bộ.\n• Ngụy trang hoàn hảo như một tảng rêu đá ẩm ướt nguyên sinh.\n• Môi trường nuôi: Bán cạn (Paludarium) nước mát 20-24°C, dòng chảy nhẹ và nhiều hốc đá ẩn nấp.`
        suggestedSlug = 'vietnam-mossy'
        suggestedName = 'Ếch Rêu Việt Nam'
      } else if (q.includes('canxi') || q.includes('mbd') || q.includes('bệnh') || q.includes('sức khỏe')) {
        reply = `🩺 **Cẩm nang sức khỏe & Dinh dưỡng vi lượng:**\n• **Bệnh MBD (Mềm xương):** Do thiếu Canxi/D3 hoặc thiếu đèn UVB. Biểu hiện: hàm dưới xẹp, run chân. Cần bổ sung Canxi D3 phủ lên mồi 1-2 lần/tuần.\n• **Nhiễm trùng da (Red leg):** Do nước bẩn, chuồng ẩm mốc đọng amoniac. Cần thay nước định kỳ 2 ngày/lần bằng nước đã khử clo.\n• **Da thẩm thấu:** Tuyệt đối không chạm tay dính xà phòng hoặc muối mồ hôi trực tiếp vào da ếch.`
      } else {
        const matched = knowledgeBase.find((k) =>
          query.includes(k.name?.toLowerCase()) ||
          query.includes(k.species?.toLowerCase()) ||
          query.includes(k.genus?.toLowerCase())
        )
        if (matched) {
          reply = `📖 **Thông số sinh học loài ${matched.name}:**\n• Tên khoa học: *${matched.scientific_name}*\n• Môi trường sống: ${matched.natural_habitat || 'Nhiệt đới'}\n• Nhiệt độ thích hợp: ${matched.temp_day_min}°C - ${matched.temp_day_max}°C\n• Độ ẩm tối ưu: ${matched.humidity_min}% - ${matched.humidity_max}%\n• Dinh dưỡng chính: Côn trùng, sâu canxi, dế sạch.\n\nBạn có thể bấm vào liên kết bên dưới để xem hồ sơ và thước đo vi khí hậu chi tiết!`
          suggestedSlug = matched.slug
          suggestedName = matched.name
        } else {
          reply = `Cảm ơn câu hỏi của bạn! Frog Store cung cấp 26 loài ếch cảnh thuần dưỡng cùng cẩm nang chăm sóc khoa học. Bạn có thể hỏi mình về:\n• Hướng dẫn setup chuồng & độ ẩm\n• Lịch cho ăn & vi chất Canxi/D3\n• Loài phù hợp cho người mới bắt đầu\n• Hoặc chọn các câu hỏi gợi ý bên dưới nhé! 🐸`
        }
      }

      const botMsg: Message = {
        id: String(Date.now() + 1),
        sender: 'bot',
        text: reply,
        time: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
        suggestedSlug,
        suggestedName
      }

      setMessages((prev) => [...prev, botMsg])
      setIsTyping(false)
    }, 600)
  }

  return (
    <>
      {/* Floating Action Button (FAB) - Compact & Elegant */}
      {!isOpen && (
        <button
          className="frog-ai-fab"
          aria-label="Mở Trợ Lý Ếch AI tư vấn sinh học"
          onClick={() => {
            setIsOpen(true)
            setIsMinimized(false)
          }}
          title="Mở Trợ Lý Ếch AI tư vấn sinh học"
        >
          <Bot size={20} className="fab-bot-icon" />
          <span className="fab-label">Hỏi Trợ Lý Ếch AI</span>
          <span className="fab-online-dot"></span>
        </button>
      )}

      {/* Chat Window Panel */}
      {isOpen && (
        <div
          className={`frog-ai-chat-panel fade-in-up ${isMinimized ? 'chat-panel-minimized' : ''}`}
          ref={chatPanelRef}
        >
          {/* Header */}
          <div className="chat-panel-header">
            <div className="header-bot-info">
              <div className="bot-avatar-wrap">
                <Bot size={18} color="#059669" />
                <span className="bot-status-indicator"></span>
              </div>
              <div>
                <h4 className="bot-name">Trợ Lý Ếch AI</h4>
                <p className="bot-status-text">Online • 26 loài ếch cảnh</p>
              </div>
            </div>
            <div className="header-actions">
              <button
                type="button"
                className="btn-chat-icon"
                onClick={() => setIsMinimized(!isMinimized)}
                title={isMinimized ? 'Phóng to khung chat' : 'Thu nhỏ khung chat'}
                aria-label={isMinimized ? 'Phóng to' : 'Thu nhỏ'}
              >
                {isMinimized ? <Maximize2 size={15} /> : <Minimize2 size={15} />}
              </button>
              <button
                type="button"
                className="btn-chat-icon"
                onClick={() => setIsOpen(false)}
                title="Đóng chatbox"
                aria-label="Đóng"
              >
                <X size={16} />
              </button>
            </div>
          </div>

          {/* Collapsible Body */}
          {!isMinimized && (
            <>
              {/* Messages Body */}
              <div className="chat-messages-body">
                {messages.map((m) => (
                  <div
                    key={m.id}
                    className={`chat-bubble-row ${m.sender === 'user' ? 'user-row' : 'bot-row'}`}
                  >
                    {m.sender === 'bot' && (
                      <div className="bot-mini-avatar">
                        <Bot size={13} color="#059669" />
                      </div>
                    )}
                    <div className={`chat-bubble ${m.sender === 'user' ? 'user-bubble' : 'bot-bubble'}`}>
                      <p style={{ margin: 0, whiteSpace: 'pre-wrap' }}>{m.text}</p>
                      {m.suggestedSlug && onOpenProduct && (
                        <button
                          type="button"
                          className="btn-chat-product-link"
                          onClick={() => {
                            onOpenProduct(m.suggestedSlug!)
                            setIsOpen(false)
                          }}
                        >
                          <ExternalLink size={12} />
                          <span>Xem chi tiết {m.suggestedName || 'loài này'}</span>
                        </button>
                      )}
                      <span className="bubble-time">{m.time}</span>
                    </div>
                  </div>
                ))}

                {isTyping && (
                  <div className="chat-bubble-row bot-row">
                    <div className="bot-mini-avatar">
                      <Bot size={13} color="#059669" />
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

              {/* Quick Prompts Multi-line Chips (No overflow cutting) */}
              <div className="chat-quick-prompts">
                <div className="prompts-scroll-row">
                  {quickPrompts.map((p, idx) => (
                    <button
                      key={idx}
                      type="button"
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
                  className="chat-text-input"
                  aria-label="Nhập câu hỏi tư vấn về ếch cảnh"
                />
                <button
                  type="submit"
                  className="btn-chat-send"
                  disabled={!inputText.trim() || isTyping}
                  title="Gửi câu hỏi"
                  aria-label="Gửi"
                >
                  <Send size={15} />
                </button>
              </form>
            </>
          )}
        </div>
      )}
    </>
  )
}
