<script setup>
// 布局外壳，不放业务逻辑
import { useRoute, RouterLink, RouterView } from 'vue-router'
const route = useRoute()
function isActive(path) { return route.path === path }
</script>

<template>
  <div class="min-h-screen bg-gray-100">
    <!-- 顶部导航：轻渐变 + 当前路由高亮 -->
    <header class="bg-white/90 backdrop-blur sticky top-0 z-40 border-b border-gray-100">
      <nav class="max-w-6xl mx-auto flex items-center justify-between p-4">
        <RouterLink to="/" class="flex items-center gap-2">
          <div class="h-8 w-8 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600"></div>
          <span class="text-xl font-bold tracking-tight">FundMate</span>
        </RouterLink>

        <div class="flex items-center gap-2">
          <RouterLink
            to="/"
            class="px-3 py-1.5 rounded-lg hover:bg-gray-50 transition"
            :class="isActive('/') ? 'text-blue-600 bg-blue-50' : 'text-gray-700'">
            首页
          </RouterLink>
          <RouterLink
            to="/stats"
            class="px-3 py-1.5 rounded-lg hover:bg-gray-50 transition"
            :class="isActive('/stats') ? 'text-blue-600 bg-blue-50' : 'text-gray-700'">
            统计
          </RouterLink>
          <RouterLink
            to="/about"
            class="px-3 py-1.5 rounded-lg hover:bg-gray-50 transition"
            :class="isActive('/about') ? 'text-blue-600 bg-blue-50' : 'text-gray-700'">
            关于
          </RouterLink>
        </div>
      </nav>
    </header>

    <main class="max-w-6xl mx-auto p-6">
      <RouterView/>
    </main>
  </div>
</template>
