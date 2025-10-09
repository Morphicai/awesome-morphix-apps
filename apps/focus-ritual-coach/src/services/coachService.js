import AppSdk from '@morphixai/app-sdk';
import { reportError } from '@morphixai/lib';

/**
 * AI 教练服务 - 使用 MorphixAI AI 能力提供智能建议
 */

/**
 * 生成 AI 激励和建议
 * @param {Object} context - 上下文信息
 * @param {string} context.emotion - 情绪状态 (happy, calm, anxious, tired, energetic)
 * @param {number} context.energy - 能量等级 (1-5)
 * @param {Array} context.tasks - 今日任务列表
 * @param {Array} context.recentHistory - 最近的仪式历史
 * @returns {Promise<Object>} AI 生成的建议
 */
export async function generateCoachAdvice(context) {
  try {
    const { emotion, energy, tasks = [], recentHistory = [] } = context;

    // 构建 prompt
    const systemPrompt = `你是一位温暖、务实且富有洞察力的专注仪式教练。你的角色是帮助知识工作者建立稳定的专注习惯。

你的回答特点：
- 温暖但不过度乐观
- 具体可行而非空洞鼓励
- 关注当下状态而非长期目标
- 简洁有力（不超过50字）

回答格式（JSON）：
{
  "motivation": "一句简短的激励语（20-30字）",
  "action": "一个具体的下一步动作建议（15-20字）",
  "focusTip": "专注小技巧（可选，15-20字）"
}`;

    const userPrompt = `当前状态：
情绪：${emotion}
能量等级：${energy}/5
今日待办：${tasks.length > 0 ? tasks.slice(0, 3).join('、') : '尚未设定'}
最近完成：${recentHistory.length}次仪式（过去7天）

请给我一个贴心的建议。`;

    const response = await AppSdk.AI.chatCompletion({
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.8,
      maxTokens: 200,
    });

    // 解析响应
    let advice;
    try {
      const content = response.choices[0].message.content;
      advice = JSON.parse(content);
    } catch (parseError) {
      // 如果 JSON 解析失败，使用默认建议
      advice = {
        motivation: getDefaultMotivation(emotion, energy),
        action: getDefaultAction(energy, tasks.length),
        focusTip: '深呼吸，专注当下',
      };
    }

    return advice;
  } catch (error) {
    await reportError(error, 'JavaScriptError', {
      service: 'coachService',
      action: 'generateCoachAdvice',
    });

    // 返回默认建议
    return {
      motivation: '每一次专注都是成长',
      action: '让我们开始第一个小任务',
      focusTip: '保持呼吸节奏，专注当下',
    };
  }
}

/**
 * 生成任务优先级建议
 * @param {Array} tasks - 任务列表
 * @param {number} energy - 当前能量等级
 * @returns {Promise<Array>} 排序后的任务列表
 */
export async function prioritizeTasks(tasks, energy) {
  try {
    if (!tasks || tasks.length === 0) {
      return [];
    }

    // 简单的能量匹配算法
    // 高能量：推荐创造性、复杂任务
    // 中能量：推荐常规、中等难度任务
    // 低能量：推荐简单、机械性任务

    const taskPriority = tasks.map((task, index) => ({
      task,
      originalIndex: index,
      priority: calculateTaskPriority(task, energy),
    }));

    taskPriority.sort((a, b) => b.priority - a.priority);

    return taskPriority.map(t => t.task);
  } catch (error) {
    await reportError(error, 'JavaScriptError', {
      service: 'coachService',
      action: 'prioritizeTasks',
    });
    return tasks;
  }
}

/**
 * 计算任务优先级
 */
function calculateTaskPriority(task, energy) {
  // 这是一个简化的算法
  // 实际应用中可以使用更复杂的 NLP 或用户标记
  
  const highEnergyKeywords = ['创建', '设计', '策划', '写作', '思考'];
  const lowEnergyKeywords = ['整理', '回复', '检查', '更新', '复习'];

  const taskLower = task.toLowerCase();
  let score = 0;

  if (energy >= 4) {
    // 高能量时优先创造性任务
    highEnergyKeywords.forEach(keyword => {
      if (taskLower.includes(keyword)) score += 2;
    });
  } else if (energy <= 2) {
    // 低能量时优先简单任务
    lowEnergyKeywords.forEach(keyword => {
      if (taskLower.includes(keyword)) score += 2;
    });
  } else {
    // 中等能量，平衡分配
    score += 1;
  }

  return score;
}

/**
 * 获取默认激励语
 */
function getDefaultMotivation(emotion, energy) {
  const motivations = {
    happy: ['保持这份喜悦，让专注成为享受', '好心情是最好的燃料'],
    calm: ['平静是专注的开始', '深呼吸，进入心流状态'],
    anxious: ['一步一步来，焦虑会慢慢退去', '专注当下，而非未来'],
    tired: ['疲惫时更需要温柔对待自己', '小步前进也是前进'],
    energetic: ['把这份能量导向最重要的事', '趁热打铁，全力以赴'],
  };

  const emotionMotivations = motivations[emotion] || motivations.calm;
  return emotionMotivations[Math.floor(Math.random() * emotionMotivations.length)];
}

/**
 * 获取默认行动建议
 */
function getDefaultAction(energy, tasksCount) {
  if (tasksCount === 0) {
    return '先设定今天的三件事';
  }

  if (energy >= 4) {
    return '从最重要的任务开始';
  } else if (energy <= 2) {
    return '先完成一个简单的任务热身';
  } else {
    return '选择一个中等难度的任务';
  }
}

