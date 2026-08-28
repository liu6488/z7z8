import { z } from 'zod'

export const createPostSchema = z.object({
  title: z.string().min(1, '标题不能为空').max(200),
  content: z.string().min(1, '内容不能为空'),
  excerpt: z.string().max(500).optional().nullable(),
  tags: z.string().max(200).optional().default(''),
  status: z.enum(['draft', 'published']).optional().default('published'),
})

export const updatePostSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  content: z.string().min(1).optional(),
  excerpt: z.string().max(500).optional().nullable(),
  tags: z.string().max(200).optional(),
  status: z.enum(['draft', 'published']).optional(),
})

export const listQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(50).default(10),
  keyword: z.string().optional(),
  status: z.enum(['draft', 'published', 'all']).optional().default('all'),
  tag: z.string().optional(),
})
