<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { postsApi, type PostDetail } from '@/api/posts'
import { renderMarkdown } from '@/composables/useMarkdown'

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
  <div v-if="!loaded" class="py-20 text-center text-gray-400">加载中…</div>

  <div v-else>
    <div class="mb-6 flex items-center justify-between">
      <h1 class="text-2xl font-bold">{{ isEdit ? '编辑文章' : '写新文章' }}</h1>
      <button class="text-sm text-gray-400 hover:text-indigo-600" @click="router.back()">
        ← 返回
      </button>
    </div>

    <p v-if="errorMsg" class="mb-4 rounded-lg bg-red-50 px-4 py-2 text-sm text-red-600">
      {{ errorMsg }}
    </p>

    <!-- 元信息 -->
    <div class="mb-4 grid gap-3 md:grid-cols-[2fr_1fr]">
      <input
        v-model="title"
        type="text"
        placeholder="文章标题"
        class="rounded-xl border border-gray-300 px-4 py-2.5 text-lg font-medium outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
      />
      <input
        v-model="tags"
        type="text"
        placeholder="标签（逗号分隔）"
        class="rounded-xl border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
      />
    </div>
    <input
      v-model="excerpt"
      type="text"
      placeholder="摘要（可选，留空自动截取正文）"
      class="mb-4 w-full rounded-xl border border-gray-300 px-4 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
    />

    <!-- 编辑 / 实时预览 双栏 -->
    <div class="grid gap-4 lg:grid-cols-2">
      <div>
        <div class="mb-2 flex items-center justify-between">
          <label class="text-sm font-medium text-gray-700">Markdown 编辑</label>
          <span class="text-xs text-gray-400">{{ content.length }} 字符</span>
        </div>
        <textarea
          v-model="content"
          class="h-[520px] w-full resize-none rounded-xl border border-gray-300 bg-white p-4 font-mono text-sm leading-6 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
          placeholder="用 Markdown 写作…"
          spellcheck="false"
        ></textarea>
      </div>

      <div>
        <div class="mb-2 text-sm font-medium text-gray-700">实时预览</div>
        <div
          class="h-[520px] overflow-y-auto rounded-xl border border-gray-200 bg-white p-6 shadow-inner"
        >
          <h1 class="mb-4 border-b border-gray-100 pb-3 text-2xl font-bold text-gray-900">
            {{ title || '（未命名）' }}
          </h1>
          <div class="markdown-body" v-html="renderedPreview"></div>
        </div>
      </div>
    </div>

    <!-- 操作栏 -->
    <div class="mt-6 flex items-center gap-3">
      <select
        v-model="status"
        class="rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-indigo-500"
      >
        <option value="published">发布</option>
        <option value="draft">存为草稿</option>
      </select>
      <button
        class="rounded-lg bg-indigo-600 px-6 py-2 text-sm font-medium text-white transition hover:bg-indigo-700 disabled:opacity-50"
        :disabled="saving"
        @click="save()"
      >
        {{ saving ? '保存中…' : isEdit ? '保存修改' : '创建文章' }}
      </button>
      <button
        v-if="!isEdit"
        class="rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 disabled:opacity-50"
        :disabled="saving"
        @click="save('draft')"
      >
        存草稿
      </button>
    </div>
  </div>
</template>
