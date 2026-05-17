import sqlite3 from 'sqlite3'
import { promisify } from 'util'

const dbPath = process.env.DB_PATH || './data.db'

let db: sqlite3.Database | null = null

export function getDb(): sqlite3.Database {
  if (!db) {
    db = new sqlite3.Database(dbPath)
  }
  return db
}

export function closeDb(): Promise<void> {
  if (db) {
    const close = promisify(db.close).bind(db)
    return close()
  }
  return Promise.resolve()
}

export async function initializeDatabase() {
  const database = getDb()

  await new Promise<void>((resolve, reject) => {
    database.serialize(() => {
      // Users table
      database.run(`
        CREATE TABLE IF NOT EXISTS users (
          id TEXT PRIMARY KEY,
          email TEXT UNIQUE NOT NULL,
          username TEXT UNIQUE NOT NULL,
          password_hash TEXT NOT NULL,
          avatar TEXT,
          role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin')),
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `)

      // Games table
      database.run(`
        CREATE TABLE IF NOT EXISTS games (
          id TEXT PRIMARY KEY,
          name TEXT NOT NULL,
          description TEXT,
          publisher TEXT,
          release_year INTEGER,
          genre TEXT,
          rom_url TEXT NOT NULL,
          thumbnail_url TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `)

      // Scores table
      database.run(`
        CREATE TABLE IF NOT EXISTS scores (
          id TEXT PRIMARY KEY,
          user_id TEXT NOT NULL,
          game_id TEXT NOT NULL,
          username TEXT NOT NULL,
          score INTEGER NOT NULL,
          level INTEGER,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
          FOREIGN KEY (game_id) REFERENCES games(id) ON DELETE CASCADE
        )
      `)

      // Indexes
      database.run('CREATE INDEX IF NOT EXISTS idx_scores_game_id ON scores(game_id)')
      database.run('CREATE INDEX IF NOT EXISTS idx_scores_user_id ON scores(user_id)')
      database.run('CREATE INDEX IF NOT EXISTS idx_scores_score ON scores(game_id, score DESC)')

      // Seed games data
      const games = [
        { name: '超级马里奥兄弟', description: '经典平台跳跃游戏，帮助马里奥拯救公主', publisher: 'Nintendo', release_year: 1985, genre: 'Platform', rom_url: '/roms/mario.nes', thumbnail_url: '/images/mario.png' },
        { name: '魂斗罗', description: '经典射击游戏，与战友并肩作战消灭外星敌人', publisher: 'Konami', release_year: 1988, genre: 'Shooter', rom_url: '/roms/contra.nes', thumbnail_url: '/images/contra.png' },
        { name: '洛克人', description: '经典动作游戏，击败八大Boss拯救机器人', publisher: 'Capcom', release_year: 1987, genre: 'Action', rom_url: '/roms/rockman.nes', thumbnail_url: '/images/rockman.png' },
        { name: '塞尔达传说', description: '经典冒险游戏，探索海拉鲁大陆寻找三角力量', publisher: 'Nintendo', release_year: 1986, genre: 'Adventure', rom_url: '/roms/zelda.nes', thumbnail_url: '/images/zelda.png' },
        { name: '超级马里奥兄弟2', description: '马里奥续作，新的冒险和挑战等待着你', publisher: 'Nintendo', release_year: 1988, genre: 'Platform', rom_url: '/roms/mario2.nes', thumbnail_url: '/images/mario2.png' },
        { name: '恶魔城', description: '经典动作冒险游戏，德古拉猎人的战斗', publisher: 'Konami', release_year: 1989, genre: 'Action', rom_url: '/roms/castlevania.nes', thumbnail_url: '/images/castlevania.png' },
        { name: '冒险岛', description: '经典平台游戏，骑着恐龙穿越冒险世界', publisher: 'Hudson', release_year: 1986, genre: 'Platform', rom_url: '/roms/adventure.nes', thumbnail_url: '/images/adventure.png' },
        { name: '坦克大战', description: '经典策略射击游戏，保护基地击败敌人', publisher: 'Nintendo', release_year: 1985, genre: 'Strategy', rom_url: '/roms/tank.nes', thumbnail_url: '/images/tank.png' },
        { name: '超级马里奥兄弟3', description: '马里奥系列经典续作，新道具和新关卡', publisher: 'Nintendo', release_year: 1988, genre: 'Platform', rom_url: '/roms/mario3.nes', thumbnail_url: '/images/mario3.png' },
        { name: '忍者龙剑传', description: '经典动作游戏，忍者隼龙的复仇之路', publisher: 'Tecmo', release_year: 1988, genre: 'Action', rom_url: '/roms/ryu.nes', thumbnail_url: '/images/ryu.png' },
        { name: '银河战士', description: '经典冒险动作游戏，探索未知星球', publisher: 'Nintendo', release_year: 1986, genre: 'Adventure', rom_url: '/roms/samus.nes', thumbnail_url: '/images/samus.png' },
        { name: '双截龙', description: '经典格斗游戏，兄弟联手对抗黑帮', publisher: 'Technos', release_year: 1988, genre: 'Fighting', rom_url: '/roms/double.nes', thumbnail_url: '/images/double.png' },
      ]

      const stmt = database.prepare('INSERT OR IGNORE INTO games (id, name, description, publisher, release_year, genre, rom_url, thumbnail_url) VALUES (?, ?, ?, ?, ?, ?, ?, ?)')
      games.forEach(game => {
        stmt.run(crypto.randomUUID(), game.name, game.description, game.publisher, game.release_year, game.genre, game.rom_url, game.thumbnail_url)
      })
      stmt.finalize(() => {
        resolve()
      })
    })
  })

  console.log('Database initialized successfully')
}
