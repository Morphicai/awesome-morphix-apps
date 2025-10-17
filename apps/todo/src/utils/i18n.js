import { createContext, useContext } from 'react';
import AppSdk from '@morphixai/app-sdk';

export const translations = {
  zh: {
    app: {
      title: '任务',
      loading: '加载中...',
      processing: '处理中...',
    },
    categories: {
      all: '全部',
      work: '工作',
      personal: '个人',
      shopping: '购物',
      study: '学习',
      more: '更多',
      manage: '管理分类',
      default: '默认',
      usageCount: '使用次数',
    },
    tasks: {
      addTask: '添加任务',
      addFirstTask: '添加第一个任务',
      editTask: '编辑任务',
      newTask: '添加新任务',
      taskContent: '任务内容',
      taskContentPlaceholder: '输入任务内容',
      category: '分类',
      selectCategory: '选择分类',
      priority: '优先级',
      normal: '普通',
      important: '重要',
      reminderTime: '提醒时间',
      completed: '已完成',
      pending: '未完成',
      clear: '清除',
      save: '保存',
      cancel: '取消',
      delete: '删除',
      done: '完成',
      noTasks: '暂无任务',
      noTasksDesc: '点击右下角的"+"按钮添加新任务',
      taskNotFound: '任务不存在',
      taskNotFoundDesc: '找不到指定的任务',
      backToHome: '返回主页',
      reorderHint: '拖动可调整任务顺序',
    },
    categoryManager: {
      title: '管理分类',
      addCategory: '添加新分类',
      newCategoryName: '输入新分类名称',
      categoryName: '分类名称',
      categoryNamePlaceholder: '输入新分类名称',
      addingCategory: '添加中...',
    },
    messages: {
      taskAdded: '任务已添加',
      taskUpdated: '任务已更新',
      taskDeleted: '任务已删除',
      completedCleared: '已清除完成任务',
      categoryAdded: '分类已添加',
      categoryUpdated: '分类已更新',
      categoryDeleted: '分类已删除',
      orderUpdated: '任务顺序已更新',
      emptyContent: '任务内容不能为空',
      emptyCategoryName: '分类名称不能为空',
      categoryExists: '分类名称已存在',
      categoryInUse: '无法删除：有{count}个任务使用此分类',
      loadCategoriesFailed: '加载分类失败，请重试',
      addCategoryFailed: '添加分类失败，请重试',
      updateCategoryFailed: '更新分类失败，请重试',
      deleteCategoryFailed: '删除分类失败，请重试',
      createTaskFailed: '创建任务失败，请重试',
      updateTaskFailed: '更新任务失败，请重试',
      updateStatusFailed: '更新任务状态失败，请重试',
      updatePriorityFailed: '更新任务优先级失败，请重试',
      deleteTaskFailed: '删除任务失败，请重试',
      reorderFailed: '更新任务顺序失败，请重试',
      clearCompletedFailed: '清理已完成任务失败，请重试',
    },
    confirmations: {
      confirmDelete: '确认删除',
      confirmClear: '确认清除',
      deleteTask: '确定要删除任务"{content}"吗？',
      deleteTaskGeneric: '确定要删除此任务吗？',
      deleteCategory: '确定要删除分类"{name}"吗？',
      deleteCategoryGeneric: '确定要删除此分类吗？',
      clearCompleted: '确定要清除所有已完成的任务吗？(共{count}项)',
    },
  },
  en: {
    app: {
      title: 'Tasks',
      loading: 'Loading...',
      processing: 'Processing...',
    },
    categories: {
      all: 'All',
      work: 'Work',
      personal: 'Personal',
      shopping: 'Shopping',
      study: 'Study',
      more: 'More',
      manage: 'Manage Categories',
      default: 'Default',
      usageCount: 'Usage Count',
    },
    tasks: {
      addTask: 'Add Task',
      addFirstTask: 'Add First Task',
      editTask: 'Edit Task',
      newTask: 'Add New Task',
      taskContent: 'Task Content',
      taskContentPlaceholder: 'Enter task content',
      category: 'Category',
      selectCategory: 'Select Category',
      priority: 'Priority',
      normal: 'Normal',
      important: 'Important',
      reminderTime: 'Reminder Time',
      completed: 'Completed',
      pending: 'Pending',
      clear: 'Clear',
      save: 'Save',
      cancel: 'Cancel',
      delete: 'Delete',
      done: 'Done',
      noTasks: 'No Tasks',
      noTasksDesc: 'Tap the "+" button at the bottom right to add a new task',
      taskNotFound: 'Task Not Found',
      taskNotFoundDesc: 'The specified task could not be found',
      backToHome: 'Back to Home',
      reorderHint: 'Drag to reorder tasks',
    },
    categoryManager: {
      title: 'Manage Categories',
      addCategory: 'Add New Category',
      newCategoryName: 'Enter new category name',
      categoryName: 'Category Name',
      categoryNamePlaceholder: 'Enter new category name',
      addingCategory: 'Adding...',
    },
    messages: {
      taskAdded: 'Task added',
      taskUpdated: 'Task updated',
      taskDeleted: 'Task deleted',
      completedCleared: 'Completed tasks cleared',
      categoryAdded: 'Category added',
      categoryUpdated: 'Category updated',
      categoryDeleted: 'Category deleted',
      orderUpdated: 'Task order updated',
      emptyContent: 'Task content cannot be empty',
      emptyCategoryName: 'Category name cannot be empty',
      categoryExists: 'Category name already exists',
      categoryInUse: 'Cannot delete: {count} task(s) using this category',
      loadCategoriesFailed: 'Failed to load categories, please try again',
      addCategoryFailed: 'Failed to add category, please try again',
      updateCategoryFailed: 'Failed to update category, please try again',
      deleteCategoryFailed: 'Failed to delete category, please try again',
      createTaskFailed: 'Failed to create task, please try again',
      updateTaskFailed: 'Failed to update task, please try again',
      updateStatusFailed: 'Failed to update task status, please try again',
      updatePriorityFailed: 'Failed to update task priority, please try again',
      deleteTaskFailed: 'Failed to delete task, please try again',
      reorderFailed: 'Failed to update task order, please try again',
      clearCompletedFailed: 'Failed to clear completed tasks, please try again',
    },
    confirmations: {
      confirmDelete: 'Confirm Delete',
      confirmClear: 'Confirm Clear',
      deleteTask: 'Are you sure you want to delete task "{content}"?',
      deleteTaskGeneric: 'Are you sure you want to delete this task?',
      deleteCategory: 'Are you sure you want to delete category "{name}"?',
      deleteCategoryGeneric: 'Are you sure you want to delete this category?',
      clearCompleted: 'Are you sure you want to clear all completed tasks? ({count} item(s))',
    },
  },
};

