<template>
  <form
    class="bg-white rounded-lg shadow p-4 grid grid-cols-1 md:grid-cols-2 gap-4"
    @submit.prevent="onSubmit"
  >
    <h2 class="md:col-span-2 text-lg font-bold">新增基金</h2>

    <!-- 名称 -->
    <div>
      <label class="block text-sm font-medium mb-1">基金名称 *</label>
      <input
        v-model.trim="form.name"
        type="text"
        placeholder="如：易方达蓝筹精选"
        class="w-full px-3 py-2 rounded border focus:outline-none focus:ring focus:ring-blue-200"
      />
      <p v-if="errors.name" class="text-sm text-red-600 mt-1">{{ errors.name }}</p>
    </div>

    <!-- 代码 -->
    <div>
      <label class="block text-sm font-medium mb-1">基金代码 *</label>
      <input
        v-model.trim="form.code"
        type="text"
        placeholder="6 位数字，如 110011"
        class="w-full px-3 py-2 rounded border focus:outline-none focus:ring focus:ring-blue-200"
      />
      <p v-if="errors.code" class="text-sm text-red-600 mt-1">{{ errors.code }}</p>
    </div>

    <!-- 净值 -->
    <div>
      <label class="block text-sm font-medium mb-1">净值 *</label>
      <input
        v-model.number="form.netValue"
        type="number"
        step="0.0001"
        min="0"
        placeholder="如 1.8590"
        class="w-full px-3 py-2 rounded border focus:outline-none focus:ring focus:ring-blue-200"
      />
      <p v-if="errors.netValue" class="text-sm text-red-600 mt-1">{{ errors.netValue }}</p>
    </div>

    <!-- 涨跌 -->
    <div>
      <label class="block text-sm font-medium mb-1">涨跌（%）*</label>
      <input
        v-model.number="form.change"
        type="number"
        step="0.01"
        placeholder="如 0.53 或 -0.42"
        class="w-full px-3 py-2 rounded border focus:outline-none focus:ring focus:ring-blue-200"
      />
      <p v-if="errors.change" class="text-sm text-red-600 mt-1">{{ errors.change }}</p>
    </div>

    <!-- 风险提示 -->
    <div class="md:col-span-2">
      <label class="block text-sm font-medium mb-1">风险说明 *</label>
      <input
        v-model.trim="form.risk"
        type="text"
        placeholder="如：股票型高风险"
        class="w-full px-3 py-2 rounded border focus:outline-none focus:ring focus:ring-blue-200"
      />
      <p v-if="errors.risk" class="text-sm text-red-600 mt-1">{{ errors.risk }}</p>
    </div>

    <!-- 提交按钮 -->
    <div class="md:col-span-2 text-right">
      <button
        type="submit"
        :disabled="!isValid"
        class="px-4 py-2 rounded text-white"
        :class="isValid ? 'bg-green-600 hover:bg-green-700' : 'bg-gray-400 cursor-not-allowed'"
      >
        保存基金
      </button>
    </div>
  </form>
</template>

<script setup>
import { reactive, computed, watch } from 'vue'

const emit = defineEmits(['submit'])

const form = reactive({
  name: '',
  code: '',
  netValue: null,
  change: null,
  risk: '',
})

function isNumericLike(v) {
  return /^-?\d+(\.\d+)?$/.test(String(v).trim())
}

const errors = computed(() => {
  const e = {}
  if (!form.name.trim()) e.name = '请填写基金名称'
  if (!form.code.trim()) e.code = '请填写基金代码'
  else if (!/^\d{6}$/.test(form.code.trim())) e.code = '代码建议为 6 位数字'
  if (!isNumericLike(form.netValue)) e.netValue = '净值必须是数字'
  else if (Number(form.netValue) < 0) e.netValue = '净值不能小于 0'
  if (!isNumericLike(form.change)) e.change = '涨跌必须是数字'
  if (!form.risk.trim()) e.risk = '请填写风险提示'
  return e
})

const isValid = computed(() => Object.keys(errors.value).length === 0)

function onSubmit() {
  if (!isValid.value) return

  const payload = {
    name: form.name.trim(),
    code: form.code.trim(),
    netValue: Number(form.netValue),
    change: Number(form.change),
    risk: form.risk.trim(),
  }

  emit('submit', payload)

  // 清空
  Object.assign(form, {
    name: '',
    code: '',
    netValue: null,
    change: null,
    risk: '',
  })
}
</script>
