// src/store/fund.js
import { defineStore } from 'pinia'
import { fundList as initialFunds } from '@/data/funds.js'

const LS_KEY = 'fundmate_state_v1'

export const useFundStore = defineStore('fund', {
  state: () => ({
    funds: JSON.parse(localStorage.getItem(LS_KEY) || 'null')?.funds || initialFunds.map(f => ({ ...f, trades: f.trades || [] })),  // 从 localStorage 获取数据，若无则使用初始数据
  }),
  getters: {
    allFunds(state) {
      return state.funds
    },
    userTotalGain() {
      return this.funds
        .map(fund => fund.amount * fund.nav - fund.amount) // 简化为金额 * 净值 - 原金额，计算收益
        .reduce((a, b) => a + b, 0)
    },
  },
  actions: {
    addFund(fund) {
      const exists = this.funds.some(f => f.code === fund.code)
      if (exists) return
      this.funds.push({ ...fund, trades: [] })
      this.save()
    },
    removeFundByCode(code) {
      this.funds = this.funds.filter(fund => fund.code !== code)
      this.save()
    },
    editFundBasic(code, patch) {
      const fund = this.funds.find(f => f.code === code)
      if (!fund) return
      Object.assign(fund, patch)
      this.save()
    },
    addTrade(code, trade) {
      const fund = this.funds.find(f => f.code === code)
      if (!fund) return

      // 计算当前基金的持仓金额（加仓或减仓时）
      const currentAmount = fund.amount || 0

      // 判断加仓还是减仓
      if (trade.amount >= 0) {
        // 加仓，增加金额
        fund.amount += trade.amount
      } else {
        // 减仓，减少金额
        fund.amount = Math.max(0, currentAmount + trade.amount)  // 确保金额不为负数
      }

      // 更新基金的净值（如果需要的话）
      fund.nav = trade.nav  // 更新当日净值

      // 添加交易记录
      if (!Array.isArray(fund.trades)) fund.trades = []
      fund.trades.push({
        id: crypto.randomUUID(),  // 生成交易记录ID
        date: trade.date,
        amount: trade.amount,
        nav: trade.nav,
      })

      this.save()  // 保存到 localStorage
    },
    save() {
      const data = { funds: this.funds }
      localStorage.setItem(LS_KEY, JSON.stringify(data))  // 将数据保存到 localStorage
    },
    load() {
      const raw = localStorage.getItem(LS_KEY)
      if (!raw) return
      const data = JSON.parse(raw)
      if (data?.funds) this.funds = data.funds
    },
    resetDemo() {
      this.funds = initialFunds.map(fund => ({ ...fund, trades: [] }))
      this.save()
    }
  }
})
