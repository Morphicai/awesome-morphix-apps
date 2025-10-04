# 🌟 Awesome MorphixAI Apps

> 精选 MorphixAI 应用集合 - 快速开发、自动发布、完美体验

<div align="center">

[![GitHub](https://img.shields.io/badge/GitHub-MorphixAI-blue?logo=github)](https://github.com/Morphicai/awesome-morphix-apps)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)

[中文文档](README_CN.md) | [日本語](README_JA.md)

</div>

## 📖 项目简介

这是一个 **MorphixAI 应用集合的管理项目**，用于统一管理和发布多个高质量的 MorphixAI 应用。

### ✨ 核心特性

- 🚀 **快速创建** - 一键创建新应用项目
- 📚 **文档同步** - 自动同步最新开发文档到各子项目
- 🔄 **自动发布** - Git 推送后自动构建和发布
- 🎯 **统一管理** - 集中管理所有应用的版本和依赖
- 🛠️ **开发工具** - 完整的 CLI 工具链支持

## 📁 项目结构

> 🎯 基于 pnpm monorepo 架构，统一管理所有应用和工具

```
awesome-morphix-apps/
├── apps/                  # 📱 所有应用
│   ├── template/          # 📦 模板项目（开发框架）
│   │   ├── src/app/       # 业务代码开发区域
│   │   ├── src/_dev/      # 开发环境外壳
│   │   └── docs/          # 项目文档
│   │
│   └── timer/             # ⏰ 番茄钟应用
│       ├── src/app/       # 任务管理 + 番茄钟功能
│       └── ...
│
├── tools/                 # 🛠️ 开发工具
│   └── cli/               # CLI 工具包
│       ├── bin/
│       │   └── morphix.js # 统一 CLI 入口
│       ├── create-app.js  # 创建新应用
│       ├── sync-docs.js   # 同步文档
│       └── ...
│
├── docs/                  # 📚 共享文档库
│   ├── CONTRIBUTING.md    # 贡献指南
│   ├── QUICK_START.md     # 快速开始
│   └── .shared/           # 共享资源
│
├── pnpm-workspace.yaml    # pnpm workspace 配置
├── package.json           # 根项目配置
└── README.md              # 本文件
```

## 🚀 快速开始

### 环境要求

- **Node.js** 18+ (推荐 LTS 版本)
- **Git**
- 支持的操作系统：macOS, Windows, Linux

> 💡 **无需全局安装 pnpm**  
> 项目已内置 pnpm，使用 `npx pnpm` 或 `npm` 命令即可

### 安装依赖

```bash
# 克隆仓库
git clone git@github.com:Morphicai/awesome-morphix-apps.git
cd awesome-morphix-apps

# 安装所有依赖（包括所有应用和 pnpm）
npm install

# 或使用快捷命令
npm run install-all
```

## 🛠️ 项目管理

### 创建新应用

使用 CLI 工具快速创建新的 MorphixAI 应用：

```bash
# 交互式创建
npm run create

# 或直接指定应用名称
npm run create my-awesome-app

# 或使用完整命令
node tools/cli/bin/morphix.js create my-awesome-app
```

创建过程会：
1. ✅ 使用 `npx @morphixai/code create` 创建应用
2. ✅ 确保应用创建在 `apps/` 目录下
3. ✅ 自动生成项目结构和配置
4. ✅ 自动安装依赖
5. ✅ 初始化开发环境

### 文档同步

将最新的开发文档同步到所有子项目：

```bash
# 同步所有子项目的文档
npm run sync-docs

# 同步特定项目的文档
npm run sync-docs timer
```

同步内容包括：
- 📄 CLAUDE.md - AI 开发规范
- 📄 DEVELOPER.md - 开发者文档
- 📁 docs/ - 完整文档目录

### 开发应用

**方式一：交互式开发（推荐）**

在根目录运行，会显示菜单让你选择：

```bash
npm run dev
```

交互式菜单支持：
- 📱 使用 ↑↓ 方向键选择应用
- ➕ 创建新应用
- ❌ 退出

**方式二：直接进入子项目**

```bash
cd apps/timer
npm install
npm run dev
```

**方式三：运行所有应用（并行）**

```bash
npm run dev:all

# 或使用 pnpm 过滤器
npx pnpm --filter timer dev
```

浏览器会自动打开 `http://localhost:8812`

## 📚 已有应用

### 🖼️ template
**标准模板项目** - 用于创建新应用的基础模板

- React 19 + Ionic 8.6.2
- Vite 5 开发服务器
- 完整的开发文档和规范
- HostClient SDK 集成

[查看详情 →](./apps/template/README.md)

---

### ⏰ timer
**番茄钟应用** - 任务管理 + 番茄工作法

- 任务管理系统
- 番茄钟计时器
- 数据统计分析
- 多语言支持（中/英）

[查看详情 →](./apps/timer/README.md) | [在线体验 →](https://app-shell.focusbe.com/app-runner/timer-app)

---

## 🎯 开发规范

所有应用必须遵循统一的开发规范：

### 核心约束

- ✅ **开发区域**：只能在 `src/app/` 目录内开发
- ❌ **禁止修改**：不能修改 `src/_dev/`、配置文件和构建脚本
- 📦 **技术栈**：React 19 + Ionic React 8.6.2
- 🎨 **样式**：必须使用 CSS Modules
- 🔒 **入口文件**：`src/app/app.jsx`

### 推荐工具

- **Cursor AI** - 内置完整的开发规范
- **Claude Code** - 支持自然语言编程
- **VS Code** - 配合 Vite 插件

详细规范请查看：[开发规范文档](./docs/standards/development-guidelines.md)

## 📦 发布流程

### 开发环境测试

```bash
cd your-app
npm run dev
```

### 发布到 MorphixAI 平台

1. **方式一：自动发布**（推荐）
   ```bash
   git add .
   git commit -m "feat: 添加新功能"
   git push origin main
   ```
   GitHub Actions 会自动发布

2. **方式二：手动发布**
   - 在开发环境的控制面板点击"上传应用"
   - 填写应用信息并提交审核

3. **方式三：官方市场**
   - 发送邮件到 `contact@baibian.app`
   - 提供应用信息和使用说明

## 🔧 CLI 命令

### Monorepo 命令

> 💡 使用 `npm` 命令运行，项目会自动使用内置的 pnpm

```bash
# 🎯 交互式开发（推荐）
npm run dev              # 显示菜单选择项目

# 创建新应用
npm run create [name]

# 同步文档
npm run sync-docs [app]

# 安装所有依赖
npm install
npm run install-all

# 开发所有应用（并行）
npm run dev:all

# 清理所有 node_modules
npm run clean
```

### 子项目命令

```bash
# 🎯 推荐：使用交互式命令
npm run dev                       # 选择要开发的项目

# 在根目录使用 pnpm 过滤器
npx pnpm --filter timer dev       # 开发特定应用

# 或进入子项目
cd apps/timer
npm install                       # 安装依赖
npm run dev                       # 启动开发服务器
npm run generate-id               # 生成项目 ID
```

## 🤝 贡献指南

欢迎贡献新的应用或改进现有应用！

### 贡献流程

1. Fork 本仓库
2. 创建新应用或改进现有应用
   ```bash
   npm run create-app my-app
   cd my-app
   # 进行开发...
   ```
3. 提交代码
   ```bash
   git add .
   git commit -m "feat(my-app): 添加新应用"
   git push origin main
   ```
4. 创建 Pull Request

### 应用质量要求

- ✅ 代码符合开发规范
- ✅ 提供完整的文档
- ✅ 在开发环境测试通过
- ✅ 遵循 MorphixAI 平台约束
- ✅ 具有实用价值

## 📖 相关资源

### 官方文档
- [MorphixAI 官网](https://baibian.app/)
- [应用开发规范](https://app-shell.focusbe.com/docs/app-development-specification.md)
- [App SDK API](https://app-shell.focusbe.com/docs/app-sdk-api.md)
- [应用市场](https://app-shell.focusbe.com/app-market)

### 技术文档
- [React 官方文档](https://react.dev/)
- [Ionic React](https://ionicframework.com/docs/react)
- [Vite 文档](https://vitejs.dev/)

### 社区
- GitHub Issues - 问题反馈
- GitHub Discussions - 技术讨论
- Email: contact@baibian.app

## 📄 许可证

本项目采用 [MIT License](LICENSE) 开源协议。

---

<div align="center">

**Made with ❤️ by MorphixAI Community**

[⬆ 回到顶部](#-awesome-morphixai-apps)

</div>

