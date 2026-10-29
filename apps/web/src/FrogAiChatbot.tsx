import React, { useState, useEffect, useRef } from 'react'
import {
  Bot,
  X,
  Send,
  ExternalLink,
  ChevronDown,
  Minimize2,
  Maximize2,
  RotateCcw,
  Lightbulb
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
  hidden = false
}) => {
  const [isOpen, setIsOpen] = useState(false)
  const [isMinimized, setIsMinimized] = useState(false)
  const [isExpanded, setIsExpanded] = useState(false)
  const [showQuickTips, setShowQuickTips] = useState(false)

  const initialWelcomeMessage: Message = {
    id: 'welcome',
    sender: 'bot',
    text: `Xin chào! 🐸 Mình là **Trợ Lý Ếch AI** của Frog Store.\n\nMình nắm vững tập tính sinh học, dải vi khí hậu nhiệt-ẩm, dinh dưỡng và bệnh học của **26 loài ếch cảnh sống**.\n\nBạn có thể hỏi bất kỳ điều gì (hoặc tra cứu theo tên khoa học) hoặc chọn gợi ý bên dưới nhé:`,
    time: 'Vừa xong',
    isWelcome: true
  }

  const [messages, setMessages] = useState<Message[]>([initialWelcomeMessage])
  const [inputText, setInputText] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [knowledgeBase, setKnowledgeBase] = useState<any[]>([])

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const chatPanelRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const fabRef = useRef<HTMLButtonElement>(null)
  const hasLoadedKnowledgeRef = useRef(false)
  const isFirstOpenRef = useRef(true)

  // 3 Core beginner-friendly suggestions inside the welcome bubble
  const welcomePrompts = [
    { label: '👶 Loài nào dễ nuôi cho người mới?', query: 'Tôi là người mới bắt đầu chơi ếch cảnh thì nên nuôi loài nào dễ nhất?' },
    { label: '🐛 Pacman ăn gì & lịch cho ăn?', query: 'Ếch Pacman ăn gì và lịch cho ăn thế nào?' },
    { label: '🌿 Cách setup chuồng nuôi ếch cây?', query: 'Chuồng nuôi ếch cây cần phụ kiện và độ ẩm, nhiệt độ bao nhiêu?' }
  ]

  // Extended non-duplicated suggestions inside Lightbulb Drawer
  const drawerPrompts = [
    { label: '🧪 Ếch phi tiêu có độc nguy hiểm không?', query: 'Ếch phi tiêu độc nuôi cảnh có độc nguy hiểm không?' },
    { label: '🌲 Ếch Rêu Việt Nam cần môi trường gì?', query: 'Ếch Rêu Việt Nam Theloderma corticale cần môi trường sống thế nào?' },
    { label: '🩺 Bệnh MBD và cách bổ sung Canxi/D3?', query: 'Bệnh MBD ở ếch cảnh là gì và cách bổ sung Canxi D3?' },
    { label: '🔬 Tra cứu tên khoa học (Litoria, Ceratophrys...)', query: 'Cho tôi biết thông tin về loài ếch Litoria caerulea (Ếch Cây Dumpy)' },
    { label: '📦 Chính sách vận chuyển sống 100%?', query: 'Chính sách bảo hành sống 100% khi nhận hàng hỏa tốc hoạt động thế nào?' }
  ]

  // Reset expanded size when navigating to a product or changing page
  useEffect(() => {
    setIsExpanded(false)
  }, [currentProductSlug])

  // PERF: Lazy-load AI Knowledge Base only when chat is opened for the first time
  useEffect(() => {
    if (isOpen && !hasLoadedKnowledgeRef.current) {
      hasLoadedKnowledgeRef.current = true
      api.aiKnowledge()
        .then((res) => {
          if (res?.species && Array.isArray(res.species)) {
            setKnowledgeBase(res.species)
          }
        })
        .catch(() => {
          hasLoadedKnowledgeRef.current = false
        })
    }
  }, [isOpen])

  // Focus management for accessibility (a11y)
  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        inputRef.current?.focus()
      }, 120)
      return () => clearTimeout(timer)
    } else {
      if (!isFirstOpenRef.current) {
        fabRef.current?.focus()
      }
    }
  }, [isOpen])

  // Click outside to collapse chat
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

  // Smart Auto-Scroll: DO NOT auto-scroll away on initial open!
  // Only auto-scroll when user sends a message or when bot is typing/streaming
  useEffect(() => {
    if (!isOpen || isMinimized) return
    if (isFirstOpenRef.current) {
      isFirstOpenRef.current = false
      return
    }
    if (messages.length > 1 || isTyping) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages, isOpen, isTyping, isMinimized])

  const handleResetChat = () => {
    setMessages([initialWelcomeMessage])
    setInputText('')
    setIsTyping(false)
    setShowQuickTips(false)
    isFirstOpenRef.current = true
  }

  // Normalizer for multi-field search (accents, lowercase, scientific names)
  const normalize = (value: string) =>
    value
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .replace(/đ/g, 'd')
      .replace(/[^\w\s]/gi, ' ')
      .replace(/\s+/g, ' ')
      .trim()

  // Local biological knowledge fallback when stream is unreachable or offline
  const generateFallbackResponse = (query: string): { reply: string; suggestedSlug?: string; suggestedName?: string } => {
    const qNorm = normalize(query)

    // 1. Search across full species knowledge base (scientific_name, name, species, genus, family, slug)
    const matched = knowledgeBase.find((k) => {
      const sciNorm = normalize(k.scientific_name || '')
      const nameNorm = normalize(k.name || '')
      const slugNorm = normalize(k.slug || '')
      const genusNorm = normalize(k.genus || '')
      const speciesNorm = normalize(k.species || '')
      const familyNorm = normalize(k.family || '')

      return (
        (sciNorm && (qNorm.includes(sciNorm) || sciNorm.includes(qNorm))) ||
        (nameNorm && (qNorm.includes(nameNorm) || nameNorm.includes(qNorm))) ||
        (genusNorm && qNorm.includes(genusNorm)) ||
        (speciesNorm && qNorm.includes(speciesNorm)) ||
        (slugNorm && qNorm.includes(slugNorm)) ||
        (familyNorm && qNorm.includes(familyNorm))
      )
    })

    if (matched) {
      const dietStr = matched.primary_diet_json
        ? (typeof matched.primary_diet_json === 'string'
            ? JSON.parse(matched.primary_diet_json).join(', ')
            : matched.primary_diet_json.join(', '))
        : 'Dế mèn, sâu canxi, cá mồi hoặc cám chuyên dụng'

      const reply = `📖 **Hồ sơ sinh học loài ${matched.name}:**\n\n• **Tên khoa học:** *${matched.scientific_name}*\n• **Phân loại họ:** ${matched.family || 'Lưỡng cư'}\n• **Môi trường sống:** ${matched.natural_habitat || matched.habitat_type || 'Nhiệt đới ẩm'}\n• **Dải nhiệt độ tối ưu:** ${matched.temp_day_min || 24}°C - ${matched.temp_day_max || 28}°C\n• **Độ ẩm tiêu chuẩn:** ${matched.humidity_min || 70}% - ${matched.humidity_max || 85}%\n• **Thức ăn chính:** ${dietStr}.\n\nBạn có thể bấm vào thẻ bên dưới để xem thước đo vi khí hậu và cẩm nang chi tiết!`

      return { reply, suggestedSlug: matched.slug, suggestedName: matched.name }
    }

    // 2. Specific domain topics fallback
    if (qNorm.includes('nguoi moi') || qNorm.includes('de nuoi') || qNorm.includes('bat dau') || qNorm.includes('tap nuoi')) {
      return {
        reply: `🔰 **Gợi ý cho người mới bắt đầu (Beginner):**\n\nFrog Store khuyên bạn nên chọn 2 dòng kinh điển, sức đề kháng vượt trội sau:\n\n1. 🐸 **Ếch Pacman (Ceratophrys cranwelli):**\n• Rất phàm ăn, sống cạn, ăn cám viên Pac Attack hoặc dế/cá mồi.\n• Chỉ cần hộp nhựa 30x20cm lót mút xốp hoặc mùn dừa ẩm 70-80%.\n\n2. 🍃 **Ếch Cây Dumpy (Litoria caerulea):**\n• Tính tình cực kỳ dạn người, hiền lành, leo cành ngộ nghĩnh.\n• Kháng bệnh rất cao, tuổi thọ lên tới 15-20 năm.`,
        suggestedSlug: 'pacman-green',
        suggestedName: 'Ếch Pacman Xanh'
      }
    }

    if (qNorm.includes('pacman') || qNorm.includes('thuc an') || qNorm.includes('an gi')) {
      return {
        reply: `🍽️ **Chế độ dinh dưỡng khoa học cho Ếch Pacman:**\n\n• **Giai đoạn Baby (3-4cm):** Cho ăn 2 ngày/lần. Khẩu phần: Cám viên ngâm nước, cá mồi nhỏ hoặc dế ngắt càng sau.\n• **Giai đoạn Trưởng thành (>7cm):** Cho ăn 4-5 ngày/lần. Thêm trạch nhỏ, gián Dubia, sâu canxi.\n• ⚠️ **Lưu ý tối quan trọng:** Bổ sung bột Canxi + D3 1 lần/tuần để phòng bệnh mềm xương MBD!`,
        suggestedSlug: 'pacman-green',
        suggestedName: 'Ếch Pacman Xanh'
      }
    }

    if (qNorm.includes('doc') || qNorm.includes('phi tieu') || qNorm.includes('nguy hiem') || qNorm.includes('poison')) {
      return {
        reply: `🔬 **Về độc tố của Ếch Phi Tiêu Độc (Dendrobatidae):**\n\n• **100% ếch phi tiêu tại Frog Store là dòng nhân giống nhân tạo (Captive-Bred - CB), TUYỆT ĐỐI KHÔNG CÓ ĐỘC!**\n• Ngoài tự nhiên, chúng tích lũy alkaloid qua nguồn mồi kiến rừng bản địa. Khi nuôi sinh sản ăn ruồi giấm và dế sạch, tuyến độc hoàn toàn vô hại.\n• Tuy nhiên, vì da lưỡng cư có màng thẩm thấu mỏng, bạn nên rửa sạch tay trước và sau khi chạm chuồng trại.`,
        suggestedSlug: 'dart-azureus',
        suggestedName: 'Ếch Phi Tiêu Xanh Azureus'
      }
    }

    if (qNorm.includes('cay') || qNorm.includes('chuong') || qNorm.includes('be') || qNorm.includes('terrarium')) {
      return {
        reply: `🌿 **Setup chuồng nuôi Ếch Cây chuẩn Terrarium:**\n\n• **Kiểu chuồng:** Ưu tiên chiều cao đứng (tối thiểu 45x45x60cm).\n• **Vi khí hậu:** Nhiệt độ 24-27°C, độ ẩm 75-90%, xịt sương ẩm sáng tối.\n• **Phụ kiện:** Cành lũa leo trèo, cây lá rộng (Trầu bà, Lan ý, Bromeliad).\n• Khay nước nông sạch đã khử clo để ếch ngâm mình ban đêm.`,
        suggestedSlug: 'tree-red-eyed',
        suggestedName: 'Ếch Cây Mắt Đỏ'
      }
    }

    if (qNorm.includes('reu') || qNorm.includes('viet nam') || qNorm.includes('mossy')) {
      return {
        reply: `🌲 **Ếch Rêu Việt Nam (Theloderma corticale):**\n\n• Báu vật lưỡng cư bản địa vùng núi cao Bắc Bộ Việt Nam.\n• Khả năng ngụy trang đỉnh cao như một tảng rêu đá ẩm ướt nguyên sinh.\n• Môi trường nuôi: Bán cạn (Paludarium) nước mát 20-24°C, dòng chảy nhẹ và nhiều hốc đá lũa ẩn nấp.`,
        suggestedSlug: 'vietnam-mossy',
        suggestedName: 'Ếch Rêu Việt Nam'
      }
    }

    if (qNorm.includes('canxi') || qNorm.includes('mbd') || qNorm.includes('benh') || qNorm.includes('suc khoe')) {
      return {
        reply: `🩺 **Cẩm nang Bệnh học & Dinh dưỡng vi lượng:**\n\n• **Bệnh MBD (Mềm xương):** Do thiếu hụt Canxi/D3 hoặc thiếu đèn UVB. Biểu hiện: hàm dưới mềm xẹp, run chi, khó đớp mồi. Khắc phục: Phủ bột Canxi D3 lên mồi 1-2 lần/tuần.\n• **Nhiễm trùng da (Red Leg):** Do đọng amoniac từ nước bẩn. Khắc phục: Thay nước sạch đã khử clo định kỳ 2 ngày/lần.\n• **Màng da thẩm thấu:** Tuyệt đối không chạm tay dính xà phòng, cồn hoặc mồ hôi mặn trực tiếp vào lưng ếch.`
      }
    }

    if (qNorm.includes('van chuyen') || qNorm.includes('bao hanh') || qNorm.includes('giao hang') || qNorm.includes('hoa toc')) {
      return {
        reply: `📦 **Chính sách Vận chuyển & Bảo hành Sống 100%:**\n\n• Mỗi cá thể ếch được đóng trong hộp thoáng khí lót mút xốp ngậm nước tiệt trùng.\n• Vận chuyển bằng thùng xốp cách nhiệt tiêu chuẩn, có dán nhãn *Động Vật Sống - Xin Nhẹ Tay*.\n• **Cam kết Bảo Hành Sống 100%:** Quý khách quay video khui thùng (unboxing). Nếu xảy ra rủi ro sốc nhiệt, Frog Store hoàn tiền 100% hoặc gửi bù miễn phí trong 24h!`
      }
    }

    return {
      reply: `Cảm ơn câu hỏi của bạn! Frog Store cung cấp **26 loài ếch cảnh thuần chủng** cùng cẩm nang sinh học chuẩn quốc tế.\n\nBạn có thể hỏi mình chi tiết về:\n• 🌡️ Dải nhiệt độ & độ ẩm từng loài (hoặc tên khoa học như *Litoria caerulea*, *Ceratophrys*...)\n• 🦗 Lịch cho ăn & bổ sung vi lượng Canxi/D3\n• 🔰 Loài phù hợp cho người mới bắt đầu\n• 🌿 Cách setup bể Terrarium hoặc Paludarium bán cạn`
    }
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

    const botMsgId = String(Date.now() + 1)
    let accumulatedText = ''
    let isStreamActive = false

    // Prepare recent message history for the AI RAG model
    const chatPayload = [...messages, userMsg]
      .slice(-6)
      .map((m) => ({
        role: (m.sender === 'user' ? 'user' : 'assistant') as 'user' | 'assistant',
        content: m.text
      }))

    try {
      // Connect to Real AI Model via SSE stream
      const streamPromise = api.frogChatStream(
        {
          messages: chatPayload,
          currentProductSlug: currentProductSlug || undefined
        },
        (token: string) => {
          if (!isStreamActive) {
            isStreamActive = true
            setIsTyping(false)
            setMessages((prev) => [
              ...prev,
              {
                id: botMsgId,
                sender: 'bot',
                text: token,
                time: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
              }
            ])
            accumulatedText = token
          } else {
            accumulatedText += token
            setMessages((prev) =>
              prev.map((m) => (m.id === botMsgId ? { ...m, text: accumulatedText } : m))
            )
          }
        }
      )

      const result = await streamPromise

      // Finalize message with suggested slug if returned by AI
      if (result?.suggestedSlug) {
        setMessages((prev) =>
          prev.map((m) =>
            m.id === botMsgId
              ? { ...m, suggestedSlug: result.suggestedSlug, suggestedName: result.suggestedName }
              : m
          )
        )
      }
    } catch (err) {
      // Graceful fallback to rich local biological intelligence if upstream AI is unavailable
      console.warn('AI stream unavailable, using biological knowledge engine fallback:', err)
      const fallback = generateFallbackResponse(query)

      if (isStreamActive && accumulatedText) {
        // Stream broke mid-way, keep what we got
      } else {
        setMessages((prev) => [
          ...prev,
          {
            id: botMsgId,
            sender: 'bot',
            text: fallback.reply,
            time: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
            suggestedSlug: fallback.suggestedSlug,
            suggestedName: fallback.suggestedName
          }
        ])
      }
    } finally {
      setIsTyping(false)
    }
  }

  // Markdown Parser for rich bolding and bullet list styling
  const renderFormattedText = (text: string) => {
    const lines = text.split('\n')
    return lines.map((line, lIdx) => {
      const parts = line.split(/(\*\*.*?\*\*|\*.*?\*)/g)
      const formattedLine = parts.map((part, pIdx) => {
        if (part.startsWith('**') && part.endsWith('**')) {
          return (
            <strong key={pIdx} className="chat-bold-highlight">
              {part.slice(2, -2)}
            </strong>
          )
        }
        if (part.startsWith('*') && part.endsWith('*')) {
          return (
            <em key={pIdx} className="chat-italic-highlight">
              {part.slice(1, -1)}
            </em>
          )
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
      {/* Floating Action Button (FAB) - Preserves mount state via CSS display */}
      <button
        ref={fabRef}
        className="frog-ai-fab-round"
        style={hidden || isOpen ? { display: 'none' } : undefined}
        aria-label="Mở Trợ Lý Ếch AI tư vấn sinh học 26 loài"
        aria-expanded={isOpen}
        onClick={() => {
          setIsOpen(true)
          setIsMinimized(false)
          setIsExpanded(false)
        }}
        title="Hỏi Trợ Lý Ếch AI (Bách khoa 26 loài ếch)"
      >
        <Bot size={24} className="fab-bot-icon" />
        <span className="fab-hover-tooltip">Hỏi Trợ Lý Ếch AI</span>
        <span className="fab-online-dot-round"></span>
      </button>

      {/* Modern Non-Obstructive Chat Window Panel */}
      <div
        className={`frog-ai-chat-panel fade-in-up ${isMinimized ? 'chat-panel-minimized' : ''} ${
          isExpanded ? 'chat-panel-expanded' : ''
        }`}
        ref={chatPanelRef}
        role="region"
        aria-label="Cửa sổ hội thoại Trợ Lý Ếch AI"
        style={hidden || !isOpen ? { display: 'none' } : undefined}
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
              aria-label="Làm mới cuộc trò chuyện"
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
              aria-label={isExpanded ? 'Thu nhỏ về kích thước chuẩn' : 'Phóng to khung chat'}
              aria-expanded={isExpanded}
            >
              {isExpanded ? <Minimize2 size={15} /> : <Maximize2 size={15} />}
            </button>
            <button
              type="button"
              className="btn-chat-icon"
              onClick={() => setIsMinimized(!isMinimized)}
              title={isMinimized ? 'Mở lại khung chat' : 'Thu nhỏ thanh chat'}
              aria-label={isMinimized ? 'Mở lại khung chat' : 'Thu nhỏ thanh chat'}
            >
              <ChevronDown size={17} />
            </button>
            <button
              type="button"
              className="btn-chat-icon btn-chat-close"
              onClick={() => setIsOpen(false)}
              title="Đóng chatbox (Esc)"
              aria-label="Đóng khung chat (Phím Esc)"
            >
              <X size={17} />
            </button>
          </div>
        </div>

        {/* Collapsible Chat Body */}
        {!isMinimized && (
          <>
            {/* Messages Body */}
            <div
              className="chat-messages-body"
              role="log"
              aria-live="polite"
              aria-atomic="false"
              aria-relevant="additions text"
              aria-label="Lịch sử tin nhắn tư vấn"
            >
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
                    <div className="chat-bubble-content">{renderFormattedText(m.text)}</div>

                    {/* 3 Core Inline Suggestions in Welcome Message */}
                    {m.isWelcome && (
                      <div className="inline-suggestions-box">
                        <span className="suggestions-title">
                          <Lightbulb size={13} color="#d97706" /> Chủ đề được hỏi nhiều nhất:
                        </span>
                        <div className="suggestions-chips-grid">
                          {welcomePrompts.map((p, idx) => (
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
                      <span className="typing-text">Trợ Lý AI đang phản hồi...</span>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Quick Topics Toggle Bar (Lightbulb Drawer with Extended Topics) */}
            {showQuickTips && (
              <div id="quick-topics-drawer" className="quick-topics-drawer fade-in">
                <div className="drawer-header">
                  <span>💡 Chủ đề mở rộng & Chuyên sâu:</span>
                  <button
                    type="button"
                    onClick={() => setShowQuickTips(false)}
                    className="btn-drawer-close"
                    aria-label="Đóng gợi ý"
                  >
                    <X size={13} />
                  </button>
                </div>
                <div className="drawer-chips">
                  {drawerPrompts.map((p, idx) => (
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
                title="Chủ đề mở rộng"
                aria-label="Mở chủ đề mở rộng"
                aria-expanded={showQuickTips}
                aria-controls="quick-topics-drawer"
              >
                <Lightbulb size={17} />
              </button>
              <input
                ref={inputRef}
                type="text"
                placeholder="Hỏi về thức ăn, vi khí hậu, tên khoa học..."
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                className="chat-text-input"
                aria-label="Nhập câu hỏi tư vấn về ếch cảnh"
              />
              <button
                type="submit"
                className="btn-chat-send"
                disabled={!inputText.trim() || isTyping}
                title="Gửi câu hỏi (Enter)"
                aria-label="Gửi câu hỏi"
              >
                <Send size={15} />
              </button>
            </form>
          </>
        )}
      </div>
    </>
  )
}
