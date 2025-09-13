import { create } from 'zustand';
import AppSdk from '@morphixai/app-sdk';
import { reportError } from '@morphixai/lib';

const POMODORO_TIME = 25 * 60; // 25 minutes in seconds
const SHORT_BREAK_TIME = 5 * 60; // 5 minutes in seconds
const LONG_BREAK_TIME = 15 * 60; // 15 minutes in seconds

export const useTimerStore = create((set, get) => ({
  // Timer state
  duration: POMODORO_TIME,
  shortBreak: SHORT_BREAK_TIME,
  longBreak: LONG_BREAK_TIME,
  cycles: 4,
  currentCycle: 1,
  isRunning: false,
  remainingTime: POMODORO_TIME,
  mode: 'focus', // 'focus', 'shortBreak', 'longBreak'
  timeLeft: POMODORO_TIME,
  completedPomodoros: 0,
  totalFocusTime: 0,
  plants: [],
  isBreak: false,
  currentSession: 'focus',

  // Timer actions
  startTimer: () => {
    set({ isRunning: true });
    get().saveTimerData();
  },

  pauseTimer: () => {
    set({ isRunning: false });
    get().saveTimerData();
  },

  resetTimer: () => {
    const { mode, duration, shortBreak, longBreak } = get();
    let newTime;
    
    switch (mode) {
      case 'shortBreak':
        newTime = shortBreak;
        break;
      case 'longBreak':
        newTime = longBreak;
        break;
      default:
        newTime = duration;
    }
    
    set({ 
      isRunning: false, 
      remainingTime: newTime,
      timeLeft: newTime
    });
    get().saveTimerData();
  },

  tick: () => {
    const { remainingTime, isRunning } = get();
    if (isRunning && remainingTime > 0) {
      const newTime = remainingTime - 1;
      set({ 
        remainingTime: newTime,
        timeLeft: newTime
      });
      
      if (newTime === 0) {
        get().completeSession();
      }
    }
  },

  completeSession: () => {
    const { mode, currentCycle, cycles, shortBreak, longBreak, duration, completedPomodoros, totalFocusTime } = get();
    
    if (mode === 'focus') {
      const newCompletedPomodoros = completedPomodoros + 1;
      const newTotalFocusTime = totalFocusTime + duration;
      
      // Add a new plant for completed pomodoro
      const newPlant = {
        id: Date.now(),
        type: 'flower',
        completedAt: new Date().toISOString(),
        cycle: currentCycle
      };
      
      const { plants } = get();
      const newPlants = [...plants, newPlant];
      
      if (currentCycle >= cycles) {
        // Long break after completing all cycles
        set({
          mode: 'longBreak',
          remainingTime: longBreak,
          timeLeft: longBreak,
          currentCycle: 1,
          isRunning: false,
          isBreak: true,
          currentSession: 'break',
          completedPomodoros: newCompletedPomodoros,
          totalFocusTime: newTotalFocusTime,
          plants: newPlants
        });
      } else {
        // Short break
        set({
          mode: 'shortBreak',
          remainingTime: shortBreak,
          timeLeft: shortBreak,
          currentCycle: currentCycle + 1,
          isRunning: false,
          isBreak: true,
          currentSession: 'break',
          completedPomodoros: newCompletedPomodoros,
          totalFocusTime: newTotalFocusTime,
          plants: newPlants
        });
      }
    } else {
      // Break completed, return to focus
      set({
        mode: 'focus',
        remainingTime: duration,
        timeLeft: duration,
        isRunning: false,
        isBreak: false,
        currentSession: 'focus'
      });
    }
    
    get().saveTimerData();
  },

  updateSettings: (newSettings) => {
    const { mode } = get();
    const updates = { ...newSettings };
    
    // Update remaining time if we're in the corresponding mode
    if (mode === 'focus' && newSettings.duration) {
      updates.remainingTime = newSettings.duration;
      updates.timeLeft = newSettings.duration;
    } else if (mode === 'shortBreak' && newSettings.shortBreak) {
      updates.remainingTime = newSettings.shortBreak;
      updates.timeLeft = newSettings.shortBreak;
    } else if (mode === 'longBreak' && newSettings.longBreak) {
      updates.remainingTime = newSettings.longBreak;
      updates.timeLeft = newSettings.longBreak;
    }
    
    set(updates);
    get().saveTimerData();
  },

  // Initialize timer from saved data
  initializeTimer: async () => {
    try {
      console.log('Initializing timer store...');
      
      // 先检查数据是否存在
      let savedData;
      try {
        savedData = await AppSdk.appData.getData({
          collection: 'timer',
          id: 'current'
        });
      } catch (error) {
        console.log('Timer data not found, will create default data');
        savedData = null;
      }
      
      // If data exists, update store with saved data
      if (savedData) {
        const isBreak = savedData.mode !== 'focus';
        
        set({
          duration: savedData.duration || POMODORO_TIME,
          shortBreak: savedData.shortBreak || SHORT_BREAK_TIME,
          longBreak: savedData.longBreak || LONG_BREAK_TIME,
          cycles: savedData.cycles || 4,
          currentCycle: savedData.currentCycle || 1,
          remainingTime: savedData.remainingTime || POMODORO_TIME,
          mode: savedData.mode || 'focus',
          timeLeft: savedData.remainingTime || POMODORO_TIME,
          completedPomodoros: savedData.completedPomodoros || 0,
          totalFocusTime: savedData.totalFocusTime || 0,
          plants: savedData.plants || [],
          isBreak: isBreak,
          currentSession: isBreak ? 'break' : 'focus',
          isRunning: false // Always start with timer stopped
        });
        
        console.log('Timer initialized from saved data:', savedData);
        return;
      }
      
      // If no data exists, create default data
      const defaultData = {
        duration: POMODORO_TIME,
        shortBreak: SHORT_BREAK_TIME,
        longBreak: LONG_BREAK_TIME,
        cycles: 4,
        currentCycle: 1,
        isRunning: false,
        remainingTime: POMODORO_TIME,
        mode: 'focus',
        completedPomodoros: 0,
        totalFocusTime: 0,
        plants: [],
        lastUpdated: Date.now()
      };
      
      let createdData;
      try {
        createdData = await AppSdk.appData.createData({
          collection: 'timer',
          id: 'current',
          data: defaultData
        });
      } catch (createError) {
        console.error('Failed to create timer data, using memory defaults:', createError);
        // Use default data in memory if creation fails
        createdData = { id: 'current', ...defaultData };
      }
      
      // Update store with created data
      set({
        duration: defaultData.duration,
        shortBreak: defaultData.shortBreak,
        longBreak: defaultData.longBreak,
        cycles: defaultData.cycles,
        currentCycle: defaultData.currentCycle,
        remainingTime: defaultData.remainingTime,
        mode: defaultData.mode,
        timeLeft: defaultData.remainingTime,
        completedPomodoros: defaultData.completedPomodoros,
        totalFocusTime: defaultData.totalFocusTime,
        plants: defaultData.plants,
        isBreak: false,
        currentSession: 'focus',
        isRunning: false
      });
      
      console.log('Created and initialized default timer data:', createdData);
      
    } catch (error) {
      console.error('Error initializing timer:', error);
      await reportError(error, 'JavaScriptError', { component: 'TimerStore' });
      
      // Set default values in memory as fallback
      set({
        duration: POMODORO_TIME,
        shortBreak: SHORT_BREAK_TIME,
        longBreak: LONG_BREAK_TIME,
        cycles: 4,
        currentCycle: 1,
        remainingTime: POMODORO_TIME,
        mode: 'focus',
        timeLeft: POMODORO_TIME,
        completedPomodoros: 0,
        totalFocusTime: 0,
        plants: [],
        isBreak: false,
        currentSession: 'focus',
        isRunning: false
      });
      
      console.log('Timer initialized with fallback defaults');
    }
  },

  // Save timer data with enhanced error handling
  saveTimerData: async () => {
    try {
      const { 
        duration, shortBreak, longBreak, cycles, currentCycle, 
        remainingTime, mode, completedPomodoros, totalFocusTime, plants 
      } = get();
      
      const dataToSave = {
        duration,
        shortBreak,
        longBreak,
        cycles,
        currentCycle,
        isRunning: false, // Always save as stopped
        remainingTime,
        mode,
        completedPomodoros,
        totalFocusTime,
        plants,
        lastUpdated: Date.now()
      };
      
      // 先检查数据是否存在
      let existingData;
      try {
        existingData = await AppSdk.appData.getData({
          collection: 'timer',
          id: 'current'
        });
      } catch (error) {
        console.log('No existing timer data found, will create new');
        existingData = null;
      }
      
      if (existingData) {
        // 数据存在，更新
        await AppSdk.appData.updateData({
          collection: 'timer',
          id: 'current',
          data: dataToSave
        });
        console.log('Timer data updated successfully');
      } else {
        // 数据不存在，创建
        await AppSdk.appData.createData({
          collection: 'timer',
          id: 'current',
          data: dataToSave
        });
        console.log('Timer data created successfully');
      }
      
    } catch (error) {
      console.error('Error saving timer data:', error);
      await reportError(error, 'JavaScriptError', { component: 'TimerStore' });
    }
  },

  // Get timer data safely with existence check
  getTimerData: async () => {
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
          duration: POMODORO_TIME,
          shortBreak: SHORT_BREAK_TIME,
          longBreak: LONG_BREAK_TIME,
          cycles: 4,
          currentCycle: 1,
          isRunning: false,
          remainingTime: POMODORO_TIME,
          mode: 'focus',
          completedPomodoros: 0,
          totalFocusTime: 0,
          plants: [],
          lastUpdated: Date.now()
        };
        
        timerData = await AppSdk.appData.createData({
          collection: 'timer',
          id: 'current',
          data: defaultData
        });
      }
      return timerData;
    } catch (error) {
      console.error('获取计时器数据失败:', error);
      await reportError(error, 'JavaScriptError', { component: 'TimerStore' });
      // 返回一个默认对象，防止应用崩溃
      return {
        duration: POMODORO_TIME,
        shortBreak: SHORT_BREAK_TIME,
        longBreak: LONG_BREAK_TIME,
        cycles: 4,
        currentCycle: 1,
        isRunning: false,
        remainingTime: POMODORO_TIME,
        mode: 'focus',
        completedPomodoros: 0,
        totalFocusTime: 0,
        plants: []
      };
    }
  }
}));