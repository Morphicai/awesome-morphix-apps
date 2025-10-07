import { create } from 'zustand';
import AppSdk from '@morphixai/app-sdk';
import { reportError } from '@morphixai/lib';
import ReminderService from './reminderService';

// 集合名称
const PLANS_COLLECTION = 'workout_plans';
const TEMPLATES_COLLECTION = 'workout_templates';
const SCHEDULED_WORKOUTS_COLLECTION = 'scheduled_workouts';
const WORKOUT_RECORDS_COLLECTION = 'workout_records';
const WORKOUT_PROGRESS_KEY = 'workout_progress';

// 初始化状态
const initialState = {
  plans: [],
  templates: [],
  scheduledWorkouts: [],
  workoutRecords: [],
  isLoading: false,
  error: null
};

// 创建store
const useStore = create((set, get) => ({
  ...initialState,

  // 加载所有数据
  loadAllData: async () => {
    try {
      set({ isLoading: true, error: null });
      
      // 并行加载所有数据
      const [plans, templates, scheduledWorkouts, workoutRecords] = await Promise.all([
        get().loadPlans(),
        get().loadTemplates(),
        get().loadScheduledWorkouts(),
        get().loadWorkoutRecords()
      ]);
      
      set({ 
        plans,
        templates,
        scheduledWorkouts,
        workoutRecords,
        isLoading: false 
      });
      
      return { plans, templates, scheduledWorkouts, workoutRecords };
    } catch (error) {
      set({ error: error.message, isLoading: false });
      await reportError(error, 'DataLoadError', { function: 'loadAllData' });
      throw error;
    }
  },

  // 加载健身计划
  loadPlans: async () => {
    try {
      set({ isLoading: true });
      const result = await AppSdk.appData.queryData({
        collection: PLANS_COLLECTION,
        query: []
      });
      const plans = result || [];
      set(state => ({ 
        plans,
        isLoading: false
      }));
      return plans;
    } catch (error) {
      set({ error: error.message, isLoading: false });
      await reportError(error, 'DataLoadError', { function: 'loadPlans' });
      return [];
    }
  },

  // 加载模板
  loadTemplates: async () => {
    try {
      set({ isLoading: true });
      const result = await AppSdk.appData.queryData({
        collection: TEMPLATES_COLLECTION,
        query: []
      });
      const templates = result || [];
      set(state => ({ 
        templates,
        isLoading: false
      }));
      return templates;
    } catch (error) {
      set({ error: error.message, isLoading: false });
      await reportError(error, 'DataLoadError', { function: 'loadTemplates' });
      return [];
    }
  },

  // 加载已安排的健身计划
  loadScheduledWorkouts: async () => {
    try {
      set({ isLoading: true });
      const result = await AppSdk.appData.queryData({
        collection: SCHEDULED_WORKOUTS_COLLECTION,
        query: []
      });
      const scheduledWorkouts = result || [];
      set(state => ({ 
        scheduledWorkouts,
        isLoading: false
      }));
      return scheduledWorkouts;
    } catch (error) {
      set({ error: error.message, isLoading: false });
      await reportError(error, 'DataLoadError', { function: 'loadScheduledWorkouts' });
      return [];
    }
  },

  // 加载健身记录
  loadWorkoutRecords: async () => {
    try {
      set({ isLoading: true });
      const result = await AppSdk.appData.queryData({
        collection: WORKOUT_RECORDS_COLLECTION,
        query: []
      });
      const workoutRecords = result || [];
      set(state => ({ 
        workoutRecords,
        isLoading: false
      }));
      return workoutRecords;
    } catch (error) {
      set({ error: error.message, isLoading: false });
      await reportError(error, 'DataLoadError', { function: 'loadWorkoutRecords' });
      return [];
    }
  },

  // 创建健身计划
  createPlan: async (plan) => {
    try {
      set({ isLoading: true });
      
      // 确保每个动作的重复次数不超过60
      if (plan.exercises) {
        plan.exercises = plan.exercises.map(exercise => ({
          ...exercise,
          reps: Math.min(exercise.reps, 60)
        }));
      }
      
      const newPlan = {
        ...plan,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      const result = await AppSdk.appData.createData({
        collection: PLANS_COLLECTION,
        data: newPlan
      });
      
      set(state => ({ 
        plans: [...state.plans, result],
        isLoading: false
      }));
      
      return result;
    } catch (error) {
      set({ error: error.message, isLoading: false });
      await reportError(error, 'DataCreateError', { function: 'createPlan' });
      throw error;
    }
  },

  // 更新健身计划
  updatePlan: async (id, planData) => {
    try {
      set({ isLoading: true });
      
      // 确保每个动作的重复次数不超过60
      if (planData.exercises) {
        planData.exercises = planData.exercises.map(exercise => ({
          ...exercise,
          reps: Math.min(exercise.reps, 60)
        }));
      }
      
      const updatedPlan = {
        ...planData,
        updatedAt: new Date().toISOString()
      };
      
      const result = await AppSdk.appData.updateData({
        collection: PLANS_COLLECTION,
        id,
        data: updatedPlan
      });
      
      set(state => ({ 
        plans: state.plans.map(plan => plan.id === id ? result : plan),
        isLoading: false
      }));
      
      return result;
    } catch (error) {
      set({ error: error.message, isLoading: false });
      await reportError(error, 'DataUpdateError', { function: 'updatePlan' });
      throw error;
    }
  },

  // 删除健身计划
  deletePlan: async (id) => {
    try {
      set({ isLoading: true });
      
      await AppSdk.appData.deleteData({
        collection: PLANS_COLLECTION,
        id
      });
      
      set(state => ({ 
        plans: state.plans.filter(plan => plan.id !== id),
        isLoading: false
      }));
      
      return { success: true, id };
    } catch (error) {
      set({ error: error.message, isLoading: false });
      await reportError(error, 'DataDeleteError', { function: 'deletePlan' });
      throw error;
    }
  },

  // 创建模板
  createTemplate: async (template) => {
    try {
      set({ isLoading: true });
      
      // 确保每个动作的重复次数不超过60
      if (template.exercises) {
        template.exercises = template.exercises.map(exercise => ({
          ...exercise,
          reps: Math.min(exercise.reps, 60)
        }));
      }
      
      const newTemplate = {
        ...template,
        isTemplate: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      const result = await AppSdk.appData.createData({
        collection: TEMPLATES_COLLECTION,
        data: newTemplate
      });
      
      set(state => ({ 
        templates: [...state.templates, result],
        isLoading: false
      }));
      
      return result;
    } catch (error) {
      set({ error: error.message, isLoading: false });
      await reportError(error, 'DataCreateError', { function: 'createTemplate' });
      throw error;
    }
  },

  // 更新模板
  updateTemplate: async (id, templateData) => {
    try {
      set({ isLoading: true });
      
      // 确保每个动作的重复次数不超过60
      if (templateData.exercises) {
        templateData.exercises = templateData.exercises.map(exercise => ({
          ...exercise,
          reps: Math.min(exercise.reps, 60)
        }));
      }
      
      const updatedTemplate = {
        ...templateData,
        updatedAt: new Date().toISOString()
      };
      
      const result = await AppSdk.appData.updateData({
        collection: TEMPLATES_COLLECTION,
        id,
        data: updatedTemplate
      });
      
      set(state => ({ 
        templates: state.templates.map(template => template.id === id ? result : template),
        isLoading: false
      }));
      
      return result;
    } catch (error) {
      set({ error: error.message, isLoading: false });
      await reportError(error, 'DataUpdateError', { function: 'updateTemplate' });
      throw error;
    }
  },

  // 删除模板
  deleteTemplate: async (id) => {
    try {
      set({ isLoading: true });
      
      await AppSdk.appData.deleteData({
        collection: TEMPLATES_COLLECTION,
        id
      });
      
      set(state => ({ 
        templates: state.templates.filter(template => template.id !== id),
        isLoading: false
      }));
      
      return { success: true, id };
    } catch (error) {
      set({ error: error.message, isLoading: false });
      await reportError(error, 'DataDeleteError', { function: 'deleteTemplate' });
      throw error;
    }
  },

  // 安排健身计划到日历
  scheduleWorkout: async (scheduleData, reminderOptions = null) => {
    try {
      set({ isLoading: true });
      
      const newSchedule = {
        ...scheduleData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        completed: false
      };
      
      const result = await AppSdk.appData.createData({
        collection: SCHEDULED_WORKOUTS_COLLECTION,
        data: newSchedule
      });
      
      // 创建提醒（仅当 reminderOptions 不为 null 时）
      if (scheduleData.date && reminderOptions) {
        try {
          const plan = get().plans.find(p => p.id === scheduleData.planId);
          
          // 使用 ReminderService 创建提醒
          const reminderData = {
            id: result.id,
            date: scheduleData.date,
            name: plan ? plan.name : '健身计划'
          };
          
          // 使用更新后的ReminderService，支持自定义提醒时间
          const reminderTime = reminderOptions.reminderTime || '09:00'; // 默认早上9点
          await ReminderService.createWorkoutReminder(
            reminderData, 
            reminderOptions.minutesBefore || 0, 
            { reminderTime }
          );
        } catch (reminderError) {
          console.error('创建提醒失败:', reminderError);
          await reportError(reminderError, 'ReminderCreateError', { scheduleId: result.id });
        }
      }
      
      set(state => ({ 
        scheduledWorkouts: [...state.scheduledWorkouts, result],
        isLoading: false
      }));
      
      return result;
    } catch (error) {
      set({ error: error.message, isLoading: false });
      await reportError(error, 'DataCreateError', { function: 'scheduleWorkout' });
      throw error;
    }
  },

  // 更新已安排的健身计划
  updateScheduledWorkout: async (id, scheduleData, reminderOptions = {}) => {
    try {
      set({ isLoading: true });
      
      const updatedSchedule = {
        ...scheduleData,
        updatedAt: new Date().toISOString()
      };
      
      const result = await AppSdk.appData.updateData({
        collection: SCHEDULED_WORKOUTS_COLLECTION,
        id,
        data: updatedSchedule
      });
      
      // 如果更新了日期，同时更新提醒
      if (scheduleData.date) {
        try {
          const allReminders = await ReminderService.getAllReminders();
          const workoutReminders = allReminders.filter(
            reminder => reminder.page && reminder.page.includes(`/execute/${id}`)
          );
          
          // 如果找到相关提醒，则更新
          if (workoutReminders.length > 0) {
            const plan = get().plans.find(p => p.id === result.planId);
            
            // 使用更新后的ReminderService，支持自定义提醒时间
            const reminderTime = reminderOptions.reminderTime || '09:00'; // 默认早上9点
            await ReminderService.updateWorkoutReminder(
              workoutReminders[0].id,
              {
                id: result.id,
                date: scheduleData.date,
                name: plan ? plan.name : result.name || '健身计划'
              },
              reminderOptions.minutesBefore || 0,
              { reminderTime }
            );
          }
        } catch (reminderError) {
          console.error('更新提醒失败:', reminderError);
        }
      }
      
      set(state => ({ 
        scheduledWorkouts: state.scheduledWorkouts.map(
          schedule => schedule.id === id ? result : schedule
        ),
        isLoading: false
      }));
      
      return result;
    } catch (error) {
      set({ error: error.message, isLoading: false });
      await reportError(error, 'DataUpdateError', { function: 'updateScheduledWorkout' });
      throw error;
    }
  },

  // 删除已安排的健身计划
  deleteScheduledWorkout: async (id) => {
    try {
      set({ isLoading: true });
      
      await AppSdk.appData.deleteData({
        collection: SCHEDULED_WORKOUTS_COLLECTION,
        id
      });
      
      // 删除相关提醒
      try {
        const allReminders = await ReminderService.getAllReminders();
        const workoutReminders = allReminders.filter(
          reminder => reminder.page && reminder.page.includes(`/execute/${id}`)
        );
        
        // 删除所有相关提醒
        for (const reminder of workoutReminders) {
          await ReminderService.deleteReminder(reminder.id);
        }
      } catch (reminderError) {
        console.error('删除提醒失败:', reminderError);
      }
      
      set(state => ({ 
        scheduledWorkouts: state.scheduledWorkouts.filter(schedule => schedule.id !== id),
        isLoading: false
      }));
      
      return { success: true, id };
    } catch (error) {
      set({ error: error.message, isLoading: false });
      await reportError(error, 'DataDeleteError', { function: 'deleteScheduledWorkout' });
      throw error;
    }
  },

  // 记录健身完成情况
  recordWorkout: async (recordData) => {
    try {
      set({ isLoading: true });
      
      // 检查是否已存在相同的健身记录
      if (recordData.scheduledWorkoutId) {
        const existingRecords = await AppSdk.appData.queryData({
          collection: WORKOUT_RECORDS_COLLECTION,
          query: [
            { key: 'scheduledWorkoutId', value: recordData.scheduledWorkoutId, operator: 'eq' }
          ]
        });
        
        // 如果已存在记录，返回现有记录而不是创建新的
        if (existingRecords && existingRecords.length > 0) {
          console.log('健身记录已存在，跳过重复保存:', existingRecords[0].id);
          
          // 确保安排状态为已完成
          try {
            await get().updateScheduledWorkout(recordData.scheduledWorkoutId, { 
              completed: true,
              completedAt: existingRecords[0].completedAt || new Date().toISOString()
            });
          } catch (updateError) {
            console.error('更新安排状态失败:', updateError);
          }
          
          // 清除本地存储中的健身进度
          try {
            localStorage.removeItem(`${WORKOUT_PROGRESS_KEY}_${recordData.scheduledWorkoutId}`);
          } catch (error) {
            console.error('清除健身进度失败:', error);
          }
          
          set({ isLoading: false });
          return existingRecords[0];
        }
      }
      
      const newRecord = {
        ...recordData,
        completedAt: new Date().toISOString(),
        createdAt: new Date().toISOString()
      };
      
      const result = await AppSdk.appData.createData({
        collection: WORKOUT_RECORDS_COLLECTION,
        data: newRecord
      });
      
      // 如果有关联的安排，标记为已完成
      if (recordData.scheduledWorkoutId) {
        try {
          await get().updateScheduledWorkout(recordData.scheduledWorkoutId, { 
            completed: true,
            completedAt: new Date().toISOString()
          });
        } catch (updateError) {
          console.error('更新安排状态失败:', updateError);
        }
      }
      
      // 清除本地存储中的健身进度
      try {
        localStorage.removeItem(`${WORKOUT_PROGRESS_KEY}_${recordData.scheduledWorkoutId}`);
      } catch (error) {
        console.error('清除健身进度失败:', error);
      }
      
      set(state => ({ 
        workoutRecords: [...state.workoutRecords, result],
        isLoading: false
      }));
      
      return result;
    } catch (error) {
      set({ error: error.message, isLoading: false });
      await reportError(error, 'DataCreateError', { function: 'recordWorkout' });
      throw error;
    }
  },

  // 保存健身进度到本地存储
  saveWorkoutProgress: (workoutId, progress) => {
    try {
      const progressData = {
        id: workoutId,
        progress,
        timestamp: new Date().toISOString()
      };
      localStorage.setItem(`${WORKOUT_PROGRESS_KEY}_${workoutId}`, JSON.stringify(progressData));
      return true;
    } catch (error) {
      console.error('保存健身进度失败:', error);
      return false;
    }
  },

  // 获取本地存储的健身进度
  getWorkoutProgress: (workoutId) => {
    try {
      const progressData = localStorage.getItem(`${WORKOUT_PROGRESS_KEY}_${workoutId}`);
      if (!progressData) return null;
      return JSON.parse(progressData);
    } catch (error) {
      console.error('获取健身进度失败:', error);
      return null;
    }
  },

  // 获取特定日期的健身安排
  getWorkoutsForDate: (date) => {
    const dateStr = typeof date === 'string' ? date : date.toISOString().split('T')[0];
    return get().scheduledWorkouts.filter(workout => 
      workout.date && workout.date.split('T')[0] === dateStr
    );
  },

  // 获取特定ID的健身计划
  getPlanById: (id) => {
    return get().plans.find(plan => plan.id === id) || null;
  },

  // 获取特定ID的模板
  getTemplateById: (id) => {
    return get().templates.find(template => template.id === id) || null;
  },

  // 获取特定ID的健身安排
  getScheduledWorkoutById: (id) => {
    return get().scheduledWorkouts.find(workout => workout.id === id) || null;
  },

  // 检查健身记录是否已存在
  checkWorkoutRecordExists: async (scheduledWorkoutId) => {
    try {
      const existingRecords = await AppSdk.appData.queryData({
        collection: WORKOUT_RECORDS_COLLECTION,
        query: [
          { key: 'scheduledWorkoutId', value: scheduledWorkoutId, operator: 'eq' }
        ]
      });
      return existingRecords && existingRecords.length > 0 ? existingRecords[0] : null;
    } catch (error) {
      console.error('检查健身记录失败:', error);
      return null;
    }
  },

  // 获取特定健身安排的记录
  getWorkoutRecordByScheduleId: (scheduledWorkoutId) => {
    return get().workoutRecords.find(record => record.scheduledWorkoutId === scheduledWorkoutId) || null;
  },

  // 从模板创建计划
  createPlanFromTemplate: async (templateId) => {
    try {
      const template = get().getTemplateById(templateId);
      if (!template) throw new Error('模板不存在');
      
      const planData = {
        name: template.name,
        exercises: template.exercises,
        description: template.description,
        fromTemplateId: templateId,
        createdFromTemplate: true
      };
      
      return await get().createPlan(planData);
    } catch (error) {
      await reportError(error, 'TemplateConversionError', { templateId });
      throw error;
    }
  },

  // 将计划保存为模板
  savePlanAsTemplate: async (planId) => {
    try {
      const plan = get().getPlanById(planId);
      if (!plan) throw new Error('计划不存在');
      
      const templateData = {
        name: `${plan.name} (模板)`,
        exercises: plan.exercises,
        description: plan.description,
        fromPlanId: planId
      };
      
      return await get().createTemplate(templateData);
    } catch (error) {
      await reportError(error, 'TemplateSaveError', { planId });
      throw error;
    }
  },

  // 重置状态
  resetState: () => {
    set(initialState);
  }
}));

export default useStore;