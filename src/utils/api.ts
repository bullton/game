import type { User, Game, Score, ApiResponse, AuthResponse } from '../types'

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001'

async function request<T>(url: string, options?: RequestInit): Promise<T> {
  const token = localStorage.getItem('token')
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options?.headers as Record<string, string>),
  }

  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  const response = await fetch(`${API_BASE}${url}`, {
    ...options,
    headers,
  })

  const data: ApiResponse<T> = await response.json()

  if (!data.success) {
    throw new Error(data.error || 'Request failed')
  }

  return data.data as T
}

export const api = {
  auth: {
    register: (email: string, password: string, username: string) =>
      request<AuthResponse>('/api/auth/register', {
        method: 'POST',
        body: JSON.stringify({ email, password, username }),
      }),

    login: (email: string, password: string) =>
      request<AuthResponse>('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      }),

    me: () =>
      request<{ user: User }>('/api/auth/me'),
  },

  games: {
    getAll: () =>
      request<{ games: Game[]; total: number }>('/api/games'),

    getById: (id: string) =>
      request<{ game: Game }>(`/api/games/${id}`),

    search: (query: string) =>
      request<{ games: Game[]; total: number }>(`/api/games/search?q=${query}`),
  },

  scores: {
    submit: (gameId: string, score: number, level?: number) =>
      request<{ score: Score; rank: number }>('/api/scores', {
        method: 'POST',
        body: JSON.stringify({ gameId, score, level }),
      }),

    getLeaderboard: (gameId: string, limit = 50, offset = 0) =>
      request<{ scores: Score[]; total: number; userRank?: number }>(
        `/api/scores/${gameId}?limit=${limit}&offset=${offset}`
      ),

    getUserScores: (userId: string) =>
      request<{ scores: Score }>(`/api/scores/user/${userId}`),
  },
}
