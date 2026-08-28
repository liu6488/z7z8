import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { updatePostSchema } from '@/lib/validators'

type Ctx = { params: { id: string } }

// GET /api/v1/posts/:id —— 文章详情（预览页数据源，附带阅读数自增）
export async function GET(_req: NextRequest, { params }: Ctx) {
  const post = await prisma.post.findUnique({ where: { id: params.id } })
  if (!post) {
    return NextResponse.json({ error: '文章不存在' }, { status: 404 })
  }
  const updated = await prisma.post.update({
    where: { id: params.id },
    data: { views: { increment: 1 } },
  })
  return NextResponse.json({ data: updated })
}

// PUT /api/v1/posts/:id
export async function PUT(req: NextRequest, { params }: Ctx) {
  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: '请求体必须是合法 JSON' }, { status: 400 })
  }

  const parsed = updatePostSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.errors }, { status: 400 })
  }

  const existing = await prisma.post.findUnique({ where: { id: params.id } })
  if (!existing) {
    return NextResponse.json({ error: '文章不存在' }, { status: 404 })
  }

  const post = await prisma.post.update({
    where: { id: params.id },
    data: parsed.data,
  })
  return NextResponse.json({ data: post })
}

// DELETE /api/v1/posts/:id
export async function DELETE(_req: NextRequest, { params }: Ctx) {
  const existing = await prisma.post.findUnique({ where: { id: params.id } })
  if (!existing) {
    return NextResponse.json({ error: '文章不存在' }, { status: 404 })
  }
  await prisma.post.delete({ where: { id: params.id } })
  return NextResponse.json({ data: { id: params.id, deleted: true } })
}
