import Sidebar from "@/components/Sidebar"
import TopBar from "@/components/TopBar"
import IAChat from "@/components/IAChat"

export default function IAPage() {
  return (
    <div className="flex h-screen bg-[#0a0f0d] text-white">
      <Sidebar />
      <div className="flex flex-col flex-1 overflow-hidden">
        <TopBar />
        <IAChat />
      </div>
    </div>
  )
}