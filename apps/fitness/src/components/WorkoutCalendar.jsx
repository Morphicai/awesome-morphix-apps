import React, { useState, useEffect } from 'react';
import { 
  IonContent, 
  IonGrid, 
  IonRow, 
  IonCol,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonButton,
  IonIcon,
  IonList,
  IonItem,
  IonLabel,
  IonSegment,
  IonSegmentButton,
  IonActionSheet,
  IonAlert,
  IonModal,
  IonToolbar,
  IonTitle,
  IonButtons,
  IonSelect,
  IonSelectOption,
  IonToggle,
  IonRange,
  IonNote,
  IonInput,
  IonDatetime
} from '@ionic/react';
import { 
  addOutline, 
  arrowForwardOutline, 
  chevronBack, 
  chevronForward,
  calendarOutline,
  ellipsisHorizontal,
  closeOutline,
  trashOutline,
  notificationsOutline,
  timeOutline,
  alarmOutline
} from 'ionicons/icons';
import { PageHeader } from '@morphixai/components';
import { useHistory } from 'react-router-dom';
import dayjs from 'dayjs';

import useStore from '../utils/store';
import { getMonthDates, getCurrentWeekDates, formatDate } from '../utils/helpers';
import LoadingSpinner from './LoadingSpinner';
import EmptyState from './EmptyState';
import ReminderService from '../utils/reminderService';

