# 🎮 Retro Gaming - 红白机经典游戏网站

一个复古风格的在线游戏网站，收录经典红白机(NES/Famicom)游戏，支持用户注册登录、提交成绩和排行榜排名。

![Retro Gaming](public/favicon.svg)

## ✨ 功能特性

- 🎯 **游戏库** - 收录12款经典NES游戏，支持搜索和类型筛选
- 👤 **用户系统** - 完整的注册、登录、JWT认证
- 🏆 **排行榜** - 每种游戏独立排行榜，展示Top 50高分玩家
- 👥 **用户中心** - 个人信息、统计数据、成绩历史
- 🎨 **复古UI** - 像素风格设计，霓虹色彩，致敬80年代游戏厅

## 🛠️ 技术栈

### 前端
- React 18 + TypeScript
- Vite 6 - 快速构建工具
- TailwindCSS - 原子化CSS框架
- Zustand - 轻量级状态管理
- React Router 6 - 路由管理

### 后端
- Express 4 - Node.js Web框架
- TypeScript - 类型安全
- SQLite3 - 轻量级本地数据库
- JWT - 身份认证
- bcryptjs - 密码加密

## 🗄️ 数据库说明

本项目使用 **SQLite3** 作为数据库，无需额外安装数据库服务，开箱即用。

### 数据库特性

- **零配置** - 无需安装 PostgreSQL/MySQL，SQLite 是文件型数据库
- **自动初始化** - 服务器首次启动时自动创建数据库文件和表结构
- **种子数据** - 自动插入12款经典游戏数据
- **数据持久化** - 数据保存在 `data.db` 文件中

### 数据库结构

项目包含3个核心数据表：

**users（用户表）**
| 字段 | 类型 | 说明 |
|------|------|------|
| id | TEXT (PK) | 用户唯一标识（UUID） |
| email | TEXT (UNIQUE) | 用户邮箱 |
| username | TEXT | 用户名 |
| password_hash | TEXT | 加密后的密码 |
| avatar | TEXT | 头像URL（可选） |
| role | TEXT | 角色：user/admin |
| created_at | DATETIME | 创建时间 |
| updated_at | DATETIME | 更新时间 |

**games（游戏表）**
| 字段 | 类型 | 说明 |
|------|------|------|
| id | TEXT (PK) | 游戏唯一标识（UUID） |
| title | TEXT | 游戏名称 |
| description | TEXT | 游戏描述 |
| genre | TEXT | 游戏类型 |
| year | INTEGER | 发行年份 |
| developer | TEXT | 开发商 |
| publisher | TEXT | 发行商 |
| cover_image | TEXT | 封面图片URL |
| created_at | DATETIME | 创建时间 |

**scores（成绩表）**
| 字段 | 类型 | 说明 |
|------|------|------|
| id | TEXT (PK) | 成绩唯一标识（UUID） |
| user_id | TEXT (FK) | 用户ID |
| game_id | TEXT (FK) | 游戏ID |
| score | INTEGER | 得分 |
| level | INTEGER | 等级 |
| created_at | DATETIME | 创建时间 |

### 数据库文件

- 数据库文件：`data.db`（项目根目录）
- 数据库初始化代码：`api/database.ts`
- `.gitignore` 已配置排除 `data.db`，不会提交到 Git

### 迁移到 PostgreSQL（可选）

如需在生产环境使用 PostgreSQL，需要：

1. 安装 PostgreSQL 驱动：`npm install pg`
2. 修改 `api/database.ts`，将 SQLite 连接改为 PostgreSQL
3. 更新表结构中的类型映射（TEXT → VARCHAR，INTEGER → INT 等）
4. 设置环境变量 `DATABASE_URL=postgresql://user:pass@host:5432/dbname`

---

## 📁 项目结构

```
game/
├── api/                    # 后端代码
│   ├── routes/            # API路由
│   │   ├── auth.ts        # 用户认证
│   │   ├── games.ts       # 游戏管理
│   │   └── scores.ts      # 排行榜
│   ├── app.ts             # Express应用
│   ├── server.ts          # 服务器入口
│   ├── database.ts        # 数据库配置
│   ├── jwt.ts             # JWT工具
│   ├── bcrypt.ts          # 密码加密
│   ├── middleware.ts      # 中间件
│   ├── types.ts           # 类型定义
│   └── package.json       # 后端依赖
├── src/                   # 前端代码
│   ├── components/        # 公共组件
│   ├── pages/            # 页面组件
│   ├── stores/           # Zustand状态管理
│   ├── utils/            # 工具函数
│   └── types/            # 类型定义
├── public/               # 静态资源
├── package.json          # 前端依赖
└── vite.config.ts        # Vite配置
```

## 🚀 快速开始

### 环境要求

- Node.js >= 18.0.0
- npm >= 9.0.0 或 yarn >= 1.22.0

### 本地开发

1. **克隆项目**
```bash
git clone https://github.com/bullton/game.git
cd game
```

2. **安装依赖**
```bash
# 安装前端依赖
npm install

# 安装后端依赖
cd api && npm install && cd ..
```

3. **配置环境变量**

项目根目录已包含 `.env` 文件，包含默认配置：
```env
VITE_API_URL=http://localhost:3001
```

如需修改后端端口，可编辑 `api/.env`（如需要）。

4. **启动开发服务器**

在项目根目录运行：
```bash
npm run dev
```

这将同时启动：
- 前端开发服务器：http://localhost:5173
- 后端API服务器：http://localhost:3001

5. **访问应用**

打开浏览器访问 http://localhost:5173

### 单独启动服务

**仅启动前端：**
```bash
npm run client:dev
```

