import React, { useState, useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import { IonPage, IonContent } from '@ionic/react';
import { PageHeader } from '@morphixai/components';
import { AIService } from '../../services/AIService';
import { ShareService } from '../../services/ShareService';
import { MENTORS } from '../../constants/mentors';
import styles from '../../styles/SolutionPage.module.css';

export default function SolutionPage({ currentQuestion, selectedMentorId, currentIdea }) {
  const history = useHistory();
  const [loading, setLoading] = useState(true);
  const [solution, setSolution] = useState(null);
  const [progress, setProgress] = useState(0);
  const [message, setMessage] = useState('正在分析问题核心...');

  useEffect(() => {
    generateSolution();
  }, []);

  const generateSolution = async () => {
    if (!currentQuestion || !selectedMentorId) {
      alert('缺少必要信息');
      history.push('/mentor-hall');
      return;
    }

    setLoading(true);

    // 模拟加载进度
    const messages = [
      { text: "正在分析问题核心...", progress: 20 },
      { text: "调用AI导师智慧...", progress: 50 },
      { text: "生成个性化方案...", progress: 80 },
      { text: "即将完成...", progress: 100 }
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
    }, 800);

    try {
      const result = await AIService.generateSolution(currentQuestion, selectedMentorId, currentIdea);

      clearInterval(interval);
      setSolution(result);
      setLoading(false);
    } catch (error) {
      console.error('生成解决方案失败:', error);
      clearInterval(interval);
      setLoading(false);
      alert('生成失败，请稍后重试');
    }
  };

  const shareSolution = async () => {
    try {
      await ShareService.generateShareImage('solution', {
        question: currentQuestion
      });
      alert('分享长图已生成并下载到您的设备！\n\n您可以：\n1. 在相册中找到图片\n2. 分享到微信、朋友圈等社交平台\n3. 保存到云端或发送给朋友');
    } catch (error) {
      console.error('生成分享图失败:', error);
      alert('生成分享图失败，请稍后重试');
    }
  };

  const goToMentorHall = () => {
    history.push('/mentor-hall');
  };

  const mentorInfo = MENTORS[selectedMentorId];

  return (
    <IonPage>
      <PageHeader title="行动蓝图" />
      <IonContent>
        <div className={styles.page}>
          <div className={styles.header}>
            <div className={styles.subtitle}>由 {mentorInfo?.name} 提供</div>
            <div className={styles.questionText}>"{currentQuestion}"</div>
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
          ) : solution && (
            <>
              <div className={styles.solutionContent}>
                {solution.sections.map((section, index) => (
                  <div key={index} className={styles.solutionSection}>
                    <div className={styles.sectionTitle}>{section.title}</div>
                    {section.items.map((item, itemIndex) => (
                      <div key={itemIndex} className={styles.solutionItem}>
                        {item}
                      </div>
                    ))}
                  </div>
                ))}
              </div>

              <div className={styles.footer}>
                <button className={styles.shareButton} onClick={shareSolution}>
                  生成分享长图
                </button>
              </div>
            </>
          )}
        </div>
      </IonContent>
    </IonPage>
  );
}
