"use client"
import dynamic from "next/dynamic"
import { Download, ArrowUpRight, ArrowDownRight } from "lucide-react"
import { Transaction, Bill, Receivable } from "@/types"

const BarChart = dynamic(() => import("recharts").then(m => ({ default: m.BarChart })), { ssr: false })
const Bar = dynamic(() => import("recharts").then(m => ({ default: m.Bar })), { ssr: false })
const XAxis = dynamic(() => import("recharts").then(m => ({ default: m.XAxis })), { ssr: false })
const YAxis = dynamic(() => import("recharts").then(m => ({ default: m.YAxis })), { ssr: false })
const CartesianGrid = dynamic(() => import("recharts").then(m => ({ default: m.CartesianGrid })), { ssr: false })
const Tooltip = dynamic(() => import("recharts").then(m => ({ default: m.Tooltip })), { ssr: false })
const ResponsiveContainer = dynamic(() => import("recharts").then(m => ({ default: m.ResponsiveContainer })), { ssr: false })
const Legend = dynamic(() => import("recharts").then(m => ({ default: m.Legend })), { ssr: false })

function fmt(n: number) {
  return n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })
}

function diasPara(due_date: string) {
  const days = Math.ceil((new Date(due_date).getTime() - Date.now()) / 86_400_000)
  if (days < 0) return "Vencida"
  if (days === 0) return "Hoje"
  return `${days}d`
}

type Props = {
  transactions: Transaction[]
  saldoAtual: number
  totalAReceber: number
  totalAPagar: number
  saldoProjetado: number
  chartData: { mes: string; receita: number; despesas: number }[]
  proximosRecebimentos: Receivable[]
  proximosPagamentos: Bill[]
}

export default function RelatoriosClient({
  transactions,
  saldoAtual,
  totalAReceber,
  totalAPagar,
  saldoProjetado,
  chartData,
  proximosRecebimentos,
  proximosPagamentos,
}: Props) {

  function exportCSV() {
    const header = "data,descricao,tipo,valor\n"
    const rows = transactions
      .map(t => `${t.date},"${t.description.replace(/"/g, '""')}",${t.type === "income" ? "receita" : "despesa"},${t.amount}`)
      .join("\n")
    const blob = new Blob([header + rows], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `relatorio-savra-${new Date().toISOString().slice(0, 10)}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="flex flex-col gap-5">

      {/* ações */}
      <div className="flex justify-end">
        <button
          onClick={exportCSV}
          disabled={transactions.length === 0}
          className="flex items-center gap-2 bg-white/[0.04] border border-white/10 hover:border-green-500/40 hover:text-green-400 disabled:opacity-40 text-white/60 text-xs px-4 py-2 rounded-xl transition-colors"
        >
          <Download size={13} /> Exportar CSV
        </button>
      </div>

      {/* cards */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-[#0d1410] border border-green-900/20 rounded-xl p-4">
          <p className="text-xs text-white/40 uppercase tracking-wider mb-2">Saldo Atual</p>
          <p className={`text-xl font-bold ${saldoAtual >= 0 ? "text-white" : "text-red-400"}`}>{fmt(saldoAtual)}</p>
        </div>
        <div className="bg-[#0d1410] border border-green-900/20 rounded-xl p-4">
          <p className="text-xs text-white/40 uppercase tracking-wider mb-2">A Receber (pendente)</p>
          <p className="text-xl font-bold text-green-400">{fmt(totalAReceber)}</p>
        </div>
        <div className="bg-[#0d1410] border border-red-900/20 rounded-xl p-4">
          <p className="text-xs text-white/40 uppercase tracking-wider mb-2">A Pagar (pendente)</p>
          <p className="text-xl font-bold text-red-400">{fmt(totalAPagar)}</p>
        </div>
        <div className="bg-[#0d1410] border border-green-900/20 rounded-xl p-4">
          <p className="text-xs text-white/40 uppercase tracking-wider mb-2">Saldo Projetado</p>
          <p className={`text-xl font-bold ${saldoProjetado >= 0 ? "text-green-400" : "text-red-400"}`}>{fmt(saldoProjetado)}</p>
        </div>
      </div>

      {/* gráfico */}
      <div className="bg-[#0d1410] border border-green-900/20 rounded-xl p-5">
        <p className="text-sm font-medium text-white mb-1">Receita vs Despesas</p>
        <p className="text-xs text-white/40 mb-5">Últimos 6 meses</p>

        {chartData.every(m => m.receita === 0 && m.despesas === 0) ? (
          <div className="h-48 flex items-center justify-center text-white/30 text-sm">
            Sem dados para exibir
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={chartData} barGap={4}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="mes" tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={(v: number) => `R$${(v / 1000).toFixed(0)}k`} />
              <Tooltip
                contentStyle={{ background: "#0d1410", border: "1px solid rgba(74,222,128,0.2)", borderRadius: 8, fontSize: 12 }}
                formatter={(value: number) => [`R$ ${value.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`, ""]}
              />
              <Legend wrapperStyle={{ fontSize: 12, color: "rgba(255,255,255,0.4)" }} />
              <Bar dataKey="receita" fill="#4ade80" radius={[4, 4, 0, 0]} name="Receita" />
              <Bar dataKey="despesas" fill="#f87171" radius={[4, 4, 0, 0]} name="Despesas" />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* próximos recebimentos / pagamentos */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-[#0d1410] border border-green-900/20 rounded-xl p-4">
          <p className="text-sm font-medium text-white mb-1 flex items-center gap-2">
            <ArrowUpRight size={14} className="text-green-400" /> Próximos Recebimentos
          </p>
          <p className="text-xs text-white/40 mb-4">Contas a receber pendentes</p>
          {proximosRecebimentos.length === 0 ? (
            <p className="text-xs text-white/30 py-4 text-center">Nada pendente por aqui</p>
          ) : (
            <div className="flex flex-col gap-2">
              {proximosRecebimentos.map(r => (
                <div key={r.id} className="flex justify-between items-center bg-white/[0.03] rounded-lg px-3 py-2">
                  <div>
                    <p className="text-xs text-white/70">{r.client}</p>
                    <p className="text-[10px] text-white/30">{diasPara(r.due_date)}</p>
                  </div>
                  <p className="text-xs font-medium text-green-400">{fmt(r.amount)}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-[#0d1410] border border-green-900/20 rounded-xl p-4">
          <p className="text-sm font-medium text-white mb-1 flex items-center gap-2">
            <ArrowDownRight size={14} className="text-red-400" /> Próximos Pagamentos
          </p>
          <p className="text-xs text-white/40 mb-4">Contas a pagar pendentes</p>
          {proximosPagamentos.length === 0 ? (
            <p className="text-xs text-white/30 py-4 text-center">Nada pendente por aqui</p>
          ) : (
            <div className="flex flex-col gap-2">
              {proximosPagamentos.map(b => (
                <div key={b.id} className="flex justify-between items-center bg-white/[0.03] rounded-lg px-3 py-2">
                  <div>
                    <p className="text-xs text-white/70">{b.name}</p>
                    <p className="text-[10px] text-white/30">{diasPara(b.due_date)}</p>
                  </div>
                  <p className="text-xs font-medium text-red-400">{fmt(b.amount)}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

    </div>
  )
}
