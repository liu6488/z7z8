import { defineStore } from 'pinia'
import { ref } from 'vue'
import { postsApi, type PostListItem, type Pagination } from '@/api/posts'

export const usePostsStore = defineStore('posts', () => {
  const posts = ref<PostListItem[]>([])
  const pagination = ref<Pagination>({ page: 1, pageSize: 10, total: 0, totalPages: 0 })
  const loading = ref(false)
  const keyword = ref('')
  const statusFilter = ref('all')

  async function fetchPosts(page = 1) {
    loading.value = true
    try {
      const res = await postsApi.list({
        page,
        pageSize: pagination.value.pageSize,
        keyword: keyword.value || undefined,
        status: statusFilter.value,
      })
      posts.value = res.data
      pagination.value = res.pagination
    } finally {
      loading.value = false
    }
  }

  return { posts, pagination, loading, keyword, statusFilter, fetchPosts }
})
