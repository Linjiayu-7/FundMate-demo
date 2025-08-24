<script setup>
import { ref, computed, watch } from 'vue'
import Toast from '../components/Toast.vue' // 引入 Toast

// 组件
import FundCard from '../components/FundCard.vue'
import SearchBar from '../components/SearchBar.vue'
import SortControl from '../components/SortControl.vue'
import EditFundModal from '../components/EditFundModal.vue'
import TradeModal from '../components/TradeModal.vue'
import AddFundModal from '../components/AddFundModal.vue'

// 计算函数
import { calcPosition } from '../utils/position.js'

// 示例数据
import { fundList as initialList } from '../data/funds.js'

/* ------------------------------- 0) 本地持久化 ------------------------------- */
const LS_KEY = 'funds'
function readFromLocal() {
  try {
    const raw = localStorage.getItem(LS_KEY)
    if (!raw) return null
    return JSON.parse(raw)
  } catch { return null }
}
const fundList = ref(readFromLocal() ?? [...initialList])
function saveToLocal() { localStorage.setItem(LS_KEY, JSON.stringify(fundList.value)) }
watch(fundList, saveToLocal, { deep: true })

/* ------------------------------- 1) 统一规范化（可选买入价/金额推导收益） ------------------------------- */
function toNum(v){ const n = Number(v); return Number.isFinite(n) ? n : 0 }
function normalizeFund(f) {
  const out = { ...f }
  const buy = toNum(out.buyPrice)
  const amt = toNum(out.amount)
  const now = toNum(out.netValue)
  if (buy > 0 && amt >= 0 && now > 0) {
    const rate = now / buy - 1
    out.holdingGain = +(amt * rate).toFixed(2)
    out.holdingRate = +(rate * 100).toFixed(2)
  } else {
    out.holdingGain = null
    out.holdingRate = null
  }
  return out
}
fundList.value = fundList.value.map(normalizeFund)

/* ------------------------------- 2) 搜索 + 排序 ------------------------------- */
const keyword = ref('')
const sortControl = ref({ sortBy: 'name', sortAsc: true })

const filteredFunds = computed(() => {
  const kw  = keyword.value.trim().toLowerCase()
  const key = sortControl.value.sortBy
  const dir = sortControl.value.sortAsc ? 1 : -1

  let list = fundList.value.filter(f => {
    if (!kw) return true
    const nameHit = String(f.name ?? '').toLowerCase().includes(kw)
    const codeHit = String(f.code ?? '').includes(kw)
    return nameHit || codeHit
  })

  list = [...list].sort((a, b) => {
    const aVal = a?.[key]
    const bVal = b?.[key]
    if (key === 'name') return String(aVal ?? '').localeCompare(String(bVal ?? '')) * dir
    const aNum = Number(aVal), bNum = Number(bVal)
    if (Number.isNaN(aNum) && Number.isNaN(bNum)) return 0
    if (Number.isNaN(aNum)) return 1
    if (Number.isNaN(bNum)) return -1
    return (aNum - bNum) * dir
  })
  return list
})

/* ------------------------------- 3) 新增 / 删除 / 编辑 / 交易 ------------------------------- */
// 新增基金（按钮 + 弹窗）
const addOpen = ref(false)
const toastMessage = ref('')

function handleAddFund(payload) {
  const duplicate = fundList.value.some(f => f.code === payload.code)
  if (duplicate) return alert(`代码 ${payload.code} 已存在`)
  fundList.value.push(normalizeFund(payload))
  toastMessage.value = '新增基金成功！'
  addOpen.value = false
}

// 删除
function removeFundByCode(code) {
  const idx = fundList.value.findIndex(f => f.code === code)
  if (idx === -1) return
  const { name } = fundList.value[idx]
  if (!confirm(`确定要删除「${name}」吗？`)) return
  fundList.value.splice(idx, 1)
  toastMessage.value = `已删除基金「${name}」`
}

