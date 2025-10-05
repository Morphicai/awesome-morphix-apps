/**
 * 导师配置信息
 */
export const MENTORS = {
  visionary: {
    id: 'visionary',
    name: '远见创始人',
    icon: '💡',
    description: '痴迷于产品的灵魂与用户的情感共鸣',
    philosophy: '"痴迷于产品的灵魂与用户的情感共鸣。"'
  },
  hacker: {
    id: 'hacker',
    name: '增长黑客',
    icon: '📈',
    description: '专注于用户增长和数据驱动',
    philosophy: '"用数据驱动增长，用创新突破瓶颈。"'
  },
  cfo: {
    id: 'cfo',
    name: '首席财务官',
    icon: '💰',
    description: '严谨的财务分析和风险控制',
    philosophy: '"数字背后是商业的真相。"'
  },
  scientist: {
    id: 'scientist',
    name: '数据科学家',
    icon: '🔬',
    description: '基于数据分析提供客观决策',
    philosophy: '"让数据说话，让科学决策。"'
  },
  doer: {
    id: 'doer',
    name: '实干家',
    icon: '🛠️',
    description: '提供具体可执行的行动方案',
    philosophy: '"行动胜于雄辩，结果证明一切。"'
  },
  strategist: {
    id: 'strategist',
    name: '首席战略官',
    icon: '🧭',
    description: '从战略高度制定长期规划',
    philosophy: '"战略决定方向，执行决定成败。"'
  }
};

/**
 * 董事会角色配置
 */
export const BOARD_ROLES = {
  navigators: [
    {
      id: 'innovator',
      name: '颠覆式创新者',
      representative: '乔布斯 / 埃隆·马斯克',
      quote: '"只创造令人尖叫的产品，用第一性原理思考，重新定义世界。"'
    },
    {
      id: 'builder',
      name: '生态构建者',
      representative: '马云 / 马化腾',
      quote: '"思考终局，连接一切，让平台上的每个人都能成功。"'
    },
    {
      id: 'investor',
      name: '价值投资者',
      representative: '巴菲特 / 段永平',
      quote: '"寻找宽阔的护城河，关注长期复利，只投资看得懂的生意。"'
    },
    {
      id: 'doer',
      name: '实干家',
      representative: '雷军 / 任正非',
      quote: '"把一件事干到极致，死磕性价比，用强大的执行力穿透一切。"'
    }
  ],
  members: [
    {
      id: 'vc',
      name: '风险投资家 (VC)',
      expertise: '资本运作、市场趋势、退出策略'
    },
    {
      id: 'cmo',
      name: '首席营销官 (CMO)',
      expertise: '品牌定位、市场营销、用户增长'
    },
    {
      id: 'cto',
      name: '首席技术官 (CTO)',
      expertise: '技术架构、产品实现、研发管理'
    },
    {
      id: 'cfo',
      name: '首席财务官 (CFO)',
      expertise: '财务模型、成本控制、融资规划'
    },
    {
      id: 'cho',
      name: '首席人力官 (CHO)',
      expertise: '组织架构、人才招聘、企业文化'
    },
    {
      id: 'clo',
      name: '首席法务官 (CLO)',
      expertise: '法律风险、股权设计、合规审查'
    }
  ]
};
