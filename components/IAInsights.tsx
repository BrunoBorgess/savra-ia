import { supabase } from "@/lib/supabase"
import { Insight } from "@/types"

async function getInsights(): Promise<Insight[]> {
  const { data, error } = await supabase
    .from("insights")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(3)

  if (error) return []
  return data
}

export default async function IAInsights() {
  const insights = await getInsights()

  return (
    <div className="bg-[#0d1410] border border-green-900/20 rounded-xl p-4">
      <p className="text-sm font-medium text-white mb-1">Análise da IA</p>
      <p className="text-xs text-white/40 mb-4">Insights automáticos</p>
      <div className="flex flex-col gap-2">
        {insights.map((insight) => (
          <div key={insight.id} className="flex items-start gap-2 bg-green-500/5 border border-green-500/15 rounded-lg px-3 py-2.5 cursor-pointer hover:bg-green-500/10 transition-colors">
            <span className="text-green-400 text-sm mt-0.5">💡</span>
            <div className="flex-1">
              <p className="text-xs font-medium text-white/80 mb-0.5">{insight.title}</p>
              <p className="text-xs text-white/50 leading-relaxed">{insight.description}</p>
              {insight.saving && (
                <p className="text-xs text-green-400 mt-1 font-medium">
                  Economia: R$ {insight.saving.toLocaleString("pt-BR")}/mês
                </p>
              )}
            </div>
            <span className="text-white/20 text-sm">›</span>
          </div>
        ))}
      </div>
    </div>
  )
}