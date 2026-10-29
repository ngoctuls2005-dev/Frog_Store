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
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const chatPanelRef = useRef<HTMLDivElement>(null)

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

  const handleSend = async (textToSend?: string) => {
    if (isTyping) return
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

    const botMessageId = String(Date.now() + 1)
    let hasStartedResponse = false
    try {
      const response = await api.frogChatStream({
        messages: [...messages, userMsg].slice(-6).map((message) => ({
          role: message.sender === 'user' ? 'user' as const : 'assistant' as const,
          content: message.text,
        })),
        currentProductSlug: currentProductSlug || undefined,
      }, (text) => {
        if (!text) return
        if (!hasStartedResponse) {
          hasStartedResponse = true
          setIsTyping(false)
          setMessages((prev) => [...prev, {
            id: botMessageId,
            sender: 'bot',
            text,
            time: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
          }])
          return
        }
        setMessages((prev) => prev.map((message) => message.id === botMessageId
          ? { ...message, text: message.text + text }
          : message))
      })

      setMessages((prev) => prev.map((message) => message.id === botMessageId
        ? { ...message, suggestedSlug: response.suggestedSlug, suggestedName: response.suggestedName }
        : message))
      if (!hasStartedResponse) {
        setMessages((prev) => [...prev, {
          id: botMessageId,
          sender: 'bot',
          text: 'Mình chưa có câu trả lời cho câu hỏi này. Bạn thử hỏi lại nhé.',
          time: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
        }])
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Trợ lý đang bận. Bạn vui lòng thử lại sau nhé.'
      if (hasStartedResponse) {
        setMessages((prev) => prev.map((item) => item.id === botMessageId
          ? { ...item, text: `${item.text}\n\n${message}` }
          : item))
      } else {
        setMessages((prev) => [...prev, {
          id: botMessageId,
          sender: 'bot',
          text: message,
          time: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
        }])
      }
    } finally {
      setIsTyping(false)
    }
  }

  return (
    <>
      {/* Floating Action Button (FAB) - Compact Circular Badge (Không che khuất nội dung mua hàng) */}
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
          <Bot size={22} className="fab-bot-icon" />
          <span className="fab-hover-tooltip">Hỏi Trợ Lý Ếch AI</span>
          <span className="fab-online-dot-round"></span>
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
