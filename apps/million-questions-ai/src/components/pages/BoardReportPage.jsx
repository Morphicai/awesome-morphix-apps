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
  const { currentIdea, boardSelection } = useAppContext();
  const history = useHistory();
  const [loading, setLoading] = useState(true);
  const [report, setReport] = useState(null);
  const [progress, setProgress] = useState(0);
  const [message, setMessage] = useState('正在召集董事会...');
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
      { text: "正在召集董事会...", progress: 15 },
      { text: "领航人正在分析项目...", progress: 35 },
      { text: "董事会成员正在讨论...", progress: 60 },
      { text: "生成决议报告...", progress: 85 },
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
      alert('生成报告失败，请稍后重试');
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
      alert('生成分享图失败，请稍后重试');
      setShowShareModal(false);
      setIsGeneratingImage(false);
    }
  };

  if (!boardSelection) {
    return (
      <IonPage>
        <PageHeader title="董事会决议报告" />
        <IonContent>
          <div className={styles.page}>
            <div className={styles.header}>
              <div className={styles.subtitle}>请先进行董事会选择</div>
            </div>
            <button className={styles.actionBtn} onClick={goToInspiration}>
              返回灵感输入
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
      <PageHeader title="董事会决议报告" />
      <IonContent>
        <div className={styles.page}>
          <div className={styles.header}>
            <div className={styles.subtitle}>关于"{currentIdea}"项目的董事会决议</div>
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
                  <div className={styles.sectionTitle}>{report.navigator_analysis.title}</div>
                  <div className={styles.reportItem}>
                    <strong>领航人：</strong>{navigator.name}
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
                  <div className={styles.sectionTitle}>董事会成员意见</div>
                  <div className={styles.reportItem}>
                    <strong>参与成员：</strong>{members.map(m => m.name).join('、')}
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
                  <div className={styles.sectionTitle}>{report.board_resolutions.title}</div>
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
                  生成黄金提问清单
                </button>
                <button 
                  className={styles.shareButton} 
                  onClick={shareReport}
                  disabled={isGeneratingImage}
                >
                  {isGeneratingImage ? '生成中...' : '生成分享长图'}
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
                  navigator: boardSelection?.navigator?.name || '未选择',
                  members: boardSelection?.members?.map(m => m.name).join('、') || '未选择',
                  sections: [
                    {
                      title: '领航人分析报告',
                      items: [
                        `领航人：${boardSelection.navigator.name}`,
                        report.navigator_analysis.introduction,
                        ...report.navigator_analysis.key_points.map(p => `${p.aspect}：${p.analysis}`)
                      ]
                    },
                    {
                      title: '董事会成员意见',
                      items: [
                        `参与成员：${boardSelection.members.map(m => m.name).join('、')}`,
                        ...report.members_opinions.flatMap(op => 
                          [`${op.member} - ${op.perspective}`, ...op.opinions]
                        )
                      ]
                    },
                    {
                      title: '董事会决议',
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
          fileName={`百万问AI_董事会报告_${Date.now()}.png`}
        />
      </IonContent>
    </IonPage>
  );
}
