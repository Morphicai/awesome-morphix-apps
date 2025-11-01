---
inclusion: always
---
# MorphixAI 应用开发指南

## 📖 完整开发文档

**在开始开发前，请务必完整阅读开发指南：**

👉 **[docs/DEVELOPMENT_GUIDE.md](docs/DEVELOPMENT_GUIDE.md)**

该文档包含完整的技术栈说明、SDK 使用指南、UI/UX 规范和最佳实践。

## 🎯 项目结构

```
项目根目录/
├── src/                # 源代码目录
│   ├── app.jsx        # 应用入口文件（必需）
│   ├── components/    # 组件目录
│   ├── styles/        # 样式目录（CSS Modules）
│   ├── services/      # 服务层（可创建）
│   ├── hooks/         # 自定义 Hooks（可创建）
│   └── utils/         # 工具函数（可创建）
├── _dev/              # 开发工具目录（自动生成，禁止修改）
└── docs/              # 文档目录（禁止修改）
```

## 🚀 开发约束

- ✅ **允许**：在 `src/` 目录下创建、修改任何文件
- ❌ **严禁**：修改项目配置文件（package.json, vite.config.js 等）
- ❌ **严禁**：修改 `_dev/` 和 `docs/` 目录

## 🔧 开发命令

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev
```

---

**完整开发规范请阅读：[docs/DEVELOPMENT_GUIDE.md](../../docs/DEVELOPMENT_GUIDE.md)**

