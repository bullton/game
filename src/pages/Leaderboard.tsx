import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Trophy, Medal, ArrowLeft } from 'lucide-react'
import type { Game, Score } from '../types'
import { api } from '../utils/api'

export default function Leaderboard() {
  const [games, setGames] = useState<Game[]>([])
  const [selectedGameId, setSelectedGameId] = useState('')
  const [scores, setScores] = useState<Score[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.games.getAll()
      .then(data => {
        setGames(data.games)
        if (data.games.length > 0) {
          setSelectedGameId(data.games[0].id)
        }
      })
      .catch(console.error)
  }, [])

  useEffect(() => {
    if (!selectedGameId) return

    setLoading(true)
    api.scores.getLeaderboard(selectedGameId, 100)
      .then(data => setScores(data.scores))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [selectedGameId])

  const selectedGame = games.find(g => g.id === selectedGameId)

  const getMedalColor = (index: number) => {
    if (index === 0) return 'text-yellow-400'
    if (index === 1) return 'text-gray-400'
    if (index === 2) return 'text-amber-600'
    return 'text-gray-600'
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 py-8 px-4">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-4xl font-black text-white mb-8 text-center" style={{ fontFamily: '"Press Start 2P", monospace' }}>
          全球排行榜
        </h1>

        {/* Game Selector */}
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-6 mb-8">
          <div className="flex flex-col md:flex-row items-center gap-4">
            <Trophy className="w-8 h-8 text-yellow-400 flex-shrink-0" />
            <div className="flex-1 w-full">
              <label className="block text-gray-400 text-sm mb-2">选择游戏</label>
              <select
                value={selectedGameId}
                onChange={e => setSelectedGameId(e.target.value)}
                className="w-full bg-slate-900/50 border border-slate-700/50 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-cyan-400/50 transition-colors"
              >
                {games.map(game => (
                  <option key={game.id} value={game.id}>
                    {game.name} - {game.genre}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {selectedGame && (
          <div className="mb-6">
            <Link
              to={`/game/${selectedGame.id}`}
              className="inline-flex items-center gap-2 text-gray-400 hover:text-cyan-400 transition-colors text-sm"
            >
              <ArrowLeft className="w-4 h-4" />
              返回游戏详情
            </Link>
          </div>
        )}

        {/* Leaderboard */}
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl overflow-hidden">
          {loading ? (
            <div className="p-8 space-y-4">
              {[1, 2, 3, 4, 5].map(i => (
                <div key={i} className="bg-slate-700/30 h-16 rounded-xl animate-pulse" />
              ))}
            </div>
          ) : scores.length === 0 ? (
            <div className="p-12 text-center">
              <Trophy className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">暂无成绩记录</p>
              <p className="text-gray-600 text-sm mt-2">成为第一个提交成绩的人吧！</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-700/30">
              {scores.map((score, index) => (
                <div
                  key={score.id}
                  className="flex items-center gap-4 px-6 py-4 hover:bg-slate-700/20 transition-colors"
                >
                  <div className={`w-12 text-center font-black text-xl ${getMedalColor(index)}`}>
                    {index === 0 ? (
                      <Medal className="w-8 h-8 mx-auto text-yellow-400" />
                    ) : index === 1 ? (
                      <Medal className="w-8 h-8 mx-auto text-gray-400" />
                    ) : index === 2 ? (
                      <Medal className="w-8 h-8 mx-auto text-amber-600" />
                    ) : (
                      `#${index + 1}`
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="text-white font-bold truncate">{score.username}</div>
                    <div className="text-gray-500 text-xs">
                      {new Date(score.created_at).toLocaleDateString('zh-CN')}
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-cyan-400 font-black text-xl">{score.score.toLocaleString()}</div>
                    {score.level && (
                      <div className="text-gray-500 text-xs">第 {score.level} 关</div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
