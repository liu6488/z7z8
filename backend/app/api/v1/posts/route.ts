import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { createPostSchema, listQuerySchema } from '@/lib/validators'

// GET /api/v1/posts?page=1&pageSize=10&keyword=&status=all&tag=
export async function GET(req: NextRequest) {
  const params = Object.fromEntries(req.nextUrl.searchParams.entries())
  const parsed = listQuerySchema.safeParse(params)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.errors }, { status: 400 })
  }
  const { page, pageSize, keyword, status, tag } = parsed.data

  const where: Record<string, unknown> = {}
  if (status === 'draft' || status === 'published') {
    where.status = status
  }
  if (keyword) {
    where.OR = [
      { title: { contains: keyword } },
      { content: { contains: keyword } },
    ]
  }
  if (tag) {
    where.tags = { contains: tag }
  }

  const [total, posts] = await Promise.all([
    prisma.post.count({ where }),
    prisma.post.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * pageSize,
      take: pageSize,
      select: {
        id: true,
        title: true,
        excerpt: true,
        tags: true,
        status: true,
        views: true,
        createdAt: true,
        updatedAt: true,
      },
    }),
  ])

  return NextResponse.json({
    data: posts,
    pagination: { page, pageSize, total, totalPages: Math.ceil(total / pageSize) },
  })
}

// POST /api/v1/posts
export async function POST(req: NextRequest) {
  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: '请求体必须是合法 JSON' }, { status: 400 })
  }

  const parsed = createPostSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.errors }, { status: 400 })
  }

  const data = {
    ...parsed.data,
    excerpt:
      parsed.data.excerpt ??
      parsed.data.content.replace(/[#*`>\-\[\]()!]/g, '').slice(0, 120),
  }

  const post = await prisma.post.create({ data })
  return NextResponse.json({ data: post }, { status: 201 })
}
