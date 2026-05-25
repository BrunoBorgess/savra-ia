import { LayoutDashboard, Bot, TrendingUp, Receipt, DollarSign, BarChart2 } from "lucide-react"

const navItems = [
  { icon: <LayoutDashboard size={16} />, label: "Dashboard", active: true },
  { icon: <Bot size={16} />, label: "IA Savra" },
  { icon: <TrendingUp size={16} />, label: "Fluxo de Caixa" },
  { icon: <Receipt size={16} />, label: "Contas a Pagar" },
  { icon: <DollarSign size={16} />, label: "Contas a Receber" },
  { icon: <BarChart2 size={16} />, label: "Relatórios" },
]

export default function Sidebar() {
  return (
    <aside className="w-56 bg-[#0d1410] border-r border-green-900/30 flex flex-col py-5 gap-1">
      <div className="px-5 mb-4 text-green-400 font-bold text-lg tracking-widest">
        ● SAVRA
      </div>
      {navItems.map((item) => (
        <div
          key={item.label}
          className={`flex items-center gap-3 px-5 py-2.5 text-sm cursor-pointer border-l-2 transition-all
            ${item.active
              ? "text-green-400 border-green-500 bg-green-500/10"
              : "text-white/40 border-transparent hover:text-white hover:bg-green-500/5"
            }`}
        >
          <span>{item.icon}</span>
          {item.label}
        </div>
      ))}
    </aside>
  )
}