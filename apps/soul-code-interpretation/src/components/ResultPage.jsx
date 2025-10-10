import React, { useState, useEffect } from 'react';
import { IonPage, IonContent } from '@ionic/react';
import { PageHeader } from '@morphixai/components';
import { useHistory, useLocation } from 'react-router-dom';
import { getSoulTypeAnalysis } from '../utils/soulAnalysis';
import { AIService } from '../services/AIService';
import { DataService } from '../services/DataService';
import { useTestStore } from '../stores/testStore';
import styles from '../styles/ResultPage.module.css';

export default function ResultPage() {
  const history = useHistory();
  const location = useLocation();
  const getAndClearResult = useTestStore(state => state.getAndClearResult);
  const [showRitual, setShowRitual] = useState(true);
  const [ritualProgress, setRitualProgress] = useState(0);
  const [typeData, setTypeData] = useState(null);
  const [testResult, setTestResult] = useState(null);
  const [aiInsight, setAiInsight] = useState('');
  const [loadingAI, setLoadingAI] = useState(true);
  const [energyValue, setEnergyValue] = useState(0);
  const [resonanceValue, setResonanceValue] = useState(0);

  useEffect(() => {
    // 使用 Zustand Store 读取测试结果（符合 DEVELOPMENT_GUIDE.md 规范）
    // 只在组件挂载时读取一次，避免重复读取导致数据被清除
    const getTestResultOnce = () => {
      // 优先使用 Zustand Store
      const storeResult = getAndClearResult();
      if (storeResult) {
        console.log('从 Zustand Store 读取测试结果');
        return storeResult;
      }
      
      // 回退到 location.state（兼容性）
      if (location.state?.testResult) {
        console.log('从 location.state 读取测试结果（回退模式）');
        return location.state.testResult;
      }
      
      return null;
    };

    const result = getTestResultOnce();
    console.log('结果页面接收到数据:', result);
    console.log('location.state:', location.state);
    
    if (!result) {
      console.log('没有测试结果，返回首页');
      // 没有测试结果，返回首页
      history.replace('/');
      return;
    }

    // 存储到组件 state 中
    setTestResult(result);

    // 获取类型数据（使用刚获取的 result，而不是 state）
    const data = getSoulTypeAnalysis(result);
    console.log('获取到的类型数据:', data);
    setTypeData(data);

    // 计算能量值
    setEnergyValue(Math.floor(Math.random() * 30 + 70)); // 70-100
    setResonanceValue(Math.floor(Math.random() * 20 + 80)); // 80-100

    // 灵魂觉醒仪式动画
    let progress = 0;
    const interval = setInterval(() => {
      progress += 2;
      setRitualProgress(progress);
      if (progress >= 100) {
        clearInterval(interval);
        setTimeout(() => {
          setShowRitual(false);
        }, 500);
      }
    }, 30);

    // 生成 AI 洞察
    const generateAI = async () => {
      try {
        setLoadingAI(true);
        const zodiac = DataService.getPreference('selectedZodiac', null);
        const userInfo = zodiac ? { zodiac } : {};
        
        const insight = await AIService.generateDeepAnalysis(result, userInfo);
        setAiInsight(insight);
      } catch (error) {
        console.error('生成 AI 洞察失败:', error);
        // 使用默认分析
        setAiInsight(AIService.getDefaultAnalysis(result));
      } finally {
        setLoadingAI(false);
      }
    };
    generateAI();

    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // 只在组件挂载时执行一次

  const handleBackHome = () => {
    history.push('/');
  };

  const handleShareResult = async () => {
    // TODO: 实现分享功能
    alert('分享功能即将上线！');
  };

  if (!typeData) {
    return (
      <IonPage>
        <PageHeader title="灵魂画像" />
        <IonContent className={styles.resultContainer}>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center', 
            height: '100vh',
            color: '#ffffff',
            textAlign: 'center'
          }}>
            <div>
              <div style={{ fontSize: '24px', marginBottom: '20px' }}>🔮</div>
              <div>正在分析你的灵魂密码...</div>
              <div style={{ fontSize: '14px', marginTop: '10px', opacity: 0.7 }}>
                如果没有数据，请返回重新测试
              </div>
              <button 
                onClick={() => history.push('/')}
                style={{
                  marginTop: '20px',
                  padding: '10px 20px',
                  background: 'linear-gradient(135deg, #a18fff, #d8c3ff)',
                  color: '#1f133e',
                  border: 'none',
                  borderRadius: '20px',
                  cursor: 'pointer'
                }}
              >
                返回首页
              </button>
            </div>
          </div>
        </IonContent>
      </IonPage>
    );
  }

  return (
    <IonPage>
      <PageHeader title="灵魂画像" />
      <IonContent className={styles.resultContainer}>
        {/* 能量场背景 */}
        <div className={styles.energyField}>
          <div className={styles.starsBg}></div>
          <div className={styles.energyParticles}></div>
          <div className={styles.energyWaves}></div>
        </div>

        {/* 灵魂觉醒仪式 */}
        {showRitual && (
          <div className={styles.ritualContainer}>
            <div className={styles.ritualContent}>
              <div className={styles.ritualIcon}>✨</div>
              <div className={styles.ritualText}>灵魂觉醒仪式</div>
              <div className={styles.ritualProgress}>
                <div className={styles.progressBar} style={{ width: `${ritualProgress}%` }}></div>
              </div>
            </div>
          </div>
        )}

        {/* 结果卡片 */}
        <div className={`${styles.resultCard} ${!showRitual ? styles.showResult : ''}`}>
          {/* 灵魂画像展示 */}
          <div className={styles.soulPortrait}>
            <div className={styles.portraitCircle}>
              <div className={styles.portraitIcon}>{typeData.icon}</div>
              <div className={styles.portraitRing}></div>
              <div className={styles.portraitGlow}></div>
            </div>
            <div className={styles.portraitTitle}>{typeData.typeTitle}</div>
            <div className={styles.portraitSubtitle}>你的灵魂密码</div>
            <div className={styles.portraitQuote}>{typeData.typeQuote}</div>
          </div>

          {/* 能量值展示 */}
          <div className={styles.energyStats}>
            <div className={styles.statItem}>
              <div className={styles.statValue}>{energyValue}</div>
              <div className={styles.statLabel}>灵魂能量</div>
            </div>
            <div className={styles.statItem}>
              <div className={styles.statValue}>{resonanceValue}</div>
              <div className={styles.statLabel}>心灵共鸣</div>
            </div>
          </div>

          {/* 核心特质展示 */}
          <div className={styles.traitsSection}>
            <div className={styles.sectionTitle}>✨ 核心特质</div>
            <div className={styles.traitsText}>{typeData.typeTraits}</div>
          </div>

          {/* AI 深度洞察 */}
          <div className={styles.aiInsightSection}>
            <div className={styles.sectionTitle}>🔮 AI 深度洞察</div>
            {loadingAI ? (
              <div className={styles.loadingText}>AI 正在为你生成个性化洞察...</div>
            ) : (
              <div className={styles.aiInsightText}>{aiInsight}</div>
            )}
          </div>

          {/* 成长引导 */}
          <div className={styles.guidanceSection}>
            <div className={styles.sectionTitle}>🌱 成长引导</div>
            <div className={styles.guidanceText}>{typeData.typeGuidance}</div>
          </div>

          {/* 得分详情 */}
          {testResult && testResult.scorePercentages && (
            <div style={{ 
              textAlign: 'center', 
              color: 'rgba(255,255,255,0.5)', 
              fontSize: '14px',
              marginTop: '20px',
              padding: '15px',
              background: 'rgba(161, 143, 255, 0.05)',
              borderRadius: '12px'
            }}>
              <div>主要类型倾向: {testResult.scorePercentages.mainType}%</div>
              {testResult.secondaryType && (
                <div style={{ marginTop: '5px' }}>
                  次要类型: {getSoulTypeAnalysis({mainType: testResult.secondaryType}).typeTitle} ({testResult.scorePercentages.secondaryType}%)
                </div>
              )}
            </div>
          )}

          {/* 行动按钮 */}
          <div className={styles.actionButtons}>
            <button className={styles.btnPrimary} onClick={handleBackHome}>
              <span className={styles.btnIcon}>🏠</span>
              <span className={styles.btnText}>返回首页</span>
            </button>
            <button className={styles.btnSecondary} onClick={handleShareResult}>
              <span className={styles.btnIcon}>✨</span>
              <span className={styles.btnText}>分享我的灵魂画像</span>
            </button>
          </div>
        </div>
      </IonContent>
    </IonPage>
  );
}

