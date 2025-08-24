<script setup>
import { ref, computed, onMounted } from 'vue'
import StatsChart from '../components/StatsChart.vue'
import HoldingsPieChart from '../components/HoldingsPieChart.vue'
import { fundList as initialList } from '../data/funds.js'
import { calcPosition } from '../utils/position.js'

const LS_KEY = 'funds'
const funds = ref([])

function loadFunds() {
  try {
    const raw = localStorage.getItem(LS_KEY)
    funds.value = raw ? JSON.parse(raw) : [...initialList]
  } catch {
    funds.value = [...initialList]
  }
}
// 自动刷新：focus 回到标签页时拉取一次
onMounted(() => {
  loadFunds()
  window.addEventListener('focus', loadFunds)
})

/* ===== KPI 汇总 ===== */
function fix(n, d = 2){ return Number.isFinite(Number(n)) ? Number(Number(n).toFixed(d)) : 0 }
function cny(n){ if (!Number.isFinite(Number(n))) return '—'
  return Number(n).toLocaleString('zh-CN',{style:'currency',currency:'CNY',maximumFractionDigits:2})
}
const portfolio = computed(() => {
  let totalMarket=0,totalCost=0,totalUnreal=0,totalReal=0
  for (const f of funds.value) {
    const p = calcPosition(f)
    totalMarket += Number(p.marketValue||0)
    totalCost   += Number(p.cost||0)
    totalUnreal += Number(p.holdingGain||0)
    totalReal   += Number(p.realizedGain||0)
  }
  const totalGain = totalUnreal + totalReal
  const totalRate = totalCost>0 ? (totalGain/totalCost)*100 : null
  return {
    count: funds.value.length,
    totalMarket: fix(totalMarket), totalCost: fix(totalCost),
    totalUnreal: fix(totalUnreal), totalReal: fix(totalReal),
    totalGain: fix(totalGain), totalRate: totalRate==null?null:fix(totalRate,2)
  }
})

/* ===== 风险分布 ===== */
const riskLabels = ['高风险','中风险','低风险','其他']
function normRisk(txt=''){const t=String(txt).toLowerCase()
  if(t.includes('高')||t.includes('high'))return'高风险'
  if(t.includes('中')||t.includes('medium')||t.includes('mid'))return'中风险'
  if(t.includes('低')||t.includes('low'))return'低风险'
  return '其他'}
const riskCounts = computed(()=>{
  const m={高风险:0,中风险:0,低风险:0,其他:0}
  for(const f of funds.value)m[normRisk(f.risk)]++
  return riskLabels.map(l=>m[l])
})

/* ===== 涨跌分布 ===== */
const changeCounts = computed(()=>{
  let up=0,down=0,flat=0
  for(const f of funds.value){
    const c = Number(f.change)
    if(Number.isFinite(c)){ if(c>0)up++; else if(c<0)down++; else flat++ } else flat++
  }
  return [up,down,flat]
})

/* ===== 收益构成 ===== */
const gainData = computed(()=>[portfolio.value.totalUnreal||0, portfolio.value.totalReal||0])

/* ===== 现金流（最近 10 天）===== */
const CASHFLOW_DAYS = 10
const cashflow = computed(()=>{
  const map=new Map()
  for(const f of funds.value){
    if(!Array.isArray(f.trades)) continue
    for(const t of f.trades){
      const date=t?.date||''; if(!date) continue
      const type=(t?.type||'buy').toLowerCase()
      let val=0
      if(type==='buy'){ const amt=Number(t?.amount); if(amt>0) val=-amt }
      else if(type==='sell'){ const price=Number(t?.price), s=Number(t?.shares); if(price>0&&s>0) val=price*s }
      map.set(date, Number(map.get(date)||0)+val)
    }
  }
  const arr=[...map.entries()].sort((a,b)=>a[0].localeCompare(b[0])).slice(-CASHFLOW_DAYS)
  return { labels: arr.map(([d])=>d), data: arr.map(([,v])=>Number(v.toFixed(2))) }
})
</script>

