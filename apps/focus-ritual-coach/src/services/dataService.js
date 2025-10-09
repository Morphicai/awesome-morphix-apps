import AppSdk from '@morphixai/app-sdk';
import { reportError } from '@morphixai/lib';

/**
 * 数据服务 - 管理所有应用数据的存储和读取
 */

// 数据集合名称
const COLLECTIONS = {
  SETTINGS: 'settings',
  RITUAL_HISTORY: 'ritual_history',
  FOCUS_SESSIONS: 'focus_sessions',
};

/**
 * 初始化默认设置
 */
export async function initializeSettings() {
  try {
    const existing = await AppSdk.appData.getData({
      collection: COLLECTIONS.SETTINGS,
      id: 'ritual',
    });

    if (!existing) {
      await AppSdk.appData.createData({
        collection: COLLECTIONS.SETTINGS,
        data: {
          id: 'ritual',
          ritualTime: 'morning', // morning, afternoon, evening
          breathDuration: 180, // 3分钟
          focusDuration: 1500, // 25分钟
          soundEnabled: true,
          reminderEnabled: true,
          createdAt: Date.now(),
        },
      });
    }

    return existing || await getSettings();
  } catch (error) {
    await reportError(error, 'JavaScriptError', {
      service: 'dataService',
      action: 'initializeSettings',
    });
    return null;
  }
}

/**
 * 获取设置
 */
export async function getSettings() {
  try {
    const data = await AppSdk.appData.getData({
      collection: COLLECTIONS.SETTINGS,
      id: 'ritual',
    });
    return data;
  } catch (error) {
    await reportError(error, 'JavaScriptError', {
      service: 'dataService',
      action: 'getSettings',
    });
    return null;
  }
}

/**
 * 更新设置
 */
export async function updateSettings(updates) {
  try {
    await AppSdk.appData.updateData({
      collection: COLLECTIONS.SETTINGS,
      id: 'ritual',
      data: {
        ...updates,
        updatedAt: Date.now(),
      },
    });
    return true;
  } catch (error) {
    await reportError(error, 'JavaScriptError', {
      service: 'dataService',
      action: 'updateSettings',
    });
    return false;
  }
}

/**
 * 保存仪式历史记录
 */
export async function saveRitualHistory(ritual) {
  try {
    const id = `ritual_${Date.now()}`;
    await AppSdk.appData.createData({
      collection: COLLECTIONS.RITUAL_HISTORY,
      data: {
        id,
        emotion: ritual.emotion,
        energy: ritual.energy,
        note: ritual.note,
        tasks: ritual.tasks,
        aiAdvice: ritual.aiAdvice,
        timestamp: Date.now(),
      },
    });
    return id;
  } catch (error) {
    await reportError(error, 'JavaScriptError', {
      service: 'dataService',
      action: 'saveRitualHistory',
    });
    return null;
  }
}

/**
 * 获取仪式历史记录
 */
export async function getRitualHistory(limit = 30) {
  try {
    const data = await AppSdk.appData.queryData({
      collection: COLLECTIONS.RITUAL_HISTORY,
      limit,
      orderBy: 'timestamp',
      order: 'desc',
    });
    return data || [];
  } catch (error) {
    await reportError(error, 'JavaScriptError', {
      service: 'dataService',
      action: 'getRitualHistory',
    });
    return [];
  }
}

/**
 * 保存专注会话
 */
export async function saveFocusSession(session) {
  try {
    const id = `session_${Date.now()}`;
    await AppSdk.appData.createData({
      collection: COLLECTIONS.FOCUS_SESSIONS,
      data: {
        id,
        duration: session.duration,
        completed: session.completed,
        startTime: session.startTime,
        endTime: session.endTime,
        note: session.note,
        timestamp: Date.now(),
      },
    });
    return id;
  } catch (error) {
    await reportError(error, 'JavaScriptError', {
      service: 'dataService',
      action: 'saveFocusSession',
    });
    return null;
  }
}

/**
 * 获取专注会话历史
 */
export async function getFocusSessions(limit = 50) {
  try {
    const data = await AppSdk.appData.queryData({
      collection: COLLECTIONS.FOCUS_SESSIONS,
      limit,
      orderBy: 'timestamp',
      order: 'desc',
    });
    return data || [];
  } catch (error) {
    await reportError(error, 'JavaScriptError', {
      service: 'dataService',
      action: 'getFocusSessions',
    });
    return [];
  }
}

/**
 * 获取统计数据
 */
export async function getStatistics() {
  try {
    const rituals = await getRitualHistory(30);
    const sessions = await getFocusSessions(50);

    // 计算本周完成的仪式数
    const oneWeekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
    const weeklyRituals = rituals.filter(r => r.timestamp > oneWeekAgo);
    const weeklySessions = sessions.filter(s => s.timestamp > oneWeekAgo && s.completed);

    // 计算总专注时间（分钟）
    const totalFocusTime = sessions
      .filter(s => s.completed)
      .reduce((sum, s) => sum + (s.duration / 60), 0);

    // 情绪趋势
    const emotionTrend = rituals.slice(0, 7).map(r => ({
      date: new Date(r.timestamp).toLocaleDateString(),
      emotion: r.emotion,
      energy: r.energy,
    }));

    return {
      weeklyRitualsCount: weeklyRituals.length,
      weeklySessionsCount: weeklySessions.length,
      totalFocusTime: Math.round(totalFocusTime),
      emotionTrend,
      totalRituals: rituals.length,
      totalSessions: sessions.length,
    };
  } catch (error) {
    await reportError(error, 'JavaScriptError', {
      service: 'dataService',
      action: 'getStatistics',
    });
    return null;
  }
}

