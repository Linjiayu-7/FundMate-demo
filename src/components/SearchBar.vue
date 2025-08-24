<template>
  <div>
    <label class="block text-sm font-medium mb-2">搜索基金（名称/代码）</label>
    <input
      v-model="input" 
      type="text"
      placeholder="例如：蓝筹、110011"
      class="w-full px-3 py-2 rounded border focus:outline-none focus:ring focus:ring-blue-200 bg-white"
      aria-label="搜索基金"
    />
    <p class="text-sm text-gray-600 mt-2">
      搜索结果：<span class="font-semibold">{{ count }}</span> 条
    </p>
  </div>
</template>

<script setup>
// 导入 Vue 相关功能
import { computed } from 'vue'

// 接收父组件传来的数据（modelValue 和 count）
const props = defineProps({
  modelValue: String,  // 父组件传递的搜索关键词
  count: Number,       // 父组件传递的搜索结果数量
})

// emit 用于发射事件给父组件
const emit = defineEmits(['update:modelValue'])

// 用 computed 创建双向绑定
const input = computed({
  get: () => props.modelValue,  // 从父组件获取数据
  set: (value) => emit('update:modelValue', value)  // 更新父组件数据
})
</script>

<style scoped>
/* 根据需求可以在这里添加额外样式，Tailwind 已经处理大部分 */
</style>
