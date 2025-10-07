import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { getBrowserLanguage, getTranslations, createT, LANGUAGES } from '../locales/i18n';

// 状态持久化KEY
const STATE_KEY = 'million-questions-ai-state';
const LANGUAGE_KEY = 'million-questions-ai-language';

// 创建 Context
const AppContext = createContext(null);

// 自定义 Hook 用于使用 Context
export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within AppProvider');
  }
  return context;
};

// Context Provider 组件
export const AppProvider = ({ children }) => {
  // 语言状态 - 自动检测浏览器语言，默认英文
  const [language, setLanguageState] = useState(() => {
    // 首先尝试从 localStorage 获取
    const savedLanguage = localStorage.getItem(LANGUAGE_KEY);
    if (savedLanguage && Object.values(LANGUAGES).includes(savedLanguage)) {
      return savedLanguage;
    }
    // 否则自动检测浏览器语言
    return getBrowserLanguage();
  });

  // 应用全局状态
  const [currentIdea, setCurrentIdea] = useState('');
  const [currentQuestion, setCurrentQuestion] = useState('');
  const [selectedMentorId, setSelectedMentorId] = useState(null);
  const [boardSelection, setBoardSelection] = useState(null);
  const [showBoardModal, setShowBoardModal] = useState(false);

  // 获取当前语言的翻译
  const translations = useMemo(() => getTranslations(language), [language]);
  
  // 创建翻译函数
  const t = useMemo(() => createT(translations), [translations]);

  // 设置语言并保存到 localStorage
  const setLanguage = useCallback((newLanguage) => {
    if (Object.values(LANGUAGES).includes(newLanguage)) {
      setLanguageState(newLanguage);
      localStorage.setItem(LANGUAGE_KEY, newLanguage);
      console.log('🌍 语言已切换到:', newLanguage);
    }
  }, []);

  // 从 sessionStorage 恢复状态（组件挂载时）
  useEffect(() => {
    const restoreState = async () => {
      try {
        const savedState = sessionStorage.getItem(STATE_KEY);
        if (savedState) {
          const state = JSON.parse(savedState);
          
          // 检查是否过期（1小时）
          const isExpired = Date.now() - state.timestamp > 60 * 60 * 1000;
          
          if (!isExpired) {
            if (state.currentIdea) setCurrentIdea(state.currentIdea);
            if (state.currentQuestion) setCurrentQuestion(state.currentQuestion);
            if (state.selectedMentorId) setSelectedMentorId(state.selectedMentorId);
            if (state.boardSelection) setBoardSelection(state.boardSelection);
            
            console.log('✅ 状态已从 sessionStorage 恢复:', state);
          } else {
            console.log('⚠️ 状态已过期，已清除');
            sessionStorage.removeItem(STATE_KEY);
          }
        }
      } catch (error) {
        console.error('恢复状态失败:', error);
        sessionStorage.removeItem(STATE_KEY);
      }
    };

    restoreState();
  }, []);

  // 异步保存状态到 sessionStorage
  useEffect(() => {
    const saveState = async () => {
      const stateToSave = {
        currentIdea,
        currentQuestion,
        selectedMentorId,
        boardSelection,
        timestamp: Date.now()
      };
      
      try {
        // 使用 setTimeout 模拟异步操作，避免阻塞主线程
        setTimeout(() => {
          sessionStorage.setItem(STATE_KEY, JSON.stringify(stateToSave));
          console.log('💾 状态已异步保存');
        }, 0);
      } catch (error) {
        console.error('保存状态失败:', error);
      }
    };

    // 只在状态有值时才保存
    if (currentIdea || currentQuestion || selectedMentorId || boardSelection) {
      saveState();
    }
  }, [currentIdea, currentQuestion, selectedMentorId, boardSelection]);

  // 清除所有状态
  const clearAllState = useCallback(() => {
    setCurrentIdea('');
    setCurrentQuestion('');
    setSelectedMentorId(null);
    setBoardSelection(null);
    setShowBoardModal(false);
    sessionStorage.removeItem(STATE_KEY);
    console.log('🗑️ 所有状态已清除');
  }, []);

  // Context value
  const value = {
    // 语言相关
    language,
    setLanguage,
    t,
    translations,
    LANGUAGES,
    
    // 状态
    currentIdea,
    currentQuestion,
    selectedMentorId,
    boardSelection,
    showBoardModal,
    
    // 状态更新方法
    setCurrentIdea,
    setCurrentQuestion,
    setSelectedMentorId,
    setBoardSelection,
    setShowBoardModal,
    
    // 工具方法
    clearAllState
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
};
