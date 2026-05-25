"use client"
import { useState } from "react"

export default function IAChatCard() {
  const [input, setInput] = useState("")
  const [response, setResponse] = useState("")
  const [loading, setLoading] = useState(false)

  async function handleSend() {
    if (!input.trim() || loading) return
    setLoading(true)
    setResponse("")

    const res = await fetch("/api/ia", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: input }),
    })

    const data = await res.json()
    setResponse(data.response)
    setInput("")
    setLoading(false)
  }

  return (
    <div className="bg-[#0f1f15] border border-green-500/20 rounded-xl p-5">
      <div className="w-9 h-9 bg-green-400 rounded-full mb-3 animate-pulse" />
      <h2 className="font-bold text-white mb-1">Olá, vamos analisar seu negócio hoje?</h2>
      <p className="text-xs text-white/40 mb-4">A IA da Savra está pronta para ajudar.</p>
      <div className="flex gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
          placeholder="Pergunte algo sobre sua empresa..."
          className="flex-1 bg-white/5 border border-green-500/20 rounded-lg px-4 py-2 text-sm text-white placeholder-white/30 outline-none focus:border-green-500/50"
        />
        <button
          onClick={handleSend}
          disabled={loading}
          className="bg-green-500 hover:bg-green-600 disabled:opacity-50 text-black rounded-lg px-4 py-2 text-sm font-medium transition-colors"
        >
          {loading ? "..." : "→"}
        </button>
      </div>
      {response && (
        <p className="mt-3 text-sm text-white/70 bg-green-500/5 border border-green-500/20 rounded-lg px-4 py-3 leading-relaxed">
          {response}
        </p>
      )}
    </div>
  )
}