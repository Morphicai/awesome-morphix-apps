import React, { useState, useEffect } from 'react';
import { 
  IonApp, 
  IonContent, 
  IonPage, 
  IonTabs,
  IonTab,
  IonTabBar, 
  IonTabButton, 
  IonIcon, 
  IonLabel,
  IonRouterOutlet,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardTitle,
  IonButton,
  IonList,
  IonItem,
  IonFab,
  IonFabButton,
  IonInput,
  IonTextarea,
  IonAlert,
  IonFooter,
  IonSearchbar,
  IonChip,
  IonBadge
} from '@ionic/react';
import { IonReactHashRouter } from '@ionic/react-router';
import { Switch, Route, Redirect, useHistory, useParams } from 'react-router-dom';
import { PageHeader } from '@morphixai/components';
import dayjs from 'dayjs';
import { 
  calendar, 
  barbell, 
  statsChart, 
  bookmark, 
  home, 
  addOutline,
  timeOutline,
  arrowForwardOutline,
  searchOutline,
  listOutline
} from 'ionicons/icons';
import AppSdk from '@morphixai/app-sdk';
import { reportError } from '@morphixai/lib';

import './styles/global.css';
import useStore from './utils/store';
import useLanguage from './utils/useLanguage';
import CreatePlan from './components/CreatePlan';
import LoadingSpinner from './components/LoadingSpinner';
import HomePage from './components/HomePage';
import PlanLibrary from './components/PlanLibrary';
import StatsPage from './components/StatsPage';
import PlanExecution from './components/PlanExecution';
import WorkoutCalendar from './components/WorkoutCalendar';

// 计划详情组件
const PlanDetail = () => {
  const history = useHistory();
  const { id } = useParams();
  const { getPlanById, loadPlans, isLoading, scheduleWorkout, scheduledWorkouts, loadScheduledWorkouts } = useStore();
  const { t } = useLanguage();
  const [plan, setPlan] = useState(null);
  
  useEffect(() => {
    Promise.all([loadPlans(), loadScheduledWorkouts()]).then(() => {
      const planData = getPlanById(id);
      setPlan(planData);
    });
  }, [id, loadPlans, loadScheduledWorkouts, getPlanById]);
  
  const startWorkout = async () => {
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
        const scheduleData = {
          planId: id,
          date: new Date().toISOString(),
          name: plan.name
        };
        
        const result = await scheduleWorkout(scheduleData);
        if (result && result.id) {
          history.push(`/execute/${result.id}`);
        }
      }
    } catch (error) {
      console.error('开始健身失败:', error);
    }
  };
  
  if (isLoading || !plan) {
    return (
      <IonPage>
        <PageHeader title={t('headers.planDetail')} />
        <IonContent>
          <LoadingSpinner message={t('loading.planDetails')} />
        </IonContent>
      </IonPage>
    );
  }
  
  // 根据部位获取标签类名和翻译
  const getBodyPartClass = (part) => {
    const partMap = {
      '胸部': 'chest',
      '背部': 'back',
      '腿部': 'legs',
      '肩部': 'shoulders',
      '手臂': 'arms',
      'Chest': 'chest',
      'Back': 'back',
      'Legs': 'legs',
      'Shoulders': 'shoulders',
      'Arms': 'arms'
    };
    return partMap[part] || '';
  };
  
  const translateBodyPart = (part) => {
    const partKeyMap = {
      '胸部': 'chest',
      '背部': 'back',
      '腿部': 'legs',
      '肩部': 'shoulders',
      '手臂': 'arms',
      'Chest': 'chest',
      'Back': 'back',
      'Legs': 'legs',
      'Shoulders': 'shoulders',
      'Arms': 'arms'
    };
    const key = partKeyMap[part];
    return key ? t(`bodyParts.${key}`) : part;
  };
  
  return (
    <IonPage>
      <PageHeader title={plan.name} />
      <IonContent>
        <IonCard className="workout-card">
          <IonCardHeader>
            <IonCardTitle>{plan.name}</IonCardTitle>
          </IonCardHeader>
          <IonCardContent>
            {plan.description && <p>{plan.description}</p>}
            
            {plan.bodyParts && plan.bodyParts.length > 0 && (
              <div style={{ marginTop: '8px', display: 'flex', flexWrap: 'wrap' }}>
                {plan.bodyParts.map((part, idx) => (
                  <div key={idx} className={`body-part-tag ${getBodyPartClass(part)}`}>
                    {translateBodyPart(part)}
                  </div>
                ))}
              </div>
            )}
          </IonCardContent>
        </IonCard>
        
        <div className="section-title">{t('plans.exerciseList')}</div>
        <IonList>
          {plan.exercises && plan.exercises.map((exercise, index) => (
            <IonItem key={exercise.id || index} className="exercise-list-item">
              <div style={{ marginRight: '12px' }}>
                <div style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  backgroundColor: 'rgba(123, 104, 238, 0.1)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--ion-color-primary)',
                  fontWeight: 'bold'
                }}>
                  {index + 1}
                </div>
              </div>
              <IonLabel>
                <h2 style={{ fontWeight: '600' }}>{exercise.name}</h2>
                <div className="exercise-detail">
                  <span>{exercise.sets} {t('createPlan.sets')} × {exercise.reps} {t('createPlan.reps')}</span>
                  {exercise.weight > 0 && (
                    <span style={{ marginLeft: '8px' }}>• {exercise.weight} {t('createPlan.weightUnit')}</span>
                  )}
                </div>
              </IonLabel>
            </IonItem>
          ))}
        </IonList>
        
        <div style={{ padding: '16px' }}>
          <IonButton 
            expand="block" 
            color="primary"
            className="action-button"
            onClick={startWorkout}
          >
            {t('plans.startWorkout')}
          </IonButton>
        </div>
      </IonContent>
    </IonPage>
  );
};

