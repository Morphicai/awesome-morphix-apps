import React, { useState, useEffect } from 'react';
import { IonPage, IonContent } from '@ionic/react';
import { PageHeader } from '@morphixai/components';
import { useHistory } from 'react-router-dom';
import { questions, calculateTestResult } from '../utils/questions';
import { DataService } from '../services/DataService';
import { useTestStore } from '../stores/testStore';
import styles from '../styles/TestPage.module.css';

export default function TestPage() {
  const history = useHistory();
  const setTestResult = useTestStore(state => state.setTestResult);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState(Array(questions.length).fill(null));
  const [selectedValue, setSelectedValue] = useState(null);
  const [showEnergyGuide, setShowEnergyGuide] = useState(true);
  const [energyProgress, setEnergyProgress] = useState(0);
  const [energyValue, setEnergyValue] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [debugClickCount, setDebugClickCount] = useState(0);

  const currentQuestion = questions[currentIndex];
  const isLastQuestion = currentIndex === questions.length - 1;
  const progressPercent = Math.round(((currentIndex + 1) / questions.length) * 100);

  useEffect(() => {
    // 🔧 开发模式：默认启用测试模式
    const isDevelopment = false; // 设置为 false 关闭测试模式
    
    if (isDevelopment) {
      console.log('🔧 开发模式：自动启用测试模式');
      // 延迟一点点执行，确保组件已挂载
      setTimeout(() => {
        activateTestMode();
      }, 100);
      return;
    }

    // 能量引导动画（生产模式）
    let progress = 0;
    const interval = setInterval(() => {
      progress += 2;
      setEnergyProgress(progress);
      if (progress >= 100) {
        clearInterval(interval);
        setTimeout(() => {
          setShowEnergyGuide(false);
        }, 500);
      }
    }, 30);

    return () => clearInterval(interval);
  }, []);

  // 🔧 开发测试模式：快速完成所有问题
  const activateTestMode = () => {
    console.log('🔧 测试模式激活！自动填充所有答案...');
    
    // 自动生成随机答案（选择 2-4 之间的随机选项）
    const autoAnswers = questions.map(() => Math.floor(Math.random() * 3) + 2);
    
    // 填充所有答案
    setAnswers(autoAnswers);
    
    // 跳转到最后一题
    setCurrentIndex(questions.length - 1);
    
    // 自动选择最后一题的答案
    setSelectedValue(autoAnswers[questions.length - 1]);
    
    // 设置满能量值
    setEnergyValue(questions.length * 10);
    
    // 关闭引导动画
    setShowEnergyGuide(false);
    
    console.log('✅ 测试模式已就绪，已跳转到最后一题，点击"完成灵魂觉醒"即可查看结果');
  };

  const handleSelect = (optionIndex) => {
    setSelectedValue(optionIndex);
    setEnergyValue(prev => prev + 10);
  };

  // 连续点击标题3次触发测试模式（手动触发）
  const handleTitleClick = () => {
    const newCount = debugClickCount + 1;
    setDebugClickCount(newCount);
    
    if (newCount >= 3) {
      activateTestMode();
      setDebugClickCount(0);
    }
    
    // 1秒后重置计数
    setTimeout(() => {
      setDebugClickCount(0);
    }, 1000);
  };

  const nextQuestion = async () => {
    if (isSubmitting || selectedValue === null) {
      return;
    }

    // 保存答案
    const newAnswers = [...answers];
    newAnswers[currentIndex] = selectedValue;
    setAnswers(newAnswers);

    if (isLastQuestion) {
      // 最后一题，计算结果并跳转
      setIsSubmitting(true);
      
      const result = calculateTestResult(newAnswers);
      console.log('测试结果:', result);

      // 保存到数据库
      try {
        const zodiac = DataService.getPreference('selectedZodiac', '白羊座');
        await DataService.saveTestRecord({
          title: `类型 ${result.mainType}`,
          date: new Date().toISOString(),
          resultData: result,
          zodiac: zodiac
        });
      } catch (error) {
        console.error('保存测试记录失败:', error);
      }

      // 跳转到结果页
      console.log('准备跳转到结果页，结果数据:', result);
      // 使用 Zustand Store 传递数据（符合 DEVELOPMENT_GUIDE.md 规范）
      setTestResult(result);
      history.push('/result');
      console.log('跳转命令已执行');
    } else {
      // 下一题
      setCurrentIndex(currentIndex + 1);
      setSelectedValue(null);
    }
  };

  return (
    <IonPage>
      <PageHeader title="灵魂探索" />
      <IonContent className={styles.testContainer}>
        {/* 能量场背景 */}
        <div className={styles.energyField}>
          <div className={styles.starsBg}></div>
          <div className={styles.energyParticles}></div>
        </div>

        {/* 能量引导 */}
        {showEnergyGuide && (
          <div className={styles.energyGuide}>
            <div className={styles.energyText}>✨ 宇宙能量正在与你共振...</div>
            <div className={styles.energyProgress}>
              <div className={styles.progressBar} style={{ width: `${energyProgress}%` }}></div>
            </div>
          </div>
        )}

        {/* 问题卡片 */}
        {!showEnergyGuide && (
          <div className={styles.questionCard}>
            <div className={styles.questionIntro}>
              🧘‍♀️ 请先深呼吸，让心灵与宇宙能量连接
            </div>

            <div className={styles.questionTitle} onClick={handleTitleClick} style={{ cursor: 'pointer' }}>
              <span>第 {currentIndex + 1} 题 / 共 {questions.length} 题</span>
              <div className={styles.energyValue}>能量值: {energyValue}</div>
            </div>

            {/* 开发提示：连续点击3次标题启动测试模式 */}
            {debugClickCount > 0 && (
              <div style={{
                textAlign: 'center',
                color: '#a18fff',
                fontSize: '12px',
                marginTop: '5px',
                opacity: 0.7
              }}>
                🔧 测试模式: {debugClickCount}/3
              </div>
            )}

            {isLastQuestion && (
              <div className={styles.finalTip}>
                <div className={styles.tipIcon}>✨</div>
                <div className={styles.tipText}>这是你灵魂探索的最后一题</div>
                <div className={styles.tipSubtext}>请跟随内心的指引，完成最后的能量汇聚</div>
              </div>
            )}

            <div className={styles.questionText}>
              {currentQuestion.text}
            </div>

            {/* 选项 */}
            <div className={styles.optionsGroup}>
              {currentQuestion.options.map((option, index) => (
                <div
                  key={index}
                  className={`${styles.optionItem} ${selectedValue === index ? styles.optionSelected : ''}`}
                  onClick={() => handleSelect(index)}
                >
                  <div className={styles.optionRadio}></div>
                  <div className={styles.optionText}>{option.text}</div>
                </div>
              ))}
            </div>

            {/* 下一题按钮 */}
            <button
              className={`${styles.btnNext} ${selectedValue !== null ? styles.btnNextActive : ''} ${isLastQuestion ? styles.btnEnergy : ''}`}
              disabled={selectedValue === null || isSubmitting}
              onClick={nextQuestion}
            >
              <span className={styles.btnText}>
                {isLastQuestion ? '💫 完成灵魂觉醒' : '下一题'}
              </span>
              <span className={styles.btnIcon}>
                {isLastQuestion ? '✨' : '➡️'}
              </span>
            </button>

            {/* 进度提示 */}
            <div style={{ textAlign: 'center', marginTop: '20px', color: 'rgba(255,255,255,0.5)', fontSize: '14px' }}>
              已完成 {progressPercent}%
            </div>
          </div>
        )}
      </IonContent>
    </IonPage>
  );
}

