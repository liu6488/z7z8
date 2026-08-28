import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const samplePosts = [
  {
    title: '欢迎来到我的博客',
    content:
      '# 欢迎来到我的博客\n\n这是使用 **Vue 3 + Next.js + Prisma** 搭建的博客系统。\n\n## 你可以做什么\n\n- 在首页浏览所有文章\n- 点击「写文章」创建新文章（支持 **Markdown**）\n- 编辑器右侧实时预览渲染效果\n- 点击文章卡片查看完整内容\n\n## 技术栈\n\n| 层级 | 技术 |\n| --- | --- |\n| 前端 | Vue 3 + Vite + Pinia + Tailwind CSS |\n| 后端 | Next.js App Router (API Routes) |\n| 数据库 | Prisma ORM + SQLite / PostgreSQL |\n\n> 所有数据都存放在数据库中，刷新页面不会丢失。\n\n```ts\nconst hello = () => console.log("Hello, blog!")\nhello()\n```',
    tags: '公告,Markdown',
    status: 'published',
  },
  {
    title: 'Markdown 写作速查',
    content:
      '# Markdown 写作速查\n\n## 标题与段落\n\n用 `#` 到 `######` 表示一到六级标题。\n\n## 强调\n\n- **粗体**：`**文字**`\n- *斜体*：`*文字*`\n- `行内代码`：反引号包裹\n\n## 列表\n\n1. 有序列表项一\n2. 有序列表项二\n\n- 无序列表项 A\n- 无序列表项 B\n\n## 引用与分割线\n\n> 这是一段引用。\n\n---\n\n## 链接与图片\n\n[访问 Next.js 官网](https://nextjs.org)\n\n祝写作愉快！',
    tags: '教程,Markdown',
    status: 'published',
  },
  {
    title: '一篇未发布的草稿（示例）',
    content: '# 草稿示例\n\n这篇文章是 **draft** 状态的种子数据，用于演示草稿功能。\n\n在编辑器里把状态改为 published 即可发布。',
    tags: '示例',
    status: 'draft',
  },
]

async function main() {
  for (const post of samplePosts) {
    const existing = await prisma.post.findFirst({ where: { title: post.title } })
    if (!existing) {
      await prisma.post.create({ data: post })
      console.log(`Seeded: ${post.title}`)
    }
  }
  console.log('Seed completed.')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
