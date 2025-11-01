# 优惠券列表排序和显示更新

## 🎯 更新内容

### 1. 折扣券显示支持
列表中现在可以正确显示折扣券：

**金额券显示：**
```
┌─────────┐
│  ¥50   │
│ XX商城  │
└─────────┘
```

**折扣券显示：**
```
┌─────────┐
│ 8.5折  │
│ YY超市  │
└─────────┘
```

### 2. 智能排序
优惠券列表按以下规则自动排序：

1. **首要规则**：未使用的优惠券排在前面
2. **次要规则**：按创建时间倒序（新的在前）

**排序示例：**
```
✅ 未使用 - 2024-01-15 10:30
✅ 未使用 - 2024-01-14 15:20
✅ 未使用 - 2024-01-13 09:00
❌ 已使用 - 2024-01-12 18:45
❌ 已使用 - 2024-01-10 14:30
```

### 3. 新增信息展示

#### 公司名称
- 显示在金额/折扣下方
- 小字号，半透明白色
- 如果没有公司名称则不显示

#### 备注信息
- 显示在编码下方
- 斜体样式，灰色文字
- 超过 20 字自动截断并显示 "..."
- 如果没有备注则不显示

### 4. 红包风格
列表项的左侧金额区域采用红包风格：
- 红色渐变背景（与图片生成一致）
- 白色文字
- 圆角设计

## 📱 界面布局

### 列表项结构
```
┌────────────────────────────────────────┐
│ ┌─────────┐  编码: AB**23             │
│ │  ¥50   │  满100元可用               │
│ │ XX商城  │  ✅ 未使用                │
│ └─────────┘  🕐 2024-01-15 10:30     │
└────────────────────────────────────────┘
```

### 折扣券列表项
```
┌────────────────────────────────────────┐
│ ┌─────────┐  编码: XY**89             │
│ │ 8.5折  │  全场通用                  │
│ │ YY超市  │  ✅ 未使用                │
│ └─────────┘  🕐 2024-01-15 09:15     │
└────────────────────────────────────────┘
```

## 🔧 技术实现

### 排序函数
```javascript
const sortCoupons = (coupons) => {
  return [...coupons].sort((a, b) => {
    // 首先按使用状态排序（未使用在前）
    if (a.isUsed !== b.isUsed) {
      return a.isUsed ? 1 : -1;
    }
    
    // 然后按创建时间倒序（新的在前）
    const dateA = new Date(a.createdAt).getTime();
    const dateB = new Date(b.createdAt).getTime();
    return dateB - dateA;
  });
};
```

### 条件渲染
```javascript
// 金额或折扣显示
{coupon.type === 'discount' ? (
  <>
    <IonText className={styles.amount}>{coupon.discount}</IonText>
    <IonText className={styles.discountLabel}>折</IonText>
  </>
) : (
  <>
    <IonText className={styles.currency}>¥</IonText>
    <IonText className={styles.amount}>{coupon.amount}</IonText>
  </>
)}

// 公司名称（可选）
{coupon.companyName && (
  <div className={styles.companyName}>
    <IonText className={styles.companyText}>{coupon.companyName}</IonText>
  </div>
)}

// 备注信息（可选，自动截断）
{coupon.note && (
  <div className={styles.noteSection}>
    <IonText className={styles.noteText}>
      {coupon.note.length > 20 
        ? `${coupon.note.substring(0, 20)}...` 
        : coupon.note}
    </IonText>
  </div>
)}
```

## 🎨 样式更新

### 红包风格渐变
```css
.leftSection {
  background: linear-gradient(135deg, #DC2626 0%, #EF4444 50%, #F87171 100%);
}
```

### 新增样式类
- `.discountLabel` - 折扣标签样式
- `.companyName` - 公司名称容器
- `.companyText` - 公司名称文字
- `.noteSection` - 备注区域
- `.noteText` - 备注文字（斜体）

### 深色模式支持
```css
@media (prefers-color-scheme: dark) {
  .codeValue {
    color: #e5e7eb;
  }
  
  .noteText {
    color: #9ca3af;
  }
}
```

## 📊 数据兼容性

### 向后兼容
旧版优惠券（没有 type 字段）会被自动识别为金额券：
```javascript
// 旧数据
{
  code: "ABC123",
  amount: 50,
  // 没有 type 字段
}

// 自动处理为金额券
coupon.type === 'discount' // false
// 显示为 ¥50
```

### 可选字段处理
- `companyName` - 如果为空或 undefined，不显示
- `note` - 如果为空或 undefined，不显示
- `discount` - 仅折扣券使用

## 🔍 详情页面更新

详情页面也同步更新：
- 支持显示折扣券
- 显示公司名称
- 显示完整备注信息（不截断）
- 红包风格背景

## 📝 用户体验优化

### 信息层次
1. **最重要**：金额/折扣（大字号，醒目）
2. **重要**：编码、状态（中等字号）
3. **次要**：公司名称、备注、时间（小字号）

### 视觉引导
- ✅ 未使用优惠券在顶部，容易找到
- 🎨 红包风格吸引注意力
- 📝 备注信息提供额外说明
- 🏢 公司名称增强品牌识别

### 交互优化
- 点击任意优惠券查看完整详情
- 悬停效果提供视觉反馈
- 状态徽章清晰标识使用状态

## 🚀 性能优化

### 排序性能
- 使用原生 Array.sort()
- 创建新数组避免修改原数据
- 时间复杂度：O(n log n)

### 渲染优化
- 条件渲染减少 DOM 节点
- 使用 CSS 类而非内联样式
- 避免不必要的重新渲染

## 📱 响应式设计

所有更新完全支持：
- 移动端（小屏幕）
- 平板（中等屏幕）
- 桌面端（大屏幕）
- 深色模式
- 浅色模式
