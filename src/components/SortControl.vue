<template>
  <div class="flex items-center gap-4 mb-4">
    <label class="text-sm font-medium">排序方式：</label>
    <select
      v-model="sortBy"
      class="px-2 py-1 border rounded bg-white"
    >
      <option value="name">名称</option>
      <option value="netValue">净值</option>
      <option value="change">涨跌幅</option>
    </select>

    <button
      @click="toggleSortOrder"
      class="text-sm underline text-blue-600"
    >
      {{ sortAsc ? '升序 ↑' : '降序 ↓' }}
    </button>
  </div>
</template>

<script setup>
import { computed } from 'vue' 

const props = defineProps({
  modelValue: Object,       // 接收整个排序对象
})

const emit = defineEmits(['update:modelValue'])

const sortBy = computed({
  get: () => props.modelValue.sortBy,
  set: (value) => {
    emit('update:modelValue', { ...props.modelValue, sortBy: value })
  },
})

const sortAsc = computed({
  get: () => props.modelValue.sortAsc,
  set: (value) => {
    emit('update:modelValue', { ...props.modelValue, sortAsc: value })
  },
})

function toggleSortOrder() {
  emit('update:modelValue', { ...props.modelValue, sortAsc: !props.modelValue.sortAsc })
}
</script>
