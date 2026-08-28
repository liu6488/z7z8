<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { postsApi, type PostDetail } from '@/api/posts'
import { renderMarkdown } from '@/composables/useMarkdown'
import { PhArrowLeft, PhCheck, PhClock, PhFloppyDisk, PhPenNib, PhEye, PhWarning } from '@phosphor-icons/vue'

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
  <div v-if="!loaded" class="mx-auto max-w-5xl py-16">
    <div class="skeleton mb-6 h-9 w-48" />
    <div class="skeleton mb-4 h-12 w-full" />
    <div class="skeleton h-[520px] w-full" />
  </div>

  <div v-else class="mx-auto max-w-5xl">
    <!-- 页面标题栏 -->
    <div class="mb-8 flex items-center gap-3">
      <button
        class="btn btn-ghost h-9 w-9 p-0"
        title="返回"
        @click="router.back()"
      >
        <PhArrowLeft :size="16" weight="bold" />
      </button>
      <h1 class="text-3xl font-semibold tracking-tighter text-zinc-900 dark:text-zinc-50">
        {{ isEdit ? '编辑文章' : '写新文章' }}
      </h1>
    </div>

    <!-- 错误提示 -->
    <transition
      enter-active-class="transition duration-200 ease-out"
      enter-from-class="opacity-0 -translate-y-1"
      leave-active-class="transition duration-150 ease-in"
      leave-to-class="opacity-0"
    >
      <p v-if="errorMsg" class="mb-5 flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-sm text-red-600 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-400">
        <PhWarning :size="16" weight="fill" />
        {{ errorMsg }}
      </p>
    </transition>

    <!-- 元信息输入 -->
    <div class="mb-6 grid gap-5 md:grid-cols-[2fr_1fr]">
      <div>
        <label class="field-label" for="post-title">标题</label>
        <input
          id="post-title"
          v-model="title"
          type="text"
          placeholder="文章标题"
          class="input"
        />
      </div>
      <div>
        <label class="field-label" for="post-tags">标签</label>
        <input
          id="post-tags"
          v-model="tags"
          type="text"
          placeholder="标签（逗号分隔）"
          class="input"
        />
      </div>
    </div>
    <div class="mb-6">
      <label class="field-label" for="post-excerpt">摘要 <span class="font-normal text-zinc-400">(可选)</span></label>
      <input
        id="post-excerpt"
        v-model="excerpt"
        type="text"
        placeholder="文章摘要，留空自动截取"
        class="input"
      />
    </div>

    <!-- 编辑 / 实时预览 双栏 -->
    <div class="grid gap-5 lg:grid-cols-2">
      <section class="panel">
        <div class="panel-header">
          <label class="flex items-center gap-1.5 text-sm font-medium text-zinc-700 dark:text-zinc-300">
            <PhPenNib :size="15" weight="bold" />
            Markdown 编辑
          </label>
          <span class="text-xs tabular-nums text-zinc-400">{{ content.length }} 字符</span>
        </div>
        <textarea
          v-model="content"
          class="h-[520px] w-full resize-none bg-white p-5 font-mono text-sm leading-7 text-zinc-800 outline-none transition-colors placeholder:text-zinc-400 focus:bg-zinc-50/60 dark:bg-zinc-900 dark:text-zinc-200 dark:placeholder:text-zinc-600 dark:focus:bg-zinc-950/40"
          placeholder="用 Markdown 写作…"
          spellcheck="false"
        ></textarea>
      </section>

      <section class="panel">
        <div class="panel-header">
          <span class="flex items-center gap-1.5 text-sm font-medium text-zinc-700 dark:text-zinc-300">
            <PhEye :size="15" weight="bold" />
            实时预览
          </span>
        </div>
        <div class="h-[520px] overflow-y-auto bg-zinc-50/60 p-6 dark:bg-zinc-950/30">
          <h1 class="mb-5 border-b border-zinc-200 pb-4 text-2xl font-semibold tracking-tight text-zinc-900 dark:border-zinc-800 dark:text-zinc-50">
            {{ title || '未命名' }}
          </h1>
          <div class="markdown-body" v-html="renderedPreview"></div>
        </div>
      </section>
    </div>

    <!-- 操作栏 -->
    <div class="mt-8 flex flex-wrap items-center gap-3">
      <select
        v-model="status"
        class="input h-[42px] w-auto"
      >
        <option value="published">发布</option>
        <option value="draft">存为草稿</option>
      </select>
      <button
        class="btn btn-primary h-[42px] px-6"
        :disabled="saving"
        @click="save()"
      >
        <PhCheck :size="16" weight="bold" v-if="!saving" />
        <PhClock :size="16" weight="bold" v-else />
        {{ saving ? '保存中…' : isEdit ? '保存修改' : '创建文章' }}
      </button>
      <button
        v-if="!isEdit"
        class="btn btn-secondary h-[42px] px-5"
        :disabled="saving"
        @click="save('draft')"
      >
        <PhFloppyDisk :size="16" weight="bold" />
        存草稿
      </button>
    </div>
  </div>
</template>
