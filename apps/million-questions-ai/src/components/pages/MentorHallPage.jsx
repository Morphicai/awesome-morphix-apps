import React, { useState, useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import { IonPage, IonContent } from '@ionic/react';
import { PageHeader } from '@morphixai/components';
import { AIService } from '../../services/AIService';
import { MENTORS } from '../../constants/mentors';
import styles from '../../styles/MentorHallPage.module.css';

export default function MentorHallPage({ currentQuestion, onMentorSelect }) {
  const history = useHistory();
  const [loading, setLoading] = useState(true);
  const [recommendedMentorId, setRecommendedMentorId] = useState('visionary');
  const [selectedMentorId, setSelectedMentorId] = useState(null);
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

    // 模拟加载进度
    const messages = [
      { text: "正在分析您的问题核心，链接全球大师智慧网络...", progress: 25 },
      { text: "智慧网络已响应，正在筛选最契合的灵魂导师...", progress: 50 },
      { text: "匹配算法启动，正在计算契合度...", progress: 75 },
      { text: "天命导师锁定！正在建立专属链接...", progress: 100 }
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
      // 调用AI服务推荐导师
      const mentorId = await AIService.recommendMentor(currentQuestion);

      clearInterval(interval);
      setRecommendedMentorId(mentorId);
      setSelectedMentorId(mentorId);
      setLoading(false);
    } catch (error) {
      console.error('导师推荐失败:', error);
      clearInterval(interval);
      setRecommendedMentorId('visionary');
      setSelectedMentorId('visionary');
      setLoading(false);
    }
  };

  const selectMentor = (mentorId) => {
    setSelectedMentorId(mentorId);
  };

  const confirmMentorSelection = () => {
    if (!selectedMentorId) {
      alert('请先选择一位导师');
      return;
    }
    if (onMentorSelect) {
      onMentorSelect(selectedMentorId);
    }
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
                  className={`${styles.mentorCard} ${styles.recommended} ${selectedMentorId === recommendedMentorId ? styles.selected : ''}`}
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
                      className={`${styles.mentorCard} ${selectedMentorId === mentor.id ? styles.selected : ''}`}
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
