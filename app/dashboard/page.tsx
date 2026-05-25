import { supabase } from "@/lib/supabase"
import Sidebar from "@/components/Sidebar"
import TopBar from "@/components/TopBar"
import IAChatCard from "@/components/IAChatCard"
import MetricCard from "@/components/MetricCard"
import ContasAPagar from "@/components/ContasAPagar"
import IAInsights from "@/components/IAInsights"

async function getMetrics() {
  const { data, error } = await supabase
    .from("transactions")
    .select("amount, type")

  if (error || !data) return { receita: 0, despesas: 0, fluxo: 0 }

  const receita = data
    .filter((t) => t.type === "income")
    .reduce((acc, t) => acc + t.amount, 0)

  const despesas = data
    .filter((t) => t.type === "expense")
    .reduce((acc, t) => acc + t.amount, 0)

  const fluxo = receita - despesas

  return { receita, despesas, fluxo }
}

export default async function DashboardPage() {
  const { receita, despesas, fluxo } = await getMetrics()

  return (
    <div className="flex h-screen bg-[#0a0f0d] text-white">
      <Sidebar />
      <div className="flex flex-col flex-1 overflow-hidden">
        <TopBar />
        <main className="flex-1 overflow-y-auto p-6 flex flex-col gap-5">
          <IAChatCard />
          <div className="grid grid-cols-3 gap-4">
            <MetricCard
              label="Fluxo de Caixa"
              value={`R$ ${fluxo.toLocaleString("pt-BR")}`}
              change="+18,6%"
              trend="up"
            />
            <MetricCard
              label="Receita do Mês"
              value={`R$ ${receita.toLocaleString("pt-BR")}`}
              change="+12,3%"
              trend="up"
            />
            <MetricCard
              label="Despesas"
              value={`R$ ${despesas.toLocaleString("pt-BR")}`}
              change="-3,1%"
              trend="down"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <ContasAPagar />
            <IAInsights />
          </div>
        </main>
      </div>
    </div>
  )
}