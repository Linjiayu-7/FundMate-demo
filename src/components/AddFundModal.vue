<template>
  <div v-if="open" class="fixed inset-0 z-50 flex items-center justify-center bg-black/40" @click.self="$emit('close')">
    <div class="w-full max-w-lg bg-white rounded-2xl shadow-xl ring-1 ring-black/10 p-5" role="dialog" aria-modal="true">
      <header class="flex items-center justify-between mb-4">
        <h3 class="text-lg font-bold">新增基金</h3>
        <button class="px-2 py-1.5 rounded-lg text-sm bg-gray-100 hover:bg-gray-200" @click="$emit('close')">✕</button>
      </header>

      <form class="grid grid-cols-1 md:grid-cols-2 gap-4" @submit.prevent="onSubmit">
        <!-- 名称 -->
        <div class="md:col-span-2">
          <label class="block text-sm font-medium mb-1">基金名称 *</label>
          <input v-model.trim="form.name" class="w-full px-3 py-2 border rounded" placeholder="如：易方达蓝筹精选"/>
          <p v-if="errors.name" class="text-xs text-rose-600 mt-1">{{ errors.name }}</p>
        </div>

        <!-- 代码 -->
        <div>
          <label class="block text-sm font-medium mb-1">基金代码 *</label>
          <input v-model.trim="form.code" class="w-full px-3 py-2 border rounded" placeholder="6 位数字，如 110011"/>
          <p v-if="errors.code" class="text-xs text-rose-600 mt-1">{{ errors.code }}</p>
        </div>

        <!-- 当前净值 -->
        <div>
          <label class="block text-sm font-medium mb-1">当前净值 *</label>
          <input v-model.number="form.netValue" type="number" step="0.0001" min="0" class="w-full px-3 py-2 border rounded" placeholder="如 1.8590"/>
          <p v-if="errors.netValue" class="text-xs text-rose-600 mt-1">{{ errors.netValue }}</p>
        </div>

        <!-- 涨跌 -->
        <div>
          <label class="block text-sm font-medium mb-1">涨跌（%）*</label>
          <input v-model.number="form.change" type="number" step="0.01" class="w-full px-3 py-2 border rounded" placeholder="如 0.53 或 -0.42"/>
          <p v-if="errors.change" class="text-xs text-rose-600 mt-1">{{ errors.change }}</p>
        </div>

        <!-- 基金类型（下拉） -->
        <div>
          <label class="block text-sm font-medium mb-1">基金类型 *</label>
          <select v-model="form.type" class="w-full px-3 py-2 border rounded bg-white">
            <option disabled value="">请选择</option>
            <option v-for="t in FUND_TYPES" :key="t" :value="t">{{ t }}</option>
          </select>
          <p v-if="errors.type" class="text-xs text-rose-600 mt-1">{{ errors.type }}</p>
        </div>

        <!-- 风险（下拉） -->
        <div>
          <label class="block text-sm font-medium mb-1">风险等级 *</label>
          <select v-model="form.risk" class="w-full px-3 py-2 border rounded bg-white">
            <option disabled value="">请选择</option>
            <option v-for="r in RISK_LEVELS" :key="r" :value="r">{{ r }}</option>
          </select>
          <p v-if="errors.risk" class="text-xs text-rose-600 mt-1">{{ errors.risk }}</p>
        </div>

        <!-- （可选）初始持仓：买入净值 + 金额 -->
        <div class="md:col-span-2 grid grid-cols-1 md:grid-cols-3 gap-3">
          <div>
            <label class="block text-sm font-medium mb-1">买入净值（可选）</label>
            <input v-model.number="form.buyPrice" type="number" step="0.0001" min="0" class="w-full px-3 py-2 border rounded" placeholder="如 1.8000"/>
          </div>
          <div>
            <label class="block text-sm font-medium mb-1">持有金额（可选）</label>
            <input v-model.number="form.amount" type="number" step="0.01" min="0" class="w-full px-3 py-2 border rounded" placeholder="如 5000"/>
          </div>
          <div class="flex items-end">
            <p class="text-xs text-gray-500">若填写“买入净值 + 金额”，会按 金额/净值 折算初始份额</p>
          </div>
        </div>

        <div class="md:col-span-2 flex justify-end gap-2">
          <button type="button" class="px-4 py-2 rounded border" @click="$emit('close')">取消</button>
          <button type="submit" :disabled="!isValid" class="px-4 py-2 rounded text-white"
                  :class="isValid ? 'bg-green-600 hover:bg-green-700' : 'bg-gray-400 cursor-not-allowed'">
            保存
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { reactive, computed } from 'vue'

const props = defineProps({ open: { type: Boolean, default: false } })
const emit = defineEmits(['close', 'submit'])

const FUND_TYPES = [
  '股票型','混合型','债券型','指数型','指数增强','货币型','QDII','FOF'
]
const RISK_LEVELS = ['高','中高','中','中低','低']

const form = reactive({
  name: '', code: '', netValue: null, change: null,
  type: '', risk: '',
  buyPrice: null, amount: null,
})

function num(v){ const n = Number(v); return Number.isFinite(n) ? n : 0 }
function isNumLike(v){ return /^-?\d+(\.\d+)?$/.test(String(v ?? '').trim()) }

const errors = computed(() => {
  const e = {}
  if (!form.name.trim()) e.name = '请填写基金名称'
  if (!form.code.trim()) e.code = '请填写基金代码'
  else if (!/^\d{6}$/.test(form.code.trim())) e.code = '代码建议为 6 位数字'
  if (!isNumLike(form.netValue) || num(form.netValue) < 0) e.netValue = '净值必须是非负数字'
  if (!isNumLike(form.change)) e.change = '涨跌必须是数字'
  if (!form.type) e.type = '请选择基金类型'
  if (!form.risk) e.risk = '请选择风险等级'
  return e
})
const isValid = computed(() => Object.keys(errors.value).length === 0)

function onSubmit(){
  if (!isValid.value) return
  const payload = {
    name: form.name.trim(),
    code: form.code.trim(),
    netValue: num(form.netValue),
    change: num(form.change),
    type: form.type,
    risk: form.risk,
  }
  const buy = num(form.buyPrice), amt = num(form.amount)
  if (buy > 0 && amt > 0) { payload.buyPrice = buy; payload.amount = amt }
  emit('submit', payload)
  emit('close')
  Object.assign(form, { name:'', code:'', netValue:null, change:null, type:'', risk:'', buyPrice:null, amount:null })
}
</script>
