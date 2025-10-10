// 数据存储服务
import AppSdk from '@morphixai/app-sdk';
import { reportError } from '@morphixai/lib';

export class DataService {
  static COLLECTION = 'soulTestRecords';

  // 保存测试记录
  static async saveTestRecord(testData) {
    try {
      const record = {
        ...testData,
        createdAt: Date.now(),
        updatedAt: Date.now()
      };

      const result = await AppSdk.appData.createData({
        collection: this.COLLECTION,
        data: record
      });

      console.log('测试记录保存成功:', result);
      return result;
    } catch (error) {
      await reportError(error, 'JavaScriptError', {
        component: 'DataService',
        action: 'saveTestRecord'
      });
      
      // 降级到 localStorage
      try {
        const history = JSON.parse(localStorage.getItem('testHistory') || '[]');
        const record = {
          id: Date.now().toString(),
          ...testData,
          createdAt: Date.now()
        };
        history.unshift(record);
        if (history.length > 50) {
          history.splice(50);
        }
        localStorage.setItem('testHistory', JSON.stringify(history));
        return record;
      } catch (localError) {
        console.error('本地存储也失败:', localError);
        return null;
      }
    }
  }

  // 获取所有测试记录
  static async getAllRecords() {
    try {
      const result = await AppSdk.appData.queryData({
        collection: this.COLLECTION,
        query: []
      });

      // 按时间倒序排序
      const sorted = (result || []).sort((a, b) => 
        (b.createdAt || 0) - (a.createdAt || 0)
      );

      console.log('获取测试记录成功，数量:', sorted.length);
      return sorted;
    } catch (error) {
      await reportError(error, 'JavaScriptError', {
        component: 'DataService',
        action: 'getAllRecords'
      });

      // 降级到 localStorage
      try {
        const history = JSON.parse(localStorage.getItem('testHistory') || '[]');
        return history;
      } catch (localError) {
        console.error('本地存储读取失败:', localError);
        return [];
      }
    }
  }

  // 删除测试记录
  static async deleteRecord(id) {
    try {
      const result = await AppSdk.appData.deleteData({
        collection: this.COLLECTION,
        id: id
      });

      console.log('删除记录成功:', id);
      return result.success;
    } catch (error) {
      await reportError(error, 'JavaScriptError', {
        component: 'DataService',
        action: 'deleteRecord',
        recordId: id
      });

      // 降级到 localStorage
      try {
        const history = JSON.parse(localStorage.getItem('testHistory') || '[]');
        const filtered = history.filter(record => record.id !== id);
        localStorage.setItem('testHistory', JSON.stringify(filtered));
        return true;
      } catch (localError) {
        console.error('本地存储删除失败:', localError);
        return false;
      }
    }
  }

  // 保存用户偏好设置
  static savePreference(key, value) {
    try {
      localStorage.setItem(`pref_${key}`, JSON.stringify(value));
      return true;
    } catch (error) {
      console.error('保存偏好设置失败:', error);
      return false;
    }
  }

  // 获取用户偏好设置
  static getPreference(key, defaultValue = null) {
    try {
      const value = localStorage.getItem(`pref_${key}`);
      return value ? JSON.parse(value) : defaultValue;
    } catch (error) {
      console.error('获取偏好设置失败:', error);
      return defaultValue;
    }
  }
}

