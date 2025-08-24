<template>
  <div class="rounded-2xl p-4 bg-white shadow ring-1 ring-black/5">
    <div class="flex items-center justify-between mb-3">
      <h3 class="font-semibold">月度趋势 · 投入 / 市值 / 收益</h3>
      <small class="text-gray-500">按交易月份聚合</small>
    </div>
    <canvas ref="canvasEl" height="120"></canvas>
    <p v-if="!labels.length" class="text-sm text-gray-500 mt-3">
      暂无交易数据，先去录入几笔试试吧～
    </p>
  </div>
</template>

<script setup>
// 说明：vue-chartjs 也可以用 <Line> 组件，这里为了最小依赖直接用原生 Chart.js
import { onMounted, onBeforeUnmount, ref, watch } from 'vue'
import { Chart, LineController, LineElement, PointElement, LinearScale, CategoryScale, Tooltip, Legend } from 'chart.js'
import { buildMonthlySeries } from '@/utils/aggregate'

Chart.register(LineController, LineElement, PointElement, LinearScale, CategoryScale, Tooltip, Legend)

const props = defineProps({
  funds: { type: Array, default: () => [] } // 当前用户的基金数组
})

const canvasEl = ref(null)
let chart = null

// 把 props.funds 变成 chart 需要的数据
const labels = ref([])
const invest = ref([])
const mv = ref([])
const gain = ref([])

function rebuild() {
  const { labels: L, invest: I, mv: M, gain: G } = buildMonthlySeries(props.funds)
  labels.value = L
  invest.value = I
  mv.value = M
  gain.value = G

  // 无数据时销毁图表
  if (!canvasEl.value) return
  if (chart) { chart.destroy(); chart = null }

  if (!L.length) return

  chart = new Chart(canvasEl.value.getContext('2d'), {
    type: 'line',
    data: {
      labels: L,
      datasets: [
        { label: '累计投入(¥)', data: I, tension: 0.25 },
        { label: '市值(¥)',     data: M, tension: 0.25 },
        { label: '收益(¥)',     data: G, tension: 0.25 }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { position: 'top' },
        tooltip: { mode: 'index', intersect: false }
      },
      interaction: { mode: 'nearest', axis: 'x', intersect: false },
      scales: {
        y: { ticks: { callback: v => '¥' + Number(v).toLocaleString() } }
      }
    }
  })
}

watch(() => props.funds, rebuild, { deep: true })
onMounted(rebuild)
onBeforeUnmount(() => chart && chart.destroy())

// 暴露 labels 给模板用（显示“暂无数据”）
</script>

<style scoped>
/* 让图表容器固定一个高度，避免闪烁 */
canvas { width: 100%; height: 280px; }
</style>
