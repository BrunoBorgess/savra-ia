import { supabase } from "@/lib/supabase"
import { Bill } from "@/types"

async function getBills(): Promise<Bill[]> {
  const { data, error } = await supabase
    .from("bills")
    .select("*")
    .eq("paid", false)
    .order("due_date", { ascending: true })
    .limit(3)

  if (error) return []
  return data
}

export default async function ContasAPagar() {
  const bills = await getBills()

  const total = bills.reduce((acc, bill) => acc + bill.amount, 0)

  function getDueLabel(due_date: string) {
    const days = Math.ceil(
      (new Date(due_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
    )
    if (days <= 0) return "Vence hoje"
    return `Vence em ${days} dia${days > 1 ? "s" : ""}`
  }

  return (
    <div className="bg-[#0d1410] border border-green-900/20 rounded-xl p-4">
      <p className="text-sm font-medium text-white mb-1">Contas a Pagar</p>
      <p className="text-xs text-white/40 mb-4">Próximos 7 dias</p>
      <p className="text-xl font-bold text-white mb-4">
        R$ {total.toLocaleString("pt-BR")}
      </p>
      <div className="flex flex-col gap-2">
        {bills.map((bill) => (
          <div key={bill.id} className="flex justify-between items-center bg-white/[0.03] rounded-lg px-3 py-2">
            <div>
              <p className="text-xs text-white/70">{bill.name}</p>
              <p className="text-[10px] text-white/30">{getDueLabel(bill.due_date)}</p>
            </div>
            <p className="text-xs font-medium text-white">
              R$ {bill.amount.toLocaleString("pt-BR")}
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}