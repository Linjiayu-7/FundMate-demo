# 🚀 FundMate 模拟基金管理平台

[![Vercel](https://vercelbadge.vercel.app/api/LinjiaYu-7/FundMate-demo)](https://fund-mate-demo.vercel.app)

FundMate 是一个模拟基金管理与展示的前端平台，旨在帮助用户进行虚拟基金组合管理与投资模拟。用户可：

- 🔍 查看基金信息（数据可通过接口接入）
- 📊 搜索 / 筛选基金
- 📈 使用图表展示收益趋势、分布结构
- 📱 响应式 UI，适配手机端与 PC 端

> 本项目为前端实训练习，采用现代前端技术栈构建，并已集成 Vercel 一键部署。

---

## ✨ 在线预览

👉 [https://fund-mate-demo.vercel.app](https://fund-mate-demo.vercel.app)

---

## 🧠 技术栈

- [React 18](https://reactjs.org/)
- [Vite](https://vitejs.dev/)
- [Tailwind CSS](https://tailwindcss.com/)（可选）
- [Axios](https://axios-http.com/)（请求处理）
- Git + GitHub + Vercel（CI/CD 自动部署）

---

## 📸 功能截图

| 首页功能卡片 | 添加/编辑基金 |
| ------------ | ------------- |
| ![首页](./screenshots/首页.png) | ![新增基金](./screenshots/新增基金.png) |

| 买入基金 | 卖出基金 |
| -------- | -------- |
| ![买入](./screenshots/买入基金.png) | ![卖出](./screenshots/卖出基金.png) |

| 统计分析页（图表） |
| ----------------- |
| ![统计](./screenshots/统计1.png) ![统计2](./screenshots/统计2.png) |

---

## 🧪 本地运行

```bash
# 安装依赖
npm install

# 本地开发
npm run dev

# 构建生产环境代码（用于部署）
npm run build
