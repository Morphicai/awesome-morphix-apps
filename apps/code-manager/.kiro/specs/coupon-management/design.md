# 设计文档

## 概述

优惠券码管理工具是一个基于React的单页应用，使用本地存储管理优惠券数据，通过HTML5 Canvas生成优惠券图片。系统包含优惠券创建、图片生成、验券验证三个核心模块，采用组件化架构设计。

## 架构

### 系统架构图

```
┌─────────────────────────────────────────────────────────────┐
│                    优惠券管理系统                              │
├─────────────────────────────────────────────────────────────┤
│  UI层                                                       │
│  ┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐ │
│  │  创建优惠券页面   │ │  验券页面        │ │  导航组件        │ │
│  └─────────────────┘ └─────────────────┘ └─────────────────┘ │
├─────────────────────────────────────────────────────────────┤
│  业务逻辑层                                                  │
│  ┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐ │
│  │  优惠券服务      │ │  图片生成服务    │ │  验证服务        │ │
│  └─────────────────┘ └─────────────────┘ └─────────────────┘ │
├─────────────────────────────────────────────────────────────┤
│  数据层                                                      │
│  ┌─────────────────┐ ┌─────────────────┐                   │
│  │  本地存储管理    │ │  优惠券数据模型  │                   │
│  └─────────────────┘ └─────────────────┘                   │
└─────────────────────────────────────────────────────────────┘
```

### 技术栈

- **前端框架**: React 19.0.0 + Ionic React 8.6.2
- **UI组件**: Ionic React 组件 + MorphixAI 组件库
- **状态管理**: React Hooks (useState, useEffect)
- **数据持久化**: AppSdk.appData（云端数据存储）
- **图片生成**: HTML5 Canvas API
- **图片保存**: AppSdk.fileSystem.saveImageToAlbum（保存到相册）
- **路由**: React Router 5.3.4 (IonReactHashRouter)
- **样式**: CSS Modules（项目标准）
- **图标**: Ionicons 7.4.0
- **构建工具**: MorphixAI 构建系统

## 组件和接口

### 核心组件

#### 1. CouponCreator 组件
```javascript
interface CouponCreatorProps {
  onCouponCreated: (coupon: Coupon) => void;
}

interface CouponCreatorState {
  amount: string;
  isGenerating: boolean;
  generatedCoupon: Coupon | null;
}
```

#### 2. CouponValidator 组件
```javascript
interface CouponValidatorProps {
  onValidationComplete: (result: ValidationResult) => void;
}

interface CouponValidatorState {
  inputCode: string;
  validationResult: ValidationResult | null;
  isValidating: boolean;
  showConfirmDialog: boolean;
}
```

#### 3. CouponImageGenerator 组件
```javascript
interface CouponImageGeneratorProps {
  coupon: Coupon;
  onImageGenerated: (imageUrl: string) => void;
}
```

#### 4. ConfirmationDialog 组件
```javascript
interface ConfirmationDialogProps {
  isOpen: boolean;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
}
```

### 服务接口

#### CouponService
```javascript
interface CouponService {
  generateCouponCode(): string;
  createCoupon(amount: number): Coupon;
  saveCoupon(coupon: Coupon): void;
  getCoupon(code: string): Coupon | null;
  validateCoupon(code: string): ValidationResult;
  useCoupon(code: string): boolean;
  getAllCoupons(): Coupon[];
}
```

#### StorageService (基于AppSdk.appData)
```javascript
interface StorageService {
  saveCoupon(coupon: Coupon): Promise<Coupon>;
  getCoupon(code: string): Promise<Coupon | null>;
  getAllCoupons(): Promise<Coupon[]>;
  updateCoupon(code: string, updates: Partial<Coupon>): Promise<Coupon | null>;
  deleteCoupon(code: string): Promise<boolean>;
}
```

#### ImageService (基于AppSdk.fileSystem)
```javascript
interface ImageService {
  generateCouponImage(coupon: Coupon): Promise<string>;
  saveImageToAlbum(base64Data: string, filename?: string): Promise<boolean>;
}
```

## 数据模型

