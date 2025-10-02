# 贡献指南

感谢你对 Awesome MorphixAI Apps 项目的关注！本文档将帮助你快速上手贡献。

## 🚀 快速开始

### 1. 克隆仓库

```bash
git clone git@github.com:Morphicai/awesome-morphix-apps.git
cd awesome-morphix-apps
```

### 2. 安装依赖

> 💡 无需全局安装 pnpm，项目已内置

```bash
# 安装所有依赖（包括所有应用和 pnpm）
npm install
```

## 📦 创建新应用

使用 CLI 工具快速创建新应用：

```bash
# 交互式创建
npm run create

# 或直接指定名称
npm run create my-awesome-app
```

创建过程：

1. **输入应用信息**
   - 应用名称（小写字母、数字和连字符）
   - 显示名称
   - 应用描述

2. **自动完成**
   - ✅ 从模板复制项目结构
   - ✅ 生成唯一项目 ID
   - ✅ 更新配置文件
   - ✅ 初始化 Git
   - ✅ 安装依赖（可选）

3. **开始开发**
   ```bash
   cd my-awesome-app
   npm run dev
   ```

## 📚 文档管理

### 同步文档

将最新的核心文档同步到子项目：

```bash
# 同步所有项目
npm run sync-docs

# 同步特定项目
npm run sync-docs timer
```

同步的文件包括：
- `CLAUDE.md` - AI 开发规范
- `DEVELOPER.md` - 开发者文档
- `docs/` - 完整文档目录

### 文档结构

每个子项目都包含以下文档：

```
apps/your-app/
├── README.md                          # 项目介绍
├── CLAUDE.md                          # AI 开发规范
├── DEVELOPER.md                       # 开发者文档
└── docs/
    ├── README.md                      # 文档索引
    ├── context/
    │   └── project-background.md      # 项目背景
    ├── requirements/
    │   └── development-guidelines.md  # 开发指南
    └── technical/
        └── project-overview.md        # 技术概览
```

## 🛠️ 开发流程

### 1. 本地开发

```bash
cd apps/your-app
npm run dev
```

或在根目录使用：

```bash
npx pnpm --filter your-app dev
```

访问 `http://localhost:8812` 查看效果。

### 2. 开发规范

**核心约束：**
- ✅ 只在 `src/app/` 目录内开发
- ❌ 不修改 `src/_dev/`、配置文件和构建脚本
- 📦 使用 React 19 + Ionic 8.6.2
- 🎨 使用 CSS Modules

**代码规范：**
- 遵循 ESLint 规则
- 使用语义化的命名
- 添加必要的注释
- 保持代码整洁

### 3. 构建测试

```bash
npm run build
```

或在根目录：

```bash
npx pnpm --filter your-app build
```

确保构建成功且没有错误。

## 🔄 提交代码

### 1. 提交规范

使用语义化的提交信息：

```bash
# 新功能
git commit -m "feat(timer): 添加任务优先级功能"

# 修复 bug
git commit -m "fix(timer): 修复番茄钟计时不准确的问题"

# 文档更新
git commit -m "docs: 更新 README 使用说明"

# 样式调整
git commit -m "style(timer): 优化移动端布局"

# 重构
git commit -m "refactor(timer): 重构任务管理逻辑"
```

提交类型：
- `feat` - 新功能
- `fix` - 修复 bug
- `docs` - 文档更新
- `style` - 样式调整
- `refactor` - 代码重构
- `test` - 测试相关
- `chore` - 构建/工具相关

### 2. 推送代码

```bash
git add .
git commit -m "feat(app-name): your message"
git push origin main
```

## 📋 应用质量要求

提交新应用前，请确保：

### 功能要求
- ✅ 功能完整可用
- ✅ 在开发环境测试通过
- ✅ 无明显 bug
- ✅ 良好的用户体验

### 代码要求
- ✅ 代码符合开发规范
- ✅ 遵循 MorphixAI 平台约束
- ✅ 包含必要的错误处理
- ✅ 代码可读性良好

### 文档要求
- ✅ README 包含完整说明
- ✅ 代码有必要的注释
- ✅ API 使用有文档说明

### 性能要求
- ✅ 首屏加载快速
- ✅ 响应流畅
- ✅ 内存占用合理

## 🎯 应用发布

### 发布流程

1. **开发完成**
   - 功能测试完毕
   - 代码审查通过

2. **准备发布**
   ```bash
   npm run build
   ```

3. **提交审核**
   - 方式一：通过控制面板上传
   - 方式二：发送邮件到 contact@baibian.app
   - 方式三：等待 GitHub Actions 自动发布（即将支持）

### 发布要求

- 应用必须有实用价值
- 用户界面友好
- 功能稳定可靠
- 符合平台规范

## 🤝 社区支持

### 获取帮助

- **GitHub Issues** - 提交 bug 和功能建议
- **GitHub Discussions** - 技术讨论和问答
- **Email** - contact@baibian.app

### 参与讨论

- 分享你的想法和建议
- 帮助其他开发者解决问题
- 参与技术讨论

## 📖 相关资源

- [MorphixAI 官网](https://baibian.app/)
- [开发规范](https://app-shell.focusbe.com/docs/app-development-specification.md)
- [App SDK API](https://app-shell.focusbe.com/docs/app-sdk-api.md)
- [应用市场](https://app-shell.focusbe.com/app-market)

---

再次感谢你的贡献！🎉

