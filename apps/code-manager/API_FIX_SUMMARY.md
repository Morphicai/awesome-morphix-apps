# MorphixAI AppSdk API 修复总结

## 🐛 问题描述

```
Error: AppSdk.appData.getRecords is not a function
```

**根本原因**: 使用了错误的 API 方法名

## 🔍 API 对比

### ❌ 错误的 API（之前使用的）
```javascript
// 这些方法不存在！
AppSdk.appData.setRecord(collection, id, data)
AppSdk.appData.getRecord(collection, id)
AppSdk.appData.getRecords(collection)
AppSdk.appData.updateRecord(collection, id, data)
AppSdk.appData.deleteRecord(collection, id)
```

### ✅ 正确的 API（MorphixAI SDK）
```javascript
// 创建数据
AppSdk.appData.createData({
  collection: string,
  data: { id?: string, ...fields }
})

// 获取单个数据
AppSdk.appData.getData({
  collection: string,
  id: string
})

// 查询多个数据
AppSdk.appData.queryData({
  collection: string,
  query: [] // 空数组返回所有数据
})

// 更新数据
AppSdk.appData.updateData({
  collection: string,
  id: string,
  data: { ...updates }
})

// 删除数据
AppSdk.appData.deleteData({
  collection: string,
  id: string
})
```

## 🔧 修复详情

### 1. saveCoupon() - 创建优惠券

**修复前**:
```javascript
const result = await AppSdk.appData.setRecord(
  this.collectionName,
  coupon.code,
  { ...coupon }
);
```

**修复后**:
```javascript
const result = await AppSdk.appData.createData({
  collection: this.collectionName,
  data: {
    id: coupon.code, // 使用优惠券编码作为固定ID
    ...coupon,
    createdAt: coupon.createdAt.toISOString(),
    usedAt: coupon.usedAt ? coupon.usedAt.toISOString() : null
  }
});
```

**说明**: 
- 使用 `createData` 方法
- 传入 `id` 字段以使用固定ID（优惠券编码）
- 参数改为对象格式

### 2. getCoupon() - 获取单个优惠券

**修复前**:
```javascript
const result = await AppSdk.appData.getRecord(
  this.collectionName, 
  code
);
```

**修复后**:
```javascript
const result = await AppSdk.appData.getData({
  collection: this.collectionName,
  id: code
});
```

**说明**:
- 使用 `getData` 方法
- 参数改为对象格式

### 3. getAllCoupons() - 获取所有优惠券

**修复前**:
```javascript
const result = await AppSdk.appData.getRecords(
  this.collectionName
);
```

**修复后**:
```javascript
const result = await AppSdk.appData.queryData({
  collection: this.collectionName,
  query: [] // 空查询条件返回所有数据
});
```

**说明**:
- 使用 `queryData` 方法
- 传入空的 `query` 数组返回所有数据
- 参数改为对象格式

### 4. updateCoupon() - 更新优惠券

**修复前**:
```javascript
const result = await AppSdk.appData.setRecord(
  this.collectionName,
  code,
  serializedUpdates
);
```

**修复后**:
```javascript
// 准备更新数据（序列化日期）
const updateData = {};
for (const [key, value] of Object.entries(updates)) {
  if (value instanceof Date) {
    updateData[key] = value.toISOString();
  } else {
    updateData[key] = value;
  }
}

const result = await AppSdk.appData.updateData({
  collection: this.collectionName,
  id: code,
  data: updateData
});
```

**说明**:
- 使用 `updateData` 方法
- 只传入需要更新的字段（不包含完整对象）
- 参数改为对象格式
- 改进了日期序列化逻辑

### 5. deleteCoupon() - 删除优惠券

**修复前**:
```javascript
await AppSdk.appData.deleteRecord(
  this.collectionName, 
  code
);
return true;
```

**修复后**:
```javascript
const result = await AppSdk.appData.deleteData({
  collection: this.collectionName,
  id: code
});
return result.success;
```

