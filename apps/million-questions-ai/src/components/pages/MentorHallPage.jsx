import React, { useState, useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import { IonPage, IonContent } from '@ionic/react';
import { PageHeader } from '@morphixai/components';
import { useAppContext } from '../../contexts/AppContext';
import { AIService } from '../../services/AIService';
import { MENTORS } from '../../constants/mentors';
import styles from '../../styles/MentorHallPage.module.css';

export default function MentorHallPage() {
  const { currentQuestion, currentIdea, setSelectedMentorId: setGlobalSelectedMentorId } = useAppContext();
  const history = useHistory();
  const [loading, setLoading] = useState(true);
  const [recommendedMentorId, setRecommendedMentorId] = useState('visionary');
  const [localSelectedMentorId, setLocalSelectedMentorId] = useState(null);
  const [progress, setProgress] = useState(0);
  const [message, setMessage] = useState('正在分析您的问题核心...');

  useEffect(() => {
    generateMentorRecommendation();
  }, []);

  const generateMentorRecommendation = async () => {
    if (!currentQuestion) {
      alert('请先选择一个问题');
      history.push('/questions');
      return;
    }

    setLoading(true);
    setProgress(10);
    setMessage('正在分析您的问题核心，链接AI智慧网络...');

    try {
      // 阶段1: 开始分析
      setTimeout(() => {
        setProgress(30);
        setMessage('AI正在深入理解您的问题本质...');
      }, 300);

      // 阶段2: 调用AI服务推荐导师（传入商业想法作为上下文）
      const mentorId = await AIService.recommendMentor(currentQuestion, currentIdea);

      // 阶段3: AI返回后
      setProgress(80);
      setMessage('正在计算导师匹配度...');
      
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // 阶段4: 完成
      setProgress(100);
      setMessage('天命导师锁定！正在建立专属链接...');
      
      setTimeout(() => {
        setRecommendedMentorId(mentorId);
        setLocalSelectedMentorId(mentorId);
        setLoading(false);
      }, 300);

    } catch (error) {
      console.error('导师推荐失败:', error);
      setRecommendedMentorId('visionary');
      setLocalSelectedMentorId('visionary');
      setLoading(false);
    }
  };

  const selectMentor = (mentorId) => {
    console.log('✅ 点击选择导师:', mentorId);
    setLocalSelectedMentorId(mentorId);
  };

  const confirmMentorSelection = () => {
    if (!localSelectedMentorId) {
      alert('请先选择一位导师');
      return;
    }
    console.log('✅ 确认选择导师:', localSelectedMentorId);
    setGlobalSelectedMentorId(localSelectedMentorId);
    history.push('/solution');
  };

  const goToGoldenQuestions = () => {
    history.push('/questions');
  };

  const recommendedMentor = MENTORS[recommendedMentorId];
  const otherMentors = Object.values(MENTORS).filter(m => m.id !== recommendedMentorId);

  return (
    <IonPage>
      <PageHeader title="大师殿堂" />
      <IonContent>
        <div className={styles.page}>
          <div className={styles.header}>
            <div className={styles.subtitle}>与一位宗师对话，为你的问题寻求智慧方案</div>
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
            <>
              <div className={styles.mentorSection}>
                <div className={styles.sectionTitle}>AI天命推荐</div>
                <div className={styles.sectionSubtitle}>根据您的问题，我们认为这位导师最匹配</div>

                <div 
                  className={`${styles.mentorCard} ${styles.recommended} ${localSelectedMentorId === recommendedMentorId ? styles.selected : ''}`}
                  onClick={() => selectMentor(recommendedMentorId)}
                >
                  <div className={styles.mentorIcon}>{recommendedMentor.icon}</div>
                  <div className={styles.mentorInfo}>
                    <div className={styles.mentorName}>{recommendedMentor.name}</div>
                    <div className={styles.mentorPhilosophy}>{recommendedMentor.philosophy}</div>
                  </div>
                  <div className={styles.badge}>天命推荐</div>
                </div>
              </div>

              <div className={styles.mentorSection}>
                <div className={styles.sectionTitle}>大师画廊</div>
                <div className={styles.sectionSubtitle}>您也可以选择其他导师</div>

                <div className={styles.mentorGallery}>
                  {otherMentors.map(mentor => (
                    <div
                      key={mentor.id}
                      className={`${styles.mentorCard} ${localSelectedMentorId === mentor.id ? styles.selected : ''}`}
                      onClick={() => selectMentor(mentor.id)}
                    >
                      <div className={styles.mentorIcon}>{mentor.icon}</div>
                      <div className={styles.mentorInfo}>
                        <div className={styles.mentorName}>{mentor.name}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className={styles.footer}>
                <button className={styles.confirmBtn} onClick={confirmMentorSelection}>
                  向他请教
                </button>
              </div>
            </>
          )}
        </div>
      </IonContent>
    </IonPage>
  );
}
