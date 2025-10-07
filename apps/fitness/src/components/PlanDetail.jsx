import React, { useEffect, useState } from 'react';
import { 
  IonContent, 
  IonCard, 
  IonCardHeader, 
  IonCardTitle, 
  IonCardContent,
  IonButton,
  IonIcon,
  IonList,
  IonItem,
  IonLabel,
  IonButtons,
  IonFab,
  IonFabButton,
  IonActionSheet,
  IonDatetime,
  IonModal,
  IonToolbar,
  IonTitle,
  IonAlert
} from '@ionic/react';
import { 
  calendarOutline, 
  timeOutline, 
  createOutline,
  ellipsisHorizontal,
  playOutline,
  copyOutline,
  trashOutline,
  closeOutline
} from 'ionicons/icons';
import { Header } from '@morphicai/components';
import { useParams, useHistory } from 'react-router-dom';
import dayjs from 'dayjs';

import useStore from '../utils/store';
import { calculatePlanDuration, formatDate } from '../utils/helpers';
import LoadingSpinner from './LoadingSpinner';
import ExerciseItem from './ExerciseItem';

const PlanDetail = () => {
  const { id } = useParams();
  const history = useHistory();
  const { 
    getPlanById, 
    loadPlans, 
    deletePlan, 
    savePlanAsTemplate,
    scheduleWorkout,
    scheduledWorkouts,
    loadScheduledWorkouts,
    isLoading 
  } = useStore();
  
  const [plan, setPlan] = useState(null);
  const [showActions, setShowActions] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState(dayjs().format('YYYY-MM-DD'));
  const [estimatedDuration, setEstimatedDuration] = useState(0);
  const [showDeleteAlert, setShowDeleteAlert] = useState(false);
  
  useEffect(() => {
    Promise.all([loadPlans(), loadScheduledWorkouts()]).then(() => {
      const planData = getPlanById(id);
      setPlan(planData);
      
      if (planData) {
        setEstimatedDuration(calculatePlanDuration(planData));
      }
    });
  }, [id, loadPlans, loadScheduledWorkouts, getPlanById]);
  
  const navigateToEditPlan = () => {
    history.push(`/edit-plan/${id}`);
  };
  
  const navigateToExecution = async () => {
    try {
      const today = dayjs().format('YYYY-MM-DD');
      
      // 检查今天是否已有相同计划的安排
      const todayWorkouts = scheduledWorkouts.filter(workout => 
        workout.planId === id && 
        workout.date && 
        workout.date.split('T')[0] === today
      );
      
      if (todayWorkouts.length > 0) {
        // 如果已有安排，直接使用现有的
        history.push(`/execute/${todayWorkouts[0].id}`);
      } else {
        // 如果没有安排，创建新的（不设置提醒）
        const scheduleId = await handleScheduleWorkout(today, false);
        if (scheduleId) {
          history.push(`/execute/${scheduleId}`);
        }
      }
    } catch (error) {
      console.error('开始健身失败:', error);
    }
  };
  
  const handleDateSelect = (e) => {
    const dateValue = e.detail.value.split('T')[0];
    setSelectedDate(dateValue);
    setShowDatePicker(false);
    handleScheduleWorkout(dateValue);
  };
  
  const handleScheduleWorkout = async (date, createReminder = true) => {
    try {
      const scheduleData = {
        planId: id,
        date: date,
        name: plan.name
      };
      
      // 根据是否需要创建提醒来设置选项
      const reminderOptions = createReminder ? {
        reminderTime: '09:00',
        minutesBefore: 0
      } : null;
      
      const result = await scheduleWorkout(scheduleData, reminderOptions);
      
      return result.id;
    } catch (error) {
      console.error('安排健身失败:', error);
      return null;
    }
  };
  
  const handleSaveAsTemplate = async () => {
    try {
      await savePlanAsTemplate(id);
    } catch (error) {
      console.error('保存为模板失败:', error);
    }
  };
  
  const confirmDeletePlan = () => {
    setShowDeleteAlert(true);
  };
  
  const handleDeletePlan = async () => {
    try {
      await deletePlan(id);
      history.goBack();
    } catch (error) {
      console.error('删除计划失败:', error);
    }
  };
  
  if (isLoading || !plan) {
    return <LoadingSpinner message="加载计划详情..." />;
  }
  
  return (
    <>
      <Header title={plan.name} />
      <IonContent>
        <IonCard className="workout-card">
          <IonCardHeader className="workout-card-header">
            <IonCardTitle>{plan.name}</IonCardTitle>
            <IonButtons slot="end">
              <IonButton onClick={() => setShowActions(true)}>
                <IonIcon slot="icon-only" icon={ellipsisHorizontal} />
              </IonButton>
            </IonButtons>
          </IonCardHeader>
          <IonCardContent>
            {plan.description && (
              <p>{plan.description}</p>
            )}
            <div className="plan-meta">
              <IonItem lines="none">
                <IonIcon icon={timeOutline} slot="start" color="medium" />
                <IonLabel>
                  估计时长: {estimatedDuration} 分钟
                </IonLabel>
              </IonItem>
              <IonItem lines="none">
                <IonIcon icon={calendarOutline} slot="start" color="medium" />
                <IonLabel>
                  创建于: {formatDate(plan.createdAt, 'YYYY年MM月DD日')}
                </IonLabel>
              </IonItem>
            </div>
          </IonCardContent>
        </IonCard>
        
        <div className="section-title">动作列表</div>
        <IonList>
          {plan.exercises && plan.exercises.map((exercise, index) => (
            <ExerciseItem 
              key={exercise.id || index} 
              exercise={exercise} 
              onClick={() => {}}
            />
          ))}
        </IonList>
        
        <div className="button-container" style={{ padding: '16px' }}>
          <IonButton 
            expand="block" 
            color="primary"
            onClick={() => setShowDatePicker(true)}
          >
            <IonIcon slot="start" icon={calendarOutline} />
            安排到日历
          </IonButton>
          
          <IonButton 
            expand="block" 
            color="secondary"
            onClick={navigateToExecution}
            style={{ marginTop: '8px' }}
          >
            <IonIcon slot="start" icon={playOutline} />
            立即开始
          </IonButton>
        </div>
        
        <IonFab vertical="bottom" horizontal="end" slot="fixed">
          <IonFabButton onClick={navigateToEditPlan} className="fab-button">
            <IonIcon icon={createOutline} />
          </IonFabButton>
        </IonFab>
        
        <IonActionSheet
          isOpen={showActions}
          onDidDismiss={() => setShowActions(false)}
          buttons={[
            {
              text: '编辑计划',
              icon: createOutline,
              handler: navigateToEditPlan
            },
            {
              text: '保存为模板',
              icon: copyOutline,
              handler: handleSaveAsTemplate
            },
            {
              text: '删除计划',
              role: 'destructive',
              icon: trashOutline,
              handler: confirmDeletePlan
            },
            {
              text: '取消',
              role: 'cancel',
              icon: closeOutline
            }
          ]}
        />
        
        <IonModal isOpen={showDatePicker} onDidDismiss={() => setShowDatePicker(false)}>
          <IonToolbar>
            <IonTitle>选择日期</IonTitle>
            <IonButtons slot="end">
              <IonButton onClick={() => setShowDatePicker(false)}>
                <IonIcon icon={closeOutline} />
              </IonButton>
            </IonButtons>
          </IonToolbar>
          <IonContent>
            <IonDatetime 
              value={selectedDate} 
              onIonChange={handleDateSelect}
              presentation="date"
              min={dayjs().format('YYYY-MM-DD')}
              max={dayjs().add(1, 'year').format('YYYY-MM-DD')}
              style={{ width: '100%' }}
            />
          </IonContent>
        </IonModal>
        
        <IonAlert
          isOpen={showDeleteAlert}
          onDidDismiss={() => setShowDeleteAlert(false)}
          header="确认删除"
          message={`确定要删除"${plan.name}"吗？此操作无法撤销。`}
          buttons={[
            {
              text: '取消',
              role: 'cancel'
            },
            {
              text: '删除',
              role: 'destructive',
              handler: handleDeletePlan
            }
          ]}
        />
      </IonContent>
    </>
  );
};

export default PlanDetail;