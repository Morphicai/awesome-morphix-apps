import React, { useState, useEffect } from 'react';
import { IonButton, IonIcon, IonModal, IonContent, IonHeader, IonToolbar, IonTitle, IonItem, IonInput, IonSpinner, IonChip } from '@ionic/react';
import { sparkles, chatbubble, send, close, leaf, heart, star } from 'ionicons/icons';
import AppSdk from '@morphixai/app-sdk';
import { reportError } from '@morphixai/lib';
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
    switch (fairyMood) {
      case 'focused': return '🧚‍♀️';
      case 'relaxed': return '🌟';
      case 'proud': return '✨';
      default: return '🧚‍♀️';
    }
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

      const systemPrompt = `당신은 친근한 정원 요정입니다. 사용자의 집중과 할일 관리를 도와주는 역할을 합니다.

현재 상황:
- 타이머 상태: ${isTimerRunning ? (isBreak ? '휴식 중' : '집중 중') : '정지됨'}
- 완료한 뽀모도로: ${completedPomodoros}개
- 현재 작업: ${selectedTask?.text || '선택된 작업 없음'}
- 남은 시간: ${Math.floor(timeLeft / 60)}분
- 요정 기분: ${fairyMood}

성격과 말투:
- 항상 자연스럽고 따뜻한 말투로 대화
- 정원과 식물에 관련된 비유를 자주 사용
- 짧고 간결하게 답변 (1-2문장)
- 이모지를 적절히 사용하여 친근함 표현
- 사용자를 격려하고 동기부여 제공

상황별 대응:
- 집중 시작 시: 새로운 씨앗을 심는다는 표현 사용
- 집중 중: 식물이 자라고 있다는 격려
- 휴식 시: 정원에서 쉬는 표현 사용
- 완료 시: 꽃이 피었다는 축하 표현
- 고민 상담: 자연의 지혜로 조언 제공`;

      const response = await AppSdk.AI.chat({
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userMessage }
        ],
        options: {
          model: 'openai/gpt-4o',
          temperature: 0.8
        }
      });

      return response.content || response;
    } catch (error) {
      console.error('AI 대화 오류:', error);
      await reportError(error, 'JavaScriptError', { component: 'GardenFairy' });
      return '죄송해요, 지금은 대화하기 어려워요. 잠시 후 다시 시도해주세요 🌿';
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
      
      // 요정 응답 추가
      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        type: 'fairy',
        content: fairyResponse,
        timestamp: new Date()
      }]);
    } catch (error) {
      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        type: 'fairy',
        content: '미안해요, 지금은 대답하기 어려워요 🌿',
        timestamp: new Date()
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  // 빠른 질문 버튼들
  const quickQuestions = [
    { text: '집중 도움 요청', icon: '🌱', message: '집중하는 데 도움이 필요해요' },
    { text: '할일 정리 도움', icon: '📝', message: '할일을 어떻게 정리하면 좋을까요?' },
    { text: '동기부여 필요', icon: '✨', message: '동기부여가 필요해요' },
    { text: '휴식 추천', icon: '🦋', message: '어떻게 휴식하면 좋을까요?' }
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
      
      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        type: 'fairy',
        content: fairyResponse,
        timestamp: new Date()
      }]);
    } catch (error) {
      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        type: 'fairy',
        content: '미안해요, 지금은 대답하기 어려워요 🌿',
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
        if (hour < 12) return '좋은 아침이에요! 오늘도 아름다운 정원을 가꿔볼까요? 🌸';
        if (hour < 18) return '안녕하세요! 오후의 정원에서 집중의 꽃을 피워보세요 🌻';
        return '좋은 저녁이에요! 밤의 정원에서도 차분히 집중해보아요 🌙';
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
          정원 요정과 대화하기
        </div>
      </div>

      {/* 대화 모달 */}
      <IonModal isOpen={isModalOpen} onDidDismiss={() => setIsModalOpen(false)}>
        <IonHeader>
          <IonToolbar className={styles.modalHeader}>
            <IonTitle className={styles.modalTitle}>
              <span className={styles.titleIcon}>🧚‍♀️</span>
              정원 요정과의 대화
            </IonTitle>
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

        <IonContent className={styles.modalContent}>
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
                    <span className={styles.messageIcon}>🧚‍♀️</span>
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
                  <span className={styles.messageIcon}>🧚‍♀️</span>
                  <div className={styles.messageBubble}>
                    <IonSpinner name="dots" className={styles.loadingSpinner} />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* 빠른 질문 버튼들 */}
          {messages.length <= 1 && (
            <div className={styles.quickQuestions}>
              <h4 className={styles.quickQuestionsTitle}>빠른 질문</h4>
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

          {/* 메시지 입력 */}
          <div className={styles.messageInput}>
            <IonItem className={styles.inputItem}>
              <IonInput
                value={inputMessage}
                placeholder="정원 요정에게 메시지를 보내세요..."
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
        </IonContent>
      </IonModal>
    </>
  );
}