import React, { useState, useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import { IonPage, IonContent } from '@ionic/react';
import { PageHeader } from '@morphixai/components';
import { useAppContext } from '../../contexts/AppContext';
import { AIService } from '../../services/AIService';
import styles from '../../styles/QuestionsPage.module.css';

export default function QuestionsPage() {
  const history = useHistory();
  const { currentIdea, setCurrentQuestion, t } = useAppContext();
  const [loading, setLoading] = useState(true);
  const [questions, setQuestions] = useState([]);
  const [progress, setProgress] = useState(0);
  const [message, setMessage] = useState('');

  useEffect(() => {
    console.log('🚀 QuestionsPage 挂载，当前想法:', currentIdea);
    generateQuestions();
  }, [currentIdea]);

  const generateQuestions = async () => {
    console.log('🔍 开始生成问题，当前想法:', currentIdea);
    
    if (!currentIdea || !currentIdea.trim()) {
      console.warn('⚠️ 想法为空，跳转回输入页');
      alert(t('questions.noIdea'));
      history.push('/inspiration');
      return;
    }

    setLoading(true);
    setProgress(10);
    setMessage(t('questions.loadingMessages.summoning'));

    try {
      console.log('🤖 调用AI：战略分析');
      // 开始阶段
      setTimeout(() => {
        setProgress(25);
        setMessage(t('questions.loadingMessages.analyzing'));
      }, 500);

      // 第一步：战略分析
      const analysis = await AIService.callStrategicAnalysis(currentIdea);
      console.log('✅ 战略分析完成:', analysis);

      setProgress(55);
      setMessage(t('questions.loadingMessages.crafting'));

      // 短暂延迟
      await new Promise(resolve => setTimeout(resolve, 300));

      console.log('🤖 调用AI：生成黄金问题');
      // 第二步：生成问题
      const generatedQuestions = await AIService.generateGoldenQuestions(currentIdea, analysis);
      console.log('✅ 问题生成完成:', generatedQuestions);

      setProgress(90);
      setMessage(t('questions.loadingMessages.organizing'));

      // 短暂延迟后显示结果
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setProgress(100);
      setMessage(t('questions.loadingMessages.completing'));

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
      <PageHeader title={t('questions.title')} />
      <IonContent>
        <div className={styles.page}>
          <div className={styles.header}>
            <div className={styles.subtitle}>{t('questions.generatedBy')}</div>
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
                        {t('questions.seekSolution')}
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
