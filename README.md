# 我的博客 (Blog)

一个前后端分离的博客系统：**Vue 3 前端 + Next.js API 后端 + Prisma ORM + 数据库持久化**。架构参考 [coze-studio](https://github.com/coze-dev/coze-studio) 工程规范搭建。

## 功能

| 功能 | 说明 |
| --- | --- |
| 文章列表 | 分页展示、关键词搜索、按状态筛选、标签展示、阅读数统计 |
| 创建文章 | Markdown 编辑器，右侧**实时预览**渲染效果，支持发布/草稿两种状态 |
| 预览文章 | 文章详情页渲染 Markdown（marked + DOMPurify 消毒，防 XSS） |
| 编辑/删除 | 修改已有文章、删除文章 |
| 数据持久化 | **所有数据存放在数据库**（本地默认 SQLite，Docker 部署用 PostgreSQL） |

## 技术栈

| 层级 | 技术 |
| --- | --- |
| 前端 | Vue 3.5 + Vite 5 + TypeScript + Pinia + Vue Router + Tailwind CSS |
| Markdown | marked + DOMPurify（渲染 + 消毒） |
| 后端 | Next.js 14 App Router（API Routes，`/api/v1/*` 版本化） |
| ORM | Prisma |
| 数据库 | SQLite（本地零依赖）/ PostgreSQL 16（Docker 部署） |
| 缓存 | Redis 7（Docker 部署，health 端点检查；本地可关） |
| 部署 | Docker Compose + Nginx 反向代理，healthcheck 驱动启动顺序 |

## 快速开始

### 方式一：本地开发（无需 Docker，默认 SQLite）

```bash
# 1. 启动后端 (端口 3000)
cd backend
npm install
npx prisma migrate dev --name init   # 建表
npm run db:seed                      # 注入示例文章
npm run dev

# 2. 新开终端, 启动前端 (端口 5173)
cd frontend
npm install
npm run dev
```

访问 **http://localhost:5173** 即可使用。数据保存在 `backend/prisma/dev.db`。

### 方式二：Docker 完整部署（PostgreSQL + Redis + Nginx）

```bash
make setup   # 初始化 .env 并安装依赖
make up      # 构建并启动全部服务
make health  # 健康检查
make test    # 连通性测试
```

访问 **http://localhost**。首次启动后执行一次 `make migrate && make seed` 完成建表与示例数据。

> 注意：Docker 部署使用 PostgreSQL，需将 `backend/prisma/schema.prisma` 中 `provider` 从 `"sqlite"` 改为 `"postgresql"`。

## API 一览

| 方法 | 路径 | 说明 |
| --- | --- | --- |
| GET | `/api/health` | 健康检查（DB / Redis） |
| GET | `/api/v1/posts?page=&pageSize=&keyword=&status=&tag=` | 文章列表（分页+搜索+筛选） |
| POST | `/api/v1/posts` | 创建文章 |
| GET | `/api/v1/posts/:id` | 文章详情（阅读数 +1） |
| PUT | `/api/v1/posts/:id` | 更新文章 |
| DELETE | `/api/v1/posts/:id` | 删除文章 |

## 常用命令

```bash
make run-local     # 本地快速安装+迁移+种子 (无 Docker)
make studio        # 打开 Prisma Studio 可视化管理数据库
make seed          # 注入种子数据
make logs          # 查看容器日志
make down          # 停止所有服务
make clean         # 清空所有数据 (危险)
```

## 目录结构

```
blog/
├── frontend/          # Vue 3 应用 (列表 / 编辑器 / 详情)
├── backend/           # Next.js API + Prisma
├── docker/            # docker-compose / nginx / .env.example
├── scripts/           # 健康检查与连通性测试
└── Makefile           # 统一命令入口
```
