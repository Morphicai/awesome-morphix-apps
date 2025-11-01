# 二维码 URL 生成规则更新

## 🔄 新的 URL 生成规则

### 规则说明
二维码 URL 根据应用信息动态生成，支持两种模式：

#### 模式 1：完整 URL（有 remoteId）
```
{origin}/app/{remoteId}?code={code}
```

#### 模式 2：仅 code（无 remoteId）
```
{code}
```

## 📋 实现逻辑

### 1. 获取 origin
```javascript
const origin = window.location.origin;
// 例如: https://example.com
```

**说明**：
- 只获取协议 + 域名 + 端口
- 不包含路径部分
- `window.location.origin` 自动处理

### 2. 获取 remoteId
```javascript
try {
  const appInfo = await AppSdk.app.getAppInfo();
  if (appInfo && appInfo.remoteId) {
    remoteId = appInfo.remoteId;
  }
} catch (error) {
  // 获取失败，remoteId 为 null
}
```

**说明**：
- 调用 `AppSdk.app.getAppInfo()`
- 返回对象包含 `remoteId` 字段
- 如果调用失败或不包含，remoteId 为 null

### 3. 生成最终 URL
```javascript
if (remoteId) {
  // 有 remoteId
  qrCodeUrl = `${origin}/app/${remoteId}?code=${code}`;
} else {
  // 无 remoteId
  qrCodeUrl = code;
}
```

## 🎯 使用场景

### 场景 1：在 MorphixAI 应用内
```javascript
// AppSdk.app.getAppInfo() 返回
{
  remoteId: "abc123xyz"
}

// 生成的二维码 URL
https://morphixai.com/app/abc123xyz?code=XYZ789
```

### 场景 2：独立部署或开发环境
```javascript
// AppSdk.app.getAppInfo() 失败或无 remoteId

// 生成的二维码 URL
XYZ789
```

### 场景 3：自定义域名
```javascript
// origin: https://my-coupon-app.com
// remoteId: "def456"

// 生成的二维码 URL
https://my-coupon-app.com/app/def456?code=ABC123
```

## 💡 优势

### 灵活性
- ✅ 支持 MorphixAI 平台应用
- ✅ 支持独立部署
- ✅ 支持开发环境
- ✅ 自动适配不同场景

### 兼容性
- ✅ 获取失败时降级到 code
- ✅ 不影响现有功能
- ✅ 向后兼容

### 可追踪性
- ✅ 完整 URL 便于分析
- ✅ 可以追踪来源
- ✅ 支持应用间跳转

## 🔧 技术实现

### _generateQRCodeUrl 方法
```javascript
async _generateQRCodeUrl(code) {
  try {
    // 1. 获取 origin
    const origin = window.location.origin;

    // 2. 获取 remoteId
    let remoteId = null;
    try {
      const appInfo = await AppSdk.app.getAppInfo();
      if (appInfo && appInfo.remoteId) {
        remoteId = appInfo.remoteId;
      }
    } catch (error) {
      console.warn('获取 app 信息失败:', error);
    }

    // 3. 生成 URL
    if (remoteId) {
      return `${origin}/app/${remoteId}?code=${code}`;
    } else {
      return code;
    }
  } catch (error) {
    console.error('生成二维码 URL 失败:', error);
    return code; // 失败时返回 code
  }
}
```

### 调用方式
```javascript
// 在 _drawQRCode 中调用
const qrCodeUrl = await this._generateQRCodeUrl(code);

// 生成二维码
const qrDataUrl = await QRCode.default.toDataURL(qrCodeUrl, {
  width: size,
  margin: 1,
  color: {
    dark: '#000000',
    light: '#FFFFFF'
  }
});
```

## 📊 URL 示例

### 示例 1：MorphixAI 平台
```
输入: code = "ABC123"
AppInfo: { remoteId: "morphix-app-001" }
输出: https://morphixai.com/app/morphix-app-001?code=ABC123
```

### 示例 2：本地开发
```
输入: code = "DEF456"
AppInfo: 获取失败
输出: DEF456
```

### 示例 3：自定义域名
```
输入: code = "GHI789"
Origin: https://coupon.example.com
AppInfo: { remoteId: "my-app" }
输出: https://coupon.example.com/app/my-app?code=GHI789
```

## 🎉 更新效果

### 用户体验
- ✅ 扫码后直接跳转到应用
- ✅ 自动识别优惠券
- ✅ 无需手动输入

### 开发体验
- ✅ 自动适配环境
- ✅ 无需手动配置
- ✅ 降级策略完善

### 运维体验
- ✅ 支持多环境部署
- ✅ 便于追踪和分析
- ✅ 灵活的 URL 结构

所有功能已完成并通过诊断检查！🎉
