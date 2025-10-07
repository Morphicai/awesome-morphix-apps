import React, { useState, useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import { IonPage, IonContent } from '@ionic/react';
import { PageHeader } from '@morphixai/components';
import { useAppContext } from '../../contexts/AppContext';
import { AIService } from '../../services/AIService';
import { MENTORS } from '../../constants/mentors';
import styles from '../../styles/MentorHallPage.module.css';

export default function MentorHallPage() {
  const { currentQuestion, currentIdea, setSelectedMentorId: setGlobalSelectedMentorId, t } = useAppContext();
  const history = useHistory();
  const [loading, setLoading] = useState(true);
  const [recommendedMentorId, setRecommendedMentorId] = useState('visionary');
  const [localSelectedMentorId, setLocalSelectedMentorId] = useState(null);
  const [progress, setProgress] = useState(0);
  const [message, setMessage] = useState('');

  useEffect(() => {
    generateMentorRecommendation();
  }, []);

  const generateMentorRecommendation = async () => {
    if (!currentQuestion) {
      alert(t('mentorHall.selectQuestionFirst'));
      history.push('/questions');
      return;
    }

    setLoading(true);
    setProgress(10);
    setMessage(t('mentorHall.loadingMessages.analyzing'));

    try {
      // 阶段1: 开始分析
      setTimeout(() => {
        setProgress(30);
        setMessage(t('mentorHall.loadingMessages.understanding'));
      }, 300);

      // 阶段2: 调用AI服务推荐导师（传入商业想法作为上下文）
      const mentorId = await AIService.recommendMentor(currentQuestion, currentIdea);

      // 阶段3: AI返回后
      setProgress(80);
      setMessage(t('mentorHall.loadingMessages.calculating'));
      
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // 阶段4: 完成
      setProgress(100);
      setMessage(t('mentorHall.loadingMessages.locking'));
      
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
      alert(t('mentorHall.selectMentorFirst'));
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
      <PageHeader title={t('mentorHall.title')} />
      <IonContent>
        <div className={styles.page}>
          <div className={styles.header}>
            <div className={styles.subtitle}>{t('mentorHall.subtitle')}</div>
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
                <div className={styles.sectionTitle}>{t('mentorHall.aiRecommendation')}</div>
                <div className={styles.sectionSubtitle}>{t('mentorHall.aiRecommendationSubtitle')}</div>

                <div 
                  className={`${styles.mentorCard} ${styles.recommended} ${localSelectedMentorId === recommendedMentorId ? styles.selected : ''}`}
                  onClick={() => selectMentor(recommendedMentorId)}
                >
                  <div className={styles.mentorIcon}>{recommendedMentor.icon}</div>
                  <div className={styles.mentorInfo}>
                    <div className={styles.mentorName}>{t(`mentors.${recommendedMentor.id}.name`)}</div>
                    <div className={styles.mentorPhilosophy}>{t(`mentors.${recommendedMentor.id}.philosophy`)}</div>
                  </div>
                  <div className={styles.badge}>{t('mentorHall.recommendedBadge')}</div>
                </div>
              </div>

              <div className={styles.mentorSection}>
                <div className={styles.sectionTitle}>{t('mentorHall.masterGallery')}</div>
                <div className={styles.sectionSubtitle}>{t('mentorHall.masterGallerySubtitle')}</div>

                <div className={styles.mentorGallery}>
                  {otherMentors.map(mentor => (
                    <div
                      key={mentor.id}
                      className={`${styles.mentorCard} ${localSelectedMentorId === mentor.id ? styles.selected : ''}`}
                      onClick={() => selectMentor(mentor.id)}
                    >
                      <div className={styles.mentorIcon}>{mentor.icon}</div>
                      <div className={styles.mentorInfo}>
                        <div className={styles.mentorName}>{t(`mentors.${mentor.id}.name`)}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className={styles.footer}>
                <button className={styles.confirmBtn} onClick={confirmMentorSelection}>
                  {t('mentorHall.consultButton')}
                </button>
              </div>
            </>
          )}
        </div>
      </IonContent>
    </IonPage>
  );
}
