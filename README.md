# Vue 3 + Vite

This template should help get you started developing with Vue 3 in Vite. The template uses Vue 3 `<script setup>` SFCs, check out the [script setup docs](https://v3.vuejs.org/api/sfc-script-setup.html#sfc-script-setup) to learn more.

Learn more about IDE Support for Vue in the [Vue Docs Scaling up Guide](https://vuejs.org/guide/scaling-up/tooling.html#ide-support).
# FundMate — 个人基金助手（Vue 3 + Pinia + Vite）

一个“轻量但专业口径”的基金持仓小工具。支持 **多用户**、**交易录入**、**份额法收益**、**月度曲线**、**本地持久化**，UI 简洁友好，适合作为前端实习项目展示。

## 在线体验
> （把 Vercel 部署链接贴这里）

## 技术栈
- **Vue 3 + Vite**：组合式 API，轻量快速
- **Pinia**：全局状态（多用户 / 基金 / 交易），集中管理写操作
- **Tailwind CSS**：现代化样式体系
- **Chart.js + vue-chartjs**：收益曲线图
- 本地存储（`localStorage`）：数据持久化

## 核心功能
- 多用户：一键切换不同用户的持仓/收益
- 交易录入：申购金额、日期、净值、手续费
- 份额法收益：准确处理多次定投  
  公式：  
  份额 = Σ(净投入/当时净值)  
  市值 = 份额 × 最新净值  
  收益 = 市值 − 成本；收益率 = 收益 / 成本
- 总览：用户总收益、单基金成本/市值/收益/收益率
- 趋势图：按月聚合“累计投入 / 市值 / 收益”
- 本地持久化：刷新不丢数据

## 本地运行
```bash
npm i
npm run dev
