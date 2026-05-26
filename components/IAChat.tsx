"use client"
import { useState, useRef, useEffect } from "react"
import { Bot, Send, User } from "lucide-react"

type Message = {
  role: "user" | "assistant"
  content: string
}

const suggestions = [
  "Como está meu fluxo de caixa?",
  "Tenho contas vencendo essa semana?",
  "Quais são as oportunidades de economia?",
  "Qual minha receita esse mês?",
]

export default function IAChat() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  async function handleSend(text?: string) {
    const message = text ?? input
    if (!message.trim() || loading) return

    const userMessage: Message = { role: "user", content: message }
    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setLoading(true)

    const res = await fetch("/api/ia", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message }),
    })

    const data = await res.json()
    const assistantMessage: Message = { role: "assistant", content: data.response }
    setMessages((prev) => [...prev, assistantMessage])
    setLoading(false)
  }

  return (
    <div className="flex flex-col flex-1 overflow-hidden">

      {/* mensagens */}
      <div className="flex-1 overflow-y-auto px-6 py-6 flex flex-col gap-4">

        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full gap-6">
            <div className="w-14 h-14 bg-green-400 rounded-full animate-pulse" />
            <div className="text-center">
              <h2 className="text-xl font-bold text-white mb-1">IA Savra</h2>
              <p className="text-sm text-white/40">Pergunte qualquer coisa sobre sua empresa.</p>
            </div>
            <div className="grid grid-cols-2 gap-3 w-full max-w-lg">
              {suggestions.map((s) => (
                <button
                  key={s}
                  onClick={() => handleSend(s)}
                  className="text-left text-xs text-white/60 bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3 hover:bg-green-500/10 hover:border-green-500/30 hover:text-white transition-all"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg, i) => (
          <div key={i} className={`flex gap-3 ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
            {msg.role === "assistant" && (
              <div className="w-8 h-8 bg-green-400 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                <Bot size={14} className="text-black" />
              </div>
            )}
            <div
              className={`max-w-xl px-4 py-3 rounded-2xl text-sm leading-relaxed ${
                msg.role === "user"
                  ? "bg-green-500/20 text-white rounded-tr-sm"
                  : "bg-white/[0.05] text-white/80 rounded-tl-sm"
              }`}
            >
              {msg.content}
            </div>
            {msg.role === "user" && (
              <div className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                <User size={14} className="text-white" />
              </div>
            )}
          </div>
        ))}

        {loading && (
          <div className="flex gap-3 justify-start">
            <div className="w-8 h-8 bg-green-400 rounded-full flex items-center justify-center flex-shrink-0">
              <Bot size={14} className="text-black" />
            </div>
            <div className="bg-white/[0.05] px-4 py-3 rounded-2xl rounded-tl-sm flex gap-1 items-center">
              <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-bounce [animation-delay:0ms]" />
              <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-bounce [animation-delay:150ms]" />
              <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-bounce [animation-delay:300ms]" />
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* input */}
      <div className="px-6 py-4 border-t border-white/5">
        <div className="flex gap-3 items-center bg-white/[0.04] border border-white/10 rounded-2xl px-4 py-3 focus-within:border-green-500/40 transition-colors">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            placeholder="Pergunte algo sobre sua empresa..."
            className="flex-1 bg-transparent text-sm text-white placeholder-white/30 outline-none"
          />
          <button
            onClick={() => handleSend()}
            disabled={loading || !input.trim()}
            className="w-8 h-8 bg-green-500 hover:bg-green-600 disabled:opacity-30 rounded-xl flex items-center justify-center transition-colors flex-shrink-0"
          >
            <Send size={14} className="text-black" />
          </button>
        </div>
      </div>

    </div>
  )
}