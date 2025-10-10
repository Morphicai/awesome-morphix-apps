import { create } from 'zustand';

/**
 * 测试结果状态管理 Store
 * 用于在页面间可靠地传递测试结果数据
 * 
 * 遵循 DEVELOPMENT_GUIDE.md 第 1118-1176 行的 Zustand 规范
 */
export const useTestStore = create((set, get) => ({
  // 状态
  currentTestResult: null,  // 当前测试结果
  isResultReady: false,     // 结果是否准备好
  
  // Actions
  /**
   * 设置测试结果并标记为准备好
   * @param {Object} result - 测试结果对象
   */
  setTestResult: (result) => {
    console.log('Zustand Store: 保存测试结果', result);
    set({ 
      currentTestResult: result,
      isResultReady: true
    });
  },
  
  /**
   * 获取测试结果（读取后自动清除）
   * @returns {Object|null} 测试结果对象
   */
  getAndClearResult: () => {
    const result = get().currentTestResult;
    console.log('Zustand Store: 读取并清除测试结果', result);
    set({ 
      currentTestResult: null,
      isResultReady: false
    });
    return result;
  },
  
  /**
   * 清除测试结果
   */
  clearTestResult: () => {
    console.log('Zustand Store: 清除测试结果');
    set({ 
      currentTestResult: null,
      isResultReady: false
    });
  },
  
  /**
   * 检查是否有测试结果
   * @returns {boolean}
   */
  hasResult: () => {
    return get().isResultReady && get().currentTestResult !== null;
  }
}));

