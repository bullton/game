# ROM 上传与管理员后台（最小可用）设计

## 背景与目标

当前项目已具备：
- 用户注册/登录（JWT）
- 游戏列表/详情页
- 成绩提交与排行榜

缺失的核心闭环：
- 在线游玩（NES 模拟器 + ROM 供给）
- 管理员后台（至少能为某个游戏上传 ROM，便于前端直接加载并运行）

本设计的目标是以最小改动补齐在线游玩链路：
1. 管理员为某个游戏上传 `.nes` ROM
2. 后端落盘保存 ROM，并将 `games.rom_url` 更新为可被前端访问的 URL
3. 前端游戏详情页使用 `rom_url` 加载 ROM 并运行模拟器
4. 提供最小管理员页面以便上传 ROM（不实现完整 CRUD）

## 约束与原则

- ROM 文件不进入 Git 仓库
- 仅管理员可上传 ROM
- ROM 文件按 gameId 绑定，避免一个游戏出现多个不确定版本（后续可扩展版本管理）
- API 错误返回保持与现有 `ApiResponse` 风格一致
- 不引入外部对象存储依赖（先使用本地文件系统）

## 数据模型

沿用现有 SQLite `games` 表字段：
- `rom_url`：保存 ROM 的可访问路径，例如 `/roms/<filename>.nes`

不新增表，避免迁移成本。

## 后端设计

### 存储路径与静态托管

- ROM 存储目录：`api/uploads/roms/`
- 对外访问前缀：`/roms`
- Express 静态托管：
  - `GET /roms/<filename>` → `api/uploads/roms/<filename>`

### 管理员认证与引导

避免“没有管理员无法上传”的死锁，提供最小管理员引导策略：
- 在后端读取环境变量 `ADMIN_EMAIL`
- 当用户注册/登录且 email 与 `ADMIN_EMAIL` 匹配时，将该用户角色提升为 `admin`（一次性/幂等更新）

备注：此策略便于快速启动，后续可替换为后台提升用户权限。

### 管理员 API

#### 1) 上传 ROM

- 方法：`POST`
- 路径：`/api/admin/games/:id/rom`
- 认证：需要 `authMiddleware` + `adminMiddleware`
- 请求：`multipart/form-data`
  - 字段：`rom`（文件，`.nes`）
- 处理逻辑：
  1. 校验游戏是否存在
  2. 校验文件存在、扩展名/Content-Type 合理（最小校验：扩展名 `.nes`）
  3. 保存文件到 `api/uploads/roms/`
     - 文件名：`<gameId>.nes`（覆盖写，确保最新版本）
  4. 更新 `games.rom_url = /roms/<gameId>.nes`
  5. 返回更新后的 game

- 返回：
  - `success: true`
  - `data: { game }`

#### 2)（可选）管理员查看游戏列表（含是否有 ROM）

如果现有 `/api/games` 返回 `rom_url` 已足够，前端管理员页可直接复用，无需新增管理员 GET。

## 前端设计

### 管理员页面 `/admin`

#### 功能
- 列出所有游戏（复用 `GET /api/games`）
- 每行显示 ROM 状态（`rom_url` 是否为空）
- 提供上传控件（选择 `.nes` 文件）与上传按钮
- 上传成功后刷新列表或更新该行状态

#### 权限
- 必须登录
- 必须 `role=admin`
- 非管理员访问：跳转到首页或显示无权限提示

### 游戏详情页

- “开始游戏”按钮展开模拟器区域
- 若 `rom_url` 为空：
  - 显示提示：需要管理员上传 ROM
  - 模拟器组件显示错误态（保持可用的 UI）
- 若 `rom_url` 存在：
  - 模拟器组件使用 `VITE_API_URL + rom_url` 拼出完整 URL 进行 fetch

### 模拟器组件（JSNES）

- 依赖：`jsnes`
- 渲染：
  - 使用 `<canvas>`，`imageRendering: pixelated`
  - 将 `onFrame` 的 framebuffer 转换为 `ImageData` 写入 canvas
- 控制：
  - 键盘映射：方向键、Z/X、Enter、Shift、ESC
- 重要：以“可运行”为优先，不做存档、音频、触屏按键等增强

## 安全与合规

- 文件上传限制：
  - 仅允许 `.nes`
  - 限制文件大小（例如 10MB）
- 防路径穿越：
  - 使用服务端生成的固定文件名，不使用用户原始文件名
- 访问控制：
  - 上传接口仅管理员可用
  - ROM 静态文件是公开可访问的（因为游戏详情页需要加载），如需加强可后续改为签名 URL 或鉴权下载

## 错误处理与用户体验

- 上传失败：返回明确错误信息（无权限/游戏不存在/文件非法）
- 前端上传过程中显示 loading，完成后 toast/提示
- 模拟器加载失败提示（ROM 不存在/网络错误）

## 验收标准

- 管理员在 `/admin` 能为任意游戏上传 `.nes`
- 上传后 `/api/games/:id` 返回 `rom_url` 非空且可访问
- 访问游戏详情页点击“开始游戏”能加载 ROM 并在 canvas 上渲染画面
- ROM 文件不进入 Git（`.gitignore` 生效）

## 非目标（本阶段不做）

- ROM 版本管理、多 ROM 切换
- 完整管理员 CRUD（新增/删除游戏、用户管理、成绩审核）
- 音频、手柄、触屏控制、存档等高级模拟器功能

