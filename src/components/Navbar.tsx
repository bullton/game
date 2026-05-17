import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Gamepad2, Trophy, User, LogOut, LogIn } from 'lucide-react'
import { useAuthStore } from '../stores/authStore'

export default function Navbar() {
  const location = useLocation()
  const navigate = useNavigate()
  const { user, isAuthenticated, logout } = useAuthStore()

  const handleLogout = () => {
    logout()
    localStorage.removeItem('token')
    navigate('/')
  }

  return (
    <nav className="bg-slate-900/95 backdrop-blur-sm border-b border-red-500/30 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2 group">
            <Gamepad2 className="w-8 h-8 text-red-500 group-hover:text-red-400 transition-colors" />
            <span className="text-xl font-bold text-white tracking-wider" style={{ fontFamily: '"Press Start 2P", monospace' }}>
              NES RETRO
            </span>
          </Link>

          <div className="flex items-center gap-6">
            <Link
              to="/games"
              className={`text-sm font-medium transition-colors hover:text-red-400 ${
                location.pathname === '/games' ? 'text-red-400' : 'text-gray-300'
              }`}
            >
              游戏列表
            </Link>
            <Link
              to="/leaderboard"
              className={`text-sm font-medium transition-colors hover:text-red-400 flex items-center gap-1 ${
                location.pathname === '/leaderboard' ? 'text-red-400' : 'text-gray-300'
              }`}
            >
              <Trophy className="w-4 h-4" />
              排行榜
            </Link>

            {isAuthenticated && user ? (
              <div className="flex items-center gap-3">
                <Link
                  to="/profile"
                  className={`text-sm font-medium transition-colors hover:text-red-400 flex items-center gap-1 ${
                    location.pathname === '/profile' ? 'text-red-400' : 'text-gray-300'
                  }`}
                >
                  <User className="w-4 h-4" />
                  {user.username}
                </Link>
                <button
                  onClick={handleLogout}
                  className="text-gray-400 hover:text-red-400 transition-colors flex items-center gap-1 text-sm"
                >
                  <LogOut className="w-4 h-4" />
                  退出
                </button>
              </div>
            ) : (
              <Link
                to="/login"
                className="text-sm font-medium transition-colors hover:text-red-400 flex items-center gap-1 bg-red-500/20 px-3 py-1.5 rounded-lg hover:bg-red-500/30"
              >
                <LogIn className="w-4 h-4" />
                登录
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}
