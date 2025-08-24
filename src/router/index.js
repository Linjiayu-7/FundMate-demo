// src/router/index.js
import { createRouter, createWebHistory } from 'vue-router'

const HomeView = () => import('../pages/HomeView.vue')
const StatsView = () => import('../pages/StatsView.vue')
const AboutView = () => import('../pages/AboutView.vue')

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', name: 'home', component: HomeView },
    { path: '/stats', name: 'stats', component: StatsView },
    { path: '/about', name: 'about', component: AboutView },
    { path: '/:pathMatch(.*)*', redirect: '/' }  // 兜底跳回首页
  ]
})

export default router