const WorkoutCalendar = () => {
  const history = useHistory();
  const { 
    loadAllData, 
    scheduledWorkouts, 
    plans, 
    templates,
    deleteScheduledWorkout,
    scheduleWorkout,
    updateScheduledWorkout,
    isLoading 
  } = useStore();
  
  const [viewMode, setViewMode] = useState('month');
  const [currentDate, setCurrentDate] = useState(dayjs());
  const [calendarDates, setCalendarDates] = useState([]);
  const [selectedDate, setSelectedDate] = useState(dayjs().format('YYYY-MM-DD'));
  const [dateWorkouts, setDateWorkouts] = useState([]);
  const [showOptionsSheet, setShowOptionsSheet] = useState(false);
  const [selectedWorkout, setSelectedWorkout] = useState(null);
  const [showDeleteAlert, setShowDeleteAlert] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedPlanId, setSelectedPlanId] = useState('');
  const [showReminderModal, setShowReminderModal] = useState(false);
  const [reminderEnabled, setReminderEnabled] = useState(true);
  const [reminderMinutes, setReminderMinutes] = useState(30);
  const [reminderTime, setReminderTime] = useState('09:00');
  const [useSpecificTime, setUseSpecificTime] = useState(true);
  
  // 加载数据
  useEffect(() => {
    loadAllData();
  }, [loadAllData]);
  
  // 更新日历数据
  useEffect(() => {
    if (viewMode === 'month') {
      const monthDates = getMonthDates(
        currentDate.year(), 
        currentDate.month() + 1
      );
      setCalendarDates(monthDates);
    } else {
      const weekDates = getCurrentWeekDates();
      setCalendarDates(weekDates);
    }
  }, [viewMode, currentDate]);
  
  // 更新选中日期的健身安排
  useEffect(() => {
    if (scheduledWorkouts.length > 0 && selectedDate) {
      const workoutsForDate = scheduledWorkouts.filter(workout => 
        workout.date && workout.date.split('T')[0] === selectedDate
      );
      
      setDateWorkouts(workoutsForDate);
    } else {
      setDateWorkouts([]);
    }
  }, [scheduledWorkouts, selectedDate]);
  
  // 切换视图模式
  const handleViewModeChange = (event) => {
    setViewMode(event.detail.value);
  };
  
  // 上一个月/周
  const goToPrevious = () => {
    if (viewMode === 'month') {
      setCurrentDate(currentDate.subtract(1, 'month'));
    } else {
      setCurrentDate(currentDate.subtract(1, 'week'));
    }
  };
  
  // 下一个月/周
  const goToNext = () => {
    if (viewMode === 'month') {
      setCurrentDate(currentDate.add(1, 'month'));
    } else {
      setCurrentDate(currentDate.add(1, 'week'));
    }
  };
  
  // 选择日期
  const selectDate = (dateString) => {
    setSelectedDate(dateString);
  };
  
  // 检查日期是否有健身安排
  const hasWorkout = (dateString) => {
    return scheduledWorkouts.some(workout => 
      workout.date && workout.date.split('T')[0] === dateString
    );
  };
  
  // 打开工作安排选项
  const openWorkoutOptions = (workout) => {
    setSelectedWorkout(workout);
    setShowOptionsSheet(true);
  };
  
  // 确认删除健身安排
  const confirmDeleteWorkout = () => {
    setShowOptionsSheet(false); // 先关闭选项菜单
    setTimeout(() => {
      setShowDeleteAlert(true); // 然后显示删除确认框
    }, 100); // 添加短暂延迟，确保UI更新顺序正确
  };
  
  // 删除健身安排
  const handleDeleteWorkout = async () => {
    if (selectedWorkout) {
      try {
        console.log('开始删除健身安排:', selectedWorkout.id);
        const result = await deleteScheduledWorkout(selectedWorkout.id);
        console.log('删除健身安排结果:', result);
        setSelectedWorkout(null);
        setShowDeleteAlert(false);
        // 显示删除成功提示
        alert('删除成功');
      } catch (error) {
        console.error('删除健身安排失败:', error);
        alert('删除失败: ' + error.message);
      }
    }
  };
  
  // 开始健身
  const startWorkout = (workoutId) => {
    history.push(`/execute/${workoutId}`);
  };
  
  // 查看健身计划详情
  const viewPlanDetails = (planId) => {
    history.push(`/plan/${planId}`);
  };
  
  // 打开提醒设置
  const openReminderSettings = () => {
    setShowOptionsSheet(false);
    // 重置默认值
    setReminderEnabled(true);
    setReminderMinutes(30);
    setReminderTime('09:00');
    setUseSpecificTime(true);
    setShowReminderModal(true);
  };
  
  // 保存提醒设置
  const saveReminderSettings = async () => {
    if (selectedWorkout) {
      try {
        // 获取所有提醒
        const allReminders = await ReminderService.getAllReminders();
        const workoutReminders = allReminders.filter(
          reminder => reminder.page && reminder.page.includes(`/execute/${selectedWorkout.id}`)
        );
        
        // 如果启用提醒
        if (reminderEnabled) {
          const plan = plans.find(p => p.id === selectedWorkout.planId);
          
          // 准备提醒选项
          const reminderOptions = {
            minutesBefore: useSpecificTime ? 0 : reminderMinutes,
            reminderTime: useSpecificTime ? reminderTime : null
          };
          
          // 如果已有提醒，更新它
          if (workoutReminders.length > 0) {
            await ReminderService.updateWorkoutReminder(
              workoutReminders[0].id,
              {
                id: selectedWorkout.id,
                date: selectedWorkout.date,
                name: plan ? plan.name : selectedWorkout.name || '健身计划'
              },
              reminderOptions.minutesBefore,
              { reminderTime: reminderOptions.reminderTime }
            );
          } else {
            // 否则创建新提醒
            await ReminderService.createWorkoutReminder(
              {
                id: selectedWorkout.id,
                date: selectedWorkout.date,
                name: plan ? plan.name : selectedWorkout.name || '健身计划'
              },
              reminderOptions.minutesBefore,
              { reminderTime: reminderOptions.reminderTime }
            );
          }
        } else {
          // 如果禁用提醒，删除所有现有提醒
          for (const reminder of workoutReminders) {
            await ReminderService.deleteReminder(reminder.id);
          }
        }
        
        setShowReminderModal(false);
      } catch (error) {
        console.error('保存提醒设置失败:', error);
      }
    }
  };
  
  // 添加健身安排
  const handleAddWorkout = async () => {
    if (selectedPlanId) {
      try {
        const plan = plans.find(p => p.id === selectedPlanId);
        
        // 添加提醒选项
        const reminderOptions = {
          reminderTime: '09:00', // 默认早上9点提醒
          minutesBefore: 0 // 使用具体时间而不是提前时间
        };
        
        await scheduleWorkout(
          {
            planId: selectedPlanId,
            date: selectedDate,
            name: plan ? plan.name : '健身计划'
          },
          reminderOptions
        );
        
        setShowAddModal(false);
        setSelectedPlanId('');
      } catch (error) {
        console.error('添加健身安排失败:', error);
      }
    }
  };
  
  if (isLoading && scheduledWorkouts.length === 0) {
    return <LoadingSpinner message="加载日历数据..." />;
  }
  
  return (
    <IonContent>
        {/* 视图切换和月份导航 */}
        <IonGrid>
          <IonRow>
            <IonCol size="12">
              <IonSegment value={viewMode} onIonChange={handleViewModeChange}>
                <IonSegmentButton value="month">
                  <IonLabel>月视图</IonLabel>
                </IonSegmentButton>
                <IonSegmentButton value="week">
                  <IonLabel>周视图</IonLabel>
                </IonSegmentButton>
              </IonSegment>
            </IonCol>
          </IonRow>
          
          <IonRow className="ion-align-items-center">
            <IonCol size="2" className="ion-text-center">
              <IonButton fill="clear" onClick={goToPrevious}>
                <IonIcon slot="icon-only" icon={chevronBack} />
              </IonButton>
            </IonCol>
            <IonCol size="8" className="ion-text-center">
              <h4>
                {viewMode === 'month' 
                  ? currentDate.format('YYYY年M月') 
                  : `${currentDate.startOf('week').format('M月D日')} - ${currentDate.endOf('week').format('M月D日')}`
                }
              </h4>
            </IonCol>
            <IonCol size="2" className="ion-text-center">
              <IonButton fill="clear" onClick={goToNext}>
                <IonIcon slot="icon-only" icon={chevronForward} />
              </IonButton>
            </IonCol>
          </IonRow>
        </IonGrid>
        
        {/* 日历网格 */}
        <IonGrid>
          {viewMode === 'month' && (
            <IonRow>
              {['日', '一', '二', '三', '四', '五', '六'].map(day => (
                <IonCol size="12/7" className="ion-text-center" key={day}>
                  <strong>{day}</strong>
                </IonCol>
              ))}
            </IonRow>
          )}
          
          <IonRow>
            {calendarDates.map((dateInfo) => (
              <IonCol 
                size={viewMode === 'month' ? '12/7' : '12/7'} 
                className="ion-text-center" 
                key={dateInfo.dateString}
              >
                <div
                  className={`calendar-day ${
                    hasWorkout(dateInfo.dateString) ? 'calendar-day-with-workout' : ''
                  } ${
                    dateInfo.dateString === selectedDate ? 'calendar-day-selected' : ''
                  }`}
                  onClick={() => selectDate(dateInfo.dateString)}
                >
                  {viewMode === 'week' && (
                    <div style={{ fontSize: '0.8rem' }}>{dateInfo.weekday}</div>
                  )}
                  <div>{dateInfo.day}</div>
                </div>
              </IonCol>
            ))}
          </IonRow>
        </IonGrid>
        
        {/* 选中日期的健身安排 */}
        <div className="section-title">
          {formatDate(selectedDate, 'YYYY年M月D日 (ddd)')} 的健身安排
        </div>
        
        {dateWorkouts.length > 0 ? (
          <IonList>
            {dateWorkouts.map(workout => {
              const plan = plans.find(p => p.id === workout.planId);
              return (
                <IonItem key={workout.id} button onClick={() => openWorkoutOptions(workout)}>
                  <IonIcon icon={calendarOutline} slot="start" color="primary" />
                  <IonLabel>
                    <h2>{plan ? plan.name : workout.name || '健身计划'}</h2>
                    <p>
                      {plan && plan.exercises 
                        ? `${plan.exercises.length} 个动作` 
                        : '未知动作数'
                      }
                    </p>
                  </IonLabel>
                  <IonIcon icon={ellipsisHorizontal} slot="end" />
                </IonItem>
              );
            })}
          </IonList>
        ) : (
          <IonCard className="workout-card">
            <IonCardContent>
              <EmptyState 
                icon={calendarOutline}
                message="没有安排健身计划"
                actionText="添加健身"
                onAction={() => setShowAddModal(true)}
              />
            </IonCardContent>
          </IonCard>
        )}
        
        {/* 添加健身按钮 */}
        <div style={{ padding: '16px' }}>
          <IonButton 
            expand="block" 
            onClick={() => setShowAddModal(true)}
          >
            <IonIcon slot="start" icon={addOutline} />
            添加健身计划
          </IonButton>
        </div>
        
        {/* 健身安排选项 */}
        <IonActionSheet
          isOpen={showOptionsSheet}
          onDidDismiss={() => {
            setShowOptionsSheet(false);
          }}
          header="健身计划选项"
          buttons={[
            {
              text: '开始健身',
              icon: arrowForwardOutline,
              handler: () => {
                if (selectedWorkout) {
                  startWorkout(selectedWorkout.id);
                }
              }
            },
            {
              text: '查看计划详情',
              icon: calendarOutline,
              handler: () => {
                if (selectedWorkout && selectedWorkout.planId) {
                  viewPlanDetails(selectedWorkout.planId);
                }
              }
            },
            {
              text: '设置提醒',
              icon: notificationsOutline,
              handler: openReminderSettings
            },
            {
              text: '删除安排',
              role: 'destructive',
              icon: trashOutline,
              handler: confirmDeleteWorkout
            },
            {
              text: '取消',
              role: 'cancel',
              icon: closeOutline,
              handler: () => {
                setSelectedWorkout(null);
              }
            }
          ]}
        />
        
        {/* 删除确认 */}
        <IonAlert
          isOpen={showDeleteAlert}
          onDidDismiss={() => setShowDeleteAlert(false)}
          header="确认删除"
          message={`确定要删除这个健身安排吗？${selectedWorkout ? '(' + (selectedWorkout.name || '未命名计划') + ')' : ''}`}
          buttons={[
            {
              text: '取消',
              role: 'cancel',
              handler: () => {
                console.log('取消删除');
                setShowDeleteAlert(false);
                setSelectedWorkout(null);
              }
            },
            {
              text: '删除',
              role: 'destructive',
              handler: () => {
                console.log('确认删除');
                handleDeleteWorkout();
              }
            }
          ]}
        />
        
        {/* 添加健身计划模态框 */}
        <IonModal isOpen={showAddModal} onDidDismiss={() => setShowAddModal(false)}>
          <IonToolbar>
            <IonTitle>添加健身计划</IonTitle>
            <IonButtons slot="end">
              <IonButton onClick={() => setShowAddModal(false)}>
                <IonIcon icon={closeOutline} />
              </IonButton>
            </IonButtons>
          </IonToolbar>
          
          <IonContent>
            <div style={{ padding: '16px' }}>
              <h4>选择日期: {formatDate(selectedDate, 'YYYY年M月D日 (ddd)')}</h4>
              
              <IonItem className="form-group">
                <IonLabel position="stacked">选择健身计划</IonLabel>
                <IonSelect 
                  value={selectedPlanId} 
                  onIonChange={e => setSelectedPlanId(e.detail.value)}
                  placeholder="选择一个健身计划"
                >
                  {plans.map(plan => (
                    <IonSelectOption key={plan.id} value={plan.id}>
                      {plan.name}
                    </IonSelectOption>
                  ))}
                </IonSelect>
              </IonItem>
              
              <IonButton 
                expand="block" 
                color="primary"
                onClick={handleAddWorkout}
                disabled={!selectedPlanId}
                style={{ marginTop: '16px' }}
              >
                添加到日历
              </IonButton>
              
              <IonButton 
                expand="block" 
                fill="outline"
                routerLink="/plan/create"
                style={{ marginTop: '16px' }}
              >
                创建新计划
              </IonButton>
            </div>
          </IonContent>
        </IonModal>

        {/* 提醒设置模态框 */}
        <IonModal isOpen={showReminderModal} onDidDismiss={() => setShowReminderModal(false)}>
          <IonToolbar>
            <IonTitle>提醒设置</IonTitle>
            <IonButtons slot="end">
              <IonButton onClick={() => setShowReminderModal(false)}>
                <IonIcon icon={closeOutline} />
              </IonButton>
            </IonButtons>
          </IonToolbar>
          
          <IonContent>
            <div style={{ padding: '16px' }}>
              <h4>健身提醒</h4>
              
              <IonItem>
                <IonLabel>启用提醒</IonLabel>
                <IonToggle 
                  checked={reminderEnabled} 
                  onIonChange={e => setReminderEnabled(e.detail.checked)} 
                />
              </IonItem>
              
              {reminderEnabled && (
                <div style={{ marginTop: '16px' }}>
                  {/* 提醒方式选择 */}
                  <IonItem>
                    <IonLabel>提醒方式</IonLabel>
                    <IonSelect 
                      value={useSpecificTime ? 'specificTime' : 'beforeEvent'}
                      onIonChange={e => setUseSpecificTime(e.detail.value === 'specificTime')}
                    >
                      <IonSelectOption value="specificTime">指定时间提醒</IonSelectOption>
                      <IonSelectOption value="beforeEvent">提前时间提醒</IonSelectOption>
                    </IonSelect>
                  </IonItem>
                  
                  {useSpecificTime ? (
                    // 指定时间提醒
                    <IonItem>
                      <IonLabel>提醒时间</IonLabel>
                      <IonInput
                        type="time"
                        value={reminderTime}
                        onIonChange={e => setReminderTime(e.detail.value)}
                        style={{ textAlign: 'right' }}
                        placeholder="09:00"
                      />
                    </IonItem>
                  ) : (
                    // 提前时间提醒
                    <>
                      <IonItem>
                        <IonLabel>提前提醒时间</IonLabel>
                        <IonNote slot="end">{reminderMinutes} 分钟</IonNote>
                      </IonItem>
                      
                      <IonItem>
                        <IonRange 
                          min={5} 
                          max={120} 
                          step={5} 
                          value={reminderMinutes}
                          onIonChange={e => setReminderMinutes(e.detail.value)}
                        >
                          <IonIcon slot="start" icon={timeOutline} />
                          <IonIcon slot="end" icon={notificationsOutline} />
                        </IonRange>
                      </IonItem>
                      
                      <div style={{ textAlign: 'center', margin: '16px 0', color: 'var(--ion-color-medium)' }}>
                        将在健身开始前 {reminderMinutes} 分钟提醒您
                      </div>
                    </>
                  )}
                  
                  {useSpecificTime && (
                    <div style={{ textAlign: 'center', margin: '16px 0', color: 'var(--ion-color-medium)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <IonIcon icon={alarmOutline} style={{ marginRight: '8px' }} />
                      将在每天 {reminderTime} 提醒您
                    </div>
                  )}
                </div>
              )}
              
              <IonButton 
                expand="block" 
                color="primary"
                onClick={saveReminderSettings}
                style={{ marginTop: '16px' }}
              >
                保存设置
              </IonButton>
            </div>
          </IonContent>
        </IonModal>
      </IonContent>
  );
};

export default WorkoutCalendar;