**仅启动后端：**
```bash
npm run server:dev
```

## 📦 生产部署

### 方案一：手动部署（推荐用于测试/小规模）

#### 1. 构建前端

```bash
npm run build
```

构建产物将生成在 `dist/` 目录。

#### 2. 编译后端

```bash
cd api && npm run build && cd ..
```

编译产物将生成在 `api/dist/` 目录。

#### 3. 安装生产依赖

```bash
cd api && npm install --production && cd ..
```

#### 4. 启动生产服务器

```bash
npm run start
```

服务器将运行在 http://localhost:3001（包含前端静态文件）。

**注意**：SQLite 数据库文件 `data.db` 会在首次启动时自动创建。确保运行进程对项目目录有写入权限。数据会持久化保存在 `data.db` 文件中，重启服务不会丢失。

---

### 方案二：Docker 部署

#### 1. 构建 Docker 镜像

```bash
docker build -t retro-gaming:latest .
```

#### 2. 运行容器

```bash
docker run -d \
  --name retro-gaming \
  -p 3000:3000 \
  -v $(pwd)/data:/app/data \
  retro-gaming:latest
```

访问 http://localhost:3000

**注意**：通过 `-v` 参数将数据目录挂载到宿主机，确保数据库文件 `data.db` 不会因容器删除而丢失。

---

### 方案三：Vercel + Railway/Supabase（推荐用于生产）

#### 前端部署到 Vercel

1. 在 [Vercel](https://vercel.com) 创建新项目
2. 导入 GitHub 仓库 `bullton/game`
3. 设置构建配置：
   - Framework: Vite
   - Build Command: `npm run build`
   - Output Directory: `dist`
4. 添加环境变量：
   ```
   VITE_API_URL=https://your-backend-url.com
   ```
5. 点击 Deploy

#### 后端部署到 Railway/Render

1. 在 [Railway](https://railway.app) 或 [Render](https://render.com) 创建新服务
2. 连接 GitHub 仓库
3. 设置部署配置：
   - Build Command: `cd api && npm install && npm run build`
   - Start Command: `cd api && npm start`
   - 端口：3001
4. 获取后端URL，更新Vercel的 `VITE_API_URL` 环境变量

---

### 方案四：VPS 部署（Ubuntu/Debian）

#### 1. 安装 Node.js

```bash
# 使用 nvm 安装
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
source ~/.bashrc
nvm install 18
nvm use 18
```

#### 2. 克隆并安装依赖

```bash
git clone https://github.com/bullton/game.git
cd game
npm install
cd api && npm install && cd ..
```

#### 3. 构建项目

```bash
npm run build
cd api && npm run build && cd ..
```

#### 4. 使用 PM2 管理进程

```bash
# 安装 PM2
npm install -g pm2

# 启动应用
pm2 start api/dist/server.js --name retro-gaming

# 查看状态
pm2 status

# 设置开机自启
pm2 startup
pm2 save
```

**注意**：确保 `/path/to/game` 目录有写入权限，以便 SQLite 创建和更新 `data.db` 数据库文件。

---

#### 5. 配置 Nginx 反向代理

创建 `/etc/nginx/sites-available/retro-gaming`：

```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        root /path/to/game/dist;
        try_files $uri $uri/ /index.html;
    }

    location /api {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

启用配置：
```bash
sudo ln -s /etc/nginx/sites-available/retro-gaming /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

#### 6. 配置 SSL（可选但推荐）

```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com
```

## 🔧 API 接口说明

### 认证接口

| 方法 | 路径 | 说明 |
|------|------|------|
| POST | `/api/auth/register` | 用户注册 |
| POST | `/api/auth/login` | 用户登录 |
| GET | `/api/auth/me` | 获取当前用户信息 |

### 游戏接口

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/games` | 获取所有游戏 |
| GET | `/api/games/:id` | 获取单个游戏详情 |
| GET | `/api/games/search?q=query` | 搜索游戏 |

### 排行榜接口

| 方法 | 路径 | 说明 |
|------|------|------|
| POST | `/api/scores` | 提交成绩 |
| GET | `/api/scores/:gameId` | 获取游戏排行榜 |
| GET | `/api/scores/user/:userId` | 获取用户成绩 |

## 🎮 内置游戏列表

1. 超级马里奥兄弟 (Super Mario Bros)
2. 魂斗罗 (Contra)
3. 洛克人 (Mega Man)
4. 塞尔达传说 (The Legend of Zelda)
5. 银河战士 (Metroid)
6. 恶魔城 (Castlevania)
7. 最终幻想 (Final Fantasy)
8. 勇者斗恶龙 (Dragon Quest)
9. 星之卡比 (Kirby)
10. 赤色要塞 (Metal Slug)
11. 坦克大战 (Battle City)
12. 超级马力欧兄弟2 (Super Mario Bros 2)

## 📝 开发指南

### 添加新游戏

1. 在 `api/database.ts` 的 `seedGames` 数组中添加游戏数据
2. 在游戏详情页添加对应的游戏封面和描述

### 添加新功能页面

1. 在 `src/pages/` 创建新的页面组件
2. 在 `src/App.tsx` 中添加路由
3. 在 `src/components/Navbar.tsx` 中添加导航链接

## 🤝 贡献指南

欢迎提交 Issue 和 Pull Request！

1. Fork 本仓库
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启 Pull Request

## 📄 许可证

本项目采用 MIT 许可证。详见 [LICENSE](LICENSE) 文件。

## 🙏 致谢

- 致敬所有经典 NES/Famicom 游戏
- React、Express、SQLite 等开源项目
- 所有为复古游戏文化做出贡献的人们

---

**Enjoy Gaming! 🕹️**
