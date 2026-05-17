import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Gamepad2, Trophy, Zap, Star } from 'lucide-react'
import GameCard from '../components/GameCard'
import type { Game } from '../types'
import { api } from '../utils/api'

export default function Home() {
  const [games, setGames] = useState<Game[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.games.getAll()
      .then(data => setGames(data.games))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const featuredGames = games.slice(0, 6)

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 px-4">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-red-500/10 via-transparent to-transparent" />
        <div className="absolute inset-0 opacity-10" style={{
          backgroundImage: 'linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)',
          backgroundSize: '50px 50px'
        }} />

        <div className="relative max-w-7xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-red-500/10 border border-red-500/30 rounded-full px-4 py-2 mb-6">
            <Zap className="w-4 h-4 text-red-400" />
            <span className="text-red-400 text-sm font-medium">经典重现 · 怀旧竞技</span>
          </div>

          <h1 className="text-5xl md:text-7xl font-black text-white mb-6 leading-tight" style={{ fontFamily: '"Press Start 2P", monospace', textShadow: '0 0 40px rgba(255,45,85,0.5)' }}>
            NES RETRO
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 via-pink-500 to-cyan-400">
              GAME PLATFORM
            </span>
          </h1>

          <p className="text-gray-400 text-lg md:text-xl max-w-2xl mx-auto mb-10">
            汇集经典红白机游戏，重温童年回忆，挑战全球排行榜，
            <br />
            看看谁才是真正的怀旧游戏王者！
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link
              to="/games"
              className="bg-gradient-to-r from-red-500 to-pink-600 text-white px-8 py-3 rounded-xl font-bold text-lg hover:shadow-lg hover:shadow-red-500/30 transition-all hover:-translate-y-0.5"
            >
              开始游戏
            </Link>
            <Link
              to="/leaderboard"
              className="bg-slate-800/80 text-cyan-400 border border-cyan-400/30 px-8 py-3 rounded-xl font-bold text-lg hover:bg-slate-700/80 hover:shadow-lg hover:shadow-cyan-400/20 transition-all hover:-translate-y-0.5 flex items-center gap-2"
            >
              <Trophy className="w-5 h-5" />
              查看排行榜
            </Link>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-8 max-w-lg mx-auto mt-16">
            <div className="text-center">
              <div className="text-3xl font-black text-white">{games.length}+</div>
              <div className="text-gray-500 text-sm mt-1">经典游戏</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-black text-cyan-400">∞</div>
              <div className="text-gray-500 text-sm mt-1">欢乐时光</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-black text-pink-400">100%</div>
              <div className="text-gray-500 text-sm mt-1">怀旧情怀</div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Games */}
      <section className="py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl font-bold text-white flex items-center gap-3">
                <Star className="w-8 h-8 text-yellow-400" />
                热门游戏
              </h2>
              <p className="text-gray-400 mt-2">精选经典红白机游戏，带你回到那个纯真的年代</p>
            </div>
            <Link
              to="/games"
              className="text-cyan-400 hover:text-cyan-300 transition-colors text-sm font-medium"
            >
              查看全部 →
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map(i => (
                <div key={i} className="bg-slate-800/50 rounded-xl aspect-video animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredGames.map((game, index) => (
                <GameCard key={game.id} game={game} index={index} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-4 bg-slate-900/50">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-slate-800/30 border border-slate-700/50 rounded-xl p-6 text-center hover:border-red-500/30 transition-colors">
              <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Gamepad2 className="w-8 h-8 text-red-400" />
              </div>
              <h3 className="text-white font-bold text-lg mb-2">在线畅玩</h3>
              <p className="text-gray-400 text-sm">无需下载，浏览器直接游玩经典红白机游戏，支持多种经典游戏</p>
            </div>
            <div className="bg-slate-800/30 border border-slate-700/50 rounded-xl p-6 text-center hover:border-cyan-500/30 transition-colors">
              <div className="w-16 h-16 bg-cyan-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Trophy className="w-8 h-8 text-cyan-400" />
              </div>
              <h3 className="text-white font-bold text-lg mb-2">全球排行</h3>
              <p className="text-gray-400 text-sm">每款游戏都有独立排行榜，与全球玩家竞争，展示你的真实实力</p>
            </div>
            <div className="bg-slate-800/30 border border-slate-700/50 rounded-xl p-6 text-center hover:border-pink-500/30 transition-colors">
              <div className="w-16 h-16 bg-pink-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Star className="w-8 h-8 text-pink-400" />
              </div>
              <h3 className="text-white font-bold text-lg mb-2">记录成绩</h3>
              <p className="text-gray-400 text-sm">自动记录你的游戏成绩，查看个人历史成绩，见证你的成长</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