### Coupon 模型
```javascript
interface Coupon {
  id: string;
  code: string;          // 6位唯一编码
  amount: number;        // 优惠券金额
  isUsed: boolean;       // 使用状态
  createdAt: Date;       // 创建时间
  usedAt?: Date;         // 使用时间
}
```

### ValidationResult 模型
```javascript
interface ValidationResult {
  isValid: boolean;
  coupon?: Coupon;
  message: string;
  canUse: boolean;
}
```

### CouponImageConfig 模型
```javascript
interface CouponImageConfig {
  width: number;
  height: number;
  backgroundColor: string;
  textColor: string;
  fontSize: {
    amount: number;
    code: number;
    label: number;
  };
  padding: number;
}
```

## 错误处理

### 错误类型定义
```javascript
enum CouponErrorType {
  INVALID_AMOUNT = 'INVALID_AMOUNT',
  CODE_NOT_FOUND = 'CODE_NOT_FOUND',
  COUPON_ALREADY_USED = 'COUPON_ALREADY_USED',
  STORAGE_ERROR = 'STORAGE_ERROR',
  IMAGE_GENERATION_ERROR = 'IMAGE_GENERATION_ERROR'
}

interface CouponError {
  type: CouponErrorType;
  message: string;
  details?: any;
}
```

### 错误处理策略

1. **输入验证错误**: 在UI层显示即时反馈
2. **存储错误**: 显示用户友好的错误消息，提供重试选项
3. **图片生成错误**: 降级到文本显示，提供重新生成选项
4. **验证错误**: 清晰显示错误原因和建议操作

## 测试策略

### 单元测试
- **组件测试**: 使用React Testing Library测试组件渲染和交互
- **服务测试**: 测试CouponService、StorageService、ImageService的核心功能
- **工具函数测试**: 测试代码生成、验证等纯函数

### 集成测试
- **端到端流程**: 创建优惠券 → 生成图片 → 验证使用的完整流程
- **存储集成**: 测试数据持久化和恢复
- **图片生成集成**: 测试Canvas API集成

### 测试覆盖重点
1. 6位编码生成的唯一性
2. 优惠券状态管理的正确性
3. 本地存储的数据完整性
4. 图片生成的稳定性
5. 验券流程的安全性

### 测试数据管理
- 使用模拟数据进行测试
- 测试前清理localStorage
- 提供测试用的优惠券数据工厂函数

## 实现细节

### 6位编码生成算法
```javascript
function generateCouponCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}
```

### Canvas图片生成配置
- 画布尺寸: 400x200像素
- 背景色: 渐变色（#4F46E5 到 #7C3AED）
- 字体: 系统默认字体
- 布局: 居中对齐，金额突出显示

### 数据存储策略（基于AppSdk.appData）
- 集合名称: 'coupons'
- 数据格式: 每张优惠券作为独立记录存储
- 主键策略: 使用优惠券编码作为记录ID
- 查询方式: 支持按编码查询和状态筛选
- 云端同步: 自动云端存储，跨设备同步

### 图片保存策略（基于AppSdk.fileSystem）
- 图片格式: PNG格式，Base64编码
- 保存位置: 设备相册（通过saveImageToAlbum）
- 文件命名: 优惠券编码_时间戳.png
- 用户体验: 保存成功后显示Toast提示

### 应用架构设计

基于项目规范，采用Tab布局组织多功能模块：

```
优惠券管理应用 (IonTabs)
├── 创建优惠券 Tab (IonTab tab="create")
│   ├── PageHeader title="创建优惠券"
│   └── IonContent (优惠券创建表单和图片生成)
└── 验券管理 Tab (IonTab tab="validate") 
    ├── PageHeader title="验券管理"
    └── IonContent (验券输入和历史记录)
```

**Tab导航设计**：
- 使用 `IonTabs` + `IonTab` 实现无刷新切换
- 每个Tab使用 `IonPage` 作为容器
- 使用 `PageHeader` 组件设置页面标题
- Tab图标使用 Ionicons (add/addOutline, checkmarkCircle/checkmarkCircleOutline)