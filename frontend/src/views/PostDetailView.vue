<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { postsApi, type PostDetail } from '@/api/posts'
import { renderMarkdown } from '@/composables/useMarkdown'
import { IconCaretLeft, IconClock, IconPencil, IconEye } from '@phosphor-icons/vue'

const route = useRoute()
const router = useRouter()

const post = ref<PostDetail | null>(null)
const loading = ref(true)
const error = ref('')

const renderedContent = computed(() =>
  post.value ? renderMarkdown(post.value.content) : '',
)

const formattedDate = computed(() => {
  if (!post.value) return ''
  const d = new Date(post.value.updatedAt)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
})

onMounted(async () => {
  try {
    const res = await postsApi.get(route.params.id as string)
    post.value = res.data
  } catch (e: any) {
    error.value = e?.response?.status === 404 ? '文章不存在或已被删除' : '加载失败，请稍后重试'
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <div v-if="loading" class="py-20 text-center text-zinc-400">
    <IconClock size={48} weight="light" class="mx-auto mb-4 text-zinc-300" />
    <p>加载中…</p>
  </div>

  <div v-else-if="error" class="py-20 text-center">
    <p class="mb-6 text-zinc-500">{{ error }}</p>
    <button
      class="flex items-center gap-1 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-medium text-white transition-all hover:bg-indigo-700 active:scale-[0.97]"
      @click="router.push('/')"
    >
      <IconCaretLeft size={18} weight="bold" />
      返回首页
    </button>
  </div>

  <article v-else-if="post" class="mx-auto max-w-3xl">
    <!-- 文章头部 -->
    <header class="mb-10">
      <div class="mb-4 flex items-center gap-3 text-xs text-zinc-400">
        <span
          class="rounded-full px-3 py-1 font-medium"
          :class="post.status === 'published' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'"
        >
          {{ post.status === 'published' ? '已发布' : '草稿' }}
        </span>
        <span class="flex items-center gap-1">
          <IconEye size={14} weight="fill" />
          {{ post.views }} 次阅读
        </span>
        <span class="flex items-center gap-1">
          <IconClock size={14} weight="fill" />
          {{ formattedDate }}
        </span>
      </div>
      <h1 class="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
        {{ post.title }}
      </h1>
      <div class="mt-5 flex items-center justify-between">
        <div class="flex flex-wrap gap-2">
          <span
            v-for="tag in post.tags.split(',').filter(Boolean)"
            :key="tag"
            class="rounded-full bg-zinc-100 px-3 py-1 text-xs font-medium text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400"
          >
            {{ tag }}
          </span>
        </div>
        <button
          class="flex items-center gap-1 text-sm text-zinc-400 transition-colors hover:text-indigo-600"
          @click="router.push(`/posts/${post.id}/edit`)"
        >
          <IconPencil size={16} weight="bold" />
          编辑
        </button>
      </div>
    </header>

    <!-- 文章正文 -->
    <div class="markdown-body" v-html="renderedContent"></div>

    <!-- 底部导航 -->
    <footer class="mt-12 border-t border-zinc-200 pt-8 dark:border-zinc-800">
      <button
        class="flex items-center gap-1 text-indigo-600 transition-colors hover:underline dark:text-indigo-400"
        @click="router.push('/')"
      >
        <IconCaretLeft size={18} weight="bold" />
        返回文章列表
      </button>
    </footer>
  </article>
</template>
