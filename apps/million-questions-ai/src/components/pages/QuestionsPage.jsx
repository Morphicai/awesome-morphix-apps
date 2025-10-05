import React, { useState, useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import { IonPage, IonContent } from '@ionic/react';
import { PageHeader } from '@morphixai/components';
import { useAppContext } from '../../contexts/AppContext';
import { AIService } from '../../services/AIService';
import styles from '../../styles/QuestionsPage.module.css';

export default function QuestionsPage() {
  const history = useHistory();
  const { currentIdea, setCurrentQuestion } = useAppContext();
  const [loading, setLoading] = useState(true);
  const [questions, setQuestions] = useState([]);
  const [progress, setProgress] = useState(0);
  const [message, setMessage] = useState('正在召唤首席战略分析师...');

  useEffect(() => {
    console.log('🚀 QuestionsPage 挂载，当前想法:', currentIdea);
    generateQuestions();
  }, [currentIdea]);

  const generateQuestions = async () => {
    console.log('🔍 开始生成问题，当前想法:', currentIdea);
    
    if (!currentIdea || !currentIdea.trim()) {
      console.warn('⚠️ 想法为空，跳转回输入页');
      alert('请先输入你的想法');
      history.push('/inspiration');
      return;
    }

    setLoading(true);
    setProgress(10);
    setMessage('正在召唤首席战略分析师...');

    try {
      console.log('🤖 调用AI：战略分析');
      // 开始阶段
      setTimeout(() => {
        setProgress(25);
        setMessage('深度剖析您的想法，提炼核心洞察...');
      }, 500);

      // 第一步：战略分析
      const analysis = await AIService.callStrategicAnalysis(currentIdea);
      console.log('✅ 战略分析完成:', analysis);

      setProgress(55);
      setMessage('金牌提问官正在量身打造问题...');

      // 短暂延迟
      await new Promise(resolve => setTimeout(resolve, 300));

      console.log('🤖 调用AI：生成黄金问题');
      // 第二步：生成问题
      const generatedQuestions = await AIService.generateGoldenQuestions(currentIdea, analysis);
      console.log('✅ 问题生成完成:', generatedQuestions);

      setProgress(90);
      setMessage('正在整理问题清单...');

      // 短暂延迟后显示结果
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setProgress(100);
      setMessage('即将完成个性化问题清单...');

      setTimeout(() => {
        setQuestions(generatedQuestions);
        setLoading(false);
        console.log('✅ 问题清单已显示');
      }, 300);
    } catch (error) {
      console.error('❌ 生成黄金提问清单失败:', error);
      setLoading(false);
    }
  };

  const seekSolution = (question) => {
    console.log('✅ 选择问题:', question);
    setCurrentQuestion(question);
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
