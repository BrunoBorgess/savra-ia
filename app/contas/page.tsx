"use client"
import { useState, useEffect, useCallback } from "react"
import Sidebar from "@/components/Sidebar"
import TopBar from "@/components/TopBar"
import { Bill } from "@/types"
import { Plus, Search, CheckCircle, Trash2, X, AlertCircle, Clock } from "lucide-react"

// ─── helpers ────────────────────────────────────────────────────────────────

function getDueStatus(due_date: string, paid: boolean) {
  if (paid) return { label: "Paga", color: "text-green-400", bg: "bg-green-500/10 border-green-500/20" }
  const days = Math.ceil((new Date(due_date).getTime() - Date.now()) / 86_400_000)
  if (days < 0) return { label: "Vencida", color: "text-red-400", bg: "bg-red-500/10 border-red-500/20" }
  if (days === 0) return { label: "Vence hoje", color: "text-yellow-400", bg: "bg-yellow-500/10 border-yellow-500/20" }
  if (days <= 3) return { label: `${days}d`, color: "text-orange-400", bg: "bg-orange-500/10 border-orange-500/20" }
  return { label: `${days}d`, color: "text-white/40", bg: "bg-white/5 border-white/10" }
}

function fmt(n: number) {
  return n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })
}

// ─── modal de nova conta ─────────────────────────────────────────────────────

function NovaContaModal({ onClose, onCreated }: { onClose: () => void; onCreated: () => void }) {
  const [name, setName] = useState("")
  const [amount, setAmount] = useState("")
  const [due_date, setDueDate] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  async function handleSubmit() {
    if (!name.trim() || !amount || !due_date) { setError("Preencha todos os campos."); return }
    setLoading(true)
    setError("")
    const res = await fetch("/api/contas", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, amount: parseFloat(amount.replace(",", ".")), due_date }),
    })
    if (res.ok) { onCreated(); onClose() }
    else { const d = await res.json(); setError(d.error ?? "Erro ao criar conta.") }
    setLoading(false)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-md bg-[#0d1410] border border-green-900/30 rounded-2xl p-6 shadow-xl">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-white font-semibold">Nova Conta a Pagar</h2>
          <button onClick={onClose} className="text-white/30 hover:text-white transition-colors">
            <X size={18} />
          </button>
        </div>

        <div className="flex flex-col gap-3">
          <div>
            <label className="text-xs text-white/40 mb-1 block">Nome / Descrição</label>
            <input
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Ex: Aluguel, Fornecedor X..."
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
            <label className="text-xs text-white/40 mb-1 block">Data de Vencimento</label>
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

export default function ContasPage() {
  const [bills, setBills] = useState<Bill[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)

  // filtros
  const [search, setSearch] = useState("")
  const [status, setStatus] = useState<"all" | "paid" | "unpaid">("unpaid")
  const [from, setFrom] = useState("")
  const [to, setTo] = useState("")

  const fetchBills = useCallback(async () => {
    setLoading(true)
    const params = new URLSearchParams()
    if (status !== "all") params.set("status", status)
    if (search) params.set("search", search)
    if (from) params.set("from", from)
    if (to) params.set("to", to)

    const res = await fetch(`/api/contas?${params}`)
    const data = await res.json()
    setBills(Array.isArray(data) ? data : [])
    setLoading(false)
  }, [status, search, from, to])

  useEffect(() => { fetchBills() }, [fetchBills])

  async function markAsPaid(id: string) {
    await fetch(`/api/contas/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ paid: true }),
    })
    fetchBills()
  }

  async function deleteBill(id: string) {
    if (!confirm("Remover esta conta?")) return
    await fetch(`/api/contas/${id}`, { method: "DELETE" })
    fetchBills()
  }

  // métricas resumo
  const totalPendente = bills.filter(b => !b.paid).reduce((a, b) => a + b.amount, 0)
  const totalPago = bills.filter(b => b.paid).reduce((a, b) => a + b.amount, 0)
  const vencidas = bills.filter(b => !b.paid && new Date(b.due_date) < new Date()).length

  return (
    <div className="flex h-screen bg-[#0a0f0d] text-white">
      <Sidebar />
      <div className="flex flex-col flex-1 overflow-hidden">
        <TopBar />

        <main className="flex-1 overflow-y-auto p-6 flex flex-col gap-5">

          {/* header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-lg font-bold text-white">Contas a Pagar</h1>
              <p className="text-xs text-white/40 mt-0.5">Gerencie seus compromissos financeiros</p>
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
              <p className="text-xs text-white/30 mt-1">{bills.filter(b => !b.paid).length} conta(s)</p>
            </div>
            <div className="bg-[#0d1410] border border-green-900/20 rounded-xl p-4">
              <p className="text-xs text-white/40 uppercase tracking-wider mb-2">Pagas (filtro atual)</p>
              <p className="text-xl font-bold text-green-400">{fmt(totalPago)}</p>
              <p className="text-xs text-white/30 mt-1">{bills.filter(b => b.paid).length} conta(s)</p>
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
                placeholder="Buscar por nome..."
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
              {(["unpaid", "all", "paid"] as const).map(s => (
                <button
                  key={s}
                  onClick={() => setStatus(s)}
                  className={`px-4 py-2 transition-colors ${status === s ? "bg-green-500/20 text-green-400" : "text-white/40 hover:text-white"}`}
                >
                  {s === "unpaid" ? "Pendentes" : s === "paid" ? "Pagas" : "Todas"}
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
              <span>Descrição</span>
              <span>Vencimento</span>
              <span>Valor</span>
              <span>Status</span>
              <span className="text-right">Ações</span>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-16 text-white/20 text-sm gap-2">
                <Clock size={14} className="animate-spin" /> Carregando...
              </div>
            ) : bills.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 gap-2 text-white/20">
                <CheckCircle size={28} />
                <p className="text-sm">Nenhuma conta encontrada</p>
              </div>
            ) : (
              <div className="divide-y divide-white/[0.04]">
                {bills.map(bill => {
                  const due = getDueStatus(bill.due_date, bill.paid)
                  return (
                    <div
                      key={bill.id}
                      className="grid grid-cols-[1fr_130px_130px_110px_80px] gap-4 px-5 py-3.5 items-center hover:bg-white/[0.02] transition-colors"
                    >
                      <span className="text-sm text-white/80 truncate">{bill.name}</span>

                      <span className="text-xs text-white/40">
                        {new Date(bill.due_date + "T00:00:00").toLocaleDateString("pt-BR")}
                      </span>

                      <span className="text-sm font-medium text-white">{fmt(bill.amount)}</span>

                      <span className={`text-xs px-2.5 py-1 rounded-full border w-fit ${due.bg} ${due.color}`}>
                        {due.label}
                      </span>

                      <div className="flex items-center justify-end gap-2">
                        {!bill.paid && (
                          <button
                            onClick={() => markAsPaid(bill.id)}
                            title="Marcar como paga"
                            className="text-white/20 hover:text-green-400 transition-colors"
                          >
                            <CheckCircle size={16} />
                          </button>
                        )}
                        <button
                          onClick={() => deleteBill(bill.id)}
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
        <NovaContaModal
          onClose={() => setShowModal(false)}
          onCreated={fetchBills}
        />
      )}
    </div>
  )
}
