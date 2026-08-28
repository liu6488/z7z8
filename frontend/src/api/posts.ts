import request from './request'

export interface PostListItem {
  id: string
  title: string
  excerpt: string | null
  tags: string
  status: 'draft' | 'published'
  views: number
  createdAt: string
  updatedAt: string
}

export interface PostDetail extends PostListItem {
  content: string
}

export interface Pagination {
  page: number
  pageSize: number
  total: number
  totalPages: number
}

export interface PostListResponse {
  data: PostListItem[]
  pagination: Pagination
}

export interface PostInput {
  title: string
  content: string
  excerpt?: string | null
  tags?: string
  status?: 'draft' | 'published'
}

export const postsApi = {
  list(params: { page?: number; pageSize?: number; keyword?: string; status?: string }) {
    return request.get('/v1/posts', { params }) as unknown as Promise<PostListResponse>
  },

  get(id: string) {
    return request.get(`/v1/posts/${id}`) as unknown as Promise<{ data: PostDetail }>
  },

  create(payload: PostInput) {
    return request.post('/v1/posts', payload) as unknown as Promise<{ data: PostDetail }>
  },

  update(id: string, payload: Partial<PostInput>) {
    return request.put(`/v1/posts/${id}`, payload) as unknown as Promise<{ data: PostDetail }>
  },

  remove(id: string) {
    return request.delete(`/v1/posts/${id}`) as unknown as Promise<{ data: { id: string } }>
  },
}
