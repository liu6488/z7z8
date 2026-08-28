<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { postsApi, type PostDetail } from '@/api/posts'
import { renderMarkdown } from '@/composables/useMarkdown'
import { IconArrowLeft, IconCheck, IconClock, IconFloppyDisk, IconPencil, IconX } from '@phosphor-icons/vue'

const route = useRoute()
const router = useRouter()

const editId = computed(() => (route.params.id as string) || '')
const isEdit = computed(() => !!editId.value)

const title = ref('')
const content = ref('# 新文章\n\n在这里用 **Markdown** 写作，右侧会实时预览渲染效果…')
const tags = ref('')
const excerpt = ref('')
const status = ref<'draft' | 'published'>('published')

const saving = ref(false)
const errorMsg = ref('')
const loaded = ref(!isEdit.value)

const renderedPreview = computed(() => renderMarkdown(content.value))

onMounted(async () => {
  if (!isEdit.value) return
  try {
    const res = await postsApi.get(editId.value)
    const p: PostDetail = res.data
    title.value = p.title
    content.value = p.content
    tags.value = p.tags
    excerpt.value = p.excerpt || ''
    status.value = p.status
  } catch {
    errorMsg.value = '文章不存在或加载失败'
  } finally {
    loaded.value = true
  }
})

async function save(publish?: 'draft' | 'published') {
  if (!title.value.trim()) {
    errorMsg.value = '请填写标题'
    return
  }
  if (!content.value.trim()) {
    errorMsg.value = '请填写正文内容'
    return
  }
  const finalStatus = publish ?? status.value
  saving.value = true
  errorMsg.value = ''
  try {
    const payload = {
      title: title.value.trim(),
      content: content.value,
      excerpt: excerpt.value.trim() || undefined,
      tags: tags.value.trim(),
      status: finalStatus,
    }
    if (isEdit.value) {
      await postsApi.update(editId.value, payload)
      router.push(`/posts/${editId.value}`)
    } else {
      const res = await postsApi.create(payload)
      router.push(`/posts/${res.data.id}`)
    }
  } catch (e: any) {
    const detail = e?.response?.data?.error
    errorMsg.value =
      Array.isArray(detail)
        ? detail.map((d: any) => d.message).join('；')
        : '保存失败，请稍后重试'
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <div v-if="!loaded" class="py-20 text-center text-zinc-400">加载中…</div>

  <div v-else>
    <!-- 页面标题栏 -->
    <div class="mb-8 flex items-center justify-between">
      <h1 class="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
        {{ isEdit ? '编辑文章' : '写新文章' }}
      </h1>
      <button
        class="flex items-center gap-1 text-sm text-zinc-500 transition-colors hover:text-indigo-600 dark:text-zinc-400 dark:hover:text-indigo-400"
        @click="router.back()"
      >
        <IconArrowLeft size={18} weight="bold" />
        返回
      </button>
    </div>

    <p v-if="errorMsg" class="mb-5 rounded-xl bg-red-50 px-4 py-2.5 text-sm text-red-600 dark:bg-red-900/20 dark:text-red-400">
      {{ errorMsg }}
    </p>

    <!-- 元信息输入 -->
    <div class="mb-5 grid gap-4 md:grid-cols-[2fr_1fr]">
      <div>
        <label class="mb-1.5 block text-sm font-medium text-zinc-700 dark:text-zinc-300">标题</label>
        <input
          v-model="title"
          type="text"
          placeholder="文章标题"
          class="input w-full"
        />
      </div>
      <div>
        <label class="mb-1.5 block text-sm font-medium text-zinc-700 dark:text-zinc-300">标签</label>
        <input
          v-model="tags"
          type="text"
          placeholder="标签（逗号分隔）"
          class="input w-full"
        />
      </div>
    </div>
    <div class="mb-6">
      <label class="mb-1.5 block text-sm font-medium text-zinc-700 dark:text-zinc-300">摘要 <span class="text-zinc-400">(可选)</span></label>
      <input
        v-model="excerpt"
        type="text"
        placeholder="文章摘要，留空自动截取"
        class="input w-full"
      />
    </div>

    <!-- 编辑 / 实时预览 双栏 -->
    <div class="grid gap-5 lg:grid-cols-2">
      <div>
        <div class="mb-2 flex items-center justify-between">
          <label class="text-sm font-medium text-zinc-700 dark:text-zinc-300">
            <IconPencil size={16} weight="bold" class="mr-1.5" />
            Markdown 编辑
          </label>
          <span class="text-xs text-zinc-400">{{ content.length }} 字符</span>
        </div>
        <textarea
          v-model="content"
          class="h-[520px] w-full resize-none rounded-xl border border-zinc-200 bg-white p-5 font-mono text-sm leading-7 outline-none transition-all focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200"
          placeholder="用 Markdown 写作…"
          spellcheck="false"
        ></textarea>
      </div>

      <div>
        <div class="mb-2 text-sm font-medium text-zinc-700 dark:text-zinc-300">
          <IconClock size={16} weight="bold" class="mr-1.5" />
          实时预览
        </div>
        <div class="h-[520px] overflow-y-auto rounded-xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <h1 class="mb-4 border-b border-zinc-200 pb-3 text-2xl font-bold text-zinc-900 dark:border-zinc-800 dark:text-zinc-100">
            {{ title || '（未命名）' }}
          </h1>
          <div class="markdown-body" v-html="renderedPreview"></div>
        </div>
      </div>
    </div>

    <!-- 操作栏 -->
    <div class="mt-8 flex items-center gap-3">
      <select
        v-model="status"
        class="rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-sm outline-none transition-all focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
      >
        <option value="published">发布</option>
        <option value="draft">存为草稿</option>
      </select>
      <button
        class="flex items-center gap-1.5 rounded-xl bg-indigo-600 px-6 py-2.5 text-sm font-medium text-white transition-all hover:bg-indigo-700 active:scale-[0.97] disabled:opacity-50"
        :disabled="saving"
        @click="save()"
      >
        <IconCheck size={16} weight="bold" v-if="!saving" />
        <IconClock size={16} weight="bold" v-else />
        {{ saving ? '保存中…' : isEdit ? '保存修改' : '创建文章' }}
      </button>
      <button
        v-if="!isEdit"
        class="flex items-center gap-1.5 rounded-xl border border-zinc-200 bg-white px-5 py-2.5 text-sm text-zinc-600 transition-all hover:bg-zinc-50 active:scale-[0.97] disabled:opacity-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800"
        :disabled="saving"
        @click="save('draft')"
      >
        <IconFloppyDisk size={16} weight="bold" />
        存草稿
      </button>
    </div>
  </div>
</template>
