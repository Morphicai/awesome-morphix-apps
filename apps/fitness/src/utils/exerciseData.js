// 常规健身动作数据库
// 分类整理常见的健身动作，便于用户选择

const exerciseDatabase = {
  // 胸部训练
  chest: {
    name: '胸部',
    exercises: [
      {
        name: '平板卧推',
        defaultSets: 3,
        defaultReps: 10,
        defaultWeight: 60,
        defaultRestBetweenSets: 90,
        defaultRestAfterExercise: 120,
        description: '平躺在卧推凳上，双手握住杠铃，将杠铃从胸部推至手臂伸直',
        icon: 'barbell'
      },
      {
        name: '哑铃卧推',
        defaultSets: 3,
        defaultReps: 12,
        defaultWeight: 20,
        defaultRestBetweenSets: 60,
        defaultRestAfterExercise: 90,
        description: '平躺在卧推凳上，双手各持一个哑铃，从胸部推至手臂伸直',
        icon: 'barbell'
      },
      {
        name: '上斜卧推',
        defaultSets: 3,
        defaultReps: 10,
        defaultWeight: 50,
        defaultRestBetweenSets: 90,
        defaultRestAfterExercise: 120,
        description: '在上斜卧推凳上进行卧推，主要锻炼上胸肌',
        icon: 'barbell'
      },
      {
        name: '下斜卧推',
        defaultSets: 3,
        defaultReps: 10,
        defaultWeight: 50,
        defaultRestBetweenSets: 90,
        defaultRestAfterExercise: 120,
        description: '在下斜卧推凳上进行卧推，主要锻炼下胸肌',
        icon: 'barbell'
      },
      {
        name: '哑铃飞鸟',
        defaultSets: 3,
        defaultReps: 15,
        defaultWeight: 15,
        defaultRestBetweenSets: 60,
        defaultRestAfterExercise: 90,
        description: '平躺在卧推凳上，双手持哑铃向两侧打开，然后收回',
        icon: 'barbell'
      },
      {
        name: '器械夹胸',
        defaultSets: 3,
        defaultReps: 12,
        defaultWeight: 40,
        defaultRestBetweenSets: 60,
        defaultRestAfterExercise: 90,
        description: '坐在夹胸器械上，双臂向中间夹紧，然后缓慢回到原位',
        icon: 'barbell'
      },
      {
        name: '俯卧撑',
        defaultSets: 3,
        defaultReps: 15,
        defaultWeight: 0,
        defaultRestBetweenSets: 60,
        defaultRestAfterExercise: 90,
        description: '双手撑地，与肩同宽，身体保持直线，弯曲手肘下降再推起',
        icon: 'fitness'
      },
      {
        name: '绳索下斜夹胸',
        defaultSets: 3,
        defaultReps: 12,
        defaultWeight: 20,
        defaultRestBetweenSets: 60,
        defaultRestAfterExercise: 90,
        description: '站立在绳索器械前，双手握住把手向下夹胸',
        icon: 'barbell'
      }
    ]
  },
  
  // 背部训练
  back: {
    name: '背部',
    exercises: [
      {
        name: '引体向上',
        defaultSets: 3,
        defaultReps: 8,
        defaultWeight: 0,
        defaultRestBetweenSets: 90,
        defaultRestAfterExercise: 120,
        description: '双手握住横杠，手臂伸直悬挂，然后拉起身体直到下巴超过横杠',
        icon: 'body'
      },
      {
        name: '杠铃划船',
        defaultSets: 3,
        defaultReps: 10,
        defaultWeight: 40,
        defaultRestBetweenSets: 90,
        defaultRestAfterExercise: 120,
        description: '弯腰握住杠铃，背部保持平直，将杠铃拉向腹部',
        icon: 'barbell'
      },
      {
        name: '哑铃划船',
        defaultSets: 3,
        defaultReps: 12,
        defaultWeight: 20,
        defaultRestBetweenSets: 60,
        defaultRestAfterExercise: 90,
        description: '一手一膝支撑在凳子上，另一手持哑铃向上拉',
        icon: 'barbell'
      },
      {
        name: '坐姿划船',
        defaultSets: 3,
        defaultReps: 12,
        defaultWeight: 50,
        defaultRestBetweenSets: 60,
        defaultRestAfterExercise: 90,
        description: '坐在划船器上，抓住把手向身体方向拉',
        icon: 'barbell'
      },
      {
        name: '高位下拉',
        defaultSets: 3,
        defaultReps: 10,
        defaultWeight: 50,
        defaultRestBetweenSets: 90,
        defaultRestAfterExercise: 120,
        description: '坐在高位下拉器械上，抓住把手向下拉至胸前',
        icon: 'barbell'
      },
      {
        name: '直臂下拉',
        defaultSets: 3,
        defaultReps: 12,
        defaultWeight: 30,
        defaultRestBetweenSets: 60,
        defaultRestAfterExercise: 90,
        description: '站立握住绳索，手臂保持伸直，向下拉至大腿前方',
        icon: 'barbell'
      },
      {
        name: 'T杠划船',
        defaultSets: 3,
        defaultReps: 10,
        defaultWeight: 40,
        defaultRestBetweenSets: 90,
        defaultRestAfterExercise: 120,
        description: '俯身在T杠器械上，握住把手向上拉',
        icon: 'barbell'
      }
    ]
  },
  
  // 肩部训练
  shoulders: {
    name: '肩部',
    exercises: [
      {
        name: '哑铃肩上推举',
        defaultSets: 3,
        defaultReps: 10,
        defaultWeight: 15,
        defaultRestBetweenSets: 90,
        defaultRestAfterExercise: 120,
        description: '坐姿或站姿，双手持哑铃，从肩部向上推举',
        icon: 'barbell'
      },
      {
        name: '杠铃肩上推举',
        defaultSets: 3,
        defaultReps: 8,
        defaultWeight: 40,
        defaultRestBetweenSets: 90,
        defaultRestAfterExercise: 120,
        description: '站姿握住杠铃于肩前，向上推举至手臂伸直',
        icon: 'barbell'
      },
      {
        name: '哑铃侧平举',
        defaultSets: 3,
        defaultReps: 12,
        defaultWeight: 10,
        defaultRestBetweenSets: 60,
        defaultRestAfterExercise: 90,
        description: '站立持哑铃，双臂向两侧平举至与肩同高',
        icon: 'barbell'
      },
      {
        name: '哑铃前平举',
        defaultSets: 3,
        defaultReps: 12,
        defaultWeight: 10,
        defaultRestBetweenSets: 60,
        defaultRestAfterExercise: 90,
        description: '站立持哑铃，双臂向前平举至与肩同高',
        icon: 'barbell'
      },
      {
        name: '俯身侧平举',
        defaultSets: 3,
        defaultReps: 12,
        defaultWeight: 8,
        defaultRestBetweenSets: 60,
        defaultRestAfterExercise: 90,
        description: '俯身持哑铃，双臂向两侧平举',
        icon: 'barbell'
      },
      {
        name: '绳索面拉',
        defaultSets: 3,
        defaultReps: 12,
        defaultWeight: 15,
        defaultRestBetweenSets: 60,
        defaultRestAfterExercise: 90,
        description: '站立在绳索器械前，双手拉绳向面部方向',
        icon: 'barbell'
      },
      {
        name: '器械肩上推举',
        defaultSets: 3,
        defaultReps: 10,
        defaultWeight: 40,
        defaultRestBetweenSets: 90,
        defaultRestAfterExercise: 120,
        description: '坐在推举器械上，双手握把向上推举',
        icon: 'barbell'
      }
    ]
  },
  
  // 手臂训练
  arms: {
    name: '手臂',
    exercises: [
      {
        name: '杠铃弯举',
        defaultSets: 3,
        defaultReps: 10,
        defaultWeight: 30,
        defaultRestBetweenSets: 60,
        defaultRestAfterExercise: 90,
        description: '站立握住杠铃，手心向上，弯曲手肘将杠铃举至肩部',
        icon: 'barbell'
      },
      {
        name: '哑铃弯举',
        defaultSets: 3,
        defaultReps: 12,
        defaultWeight: 15,
        defaultRestBetweenSets: 60,
        defaultRestAfterExercise: 90,
        description: '站立握住哑铃，手心向上，弯曲手肘将哑铃举至肩部',
        icon: 'barbell'
      },
      {
        name: '锤式弯举',
        defaultSets: 3,
        defaultReps: 12,
        defaultWeight: 15,
        defaultRestBetweenSets: 60,
        defaultRestAfterExercise: 90,
        description: '站立握住哑铃，手心相对，弯曲手肘向上举',
        icon: 'barbell'
      },
      {
        name: '绳索下压',
        defaultSets: 3,
        defaultReps: 12,
        defaultWeight: 30,
        defaultRestBetweenSets: 60,
        defaultRestAfterExercise: 90,
        description: '站立面对绳索器械，双手握住绳索向下压',
        icon: 'barbell'
      },
      {
        name: '窄距卧推',
        defaultSets: 3,
        defaultReps: 10,
        defaultWeight: 40,
        defaultRestBetweenSets: 90,
        defaultRestAfterExercise: 120,
        description: '平躺在卧推凳上，双手窄距握住杠铃，进行卧推动作',
        icon: 'barbell'
      },
      {
        name: '哑铃颈后臂屈伸',
        defaultSets: 3,
        defaultReps: 12,
        defaultWeight: 20,
        defaultRestBetweenSets: 60,
        defaultRestAfterExercise: 90,
        description: '坐姿握住一个哑铃，双手将其举过头顶，然后弯曲手肘至颈后，再伸直',
        icon: 'barbell'
      },
      {
        name: '杠铃颈后臂屈伸',
        defaultSets: 3,
        defaultReps: 10,
        defaultWeight: 30,
        defaultRestBetweenSets: 90,
        defaultRestAfterExercise: 120,
        description: '坐姿握住杠铃，双手将其举过头顶，然后弯曲手肘至颈后，再伸直',
        icon: 'barbell'
      },
      {
        name: '反向弯举',
        defaultSets: 3,
        defaultReps: 12,
        defaultWeight: 15,
        defaultRestBetweenSets: 60,
        defaultRestAfterExercise: 90,
        description: '站立握住杠铃或哑铃，手心向下，弯曲手肘向上举',
        icon: 'barbell'
      }
    ]
  },
  
  // 腿部训练
  legs: {
    name: '腿部',
    exercises: [
      {
        name: '杠铃深蹲',
        defaultSets: 4,
        defaultReps: 10,
        defaultWeight: 80,
        defaultRestBetweenSets: 120,
        defaultRestAfterExercise: 180,
        description: '肩上扛杠铃，双脚与肩同宽，下蹲至大腿与地面平行，然后站起',
        icon: 'barbell'
      },
      {
        name: '哑铃深蹲',
        defaultSets: 3,
        defaultReps: 12,
        defaultWeight: 20,
        defaultRestBetweenSets: 90,
        defaultRestAfterExercise: 120,
        description: '双手持哑铃于身体两侧，进行深蹲动作',
        icon: 'barbell'
      },
      {
        name: '腿举',
        defaultSets: 3,
        defaultReps: 12,
        defaultWeight: 100,
        defaultRestBetweenSets: 90,
        defaultRestAfterExercise: 120,
        description: '坐在腿举器械上，用双腿推动重量向上',
        icon: 'barbell'
      },
      {
        name: '腿屈伸',
        defaultSets: 3,
        defaultReps: 15,
        defaultWeight: 40,
        defaultRestBetweenSets: 60,
        defaultRestAfterExercise: 90,
        description: '坐在腿屈伸器械上，将腿从弯曲伸直',
        icon: 'barbell'
      },
      {
        name: '腿弯举',
        defaultSets: 3,
        defaultReps: 15,
        defaultWeight: 40,
        defaultRestBetweenSets: 60,
        defaultRestAfterExercise: 90,
        description: '俯卧在腿弯举器械上，将腿从伸直弯曲',
        icon: 'barbell'
      },
      {
        name: '箭步蹲',
        defaultSets: 3,
        defaultReps: 10,
        defaultWeight: 20,
        defaultRestBetweenSets: 60,
        defaultRestAfterExercise: 90,
        description: '双手持哑铃，一腿向前一腿向后，下蹲然后站起',
        icon: 'body'
      },
      {
        name: '硬拉',
        defaultSets: 3,
        defaultReps: 8,
        defaultWeight: 80,
        defaultRestBetweenSets: 120,
        defaultRestAfterExercise: 180,
        description: '站立握住杠铃，背部挺直，抬起杠铃至大腿前方',
        icon: 'barbell'
      },
      {
        name: '小腿提踵',
        defaultSets: 3,
        defaultReps: 20,
        defaultWeight: 30,
        defaultRestBetweenSets: 60,
        defaultRestAfterExercise: 90,
        description: '站立持重物或徒手，提起脚跟，然后放下',
        icon: 'footsteps'
      }
    ]
  },
  
  // 核心训练
  core: {
    name: '核心',
    exercises: [
      {
        name: '仰卧起坐',
        defaultSets: 3,
        defaultReps: 20,
        defaultWeight: 0,
        defaultRestBetweenSets: 45,
        defaultRestAfterExercise: 60,
        description: '仰卧，双膝弯曲，上身向膝盖方向卷起',
        icon: 'body'
      },
      {
        name: '平板支撑',
        defaultSets: 3,
        defaultReps: 1,
        defaultWeight: 0,
        defaultRestBetweenSets: 60,
        defaultRestAfterExercise: 90,
        description: '俯卧，用前臂和脚尖支撑身体，保持身体成一直线，每组坚持30-60秒',
        icon: 'body'
      },
      {
        name: '侧平板支撑',
        defaultSets: 3,
        defaultReps: 1,
        defaultWeight: 0,
        defaultRestBetweenSets: 45,
        defaultRestAfterExercise: 60,
        description: '侧卧，用一侧前臂和脚支撑身体，每组坚持30秒',
        icon: 'body-outline'
      },
      {
        name: '五点支撑',
        defaultSets: 3,
        defaultReps: 1,
        defaultWeight: 0,
        defaultRestBetweenSets: 60,
        defaultRestAfterExercise: 90,
        description: '以双手、双脚和头部五个支撑点与地面接触，保持身体稳定，每组坚持30-45秒',
        icon: 'hand-left'
      },
      {
        name: '死虫式',
        defaultSets: 3,
        defaultReps: 15,
        defaultWeight: 0,
        defaultRestBetweenSets: 45,
        defaultRestAfterExercise: 60,
        description: '仰卧，双腿抬起弯曲90度，双臂向上伸直，然后一侧手臂和对侧腿同时伸直，交替进行',
        icon: 'bug'
      },
      {
        name: '侧支撑',
        defaultSets: 3,
        defaultReps: 10,
        defaultWeight: 0,
        defaultRestBetweenSets: 45,
        defaultRestAfterExercise: 60,
        description: '侧卧，以一侧手臂和脚为支点撑起身体，保持身体成一直线，上下移动髋部',
        icon: 'resize'
      },
      {
        name: '俄罗斯转体',
        defaultSets: 3,
        defaultReps: 20,
        defaultWeight: 5,
        defaultRestBetweenSets: 45,
        defaultRestAfterExercise: 60,
        description: '坐姿，双腿抬起，双手持重物，向两侧旋转上身',
        icon: 'sync'
      },
      {
        name: '腹肌轮',
        defaultSets: 3,
        defaultReps: 10,
        defaultWeight: 0,
        defaultRestBetweenSets: 60,
        defaultRestAfterExercise: 90,
        description: '跪姿握住腹肌轮，向前滚动然后回到起始位置',
        icon: 'disc'
      },
      {
        name: '举腿',
        defaultSets: 3,
        defaultReps: 15,
        defaultWeight: 0,
        defaultRestBetweenSets: 45,
        defaultRestAfterExercise: 60,
        description: '仰卧或悬挂，双腿一起抬起再放下',
        icon: 'body'
      },
      {
        name: '山climber',
        defaultSets: 3,
        defaultReps: 30,
        defaultWeight: 0,
        defaultRestBetweenSets: 45,
        defaultRestAfterExercise: 60,
        description: '俯卧撑姿势，双膝交替向胸部靠近',
        icon: 'trail-sign'
      }
    ]
  },
  
  // 有氧训练
  cardio: {
    name: '有氧',
    exercises: [
      {
        name: '跑步',
        defaultSets: 1,
        defaultReps: 1,
        defaultWeight: 0,
        defaultRestBetweenSets: 0,
        defaultRestAfterExercise: 0,
        description: '在跑步机上或户外进行跑步，持续20-30分钟',
        icon: 'walk'
      },
      {
        name: '动感单车',
        defaultSets: 1,
        defaultReps: 1,
        defaultWeight: 0,
        defaultRestBetweenSets: 0,
        defaultRestAfterExercise: 0,
        description: '在动感单车上进行骑行，持续20-30分钟',
        icon: 'bicycle'
      },
      {
        name: '椭圆机',
        defaultSets: 1,
        defaultReps: 1,
        defaultWeight: 0,
        defaultRestBetweenSets: 0,
        defaultRestAfterExercise: 0,
        description: '在椭圆机上进行训练，持续20-30分钟',
        icon: 'footsteps'
      },
      {
        name: '跳绳',
        defaultSets: 3,
        defaultReps: 100,
        defaultWeight: 0,
        defaultRestBetweenSets: 60,
        defaultRestAfterExercise: 90,
        description: '使用跳绳进行跳跃训练，每组100下',
        icon: 'pulse'
      },
      {
        name: '划船机',
        defaultSets: 1,
        defaultReps: 1,
        defaultWeight: 0,
        defaultRestBetweenSets: 0,
        defaultRestAfterExercise: 0,
        description: '在划船机上进行划船动作，持续15-20分钟',
        icon: 'boat'
      },
      {
        name: '高抬腿',
        defaultSets: 3,
        defaultReps: 30,
        defaultWeight: 0,
        defaultRestBetweenSets: 45,
        defaultRestAfterExercise: 60,
        description: '站立，交替将膝盖抬高至腰部',
        icon: 'footsteps'
      },
      {
        name: '波比跳',
        defaultSets: 3,
        defaultReps: 15,
        defaultWeight: 0,
        defaultRestBetweenSets: 60,
        defaultRestAfterExercise: 90,
        description: '下蹲、俯卧撑、跳起的组合动作',
        icon: 'rocket'
      }
    ]
  }
};

// 获取所有分类
export const getAllCategories = () => {
  return Object.keys(exerciseDatabase).map(key => ({
    id: key,
    name: exerciseDatabase[key].name
  }));
};

// 获取特定分类的所有动作
export const getExercisesByCategory = (categoryId) => {
  if (!exerciseDatabase[categoryId]) {
    return [];
  }
  return exerciseDatabase[categoryId].exercises;
};

// 获取所有动作的扁平列表
export const getAllExercises = () => {
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
  
  return allExercises;
};

// 按名称搜索动作
export const searchExercisesByName = (query) => {
  if (!query || query.trim() === '') {
    return [];
  }
  
  const lowerQuery = query.toLowerCase().trim();
  return getAllExercises().filter(exercise => 
    exercise.name.toLowerCase().includes(lowerQuery)
  );
};

export default exerciseDatabase;