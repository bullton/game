import { Gamepad2 } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="bg-slate-900/95 border-t border-red-500/30 mt-auto">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Gamepad2 className="w-6 h-6 text-red-500" />
            <span className="text-gray-400 text-sm">
              NES Retro Game Platform - 经典红白机游戏平台
            </span>
          </div>
          <div className="text-gray-500 text-xs text-center">
            致敬经典 · 重温童年 · 竞技荣耀
          </div>
          <div className="text-gray-500 text-xs">
            © {new Date().getFullYear()} NES Retro
          </div>
        </div>
      </div>
    </footer>
  )
}
