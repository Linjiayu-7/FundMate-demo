<template>
  <!-- 遮罩 -->
  <div v-if="open" class="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
    <!-- 弹窗 -->
    <div class="bg-white w-full max-w-lg rounded-lg shadow p-5">
      <h3 class="text-lg font-bold mb-4">编辑基金</h3>

      <form class="grid grid-cols-1 md:grid-cols-2 gap-4" @submit.prevent="onSave">
        <!-- 名称 -->
        <div class="md:col-span-2">
          <label class="block text-sm font-medium mb-1">基金名称 *</label>
          <input v-model.trim="form.name" class="w-full px-3 py-2 border rounded focus:outline-none focus:ring focus:ring-blue-200" />
          <p v-if="errors.name" class="text-sm text-red-600 mt-1">{{ errors.name }}</p>
        </div>

        <!-- 代码（通常不允许改，为避免冲突，这里禁用） -->
        <div>
          <label class="block text-sm font-medium mb-1">基金代码（不可改）</label>
          <input :value="form.code" disabled class="w-full px-3 py-2 border rounded bg-gray-100 text-gray-600" />
        </div>

        <!-- 净值 -->
        <div>
          <label class="block text-sm font-medium mb-1">净值 *</label>
          <input v-model.number="form.netValue" type="number" step="0.0001" min="0" class="w-full px-3 py-2 border rounded focus:outline-none focus:ring focus:ring-blue-200" />
          <p v-if="errors.netValue" class="text-sm text-red-600 mt-1">{{ errors.netValue }}</p>
        </div>

        <!-- 涨跌 -->
        <div>
          <label class="block text-sm font-medium mb-1">涨跌（%）*</label>
          <input v-model.number="form.change" type="number" step="0.01" class="w-full px-3 py-2 border rounded focus:outline-none focus:ring focus:ring-blue-200" />
          <p v-if="errors.change" class="text-sm text-red-600 mt-1">{{ errors.change }}</p>
        </div>

        <!-- 风险 -->
        <div class="md:col-span-2">
          <label class="block text-sm font-medium mb-1">风险说明 *</label>
          <input v-model.trim="form.risk" class="w-full px-3 py-2 border rounded focus:outline-none focus:ring focus:ring-blue-200" />
          <p v-if="errors.risk" class="text-sm text-red-600 mt-1">{{ errors.risk }}</p>
        </div>

        <!-- 按钮区 -->
        <div class="md:col-span-2 flex justify-end gap-3 mt-2">
          <button type="button" @click="$emit('close')" class="px-4 py-2 rounded border">取消</button>
          <button type="submit" :disabled="!isValid" class="px-4 py-2 rounded text-white"
                  :class="isValid ? 'bg-blue-600 hover:bg-blue-700' : 'bg-gray-400 cursor-not-allowed'">
            保存
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { reactive, watch, computed } from 'vue'

const props = defineProps({
  open: { type: Boolean, default: false }, // 是否显示
  value: { type: Object, default: () => ({}) }, // 传入的基金对象（要编辑的）
})

const emit = defineEmits(['close', 'save'])

// 本地可编辑副本（避免直接改父级对象）
const form = reactive({
  name: '',
  code: '',
  netValue: null,
  change: null,
  risk: '',
})

// 当传入的 value 或者 open 变化时，同步到本地表单
watch(
  () => props.open,
  (show) => {
    if (show) {
      Object.assign(form, {
        name: props.value?.name ?? '',
        code: props.value?.code ?? '',
        netValue: props.value?.netValue ?? null,
        change: props.value?.change ?? null,
        risk: props.value?.risk ?? '',
      })
    }
  },
  { immediate: true }
)

function isNumericLike(v) {
  return /^-?\d+(\.\d+)?$/.test(String(v).trim())
}

const errors = computed(() => {
  const e = {}
  if (!form.name.trim()) e.name = '请填写基金名称'
  if (!isNumericLike(form.netValue)) e.netValue = '净值必须是数字'
  else if (Number(form.netValue) < 0) e.netValue = '净值不能小于 0'
  if (!isNumericLike(form.change)) e.change = '涨跌必须是数字'
  if (!form.risk.trim()) e.risk = '请填写风险提示'
  return e
})

const isValid = computed(() => Object.keys(errors.value).length === 0)

function onSave() {
  if (!isValid.value) return
  emit('save', {
    name: form.name.trim(),
    code: form.code, // 禁止改
    netValue: Number(form.netValue),
    change: Number(form.change),
    risk: form.risk.trim(),
  })
}
</script>
