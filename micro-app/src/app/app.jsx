import React, { useState, useEffect, useRef } from 'react';
import { IonPage, IonContent, IonIcon, IonButton, IonLoading } from '@ionic/react';
import { PageHeader } from '@morphixai/components';
import { 
  chevronBack, 
  chevronForward, 
  share, 
  sparkles
} from 'ionicons/icons';
import { reportError } from '@morphixai/lib';
import styles from './styles/App.module.css';

export default function App() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showLoading, setShowLoading] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [htmlToImage, setHtmlToImage] = useState(null);
  const cardsContainerRef = useRef(null);
  const cardRefs = useRef([]);

  // 动态加载 html-to-image 库
  useEffect(() => {
    const loadHtmlToImage = async () => {
      try {
        const lib = await remoteImport('html-to-image');
        setHtmlToImage(lib);
      } catch (error) {
        await reportError(error, 'JavaScriptError', { 
          component: 'App', 
          action: 'loadHtmlToImage' 
        });
        console.error('加载html-to-image库失败:', error);
      }
    };
    
    loadHtmlToImage();
  }, []);

  // 检测系统主题
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    setIsDarkMode(mediaQuery.matches);
    
    const handleChange = (e) => setIsDarkMode(e.matches);
    mediaQuery.addEventListener('change', handleChange);
    
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  // 卡片数据
  const cards = [
    {
      id: 1,
      icon: '🌟',
      title: '欢迎使用百变AI助手',
      subtitle: '您的智能生活伙伴',
      content: '百变AI助手是一款功能强大的人工智能应用，能够帮助您处理各种日常任务，提供智能建议，让您的生活更加便捷高效。',
      author: '百变AI团队',
      source: '官方介绍',
      gradient: 'blue'
    },
    {
      id: 2,
      icon: '🚀',
      title: '强大的AI能力',
      subtitle: '多模态智能交互',
      content: '支持文字对话、图片识别、文档分析等多种交互方式。无论是工作学习还是生活娱乐，都能为您提供专业的AI助手服务。',
      author: '产品团队',
      source: '功能介绍',
      gradient: 'purple'
    },
    {
      id: 3,
      icon: '💡',
      title: '智能学习助手',
      subtitle: '个性化知识服务',
      content: '基于先进的机器学习算法，能够理解您的需求，提供个性化的学习建议和知识解答，帮助您快速获取所需信息。',
      author: '技术团队',
      source: '技术文档',
      gradient: 'green'
    },
    {
      id: 4,
      icon: '🎯',
      title: '精准的任务执行',
      subtitle: '高效完成各类任务',
      content: '从简单的信息查询到复杂的数据分析，百变AI助手都能准确理解您的指令，并提供高质量的执行结果。',
      author: '用户体验团队',
      source: '使用指南',
      gradient: 'orange'
    },
    {
      id: 5,
      icon: '🌈',
      title: '持续进化升级',
      subtitle: '不断优化的AI体验',
      content: '我们致力于持续改进AI算法，定期更新功能特性，确保为用户提供最前沿、最优质的人工智能服务体验。',
      author: '研发团队',
      source: '发展规划',
      gradient: 'rainbow'
    }
  ];

  // 生成渐变色
  const generateGradientColors = (gradientType) => {
    const gradients = {
      blue: ['#3b82f6', '#1e40af'],
      purple: ['#8b5cf6', '#6d28d9'],
      green: ['#10b981', '#047857'],
      orange: ['#f59e0b', '#d97706'],
      rainbow: ['#3b82f6', '#8b5cf6']
    };
    return gradients[gradientType] || gradients.blue;
  };

  // 创建带品牌标识的截图元素
  const createScreenshotElement = (card) => {
    const cardElement = cardRefs.current[currentIndex];
    if (!cardElement) return null;

    // 克隆卡片元素
    const clonedCard = cardElement.cloneNode(true);
    
    // 创建截图容器
    const screenshotContainer = document.createElement('div');
    screenshotContainer.style.cssText = `
      position: fixed;
      top: -9999px;
      left: -9999px;
      width: 750px;
      height: 1000px;
      background: ${isDarkMode ? 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #334155 100%)' : 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 50%, #cbd5e1 100%)'};
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", sans-serif;
      overflow: hidden;
    `;

    // 设置克隆卡片的样式
    clonedCard.style.cssText = `
      width: 100%;
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      position: relative;
      padding: 60px 40px 120px;
      box-sizing: border-box;
      background: ${getCardBackground(card.gradient)};
    `;

    // 添加品牌水印
    const brandWatermark = document.createElement('div');
    brandWatermark.style.cssText = `
      position: absolute;
      bottom: 20px;
      right: 30px;
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 8px 16px;
      background: rgba(139, 92, 246, 0.15);
      backdrop-filter: blur(12px);
      border: 1px solid rgba(139, 92, 246, 0.3);
      border-radius: 20px;
      color: #6d28d9;
      font-size: 14px;
      font-weight: 600;
      z-index: 10;
      box-shadow: 0 4px 12px rgba(139, 92, 246, 0.2);
    `;
    
    brandWatermark.innerHTML = `
      <span style="font-size: 16px; color: #f59e0b; filter: drop-shadow(0 0 4px rgba(245, 158, 11, 0.3));">✨</span>
      <span>由百变AI助手生成</span>
    `;

    screenshotContainer.appendChild(clonedCard);
    screenshotContainer.appendChild(brandWatermark);
    
    return screenshotContainer;
  };

  // 使用 DOM 截图生成分享图片
  const generateShareImage = async (card) => {
    if (!htmlToImage) {
      throw new Error('html-to-image 库未加载完成');
    }

    try {
      setShowLoading(true);
      
      // 创建专用的截图元素
      const screenshotElement = createScreenshotElement(card);
      if (!screenshotElement) {
        throw new Error('无法创建截图元素');
      }

      // 临时添加到页面
      document.body.appendChild(screenshotElement);

      // 等待元素渲染
      await new Promise(resolve => setTimeout(resolve, 100));

      // 使用 html-to-image 截图
      const dataUrl = await htmlToImage.toPng(screenshotElement, {
        quality: 1.0,
        pixelRatio: 2,
        width: 750,
        height: 1000,
        backgroundColor: isDarkMode ? '#0f172a' : '#f8fafc',
        style: {
          transform: 'scale(1)',
          transformOrigin: 'top left'
        }
      });

      // 清理临时元素
      document.body.removeChild(screenshotElement);

      return dataUrl;
    } catch (error) {
      await reportError(error, 'JavaScriptError', { 
        component: 'App', 
        action: 'generateShareImage',
        cardId: card.id 
      });
      throw error;
    } finally {
      setShowLoading(false);
    }
  };

  // 分享功能
  const handleShare = async () => {
    if (!htmlToImage) {
      console.error('html-to-image 库未加载完成');
      return;
    }

    try {
      const currentCard = cards[currentIndex];
      const imageDataUrl = await generateShareImage(currentCard);
      
      // 将 base64 转换为 blob
      const response = await fetch(imageDataUrl);
      const blob = await response.blob();
      const file = new File([blob], `百变AI助手-${currentCard.title}.png`, { type: 'image/png' });
      
      // 检查分享能力
      if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          title: `${currentCard.title} - 百变AI助手`,
          text: currentCard.subtitle,
          files: [file]
        });
      } else {
        // 降级方案：下载图片
        const link = document.createElement('a');
        link.download = `百变AI助手-${currentCard.title}.png`;
        link.href = imageDataUrl;
        link.click();
      }
    } catch (error) {
      await reportError(error, 'JavaScriptError', { 
        component: 'App', 
        action: 'handleShare' 
      });
      console.error('分享失败:', error);
    }
  };

  // 导航功能
  const goToPrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      scrollToCard(currentIndex - 1);
    }
  };

  const goToNext = () => {
    if (currentIndex < cards.length - 1) {
      setCurrentIndex(currentIndex + 1);
      scrollToCard(currentIndex + 1);
    }
  };

  const goToCard = (index) => {
    setCurrentIndex(index);
    scrollToCard(index);
  };

  const scrollToCard = (index) => {
    if (cardsContainerRef.current) {
      const cardWidth = cardsContainerRef.current.clientWidth;
      cardsContainerRef.current.scrollTo({
        left: index * cardWidth,
        behavior: 'smooth'
      });
    }
  };

  // 处理滚动事件
  const handleScroll = () => {
    if (cardsContainerRef.current) {
      const scrollLeft = cardsContainerRef.current.scrollLeft;
      const cardWidth = cardsContainerRef.current.clientWidth;
      const newIndex = Math.round(scrollLeft / cardWidth);
      
      if (newIndex !== currentIndex && newIndex >= 0 && newIndex < cards.length) {
        setCurrentIndex(newIndex);
      }
    }
  };

  // 获取卡片背景渐变
  const getCardBackground = (gradient) => {
    const [color1, color2] = generateGradientColors(gradient);
    return `linear-gradient(135deg, ${color1} 0%, ${color2} 100%)`;
  };

  return (
    <IonPage>
      <PageHeader title="百变AI助手" />
      <IonContent>
        <div className={styles.container}>
          {/* 进度条 */}
          <div className={styles.progressBar}>
            <div 
              className={styles.progress} 
              style={{ width: `${((currentIndex + 1) / cards.length) * 100}%` }}
            />
          </div>

          {/* 卡片容器 */}
          <div 
            ref={cardsContainerRef}
            className={styles.cardsContainer}
            onScroll={handleScroll}
          >
            {cards.map((card, index) => (
              <div 
                key={card.id}
                ref={el => cardRefs.current[index] = el}
                className={styles.card}
                style={{ background: getCardBackground(card.gradient) }}
              >
                <div className={styles.cardOverlay} />
                <div className={styles.cardContent}>
                  {card.icon && (
                    <div className={styles.cardIcon}>
                      {card.icon}
                    </div>
                  )}
                  
                  <h1 className={styles.cardTitle}>
                    {card.title}
                  </h1>
                  
                  {card.subtitle && (
                    <h2 className={styles.cardSubtitle}>
                      {card.subtitle}
                    </h2>
                  )}
                  
                  {card.content && (
                    <p className={styles.cardText}>
                      {card.content}
                    </p>
                  )}
                  
                  {(card.author || card.source) && (
                    <div className={styles.cardMeta}>
                      {card.author && (
                        <div className={styles.author}>
                          作者：{card.author}
                        </div>
                      )}
                      {card.source && (
                        <div className={styles.source}>
                          来源：{card.source}
                        </div>
                      )}
                    </div>
                  )}

                  <div className={styles.cardActions}>
                    <div className={styles.aiAssistantBadge}>
                      <IonIcon icon={sparkles} />
                      由百变AI助手生成
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* 导航控件 */}
          <div className={styles.navigation}>
            <IonButton
              fill="clear"
              className={`${styles.navButton} ${currentIndex === 0 ? styles.disabled : ''}`}
              onClick={goToPrevious}
              disabled={currentIndex === 0}
            >
              <IonIcon size="large" icon={chevronBack} />
              <span className={styles.srOnly}>上一页</span>
            </IonButton>

            <div className={styles.indicators}>
              {cards.map((_, index) => (
                <button
                  key={index}
                  className={`${styles.indicator} ${index === currentIndex ? styles.active : ''}`}
                  onClick={() => goToCard(index)}
                  aria-label={`跳转到第 ${index + 1} 页`}
                />
              ))}
            </div>

            <IonButton
              fill="clear"
              className={`${styles.navButton} ${currentIndex === cards.length - 1 ? styles.disabled : ''}`}
              onClick={goToNext}
              disabled={currentIndex === cards.length - 1}
            >
              <IonIcon icon={chevronForward} />
              <span className={styles.srOnly}>下一页</span>
            </IonButton>
          </div>

          {/* 操作按钮 */}
          <div className={styles.actions}>
            <IonButton
              fill="clear"
              className={styles.actionButton}
              onClick={handleShare}
              disabled={showLoading || !htmlToImage}
            >
              <IonIcon icon={share} />
              分享
            </IonButton>
          </div>
        </div>

        {/* 加载状态 */}
        <IonLoading
          key="loading"
          isOpen={showLoading}
          message="正在生成分享图片..."
          spinner="crescent"
        />
      </IonContent>
    </IonPage>
  );
}