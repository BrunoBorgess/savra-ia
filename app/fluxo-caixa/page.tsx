import { supabase } from "@/lib/supabase"
import Sidebar from "@/components/Sidebar"
import TopBar from "@/components/TopBar"
import FluxoCaixaClient from "@/components/FluxoCaixaClient"
import { Transaction } from "@/types"

async function getData() {
  const { data, error } = await supabase
    .from("transactions")
    .select("*")
    .order("date", { ascending: false })

  if (error || !data) return { transactions: [], receita: 0, despesas: 0, fluxo: 0 }

  const receita = data.filter(t => t.type === "income").reduce((acc, t) => acc + t.amount, 0)
  const despesas = data.filter(t => t.type === "expense").reduce((acc, t) => acc + t.amount, 0)

  return { transactions: data as Transaction[], receita, despesas, fluxo: receita - despesas }
}

export default async function FluxoCaixaPage() {
  const { transactions, receita, despesas, fluxo } = await getData()

  return (
    <div className="flex h-screen bg-[#0a0f0d] text-white">
      <Sidebar />
      <div className="flex flex-col flex-1 overflow-hidden">
        <TopBar />
        <main className="flex-1 overflow-y-auto p-6 flex flex-col gap-5">

          {/* Header */}
          <div>
            <h1 className="text-xl font-bold text-white">Fluxo de Caixa</h1>
            <p className="text-sm text-white/40 mt-0.5">Visão geral das suas movimentações financeiras</p>
          </div>

          {/* Cards de resumo */}
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-[#0d1410] border border-green-900/20 rounded-xl p-5">
              <p className="text-xs text-white/40 mb-1">Receita Total</p>
              <p className="text-2xl font-bold text-green-400">
                R$ {receita.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
              </p>
            </div>
            <div className="bg-[#0d1410] border border-green-900/20 rounded-xl p-5">
              <p className="text-xs text-white/40 mb-1">Despesas Total</p>
              <p className="text-2xl font-bold text-red-400">
                R$ {despesas.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
              </p>
            </div>
            <div className="bg-[#0d1410] border border-green-900/20 rounded-xl p-5">
              <p className="text-xs text-white/40 mb-1">Saldo</p>
              <p className={`text-2xl font-bold ${fluxo >= 0 ? "text-green-400" : "text-red-400"}`}>
                R$ {fluxo.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
              </p>
            </div>
          </div>

          {/* Gráfico + Tabela (client component) */}
          <FluxoCaixaClient transactions={transactions} />

        </main>
      </div>
    </div>
  )
}