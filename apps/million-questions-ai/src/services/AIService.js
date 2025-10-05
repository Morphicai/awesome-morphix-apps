import AppSdk from '@morphixai/app-sdk';
import { reportError } from '@morphixai/lib';

/**
 * AI服务封装
 */
export class AIService {
  /**
   * 战略分析
   */
  static async callStrategicAnalysis(idea) {
    try {
      const response = await AppSdk.AI.chat({
        messages: [
          {
            role: "system",
            content: `你是一位顶级的"首席战略分析师"，专门负责深度分析商业想法。

你的任务是：
1. 分析用户提出的商业想法的市场机会
2. 识别关键挑战和风险
3. 提炼成功的关键因素

请以JSON格式返回分析结果：
{
    "market_opportunity": "市场机会描述",
    "key_challenges": ["挑战1", "挑战2", "挑战3"],
    "success_factors": ["成功因素1", "成功因素2", "成功因素3"]
}`
          },
          {
            role: "user",
            content: `请分析这个商业想法：${idea}`
          }
        ],
        options: {
          model: "openai/gpt-4o",
          temperature: 0.7,
          maxTokens: 1000
        }
      });

      // 解析AI返回的JSON
      const analysisText = response.content;
      const jsonMatch = analysisText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('AI返回格式不正确');
      }
    } catch (error) {
      await reportError(error, 'JavaScriptError', {
        component: 'AIService',
        action: 'callStrategicAnalysis'
      });
      // 降级到模拟数据
      return {
        market_opportunity: `${idea}市场存在机会，需要深入分析目标用户和竞争环境`,
        key_challenges: ["市场定位", "用户获取", "商业模式验证"],
        success_factors: ["产品定位", "用户体验", "运营效率"]
      };
    }
  }

  /**
   * 生成黄金提问清单
   */
  static async generateGoldenQuestions(idea, analysis) {
    try {
      const response = await AppSdk.AI.chat({
        messages: [
          {
            role: "system",
            content: `你是一位顶级的"金牌提问官"，专门为商业想法生成最专业、最全面的黄金提问清单。

基于战略分析结果，你需要生成三个类别的提问：

### 1. 灵魂拷问 (Why - 战略原点)
* 关于使命、愿景、解决的根本问题的提问
* 深度挖掘项目的初心和意义

### 2. 战略布局 (What - 商业画布)  
* 关于用户、市场、痛点、解决方案、护城河、商业模式的提问
* 构建完整的商业逻辑

### 3. 战术执行 (How - 行动路线图)
* 关于MVP、核心功能、获客渠道、关键资源、衡量指标的提问
* 制定具体的执行计划

请以JSON格式返回问题清单：
{
    "categories": [
        {
            "category": "1. 灵魂拷问 (Why - 战略原点)",
            "questions": ["问题1", "问题2", "问题3"]
        },
        {
            "category": "2. 战略布局 (What - 商业画布)",
            "questions": ["问题1", "问题2", "问题3"]
        },
        {
            "category": "3. 战术执行 (How - 行动路线图)",
            "questions": ["问题1", "问题2", "问题3"]
        }
    ]
}

请确保每个问题都是开放性的，能够引导用户深入思考，并且问题要针对具体的商业想法和行业特点。`
          },
          {
            role: "user",
            content: `商业想法：${idea}

战略分析结果：
- 市场机会：${analysis.market_opportunity}
- 关键挑战：${analysis.key_challenges.join('、')}
- 成功因素：${analysis.success_factors.join('、')}

请基于以上信息，生成针对"${idea}"的个性化黄金提问清单。`
          }
        ],
        options: {
          model: "openai/gpt-4o",
          temperature: 0.8,
          maxTokens: 2000
        }
      });

      // 解析AI返回的JSON
      const responseText = response.content;
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const result = JSON.parse(jsonMatch[0]);
        return result.categories || result;
      } else {
        throw new Error('AI返回格式不正确');
      }
    } catch (error) {
      await reportError(error, 'JavaScriptError', {
        component: 'AIService',
        action: 'generateGoldenQuestions'
      });
      // 降级到通用模板
      return [
        {
          category: '1. 灵魂拷问 (Why - 战略原点)',
          questions: [
            '这个想法是否源于一个伟大的愿景，旨在解决什么根本问题？',
            '我们是否洞察了用户自己都未曾言明的、颠覆性的需求？',
            '我们是否能在产品的每一个细节上，都实现不计成本的完美？'
          ]
        },
        {
          category: '2. 战略布局 (What - 商业画布)',
          questions: [
            '这个模式能否构建一个多方共赢的平台，而非简单的线性业务？',
            '随着用户增长，平台对每个用户的价值是否会指数级提升？',
            '我们如何设计规则，确保生态的公平、开放和长期繁荣？'
          ]
        },
        {
          category: '3. 战术执行 (How - 行动路线图)',
          questions: [
            '我们是否聚焦于为客户创造价值的"主航道"？',
            '在战略突破口，我们是否集结重兵进行"压强式"投入？',
            '我们是否存在一种敢于"主动暴露短板"的文化和机制？'
          ]
        }
      ];
    }
  }

  /**
   * 推荐导师
   */
  static async recommendMentor(question) {
    try {
      // 根据问题内容智能推荐导师
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      if (question.includes('财务') || question.includes('成本') || question.includes('盈利') || question.includes('投资')) {
        return 'cfo';
      } else if (question.includes('增长') || question.includes('用户') || question.includes('营销') || question.includes('获客')) {
        return 'hacker';
      } else if (question.includes('数据') || question.includes('分析') || question.includes('实验') || question.includes('测试')) {
        return 'scientist';
      } else if (question.includes('执行') || question.includes('落地') || question.includes('实施') || question.includes('行动')) {
        return 'doer';
      } else if (question.includes('战略') || question.includes('规划') || question.includes('布局') || question.includes('长期')) {
        return 'strategist';
      } else {
        return 'visionary';
      }
    } catch (error) {
      await reportError(error, 'JavaScriptError', {
        component: 'AIService',
        action: 'recommendMentor'
      });
      return 'visionary';
    }
  }

  /**
   * 生成个性化解决方案
   */
  static async generateSolution(question, mentorId, idea) {
    try {
      const mentorPrompts = {
        'visionary': `你是一位远见卓识的创始人，拥有颠覆式创新的思维模式。你的回答特点：
- 关注第一性原理，从根本问题出发
- 善于发现市场空白和颠覆机会
- 强调愿景驱动和长期价值
- 提供突破性思维和前瞻性建议
- 语言风格：富有激情，具有启发性`,
        'hacker': `你是一位增长黑客，专注于用户增长和营销策略。你的回答特点：
- 关注用户获取和留存策略
- 强调数据分析和A/B测试
- 注重渠道优化和转化提升
- 提供创新的营销和增长方案
- 语言风格：创新活跃，注重效果`,
        'cfo': `你是一位严谨的财务官，专注于财务可行性和风险控制。你的回答特点：
- 关注财务模型和盈利能力
- 强调风险识别和控制措施
- 注重成本结构和现金流管理
- 提供量化的财务分析和预测
- 语言风格：严谨专业，数据驱动`,
        'scientist': `你是一位数据科学家，专注于数据分析和客观决策。你的回答特点：
- 关注数据收集和分析方法
- 强调客观性和科学性
- 注重预测模型和算法优化
- 提供基于数据的决策建议
- 语言风格：理性客观，注重逻辑`,
        'doer': `你是一位务实的执行者，专注于落地执行和用户价值。你的回答特点：
- 关注实际可行性和执行细节
- 强调用户验证和快速迭代
- 注重成本控制和资源优化
- 提供具体的行动步骤和时间规划
- 语言风格：理性务实，注重细节`,
        'strategist': `你是一位首席战略官，专注于战略规划和长期发展。你的回答特点：
- 关注市场洞察和竞争分析
- 强调差异化定位和资源配置
- 注重风险管理和应急预案
- 提供战略性的长期规划建议
- 语言风格：宏观视野，注重战略`
      };

      const systemPrompt = mentorPrompts[mentorId] || mentorPrompts['visionary'];
      const userPrompt = `商业想法：${idea || '用户项目'}
问题：${question}

请基于你的专业视角，以Markdown格式提供具体、可操作的解决方案，按以下结构组织：

### 1. [第一个方面的标题]
• 具体建议点1
• 具体建议点2
• 具体建议点3

### 2. [第二个方面的标题]
• 具体建议点1
• 具体建议点2
• 具体建议点3

### 3. 下一步行动建议
1. 具体行动步骤1
2. 具体行动步骤2
3. 具体行动步骤3`;

      const response = await AppSdk.AI.chat({
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
        options: {
          model: "openai/gpt-4o",
          temperature: 0.7,
          maxTokens: 2000
        }
      });

      // 解析响应
      return this.parseAISolution(response.content, mentorId);
    } catch (error) {
      await reportError(error, 'JavaScriptError', {
        component: 'AIService',
        action: 'generateSolution'
      });
      // 降级到模拟数据
      return this.getMockSolution(mentorId);
    }
  }

  /**
   * 解析AI返回的解决方案
   */
  static parseAISolution(aiResponse, mentorId) {
    const lines = aiResponse.split('\n').filter(line => line.trim());
    const sections = [];
    let currentSection = null;

    for (const line of lines) {
      const trimmedLine = line.trim();

      if (trimmedLine.startsWith('### ')) {
        if (currentSection) {
          sections.push(currentSection);
        }
        currentSection = {
          title: trimmedLine.substring(4),
          items: []
        };
      } else if (trimmedLine.startsWith('•') || trimmedLine.startsWith('-')) {
        if (currentSection) {
          currentSection.items.push(trimmedLine);
        }
      } else if (/^\d+\./.test(trimmedLine)) {
        if (currentSection) {
          currentSection.items.push(trimmedLine);
        }
      } else if (trimmedLine && currentSection) {
        currentSection.items.push(trimmedLine);
      }
    }

    if (currentSection) {
      sections.push(currentSection);
    }

    if (sections.length === 0) {
      return this.getMockSolution(mentorId);
    }

    return { sections };
  }

  /**
   * 获取模拟解决方案
   */
  static getMockSolution(mentorId) {
    const solutions = {
      'cfo': {
        sections: [
          {
            title: '1. 财务可行性评估',
            items: [
              '• 启动成本分析：列出项目一次性投入的所有成本',
              '• 盈亏平衡点测算：计算达到盈亏平衡所需的销售额',
              '• 现金流预测：准备至少6个月的运营储备金'
            ]
          },
          {
            title: '2. 盈利杠杆与风险控制',
            items: [
              '• 定价策略：制定合理的产品定价策略',
              '• 成本控制：采用灵活的成本控制方案',
              '• 合规风险：评估相关法规要求'
            ]
          },
          {
            title: '3. 下一步行动建议',
            items: [
              '1. 搭建详细的财务模型',
              '2. 寻求种子资金支持',
              '3. MVP成本核算优化'
            ]
          }
        ]
      },
      'hacker': {
        sections: [
          {
            title: '1. 增长假设',
            items: [
              '• 核心用户画像：明确目标用户群体',
              '• AARRR模型拆解：分析增长瓶颈和机会',
              '• 关键指标：确定当前阶段的核心指标'
            ]
          },
          {
            title: '2. 增长实验',
            items: [
              '• 获客渠道测试：设计低成本获客实验',
              '• 产品驱动增长：优化产品本身的增长属性',
              '• 病毒循环设计：设计用户分享机制'
            ]
          },
          {
            title: '3. 下一步行动建议',
            items: [
              '1. 搭建最小数据看板',
              '2. 执行第一个A/B测试',
              '3. 启动用户访谈验证假设'
            ]
          }
        ]
      },
      'visionary': {
        sections: [
          {
            title: '1. 愿景与使命拷问',
            items: [
              '• 初心：明确要解决的核心痛点',
              '• 终极形态：描绘10年后的项目愿景',
              '• 故事与传播：打造动人的品牌故事'
            ]
          },
          {
            title: '2. 市场破局点',
            items: [
              '• 重新定义行业：成为行业颠覆者',
              '• 构建文化壁垒：打造独特的品牌文化',
              '• 用户心智占领：建立强大的品牌认知'
            ]
          },
          {
            title: '3. 下一步行动建议',
            items: [
              '1. 撰写"愿景宣言"',
              '2. 寻找"天使用户"',
              '3. 设计"灯塔事件"'
            ]
          }
        ]
      }
    };

    return solutions[mentorId] || solutions['visionary'];
  }

  /**
   * 生成董事会决议报告
   */
  static async generateBoardReport(idea, navigator, members) {
    try {
      console.log('🤖 开始生成董事会决议报告');
      console.log('- 商业想法:', idea);
      console.log('- 领航人:', navigator.name);
      console.log('- 董事会成员:', members.map(m => m.name).join('、'));

      const response = await AppSdk.AI.chat({
        messages: [
          {
            role: "system",
            content: `你是一位资深的商业战略顾问，负责生成专业的董事会决议报告。

【领航人风格】
${navigator.name} - ${navigator.representative}
核心理念：${navigator.quote}

【董事会成员专长】
${members.map(m => `- ${m.name}: ${m.expertise}`).join('\n')}

你需要基于领航人的风格和成员的专长，生成一份详细的董事会决议报告。

请以JSON格式返回报告内容：
{
  "navigator_analysis": {
    "title": "领航人分析报告",
    "introduction": "简要介绍领航人对项目的整体看法（2-3句话）",
    "key_points": [
      {
        "aspect": "市场定位",
        "analysis": "具体的分析内容，要体现领航人的风格和视角"
      },
      {
        "aspect": "商业模式",
        "analysis": "具体的分析内容"
      },
      {
        "aspect": "执行策略",
        "analysis": "具体的分析内容"
      }
    ]
  },
  "members_opinions": [
    {
      "member": "成员名称（从提供的成员列表中选择）",
      "perspective": "专业角度（如：财务角度、技术角度等）",
      "opinions": [
        "具体建议1",
        "具体建议2",
        "具体建议3"
      ]
    }
  ],
  "board_resolutions": {
    "title": "董事会决议",
    "preamble": "经过充分讨论，董事会一致通过以下决议：",
    "resolutions": [
      {
        "category": "项目可行性",
        "decision": "具体的决议内容"
      },
      {
        "category": "资金需求",
        "decision": "具体的决议内容"
      },
      {
        "category": "时间规划",
        "decision": "具体的决议内容"
      },
      {
        "category": "风险控制",
        "decision": "具体的决议内容"
      }
    ]
  }
}

要求：
1. 内容必须具体、可执行，避免空泛的建议
2. 体现领航人的风格特点（如创新者注重颠覆，投资者注重回报等）
3. 成员意见要结合其专业领域
4. 决议要有明确的数字和时间点`
          },
          {
            role: "user",
            content: `商业想法：${idea}

请基于以上信息，生成一份专业的董事会决议报告。`
          }
        ],
        options: {
          model: "openai/gpt-4o",
          temperature: 0.7,
          maxTokens: 2500
        }
      });

      console.log('✅ 董事会报告AI响应:', response);

      // 解析JSON
      const reportText = response.content;
      const jsonMatch = reportText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const result = JSON.parse(jsonMatch[0]);
        console.log('✅ 董事会报告解析成功:', result);
        return result;
      } else {
        throw new Error('AI返回格式不正确');
      }
    } catch (error) {
      console.error('❌ 生成董事会报告失败:', error);
      await reportError(error, 'JavaScriptError', {
        component: 'AIService',
        action: 'generateBoardReport',
        idea: idea,
        navigator: navigator.id,
        members: members.map(m => m.id)
      });
      
      const errorMessage = this.getErrorMessage(error);
      alert(`董事会报告生成失败\n\n${errorMessage}\n\n将使用默认模板继续...`);
      
      // 返回降级数据
      return this.generateMockBoardReport(idea, navigator, members);
    }
  }

  /**
   * 生成模拟董事会报告（降级方案）
   */
  static generateMockBoardReport(idea, navigator, members) {
    return {
      navigator_analysis: {
        title: "领航人分析报告",
        introduction: `作为${navigator.name}（${navigator.representative}），我从战略高度审视了"${idea}"这个项目。`,
        key_points: [
          {
            aspect: "市场定位",
            analysis: "需要明确目标用户群体和核心价值主张，确保产品能够解决真实痛点"
          },
          {
            aspect: "商业模式",
            analysis: "建议采用多元化收入结构，降低单一收入来源的风险"
          },
          {
            aspect: "执行策略",
            analysis: "分阶段推进，先验证核心假设再全面扩张，避免过早规模化"
          }
        ]
      },
      members_opinions: members.slice(0, 3).map(member => ({
        member: member.name,
        perspective: this.getMemberPerspective(member.id),
        opinions: this.getMockMemberOpinions(member.id)
      })),
      board_resolutions: {
        title: "董事会决议",
        preamble: "经过充分讨论，董事会一致通过以下决议：",
        resolutions: [
          {
            category: "项目可行性",
            decision: "项目具有市场潜力，建议继续推进，但需要完善商业计划书"
          },
          {
            category: "资金需求",
            decision: "预计需要启动资金50-100万元，建议寻求天使轮融资"
          },
          {
            category: "时间规划",
            decision: "建议6个月内完成MVP，12个月内实现盈亏平衡"
          },
          {
            category: "风险控制",
            decision: "建立完善的风险评估和应对机制，每月进行风险复盘"
          }
        ]
      }
    };
  }

  /**
   * 获取成员视角
   */
  static getMemberPerspective(memberId) {
    const perspectives = {
      'vc': '投资角度',
      'cmo': '市场营销角度',
      'cto': '技术角度',
      'cfo': '财务角度',
      'cho': '组织人才角度',
      'clo': '法律合规角度'
    };
    return perspectives[memberId] || '专业角度';
  }

  /**
   * 获取模拟成员意见
   */
  static getMockMemberOpinions(memberId) {
    const opinions = {
      'vc': [
        '市场规模需达到10亿以上才有投资价值',
        '建议制定清晰的退出策略',
        '关注团队的执行力和学习能力'
      ],
      'cmo': [
        '建议进行充分的市场调研和用户访谈',
        '制定清晰的品牌定位和传播策略',
        '关注获客成本和用户生命周期价值'
      ],
      'cto': [
        '确保技术架构的可扩展性和稳定性',
        '评估技术实现的可行性和复杂度',
        '建立完善的技术团队和开发流程'
      ],
      'cfo': [
        '制定详细的财务预算和现金流预测',
        '控制成本，确保资金使用效率',
        '建立财务监控体系，定期复盘'
      ],
      'cho': [
        '明确核心团队的组成和职责分工',
        '建立有竞争力的薪酬和激励机制',
        '塑造积极向上的企业文化'
      ],
      'clo': [
        '评估项目的法律风险和合规要求',
        '完善股权结构和公司治理',
        '保护知识产权和商业机密'
      ]
    };
    return opinions[memberId] || [
      '从专业角度提供建议',
      '关注项目的可行性',
      '确保各项工作合规进行'
    ];
  }

  /**
   * 获取错误信息
   */
  static getErrorMessage(error) {
    if (error.message?.includes('network') || error.message?.includes('fetch')) {
      return '网络连接失败，请检查网络设置后重试';
    } else if (error.message?.includes('timeout')) {
      return 'AI服务响应超时，请稍后重试';
    } else if (error.message?.includes('quota') || error.message?.includes('limit')) {
      return 'AI服务调用额度不足，请联系管理员';
    } else {
      return `服务异常：${error.message || '未知错误'}`;
    }
  }
}
