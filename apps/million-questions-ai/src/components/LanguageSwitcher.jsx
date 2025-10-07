import React, { useState } from 'react';
import { useAppContext } from '../contexts/AppContext';
import styles from '../styles/LanguageSwitcher.module.css';

/**
 * 语言切换器组件 - 用于调试和开发
 * 显示为悬浮按钮，点击展开语言选项
 */
export default function LanguageSwitcher() {
  const { language, setLanguage, LANGUAGES } = useAppContext();
  const [isExpanded, setIsExpanded] = useState(false);

  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
  };

  const handleLanguageChange = (lang) => {
    setLanguage(lang);
    setIsExpanded(false);
  };

  return (
    <div className={styles.languageSwitcher}>
      {/* 主按钮 */}
      <button 
        className={styles.mainButton}
        onClick={toggleExpanded}
        title="Switch Language / 切换语言"
      >
        <span className={styles.icon}>🌍</span>
        <span className={styles.currentLang}>
          {language.toUpperCase()}
        </span>
      </button>

      {/* 展开的语言选项 */}
      {isExpanded && (
        <div className={styles.languageOptions}>
          <button
            className={`${styles.langOption} ${language === LANGUAGES.EN ? styles.active : ''}`}
            onClick={() => handleLanguageChange(LANGUAGES.EN)}
          >
            <span className={styles.flag}>🇺🇸</span>
            <span className={styles.langName}>English</span>
          </button>
          <button
            className={`${styles.langOption} ${language === LANGUAGES.ZH ? styles.active : ''}`}
            onClick={() => handleLanguageChange(LANGUAGES.ZH)}
          >
            <span className={styles.flag}>🇨🇳</span>
            <span className={styles.langName}>中文</span>
          </button>
        </div>
      )}

      {/* 点击外部关闭 */}
      {isExpanded && (
        <div 
          className={styles.overlay}
          onClick={() => setIsExpanded(false)}
        />
      )}
    </div>
  );
}