// 编辑
const editOpen = ref(false)
const editingIndex = ref(-1)
const editingFund = ref(null)
function startEdit(fund) {
  const idx = fundList.value.findIndex(f => f.code === fund.code)
  if (idx === -1) return
  editingIndex.value = idx
  editingFund.value = { ...fundList.value[idx] }
  editOpen.value = true
}
function saveEdit(payload) {
  if (editingIndex.value < 0) return
  fundList.value.splice(editingIndex.value, 1, normalizeFund(payload))
  editOpen.value = false
  editingIndex.value = -1
  editingFund.value = null
}

// 交易（买入/卖出）
const tradeOpen = ref(false)
const tradeFundCode = ref('')
const tradeFundName = ref('')
const tradeCurrentShares = ref(0)
const tradeInitialType = ref('buy') // 新增：默认打开买入或卖出

function startTrade(code, type = 'buy') {
  const f = fundList.value.find(x => x.code === code)
  if (!f) return
  tradeFundCode.value = code
  tradeFundName.value = f.name
  tradeCurrentShares.value = Number(calcPosition(f).shares || 0)
  tradeInitialType.value = type
  tradeOpen.value = true
}

function saveTrade({ code, trade }) {
  const idx = fundList.value.findIndex(f => f.code === code)
  if (idx === -1) return
  const f = fundList.value[idx]
  if (!Array.isArray(f.trades)) f.trades = []
  f.trades.push(trade)
  toastMessage.value = '交易保存成功！'
  tradeOpen.value = false
}
</script>

<template>
  <!-- 工具条 -->
  <div class="mb-4 flex flex-wrap items-center gap-3">
    <!-- 显示操作成功的 Toast 提示 -->
    <Toast :message="toastMessage" @update:message="toastMessage = ''" />
    <div class="ml-auto flex items-center gap-2">
      <button
        class="px-3 py-1.5 rounded-lg bg-green-600 text-white hover:bg-green-700"
        @click="addOpen = true">
        新增基金
      </button>
    </div>
  </div>

  <!-- 排序 + 搜索 -->
  <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-4">
    <div><SortControl v-model="sortControl" /></div>
    <div><SearchBar v-model="keyword" :count="filteredFunds.length" /></div>
  </div>

  <!-- 空状态 / 无结果 / 列表 -->
  <div v-if="fundList.length === 0" class="my-16 text-center bg-white rounded-lg p-10 shadow">
    <h3 class="text-xl font-bold mb-2">当前还没有任何基金数据</h3>
    <p class="text-gray-600 mb-6">你可以点击右上角按钮“新增基金”，或恢复示例数据（在统计页也能导入/导出）。</p>
  </div>

  <div v-else-if="filteredFunds.length === 0" class="my-16 text-center text-gray-600">
    没有匹配 “<span class="font-semibold">{{ keyword }}</span>” 的结果，
    <button class="underline text-blue-600" @click="keyword = ''">清空搜索</button>
  </div>

  <transition-group v-else name="fade" tag="div" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
    <FundCard
      v-for="fund in filteredFunds"
      :key="fund.code"
      :fund="fund"
      @edit="startEdit($event)"
      @remove="removeFundByCode(fund.code)"
      @buy="startTrade(fund.code, 'buy')"
      @sell="startTrade(fund.code, 'sell')"
    />
  </transition-group>

  <!-- 新增基金弹窗 -->
  <AddFundModal :open="addOpen" @close="addOpen = false" @submit="handleAddFund" />

  <!-- 编辑弹窗 -->
  <EditFundModal :open="editOpen" :value="editingFund" @close="editOpen = false" @save="saveEdit" />

  <!-- 交易弹窗（买入/卖出） -->
  <TradeModal
    :open="tradeOpen"
    :fund-code="tradeFundCode"
    :fund-name="tradeFundName"
    :current-shares="tradeCurrentShares"
    :initial-type="tradeInitialType"
    @close="tradeOpen = false"
    @save="saveTrade"
  />
</template>

<style>
.fade-enter-active, .fade-leave-active { transition: opacity .25s; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>
