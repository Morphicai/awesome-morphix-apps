import AppSdk from '@morphixai/app-sdk';
import { reportError } from '@morphixai/lib';

// 通用的数据获取函数，带有存在性检查
export const getDataSafely = async (collection, id) => {
  try {
    const data = await AppSdk.appData.getData({
      collection,
      id
    });
    return data;
  } catch (error) {
    if (error.message && error.message.includes('Data not found')) {
      console.log(`Data not found for ${collection}:${id}`);
      return null;
    }
    console.error(`Error getting data for ${collection}:${id}:`, error);
    await reportError(error, 'JavaScriptError', { 
      component: 'DataHelpers',
      context: `getData-${collection}-${id}`
    });
    return null;
  }
};

// 通用的数据创建函数，带有错误处理
export const createDataSafely = async (collection, data, id = null) => {
  try {
    const payload = {
      collection,
      data: id ? { id, ...data } : data
    };
    
    const result = await AppSdk.appData.createData(payload);
    console.log(`Successfully created data for ${collection}:`, result);
    return result;
  } catch (error) {
    console.error(`Error creating data for ${collection}:`, error);
    await reportError(error, 'JavaScriptError', { 
      component: 'DataHelpers',
      context: `createData-${collection}`
    });
    return null;
  }
};

// 通用的数据更新函数，带有存在性检查
export const updateDataSafely = async (collection, id, data) => {
  try {
    // 先检查数据是否存在
    const existingData = await getDataSafely(collection, id);
    
    if (existingData) {
      // 数据存在，更新
      const result = await AppSdk.appData.updateData({
        collection,
        id,
        data
      });
      console.log(`Successfully updated data for ${collection}:${id}`);
      return result;
    } else {
      // 数据不存在，创建
      const result = await createDataSafely(collection, data, id);
      console.log(`Created new data for ${collection}:${id} (update fallback)`);
      return result;
    }
  } catch (error) {
    console.error(`Error updating data for ${collection}:${id}:`, error);
    await reportError(error, 'JavaScriptError', { 
      component: 'DataHelpers',
      context: `updateData-${collection}-${id}`
    });
    return null;
  }
};

// 通用的数据删除函数，带有错误处理
export const deleteDataSafely = async (collection, id) => {
  try {
    const result = await AppSdk.appData.deleteData({
      collection,
      id
    });
    console.log(`Successfully deleted data for ${collection}:${id}`);
    return result;
  } catch (error) {
    console.error(`Error deleting data for ${collection}:${id}:`, error);
    await reportError(error, 'JavaScriptError', { 
      component: 'DataHelpers',
      context: `deleteData-${collection}-${id}`
    });
    return null;
  }
};

// 查询数据的安全函数
export const queryDataSafely = async (collection, query = []) => {
  try {
    const result = await AppSdk.appData.queryData({
      collection,
      query
    });
    return Array.isArray(result) ? result : [];
  } catch (error) {
    console.error(`Error querying data for ${collection}:`, error);
    await reportError(error, 'JavaScriptError', { 
      component: 'DataHelpers',
      context: `queryData-${collection}`
    });
    return [];
  }
};

// 初始化默认数据的函数
export const initializeDefaultData = async () => {
  console.log("开始初始化默认数据...");
  
  const defaultDataSets = [
    {
      collection: 'timer',
      id: 'current',
      data: {
        duration: 25 * 60,
        shortBreak: 5 * 60,
        longBreak: 15 * 60,
        cycles: 4,
        currentCycle: 1,
        isRunning: false,
        remainingTime: 25 * 60,
        mode: "focus",
        completedPomodoros: 0,
        totalFocusTime: 0,
        plants: [],
        lastUpdated: Date.now()
      }
    },
    {
      collection: 'tasks',
      id: 'list',
      data: {
        items: []
      }
    },
    {
      collection: 'stats',
      id: 'history',
      data: {
        completed: [],
        plants: []
      }
    }
  ];

  for (const dataSet of defaultDataSets) {
    try {
      // 检查数据是否已存在
      const existingData = await getDataSafely(dataSet.collection, dataSet.id);
      
      if (!existingData) {
        console.log(`创建默认数据: ${dataSet.collection}:${dataSet.id}`);
        await createDataSafely(dataSet.collection, dataSet.data, dataSet.id);
      } else {
        console.log(`数据已存在: ${dataSet.collection}:${dataSet.id}`);
      }
    } catch (error) {
      console.error(`初始化 ${dataSet.collection}:${dataSet.id} 失败:`, error);
    }
  }
  
  console.log("默认数据初始化完成");
};

// 安全获取计时器数据的函数
export const getTimerDataSafely = async () => {
  try {
    // 先检查数据是否存在
    let timerData;
    try {
      timerData = await AppSdk.appData.getData({
        collection: 'timer',
        id: 'current'
      });
    } catch (error) {
      // 如果不存在，创建默认数据
      const defaultData = {
        duration: 25 * 60,
        shortBreak: 5 * 60,
        longBreak: 15 * 60,
        cycles: 4,
        currentCycle: 1,
        isRunning: false,
        remainingTime: 25 * 60,
        mode: "focus",
        completedPomodoros: 0,
        totalFocusTime: 0,
        plants: [],
        lastUpdated: Date.now()
      };
      
        timerData = await AppSdk.appData.createData({
          collection: 'timer',
          data: { id: 'current', ...defaultData }
        });
    }
    return timerData;
  } catch (error) {
    console.error("获取计时器数据失败:", error);
    await reportError(error, 'JavaScriptError', { 
      component: 'DataHelpers',
      context: 'getTimerDataSafely'
    });
    // 返回一个默认对象，防止应用崩溃
    return {
      duration: 25 * 60,
      shortBreak: 5 * 60,
      longBreak: 15 * 60,
      cycles: 4,
      currentCycle: 1,
      isRunning: false,
      remainingTime: 25 * 60,
      mode: "focus",
      completedPomodoros: 0,
      totalFocusTime: 0,
      plants: []
    };
  }
};