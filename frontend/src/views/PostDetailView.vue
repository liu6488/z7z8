<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { postsApi, type PostDetail } from '@/api/posts'
import { renderMarkdown } from '@/composables/useMarkdown'
import { PhArrowLeft, PhClock, PhPenNib, PhEye } from '@phosphor-icons/vue'

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
  <div v-if="loading" class="mx-auto max-w-3xl py-16">
    <div class="skeleton mb-6 h-4 w-40" />
    <div class="skeleton mb-4 h-12 w-3/4" />
    <div class="skeleton mb-10 h-4 w-52" />
    <div class="space-y-3">
      <div class="skeleton h-4 w-full" />
      <div class="skeleton h-4 w-full" />
      <div class="skeleton h-4 w-11/12" />
      <div class="skeleton h-4 w-4/5" />
    </div>
  </div>

  <div v-else-if="error" class="mx-auto max-w-3xl py-24 text-center">
    <p class="mb-6 text-zinc-500 dark:text-zinc-400">{{ error }}</p>
    <button
      class="btn btn-primary px-6"
      @click="router.push('/')"
    >
      <PhArrowLeft :size="16" weight="bold" />
      返回首页
    </button>
  </div>

  <article v-else-if="post" class="mx-auto max-w-3xl">
    <!-- 返回 -->
    <div class="mb-10">
      <button
        class="btn btn-ghost -ml-2 h-9 px-3 text-sm"
        @click="router.push('/')"
      >
        <PhArrowLeft :size="16" weight="bold" />
        返回列表
      </button>
    </div>

    <!-- 文章头部 -->
    <header class="rise-in mb-12">
      <div class="mb-5 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-zinc-400 dark:text-zinc-500">
        <span
          class="badge"
          :class="post.status === 'published' ? 'badge-published' : 'badge-draft'"
        >
          {{ post.status === 'published' ? '已发布' : '草稿' }}
        </span>
        <span class="flex items-center gap-1.5 tabular-nums">
          <PhEye :size="13" weight="fill" />
          {{ post.views }} 次阅读
        </span>
        <span class="flex items-center gap-1.5 tabular-nums">
          <PhClock :size="13" weight="fill" />
          {{ formattedDate }}
        </span>
      </div>

      <h1 class="text-3xl font-semibold leading-[1.15] tracking-tighter text-zinc-900 md:text-5xl dark:text-zinc-50">
        {{ post.title }}
      </h1>

      <div class="mt-6 flex flex-wrap items-center justify-between gap-4 border-y border-zinc-200 py-4 dark:border-zinc-800">
        <div class="flex flex-wrap gap-2">
          <span
            v-for="tag in post.tags.split(',').filter(Boolean)"
            :key="tag"
            class="tag"
          >
            {{ tag }}
          </span>
        </div>
        <button
          class="btn btn-secondary h-9 px-3.5 text-xs"
          @click="router.push(`/posts/${post.id}/edit`)"
        >
          <PhPenNib :size="14" weight="bold" />
          编辑
        </button>
      </div>
    </header>

    <!-- 文章正文 -->
    <div class="markdown-body rise-in" style="animation-delay: 120ms" v-html="renderedContent"></div>

    <!-- 底部返回 -->
    <footer class="mt-14 border-t border-zinc-200 pt-8 dark:border-zinc-800">
      <button
        class="btn btn-ghost -ml-2 px-3 text-sm text-zinc-500 dark:text-zinc-400"
        @click="router.push('/')"
      >
        <PhArrowLeft :size="16" weight="bold" />
        返回文章列表
      </button>
    </footer>
  </article>
</template>
