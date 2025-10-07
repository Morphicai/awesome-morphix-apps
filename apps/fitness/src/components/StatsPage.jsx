import React, { useState, useEffect, useRef } from 'react';
import { 
  IonContent, 
  IonCard, 
  IonCardHeader, 
  IonCardTitle, 
  IonCardContent,
  IonList,
  IonItem,
  IonLabel,
  IonIcon,
  IonSegment,
  IonSegmentButton,
  IonBadge,
  IonGrid,
  IonRow,
  IonCol
} from '@ionic/react';
import { 
  barbellOutline, 
  timeOutline, 
  calendarOutline,
  trendingUpOutline,
  fitnessOutline,
  repeatOutline,
  analyticsOutline
} from 'ionicons/icons';
import dayjs from 'dayjs';

import useStore from '../utils/store';
import { calculateWorkoutStats, groupRecordsByDate, formatDate } from '../utils/helpers';
import LoadingSpinner from './LoadingSpinner';
import EmptyState from './EmptyState';

const StatsPage = () => {
  const { 
    loadWorkoutRecords, 
    workoutRecords,
    isLoading 
  } = useStore();
  
  const [timeRange, setTimeRange] = useState('month');
  const [stats, setStats] = useState(null);
  const [groupedRecords, setGroupedRecords] = useState([]);
  const [weightChart, setWeightChart] = useState(null);
  const [frequencyChart, setFrequencyChart] = useState(null);
  const progressRef = useRef(null);
  
  useEffect(() => {
    loadWorkoutRecords();
  }, [loadWorkoutRecords]);
  
  // 根据时间范围筛选记录
  useEffect(() => {
    if (workoutRecords.length > 0) {
      let filteredRecords = [];
      const now = dayjs();
      
      switch (timeRange) {
        case 'week':
          filteredRecords = workoutRecords.filter(record => 
            dayjs(record.completedAt).isAfter(now.subtract(7, 'day'))
          );
          break;
        case 'month':
          filteredRecords = workoutRecords.filter(record => 
            dayjs(record.completedAt).isAfter(now.subtract(30, 'day'))
          );
          break;
        case 'year':
          filteredRecords = workoutRecords.filter(record => 
            dayjs(record.completedAt).isAfter(now.subtract(365, 'day'))
          );
          break;
        default:
          filteredRecords = [...workoutRecords];
      }
      
      // 计算统计数据
      const calculatedStats = calculateWorkoutStats(filteredRecords);
      setStats(calculatedStats);
      
      // 分组记录
      const grouped = groupRecordsByDate(filteredRecords);
      setGroupedRecords(grouped);
      
      // 准备图表数据
      prepareChartData(filteredRecords);
      
      // 绘制圆形进度条
      if (calculatedStats) {
        drawProgressCircle(calculatedStats);
      }
    }
  }, [workoutRecords, timeRange]);
  
  const handleRangeChange = (event) => {
    setTimeRange(event.detail.value);
  };
  
  const drawProgressCircle = (statsData) => {
    if (!progressRef.current) return;
    
    const canvas = progressRef.current;
    const ctx = canvas.getContext('2d');
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radius = 50;
    
    // 清除画布
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // 计算完成率（这里使用虚拟数据）
    const completionRate = Math.min(statsData.totalWorkouts / 30, 1);
    
    // 绘制底圆
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
    ctx.strokeStyle = '#E0E0E0';
    ctx.lineWidth = 10;
    ctx.stroke();
    
    // 绘制进度圆弧
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, -Math.PI / 2, -Math.PI / 2 + (2 * Math.PI * completionRate));
    ctx.strokeStyle = getComputedStyle(document.documentElement).getPropertyValue('--ion-color-primary');
    ctx.lineWidth = 10;
    ctx.stroke();
  };
  
  const prepareChartData = async (records) => {
    if (!records || records.length === 0) return;
    
    try {
      // 动态导入图表库
      const Chart = await remoteImport('chart.js/auto');
      
      // 清除现有图表
      if (weightChart) {
        weightChart.destroy();
      }
      if (frequencyChart) {
        frequencyChart.destroy();
      }
      
      // 准备重量趋势数据
      const exerciseWeights = {};
      
      records.forEach(record => {
        if (record.exercises) {
          record.exercises.forEach(exercise => {
            if (!exerciseWeights[exercise.name]) {
              exerciseWeights[exercise.name] = [];
            }
            
            // 使用最大重量
            const maxWeight = Math.max(...(exercise.weights || [0]));
            
            exerciseWeights[exercise.name].push({
              date: dayjs(record.completedAt).format('MM-DD'),
              weight: maxWeight
            });
          });
        }
      });
      
      // 选择前3个最常见的练习
      const exerciseNames = Object.keys(exerciseWeights);
      const topExercises = exerciseNames
        .sort((a, b) => exerciseWeights[b].length - exerciseWeights[a].length)
        .slice(0, 3);
      
      // 创建重量趋势图表
      if (topExercises.length > 0) {
        const weightCtx = document.getElementById('weightChart');
        
        if (weightCtx) {
          const datasets = topExercises.map((name, index) => {
            const data = exerciseWeights[name]
              .sort((a, b) => new Date(a.date) - new Date(b.date))
              .map(item => ({ x: item.date, y: item.weight }));
            
            // 使用与图片相似的配色
            const colors = ['#7B68EE', '#5AC8FA', '#4CD964'];
            
            return {
              label: name,
              data: data,
              borderColor: colors[index % colors.length],
              backgroundColor: colors[index % colors.length] + '33',
              tension: 0.4,
              fill: false,
              borderWidth: 2,
              pointRadius: 3,
              pointBackgroundColor: colors[index % colors.length]
            };
          });
          
          const newWeightChart = new Chart(weightCtx, {
            type: 'line',
            data: {
              datasets
            },
            options: {
              responsive: true,
              maintainAspectRatio: false,
              scales: {
                y: {
                  title: {
                    display: true,
                    text: '重量 (kg)'
                  },
                  grid: {
                    drawBorder: false,
                    color: 'rgba(200, 200, 200, 0.1)'
                  }
                },
                x: {
                  grid: {
                    display: false
                  }
                }
              },
              plugins: {
                legend: {
                  position: 'top',
                  labels: {
                    boxWidth: 12,
                    usePointStyle: true,
                    pointStyle: 'circle'
                  }
                }
              }
            }
          });
          
          setWeightChart(newWeightChart);
        }
      }
      
      // 准备健身频率数据
      const workoutDates = records.map(record => 
        dayjs(record.completedAt).format('YYYY-MM-DD')
      );
      
      // 计算每天的健身次数
      const frequencyData = {};
      workoutDates.forEach(date => {
        frequencyData[date] = (frequencyData[date] || 0) + 1;
      });
      
      // 创建频率图表
      const frequencyCtx = document.getElementById('frequencyChart');
      
      if (frequencyCtx && Object.keys(frequencyData).length > 0) {
        const sortedDates = Object.keys(frequencyData).sort();
        
        const newFrequencyChart = new Chart(frequencyCtx, {
          type: 'bar',
          data: {
            labels: sortedDates.map(date => formatDate(date, 'MM-DD')),
            datasets: [{
              label: '健身次数',
              data: sortedDates.map(date => frequencyData[date]),
              backgroundColor: '#7B68EE',
              borderColor: '#7B68EE',
              borderWidth: 0,
              borderRadius: 4
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
              y: {
                beginAtZero: true,
                title: {
                  display: true,
                  text: '次数'
                },
                ticks: {
                  stepSize: 1
                },
                grid: {
                  drawBorder: false,
                  color: 'rgba(200, 200, 200, 0.1)'
                }
              },
              x: {
                grid: {
                  display: false
                }
              }
            },
            plugins: {
              legend: {
                display: false
              }
            }
          }
        });
        
        setFrequencyChart(newFrequencyChart);
      }
    } catch (error) {
      console.error('加载图表库失败:', error);
    }
  };
  
  if (isLoading && workoutRecords.length === 0) {
    return <LoadingSpinner message="加载统计数据..." />;
  }
  
  return (
    <IonContent>
      {/* 时间范围选择 */}
      <IonSegment value={timeRange} onIonChange={handleRangeChange} className="stats-segment">
        <IonSegmentButton value="week">
          <IonLabel>周</IonLabel>
        </IonSegmentButton>
        <IonSegmentButton value="month">
          <IonLabel>月</IonLabel>
        </IonSegmentButton>
        <IonSegmentButton value="year">
          <IonLabel>年</IonLabel>
        </IonSegmentButton>
        <IonSegmentButton value="all">
          <IonLabel>全部</IonLabel>
        </IonSegmentButton>
      </IonSegment>
      
      {workoutRecords.length > 0 ? (
        <>
          {/* 健身概览 */}
          {stats && (
            <>
              <IonCard className="workout-card">
                <IonCardHeader>
                  <IonCardTitle>健身完成率</IonCardTitle>
                </IonCardHeader>
                <IonCardContent>
                  <div className="circular-progress">
                    <canvas ref={progressRef} width="120" height="120"></canvas>
                    <div className="progress-value">{stats.totalWorkouts}</div>
                  </div>
                  <p className="ion-text-center" style={{ marginTop: '10px', color: 'var(--ion-color-medium)' }}>
                    {timeRange === 'week' ? '本周' : timeRange === 'month' ? '本月' : timeRange === 'year' ? '今年' : '总计'}健身次数
                  </p>
                </IonCardContent>
              </IonCard>
              
              {/* 数据卡片 */}
              <div className="data-grid">
                <div className="data-card">
                  <IonIcon icon={barbellOutline} color="secondary" style={{ fontSize: '24px' }} />
                  <div className="data-value">{stats.totalExercises}</div>
                  <div className="data-label">总练习次数</div>
                </div>
                
                <div className="data-card">
                  <IonIcon icon={timeOutline} color="tertiary" style={{ fontSize: '24px' }} />
                  <div className="data-value">{stats.averageDuration.toFixed(0)}</div>
                  <div className="data-label">平均时长(分钟)</div>
                </div>
                
                <div className="data-card">
                  <IonIcon icon={repeatOutline} color="success" style={{ fontSize: '24px' }} />
                  <div className="data-value">{stats.averageExercisesPerWorkout.toFixed(1)}</div>
                  <div className="data-label">平均练习数</div>
                </div>
                
                <div className="data-card">
                  <IonIcon icon={trendingUpOutline} color="danger" style={{ fontSize: '24px' }} />
                  <div className="data-value">{stats.heaviestWeight}</div>
                  <div className="data-label">最大重量(kg)</div>
                </div>
              </div>
            </>
          )}
          
          {/* 图表 */}
          <div className="section-title">重量趋势</div>
          <div className="chart-container">
            <canvas id="weightChart"></canvas>
          </div>
          
          <div className="section-title">健身频率</div>
          <div className="chart-container">
            <canvas id="frequencyChart"></canvas>
          </div>
          
          {/* 健身记录列表 */}
          <div className="section-title">健身记录</div>
          {groupedRecords.length > 0 ? (
            <IonList>
              {groupedRecords.map(group => (
                <React.Fragment key={group.date}>
                  <IonItem>
                    <IonLabel color="medium">
                      <h2>{formatDate(group.date, 'YYYY年M月D日 (ddd)')}</h2>
                    </IonLabel>
                  </IonItem>
                  
                  {group.records.map(record => (
                    <IonItem key={record.id}>
                      <IonIcon icon={barbellOutline} slot="start" color="primary" />
                      <IonLabel>
                        <h2>{record.planName}</h2>
                        <p>
                          {record.exercises?.length || 0} 个动作 • {record.duration || 0} 分钟
                        </p>
                      </IonLabel>
                    </IonItem>
                  ))}
                </React.Fragment>
              ))}
            </IonList>
          ) : (
            <IonCard className="workout-card">
              <IonCardContent>
                <p className="ion-text-center">选定时间范围内没有健身记录</p>
              </IonCardContent>
            </IonCard>
          )}
        </>
      ) : (
        <EmptyState 
          icon={analyticsOutline}
          message="还没有健身记录"
          actionText="开始健身"
          onAction={() => document.querySelector('ion-tab-button[tab="home"]').click()}
        />
      )}
    </IonContent>
  );
};

export default StatsPage;