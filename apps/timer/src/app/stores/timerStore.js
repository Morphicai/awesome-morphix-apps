import { create } from 'zustand';
import AppSdk from '@morphixai/app-sdk';
import { reportError } from '@morphixai/lib';
import { 
  debugReminder, 
  cleanupTimerRemindersSafely, 
  createReminderSafely, 
  deleteReminderSafely,
  handleReminderError 
} from '../utils/errorHandlers';

export const useTimerStore = create((set, get) => ({
  isRunning: false,
  mode: 'focus',
  remainingTime: 25 * 60,
  duration: 25 * 60,
  shortBreak: 5 * 60,
  longBreak: 15 * 60,
  currentSession: 1,
  totalSessions: 4,
  plants: [],
  completedPomodoros: 0,
  totalFocusTime: 0,
  currentReminderId: null,
  
  initializeTimer: async () => {
    try {
      console.log('Initializing timer...');
      const timerData = await AppSdk.appData.getData({
        collection: 'timer',
        id: 'current'
      });
      
      if (timerData) {
        console.log('Found existing timer data:', timerData);
        set({
          isRunning: timerData.isRunning || false,
          mode: timerData.mode || 'focus',
          remainingTime: timerData.remainingTime || 25 * 60,
          duration: timerData.duration || 25 * 60,
          shortBreak: timerData.shortBreak || 5 * 60,
          longBreak: timerData.longBreak || 15 * 60,
          currentSession: timerData.currentCycle || 1,
          totalSessions: timerData.cycles || 4,
          completedPomodoros: timerData.completedPomodoros || 0,
          totalFocusTime: timerData.totalFocusTime || 0,
          plants: timerData.plants || []
        });
      }
      
      const statsData = await AppSdk.appData.getData({
        collection: 'stats',
        id: 'history'
      });
      
      if (statsData) {
        console.log('Found existing stats data:', statsData);
        set({
          completedPomodoros: statsData.completedPomodoros || get().completedPomodoros,
          totalFocusTime: statsData.totalFocusTime || get().totalFocusTime
        });
      }
      
      console.log('Timer initialization completed');
    } catch (error) {
      console.error('Failed to initialize timer:', error);
      await reportError(error, 'TimerInitError');
    }
  },
  
  tick: async () => {
    const { remainingTime, isRunning } = get();
    
    if (!isRunning || remainingTime <= 0) {
      return;
    }
    
    const newRemainingTime = remainingTime - 1;
    
    if (newRemainingTime <= 0) {
      await get().completeSession();
    } else {
      set({ remainingTime: newRemainingTime });
      
      if (newRemainingTime % 10 === 0) {
        await get().saveTimerState();
      }
    }
  },
  
  restoreTimer: async () => {
    try {
      const { currentReminderId, isRunning } = get();
      
      if (!isRunning || !currentReminderId) {
        return;
      }
      
      console.log('Restoring timer from background...');
      
      const reminder = await AppSdk.reminder.getReminder({ id: currentReminderId });
      
      if (!reminder) {
        console.log('Reminder not found, timer may have completed');
        await get().completeSession();
        return;
      }
      
      const now = Date.now();
      const reminderTime = reminder.start_time;
      const timeLeft = Math.max(0, Math.floor((reminderTime - now) / 1000));
      
      console.log(`Timer restored: ${timeLeft} seconds remaining`);
      
      if (timeLeft <= 0) {
        await get().completeSession();
      } else {
        set({ remainingTime: timeLeft });
        await get().saveTimerState();
      }
      
    } catch (error) {
      console.error('Failed to restore timer:', error);
      await reportError(error, 'TimerRestoreError');
    }
  },
  
  saveTimerState: async () => {
    try {
      const state = get();
      
      await AppSdk.appData.updateData({
        collection: 'timer',
        id: 'current',
        data: {
          isRunning: state.isRunning,
          mode: state.mode,
          remainingTime: state.remainingTime,
          duration: state.duration,
          shortBreak: state.shortBreak,
          longBreak: state.longBreak,
          currentCycle: state.currentSession,
          cycles: state.totalSessions,
          completedPomodoros: state.completedPomodoros,
          totalFocusTime: state.totalFocusTime,
          plants: state.plants,
          lastUpdated: Date.now()
        }
      });
      
    } catch (error) {
      console.error('Failed to save timer state:', error);
    }
  },
  
  startTimer: async () => {
    try {
      const { remainingTime, mode } = get();
      
      const reminderResult = await createReminderSafely({
        message: mode === 'focus' ? '집중 시간이 끝났습니다!' : '휴식 시간이 끝났습니다!',
        start_time: Date.now() + (remainingTime * 1000),
        title: '자연 정원 뽀모도로',
        sub_title: mode === 'focus' ? '휴식을 취하세요' : '다시 집중할 시간입니다'
      });
      
      if (reminderResult.success) {
        set({ 
          isRunning: true, 
          currentReminderId: reminderResult.reminder.id 
        });
        
        await get().saveTimerState();
      } else {
        throw new Error(reminderResult.error || '리마인더 생성에 실패했습니다.');
      }
      
    } catch (error) {
      console.error('Failed to start timer:', error);
      await reportError(error, 'TimerStartError');
      await handleReminderError(error, 'startTimer');
    }
  },
  
  pauseTimer: async () => {
    try {
      const { currentReminderId } = get();
      
      if (currentReminderId) {
        const deleteResult = await deleteReminderSafely(currentReminderId);
        if (!deleteResult.success) {
          console.warn('리마인더 삭제 실패:', deleteResult.error);
        }
      }
      
      set({ 
        isRunning: false, 
        currentReminderId: null 
      });
      
      await get().saveTimerState();
      
    } catch (error) {
      console.error('Failed to pause timer:', error);
      await reportError(error, 'TimerPauseError');
      await handleReminderError(error, 'pauseTimer');
    }
  },
  
  resetTimer: async () => {
    try {
      const { currentReminderId, mode, duration, shortBreak, longBreak } = get();
      
      if (currentReminderId) {
        const deleteResult = await deleteReminderSafely(currentReminderId);
        if (!deleteResult.success) {
          console.warn('리마인더 삭제 실패:', deleteResult.error);
        }
      }
      
      let newDuration;
      switch (mode) {
        case 'focus':
          newDuration = duration;
          break;
        case 'shortBreak':
          newDuration = shortBreak;
          break;
        case 'longBreak':
          newDuration = longBreak;
          break;
        default:
          newDuration = duration;
      }
      
      set({ 
        isRunning: false, 
        remainingTime: newDuration,
        currentReminderId: null 
      });
      
      await get().saveTimerState();
      
    } catch (error) {
      console.error('Failed to reset timer:', error);
      await reportError(error, 'TimerResetError');
      await handleReminderError(error, 'resetTimer');
    }
  },
  
  completeSession: async () => {
    try {
      const { mode, currentSession, totalSessions, plants, completedPomodoros, totalFocusTime } = get();
      
      if (mode === 'focus') {
        const newPlant = {
          id: Date.now(),
          type: 'tree',
          completedAt: Date.now(),
          session: currentSession
        };
        
        const updatedPlants = [...plants, newPlant];
        const newCompletedPomodoros = completedPomodoros + 1;
        const newTotalFocusTime = totalFocusTime + (25 * 60);
        
        set({
          plants: updatedPlants,
          completedPomodoros: newCompletedPomodoros,
          totalFocusTime: newTotalFocusTime
        });
        
        try {
          await AppSdk.appData.createData({
            collection: 'plants',
            data: newPlant
          });
          
          await AppSdk.appData.updateData({
            collection: 'stats',
            id: 'history',
            data: {
              completedPomodoros: newCompletedPomodoros,
              totalFocusTime: newTotalFocusTime
            }
          });
        } catch (storageError) {
          console.error('Failed to save plant data:', storageError);
        }
      }
      
      let nextMode;
      let nextSession = currentSession;
      
      if (mode === 'focus') {
        if (currentSession % 4 === 0) {
          nextMode = 'longBreak';
        } else {
          nextMode = 'shortBreak';
        }
        nextSession = currentSession + 1;
      } else {
        nextMode = 'focus';
      }
      
      if (nextSession > totalSessions) {
        nextSession = 1;
      }
      
      const { duration, shortBreak, longBreak } = get();
      let newDuration;
      switch (nextMode) {
        case 'focus':
          newDuration = duration;
          break;
        case 'shortBreak':
          newDuration = shortBreak;
          break;
        case 'longBreak':
          newDuration = longBreak;
          break;
        default:
          newDuration = duration;
      }
      
      set({
        mode: nextMode,
        currentSession: nextSession,
        remainingTime: newDuration,
        isRunning: false,
        currentReminderId: null
      });
      
      await get().saveTimerState();
      
    } catch (error) {
      console.error('Failed to complete session:', error);
      await reportError(error, 'SessionCompleteError');
    }
  },
  
  skipBreak: async () => {
    try {
      const { mode, isRunning } = get();
      
      // 只允许在休息时间跳过
      if (mode !== 'shortBreak' && mode !== 'longBreak') {
        return;
      }
      
      console.log('Skipping break...');
      
      // 停止当前计时器
      if (isRunning) {
        await get().pauseTimer();
      }
      
      // 直接完成当前会话，进入下一个阶段
      await get().completeSession();
      
    } catch (error) {
      console.error('Failed to skip break:', error);
      await reportError(error, 'SkipBreakError');
    }
  },
  
  updateRemainingTime: (time) => {
    set({ remainingTime: time });
  },
  
  setMode: (mode) => {
    const { duration, shortBreak, longBreak } = get();
    let newDuration;
    
    switch (mode) {
      case 'focus':
        newDuration = duration;
        break;
      case 'shortBreak':
        newDuration = shortBreak;
        break;
      case 'longBreak':
        newDuration = longBreak;
        break;
      default:
        newDuration = duration;
    }
    
    set({ 
      mode, 
      remainingTime: newDuration,
      isRunning: false 
    });
  },
  
  updateSettings: (settings) => {
    const { mode } = get();
    let newRemainingTime = get().remainingTime;
    
    if (mode === 'focus' && settings.duration) {
      newRemainingTime = settings.duration;
    } else if (mode === 'shortBreak' && settings.shortBreak) {
      newRemainingTime = settings.shortBreak;
    } else if (mode === 'longBreak' && settings.longBreak) {
      newRemainingTime = settings.longBreak;
    }
    
    set({ 
      ...settings,
      remainingTime: newRemainingTime
    });
  },
  
  loadData: async () => {
    try {
      const plantsData = await AppSdk.appData.queryData({
        collection: 'plants',
        query: []
      });
      
      const statsData = await AppSdk.appData.getData({
        collection: 'stats',
        id: 'history'
      });
      
      set({
        plants: plantsData || [],
        completedPomodoros: statsData?.completedPomodoros || 0,
        totalFocusTime: statsData?.totalFocusTime || 0
      });
      
    } catch (error) {
      console.error('Failed to load timer data:', error);
      await reportError(error, 'TimerDataLoadError');
    }
  },
  
  getTodayStats: () => {
    const { plants, completedPomodoros, totalFocusTime } = get();
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayTime = today.getTime();

    const todayPlants = plants.filter(plant => {
      const plantDate = new Date(plant.completedAt);
      plantDate.setHours(0, 0, 0, 0);
      return plantDate.getTime() === todayTime;
    });

    return {
      todayPomodoros: todayPlants.length,
      todayFocusTime: todayPlants.length * 25 * 60,
      totalPomodoros: completedPomodoros,
      totalFocusTime: totalFocusTime
    };
  },

  debugReminderIssues: async (reminderId) => {
    console.log('=== 타이머 스토어 리마인더 디버깅 ===');
    await debugReminder(reminderId);
    
    const { isRunning, mode, remainingTime } = get();
    console.log('현재 타이머 상태:', {
      isRunning,
      mode,
      remainingTime
    });
    
    console.log('타이머 리마인더 정리 테스트 시작...');
    const cleanupResult = await cleanupTimerRemindersSafely();
    console.log('정리 결과:', cleanupResult);
    
    console.log('=== 디버깅 완료 ===');
    return cleanupResult;
  }
}));