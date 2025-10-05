# 长图分享功能使用说明

## 📸 功能概述

基于 **@zumer/snapdom** 库实现的高质量长图分享功能，可以将应用内容转换为精美的分享图片。

## ✨ 主要特性

- ✅ **DOM 转图片**：使用 snapdom 将 DOM 元素直接转换为高清图片
- ✅ **实时预览**：生成图片后立即在模态框中预览
- ✅ **一键下载**：支持直接下载到本地
- ✅ **精美模板**：专业设计的分享图模板
- ✅ **高清输出**：2倍分辨率，确保图片清晰

## 🎨 实现的页面

### 1. 行动蓝图分享（SolutionPage）
- 包含：导师信息、核心议题、解决方案详情
- 渐变背景设计，突出视觉效果

### 2. 董事会报告分享（BoardReportPage）
- 包含：领航人分析、成员意见、董事会决议
- 专业商务风格设计

## 🛠️ 技术实现

### 核心依赖
**使用 remoteImport 动态加载**
```javascript
// 无需 npm 安装，通过 remoteImport 自动从 CDN 加载
const snapDOM = await remoteImport('@zumer/snapdom');
```

### 关键组件

1. **ShareTemplate.jsx**
   - 可复用的分享模板组件
   - 支持多种类型（solution、board）
   - 固定尺寸（750px 宽度）适合移动端展示

2. **ShareImageModal.jsx**
   - 图片预览和下载的模态框
   - 提供友好的用户提示
   - 支持长按保存、点击下载

3. **ShareService.js**
   - 核心服务类
   - `generateImageFromDOM()` - 将 DOM 转换为图片
   - `downloadImage()` - 下载图片到本地

### 使用示例

```jsx
import ShareTemplate from '../ShareTemplate';
import ShareImageModal from '../modals/ShareImageModal';
import { ShareService } from '../../services/ShareService';

// 在组件中
const shareTemplateRef = useRef(null);
const [showShareModal, setShowShareModal] = useState(false);
const [shareImageUrl, setShareImageUrl] = useState(null);

// 生成分享图
const handleShare = async () => {
  setShowShareModal(true);
  
  await new Promise(resolve => setTimeout(resolve, 100));
  
  const imageUrl = await ShareService.generateImageFromDOM(
    shareTemplateRef.current,
    {
      type: 'png',
      quality: 1,
      backgroundColor: 'transparent',
      scale: 2
    }
  );
  
  setShareImageUrl(imageUrl);
};

// JSX 中
<>
  {/* 隐藏的模板 */}
  <div style={{ position: 'absolute', left: '-9999px' }}>
    <div ref={shareTemplateRef}>
      <ShareTemplate type="solution" data={shareData} />
    </div>
  </div>
  
  {/* 预览模态框 */}
  <ShareImageModal
    isOpen={showShareModal}
    onClose={() => setShowShareModal(false)}
    imageUrl={shareImageUrl}
    fileName="分享图.png"
  />
</>
```

## 🎯 用户体验流程

1. 用户点击"生成分享长图"按钮
2. 系统自动生成高清图片（约 1-2 秒）
3. 弹出预览模态框展示生成的图片
4. 用户可以：
   - 长按图片保存
   - 点击"下载到本地"按钮
   - 关闭模态框

## 📱 适配说明

- **桌面端**：图片宽度 750px，可滚动查看
- **移动端**：自适应屏幕宽度，保持比例
- **清晰度**：2倍分辨率渲染，确保在各种设备上都清晰

## 🚀 扩展建议

如需添加新的分享类型：

1. 在 `ShareTemplate.jsx` 中添加新模板
2. 创建对应的 CSS 样式
3. 在需要的页面中集成分享功能

## 📦 核心文件清单

```
src/
├── components/
│   ├── ShareTemplate.jsx          # 分享模板组件
│   └── modals/
│       └── ShareImageModal.jsx    # 预览和下载模态框
├── services/
│   └── ShareService.js            # 分享服务（含 snapdom 集成）
└── styles/
    ├── ShareTemplate.module.css   # 模板样式
    └── ShareImageModal.module.css # 模态框样式
```

## 💡 最佳实践

1. **性能优化**：模板 DOM 放在屏幕外，避免影响页面布局
2. **等待渲染**：调用 snapdom 前等待 100ms，确保 DOM 完全渲染
3. **错误处理**：完整的 try-catch 和用户友好的错误提示
4. **清晰度**：使用 scale: 2 生成 2倍分辨率图片
5. **文件命名**：包含应用名、类型和时间戳

## 🔍 调试技巧

如果生成失败，检查：
1. shareTemplateRef.current 是否存在
2. 模板 DOM 是否正确渲染
3. 浏览器控制台是否有错误
4. snapdom 库是否正确安装

---

**开发完成日期**：2025-10-05  
**使用库**：@zumer/snapdom  
**开发者**：MorphixAI Team