<template>
  <div class="max-w-6xl mx-auto p-6 space-y-6">
    <!-- KPI -->
    <section class="bg-white p-6 rounded-xl shadow">
      <h1 class="text-2xl font-bold mb-4">组合统计</h1>
      <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 text-sm">
        <div class="p-4 rounded-lg bg-gray-50"><p class="text-gray-500">基金数量</p><p class="text-xl font-semibold">{{ portfolio.count }}</p></div>
        <div class="p-4 rounded-lg bg-gray-50"><p class="text-gray-500">总市值</p><p class="text-xl font-semibold">{{ cny(portfolio.totalMarket) }}</p></div>
        <div class="p-4 rounded-lg bg-gray-50"><p class="text-gray-500">持仓成本</p><p class="text-xl font-semibold">{{ cny(portfolio.totalCost) }}</p></div>
        <div class="p-4 rounded-lg bg-gray-50"><p class="text-gray-500">未实现收益</p><p class="text-xl font-semibold" :class="(portfolio.totalUnreal??0)>=0?'text-emerald-600':'text-rose-600'">{{ cny(portfolio.totalUnreal) }}</p></div>
        <div class="p-4 rounded-lg bg-gray-50"><p class="text-gray-500">已实现收益</p><p class="text-xl font-semibold" :class="(portfolio.totalReal??0)>=0?'text-emerald-600':'text-rose-600'">{{ cny(portfolio.totalReal) }}</p></div>
        <div class="p-4 rounded-lg bg-gray-50"><p class="text-gray-500">总收益率</p><p class="text-xl font-semibold" :class="(portfolio.totalRate??0)>=0?'text-emerald-600':'text-rose-600'">{{ portfolio.totalRate==null ? '—' : (portfolio.totalRate + '%') }}</p></div>
      </div>
    </section>

    <!-- 空状态 -->
    <section v-if="funds.length===0" class="bg-white p-10 rounded-xl shadow text-center">
      <p class="text-gray-600 mb-4">暂无数据，请先到首页添加基金或恢复示例数据。</p>
      <RouterLink to="/" class="text-blue-600 underline">返回首页</RouterLink>
    </section>

    <section v-else class="grid grid-cols-1 gap-6 lg:grid-cols-2">
      <div class="space-y-3 bg-white p-6 rounded-xl shadow">
        <h2 class="text-lg font-semibold">风险等级分布</h2>
        <StatsChart title="风险等级分布" :labels="['高风险','中风险','低风险','其他']" :data="riskCounts" color="#3b82f6"/>
      </div>

      <div class="space-y-3 bg-white p-6 rounded-xl shadow">
        <h2 class="text-lg font-semibold">涨跌分布</h2>
        <StatsChart title="涨跌分布" :labels="['上涨','下跌','持平']" :data="changeCounts" color="#10b981"/>
      </div>

      <div class="space-y-3 bg-white p-6 rounded-xl shadow">
        <h2 class="text-lg font-semibold">收益构成</h2>
        <StatsChart title="未实现 vs 已实现" :labels="['未实现收益','已实现收益']" :data="gainData" color="#6366f1"/>
      </div>

      <div class="space-y-3 bg-white p-6 rounded-xl shadow">
        <h2 class="text-lg font-semibold">持仓市值占比</h2>
        <HoldingsPieChart :funds="funds" />
      </div>

      <div class="space-y-3 bg-white p-6 rounded-xl shadow lg:col-span-2">
        <h2 class="text-lg font-semibold">最近 {{ cashflow.labels.length }} 天净现金流</h2>
        <StatsChart title="净现金流（买入为负、卖出为正）" :labels="cashflow.labels" :data="cashflow.data" color="#f59e0b"/>
      </div>
    </section>
  </div>
</template>
