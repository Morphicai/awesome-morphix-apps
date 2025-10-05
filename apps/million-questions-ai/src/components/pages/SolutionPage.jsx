import React, { useState, useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import { IonPage, IonContent } from '@ionic/react';
import { PageHeader } from '@morphixai/components';
import { useAppContext } from '../../contexts/AppContext';
import { AIService } from '../../services/AIService';
import { ShareService } from '../../services/ShareService';
import { MENTORS } from '../../constants/mentors';
import styles from '../../styles/SolutionPage.module.css';

export default function SolutionPage() {
  const { currentQuestion, selectedMentorId, currentIdea } = useAppContext();
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
    setProgress(10);
    setMessage('正在分析问题核心...');

    try {
      // 开始阶段
      setTimeout(() => {
        if (loading) {
          setProgress(30);
          setMessage('调用AI导师智慧...');
        }
      }, 500);

      // 实际调用AI
      const result = await AIService.generateSolution(currentQuestion, selectedMentorId, currentIdea);

      // AI返回后
      setProgress(80);
      setMessage('生成个性化方案...');
      
      // 短暂延迟以显示最后的进度
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setProgress(100);
      setMessage('完成！');
      
      // 设置结果
      setTimeout(() => {
        setSolution(result);
        setLoading(false);
      }, 300);
    } catch (error) {
      console.error('生成解决方案失败:', error);
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
