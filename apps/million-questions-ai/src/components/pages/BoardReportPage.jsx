import React from 'react';
import { useHistory } from 'react-router-dom';
import { IonPage, IonContent } from '@ionic/react';
import { PageHeader } from '@morphixai/components';
import { ShareService } from '../../services/ShareService';
import styles from '../../styles/BoardReportPage.module.css';

export default function BoardReportPage({ currentIdea, boardSelection }) {
  const history = useHistory();

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
        members: boardSelection?.members?.map(m => m.name).join('、') || '未选择'
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

          <div className={styles.reportContent}>
            <div className={styles.reportSection}>
              <div className={styles.sectionTitle}>领航人分析报告</div>
              <div className={styles.reportItem}>
                <strong>领航人：</strong>{navigator.name}
              </div>
              <div className={styles.reportText}>
                基于您的项目"{currentIdea}"，我作为领航人，从战略高度为您提供以下分析：
              </div>
              <div className={styles.reportText}>
                • <strong>市场定位：</strong>需要明确目标用户群体和核心价值主张
              </div>
              <div className={styles.reportText}>
                • <strong>商业模式：</strong>建议采用多元化收入结构，降低单一风险
              </div>
              <div className={styles.reportText}>
                • <strong>执行策略：</strong>分阶段推进，先验证核心假设再全面扩张
              </div>
            </div>

            <div className={styles.reportSection}>
              <div className={styles.sectionTitle}>董事会成员意见</div>
              <div className={styles.reportItem}>
                <strong>参与成员：</strong>{members.map(m => m.name).join('、')}
              </div>
              <div className={styles.reportText}>
                • <strong>财务角度：</strong>建议制定详细的财务预算和现金流预测
              </div>
              <div className={styles.reportText}>
                • <strong>技术角度：</strong>确保技术架构的可扩展性和稳定性
              </div>
              <div className={styles.reportText}>
                • <strong>市场角度：</strong>进行充分的市场调研和竞品分析
              </div>
            </div>

            <div className={styles.reportSection}>
              <div className={styles.sectionTitle}>董事会决议</div>
              <div className={styles.resolutionText}>
                经过充分讨论，董事会一致通过以下决议：
              </div>
              <div className={styles.reportText}>
                1. <strong>项目可行性：</strong>项目具有市场潜力，建议继续推进
              </div>
              <div className={styles.reportText}>
                2. <strong>资金需求：</strong>预计需要启动资金50-100万元
              </div>
              <div className={styles.reportText}>
                3. <strong>时间规划：</strong>建议6个月内完成MVP，12个月内实现盈利
              </div>
              <div className={styles.reportText}>
                4. <strong>风险控制：</strong>建立完善的风险评估和应对机制
              </div>
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
        </div>
      </IonContent>
    </IonPage>
  );
}
