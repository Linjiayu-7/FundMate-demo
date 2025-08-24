// 汇总“月度维度”的累计投入、市值、收益（简单版）
// 思路：
// - 以每笔交易的月份为时间轴（YYYY-MM）
// - 累计“投入金额”（当月新增投入的和）
// - 最新净值 nav 的获取优先级：交易时净值 t.nav > 基金当前 netValue > 0
// - 用份额法推导出每个“月末”的市值 = 截至当月累计份额 × 当月最后一次已知净值
// - 收益 = 市值 - 成本
export function buildMonthlySeries(funds) {
  // 收集所有月份（出现过交易的月份）
  const monthsSet = new Set()
  const allTrades = []

  for (const f of funds || []) {
    const trades = Array.isArray(f.trades) ? f.trades : []
    for (const t of trades) {
      const m = (t.date || '').slice(0, 7) // YYYY-MM
      if (m) monthsSet.add(m)
      allTrades.push({ ...t, fund: f })
    }
  }

  // 没有交易就直接返回空
  const months = Array.from(monthsSet).sort()
  if (months.length === 0) return { labels: [], invest: [], mv: [], gain: [] }

  // 为每支基金维护“到当前为止”的累计份额与成本
  const state = new Map() // key: fund.code -> { shares, cost, lastNav }
  const monthInvest = {}  // 当月投入和（跨基金）
  const monthMV = {}      // 当月市值（跨基金）

  // 先按时间排序所有交易
  allTrades.sort((a, b) => a.date.localeCompare(b.date))

  // 逐月推进：每个月把属于这个月的交易打上去，得到该月月末的 MV/收益
  for (const m of months) {
    // 处理当月交易
    const monthTrades = allTrades.filter(t => (t.date || '').slice(0, 7) === m)
    let investThisMonth = 0

    for (const t of monthTrades) {
      const code = t.fund.code
      if (!state.has(code)) state.set(code, { shares: 0, cost: 0, lastNav: Number(t.fund.netValue || 0) })

      const st = state.get(code)
      const fee = Number(t.fee || 0)
      const amt = Number(t.amount || 0)
      const tnav = Number(t.nav || 0)

      // 只实现申购（amt >= 0）
      if (amt >= 0 && (tnav > 0 || st.lastNav > 0)) {
        const nav = tnav > 0 ? tnav : st.lastNav
        const net = amt - fee
        st.shares += net / nav
        st.cost += amt
        st.lastNav = nav
        investThisMonth += amt
      }
    }

    monthInvest[m] = (monthInvest[m] || 0) + investThisMonth

    // 计算该月“月末”的市值（用每支基金当前已知最后净值）
    let mv = 0
    for (const [_, st] of state) {
      mv += st.shares * (st.lastNav || 0)
    }
    monthMV[m] = mv
  }

  // 累计投入与收益曲线
  let cumInvest = 0
  const labels = []
  const invest = []
  const mv = []
  const gain = []

  for (const m of months) {
    cumInvest += monthInvest[m] || 0
    const marketValue = monthMV[m] || 0
    labels.push(m)
    invest.push(+cumInvest.toFixed(2))
    mv.push(+marketValue.toFixed(2))
    gain.push(+(marketValue - cumInvest).toFixed(2))
  }

  return { labels, invest, mv, gain }
}
