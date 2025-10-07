import React, { useState, useEffect, useRef } from 'react';
import { useHistory } from 'react-router-dom';
import { IonPage, IonContent } from '@ionic/react';
import { PageHeader } from '@morphixai/components';
import { useAppContext } from '../../contexts/AppContext';
import { AIService } from '../../services/AIService';
import { ShareService } from '../../services/ShareService';
import ShareTemplate from '../ShareTemplate';
import ShareImageModal from '../modals/ShareImageModal';
import styles from '../../styles/BoardReportPage.module.css';

export default function BoardReportPage() {
  const { currentIdea, boardSelection, t } = useAppContext();
  const history = useHistory();
  const [loading, setLoading] = useState(true);
  const [report, setReport] = useState(null);
  const [progress, setProgress] = useState(0);
  const [message, setMessage] = useState('');
  const [showShareModal, setShowShareModal] = useState(false);
  const [shareImageUrl, setShareImageUrl] = useState(null);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const shareTemplateRef = useRef(null);

  useEffect(() => {
    if (boardSelection && currentIdea) {
      generateBoardReport();
    } else {
      setLoading(false);
    }
  }, []);

  const generateBoardReport = async () => {
    setLoading(true);
    
    // 模拟加载进度
    const messages = [
      { text: t('boardReport.loadingMessages.convening'), progress: 15 },
      { text: t('boardReport.loadingMessages.navigatorAnalyzing'), progress: 35 },
      { text: t('boardReport.loadingMessages.membersDiscussing'), progress: 60 },
      { text: t('boardReport.loadingMessages.synthesizing'), progress: 85 },
      { text: t('boardReport.loadingMessages.completing'), progress: 100 }
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
      const result = await AIService.generateBoardReport(
        currentIdea,
        boardSelection.navigator,
        boardSelection.members
      );
      
      clearInterval(interval);
      setReport(result);
      setLoading(false);
      setProgress(100);
    } catch (error) {
      console.error('生成董事会报告失败:', error);
      clearInterval(interval);
      setLoading(false);
      alert(t('boardReport.noIdea'));
    }
  };

  const goToInspiration = () => {
    history.push('/inspiration');
  };

  const goToGoldenQuestions = () => {
    history.push('/questions');
  };

  const shareReport = async () => {
    try {
      setIsGeneratingImage(true);
      setShowShareModal(true);
      setShareImageUrl(null);

      // 等待模板 DOM 和二维码都渲染完成（二维码需要异步加载）
      await new Promise(resolve => setTimeout(resolve, 500));

      if (!shareTemplateRef.current) {
        throw new Error('分享模板未找到');
      }

      // 准备分享数据
      const shareData = {
        idea: currentIdea,
        navigator: boardSelection?.navigator?.name || '未选择',
        members: boardSelection?.members?.map(m => m.name).join('、') || '未选择',
        sections: []
      };

      // 构建分享内容的 sections
      if (report) {
        // 领航人分析报告
        const navigatorSection = {
          title: '领航人分析报告',
          items: [
            `领航人：${boardSelection.navigator.name}`,
            report.navigator_analysis.introduction,
            ...report.navigator_analysis.key_points.map(p => `${p.aspect}：${p.analysis}`)
          ]
        };

        // 董事会成员意见
        const membersSection = {
          title: '董事会成员意见',
          items: [
            `参与成员：${boardSelection.members.map(m => m.name).join('、')}`,
            ...report.members_opinions.flatMap(op => 
              [`${op.member} - ${op.perspective}`, ...op.opinions]
            )
          ]
        };

        // 董事会决议
        const resolutionsSection = {
          title: '董事会决议',
          items: [
            report.board_resolutions.preamble,
            ...report.board_resolutions.resolutions.map((r, i) => 
              `${i + 1}. ${r.category}：${r.decision}`
            )
          ]
        };

        shareData.sections = [navigatorSection, membersSection, resolutionsSection];
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
      alert(t('share.saveFailed'));
      setShowShareModal(false);
      setIsGeneratingImage(false);
    }
  };

  if (!boardSelection) {
    return (
      <IonPage>
        <PageHeader title={t('boardReport.title')} />
        <IonContent>
          <div className={styles.page}>
            <div className={styles.header}>
              <div className={styles.subtitle}>{t('boardReport.noIdea')}</div>
            </div>
            <button className={styles.actionBtn} onClick={goToInspiration}>
              {t('boardReport.backToInspiration')}
            </button>
          </div>
        </IonContent>
      </IonPage>
    );
  }

  const navigator = boardSelection.navigator;
  const members = boardSelection.members;

  return (
    <IonPage>
      <PageHeader title={t('boardReport.title')} />
      <IonContent>
        <div className={styles.page}>
          <div className={styles.header}>
            <div className={styles.subtitle}>{t('boardReport.generatedBy')}</div>
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
          ) : report ? (
            <>
              <div className={styles.reportContent}>
                {/* 领航人分析报告 */}
                <div className={styles.reportSection}>
                  <div className={styles.sectionTitle}>{t('boardReport.navigatorSection')}</div>
                  <div className={styles.reportItem}>
                    <strong>{t('boardSelection.step1Title').split('：')[0]}：</strong>{t(`boardRoles.navigators.${navigator.id}.name`)}
                  </div>
                  <div className={styles.reportText}>
                    {report.navigator_analysis.introduction}
                  </div>
                  {report.navigator_analysis.key_points.map((point, idx) => (
                    <div key={idx} className={styles.reportText}>
                      • <strong>{point.aspect}：</strong>{point.analysis}
                    </div>
                  ))}
                </div>

                {/* 董事会成员意见 */}
                <div className={styles.reportSection}>
                  <div className={styles.sectionTitle}>{t('boardReport.membersSection')}</div>
                  <div className={styles.reportItem}>
                    <strong>{t('boardSelection.step2Title').split('：')[0]}：</strong>
                    {members.map(m => t(`boardRoles.members.${m.id}.name`)).join('、')}
                  </div>
                  {report.members_opinions.map((opinion, idx) => (
                    <div key={idx} className={styles.memberOpinion}>
                      <div className={styles.memberName}>
                        <strong>{opinion.member}</strong> - {opinion.perspective}
                      </div>
                      {opinion.opinions.map((op, opIdx) => (
                        <div key={opIdx} className={styles.reportText}>• {op}</div>
                      ))}
                    </div>
                  ))}
                </div>

                {/* 董事会决议 */}
                <div className={styles.reportSection}>
                  <div className={styles.sectionTitle}>{t('boardReport.conclusionSection')}</div>
                  <div className={styles.resolutionText}>
                    {report.board_resolutions.preamble}
                  </div>
                  {report.board_resolutions.resolutions.map((resolution, idx) => (
                    <div key={idx} className={styles.reportText}>
                      {idx + 1}. <strong>{resolution.category}：</strong>{resolution.decision}
                    </div>
                  ))}
                </div>
              </div>

              <div className={styles.footer}>
                <button className={styles.actionBtn} onClick={goToGoldenQuestions}>
                  {t('inspiration.generateButton')}
                </button>
                <button 
                  className={styles.shareButton} 
                  onClick={shareReport}
                  disabled={isGeneratingImage}
                >
                  {isGeneratingImage ? t('common.loading') : t('share.title')}
                </button>
              </div>
            </>
          ) : null}
        </div>

        {/* 隐藏的分享模板，用于生成图片 */}
        {report && (
          <div style={{ position: 'absolute', left: '-9999px', top: 0 }}>
            <div ref={shareTemplateRef}>
              <ShareTemplate
                type="board"
                data={{
                  idea: currentIdea,
                  navigator: t(`boardRoles.navigators.${navigator.id}.name`),
                  members: members.map(m => t(`boardRoles.members.${m.id}.name`)).join('、'),
                  sections: [
                    {
                      title: t('boardReport.navigatorSection'),
                      items: [
                        `${t('boardSelection.step1Title').split('：')[0]}：${t(`boardRoles.navigators.${navigator.id}.name`)}`,
                        report.navigator_analysis.introduction,
                        ...report.navigator_analysis.key_points.map(p => `${p.aspect}：${p.analysis}`)
                      ]
                    },
                    {
                      title: t('boardReport.membersSection'),
                      items: [
                        `${t('boardSelection.step2Title').split('：')[0]}：${members.map(m => t(`boardRoles.members.${m.id}.name`)).join('、')}`,
                        ...report.members_opinions.flatMap(op => 
                          [`${op.member} - ${op.perspective}`, ...op.opinions]
                        )
                      ]
                    },
                    {
                      title: t('boardReport.conclusionSection'),
                      items: [
                        report.board_resolutions.preamble,
                        ...report.board_resolutions.resolutions.map((r, i) => 
                          `${i + 1}. ${r.category}：${r.decision}`
                        )
                      ]
                    }
                  ]
                }}
              />
            </div>
          </div>
        )}

        {/* 分享图片预览模态框 */}
        <ShareImageModal
          isOpen={showShareModal}
          onClose={() => setShowShareModal(false)}
          imageUrl={shareImageUrl}
          fileName={`${t('common.appName')}_${t('boardReport.title')}_${Date.now()}.png`}
        />
      </IonContent>
    </IonPage>
  );
}
