import dayjs from 'dayjs';

// 格式化日期
export function formatDate(date, format = 'YYYY-MM-DD') {
  return dayjs(date).format(format);
}

// 格式化时间
export function formatTime(minutes) {
  const mins = Math.floor(minutes);
  const secs = Math.floor((minutes - mins) * 60);
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

// 格式化秒数为时分秒
export function formatSeconds(seconds) {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

// 获取当前周的日期范围
export function getCurrentWeekDates() {
  const today = dayjs();
  const weekStart = today.startOf('week');
  
  return Array.from({ length: 7 }, (_, i) => {
    const date = weekStart.add(i, 'day');
    return {
      date: date.toDate(),
      dateString: date.format('YYYY-MM-DD'),
      day: date.format('DD'),
      weekday: date.format('ddd'),
      isToday: date.isSame(today, 'day')
    };
  });
}

// 获取月份的所有日期
export function getMonthDates(year, month) {
  const startDate = dayjs(`${year}-${month}-01`);
  const daysInMonth = startDate.daysInMonth();
  const today = dayjs();
  
  return Array.from({ length: daysInMonth }, (_, i) => {
    const date = startDate.add(i, 'day');
    return {
      date: date.toDate(),
      dateString: date.format('YYYY-MM-DD'),
      day: date.format('D'),
      weekday: date.format('ddd'),
      isToday: date.isSame(today, 'day')
    };
  });
}

// 按日期分组健身记录
export function groupRecordsByDate(records) {
  const grouped = {};
  
  records.forEach(record => {
    const dateKey = record.completedAt.split('T')[0];
    if (!grouped[dateKey]) {
      grouped[dateKey] = [];
    }
    grouped[dateKey].push(record);
  });
  
  return Object.entries(grouped)
    .map(([date, records]) => ({ date, records }))
    .sort((a, b) => new Date(b.date) - new Date(a.date));
}

// 计算健身统计数据
export function calculateWorkoutStats(records) {
  if (!records || records.length === 0) {
    return {
      totalWorkouts: 0,
      totalExercises: 0,
      averageExercisesPerWorkout: 0,
      mostFrequentExercise: null,
      heaviestWeight: 0,
      totalDuration: 0,
      averageDuration: 0
    };
  }

  // 总健身次数
  const totalWorkouts = records.length;
  
  // 所有练习
  let allExercises = [];
  records.forEach(record => {
    if (record.exercises && Array.isArray(record.exercises)) {
      allExercises = [...allExercises, ...record.exercises];
    }
  });
  
  // 总练习次数
  const totalExercises = allExercises.length;
  
  // 每次健身的平均练习数
  const averageExercisesPerWorkout = totalExercises / totalWorkouts;
  
  // 最常做的练习
  const exerciseCounts = {};
  allExercises.forEach(exercise => {
    const name = exercise.name;
    exerciseCounts[name] = (exerciseCounts[name] || 0) + 1;
  });
  
  let mostFrequentExercise = null;
  let maxCount = 0;
  
  Object.entries(exerciseCounts).forEach(([name, count]) => {
    if (count > maxCount) {
      mostFrequentExercise = name;
      maxCount = count;
    }
  });
  
  // 最重的重量
  let heaviestWeight = 0;
  allExercises.forEach(exercise => {
    if (exercise.weight && exercise.weight > heaviestWeight) {
      heaviestWeight = exercise.weight;
    }
  });
  
  // 总健身时长和平均时长（分钟）
  let totalDuration = 0;
  records.forEach(record => {
    if (record.duration) {
      totalDuration += record.duration;
    }
  });
  
  const averageDuration = totalDuration / totalWorkouts;
  
  return {
    totalWorkouts,
    totalExercises,
    averageExercisesPerWorkout,
    mostFrequentExercise,
    heaviestWeight,
    totalDuration,
    averageDuration
  };
}

// 生成随机ID
export function generateId() {
  return Math.random().toString(36).substring(2, 15) + 
    Math.random().toString(36).substring(2, 15);
}

// 深拷贝对象
export function deepClone(obj) {
  return JSON.parse(JSON.stringify(obj));
}

// 创建新的练习项
export function createNewExercise() {
  return {
    id: generateId(),
    name: '',
    sets: 3,
    reps: 10,
    weight: 0,
    restBetweenSets: 60, // 秒
    restAfterExercise: 90 // 秒
  };
}

// 创建默认的健身计划
export function createDefaultPlan() {
  return {
    name: '',
    description: '',
    exercises: [createNewExercise()]
  };
}

// 计算健身计划的估计时长（分钟）
export function calculatePlanDuration(plan) {
  if (!plan || !plan.exercises || !Array.isArray(plan.exercises)) {
    return 0;
  }
  
  let totalDuration = 0;
  
  plan.exercises.forEach(exercise => {
    // 每组练习时间（假设每次动作需要5秒）
    const exerciseTime = exercise.sets * exercise.reps * 5;
    
    // 组间休息时间
    const restBetweenSets = (exercise.sets - 1) * (exercise.restBetweenSets || 60);
    
    // 动作后休息时间
    const restAfterExercise = exercise.restAfterExercise || 90;
    
    // 累加到总时间
    totalDuration += exerciseTime + restBetweenSets + restAfterExercise;
  });
  
  // 转换为分钟并四舍五入到最接近的分钟
  return Math.round(totalDuration / 60);
}