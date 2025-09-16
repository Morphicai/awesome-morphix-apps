import AppSdk from '@morphixai/app-sdk';

// 语言翻译数据
const translations = {
  ko: {
    // 导航
    timer: "타이머",
    tasks: "할일",
    stats: "통계",
    settings: "설정",
    
    // 应用标题
    appTitle: "자연 정원 뽀모도로",
    appSubtitle: "AI 정원 요정과 함께하는 자연 풍 뽀모도로 타이머",
    
    // 计时器页面
    focusTime: "집중 시간",
    breakTime: "휴식 시간",
    start: "시작",
    pause: "일시정지",
    reset: "리셋",
    selectTask: "오늘 집중할 작업을 선택하세요",
    noTasks: "먼저 할일 탭에서 작업을 추가해주세요!",
    currentTask: "현재 집중 중인 작업",
    selectTaskPlaceholder: "할일을 선택하세요",
    encourageStart: "할일을 선택하고 집중을 시작하세요!",
    
    // 会话标题
    focusSession: "꽃이 피는 집중 시간",
    butterflyRest: "나비의 휴식 시간",
    
    // 统计
    completedFlowers: "핀 꽃: {count}/4 사이클",
    todayCompleted: "오늘 완료: {count}개",
    
    // 任务页面
    myTaskGarden: "나의 할일 花园",
    taskGardenSubtitle: "오늘도 아름다운 작업들을 가꾸어보세요",
    totalTasks: "전체 작업",
    completedTasks: "완료된 작업",
    pendingTasks: "대기 중",
    
    // 过滤器
    filterAll: "전체 보기",
    filterPending: "대기 중",
    filterCompleted: "완료됨",
    filterHigh: "높은 우선순위",
    filterMedium: "보통 우선순위",
    filterLow: "낮은 우선순위",
    
    // 任务操作
    addNewTask: "새로운 작업 심기",
    taskPlaceholder: "새로운 花园 작업을 심어보세요...",
    priorityHigh: "높음 - 빨간 장미",
    priorityMedium: "보통 - 해바라기",
    priorityLow: "낮음 - 잎사귀",
    plantTask: "작업 심기",
    
    // 空状态
    noTasksPlanted: "아직 심어진 작업이 없어요",
    firstSeedMessage: "첫 번째 씨앗을 심어보세요!",
    noMatchingTasks: "해당하는 작업이 없습니다",
    plantFirstTask: "첫 작업 심기",
    
    // 优先级
    high: "높음",
    medium: "보통",
    low: "낮음",
    
    // 统计页面
    gardenStats: "정원 통계",
    periodToday: "오늘",
    periodWeek: "주간",
    periodMonth: "월간",
    periodTotal: "전체",
    
    todayGarden: "오늘의 정원",
    weeklyGrowth: "이번주 정원 성장",
    monthlyFlowerbed: "이번달 꽃밭",
    totalGardenStatus: "전체 정원 현황",
    
    plantedSeeds: "심은 씨앗",
    focusedTime: "집중한 시간",
    completedTodos: "완료한 할일",
    completionRate: "할일 완료율",
    
    recent7Days: "최근 7일 정원 성장 기록",
    plantCollection: "나의 식물 컬렉션",
    
    plantedSprouts: "심은 새싹",
    grownLeaves: "자란 잎사귀",
    bloomedFlowers: "핀 꽃",
    grownTrees: "자란 나무",
    
    achievementSummary: "정원 성취 요약",
    totalFocusTime: "총 집중 시간",
    grownPlants: "키운 식물",
    averageCompletion: "평균 완료율",
    
    noSeedsPlanted: "아직 심어진 씨앗이 없어요",
    startTimerMessage: "타이머를 시작해서 첫 번째 씨앗을 심어보세요!",
    gardenWillGrow: "집중할 때마다 아름다운 정원이 자라날 거예요.",
    
    // 设置页面
    settingsTitle: "설정",
    appInfo: "자연 정원 뽀모도로",
    appDescription: "자연의 평온함과 함께하는 치유적인 뽀모도로 타이머입니다. 집중할 때마다 식물이 자라나고, 휴식할 때마다 나비가 날아다니는 평화로운 경험을 즐겨보세요.",
    version: "버전 1.0.0",
    
    myGardenDiary: "나의 정원 성장 일기",
    todayAchievements: "오늘의 성과",
    focusSessions: "집중 세션",
    
    gardenPreview: "나의 정원 미리보기",
    noPlants: "아직 식물이 자라지 않았습니다.",
    completeFirstPomodoro: "첫 번째 뽀모도로를 완료해보세요!",
    morePlants: "개 더",
    
    // 语言设置
    languageSettings: "언어 설정",
    korean: "한국어",
    chinese: "中文",
    currentLanguage: "현재 언어",
    
    // 通用
    minutes: "분",
    hours: "시간",
    days: "일",
    loading: "로딩 중...",
    error: "오류",
    retry: "다시 시도",
    close: "닫기",
    save: "저장",
    cancel: "취소",
    delete: "삭제",
    edit: "편집",
    complete: "완료",
    
    // 时间格式
    timeFormat: "{hours}시간 {minutes}분",
    minutesOnly: "{minutes}분",
    
    // 加载消息
    loadingGarden: "정원을 준비하는 중...",
    loadingTasks: "할일 목록을 불러오는 중...",
    loadingTimer: "타이머 데이터를 불러오는 중...",
    
    // 要精灵消息
    fairyGreetingMorning: "좋은 아침이에요! 오늘도 아름다운 정원을 가꿔볼까요? 🌸",
    fairyGreetingAfternoon: "안녕하세요! 오후의 정원에서 집중의 꽃을 피워보세요 🌻",
    fairyGreetingEvening: "좋은 저녁이에요! 밤의 정원에서도 차분히 집중해보아요 🌙",
    
    // 快速问题
    quickQuestionFocus: "집중 도움 요청",
    quickQuestionTasks: "할일 정리 도움",
    quickQuestionMotivation: "동기부여 필요",
    quickQuestionRest: "휴식 추천",
    
    quickMessageFocus: "집중하는 데 도움이 필요해요",
    quickMessageTasks: "할일을 어떻게 정리하면 좋을까요?",
    quickMessageMotivation: "동기부여가 필요해요",
    quickMessageRest: "어떻게 휴식하면 좋을까요?",
    
    chatWithFairy: "정원 요정과 대화하기",
    fairyChat: "정원 요정과의 대화",
    quickQuestions: "빠른 질문",
    sendMessagePlaceholder: "정원 요정에게 메시지를 보내세요...",
    
    // 完成提醒
    pomodoroComplete: "뽀모도로 완료!",
    taskCompleteQuestion: "\"{task}\" 작업을 완료하셨나요?",
    stillWorking: "아직 진행 중",
    completed: "완료했어요! 🌸",
    
    // 设置页面新增翻译
    confirmClearData: "모든 데이터를 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.",
    notStarted: "아직 시작 전",
    startingToday: "오늘부터 시작!",
    startedYesterday: "어제부터 시작",
    startedDaysAgo: "{days}일 전부터",
    startedWeeksAgo: "{weeks}주 전부터",
    startedMonthsAgo: "{months}개월 전부터",
    
    // 成就等级
    gardenMaster: "🌺 정원의 달인",
    gardenMasterDesc: "100개 이상의 뽀모도로를 완료한 마스터 정원사입니다!",
    skilledGardener: "🌸 숙련된 정원사",
    skilledGardenerDesc: "50개 이상의 뽀모도로로 아름다운 정원을 가꾸고 있습니다.",
    growingGardener: "🌿 성장하는 정원사",
    growingGardenerDesc: "20개의 뽀모도로로 정원이 무성해지고 있어요!",
    sproutGardener: "🌱 새싹 정원사",
    sproutGardenerDesc: "5개의 뽀모도로로 첫 새싹이 돋아났습니다.",
    seedPlanting: "🌰 씨앗 심는 중",
    seedPlantingDesc: "첫 번째 뽀모도로로 정원 여행을 시작해보세요!",
    
    // 激励消息
    plantFirstSeed: "첫 씨앗을 심어보세요! 🌱",
    sproutGrowing: "새싹이 돋아나고 있어요! 🌿",
    flowersBloom: "아름다운 꽃이 피고 있네요! 🌸",
    gardenInFullBloom: "정원이 만개했어요! 🌺",
    amazingGardener: "놀라운 정원사가 되셨네요! 🏆",
    completeFirstTask: "첫 할일을 완료해보세요! ✨",
    goodStart: "좋은 시작이에요! 🎯",
    consistentAchievement: "꾸준히 성취하고 있어요! 🌟",
    excellentExecution: "훌륭한 실행력이에요! 💪",
    gardenAwaits: "정원이 당신을 기다리고 있어요! 🌈",
    good15MinFocus: "15분의 집중, 좋은 시작! 🌱",
    good30MinFocus: "30분의 깊은 집중! 🌿",
    excellent1HourFocus: "1시간의 몰입, 대단해요! 🌸",
    
    // 卡片详细信息
    completedPomodoroSessions: "완료한 뽀모도로 세션",
    successfulFocusTime: "성공적으로 완료한 집중 시간",
    beautifulSprouts: "{count}개의 아름다운 새싹이 자랐어요!",
    growFirstSprout: "첫 새싹을 키워보세요! 🌱",
    achievedTasks: "성취한 작업들",
    healthyRestPattern: "건강한 휴식 패턴",
    balancedRest: "균형 잡힌 휴식을 취하고 있어요! 🦋",
    restIsImportant: "집중 후 휴식도 중요해요! 🌺",
    recordedTime: "기록 시간",
    consecutiveDays: "연속 일수",
    consistentGrowthRecord: "꾸준한 성장 기록",
    becomingSteadyGardener: "꾸준한 정원사가 되어가고 있어요! 🌳",
    growDailySlowly: "매일 조금씩 성장해보세요! 🌱",
    
    // 状态描述
    high: "높음",
    good: "좋음",
    excellent: "우수",
    balanced: "균형",
    measuring: "측정 중",
    startingStage: "시작 단계",
    noneYet: "아직 없음",
    count: "개",
    
    // 今日成果
    keepBeautifyingGarden: "오늘도 정원을 아름답게 가꿔주세요! 🌿",
    startFromTimerTab: "타이머 탭에서 시작하기",
    
    // 激励语句
    gardenGrowingLush: "당신의 정원이 점점 무성해지고 있어요!",
    steadyEffortBloomsFlowers: "꾸준한 노력이 예쁜 꽃을 피워냅니다",
    growSlowlyButSteadily: "천천히, 하지만 꾸준히 성장해보세요",
    
    // 详细信息标签
    detail_total: "총계",
    detail_today: "오늘",
    detail_thisWeek: "이번 주",
    detail_target: "목표",
    detail_streak: "연속",
    detail_efficiency: "효율성",
    detail_avgSession: "평균 세션",
    detail_bestStreak: "최고 연속",
    detail_totalDays: "총 일수",
    detail_completed: "완료",
    detail_pending: "대기",
    detail_completionRate: "완료율",
    detail_productivity: "생산성",
    detail_totalBreaks: "총 휴식",
    detail_avgBreakTime: "평균 휴식",
    detail_restQuality: "휴식 품질",
    detail_balance: "균형",
    detail_totalMinutes: "총 분",
    detail_totalHours: "총 시간",
    detail_avgDaily: "일평균",
    detail_focusQuality: "집중 품질",
    detail_currentStreak: "현재 연속",
    detail_level: "레벨",
    detail_nextLevelIn: "다음 레벨까지",
    
    // StatsTab 新增翻译
    todayGardenLabel: "오늘의 정원",
    weeklyGrowthLabel: "이번주 정원 성장", 
    monthlyFlowerbedLabel: "이번달 꽃밭",
    totalGardenStatusLabel: "전체 정원 현황",
    periodSelection: "기간 선택",
    todayLabel: "오늘",
    weekLabel: "주간", 
    monthLabel: "월간",
    totalLabel: "전체",
    currentStatus: "현황",
    timeFormat: "{hours}시간 {minutes}분",
    minutesFormat: "{minutes}분",
    plantedSprouts: "심은 새싹",
    grownLeaves: "자란 잎사귀", 
    bloomedFlowers: "핀 꽃",
    grownTrees: "자란 나무",
    recent7DaysGrowth: "최근 7일 정원 성장 기록",
    myPlantCollection: "나의 식물 컬렉션",
    countUnit: "개",
    gardenAchievementSummary: "정원 성취 요약",
    totalFocusTimeLabel: "총 집중 시간",
    grownPlantsLabel: "키운 식물",
    completedTasksLabel: "완료한 할일",
    averageCompletionLabel: "평균 완료율",
    
    // TasksTab 新增翻译
    myTaskGardenTitle: "나의 할일 花园",
    taskGardenSubtitle: "오늘도 아름다운 작업들을 가꾸어보세요",
    totalTasksLabel: "전체 작업",
    completedTasksLabel: "완료된 작업", 
    pendingTasksLabel: "대기 중",
    taskFilter: "작업 필터",
    viewAll: "전체 보기",
    viewPending: "대기 중",
    viewCompleted: "완료됨", 
    highPriorityFilter: "높은 우선순위",
    mediumPriorityFilter: "보통 우선순위",
    lowPriorityFilter: "낮은 우선순위",
    addNewTaskForm: "새로운 작업 심기",
    newTaskPlaceholder: "새로운 花园 작업을 심어보세요...",
    prioritySelection: "우선순위 선택",
    highPriorityOption: "높음 - 빨간 장미",
    mediumPriorityOption: "보통 - 해바라기", 
    lowPriorityOption: "낮음 - 잎사귀",
    plantTaskButton: "작업 심기",
    noTasksPlantedTitle: "아직 심어진 작업이 없어요",
    firstSeedMessage: "첫 번째 씨앗을 심어보세요!",
    noMatchingTasksMessage: "해당하는 작업이 없습니다",
    plantFirstTaskButton: "첫 작업 심기",
    highPriorityLabel: "높음",
    mediumPriorityLabel: "보통",
    lowPriorityLabel: "낮음",
    completionAnimation: "완료 애니메이션",
    decorativeFlowers: "장식용 꽃들",
    floatingAddButton: "플로팅 추가 버튼",
    
    // TimerTab 新增翻译
    focusingBackground: "집중 중 (백그라운드)",
    restingBackground: "휴식 중 (백그라운드)",
    
    // 其他组件
    loadingTasksList: "할일 목록을 불러오는 중...",
    loadingSettingsText: "설정을 불러오는 중...",
    preparingGarden: "정원을 준비하는 중...",
    confirmButton: "확인",
    koreanLanguage: "한국어",
    chineseLanguage: "中文",
    changeLanguageDescription: "언어를 변경하여 앱을 더 편리하게 사용하세요",
    
    // StatsTab 缺失翻译键
    plantedSeeds: "심은 씨앗",
    focusedTime: "집중한 시간",
    completedTodos: "완료한 할일", 
    noSeedsPlantedTitle: "아직 심어진 씨앗이 없어요",
    startTimerPlantFirstSeed: "타이머를 시작해서 첫 번째 씨앗을 심어보세요!",
    beautifulGardenGrows: "집중할 때마다 아름다운 정원이 자라날 거예요.",
    
    // GardenFairy 翻译键
    gardenFairyChat: "정원 요정과 대화하기",
    gardenFairyChatTitle: "정원 요정과의 대화",
    quickQuestions: "빠른 질문",
    fairyMessagePlaceholder: "정원 요정에게 메시지를 보내세요...",
    focusHelpRequest: "집중 도움 요청",
    taskOrganizationHelp: "할일 정리 도움",
    motivationNeeded: "동기부여 필요",
    restRecommendation: "휴식 추천",
    focusHelpMessage: "집중하는 데 도움이 필요해요",
    taskOrganizationMessage: "할일을 어떻게 정리하면 좋을까요?",
    motivationMessage: "동기부여가 필요해요",
    restMessage: "어떻게 휴식하면 좋을까요?",
    fairyErrorMessage: "미안해요, 지금은 대답하기 어려워요 🌿",
    fairyConnectionError: "죄송해요, 지금은 대화하기 어려워요. 잠시 후 다시 시도해주세요 🌿",
    goodMorningGreeting: "좋은 아침이에요! 오늘도 아름다운 정원을 가꿔볼까요? 🌸",
    goodAfternoonGreeting: "안녕하세요! 오후의 정원에서 집중의 꽃을 피워보세요 🌻",
    goodEveningGreeting: "좋은 저녁이에요! 밤의 정원에서도 차분히 집중해보아요 🌙",
    
    // AI 系统提示词相关
    fairySystemPrompt: "당신은 친근한 정원 요정입니다. 사용자의 집중과 할일 관리를 도와주는 역할을 합니다.",
    currentSituation: "현재 상황:",
    timerStatus: "타이머 상태",
    completedPomodoros: "완료한 뽀모도로",
    currentTask: "현재 작업",
    selectedTaskNone: "선택된 작업 없음",
    remainingTime: "남은 시간",
    fairyMood: "요정 기분",
    personalityAndTone: "성격과 말투:",
    naturalWarmTone: "항상 자연스럽고 따뜻한 말투로 대화",
    gardenMetaphors: "정원과 식물에 관련된 비유를 자주 사용",
    shortConciseAnswers: "짧고 간결하게 답변 (1-2문장)",
    useEmojis: "이모지를 적절히 사용하여 친근함 표현",
    encourageMotivate: "사용자를 격려하고 동기부여 제공",
    situationalResponses: "상황별 대응:",
    focusStart: "집중 시작 시: 새로운 씨앗을 심는다는 표현 사용",
    duringFocus: "집중 중: 식물이 자라고 있다는 격려",
    duringRest: "휴식 시: 정원에서 쉬는 표현 사용",
    onCompletion: "완료 시: 꽃이 피었다는 축하 표현",
    counseling: "고민 상담: 자연의 지혜로 조언 제공",
    focusing: "집중 중",
    resting: "휴식 중",
    stopped: "정지됨",
    minutes: "분",
    count: "개"
  },
  
  zh: {
    // 导航
    timer: "计时器",
    tasks: "任务",
    stats: "统计",
    settings: "设置",
    
    // 应用标题
    appTitle: "专注花园番茄钟",
    appSubtitle: "与AI花园精灵一起的自然风番茄钟计时器",
    
    // 计时器页面
    focusTime: "专注时间",
    breakTime: "休息时间",
    start: "开始",
    pause: "暂停",
    reset: "重置",
    selectTask: "请选择今天要专注的任务",
    noTasks: "请先在任务页面添加任务！",
    currentTask: "当前专注的任务",
    selectTaskPlaceholder: "请选择任务",
    encourageStart: "选择任务并开始专注吧！",
    
    // 会话标题
    focusSession: "花朵绽放的专注时间",
    butterflyRest: "蝴蝶的休息时间",
    
    // 统计
    completedFlowers: "盛开花朵: {count}/4 周期",
    todayCompleted: "今日完成: {count}个",
    
    // 任务页面
    myTaskGarden: "我的任务花园",
    taskGardenSubtitle: "今天也来培育美丽的任务吧",
    totalTasks: "全部任务",
    completedTasks: "已完成",
    pendingTasks: "待完成",
    
    // 过滤器
    filterAll: "查看全部",
    filterPending: "待完成",
    filterCompleted: "已完成",
    filterHigh: "高优先级",
    filterMedium: "中优先级",
    filterLow: "低优先级",
    
    // 任务操作
    addNewTask: "种植新任务",
    taskPlaceholder: "请输入新的花园任务...",
    priorityHigh: "高 - 红玫瑰",
    priorityMedium: "中 - 向日葵",
    priorityLow: "低 - 绿叶",
    plantTask: "种植任务",
    
    // 空状态
    noTasksPlanted: "还没有种植任务呢",
    firstSeedMessage: "种下第一颗种子吧！",
    noMatchingTasks: "没有符合条件的任务",
    plantFirstTask: "种植第一个任务",
    
    // 优先级
    high: "高",
    medium: "中",
    low: "低",
    
    // 统计页面
    gardenStats: "花园统计",
    periodToday: "今日",
    periodWeek: "本周",
    periodMonth: "本月",
    periodTotal: "全部",
    
    todayGarden: "今日花园",
    weeklyGrowth: "本周花园成长",
    monthlyFlowerbed: "本月花圃",
    totalGardenStatus: "花园总体状况",
    
    plantedSeeds: "播种的种子",
    focusedTime: "专注时间",
    completedTodos: "完成的任务",
    completionRate: "任务完成率",
    
    recent7Days: "最近7天花园成长记录",
    plantCollection: "我的植物收藏",
    
    plantedSprouts: "播种的幼苗",
    grownLeaves: "成长的叶子",
    bloomedFlowers: "盛开的花朵",
    grownTrees: "成长的树木",
    
    achievementSummary: "花园成就总结",
    totalFocusTime: "总专注时间",
    grownPlants: "培育的植物",
    averageCompletion: "平均完成率",
    
    noSeedsPlanted: "还没有播种呢",
    startTimerMessage: "启动计时器来播下第一颗种子吧！",
    gardenWillGrow: "每次专注都会让美丽的花园成长。",
    
    // 设置页面
    settingsTitle: "设置",
    appInfo: "专注花园番茄钟",
    appDescription: "与自然的宁静相伴的治愈系番茄钟计时器。每次专注时植物都会成长，每次休息时蝴蝶都会飞舞，享受这份宁静的体验吧。",
    version: "版本 1.0.0",
    
    myGardenDiary: "我的花园成长日记",
    todayAchievements: "今日成果",
    focusSessions: "专注时段",
    
    gardenPreview: "我的花园预览",
    noPlants: "植物还没有成长。",
    completeFirstPomodoro: "完成第一个番茄钟吧！",
    morePlants: "个更多",
    
    // 语言设置
    languageSettings: "语言设置",
    korean: "한국어",
    chinese: "中文",
    currentLanguage: "当前语言",
    
    // 通用
    minutes: "分钟",
    hours: "小时",
    days: "天",
    loading: "加载中...",
    error: "错误",
    retry: "重试",
    close: "关闭",
    save: "保存",
    cancel: "取消",
    delete: "删除",
    edit: "编辑",
    complete: "完成",
    
    // 时间格式
    timeFormat: "{hours}小时{minutes}分钟",
    minutesOnly: "{minutes}分钟",
    
    // 加载消息
    loadingGarden: "正在准备花园...",
    loadingTasks: "正在加载任务列表...",
    loadingTimer: "正在加载计时器数据...",
    
    // 花园精灵消息
    fairyGreetingMorning: "早上好！今天也来培育美丽的花园吧？🌸",
    fairyGreetingAfternoon: "下午好！在午后的花园里绽放专注之花吧 🌻",
    fairyGreetingEvening: "晚上好！在夜晚的花园里也要静心专注哦 🌙",
    
    // 快速问题
    quickQuestionFocus: "专注帮助",
    quickQuestionTasks: "任务整理帮助",
    quickQuestionMotivation: "需要激励",
    quickQuestionRest: "休息建议",
    
    quickMessageFocus: "我需要专注方面的帮助",
    quickMessageTasks: "如何更好地整理任务呢？",
    quickMessageMotivation: "我需要一些激励",
    quickMessageRest: "如何更好地休息呢？",
    
    chatWithFairy: "与花园精灵对话",
    fairyChat: "与花园精灵的对话",
    quickQuestions: "快速提问",
    sendMessagePlaceholder: "向花园精灵发送消息...",
    
    // 完成提醒
    pomodoroComplete: "番茄钟完成！",
    taskCompleteQuestion: "您完成了\"{task}\"任务吗？",
    stillWorking: "还在进行中",
    completed: "完成了！🌸",
    
    // 设置页面新增翻译
    confirmClearData: "确定要删除所有数据吗？此操作无法撤销。",
    notStarted: "尚未开始",
    startingToday: "从今天开始！",
    startedYesterday: "从昨天开始",
    startedDaysAgo: "{days}天前开始",
    startedWeeksAgo: "{weeks}周前开始",
    startedMonthsAgo: "{months}个月前开始",
    
    // 成就等级
    gardenMaster: "🌺 花园大师",
    gardenMasterDesc: "完成了100个以上番茄钟的大师级园丁！",
    skilledGardener: "🌸 熟练园丁",
    skilledGardenerDesc: "用50个以上的番茄钟培育着美丽的花园。",
    growingGardener: "🌿 成长中的园丁",
    growingGardenerDesc: "用20个番茄钟让花园变得茂盛！",
    sproutGardener: "🌱 幼苗园丁",
    sproutGardenerDesc: "用5个番茄钟长出了第一批幼苗。",
    seedPlanting: "🌰 播种中",
    seedPlantingDesc: "用第一个番茄钟开始花园之旅吧！",
    
    // 激励消息
    plantFirstSeed: "播下第一颗种子吧！🌱",
    sproutGrowing: "幼苗正在发芽！🌿",
    flowersBloom: "美丽的花朵正在绽放！🌸",
    gardenInFullBloom: "花园盛开了！🌺",
    amazingGardener: "您成为了了不起的园丁！🏆",
    completeFirstTask: "完成第一个任务吧！✨",
    goodStart: "好的开始！🎯",
    consistentAchievement: "持续在取得成就！🌟",
    excellentExecution: "出色的执行力！💪",
    gardenAwaits: "花园在等待着您！🌈",
    good15MinFocus: "15分钟的专注，好的开始！🌱",
    good30MinFocus: "30分钟的深度专注！🌿",
    excellent1HourFocus: "1小时的沉浸，太棒了！🌸",
    
    // 卡片详细信息
    completedPomodoroSessions: "完成的番茄钟时段",
    successfulFocusTime: "成功完成的专注时间",
    beautifulSprouts: "{count}个美丽的幼苗成长了！",
    growFirstSprout: "培育第一个幼苗吧！🌱",
    achievedTasks: "完成的任务",
    healthyRestPattern: "健康的休息模式",
    balancedRest: "正在进行均衡的休息！🦋",
    restIsImportant: "专注后的休息也很重要！🌺",
    recordedTime: "记录时间",
    consecutiveDays: "连续天数",
    consistentGrowthRecord: "持续成长记录",
    becomingSteadyGardener: "正在成为稳定的园丁！🌳",
    growDailySlowly: "每天慢慢成长吧！🌱",
    
    // 状态描述
    high: "高",
    good: "良好",
    excellent: "优秀",
    balanced: "均衡",
    measuring: "测量中",
    startingStage: "起步阶段",
    noneYet: "暂无",
    count: "个",
    
    // 今日成果
    keepBeautifyingGarden: "今天也要美化花园！🌿",
    startFromTimerTab: "从计时器页面开始",
    
    // 激励语句
    gardenGrowingLush: "您的花园越来越茂盛了！",
    steadyEffortBloomsFlowers: "持续的努力会开出美丽的花朵",
    growSlowlyButSteadily: "慢慢地，但要稳步成长",
    
    // 详细信息标签
    detail_total: "总计",
    detail_today: "今日",
    detail_thisWeek: "本周",
    detail_target: "目标",
    detail_streak: "连续",
    detail_efficiency: "效率",
    detail_avgSession: "平均时段",
    detail_bestStreak: "最佳连续",
    detail_totalDays: "总天数",
    detail_completed: "已完成",
    detail_pending: "待完成",
    detail_completionRate: "完成率",
    detail_productivity: "生产力",
    detail_totalBreaks: "总休息",
    detail_avgBreakTime: "平均休息",
    detail_restQuality: "休息质量",
    detail_balance: "平衡",
    detail_totalMinutes: "总分钟",
    detail_totalHours: "总小时",
    detail_avgDaily: "日平均",
    detail_focusQuality: "专注质量",
    detail_currentStreak: "当前连续",
    detail_level: "等级",
    detail_nextLevelIn: "距下一等级",
    
    // StatsTab 新增翻译
    todayGardenLabel: "今日花园",
    weeklyGrowthLabel: "本周花园成长", 
    monthlyFlowerbedLabel: "本月花圃",
    totalGardenStatusLabel: "花园总体状况",
    periodSelection: "期间选择",
    todayLabel: "今日",
    weekLabel: "周间", 
    monthLabel: "月间",
    totalLabel: "全部",
    currentStatus: "现状",
    timeFormat: "{hours}小时{minutes}分钟",
    minutesFormat: "{minutes}分钟",
    plantedSprouts: "播种的幼苗",
    grownLeaves: "成长的叶子", 
    bloomedFlowers: "盛开的花朵",
    grownTrees: "成长的树木",
    recent7DaysGrowth: "最近7天花园成长记录",
    myPlantCollection: "我的植物收藏",
    countUnit: "个",
    gardenAchievementSummary: "花园成就总结",
    totalFocusTimeLabel: "总专注时间",
    grownPlantsLabel: "培育的植物",
    completedTasksLabel: "完成的任务",
    averageCompletionLabel: "平均完成率",
    
    // TasksTab 新增翻译
    myTaskGardenTitle: "我的任务花园",
    taskGardenSubtitle: "今天也来培育美丽的任务吧",
    totalTasksLabel: "全部任务",
    completedTasksLabel: "已完成", 
    pendingTasksLabel: "待完成",
    taskFilter: "任务筛选",
    viewAll: "查看全部",
    viewPending: "待完成",
    viewCompleted: "已完成", 
    highPriorityFilter: "高优先级",
    mediumPriorityFilter: "中优先级",
    lowPriorityFilter: "低优先级",
    addNewTaskForm: "种植新任务",
    newTaskPlaceholder: "请输入新的花园任务...",
    prioritySelection: "优先级选择",
    highPriorityOption: "高 - 红玫瑰",
    mediumPriorityOption: "中 - 向日葵", 
    lowPriorityOption: "低 - 绿叶",
    plantTaskButton: "种植任务",
    noTasksPlantedTitle: "还没有种植任务呢",
    firstSeedMessage: "种下第一颗种子吧!",
    noMatchingTasksMessage: "没有符合条件的任务",
    plantFirstTaskButton: "种植第一个任务",
    highPriorityLabel: "高",
    mediumPriorityLabel: "中",
    lowPriorityLabel: "低",
    completionAnimation: "完成动画",
    decorativeFlowers: "装饰花朵",
    floatingAddButton: "浮动添加按钮",
    
    // TimerTab 新增翻译
    focusingBackground: "专注中 (后台)",
    restingBackground: "休息中 (后台)",
    
    // 其他组件
    loadingTasksList: "正在加载任务列表...",
    loadingSettingsText: "正在加载设置...",
    preparingGarden: "正在准备花园...",
    confirmButton: "确认",
    koreanLanguage: "한국어",
    chineseLanguage: "中文",
    changeLanguageDescription: "更改语言以更方便地使用应用",
    
    // StatsTab 缺失翻译键
    plantedSeeds: "播种的种子",
    focusedTime: "专注时间",
    completedTodos: "完成的任务", 
    noSeedsPlantedTitle: "还没有播种呢",
    startTimerPlantFirstSeed: "启动计时器来种下第一颗种子吧!",
    beautifulGardenGrows: "每次专注都会让美丽的花园成长。",
    
    // GardenFairy 翻译键
    gardenFairyChat: "与花园精灵对话",
    gardenFairyChatTitle: "与花园精灵的对话",
    quickQuestions: "快速提问",
    fairyMessagePlaceholder: "给花园精灵发送消息...",
    focusHelpRequest: "专注帮助请求",
    taskOrganizationHelp: "任务整理帮助",
    motivationNeeded: "需要动力",
    restRecommendation: "休息建议",
    focusHelpMessage: "我需要专注方面的帮助",
    taskOrganizationMessage: "如何更好地整理任务呢?",
    motivationMessage: "我需要一些动力",
    restMessage: "如何更好地休息呢?",
    fairyErrorMessage: "抱歉，现在无法回答 🌿",
    fairyConnectionError: "抱歉，现在无法对话。请稍后再试 🌿",
    goodMorningGreeting: "早上好！今天也来培育美丽的花园吧 🌸",
    goodAfternoonGreeting: "下午好！在午后的花园里绽放专注之花吧 🌻",
    goodEveningGreeting: "晚上好！在夜晚的花园里也要静心专注哦 🌙",
    
    // AI 系统提示词相关
    fairySystemPrompt: "你是一个友善的花园精灵。你的角色是帮助用户专注和管理任务。",
    currentSituation: "当前状况:",
    timerStatus: "计时器状态",
    completedPomodoros: "完成的番茄钟",
    currentTask: "当前任务",
    selectedTaskNone: "未选择任务",
    remainingTime: "剩余时间",
    fairyMood: "精灵心情",
    personalityAndTone: "性格和语调:",
    naturalWarmTone: "始终以自然温暖的语调对话",
    gardenMetaphors: "经常使用与花园和植物相关的比喻",
    shortConciseAnswers: "简短而简洁的回答 (1-2句)",
    useEmojis: "适当使用表情符号表达亲切感",
    encourageMotivate: "鼓励和激励用户",
    situationalResponses: "情境响应:",
    focusStart: "开始专注时: 使用种植新种子的表达",
    duringFocus: "专注中: 鼓励植物正在成长",
    duringRest: "休息时: 使用在花园中休息的表达",
    onCompletion: "完成时: 使用花朵盛开的祝贺表达",
    counseling: "烦恼咨询: 用自然的智慧给予建议",
    focusing: "专注中",
    resting: "休息中",
    stopped: "已停止",
    minutes: "分钟",
    count: "个"
  }
};

