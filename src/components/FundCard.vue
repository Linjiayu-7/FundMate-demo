<template>
  <article class="rounded-2xl p-4 bg-white shadow ring-1 ring-black/5 transition hover:shadow-lg hover:-translate-y-0.5">
    <!-- 头部：名称 + 代码 + 基金类型 -->
    <div class="flex items-start justify-between gap-3">
      <div>
        <h3 class="font-semibold text-gray-900">
          {{ fund.name }}
          <span class="text-gray-400 text-sm">（{{ fund.code }}）</span>
        </h3>
        <p class="text-xs text-gray-500 mt-0.5">
          净值 <span class="font-mono">{{ pos.nav.toFixed(4) }}</span>
        </p>
      </div>

      <!-- 基金类型标签 -->
      <span class="px-2 py-0.5 rounded-full text-xs bg-indigo-50 text-indigo-600">
        {{ fund.type || '—' }}
      </span>
    </div>

    <!-- 风险标签 -->
    <div class="mt-2">
      <span class="px-3 py-1 text-xs rounded-full"
            :class="{
              'bg-red-50 text-red-600': String(fund.risk||'').includes('高'),
              'bg-yellow-50 text-yellow-600': String(fund.risk||'').includes('中'),
              'bg-green-50 text-green-600': String(fund.risk||'').includes('低'),
              'bg-gray-50 text-gray-600': !fund.risk
            }">
        {{ fund.risk || '—' }}
      </span>
    </div>

    <!-- 关键信息 -->
    <dl class="mt-3 grid grid-cols-2 gap-3 text-sm">
      <div>
        <dt class="text-gray-500">份额</dt>
        <dd class="font-medium font-mono">{{ pos.shares }}</dd>
      </div>
      <div>
        <dt class="text-gray-500">成本</dt>
        <dd class="font-medium font-mono">{{ cny(pos.cost) }}</dd>
      </div>
      <div>
        <dt class="text-gray-500">市值</dt>
        <dd class="font-medium font-mono">{{ cny(pos.marketValue) }}</dd>
      </div>
      <div>
        <dt class="text-gray-500">持有收益</dt>
        <dd class="font-medium font-mono" :class="pos.holdingGain >= 0 ? 'text-emerald-600' : 'text-rose-600'">
          {{ cny(pos.holdingGain) }}
          <span class="text-xs">（{{ pos.returnRatePct }}%）</span>
        </dd>
      </div>
    </dl>

    <!-- 操作按钮：买入/卖出/编辑/删除 -->
    <div class="mt-4 flex flex-wrap items-center justify-end gap-2">
      <button class="px-3 py-1.5 rounded-lg text-sm bg-blue-600 text-white hover:bg-blue-700" @click="$emit('buy')">买入</button>
      <button class="px-3 py-1.5 rounded-lg text-sm bg-amber-500 text-white hover:bg-amber-600" @click="$emit('sell')">卖出</button>
      <button class="px-3 py-1.5 rounded-lg text-sm bg-white border border-gray-200 hover:bg-gray-50" @click="$emit('edit', fund)">编辑</button>
      <button class="px-3 py-1.5 rounded-lg text-sm text-white bg-rose-500 hover:bg-rose-600" @click="$emit('remove')">删除</button>
    </div>
  </article>
</template>

<script setup>
import { computed } from 'vue'
import { calcPosition } from '@/utils/position'

const props = defineProps({ fund: { type: Object, required: true } })
const pos = computed(() => calcPosition(props.fund))

function cny(n) {
  return Number(n || 0).toLocaleString('zh-CN', { style: 'currency', currency: 'CNY', maximumFractionDigits: 2 })
}
</script>
