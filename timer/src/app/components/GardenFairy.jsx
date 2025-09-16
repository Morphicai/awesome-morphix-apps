import React, { useState, useEffect, useRef } from 'react';
import { IonButton, IonIcon, IonModal, IonContent, IonHeader, IonToolbar, IonTitle, IonItem, IonInput, IonSpinner, IonChip, IonActionSheet } from '@ionic/react';
import { sparkles, chatbubble, send, close, leaf, heart, star, swapHorizontal } from 'ionicons/icons';
import AppSdk from '@morphixai/app-sdk';
import { reportError } from '@morphixai/lib';
import { t, getCurrentLanguage } from '../utils/i18n';
import styles from '../styles/GardenFairy.module.css';

export default function GardenFairy({ 
  isTimerRunning, 
  isBreak, 
  completedPomodoros, 
  selectedTask,
  timeLeft,
  onTaskSuggestion 
}) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [fairyMood, setFairyMood] = useState('happy');
  const [selectedModel, setSelectedModel] = useState('openai/gpt-4o');
  const [showModelSelector, setShowModelSelector] = useState(false);
  const messagesEndRef = useRef(null);

  // 模型配置映射
  const modelConfigs = {
    'google/gemma-3-27b-it:free': {
      name: t('fairyVera'),
      personality: t('fairyPersonalityVera'),
      icon: '🌸',
      model: 'google/gemma-3-27b-it:free'
    },
    'openai/gpt-4o': {
      name: t('fairyLuna'),
      personality: t('fairyPersonalityLuna'),
      icon: '🌙',
      model: 'openai/gpt-4o'
    },
    
    'anthropic/claude-sonnet-4': {
      name: t('fairySage'),
      personality: t('fairyPersonalitySage'),
      icon: '✨',
      model: 'anthropic/claude-sonnet-4'
    }
  };

  // 요정의 기분 상태 업데이트
  useEffect(() => {
    if (isTimerRunning && !isBreak) {
      setFairyMood('focused');
    } else if (isBreak) {
      setFairyMood('relaxed');
    } else if (completedPomodoros > 0) {
      setFairyMood('proud');
    } else {
      setFairyMood('happy');
    }
  }, [isTimerRunning, isBreak, completedPomodoros]);

  // 요정 아이콘 선택
  const getFairyIcon = () => {
    // 首页始终使用浅肤色精灵图标
    return '🧚🏻‍♀️';
  };

  // 요정과 AI 대화
  const chatWithFairy = async (userMessage) => {
    try {
      const contextInfo = {
        isTimerRunning,
        isBreak,
        completedPomodoros,
        selectedTask: selectedTask?.text || null,
        timeLeft: Math.floor(timeLeft / 60),
        fairyMood
      };

      // AI 시스템 프롬프트 설정 - 다국어 지원
      const timerStatusText = isTimerRunning ? (isBreak ? t('resting') : t('focusing')) : t('stopped');
      const selectedTaskText = selectedTask?.text || t('selectedTaskNone');
      
      const systemPrompt = `${t('fairySystemPrompt')}

${t('currentSituation')}
- ${t('timerStatus')}: ${timerStatusText}
- ${t('completedPomodoros')}: ${completedPomodoros}${t('count')}
- ${t('currentTask')}: ${selectedTaskText}
- ${t('remainingTime')}: ${Math.floor(timeLeft / 60)}${t('minutes')}
- ${t('fairyMood')}: ${fairyMood}

${t('personalityAndTone')}
- ${t('naturalWarmTone')}
- ${t('gardenMetaphors')}
- ${t('shortConciseAnswers')}
- ${t('useEmojis')}
- ${t('encourageMotivate')}

${t('situationalResponses')}
- ${t('focusStart')}
- ${t('duringFocus')}
- ${t('duringRest')}
- ${t('onCompletion')}
- ${t('counseling')}`;

      const response = await AppSdk.AI.chat({
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userMessage }
        ],
        options: {
          model: modelConfigs[selectedModel].model,
          temperature: 0.8
        }
      });

      // Properly extract string content from AI response
      let content;
      if (typeof response === 'string') {
        content = response;
      } else if (response && typeof response.content === 'string') {
        content = response.content;
      } else if (response && typeof response === 'object') {
        // If response is an object, try to extract text content
        content = JSON.stringify(response);
      } else {
        content = t('fairyConnectionError');
      }

      return content;
    } catch (error) {
      console.error('AI 대화 오류:', error);
      await reportError(error, 'JavaScriptError', { component: 'GardenFairy' });
      return t('fairyConnectionError');
    }
  };

  // 메시지 전송
  const sendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMessage = inputMessage.trim();
    setInputMessage('');
    setIsLoading(true);

    // 사용자 메시지 추가
    const newMessages = [...messages, {
      id: Date.now(),
      type: 'user',
      content: userMessage,
      timestamp: new Date()
    }];
    setMessages(newMessages);

    try {
      // AI 응답 받기
      const fairyResponse = await chatWithFairy(userMessage);
      
      // Ensure response is a string for rendering
      const responseContent = typeof fairyResponse === 'string' 
        ? fairyResponse 
        : t('fairyConnectionError');
      
      // 요정 응답 추가
      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        type: 'fairy',
        content: responseContent,
        timestamp: new Date()
      }]);
    } catch (error) {
      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        type: 'fairy',
        content: t('fairyErrorMessage'),
        timestamp: new Date()
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  // 自动滚动到底部
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // 消息变化时自动滚动
  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  // 빠른 질문 버튼들
  const quickQuestions = [
    { text: t('focusHelpRequest'), icon: '🌱', message: t('focusHelpMessage') },
    { text: t('taskOrganizationHelp'), icon: '📝', message: t('taskOrganizationMessage') },
    { text: t('motivationNeeded'), icon: '✨', message: t('motivationMessage') },
    { text: t('restRecommendation'), icon: '🦋', message: t('restMessage') }
  ];

  // 빠른 질문 전송
  const sendQuickQuestion = async (question) => {
    setInputMessage('');
    setIsLoading(true);

    const newMessages = [...messages, {
      id: Date.now(),
      type: 'user',
      content: question.message,
      timestamp: new Date()
    }];
    setMessages(newMessages);

    try {
      const fairyResponse = await chatWithFairy(question.message);
      
      // Ensure response is a string for rendering
      const responseContent = typeof fairyResponse === 'string' 
        ? fairyResponse 
        : t('fairyConnectionError');
      
      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        type: 'fairy',
        content: responseContent,
        timestamp: new Date()
      }]);
    } catch (error) {
      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        type: 'fairy',
        content: t('fairyErrorMessage'),
        timestamp: new Date()
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  // 자동 인사 메시지
  useEffect(() => {
    if (isModalOpen && messages.length === 0) {
      const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return t('goodMorningGreeting');
        if (hour < 18) return t('goodAfternoonGreeting');
        return t('goodEveningGreeting');
      };

      setMessages([{
        id: Date.now(),
        type: 'fairy',
        content: getGreeting(),
        timestamp: new Date()
      }]);
    }
  }, [isModalOpen, messages.length]);

  return (
    <>
      {/* 요정 버튼 */}
      <div className={styles.fairyButton} onClick={() => setIsModalOpen(true)}>
        <div className={styles.fairyIcon}>
          <span className={styles.fairyEmoji}>{getFairyIcon()}</span>
          <div className={styles.sparkleEffect}>
            <IonIcon icon={sparkles} className={styles.sparkle} />
          </div>
        </div>
        <div className={styles.fairyTooltip}>
          {t('gardenFairyChat')}
        </div>
      </div>

      {/* 대화 모달 */}
      <IonModal 
        isOpen={isModalOpen} 
        onDidDismiss={() => setIsModalOpen(false)}
        className={styles.fairyModal}
      >
        <div className={styles.modalContainer}>
          {/* 头部 */}
          <IonHeader>
            <IonToolbar className={styles.modalHeader}>
              <IonTitle className={styles.modalTitle}>
                <span className={styles.titleIcon}>{modelConfigs[selectedModel].icon}</span>
                {modelConfigs[selectedModel].name}
              </IonTitle>
              
              {/* 精灵切换按钮 */}
              <IonButton
                fill="clear"
                slot="end"
                onClick={() => setShowModelSelector(true)}
                className={styles.headerModelSwitchButton}
                disabled={isLoading}
              >
                <IonIcon icon={swapHorizontal} />
              </IonButton>
              
              <IonButton 
                fill="clear" 
                slot="end" 
                onClick={() => setIsModalOpen(false)}
                className={styles.closeButton}
              >
                <IonIcon icon={close} />
              </IonButton>
            </IonToolbar>
          </IonHeader>

          {/* 消息列表区域 - 可滚动 */}
          <div className={styles.messagesContainer}>
          {/* 메시지 목록 */}
          <div className={styles.messagesList}>
            {messages.map((message) => (
              <div 
                key={message.id} 
                className={`${styles.messageItem} ${
                  message.type === 'user' ? styles.userMessage : styles.fairyMessage
                }`}
              >
                <div className={styles.messageContent}>
                  {message.type === 'fairy' && (
                    <span className={styles.messageIcon}>🧚🏻‍♀️</span>
                  )}
                  <div className={styles.messageBubble}>
                    <p className={styles.messageText}>{message.content}</p>
                  </div>
                </div>
              </div>
            ))}
            
            {isLoading && (
              <div className={`${styles.messageItem} ${styles.fairyMessage}`}>
                <div className={styles.messageContent}>
                  <span className={styles.messageIcon}>🧚🏻‍♀️</span>
                  <div className={styles.messageBubble}>
                    <IonSpinner name="dots" className={styles.loadingSpinner} />
                  </div>
                </div>
              </div>
            )}

            {/* 빠른 질문 버튼들 - 消息列表内 */}
            {messages.length <= 1 && (
              <div className={styles.quickQuestions}>
                <h4 className={styles.quickQuestionsTitle}>{t('quickQuestions')}</h4>
                <div className={styles.quickQuestionButtons}>
                  {quickQuestions.map((question, index) => (
                    <IonChip
                      key={index}
                      className={styles.quickQuestionChip}
                      onClick={() => sendQuickQuestion(question)}
                      disabled={isLoading}
                    >
                      <span className={styles.quickQuestionIcon}>{question.icon}</span>
                      <span className={styles.quickQuestionText}>{question.text}</span>
                    </IonChip>
                  ))}
                </div>
              </div>
            )}
            
            {/* 用于自动滚动定位的元素 */}
            <div ref={messagesEndRef} />
          </div>
        </div>

          {/* 输入框区域 - 固定在底部 */}
          <div className={styles.inputContainer}>
            <IonItem className={styles.inputItem}>
              <IonInput
                value={inputMessage}
                placeholder={t('fairyMessagePlaceholder')}
                onIonInput={(e) => setInputMessage(e.detail.value)}
                onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                disabled={isLoading}
                className={styles.textInput}
              />
              <IonButton
                fill="clear"
                onClick={sendMessage}
                disabled={!inputMessage.trim() || isLoading}
                className={styles.sendButton}
              >
                <IonIcon icon={send} />
              </IonButton>
            </IonItem>
          </div>
        </div>
      </IonModal>

      {/* 模型选择器 */}
      <IonActionSheet
        isOpen={showModelSelector}
        onDidDismiss={() => setShowModelSelector(false)}
        header={t('selectFairy')}
        buttons={[
          ...Object.entries(modelConfigs).map(([modelKey, config]) => ({
            text: `${config.icon} ${config.name}`,
            handler: () => {
              setSelectedModel(modelKey);
              setShowModelSelector(false);
            },
            cssClass: selectedModel === modelKey ? 'selected-fairy' : ''
          })),
          {
            text: t('cancel'),
            role: 'cancel',
            handler: () => {
              setShowModelSelector(false);
            }
          }
        ]}
      />
    </>
  );
}