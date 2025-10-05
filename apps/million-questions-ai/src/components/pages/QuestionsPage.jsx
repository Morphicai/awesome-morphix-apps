import React, { useState, useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import { IonPage, IonContent } from '@ionic/react';
import { PageHeader } from '@morphixai/components';
import { AIService } from '../../services/AIService';
import styles from '../../styles/QuestionsPage.module.css';

export default function QuestionsPage({ currentIdea, onQuestionSelect }) {
  const history = useHistory();
  const [loading, setLoading] = useState(true);
  const [questions, setQuestions] = useState([]);
  const [progress, setProgress] = useState(0);
  const [message, setMessage] = useState('正在召唤首席战略分析师...');

  useEffect(() => {
    generateQuestions();
  }, []);

  const generateQuestions = async () => {
    if (!currentIdea) {
      alert('请先输入你的想法');
      history.push('/inspiration');
      return;
    }

    setLoading(true);

    // 模拟加载进度
    const messages = [
      { text: "正在召唤首席战略分析师...", progress: 25 },
      { text: "深度剖析您的想法，提炼核心洞察...", progress: 50 },
      { text: "金牌提问官正在量身打造问题...", progress: 75 },
      { text: "即将完成个性化问题清单...", progress: 100 }
    ];

    let index = 0;
    const interval = setInterval(() => {
      if (index < messages.length) {
        setProgress(messages[index].progress);
        setMessage(messages[index].text);
        index++;
      } else {
        clearInterval(interval);
      }
    }, 1000);

    try {
      // 第一步：战略分析
      const analysis = await AIService.callStrategicAnalysis(currentIdea);

      // 第二步：生成问题
      const generatedQuestions = await AIService.generateGoldenQuestions(currentIdea, analysis);

      clearInterval(interval);
      setQuestions(generatedQuestions);
      setLoading(false);
    } catch (error) {
      console.error('生成黄金提问清单失败:', error);
      clearInterval(interval);
      setLoading(false);
    }
  };

  const seekSolution = (question) => {
    if (onQuestionSelect) {
      onQuestionSelect(question);
    }
    history.push('/mentor-hall');
  };

  const goToInspiration = () => {
    history.push('/inspiration');
  };

  return (
    <IonPage>
      <PageHeader title="黄金提问清单" />
      <IonContent>
        <div className={styles.page}>
          <div className={styles.header}>
            <div className={styles.subtitle}>由 首席战略官 生成</div>
          </div>

          {loading ? (
            <div className={styles.loading}>
              <div className={styles.loadingText}>{message}</div>
              <div className={styles.loadingProgressBar}>
                <div 
                  className={styles.loadingProgress} 
                  style={{ width: `${progress}%` }}
                />
              </div>
              <div className={styles.loadingMessage}>{message}</div>
            </div>
          ) : (
            <div className={styles.questionsContainer}>
              {questions.map((section, index) => (
                <div key={index} className={styles.section}>
                  <div className={styles.sectionTitle}>{section.category}</div>
                  {section.questions.map((question, qIndex) => (
                    <div key={qIndex} className={styles.questionItem}>
                      <div className={styles.questionText}>{question}</div>
                      <button 
                        className={styles.solveButton} 
                        onClick={() => seekSolution(question)}
                      >
                        寻求解决方案
                      </button>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          )}
        </div>
      </IonContent>
    </IonPage>
  );
}
