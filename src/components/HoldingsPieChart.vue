<template>
  <div class="rounded-2xl p-4 bg-white shadow ring-1 ring-black/5">
    <div class="mb-3 flex items-center justify-between">
      <h3 class="font-semibold">持仓市值占比</h3>
      <small class="text-gray-500">按当前净值估算</small>
    </div>

    <canvas ref="cv" height="160"></canvas>

    <p v-if="!labels.length" class="mt-3 text-sm text-gray-500">暂无数据</p>
  </div>
</template>

<script setup>
import { ref, watch, onMounted, onBeforeUnmount } from 'vue'
import { Chart, DoughnutController, ArcElement, Tooltip, Legend, Title } from 'chart.js'
import { calcPosition } from '../utils/position.js'

Chart.register(DoughnutController, ArcElement, Tooltip, Legend, Title)

const props = defineProps({
  funds: { type: Array, default: () => [] },
})

const cv = ref(null)
let chart = null

const labels = ref([])
const values = ref([])

const COLORS = [
  '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6',
  '#06b6d4', '#84cc16', '#f97316', '#e11d48', '#64748b',
]

function rebuild() {
  const L = []
  const V = []

  for (const f of props.funds || []) {
    const pos = calcPosition(f)          // { marketValue, ... }
    if (pos.marketValue > 0) {
      L.push(`${f.name}(${f.code})`)
      V.push(pos.marketValue)
    }
  }

  labels.value = L
  values.value = V

  if (!cv.value) return
  if (chart) { chart.destroy(); chart = null }
  if (!L.length) return

  chart = new Chart(cv.value.getContext('2d'), {
    type: 'doughnut',
    data: {
      labels: L,
      datasets: [
        {
          data: V,
          backgroundColor: L.map((_, i) => COLORS[i % COLORS.length]),
          borderColor: '#ffffff',
          borderWidth: 2,
        },
      ],
    },
    options: {
      plugins: {
        legend: { position: 'right' },
        title: { display: false },
        tooltip: { enabled: true },
      },
      cutout: '55%',
    },
  })
}

watch(() => props.funds, rebuild, { deep: true, immediate: true })
onMounted(rebuild)
onBeforeUnmount(() => chart && chart.destroy())
</script>
