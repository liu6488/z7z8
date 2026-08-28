import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      name: 'home',
      component: () => import('@/views/HomeView.vue'),
    },
    {
      path: '/posts/new',
      name: 'post-new',
      component: () => import('@/views/PostEditorView.vue'),
    },
    {
      path: '/posts/:id/edit',
      name: 'post-edit',
      component: () => import('@/views/PostEditorView.vue'),
    },
    {
      path: '/posts/:id',
      name: 'post-detail',
      component: () => import('@/views/PostDetailView.vue'),
    },
  ],
})

export default router
