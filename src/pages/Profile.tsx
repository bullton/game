import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { User, Calendar, Trophy, Gamepad2, LogOut } from 'lucide-react'
import type { User as UserType, Score, Game } from '../types'
import { api } from '../utils/api'
import { useAuthStore } from '../stores/authStore'

export default function Profile() {
  const [user, setUser] = useState<UserType | null>(null)
  const [scores, setScores] = useState<Score[]>([])
  const [games, setGames] = useState<Game[]>([])
  const [loading, setLoading] = useState(true)
  const logout = useAuthStore(s => s.logout)
  const navigate = useNavigate()

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) {
      navigate('/login')
      return
    }

    Promise.all([
      api.auth.me(),
      api.games.getAll(),
    ])
      .then(([userData, gamesData]) => {
        setUser(userData.user)
        setGames(gamesData.games)
      })
      .catch(() => {
        navigate('/login')
      })
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    if (!user) return

    // Fetch scores for each game and combine them
    const fetchAllScores = async () => {
      const allScores: Score[] = []
      for (const game of games) {
        try {
          const data = await api.scores.getLeaderboard(game.id, 100)
          const userScores = data.scores.filter(s => s.user_id === user.id)
          allScores.push(...userScores)
        } catch {
          // Skip errors
        }
      }
      allScores.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      setScores(allScores)
    }

    if (games.length > 0) {
      fetchAllScores()
    }
  }, [user, games])

  const handleLogout = () => {
    logout()
    localStorage.removeItem('token')
    navigate('/login')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-red-500/30 border-t-red-500 rounded-full animate-spin" />
      </div>
    )
  }

  if (!user) return null

  const totalGamesPlayed = scores.length
  const highestScore = scores.reduce((max, s) => Math.max(max, s.score), 0)

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-black text-white mb-8 text-center" style={{ fontFamily: '"Press Start 2P", monospace' }}>
          个人中心
        </h1>

        {/* User Info Card */}
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-6 md:p-8 mb-8">
          <div className="flex flex-col md:flex-row items-center gap-6">
            <div className="w-24 h-24 bg-gradient-to-br from-red-500 to-pink-600 rounded-full flex items-center justify-center text-4xl font-black text-white">
              {user.username.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 text-center md:text-left">
              <h2 className="text-2xl font-bold text-white mb-1">{user.username}</h2>
              <p className="text-gray-400 text-sm mb-3">{user.email}</p>
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
                <div className="flex items-center gap-1 text-xs text-gray-500 bg-slate-900/50 px-3 py-1.5 rounded-lg">
                  <Calendar className="w-3 h-3" />
                  加入于 {new Date(user.created_at).toLocaleDateString('zh-CN')}
                </div>
                <div className="flex items-center gap-1 text-xs text-gray-500 bg-slate-900/50 px-3 py-1.5 rounded-lg">
                  <User className="w-3 h-3" />
                  {user.role === 'admin' ? '管理员' : '玩家'}
                </div>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="bg-slate-700/50 text-gray-300 border border-slate-600/50 px-4 py-2 rounded-xl text-sm hover:bg-slate-600/50 transition-colors flex items-center gap-2"
            >
              <LogOut className="w-4 h-4" />
              退出登录
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6 text-center">
            <Gamepad2 className="w-8 h-8 text-red-400 mx-auto mb-2" />
            <div className="text-3xl font-black text-white">{totalGamesPlayed}</div>
            <div className="text-gray-400 text-sm">提交成绩</div>
          </div>
          <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6 text-center">
            <Trophy className="w-8 h-8 text-yellow-400 mx-auto mb-2" />
            <div className="text-3xl font-black text-white">{highestScore.toLocaleString()}</div>
            <div className="text-gray-400 text-sm">最高分数</div>
          </div>
          <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6 text-center">
            <Trophy className="w-8 h-8 text-cyan-400 mx-auto mb-2" />
            <div className="text-3xl font-black text-white">{games.length}</div>
            <div className="text-gray-400 text-sm">可用游戏</div>
          </div>
        </div>

        {/* Score History */}
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-6 md:p-8">
          <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <Trophy className="w-5 h-5 text-yellow-400" />
            成绩历史
          </h2>

          {scores.length === 0 ? (
            <div className="text-center py-8">
              <Gamepad2 className="w-12 h-12 text-gray-600 mx-auto mb-3" />
              <p className="text-gray-500">还没有成绩记录</p>
              <Link to="/games" className="text-cyan-400 hover:text-cyan-300 text-sm mt-2 inline-block">
                去玩游戏 →
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {scores.map(score => {
                const game = games.find(g => g.id === score.game_id)
                return (
                  <div
                    key={score.id}
                    className="flex items-center justify-between bg-slate-900/30 rounded-xl px-4 py-3"
                  >
                    <div>
                      <div className="text-white font-medium text-sm">{game?.name || '未知游戏'}</div>
                      <div className="text-gray-500 text-xs">
                        {new Date(score.created_at).toLocaleDateString('zh-CN')}
                        {score.level && ` · 第 ${score.level} 关`}
                      </div>
                    </div>
                    <div className="text-cyan-400 font-bold">{score.score.toLocaleString()}</div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
