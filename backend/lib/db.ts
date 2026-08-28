import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient }

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

// ============================================================
// 自愈式建表（仅 PostgreSQL 环境执行，幂等可重复）
// 背景：docker 的 init-scripts 只在数据卷【首次初始化】时执行；
// 若数据卷是历史残留（如上次失败的运行），表不会被创建，服务将不健康。
// 这里在应用启动时确保表结构与种子数据存在，免依赖 make clean。
// 本地 SQLite 开发走 prisma migrate，不执行以下 DDL。
// ============================================================
const DDL_POSTS = `
CREATE TABLE IF NOT EXISTS "posts" (
  "id"         TEXT PRIMARY KEY,
  "title"      TEXT NOT NULL,
  "content"    TEXT NOT NULL,
  "excerpt"    TEXT,
  "tags"       TEXT NOT NULL DEFAULT '',
  "status"     TEXT NOT NULL DEFAULT 'published',
  "views"      INTEGER NOT NULL DEFAULT 0,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
)`

const DDL_INDEX_1 = `CREATE INDEX IF NOT EXISTS "posts_created_at_idx" ON "posts" ("created_at")`
const DDL_INDEX_2 = `CREATE INDEX IF NOT EXISTS "posts_status_idx" ON "posts" ("status")`

const SEED_SQL = `
INSERT INTO "posts" ("id", "title", "content", "excerpt", "tags", "status", "views") VALUES
  ('seed-welcome', '欢迎来到我的博客',
   '# 欢迎来到我的博客

这是使用 **Vue 3 + Next.js + Prisma** 搭建的博客系统。

## 你可以做什么

- 在首页浏览所有文章
- 点击「写文章」创建新文章（支持 **Markdown**）
- 编辑器右侧实时预览渲染效果

> 所有数据都存放在数据库中，刷新页面不会丢失。',
   '使用 Vue 3 + Next.js + Prisma 搭建的博客系统，支持 Markdown 写作与实时预览。',
   '公告,Markdown', 'published', 0),
  ('seed-markdown-cheatsheet', 'Markdown 写作速查',
   '# Markdown 写作速查

## 强调

- **粗体**：星号包裹
- *斜体*：单星号包裹

## 列表

1. 有序列表项一
- 无序列表项 A

> 这是一段引用。',
   '常用 Markdown 语法速查。', '教程,Markdown', 'published', 0)
ON CONFLICT ("id") DO NOTHING`

function sanitizeUrl(url: string): string {
  // 脱敏：隐藏连接串中的密码，便于打日志
  return url.replace(/\/\/[^:@/]+:[^@/]+@/, '//***:***@')
}

async function bootstrapSchema(): Promise<void> {
  const started = Date.now()
  console.log(
    `[db] bootstrap start (postgres) url=${sanitizeUrl(process.env.DATABASE_URL ?? '')}`,
  )
  await prisma.$executeRawUnsafe(DDL_POSTS)
  console.log('[db] bootstrap: posts table OK')
  await prisma.$executeRawUnsafe(DDL_INDEX_1)
  await prisma.$executeRawUnsafe(DDL_INDEX_2)
  console.log('[db] bootstrap: indexes OK')
  await prisma.$executeRawUnsafe(SEED_SQL)
  console.log(`[db] bootstrap OK in ${Date.now() - started}ms`)
}

function withTimeout<T>(p: Promise<T>, ms: number, label: string): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timer = setTimeout(
      () => reject(new Error(`[db] ${label} timed out after ${ms}ms`)),
      ms,
    )
    p.then(
      (v) => {
        clearTimeout(timer)
        resolve(v)
      },
      (e) => {
        clearTimeout(timer)
        reject(e)
      },
    )
  })
}

const isPostgres = (process.env.DATABASE_URL ?? '').startsWith('postgres')

export const dbReady: Promise<void> = isPostgres
  ? withTimeout(bootstrapSchema(), 25000, 'bootstrapSchema').catch((e) => {
      console.error(
        '[db] schema bootstrap FAILED:',
        e instanceof Error ? e.message : e,
      )
      throw e
    })
  : Promise.resolve()
