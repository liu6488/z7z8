-- PostgreSQL 初始化：建表 + 种子数据
-- 由 postgres 官方镜像在数据卷首次初始化时自动执行（/docker-entrypoint-initdb.d）
-- 注意：仅在数据卷为空时生效；已有数据后如需重置请执行 make clean

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
);

CREATE INDEX IF NOT EXISTS "posts_created_at_idx" ON "posts" ("created_at");
CREATE INDEX IF NOT EXISTS "posts_status_idx" ON "posts" ("status");

-- 种子数据（与 backend/prisma/seed.ts 保持一致）
INSERT INTO "posts" ("id", "title", "content", "excerpt", "tags", "status", "views") VALUES
(
    'seed-welcome',
    '欢迎来到我的博客',
    '# 欢迎来到我的博客

这是使用 **Vue 3 + Next.js + Prisma** 搭建的博客系统。

## 你可以做什么

- 在首页浏览所有文章
- 点击「写文章」创建新文章（支持 **Markdown**）
- 编辑器右侧实时预览渲染效果
- 点击文章卡片查看完整内容

## 技术栈

| 层级 | 技术 |
| --- | --- |
| 前端 | Vue 3 + Vite + Pinia + Tailwind CSS |
| 后端 | Next.js App Router (API Routes) |
| 数据库 | Prisma ORM + SQLite / PostgreSQL |

> 所有数据都存放在数据库中，刷新页面不会丢失。

```ts
const hello = () => console.log("Hello, blog!")
hello()
```',
    '使用 Vue 3 + Next.js + Prisma 搭建的博客系统，支持 Markdown 写作与实时预览。',
    '公告,Markdown',
    'published',
    0
),
(
    'seed-markdown-cheatsheet',
    'Markdown 写作速查',
    '# Markdown 写作速查

## 标题与段落

用 `#` 到 `######` 表示一到六级标题。

## 强调

- **粗体**：`**文字**`
- *斜体*：`*文字*`
- `行内代码`：反引号包裹

## 列表

1. 有序列表项一
2. 有序列表项二

- 无序列表项 A
- 无序列表项 B

## 引用与分割线

> 这是一段引用。

---

## 链接与图片

[访问 Next.js 官网](https://nextjs.org)

祝写作愉快！',
    '标题、强调、列表、引用、链接……常用 Markdown 语法速查。',
    '教程,Markdown',
    'published',
    0
),
(
    'seed-draft-example',
    '一篇未发布的草稿（示例）',
    '# 草稿示例

这篇文章是 **draft** 状态的种子数据，用于演示草稿功能。

在编辑器里把状态改为 published 即可发布。',
    'draft 状态的种子数据，用于演示草稿功能。',
    '示例',
    'draft',
    0
);
