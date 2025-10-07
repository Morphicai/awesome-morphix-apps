import { en } from './en';
import { zh } from './zh';

// 所有支持的语言
export const LANGUAGES = {
  EN: 'en',
  ZH: 'zh',
};

// 语言配置
const translations = {
  en,
  zh,
};

// 获取浏览器语言
export const getBrowserLanguage = () => {
  const browserLang = navigator.language || navigator.userLanguage;
  
  // 检测是否为中文
  if (browserLang.toLowerCase().startsWith('zh')) {
    return LANGUAGES.ZH;
  }
  
  // 默认返回英文
  return LANGUAGES.EN;
};

// 获取翻译文本
export const getTranslations = (language) => {
  return translations[language] || translations[LANGUAGES.EN];
};

// 获取嵌套的翻译值
export const getNestedTranslation = (obj, path) => {
  return path.split('.').reduce((acc, part) => acc?.[part], obj);
};

// i18n hook 的辅助函数
export const createT = (translations) => {
  return (key, defaultValue = '') => {
    const value = getNestedTranslation(translations, key);
    return value !== undefined ? value : defaultValue;
  };
};
