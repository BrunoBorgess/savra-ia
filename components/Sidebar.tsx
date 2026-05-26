"use client"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { LayoutDashboard, Bot, TrendingUp, Receipt, DollarSign, BarChart2 } from "lucide-react"

const navItems = [
  { icon: <LayoutDashboard size={16} />, label: "Dashboard", href: "/dashboard" },
  { icon: <Bot size={16} />, label: "IA Savra", href: "/ia" },
  { icon: <TrendingUp size={16} />, label: "Fluxo de Caixa", href: "/fluxo-caixa" },
  { icon: <Receipt size={16} />, label: "Contas a Pagar", href: "/contas" },
  { icon: <DollarSign size={16} />, label: "Contas a Receber", href: "/contas-receber" },
  { icon: <BarChart2 size={16} />, label: "Relatórios", href: "/relatorios" },
]

export default function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="w-56 bg-[#0d1410] border-r border-green-900/30 flex flex-col py-5 gap-1">
      <div className="px-5 mb-4 text-green-400 font-bold text-lg tracking-widest">
        ● SAVRA
      </div>
      {navItems.map((item) => (
        <Link
          key={item.label}
          href={item.href}
          className={`flex items-center gap-3 px-5 py-2.5 text-sm border-l-2 transition-all
            ${pathname === item.href
              ? "text-green-400 border-green-500 bg-green-500/10"
              : "text-white/40 border-transparent hover:text-white hover:bg-green-500/5"
            }`}
        >
          {item.icon}
          {item.label}
        </Link>
      ))}
    </aside>
  )
}