// 当前语言状态
let currentLanguage = 'ko'; // 默认韩语

// 语言管理类
class I18nManager {
  constructor() {
    this.currentLanguage = 'ko';
    this.translations = translations;
    this.listeners = new Set();
    this.loadLanguageFromStorage();
  }

  // 从存储加载语言设置
  async loadLanguageFromStorage() {
    try {
      const savedLanguage = await AppSdk.appData.getData({
        collection: 'settings',
        id: 'language'
      });
      
      if (savedLanguage && savedLanguage.language) {
        this.currentLanguage = savedLanguage.language;
        currentLanguage = savedLanguage.language;
      } else {
        // 检测系统语言
        const systemLanguage = navigator.language || navigator.userLanguage;
        if (systemLanguage.startsWith('zh')) {
          this.currentLanguage = 'zh';
          currentLanguage = 'zh';
        }
      }
    } catch (error) {
      console.log('Language setting not found, using default');
    }
  }

  // 保存语言设置到存储
  async saveLanguageToStorage(language) {
    try {
      // 先尝试获取现有设置
      const existingSettings = await AppSdk.appData.getData({
        collection: 'settings',
        id: 'language'
      });

      if (existingSettings) {
        // 更新现有设置
        await AppSdk.appData.updateData({
          collection: 'settings',
          id: 'language',
          data: { language }
        });
      } else {
        // 创建新设置
        await AppSdk.appData.createData({
          collection: 'settings',
          data: {
            id: 'language',
            language
          }
        });
      }
    } catch (error) {
      console.error('Failed to save language setting:', error);
    }
  }

