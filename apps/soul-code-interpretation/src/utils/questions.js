// 九型人格测试题目 - 23道题

export const questions = [
  { 
    text: `当你没有达成预期目标时，你的第一反应更接近哪种？`,
    options: [
      { text: "A. 内疚或苛责自己，没有做到最好。", types: [1] },
      { text: "B. 假装不在意，但心里反复回放失败的场景。", types: [4, 9] }
    ] 
  },
  { 
    text: `在人际关系中，你更常遇到的内在挣扎是？`, 
    options: [
      { text: "A. 总想帮助别人，却忽略了自己的真实需要。", types: [2] },
      { text: "B. 害怕别人发现我其实并不完美或强大。", types: [3, 6] }
    ] 
  },
  { 
    text: `当你面对一个未知挑战，你通常的内在声音是？`, 
    options: [
      { text: "A. 如果我不完美准备，就容易出错。", types: [1, 6] },
      { text: "B. 这是一个机会，先上再说，边走边调整。", types: [3, 7] }
    ] 
  },
  { 
    text: `你更容易在什么状态下失去能量？`, 
    options: [
      { text: "A. 当我感觉与人之间失去了真实的连接时。", types: [4, 2] },
      { text: "B. 当我不得不持续应对表面事务而没有独处时间。", types: [5, 9] }
    ] 
  },
  { 
    text: `你对"控制"的真实态度是？`, 
    options: [
      { text: "A. 我需要掌控局面，才会感到安全和信任。", types: [8, 6] },
      { text: "B. 我倾向顺其自然，但内心仍想保持影响力。", types: [9, 2] }
    ] 
  },
  { 
    text: `你最不愿被别人误解成哪一种人？`, 
    options: [
      { text: "A. 无能或没用的人。", types: [3, 1] },
      { text: "B. 情绪化、不理性的人。", types: [5, 7] }
    ] 
  },
  { 
    text: `你更容易相信哪一句"潜意识信念"？`, 
    options: [
      { text: "A. 我的价值来自于我对别人的贡献。", types: [2] },
      { text: "B. 如果我不强大，就没人保护我。", types: [8, 6] }
    ] 
  },
  { 
    text: `你在什么时候最感到"自己像自己"？`, 
    options: [
      { text: "A. 当我独处、沉浸在自己的世界里时。", types: [5, 4] },
      { text: "B. 当我被认可、欣赏或需要时。", types: [3, 2] }
    ] 
  },
  { 
    text: `别人对你说的话中，哪种更容易刺痛你？`, 
    options: [
      { text: "A. 你总是太敏感了。", types: [4] },
      { text: "B. 你也没那么特别。", types: [3] }
    ] 
  },
  { 
    text: `在重要决定前，你更倾向于？`, 
    options: [
      { text: "A. 分析各种可能，直到理性满意。", types: [5, 1] },
      { text: "B. 感受哪种选择更符合我内在的感觉。", types: [4, 9] }
    ] 
  },
  { 
    text: `你面对权威时的真实反应更接近？`, 
    options: [
      { text: "A. 尊重前提下保持距离，内心警觉。", types: [6, 5] },
      { text: "B. 表现合作，但会观察是否值得信任。", types: [3, 9] }
    ] 
  },
  { 
    text: `你最难面对的内在恐惧是？`, 
    options: [
      { text: "A. 被忽视、没有人真正理解我。", types: [4, 2] },
      { text: "B. 我其实没价值，只是靠努力撑着。", types: [3, 1] }
    ] 
  },
  { 
    text: `如果你无法确定别人是否信任你，你会？`, 
    options: [
      { text: "A. 主动测试、试探或观察他们的反应。", types: [6, 8] },
      { text: "B. 退一步，直到我感到安全再靠近。", types: [5, 9] }
    ] 
  },
  { 
    text: `你更愿意用哪种方式面对冲突？`, 
    options: [
      { text: "A. 表面缓和，但内心积压情绪直到爆发。", types: [9, 4] },
      { text: "B. 直接正面回应，哪怕场面紧张。", types: [8, 1] }
    ] 
  },
  { 
    text: `当你独处一整天后，你的内心感受更可能是？`, 
    options: [
      { text: "A. 终于可以做自己，有一种能量回归的平静。", types: [5, 9] },
      { text: "B. 会陷入情绪起伏，觉得孤独和缺乏连接。", types: [4, 2] }
    ] 
  },
  { 
    text: `你通常是如何处理对他人的期望的？`, 
    options: [
      { text: "A. 尽可能满足，即使我自己很累。", types: [2, 3] },
      { text: "B. 用理性衡量值不值得，适度回应。", types: [5, 1] }
    ] 
  },
  { 
    text: `你更渴望哪一种人生状态？`, 
    options: [
      { text: "A. 被理解与真实表达自己，做灵魂有温度的人。", types: [4, 2] },
      { text: "B. 能力强大、目标清晰、不断进化和成就。", types: [3, 8] }
    ] 
  },
  { 
    text: `当事情不如预期，你通常会？`, 
    options: [
      { text: "A. 马上开始检讨自己哪里做得不够。", types: [1, 6] },
      { text: "B. 让自己冷静下来，先与情绪共处。", types: [9, 5] }
    ] 
  },
  { 
    text: `你更向往哪一种精神状态？`, 
    options: [
      { text: "A. 平静、连接内在、顺其自然但不随波逐流。", types: [9, 5] },
      { text: "B. 热情洋溢、充满动力、有明确愿景。", types: [3, 7] }
    ] 
  },
  { 
    text: `你对"安全感"的定义更接近？`, 
    options: [
      { text: "A. 内在稳定，对自己有把握，不依赖外界。", types: [5, 1] },
      { text: "B. 被看见、被接纳、和他人真实连接。", types: [2, 4] }
    ] 
  },
  { 
    text: `你在人群中通常的状态更像？`, 
    options: [
      { text: "A. 外表随和，但会默默观察每个人的情绪。", types: [9, 6] },
      { text: "B. 主动带动气氛，让大家感到舒服。", types: [2, 7] }
    ] 
  },
  { 
    text: `如果必须放下一个习惯，你更愿放下？`, 
    options: [
      { text: "A. 总想掌控一切、预知风险。", types: [6, 8] },
      { text: "B. 总在意别人怎么看自己。", types: [3, 2] }
    ] 
  },
  { 
    text: `你认为自己这一生的核心课题是？`, 
    options: [
      { text: "A. 找到内在的真实，勇敢表达。", types: [4, 9] },
      { text: "B. 超越外界评判，稳定成长。", types: [1, 6] }
    ] 
  }
];

