import { supabase } from "@/lib/supabase"
import Sidebar from "@/components/Sidebar"
import TopBar from "@/components/TopBar"
import RelatoriosClient from "@/components/RelatoriosClient"
import { Transaction, Bill, Receivable } from "@/types"

function monthKey(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`
}

async function getData() {
  const [{ data: transactions }, { data: bills }, { data: receivables }] = await Promise.all([
    supabase.from("transactions").select("*").order("date", { ascending: false }),
    supabase.from("bills").select("*").order("due_date", { ascending: true }),
    supabase.from("receivables").select("*").order("due_date", { ascending: true }),
  ])

  const txs = (transactions ?? []) as Transaction[]
  const allBills = (bills ?? []) as Bill[]
  const allReceivables = (receivables ?? []) as Receivable[]

  const receita = txs.filter(t => t.type === "income").reduce((a, t) => a + t.amount, 0)
  const despesas = txs.filter(t => t.type === "expense").reduce((a, t) => a + t.amount, 0)
  const saldoAtual = receita - despesas

  const totalAReceber = allReceivables.filter(r => !r.received).reduce((a, r) => a + r.amount, 0)
  const totalAPagar = allBills.filter(b => !b.paid).reduce((a, b) => a + b.amount, 0)
  const saldoProjetado = saldoAtual + totalAReceber - totalAPagar

  // últimos 6 meses (incluindo o atual)
  const now = new Date()
  const months: { key: string; mes: string; receita: number; despesas: number }[] = []
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    months.push({ key: monthKey(d), mes: d.toLocaleDateString("pt-BR", { month: "short", year: "2-digit" }), receita: 0, despesas: 0 })
  }
  const monthMap = new Map(months.map(m => [m.key, m]))
  txs.forEach(t => {
    const m = monthMap.get(monthKey(new Date(t.date)))
    if (!m) return
    if (t.type === "income") m.receita += t.amount
    else m.despesas += t.amount
  })

  const proximosRecebimentos = allReceivables.filter(r => !r.received).slice(0, 5)
  const proximosPagamentos = allBills.filter(b => !b.paid).slice(0, 5)

  return {
    transactions: txs,
    saldoAtual,
    totalAReceber,
    totalAPagar,
    saldoProjetado,
    chartData: months,
    proximosRecebimentos,
    proximosPagamentos,
  }
}

export default async function RelatoriosPage() {
  const data = await getData()

  return (
    <div className="flex h-screen bg-[#0a0f0d] text-white">
      <Sidebar />
      <div className="flex flex-col flex-1 overflow-hidden">
        <TopBar />
        <main className="flex-1 overflow-y-auto p-6 flex flex-col gap-5">

          {/* header */}
          <div>
            <h1 className="text-lg font-bold text-white">Relatórios</h1>
            <p className="text-xs text-white/40 mt-0.5">Visão consolidada do seu negócio</p>
          </div>

          <RelatoriosClient {...data} />

        </main>
      </div>
    </div>
  )
}
