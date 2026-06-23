"use client"
import { useState } from "react"
import { Transaction } from "@/types"
import dynamic from "next/dynamic"

const AreaChart = dynamic(() => import("recharts").then(m => ({ default: m.AreaChart })), { ssr: false })
const Area = dynamic(() => import("recharts").then(m => ({ default: m.Area })), { ssr: false })
const XAxis = dynamic(() => import("recharts").then(m => ({ default: m.XAxis })), { ssr: false })
const YAxis = dynamic(() => import("recharts").then(m => ({ default: m.YAxis })), { ssr: false })
const CartesianGrid = dynamic(() => import("recharts").then(m => ({ default: m.CartesianGrid })), { ssr: false })
const Tooltip = dynamic(() => import("recharts").then(m => ({ default: m.Tooltip })), { ssr: false })
const ResponsiveContainer = dynamic(() => import("recharts").then(m => ({ default: m.ResponsiveContainer })), { ssr: false })
const Legend = dynamic(() => import("recharts").then(m => ({ default: m.Legend })), { ssr: false })

function buildChartData(transactions: Transaction[]) {
  const map: Record<string, { mes: string; receita: number; despesas: number }> = {}

  transactions.forEach((t) => {
    const date = new Date(t.date)
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`
    const label = date.toLocaleDateString("pt-BR", { month: "short", year: "2-digit" })

    if (!map[key]) map[key] = { mes: label, receita: 0, despesas: 0 }

    if (t.type === "income") map[key].receita += t.amount
    else map[key].despesas += t.amount
  })

  return Object.values(map).sort((a, b) => a.mes.localeCompare(b.mes))
}

export default function FluxoCaixaClient({ transactions }: { transactions: Transaction[] }) {
  const [filter, setFilter] = useState<"all" | "income" | "expense">("all")
  const chartData = buildChartData(transactions)

  const filtered = transactions.filter((t) => {
    if (filter === "all") return true
    return t.type === filter
  })

  return (
    <div className="flex flex-col gap-5">

      {/* Gráfico */}
      <div className="bg-[#0d1410] border border-green-900/20 rounded-xl p-5">
        <p className="text-sm font-medium text-white mb-1">Evolução Mensal</p>
        <p className="text-xs text-white/40 mb-5">Receitas vs Despesas</p>

        {chartData.length === 0 ? (
          <div className="h-48 flex items-center justify-center text-white/30 text-sm">
            Sem dados para exibir
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="receita" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#4ade80" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#4ade80" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="despesas" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f87171" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#f87171" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="mes" tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={(v: number) => `R$${(v / 1000).toFixed(0)}k`} />
              <Tooltip
                contentStyle={{ background: "#0d1410", border: "1px solid rgba(74,222,128,0.2)", borderRadius: 8, fontSize: 12 }}
                formatter={(value: number) => [`R$ ${value.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`, ""]}
              />
              <Legend wrapperStyle={{ fontSize: 12, color: "rgba(255,255,255,0.4)" }} />
              <Area type="monotone" dataKey="receita" stroke="#4ade80" strokeWidth={2} fill="url(#receita)" name="Receita" />
              <Area type="monotone" dataKey="despesas" stroke="#f87171" strokeWidth={2} fill="url(#despesas)" name="Despesas" />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Tabela */}
      <div className="bg-[#0d1410] border border-green-900/20 rounded-xl p-5">
        <div className="flex justify-between items-center mb-4">
          <div>
            <p className="text-sm font-medium text-white">Transações</p>
            <p className="text-xs text-white/40">{filtered.length} registros</p>
          </div>
          <div className="flex gap-2">
            {[["all", "Todas"], ["income", "Receitas"], ["expense", "Despesas"]].map(([val, label]) => (
              <button
                key={val}
                onClick={() => setFilter(val as "all" | "income" | "expense")}
                className={`text-xs px-3 py-1.5 rounded-lg transition-all ${
                  filter === val
                    ? "bg-green-500/20 text-green-400 border border-green-500/30"
                    : "text-white/40 border border-white/10 hover:text-white"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-1">
          {filtered.length === 0 && (
            <p className="text-center text-white/30 text-sm py-8">Nenhuma transação encontrada</p>
          )}
          {filtered.map((t) => (
            <div key={t.id} className="flex justify-between items-center px-3 py-2.5 rounded-lg hover:bg-white/[0.03] transition-colors">
              <div className="flex items-center gap-3">
                <div className={`w-2 h-2 rounded-full ${t.type === "income" ? "bg-green-400" : "bg-red-400"}`} />
                <div>
                  <p className="text-sm text-white/80">{t.description}</p>
                  <p className="text-xs text-white/30">
                    {new Date(t.date).toLocaleDateString("pt-BR")}
                  </p>
                </div>
              </div>
              <p className={`text-sm font-medium ${t.type === "income" ? "text-green-400" : "text-red-400"}`}>
                {t.type === "income" ? "+" : "-"} R$ {t.amount.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
              </p>
            </div>
          ))}
        </div>
      </div>

    </div>
  )
}