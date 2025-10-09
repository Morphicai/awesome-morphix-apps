# Focus Ritual Coach - 专注仪式教练

> 帮助知识工作者构建日常专注仪式的智能应用

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![MorphixAI](https://img.shields.io/badge/MorphixAI-App-blue)](https://baibian.app/)

## 📖 项目简介

Focus Ritual Coach 是一款基于 MorphixAI 平台开发的专注习惯养成应用。通过**情绪签到 + AI 激励 + 专注计时**的三步仪式流程，帮助用户：

- 🎯 快速进入专注状态
- 💪 建立稳定的专注习惯
- 📊 追踪情绪与效率趋势
- 🤖 获得个性化的 AI 建议

## 🎨 核心功能

### 1. 情绪签到
- 选择当前情绪状态（愉悦、平静、焦虑、疲惫、充满活力）
- 调整能量等级（1-5级）
- 记录此刻的想法

### 2. AI 激励
- 基于你的情绪和能量状态，AI 生成个性化激励语
- 设定今日三件事（聚焦最重要的任务）
- 获得具体的行动建议和专注小技巧

### 3. 专注计时
- 25分钟专注倒计时（番茄工作法）
- 圆形进度指示器，直观展示进度
- 支持暂停、继续、重置
- 完成后自动记录并展示成就

### 4. 数据追踪
- 自动保存每次仪式记录
- 追踪专注会话历史
- 计算每周完成率和总专注时长
- 分析情绪趋势

## 🚀 快速开始

### 前置要求

- Node.js 16+
- npm 或 pnpm

### 安装运行

```bash
# 进入项目目录
cd apps/focus-ritual-coach

# 安装依赖
npm install

# 启动开发服务器
npm run dev
```

访问 http://localhost:8812 查看应用

### 构建部署

```bash
# 构建生产版本
npm run build
```

## 📱 使用指南

### 完整仪式流程

1. **打开应用** - 查看欢迎页面，了解功能
2. **点击"开始仪式"** - 进入情绪签到
3. **签到情绪** - 选择心情和能量等级
4. **查看 AI 建议** - 添加今日任务，获得激励
5. **开始专注** - 启动25分钟计时器
6. **完成仪式** - 查看成就，返回首页

### 最佳实践

- 🌅 **每天早晨使用** - 帮助你规划一天的重点
- 🔄 **需要切换任务时使用** - 重新聚焦注意力
- 📈 **每周回顾数据** - 了解自己的专注模式
- 💡 **诚实记录情绪** - AI 才能给出更好的建议

## 🛠 技术栈

### 框架与库
- **React 19** - UI 框架
- **Ionic React 8.6.2** - 移动端组件库
- **Zustand** - 状态管理
- **CSS Modules** - 样式隔离

### MorphixAI SDK
- `AppSdk.appData` - 数据持久化
- `AppSdk.AI.chatCompletion` - AI 对话能力
- `reportError` - 错误追踪

### 开发工具
- `@morphixai/code` - 开发工具链
- Vite - 构建工具
- ESLint - 代码规范

## 📂 项目结构

```
focus-ritual-coach/
├── src/
│   ├── app.jsx                # 主应用入口
│   ├── components/            # 组件目录
│   │   ├── Welcome.jsx        # 欢迎页
│   │   ├── EmotionCheck.jsx   # 情绪签到
│   │   ├── AICoach.jsx        # AI 激励
│   │   └── FocusTimer.jsx     # 专注计时
│   ├── services/              # 服务层
│   │   ├── dataService.js     # 数据管理
│   │   └── coachService.js    # AI 服务
│   ├── store/                 # 状态管理
│   │   └── ritualStore.js     # 仪式状态
│   └── styles/                # 样式文件
├── package.json               # 项目配置
├── project-config.json        # MorphixAI 配置
└── README.md                  # 英文文档
```

## 🎯 设计理念

### 为什么是"仪式"？

1. **降低启动成本** - 固定流程减少决策疲劳
2. **建立心理暗示** - 仪式感帮助大脑切换状态
3. **强化习惯循环** - 重复的步骤形成肌肉记忆
4. **情感支持** - AI 的温暖鼓励提供情感连接

### 为什么只有三件事？

- 聚焦最重要的任务，避免信息过载
- 符合认知负荷理论
- 提高完成率和成就感
- 更容易形成习惯

### 为什么是 25 分钟？

- 基于番茄工作法的最佳实践
- 足够完成一个小任务
- 时间不长，容易坚持
- 避免过度疲劳

## 🌟 特色亮点

### 1. 智能 AI 教练
- 根据情绪和能量状态生成个性化建议
- 温暖而务实的激励语
- 具体可行的行动指引

### 2. 简洁的用户体验
- 线性的步骤流程，降低认知负担
- 流畅的动画过渡
- 清晰的视觉反馈

### 3. 数据驱动的洞察
- 自动记录每次仪式
- 追踪情绪趋势
- 计算专注时长和完成率

### 4. 可扩展架构
- 模块化设计，易于维护
- 服务层抽象，便于测试
- 支持第三方集成（Notion、Todoist 等）

## 🔮 未来规划

### Phase 1: 增强功能
- [ ] 统计页面 - 可视化数据和趋势
- [ ] 自定义设置 - 专注时长、提醒等
- [ ] 声音提醒 - 番茄钟提示音
- [ ] 深色模式 - 夜间友好

### Phase 2: 第三方集成
- [ ] **Notion 同步** - 任务自动导入
- [ ] **Todoist 集成** - 双向同步
- [ ] **日历写入** - 记录专注时间
- [ ] **数据导出** - CSV/JSON 格式

### Phase 3: 社交功能
- [ ] 成就卡片分享
- [ ] 社区仪式模板
- [ ] 好友互动激励
- [ ] 排行榜系统

## 💡 使用技巧

### 提高专注质量
1. 选择安静的环境
2. 关闭干扰通知
3. 准备好必要的工具
4. 设定明确的任务目标

### 建立长期习惯
1. 固定时间使用（如每天早上9点）
2. 坚持至少21天
3. 记录完成情况
4. 定期回顾数据

### 应对低能量状态
1. 选择简单的任务
2. 缩短专注时长
3. 多休息
4. 关注情绪变化

## 🐛 问题反馈

如遇到问题或有功能建议，欢迎：

1. 提交 Issue
2. 发起 Pull Request
3. 联系开发者

## 📄 开源协议

本项目采用 [MIT License](LICENSE) 开源协议

## 🙏 致谢

- [MorphixAI](https://baibian.app/) - 提供强大的开发平台
- [Ionic Framework](https://ionicframework.com/) - 优秀的移动端组件库
- [Zustand](https://github.com/pmndrs/zustand) - 简洁的状态管理
- Reddit r/productivity 社区 - 用户需求调研

## 📮 联系方式

- 项目主页: [MorphixAI Apps](https://github.com/morphixai/awesome-morphix-apps)
- 官网: [MorphixAI](https://baibian.app/)

---

**用心构建每一次专注 ✨**

愿你在专注中找到心流，在仪式中获得力量。