// 计算测试结果
export function calculateTestResult(answers) {
  const scores = {
    1: 0, 2: 0, 3: 0, 4: 0, 5: 0,
    6: 0, 7: 0, 8: 0, 9: 0
  };

  // 计算每个类型的分数
  answers.forEach((answer, index) => {
    if (answer !== null && questions[index]) {
      const selectedOption = questions[index].options[answer];
      if (selectedOption && selectedOption.types) {
        selectedOption.types.forEach(type => {
          scores[type]++;
        });
      }
    }
  });

  // 排序得分
  const sortedScores = Object.entries(scores)
    .map(([type, score]) => ({ type: parseInt(type), score }))
    .sort((a, b) => b.score - a.score);

  // 计算得分比例
  const totalScore = sortedScores.reduce((sum, entry) => sum + entry.score, 0);
  const mainTypePercentage = totalScore > 0 ? Math.round((sortedScores[0].score / totalScore) * 100) : 0;
  const secondaryTypePercentage = sortedScores[1] && totalScore > 0 
    ? Math.round((sortedScores[1].score / totalScore) * 100) 
    : 0;

  return {
    mainType: sortedScores[0].type,
    secondaryType: sortedScores[1]?.score > 0 ? sortedScores[1].type : null,
    potentialType: sortedScores[2]?.score > 0 ? sortedScores[2].type : null,
    scores,
    scorePercentages: {
      mainType: mainTypePercentage,
      secondaryType: secondaryTypePercentage
    }
  };
}

