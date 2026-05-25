export default function TopBar() {
  return (
    <header className="flex items-center justify-between px-6 py-4 bg-[#0d1410] border-b border-green-900/20">
      <span className="text-white/40 text-sm">Bem-vindo de volta</span>
      <div className="flex items-center gap-2 bg-green-500/10 border border-green-500/30 rounded-full px-3 py-1.5 text-green-400 text-xs">
        <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
        IA Ativa
      </div>
    </header>
  )
}