"use client"
import { useState, useEffect, useCallback } from "react"
import Sidebar from "@/components/Sidebar"
import TopBar from "@/components/TopBar"
import { Receivable } from "@/types"
import { Plus, Search, CheckCircle, Trash2, X, AlertCircle, Clock } from "lucide-react"

// ─── helpers ────────────────────────────────────────────────────────────────

function getDueStatus(due_date: string, received: boolean) {
  if (received) return { label: "Recebida", color: "text-green-400", bg: "bg-green-500/10 border-green-500/20" }
  const days = Math.ceil((new Date(due_date).getTime() - Date.now()) / 86_400_000)
  if (days < 0) return { label: "Vencida", color: "text-red-400", bg: "bg-red-500/10 border-red-500/20" }
  if (days === 0) return { label: "Vence hoje", color: "text-yellow-400", bg: "bg-yellow-500/10 border-yellow-500/20" }
  if (days <= 3) return { label: `${days}d`, color: "text-orange-400", bg: "bg-orange-500/10 border-orange-500/20" }
  return { label: `${days}d`, color: "text-white/40", bg: "bg-white/5 border-white/10" }
}

function fmt(n: number) {
  return n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })
}

// ─── modal de nova conta a receber ──────────────────────────────────────────

function NovaReceitaModal({ onClose, onCreated }: { onClose: () => void; onCreated: () => void }) {
  const [client, setClient] = useState("")
  const [amount, setAmount] = useState("")
  const [due_date, setDueDate] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  async function handleSubmit() {
    if (!client.trim() || !amount || !due_date) { setError("Preencha todos os campos."); return }
    setLoading(true)
    setError("")
    const res = await fetch("/api/contas-receber", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ client, amount: parseFloat(amount.replace(",", ".")), due_date }),
    })
    if (res.ok) { onCreated(); onClose() }
    else { const d = await res.json(); setError(d.error ?? "Erro ao criar conta.") }
    setLoading(false)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-md bg-[#0d1410] border border-green-900/30 rounded-2xl p-6 shadow-xl">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-white font-semibold">Nova Conta a Receber</h2>
          <button onClick={onClose} className="text-white/30 hover:text-white transition-colors">
            <X size={18} />
          </button>
        </div>

        <div className="flex flex-col gap-3">
          <div>
            <label className="text-xs text-white/40 mb-1 block">Cliente / Descrição</label>
            <input
              value={client}
              onChange={e => setClient(e.target.value)}
              placeholder="Ex: Cliente X, Venda Y..."
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-white/20 outline-none focus:border-green-500/50 transition-colors"
            />
          </div>
          <div>
            <label className="text-xs text-white/40 mb-1 block">Valor (R$)</label>
            <input
              value={amount}
              onChange={e => setAmount(e.target.value)}
              placeholder="2500,00"
              type="text"
              inputMode="decimal"
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-white/20 outline-none focus:border-green-500/50 transition-colors"
            />
          </div>
          <div>
            <label className="text-xs text-white/40 mb-1 block">Data de Recebimento Prevista</label>
            <input
              value={due_date}
              onChange={e => setDueDate(e.target.value)}
              type="date"
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white outline-none focus:border-green-500/50 transition-colors [color-scheme:dark]"
            />
          </div>

          {error && (
            <p className="text-xs text-red-400 flex items-center gap-1.5">
              <AlertCircle size={12} /> {error}
            </p>
          )}

          <button
            onClick={handleSubmit}
            disabled={loading}
            className="mt-1 w-full bg-green-500 hover:bg-green-600 disabled:opacity-50 text-black font-semibold rounded-xl py-2.5 text-sm transition-colors"
          >
            {loading ? "Salvando..." : "Cadastrar Conta"}
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── página principal ────────────────────────────────────────────────────────

export default function ContasReceberPage() {
  const [receivables, setReceivables] = useState<Receivable[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)

  // filtros
  const [search, setSearch] = useState("")
  const [status, setStatus] = useState<"all" | "received" | "unreceived">("unreceived")
  const [from, setFrom] = useState("")
  const [to, setTo] = useState("")

  const fetchReceivables = useCallback(async () => {
    setLoading(true)
    const params = new URLSearchParams()
    if (status !== "all") params.set("status", status)
    if (search) params.set("search", search)
    if (from) params.set("from", from)
    if (to) params.set("to", to)

    const res = await fetch(`/api/contas-receber?${params}`)
    const data = await res.json()
    setReceivables(Array.isArray(data) ? data : [])
    setLoading(false)
  }, [status, search, from, to])

  useEffect(() => { fetchReceivables() }, [fetchReceivables])

  async function markAsReceived(id: string) {
    await fetch(`/api/contas-receber/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ received: true }),
    })
    fetchReceivables()
  }

  async function deleteReceivable(id: string) {
    if (!confirm("Remover esta conta?")) return
    await fetch(`/api/contas-receber/${id}`, { method: "DELETE" })
    fetchReceivables()
  }

  // métricas resumo
  const totalPendente = receivables.filter(r => !r.received).reduce((a, r) => a + r.amount, 0)
  const totalRecebido = receivables.filter(r => r.received).reduce((a, r) => a + r.amount, 0)
  const vencidas = receivables.filter(r => !r.received && new Date(r.due_date) < new Date()).length

  return (
    <div className="flex h-screen bg-[#0a0f0d] text-white">
      <Sidebar />
      <div className="flex flex-col flex-1 overflow-hidden">
        <TopBar />

        <main className="flex-1 overflow-y-auto p-6 flex flex-col gap-5">

          {/* header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-lg font-bold text-white">Contas a Receber</h1>
              <p className="text-xs text-white/40 mt-0.5">Acompanhe seus recebimentos previstos</p>
            </div>
            <button
              onClick={() => setShowModal(true)}
              className="flex items-center gap-2 bg-green-500 hover:bg-green-600 text-black font-semibold text-sm px-4 py-2 rounded-xl transition-colors"
            >
              <Plus size={15} /> Nova Conta
            </button>
          </div>

          {/* resumo */}
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-[#0d1410] border border-green-900/20 rounded-xl p-4">
              <p className="text-xs text-white/40 uppercase tracking-wider mb-2">Total Pendente</p>
              <p className="text-xl font-bold text-white">{fmt(totalPendente)}</p>
              <p className="text-xs text-white/30 mt-1">{receivables.filter(r => !r.received).length} conta(s)</p>
            </div>
            <div className="bg-[#0d1410] border border-green-900/20 rounded-xl p-4">
              <p className="text-xs text-white/40 uppercase tracking-wider mb-2">Recebidas (filtro atual)</p>
              <p className="text-xl font-bold text-green-400">{fmt(totalRecebido)}</p>
              <p className="text-xs text-white/30 mt-1">{receivables.filter(r => r.received).length} conta(s)</p>
            </div>
            <div className="bg-[#0d1410] border border-red-900/20 rounded-xl p-4">
              <p className="text-xs text-white/40 uppercase tracking-wider mb-2">Vencidas</p>
              <p className="text-xl font-bold text-red-400">{vencidas}</p>
              <p className="text-xs text-white/30 mt-1">conta(s) em atraso</p>
            </div>
          </div>

          {/* filtros */}
          <div className="flex gap-3 flex-wrap">
            {/* busca */}
            <div className="flex items-center gap-2 bg-white/[0.04] border border-white/10 rounded-xl px-3 py-2 flex-1 min-w-[180px] focus-within:border-green-500/40 transition-colors">
              <Search size={14} className="text-white/30 flex-shrink-0" />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Buscar por cliente..."
                className="bg-transparent text-sm text-white placeholder-white/20 outline-none flex-1"
              />
              {search && (
                <button onClick={() => setSearch("")} className="text-white/20 hover:text-white/60">
                  <X size={12} />
                </button>
              )}
            </div>

            {/* status */}
            <div className="flex bg-white/[0.04] border border-white/10 rounded-xl overflow-hidden text-xs">
              {(["unreceived", "all", "received"] as const).map(s => (
                <button
                  key={s}
                  onClick={() => setStatus(s)}
                  className={`px-4 py-2 transition-colors ${status === s ? "bg-green-500/20 text-green-400" : "text-white/40 hover:text-white"}`}
                >
                  {s === "unreceived" ? "Pendentes" : s === "received" ? "Recebidas" : "Todas"}
                </button>
              ))}
            </div>

            {/* datas */}
            <input
              type="date"
              value={from}
              onChange={e => setFrom(e.target.value)}
              className="bg-white/[0.04] border border-white/10 rounded-xl px-3 py-2 text-xs text-white/50 outline-none focus:border-green-500/40 transition-colors [color-scheme:dark]"
              title="Data inicial"
            />
            <input
              type="date"
              value={to}
              onChange={e => setTo(e.target.value)}
              className="bg-white/[0.04] border border-white/10 rounded-xl px-3 py-2 text-xs text-white/50 outline-none focus:border-green-500/40 transition-colors [color-scheme:dark]"
              title="Data final"
            />
            {(from || to) && (
              <button onClick={() => { setFrom(""); setTo("") }} className="text-xs text-white/30 hover:text-white/60 flex items-center gap-1">
                <X size={12} /> limpar datas
              </button>
            )}
          </div>

          {/* tabela */}
          <div className="bg-[#0d1410] border border-green-900/20 rounded-xl overflow-hidden">
            {/* header da tabela */}
            <div className="grid grid-cols-[1fr_130px_130px_110px_80px] gap-4 px-5 py-3 border-b border-white/5 text-xs text-white/30 uppercase tracking-wider">
              <span>Cliente / Descrição</span>
              <span>Previsão</span>
              <span>Valor</span>
              <span>Status</span>
              <span className="text-right">Ações</span>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-16 text-white/20 text-sm gap-2">
                <Clock size={14} className="animate-spin" /> Carregando...
              </div>
            ) : receivables.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 gap-2 text-white/20">
                <CheckCircle size={28} />
                <p className="text-sm">Nenhuma conta encontrada</p>
              </div>
            ) : (
              <div className="divide-y divide-white/[0.04]">
                {receivables.map(receivable => {
                  const due = getDueStatus(receivable.due_date, receivable.received)
                  return (
                    <div
                      key={receivable.id}
                      className="grid grid-cols-[1fr_130px_130px_110px_80px] gap-4 px-5 py-3.5 items-center hover:bg-white/[0.02] transition-colors"
                    >
                      <span className="text-sm text-white/80 truncate">{receivable.title}</span>

                      <span className="text-xs text-white/40">
                        {new Date(receivable.due_date + "T00:00:00").toLocaleDateString("pt-BR")}
                      </span>

                      <span className="text-sm font-medium text-white">{fmt(receivable.amount)}</span>

                      <span className={`text-xs px-2.5 py-1 rounded-full border w-fit ${due.bg} ${due.color}`}>
                        {due.label}
                      </span>

                      <div className="flex items-center justify-end gap-2">
                        {!receivable.received && (
                          <button
                            onClick={() => markAsReceived(receivable.id)}
                            title="Marcar como recebida"
                            className="text-white/20 hover:text-green-400 transition-colors"
                          >
                            <CheckCircle size={16} />
                          </button>
                        )}
                        <button
                          onClick={() => deleteReceivable(receivable.id)}
                          title="Remover"
                          className="text-white/20 hover:text-red-400 transition-colors"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

        </main>
      </div>

      {showModal && (
        <NovaReceitaModal
          onClose={() => setShowModal(false)}
          onCreated={fetchReceivables}
        />
      )}
    </div>
  )
}
