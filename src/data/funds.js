// src/data/funds.js
// 这是“静态初始基金列表”，只放基础属性；交易请通过 AddTradeForm 录入。
// 必须是“命名导出”：export const fundList = [...]
export const fundList = [
  {
    code: '110011',
    name: '易方达中小盘',
    netValue: 1.2345, // 当前净值（可手填；后续可接接口更新）
    type: '混合型',
    risk: '中高风险',
    trades: [
      { type: 'buy', date: '2025-08-18', price: 1.8590, shares: 5380.0968 }
    ]
       // 交易记录不要写死，留空，走表单录入
  },
  {
    code: '161039',
    name: '富国中证1000指数增强',
    netValue: 0.9876,
    type: '指数增强',
    risk: '中风险',
    trades: []
  }
]

// 如需更多初始基金，按上面对象追加即可。
// 重点：这里只负责“静态基础信息”，不要在这里计算或写死收益。
