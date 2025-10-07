import React, { useState, useEffect } from 'react';
import { 
  IonContent, 
  IonCard, 
  IonCardHeader, 
  IonCardTitle, 
  IonCardContent,
  IonButton,
  IonIcon,
  IonFab,
  IonFabButton,
  IonGrid,
  IonRow,
  IonCol,
  IonItem,
  IonLabel,
  IonBadge,
  IonChip,
  IonRippleEffect,
  IonSkeletonText
} from '@ionic/react';
import { 
  addOutline, 
  arrowForwardOutline, 
  barbellOutline,
  timeOutline,
  calendarOutline,
  trendingUpOutline,
  flameOutline,
  checkmarkCircleOutline,
  fitnessOutline
} from 'ionicons/icons';
import { useHistory } from 'react-router-dom';
import dayjs from 'dayjs';

import useStore from '../utils/store';
import LoadingSpinner from './LoadingSpinner';
import EmptyState from './EmptyState';

const HomePage = ({ onAddPlan }) => {
  const history = useHistory();
  const { plans, workoutRecords, loadPlans, loadWorkoutRecords, isLoading } = useStore();
  const [recentWorkouts, setRecentWorkouts] = useState([]);
  const [todayStats, setTodayStats] = useState({
    completed: 0,
    planned: 0,
    streak: 0
  });
  const [progressPercentage, setProgressPercentage] = useState(0);
  
  useEffect(() => {
    loadPlans();
    loadWorkoutRecords();
  }, [loadPlans, loadWorkoutRecords]);
  
  useEffect(() => {
    if (workoutRecords.length > 0) {
      // 获取最近的5条记录
      const sorted = [...workoutRecords].sort((a, b) => 
        new Date(b.completedAt) - new Date(a.completedAt)
      ).slice(0, 5);
      
      setRecentWorkouts(sorted);
      
      // 计算今日完成的健身计划
      const today = dayjs().format('YYYY-MM-DD');
      const todayCompleted = workoutRecords.filter(record => 
        dayjs(record.completedAt).format('YYYY-MM-DD') === today
      ).length;
      
      // 模拟计算连续健身天数
      let streak = 0;
      const dates = [...new Set(workoutRecords.map(r => 
        dayjs(r.completedAt).format('YYYY-MM-DD')
      ))].sort().reverse();
      
      if (dates.length > 0) {
        streak = 1;
        for (let i = 1; i < dates.length; i++) {
          const prevDate = dayjs(dates[i-1]);
          const currDate = dayjs(dates[i]);
          if (prevDate.diff(currDate, 'day') === 1) {
            streak++;
          } else {
            break;
          }
        }
      }
      
      // 计算进度百分比
      const percentage = plans.length > 0 ? (todayCompleted / plans.length) * 100 : 0;
      setProgressPercentage(Math.min(percentage, 100));
      
      setTodayStats({
        completed: todayCompleted,
        planned: plans.length,
        streak
      });
    }
  }, [workoutRecords, plans]);
  
  const navigateToPlanDetail = (planId) => {
    history.push(`/plan/${planId}`);
  };
  
  // 获取部位标签类名
  const getBodyPartClass = (part) => {
    const partMap = {
      '胸部': 'chest',
      '背部': 'back',
      '腿部': 'legs',
      '肩部': 'shoulders',
      '手臂': 'arms'
    };
    return partMap[part] || '';
  };
  
  if (isLoading) {
    return <LoadingSpinner message="加载健身数据..." />;
  }
  
  return (
    <IonContent>
      {/* 今日概览卡片 */}
      <IonCard className="workout-card">
        <IonCardHeader style={{ paddingBottom: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <IonCardTitle>今日概览</IonCardTitle>
            <div style={{ 
              marginLeft: 'auto', 
              fontSize: '13px', 
              color: 'var(--app-medium-text)',
              display: 'flex',
              alignItems: 'center'
            }}>
              <IonIcon icon={calendarOutline} style={{ marginRight: '4px' }} />
              {dayjs().format('YYYY年MM月DD日')}
            </div>
          </div>
        </IonCardHeader>
        <IonCardContent>
          {/* 进度环 */}
          <div style={{ 
            position: 'relative', 
            height: '120px', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            marginBottom: '16px'
          }}>
            <svg width="120" height="120" viewBox="0 0 120 120">
              {/* 背景圆环 */}
              <circle
                cx="60"
                cy="60"
                r="54"
                fill="none"
                stroke="var(--app-light-bg)"
                strokeWidth="12"
              />
              {/* 进度圆环 */}
              <circle
                cx="60"
                cy="60"
                r="54"
                fill="none"
                stroke="var(--ion-color-primary)"
                strokeWidth="12"
                strokeLinecap="round"
                strokeDasharray={2 * Math.PI * 54}
                strokeDashoffset={2 * Math.PI * 54 * (1 - progressPercentage / 100)}
                transform="rotate(-90 60 60)"

              />
              {/* 中心文字 */}
              <text
                x="60"
                y="55"
                textAnchor="middle"
                dominantBaseline="middle"
                fontSize="24"
                fontWeight="bold"
                fill="var(--ion-color-primary)"
              >
                {todayStats.completed}
              </text>
              <text
                x="60"
                y="75"
                textAnchor="middle"
                dominantBaseline="middle"
                fontSize="12"
                fill="var(--app-medium-text)"
              >
                / {todayStats.planned}
              </text>
            </svg>
          </div>
          
          <IonGrid>
            <IonRow>
              <IonCol size="6">
                <div className="data-card">
                  <IonIcon icon={barbellOutline} color="secondary" style={{ fontSize: '24px' }} />
                  <div className="data-value">{todayStats.planned}</div>
                  <div className="data-label">计划总数</div>
                </div>
              </IonCol>
              <IonCol size="6">
                <div className="data-card">
                  <IonIcon icon={flameOutline} color="tertiary" style={{ fontSize: '24px' }} />
                  <div className="data-value">{todayStats.streak}</div>
                  <div className="data-label">连续天数</div>
                </div>
              </IonCol>
            </IonRow>
          </IonGrid>
        </IonCardContent>
      </IonCard>

      {/* 健身计划列表 */}
      <div className="section-title">健身计划</div>
      {plans.length > 0 ? (
        plans.map((plan, index) => (
          <IonCard 
            className="workout-card" 
            key={plan.id} 
            onClick={() => navigateToPlanDetail(plan.id)}
            style={{ 
              cursor: 'pointer'
            }}
          >
            <IonCardContent style={{ padding: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', marginBottom: '12px' }}>
                <div style={{ 
                  width: '40px', 
                  height: '40px', 
                  borderRadius: '12px', 
                  backgroundColor: 'rgba(123, 104, 238, 0.1)', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  marginRight: '12px'
                }}>
                  <IonIcon icon={barbellOutline} color="primary" style={{ fontSize: '24px' }} />
                </div>
                <div style={{ flex: 1 }}>
                  <h2 style={{ margin: '0 0 4px 0', fontSize: '18px', fontWeight: 'bold' }}>{plan.name}</h2>
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <IonChip style={{ 
                      margin: '0', 
                      height: '20px', 
                      fontSize: '12px',
                      '--background': 'rgba(123, 104, 238, 0.1)',
                      '--color': 'var(--ion-color-primary)',
                      fontWeight: '500'
                    }}>
                      <IonIcon icon={barbellOutline} style={{ marginRight: '4px' }} />
                      {plan.exercises?.length || 0} 动作
                    </IonChip>
                    {plan.estimatedDuration && (
                      <IonChip style={{ 
                        margin: '0 0 0 8px', 
                        height: '20px', 
                        fontSize: '12px',
                        '--background': 'rgba(90, 200, 250, 0.1)',
                        '--color': 'var(--ion-color-secondary)',
                        fontWeight: '500'
                      }}>
                        <IonIcon icon={timeOutline} style={{ marginRight: '4px' }} />
                        {plan.estimatedDuration} 分钟
                      </IonChip>
                    )}
                  </div>
                </div>
                <IonButton 
                  fill="clear"
                  color="primary"
                  style={{ 
                    marginRight: '-8px',
                    '--padding-start': '8px',
                    '--padding-end': '8px'
                  }}
                >
                  <IonIcon slot="icon-only" icon={arrowForwardOutline} />
                </IonButton>
              </div>
              
              {plan.description && (
                <p style={{ 
                  margin: '0', 
                  color: 'var(--app-medium-text)',
                  fontSize: '14px',
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis'
                }}>
                  {plan.description}
                </p>
              )}
              
              {plan.bodyParts && plan.bodyParts.length > 0 && (
                <div style={{ marginTop: '12px', display: 'flex', flexWrap: 'wrap' }}>
                  {plan.bodyParts.map((part, idx) => (
                    <div key={idx} className={`body-part-tag ${getBodyPartClass(part)}`}>
                      {part}
                    </div>
                  ))}
                </div>
              )}
              
              <IonRippleEffect />
            </IonCardContent>
          </IonCard>
        ))
      ) : (
        <EmptyState 
          icon={barbellOutline}
          message="还没有添加健身计划"
          subMessage="创建您的第一个健身计划，开始健身之旅"
          actionText="创建第一个计划"
          onAction={onAddPlan}
        />
      )}
      
      {/* 最近健身记录 */}
      {recentWorkouts.length > 0 && (
        <>
          <div className="section-title">最近健身</div>
          {recentWorkouts.map((workout, index) => (
            <IonCard 
              className="workout-card" 
              key={workout.id}
            >
              <IonCardContent style={{ padding: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <div style={{ 
                      width: '40px', 
                      height: '40px', 
                      borderRadius: '12px', 
                      backgroundColor: 'rgba(76, 217, 100, 0.1)', 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center',
                      marginRight: '12px'
                    }}>
                      <IonIcon icon={checkmarkCircleOutline} color="success" style={{ fontSize: '24px' }} />
                    </div>
                    <div>
                      <h2 style={{ margin: '0 0 4px 0', fontSize: '18px', fontWeight: 'bold' }}>{workout.planName}</h2>
                      <p style={{ margin: '0', color: 'var(--app-medium-text)', fontSize: '13px' }}>
                        {dayjs(workout.completedAt).format('YYYY年MM月DD日 HH:mm')}
                      </p>
                    </div>
                  </div>
                  <IonBadge color="success" style={{ 
                    fontWeight: 'normal', 
                    borderRadius: '50px',
                    padding: '4px 10px'
                  }}>
                    已完成
                  </IonBadge>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', marginTop: '12px' }}>
                  <IonChip style={{ 
                    margin: '0', 
                    height: '20px', 
                    fontSize: '12px',
                    '--background': 'rgba(123, 104, 238, 0.1)',
                    '--color': 'var(--ion-color-primary)',
                    fontWeight: '500'
                  }}>
                    <IonIcon icon={barbellOutline} style={{ marginRight: '4px' }} />
                    {workout.exercises?.length || 0} 动作
                  </IonChip>
                  {workout.duration && (
                    <IonChip style={{ 
                      margin: '0 0 0 8px', 
                      height: '20px', 
                      fontSize: '12px',
                      '--background': 'rgba(90, 200, 250, 0.1)',
                      '--color': 'var(--ion-color-secondary)',
                      fontWeight: '500'
                    }}>
                      <IonIcon icon={timeOutline} style={{ marginRight: '4px' }} />
                      {workout.duration} 分钟
                    </IonChip>
                  )}
                </div>
              </IonCardContent>
            </IonCard>
          ))}
        </>
      )}
      
      <IonFab vertical="bottom" horizontal="end" slot="fixed">
        <IonFabButton className="fab-button" onClick={onAddPlan}>
          <IonIcon icon={addOutline} />
        </IonFabButton>
      </IonFab>
    </IonContent>
  );
};

export default HomePage;