  // 切换语言
  async setLanguage(language) {
    if (this.translations[language]) {
      this.currentLanguage = language;
      currentLanguage = language;
      await this.saveLanguageToStorage(language);
      this.notifyListeners();
    }
  }

  // 获取当前语言
  getCurrentLanguage() {
    return this.currentLanguage;
  }

  // 获取可用语言列表
  getAvailableLanguages() {
    return [
      { code: 'ko', name: '한국어', flag: '🇰🇷' },
      { code: 'zh', name: '中文', flag: '🇨🇳' }
    ];
  }

  // 翻译文本
  t(key, params = {}) {
    const keys = key.split('.');
    let value = this.translations[this.currentLanguage];
    
    for (const k of keys) {
      if (value && typeof value === 'object') {
        value = value[k];
      } else {
        break;
      }
    }
    
    // 如果找不到翻译，尝试使用韩语作为后备
    if (!value && this.currentLanguage !== 'ko') {
      value = this.translations.ko;
      for (const k of keys) {
        if (value && typeof value === 'object') {
          value = value[k];
        } else {
          break;
        }
      }
    }
    
    // 如果仍然找不到，返回key
    if (!value) {
      return key;
    }
    
    // 替换参数
    if (typeof value === 'string' && Object.keys(params).length > 0) {
      return value.replace(/\{(\w+)\}/g, (match, paramKey) => {
        return params[paramKey] !== undefined ? params[paramKey] : match;
      });
    }
    
    return value;
  }

