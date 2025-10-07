import AppSdk from '@morphixai/app-sdk';
import dayjs from 'dayjs';
import { reportError } from '@morphixai/lib';

/**
 * 提醒服务工具类
 * 用于管理健身提醒功能
 */
class ReminderService {
  /**
   * 为健身计划创建提醒
   * @param {Object} workout 健身计划对象
   * @param {string} workout.id 健身ID
   * @param {string} workout.date 健身日期
   * @param {string} workout.name 健身名称
   * @param {number} minutesBefore 提前多少分钟提醒（默认30分钟）
   * @param {Object} options 额外选项
   * @param {string} options.reminderTime 提醒时间（格式："HH:mm"，如 "09:00"）
   * @returns {Promise<Object>} 创建的提醒对象
   */
  static async createWorkoutReminder(workout, minutesBefore = 30, options = {}) {
    try {
      if (!workout || !workout.date || !workout.id) {
        throw new Error('无效的健身计划数据');
      }

      // 获取健身日期
      let workoutDate = dayjs(workout.date);
      
      // 如果有指定提醒时间，则使用指定时间
      if (options.reminderTime) {
        const [hours, minutes] = options.reminderTime.split(':').map(Number);
        workoutDate = workoutDate.hour(hours).minute(minutes).second(0);
      } else {
        // 默认设为早上9点
        workoutDate = workoutDate.hour(9).minute(0).second(0);
      }
      
      // 如果日期已过，则不创建提醒
      if (workoutDate.isBefore(dayjs())) {
        console.log('健身日期已过，不创建提醒');
        return null;
      }
      
      // 计算提醒时间（如果有minutesBefore，则提前minutesBefore分钟）
      const reminderTime = minutesBefore > 0 ? 
        workoutDate.subtract(minutesBefore, 'minute') : 
        workoutDate;
      
      // 创建提醒
      const reminder = await AppSdk.reminder.createReminder({
        title: '健身提醒',
        message: `该开始您的"${workout.name}"健身计划了`,
        sub_title: '健身助手',
        start_time: reminderTime.valueOf(),
        page: `/execute/${workout.id}`,
      });
      
      console.log('成功创建健身提醒:', reminder);
      return reminder;
    } catch (error) {
      reportError(error, 'ReminderError', { 
        component: 'ReminderService', 
        method: 'createWorkoutReminder',
        workoutId: workout?.id 
      });
      console.error('创建健身提醒失败:', error);
      return null;
    }
  }

  /**
   * 删除健身提醒
   * @param {string} reminderId 提醒ID
   * @returns {Promise<boolean>} 是否成功删除
   */
  static async deleteReminder(reminderId) {
    try {
      if (!reminderId) return false;
      
      const result = await AppSdk.reminder.deleteReminder({ id: reminderId });
      return result;
    } catch (error) {
      reportError(error, 'ReminderError', { 
        component: 'ReminderService', 
        method: 'deleteReminder',
        reminderId 
      });
      console.error('删除提醒失败:', error);
      return false;
    }
  }

  /**
   * 获取用户所有提醒
   * @returns {Promise<Array>} 提醒列表
   */
  static async getAllReminders() {
    try {
      const reminders = await AppSdk.reminder.getUserReminders();
      return reminders || [];
    } catch (error) {
      reportError(error, 'ReminderError', { 
        component: 'ReminderService', 
        method: 'getAllReminders' 
      });
      console.error('获取提醒列表失败:', error);
      return [];
    }
  }

  /**
   * 更新健身提醒
   * @param {string} reminderId 提醒ID
   * @param {Object} workout 更新后的健身计划数据
   * @param {number} minutesBefore 提前多少分钟提醒
   * @param {Object} options 额外选项
   * @param {string} options.reminderTime 提醒时间（格式："HH:mm"，如 "09:00"）
   * @returns {Promise<Object>} 更新后的提醒对象
   */
  static async updateWorkoutReminder(reminderId, workout, minutesBefore = 30, options = {}) {
    try {
      if (!reminderId || !workout || !workout.date) {
        throw new Error('无效的提醒或健身计划数据');
      }

      // 获取健身日期
      let workoutDate = dayjs(workout.date);
      
      // 如果有指定提醒时间，则使用指定时间
      if (options.reminderTime) {
        const [hours, minutes] = options.reminderTime.split(':').map(Number);
        workoutDate = workoutDate.hour(hours).minute(minutes).second(0);
      } else {
        // 默认设为早上9点
        workoutDate = workoutDate.hour(9).minute(0).second(0);
      }
      
      // 计算提醒时间（如果有minutesBefore，则提前minutesBefore分钟）
      const reminderTime = minutesBefore > 0 ? 
        workoutDate.subtract(minutesBefore, 'minute') : 
        workoutDate;
      
      // 更新提醒
      const updatedReminder = await AppSdk.reminder.updateReminder({
        id: reminderId,
        reminder: {
          title: '健身提醒',
          message: `该开始您的"${workout.name}"健身计划了`,
          start_time: reminderTime.valueOf(),
          page: `/execute/${workout.id}`,
        }
      });
      
      return updatedReminder;
    } catch (error) {
      reportError(error, 'ReminderError', { 
        component: 'ReminderService', 
        method: 'updateWorkoutReminder',
        reminderId,
        workoutId: workout?.id 
      });
      console.error('更新健身提醒失败:', error);
      return null;
    }
  }
}

export default ReminderService;