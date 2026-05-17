import { create } from 'zustand'
import type { Game } from '../types'

interface GameState {
  games: Game[]
  selectedGame: Game | null
  setGames: (games: Game[]) => void
  setSelectedGame: (game: Game | null) => void
}

export const useGameStore = create<GameState>((set) => ({
  games: [],
  selectedGame: null,

  setGames: (games) => set({ games }),
  setSelectedGame: (game) => set({ selectedGame: game }),
}))
