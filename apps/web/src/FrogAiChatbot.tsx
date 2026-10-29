import React, { useState, useEffect, useRef } from 'react'
import {
  Bot,
  X,
  Send,
  Sparkles,
  ExternalLink,
  ChevronDown,
  Minimize2,
  Maximize2,
  RotateCcw,
  Lightbulb,
  HelpCircle,
  MessageCircle
} from 'lucide-react'
import { api } from './api'

interface Message {
  id: string
  sender: 'bot' | 'user'
  text: string
  time: string
  suggestedSlug?: string
  suggestedName?: string
  isWelcome?: boolean
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
  const [isExpanded, setIsExpanded] = useState(false)
  const [showQuickTips, setShowQuickTips] = useState(false)

  const initialWelcomeMessage: Message = {
    id: 'welcome',
    sender: 'bot',
    text: `Xin chào! 🐸 Mình là **Trợ Lý Ếch AI** của Frog Store.\n\nMình nắm vững tập tính sinh học, dải vi khí hậu nhiệt-ẩm, dinh dưỡng và bệnh học của **26 loài ếch cảnh sống**.\n\nBạn có thể hỏi bất kỳ điều gì hoặc chọn các chủ đề nhanh bên dưới nhé:`,
    time: 'Vừa xong',
    isWelcome: true
  }

