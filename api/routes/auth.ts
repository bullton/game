import { Router, type Request, type Response } from 'express'
import sqlite3 from 'sqlite3'
import { getDb } from '../database.js'
import { hashPassword, comparePassword } from '../bcrypt.js'
import { generateToken } from '../jwt.js'
import type { RegisterRequest, LoginRequest, AuthResponse, ApiResponse } from '../types.js'

const router = Router()

interface DbUser {
  id: string
  email: string
  username: string
  password_hash: string
  avatar: string | null
  role: string
  created_at: string
  updated_at: string
}

/**
 * User Registration
 * POST /api/auth/register
 */
router.post('/register', async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password, username }: RegisterRequest = req.body

    if (!email || !password || !username) {
      res.status(400).json({ success: false, error: 'Email, password, and username are required' })
      return
    }

    if (password.length < 6) {
      res.status(400).json({ success: false, error: 'Password must be at least 6 characters' })
      return
    }

    if (username.length < 3 || username.length > 50) {
      res.status(400).json({ success: false, error: 'Username must be between 3 and 50 characters' })
      return
    }

    const db = getDb()
    const emailCheck = await new Promise<DbUser | null>((resolve) => {
      db.get('SELECT id FROM users WHERE email = ?', [email], (_err, row: DbUser | undefined) => {
        resolve(row || null)
      })
    })

    if (emailCheck) {
      res.status(409).json({ success: false, error: 'Email already registered' })
      return
    }

    const usernameCheck = await new Promise<DbUser | null>((resolve) => {
      db.get('SELECT id FROM users WHERE username = ?', [username], (_err, row: DbUser | undefined) => {
        resolve(row || null)
      })
    })

    if (usernameCheck) {
      res.status(409).json({ success: false, error: 'Username already taken' })
      return
    }

    const passwordHash = await hashPassword(password)
    const id = crypto.randomUUID()
    const now = new Date().toISOString()

    await new Promise<void>((resolve, reject) => {
      db.run(
        'INSERT INTO users (id, email, username, password_hash, role, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [id, email, username, passwordHash, 'user', now, now],
        function (err) {
          err ? reject(err) : resolve()
        }
      )
    })

    const token = generateToken({ id, email, username, role: 'user' })

    const response: AuthResponse = {
      user: { id, email, username, avatar: undefined, role: 'user', created_at: now, updated_at: now },
      token,
    }

    res.status(201).json({ success: true, data: response } as ApiResponse)
  } catch (error) {
    console.error('Registration error:', error)
    res.status(500).json({ success: false, error: 'Registration failed' } as ApiResponse)
  }
})

/**
 * User Login
 * POST /api/auth/login
 */
router.post('/login', async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password }: LoginRequest = req.body

    if (!email || !password) {
      res.status(400).json({ success: false, error: 'Email and password are required' })
      return
    }

    const db = getDb()
    const user = await new Promise<DbUser | null>((resolve) => {
      db.get('SELECT * FROM users WHERE email = ?', [email], (_err, row: DbUser | undefined) => {
        resolve(row || null)
      })
    })

    if (!user) {
      res.status(401).json({ success: false, error: 'Invalid email or password' })
      return
    }

    const isValidPassword = await comparePassword(password, user.password_hash)
    if (!isValidPassword) {
      res.status(401).json({ success: false, error: 'Invalid email or password' })
      return
    }

    const token = generateToken({ id: user.id, email: user.email, username: user.username, role: user.role })

    const response: AuthResponse = {
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        avatar: user.avatar || undefined,
        role: user.role as 'user' | 'admin',
        created_at: user.created_at,
        updated_at: user.updated_at,
      },
      token,
    }

    res.json({ success: true, data: response } as ApiResponse)
  } catch (error) {
    console.error('Login error:', error)
    res.status(500).json({ success: false, error: 'Login failed' } as ApiResponse)
  }
})

/**
 * Get Current User
 * GET /api/auth/me
 */
router.get('/me', async (req: Request, res: Response): Promise<void> => {
  try {
    const authHeader = req.headers.authorization
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ success: false, error: 'Authentication required' })
      return
    }

    const token = authHeader.substring(7)
    const { verifyToken } = await import('../jwt.js')
    const payload = verifyToken(token)

    if (!payload) {
      res.status(401).json({ success: false, error: 'Invalid or expired token' })
      return
    }

    const db = getDb()
    const user = await new Promise<DbUser | null>((resolve) => {
      db.get('SELECT id, email, username, avatar, role, created_at, updated_at FROM users WHERE id = ?', [payload.userId], (_err, row: DbUser | undefined) => {
        resolve(row || null)
      })
    })

    if (!user) {
      res.status(404).json({ success: false, error: 'User not found' })
      return
    }

    res.json({
      success: true,
      data: {
        user: {
          id: user.id,
          email: user.email,
          username: user.username,
          avatar: user.avatar || undefined,
          role: user.role as 'user' | 'admin',
          created_at: user.created_at,
          updated_at: user.updated_at,
        },
      },
    } as ApiResponse)
  } catch (error) {
    console.error('Get user error:', error)
    res.status(500).json({ success: false, error: 'Failed to get user info' } as ApiResponse)
  }
})

export default router
