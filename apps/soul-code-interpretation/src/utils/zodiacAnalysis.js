// 星座特质分析工具

// 星座特质定义
export const zodiacTraits = {
  '白羊座': { 
    traits: '热情奔放 · 充满活力 · 勇敢无畏',
    emoji: '♈'
  },
  '金牛座': { 
    traits: '稳重踏实 · 追求品质 · 享受生活',
    emoji: '♉'
  },
  '双子座': { 
    traits: '灵活多变 · 思维敏捷 · 善于沟通',
    emoji: '♊'
  },
  '巨蟹座': { 
    traits: '情感细腻 · 富有同理心 · 重视家庭',
    emoji: '♋'
  },
  '狮子座': { 
    traits: '自信阳光 · 富有魅力 · 追求卓越',
    emoji: '♌'
  },
  '处女座': { 
    traits: '追求完美 · 注重细节 · 理性务实',
    emoji: '♍'
  },
  '天秤座': { 
    traits: '追求平衡 · 优雅和谐 · 重视关系',
    emoji: '♎'
  },
  '天蝎座': { 
    traits: '洞察力强 · 意志坚定 · 情感深刻',
    emoji: '♏'
  },
  '射手座': { 
    traits: '乐观开朗 · 追求自由 · 热爱探索',
    emoji: '♐'
  },
  '摩羯座': { 
    traits: '踏实稳重 · 目标明确 · 富有责任感',
    emoji: '♑'
  },
  '水瓶座': { 
    traits: '独立创新 · 思维独特 · 追求进步',
    emoji: '♒'
  },
  '双鱼座': { 
    traits: '富有想象 · 情感丰富 · 直觉敏锐',
    emoji: '♓'
  }
};

// 获取星座特质
export function getZodiacTraits(zodiacSign) {
  return zodiacTraits[zodiacSign]?.traits || '充满神秘色彩';
}

// 获取星座 Emoji
export function getZodiacEmoji(zodiacSign) {
  return zodiacTraits[zodiacSign]?.emoji || '✨';
}

// 获取所有星座列表
export function getZodiacList() {
  return Object.keys(zodiacTraits);
}

