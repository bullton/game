import { useEffect, useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { ArrowLeft, Calendar, Building, Tag, Trophy, AlertCircle } from 'lucide-react'
import type { Game, Score } from '../types'
import { api } from '../utils/api'
import { useAuthStore } from '../stores/authStore'

export default function GameDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { isAuthenticated } = useAuthStore()

  const [game, setGame] = useState<Game | null>(null)
  const [scores, setScores] = useState<Score[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [scoreInput, setScoreInput] = useState('')
  const [levelInput, setLevelInput] = useState('')
  const [submitSuccess, setSubmitSuccess] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!id) return

    Promise.all([
      api.games.getById(id),
      api.scores.getLeaderboard(id, 50),
    ])
      .then(([gameData, scoresData]) => {
        setGame(gameData.game)
        setScores(scoresData.scores)
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [id])

  const handleSubmitScore = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSubmitSuccess(false)

    if (!isAuthenticated) {
      navigate('/login')
      return
    }

    const score = parseInt(scoreInput)
    if (isNaN(score) || score <= 0) {
      setError('请输入有效的分数')
      return
    }

    setSubmitting(true)
    try {
      await api.scores.submit(id!, score, levelInput ? parseInt(levelInput) : undefined)
      setSubmitSuccess(true)
      setScoreInput('')
      setLevelInput('')

      // Refresh leaderboard
      const scoresData = await api.scores.getLeaderboard(id!, 50)
      setScores(scoresData.scores)

      setTimeout(() => setSubmitSuccess(false), 3000)
    } catch (err) {
      setError(err instanceof Error ? err.message : '提交失败')
    } finally {
      setSubmitting(false)
    }
  }

  const getMedalColor = (index: number) => {
    if (index === 0) return 'text-yellow-400'
    if (index === 1) return 'text-gray-400'
    if (index === 2) return 'text-amber-600'
    return 'text-gray-600'
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 py-8 px-4 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-red-500/30 border-t-red-500 rounded-full animate-spin mx-auto" />
          <p className="text-gray-400 mt-4">加载中...</p>
        </div>
      </div>
    )
  }

  if (!game) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 py-8 px-4 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <p className="text-gray-400 text-lg">游戏未找到</p>
          <Link to="/games" className="text-cyan-400 hover:text-cyan-300 mt-4 inline-block">
            返回游戏列表
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Back Button */}
        <Link
          to="/games"
          className="inline-flex items-center gap-2 text-gray-400 hover:text-cyan-400 transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          返回游戏列表
        </Link>

        {/* Game Info */}
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-6 md:p-8 mb-8">
          <div className="flex flex-col md:flex-row gap-6">
            <div className="flex-1">
              <h1 className="text-3xl md:text-4xl font-black text-white mb-4" style={{ fontFamily: '"Press Start 2P", monospace' }}>
                {game.name}
              </h1>
              <p className="text-gray-400 mb-6">{game.description}</p>

              <div className="flex flex-wrap gap-4">
                <div className="flex items-center gap-2 text-sm text-gray-400 bg-slate-900/50 px-3 py-1.5 rounded-lg">
                  <Building className="w-4 h-4" />
                  {game.publisher}
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-400 bg-slate-900/50 px-3 py-1.5 rounded-lg">
                  <Calendar className="w-4 h-4" />
                  {game.release_year}
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-400 bg-slate-900/50 px-3 py-1.5 rounded-lg">
                  <Tag className="w-4 h-4" />
                  {game.genre}
                </div>
              </div>
            </div>
          </div>

          {/* Play Button */}
          <div className="mt-6 pt-6 border-t border-slate-700/50">
            <button
              onClick={() => alert('游戏模拟器将在下一版本中集成！')}
              className="w-full md:w-auto bg-gradient-to-r from-red-500 to-pink-600 text-white px-8 py-3 rounded-xl font-bold text-lg hover:shadow-lg hover:shadow-red-500/30 transition-all hover:-translate-y-0.5"
            >
              🎮 开始游戏
            </button>
          </div>
        </div>

        {/* Submit Score */}
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-6 md:p-8 mb-8">
          <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
            <Trophy className="w-6 h-6 text-yellow-400" />
            提交成绩
          </h2>

          {submitSuccess && (
            <div className="bg-green-500/10 border border-green-500/30 text-green-400 px-4 py-3 rounded-xl mb-4">
              成绩提交成功！
            </div>
          )}

          {error && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-xl mb-4">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmitScore} className="flex flex-col sm:flex-row gap-4">
            <input
              type="number"
              placeholder="输入分数"
              value={scoreInput}
              onChange={e => setScoreInput(e.target.value)}
              className="flex-1 bg-slate-900/50 border border-slate-700/50 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-cyan-400/50 transition-colors"
              required
            />
            <input
              type="number"
              placeholder="关卡 (可选)"
              value={levelInput}
              onChange={e => setLevelInput(e.target.value)}
              className="flex-1 bg-slate-900/50 border border-slate-700/50 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-cyan-400/50 transition-colors"
            />
            <button
              type="submit"
              disabled={submitting || !isAuthenticated}
              className="bg-cyan-500/20 text-cyan-400 border border-cyan-400/30 px-6 py-3 rounded-xl font-bold hover:bg-cyan-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? '提交中...' : isAuthenticated ? '提交' : '登录后提交'}
            </button>
          </form>
          {!isAuthenticated && (
            <p className="text-gray-500 text-sm mt-2">
              <Link to="/login" className="text-cyan-400 hover:underline">登录</Link> 后提交成绩
            </p>
          )}
        </div>

        {/* Leaderboard */}
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-6 md:p-8">
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
            <Trophy className="w-6 h-6 text-yellow-400" />
            排行榜
            <span className="text-sm font-normal text-gray-500">Top 50</span>
          </h2>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-700/50">
                  <th className="text-left py-3 px-4 text-gray-400 font-medium text-sm">排名</th>
                  <th className="text-left py-3 px-4 text-gray-400 font-medium text-sm">玩家</th>
                  <th className="text-right py-3 px-4 text-gray-400 font-medium text-sm">分数</th>
                  <th className="text-right py-3 px-4 text-gray-400 font-medium text-sm">关卡</th>
                </tr>
              </thead>
              <tbody>
                {scores.map((score, index) => (
                  <tr
                    key={score.id}
                    className="border-b border-slate-700/30 hover:bg-slate-700/20 transition-colors"
                  >
                    <td className="py-3 px-4">
                      <span className={`font-bold text-lg ${getMedalColor(index)}`}>
                        {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `#${index + 1}`}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-white font-medium">{score.username}</td>
                    <td className="py-3 px-4 text-right text-cyan-400 font-bold">{score.score.toLocaleString()}</td>
                    <td className="py-3 px-4 text-right text-gray-400">
                      {score.level || '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