export const LanguageContext = createContext({
  language: 'en',
  t: (key, params) => key,
  setLanguage: () => {},
});

export const useTranslation = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useTranslation must be used within LanguageProvider');
  }
  return context;
};

export const getNestedValue = (obj, path) => {
  return path.split('.').reduce((current, key) => current?.[key], obj);
};

export const translate = (language, key, params = {}) => {
  const translation = getNestedValue(translations[language], key);
  
  if (!translation) {
    console.warn(`Translation missing for key: ${key} in language: ${language}`);
    return key;
  }
  
  if (typeof translation !== 'string') {
    return translation;
  }
  
  return Object.keys(params).reduce((text, param) => {
    return text.replace(new RegExp(`\\{${param}\\}`, 'g'), params[param]);
  }, translation);
};

export const detectSystemLanguage = async () => {
  try {
    const systemLang = await AppSdk.getLanguage();
    if (systemLang && systemLang.startsWith('zh')) {
      return 'zh';
    }
    return 'en';
  } catch (error) {
    console.warn('Failed to detect system language, using English as default', error);
    return 'en';
  }
};

export const getCategoryTranslation = (language, categoryName) => {
  const categoryMap = {
    '工作': 'categories.work',
    '个人': 'categories.personal',
    '购物': 'categories.shopping',
    '学习': 'categories.study',
    'Work': 'categories.work',
    'Personal': 'categories.personal',
    'Shopping': 'categories.shopping',
    'Study': 'categories.study',
  };
  
  const key = categoryMap[categoryName];
  if (key) {
    return translate(language, key);
  }
  
  return categoryName;
};

export const getDefaultCategories = (language) => {
  return [
    translate(language, 'categories.work'),
    translate(language, 'categories.personal'),
    translate(language, 'categories.shopping'),
    translate(language, 'categories.study'),
  ];
};
