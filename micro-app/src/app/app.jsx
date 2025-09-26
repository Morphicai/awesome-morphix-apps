import React, { useState, useEffect, useRef } from 'react';
import { IonPage, IonContent, IonIcon, IonButton, IonLoading } from '@ionic/react';
import { PageHeader } from '@morphixai/components';
import { chevronBack, chevronForward, share, sparkles, linkOutline } from 'ionicons/icons';
import { reportError } from '@morphixai/lib';
import { fetch } from '@morphixai/fetch';
import styles from './styles/App.module.css';

export default function App() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showLoading, setShowLoading] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [htmlToImage, setHtmlToImage] = useState(null);
  const cardsContainerRef = useRef(null);
  const cardRefs = useRef([]);

  useEffect(() => {
    const loadHtmlToImage = async () => {
      try {
        const lib = await remoteImport('html-to-image');
        setHtmlToImage(lib);
      } catch (error) {
        await reportError(error, 'JavaScriptError', { component: 'App', action: 'loadHtmlToImage' });
        console.error('加载html-to-image库失败:', error);
      }
    };
    loadHtmlToImage();
  }, []);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    setIsDarkMode(mediaQuery.matches);
    const handleChange = (e) => setIsDarkMode(e.matches);
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  const cards = [
    {
      id: 1,
      icon: '🌟',
      title: '欢迎使用百变AI助手',
      subtitle: '您的智能生活伙伴',
      content: '百变AI助手是一款功能强大的人工智能应用，能够帮助您处理各种日常任务，提供智能建议，让您的生活更加便捷高效。',
      author: '百变AI团队',
      source: '官方介绍',
      link: 'https://morphix.ai/docs/welcome',
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
      link: 'https://morphix.ai/docs/features',
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
      link: 'https://morphix.ai/docs/learning',
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
      link: 'https://morphix.ai/docs/tasks',
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
      link: 'https://morphix.ai/docs/roadmap',
      gradient: 'rainbow'
    }
  ];

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

  const createScreenshotElement = (card) => {
    const cardElement = cardRefs.current[currentIndex];
    if (!cardElement) return null;

    const clonedCard = cardElement.cloneNode(true);
    const existingBadge = clonedCard.querySelector('.aiAssistantBadge');
    if (existingBadge) {
      existingBadge.remove();
    }

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

    clonedCard.style.cssText = `
      width: 100%;
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      position: relative;
      padding: 60px 40px 80px;
      box-sizing: border-box;
      background: ${getCardBackground(card.gradient)};
    `;

    const cornerBrand = document.createElement('div');
    cornerBrand.style.cssText = `
      position: absolute;
      bottom: 16px;
      right: 16px;
      display: flex;
      align-items: center;
      gap: 4px;
      padding: 4px 8px;
      background: rgba(0, 0, 0, 0.3);
      backdrop-filter: blur(8px);
      border-radius: 8px;
      color: rgba(255, 255, 255, 0.8);
      font-size: 10px;
      font-weight: 500;
      z-index: 12;
    `;
    cornerBrand.innerHTML = `
      <span style="font-size: 10px;">✨</span>
      <span>Made with 百变AI助手</span>
    `;

    const linkInfo = document.createElement('div');
    linkInfo.style.cssText = `
      position: absolute;
      bottom: 16px;
      left: 16px;
      display: flex;
      align-items: center;
      gap: 4px;
      padding: 4px 8px;
      background: rgba(0, 0, 0, 0.3);
      backdrop-filter: blur(8px);
      border-radius: 8px;
      color: rgba(255, 255, 255, 0.8);
      font-size: 10px;
      font-weight: 500;
      z-index: 12;
    `;
    linkInfo.innerHTML = `
      <span style="font-size: 10px;">🔗</span>
      <span>原文: ${card.link}</span>
    `;

    screenshotContainer.appendChild(clonedCard);
    screenshotContainer.appendChild(cornerBrand);
    screenshotContainer.appendChild(linkInfo);

    return screenshotContainer;
  };

  const generateShareImage = async (card) => {
    if (!htmlToImage) {
      throw new Error('html-to-image 库未加载完成');
    }

    try {
      setShowLoading(true);
      const screenshotElement = createScreenshotElement(card);
      if (!screenshotElement) {
        throw new Error('无法创建截图元素');
      }

      document.body.appendChild(screenshotElement);
      await new Promise(resolve => setTimeout(resolve, 100));

      const dataUrl = await htmlToImage.toPng(screenshotElement, {
        pixelRatio: 2,
        width: 750,
        height: 1000,
        backgroundColor: isDarkMode ? '#0f172a' : '#f8fafc',
        style: {
          transform: 'scale(1)',
          transformOrigin: 'top left'
        }
      });

      document.body.removeChild(screenshotElement);
      return dataUrl;
    } catch (error) {
      await reportError(error, 'JavaScriptError', { component: 'App', action: 'generateShareImage', cardId: card.id });
      throw error;
    } finally {
      setShowLoading(false);
    }
  };

  const handleShare = async () => {
    if (!htmlToImage) {
      console.error('html-to-image 库未加载完成');
      return;
    }

    try {
      const currentCard = cards[currentIndex];
      const imageDataUrl = await generateShareImage(currentCard);

      const response = await fetch(imageDataUrl);
      const blob = await response.blob();
      const file = new File([blob], `百变AI助手-${currentCard.title}.png`, { type: 'image/png' });

      if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          title: `${currentCard.title} - 百变AI助手`,
          text: currentCard.subtitle,
          files: [file]
        });
      } else {
        const link = document.createElement('a');
        link.download = `百变AI助手-${currentCard.title}.png`;
        link.href = imageDataUrl;
        link.click();
      }
    } catch (error) {
      await reportError(error, 'JavaScriptError', { component: 'App', action: 'handleShare' });
      console.error('分享失败:', error);
    }
  };

  const handleOpenLink = (link) => {
    if (link) {
      window.open(link, '_blank', 'noopener,noreferrer');
    }
  };

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

  const getCardBackground = (gradient) => {
    const [color1, color2] = generateGradientColors(gradient);
    return `linear-gradient(135deg, ${color1} 0%, ${color2} 100%)`;
  };

  return (
    <IonPage>
      <PageHeader title="百变AI助手" />
      <IonContent>
        <div className={styles.container}>
          <div className={styles.progressBar}>
            <div className={styles.progress} style={{ width: `${((currentIndex + 1) / cards.length) * 100}%` }} />
          </div>

          <div ref={cardsContainerRef} className={styles.cardsContainer} onScroll={handleScroll}>
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
                    {card.link && (
                      <IonButton
                        fill="clear"
                        size="small"
                        className={styles.linkButton}
                        onClick={() => handleOpenLink(card.link)}
                      >
                        <IonIcon icon={linkOutline} />
                        查看原文
                      </IonButton>
                    )}

                    <div className={styles.aiAssistantBadge}>
                      <IonIcon icon={sparkles} />
                      Made with 百变AI助手
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className={styles.navigation}>
            <IonButton
              fill="clear"
              className={`${styles.navButton} ${currentIndex === 0 ? styles.disabled : ''}`}
              onClick={goToPrevious}
              disabled={currentIndex === 0}
            >
              <IonIcon icon={chevronBack} />
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