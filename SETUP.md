# 🚀 项目设置说明

## 📦 关于 pnpm

本项目使用 **pnpm** 作为包管理器，但你**不需要全局安装 pnpm**！

### ✨ 特性

- ✅ **无需全局安装** - pnpm 已作为项目依赖安装
- ✅ **版本兼容** - 所有开发者使用 pnpm 8.x 版本（自动选择最新）
- ✅ **简单命令** - 使用熟悉的 `npm` 命令即可

## 🎯 快速开始

### 1. 安装依赖

```bash
# 克隆项目
git clone git@github.com:Morphicai/awesome-morphix-apps.git
cd awesome-morphix-apps

# 安装所有依赖（包括 pnpm 本身）
npm install
```

### 2. 开发

**🎯 交互式开发（推荐）**

```bash
# 显示菜单选择项目
npm run dev
```

交互式菜单：
- 📱 使用 ↑↓ 方向键选择应用
- ➕ 创建新应用选项
- ❌ 退出选项
- 回车确认选择

**其他命令**

```bash
# 创建新应用
npm run create my-app

# 同步文档
npm run sync-docs

# 开发所有应用（并行）
npm run dev:all

# 构建所有应用
npm run build
```

## 🔧 工作原理

### npm + npx pnpm

当你运行 `npm install` 时：
1. npm 安装根目录的依赖（包括 pnpm）
2. pnpm 被安装到 `node_modules/.bin/pnpm`
3. 后续命令通过 `npx pnpm` 调用本地安装的 pnpm

### 命令示例

```bash
# ✅ 推荐：使用 npm scripts
npm run dev              # 🎯 交互式开发菜单
npm run dev:all          # 开发所有应用（并行）
npm run create my-app    # 创建新应用
npm run sync-docs        # 同步文档

# ✅ 或者直接使用 npx pnpm
npx pnpm --filter timer dev     # 开发特定应用
npx pnpm --filter timer build   # 构建特定应用

# ❌ 不需要全局安装 pnpm
# pnpm install  (不需要这样做)
```

## 📁 项目结构

```
awesome-morphix-apps/
├── apps/                      # 所有应用
│   ├── template/             # 模板项目
│   └── timer/                # 番茄钟应用
├── tools/cli/                # CLI 工具
├── docs/                     # 共享文档
├── pnpm-workspace.yaml       # pnpm workspace 配置
├── .npmrc                    # npm 配置
└── package.json              # 根配置（包含 pnpm 依赖）
```

## 🛠️ 技术栈

- **Node.js** 18+
- **pnpm** 8.x (作为项目依赖)
- **Monorepo** 架构
- **React** 19
- **Ionic** 8.6.2
- **Vite** 5

## ⚙️ 配置说明

### package.json

```json
{
  "packageManager": "pnpm@8.x",
  "engines": {
    "node": ">=18.0.0",
    "pnpm": "^8.0.0"
  },
  "devDependencies": {
    "pnpm": "^8.0.0"
  },
  "scripts": {
    "dev": "node tools/cli/dev.js",
    "dev:all": "npx pnpm --filter \"./apps/*\" --parallel dev"
  }
}
```

### .npmrc

```ini
# pnpm 配置
shamefully-hoist=true
strict-peer-dependencies=false
link-workspace-packages=true
```

### pnpm-workspace.yaml

```yaml
packages:
  - 'apps/*'
  - 'tools/*'
```

## 🎓 常见问题

### Q: 为什么不直接使用 npm？
A: pnpm 提供更好的依赖管理、更快的安装速度和更少的磁盘空间占用。

### Q: 为什么不全局安装 pnpm？
A: 将 pnpm 作为项目依赖可以确保所有开发者使用相同版本，避免版本不一致的问题。

### Q: 如何更新 pnpm 版本？
A: 
```bash
npm install pnpm@latest --save-dev
```

### Q: 可以直接使用 pnpm 命令吗？
A: 如果你全局安装了 pnpm，可以直接使用。但为了保证版本一致，建议使用 `npx pnpm`。

## 📚 相关链接

- [pnpm 官方文档](https://pnpm.io/)
- [pnpm Workspace](https://pnpm.io/workspaces)
- [npx 使用说明](https://www.npmjs.com/package/npx)

---

**提示**：首次克隆项目后，只需运行 `npm install` 即可开始开发！

