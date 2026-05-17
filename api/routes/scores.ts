import { Router, type Request, type Response } from 'express'
import { getDb } from '../database.js'
import { authMiddleware, type AuthRequest } from '../middleware.js'
import type { SubmitScoreRequest, ApiResponse, Score } from '../types.js'

const router = Router()

interface DbScore {
  id: string
  user_id: string
  game_id: string
  username: string
  score: number
  level: number | null
  created_at: string
}

/**
 * Submit Score
 * POST /api/scores
 */
router.post('/', authMiddleware, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, error: 'Authentication required' })
      return
    }

    const { gameId, score, level }: SubmitScoreRequest = req.body

    if (!gameId || score === undefined) {
      res.status(400).json({ success: false, error: 'Game ID and score are required' })
      return
    }

    const db = getDb()

    // Verify game exists
    const game = await new Promise<{ id: string } | null>((resolve) => {
      db.get('SELECT id FROM games WHERE id = ?', [gameId], (_err, row) => {
        resolve(row || null)
      })
    })

    if (!game) {
      res.status(404).json({ success: false, error: 'Game not found' })
      return
    }

    const id = crypto.randomUUID()
    const now = new Date().toISOString()

    await new Promise<void>((resolve, reject) => {
      db.run(
        'INSERT INTO scores (id, user_id, game_id, username, score, level, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [id, req.user.userId, gameId, req.user.username, score, level || null, now],
        function (err) {
          err ? reject(err) : resolve()
        }
      )
    })

    // Calculate rank
    const rankResult = await new Promise<{ rank: number }>((resolve) => {
      db.get(
        `SELECT rank FROM (
          SELECT game_id, score, RANK() OVER (ORDER BY score DESC) as rank
          FROM scores
          WHERE game_id = ?
        ) WHERE game_id = ? AND score = ?`,
        [gameId, gameId, score],
        (_err, row: { rank: number } | undefined) => {
          resolve({ rank: row?.rank || 1 })
        }
      )
    })

    const newScore: Score = {
      id,
      user_id: req.user.userId,
      game_id: gameId,
      username: req.user.username,
      score,
      level: level || undefined,
      created_at: now,
    }

    res.status(201).json({
      success: true,
      data: { score: newScore, rank: rankResult.rank },
    } as ApiResponse<{ score: Score; rank: number }>)
  } catch (error) {
    console.error('Submit score error:', error)
    res.status(500).json({ success: false, error: 'Failed to submit score' } as ApiResponse)
  }
})

/**
 * Get Leaderboard for a Game
 * GET /api/scores/:gameId
 */
router.get('/:gameId', async (req: Request, res: Response): Promise<void> => {
  try {
    const { gameId } = req.params
    const limit = Math.min(parseInt(req.query.limit as string) || 50, 100)
    const offset = parseInt(req.query.offset as string) || 0

    const db = getDb()

    // Verify game exists
    const game = await new Promise<{ id: string } | null>((resolve) => {
      db.get('SELECT id FROM games WHERE id = ?', [gameId], (_err, row) => {
        resolve(row || null)
      })
    })

    if (!game) {
      res.status(404).json({ success: false, error: 'Game not found' })
      return
    }

    const scores = await new Promise<DbScore[]>((resolve) => {
      db.all(
        'SELECT * FROM scores WHERE game_id = ? ORDER BY score DESC, created_at ASC LIMIT ? OFFSET ?',
        [gameId, limit, offset],
        (_err, rows) => {
          resolve(rows as DbScore[])
        }
      )
    })

    const total = await new Promise<number>((resolve) => {
      db.get('SELECT COUNT(*) as count FROM scores WHERE game_id = ?', [gameId], (_err, row: { count: number } | undefined) => {
        resolve(row?.count || 0)
      })
    })

    const formattedScores: Score[] = scores.map(s => ({
      id: s.id,
      user_id: s.user_id,
      game_id: s.game_id,
      username: s.username,
      score: s.score,
      level: s.level || undefined,
      created_at: s.created_at,
    }))

    // Calculate user rank if authenticated
    let userRank: number | undefined
    const authHeader = req.headers.authorization
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7)
      const { verifyToken } = await import('../jwt.js')
      const payload = verifyToken(token)
      if (payload) {
        const userScore = await new Promise<DbScore | undefined>((resolve) => {
          db.get(
            'SELECT * FROM scores WHERE game_id = ? AND user_id = ? ORDER BY score DESC LIMIT 1',
            [gameId, payload.userId],
            (_err, row) => {
              resolve(row as DbScore | undefined)
            }
          )
        })
        if (userScore) {
          const rankResult = await new Promise<{ rank: number }>((resolve) => {
            db.get(
              `SELECT rank FROM (
                SELECT score, RANK() OVER (ORDER BY score DESC) as rank
                FROM scores
                WHERE game_id = ?
              ) WHERE score = ?`,
              [gameId, userScore.score],
              (_err, row: { rank: number } | undefined) => {
                resolve({ rank: row?.rank || 1 })
              }
            )
          })
          userRank = rankResult.rank
        }
      }
    }

    res.json({
      success: true,
      data: {
        scores: formattedScores,
        total: total,
        userRank,
      },
    } as ApiResponse<{ scores: Score[]; total: number; userRank?: number }>)
  } catch (error) {
    console.error('Get leaderboard error:', error)
    res.status(500).json({ success: false, error: 'Failed to get leaderboard' } as ApiResponse)
  }
})

/**
 * Get User's Scores
 * GET /api/scores/user/:userId
 */
router.get('/user/:userId', async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId } = req.params

    const db = getDb()
    const scores = await new Promise<DbScore[]>((resolve) => {
      db.all(
        'SELECT * FROM scores WHERE user_id = ? ORDER BY created_at DESC',
        [userId],
        (_err, rows) => {
          resolve(rows as DbScore[])
        }
      )
    })

    const formattedScores: Score[] = scores.map(s => ({
      id: s.id,
      user_id: s.user_id,
      game_id: s.game_id,
      username: s.username,
      score: s.score,
      level: s.level || undefined,
      created_at: s.created_at,
    }))

    res.json({
      success: true,
      data: { scores: formattedScores },
    } as ApiResponse<{ scores: Score[] }>)
  } catch (error) {
    console.error('Get user scores error:', error)
    res.status(500).json({ success: false, error: 'Failed to get user scores' } as ApiResponse)
  }
})

export default router
