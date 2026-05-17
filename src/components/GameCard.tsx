import { Link } from 'react-router-dom'
import type { Game } from '../types'

interface GameCardProps {
  game: Game
  index?: number
}

export default function GameCard({ game, index = 0 }: GameCardProps) {
  return (
    <Link
      to={`/game/${game.id}`}
      className="group relative bg-slate-800/50 rounded-xl overflow-hidden border border-slate-700/50 hover:border-cyan-400/60 transition-all duration-300 hover:shadow-lg hover:shadow-cyan-400/20 hover:-translate-y-1"
      style={{ animationDelay: `${index * 100}ms` }}
    >
      <div className="relative aspect-video bg-slate-900 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-red-500/20 via-transparent to-cyan-500/20 group-hover:opacity-75 transition-opacity" />
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-6xl opacity-50 group-hover:opacity-80 transition-opacity">
            🎮
          </span>
        </div>
        <div className="absolute top-2 right-2 bg-slate-900/80 text-cyan-400 text-xs px-2 py-1 rounded">
          {game.genre}
        </div>
      </div>
      <div className="p-4">
        <h3 className="text-white font-bold text-lg mb-1 group-hover:text-cyan-400 transition-colors truncate">
          {game.name}
        </h3>
        <p className="text-gray-400 text-sm mb-2">{game.publisher}</p>
        <div className="flex items-center justify-between text-xs text-gray-500">
          <span>{game.release_year}</span>
          <span className="text-red-400/70 group-hover:text-red-400 transition-colors">
            点击游玩 →
          </span>
        </div>
      </div>
    </Link>
  )
}
