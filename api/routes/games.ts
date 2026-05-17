import { Router, type Request, type Response } from 'express'
import { getDb } from '../database.js'
import type { ApiResponse, Game } from '../types.js'

const router = Router()

interface DbGame {
  id: string
  name: string
  description: string | null
  publisher: string | null
  release_year: number | null
  genre: string | null
  rom_url: string
  thumbnail_url: string | null
  created_at: string
  updated_at: string
}

/**
 * Get All Games
 * GET /api/games
 */
router.get('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const db = getDb()
    const games = await new Promise<DbGame[]>((resolve) => {
      db.all('SELECT * FROM games ORDER BY name ASC', [], (_err, rows) => {
        resolve(rows as DbGame[])
      })
    })

    const formattedGames: Game[] = games.map(game => ({
      id: game.id,
      name: game.name,
      description: game.description || '',
      publisher: game.publisher || '',
      release_year: game.release_year || 0,
      genre: game.genre || '',
      rom_url: game.rom_url,
      thumbnail_url: game.thumbnail_url || '',
      created_at: game.created_at,
      updated_at: game.updated_at,
    }))

    res.json({
      success: true,
      data: { games: formattedGames, total: formattedGames.length },
    } as ApiResponse<{ games: Game[]; total: number }>)
  } catch (error) {
    console.error('Get games error:', error)
    res.status(500).json({ success: false, error: 'Failed to get games' } as ApiResponse)
  }
})

/**
 * Get Game by ID
 * GET /api/games/:id
 */
router.get('/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const db = getDb()
    const game = await new Promise<DbGame | undefined>((resolve) => {
      db.get('SELECT * FROM games WHERE id = ?', [req.params.id], (_err, row) => {
        resolve(row as DbGame | undefined)
      })
    })

    if (!game) {
      res.status(404).json({ success: false, error: 'Game not found' })
      return
    }

    const formattedGame: Game = {
      id: game.id,
      name: game.name,
      description: game.description || '',
      publisher: game.publisher || '',
      release_year: game.release_year || 0,
      genre: game.genre || '',
      rom_url: game.rom_url,
      thumbnail_url: game.thumbnail_url || '',
      created_at: game.created_at,
      updated_at: game.updated_at,
    }

    res.json({
      success: true,
      data: { game: formattedGame },
    } as ApiResponse<{ game: Game }>)
  } catch (error) {
    console.error('Get game error:', error)
    res.status(500).json({ success: false, error: 'Failed to get game' } as ApiResponse)
  }
})

/**
 * Search Games
 * GET /api/games/search?q=query
 */
router.get('/search', async (req: Request, res: Response): Promise<void> => {
  try {
    const query = req.query.q as string
    if (!query || query.length < 1) {
      res.json({
        success: true,
        data: { games: [], total: 0 },
      } as ApiResponse<{ games: Game[]; total: number }>)
      return
    }

    const db = getDb()
    const games = await new Promise<DbGame[]>((resolve) => {
      db.all('SELECT * FROM games WHERE name LIKE ? ORDER BY name ASC', [`%${query}%`], (_err, rows) => {
        resolve(rows as DbGame[])
      })
    })

    const formattedGames: Game[] = games.map(game => ({
      id: game.id,
      name: game.name,
      description: game.description || '',
      publisher: game.publisher || '',
      release_year: game.release_year || 0,
      genre: game.genre || '',
      rom_url: game.rom_url,
      thumbnail_url: game.thumbnail_url || '',
      created_at: game.created_at,
      updated_at: game.updated_at,
    }))

    res.json({
      success: true,
      data: { games: formattedGames, total: formattedGames.length },
    } as ApiResponse<{ games: Game[]; total: number }>)
  } catch (error) {
    console.error('Search games error:', error)
    res.status(500).json({ success: false, error: 'Failed to search games' } as ApiResponse)
  }
})

export default router
