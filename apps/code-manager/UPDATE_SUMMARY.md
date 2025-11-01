# 优惠券管理系统 - 底部 Tab 布局 + 深色模式

## ✅ 更新内容

### 1. 底部 Tab 布局
改用 Ionic 标准的底部 Tab 导航，提供更好的移动端体验：

- **Tab 1: 创建优惠券** - 优惠券创建表单
- **Tab 2: 优惠券列表** - 显示所有优惠券
- **Tab 3: 验券管理** - 验券查询功能

### 2. 深色模式支持
所有组件和样式都已适配深色模式：

#### 自动适配
- 使用 CSS 变量 `var(--ion-background-color)` 等
- 通过 `@media (prefers-color-scheme: dark)` 自动切换
- 跟随系统主题设置

#### 适配组件
- ✅ 主应用布局
- ✅ 优惠券列表
- ✅ 创建优惠券表单
- ✅ 验券管理表单
- ✅ 优惠券详情 Modal
- ✅ 创建结果 Modal
- ✅ 验证结果 Modal

### 3. UI/UX 改进

#### 底部导航栏
```
┌─────────────────────────────┐
│                             │
│      页面内容区域            │
│                             │
└─────────────────────────────┘
┌─────────────────────────────┐
│  创建  │  列表  │  验券      │
└─────────────────────────────┘
```

#### 深色模式配色
- **背景色**: 深灰色 (#1a1a1a, #1e1e1e)
- **卡片色**: 深灰色 (#1e1e1e, #2d2d2d)
- **文字色**: 浅色 (#ffffff, #f9fafb)
- **边框色**: 深灰色 (#2d2d2d, #475569)
- **渐变色**: 保持紫色渐变（品牌色）

## 🎨 深色模式效果

### 浅色模式
- 白色背景 (#ffffff)
- 浅灰色卡片 (#f5f5f5)
- 深色文字 (#000000)
- 清爽明亮

### 深色模式
- 深色背景 (#1a1a1a)
- 深灰色卡片 (#1e1e1e)
- 浅色文字 (#ffffff)
- 护眼舒适

## 📱 功能特性

### Tab 1: 创建优惠券
- 金额输入表单
- 实时验证
- 创建成功后弹出 Modal
- Modal 中可保存图片

### Tab 2: 优惠券列表
- 显示所有优惠券
- 优惠券码加密显示（AB**CD）
- 点击查看详情
- 详情中支持删除和保存图片

### Tab 3: 验券管理
- 编码输入查询
- 验证结果 Modal 展示
- 支持验券使用

## 🔧 技术实现

### 底部 Tab 结构
```jsx
<IonTabs>
  <IonTab tab="create">...</IonTab>
  <IonTab tab="list">...</IonTab>
  <IonTab tab="validate">...</IonTab>
  <IonTabBar slot="bottom">
    <IonTabButton tab="create">...</IonTabButton>
    <IonTabButton tab="list">...</IonTabButton>
    <IonTabButton tab="validate">...</IonTabButton>
  </IonTabBar>
</IonTabs>
```

### 深色模式 CSS
```css
/* 使用 CSS 变量 */
.content {
  --background: var(--ion-background-color, #f5f5f5);
}

/* 深色模式媒体查询 */
@media (prefers-color-scheme: dark) {
  .content {
    --background: var(--ion-background-color, #1a1a1a);
  }
  
  .card {
    background: var(--ion-card-background, #1e1e1e);
    border-color: var(--ion-border-color, #2d2d2d);
  }
}
```

## 🚀 测试方式

### 启动开发服务器
```bash
npm run dev
```

### 测试深色模式
1. **macOS**: 系统偏好设置 → 通用 → 外观 → 深色
2. **iOS**: 设置 → 显示与亮度 → 深色
3. **Android**: 设置 → 显示 → 深色主题
4. **浏览器**: 开发者工具 → 渲染 → 模拟深色模式

### 功能测试
1. 切换三个 Tab 查看不同页面
2. 创建优惠券 → 查看 Modal
3. 切换到列表 Tab → 点击优惠券查看详情
4. 切换到验券 Tab → 输入编码验证
5. 切换系统深色模式查看效果

## 📊 对比

### 之前（Segment 布局）
- 上方 Segment 切换
- 创建/验证区域在上方
- 列表固定在下方
- 单页面布局

### 现在（Tab 布局）
- 底部 Tab 导航
- 三个独立页面
- 更符合移动端习惯
- 更清晰的功能分区

## 🎯 优势

1. **更好的移动端体验** - 底部导航更易操作
2. **清晰的功能分区** - 每个 Tab 专注一个功能
3. **深色模式支持** - 护眼舒适，节省电量
4. **自动适配** - 跟随系统主题设置
5. **一致的视觉体验** - 所有组件统一适配

## 🔄 迁移说明

### 主要变更
1. 从单页 Segment 布局改为 Tab 布局
2. 添加独立的"优惠券列表" Tab
3. 所有样式文件添加深色模式支持
4. 使用 Ionic CSS 变量实现主题切换

### 保持不变
- 所有业务逻辑
- Modal 弹窗交互
- 数据存储方式
- 图片生成功能

## 📝 注意事项

1. 深色模式会自动跟随系统设置
2. 渐变色（紫色）在深浅模式下保持一致
3. 所有文字颜色都使用 CSS 变量
4. 边框和背景色自动适配
5. Modal 弹窗也支持深色模式

---

**开发服务器**: http://localhost:8812

**状态**: ✅ 运行中，已自动重新加载
