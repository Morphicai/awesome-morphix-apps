# 🚀 快速开始指南

5 分钟快速上手 Awesome MorphixAI Apps 项目。

## 📋 前置要求

- Node.js 18+ (推荐 LTS)
- Git
- 任意代码编辑器（推荐 Cursor AI 或 VS Code）

## 🎯 三步开始

### 1️⃣ 克隆并安装

```bash
# 克隆仓库
git clone git@github.com:Morphicai/awesome-morphix-apps.git
cd awesome-morphix-apps

# 安装根项目依赖
npm install
```

### 2️⃣ 创建你的第一个应用

```bash
# 运行创建命令
npm run create-app

# 按提示输入：
# ✓ 应用名称: my-first-app
# ✓ 显示名称: My First App
# ✓ 应用描述: 我的第一个 MorphixAI 应用
# ✓ 确认创建: y
# ✓ 安装依赖: y
```

### 3️⃣ 开始开发

```bash
# 进入项目目录
cd my-first-app

# 启动开发服务器
npm run dev
```

浏览器会自动打开 `http://localhost:8812` 🎉

## 🛠️ 常用命令

### 项目管理

```bash
# 创建新应用
npm run create-app [name]

# 同步文档到所有项目
npm run sync-docs

# 同步文档到特定项目
npm run sync-docs timer

# 安装所有子项目依赖
npm run install-all

# 构建所有应用
npm run build-all
```

### 应用开发

```bash
# 启动开发服务器（端口 8812）
npm run dev

# 构建生产版本
npm run build

# 生成项目 ID
npm run generate-id

# 还原应用文件
npm run restore-apps
```

## 📝 开发第一个功能

### 1. 编辑入口文件

打开 `src/app/app.jsx`：

```jsx
import React from 'react';
import { IonPage, IonContent, IonButton } from '@ionic/react';
import { PageHeader } from '@morphixai/components';
import styles from './styles/App.module.css';

export default function App() {
    const handleClick = () => {
        alert('Hello MorphixAI! 🎉');
    };

    return (
        <IonPage>
            <PageHeader title="My First App" />
            <IonContent className={styles.content}>
                <div className={styles.container}>
                    <h1>欢迎使用 MorphixAI</h1>
                    <IonButton onClick={handleClick}>
                        点击我
                    </IonButton>
                </div>
            </IonContent>
        </IonPage>
    );
}
```

### 2. 添加样式

编辑 `src/app/styles/App.module.css`：

```css
.content {
    --padding-top: 0;
}

.container {
    padding: 24px;
    text-align: center;
}

.container h1 {
    margin: 40px 0;
    color: var(--ion-color-primary);
}
```

### 3. 查看效果

保存文件后，浏览器会自动刷新显示最新内容！

## 🎨 添加更多功能

### 使用相机

```jsx
import AppSdk from '@morphixai/app-sdk';

const takePhoto = async () => {
    try {
        const result = await AppSdk.camera.takePicture({
            quality: 0.8
        });
        console.log('Photo:', result);
    } catch (error) {
        console.error('Error:', error);
    }
};
```

### 使用 AI

```jsx
const chatWithAI = async (message) => {
    try {
        const response = await AppSdk.AI.chat({
            messages: [
                { role: "user", content: message }
            ]
        });
        console.log('AI Response:', response);
    } catch (error) {
        console.error('Error:', error);
    }
};
```

### 数据存储

```jsx
// 保存数据
const saveData = async () => {
    await AppSdk.appData.createData({
        collection: 'tasks',
        data: { title: '学习 MorphixAI', done: false }
    });
};

// 读取数据
const loadData = async () => {
    const result = await AppSdk.appData.queryData({
        collection: 'tasks'
    });
    console.log('Data:', result);
};
```

## 📦 发布应用

### 方式一：开发面板上传

1. 在开发环境点击"上传应用"按钮
2. 填写应用信息
3. 提交审核

### 方式二：Git 推送（即将支持）

```bash
git add .
git commit -m "feat: 完成第一个功能"
git push origin main
```

GitHub Actions 会自动构建和发布。

### 方式三：官方审核

发送邮件到 `contact@baibian.app`：
- 应用名称
- 功能描述
- 预览链接

## 📚 下一步

- 📖 阅读 [完整文档](./README.md)
- 🎯 查看 [开发规范](./morphixai-code/CLAUDE.md)
- 💡 参考 [示例应用](./timer/README.md)
- 🤝 查看 [贡献指南](./CONTRIBUTING.md)

## 🆘 遇到问题？

- 📧 Email: contact@baibian.app
- 🐛 GitHub Issues
- 💬 GitHub Discussions

---

祝你开发愉快！🎉

