export interface User {
  id: string
  email: string
  username: string
  avatar?: string
  role: 'user' | 'admin'
  created_at: string
  updated_at: string
}

export interface Game {
  id: string
  name: string
  description: string
  publisher: string
  release_year: number
  genre: string
  rom_url: string
  thumbnail_url: string
  created_at: string
  updated_at: string
}

export interface Score {
  id: string
  user_id: string
  game_id: string
  username: string
  score: number
  level?: number
  created_at: string
}

export interface AuthResponse {
  user: Omit<User, 'password_hash'>
  token: string
}

export interface ApiResponse<T = unknown> {
  success: boolean
  data?: T
  error?: string
}