// 主标签页组件
function MainTabs() {
  const history = useHistory();
  const { t } = useLanguage();
  
  const handleAddPlan = () => {
    history.push('/plan/create');
  };
  
  return (
    <IonTabs>
      <IonTab tab="home">
        <IonPage>
          <PageHeader title={t('headers.fitnessAssistant')} />
          <HomePage onAddPlan={handleAddPlan} />
        </IonPage>
      </IonTab>
      
      <IonTab tab="calendar">
        <IonPage>
          <PageHeader title={t('headers.fitnessCalendar')} />
          <WorkoutCalendar />
        </IonPage>
      </IonTab>
      
      <IonTab tab="plans">
        <IonPage>
          <PageHeader title={t('headers.fitnessPlans')} />
          <PlanLibrary onAddPlan={handleAddPlan} />
        </IonPage>
      </IonTab>
      
      <IonTab tab="stats">
        <IonPage>
          <PageHeader title={t('headers.fitnessStats')} />
          <StatsPage />
        </IonPage>
      </IonTab>

      <IonTabBar slot="bottom">
        <IonTabButton tab="home">
          <IonIcon icon={home} />
          <IonLabel>{t('tabs.home')}</IonLabel>
        </IonTabButton>
        
        <IonTabButton tab="calendar">
          <IonIcon icon={calendar} />
          <IonLabel>{t('tabs.calendar')}</IonLabel>
        </IonTabButton>
        
        <IonTabButton tab="plans">
          <IonIcon icon={barbell} />
          <IonLabel>{t('tabs.plans')}</IonLabel>
        </IonTabButton>
        
        <IonTabButton tab="stats">
          <IonIcon icon={statsChart} />
          <IonLabel>{t('tabs.stats')}</IonLabel>
        </IonTabButton>
      </IonTabBar>
    </IonTabs>
  );
}

// 主应用组件
export default function App() {
  const { initLanguage } = useLanguage();
  
  // 初始化语言
  useEffect(() => {
    initLanguage();
  }, [initLanguage]);
  
  return (
    <IonApp>
      <IonReactHashRouter>
        <Switch>
          <Route path="/plan/create" component={CreatePlan} />
          <Route path="/plan/edit/:id" component={CreatePlan} />
          <Route path="/plan/:id" component={PlanDetail} />
          <Route path="/execute/:id" component={PlanExecution} />
          <Route path="/tabs" component={MainTabs} />
          <Route exact path="/" render={() => <Redirect to="/tabs" />} />
        </Switch>
      </IonReactHashRouter>
    </IonApp>
  );
}