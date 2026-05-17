import { useState, useEffect } from 'react'
import { Search } from 'lucide-react'
import GameCard from '../components/GameCard'
import type { Game } from '../types'
import { api } from '../utils/api'

export default function Games() {
  const [games, setGames] = useState<Game[]>([])
  const [filteredGames, setFilteredGames] = useState<Game[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedGenre, setSelectedGenre] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.games.getAll()
      .then(data => {
        setGames(data.games)
        setFilteredGames(data.games)
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    let result = games

    if (searchQuery) {
      result = result.filter(game =>
        game.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    if (selectedGenre) {
      result = result.filter(game => game.genre === selectedGenre)
    }

    setFilteredGames(result)
  }, [searchQuery, selectedGenre, games])

  const genres = Array.from(new Set(games.map(g => g.genre)))

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-black text-white mb-8 text-center" style={{ fontFamily: '"Press Start 2P", monospace' }}>
          全部游戏
        </h1>

        {/* Search and Filter */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
            <input
              type="text"
              placeholder="搜索游戏..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full bg-slate-800/50 border border-slate-700/50 rounded-xl pl-10 pr-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-cyan-400/50 transition-colors"
            />
          </div>
          <select
            value={selectedGenre}
            onChange={e => setSelectedGenre(e.target.value)}
            className="bg-slate-800/50 border border-slate-700/50 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-cyan-400/50 transition-colors"
          >
            <option value="">全部类型</option>
            {genres.map(genre => (
              <option key={genre} value={genre}>{genre}</option>
            ))}
          </select>
        </div>

        {/* Results Count */}
        <p className="text-gray-400 mb-6">
          找到 <span className="text-cyan-400 font-bold">{filteredGames.length}</span> 款游戏
        </p>

        {/* Games Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
              <div key={i} className="bg-slate-800/50 rounded-xl animate-pulse aspect-[4/3]" />
            ))}
          </div>
        ) : filteredGames.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-gray-500 text-lg">没有找到匹配的游戏</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredGames.map((game, index) => (
              <GameCard key={game.id} game={game} index={index} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
