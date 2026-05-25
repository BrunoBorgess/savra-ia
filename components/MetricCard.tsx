type Props = {
  label: string
  value: string
  change: string
  trend: "up" | "down"
}

export default function MetricCard({ label, value, change, trend }: Props) {
  return (
    <div className="bg-[#0d1410] border border-green-900/20 rounded-xl p-4">
      <p className="text-xs text-white/40 uppercase tracking-wider mb-2">{label}</p>
      <p className="text-xl font-bold text-white mb-1">{value}</p>
      <p className={`text-xs ${trend === "up" ? "text-green-400" : "text-red-400"}`}>
        {change} este mês
      </p>
    </div>
  )
}