  const [messages, setMessages] = useState<Message[]>([initialWelcomeMessage])
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
        // If clicking outside, close or minimize to free up space
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isOpen])

  // ESC key to close chat
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen])

  // Auto scroll to bottom of chat
  useEffect(() => {
    if (isOpen && !isMinimized) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages, isOpen, isTyping, isMinimized])

  const quickPrompts = [
    { label: '👶 Loài nào dễ nuôi cho người mới?', query: 'Tôi là người mới bắt đầu chơi ếch cảnh thì nên nuôi loài nào dễ nhất?' },
    { label: '🐛 Pacman ăn gì & lịch cho ăn?', query: 'Ếch Pacman ăn gì và lịch cho ăn thế nào?' },
    { label: '🌿 Cách setup chuồng nuôi ếch cây?', query: 'Chuồng nuôi ếch cây cần phụ kiện và độ ẩm, nhiệt độ bao nhiêu?' },
    { label: '🧪 Ếch phi tiêu có độc nguy hiểm không?', query: 'Ếch phi tiêu độc nuôi cảnh có độc nguy hiểm không?' },
    { label: '🌲 Ếch Rêu Việt Nam cần môi trường gì?', query: 'Ếch Rêu Việt Nam Theloderma corticale cần môi trường sống thế nào?' },
    { label: '🩺 Bệnh MBD và cách bổ sung Canxi/D3?', query: 'Bệnh MBD ở ếch cảnh là gì và cách bổ sung Canxi D3?' }
  ]

  const handleResetChat = () => {
    setMessages([initialWelcomeMessage])
    setInputText('')
    setIsTyping(false)
    setShowQuickTips(false)
  }

  const handleSend = async (textToSend?: string) => {
    if (isTyping) return
    const query = (textToSend || inputText).trim()
    if (!query) return

    setShowQuickTips(false)

    const userMsg: Message = {
      id: String(Date.now()),
      sender: 'user',
      text: query,
      time: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
    }

    setMessages((prev) => [...prev, userMsg])
    if (!textToSend) setInputText('')
    setIsTyping(true)

    // Fallback local intelligence if stream takes time
    setTimeout(() => {
      const q = query.toLowerCase()
      let reply = ''
      let suggestedSlug: string | undefined
      let suggestedName: string | undefined

      if (q.includes('người mới') || q.includes('dễ nuôi') || q.includes('bắt đầu') || q.includes('tập nuôi')) {
        reply = `🔰 **Gợi ý cho người mới bắt đầu (Beginner):**\n\nFrog Store khuyên bạn nên chọn 2 dòng kinh điển, sức đề kháng vượt trội sau:\n\n1. 🐸 **Ếch Pacman (Ceratophrys cranwelli):**\n• Rất phàm ăn, sống cạn, ăn cám viên Pac Attack hoặc dế/cá mồi.\n• Chỉ cần hộp nhựa 30x20cm lót mút xốp hoặc mùn dừa ẩm 70-80%.\n\n2. 🍃 **Ếch Cây Dumpy (Litoria caerulea):**\n• Tính tình cực kỳ dạn người, hiền lành, leo cành ngộ nghĩnh.\n• Kháng bệnh rất cao, tuổi thọ lên tới 15-20 năm.`
        suggestedSlug = 'pacman-green'
        suggestedName = 'Ếch Pacman Xanh'
      } else if (q.includes('pacman') || q.includes('thức ăn')) {
        reply = `🍽️ **Chế độ dinh dưỡng khoa học cho Ếch Pacman:**\n\n• **Giai đoạn Baby (3-4cm):** Cho ăn 2 ngày/lần. Khẩu phần: Cám viên ngâm nước, cá mồi nhỏ hoặc dế ngắt càng sau.\n• **Giai đoạn Trưởng thành (>7cm):** Cho ăn 4-5 ngày/lần. Thêm trạch nhỏ, gián Dubia, sâu canxi.\n• ⚠️ **Lưu ý tối quan trọng:** Bổ sung bột Canxi + D3 1 lần/tuần để phòng bệnh mềm xương MBD!`
        suggestedSlug = 'pacman-green'
        suggestedName = 'Ếch Pacman Xanh'
      } else if (q.includes('độc') || q.includes('phi tiêu') || q.includes('nguy hiểm') || q.includes('poison')) {
        reply = `🔬 **Về độc tố của Ếch Phi Tiêu Độc (Dendrobatidae):**\n\n• **100% ếch phi tiêu tại Frog Store là dòng nhân giống nhân tạo (Captive-Bred - CB), TUYỆT ĐỐI KHÔNG CÓ ĐỘC!**\n• Ngoài tự nhiên, chúng tích lũy alkaloid qua nguồn mồi kiến rừng và bọ cánh cứng bản địa. Khi nuôi sinh sản trong môi trường kiểm soát ăn ruồi giấm và dế sạch, tuyến độc hoàn toàn vô hại.\n• Tuy nhiên, vì da lưỡng cư có màng thẩm thấu mỏng, bạn nên rửa sạch tay trước và sau khi chạm chuồng trại.`
        suggestedSlug = 'dart-azureus'
        suggestedName = 'Ếch Phi Tiêu Xanh Azureus'
      } else if (q.includes('cây') || q.includes('chuồng') || q.includes('bể') || q.includes('terrarium')) {
        reply = `🌿 **Setup chuồng nuôi Ếch Cây chuẩn Terrarium:**\n\n• **Kiểu chuồng:** Ưu tiên chiều cao đứng (tối thiểu 45x45x60cm).\n• **Vi khí hậu:** Nhiệt độ 24-27°C, độ ẩm 75-90%, xịt sương ẩm sáng tối.\n• **Phụ kiện:** Cành lũa leo trèo, cây lá rộng (Trầu bà, Lan ý, Bromeliad).\n• Khay nước nông sạch đã khử clo để ếch ngâm mình ban đêm.`
        suggestedSlug = 'tree-red-eyed'
        suggestedName = 'Ếch Cây Mắt Đỏ'
      } else if (q.includes('rêu') || q.includes('việt nam') || q.includes('mossy')) {
        reply = `🌲 **Ếch Rêu Việt Nam (Theloderma corticale):**\n\n• Báu vật lưỡng cư bản địa vùng núi cao Bắc Bộ Việt Nam.\n• Khả năng ngụy trang đỉnh cao như một tảng rêu đá ẩm ướt nguyên sinh.\n• Môi trường nuôi: Bán cạn (Paludarium) nước mát 20-24°C, dòng chảy nhẹ và nhiều hốc đá lũa ẩn nấp.`
        suggestedSlug = 'vietnam-mossy'
        suggestedName = 'Ếch Rêu Việt Nam'
      } else if (q.includes('canxi') || q.includes('mbd') || q.includes('bệnh') || q.includes('sức khỏe')) {
        reply = `🩺 **Cẩm nang Bệnh học & Dinh dưỡng vi lượng:**\n\n• **Bệnh MBD (Mềm xương):** Do thiếu hụt Canxi/D3 hoặc thiếu đèn UVB. Biểu hiện: hàm dưới mềm xẹp, run chi, khó đớp mồi. Khắc phục: Phủ bột Canxi D3 lên mồi 1-2 lần/tuần.\n• **Nhiễm trùng da (Red Leg):** Do đọng amoniac từ nước bẩn. Khắc phục: Thay nước sạch đã khử clo định kỳ 2 ngày/lần.\n• **Màng da thẩm thấu:** Tuyệt đối không chạm tay dính xà phòng, cồn hoặc mồ hôi mặn trực tiếp vào lưng ếch.`
      } else {
        const matched = knowledgeBase.find((k) =>
          query.includes(k.name?.toLowerCase()) ||
          query.includes(k.species?.toLowerCase()) ||
          query.includes(k.genus?.toLowerCase())
        )
        if (matched) {
          reply = `📖 **Hồ sơ sinh học loài ${matched.name}:**\n\n• **Tên khoa học:** *${matched.scientific_name}*\n• **Môi trường sống:** ${matched.natural_habitat || 'Nhiệt đới ẩm'}\n• **Dải nhiệt độ tối ưu:** ${matched.temp_day_min}°C - ${matched.temp_day_max}°C\n• **Dải độ ẩm tiêu chuẩn:** ${matched.humidity_min}% - ${matched.humidity_max}%\n• **Thức ăn ưa thích:** ${matched.primary_diet_json ? JSON.parse(matched.primary_diet_json).join(', ') : 'Dế mèn, cám, sâu canxi'}.\n\nBạn có thể bấm vào thẻ bên dưới để xem thước đo vi khí hậu và cẩm nang chi tiết!`
          suggestedSlug = matched.slug
          suggestedName = matched.name
        } else {
          reply = `Cảm ơn câu hỏi của bạn! Frog Store cung cấp **26 loài ếch cảnh thuần chủng** cùng cẩm nang sinh học chuẩn quốc tế.\n\nBạn có thể hỏi mình chi tiết về:\n• 🌡️ Dải nhiệt độ & độ ẩm từng loài\n• 🦗 Lịch cho ăn & bổ sung vi lượng Canxi/D3\n• 🔰 Loài phù hợp cho người mới bắt đầu\n• 🌿 Cách setup bể Terrarium hoặc Paludarium`
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
    }, 550)
  }

  // Simple Markdown Parser for beautiful text formatting
  const renderFormattedText = (text: string) => {
    const lines = text.split('\n')
    return lines.map((line, lIdx) => {
      // Bold formatting: **bold** -> <strong>bold</strong>
      const parts = line.split(/(\*\*.*?\*\*)/g)
      const formattedLine = parts.map((part, pIdx) => {
        if (part.startsWith('**') && part.endsWith('**')) {
          return <strong key={pIdx} className="chat-bold-highlight">{part.slice(2, -2)}</strong>
        }
        return part
      })

      const isBullet = line.trim().startsWith('•') || line.trim().startsWith('-')
      return (
        <p key={lIdx} className={`chat-line ${isBullet ? 'chat-bullet-line' : ''}`}>
          {formattedLine}
        </p>
      )
    })
  }

  return (
    <>
      {/* Floating Action Button (FAB) - Compact Circular Badge (Không che khuất) */}
      {!isOpen && (
        <button
          className="frog-ai-fab-round"
          aria-label="Mở Trợ Lý Ếch AI tư vấn sinh học"
          onClick={() => {
            setIsOpen(true)
            setIsMinimized(false)
          }}
          title="Hỏi Trợ Lý Ếch AI (Bách khoa 26 loài ếch)"
        >
          <Bot size={24} className="fab-bot-icon" />
          <span className="fab-hover-tooltip">Hỏi Trợ Lý Ếch AI</span>
          <span className="fab-online-dot-round"></span>
        </button>
      )}

      {/* Modern Non-Obstructive Chat Window Panel */}
      {isOpen && (
        <div
          className={`frog-ai-chat-panel fade-in-up ${isMinimized ? 'chat-panel-minimized' : ''} ${isExpanded ? 'chat-panel-expanded' : ''}`}
          ref={chatPanelRef}
        >
          {/* Header Bar */}
          <div className="chat-panel-header">
            <div className="header-bot-info">
              <div className="bot-avatar-wrap">
                <Bot size={20} color="#059669" />
                <span className="bot-status-indicator"></span>
              </div>
              <div>
                <h4 className="bot-name">Trợ Lý Ếch AI</h4>
                <p className="bot-status-text">Online • Bách khoa 26 loài</p>
              </div>
            </div>
            <div className="header-actions">
              <button
                type="button"
                className="btn-chat-icon"
                onClick={handleResetChat}
                title="Làm mới cuộc trò chuyện"
                aria-label="Làm mới"
              >
                <RotateCcw size={15} />
              </button>
              <button
                type="button"
                className="btn-chat-icon"
                onClick={() => {
                  if (isMinimized) {
                    setIsMinimized(false)
                  } else {
                    setIsExpanded(!isExpanded)
                  }
                }}
                title={isExpanded ? 'Thu về kích thước chuẩn' : 'Phóng to khung chat'}
                aria-label={isExpanded ? 'Thu chuẩn' : 'Phóng to'}
              >
                {isExpanded ? <Minimize2 size={15} /> : <Maximize2 size={15} />}
              </button>
              <button
                type="button"
                className="btn-chat-icon"
                onClick={() => setIsMinimized(!isMinimized)}
                title={isMinimized ? 'Mở lại khung chat' : 'Thu nhỏ thanh chat'}
                aria-label="Thu nhỏ"
              >
                <ChevronDown size={17} />
              </button>
              <button
                type="button"
                className="btn-chat-icon btn-chat-close"
                onClick={() => setIsOpen(false)}
                title="Đóng chatbox (Esc)"
                aria-label="Đóng"
              >
                <X size={17} />
              </button>
            </div>
          </div>

          {/* Collapsible Chat Body */}
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
                        <Bot size={14} color="#059669" />
                      </div>
                    )}
                    <div className={`chat-bubble ${m.sender === 'user' ? 'user-bubble' : 'bot-bubble'}`}>
                      <div className="chat-bubble-content">
                        {renderFormattedText(m.text)}
                      </div>

                      {/* Inline Quick Suggestion Chips inside Welcome message */}
                      {m.isWelcome && (
                        <div className="inline-suggestions-box">
                          <span className="suggestions-title">
                            <Lightbulb size={13} color="#d97706" /> Chủ đề được hỏi nhiều nhất:
                          </span>
                          <div className="suggestions-chips-grid">
                            {quickPrompts.map((p, idx) => (
                              <button
                                key={idx}
                                type="button"
                                className="inline-prompt-pill"
                                onClick={() => handleSend(p.query)}
                              >
                                {p.label}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Product Deep Link Card */}
                      {m.suggestedSlug && onOpenProduct && (
                        <div className="chat-product-preview-card">
                          <div className="preview-text">
                            <span className="preview-label">Hồ sơ sinh thái chuẩn:</span>
                            <strong className="preview-title">{m.suggestedName || 'Loài ếch này'}</strong>
                          </div>
                          <button
                            type="button"
                            className="btn-preview-navigate"
                            onClick={() => {
                              onOpenProduct(m.suggestedSlug!)
                              setIsOpen(false)
                            }}
                          >
                            <ExternalLink size={13} />
                            <span>Xem ngay</span>
                          </button>
                        </div>
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
                      <div className="typing-indicator-wrap">
                        <span className="typing-dot"></span>
                        <span className="typing-dot"></span>
                        <span className="typing-dot"></span>
                        <span className="typing-text">Đang tra cứu bách khoa 26 loài...</span>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Quick Topics Toggle Bar */}
              {showQuickTips && (
                <div className="quick-topics-drawer fade-in">
                  <div className="drawer-header">
                    <span>💡 Gợi ý câu hỏi nhanh:</span>
                    <button type="button" onClick={() => setShowQuickTips(false)} className="btn-drawer-close">
                      <X size={13} />
                    </button>
                  </div>
                  <div className="drawer-chips">
                    {quickPrompts.map((p, idx) => (
                      <button
                        key={idx}
                        type="button"
                        className="drawer-chip-item"
                        onClick={() => handleSend(p.query)}
                      >
                        {p.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Polished Input Footer */}
              <form
                className="chat-input-bar"
                onSubmit={(e) => {
                  e.preventDefault()
                  handleSend()
                }}
              >
                <button
                  type="button"
                  className={`btn-toggle-prompts ${showQuickTips ? 'active' : ''}`}
                  onClick={() => setShowQuickTips(!showQuickTips)}
                  title="Gợi ý câu hỏi"
                  aria-label="Gợi ý"
                >
                  <Lightbulb size={17} />
                </button>
                <input
                  type="text"
                  placeholder="Hỏi về thức ăn, nhiệt độ, chuồng nuôi..."
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
