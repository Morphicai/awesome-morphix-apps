import React, { useState, useEffect, useCallback, useRef } from 'react';
import { 
  IonContent, 
  IonCard, 
  IonCardContent,
  IonButton,
  IonIcon,
  IonList,
  IonItem,
  IonLabel,
  IonCheckbox,
  IonChip,
  IonBadge,
  IonProgressBar,
  IonAlert,
  IonToast,
  IonGrid,
  IonRow,
  IonCol,
  IonInput,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButtons,
  IonBackButton,
  IonText
} from '@ionic/react';
import { 
  playOutline, 
  pauseOutline, 
  checkmarkOutline,
  refreshOutline,
  stopOutline,
  timeOutline,
  fitnessOutline,
  barbellOutline,
  volumeHighOutline,
  arrowForwardOutline,
  informationCircleOutline,
  sunnyOutline
} from 'ionicons/icons';
import { PageHeader } from '@morphixai/components';
import { useParams, useHistory } from 'react-router-dom';

import useStore from '../utils/store';
import { formatSeconds } from '../utils/helpers';
import LoadingSpinner from './LoadingSpinner';
import exerciseDatabase from '../utils/exerciseData';

const PlanExecution = () => {
  const { id } = useParams();
  const history = useHistory();
  const { 
    getScheduledWorkoutById, 
    getPlanById, 
    loadPlans, 
    loadScheduledWorkouts,
    updateScheduledWorkout,
    recordWorkout,
    saveWorkoutProgress,
    getWorkoutProgress,
    checkWorkoutRecordExists,
    getWorkoutRecordByScheduleId,
    isLoading 
  } = useStore();
  
  const [scheduledWorkout, setScheduledWorkout] = useState(null);
  const [plan, setPlan] = useState(null);
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [currentSetIndex, setCurrentSetIndex] = useState(0);
  const [exerciseProgress, setExerciseProgress] = useState([]);
  const [timer, setTimer] = useState(0);
  const [timerRunning, setTimerRunning] = useState(false);
  const [restMode, setRestMode] = useState(false);
  const [restDuration, setRestDuration] = useState(0);
  const [workoutComplete, setWorkoutComplete] = useState(false);
  const [showCompleteAlert, setShowCompleteAlert] = useState(false);
  const [showExitAlert, setShowExitAlert] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [startTime, setStartTime] = useState(null);
  const [showExerciseInfo, setShowExerciseInfo] = useState(false);
  const [showContinueWorkoutAlert, setShowContinueWorkoutAlert] = useState(false);
  const [savedProgress, setSavedProgress] = useState(null);
  const [existingRecord, setExistingRecord] = useState(null);
  const [showRecordExistsAlert, setShowRecordExistsAlert] = useState(false);
  const [initializationTimeout, setInitializationTimeout] = useState(false);
  const [wakeLockActive, setWakeLockActive] = useState(false);
  
  const audioRef = useRef(null);
  const timerIntervalRef = useRef(null);
  const saveIntervalRef = useRef(null);
  const wakeLockRef = useRef(null);
  
  // 屏幕常亮相关函数
  const requestWakeLock = async () => {
    try {
      if ('wakeLock' in navigator) {
        wakeLockRef.current = await navigator.wakeLock.request('screen');
        setWakeLockActive(true);
        console.log('屏幕常亮已启用');
        
        wakeLockRef.current.addEventListener('release', () => {
          setWakeLockActive(false);
          console.log('屏幕常亮已释放');
        });
      } else {
        console.warn('当前浏览器不支持屏幕常亮功能');
      }
    } catch (error) {
      console.error('启用屏幕常亮失败:', error);
    }
  };

  const releaseWakeLock = async () => {
    try {
      if (wakeLockRef.current) {
        await wakeLockRef.current.release();
        wakeLockRef.current = null;
        setWakeLockActive(false);
        console.log('屏幕常亮已手动释放');
      }
    } catch (error) {
      console.error('释放屏幕常亮失败:', error);
    }
  };

  // 页面可见性变化处理
  const handleVisibilityChange = async () => {
    if (document.visibilityState === 'visible' && !workoutComplete) {
      // 页面重新可见时，重新请求屏幕常亮
      await requestWakeLock();
    }
  };

  // 获取动作详细信息
  const getExerciseDetails = (exerciseName) => {
    const allExercises = [];
    Object.keys(exerciseDatabase).forEach(categoryId => {
      const category = exerciseDatabase[categoryId];
      category.exercises.forEach(exercise => {
        allExercises.push({
          ...exercise,
          category: {
            id: categoryId,
            name: category.name
          }
        });
      });
    });
    
    return allExercises.find(ex => ex.name === exerciseName) || null;
  };
  
  // 初始化数据
  useEffect(() => {
    const loadData = async () => {
      try {
        console.log('开始加载健身数据，ID:', id);
        
        await Promise.all([loadPlans(), loadScheduledWorkouts()]);
        
        const scheduledData = getScheduledWorkoutById(id);
        console.log('获取到的安排数据:', scheduledData);
        setScheduledWorkout(scheduledData);
        
        if (scheduledData && scheduledData.planId) {
          const planData = getPlanById(scheduledData.planId);
          console.log('获取到的计划数据:', planData);
          setPlan(planData);
          
          if (!planData) {
            console.error('计划数据不存在，ID:', scheduledData.planId);
            return;
          }
          
          // 检查是否已有健身记录
          const existingWorkoutRecord = await checkWorkoutRecordExists(id);
          if (existingWorkoutRecord) {
            console.log('发现已存在的健身记录:', existingWorkoutRecord);
            setExistingRecord(existingWorkoutRecord);
            setShowRecordExistsAlert(true);
            return;
          }
          
          // 检查是否有保存的进度
          const progressData = getWorkoutProgress(id);
          console.log('获取到的保存进度:', progressData);
          
          if (progressData && progressData.progress) {
            setSavedProgress(progressData);
            setShowContinueWorkoutAlert(true);
          } else {
            // 初始化进度跟踪
            if (planData && planData.exercises && planData.exercises.length > 0) {
              const progress = planData.exercises.map((exercise, index) => ({
                exerciseId: exercise.id || `exercise_${index}`,
                name: exercise.name,
                totalSets: exercise.sets || 1,
                completedSets: Array(exercise.sets || 1).fill(false),
                weights: Array(exercise.sets || 1).fill(exercise.weight || 0)
              }));
              
              console.log('初始化练习进度:', progress);
              setExerciseProgress(progress);
            } else {
              console.error('计划数据无效，无法初始化进度:', planData);
            }
          }
        } else {
          console.error('安排数据无效:', scheduledData);
        }
        
        // 记录开始时间
        setStartTime(new Date());
      } catch (error) {
        console.error('加载健身数据失败:', error);
      }
    };
    
    if (id) {
      loadData();
    }
    
    // 初始化音频
    audioRef.current = new Audio('https://assets.mixkit.co/sfx/preview/mixkit-software-interface-start-2574.mp3');
    
    // 启用屏幕常亮
    requestWakeLock();
    
    // 监听页面可见性变化
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
      if (saveIntervalRef.current) {
        clearInterval(saveIntervalRef.current);
      }
      
      // 释放屏幕常亮
      releaseWakeLock();
      
      // 移除事件监听器
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [id, loadPlans, loadScheduledWorkouts, getPlanById, getScheduledWorkoutById, getWorkoutProgress, checkWorkoutRecordExists]);
  
  // 监听计划数据变化，确保进度正确初始化
  useEffect(() => {
    if (plan && plan.exercises && plan.exercises.length > 0 && exerciseProgress.length === 0) {
      // 如果计划已加载但进度未初始化，且没有弹出继续训练的对话框
      if (!showContinueWorkoutAlert && !showRecordExistsAlert) {
        console.log('计划已加载，补充初始化进度');
        const progress = plan.exercises.map((exercise, index) => ({
          exerciseId: exercise.id || `exercise_${index}`,
          name: exercise.name,
          totalSets: exercise.sets || 1,
          completedSets: Array(exercise.sets || 1).fill(false),
          weights: Array(exercise.sets || 1).fill(exercise.weight || 0)
        }));
        
        setExerciseProgress(progress);
      }
    }
  }, [plan, exerciseProgress, showContinueWorkoutAlert, showRecordExistsAlert]);
  
  // 初始化超时检查
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (!exerciseProgress.length && plan && plan.exercises) {
        console.warn('初始化超时，强制初始化进度');
        setInitializationTimeout(true);
        
        // 强制初始化
        const progress = plan.exercises.map((exercise, index) => ({
          exerciseId: exercise.id || `exercise_${index}`,
          name: exercise.name,
          totalSets: exercise.sets || 1,
          completedSets: Array(exercise.sets || 1).fill(false),
          weights: Array(exercise.sets || 1).fill(exercise.weight || 0)
        }));
        
        setExerciseProgress(progress);
      }
    }, 5000); // 5秒超时
    
    return () => clearTimeout(timeout);
  }, [plan, exerciseProgress]);
  
  // 定期保存进度
  useEffect(() => {
    if (plan && exerciseProgress.length > 0 && !workoutComplete) {
      // 每30秒保存一次进度
      saveIntervalRef.current = setInterval(() => {
        const progressToSave = {
          currentExerciseIndex,
          currentSetIndex,
          exerciseProgress,
          timer,
          restMode,
          restDuration
        };
        saveWorkoutProgress(id, progressToSave);
      }, 30000);
      
      return () => {
        if (saveIntervalRef.current) {
          clearInterval(saveIntervalRef.current);
        }
      };
    }
  }, [id, plan, exerciseProgress, currentExerciseIndex, currentSetIndex, timer, restMode, restDuration, workoutComplete, saveWorkoutProgress]);
  
  // 计时器逻辑
  useEffect(() => {
    if (timerRunning) {
      timerIntervalRef.current = setInterval(() => {
        setTimer(t => {
          const newTime = t + 1;
          
          // 如果是休息模式且时间到了休息结束时间
          if (restMode && newTime >= restDuration) {
            // 播放声音提醒
            if (audioRef.current) {
              audioRef.current.play().catch(e => console.error('播放音频失败:', e));
            }
            
            // 显示提示
            setToastMessage('休息时间结束，请继续下一组训练');
            setShowToast(true);
            
            // 自动结束休息
            setRestMode(false);
            setTimerRunning(false);
            return 0;
          }
          
          return newTime;
        });
      }, 1000);
    }
    
    return () => {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
        timerIntervalRef.current = null;
      }
    };
  }, [timerRunning, restMode, restDuration]);
  
  // 检查当前练习和组是否完成
  const checkWorkoutStatus = useCallback(() => {
    if (!exerciseProgress.length || currentExerciseIndex >= exerciseProgress.length) return;
    
    // 检查当前练习的所有组是否完成
    const currentExerciseProgress = exerciseProgress[currentExerciseIndex];
    if (!currentExerciseProgress || !currentExerciseProgress.completedSets) return;
    
    const allSetsCompleted = currentExerciseProgress.completedSets.every(set => set);
    
    if (allSetsCompleted) {
      // 如果是最后一个练习，则整个健身完成
      if (currentExerciseIndex === exerciseProgress.length - 1) {
        console.log('所有练习完成，显示完成提示');
        setWorkoutComplete(true);
        setShowCompleteAlert(true);
        // 健身完成时释放屏幕常亮
        releaseWakeLock();
      } else {
        // 否则，移动到下一个练习
        console.log(`练习 ${currentExerciseIndex + 1} 完成，移动到下一个练习`);
        setCurrentExerciseIndex(prevIndex => prevIndex + 1);
        setCurrentSetIndex(0);
        
        // 开始休息时间
        startRest(true);
      }
    }
  }, [currentExerciseIndex, exerciseProgress]);
  
  // 当练习进度变化时，检查状态
  useEffect(() => {
    checkWorkoutStatus();
  }, [exerciseProgress, checkWorkoutStatus]);
  
  // 确保进度条在数据更新时重新渲染
  useEffect(() => {
    // 强制重新计算进度，确保UI同步
    if (exerciseProgress.length > 0 && plan && plan.exercises) {
      const totalSets = plan.exercises.reduce((sum, exercise) => sum + exercise.sets, 0);
      const completedSets = exerciseProgress.reduce((sum, exercise) => {
        if (!exercise || !Array.isArray(exercise.completedSets)) return sum;
        return sum + exercise.completedSets.filter(Boolean).length;
      }, 0);
      
      // 调试日志，帮助排查问题
      console.log('进度更新:', { 
        totalSets, 
        completedSets, 
        progressPercentage: (completedSets / totalSets) * 100,
        currentExerciseIndex,
        exerciseProgress: exerciseProgress.map(ex => ({
          name: ex.name,
          completedSets: ex.completedSets
        }))
      });
    }
  }, [exerciseProgress, plan, currentExerciseIndex]);
  
  // 开始/暂停计时器
  const toggleTimer = () => {
    setTimerRunning(!timerRunning);
  };
  
  // 重置计时器
  const resetTimer = () => {
    setTimer(0);
    setTimerRunning(false);
  };
  
  // 开始休息时间
  const startRest = (isExerciseRest = false) => {
    setRestMode(true);
    resetTimer();
    setTimerRunning(true);
    
    // 设置休息时间
    const restTime = isExerciseRest 
      ? (plan.exercises[currentExerciseIndex].restAfterExercise || 60)
      : (plan.exercises[currentExerciseIndex].restBetweenSets || 30);
    
    setRestDuration(restTime);
    
    setToastMessage(`休息时间: ${Math.floor(restTime / 60)}分${restTime % 60}秒`);
    setShowToast(true);
  };
  
  // 结束休息时间
  const endRest = () => {
    setRestMode(false);
    resetTimer();
  };
  
  // 标记组完成
  const markSetComplete = (setIndex) => {
    if (!exerciseProgress.length || currentExerciseIndex >= exerciseProgress.length) return;
    
    const updatedProgress = [...exerciseProgress];
    if (!updatedProgress[currentExerciseIndex] || !updatedProgress[currentExerciseIndex].completedSets) return;
    
    updatedProgress[currentExerciseIndex].completedSets[setIndex] = true;
    setExerciseProgress(updatedProgress);
    
    // 更新当前组索引
    if (setIndex < updatedProgress[currentExerciseIndex].totalSets - 1) {
      setCurrentSetIndex(setIndex + 1);
      
      // 如果不是最后一组，开始组间休息
      startRest();
    } else {
      // 最后一组已完成，检查练习状态
      checkWorkoutStatus();
    }
  };
  
  // 更新重量
  const updateWeight = (setIndex, weight) => {
    if (!exerciseProgress.length || currentExerciseIndex >= exerciseProgress.length) return;
    
    const updatedProgress = [...exerciseProgress];
    if (!updatedProgress[currentExerciseIndex] || !updatedProgress[currentExerciseIndex].weights) return;
    
    updatedProgress[currentExerciseIndex].weights[setIndex] = weight;
    setExerciseProgress(updatedProgress);
  };
  
  // 完成健身
  const completeWorkout = async () => {
    try {
      // 计算持续时间（分钟）
      const endTime = new Date();
      const durationMs = endTime - startTime;
      const durationMinutes = Math.round(durationMs / (1000 * 60));
      
      // 准备记录数据
      const recordData = {
        scheduledWorkoutId: id,
        planId: scheduledWorkout.planId,
        planName: plan.name,
        startTime: startTime.toISOString(),
        endTime: endTime.toISOString(),
        duration: durationMinutes,
        exercises: exerciseProgress.map((exercise, index) => {
          const planExercise = plan.exercises[index];
          return {
            id: exercise.exerciseId,
            name: exercise.name,
            sets: exercise.totalSets,
            completedSets: exercise.completedSets.filter(Boolean).length,
            weights: exercise.weights,
            reps: planExercise.reps
          };
        })
      };
      
      // 保存记录
      await recordWorkout(recordData);
      
      // 关闭所有弹窗
      setShowCompleteAlert(false);
      setShowExitAlert(false);
      
      // 释放屏幕常亮
      await releaseWakeLock();
      
      // 显示成功提示
      setToastMessage('健身记录已保存！');
      setShowToast(true);
      
      // 返回首页
      setTimeout(() => {
        history.replace('/tabs');
      }, 1500);
    } catch (error) {
      console.error('保存健身记录失败:', error);
      setToastMessage('保存记录失败，请重试');
      setShowToast(true);
    }
  };

  // 手动退出健身（仅保存进度）
  const exitWorkoutWithProgress = async () => {
    try {
      // 保存当前进度
      const progressToSave = {
        currentExerciseIndex,
        currentSetIndex,
        exerciseProgress,
        timer,
        restMode,
        restDuration
      };
      saveWorkoutProgress(id, progressToSave);
      
      // 关闭弹窗
      setShowExitAlert(false);
      
      // 释放屏幕常亮
      await releaseWakeLock();
      
      // 显示提示
      setToastMessage('进度已保存，下次可继续训练');
      setShowToast(true);
      
      // 返回首页
      setTimeout(() => {
        history.replace('/tabs');
      }, 1500);
    } catch (error) {
      console.error('保存进度失败:', error);
      setToastMessage('保存进度失败');
      setShowToast(true);
    }
  };
  
  // 退出健身
  const exitWorkout = () => {
    setShowExitAlert(true);
  };

  // 查看已存在的健身记录
  const viewExistingRecord = async () => {
    await releaseWakeLock();
    setShowRecordExistsAlert(false);
    history.replace('/tabs');
  };

  // 重新开始健身（忽略已存在记录）
  const restartIgnoreRecord = () => {
    setShowRecordExistsAlert(false);
    setExistingRecord(null);
    
    // 初始化进度跟踪
    if (plan && plan.exercises && plan.exercises.length > 0) {
      const progress = plan.exercises.map((exercise, index) => ({
        exerciseId: exercise.id || `exercise_${index}`,
        name: exercise.name,
        totalSets: exercise.sets || 1,
        completedSets: Array(exercise.sets || 1).fill(false),
        weights: Array(exercise.sets || 1).fill(exercise.weight || 0)
      }));
      
      console.log('重新开始 - 初始化练习进度:', progress);
      setExerciseProgress(progress);
    }
    
    // 重置所有状态
    setCurrentExerciseIndex(0);
    setCurrentSetIndex(0);
    setTimer(0);
    setRestMode(false);
    setRestDuration(0);
    setWorkoutComplete(false);
    
    // 记录开始时间
    setStartTime(new Date());
  };
  
  // 获取动作示范图片
  const getExerciseImage = (exerciseName) => {
    // 这里可以根据动作名称返回相应的图片URL
    // 这里使用简单的映射关系，实际应用中可以使用更复杂的逻辑
    const exerciseImages = {
      '卧推': 'https://static.strengthlevel.com/images/illustrations/bench-press-1000x1000.jpg',
      '深蹲': 'https://static.strengthlevel.com/images/illustrations/squat-1000x1000.jpg',
      '硬拉': 'https://static.strengthlevel.com/images/illustrations/deadlift-1000x1000.jpg',
      '引体向上': 'https://static.strengthlevel.com/images/illustrations/pull-ups-1000x1000.jpg',
      '俯卧撑': 'https://static.strengthlevel.com/images/illustrations/push-ups-1000x1000.jpg',
      '哑铃卧推': 'https://static.strengthlevel.com/images/illustrations/dumbbell-bench-press-1000x1000.jpg',
      '哑铃飞鸟': 'https://static.strengthlevel.com/images/illustrations/dumbbell-fly-1000x1000.jpg',
      '哑铃弯举': 'https://static.strengthlevel.com/images/illustrations/dumbbell-curl-1000x1000.jpg',
      '杠铃弯举': 'https://static.strengthlevel.com/images/illustrations/barbell-curl-1000x1000.jpg',
      '坐姿推肩': 'https://static.strengthlevel.com/images/illustrations/seated-shoulder-press-1000x1000.jpg',
      '侧平举': 'https://static.strengthlevel.com/images/illustrations/lateral-raise-1000x1000.jpg',
      '腿举': 'https://static.strengthlevel.com/images/illustrations/leg-press-1000x1000.jpg',
      '腿屈伸': 'https://static.strengthlevel.com/images/illustrations/leg-extension-1000x1000.jpg'
    };
    
    return exerciseImages[exerciseName] || 'https://static.strengthlevel.com/images/illustrations/bench-press-1000x1000.jpg';
  };
  
  // 继续之前的健身进度
  const continueWorkout = () => {
    if (savedProgress && savedProgress.progress) {
      // 确保进度数据的完整性
      const progressData = savedProgress.progress;
      
      // 恢复练习进度，确保数据结构正确
      if (progressData.exerciseProgress && Array.isArray(progressData.exerciseProgress)) {
        // 验证进度数据的完整性
        const validatedProgress = progressData.exerciseProgress.map((exercise, index) => {
          const planExercise = plan.exercises[index];
          if (!planExercise) return null;
          
          return {
            exerciseId: exercise.exerciseId || planExercise.id,
            name: exercise.name || planExercise.name,
            totalSets: exercise.totalSets || planExercise.sets,
            completedSets: Array.isArray(exercise.completedSets) 
              ? exercise.completedSets.slice(0, planExercise.sets)
              : Array(planExercise.sets).fill(false),
            weights: Array.isArray(exercise.weights)
              ? exercise.weights.slice(0, planExercise.sets)
              : Array(planExercise.sets).fill(planExercise.weight)
          };
        }).filter(Boolean);
        
        setExerciseProgress(validatedProgress);
        
        // 智能计算当前应该在哪个练习和组
        let targetExerciseIndex = 0;
        let targetSetIndex = 0;
        
        // 找到第一个未完全完成的练习
        for (let i = 0; i < validatedProgress.length; i++) {
          const exercise = validatedProgress[i];
          const allSetsCompleted = exercise.completedSets.every(set => set === true);
          
          if (!allSetsCompleted) {
            targetExerciseIndex = i;
            // 找到该练习中第一个未完成的组
            targetSetIndex = exercise.completedSets.findIndex(set => set === false);
            if (targetSetIndex === -1) targetSetIndex = 0;
            break;
          }
        }
        
        // 如果所有练习都完成了，设置为最后一个练习的最后一组
        if (targetExerciseIndex === 0 && validatedProgress.length > 0) {
          const firstExercise = validatedProgress[0];
          const allFirstExerciseSetsCompleted = firstExercise.completedSets.every(set => set === true);
          if (allFirstExerciseSetsCompleted) {
            // 检查是否所有练习都完成了
            const allExercisesCompleted = validatedProgress.every(ex => 
              ex.completedSets.every(set => set === true)
            );
            if (allExercisesCompleted) {
              targetExerciseIndex = validatedProgress.length - 1;
              targetSetIndex = validatedProgress[targetExerciseIndex].completedSets.length - 1;
            }
          }
        }
        
        console.log('恢复进度 - 目标练习:', targetExerciseIndex, '目标组:', targetSetIndex);
        setCurrentExerciseIndex(targetExerciseIndex);
        setCurrentSetIndex(targetSetIndex);
      } else {
        // 如果进度数据无效，重新初始化
        const freshProgress = plan.exercises.map(exercise => ({
          exerciseId: exercise.id,
          name: exercise.name,
          totalSets: exercise.sets,
          completedSets: Array(exercise.sets).fill(false),
          weights: Array(exercise.sets).fill(exercise.weight)
        }));
        setExerciseProgress(freshProgress);
        setCurrentExerciseIndex(0);
        setCurrentSetIndex(0);
      }
      
      // 恢复其他状态
      setTimer(progressData.timer || 0);
      setRestMode(progressData.restMode || false);
      setRestDuration(progressData.restDuration || 0);
    }
    
    setShowContinueWorkoutAlert(false);
    setSavedProgress(null);
  };
  
  // 重新开始健身
  const restartWorkout = () => {
    // 清除保存的进度
    try {
      localStorage.removeItem(`workout_progress_${id}`);
    } catch (error) {
      console.error('清除健身进度失败:', error);
    }
    
    // 重新初始化进度
    if (plan && plan.exercises) {
      const progress = plan.exercises.map(exercise => ({
        exerciseId: exercise.id,
        name: exercise.name,
        totalSets: exercise.sets,
        completedSets: Array(exercise.sets).fill(false),
        weights: Array(exercise.sets).fill(exercise.weight)
      }));
      
      setExerciseProgress(progress);
    }
    
    setCurrentExerciseIndex(0);
    setCurrentSetIndex(0);
    setTimer(0);
    setRestMode(false);
    setRestDuration(0);
    setShowContinueWorkoutAlert(false);
    setSavedProgress(null);
  };
  
  if (isLoading || !plan) {
    return <LoadingSpinner message="加载健身计划..." />;
  }

  // 安全检查：确保exerciseProgress已初始化且currentExerciseIndex有效
  if (!exerciseProgress.length) {
    // 如果计划存在但进度未初始化，尝试初始化
    if (plan && plan.exercises && plan.exercises.length > 0) {
      const progress = plan.exercises.map((exercise, index) => ({
        exerciseId: exercise.id || `exercise_${index}`,
        name: exercise.name,
        totalSets: exercise.sets || 1,
        completedSets: Array(exercise.sets || 1).fill(false),
        weights: Array(exercise.sets || 1).fill(exercise.weight || 0)
      }));
      
      console.log('延迟初始化练习进度:', progress);
      setExerciseProgress(progress);
    }
    
    // 如果初始化超时，显示错误信息
    if (initializationTimeout) {
      return (
        <IonContent>
          <div style={{ 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center', 
            justifyContent: 'center', 
            height: '50vh',
            padding: '20px',
            textAlign: 'center'
          }}>
            <h2>初始化失败</h2>
            <p>无法加载训练数据，请返回重试</p>
            <IonButton onClick={() => history.goBack()} color="primary">
              返回
            </IonButton>
          </div>
        </IonContent>
      );
    }
    
    return <LoadingSpinner message="初始化训练数据..." />;
  }

  // 确保 currentExerciseIndex 在有效范围内
  if (currentExerciseIndex >= exerciseProgress.length) {
    console.warn('当前练习索引超出范围，重置为0');
    setCurrentExerciseIndex(0);
    return <LoadingSpinner message="调整训练进度..." />;
  }
  
  const currentExercise = plan.exercises[currentExerciseIndex];
  const progress = exerciseProgress[currentExerciseIndex];
  
  // 获取动作详细信息
  const exerciseDetails = getExerciseDetails(currentExercise.name);
  
  // 计算总进度百分比（基于所有组的完成情况）
  const totalSets = plan.exercises.reduce((sum, exercise) => sum + exercise.sets, 0);
  const completedSets = exerciseProgress.reduce((sum, exercise) => {
    if (!exercise || !Array.isArray(exercise.completedSets)) return sum;
    return sum + exercise.completedSets.filter(Boolean).length;
  }, 0);
  const progressPercentage = totalSets > 0 ? Math.min((completedSets / totalSets) * 100, 100) : 0;
  
  // 计算当前动作的进度
  const currentExerciseProgress = exerciseProgress[currentExerciseIndex];
  const currentExerciseCompletedSets = currentExerciseProgress ? 
    currentExerciseProgress.completedSets.filter(Boolean).length : 0;
  const currentExerciseTotalSets = currentExercise ? currentExercise.sets : 0;
  
  return (
    <>
      <PageHeader title={`执行: ${plan.name}`} />
      <IonContent>
        {/* 总进度条 */}
        <div style={{ position: 'relative', padding: '8px 16px', backgroundColor: 'var(--app-light-bg)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <small style={{ color: 'var(--app-medium-text)', fontSize: '12px' }}>总进度</small>
              {wakeLockActive && (
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '4px',
                  padding: '2px 6px',
                  backgroundColor: 'rgba(255, 193, 7, 0.1)',
                  borderRadius: '10px'
                }}>
                  <IonIcon 
                    icon={sunnyOutline} 
                    style={{ 
                      fontSize: '12px', 
                      color: 'var(--ion-color-warning)' 
                    }} 
                  />
                  <small style={{ 
                    color: 'var(--ion-color-warning)', 
                    fontSize: '10px',
                    fontWeight: '500'
                  }}>
                    屏幕常亮
                  </small>
                </div>
              )}
            </div>
            <small style={{ color: 'var(--app-medium-text)', fontSize: '12px' }}>{completedSets}/{totalSets} 组</small>
          </div>
          <IonProgressBar 
            value={progressPercentage / 100}
            color="primary"
            style={{ height: '8px', borderRadius: '4px' }}
          />
          <div style={{ display: 'flex', justifyContent: 'center', marginTop: '4px' }}>
            <small style={{ color: 'var(--app-medium-text)', fontSize: '11px' }}>
              {progressPercentage.toFixed(0)}% 完成
            </small>
          </div>
        </div>
        
        {/* 当前练习信息 */}
        <IonCard className="workout-card scale-in">
          <IonCardContent>
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'space-between',
              marginBottom: '8px'
            }}>
              <div style={{ 
                padding: '6px 12px', 
                backgroundColor: 'var(--app-light-bg)', 
                borderRadius: '16px',
                fontSize: '14px',
                fontWeight: '500',
                color: 'var(--app-medium-text)'
              }}>
                {currentExerciseIndex + 1}/{plan.exercises.length}
              </div>
              <IonButton 
                fill="clear" 
                size="small"
                onClick={() => setShowExerciseInfo(true)}
              >
                <IonIcon slot="icon-only" icon={informationCircleOutline} />
              </IonButton>
            </div>
            
            <h1 style={{ 
              fontSize: '24px', 
              fontWeight: 'bold', 
              textAlign: 'center', 
              margin: '8px 0 16px',
              color: 'var(--ion-color-primary)'
            }}>
              {currentExercise.name}
            </h1>
            
            {/* 动作图片 */}
            <div style={{ 
              width: '100%', 
              height: '180px',
              borderRadius: '12px',
              overflow: 'hidden',
              marginBottom: '16px',
              position: 'relative'
            }}>
              <img 
                src={getExerciseImage(currentExercise.name)} 
                alt={currentExercise.name}
                style={{ 
                  width: '100%', 
                  height: '100%', 
                  objectFit: 'cover',
                  filter: restMode ? 'grayscale(100%)' : 'none',
                  transition: 'filter 0.3s ease'
                }}
              />
              {restMode && (
                <div style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: 'rgba(0, 0, 0, 0.5)',
                  color: 'white',
                  fontSize: '24px',
                  fontWeight: 'bold'
                }}>
                  休息中
                </div>
              )}
            </div>
            
            <div style={{ textAlign: 'center', margin: '16px 0' }}>
              {/* 当前动作进度条 */}
              <div style={{ marginBottom: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <small style={{ color: 'var(--app-medium-text)', fontSize: '12px' }}>当前动作进度</small>
                  <small style={{ color: 'var(--app-medium-text)', fontSize: '12px' }}>
                    {currentExerciseCompletedSets}/{currentExerciseTotalSets} 组
                  </small>
                </div>
                <IonProgressBar 
                  value={currentExerciseTotalSets > 0 ? currentExerciseCompletedSets / currentExerciseTotalSets : 0}
                  color="success"
                  style={{ height: '6px', borderRadius: '3px' }}
                />
              </div>
              
              {/* 动作信息标签 */}
              <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', flexWrap: 'wrap' }}>
                <IonChip color="medium" style={{ '--background': 'var(--app-light-bg)' }}>
                  <IonIcon icon={barbellOutline} />
                  <IonLabel>
                    {restMode ? '休息中' : `第 ${currentSetIndex + 1} 组，共 ${currentExercise.sets} 组`}
                  </IonLabel>
                </IonChip>
                
                <IonChip color="primary" style={{ '--background': 'rgba(123, 104, 238, 0.1)' }}>
                  <IonLabel>{currentExercise.reps} 次/组</IonLabel>
                </IonChip>
                
                {currentExercise.weight > 0 && (
                  <IonChip color="secondary" style={{ '--background': 'rgba(90, 200, 250, 0.1)' }}>
                    <IonLabel>{currentExercise.weight} kg</IonLabel>
                  </IonChip>
                )}
              </div>
            </div>
            
            {/* 计时器显示 */}
            <div className="timer-display" style={{ 
              backgroundColor: restMode ? 'var(--app-light-bg)' : 'transparent',
              borderRadius: '12px',
              padding: '16px',
              color: restMode ? 'var(--ion-color-primary)' : 'var(--ion-color-dark)'
            }}>
              {restMode ? (
                <>
                  <div style={{ fontSize: '14px', marginBottom: '8px', color: 'var(--app-medium-text)' }}>
                    休息时间剩余
                  </div>
                  {formatSeconds(restDuration - timer)}
                </>
              ) : (
                formatSeconds(timer)
              )}
            </div>
            
            {/* 计时器控制 */}
            <div className="control-buttons-container">
              <IonButton 
                color={timerRunning ? 'warning' : 'success'} 
                onClick={toggleTimer}
                className="control-button"
              >
                <IonIcon slot="icon-only" icon={timerRunning ? pauseOutline : playOutline} />
              </IonButton>
              
              <IonButton 
                color="medium" 
                onClick={resetTimer}
                className="control-button"
              >
                <IonIcon slot="icon-only" icon={refreshOutline} />
              </IonButton>
              
              {restMode ? (
                <IonButton 
                  color="primary" 
                  onClick={endRest}
                  className="control-button"
                >
                  <IonIcon slot="start" icon={arrowForwardOutline} />
                  跳过
                </IonButton>
              ) : (
                <IonButton 
                  color="success" 
                  onClick={() => markSetComplete(currentSetIndex)}
                  disabled={progress && progress.completedSets[currentSetIndex]}
                  className="control-button"
                >
                  <IonIcon slot="start" icon={checkmarkOutline} />
                  完成
                </IonButton>
              )}
            </div>
          </IonCardContent>
        </IonCard>
        
        {/* 组状态列表 */}
        <div className="section-title">组进度</div>
        <IonList style={{ margin: '0 16px', borderRadius: '12px', overflow: 'hidden' }}>
          {progress && progress.totalSets && Array.from({ length: progress.totalSets }).map((_, index) => (
            <IonItem key={index} className={progress.completedSets[index] ? 'completed-set' : ''} style={{
              '--background': progress.completedSets[index] ? 'rgba(76, 217, 100, 0.1)' : 'var(--ion-item-background)',
              '--border-color': 'transparent',
              marginBottom: '2px'
            }}>
              <IonCheckbox
                slot="start"
                checked={progress.completedSets[index]}
                onIonChange={() => markSetComplete(index)}
                disabled={restMode}
                style={{ '--size': '24px' }}
              />
              <IonLabel>
                <h2 style={{ fontWeight: progress.completedSets[index] ? '600' : '400' }}>第 {index + 1} 组</h2>
                <p>{currentExercise.reps} 次</p>
              </IonLabel>
              <div slot="end" style={{ display: 'flex', alignItems: 'center' }}>
                <IonInput
                  type="number"
                  value={progress.weights[index]}
                  onIonChange={e => updateWeight(index, parseInt(e.detail.value || 0, 10))}
                  disabled={restMode}
                  style={{ 
                    '--padding-start': '8px',
                    '--padding-end': '8px',
                    width: '60px',
                    textAlign: 'right'
                  }}
                />
                <IonText color="medium" style={{ marginLeft: '4px' }}>kg</IonText>
              </div>
            </IonItem>
          ))}
        </IonList>
        
        {/* 底部按钮 */}
        <div style={{ padding: '16px' }}>
          <IonButton 
            expand="block" 
            color="danger"
            onClick={exitWorkout}
            className="action-button"
            style={{ marginTop: '16px' }}
          >
            <IonIcon slot="start" icon={stopOutline} />
            结束健身
          </IonButton>
        </div>
        
        {/* 动作信息模态框 */}
        <IonAlert
          isOpen={showExerciseInfo}
          onDidDismiss={() => setShowExerciseInfo(false)}
          header={currentExercise.name}
          message={`
            <div style="text-align: left">
              <p><strong>目标肌群:</strong> ${exerciseDetails?.category?.name || '未知'}</p>
              <p><strong>动作描述:</strong> ${exerciseDetails?.description || currentExercise.description || '暂无描述'}</p>
              <p><strong>注意事项:</strong> ${exerciseDetails?.tips || '请根据自身情况调整重量和次数'}</p>
            </div>
          `}
          buttons={['关闭']}
        />
        
        {/* 完成提示 */}
        <IonAlert
          isOpen={showCompleteAlert}
          onDidDismiss={() => setShowCompleteAlert(false)}
          header="健身完成！"
          message={`
            <div style="text-align: center">
              <img src="https://cdn-icons-png.flaticon.com/512/5228/5228061.png" style="width: 100px; height: 100px; margin: 16px auto;">
              <p>恭喜你完成了今天的健身计划！</p>
              <p>共完成 ${completedSets} 组训练</p>
              <p>${plan.exercises.length} 个动作全部完成</p>
            </div>
          `}
          buttons={[
            {
              text: '保存记录',
              cssClass: 'primary',
              handler: completeWorkout
            }
          ]}
        />
        
        {/* 退出提示 */}
        <IonAlert
          isOpen={showExitAlert}
          onDidDismiss={() => setShowExitAlert(false)}
          header="确认结束"
          message="确定要结束当前健身吗？已完成的进度将被保存。"
          buttons={[
            {
              text: '取消',
              role: 'cancel'
            },
            {
              text: '保存进度并退出',
              cssClass: 'danger',
              handler: exitWorkoutWithProgress
            }
          ]}
        />
        
        {/* 继续健身提示 */}
        <IonAlert
          isOpen={showContinueWorkoutAlert}
          onDidDismiss={() => setShowContinueWorkoutAlert(false)}
          header="继续健身"
          message="检测到您有未完成的健身进度，是否继续？"
          buttons={[
            {
              text: '重新开始',
              handler: restartWorkout
            },
            {
              text: '继续',
              handler: continueWorkout
            }
          ]}
        />
        
        {/* 已存在记录提示 */}
        <IonAlert
          isOpen={showRecordExistsAlert}
          onDidDismiss={() => setShowRecordExistsAlert(false)}
          header="健身记录已存在"
          message={`该健身计划已完成并保存记录。${existingRecord ? `完成时间：${new Date(existingRecord.completedAt).toLocaleString()}` : ''}`}
          buttons={[
            {
              text: '查看记录',
              handler: viewExistingRecord
            },
            {
              text: '重新训练',
              handler: restartIgnoreRecord
            }
          ]}
        />
        
        <IonToast
          isOpen={showToast}
          onDidDismiss={() => setShowToast(false)}
          message={toastMessage}
          duration={3000}
          position="middle"
          color={restMode ? "primary" : "success"}
          buttons={[
            {
              text: '关闭',
              role: 'cancel'
            }
          ]}
        />
      </IonContent>
    </>
  );
};

export default PlanExecution;