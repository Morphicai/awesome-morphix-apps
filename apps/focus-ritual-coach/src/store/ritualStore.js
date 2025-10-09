import { create } from 'zustand';
import { initializeSettings, getSettings, updateSettings } from '../services/dataService';

/**
 * 仪式状态管理
 */
export const useRitualStore = create((set, get) => ({
  // 设置
  settings: null,
  
  // 当前仪式状态
  currentRitual: {
    step: 'welcome', // welcome, setup, emotion, coach, focus, complete
    emotion: null,
    energy: 3,
    note: '',
    tasks: [],
    aiAdvice: null,
  },

  // 专注计时器状态
  focusTimer: {
    isRunning: false,
    remainingTime: 1500, // 25分钟
    startTime: null,
  },

  // 加载状态
  isLoading: false,
  error: null,

  // 初始化
  initialize: async () => {
    set({ isLoading: true });
    try {
      const settings = await initializeSettings();
      set({ 
        settings,
        focusTimer: {
          ...get().focusTimer,
          remainingTime: settings?.focusDuration || 1500,
        },
        isLoading: false 
      });
    } catch (error) {
      set({ error: error.message, isLoading: false });
    }
  },

  // 更新设置
  updateSettings: async (newSettings) => {
    try {
      await updateSettings(newSettings);
      const settings = await getSettings();
      set({ settings });
    } catch (error) {
      set({ error: error.message });
    }
  },

  // 设置仪式步骤
  setRitualStep: (step) => {
    set(state => ({
      currentRitual: {
        ...state.currentRitual,
        step,
      },
    }));
  },

  // 更新情绪状态
  updateEmotion: (emotion, energy, note) => {
    set(state => ({
      currentRitual: {
        ...state.currentRitual,
        emotion,
        energy,
        note: note || '',
      },
    }));
  },

  // 设置任务
  setTasks: (tasks) => {
    set(state => ({
      currentRitual: {
        ...state.currentRitual,
        tasks,
      },
    }));
  },

  // 设置 AI 建议
  setAIAdvice: (advice) => {
    set(state => ({
      currentRitual: {
        ...state.currentRitual,
        aiAdvice: advice,
      },
    }));
  },

  // 开始专注计时
  startFocusTimer: () => {
    const { settings } = get();
    set({
      focusTimer: {
        isRunning: true,
        remainingTime: settings?.focusDuration || 1500,
        startTime: Date.now(),
      },
    });
  },

  // 暂停专注计时
  pauseFocusTimer: () => {
    set(state => ({
      focusTimer: {
        ...state.focusTimer,
        isRunning: false,
      },
    }));
  },

  // 恢复专注计时
  resumeFocusTimer: () => {
    set(state => ({
      focusTimer: {
        ...state.focusTimer,
        isRunning: true,
      },
    }));
  },

  // 更新剩余时间
  updateRemainingTime: (time) => {
    set(state => ({
      focusTimer: {
        ...state.focusTimer,
        remainingTime: time,
      },
    }));
  },

  // 重置专注计时
  resetFocusTimer: () => {
    const { settings } = get();
    set({
      focusTimer: {
        isRunning: false,
        remainingTime: settings?.focusDuration || 1500,
        startTime: null,
      },
    });
  },

  // 完成仪式
  completeRitual: () => {
    set({
      currentRitual: {
        step: 'welcome',
        emotion: null,
        energy: 3,
        note: '',
        tasks: [],
        aiAdvice: null,
      },
    });
    get().resetFocusTimer();
  },

  // 重置仪式
  resetRitual: () => {
    set({
      currentRitual: {
        step: 'welcome',
        emotion: null,
        energy: 3,
        note: '',
        tasks: [],
        aiAdvice: null,
      },
    });
    get().resetFocusTimer();
  },
}));

