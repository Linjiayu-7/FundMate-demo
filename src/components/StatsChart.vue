<!-- src/components/StatsChart.vue -->
<template>
  <div class="rounded-2xl p-4 bg-white shadow ring-1 ring-black/5">
    <div class="mb-3 flex items-center justify-between">
      <h3 class="font-semibold">{{ title || '统计图' }}</h3>
      <small class="text-gray-500">数据来自本地存储</small>
    </div>

    <div class="w-full" style="height: 260px;">
      <canvas ref="cv"></canvas>
    </div>

    <p v-if="!labels?.length" class="mt-3 text-sm text-gray-500">暂无数据</p>
  </div>
</template>

<script setup>
import { ref, watch, onMounted, onBeforeUnmount } from 'vue'
import {
  Chart,
  BarController,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
  Title
} from 'chart.js'

// 注册一次所需模块
Chart.register(BarController, BarElement, CategoryScale, LinearScale, Tooltip, Legend, Title)

const props = defineProps({
  title: { type: String, default: '' },
  labels: { type: Array, required: true }, // ['高风险','中风险',...]
  data: { type: Array, required: true },   // [2,1,0,0]
  color: { type: String, default: '#3b82f6' }, // 默认蓝色
})

const cv = ref(null)
let chart = null

function toNums(arr) {
  return (Array.isArray(arr) ? arr : []).map(v => {
    const n = Number(v)
    return Number.isFinite(n) ? n : 0
  })
}

function build() {
  // 先销毁旧图
  if (chart) { chart.destroy(); chart = null }
  if (!cv.value || !props.labels?.length) return

  chart = new Chart(cv.value.getContext('2d'), {
    type: 'bar',
    data: {
      labels: props.labels,
      datasets: [
        {
          label: props.title || '',
          data: toNums(props.data),
          backgroundColor: props.color,
          borderRadius: 6,
          barPercentage: 0.6,
          categoryPercentage: 0.7,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        title: { display: !!props.title, text: props.title, font: { size: 14 } },
        tooltip: { enabled: true },
      },
      scales: {
        x: {
          grid: { color: '#eee' },
          ticks: { color: '#6b7280', font: { size: 12 } },
        },
        y: {
          beginAtZero: true,
          grid: { color: '#eee' },
          ticks: { color: '#6b7280', font: { size: 12 } },
        },
      },
    },
  })
}

onMounted(build)
onBeforeUnmount(() => { if (chart) chart.destroy() })

// 任何标签 / 数据 / 颜色变化，重建即可（简单可靠）
watch(
  () => [props.labels, props.data, props.color],
  build,
  { deep: true }
)
</script>
