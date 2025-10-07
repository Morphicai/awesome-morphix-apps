import { create } from 'zustand';
import { detectSystemLanguage, getTranslation } from './i18n';

// 语言管理 Store
const useLanguageStore = create((set, get) => ({
  language: detectSystemLanguage(),
  
  // 设置语言
  setLanguage: (lang) => {
    set({ language: lang });
    // 保存到 localStorage
    try {
      localStorage.setItem('app_language', lang);
    } catch (error) {
      console.error('Failed to save language preference:', error);
    }
  },
  
  // 初始化语言（从 localStorage 读取）
  initLanguage: () => {
    try {
      const savedLanguage = localStorage.getItem('app_language');
      if (savedLanguage && (savedLanguage === 'en' || savedLanguage === 'zh')) {
        set({ language: savedLanguage });
      } else {
        // 如果没有保存的语言，使用系统语言
        const systemLang = detectSystemLanguage();
        set({ language: systemLang });
      }
    } catch (error) {
      console.error('Failed to load language preference:', error);
      // 如果读取失败，使用系统语言
      const systemLang = detectSystemLanguage();
      set({ language: systemLang });
    }
  },
  
  // 获取翻译文本
  t: (key) => {
    const { language } = get();
    return getTranslation(language, key);
  },
}));

// 自定义 Hook
export const useLanguage = () => {
  const { language, setLanguage, initLanguage, t } = useLanguageStore();
  
  return {
    language,
    setLanguage,
    initLanguage,
    t,
    isEnglish: language === 'en',
    isChinese: language === 'zh',
  };
};

export default useLanguage;
