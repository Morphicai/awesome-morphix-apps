import React, { useState, useEffect, useRef } from 'react';
import { useHistory } from 'react-router-dom';
import { IonPage, IonContent } from '@ionic/react';
import { PageHeader } from '@morphixai/components';
import { useAppContext } from '../../contexts/AppContext';
import { AIService } from '../../services/AIService';
import { ShareService } from '../../services/ShareService';
import { MENTORS } from '../../constants/mentors';
import ShareTemplate from '../ShareTemplate';
import ShareImageModal from '../modals/ShareImageModal';
import styles from '../../styles/SolutionPage.module.css';

export default function SolutionPage() {
  const { currentQuestion, selectedMentorId, currentIdea } = useAppContext();
  const history = useHistory();
  const [loading, setLoading] = useState(true);
  const [solution, setSolution] = useState(null);
  const [progress, setProgress] = useState(0);
  const [message, setMessage] = useState('正在分析问题核心...');
  const [showShareModal, setShowShareModal] = useState(false);
  const [shareImageUrl, setShareImageUrl] = useState(null);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const shareTemplateRef = useRef(null);

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
      setIsGeneratingImage(true);
      setShowShareModal(true);
      setShareImageUrl(null);

      // 等待一小段时间确保模板 DOM 已渲染
      await new Promise(resolve => setTimeout(resolve, 100));

      if (!shareTemplateRef.current) {
        throw new Error('分享模板未找到');
      }

      // 使用 snapDOM 生成图片
      const imageUrl = await ShareService.generateImageFromDOM(
        shareTemplateRef.current,
        {
          type: 'png',
          quality: 1,
          backgroundColor: 'transparent',
          scale: 2
        }
      );

      setShareImageUrl(imageUrl);
      setIsGeneratingImage(false);
    } catch (error) {
      console.error('生成分享图失败:', error);
      alert('生成分享图失败，请稍后重试');
      setShowShareModal(false);
      setIsGeneratingImage(false);
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
                <button 
                  className={styles.shareButton} 
                  onClick={shareSolution}
                  disabled={isGeneratingImage}
                >
                  {isGeneratingImage ? '生成中...' : '生成分享长图'}
                </button>
              </div>
            </>
          )}
        </div>

        {/* 隐藏的分享模板，用于生成图片 */}
        <div style={{ position: 'absolute', left: '-9999px', top: 0 }}>
          <div ref={shareTemplateRef}>
            <ShareTemplate
              type="solution"
              data={{
                question: currentQuestion,
                mentorName: mentorInfo?.name || '导师',
                sections: solution?.sections || []
              }}
            />
          </div>
        </div>

        {/* 分享图片预览模态框 */}
        <ShareImageModal
          isOpen={showShareModal}
          onClose={() => setShowShareModal(false)}
          imageUrl={shareImageUrl}
          fileName={`百万问AI_行动蓝图_${Date.now()}.png`}
        />
      </IonContent>
    </IonPage>
  );
}
