import { useState, useRef, useEffect } from 'react'
import './App.css'

const API_BASE = import.meta.env.VITE_API_URL || ''

function App() {
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const messagesEndRef = useRef(null)
  const textareaRef = useRef(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }
  useEffect(scrollToBottom, [messages, loading])

  const sendMessage = async () => {
    const text = input.trim()
    if (!text || loading) return
    setError(null)
    setInput('')
    setMessages((prev) => [...prev, { role: 'user', content: text }])
    setLoading(true)
    try {
      const res = await fetch(`${API_BASE}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        throw new Error(data.detail || res.statusText || 'Request failed')
      }
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: data.answer,
          sources: data.sources || [],
        },
      ])
    } catch (e) {
      setError(e.message)
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: null,
          error: e.message,
        },
      ])
    } finally {
      setLoading(false)
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  return (
    <div className="app">
      <aside className="sidebar">
        <div className="sidebar-brand">
          <h1>
            <span className="icon">🩺</span>
            <span>MediBot</span>
          </h1>
        </div>
        <nav className="sidebar-nav">
          <a href="#chat" className="active">
            <span className="nav-icon">💬</span>
            <span>Chat</span>
          </a>
          <a href="#">
            <span className="nav-icon">📚</span>
            <span>Knowledge</span>
          </a>
          <a href="#">
            <span className="nav-icon">⚙️</span>
            <span>Settings</span>
          </a>
        </nav>
        <div className="sidebar-footer">
          Medical Q&A · Powered by AI
        </div>
      </aside>

      <main className="main">
        <header className="page-header">
          <h2>Medical Assistant</h2>
          <p>Ask questions based on the medical encyclopedia. Answers are for information only—always consult a doctor.</p>
        </header>

        <div className="stats">
          <div className="stat-card">
            <div className="label">Conversation</div>
            <div className="value">{messages.filter((m) => m.role === 'user').length}</div>
          </div>
          <div className="stat-card accent">
            <div className="label">Status</div>
            <div className="value">{loading ? '…' : 'Ready'}</div>
          </div>
        </div>

        <div className="chat-container">
          <div className="chat-messages">
            {messages.length === 0 && !loading && (
              <div className="welcome-state">
                <div className="welcome-icon">🩺</div>
                <h3>Ask anything medical</h3>
                <p>Type your question below. Answers are drawn from the medical encyclopedia and are for educational use only.</p>
              </div>
            )}
            {messages.map((msg, i) => (
              <div key={i} className={`chat-message ${msg.role}`}>
                <div className="avatar">{msg.role === 'user' ? '👤' : '🩺'}</div>
                <div className="bubble">
                  {msg.error ? (
                    <span className="error-banner">{msg.error}</span>
                  ) : (
                    <>
                      {msg.content}
                      {msg.sources && msg.sources.length > 0 && (
                        <div className="sources">
                          <details>
                            <summary>Sources</summary>
                            <ul style={{ marginTop: '0.5rem', paddingLeft: '1.25rem' }}>
                              {msg.sources.map((s, j) => (
                                <li key={j} style={{ marginBottom: '0.35rem' }}>{s}</li>
                              ))}
                            </ul>
                          </details>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
            ))}
            {loading && (
              <div className="chat-message bot">
                <div className="avatar">🩺</div>
                <div className="typing">
                  <span></span><span></span><span></span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
          <div className="chat-input-wrap">
            {error && <div className="error-banner">{error}</div>}
            <div className="chat-input-inner">
              <textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask a medical question..."
                rows={1}
                disabled={loading}
              />
              <button onClick={sendMessage} disabled={loading || !input.trim()} title="Send">
                ➤
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

export default App