  // 添加语言变化监听器
  addListener(callback) {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  // 通知所有监听器
  notifyListeners() {
    this.listeners.forEach(callback => callback(this.currentLanguage));
  }

  // 格式化时间
  formatTime(seconds, options = {}) {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    if (hours > 0) {
      return this.t('timeFormat', { hours, minutes });
    }
    return this.t('minutesOnly', { minutes });
  }

  // 获取日期格式
  formatDate(date) {
    if (this.currentLanguage === 'zh') {
      return date.toLocaleDateString('zh-CN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } else {
      return date.toLocaleDateString('ko-KR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    }
  }

  // 获取星期格式
  formatWeekday(date) {
    if (this.currentLanguage === 'zh') {
      return date.toLocaleDateString('zh-CN', { weekday: 'short' });
    } else {
      return date.toLocaleDateString('ko-KR', { weekday: 'short' });
    }
  }
}

// 创建全局实例
const i18n = new I18nManager();

// 导出翻译函数和管理器
export const t = (key, params) => i18n.t(key, params);
export const setLanguage = (language) => i18n.setLanguage(language);
export const getCurrentLanguage = () => i18n.getCurrentLanguage();
export const getAvailableLanguages = () => i18n.getAvailableLanguages();
export const addLanguageListener = (callback) => i18n.addListener(callback);
export const formatTime = (seconds, options) => i18n.formatTime(seconds, options);
export const formatDate = (date) => i18n.formatDate(date);
export const formatWeekday = (date) => i18n.formatWeekday(date);

export default i18n;