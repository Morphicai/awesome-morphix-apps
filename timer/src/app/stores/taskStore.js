import { create } from 'zustand';
import AppSdk from '@morphixai/app-sdk';
import { reportError } from '@morphixai/lib';

export const useTaskStore = create((set, get) => ({
  tasks: [],
  loading: false,

  // Get flower type based on priority
  getFlowerTypeForPriority: (priority) => {
    const flowerTypes = {
      high: 'rose',
      medium: 'tulip',
      low: 'daisy'
    };
    return flowerTypes[priority] || 'tulip';
  },

  // Load tasks from storage with enhanced error handling
  loadTasks: async () => {
    set({ loading: true });
    try {
      console.log('Loading tasks from storage...');
      
      // 先尝试查询所有任务
      let tasksData;
      try {
        tasksData = await AppSdk.appData.queryData({
          collection: 'tasks',
          query: []
        });
        
        // 过滤掉list文档，只保留实际的任务项
        if (Array.isArray(tasksData)) {
          tasksData = tasksData.filter(task => task.id !== 'list' && task.text);
        }
      } catch (queryError) {
        console.log('Query failed, trying to get tasks list data:', queryError.message);
        
        // 如果查询失败，尝试获取任务列表数据
        try {
          const listData = await AppSdk.appData.getData({
            collection: 'tasks',
            id: 'list'
          });
          tasksData = listData?.items || [];
        } catch (getError) {
          console.log('No tasks data found, starting with empty array');
          tasksData = [];
        }
      }
      
      // Handle case where no tasks exist yet
      const tasks = Array.isArray(tasksData) ? tasksData : [];
      const sortedTasks = tasks.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
      
      set({ tasks: sortedTasks });
      console.log(`Loaded ${sortedTasks.length} tasks successfully`);
    } catch (error) {
      console.error('Error loading tasks:', error);
      await reportError(error, 'JavaScriptError', { component: 'TaskStore' });
      // Always set empty array to prevent app crash
      set({ tasks: [] });
      console.log('Set empty tasks array due to error');
    } finally {
      set({ loading: false });
    }
  },

  // Add new task with enhanced error handling
  addTask: async (taskText, priority = 'medium') => {
    if (!taskText.trim()) return;
    
    try {
      const newTask = {
        text: taskText.trim(),
        completed: false,
        priority,
        createdAt: Date.now(),
        completedAt: null,
        flowerType: get().getFlowerTypeForPriority(priority)
      };
      
      let savedTask;
      try {
        savedTask = await AppSdk.appData.createData({
          collection: 'tasks',
          data: newTask
        });
      } catch (createError) {
        console.error('Failed to save task to storage:', createError);
        // 如果保存失败，至少在内存中添加任务
        savedTask = {
          id: `temp_${Date.now()}`,
          ...newTask
        };
      }
      
      set(state => ({
        tasks: [savedTask, ...state.tasks]
      }));
      
      return savedTask;
    } catch (error) {
      console.error('Error adding task:', error);
      await reportError(error, 'JavaScriptError', { component: 'TaskStore' });
    }
  },

  // Toggle task completion with enhanced error handling
  toggleTask: async (taskId) => {
    try {
      const task = get().tasks.find(t => t.id === taskId);
      if (!task) return;
      
      const updatedTaskData = {
        completed: !task.completed,
        completedAt: !task.completed ? Date.now() : null
      };
      
      let updatedTask;
      try {
        updatedTask = await AppSdk.appData.updateData({
          collection: 'tasks',
          id: taskId,
          data: updatedTaskData
        });
      } catch (updateError) {
        console.error('Failed to update task in storage:', updateError);
        // 如果更新失败，至少在内存中更新
        updatedTask = {
          ...task,
          ...updatedTaskData
        };
      }
      
      set(state => ({
        tasks: state.tasks.map(t => 
          t.id === taskId ? updatedTask : t
        )
      }));
      
      return updatedTask;
    } catch (error) {
      console.error('Error toggling task:', error);
      await reportError(error, 'JavaScriptError', { component: 'TaskStore' });
    }
  },

  // Delete task with enhanced error handling
  deleteTask: async (taskId) => {
    try {
      try {
        await AppSdk.appData.deleteData({
          collection: 'tasks',
          id: taskId
        });
      } catch (deleteError) {
        console.error('Failed to delete task from storage:', deleteError);
        // 继续删除内存中的任务，即使存储删除失败
      }
      
      set(state => ({
        tasks: state.tasks.filter(t => t.id !== taskId)
      }));
    } catch (error) {
      console.error('Error deleting task:', error);
      await reportError(error, 'JavaScriptError', { component: 'TaskStore' });
    }
  },

  // Update task text with enhanced error handling
  updateTask: async (taskId, newText) => {
    if (!newText.trim()) return;
    
    try {
      const task = get().tasks.find(t => t.id === taskId);
      if (!task) return;
      
      const updateData = {
        text: newText.trim(),
        updatedAt: Date.now()
      };
      
      let updatedTask;
      try {
        updatedTask = await AppSdk.appData.updateData({
          collection: 'tasks',
          id: taskId,
          data: updateData
        });
      } catch (updateError) {
        console.error('Failed to update task in storage:', updateError);
        // 如果更新失败，至少在内存中更新
        updatedTask = {
          ...task,
          ...updateData
        };
      }
      
      set(state => ({
        tasks: state.tasks.map(t => 
          t.id === taskId ? updatedTask : t
        )
      }));
      
      return updatedTask;
    } catch (error) {
      console.error('Error updating task:', error);
      await reportError(error, 'JavaScriptError', { component: 'TaskStore' });
    }
  },

  // Get completed tasks count
  getCompletedTasksCount: () => {
    return get().tasks.filter(task => task.completed).length;
  },

  // Get tasks by priority
  getTasksByPriority: (priority) => {
    return get().tasks.filter(task => task.priority === priority);
  },

  // Clear all completed tasks
  clearCompletedTasks: async () => {
    try {
      const completedTasks = get().tasks.filter(task => task.completed);
      
      // Delete completed tasks from storage
      for (const task of completedTasks) {
        try {
          await AppSdk.appData.deleteData({
            collection: 'tasks',
            id: task.id
          });
        } catch (deleteError) {
          console.error(`Failed to delete completed task ${task.id}:`, deleteError);
        }
      }
      
      // Remove completed tasks from state
      set(state => ({
        tasks: state.tasks.filter(task => !task.completed)
      }));
      
      console.log(`Cleared ${completedTasks.length} completed tasks`);
    } catch (error) {
      console.error('Error clearing completed tasks:', error);
      await reportError(error, 'JavaScriptError', { component: 'TaskStore' });
    }
  }
}));