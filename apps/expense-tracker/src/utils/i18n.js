const translations = {
  zh: {
    tabs: {
      add: '记账',
      records: '流水',
      stats: '统计'
    },
    addRecord: {
      title: '快速记账',
      expense: '支出',
      income: '收入',
      amount: '金额',
      category: '分类',
      note: '备注',
      notePlaceholder: '添加备注说明（可选）',
      saveButton: '保存记录',
      saveSuccess: '记账成功',
      saveFailed: '保存失败，请重试',
      invalidAmount: '请输入有效金额',
      selectCategory: '请选择分类',
      saving: '保存中...'
    },
    records: {
      title: '账单流水',
      empty: '暂无记账记录',
      edit: '编辑',
      delete: '删除',
      editTitle: '编辑记录',
      save: '保存',
      cancel: '取消',
      updateSuccess: '更新成功',
      updateFailed: '更新失败',
      deleteSuccess: '删除成功',
      deleteFailed: '删除失败',
      deleteConfirm: '确定要删除这条记录吗？'
    },
    stats: {
      title: '统计概览',
      income: '收入',
      expense: '支出',
      balance: '结余',
      categoryTitle: '支出分类',
      empty: '本月暂无记账记录'
    },
    categories: {
      expense: {
        food: '餐饮',
        transport: '交通',
        shopping: '购物',
        entertainment: '娱乐',
        medical: '医疗',
        housing: '住房',
        other: '其他'
      },
      income: {
        salary: '工资',
        bonus: '奖金',
        investment: '投资',
        partTime: '兼职',
        other: '其他'
      }
    }
  },
  en: {
    tabs: {
      add: 'Add',
      records: 'Records',
      stats: 'Stats'
    },
    addRecord: {
      title: 'Quick Entry',
      expense: 'Expense',
      income: 'Income',
      amount: 'Amount',
      category: 'Category',
      note: 'Note',
      notePlaceholder: 'Add note (optional)',
      saveButton: 'Save Record',
      saveSuccess: 'Saved successfully',
      saveFailed: 'Save failed, please retry',
      invalidAmount: 'Please enter valid amount',
      selectCategory: 'Please select category',
      saving: 'Saving...'
    },
    records: {
      title: 'Records',
      empty: 'No records yet',
      edit: 'Edit',
      delete: 'Delete',
      editTitle: 'Edit Record',
      save: 'Save',
      cancel: 'Cancel',
      updateSuccess: 'Updated successfully',
      updateFailed: 'Update failed',
      deleteSuccess: 'Deleted successfully',
      deleteFailed: 'Delete failed',
      deleteConfirm: 'Are you sure to delete this record?'
    },
    stats: {
      title: 'Statistics',
      income: 'Income',
      expense: 'Expense',
      balance: 'Balance',
      categoryTitle: 'Expense by Category',
      empty: 'No records this month'
    },
    categories: {
      expense: {
        food: 'Food',
        transport: 'Transport',
        shopping: 'Shopping',
        entertainment: 'Entertainment',
        medical: 'Medical',
        housing: 'Housing',
        other: 'Other'
      },
      income: {
        salary: 'Salary',
        bonus: 'Bonus',
        investment: 'Investment',
        partTime: 'Part-time',
        other: 'Other'
      }
    }
  }
};

const CATEGORY_KEYS = {
  expense: {
    '餐饮': 'food',
    '交通': 'transport',
    '购物': 'shopping',
    '娱乐': 'entertainment',
    '医疗': 'medical',
    '住房': 'housing',
    '其他': 'other'
  },
  income: {
    '工资': 'salary',
    '奖金': 'bonus',
    '投资': 'investment',
    '兼职': 'partTime',
    '其他': 'other'
  }
};

function getSystemLanguage() {
  const lang = navigator.language || navigator.userLanguage || 'en';
  if (lang.startsWith('zh')) {
    return 'zh';
  }
  return 'en';
}

let currentLanguage = getSystemLanguage();

export function getCurrentLanguage() {
  return currentLanguage;
}

export function t(key) {
  const keys = key.split('.');
  let value = translations[currentLanguage];
  
  for (const k of keys) {
    value = value?.[k];
  }
  
  return value || key;
}

export function getCategoryName(type, categoryKey) {
  return t(`categories.${type}.${categoryKey}`);
}

export function getCategoryKey(type, categoryName) {
  return CATEGORY_KEYS[type]?.[categoryName] || 'other';
}

export function getExpenseCategories() {
  return Object.keys(CATEGORY_KEYS.expense).map(name => ({
    name,
    key: CATEGORY_KEYS.expense[name]
  }));
}

export function getIncomeCategories() {
  return Object.keys(CATEGORY_KEYS.income).map(name => ({
    name,
    key: CATEGORY_KEYS.income[name]
  }));
}