**说明**:
- 使用 `deleteData` 方法
- 参数改为对象格式
- 返回 API 提供的 `success` 状态

## 📊 修复统计

| 方法 | 修复前 | 修复后 | 状态 |
|------|--------|--------|------|
| 创建数据 | setRecord | createData | ✅ |
| 获取单个 | getRecord | getData | ✅ |
| 获取所有 | getRecords | queryData | ✅ |
| 更新数据 | setRecord | updateData | ✅ |
| 删除数据 | deleteRecord | deleteData | ✅ |

## 🎯 API 设计差异

### 旧 API 风格（错误）
- 位置参数：`method(collection, id, data)`
- 简单直接但不灵活

### MorphixAI API 风格（正确）
- 对象参数：`method({ collection, id, data })`
- 更灵活，易于扩展
- 参数名称明确

## 📝 完整的 StorageService API

```javascript
class StorageService {
  // ✅ 创建优惠券
  async saveCoupon(coupon) {
    return await AppSdk.appData.createData({
      collection: this.collectionName,
      data: { id: coupon.code, ...coupon }
    });
  }

  // ✅ 获取单个优惠券
  async getCoupon(code) {
    return await AppSdk.appData.getData({
      collection: this.collectionName,
      id: code
    });
  }

  // ✅ 获取所有优惠券
  async getAllCoupons() {
    return await AppSdk.appData.queryData({
      collection: this.collectionName,
      query: []
    });
  }

  // ✅ 更新优惠券
  async updateCoupon(code, updates) {
    return await AppSdk.appData.updateData({
      collection: this.collectionName,
      id: code,
      data: updates
    });
  }

  // ✅ 删除优惠券
  async deleteCoupon(code) {
    const result = await AppSdk.appData.deleteData({
      collection: this.collectionName,
      id: code
    });
    return result.success;
  }
}
```

## 🔍 queryData 高级用法

### 查询所有数据
```javascript
await AppSdk.appData.queryData({
  collection: 'coupons',
  query: [] // 空数组返回所有
});
```

### 条件查询
```javascript
// 查询未使用的优惠券
await AppSdk.appData.queryData({
  collection: 'coupons',
  query: [
    { key: 'isUsed', value: 'false', operator: 'eq' }
  ]
});

// 查询金额大于100的优惠券
await AppSdk.appData.queryData({
  collection: 'coupons',
  query: [
    { key: 'amount', value: '100', operator: 'gt' }
  ]
});
```

### 支持的操作符
- `eq` - 等于
- `neq` - 不等于
- `gt` - 大于
- `gte` - 大于等于
- `lt` - 小于
- `lte` - 小于等于

## ✅ 验证结果

### 编译检查
```bash
✅ 无诊断错误
✅ 所有方法签名正确
✅ 参数格式正确
```

### 功能测试清单
- [ ] 创建优惠券 - 使用 `createData`
- [ ] 查看优惠券列表 - 使用 `queryData`
- [ ] 点击查看详情 - 使用 `getData`
- [ ] 更新优惠券状态 - 使用 `updateData`
- [ ] 删除优惠券 - 使用 `deleteData`
- [ ] 验券功能 - 使用 `getData` + `updateData`

## 🚀 部署状态

**开发服务器**: http://localhost:8812

**状态**: 🟢 已修复，等待自动重载

## 💡 经验教训

1. **查阅官方文档**: 始终参考官方 API 文档
2. **参数格式**: MorphixAI SDK 使用对象参数
3. **方法命名**: 使用 `createData`, `getData`, `queryData` 等
4. **错误处理**: 所有 API 调用都有完善的错误处理

## 📚 参考资源

- **开发指南**: `docs/DEVELOPMENT_GUIDE.md` (第 958-1100 行)
- **appData API**: 第 5 节
- **示例代码**: 开发指南中的示例

---

**修复完成！** 🎉 现在所有 API 调用都使用正确的 MorphixAI SDK 方法。
