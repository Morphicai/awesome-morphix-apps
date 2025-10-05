import React, { useState, useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import { IonPage, IonContent } from '@ionic/react';
import { PageHeader } from '@morphixai/components';
import { useAppContext } from '../../contexts/AppContext';
import { AIService } from '../../services/AIService';
import { ShareService } from '../../services/ShareService';
import styles from '../../styles/BoardReportPage.module.css';

export default function BoardReportPage() {
  const { currentIdea, boardSelection } = useAppContext();
  const history = useHistory();
  const [loading, setLoading] = useState(true);
  const [report, setReport] = useState(null);
  const [progress, setProgress] = useState(0);
  const [message, setMessage] = useState('正在召集董事会...');

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
      await ShareService.generateShareImage('report', {
        idea: currentIdea,
        navigator: boardSelection?.navigator?.name || '未选择',
        members: boardSelection?.members?.map(m => m.name).join('、') || '未选择',
        report: report
      });
      alert('分享长图已生成并下载到您的设备！');
    } catch (error) {
      console.error('生成分享图失败:', error);
      alert('生成分享图失败，请稍后重试');
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
                <button className={styles.shareButton} onClick={shareReport}>
                  分享报告
                </button>
              </div>
            </>
          ) : null}
        </div>
      </IonContent>
    </IonPage>
  );
}
