// src/utils/position.js

/* 小工具 */
function toNum(v) {
  const n = Number(v)
  return Number.isFinite(n) ? n : 0
}
function fix(n, d = 2) {
  return Number(toNum(n).toFixed(d))
}

/**
 * 计算单只基金持仓/收益
 * fund 字段约定（尽量宽松兼容）：
 * - netValue/nav    当前净值
 * - change          当日涨跌幅（%），仅用于显示颜色
 * - trades?         [{type:'buy'|'sell', date:'YYYY-MM-DD', price, shares, amount?}]
 *    buy：price+shares（推荐），或仅 amount（投入现金）
 *    sell：price+shares（推荐）
 * - amountHeld/invested/amount（当没有 trades 时，按一次性投入处理）
 */
export function calcPosition(fund = {}) {
  const nav = toNum(fund.netValue ?? fund.nav)
  const change = toNum(fund.change)

  let shares = 0       // 当前份额
  let cost = 0         // 当前持仓成本
  let realizedGain = 0 // 已实现收益

  const trades = Array.isArray(fund.trades) ? fund.trades : []

  if (trades.length > 0) {
    for (const t of trades) {
      const type = String(t?.type || 'buy').toLowerCase()

      if (type === 'buy') {
        let s = toNum(t?.shares)
        const p = toNum(t?.price)
        const amt = toNum(t?.amount)
        if (s <= 0 && p > 0 && amt > 0) s = amt / p
        shares += s
        if (p > 0 && s > 0) cost += p * s
      } else if (type === 'sell') {
        const s = toNum(t?.shares)
        const p = toNum(t?.price)
        if (s > 0 && p > 0 && shares > 0 && cost > 0) {
          const proportion = Math.min(1, s / shares)
          const costOut = cost * proportion
          const proceeds = p * s
          realizedGain += proceeds - costOut
          shares -= s
          cost -= costOut
          if (shares < 0) shares = 0
          if (cost < 0) cost = 0
        }
      }
    }
  } else {
    const amountOnce =
      toNum(fund.amountHeld) || toNum(fund.invested) || toNum(fund.amount) || 0
    if (amountOnce > 0 && nav > 0) {
      shares = amountOnce / nav
      cost = amountOnce
    }
  }

  const marketValue = nav * shares
  const holdingGain = marketValue - cost
  const returnRatePct = cost > 0 ? (holdingGain / cost) * 100 : 0

  return {
    nav: fix(nav, 4),
    change, // 原样返回做红/绿
    shares: fix(shares, 4),
    cost: fix(cost, 2),
    marketValue: fix(marketValue, 2),
    holdingGain: fix(holdingGain, 2),
    returnRatePct: fix(returnRatePct, 2),
    realizedGain: fix(realizedGain, 2),
  }
}

/** 根据风险文案给标签配色 */
export function riskBadgeClassByText(riskText = '') {
  const t = String(riskText)
  if (t.includes('高')) return 'bg-rose-50 text-rose-600'
  if (t.includes('中')) return 'bg-amber-50 text-amber-600'
  if (t.includes('低')) return 'bg-emerald-50 text-emerald-600'
  return 'bg-gray-100 text-gray-600'
}
