// AI 分析服务
import AppSdk from '@morphixai/app-sdk';
import { reportError } from '@morphixai/lib';
import { getSoulTypeAnalysis } from '../utils/soulAnalysis';
import { getZodiacTraits } from '../utils/zodiacAnalysis';

export class AIService {
  // 系统提示词 - 定义 AI 的角色和风格
  static SYSTEM_PROMPT = `你是一位融合了心理学、哲学和东方智慧的灵魂导师。你的任务是帮助用户深入理解他们的九型人格测试结果，用充满温度和智慧的语言，为他们提供个性化的洞察和引导。

你的回应特点：
1. 富有共情和温暖，像一位理解人性的智者
2. 将心理学知识与生活智慧结合
3. 用诗意但不空洞的语言表达
4. 给予具体可行的成长建议
5. 避免说教，而是引导用户自我觉察

请用中文回应，保持简洁深刻（200-300字）。`;

  // 生成个性化的深度分析
  static async generateDeepAnalysis(testResult, userInfo = {}) {
    try {
      const typeData = getSoulTypeAnalysis(testResult);
      const zodiacTraits = userInfo.zodiac ? getZodiacTraits(userInfo.zodiac) : '';

      const userPrompt = `
用户完成了九型人格测试，结果如下：
- 主要类型：${typeData.typeTitle}
- 核心特质：${typeData.typeTraits}
- 得分比例：主要类型 ${testResult.scorePercentages?.mainType || 0}%${testResult.secondaryType ? `，次要类型 ${testResult.scorePercentages?.secondaryType || 0}%` : ''}
${userInfo.zodiac ? `- 星座：${userInfo.zodiac}（${zodiacTraits}）` : ''}

请为用户提供：
1. 对测试结果的深度解读（这个类型的人在生活中的真实表现）
2. 当前阶段可能面临的核心挑战
3. 一个具体的成长建议或练习
`;

      const messages = [
        { role: 'system', content: this.SYSTEM_PROMPT },
        { role: 'user', content: userPrompt }
      ];

      const response = await AppSdk.AI.chat({
        messages: messages,
        options: {
          model: 'openai/gpt-4o',
          temperature: 0.8
        }
      });

      console.log('AI 分析生成成功');
      return this.formatAIResponse(response);
    } catch (error) {
      await reportError(error, 'JavaScriptError', {
        component: 'AIService',
        action: 'generateDeepAnalysis'
      });
      
      // 返回默认分析
      return this.getDefaultAnalysis(testResult);
    }
  }

  // 生成每日能量指引
  static async generateDailyInsight(userType = null) {
    try {
      const today = new Date().toLocaleDateString('zh-CN');
      
      const userPrompt = userType 
        ? `为一位${getSoulTypeAnalysis({mainType: userType}).typeTitle}的用户，生成今天（${today}）的能量指引。用一句话（30-50字），给予他们今天的智慧提示。`
        : `生成今天（${today}）的通用能量指引，用一句话（30-50字），给予人们今天的智慧提示。`;

      const messages = [
        { role: 'system', content: this.SYSTEM_PROMPT },
        { role: 'user', content: userPrompt }
      ];

      const response = await AppSdk.AI.chat({
        messages: messages,
        options: {
          model: 'openai/gpt-4o',
          temperature: 0.9
        }
      });

      return this.formatAIResponse(response);
    } catch (error) {
      await reportError(error, 'JavaScriptError', {
        component: 'AIService',
        action: 'generateDailyInsight'
      });
      
      // 返回默认指引
      return this.getDefaultDailyInsight();
    }
  }

  // 格式化 AI 响应
  static formatAIResponse(response) {
    if (typeof response === 'string') {
      return response.trim();
    }
    if (response?.content) {
      return response.content.trim();
    }
    if (response?.choices?.[0]?.message?.content) {
      return response.choices[0].message.content.trim();
    }
    return '感谢你的探索，每一次自我觉察都是成长的开始。';
  }

  // 默认分析（当 AI 调用失败时使用）
  static getDefaultAnalysis(testResult) {
    const typeData = getSoulTypeAnalysis(testResult);
    return `${typeData.typeQuote}\n\n你的核心特质包括：${typeData.typeTraits}。${typeData.typeGuidance}`;
  }

  // 默认每日指引
  static getDefaultDailyInsight() {
    const insights = [
      '今天，跟随你内心的声音，它知道答案。🧘‍♀️',
      '宇宙正在与你共振，感受那股涌动的能量吧！💫',
      '放下评判，用爱和同理心连接他人。💖',
      '你的直觉是你最好的向导，相信它。🔮',
      '在独处中积蓄力量，深度思考带来突破。🧠',
      '今天适合勇敢表达，让你的真我闪耀。✨',
      '享受当下的美好，快乐是你最高的能量频率。🌈',
      '拥抱你的力量，无所畏惧地前行。⚡',
      '顺其自然，在流动中找到属于你的和谐。🌊'
    ];
    
    const today = new Date().getDate();
    return insights[today % insights.length];
  }

  // 获取可用的 AI 模型列表
  static async getAvailableModels() {
    try {
      return await AppSdk.AI.getAvailableModels();
    } catch (error) {
      await reportError(error, 'JavaScriptError', {
        component: 'AIService',
        action: 'getAvailableModels'
      });
      return [];
    }
  }
}

