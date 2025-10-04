# MermaidService - Mermaid 加载与缓存服务

## 概述

`MermaidService` 是一个单例服务，负责管理 Mermaid.js 的不同版本，提供智能缓存和预加载功能。

## 核心功能

### 1. 版本缓存

每个加载的 Mermaid 版本会自动缓存在内存中，避免重复加载：

```javascript
// 首次加载 - 从 CDN 下载
await MermaidService.loadMermaid('11.4.1'); // ~1-2秒

// 再次加载 - 从缓存获取
await MermaidService.loadMermaid('11.4.1'); // <10ms
```

### 2. 并发控制

避免同一版本被多次并发加载：

```javascript
// 同时调用多次
const promise1 = MermaidService.loadMermaid('11.4.1');
const promise2 = MermaidService.loadMermaid('11.4.1');

// 实际只会加载一次，两个 Promise 都会得到同一个实例
const [mermaid1, mermaid2] = await Promise.all([promise1, promise2]);
// mermaid1 === mermaid2
```

### 3. 预加载

在后台预加载常用版本，提升用户体验：

```javascript
// 预加载多个版本（不会阻塞当前操作）
await MermaidService.preloadVersions(['11.0.0', '10.9.0']);
```

## API 文档

### loadMermaid(version)

加载指定版本的 Mermaid 实例。

**参数:**
- `version` (string): 版本号，如 `'11.4.1'`

**返回:**
- `Promise<Object>`: Mermaid 实例

**示例:**
```javascript
try {
    const mermaid = await MermaidService.loadMermaid('11.4.1');
    // 使用 mermaid 实例渲染图表
    await mermaid.run({ nodes: [container] });
} catch (error) {
    console.error('加载失败:', error);
}
```

### getCachedVersions()

获取所有已缓存的版本列表。

**返回:**
- `Array<string>`: 版本号数组

**示例:**
```javascript
const versions = MermaidService.getCachedVersions();
// ['11.4.1', '11.0.0']
```

### isCached(version)

检查指定版本是否已缓存。

**参数:**
- `version` (string): 版本号

**返回:**
- `boolean`: 是否已缓存

**示例:**
```javascript
if (MermaidService.isCached('11.4.1')) {
    console.log('版本已缓存，切换速度会很快');
}
```

### clearCache(version?)

清除缓存。

**参数:**
- `version` (string, 可选): 要清除的版本号。如果不传，则清除所有缓存

**示例:**
```javascript
// 清除指定版本
MermaidService.clearCache('11.4.1');

// 清除所有缓存
MermaidService.clearCache();
```

### preloadVersions(versions)

预加载多个版本（异步，不阻塞）。

**参数:**
- `versions` (Array<string>): 版本号数组

**返回:**
- `Promise<void>`

**示例:**
```javascript
// 在后台预加载常用版本
MermaidService.preloadVersions(['11.0.0', '10.9.0', '10.0.0']);
```

### getCacheStats()

获取缓存统计信息。

**返回:**
- `Object`: 缓存统计
  - `cachedCount` (number): 已缓存数量
  - `loadingCount` (number): 正在加载数量
  - `cachedVersions` (Array<string>): 已缓存的版本列表

**示例:**
```javascript
const stats = MermaidService.getCacheStats();
console.log('缓存统计:', stats);
// {
//   cachedCount: 3,
//   loadingCount: 0,
//   cachedVersions: ['11.4.1', '11.0.0', '10.9.0']
// }
```

## 使用场景

### 场景 1: 基本使用

```javascript
import MermaidService from './services/MermaidService';

// 加载并使用
const mermaid = await MermaidService.loadMermaid('11.4.1');
await mermaid.run({ nodes: [element] });
```

### 场景 2: 版本切换

```javascript
const switchVersion = async (newVersion) => {
    setLoading(true);
    
    // 加载新版本（如果已缓存，会立即返回）
    const mermaid = await MermaidService.loadMermaid(newVersion);
    
    setMermaidInstance(mermaid);
    setLoading(false);
};
```

### 场景 3: 应用初始化优化

```javascript
// 先加载当前版本
await MermaidService.loadMermaid(currentVersion);

// 延迟预加载其他版本（不阻塞用户操作）
setTimeout(() => {
    MermaidService.preloadVersions(['11.0.0', '10.9.0']);
}, 2000);
```

### 场景 4: 缓存状态监控

```javascript
// 定期检查缓存状态
setInterval(() => {
    const stats = MermaidService.getCacheStats();
    console.log('缓存版本:', stats.cachedVersions);
}, 10000);
```

## 性能优化

### 内存管理

缓存会占用内存，但通常不会超过 10-20MB（每个版本约 3-5MB）。如果需要，可以手动清除：

```javascript
// 清除不常用的版本
if (MermaidService.getCacheStats().cachedCount > 5) {
    MermaidService.clearCache('10.0.0');
}
```

### 预加载策略

建议在应用空闲时预加载：

```javascript
// 在用户完成初次渲染后预加载
useEffect(() => {
    if (firstRenderComplete) {
        setTimeout(() => {
            MermaidService.preloadVersions(commonVersions);
        }, 3000); // 延迟 3 秒
    }
}, [firstRenderComplete]);
```

## 错误处理

所有方法都会自动进行错误上报，并抛出友好的错误信息：

```javascript
try {
    await MermaidService.loadMermaid('invalid-version');
} catch (error) {
    // error.message: "加载 Mermaid vinvalid-version 失败: ..."
    console.error(error.message);
}
```

## 调试

Service 会在控制台输出关键操作日志：

- `从缓存加载 Mermaid vX.X.X` - 命中缓存
- `开始加载 Mermaid vX.X.X` - 开始下载
- `Mermaid vX.X.X 加载成功` - 加载完成
- `清除 Mermaid vX.X.X 缓存` - 缓存清除

## 最佳实践

1. **单例使用** - Service 已导出单例，不要创建新实例
2. **预加载优先** - 在应用初始化时预加载常用版本
3. **缓存监控** - 定期检查缓存状态，避免内存溢出
4. **错误处理** - 始终使用 try-catch 处理加载错误
5. **版本管理** - 统一管理版本列表，避免加载不存在的版本

## 技术细节

- **加载方式**: 使用 `remoteImport` 动态加载 ESM 模块
- **缓存结构**: Map<version, mermaidInstance>
- **并发控制**: Map<version, loadingPromise>
- **初始化**: 加载后自动调用 `mermaid.initialize()`

---

**提示**: 此服务遵循 MorphixAI 开发规范，使用 `reportError` 进行错误上报。

