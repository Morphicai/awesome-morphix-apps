// 灵魂类型分析工具 - 九型人格数据

// 灵魂类型定义
export const soulTypes = {
  1: {
    typeTitle: '完美者 · 第一型',
    typeQuote: '你如明镜，映照世界的真实与美好。',
    typeTraits: '追求完美、注重细节、富有责任感、正直诚实',
    typeGuidance: '当你学会接纳不完美，你的光芒会更加温暖。',
    icon: '🌟',
    secondaryType: 9,
    secondaryTypeTitle: '和平者'
  },
  2: {
    typeTitle: '助人者 · 第二型',
    typeQuote: '你如春风，温暖他人的心灵。',
    typeTraits: '富有同理心、乐于助人、善解人意、情感丰富',
    typeGuidance: '在给予爱的同时，也要学会爱自己。',
    icon: '💫',
    secondaryType: 4,
    secondaryTypeTitle: '浪漫者'
  },
  3: {
    typeTitle: '成就者 · 第三型',
    typeQuote: '你如星辰，闪耀着追求卓越的光芒。',
    typeTraits: '目标导向、追求卓越、适应力强、充满活力',
    typeGuidance: '在追求成功的同时，也要倾听内心的声音。',
    icon: '✨',
    secondaryType: 7,
    secondaryTypeTitle: '探索者'
  },
  4: {
    typeTitle: '浪漫者 · 第四型',
    typeQuote: '你如诗篇，书写着独特的生命故事。',
    typeTraits: '富有创造力、情感深刻、追求独特、直觉敏锐',
    typeGuidance: '你的独特不是缺陷，而是上天赐予的礼物。',
    icon: '🌙',
    secondaryType: 5,
    secondaryTypeTitle: '观察者'
  },
  5: {
    typeTitle: '观察者 · 第五型',
    typeQuote: '你如智者，洞察世界的奥秘。',
    typeTraits: '求知欲强、独立思考、洞察力强、理性客观',
    typeGuidance: '在思考的同时，也要感受生活的温度。',
    icon: '🔮',
    secondaryType: 8,
    secondaryTypeTitle: '领导者'
  },
  6: {
    typeTitle: '忠诚者 · 第六型',
    typeQuote: '你如守护者，守护着重要的一切。',
    typeTraits: '忠诚可靠、谨慎负责、富有同理心、重视安全',
    typeGuidance: '你的谨慎是智慧，但不要让担忧限制你的可能。',
    icon: '🛡️',
    secondaryType: 3,
    secondaryTypeTitle: '成就者'
  },
  7: {
    typeTitle: '探索者 · 第七型',
    typeQuote: '你如阳光，照亮生活的每个角落。',
    typeTraits: '乐观开朗、充满活力、追求快乐、富有创造力',
    typeGuidance: '在追求快乐的同时，也要学会面对挑战。',
    icon: '🌈',
    secondaryType: 1,
    secondaryTypeTitle: '完美者'
  },
  8: {
    typeTitle: '领导者 · 第八型',
    typeQuote: '你如火焰，燃烧着改变世界的力量。',
    typeTraits: '充满力量、保护他人、直率坦诚、富有领导力',
    typeGuidance: '你的力量是祝福，善用它来创造美好。',
    icon: '⚡',
    secondaryType: 2,
    secondaryTypeTitle: '助人者'
  },
  9: {
    typeTitle: '和平者 · 第九型',
    typeQuote: '你如流水，安静流动却深具力量。',
    typeTraits: '平和包容、善解人意、追求和谐、富有同理心',
    typeGuidance: '你的平和是力量，但也要学会表达自己。',
    icon: '🌊',
    secondaryType: 6,
    secondaryTypeTitle: '忠诚者'
  }
};

// 分析测试结果，返回灵魂类型
export function getSoulTypeAnalysis(testResult) {
  try {
    console.log('getSoulTypeAnalysis 接收到的测试结果:', testResult);
    
    if (!testResult || typeof testResult.mainType === 'undefined') {
      console.error('测试结果数据不完整:', testResult);
      throw new Error('测试结果数据不完整');
    }

    const typeData = soulTypes[testResult.mainType];
    console.log('找到的类型数据:', typeData);
    
    if (!typeData) {
      console.error('灵魂类型数据不存在，mainType:', testResult.mainType);
      throw new Error('灵魂类型数据不存在');
    }

    // 如果有次要类型，也获取其数据
    const result = { ...typeData };
    if (testResult.secondaryType && soulTypes[testResult.secondaryType]) {
      result.secondaryTypeTitle = soulTypes[testResult.secondaryType].typeTitle;
    }

    console.log('最终返回的结果:', result);
    return result;
  } catch (error) {
    console.error('灵魂类型分析失败:', error);
    throw error;
  }
}

// 获取类型图标
export function getTypeIcon(type) {
  return soulTypes[type]?.icon || '✨';
}

// 获取类型名称
export function getTypeName(type) {
  return soulTypes[type]?.typeTitle || `类型 ${type}`;
}

