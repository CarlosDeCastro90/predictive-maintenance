import { useState, useRef, useEffect } from 'react'
import { assistantAPI } from '../services/api'
import { Bot, Send, User } from 'lucide-react'

export default function Assistant() {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: 'Olá! Sou o PredictAI, o teu assistente de manutenção preditiva. Posso ajudar-te a analisar dados de sensores, diagnosticar falhas e recomendar acções de manutenção. Como posso ajudar?'
    }
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const sendMessage = async () => {
    if (!input.trim() || loading) return

    const userMessage = { role: 'user', content: input }
    setMessages(prev => [...prev, userMessage])
    setInput('')
    setLoading(true)

    try {
      const history = messages.slice(-10)
      const res = await assistantAPI.chat(input, null, history)
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: res.data.response
      }])
    } catch {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'Erro ao contactar o assistente. Tenta novamente.'
      }])
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
    <div className="flex flex-col h-full p-8">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
          <Bot className="text-blue-400" />
          Assistente IA
        </h2>
        <p className="text-gray-400 mt-1">Powered by Groq — Llama 3 70B</p>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-4 mb-6 pr-2">
        {messages.map((msg, i) => (
          <div key={i} className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            {msg.role === 'assistant' && (
              <div className="p-2 bg-blue-600/20 rounded-lg h-fit">
                <Bot size={18} className="text-blue-400" />
              </div>
            )}
            <div className={`max-w-2xl px-4 py-3 rounded-xl text-sm leading-relaxed ${
              msg.role === 'user'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-900 border border-gray-800 text-gray-200'
            }`}>
              {msg.content}
            </div>
            {msg.role === 'user' && (
              <div className="p-2 bg-gray-700 rounded-lg h-fit">
                <User size={18} className="text-gray-300" />
              </div>
            )}
          </div>
        ))}
        {loading && (
          <div className="flex gap-3">
            <div className="p-2 bg-blue-600/20 rounded-lg h-fit">
              <Bot size={18} className="text-blue-400" />
            </div>
            <div className="bg-gray-900 border border-gray-800 px-4 py-3 rounded-xl">
              <div className="flex gap-1">
                <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="flex gap-3">
        <textarea
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Pergunta sobre uma máquina, alerta ou manutenção..."
          rows={2}
          className="flex-1 bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 text-white text-sm resize-none focus:outline-none focus:border-blue-500 placeholder-gray-600"
        />
        <button
          onClick={sendMessage}
          disabled={loading || !input.trim()}
          className="px-4 py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-xl transition-all flex items-center gap-2"
        >
          <Send size={18} />
        </button>
      </div>
    </div>
  )
}