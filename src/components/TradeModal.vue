<script setup>
import { ref, computed, watch } from 'vue'

const props = defineProps({
  open:          { type: Boolean, default: false },
  fundCode:      { type: String,  default: ''    },
  fundName:      { type: String,  default: ''    },
  currentShares: { type: Number,  default: 0     },
})

const emit = defineEmits(['close', 'save'])

// 表单状态
const form = ref({
  type: 'buy',     // 默认买入
  date: today(),
  price: 0,
  shares: 0,
  amount: 0,
})

// 临时存储输入的值
const priceInput  = ref('')
const sharesInput = ref('')
const amountInput = ref('')

function today() {
  return new Date().toISOString().slice(0, 10)
}

// 重置表单
watch(() => props.open, (show) => {
  if (show) {
    form.value.type = 'buy'
    form.value.date = today()
    form.value.price = 0
    form.value.shares = 0
    form.value.amount = 0
    priceInput.value = ''
    sharesInput.value = ''
    amountInput.value = ''
  }
})

// 输入值同步
function syncPrice() {
  form.value.price = parseFloat(priceInput.value) || 0
  if (form.value.type === 'buy' && form.value.amount > 0) {
    form.value.shares = form.value.amount / form.value.price
    sharesInput.value = form.value.shares.toFixed(4)
  } else if (form.value.type === 'sell' && form.value.shares > 0) {
    form.value.amount = form.value.price * form.value.shares
    amountInput.value = form.value.amount.toFixed(2)
  }
}

function syncShares() {
  form.value.shares = parseFloat(sharesInput.value) || 0
  if (form.value.type === 'sell' && form.value.shares > 0) {
    form.value.amount = form.value.price * form.value.shares
    amountInput.value = form.value.amount.toFixed(2)
  }
}

function syncAmount() {
  form.value.amount = parseFloat(amountInput.value) || 0
  if (form.value.type === 'buy' && form.value.price > 0) {
    form.value.shares = form.value.amount / form.value.price
    sharesInput.value = form.value.shares.toFixed(4)
  }
}

// 校验
const errors = computed(() => {
  const e = {}
  if (form.value.price <= 0) e.price = '价格必须大于 0'
  if (form.value.type === 'buy') {
    if (form.value.shares <= 0 && form.value.amount <= 0) e.amount = '买入至少填写【金额】或【份额】之一'
  } else {
    if (form.value.shares <= 0) e.shares = '卖出份额必须大于 0'
    else if (form.value.shares > props.currentShares) e.shares = '卖出份额不能超过当前持仓'
  }
  return e
})

const isValid = computed(() => Object.keys(errors.value).length === 0)

const modeLabel = computed(() => (form.value.type === 'buy' ? '买入' : '卖出'))

// 保存操作
function onSave() {
  // 最后一轮同步
  syncPrice()
  syncShares()
  syncAmount()

  if (!isValid.value) return

  emit('save', {
    code: props.fundCode,
    trade: {
      type: form.value.type,
      date: form.value.date,
      price: form.value.price,
      shares: form.value.shares,
      amount: form.value.amount,
    }
  })
}
</script>

<template>
  <div v-if="open" class="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
    <div class="bg-white w-full max-w-md rounded-2xl shadow p-5">
      <h3 class="text-lg font-bold mb-4">
        {{ fundName || '未命名基金' }}：{{ modeLabel }}
      </h3>

      <form class="grid grid-cols-1 gap-4" @submit.prevent="onSave">
        <!-- 交易类型 -->
        <div class="flex gap-3">
          <label class="inline-flex items-center gap-1 cursor-pointer">
            <input type="radio" value="buy" v-model="form.type" />
            <span>买入</span>
          </label>
          <label class="inline-flex items-center gap-1 cursor-pointer">
            <input type="radio" value="sell" v-model="form.type" />
            <span>卖出</span>
          </label>
        </div>

        <!-- 日期 -->
        <div>
          <label class="block text-sm font-medium mb-1">日期</label>
          <input
            type="date"
            v-model="form.date"
            class="w-full px-3 py-2 rounded border focus:outline-none focus:ring focus:ring-blue-200"
          />
        </div>

        <!-- 价格 -->
        <div>
          <label class="block text-sm font-medium mb-1">价格（净值）*</label>
          <input
            type="number"
            step="0.0001"
            min="0"
            v-model="priceInput"
            @input="syncPrice"
            placeholder="如 1.2345"
            class="w-full px-3 py-2 rounded border focus:outline-none focus:ring focus:ring-blue-200"
          />
          <p v-if="errors.price" class="text-sm text-rose-600 mt-1">{{ errors.price }}</p>
        </div>

        <!-- 份额 -->
        <div>
          <label class="block text-sm font-medium mb-1">
            份额 {{ form.type === 'sell' ? '(需 ≤ 当前持仓份额)' : '' }}
          </label>
          <input
            type="number"
            step="0.0001"
            min="0"
            v-model="sharesInput"
            @input="syncShares"
            placeholder="如 100.1234"
            class="w-full px-3 py-2 rounded border focus:outline-none focus:ring focus:ring-blue-200"
          />
          <p v-if="errors.shares" class="text-sm text-rose-600 mt-1">{{ errors.shares }}</p>
          <p v-if="form.type === 'sell'" class="text-xs text-gray-500 mt-1">
            当前持仓份额：<span class="font-mono">{{ props.currentShares }}</span>
          </p>
        </div>

        <!-- 金额 -->
        <div>
          <label class="block text-sm font-medium mb-1">
            金额 {{ form.type === 'buy' ? '(可只填金额+价格自动算份额)' : '(卖出金额自动由 价格×份额 得出)' }}
          </label>
          <input
            type="number"
            step="0.01"
            min="0"
            :disabled="form.type === 'sell'"
            v-model="amountInput"
            @input="syncAmount"
            placeholder="如 1000.00"
            class="w-full px-3 py-2 rounded border focus:outline-none focus:ring focus:ring-blue-200 disabled:bg-gray-100"
          />
          <p v-if="errors.amount" class="text-sm text-rose-600 mt-1">{{ errors.amount }}</p>
        </div>

        <!-- 底部操作 -->
        <div class="flex justify-end gap-3 mt-2">
          <button type="button" class="px-4 py-2 rounded border" @click="$emit('close')">取消</button>
          <button
            type="submit"
            :disabled="!isValid"
            class="px-4 py-2 rounded text-white"
            :class="isValid ? 'bg-blue-600 hover:bg-blue-700' : 'bg-gray-400 cursor-not-allowed'">
            保存
          </button>
        </div>
      </form>
    </div>
  </div>
</template>
